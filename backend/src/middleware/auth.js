const jwt = require('jsonwebtoken')
const { introspectToken } = require('../config/keycloak')
const { pool } = require('../config/database')

// Middleware: valida el access_token en cada request protegido
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  const tokenFromCookie = req.cookies?.access_token

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : tokenFromCookie

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    // Primero intenta verificar como JWT local
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cambiar-por-clave-segura-de-minimo-32-caracteres-aqui')

      // Cargar usuario y permisos de BD
      const [userRows] = await pool.query(
        `SELECT u.id, u.username, u.email, u.nombre, u.id_rol, r.nombre AS rol,
                GROUP_CONCAT(p.codigo) AS permisos
         FROM usuarios u
         LEFT JOIN roles r ON u.id_rol = r.id
         LEFT JOIN rol_permisos rp ON r.id = rp.id_rol
         LEFT JOIN permisos p ON rp.id_permiso = p.id
         WHERE u.username = ? AND u.estado = 'ACTIVO'
         GROUP BY u.id`,
        [decoded.preferred_username]
      )

      if (userRows.length > 0) {
        const user = userRows[0]
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.nombre,
          rol: user.rol,
          id_rol: user.id_rol,
          permisos: user.permisos ? user.permisos.split(',') : [],
          roles: decoded.realm_access?.roles || [],
        }
      } else {
        req.user = {
          id: decoded.sub,
          username: decoded.preferred_username,
          email: decoded.email,
          name: decoded.name,
          roles: decoded.realm_access?.roles || [],
          permisos: [],
        }
      }

      return next()
    } catch (jwtErr) {
      // Si falla el JWT local, intenta Keycloak
      const tokenInfo = await introspectToken(token)

      if (!tokenInfo.active) {
        return res.status(401).json({ error: 'Token expirado o inválido' })
      }

      // Cargar usuario y permisos de BD
      const [userRows] = await pool.query(
        `SELECT u.id, u.username, u.email, u.nombre, u.id_rol, r.nombre AS rol,
                GROUP_CONCAT(p.codigo) AS permisos
         FROM usuarios u
         LEFT JOIN roles r ON u.id_rol = r.id
         LEFT JOIN rol_permisos rp ON r.id = rp.id_rol
         LEFT JOIN permisos p ON rp.id_permiso = p.id
         WHERE u.username = ? AND u.estado = 'ACTIVO'
         GROUP BY u.id`,
        [tokenInfo.preferred_username]
      )

      if (userRows.length > 0) {
        const user = userRows[0]
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.nombre,
          rol: user.rol,
          id_rol: user.id_rol,
          permisos: user.permisos ? user.permisos.split(',') : [],
          roles: tokenInfo.realm_access?.roles || [],
        }
      } else {
        req.user = {
          id: tokenInfo.sub,
          username: tokenInfo.preferred_username,
          email: tokenInfo.email,
          name: tokenInfo.name,
          roles: tokenInfo.realm_access?.roles || [],
          permisos: [],
        }
      }

      next()
    }
  } catch (err) {
    console.error('[Auth] Error validando token:', err.message)
    return res.status(401).json({ error: 'Token inválido' })
  }
}

// Middleware: verifica que el usuario tenga un rol específico
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const hasRole = roles.some((role) => req.user.roles.includes(role))
    if (!hasRole) {
      return res.status(403).json({ error: 'Sin permisos suficientes' })
    }

    next()
  }
}

// Middleware: verifica que el usuario tenga un permiso específico
function requirePermission(codigo) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const hasPermission = req.user.permisos && req.user.permisos.includes(codigo)
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permiso denegado: ' + codigo })
    }

    next()
  }
}

module.exports = { requireAuth, requireRole, requirePermission }
