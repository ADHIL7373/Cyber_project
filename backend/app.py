import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from config import Config
from siem.logger import AttackLogger
from bypass_engine.mutator         import BypassMutator
from bypass_engine.filter_detector import FilterDetector
import json

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")
logger = AttackLogger()

from vulnerable.ping            import ping_bp
from vulnerable.filereader      import filereader_bp
from vulnerable.dns_lookup      import dns_bp
from vulnerable.image_processor import image_bp
from vulnerable.log_viewer      import logviewer_bp
from secure.ping_safe           import safe_ping_bp
from secure.filereader_safe     import safe_filereader_bp
from secure.dns_safe            import safe_dns_bp
from secure.image_safe          import safe_image_bp
from secure.log_safe            import safe_log_bp

app.register_blueprint(ping_bp,            url_prefix='/api/vuln')
app.register_blueprint(filereader_bp,      url_prefix='/api/vuln')
app.register_blueprint(dns_bp,             url_prefix='/api/vuln')
app.register_blueprint(image_bp,           url_prefix='/api/vuln')
app.register_blueprint(logviewer_bp,       url_prefix='/api/vuln')
app.register_blueprint(safe_ping_bp,       url_prefix='/api/safe')
app.register_blueprint(safe_filereader_bp, url_prefix='/api/safe')
app.register_blueprint(safe_dns_bp,        url_prefix='/api/safe')
app.register_blueprint(safe_image_bp,      url_prefix='/api/safe')
app.register_blueprint(safe_log_bp,        url_prefix='/api/safe')

@app.route('/api/health')
def health():
    return jsonify({'status': 'running', 'lab': 'RCE Lab v1.0'})

@app.route('/api/siem/stats')
def siem_stats():
    return jsonify(logger.get_stats())

@app.route('/api/siem/logs')
def siem_logs():
    limit = request.args.get('limit', 50, type=int)
    return jsonify(logger.get_recent(limit))

mutator  = BypassMutator()
detector = FilterDetector()

@app.route('/api/bypass/generate', methods=['POST'])
def generate_bypasses():
    data    = request.get_json()
    payload = data.get('payload', '')
    if not payload:
        return jsonify({'error': 'No payload provided'}), 400
    results = mutator.generate_all(payload)
    return jsonify({'bypasses': results, 'count': len(results)})

@app.route('/api/bypass/detect', methods=['POST'])
def detect_filters():
    data     = request.get_json()
    endpoint = data.get('endpoint', '/api/vuln/ping')
    result   = detector.probe_endpoint(
        'http://localhost:5000', endpoint
    )
    return jsonify(result)

@app.route('/api/payloads')
def get_payloads():
    try:
        payload_path = os.path.join(
            os.path.dirname(os.path.dirname(
                os.path.abspath(__file__)
            )),
            'payloads', 'payloads.json'
        )
        with open(payload_path) as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)