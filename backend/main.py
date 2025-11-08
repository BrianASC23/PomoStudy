from flask import Flask
import json
from flask_wtf import CSRFProtect

csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = "SECRET_KEY"

    csrf.init_app(app)

    from views import views

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=8000, debug=True)
