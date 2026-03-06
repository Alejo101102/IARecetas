from flask import Blueprint, request, jsonify
from google import genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Configuración de la API
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

recetas_ia_bp = Blueprint('recetas_ia', __name__)

# Ruta para generar receta con Gemini
@recetas_ia_bp.route('/recipes/generate', methods=['POST'])
def generar_receta():
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
        
        # Validar
        if not ingredientes:
            return jsonify({'error': 'La despensa está vacía. Por favor, agrega ingredientes'}), 400

        # Construimos el prompt usando los datos enviados
        prompt = f"""
        Actúa como un chef y nutricionista experto. Crea una receta deliciosa y práctica basandose estrictamente en esta información:
        Ingredientes dispinibles en la despensa: {ingredientes}.
        (Usa principalmente estos. Puedes añadir ingredientes básicos como sal, aceite, pimienta, etc. si son necesarios)
        Objetivo principal: {objetivo}.
        Tiempo máximo de preparación: {tiempo}.
        """
        # Preferencias adicionales
        if bajo_calorias:
            prompt += "\n La receta debe ser baja en calorías."
        if solo_una_olla:
            prompt += "\n La receta debe ser preparada en una sola olla."

        # Formato de salida
        prompt += """ 
        IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido. No agregues textos ni antes ni después, ni uses bloques de código (```json ... ```).
        Usa EXACTAMENTE esta estructura JSON:
        {
            "titulo": "Nombre de la receta",
            "descripcion": "Breve descripción apatitosa de la receta",
            "tiempo_estimado: "Tiempo en minutos",
            "porciones": "Cantidad de porciones que rinde la receta",
            "dificultad": "Fácil, Medio o Difícil",
            "calorias_estimadas": "Cantidad aproximada de calorías",
            "ingredientes": ["Ingrediente 1", "Ingrediente 2", ...],
            "instrucciones": ["Paso 1", "Paso 2", ...],
        }
        """

        # Instanciamos el modelo de Gemini
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        # Limpiamos la respuesta
        texto_limpio = response.text.replace("```json", "").replace("```", "").strip()
        
        receta_json = json.loads(texto_limpio)

        
        # Respondemos el texto generado por la IA
        return jsonify({
            'mensaje': 'Receta generada con éxito',
            'receta': receta_json
        }), 200

    except json.JSONDecodeError:
        return jsonify({'error': 'La IA no devolvió un formato JSON válido. Intenta de nuevo.'}), 500
    except Exception as e:
        return jsonify({'error': f'Error al generar la receta: {str(e)}'}), 500