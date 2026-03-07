from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
try:
    from initFirebase import db
    firebase_available = db is not None
except ImportError:
    firebase_available = False
import uuid
from helper.addToHistory import saveRecipe

load_dotenv()

# Configuración de la API
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)

recetas_ia_bp = Blueprint('recetas_ia', __name__)

# Ruta para generar receta con Gemini
@recetas_ia_bp.route('/recipes/generate', methods=['POST'])
def generar_receta():
    idGenerado = None
    try:
        # Extraemos los datos del JSON enviado desde el Frontend
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'error': 'No se proporcionaron los datos'}), 400
        
        # Extracción de datos 
        ingredientes = data.get('ingredientes', '')
        objetivo = data.get('objetivo', 'Equilibrado')
        tiempo = data.get('tiempo', '30 min')
        bajo_calorias = data.get('bajo_calorias', False)
        solo_una_olla = data.get('solo_una_olla', False)
        uid = data.get('uid', '')
        
        # Validar
        if not ingredientes:
            return jsonify({'error': 'La despensa está vacía. Por favor, agrega ingredientes'}), 400

        # Construimos el prompt usando los datos enviados
        prompt = f"""
        Actúa como un chef y nutricionista experto. Crea una receta DELICIOSA y práctica basada estrictamente en esta información:
        
        INGREDIENTES DISPONIBLES EN LA DESPENSA:
        {ingredientes}
        
        NOTAS SOBRE INGREDIENTES:
        - Usa principalmente los ingredientes listados
        - Puedes añadir ingredientes básicos: sal, aceite, pimienta, agua, especias comunes
        - NO agregues ingredientes no mencionados sin justificación
        
        OBJETIVO NUTRICIONAL: {objetivo}
        TIEMPO MÁXIMO DE PREPARACIÓN: {tiempo}
        """
        
        # Preferencias adicionales
        if bajo_calorias:
            prompt += "\n- RESTRICCIÓN: La receta debe tener menos de 400 calorías por porción"
        if solo_una_olla:
            prompt += "\n- RESTRICCIÓN: Debe prepararse en una sola olla/sartén para minimizar limpieza"
        else:
            prompt += "\n- La receta puede usar varios utensilios si es necesario"

        # Formato de salida mejorado
        prompt += """ 
        
        INSTRUCCIONES DE RESPUESTA:
        - Responde ÚNICAMENTE con un objeto JSON válido
        - NO agregues textos, explicaciones o bloques de código (```)
        - Calcula valores nutricionales realistas
        
        USA EXACTAMENTE ESTA ESTRUCTURA JSON:
        {
            "titulo": "Nombre atractivo de la receta",
            "descripcion": "Descripción apetitosa breve de 1-2 líneas explicando qué es y por qué es deliciosa",
            "tiempo_estimado": "número en minutos (sin texto)",
            "porciones": "número de porciones",
            "dificultad": "Fácil|Medio|Difícil",
            "calorias": número aproximado,
            "proteina": número en gramos,
            "carbos": número en gramos,
            "grasas": número en gramos,
            "ingredientes": [{"nombre": "ingrediente", "cantidad": "cantidad con unidad"}, ...],
            "instrucciones": ["Paso breve y claro número 1", "Paso 2", ...]
        }
        """

        # Instanciamos el modelo de Gemini
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)

        # Limpiamos la respuesta
        texto_limpio = response.text.replace("```json", "").replace("```", "").strip()
        print(texto_limpio)  # Para depuración, ver qué se recibió exactamente

        try:
            receta_json = json.loads(texto_limpio)
        except json.JSONDecodeError as e:
            # Si no es JSON válido, intenta limpiar más
            texto_limpio = texto_limpio.strip('```').strip()
            receta_json = json.loads(texto_limpio)
        
        # Guardar la receta en Firebase 
        
        if firebase_available and uid:
            idGenerado = saveRecipe(uid, receta_json)  # Guardamos en el historial del usuario, devuelve id de la receta guardada

        # Respondemos el texto generado por la IA
        return jsonify({
            'mensaje': 'Receta generada con éxito',
            'receta': receta_json,
            'receta_id': idGenerado
        }), 200

    except json.JSONDecodeError:
        return jsonify({'error': 'La IA no devolvió un formato JSON válido. Intenta de nuevo.'}), 500
    except Exception as e:
        return jsonify({'error': f'Error al generar la receta: {str(e)}'}), 500
