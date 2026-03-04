from flask import Flask, jsonify
from routes.inventory import inventory_bp
from routes.history import history_bp
from routes.favorites import favorites_bp

app = Flask(__name__)

@app.route("/")
def home():
    return {"message": "Backend funcionando 🚀"}


@app.route("/api/openapi.json")
def openapi_spec():
    spec = {
        "openapi": "3.0.3",
        "info": {
            "title": "IARecetas Backend API",
            "version": "1.0.0",
            "description": "Documentacion OpenAPI para los endpoints del backend."
        },
        "servers": [
            {"url": "http://127.0.0.1:5000"},
            {"url": "http://localhost:5000"}
        ],
        "paths": {
            "/": {
                "get": {
                    "summary": "Health check del backend",
                    "responses": {
                        "200": {"description": "Backend activo"}
                    }
                }
            },
            "/api/inventory/add": {
                "post": {
                    "summary": "Crear producto en inventario",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/InventoryCreateRequest"}
                            }
                        }
                    },
                    "responses": {
                        "201": {"description": "Producto creado"},
                        "400": {"description": "Datos invalidos"},
                        "409": {"description": "Producto duplicado"}
                    }
                }
            },
            "/api/inventory/list": {
                "post": {
                    "summary": "Listar inventario por usuario",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/UidRequest"}
                            }
                        }
                    },
                    "responses": {
                        "200": {"description": "Lista de productos"},
                        "400": {"description": "UID faltante"}
                    }
                }
            },
            "/api/inventory/{product_id}": {
                "put": {
                    "summary": "Actualizar producto por ID",
                    "parameters": [
                        {
                            "name": "product_id",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"}
                        }
                    ],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/InventoryUpdateRequest"}
                            }
                        }
                    },
                    "responses": {
                        "200": {"description": "Producto actualizado"},
                        "400": {"description": "Datos invalidos"},
                        "404": {"description": "Producto no encontrado"},
                        "409": {"description": "Producto duplicado"}
                    }
                },
                "delete": {
                    "summary": "Eliminar producto por ID",
                    "parameters": [
                        {
                            "name": "product_id",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"}
                        },
                        {
                            "name": "uid",
                            "in": "query",
                            "required": False,
                            "schema": {"type": "string"},
                            "description": "UID opcional por query. Tambien puede enviarse en body JSON."
                        }
                    ],
                    "requestBody": {
                        "required": False,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/UidRequest"}
                            }
                        }
                    },
                    "responses": {
                        "200": {"description": "Producto eliminado"},
                        "400": {"description": "Datos invalidos"},
                        "404": {"description": "Producto no encontrado"}
                    }
                }
            },
            "/api/inventory/delete": {
                "delete": {
                    "summary": "Eliminar producto (endpoint legado)",
                    "deprecated": True,
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/InventoryDeleteLegacyRequest"}
                            }
                        }
                    },
                    "responses": {
                        "200": {"description": "Producto eliminado"},
                        "400": {"description": "Datos invalidos"},
                        "404": {"description": "Producto no encontrado"}
                    }
                }
            },
            "/api/history/": {
                "post": {
                    "summary": "Historial (placeholder)",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/UidRequest"}
                            }
                        }
                    },
                    "responses": {
                        "201": {"description": "Respuesta de placeholder"}
                    }
                }
            },
            "/api/favorites/add": {
                "post": {
                    "summary": "Agregar favorito (placeholder)",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/UidRequest"}
                            }
                        }
                    },
                    "responses": {
                        "201": {"description": "Respuesta de placeholder"}
                    }
                }
            },
            "/api/favorites/": {
                "get": {
                    "summary": "Listar favoritos (placeholder)",
                    "responses": {
                        "201": {"description": "Respuesta de placeholder"}
                    }
                }
            }
        },
        "components": {
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "Firebase ID Token. Ejemplo: Bearer eyJhbGciOi..."
                }
            },
            "schemas": {
                "UidRequest": {
                    "type": "object",
                    "required": ["uid"],
                    "properties": {
                        "uid": {"type": "string", "example": "TU_UID"}
                    }
                },
                "InventoryCreateRequest": {
                    "type": "object",
                    "required": ["uid", "name", "quantity"],
                    "properties": {
                        "uid": {"type": "string", "example": "TU_UID"},
                        "name": {"type": "string", "example": "Harina"},
                        "quantity": {"type": "number", "example": 2},
                        "category": {"type": "string", "example": "Harinas"},
                        "expiry_date": {"type": "string", "example": "2026-03-20"}
                    }
                },
                "InventoryUpdateRequest": {
                    "type": "object",
                    "required": ["uid", "name", "quantity"],
                    "properties": {
                        "uid": {"type": "string", "example": "TU_UID"},
                        "name": {"type": "string", "example": "Harina Integral"},
                        "quantity": {"type": "number", "example": 5},
                        "category": {"type": "string", "example": "Harinas"},
                        "expiry_date": {"type": "string", "example": "2026-04-15"}
                    }
                },
                "InventoryDeleteLegacyRequest": {
                    "type": "object",
                    "required": ["uid", "product_id"],
                    "properties": {
                        "uid": {"type": "string", "example": "TU_UID"},
                        "product_id": {"type": "string", "example": "abc123"}
                    }
                }
            }
        }
    }
    return jsonify(spec)


@app.route("/docs")
@app.route("/api/docs")
def swagger_ui():
    html = """
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>IARecetas API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
      #swagger-ui { max-width: 1200px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "/api/openapi.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis],
          persistAuthorization: true
        });
      };
    </script>
  </body>
</html>
"""
    return html, 200, {"Content-Type": "text/html; charset=utf-8"}

app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
app.register_blueprint(history_bp, url_prefix='/api/history')
app.register_blueprint(favorites_bp, url_prefix='/api/favorites')

if __name__ == "__main__":
    app.run(debug=True)