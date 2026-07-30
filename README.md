# NorthCart — батч-признаки

Модуль расчёта батч-признаков для пары `customer_id` × `run_date`.  
Вся логика фильтрации и агрегаций находится в `src/batch_features/` — DAG и Jupyter только вызывают эти функции.

## Структура

```text
src/batch_features/
  __init__.py
  pipeline.py          # load / preprocess / features / save
examples/check_features.py
tests/test_batch_features.py
requirements.txt
```

## Функции модуля

| Функция | Назначение |
|---|---|
| `load_source_tables(engine)` | Читает `customers`, `sessions`, `events`, `orders` |
| `preprocess_customers/sessions/events/orders` | Типы, дедуп, отсечение по `run_date` |
| `add_event_window_features(...)` | page_view / add_to_cart / purchase / product за 7 и 30 дней |
| `add_session_features(...)` | число сессий и средняя длина за 30 дней |
| `add_order_features(...)` | давность покупки, число/сумма/средний чек заказов |
| `add_conversion_features(...)` | конверсии воронки |
| `build_batch_features(...)` | собирает итоговую таблицу (1 строка на клиента) |
| `save_features(...)` | сохраняет parquet (локально или `s3://...`) |
| `run_pipeline(...)` | полный цикл для DAG / ноутбука |

## Обязательные правила

- events: `timestamp < run_date`
- sessions: `start_time < run_date`
- orders: `order_time < run_date`
- дедуп событий по `event_id`
- товарные признаки только при заданном `product_id`
- денежные признаки только из `orders`
- без данных из будущего

## Установка

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Переменные окружения для PostgreSQL

```bash
export PG_USER=...
export PG_PASSWORD=...
export PG_HOST=...
export PG_PORT=6432
export PG_DB=...
```

## Пример из Jupyter / скрипта

```python
import sys
sys.path.append("src")

from datetime import datetime
from batch_features import create_db_engine, load_source_tables, build_batch_features, save_features

engine = create_db_engine()
tables = load_source_tables(engine)

run_date = datetime(2025, 8, 1)
features = build_batch_features(
    tables["customers"],
    tables["sessions"],
    tables["events"],
    tables["orders"],
    run_date=run_date,
)

assert features.duplicated(["customer_id", "run_date"]).sum() == 0
save_features(features, "outputs", run_date=run_date)
features.head()
```

Или одной командой:

```bash
python examples/check_features.py --run-date 2025-08-01
```

## Тесты (без БД)

```bash
pip install pytest
pytest -q
```
