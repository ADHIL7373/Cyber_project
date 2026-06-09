import subprocess
from flask import Blueprint, request, jsonify
from siem.logger import AttackLogger

dns_bp = Blueprint('dns', __name__)
logger = AttackLogger()

# WEAK blacklist — only blocks the most obvious patterns
# Easily bypassed with | or newline %0a or backtick
BLACKLIST = [';', '&&', '||']

@dns_bp.route('/nslookup', methods=['POST'])
def dns_lookup():
    """
    INTENTIONALLY VULNERABLE — Weak blacklist filter
    CVE Reference: CVE-2019-11510 pattern
    
    Filter bypass techniques that WORK:
    - google.com | whoami        (pipe not in blacklist)
    - google.com %0a whoami      (newline not blocked)
    - google.com `whoami`        (backtick not blocked)
    - google.com & whoami        (single & not blocked)
    """
    data      = request.get_json()
    domain    = data.get('domain', '') if data else ''
    technique = data.get('technique', 'raw')

    if not domain:
        return jsonify({'error': 'No domain provided'}), 400

    # WEAK FILTER — only blocks ; && ||
    # Single | pipe is NOT blocked
    # Newline %0a is NOT blocked
    # Backtick ` is NOT blocked
    # Single & is NOT blocked
    for char in BLACKLIST:
        if char in domain:
            entry = logger.log(
                'dns', domain, '', True, technique
            )
            return jsonify({
                'output':      f'[BLOCKED] Character "{char}" is not allowed.\n'
                               f'Blacklist blocks: {BLACKLIST}\n'
                               f'But try: | or %0a or & — not in blacklist!',
                'blocked':     True,
                'severity':    'Blocked',
                'filter_info': f'Blacklist: {BLACKLIST}',
                'bypass_hint': 'Try: | or newline %0a or backtick — not blocked!'
            })

    # Still vulnerable — executes with shell=True
    try:
        result = subprocess.run(
            f"nslookup {domain}",
            shell=True,
            capture_output=True,
            text=True,
            timeout=10
        )
        output  = result.stdout + result.stderr
        blocked = False

    except subprocess.TimeoutExpired:
        output  = '[TIMEOUT] Command timed out'
        blocked = True
    except Exception as e:
        output  = f'[ERROR] {str(e)}'
        blocked = False

    entry = logger.log(
        'dns', domain, output, blocked, technique
    )

    return jsonify({
        'output':      output or '[No output returned]',
        'log_id':      entry['id'],
        'severity':    entry['severity'],
        'vuln_type':   'Blacklist Filter Bypass',
        'filter_info': f'Blacklist only blocks: {BLACKLIST}',
        'bypass_hint': 'Pipe | and newline %0a and backtick are NOT blocked'
    })