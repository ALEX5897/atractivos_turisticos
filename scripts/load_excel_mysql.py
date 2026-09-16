import re
import unicodedata
from pathlib import Path

import pandas as pd
import mysql.connector

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "documentos_base"
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "QT426*",
    "database": "atractivos_turisticos",
}

SYSTEM_KEEP = {
    "created_at",
    "updated_at",
}

# Required columns to keep even if not in Excel
REQUIRED_KEEP = {
    "atractivos": {"id_atractivo", "codigo", "nombre", "id_categoria", "id_tipo", "id_parroquia"},
    "experiencias": {"id_experiencia", "codigo", "nombre", "id_tipo_exp"},
    "rutas": {"id_ruta", "codigo", "nombre", "id_tipo_ruta"},
}

TEXT_COLUMNS = {
    "atractivos": {
        "nombre_del_atractivo_recurso",
        "breve_descripcion",
        "servicios_incluidos",
        "direccion",
        "horario",
        "acceso_de_transporte",
        "restriccion_a_la_accesibilidad",
        "contacto_telefono_correo_electronico",
        "dpa_manzana_localidad_del_atractivo",
        "observacion_de_inactivacion",
        "descripcion",
        "observaciones",
    },
    "experiencias": {
        "nombre_de_la_experiencia",
        "breve_descripcion_y_actividades_a_realizar",
        "direccion",
        "horario_de_atencion",
        "restricciones",
        "contactos",
        "descripcion",
        "horario",
        "observaciones",
    },
    "rutas": {
        "nombre_de_la_ruta_turistica",
        "breve_descripcion",
        "link_de_ruta",
        "descripcion",
    },
}

INT_COLUMNS = {
    "rutas": {"altitud_max"},
}


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


def find_excel_file(keyword):
    for path in DOCS_DIR.glob("*.xlsx"):
        if keyword in normalize_text(path.name).upper():
            return path
    return None


def find_sheet(xl, target):
    target_norm = normalize_text(target).upper()
    for name in xl.sheet_names:
        if normalize_text(name).upper() == target_norm:
            return name
    return None


def get_conn():
    return mysql.connector.connect(**DB_CONFIG)


def fetch_one(cur, query, params):
    cur.execute(query, params)
    row = cur.fetchone()
    return row[0] if row else None


CATALOG_ID_COLUMNS = {
    "cat_categorias": "id_categoria",
    "cat_tipos_experiencia": "id_tipo_exp",
    "cat_tipos_ruta": "id_tipo_ruta",
}


def ensure_catalog_value(cur, table, name):
    if not name:
        return None
    id_col = CATALOG_ID_COLUMNS.get(table, f"id_{table.split('_')[-1]}")
    existing = fetch_one(cur, f"SELECT {id_col} FROM {table} WHERE nombre = %s", (name,))
    if existing:
        return existing
    cur.execute(f"INSERT INTO {table} (nombre, activo) VALUES (%s, 1)", (name,))
    return cur.lastrowid


def ensure_tipo(cur, categoria_id, tipo_nombre):
    if not categoria_id or not tipo_nombre:
        return None
    existing = fetch_one(
        cur,
        "SELECT id_tipo FROM cat_tipos WHERE id_categoria = %s AND nombre = %s",
        (categoria_id, tipo_nombre),
    )
    if existing:
        return existing
    cur.execute(
        "INSERT INTO cat_tipos (id_categoria, nombre, activo) VALUES (%s, %s, 1)",
        (categoria_id, tipo_nombre),
    )
    return cur.lastrowid


def parse_float(value):
    if value is None:
        return None
    text = normalize_text(value)
    if not text:
        return None
    text = text.replace(",", ".")
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    return float(match.group(0)) if match else None


def parse_int(value):
    num = parse_float(value)
    return int(num) if num is not None else None


def normalize_dificultad(value):
    text = normalize_text(value).upper()
    if "MUY" in text:
        return "MUY_DIFICIL"
    if "DIFICIL" in text:
        return "DIFICIL"
    if "MODER" in text:
        return "MODERADO"
    return "FACIL"


def ensure_columns(cur, table, columns):
    cur.execute(
        """
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
        """,
        (DB_CONFIG["database"], table),
    )
    existing = {row[0] for row in cur.fetchall()}
    for col in columns:
        if col in existing:
            continue
        cur.execute(f"ALTER TABLE {table} ADD COLUMN `{col}` TEXT NULL")


def ensure_text_columns(cur, table, columns):
    if not columns:
        return
    cur.execute(
        """
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
        """,
        (DB_CONFIG["database"], table),
    )
    existing = {row[0]: row[1].lower() for row in cur.fetchall()}
    for col in columns:
        data_type = existing.get(col)
        if data_type and data_type not in {"text", "mediumtext", "longtext"}:
            cur.execute(f"ALTER TABLE {table} MODIFY COLUMN `{col}` TEXT NULL")


def ensure_int_columns(cur, table, columns):
    if not columns:
        return
    cur.execute(
        """
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
        """,
        (DB_CONFIG["database"], table),
    )
    existing = {row[0]: row[1].lower() for row in cur.fetchall()}
    for col in columns:
        data_type = existing.get(col)
        if data_type and data_type not in {"int", "bigint"}:
            cur.execute(f"ALTER TABLE {table} MODIFY COLUMN `{col}` INT NULL")


def get_key_columns(cur, table):
    cur.execute(
        """
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
        """,
        (DB_CONFIG["database"], table),
    )
    return {row[0] for row in cur.fetchall()}


def drop_unused_columns(cur, table, keep):
    cur.execute(
        """
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
        """,
        (DB_CONFIG["database"], table),
    )
    existing = {row[0] for row in cur.fetchall()}
    key_cols = get_key_columns(cur, table)
    for col in sorted(existing - keep - key_cols):
        cur.execute(f"ALTER TABLE {table} DROP COLUMN `{col}`")


def read_sheet(path, sheet_name):
    xl = pd.ExcelFile(path)
    actual_sheet = find_sheet(xl, sheet_name)
    if not actual_sheet:
        raise ValueError(f"Sheet '{sheet_name}' not found in {path.name}")
    df = pd.read_excel(path, sheet_name=actual_sheet)
    df = df.dropna(how="all")
    # Drop empty or unnamed columns from Excel
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
    original_cols = list(df.columns)
    normalized_cols = make_unique(normalized_cols)
    df.columns = normalized_cols
    df = df.astype(object).where(pd.notna(df), None)
    return df, dict(zip(original_cols, normalized_cols))


def load_atractivos(cur):
    path = find_excel_file("ATRACTIVOS")
    if not path:
        raise FileNotFoundError("No se encontro archivo de atractivos en documentos_base")
    df, _ = read_sheet(path, "ATRACTIVOS")

    # Catalogos
    categoria_col = "categoria"
    tipo_col = "tipo"
    sub_tipo_col = "sub_tipo"
    categoria_map = {}
    tipo_map = {}

    if categoria_col in df.columns:
        for value in sorted({v for v in df[categoria_col].tolist() if v}):
            categoria_map[value] = ensure_catalog_value(cur, "cat_categorias", str(value))
    # Fallback category
    categoria_map.setdefault("Sin definir", ensure_catalog_value(cur, "cat_categorias", "Sin definir"))

    if tipo_col in df.columns or sub_tipo_col in df.columns:
        for _, row in df.iterrows():
            categoria_val = row.get(categoria_col) or "Sin definir"
            categoria_id = categoria_map.get(categoria_val)
            tipo_val = row.get(sub_tipo_col) or row.get(tipo_col) or "Sin definir"
            if categoria_id and tipo_val:
                tipo_id = ensure_tipo(cur, categoria_id, str(tipo_val))
                tipo_map[(categoria_val, tipo_val)] = tipo_id

    # Ensure columns for excel headers
    ensure_columns(cur, "atractivos", df.columns)
    ensure_text_columns(cur, "atractivos", TEXT_COLUMNS.get("atractivos"))

    # Prepare insert
    records = []
    skipped = 0
    for _, row in df.iterrows():
        record = dict(row)

        codigo_qt = row.get("codigo_qt")
        codigo_mintur = row.get("codigo_mintur")
        record["codigo_qt"] = codigo_qt or None
        record["codigo_mintur"] = codigo_mintur or None
        record["codigo"] = codigo_qt or codigo_mintur
        record["nombre"] = row.get("nombre_del_atractivo_recurso")
        record["descripcion"] = row.get("breve_descripcion")
        record["jerarquia"] = parse_int(row.get("jerarquia"))
        record["latitud"] = parse_float(row.get("latitud"))
        record["longitud"] = parse_float(row.get("longitud"))
        record["direccion"] = row.get("direccion")
        record["horario"] = row.get("horario")
        record["observaciones"] = row.get("observacion_de_inactivacion")

        categoria_val = row.get(categoria_col) or "Sin definir"
        tipo_val = row.get(sub_tipo_col) or row.get(tipo_col) or "Sin definir"
        record["id_categoria"] = categoria_map.get(categoria_val)
        record["id_tipo"] = tipo_map.get((categoria_val, tipo_val))

        if record["codigo"] is None or record["nombre"] is None:
            skipped += 1
            continue
        if record["jerarquia"] is None:
            record["jerarquia"] = 0

        records.append(record)

    insert_columns = list(df.columns) + [
        "codigo",
        "nombre",
        "descripcion",
        "jerarquia",
        "latitud",
        "longitud",
        "direccion",
        "horario",
        "observaciones",
        "id_categoria",
        "id_tipo",
    ]
    insert_rows(cur, "atractivos", records, insert_columns)
    if skipped:
        print(f"Atractivos omitidos por falta de codigo/nombre: {skipped}")

    keep = SYSTEM_KEEP | REQUIRED_KEEP["atractivos"] | set(df.columns)
    drop_unused_columns(cur, "atractivos", keep)


def load_experiencias(cur):
    path = find_excel_file("EXPERIENCIAS")
    if not path:
        raise FileNotFoundError("No se encontro archivo de experiencias en documentos_base")
    df, _ = read_sheet(path, "EXPERIENCIAS")

    modalidad_col = "modalidad"
    modalidad_map = {}
    if modalidad_col in df.columns:
        for value in sorted({v for v in df[modalidad_col].tolist() if v}):
            modalidad_map[value] = ensure_catalog_value(cur, "cat_tipos_experiencia", str(value))

    ensure_columns(cur, "experiencias", df.columns)
    ensure_text_columns(cur, "experiencias", TEXT_COLUMNS.get("experiencias"))

    records = []
    skipped = 0
    for _, row in df.iterrows():
        record = dict(row)

        record["codigo"] = row.get("codigo_experiencia_qt")
        record["nombre"] = row.get("nombre_de_la_experiencia")
        record["descripcion"] = row.get("breve_descripcion_y_actividades_a_realizar")
        record["duracion_horas"] = parse_float(row.get("tiempo_de_duracion"))
        record["horario"] = row.get("horario_de_atencion")
        record["precio_desde"] = parse_float(row.get("costo"))
        record["capacidad_max"] = parse_int(row.get("capacidad"))

        observaciones = []
        if row.get("restricciones"):
            observaciones.append(f"Restricciones: {row.get('restricciones')}")
        if row.get("contactos"):
            observaciones.append(f"Contactos: {row.get('contactos')}")
        record["observaciones"] = " | ".join(observaciones) if observaciones else None

        modalidad_val = row.get(modalidad_col) or "Sin definir"
        record["id_tipo_exp"] = modalidad_map.get(modalidad_val) or ensure_catalog_value(cur, "cat_tipos_experiencia", "Sin definir")

        if record["codigo"] is None or record["nombre"] is None:
            skipped += 1
            continue

        records.append(record)

    insert_columns = list(df.columns) + [
        "codigo",
        "nombre",
        "descripcion",
        "duracion_horas",
        "horario",
        "precio_desde",
        "capacidad_max",
        "observaciones",
        "id_tipo_exp",
    ]
    insert_rows(cur, "experiencias", records, insert_columns)
    if skipped:
        print(f"Experiencias omitidas por falta de codigo/nombre: {skipped}")

    keep = SYSTEM_KEEP | REQUIRED_KEEP["experiencias"] | set(df.columns)
    drop_unused_columns(cur, "experiencias", keep)


def load_rutas(cur):
    path = find_excel_file("RUTAS")
    if not path:
        raise FileNotFoundError("No se encontro archivo de rutas en documentos_base")
    df, _ = read_sheet(path, "RUTAS")

    clasificacion_col = "clasificacion"
    tipo_ruta_map = {}
    if clasificacion_col in df.columns:
        for value in sorted({v for v in df[clasificacion_col].tolist() if v}):
            tipo_ruta_map[value] = ensure_catalog_value(cur, "cat_tipos_ruta", str(value))

    ensure_columns(cur, "rutas", df.columns)
    ensure_text_columns(cur, "rutas", TEXT_COLUMNS.get("rutas"))
    ensure_int_columns(cur, "rutas", INT_COLUMNS.get("rutas"))

    records = []
    skipped = 0
    for _, row in df.iterrows():
        record = dict(row)

        record["codigo"] = row.get("codigo_qt")
        record["nombre"] = row.get("nombre_de_la_ruta_turistica")
        record["descripcion"] = row.get("breve_descripcion")
        record["duracion_horas"] = parse_float(row.get("tiempo_de_duracion_de_ruta_horas"))
        record["distancia_km"] = parse_float(row.get("distancia_km"))
        record["dificultad"] = normalize_dificultad(row.get("dificultad"))
        record["url_mapa"] = row.get("link_de_ruta")
        record["altitud_max"] = parse_int(row.get("altitud_m_s_n_m"))

        clasificacion_val = row.get(clasificacion_col) or "Sin definir"
        record["id_tipo_ruta"] = tipo_ruta_map.get(clasificacion_val) or ensure_catalog_value(cur, "cat_tipos_ruta", "Sin definir")

        if record["codigo"] is None or record["nombre"] is None:
            skipped += 1
            continue

        records.append(record)

    insert_columns = list(df.columns) + [
        "codigo",
        "nombre",
        "descripcion",
        "duracion_horas",
        "distancia_km",
        "dificultad",
        "url_mapa",
        "altitud_max",
        "id_tipo_ruta",
    ]
    insert_rows(cur, "rutas", records, insert_columns)
    if skipped:
        print(f"Rutas omitidas por falta de codigo/nombre: {skipped}")

    keep = SYSTEM_KEEP | REQUIRED_KEEP["rutas"] | set(df.columns)
    drop_unused_columns(cur, "rutas", keep)


def insert_rows(cur, table, records, columns=None):
    if not records:
        return
    if columns is None:
        raw_columns = {key for record in records for key in record.keys()}
        columns = []
        for col in raw_columns:
            if col is None:
                continue
            if str(col).lower() == "nan":
                continue
            columns.append(col)
        columns = sorted(columns)
    else:
        unique = []
        seen = set()
        for col in columns:
            if col in seen:
                continue
            if col is None:
                continue
            if str(col).lower() == "nan":
                continue
            seen.add(col)
            unique.append(col)
        columns = unique
    # Ensure columns exist in table schema
    cur.execute(
        """
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
        """,
        (DB_CONFIG["database"], table),
    )
    existing = {row[0] for row in cur.fetchall()}
    columns = [col for col in columns if col in existing]
    columns_sql = ", ".join(f"`{col}`" for col in columns)
    if "`nan`" in columns_sql:
        raise ValueError(f"Invalid column name detected: {columns_sql}")
    placeholders = ", ".join(["%s"] * len(columns))
    sql = f"INSERT INTO {table} ({columns_sql}) VALUES ({placeholders})"
    values = [[record.get(col) for col in columns] for record in records]
    try:
        cur.executemany(sql, values)
    except mysql.connector.Error as exc:
        raise mysql.connector.Error(f"Insert failed for {table}: {sql}") from exc


def cleanup_tables(cur):
    cur.execute("SET FOREIGN_KEY_CHECKS = 0")
    tables = [
        "rutas_experiencias",
        "rutas_atractivos",
        "rutas_fotos",
        "experiencias_idiomas",
        "experiencias_fotos",
        "atractivos_idiomas",
        "atractivos_servicios",
        "atractivos_fotos",
        "rutas",
        "experiencias",
        "atractivos",
    ]
    for table in tables:
        cur.execute(f"DELETE FROM {table}")
    cur.execute("SET FOREIGN_KEY_CHECKS = 1")


def main():
    conn = get_conn()
    try:
        conn.autocommit = False
        cur = conn.cursor()

        cleanup_tables(cur)
        load_atractivos(cur)
        load_experiencias(cur)
        load_rutas(cur)

        conn.commit()
        print("Carga completada")
    except Exception as exc:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
