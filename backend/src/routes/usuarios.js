const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { requireAuth, requirePermission } = require('../middleware/auth')
const { registrarCambio } = require('../utils/auditoria')

// GET /api/usuarios - Listado de usuarios
router.get('/', requireAuth, requirePermission('USUARIOS_VER'), async (req, res) => {
  try {
    const { page = 1, limit = 15, q = '', id_rol = '', estado = '' } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const where = ["u.username IS NOT NULL"]
    const params = []

    if (q) {
      where.push('(u.username LIKE ? OR u.email LIKE ? OR u.nombre LIKE ?)')
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }
    if (id_rol) { where.push('u.id_rol = ?'); params.push(id_rol) }
    if (estado) { where.push('u.estado = ?'); params.push(estado) }

    const whereClause = `WHERE ${where.join(' AND ')}`

    console.log('GET usuarios - Query:', whereClause)
    console.log('GET usuarios - Params:', params)

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.nombre, u.estado,
              u.id_rol, r.nombre AS rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id
       ${whereClause}
       ORDER BY u.id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    console.log('GET usuarios - Total filas:', rows.length)

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id
       ${whereClause}`,
      params
    )

    return res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error('ERROR en GET /usuarios:', err.message)
    return res.status(500).json({ error: 'Error al obtener usuarios', details: err.message })
  }
})

// POST /api/usuarios - Crear usuario local
router.post('/', requireAuth, requirePermission('USUARIOS_EDITAR'), async (req, res) => {
  try {
    const { username, email, nombre, password, id_rol, estado = 'ACTIVO' } = req.body

    if (!username || !email || !nombre) {
      return res.status(400).json({ error: 'username, email y nombre son requeridos' })
    }

    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida para nuevos usuarios' })
    }

    // Verificar que el username no exista
    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE username = ?',
      [username]
    )

    if (existing.length > 0) {
      return res.status(409).json({ error: 'El usuario ya existe' })
    }

    // Generar hash simple de la contraseña (en producción usar bcrypt o similar)
    const crypto = require('crypto')
    const password_hash = crypto.createHash('sha256').update(password).digest('hex')

    const [result] = await pool.query(
      'INSERT INTO usuarios SET ?',
      [{
        username: username.trim(),
        email: email.trim(),
        nombre: nombre.trim(),
        password_hash: password_hash,
        id_rol: id_rol || null,
        estado: estado
      }]
    )

    // Obtener usuario creado
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.nombre, u.estado,
              u.id_rol, r.nombre AS rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id
       WHERE u.id = ?`,
      [result.insertId]
    )

    // Registrar auditoría
    await registrarCambio('usuarios', result.insertId, 'CREATE', req.user, {}, req.body)

    return res.status(201).json({ message: 'Usuario creado correctamente', data: rows[0] })
  } catch (err) {
    console.error('ERROR en POST /usuarios:', err.message)
    return res.status(500).json({ error: 'Error al crear usuario', details: err.message })
  }
})

// GET /api/usuarios/:id - Detalle de usuario
router.get('/:id', requireAuth, requirePermission('USUARIOS_VER'), async (req, res) => {
  try {
    const { id } = req.params

    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.nombre, u.estado,
              u.id_rol, r.nombre AS rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id
       WHERE u.id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    return res.json({ data: rows[0] })
  } catch (err) {
    console.error('ERROR en GET /usuarios/:id:', err.message)
    return res.status(500).json({ error: 'Error al obtener usuario', details: err.message })
  }
})

// PUT /api/usuarios/:id - Actualizar usuario (cambiar rol, estado)
router.put('/:id', requireAuth, requirePermission('USUARIOS_EDITAR'), async (req, res) => {
  try {
    const { id } = req.params
    const { id_rol, estado } = req.body

    if (!id_rol && !estado) {
      return res.status(400).json({ error: 'Debe proporcionar al menos id_rol o estado' })
    }

    // Obtener datos antes de actualizar
    const [before] = await pool.query(
      `SELECT * FROM usuarios WHERE id = ?`,
      [id]
    )
    if (before.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const updates = []
    const params = []

    if (id_rol !== undefined) {
      updates.push('id_rol = ?')
      params.push(id_rol)
    }
    if (estado !== undefined) {
      updates.push('estado = ?')
      params.push(estado)
    }

    params.push(id)

    const [result] = await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Obtener usuario actualizado
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.nombre, u.estado,
              u.id_rol, r.nombre AS rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id
       WHERE u.id = ?`,
      [id]
    )

    // Registrar auditoría
    await registrarCambio('usuarios', id, 'UPDATE', req.user, before[0], req.body)

    return res.json({ message: 'Usuario actualizado correctamente', data: rows[0] })
  } catch (err) {
    console.error('ERROR en PUT /usuarios/:id:', err.message)
    return res.status(500).json({ error: 'Error al actualizar usuario', details: err.message })
  }
})

// DELETE /api/usuarios/:id - Soft delete de usuario
router.delete('/:id', requireAuth, requirePermission('USUARIOS_ELIMINAR'), async (req, res) => {
  try {
    const { id } = req.params

    // Obtener datos antes de eliminar
    const [before] = await pool.query(
      `SELECT * FROM usuarios WHERE id = ? AND estado != ?`,
      [id, 'INACTIVO']
    )
    if (before.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const [result] = await pool.query(
      `UPDATE usuarios SET estado = 'INACTIVO' WHERE id = ?`,
      [id]
    )

    // Registrar auditoría
    await registrarCambio('usuarios', id, 'DELETE', req.user, before[0], {})

    return res.json({ message: 'Usuario eliminado correctamente' })
  } catch (err) {
    console.error('ERROR en DELETE /usuarios/:id:', err.message)
    return res.status(500).json({ error: 'Error al eliminar usuario', details: err.message })
  }
})

module.exports = router
