import os
import json

db = None
skip_firebase_init = os.getenv("SKIP_FIREBASE_INIT", "0") == "1"

if not skip_firebase_init:
    try:
        import firebase_admin
    except ImportError:
        print("Firebase no disponible")
        pass  # no hacer nada, db ya es None

    try:
        from firebase_admin import credentials, firestore
        from pathlib import Path

        # En cloud (Vercel/Render) se recomienda pasar el JSON completo como variable.
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

        if service_account_json:
            cred = credentials.Certificate(json.loads(service_account_json))
        else:
            BASE_DIR = Path(__file__).resolve().parent
            SERVICE_ACCOUNT_FILE = BASE_DIR / "iarecetas-4e7a5-firebase-adminsdk.json"

            if not SERVICE_ACCOUNT_FILE.exists():
                raise FileNotFoundError(
                    f"No se encontró el archivo de credenciales: {SERVICE_ACCOUNT_FILE}"
                )

            cred = credentials.Certificate(str(SERVICE_ACCOUNT_FILE))

        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
    except Exception as e:
        print(f"Error inicializando Firebase: {e}")
        db = None

