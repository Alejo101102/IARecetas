from flask import Blueprint, request, jsonify
from initFirebase import db
from google.cloud import firestore


inventory_bp = Blueprint('inventory', __name__)


def _normalize_name(value):
    return str(value or "").strip().lower()


def _normalize_category(value):
    return str(value or "").strip().lower()


def _find_duplicate_product(uid, name, category, exclude_product_id=None):
    """
    Busca un producto duplicado por nombre + categoría dentro del inventario del usuario.
    La comparación es case-insensitive y sin espacios extremos.
    """
    target_name = _normalize_name(name)
    target_category = _normalize_category(category)
    docs = db.collection('users').document(uid).collection('inventory').stream()

    for doc in docs:
        item = doc.to_dict() or {}
        item_name = item.get('name', item.get('nombre'))
        item_category = item.get('category', item.get('categoria'))
        if (
            _normalize_name(item_name) == target_name and
            _normalize_category(item_category) == target_category and
            doc.id != exclude_product_id
        ):
            return doc.id
    return None


def _serialize_inventory_item(item):
    """Convierte campos no serializables (ej. datetime de Firestore) a tipos JSON."""
    parsed = dict(item or {})
    updated_at = parsed.get('updated_at')
    if updated_at and hasattr(updated_at, "isoformat"):
        parsed['updated_at'] = updated_at.isoformat()
    return parsed


def updateIngredient(uid, product_id, data):
    """
    Actualiza un ingrediente existente en el inventario de un usuario.
    Lanza ValueError para errores de validación y KeyError si no existe.
    """
    if not uid:
        raise ValueError("UID de usuario es requerido")
    if not product_id:
        raise ValueError("ID del producto es requerido")

    name = data.get('name', data.get('nombre'))
    quantity = data.get('quantity', data.get('cantidad'))

    if not name or quantity is None:
        raise ValueError("Nombre y cantidad son obligatorios")

    try:
        quantity = float(quantity)
    except (TypeError, ValueError):
        raise ValueError("La cantidad debe ser numérica")

    if quantity <= 0:
        raise ValueError("La cantidad debe ser mayor a 0")

    category = data.get('category', data.get('categoria'))
    expiry_date = data.get('expiry_date', data.get('fechaVencimiento'))

    product_ref = db.collection('users').document(uid).collection('inventory').document(product_id)
    if not product_ref.get().exists:
        raise KeyError("Producto no encontrado")

    duplicate_id = _find_duplicate_product(uid, name, category, exclude_product_id=product_id)
    if duplicate_id:
        error = ValueError("Ya existe un producto con el mismo nombre y categoría")
        setattr(error, "existing_product_id", duplicate_id)
        raise error

    product_data = {
        'id': product_id,
        'name': str(name).strip(),
        'quantity': quantity,
        'category': category,
        'expiry_date': expiry_date,
        'updated_at': firestore.SERVER_TIMESTAMP
    }

    product_ref.set(product_data, merge=True)

    # Se vuelve a leer para retornar datos serializables (sin Sentinel).
    updated_snapshot = product_ref.get()
    return _serialize_inventory_item(updated_snapshot.to_dict())


def deleteIngredient(uid, product_id):
    """
    Elimina un ingrediente del inventario de un usuario.
    Lanza ValueError para errores de validación y KeyError si no existe.
    """
    if not uid:
        raise ValueError("UID de usuario es requerido")
    if not product_id:
        raise ValueError("ID del producto es requerido")

    product_ref = db.collection('users').document(uid).collection('inventory').document(product_id)
    if not product_ref.get().exists:
        raise KeyError("Producto no encontrado")

    product_ref.delete()

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
        data = request.get_json(silent=True) or {}
        uid = data.get('uid')
        
        if not uid:
            return jsonify({"error": "UID de usuario es requerido"}), 400

        name = data.get('name', data.get('nombre'))
        quantity = data.get('quantity')
        if quantity is None:
            quantity = data.get('cantidad')
        
        if not name or quantity is None:
            return jsonify({"error": "Nombre y cantidad son obligatorios"}), 400

        product_id = data.get('product_id')
        if product_id:
            return jsonify({
                "error": "Para actualizar un producto debes usar PUT /api/inventory/<product_id>",
                "code": "USE_PUT_FOR_UPDATE",
                "product_id": product_id
            }), 400

        try:
            quantity = float(quantity)
        except (TypeError, ValueError):
            return jsonify({"error": "La cantidad debe ser numérica"}), 400

        if quantity <= 0:
            return jsonify({"error": "La cantidad debe ser mayor a 0"}), 400

        category = data.get('category', data.get('categoria'))
        expiry_date = data.get('expiry_date', data.get('fechaVencimiento'))

        duplicate_id = _find_duplicate_product(uid, name, category)
        if duplicate_id:
            return jsonify({
                "error": "Ya existe un producto con el mismo nombre y categoría",
                "code": "PRODUCT_ALREADY_EXISTS",
                "existing_product_id": duplicate_id
            }), 409

        product_ref = db.collection('users').document(uid).collection('inventory').document()


        product_data = {
            'id': product_ref.id,
            'name': str(name).strip(),
            'quantity': quantity,
            'category': category,
            'expiry_date': expiry_date,
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
    data = request.get_json(silent=True) or {}
    uid = data.get('uid')
    product_id = data.get('product_id')
    
    if not uid or not product_id:
        return jsonify({"error": "Faltan datos"}), 400

    try:
        deleteIngredient(uid, product_id)
    except ValueError as e:
        if hasattr(e, "existing_product_id"):
            return jsonify({
                "error": str(e),
                "code": "PRODUCT_ALREADY_EXISTS",
                "existing_product_id": getattr(e, "existing_product_id")
            }), 409
        return jsonify({"error": str(e)}), 400
    except KeyError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"status": "deleted", "product_id": product_id}), 200


@inventory_bp.route('/<product_id>', methods=['PUT'])
def update_product_by_id(product_id):
    """
    Actualiza un producto existente.
    Ruta: PUT /api/inventory/<product_id>
    Requiere body JSON con:
      - uid (obligatorio)
      - name o nombre (obligatorio)
      - quantity o cantidad (obligatorio)
      - category/categoria (opcional)
      - expiry_date/fechaVencimiento (opcional)
    """
    try:
        data = request.get_json(silent=True) or {}
        uid = data.get('uid')

        updated_product = updateIngredient(uid, product_id, data)
        return jsonify({
            "status": "success",
            "message": "Producto actualizado correctamente",
            "product": updated_product
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except KeyError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@inventory_bp.route('/<product_id>', methods=['DELETE'])
def delete_product_by_id(product_id):
    """
    Elimina un producto existente.
    Ruta: DELETE /api/inventory/<product_id>
    Requiere uid en body JSON o query param.
    """
    try:
        data = request.get_json(silent=True) or {}
        uid = data.get('uid') or request.args.get('uid')
        deleteIngredient(uid, product_id)
        return jsonify({
            "status": "deleted",
            "message": "Producto eliminado correctamente",
            "product_id": product_id
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except KeyError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500