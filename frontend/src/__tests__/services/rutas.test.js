import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rutasService } from '@/services/rutas'

// Mockear el servicio auth (que provee la instancia api)
vi.mock('@/services/auth', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '@/services/auth'

describe('Rutas Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('debería hacer GET request a /rutas con parámetros', async () => {
      const mockResponse = {
        data: [
          { id_ruta: 1, nombre: 'Ruta 1' },
          { id_ruta: 2, nombre: 'Ruta 2' },
        ],
        total: 2,
      }

      api.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await rutasService.getAll({ page: 1, limit: 15 })

      expect(api.get).toHaveBeenCalledWith('/rutas', {
        params: { page: 1, limit: 15 },
      })
      expect(result.data).toEqual(mockResponse)
    })

    it('debería soportar filtros adicionales', async () => {
      api.get.mockResolvedValueOnce({ data: { data: [], total: 0 } })

      await rutasService.getAll({
        page: 1,
        limit: 15,
        estado: 'ACTIVO',
        dificultad: 'FACIL',
      })

      expect(api.get).toHaveBeenCalledWith('/rutas', {
        params: {
          page: 1,
          limit: 15,
          estado: 'ACTIVO',
          dificultad: 'FACIL',
        },
      })
    })
  })

  describe('getById', () => {
    it('debería hacer GET request a /rutas/:id', async () => {
      const mockRuta = {
        id_ruta: 1,
        nombre: 'Ruta Test',
        codigo_qt: '02RP08001',
      }

      api.get.mockResolvedValueOnce({ data: { data: mockRuta } })

      const result = await rutasService.getById(1)

      expect(api.get).toHaveBeenCalledWith('/rutas/1')
      expect(result.data.data).toEqual(mockRuta)
    })
  })

  describe('create', () => {
    it('debería hacer POST request a /rutas', async () => {
      const newRuta = {
        nombre: 'Nueva Ruta',
        estado: 'EN_REVISION',
        nodo: 'Nodo 1',
        centralidad: 'Central',
      }

      api.post.mockResolvedValueOnce({
        data: { id: 1, codigo_qt: '02RP08001' },
      })

      const result = await rutasService.create(newRuta)

      expect(api.post).toHaveBeenCalledWith('/rutas', newRuta)
      expect(result.data).toHaveProperty('id')
      expect(result.data).toHaveProperty('codigo_qt')
    })
  })

  describe('update', () => {
    it('debería hacer PUT request a /rutas/:id', async () => {
      const updates = {
        nombre: 'Ruta Actualizada',
        estado: 'ACTIVO',
      }

      api.put.mockResolvedValueOnce({ data: { message: 'Actualizado' } })

      const result = await rutasService.update(1, updates)

      expect(api.put).toHaveBeenCalledWith('/rutas/1', updates)
      expect(result.data).toHaveProperty('message')
    })
  })

  describe('remove', () => {
    it('debería hacer DELETE request a /rutas/:id', async () => {
      api.delete.mockResolvedValueOnce({ data: { message: 'Eliminado' } })

      const result = await rutasService.remove(1)

      expect(api.delete).toHaveBeenCalledWith('/rutas/1')
      expect(result.data).toHaveProperty('message')
    })
  })

  describe('getFilterOptions', () => {
    it('debería obtener opciones de filtro', async () => {
      const mockOptions = {
        nodos: [{ nombre: 'Nodo 1' }],
        centralidades: [{ nombre: 'Central' }],
        modalidades: [{ nombre: 'A Pie' }],
      }

      api.get.mockResolvedValueOnce({ data: mockOptions })

      const result = await rutasService.getFilterOptions()

      expect(api.get).toHaveBeenCalledWith('/rutas/filter-options')
      expect(result.data).toEqual(mockOptions)
    })
  })
})
