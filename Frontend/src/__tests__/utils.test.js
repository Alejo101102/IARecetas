import {
  getProductos,
  addProducto,
  updateProducto,
  deleteProducto,
  diasParaVencer,
} from '../pages/store/inventarioStore'
import { describe, beforeEach, it, expect, jest } from '@jest/globals'

describe('inventarioStore', () => {
  const STORAGE_KEY = 'iarecetas_inventario'

  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: jest.fn(() => 'uuid-test-123') },
      configurable: true,
    })
  })

  it('getProductos devuelve arreglo vacío cuando no hay datos', () => {
    expect(getProductos()).toEqual([])
  })

  it('addProducto guarda en localStorage y retorna lista actualizada', () => {
    const result = addProducto({
      nombre: 'Leche',
      cantidad: 2,
      unidad: 'L',
      categoria: 'lacteos',
      fechaVencimiento: null,
    })

    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Leche')
    expect(result[0].id).toBeTruthy()

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(persisted).toHaveLength(1)
    expect(persisted[0].nombre).toBe('Leche')
  })

  it('updateProducto reemplaza el producto por id', () => {
    const [created] = addProducto({
      nombre: 'Harina',
      cantidad: 1,
      unidad: 'kg',
      categoria: 'granos',
      fechaVencimiento: null,
    })

    const updated = updateProducto({
      ...created,
      cantidad: 3,
      nombre: 'Harina Integral',
    })

    expect(updated).toHaveLength(1)
    expect(updated[0].nombre).toBe('Harina Integral')
    expect(updated[0].cantidad).toBe(3)
  })

  it('deleteProducto elimina por id', () => {
    const [created] = addProducto({
      nombre: 'Azucar',
      cantidad: 1,
      unidad: 'kg',
      categoria: 'granos',
      fechaVencimiento: null,
    })

    const updated = deleteProducto(created.id)
    expect(updated).toEqual([])
    expect(getProductos()).toEqual([])
  })

  it('diasParaVencer devuelve null si no hay fecha', () => {
    expect(diasParaVencer(null)).toBeNull()
  })

  it('diasParaVencer devuelve un número positivo para fecha futura', () => {
    const future = new Date()
    future.setDate(future.getDate() + 2)
    const dias = diasParaVencer(future.toISOString().split('T')[0])

    expect(typeof dias).toBe('number')
    expect(dias).toBeGreaterThanOrEqual(1)
    expect(dias).toBeLessThanOrEqual(3)
  })
})
