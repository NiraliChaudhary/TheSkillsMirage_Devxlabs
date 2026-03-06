from flask import Blueprint, jsonify
from data.job_market_data import DATA_SOURCES

meta_bp = Blueprint("meta", __name__)

@meta_bp.route("/sources", methods=["GET"])
def get_sources():
    return jsonify({"sources": DATA_SOURCES})
