import os
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = Path(__file__).resolve().parent
SERVICE_ACCOUNT_FILE = BASE_DIR / "iarecetas-4e7a5-firebase-adminsdk.json"

db = None
skip_firebase_init = os.getenv("SKIP_FIREBASE_INIT", "0") == "1"

if not skip_firebase_init:
    if not SERVICE_ACCOUNT_FILE.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo de credenciales: {SERVICE_ACCOUNT_FILE}"
        )

    cred = credentials.Certificate(str(SERVICE_ACCOUNT_FILE))
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()

