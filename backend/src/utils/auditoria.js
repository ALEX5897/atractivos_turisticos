const { pool } = require('../config/database')

function detectarCambios(antes, despues) {
  const cambios = []
  const todasLasClaves = new Set([...Object.keys(antes), ...Object.keys(despues)])

  todasLasClaves.forEach(clave => {
    if (antes[clave] !== despues[clave]) {
      cambios.push({
        campo: clave,
        valor_anterior: antes[clave],
        valor_nuevo: despues[clave]
      })
    }
  })

  return cambios
}

function generarDescripcion(cambios, tipoAccion) {
  if (tipoAccion === 'CREATE') {
    return 'Se creó nuevo registro'
  } else if (tipoAccion === 'DELETE') {
    return 'Se eliminó registro'
  } else if (tipoAccion === 'UPDATE') {
    if (cambios.length === 0) {
      return 'Sin cambios registrados'
    }
    const camposModificados = cambios.map(c => c.campo).join(', ')
    return `Se modificaron los campos: ${camposModificados}`
  }
  return ''
}

async function registrarCambio(tabla, registroId, tipoAccion, usuario = {}, datosAnteriores = {}, datosNuevos = {}) {
  try {
    let cambios = []
    let descripcion = ''

    if (tipoAccion === 'UPDATE') {
      cambios = detectarCambios(datosAnteriores, datosNuevos)
      descripcion = generarDescripcion(cambios, tipoAccion)
    } else {
      descripcion = generarDescripcion([], tipoAccion)
    }

    // Obtener el usuario_id y usuario_nombre del objeto usuario
    const usuarioId = usuario?.id || usuario?.usuario_id || null
    const usuarioNombre = usuario?.username || usuario?.usuario_nombre || 'Sistema'

    await pool.query(
      `INSERT INTO auditoria (
        tabla_afectada, registro_id, tipo_accion, usuario_id, usuario_nombre,
        fecha_hora, descripcion, datos_anteriores, datos_nuevos, cambios_campo
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        tabla,
        registroId,
        tipoAccion,
        usuarioId,
        usuarioNombre,
        descripcion,
        Object.keys(datosAnteriores).length > 0 ? JSON.stringify(datosAnteriores) : null,
        Object.keys(datosNuevos).length > 0 ? JSON.stringify(datosNuevos) : null,
        cambios.length > 0 ? JSON.stringify(cambios) : null
      ]
    )
  } catch (err) {
    console.error(`Error registrando auditoría para ${tabla}:`, err.message)
  }
}

module.exports = { registrarCambio, detectarCambios, generarDescripcion }
