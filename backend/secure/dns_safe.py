import subprocess
import re
from flask import Blueprint, request, jsonify

safe_dns_bp = Blueprint('safe_dns', __name__)

DOMAIN_PATTERN = re.compile(
    r'^[a-zA-Z0-9][a-zA-Z0-9\-\.]{1,253}$'
)

@safe_dns_bp.route('/nslookup', methods=['POST'])
def safe_dns():
    data   = request.get_json()
    domain = data.get('domain', '') if data else ''

    if not DOMAIN_PATTERN.match(domain):
        return jsonify({
            'output':  f'[BLOCKED] "{domain}" contains invalid characters.\n'
                       f'Only letters, numbers, hyphens and dots allowed.\n'
                       f'Injection characters: ; & | $ ` ( ) are all rejected.',
            'blocked': True,
            'fix':     'Domain whitelist regex — blocks all injection chars'
        }), 400

    try:
        result = subprocess.run(
            ['nslookup', domain],
            capture_output=True,
            text=True,
            timeout=10,
            shell=False
        )
        return jsonify({
            'output':  result.stdout,
            'blocked': False,
            'fix':     'Whitelist regex + subprocess list args'
        })
    except Exception as e:
        return jsonify({
            'output':  f'[ERROR] {str(e)}',
            'blocked': False
        })