from flask import Blueprint, jsonify
safe_image_bp = Blueprint('safe_image', __name__)

@safe_image_bp.route('/process-image', methods=['POST'])
def safe_image():
    return jsonify({'output': 'Secure — Coming Day 5'})