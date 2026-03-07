from flask import Blueprint, request, jsonify
from initFirebase import db
from google.cloud import firestore

history_bp = Blueprint('history', __name__)

"""Ruta para obtener el historial de recetas generadas por un usuario.
Ruta: Post /api/history/
Requiere un request body con el UID del usuario para obtener el historial asociado a ese UID
"""
@history_bp.route('/', methods=['POST'])
def get_history():
    data = request.json
    uid = data.get('uid')
    if not uid:
        return jsonify({"error": "UID requerido"}), 400
    
    docs = db.collection('users').document(uid).collection('history').order_by("date", direction=firestore.Query.DESCENDING).stream()
    
    history_list = [doc.to_dict() for doc in docs]
    return jsonify(history_list), 200