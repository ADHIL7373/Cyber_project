from flask import Blueprint, request, jsonify
from siem.logger import AttackLogger

logviewer_bp = Blueprint("logviewer", __name__)
logger = AttackLogger()

@logviewer_bp.route("/viewlog", methods=["POST"])
def view_log():
    lines = request.json.get("lines", 10)

    logger.log(
        endpoint="logviewer",
        payload=str(lines),
        output="Log viewer simulation",
        blocked=False
    )

    return jsonify({
        "endpoint": "logviewer",
        "requested_lines": lines,
        "status": "simulated"
    })