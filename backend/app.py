from flask import Flask
from flask_cors import CORS
from routes.hiring_trends import hiring_trends_bp
from routes.skills_intelligence import skills_intelligence_bp
from routes.ai_vulnerability import ai_vulnerability_bp
from routes.worker_engine import worker_engine_bp
from routes.chatbot import chatbot_bp
from routes.meta import meta_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(hiring_trends_bp, url_prefix="/api/hiring-trends")
app.register_blueprint(skills_intelligence_bp, url_prefix="/api/skills")
app.register_blueprint(ai_vulnerability_bp, url_prefix="/api/vulnerability")
app.register_blueprint(worker_engine_bp, url_prefix="/api/worker")
app.register_blueprint(chatbot_bp, url_prefix="/api/chat")
app.register_blueprint(meta_bp, url_prefix="/api/meta")

@app.route("/api/health")
def health():
    return {"status": "ok", "system": "TheSkillsMirage"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)

