from flask import Blueprint, request, jsonify
from initFirebase import db

favorites_bp = Blueprint('favorites', __name__)

@favorites_bp.route('/add', methods=['POST'])
def add_item():
    data = request.json
    uid = data.get('uid')
    return jsonify({"msg": "receta añadida"}), 201

@favorites_bp.route('/', methods=['GET'])
def get_favorites():
    data = request.json
    uid = data.get('uid')
    return jsonify({"msg": "Productos favoritos manito"}), 201

