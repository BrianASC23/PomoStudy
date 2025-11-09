from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = "SECRET_KEY"
    # Allow CORS on all endpoints
    CORS(app, supports_credentials=True, origins="*")

    from views import views
    app.register_blueprint(views)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=8001, debug=True)
