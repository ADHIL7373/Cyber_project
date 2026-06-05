from flask import Blueprint, jsonify
safe_filereader_bp = Blueprint('safe_filereader', __name__)

@safe_filereader_bp.route('/readfile', methods=['POST'])
def safe_read():
    return jsonify({'output': 'Secure — Coming Day 5'})