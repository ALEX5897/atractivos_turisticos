const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { requireAuth, requirePermission } = require('../middleware/auth')
const { registrarCambio } = require('../utils/auditoria')

// GET /api/roles - Listado de roles
router.get('/', requireAuth, requirePermission('ROLES_VER'), async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const [rows] = await pool.query(
      `SELECT r.id, r.nombre, r.descripcion, r.estado,
              COUNT(rp.id_permiso) AS permisos_count
       FROM roles r
       LEFT JOIN rol_permisos rp ON r.id = rp.id_rol
       GROUP BY r.id
       ORDER BY r.id
       LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    )

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM roles')

    return res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error('ERROR en GET /roles:', err.message)
    return res.status(500).json({ error: 'Error al obtener roles', details: err.message })
  }
})

// GET /api/roles/all/permisos - Obtener todos los permisos disponibles (DEBE IR ANTES DE /:id)
router.get('/all/permisos', requireAuth, requirePermission('ROLES_VER'), async (req, res) => {
  try {
    const [permisos] = await pool.query(
      `SELECT id, codigo, nombre, descripcion, modulo, accion
       FROM permisos
       ORDER BY modulo, accion`
    )

    return res.json({ data: permisos })
  } catch (err) {
    console.error('ERROR en GET /roles/all/permisos:', err.message)
    return res.status(500).json({ error: 'Error al obtener permisos', details: err.message })
  }
})

// GET /api/roles/:id - Detalle de rol con permisos
router.get('/:id', requireAuth, requirePermission('ROLES_VER'), async (req, res) => {
  try {
    const { id } = req.params

    // Obtener rol
    const [roleRows] = await pool.query(
      `SELECT r.id, r.nombre, r.descripcion, r.estado, r.creado_en, r.actualizado_en
       FROM roles r
       WHERE r.id = ?`,
      [id]
    )

    if (roleRows.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' })
    }

    const role = roleRows[0]

    // Obtener permisos del rol
    const [permisos] = await pool.query(
      `SELECT p.id, p.codigo, p.nombre, p.descripcion, p.modulo, p.accion
       FROM permisos p
       INNER JOIN rol_permisos rp ON p.id = rp.id_permiso
       WHERE rp.id_rol = ?
       ORDER BY p.modulo, p.accion`,
      [id]
    )

    role.permisos = permisos

    return res.json({ data: role })
  } catch (err) {
    console.error('ERROR en GET /roles/:id:', err.message)
    return res.status(500).json({ error: 'Error al obtener rol', details: err.message })
  }
})

// POST /api/roles - Crear rol
router.post('/', requireAuth, requirePermission('ROLES_CREAR'), async (req, res) => {
  try {
    const { nombre, descripcion, estado = 'ACTIVO' } = req.body

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del rol es requerido' })
    }

    // Verificar que el nombre sea único
    const [existing] = await pool.query('SELECT id FROM roles WHERE nombre = ?', [nombre])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Rol con ese nombre ya existe' })
    }

    const [result] = await pool.query(
      'INSERT INTO roles (nombre, descripcion, estado) VALUES (?, ?, ?)',
      [nombre, descripcion || null, estado]
    )

    const [rows] = await pool.query(
      'SELECT id, nombre, descripcion, estado FROM roles WHERE id = ?',
      [result.insertId]
    )

    // Registrar auditoría
    await registrarCambio('roles', result.insertId, 'CREATE', req.user, {}, { nombre, descripcion, estado })

    return res.status(201).json({
      message: 'Rol creado correctamente',
      data: { ...rows[0], permisos: [] }
    })
  } catch (err) {
    console.error('ERROR en POST /roles:', err.message)
    return res.status(500).json({ error: 'Error al crear rol', details: err.message })
  }
})

// PUT /api/roles/:id - Actualizar rol
router.put('/:id', requireAuth, requirePermission('ROLES_EDITAR'), async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, estado } = req.body

    // Obtener datos anteriores
    const [before] = await pool.query(
      'SELECT id, nombre, descripcion, estado FROM roles WHERE id = ?',
      [id]
    )
    if (before.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' })
    }

    const updates = []
    const params = []

    if (nombre !== undefined) {
      // Verificar que no exista otro rol con ese nombre
      const [existing] = await pool.query('SELECT id FROM roles WHERE nombre = ? AND id != ?', [nombre, id])
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Rol con ese nombre ya existe' })
      }
      updates.push('nombre = ?')
      params.push(nombre)
    }
    if (descripcion !== undefined) { updates.push('descripcion = ?'); params.push(descripcion) }
    if (estado !== undefined) { updates.push('estado = ?'); params.push(estado) }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar' })
    }

    params.push(id)

    const [result] = await pool.query(
      `UPDATE roles SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' })
    }

    // Obtener rol actualizado
    const [rows] = await pool.query(
      'SELECT id, nombre, descripcion, estado FROM roles WHERE id = ?',
      [id]
    )

    // Registrar auditoría
    await registrarCambio('roles', id, 'UPDATE', req.user, before[0], { nombre, descripcion, estado })

    return res.json({ message: 'Rol actualizado correctamente', data: rows[0] })
  } catch (err) {
    console.error('ERROR en PUT /roles/:id:', err.message)
    return res.status(500).json({ error: 'Error al actualizar rol', details: err.message })
  }
})

// DELETE /api/roles/:id - Eliminar rol (solo si no tiene usuarios)
router.delete('/:id', requireAuth, requirePermission('ROLES_ELIMINAR'), async (req, res) => {
  try {
    const { id } = req.params

    // Obtener datos antes de eliminar
    const [before] = await pool.query(
      'SELECT id, nombre, descripcion, estado FROM roles WHERE id = ?',
      [id]
    )
    if (before.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' })
    }

    // Verificar que no haya usuarios con este rol
    const [users] = await pool.query('SELECT COUNT(*) as count FROM usuarios WHERE id_rol = ?', [id])
    if (users[0].count > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el rol porque hay usuarios asignados' })
    }

    const [result] = await pool.query('DELETE FROM roles WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' })
    }

    // Registrar auditoría
    await registrarCambio('roles', id, 'DELETE', req.user, before[0], {})

    return res.json({ message: 'Rol eliminado correctamente' })
  } catch (err) {
    console.error('ERROR en DELETE /roles/:id:', err.message)
    return res.status(500).json({ error: 'Error al eliminar rol', details: err.message })
  }
})

// GET /api/roles/:id/permisos - Obtener permisos del rol
router.get('/:id/permisos', requireAuth, requirePermission('ROLES_VER'), async (req, res) => {
  try {
    const { id } = req.params

    const [permisos] = await pool.query(
      `SELECT p.id, p.codigo, p.nombre, p.descripcion, p.modulo, p.accion
       FROM permisos p
       INNER JOIN rol_permisos rp ON p.id = rp.id_permiso
       WHERE rp.id_rol = ?
       ORDER BY p.modulo, p.accion`,
      [id]
    )

    return res.json({ data: permisos })
  } catch (err) {
    console.error('ERROR en GET /roles/:id/permisos:', err.message)
    return res.status(500).json({ error: 'Error al obtener permisos del rol', details: err.message })
  }
})

// POST /api/roles/:id/permisos - Asignar permisos a rol
router.post('/:id/permisos', requireAuth, requirePermission('ROLES_EDITAR'), async (req, res) => {
  try {
    const { id } = req.params
    const { permisos } = req.body

    if (!Array.isArray(permisos)) {
      return res.status(400).json({ error: 'permisos debe ser un array de IDs' })
    }

    // Verificar que el rol existe
    const [roleExists] = await pool.query('SELECT id FROM roles WHERE id = ?', [id])
    if (roleExists.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' })
    }

    // Eliminar permisos actuales
    await pool.query('DELETE FROM rol_permisos WHERE id_rol = ?', [id])

    // Insertar nuevos permisos
    for (const permiso_id of permisos) {
      await pool.query(
        'INSERT INTO rol_permisos (id_rol, id_permiso) VALUES (?, ?)',
        [id, permiso_id]
      )
    }

    // Obtener permisos del rol actualizado
    const [updatedPermisos] = await pool.query(
      `SELECT p.id, p.codigo, p.nombre, p.descripcion, p.modulo, p.accion
       FROM permisos p
       INNER JOIN rol_permisos rp ON p.id = rp.id_permiso
       WHERE rp.id_rol = ?
       ORDER BY p.modulo, p.accion`,
      [id]
    )

    return res.json({
      message: 'Permisos del rol actualizados correctamente',
      data: updatedPermisos
    })
  } catch (err) {
    console.error('ERROR en POST /roles/:id/permisos:', err.message)
    return res.status(500).json({ error: 'Error al asignar permisos al rol', details: err.message })
  }
})

module.exports = router
