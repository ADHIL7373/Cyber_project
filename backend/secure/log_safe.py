from flask import Blueprint, jsonify
safe_log_bp = Blueprint('safe_log', __name__)

@safe_log_bp.route('/viewlog', methods=['POST'])
def safe_log():
    return jsonify({'output': 'Secure — Coming Day 5'})