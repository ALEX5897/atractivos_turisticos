# Implementación del Campo "N" - Número Secuencial

**Fecha:** 2026-05-08  
**Versión:** 1.0

## Descripción General

Se ha implementado un sistema de numeración secuencial automática para los 3 módulos principales del sistema:

1. **Atractivos** - tabla `atractivos`
2. **Experiencias** - tabla `experiencias`
3. **Rutas** - tabla `rutas`

Este número (`n`) es **único e inmutable** para cada registro, independiente de la paginación o filtros aplicados.

---

## 🗄️ Cambios en la Base de Datos

### Campo Agregado

Para cada tabla principal se agregó:

```sql
n INT UNSIGNED UNIQUE AUTO_INCREMENT
```

**Características:**
- `INT UNSIGNED`: Rango de 0 a 4,294,967,295
- `UNIQUE`: Garantiza que cada registro tenga un número único
- `AUTO_INCREMENT`: El sistema genera automáticamente el siguiente número disponible
- No es `NULL` - siempre tendrá un valor

### Script de Migración

Archivo: `database/migration_01_add_n_field.sql`

Ejecutar en MySQL:
```bash
mysql -u usuario -p atractivos_turisticos < database/migration_01_add_n_field.sql
```

---

## 🖥️ Cambios en el Backend

### Rutas de API Afectadas

Todas las rutas GET ya retornan el campo `n`:

#### Atractivos
- `GET /api/atractivos` - Retorna lista paginada con campo `n`
- `GET /api/atractivos/:id` - Retorna detalle con campo `n`

#### Experiencias
- `GET /api/experiencias` - Retorna lista paginada con campo `n`
- `GET /api/experiencias/:id` - Retorna detalle con campo `n`

#### Rutas
- `GET /api/rutas` - Retorna lista paginada con campo `n`
- `GET /api/rutas/:id` - Retorna detalle con campo `n`

### Ejemplo de Respuesta

```json
{
  "data": [
    {
      "id_atractivo": 1,
      "n": 1,
      "codigo": "ATR-001",
      "nombre": "Basílica del Voto Nacional",
      ...
    },
    {
      "id_atractivo": 5,
      "n": 2,
      "codigo": "ATR-005",
      "nombre": "Parque Metropolitano",
      ...
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 15
}
```

**Nota:** El campo `n` es **auto-generado** y **no se modifica** en operaciones PUT/PATCH.

---

## 🎨 Cambios en el Frontend

### Archivos Modificados

1. **AtractivosSection.vue**
   - Template: Mostrar `row.n` en columna "N°" (antes era cálculo de paginación)
   - Form: Campo `n` es `disabled` (solo lectura)
   - Label: Indica "(auto)" para claridad

2. **ExperienciasSection.vue**
   - Template: Mostrar `row.n` en columna "N°"
   - Form: Campo `n` es `disabled`
   - Label: Indica "(auto)"

3. **RutasSection.vue**
   - Template: Mostrar `row.n` en columna "N°"
   - Form: Campo `n` es `disabled`
   - Label: Indica "(auto)"

### Cambios de Plantilla

**Antes:**
```vue
<template #cell-numero="{ index }">
  {{ (filters.page - 1) * filters.limit + index + 1 }}
</template>
```

**Ahora:**
```vue
<template #cell-numero="{ row }">
  {{ row.n || '—' }}
</template>
```

### Cambios en Formularios

**Antes:**
```vue
<label>N.-</label>
<input v-model="form.n" type="text" class="f-input" />
```

**Ahora:**
```vue
<label>N° <span class="text-muted">(auto)</span></label>
<input v-model="form.n" type="text" class="f-input" disabled />
```

---

## 📊 Estructura de Datos

### Tabla: atractivos

```
CREATE TABLE atractivos (
  id_atractivo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  n INT UNSIGNED UNIQUE AUTO_INCREMENT,  ← NUEVO
  codigo VARCHAR(20) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  ...
)
```

### Tabla: experiencias

```
CREATE TABLE experiencias (
  id_experiencia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  n INT UNSIGNED UNIQUE AUTO_INCREMENT,  ← NUEVO
  codigo VARCHAR(20) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  ...
)
```

### Tabla: rutas

```
CREATE TABLE rutas (
  id_ruta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  n INT UNSIGNED UNIQUE AUTO_INCREMENT,  ← NUEVO
  codigo VARCHAR(20) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  ...
)
```

---

## ✅ Casos de Uso

### Crear un Atractivo
1. Usuario hace clic en "Nuevo Atractivo"
2. Formulario se abre vacío
3. Campo "N°" está vacío (no editable, muestra "—")
4. Usuario ingresa: código, nombre, etc.
5. **Al guardar:** Base de datos asigna automáticamente `n = 1` (o siguiente número disponible)
6. **En tabla:** Aparece con N° = 1

### Ver Detalle
1. Usuario hace clic en "Ver detalle"
2. Modal muestra el atractivo con su N° (ej: N° = 42)
3. Campo N° está deshabilitado (solo lectura)

### Editar Registro
1. Usuario edita un atractivo existente
2. Campo N° no puede ser modificado (disabled)
3. El número permanece igual
4. **Después de guardar:** N° sigue siendo el mismo

### Filtrar/Paginar
- Página 1, N° visible: 1, 2, 3, 4...
- Página 2, N° visible: 16, 17, 18, 19...
- **Los números NO cambian** al cambiar página
- **El orden es consistente** basado en fecha de creación

---

## 🔄 Flujo de Operaciones

### INSERT (Crear)
```javascript
// Backend recibe
POST /api/atractivos
{
  codigo: "ATR-100",
  nombre: "Nuevo Atractivo",
  ...
  // n NO se envía - la BD lo genera
}

// BD ejecuta
INSERT INTO atractivos SET ?
// MySQL asigna automáticamente: n = (siguiente número)

// Response
{
  id_atractivo: 123,
  n: 42,  ← Auto-asignado
  codigo: "ATR-100",
  nombre: "Nuevo Atractivo",
  ...
}
```

### UPDATE (Editar)
```javascript
// Backend recibe
PUT /api/atractivos/123
{
  codigo: "ATR-100",
  nombre: "Atractivo Actualizado",
  ...
  n: 42  ← Mantenido, no se modifica
}

// BD ejecuta
UPDATE atractivos SET ... WHERE id_atractivo = 123
// n NO cambia en UPDATE

// Response
{
  id_atractivo: 123,
  n: 42,  ← Sigue siendo 42
  codigo: "ATR-100",
  nombre: "Atractivo Actualizado",
  ...
}
```

---

## 🧪 Testing

### Verificar Implementación

```sql
-- Ver campo n en atractivos
SELECT id_atractivo, n, codigo, nombre FROM atractivos ORDER BY n;

-- Ver campo n en experiencias
SELECT id_experiencia, n, codigo, nombre FROM experiencias ORDER BY n;

-- Ver campo n en rutas
SELECT id_ruta, n, codigo, nombre FROM rutas ORDER BY n;

-- Verificar UNIQUE constraint
SELECT n, COUNT(*) FROM atractivos GROUP BY n HAVING COUNT(*) > 1;
```

### Pruebas en Frontend

1. **Crear nuevo registro:**
   - [ ] Campo N° vacío inicialmente
   - [ ] N° generado automáticamente al guardar
   - [ ] N° mostrado en tabla correctamente

2. **Editar registro:**
   - [ ] N° no puede ser modificado (disabled)
   - [ ] N° permanece igual después de guardar

3. **Paginar:**
   - [ ] N° no depende de número de página
   - [ ] Orden es consistente entre páginas

4. **Buscar/Filtrar:**
   - [ ] N° visible en resultados filtrados
   - [ ] N° es el mismo que en lista completa

---

## 📝 Notas Importantes

1. **Inmutable:** Una vez asignado, el `n` nunca cambia para un registro
2. **Único:** Dos registros nunca pueden tener el mismo `n`
3. **Auto-incremental:** No se asigna manualmente, la BD lo genera
4. **Persistente:** El `n` se conserva aunque se edite el registro
5. **Independiente:** No depende de id_atractivo, id_experiencia, id_ruta

---

## 🚀 Próximos Pasos

- [ ] Ejecutar script de migración en base de datos
- [ ] Verificar que el campo `n` existe en las 3 tablas
- [ ] Probar crear nuevos registros
- [ ] Verificar que N° se asigna automáticamente
- [ ] Validar comportamiento en paginación
- [ ] Comunicar cambios al equipo

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si intento modificar el campo n?**  
R: El campo está `disabled` en el frontend, así que no se puede modificar manualmente. En backend, no se actualiza durante operaciones UPDATE.

**P: ¿Qué número tendrá el primer registro?**  
R: Depende del estado de la tabla. Si es nueva, comenzará en 1. Si hay registros existentes, continuará desde el siguiente número disponible.

**P: ¿Se puede eliminar un registro y reutilizar su número?**  
R: No. Una vez asignado un número, no se reutiliza. La secuencia siempre avanza.

**P: ¿El número cambia al filtrar por estado?**  
R: No. El campo `n` es independiente de filtros. Solo la visualización cambia según la paginación.

---

**Última actualización:** 2026-05-08
