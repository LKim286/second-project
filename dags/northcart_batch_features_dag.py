"""
Airflow DAG: расчёт батч-признаков NorthCart.

DAG только оркестрирует вызовы функций из модуля batch_features.
Логика фильтрации и расчёта признаков живёт в src/batch_features/pipeline.py.

Запуск на конкретную дату:
  airflow dags trigger northcart_batch_features --conf '{"run_date": "2025-08-01"}'

Нужные Connections / Variables — см. README.
"""

from __future__ import annotations

import logging
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

from airflow import DAG
from airflow.models import Variable
from airflow.operators.python import PythonOperator

# Чтобы Airflow видел модуль src/batch_features
PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_PATH = PROJECT_ROOT / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from batch_features import (  # noqa: E402
    build_batch_features,
    create_db_engine_from_airflow_connection,
    get_yandex_s3_storage_options,
    load_source_tables,
    save_features,
    validate_features,
)

logger = logging.getLogger(__name__)

# --- настройки через Airflow Variables (Admin → Variables) ---
PG_CONN_ID = Variable.get("NORTHCART_PG_CONN_ID", default_var="northcart_postgres")
S3_BUCKET = Variable.get("NORTHCART_S3_BUCKET", default_var="")
S3_PREFIX = Variable.get("NORTHCART_S3_PREFIX", default_var="batch_features")
S3_ENDPOINT = Variable.get(
    "NORTHCART_S3_ENDPOINT",
    default_var="https://storage.yandexcloud.net",
)
# куда класть локально, если S3 не задан (удобно для отладки)
LOCAL_OUTPUT_DIR = Variable.get(
    "NORTHCART_LOCAL_OUTPUT_DIR",
    default_var=str(PROJECT_ROOT / "outputs"),
)


def resolve_run_date(**context) -> datetime:
    """
    Приоритет:
    1) dag_run.conf['run_date']  — ручной/учебный запуск
    2) data_interval_end (дата среза из расписания Airflow)
    """
    conf = (context.get("dag_run").conf or {}) if context.get("dag_run") else {}
    if conf.get("run_date"):
        rd = datetime.strptime(str(conf["run_date"])[:10], "%Y-%m-%d")
        logger.info("run_date из dag_run.conf: %s", rd.date())
        return rd

    data_interval_end = context.get("data_interval_end")
    if data_interval_end is not None:
        rd = datetime(data_interval_end.year, data_interval_end.month, data_interval_end.day)
        logger.info("run_date из data_interval_end: %s", rd.date())
        return rd

    logical = context.get("logical_date") or context.get("execution_date")
    rd = datetime(logical.year, logical.month, logical.day)
    logger.info("run_date из logical_date: %s", rd.date())
    return rd


def build_and_save_features(**context) -> str:
    """Единственная бизнес-задача DAG: посчитать признаки и сохранить артефакт."""
    run_date = resolve_run_date(**context)
    logger.info("Старт расчёта батч-признаков для run_date=%s", run_date.date())

    engine = create_db_engine_from_airflow_connection(PG_CONN_ID)
    tables = load_source_tables(engine)

    features = build_batch_features(
        customers=tables["customers"],
        sessions=tables["sessions"],
        events=tables["events"],
        orders=tables["orders"],
        run_date=run_date,
    )
    validate_features(features, run_date=run_date)
    logger.info("Строк в срезе: %s, клиентов: %s", len(features), features["customer_id"].nunique())

    date_str = run_date.strftime("%Y-%m-%d")
    storage_options = None

    if S3_BUCKET:
        # ключи можно положить в Variables или в env воркера Airflow
        access_key = Variable.get("NORTHCART_AWS_ACCESS_KEY_ID", default_var=os.getenv("AWS_ACCESS_KEY_ID", ""))
        secret_key = Variable.get("NORTHCART_AWS_SECRET_ACCESS_KEY", default_var=os.getenv("AWS_SECRET_ACCESS_KEY", ""))
        storage_options = get_yandex_s3_storage_options(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            endpoint_url=S3_ENDPOINT,
        )
        output_path = f"s3://{S3_BUCKET}/{S3_PREFIX}/run_date={date_str}/features_{date_str}.parquet"
    else:
        output_path = f"{LOCAL_OUTPUT_DIR.rstrip('/')}/features_{date_str}.parquet"
        logger.warning("NORTHCART_S3_BUCKET не задан — сохраняем локально: %s", output_path)

    saved = save_features(
        features,
        output_path,
        run_date=run_date,
        storage_options=storage_options,
    )
    logger.info("Признаки сохранены: %s", saved)

    # положим путь в XCom для следующих задач / проверки
    context["ti"].xcom_push(key="features_path", value=saved)
    context["ti"].xcom_push(key="n_rows", value=int(len(features)))
    return saved


def check_output_exists(**context) -> None:
    """Проверка, что артефакт реально появился."""
    path = context["ti"].xcom_pull(key="features_path", task_ids="build_batch_features")
    if not path:
        raise ValueError("XCom features_path пустой — расчёт не вернул путь")

    if path.startswith("s3://"):
        import s3fs

        access_key = Variable.get("NORTHCART_AWS_ACCESS_KEY_ID", default_var=os.getenv("AWS_ACCESS_KEY_ID", ""))
        secret_key = Variable.get("NORTHCART_AWS_SECRET_ACCESS_KEY", default_var=os.getenv("AWS_SECRET_ACCESS_KEY", ""))
        fs = s3fs.S3FileSystem(
            key=access_key,
            secret=secret_key,
            client_kwargs={"endpoint_url": S3_ENDPOINT},
        )
        if not fs.exists(path):
            raise FileNotFoundError(f"Файл не найден в S3: {path}")
    else:
        if not Path(path).exists():
            raise FileNotFoundError(f"Локальный файл не найден: {path}")

    logger.info("Проверка артефакта OK: %s", path)


default_args = {
    "owner": "northcart",
    "depends_on_past": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="northcart_batch_features",
    description="Расчёт батч-признаков NorthCart для пары customer_id × run_date",
    default_args=default_args,
    start_date=datetime(2025, 1, 1),
    schedule=None,  # учебный запуск вручную / через trigger с conf
    catchup=False,
    tags=["northcart", "batch-features"],
) as dag:
    build_task = PythonOperator(
        task_id="build_batch_features",
        python_callable=build_and_save_features,
    )

    check_task = PythonOperator(
        task_id="check_output_exists",
        python_callable=check_output_exists,
    )

    build_task >> check_task
