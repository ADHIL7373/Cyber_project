from flask import Blueprint, request, jsonify
from siem.logger import AttackLogger

image_bp = Blueprint("image", __name__)
logger = AttackLogger()

@image_bp.route("/process-image", methods=["POST"])
def process_image():
    filename = request.json.get("filename", "")

    logger.log(
        endpoint="image",
        payload=filename,
        output="Image processing simulation",
        blocked=False
    )

    return jsonify({
        "endpoint": "image",
        "filename": filename,
        "status": "processing simulated"
    })