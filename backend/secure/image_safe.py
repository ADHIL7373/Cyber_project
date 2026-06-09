import re
from flask import Blueprint, request, jsonify

safe_image_bp = Blueprint('safe_image', __name__)

IMAGE_PATTERN = re.compile(
    r'^[a-zA-Z0-9_\-]+\.(png|jpg|jpeg|gif|webp)$',
    re.IGNORECASE
)

@safe_image_bp.route('/process-image', methods=['POST'])
def safe_image():
    data     = request.get_json()
    filename = data.get('filename', '') if data else ''

    if not IMAGE_PATTERN.match(filename):
        return jsonify({
            'output':  f'[BLOCKED] "{filename}" is not a valid image filename.\n'
                       f'Only .png .jpg .jpeg .gif .webp allowed.\n'
                       f'No shell execution — filename never reaches OS.',
            'blocked': True,
            'fix':     'Extension whitelist + no shell execution'
        }), 400

    return jsonify({
        'output':  f'[SAFE] Image "{filename}" processed securely.\n'
                   f'No shell commands were executed.\n'
                   f'File processed using Python library directly.',
        'blocked': False,
        'fix':     'Whitelist validation — zero shell involvement'
    })