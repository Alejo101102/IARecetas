from flask import Blueprint, request, jsonify
from initFirebase import db
from google.cloud import firestore


inventory_bp = Blueprint('inventory', __name__)

"""
Permite agregar o actualizar productos en el inventario de un usuario.
Ruta: POST /api/inventory/add
Requiere un request con los siguientes campos:
    - uid: ID del usuario (obligatorio)
    - name: Nombre del producto (obligatorio)
    - quantity: Cantidad del producto (obligatorio)
    - category: Categoría del producto (opcional)
    - expiry_date: Fecha de vencimiento del producto (opcional)
    - product_id: ID del producto (opcional, para actualizaciones)
Si se incluye un product_id, se actualizará el producto existente. Si no, se creará uno nuevo.
"""
@inventory_bp.route('/add', methods=['POST'])
def add_or_update_product():
    try:
        data = request.json
        uid = data.get('uid')
        
        if not uid:
            return jsonify({"error": "UID de usuario es requerido"}), 400

        name = data.get('name')
        quantity = data.get('quantity')
        
        if not name or not quantity:
            return jsonify({"error": "Nombre y cantidad son obligatorios"}), 400

        # se supone que el front envia el id del producto si es una actualización, si no, se crea uno nuevo
        product_id = data.get('product_id')
        if product_id:
            product_ref = db.collection('users').document(uid).collection('inventory').document(product_id)
        else:
            product_ref = db.collection('users').document(uid).collection('inventory').document()


        product_data = {
            'id': product_ref.id,
            'name': name,
            'quantity': quantity,
            'category': data.get('category', None), # Opcional
            'expiry_date': data.get('expiry_date', None), # Opcional
            'updated_at': firestore.SERVER_TIMESTAMP
        }

        product_ref.set(product_data, merge=True)

        return jsonify({
            "status": "success",
            "message": "Producto guardado correctamente",
            "product_id": product_ref.id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


"""
Permite obtener todo el inventario de un usuario específico.
Ruta: POST /api/inventory/list
Requiere un request con el siguiente campo:
    - uid: ID del usuario (obligatorio)
Devuelve una lista de productos.
"""
@inventory_bp.route('/list', methods=['POST'])
def get_inventory():
    try:
        data = request.json
        uid = data.get('uid')

        if not uid:
            return jsonify({"error": "UID de usuario es requerido"}), 400

        inventory_ref = db.collection('users').document(uid).collection('inventory')
        
        docs = inventory_ref.stream()

        inventory_list = []
        for doc in docs:
            item = doc.to_dict()
            if 'updated_at' in item and item['updated_at']:
                item['updated_at'] = item['updated_at'].isoformat()
            inventory_list.append(item)

        return jsonify({
            "uid": uid,
            "inventory": inventory_list,
            "total_items": len(inventory_list)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Ruta: DELETE /api/inventory/delete
"""
Permite eliminar un producto específico del inventario de un usuario.
Ruta: DELETE /api/inventory/delete
Requiere un JSON con los siguientes campos:
    - uid: ID del usuario (obligatorio)
    - product_id: ID del producto a eliminar (obligatorio)

"""
@inventory_bp.route('/delete', methods=['DELETE'])
def delete_product():
    data = request.json
    uid = data.get('uid')
    product_id = data.get('product_id')
    
    if not uid or not product_id:
        return jsonify({"error": "Faltan datos"}), 400
        
    db.collection('users').document(uid).collection('inventory').document(product_id).delete()
    return jsonify({"status": "deleted"}), 200