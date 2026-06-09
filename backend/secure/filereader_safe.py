import os
import re
from flask import Blueprint, request, jsonify

safe_filereader_bp = Blueprint('safe_filereader', __name__)

SAFE_DIR = os.path.realpath(
    os.path.join(os.path.dirname(__file__), '..', 'logs')
)

@safe_filereader_bp.route('/readfile', methods=['POST'])
def safe_read():
    data     = request.get_json()
    filename = data.get('filename', '') if data else ''

    if not re.match(r'^[a-zA-Z0-9_\-\.]+$', filename):
        return jsonify({
            'output':  f'[BLOCKED] "{filename}" contains invalid characters.\n'
                       f'Only alphanumeric, underscore, dash, dot allowed.\n'
                       f'Path traversal (../) and injection chars blocked.',
            'blocked': True,
            'fix':     'Alphanumeric filename whitelist'
        }), 400

    full_path = os.path.realpath(
        os.path.join(SAFE_DIR, filename)
    )

    if not full_path.startswith(SAFE_DIR):
        return jsonify({
            'output':  f'[BLOCKED] Path traversal detected!\n'
                       f'Resolved path: {full_path}\n'
                       f'Allowed directory: {SAFE_DIR}\n'
                       f'os.path.realpath() caught the traversal.',
            'blocked': True,
            'fix':     'os.path.realpath() directory jail'
        }), 403

    try:
        with open(full_path) as f:
            content = f.read()
        return jsonify({
            'output':  content,
            'blocked': False,
            'fix':     'Direct Python read — no shell'
        })
    except FileNotFoundError:
        return jsonify({
            'output':  f'[INFO] File not found: {filename}\n'
                       f'But the path was valid and safe.',
            'blocked': False,
            'fix':     'Direct Python read — no shell'
        })
    except Exception as e:
        return jsonify({
            'output':  f'[ERROR] {str(e)}',
            'blocked': False
        })