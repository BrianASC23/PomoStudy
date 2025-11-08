from flask import Flask
import json
import website.database

with open("config.json","r") as config:
    secret_key = (json.load(config)["secret_key"])

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = secret_key

    from .views import views

if __name__ == '__main__':
    app.run(port=8000)
