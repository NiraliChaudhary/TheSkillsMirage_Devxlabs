/* ═══════════════════════════════════════════════════════════════════
   Layer 2 — Bilingual AI Chatbot (EN + HI)

   Context sent on EVERY message:
     • worker_profile   — raw inputs (title, city, years_exp, writeup)
     • cached_risk      — the EXACT risk object from analyzeWorker()
     • cached_path      — the EXACT reskilling path from analyzeWorker()
     • l1_snapshot      — live hiring trend for the worker's city+sector
       (fetched once at init time and re-fetched on each send for freshness)
   ═══════════════════════════════════════════════════════════════════ */

let chatHistory = [];
let chatWorkerProfile = {};
let chatCachedRisk = {};   // exact risk object the user saw
let chatCachedPath = {};   // exact path the user saw
let chatL1Snapshot = {};   // hiring trend for worker's city+sector

// Called by worker.js after analyzeWorker() succeeds
async function initChatbot(workerProfile, riskData, pathData) {
    chatWorkerProfile = workerProfile;
    chatCachedRisk = riskData;
    chatCachedPath = pathData;
    chatHistory = [];

    // Fetch live L1 snapshot for this worker's city + sector right now
    try {
        const sector = riskData.sector || "";
        const city = workerProfile.city || "";
        const [tsRes, vuln] = await Promise.all([
            API.getTimeSeries({ range: "30d", city, sector }),
            API.getVulnerability({ city, sector }),
        ]);
        chatL1Snapshot = {
            timeseries: tsRes,
            top_vulnerability: vuln.data ? vuln.data[0] : {},
            city,
            sector,
        };
    } catch (e) {
        chatL1Snapshot = {};
    }

    // Render greeting with the actual score the user saw
    const score = riskData.score ?? "—";
    const riskLabel = riskData.risk_label ?? "";
    const targetRole = pathData.target_role ?? "a safer role";
    const openings = pathData.target_role_city_openings ?? "—";
    const city = workerProfile.city;

    const win = document.getElementById("chat-window");
    win.innerHTML = `
    <div class="bot-msg">
      I've analysed your profile as a <strong>${workerProfile.title}</strong> in <strong>${city}</strong>.<br/><br/>
      Your AI Risk Score is <strong>${score}/100 — ${riskLabel}</strong>.<br/>
      Your reskilling path targets <strong>${targetRole}</strong> (${openings} openings in ${city} right now).<br/><br/>
      Ask me anything in <strong>English</strong> or <strong>Hindi</strong>.
    </div>`;
}

async function sendChat() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;

    appendMsg(message, "user");
    input.value = "";

    const typingId = appendTyping();

    try {
        chatHistory.push({ role: "user", content: message });

        // Re-fetch a fresh L1 snapshot for the worker's city+sector on each turn
        // so "how many jobs in my city" always returns the current hourly figure
        try {
            const city = chatWorkerProfile.city || "";
            const sector = chatCachedRisk.sector || "";
            const trends = await API.getHiringTrends({ range: "30d", city, sector });
            if (trends.data && trends.data.length > 0) {
                chatL1Snapshot.latest_trend = trends.data[0];
            }
        } catch (_) { /* network hiccup — continue with cached */ }

        const res = await API.chat({
            message,
            worker_profile: chatWorkerProfile,
            cached_risk: chatCachedRisk,     // ← exact score + signals user saw
            cached_path: chatCachedPath,     // ← exact weeks + target role user saw
            l1_snapshot: chatL1Snapshot,     // ← fresh Layer 1 data
            history: chatHistory.slice(-6),
        });

        removeTyping(typingId);
        chatHistory.push({ role: "assistant", content: res.response });
        appendMsg(res.response, "bot");
    } catch (e) {
        removeTyping(typingId);
        appendMsg("⚠️ Backend offline. Start Flask: cd backend && python app.py", "bot");
    }
}

function quickAsk(q) {
    document.getElementById("chat-input").value = q;
    sendChat();
}

// ── Rendering helpers ──────────────────────────────────────────────
function appendMsg(text, role) {
    const win = document.getElementById("chat-window");
    const div = document.createElement("div");
    div.className = role === "bot" ? "bot-msg" : "user-msg";
    div.innerHTML = text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br/>");
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
}

function appendTyping() {
    const win = document.getElementById("chat-window");
    const div = document.createElement("div");
    const id = "typing-" + Date.now();
    div.id = id;
    div.className = "bot-msg loader";
    div.style.padding = "8px 12px";
    div.textContent = "Thinking…";
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
    return id;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
