import re
import unicodedata
from pathlib import Path

import pandas as pd
import mysql.connector

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "documentos_base"
ENV_PATH = ROOT / "backend" / ".env"

SHEET_TABLES = {
    "nodo",
    "centralidad",
    "parroquia",
    "categoria",
    "tipo",
    "subtipo",
    "modalidad",
}


def read_env(path):
    data = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip()
    return data


def normalize_text(value):
    if value is None:
        return ""
    text = str(value).strip()
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return text


def normalize_col(name):
    text = normalize_text(name).lower()
    text = re.sub(r"[^a-z0-9]+", "_", text).strip("_")
    return text or "col"


def make_unique(cols):
    seen = {}
    out = []
    for col in cols:
        base = col
        idx = 1
        while col in seen:
            idx += 1
            col = f"{base}_{idx}"
        seen[col] = True
        out.append(col)
    return out


def get_db_config():
    env = read_env(ENV_PATH)
    return {
        "host": env.get("DB_HOST", "localhost"),
        "user": env.get("DB_USER", "root"),
        "password": env.get("DB_PASSWORD", ""),
        "database": env.get("DB_NAME", "atractivos_turisticos"),
        "port": int(env.get("DB_PORT", "3306")),
    }


def ensure_table(cur, table):
    cur.execute(
        f"CREATE TABLE IF NOT EXISTS {table} (\n"
        f"  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY\n"
        f") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    )


def ensure_columns(cur, table, columns):
    cur.execute(
        """
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
        """,
        (cur._connection.database, table),
    )
    existing = {row[0] for row in cur.fetchall()}
    for col in columns:
        if col in existing:
            continue
        cur.execute(f"ALTER TABLE {table} ADD COLUMN `{col}` VARCHAR(255) NULL")


def read_sheet(path, sheet_name):
    df = pd.read_excel(path, sheet_name=sheet_name)
    df = df.dropna(how="all")
    filtered_originals = []
    normalized_cols = []
    for col in df.columns:
        if pd.isna(col):
            continue
        col_text = str(col).strip()
        if col_text.lower().startswith("unnamed"):
            continue
        norm = normalize_col(col_text)
        if norm == "nan":
            continue
        filtered_originals.append(col)
        normalized_cols.append(norm)
    df = df.loc[:, filtered_originals]
    normalized_cols = make_unique(normalized_cols)
    df.columns = normalized_cols
    df = df.astype(object).where(pd.notna(df), None)
    return df


def load_catalogs():
    path = DOCS_DIR / "catalogo.xlsx"
    if not path.exists():
        raise FileNotFoundError(f"No se encontro {path}")

    db_config = get_db_config()
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor()

    try:
        xl = pd.ExcelFile(path)
        for sheet_name in xl.sheet_names:
            table = normalize_col(sheet_name)
            if table not in SHEET_TABLES:
                print(f"Hoja ignorada: {sheet_name}")
                continue

            df = read_sheet(path, sheet_name)
            ensure_table(cur, table)
            ensure_columns(cur, table, df.columns)

            cur.execute(f"TRUNCATE TABLE {table}")
            if df.empty:
                print(f"{sheet_name}: sin registros")
                continue

            cols_sql = ", ".join([f"`{c}`" for c in df.columns])
            placeholders = ", ".join(["%s"] * len(df.columns))
            insert_sql = f"INSERT INTO {table} ({cols_sql}) VALUES ({placeholders})"
            cur.executemany(insert_sql, df.values.tolist())
            print(f"{sheet_name}: {len(df)} registros cargados en {table}")

        conn.commit()
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    load_catalogs()
