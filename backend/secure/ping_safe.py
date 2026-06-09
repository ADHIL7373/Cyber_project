import subprocess
import re
from flask import Blueprint, request, jsonify

safe_ping_bp = Blueprint('safe_ping', __name__)

IP_PATTERN = re.compile(
    r'^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}'
    r'(25[0-5]|2[0-4]\d|[01]?\d\d?)$'
)

@safe_ping_bp.route('/ping', methods=['POST'])
def safe_ping():
    data = request.get_json()
    host = data.get('host', '') if data else ''

    if not IP_PATTERN.match(host):
        return jsonify({
            'output':  f'[BLOCKED] "{host}" is not a valid IP address.\n'
                       f'Only IPv4 format (x.x.x.x) is accepted.\n'
                       f'Your injection characters were rejected.',
            'blocked': True,
            'fix':     'Regex IP whitelist — rejects all non-IP input'
        }), 400

    try:
        result = subprocess.run(
            ['ping', '-n', '2', host],
            capture_output=True,
            text=True,
            timeout=10,
            shell=False
        )
        return jsonify({
            'output':  result.stdout + result.stderr,
            'blocked': False,
            'fix':     'subprocess list args + regex whitelist'
        })
    except Exception as e:
        return jsonify({
            'output':  f'[ERROR] {str(e)}',
            'blocked': False
        })