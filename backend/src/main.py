from flask import Flask
from flask_wtf import CSRFProtect
from flask_cors import CORS

csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = "SECRET_KEY"

    csrf.init_app(app)

    # Allow CORS everywhere for development. Restrict origins for production!
    CORS(app, supports_credentials=True, origins="*")

    from backend.src.views import views
    app.register_blueprint(views)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=8001, debug=True)
