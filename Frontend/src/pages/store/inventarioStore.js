// ============================================================
//  inventarioStore.js  –  Almacenamiento local del inventario
// ============================================================
//
//  TODO (Backend):
//  Cuando conectes al backend, reemplaza las funciones de este
//  archivo por llamadas a tu API. Ejemplo de endpoints:
//
//  const API_BASE = 'http://localhost:5000/api'   // ← tu URL
//
//  getProductos()        → GET    ${API_BASE}/inventario
//  addProducto(data)     → POST   ${API_BASE}/inventario       body: data
//  updateProducto(p)     → PUT    ${API_BASE}/inventario/${p.id}  body: p
//  deleteProducto(id)    → DELETE ${API_BASE}/inventario/${id}
//
//  También puedes conectar Firestore:
//  import { db } from '../firebase'
//  import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'
//  const colRef = collection(db, 'inventario')
// ============================================================

const STORAGE_KEY = 'iarecetas_inventario'

/** Devuelve todos los productos guardados */
export function getProductos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Guarda un nuevo producto y retorna la lista actualizada */
export function addProducto(producto) {
  const lista = getProductos()
  const nuevo = {
    ...producto,
    id: crypto.randomUUID(),
    creadoEn: new Date().toISOString(),
  }
  const actualizada = [nuevo, ...lista]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizada))
  return actualizada
}

/** Elimina un producto por id y retorna la lista actualizada */
export function deleteProducto(id) {
  const actualizada = getProductos().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizada))
  return actualizada
}

/** Reemplaza un producto existente */
export function updateProducto(productoActualizado) {
  const actualizada = getProductos().map(p =>
    p.id === productoActualizado.id ? productoActualizado : p
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizada))
  return actualizada
}

/** Retorna los días que faltan para que venza un producto.
 *  Devuelve null si no tiene fecha. */
export function diasParaVencer(fechaVencimiento) {
  if (!fechaVencimiento) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const vence = new Date(fechaVencimiento)
  vence.setHours(0, 0, 0, 0)
  return Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24))
}