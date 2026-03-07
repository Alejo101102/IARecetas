from initFirebase import db
from google.cloud import firestore

def saveRecipe(uid, recipe_data):
    """
    Funcion que ayuda a guardar la receta, se esta usando en la ruta de generación de recetas.
    Se encarga de guardar la receta en el historial del usuario, y si el historial tiene mas de 5 recetas, borra la mas 
    antigua para mantener el limite de 5 recetas en el historial.
    """
    
    history_ref = db.collection('users').document(uid).collection('history')

    new_doc = history_ref.document()
    new_doc.set({
        'id': new_doc.id,
        'recipe': recipe_data,
        'date': firestore.SERVER_TIMESTAMP,
        'is_fav': False
    })

    docs = list(history_ref.order_by("date", direction=firestore.Query.ASCENDING).stream())

    if len(docs) >= 6:
        docs[0].reference.delete()

    return new_doc.id