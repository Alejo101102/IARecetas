from flask import Blueprint, request, jsonify
from initFirebase import db
from google.cloud import firestore

favorites_bp = Blueprint('favorites', __name__)

"""
Ruta para manejar los favoritos de los usuarios. Permite agregar recetas del historial a favoritos y obtener la lista de favoritos.
Ruta: Post /api/favorites/add
Requiere un request body con el UID del usuario y el ID de la receta en el historial que se quiere marcar como favorito.
"""
@favorites_bp.route('/add', methods=['POST'])
def add_to_favorite():
    try:
        data = request.json
        uid = data.get('uid')
        history_id = data.get('history_id')

        if not uid or not history_id:
            return jsonify({"error": "UID e ID de historial son requeridos"}), 400

        # 1. Referencia al documento en el historial
        history_doc_ref = db.collection('users').document(uid).collection('history').document(history_id)
        history_doc = history_doc_ref.get()

        if not history_doc.exists:
            return jsonify({"error": "La receta no existe en el historial"}), 404

        history_data = history_doc.to_dict()

        # 2. Marcar como favorito en el historial
        history_doc_ref.update({"is_fav": True})

        # 3. Crear una copia en la colección de favoritos
        # Usamos el mismo ID o uno nuevo, prefiero uno nuevo para favoritos
        fav_ref = db.collection('users').document(uid).collection('favorites').document()
        
        fav_data = {
            'fav_id': fav_ref.id,
            'original_history_id': history_id,
            'recipe': history_data['recipe'],
            'saved_at': firestore.SERVER_TIMESTAMP
        }
        
        fav_ref.set(fav_data)

        return jsonify({
            "status": "success", 
            "message": "Receta añadida a favoritos",
            "fav_id": fav_ref.id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

"""
Ruta para obtener la lista de favoritos de un usuario.
Ruta: Post /api/favorites/list
Requiere un request body con el UID del usuario para obtener la lista de favoritos asociados a
ese UID.
"""
@favorites_bp.route('/list', methods=['POST'])
def get_favorites():
    data = request.json
    uid = data.get('uid')
    docs = db.collection('users').document(uid).collection('favorites').stream()
    return jsonify([doc.to_dict() for doc in docs]), 200