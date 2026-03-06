from flask import Blueprint, request, jsonify
from data.job_market_data import fetch_hiring_trends, fetch_time_series, CITIES, SECTORS

hiring_trends_bp = Blueprint("hiring_trends", __name__)

@hiring_trends_bp.route("/", methods=["GET"])
def get_trends():
    time_range = request.args.get("range", "30d")
    city       = request.args.get("city", None)
    sector     = request.args.get("sector", None)
    data       = fetch_hiring_trends(time_range, city, sector)
    return jsonify({"data": data, "time_range": time_range})

@hiring_trends_bp.route("/cities", methods=["GET"])
def get_cities():
    return jsonify({"cities": CITIES})

@hiring_trends_bp.route("/sectors", methods=["GET"])
def get_sectors():
    return jsonify({"sectors": SECTORS})

@hiring_trends_bp.route("/timeseries", methods=["GET"])
def get_timeseries():
    city    = request.args.get("city", "Pune")
    sector  = request.args.get("sector", "BPO / Voice")
    rng     = request.args.get("range", "30d")
    data    = fetch_time_series(rng, city, sector)
    return jsonify(data)
