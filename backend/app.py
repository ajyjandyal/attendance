from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app)

attendance_db = []

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    data = request.json

    record = {
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "type": data['type'],
        "image": data['image']  # base64 image
    }

    attendance_db.append(record)

    return jsonify({"message": f"{data['type']} recorded successfully"})

@app.route('/get_records', methods=['GET'])
def get_records():
    return jsonify(attendance_db)

if __name__ == "__main__":
    app.run(debug=True)
