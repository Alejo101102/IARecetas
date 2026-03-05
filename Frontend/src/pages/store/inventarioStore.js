// ============================================================
//  inventarioStore.js  –  Almacenamiento en Firestore
// ============================================================

import { db, auth } from '../../firebase.js'
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'


function getInventarioRef() {
  const user = auth.currentUser

  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  return collection(db, "users", user.uid, "inventario")
}

/** Devuelve todos los productos desde Firestore */
export async function getProductos() {
  try {
    const snapshot = await getDocs(getInventarioRef())
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    return []
  }
}

/** Agrega un nuevo producto a Firestore y retorna la lista actualizada */
export async function addProducto(producto) {
  try {
    const nuevo = {
      ...producto,
      creadoEn: new Date().toISOString(),
    }
    await addDoc(getInventarioRef(), nuevo)
    return await getProductos()
  } catch (error) {
    console.error('Error agregando producto:', error)
    throw error
  }
}

/** Elimina un producto por id en Firestore y retorna la lista actualizada */
export async function deleteProducto(id) {
  try {
    await deleteDoc(doc(getInventarioRef(), id))
    return await getProductos()
  } catch (error) {
    console.error('Error eliminando producto:', error)
    throw error
  }
}

/** Actualiza un producto en Firestore y retorna la lista actualizada */
export async function updateProducto(productoActualizado) {
  try {
    await updateDoc(
      doc(getInventarioRef(), productoActualizado.id),
      productoActualizado
    )
    return await getProductos()
  } catch (error) {
    console.error('Error actualizando producto:', error)
    throw error
  }
}

/** Retorna los días que faltan para que venza un producto.
 *  Devuelve null si no tiene fecha. */
export function diasParaVencer(fechaVencimiento) {
  if (!fechaVencimiento) return null

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  // Parse YYYY-MM-DD as local time (not UTC) by splitting manually
  const [anio, mes, dia] = fechaVencimiento.split('-').map(Number)
  const vence = new Date(anio, mes - 1, dia)

  return Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24))
}