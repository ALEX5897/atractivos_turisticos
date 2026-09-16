# ✅ Checklist de Validación - Campo "N" Secuencial

## 🗄️ VALIDACIÓN BASE DE DATOS

### Paso 1: Ejecutar Migración
- [ ] Abrir terminal/CLI en directorio del proyecto
- [ ] Ejecutar: `mysql -u usuario -p atractivos_turisticos < database/migration_01_add_n_field.sql`
- [ ] Confirmar que no hay errores en la ejecución

### Paso 2: Verificar Campo en Tabla atractivos
```sql
-- Ejecutar en MySQL:
DESCRIBE atractivos;
```
- [ ] Verificar que existe columna `n` de tipo `INT UNSIGNED`
- [ ] Verificar que es `UNIQUE` y `AUTO_INCREMENT`

**Comando alternativo:**
```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'atractivos_turisticos' 
  AND TABLE_NAME = 'atractivos' 
  AND COLUMN_NAME = 'n';
```
- [ ] Resultado muestra: `n | int unsigned | NO | UNI | auto_increment`

### Paso 3: Verificar Campo en Tabla experiencias
```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'atractivos_turisticos' 
  AND TABLE_NAME = 'experiencias' 
  AND COLUMN_NAME = 'n';
```
- [ ] Campo existe y tiene propiedades correctas

### Paso 4: Verificar Campo en Tabla rutas
```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'atractivos_turisticos' 
  AND TABLE_NAME = 'rutas' 
  AND COLUMN_NAME = 'n';
```
- [ ] Campo existe y tiene propiedades correctas

### Paso 5: Verificar Datos Existentes
```sql
-- Atractivos
SELECT COUNT(*) as total, COUNT(n) as con_n, COUNT(DISTINCT n) as n_unicos 
FROM atractivos;

-- Experiencias
SELECT COUNT(*) as total, COUNT(n) as con_n, COUNT(DISTINCT n) as n_unicos 
FROM experiencias;

-- Rutas
SELECT COUNT(*) as total, COUNT(n) as con_n, COUNT(DISTINCT n) as n_unicos 
FROM rutas;
```
- [ ] Total = con_n = n_unicos (todos los registros tienen N° único)
- [ ] Si la tabla estaba vacía, las cuentas pueden ser 0

### Paso 6: Ver Primeros Registros
```sql
SELECT n, codigo, nombre FROM atractivos ORDER BY n LIMIT 10;
SELECT n, codigo, nombre FROM experiencias ORDER BY n LIMIT 10;
SELECT n, codigo, nombre FROM rutas ORDER BY n LIMIT 10;
```
- [ ] Se ve columna `n` con números secuenciales (1, 2, 3, ...)
- [ ] Números son únicos y ordenados

---

## 🎨 VALIDACIÓN FRONTEND

### Paso 7: Iniciar Servidor de Desarrollo
```bash
cd frontend/
npm run dev
```
- [ ] Servidor inicia sin errores
- [ ] Frontend accesible en `http://localhost:5173` (o puerto configurado)

### Paso 8: Validar Vista de Atractivos
1. [ ] Navegar a módulo "Atractivos"
2. [ ] Esperar a que cargue la tabla
3. [ ] **Columna "N°":**
   - [ ] Muestra números secuenciales (1, 2, 3, ...)
   - [ ] Números coinciden con la BD
   - [ ] No muestra números calculados de paginación

4. [ ] **Crear nuevo atractivo:**
   - [ ] Clic en "Nuevo Atractivo"
   - [ ] Formulario abre
   - [ ] Campo "N°" está **VACÍO** (no editable)
   - [ ] Campo "N°" está **DISABLED** (gris, no se puede escribir)
   - [ ] Label dice "N° (auto)"
   
5. [ ] **Guardar nuevo atractivo:**
   - [ ] Llenar campos obligatorios: código, nombre, categoría, tipo
   - [ ] Clic en "Guardar"
   - [ ] Esperar a que se guarde
   - [ ] Revisar tabla
   - [ ] [ ] Nuevo atractivo aparece con N° auto-asignado (ej: 151)

6. [ ] **Editar atractivo:**
   - [ ] Clic en botón "Editar" de un registro
   - [ ] Modal abierto con datos del atractivo
   - [ ] Campo "N°" muestra el número (ej: 42)
   - [ ] Campo "N°" está **DISABLED** (no editable)
   - [ ] [ ] Intentar escribir en campo N° - No debería permitir
   - [ ] Cambiar otro campo (ej: nombre)
   - [ ] Guardar cambios
   - [ ] [ ] Verificar que N° sigue siendo 42 (no cambió)

7. [ ] **Ver detalle:**
   - [ ] Clic en botón "Ver" de un registro
   - [ ] Modal abierto mostrando detalles
   - [ ] Sección "Datos de Matriz" muestra "N°" con su valor
   - [ ] Valor coincide con el de la tabla

### Paso 9: Validar Paginación
1. [ ] Estar en página 1 de atractivos
2. [ ] Anotar números N° visibles (ej: 1, 2, 3, 4, 5...)
3. [ ] [ ] Cambiar a página 2
4. [ ] Verificar números N° (ej: 16, 17, 18, 19, 20...)
5. [ ] [ ] **IMPORTANTE:** Los números deben ser DIFERENTES pero CONSISTENTES
6. [ ] [ ] Volver a página 1
7. [ ] Verificar que los números son los mismos que al inicio

### Paso 10: Validar Filtros
1. [ ] Aplicar filtro de estado "ACTIVO"
2. [ ] Anotar números N° visibles
3. [ ] [ ] Cambiar filtro a "EN_REVISION"
4. [ ] Números N° pueden cambiar, PERO cuando se vuelve a "ACTIVO", deben ser iguales
5. [ ] [ ] Limpiar filtros
6. [ ] Verificar que se ven todos los números nuevamente

### Paso 11: Validar Vista de Experiencias
Repetir pasos 8-10 para módulo **Experiencias**:
- [ ] Columna N° muestra valores correctos
- [ ] Campo N° disabled en formulario
- [ ] Nuevo registro recibe N° auto-asignado
- [ ] N° no cambia al editar
- [ ] Números consistentes en paginación
- [ ] Números consistentes al filtrar

### Paso 12: Validar Vista de Rutas
Repetir pasos 8-10 para módulo **Rutas**:
- [ ] Columna N° muestra valores correctos
- [ ] Campo N° disabled en formulario
- [ ] Nuevo registro recibe N° auto-asignado
- [ ] N° no cambia al editar
- [ ] Números consistentes en paginación
- [ ] Números consistentes al filtrar

---

## 🔍 VALIDACIÓN API

### Paso 13: Probar Endpoints API
Usar herramienta como **Postman**, **cURL** o **Thunder Client**

#### GET Atractivos (con N°)
```bash
GET http://localhost:3000/api/atractivos?page=1&limit=15
Authorization: Bearer <token>
```
Response esperado:
```json
{
  "data": [
    {
      "id_atractivo": 1,
      "n": 1,
      "codigo": "ATR-001",
      "nombre": "...",
      ...
    },
    {
      "id_atractivo": 5,
      "n": 2,
      ...
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 15
}
```
- [ ] Cada objeto tiene campo `n`
- [ ] Valores `n` son únicos y secuenciales

#### GET Detalle Atractivo
```bash
GET http://localhost:3000/api/atractivos/1
Authorization: Bearer <token>
```
- [ ] Response incluye campo `n`
- [ ] [ ] Valor `n` coincide con el de la tabla

#### POST Crear Atractivo
```bash
POST http://localhost:3000/api/atractivos
Content-Type: application/json
Authorization: Bearer <token>

{
  "codigo": "ATR-NEW",
  "nombre": "Nuevo Atractivo Test",
  "id_categoria": 1,
  "id_tipo": 1
}
```
Response esperado:
```json
{
  "data": {
    "id_atractivo": 201,
    "n": 151,  ← Auto-asignado
    "codigo": "ATR-NEW",
    "nombre": "Nuevo Atractivo Test",
    ...
  }
}
```
- [ ] Response incluye campo `n`
- [ ] [ ] Valor `n` es el siguiente número secuencial disponible

#### PUT Actualizar Atractivo
```bash
PUT http://localhost:3000/api/atractivos/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "codigo": "ATR-001",
  "nombre": "Atractivo Actualizado",
  ...
}
```
Response esperado:
- [ ] Campo `n` sigue siendo el mismo
- [ ] Otros campos se actualizan normalmente

#### Repetir para Experiencias y Rutas
- [ ] GET /api/experiencias
- [ ] GET /api/experiencias/:id
- [ ] POST /api/experiencias
- [ ] PUT /api/experiencias/:id
- [ ] GET /api/rutas
- [ ] GET /api/rutas/:id
- [ ] POST /api/rutas
- [ ] PUT /api/rutas/:id

---

## 📊 VALIDACIÓN DE DATOS

### Paso 14: Verificar Integridad de Datos
```sql
-- No debe haber números duplicados
SELECT n, COUNT(*) FROM atractivos GROUP BY n HAVING COUNT(*) > 1;
SELECT n, COUNT(*) FROM experiencias GROUP BY n HAVING COUNT(*) > 1;
SELECT n, COUNT(*) FROM rutas GROUP BY n HAVING COUNT(*) > 1;
```
- [ ] Queries no retornan resultados (no hay duplicados)

```sql
-- Verificar que todos los registros tienen N°
SELECT COUNT(*) as sin_n FROM atractivos WHERE n IS NULL;
SELECT COUNT(*) as sin_n FROM experiencias WHERE n IS NULL;
SELECT COUNT(*) as sin_n FROM rutas WHERE n IS NULL;
```
- [ ] Todas las queries retornan 0 (todos tienen N°)

### Paso 15: Test de Eliminación y Re-creación
```sql
-- Ver último N° actual
SELECT MAX(n) FROM atractivos;  -- Ej: 150
```
- [ ] Anotar el valor máximo

1. [ ] En frontend, crear nuevo atractivo (se asignará N° = 151)
2. [ ] Verificar en BD
3. [ ] [ ] Ejecutar: `SELECT MAX(n) FROM atractivos;` debe retornar 151

---

## 🎯 VALIDACIÓN FINAL

### Paso 16: Prueba Integral del Sistema

| Módulo | Tabla | N° en lista | N° en formulario | N° auto-asigna | N° no cambia editar | Números consistentes |
|--------|-------|-------------|------------------|-----------------|---------------------|----------------------|
| Atractivos | atractivos | ✅ | Disabled | ✅ | ✅ | ✅ |
| Experiencias | experiencias | ✅ | Disabled | ✅ | ✅ | ✅ |
| Rutas | rutas | ✅ | Disabled | ✅ | ✅ | ✅ |

- [ ] Todas las casillas marcadas correctamente

### Paso 17: Documentación Actualizada
- [ ] Archivo `IMPLEMENTATION_N_FIELD.md` existe y es accesible
- [ ] Archivo `SUMMARY_N_FIELD.md` existe y es accesible
- [ ] Archivo `VALIDATION_CHECKLIST.md` (este) existe

### Paso 18: Equipo Notificado
- [ ] Documentación compartida con el equipo
- [ ] [ ] Capacitación impartida (si aplica)
- [ ] Cambios comunicados en reunión

---

## 📝 Notas y Observaciones

Usar este espacio para documentar cualquier comportamiento inesperado:

```
NOTA 1:
Fecha: _________________
Comportamiento observado:
Acción tomada:

NOTA 2:
Fecha: _________________
Comportamiento observado:
Acción tomada:
```

---

## ✅ ESTADO FINAL

- **Implementación:** ✅ Completada / ⏳ En progreso / ❌ Con problemas
- **Pruebas:** ✅ Pasadas / ⏳ En progreso / ❌ Fallaron
- **Documentación:** ✅ Completa / ⏳ En progreso / ❌ Incompleta
- **Aprobación:** ✅ Aprobado / ⏳ Pendiente / ❌ Rechazado

---

**Validado por:** _________________  
**Fecha:** _________________  
**Observaciones finales:**

---

_Este checklist debe completarse ANTES de considerar la implementación como finalizada._
