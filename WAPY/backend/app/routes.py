from flask import Blueprint

main_routes = Blueprint('main_routes', __name__)

@main_routes.route('/')
def index():
    return "Hello, Flask is running!"