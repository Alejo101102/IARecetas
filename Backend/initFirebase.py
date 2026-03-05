# Backend/initFirebase.py
import os
from firebase_admin import credentials, initialize_app, firestore

base_dir = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(base_dir, "iarecetas-4e7a5-firebase-adminsdk.json")

cred = credentials.Certificate(key_path)
default_app = initialize_app(cred)
db = firestore.client()

