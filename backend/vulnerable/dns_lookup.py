from flask import Blueprint, request, jsonify
from siem.logger import AttackLogger

dns_bp = Blueprint("dns", __name__)
logger = AttackLogger()

@dns_bp.route("/dns", methods=["POST"])
def dns_lookup():
    domain = request.json.get("domain", "")

    logger.log(
        endpoint="dns",
        payload=domain,
        output="DNS lookup simulation",
        blocked=False
    )

    return jsonify({
        "endpoint": "dns",
        "domain": domain,
        "status": "simulated"
    })