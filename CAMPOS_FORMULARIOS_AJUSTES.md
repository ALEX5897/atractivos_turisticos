# Alineación de Campos: Formularios con Datos Reales

## Estado Actual
- ✅ 222 Atractivos cargados
- ✅ 180 Experiencias cargadas
- ✅ 151 Rutas cargadas
- ⏳ Formularios Vue necesitan alinearse

---

## ATRACTIVOS

### Campos del Excel (25 campos)
1. N.- → `n`
2. ESTADO → `estado`
3. CÓDIGO MINTUR → `codigo_mintur`
4. CÓDIGO QT → `codigo_qt` (o `codigo`)
5. PARROQUIA → `parroquia` (texto)
6. NODO → `nodo`
7. CENTRALIDAD → `centralidad`
8. SUBCENTRALIDAD → `subcentralidad`
9. NOMBRE DEL ATRACTIVO / RECURSO → `nombre`
10. CATEGORÍA → `categoria` (texto, también `id_categoria`)
11. TIPO → `tipo` (texto, también `id_tipo`)
12. SUB TIPO → `sub_tipo`
13. JERARQUÍA → `jerarquia`
14. PÚBLICA → `publica`
15. LATITUD → `latitud` (mapa)
16. LONGITUD → `longitud` (mapa)
17. BREVE DESCRIPCIÓN → `breve_descripcion`
18. SERVICIOS INCLUIDOS → `servicios_incluidos`
19. DIRECCIÓN → `direccion`
20. HORARIO → `horario`
21. ACCESO DE TRANSPORTE → `acceso_de_transporte`
22. RESTRICCIÓN A LA ACCESIBILIDAD → `restriccion_a_la_accesibilidad`
23. PET FRIENDLY → `pet_friendly`
24. CONTACTO - TELÉFONO- CORREO ELECTRÓNICO → `contacto_telefono_correo_electronico`
25. DPA MANZANA/LOCALIDAD DEL ATRACTIVO → `dpa_manzana_localidad_del_atractivo`

### Ajustes necesarios en AtractivosSection.vue

**Pestaña: Identificación**
- ✅ Código QT (MANTENER)
- ✅ Jerarquía (MANTENER)
- ✅ Nombre (MANTENER)
- ❌ Nombre alternativo (ELIMINAR - no está en datos)
- ✅ Categoría/Tipo (MANTENER)
- ⏳ Generador de Códigos (REVISAR - usa campos cat específicos)

**Pestaña: Ubicación**
- ✅ Parroquia (MANTENER)
- ❌ Barrio (ELIMINAR - no está en datos)
- ✅ Dirección (MANTENER)
- ❌ Referencia (ELIMINAR - no está en datos)
- ✅ Altitud msnm (MANTENER)
- ✅ MapPicker (MANTENER)

**Pestaña: Descripción**
- ❌ Descripción general (ELIMINAR - usar solo Breve descripción)
- ✅ Historia / Reseña (MANTENER)

**Pestaña: Datos Matriz**
- ✅ Todos los campos (MANTENER) - son los campos de texto de los datos

**Pestaña: Contacto y Operación**
- ⏳ Teléfono (REVISAR - no está específicamente en datos)
- ⏳ Email (REVISAR - no está específicamente en datos)
- ⏳ Sitio web (REVISAR - no está específicamente en datos)
- ❌ Precio entrada / Precio detalle (ELIMINAR - no en datos)
- ✅ Horario (MANTENER)

**Pestaña: Accesibilidad**
- Nota: Los campos de accesibilidad (accesible_movilidad, etc.) existen en BD pero NO en los datos del Excel
- ✅ MANTENER pero dejar en null/false por ahora

**Pestaña: Estado**
- ✅ Estado (MANTENER)
- ❌ Fecha de levantamiento (ELIMINAR - no en datos)

---

## EXPERIENCIAS

### Campos del Excel (18 campos)
1. N° → `n`
2. ESTADO EXPERIENCIA → `estado_experiencia`
3. CÓDIGO EXPERIENCIA QT → `codigo_experiencia_qt` (o `codigo`)
4. PARROQUIA → `parroquia`
5. NODO → `nodo`
6. CENTRALIDAD → `centralidad`
7. MODALIDAD → `modalidad`
8. NOMBRE DE LA EXPERIENCIA → `nombre`
9. BREVE DESCRIPCIÓN Y ACTIVIDADES A REALIZAR → `breve_descripcion_y_actividades_a_realizar`
10. DIRECCIÓN → `direccion`
11. LATITUD → `latitud` (mapa)
12. LONGITUD → `longitud` (mapa)
13. TIEMPO DE DURACIÓN → `tiempo_de_duracion` (texto) / `duracion_horas` (numérico)
14. HORARIO DE ATENCIÓN → `horario_de_atencion`
15. COSTO → `costo`
16. CAPACIDAD → `capacidad`
17. RESTRICCIONES → `restricciones`
18. CONTACTOS → `contactos`

### Cambios necesarios en ExperienciasSection.vue
- Revisar campos del formulario para que coincidan exactamente
- Eliminar campos que no están en los datos
- Asegurar que MapPicker funcione para latitud/longitud

---

## RUTAS

### Campos del Excel (23 campos)
1. N° → `n`
2. ESTADO → `estado`
3. CÓDIGO QT → `codigo_qt` (o `codigo`)
4. NODO → `nodo`
5. CENTRALIDAD → `centralidad`
6. NOMBRE DE LA RUTA TURÍSTICA → `nombre` (o `nombre_de_la_ruta_turistica`)
7. CLASIFICACIÓN → `clasificacion`
8. BREVE DESCRIPCIÓN → `breve_descripcion`
9. MODALIDAD → `modalidad`
10. TIEMPO DE DURACIÓN DE RUTA → `tiempo_de_duracion_de_ruta_horas` (texto) / `duracion_horas` (numérico)
11. DISTANCIA (Km) → `distancia_km`
12. ALTITUD (m.s.n.m) → `altitud_m_s_n_m` (texto) / `altitud_max` (numérico)
13. DIFICULTAD → `dificultad` (FACIL, MODERADO, DIFICIL, MUY_DIFICIL)
14. LINK DE RUTA → `link_de_ruta`
15-23. NOMBRE DEL ATRACTIVO ASOCIADO (1-9) → `nombre_del_atractivo_recurso_asociado_a_la_ruta_1` a `_9`

### Cambios necesarios en RutasSection.vue
- Actualizar campos para que coincidan con datos
- Agregar campo para atractivos asociados si no existe
- Revisar MapPicker si es necesario (rutas no tienen punto de inicio/fin específico en datos)

---

## Próximas Acciones

1. ✅ COMPLETADO: Carga de 553 registros reales
2. ⏳ PENDIENTE: Revisar y ajustar formularios Vue
3. ⏳ PENDIENTE: Eliminar campos innecesarios
4. ⏳ PENDIENTE: Agregar campos faltantes si es necesario
5. ⏳ PENDIENTE: Probar visualización y edición de datos reales

---

**Generado:** 2026-05-18  
**Total de registros:** 553 (222 atractivos, 180 experiencias, 151 rutas)
