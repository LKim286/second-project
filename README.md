# NorthCart — батч-признаки + Airflow DAG

Модуль `src/batch_features/` содержит всю логику расчёта.  
DAG `dags/northcart_batch_features_dag.py` только вызывает функции модуля и сохраняет результат.

## Структура для Airflow

Положите репозиторий так, чтобы Airflow видел обе папки (типичный `airflowtemplate`):

```text
airflowtemplate/          # корень, который монтируется в Airflow
  dags/
    northcart_batch_features_dag.py
  src/
    batch_features/
      __init__.py
      pipeline.py
  requirements.txt
```

Если у вас уже есть `airflowtemplate/`, скопируйте туда `dags/` и `src/`.

## Функции модуля

| Функция | Назначение |
|---|---|
| `load_source_tables` | чтение PostgreSQL |
| `preprocess_*` | типы, дедуп, `< run_date` |
| `add_event_window_features` | события / товары за 7 и 30 дней |
| `add_session_features` | сессии + средняя длина |
| `add_order_features` | заказы и деньги |
| `add_conversion_features` | конверсии воронки |
| `build_batch_features` | итоговая таблица |
| `save_features` | parquet (local / S3) |
| `create_db_engine_from_airflow_connection` | креды из Airflow Connection |

## Настройка Airflow

### 1) Connection (Admin → Connections)

| Поле | Значение |
|---|---|
| Conn Id | `northcart_postgres` |
| Conn Type | Postgres |
| Host | хост из практикума |
| Schema | имя БД |
| Login | пользователь |
| Password | пароль |
| Port | `6432` |

### 2) Variables (Admin → Variables)

| Key | Пример |
|---|---|
| `NORTHCART_PG_CONN_ID` | `northcart_postgres` |
| `NORTHCART_S3_BUCKET` | имя бакета |
| `NORTHCART_S3_PREFIX` | `batch_features` |
| `NORTHCART_S3_ENDPOINT` | `https://storage.yandexcloud.net` |
| `NORTHCART_AWS_ACCESS_KEY_ID` | ключ S3 |
| `NORTHCART_AWS_SECRET_ACCESS_KEY` | секрет S3 |

Если `NORTHCART_S3_BUCKET` пустой — DAG сохранит файл локально в `outputs/`.

### 3) Зависимости воркера

```bash
pip install -r requirements.txt
```

## Запуск DAG

В UI: DAG `northcart_batch_features` → Trigger DAG w/ config:

```json
{
  "run_date": "2025-08-01"
}
```

Или CLI:

```bash
airflow dags trigger northcart_batch_features --conf '{"run_date": "2025-08-01"}'
```

Для исторического и инференсного срезов просто запускайте DAG с разными `run_date`.

## Проверка из Jupyter (та же логика)

```python
import sys
sys.path.append("src")

from datetime import datetime
from batch_features import create_db_engine, load_source_tables, build_batch_features

engine = create_db_engine(user="...", password="...", host="...", db="...")
tables = load_source_tables(engine)
features = build_batch_features(
    tables["customers"], tables["sessions"], tables["events"], tables["orders"],
    run_date=datetime(2025, 8, 1),
)
assert features.duplicated(["customer_id", "run_date"]).sum() == 0
```

## Тесты без БД/Airflow

```bash
pip install pytest pandas numpy sqlalchemy pyarrow
PYTHONPATH=src pytest -q
```
