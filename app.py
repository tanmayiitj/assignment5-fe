from flask import Flask, request, jsonify, render_template
from flask_restful import Api, Resource
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS  # Import CORS
import json
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
api = Api(app)

# Apply CORS to the app
CORS(app)

DATA_FILE = 'data.json'

# Load data from JSON file
def load_data():
    with open(DATA_FILE, 'r') as file:
        return json.load(file)

# Save data to JSON file
def save_data(data):
    with open(DATA_FILE, 'w') as file:
        json.dump(data, file, indent=4)

class ProductList(Resource):
    def get(self):
        data = load_data()
        return data['Products'], 200

    def post(self):
        new_product = request.get_json()
        data = load_data()
        new_product['id'] = max((p['id'] for p in data['Products']), default=0) + 1
        data['Products'].append(new_product)
        save_data(data)
        return new_product, 201

class Product(Resource):
    def get(self, product_id):
        data = load_data()
        product = next((p for p in data['Products'] if p['id'] == product_id), None)
        if product:
            return product, 200
        return {'message': 'Product not found'}, 404

    def put(self, product_id):
        data = load_data()
        product = next((p for p in data['Products'] if p['id'] == product_id), None)
        if product:
            updated_product = request.get_json()
            product.update(updated_product)
            save_data(data)
            return product, 200
        return {'message': 'Product not found'}, 404

    def delete(self, product_id):
        data = load_data()
        product = next((p for p in data['Products'] if p['id'] == product_id), None)
        if product:
            data['Products'].remove(product)
            save_data(data)
            return {'message': 'Product deleted'}, 200
        return {'message': 'Product not found'}, 404

api.add_resource(ProductList, '/products')
api.add_resource(Product, '/products/<int:product_id>')

# Serve the front-end
@app.route('/')
def index():
    return render_template('index.html')

# Swagger UI setup
SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Flask Product API"
    }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

if __name__ == '__main__':
    app.run(debug=True)
