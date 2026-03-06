from flask import Blueprint, jsonify
from data.job_market_data import fetch_skills_intelligence

skills_intelligence_bp = Blueprint("skills_intelligence", __name__)

@skills_intelligence_bp.route("/", methods=["GET"])
def get_skills():
    data = fetch_skills_intelligence()
    return jsonify(data)
