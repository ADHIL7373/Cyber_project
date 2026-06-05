from flask import Blueprint, jsonify
safe_ping_bp = Blueprint('safe_ping', __name__)

@safe_ping_bp.route('/ping', methods=['POST'])
def safe_ping():
    return jsonify({'output': 'Secure — Coming Day 5'})