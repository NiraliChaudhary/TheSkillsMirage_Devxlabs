"""
TheSkillsMirage AI Chatbot — Groq (Llama 3.3 70B)
================================================
Uses Groq for lightning-fast natural-language conversation,
grounded in the worker's EXACT computed data + live Layer 1 market signals.

"""

import os
import json
from flask import Blueprint, request, jsonify
from data.job_market_data import fetch_hiring_trends, CITIES
from datetime import datetime

# LLM Clients
from groq import Groq

chatbot_bp = Blueprint("chatbot", __name__)

# ── API Keys ──────────────────────────────────────────────────────
GROQ_API_KEY   = os.environ.get("GROQ_API_KEY", "")


# ── Helpers ────────────────────────────────────────────────────────
def _normalize(text: str) -> str:
    return text.lower().strip()

def _detect_hindi(text: str) -> bool:
    markers = ["मुझे", "कहाँ", "कहां", "क्या", "कैसे", "करना", "शुरू",
               "बताओ", "दिखाओ", "मेरा", "रिस्क", "नौकरी", "महीने", "सीखना",
               "स्कोर", "कोर्स", "जॉब", "पहला"]
    return any(m in text for m in markers)

# ── System prompt builder ──────────────────────────────────────────
def _build_system_prompt(worker: dict, risk: dict, path: dict, l1: dict) -> str:
    title    = worker.get("title", "Unknown")
    city     = worker.get("city", "India")
    exp      = worker.get("years_exp", 0)
    writeup  = worker.get("writeup", "")

    score       = risk.get("score", "—")
    risk_label  = risk.get("risk_label", "")
    sector      = risk.get("sector", "")
    signals     = risk.get("signals", {})
    pos_skills  = risk.get("extracted_skills_positive", [])
    risk_skills = risk.get("extracted_skills_at_risk", [])
    aspiration  = risk.get("has_aspiration_signal", False)
    delta_30d   = risk.get("score_delta_30d", 0)
    peer_pct    = risk.get("peer_percentile", 50)
    methodology = risk.get("methodology", "")

    hiring_decline   = signals.get("hiring_decline_pct", 0)
    ai_tool_pct      = signals.get("ai_tool_mentions_pct", 0)
    replacement_ratio= signals.get("role_replacement_ratio", 0)

    target_role  = path.get("target_role", "")
    openings     = path.get("target_role_city_openings", "—")
    timeline_wks = path.get("timeline_weeks", 8)
    hrs_per_wk   = path.get("weekly_hours", 8)
    weeks        = path.get("weeks", [])
    weeks_str    = "\n".join([
        f"  • {w.get('week_range')}: {w.get('course')} — {w.get('provider')} ({w.get('cost')})"
        for w in weeks
    ])

    l1_trend   = l1.get("latest_trend") or l1.get("timeseries") or {}
    l1_postings= l1_trend.get("job_postings") or (l1_trend.get("values") or [None])[-1]
    l1_change  = l1_trend.get("trend_pct", hiring_decline)
    l1_source  = l1_trend.get("data_source", "Naukri + LinkedIn India")

    postings_str = f"{int(l1_postings):,}" if l1_postings else "data not available"

    return f"""You are the SkillsMirage AI Assistant — a bilingual (English + Hindi) workforce intelligence assistant for India.

Ground your answers in these EXACT facts. Avoid generic advice.

User Profile: {title} in {city} | Experience: {exp} years
Analysis:
- Risk Score: {score}/100 ({risk_label})
- Score Delta (30d): {delta_30d} points
- Market signal: {hiring_decline:+.1f}% hiring change in {sector} ({city})
- AI context: {ai_tool_pct:.0f}% JDs mention AI tools | {replacement_ratio*100:.0f}% task automation risk
- My skills detected: positive({', '.join(pos_skills)}), at-risk({', '.join(risk_skills)})

Reskilling Plan:
- Target: {target_role} ({openings} openings in {city})
- Next steps: {timeline_wks} weeks, {hrs_per_wk} hrs/wk.
Courses:
{weeks_str}

Rules:
1. Stay concise (max 150 words).
2. ALWAYS respond in English by default.
3. Only respond in Hindi (Devanagari script) if the user's message is written in Hindi.
4. Cite specific numbers from the profile above.
"""

# ── Rule-based fallback ──────────────────────────────────────────
def _rule_based_response(message: str, worker: dict, risk: dict, path: dict, l1: dict) -> str:
    msg      = message.lower()
    is_hindi = _detect_hindi(message)
    score    = risk.get("score", "—")
    target   = path.get("target_role", "a safer role")
    if is_hindi:
        return f"नमस्ते। आपका AI रिस्क स्कोर **{score}/100** है। हम आपको **{target}** में जाने की सलाह देते हैं।"
    return f"Hello. Your AI Risk Score is **{score}/100**. We recommend transitioning to a **{target}** role."

# ── Route ──────────────────────────────────────────────────────────
@chatbot_bp.route("/", methods=["POST"])
def chat():
    body    = request.get_json(force=True)
    message = body.get("message", "").strip()
    if not message: return jsonify({"error": "No message"}), 400

    worker  = body.get("worker_profile", {})
    risk    = body.get("cached_risk", {})
    path    = body.get("cached_path", {})
    l1      = body.get("l1_snapshot", {})
    history = body.get("history", [])

    system_prompt = _build_system_prompt(worker, risk, path, l1)

    # ── Try GROQ first ───────────────────────────────────────
    if GROQ_API_KEY:
        try:
            client = Groq(api_key=GROQ_API_KEY)
            messages = [{"role": "system", "content": system_prompt}]
            for h in history[-4:]:
                role = "user" if h["role"] == "user" else "assistant"
                messages.append({"role": role, "content": h["content"]})
            messages.append({"role": "user", "content": message})

            chat_completion = client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                temperature=0.5,
                max_tokens=500
            )
            response_text = chat_completion.choices[0].message.content.strip()

            return jsonify({
                "response": response_text,
                "model": "groq/llama-3.3-70b",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
        except Exception as e:
            print(f"[Groq Error] {e}")

    # ── Fallback to Rule-based ─────────────────────────────────
    return jsonify({
        "response": _rule_based_response(message, worker, risk, path, l1),
        "model": "rule-based",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })
