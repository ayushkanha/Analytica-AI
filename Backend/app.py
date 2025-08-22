from flask import Flask, jsonify, request
from flask_cors import CORS # Import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

data_set = [
    {'id': 1, 'name': 'Alice', 'score': 85},
    {'id': 2, 'name': 'Bob', 'score': 90},
    {'id': 3, 'name': 'Charlie', 'score': 78}
]

dictionary = {
    'course': 'AI Visualization',
    'instructor': 'Dr. Smith',
    'semester': 'Fall 2025'
}

@app.route('/dataset', methods=['GET'])
def get_dataset():
    return jsonify(data_set)

@app.route('/dictionary', methods=['GET'])
def get_dictionary():
    return jsonify(dictionary)

@app.route('/process', methods=['POST'])
def process_data():
    content = request.get_json()
    print("Received data:", content.get('data'))
    print("Received dictionary:", content.get('dictionary'))
    return jsonify({"status": "success", "received": content}), 200

if __name__ == '__main__':
    app.run(debug=True)