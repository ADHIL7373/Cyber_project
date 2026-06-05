from flask import Blueprint, request, jsonify
from siem.logger import AttackLogger

filereader_bp = Blueprint("filereader", __name__)
logger = AttackLogger()

@filereader_bp.route("/readfile", methods=["POST"])
def read_file():
    filename = request.json.get("filename", "")

    logger.log(
        endpoint="readfile",
        payload=filename,
        output="File access simulation",
        blocked=False
    )

    return jsonify({
        "endpoint": "readfile",
        "filename": filename,
        "status": "simulated"
    })