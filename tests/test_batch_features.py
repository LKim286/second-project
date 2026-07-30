"""Юнит-тесты на синтетике — без PostgreSQL."""

from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from batch_features import build_batch_features, save_features


@pytest.fixture
def sample_tables():
    run_anchor = datetime(2025, 8, 1)

    customers = pd.DataFrame(
        {
            "customer_id": [1, 2, 3],
            "name": ["a", "b", "c"],
            "email": ["a@x", "b@x", "c@x"],
            "country": ["US", "US", "US"],
            "age": [20, 30, 40],
            "signup_date": ["2024-01-01", "2024-01-01", "2024-01-01"],
            "marketing_opt_in": [True, False, True],
        }
    )

    sessions = pd.DataFrame(
        {
            "session_id": [10, 11, 12, 99],
            "customer_id": [1, 1, 2, 1],
            "start_time": [
                "2025-07-10 10:00:00",  # в окне 30д
                "2025-07-28 10:00:00",  # в окне 7д
                "2025-07-15 10:00:00",
                "2025-08-02 10:00:00",  # будущее — должно отфильтроваться
            ],
            "device": ["mobile"] * 4,
            "source": ["organic"] * 4,
            "country": ["US"] * 4,
        }
    )

    events = pd.DataFrame(
        {
            "event_id": [1, 2, 3, 4, 5, 6, 7, 1],  # последний — дубликат event_id=1
            "session_id": [10, 10, 10, 11, 11, 12, 10, 10],
            "timestamp": [
                "2025-07-10 10:05:00",
                "2025-07-10 10:10:00",
                "2025-07-10 10:20:00",
                "2025-07-28 10:05:00",
                "2025-07-28 10:15:00",
                "2025-07-15 10:05:00",
                "2025-08-02 10:05:00",  # будущее — отфильтруется
                "2025-07-10 10:05:00",  # дубль event_id=1 — отфильтруется
            ],
            "event_type": [
                "page_view",
                "add_to_cart",
                "purchase",
                "page_view",
                "add_to_cart",
                "page_view",
                "page_view",
                "page_view",
            ],
            "product_id": [100.0, 100.0, None, 200.0, 200.0, 300.0, 400.0, 100.0],
            "qty": [None, 1, None, None, 1, None, None, None],
            "cart_size": [None] * 8,
            "payment": [None, None, "card", None, None, None, None, None],
            "discount_pct": [None] * 8,
            "amount_usd": [None, None, 50.0, None, None, None, None, None],
        }
    )

    orders = pd.DataFrame(
        {
            "order_id": [1000, 1001, 1002],
            "customer_id": [1, 1, 2],
            "order_time": [
                "2025-07-10 10:20:00",
                "2025-07-28 12:00:00",
                "2025-08-05 12:00:00",  # будущее
            ],
            "payment_method": ["card", "card", "card"],
            "discount_pct": [0, 0, 0],
            "subtotal_usd": [50, 80, 10],
            "total_usd": [50.0, 80.0, 10.0],
            "country": ["US", "US", "US"],
            "device": ["mobile", "mobile", "mobile"],
            "source": ["organic", "organic", "organic"],
        }
    )

    return customers, sessions, events, orders, run_anchor


def test_one_row_per_customer(sample_tables):
    customers, sessions, events, orders, run_date = sample_tables
    feat = build_batch_features(customers, sessions, events, orders, run_date)

    assert feat.duplicated(["customer_id", "run_date"]).sum() == 0
    assert set(feat["run_date"].unique()) == {pd.Timestamp(run_date)}


def test_no_future_leakage_in_counts(sample_tables):
    customers, sessions, events, orders, run_date = sample_tables
    feat = build_batch_features(customers, sessions, events, orders, run_date)
    row1 = feat.set_index("customer_id").loc[1]

    # у клиента 1: page_view в окне 30д — session 10 + 11 = 2 (future event отброшен, дубль event_id тоже)
    assert row1["pageview_30"] == 2
    assert row1["pageview_7"] == 1
    assert row1["addtocart_30"] == 2
    assert row1["purchase_30"] == 1

    # заказы: future order отброшен; два заказа 50+80
    assert row1["orders_count"] == 2
    assert row1["total_usd_sum"] == 130.0
    assert row1["order_lasttime"] == (run_date - datetime(2025, 7, 28)).days


def test_required_columns_present(sample_tables):
    customers, sessions, events, orders, run_date = sample_tables
    feat = build_batch_features(customers, sessions, events, orders, run_date)
    required = {
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
    }
    assert required.issubset(feat.columns)


def test_save_features_local(tmp_path, sample_tables):
    customers, sessions, events, orders, run_date = sample_tables
    feat = build_batch_features(customers, sessions, events, orders, run_date)
    out = save_features(feat, tmp_path, run_date=run_date)
    assert Path(out).exists()
    loaded = pd.read_parquet(out)
    assert len(loaded) == len(feat)
