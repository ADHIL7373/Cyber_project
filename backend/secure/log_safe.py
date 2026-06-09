from flask import Blueprint, request, jsonify

safe_log_bp = Blueprint('safe_log', __name__)

@safe_log_bp.route('/viewlog', methods=['POST'])
def safe_log():
    data  = request.get_json()
    lines = data.get('lines', 10) if data else 10

    try:
        lines_int = int(lines)
        lines_int = max(1, min(lines_int, 100))
    except (ValueError, TypeError):
        return jsonify({
            'output':  f'[BLOCKED] "{lines}" is not a valid number.\n'
                       f'Expected integer between 1-100.\n'
                       f'Type casting prevents injection via numeric params.',
            'blocked': True,
            'fix':     'Integer type casting + range validation'
        }), 400

    return jsonify({
        'output':  f'[SAFE] Showing last {lines_int} log entries.\n'
                   f'No shell execution — Python reads file directly.\n'
                   f'Integer cast prevents any string injection.',
        'blocked': False,
        'fix':     'int() cast + range clamp — no shell'
    })