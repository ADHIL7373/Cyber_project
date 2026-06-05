from flask import Blueprint, jsonify
safe_dns_bp = Blueprint('safe_dns', __name__)

@safe_dns_bp.route('/nslookup', methods=['POST'])
def safe_dns():
    return jsonify({'output': 'Secure — Coming Day 5'})