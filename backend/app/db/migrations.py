from __future__ import annotations

import logging
from sqlalchemy import text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)


def run_additive_migrations(engine: Engine) -> None:
    """Safely applies additive schema changes for SQLite / PostgreSQL."""
    columns_to_add = [
        ("experiments", "pack_id", "VARCHAR(100)"),
        ("runs", "taxonomy_counts", "JSON"),
        ("runs", "remediation_hints", "JSON"),
        ("trials", "taxonomy_category", "VARCHAR(50)"),
        ("trials", "prompt_tokens", "INTEGER DEFAULT 0"),
        ("trials", "completion_tokens", "INTEGER DEFAULT 0"),
        ("trials", "cost_usd", "FLOAT DEFAULT 0.0"),
    ]

    with engine.connect() as conn:
        for table, col, col_type in columns_to_add:
            try:
                # Check if column exists by inspecting table pragma in SQLite
                check_query = text(f"PRAGMA table_info({table});")
                result = conn.execute(check_query).fetchall()
                existing_cols = [row[1] for row in result]
                if col not in existing_cols:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type};"))
                    conn.commit()
                    logger.info(f"Added column {col} to {table}")
            except Exception as e:
                logger.debug(f"Migration note for {table}.{col}: {e}")
