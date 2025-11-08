from flask import Flask
import json

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = "SECRET_KEY"

    from views import views
    app.register_blueprint(views, url_prefix="")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=8000, debug=True)
