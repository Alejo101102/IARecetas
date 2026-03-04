from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = Path(__file__).resolve().parent
SERVICE_ACCOUNT_FILE = BASE_DIR / "iarecetas-4e7a5-firebase-adminsdk.json"

cred = credentials.Certificate(str(SERVICE_ACCOUNT_FILE))
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

