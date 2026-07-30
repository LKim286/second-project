"""
Единый модуль расчёта батч-признаков.

Правила (обязательны):
- events: только timestamp < run_date
- sessions: только start_time < run_date
- orders: только order_time < run_date
- дубликаты событий удаляются по event_id
- признаки по товарам — только при непустом product_id
- денежные признаки — только из orders
- без утечки данных из будущего
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Optional, Union
from urllib.parse import quote_plus

import numpy as np
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine


# ---------------------------------------------------------------------------
# Подключение и чтение
# ---------------------------------------------------------------------------

def create_db_engine(
    user: Optional[str] = None,
    password: Optional[str] = None,
    host: Optional[str] = None,
    port: Optional[Union[str, int]] = None,
    db: Optional[str] = None,
) -> Engine:
    """Создаёт SQLAlchemy engine. Параметры можно передать явно или через env."""
    user = user or os.getenv("PG_USER")
    password = password or os.getenv("PG_PASSWORD")
    host = host or os.getenv("PG_HOST")
    port = port or os.getenv("PG_PORT", "6432")
    db = db or os.getenv("PG_DB")

    missing = [
        name
        for name, value in [
            ("PG_USER / user", user),
            ("PG_PASSWORD / password", password),
            ("PG_HOST / host", host),
            ("PG_DB / db", db),
        ]
        if not value
    ]
    if missing:
        raise ValueError(f"Не заданы параметры подключения: {', '.join(missing)}")

    url = (
        f"postgresql://{quote_plus(str(user))}:{quote_plus(str(password))}"
        f"@{host}:{port}/{db}"
    )
    return create_engine(url)


def load_source_tables(engine: Engine) -> Dict[str, pd.DataFrame]:
    """Читает таблицы customers, sessions, events, orders из PostgreSQL."""
    tables = ("customers", "sessions", "events", "orders")
    result: Dict[str, pd.DataFrame] = {}
    for table in tables:
        result[table] = pd.read_sql_query(f"SELECT * FROM {table}", con=engine)
    return result


# ---------------------------------------------------------------------------
# Предобработка
# ---------------------------------------------------------------------------

def preprocess_customers(df: pd.DataFrame) -> pd.DataFrame:
    """Предобработка customers: типы дат, без полных дубликатов."""
    out = df.copy()
    out["signup_date"] = pd.to_datetime(out["signup_date"], errors="coerce")
    out = out.drop_duplicates()
    return out


def preprocess_sessions(df: pd.DataFrame, run_date: datetime) -> pd.DataFrame:
    """Предобработка sessions: типы, дедуп, только start_time < run_date."""
    out = df.copy()
    out["start_time"] = pd.to_datetime(out["start_time"], errors="coerce")
    out = out.drop_duplicates(subset=["session_id"])
    out = out[out["start_time"] < run_date].copy()
    return out


def preprocess_events(df: pd.DataFrame, run_date: datetime) -> pd.DataFrame:
    """Предобработка events: типы, дедуп по event_id, только timestamp < run_date."""
    out = df.copy()
    out["timestamp"] = pd.to_datetime(out["timestamp"], errors="coerce")
    out = out.drop_duplicates(subset=["event_id"])
    out = out[out["timestamp"] < run_date].copy()
    return out


def preprocess_orders(df: pd.DataFrame, run_date: datetime) -> pd.DataFrame:
    """Предобработка orders: типы, дедуп по order_id, только order_time < run_date."""
    out = df.copy()
    out["order_time"] = pd.to_datetime(out["order_time"], errors="coerce")
    out = out.drop_duplicates(subset=["order_id"])
    out = out[out["order_time"] < run_date].copy()
    return out


def _parse_run_date(run_date: Union[str, datetime, pd.Timestamp]) -> datetime:
    ts = pd.to_datetime(run_date)
    # нормализуем к datetime без таймзоны (naive), полночь даты среза
    if getattr(ts, "tzinfo", None) is not None:
        ts = ts.tz_localize(None)
    return datetime(ts.year, ts.month, ts.day)


def _safe_div(numer: pd.Series, denom: pd.Series) -> pd.Series:
    """Деление с заменой деления на 0 на 0."""
    return pd.Series(
        np.where(denom == 0, 0.0, numer.astype(float) / denom.astype(float)),
        index=numer.index,
    )


# ---------------------------------------------------------------------------
# Признаки
# ---------------------------------------------------------------------------

def add_event_window_features(
    events: pd.DataFrame,
    sessions: pd.DataFrame,
    run_date: datetime,
) -> pd.DataFrame:
    """
    Считает по окнам 7/30 дней:
    - pageview_7 / pageview_30
    - addtocart_7 / addtocart_30
    - purchase_7 / purchase_30 (нужны для конверсий)
    - product_7 / product_30 (уникальные product_id, только notna)
    """
    window_7 = run_date - timedelta(days=7)
    window_30 = run_date - timedelta(days=30)

    sess = sessions[["session_id", "customer_id"]].drop_duplicates("session_id")
    ev = events.merge(sess, on="session_id", how="inner")
    ev = ev.rename(columns={"timestamp": "event_time"})

    # каркас клиентов, у которых были сессии до run_date
    feat = pd.DataFrame({"customer_id": sessions["customer_id"].drop_duplicates().values})

    def _count(event_type: str, start: datetime) -> pd.Series:
        mask = (
            (ev["event_type"] == event_type)
            & (ev["event_time"] >= start)
            & (ev["event_time"] < run_date)
        )
        return ev.loc[mask].groupby("customer_id").size()

    def _nunique_products(start: datetime) -> pd.Series:
        mask = (
            ev["product_id"].notna()
            & (ev["event_time"] >= start)
            & (ev["event_time"] < run_date)
        )
        return ev.loc[mask].groupby("customer_id")["product_id"].nunique()

    mapping = {
        "pageview_7": _count("page_view", window_7),
        "pageview_30": _count("page_view", window_30),
        "addtocart_7": _count("add_to_cart", window_7),
        "addtocart_30": _count("add_to_cart", window_30),
        "purchase_7": _count("purchase", window_7),
        "purchase_30": _count("purchase", window_30),
        "product_7": _nunique_products(window_7),
        "product_30": _nunique_products(window_30),
    }

    for col, series in mapping.items():
        feat[col] = feat["customer_id"].map(series).fillna(0)

    int_cols = [
        "pageview_7",
        "pageview_30",
        "addtocart_7",
        "addtocart_30",
        "purchase_7",
        "purchase_30",
        "product_7",
        "product_30",
    ]
    feat[int_cols] = feat[int_cols].astype(int)
    return feat


def add_session_features(
    events: pd.DataFrame,
    sessions: pd.DataFrame,
    run_date: datetime,
) -> pd.DataFrame:
    """
    Признаки по сессиям:
    - session_7 / session_30 — число уникальных сессий
    - mean_session — средняя длина сессии в секундах за 30 дней
      (max(event_time) - session_start по сессии, затем mean по клиенту)
    """
    window_7 = run_date - timedelta(days=7)
    window_30 = run_date - timedelta(days=30)

    feat = pd.DataFrame({"customer_id": sessions["customer_id"].drop_duplicates().values})

    sess_7 = sessions[
        (sessions["start_time"] >= window_7) & (sessions["start_time"] < run_date)
    ]
    sess_30 = sessions[
        (sessions["start_time"] >= window_30) & (sessions["start_time"] < run_date)
    ]

    feat["session_7"] = (
        feat["customer_id"]
        .map(sess_7.groupby("customer_id")["session_id"].nunique())
        .fillna(0)
        .astype(int)
    )
    feat["session_30"] = (
        feat["customer_id"]
        .map(sess_30.groupby("customer_id")["session_id"].nunique())
        .fillna(0)
        .astype(int)
    )

    # длина сессии по событиям внутри сессий окна 30 дней
    sess_cols = sessions.loc[
        (sessions["start_time"] >= window_30) & (sessions["start_time"] < run_date),
        ["session_id", "customer_id", "start_time"],
    ].rename(columns={"start_time": "session_start"})

    ev = events[["session_id", "timestamp"]].rename(columns={"timestamp": "event_time"})
    ev = ev.merge(sess_cols, on="session_id", how="inner")

    if ev.empty:
        feat["mean_session"] = np.nan
        return feat

    session_len = (
        ev.groupby(["customer_id", "session_id"])["event_time"].max()
        - ev.groupby(["customer_id", "session_id"])["session_start"].min()
    )
    mean_sec = session_len.dt.total_seconds().groupby("customer_id").mean()
    feat["mean_session"] = feat["customer_id"].map(mean_sec)
    return feat


def add_order_features(orders: pd.DataFrame, run_date: datetime) -> pd.DataFrame:
    """
    Денежные и заказные признаки (только orders):
    - order_lasttime — дни с последней покупки до run_date (−1 если не было)
    - orders_count — число заказов за 30 дней
    - total_usd_sum — сумма total_usd за 30 дней
    - mean_usd — средний total_usd за 30 дней
    """
    window_30 = run_date - timedelta(days=30)

    # каркас — все клиенты с заказами до run_date
    feat = pd.DataFrame({"customer_id": orders["customer_id"].drop_duplicates().values})

    last_order = orders.groupby("customer_id")["order_time"].max()
    # календарные дни: дата среза минус дата последнего заказа
    days_since = (pd.Timestamp(run_date).normalize() - last_order.dt.normalize()).dt.days
    feat["order_lasttime"] = (
        feat["customer_id"].map(days_since).fillna(-1).astype(int)
    )

    orders_30 = orders[
        (orders["order_time"] >= window_30) & (orders["order_time"] < run_date)
    ]

    feat["orders_count"] = (
        feat["customer_id"]
        .map(orders_30.groupby("customer_id")["order_id"].nunique())
        .fillna(0)
        .astype(int)
    )
    feat["total_usd_sum"] = (
        feat["customer_id"].map(orders_30.groupby("customer_id")["total_usd"].sum()).fillna(0.0)
    )
    feat["mean_usd"] = (
        feat["customer_id"].map(orders_30.groupby("customer_id")["total_usd"].mean()).fillna(0.0)
    )
    return feat


def add_conversion_features(feat: pd.DataFrame) -> pd.DataFrame:
    """Конверсии воронки: add_to_cart/page_view и purchase/add_to_cart."""
    out = feat.copy()
    out["conv_cart_7"] = _safe_div(out["addtocart_7"], out["pageview_7"])
    out["conv_cart_30"] = _safe_div(out["addtocart_30"], out["pageview_30"])
    out["conv_purchase_7"] = _safe_div(out["purchase_7"], out["addtocart_7"])
    out["conv_purchase_30"] = _safe_div(out["purchase_30"], out["addtocart_30"])
    return out


def build_batch_features(
    customers: pd.DataFrame,
    sessions: pd.DataFrame,
    events: pd.DataFrame,
    orders: pd.DataFrame,
    run_date: Union[str, datetime, pd.Timestamp],
) -> pd.DataFrame:
    """
    Собирает итоговую таблицу признаков: 1 строка на пару customer_id × run_date.

    Принимает сырые таблицы (как из load_source_tables) и сам делает предобработку.
    """
    run_date = _parse_run_date(run_date)

    customers_p = preprocess_customers(customers)
    sessions_p = preprocess_sessions(sessions, run_date)
    events_p = preprocess_events(events, run_date)
    orders_p = preprocess_orders(orders, run_date)

    # базовый список клиентов: зарегистрированы до run_date
    # + имели сессии/заказы до run_date (на случай рассинхрона)
    base_ids = set(customers_p.loc[customers_p["signup_date"] < run_date, "customer_id"])
    base_ids |= set(sessions_p["customer_id"].unique())
    base_ids |= set(orders_p["customer_id"].unique())

    features = pd.DataFrame({"customer_id": sorted(base_ids)})
    features["run_date"] = run_date

    event_feat = add_event_window_features(events_p, sessions_p, run_date)
    session_feat = add_session_features(events_p, sessions_p, run_date)
    order_feat = add_order_features(orders_p, run_date)

    features = features.merge(event_feat, on="customer_id", how="left")
    features = features.merge(session_feat, on="customer_id", how="left")
    features = features.merge(order_feat, on="customer_id", how="left")

    # заполнения после left join
    count_cols = [
        "pageview_7",
        "pageview_30",
        "addtocart_7",
        "addtocart_30",
        "purchase_7",
        "purchase_30",
        "product_7",
        "product_30",
        "session_7",
        "session_30",
        "orders_count",
    ]
    for col in count_cols:
        if col in features.columns:
            features[col] = features[col].fillna(0).astype(int)

    features["order_lasttime"] = features["order_lasttime"].fillna(-1).astype(int)
    features["total_usd_sum"] = features["total_usd_sum"].fillna(0.0)
    features["mean_usd"] = features["mean_usd"].fillna(0.0)

    features = add_conversion_features(features)

    # промежуточные purchase_* можно оставить — полезны для отладки конверсий;
    # итоговый порядок столбцов
    column_order = [
        "customer_id",
        "run_date",
        "pageview_7",
        "pageview_30",
        "addtocart_7",
        "addtocart_30",
        "conv_cart_7",
        "conv_cart_30",
        "conv_purchase_7",
        "conv_purchase_30",
        "product_7",
        "product_30",
        "mean_session",
        "session_7",
        "session_30",
        "order_lasttime",
        "orders_count",
        "total_usd_sum",
        "mean_usd",
        # вспомогательные счётчики покупок (для проверки воронки)
        "purchase_7",
        "purchase_30",
    ]
    features = features[column_order]

    # гарантии качества среза
    assert features.duplicated(["customer_id", "run_date"]).sum() == 0, (
        "В итоге больше одной строки на пару customer_id × run_date"
    )
    assert (features["run_date"] == run_date).all()

    return features.reset_index(drop=True)


# ---------------------------------------------------------------------------
# Сохранение
# ---------------------------------------------------------------------------

def save_features(
    features: pd.DataFrame,
    path: Union[str, Path],
    run_date: Optional[Union[str, datetime, pd.Timestamp]] = None,
) -> str:
    """
    Сохраняет таблицу признаков в parquet (локально или в s3://...).

    Если path — директория, файл будет features_YYYY-MM-DD.parquet.
    """
    path_str = str(path)
    if run_date is not None:
        rd = _parse_run_date(run_date)
    elif "run_date" in features.columns and len(features):
        rd = _parse_run_date(features["run_date"].iloc[0])
    else:
        rd = None

    if path_str.endswith(".parquet"):
        out_path = path_str
    else:
        date_part = rd.strftime("%Y-%m-%d") if rd is not None else "unknown"
        out_path = path_str.rstrip("/") + f"/features_{date_part}.parquet"

    # локальные директории создаём заранее
    if not out_path.startswith("s3://"):
        Path(out_path).parent.mkdir(parents=True, exist_ok=True)

    features.to_parquet(out_path, index=False)
    return out_path


def run_pipeline(
    run_date: Union[str, datetime, pd.Timestamp],
    engine: Optional[Engine] = None,
    output_path: Optional[Union[str, Path]] = None,
    **db_kwargs,
) -> pd.DataFrame:
    """
    Полный цикл: загрузка → признаки → (опционально) сохранение.
    Удобно вызывать из Jupyter или из DAG.
    """
    if engine is None:
        engine = create_db_engine(**db_kwargs)

    tables = load_source_tables(engine)
    features = build_batch_features(
        customers=tables["customers"],
        sessions=tables["sessions"],
        events=tables["events"],
        orders=tables["orders"],
        run_date=run_date,
    )

    if output_path is not None:
        save_features(features, output_path, run_date=run_date)

    return features
