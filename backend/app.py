import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from config import Config
from siem.logger import AttackLogger

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=Config.CORS_ORIGINS)
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

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)