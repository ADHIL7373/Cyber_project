from flask import Blueprint, request, jsonify
from siem.logger import AttackLogger

ping_bp = Blueprint("ping", __name__)
logger = AttackLogger()

@ping_bp.route("/ping", methods=["POST"])
def ping():
    host = request.json.get("host", "")

    logger.log(
        endpoint="ping",
        payload=host,
        output="Ping simulation completed",
        blocked=False
    )

    return jsonify({
        "endpoint": "ping",
        "input": host,
        "status": "simulated"
    })