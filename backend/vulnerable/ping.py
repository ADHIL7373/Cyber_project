import subprocess
from flask import Blueprint, request, jsonify
from siem.logger import AttackLogger

ping_bp = Blueprint('ping', __name__)
logger  = AttackLogger()

@ping_bp.route('/ping', methods=['POST'])
def ping():
    """INTENTIONALLY VULNERABLE — Educational lab only."""
    data      = request.get_json()
    host      = data.get('host', '')
    technique = data.get('technique', 'raw')

    if not host:
        return jsonify({'error': 'No host provided'}), 400

    try:
        output = subprocess.check_output(
            f"ping -n 2 {host}",
            shell=True,
            stderr=subprocess.STDOUT,
            timeout=15,
            cwd="C:\\"
        ).decode('utf-8', errors='replace')
        blocked = False
    except subprocess.CalledProcessError as e:
        output  = e.output.decode('utf-8', errors='replace')
        blocked = False
    except subprocess.TimeoutExpired:
        output  = '[TIMEOUT] Command timed out after 15s'
        blocked = True
    except Exception as e:
        output  = f'[ERROR] {str(e)}'
        blocked = False

    entry = logger.log('ping', host, output, blocked, technique)

    return jsonify({
        'output':    output,
        'log_id':    entry['id'],
        'severity':  entry['severity'],
        'vuln_type': 'OS Command Injection — No Filter'
    })