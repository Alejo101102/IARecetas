import { describe, beforeEach, it, expect, jest } from '@jest/globals'
import {
  getProductos,
  addProducto,
  deleteProducto,
  updateProducto,
  diasParaVencer,
} from '../pages/store/inventarioStore'

// ── Re-import the mocked Firestore functions ───────────────
import { getDocs, addDoc, deleteDoc, updateDoc, collection, doc } from 'firebase/firestore'

describe('inventarioStore', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── getProductos ─────────────────────────────────────────

  it('getProductos devuelve arreglo vacío cuando no hay datos', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] })

    const result = await getProductos()
    expect(result).toEqual([])
  })

  it('getProductos devuelve los productos del snapshot', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'abc', data: () => ({ nombre: 'Leche', cantidad: 1, unidad: 'L' }) },
        { id: 'def', data: () => ({ nombre: 'Arroz', cantidad: 500, unidad: 'g' }) },
      ]
    })

    const result = await getProductos()
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 'abc', nombre: 'Leche', cantidad: 1, unidad: 'L' })
    expect(result[1]).toEqual({ id: 'def', nombre: 'Arroz', cantidad: 500, unidad: 'g' })
  })

  // ── addProducto ──────────────────────────────────────────

  it('addProducto guarda en Firestore y retorna lista actualizada', async () => {
    addDoc.mockResolvedValueOnce({ id: 'new-id' })
    getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'new-id', data: () => ({ nombre: 'Leche', cantidad: 1, unidad: 'L' }) },
      ]
    })

    const result = await addProducto({ nombre: 'Leche', cantidad: 1, unidad: 'L' })

    expect(addDoc).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Leche')
    expect(result[0].id).toBeTruthy()
  })

  // ── updateProducto ───────────────────────────────────────

  it('updateProducto reemplaza el producto por id', async () => {
    updateDoc.mockResolvedValueOnce()
    getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'abc', data: () => ({ nombre: 'Leche entera', cantidad: 2, unidad: 'L' }) },
      ]
    })

    const updated = { id: 'abc', nombre: 'Leche entera', cantidad: 2, unidad: 'L' }
    const result = await updateProducto(updated)

    expect(updateDoc).toHaveBeenCalledTimes(1)
    expect(result[0].nombre).toBe('Leche entera')
    expect(result[0].cantidad).toBe(2)
  })

  // ── deleteProducto ───────────────────────────────────────

  it('deleteProducto elimina por id', async () => {
    deleteDoc.mockResolvedValueOnce()
    getDocs.mockResolvedValueOnce({ docs: [] })

    const result = await deleteProducto('abc')

    expect(deleteDoc).toHaveBeenCalledTimes(1)
    expect(result).toEqual([])
  })

  // ── diasParaVencer ───────────────────────────────────────

  it('diasParaVencer retorna null si no hay fecha', () => {
    expect(diasParaVencer(null)).toBeNull()
    expect(diasParaVencer(undefined)).toBeNull()
    expect(diasParaVencer('')).toBeNull()
  })

  it('diasParaVencer retorna número negativo si ya venció', () => {
    const pasado = '2000-01-01'
    expect(diasParaVencer(pasado)).toBeLessThan(0)
  })

  it('diasParaVencer retorna número positivo para fecha futura', () => {
    const futuro = '2099-12-31'
    expect(diasParaVencer(futuro)).toBeGreaterThan(0)
  })

  it('diasParaVencer retorna 0 para hoy', () => {
    const hoy = new Date().toISOString().split('T')[0]
    expect(diasParaVencer(hoy)).toBe(0)
  })
})