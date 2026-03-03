from flask import Flask
from routes.inventory import inventory_bp
from routes.history import history_bp
from routes.favorites import favorites_bp

app = Flask(__name__)

@app.route("/")
def home():
    return {"message": "Backend funcionando 🚀"}

app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
app.register_blueprint(history_bp, url_prefix='/api/history')
app.register_blueprint(favorites_bp, url_prefix='/api/favorites')

if __name__ == "__main__":
    app.run(debug=True)