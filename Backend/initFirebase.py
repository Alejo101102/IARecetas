import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("Backend/iarecetas-4e7a5-firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

