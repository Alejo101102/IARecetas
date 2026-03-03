from flask import Blueprint, request, jsonify
from initFirebase import db

history_bp = Blueprint('history', __name__)

# definir una logica para limitar a 5 recetas en el historial
def solo5():
    return "Solo 5 recetas en el historial, no se pueden agregar más"

@history_bp.route('/', methods=['POST'])
def get_history():
    data = request.json
    uid = data.get('uid')
    # la logica de historial va aqui, pero por ahora solo devuelve un mensaje
    return jsonify({"msg": "EL HISTORIAL MANITO"}), 201