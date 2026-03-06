/* ═══════════════════════════════════════════════════════════════════
   Layer 2 — Worker Intelligence Engine
   ═══════════════════════════════════════════════════════════════════ */

let currentWorkerProfile = {};

// ── Word Count ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const ta = document.getElementById("worker-writeup");
    const counter = document.getElementById("word-count");
    if (!ta) return;
    ta.addEventListener("input", () => {
        const n = ta.value.trim().split(/\s+/).filter(Boolean).length;
        counter.textContent = `${n} / 200`;
        counter.style.color = n < 80 ? "var(--red)" : n <= 200 ? "var(--green)" : "var(--amber)";
    });
});

// ── Submit ─────────────────────────────────────────────────────────
async function analyzeWorker() {
    const title = document.getElementById("worker-title").value.trim();
    const city = document.getElementById("worker-city").value.trim();
    const yearsExp = parseInt(document.getElementById("worker-exp").value) || 3;
    const writeup = document.getElementById("worker-writeup").value.trim();

    if (!title || !city || !writeup) {
        alert("Please fill in Job Title, City, and Write-up (required for accurate analysis).");
        return;
    }

    const btn = document.getElementById("analyze-btn");
    btn.disabled = true;
    btn.textContent = "Analysing…";

    try {
        const data = await API.analyzeWorker({ title, city, years_exp: yearsExp, writeup });
        currentWorkerProfile = { title, city, years_exp: yearsExp, writeup };
        renderRiskScore(data.risk);
        renderReskillingPath(data.reskilling_path);
        showResults();
        // Pass the EXACT risk + path objects so the chatbot discusses the same data
        initChatbot(currentWorkerProfile, data.risk, data.reskilling_path);
    } catch (e) {
        alert("Backend offline. Start Flask: cd backend && python app.py");
    }

    btn.disabled = false;
    btn.textContent = "Analyse →";
}

function showResults() {
    const sec = document.getElementById("results-section");
    sec.style.display = "block";
    sec.style.opacity = "0";
    requestAnimationFrame(() => {
        sec.style.transition = "opacity .4s";
        sec.style.opacity = "1";
    });
    setTimeout(() => sec.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
}

// ── Risk Score ─────────────────────────────────────────────────────
function renderRiskScore(risk) {
    const scoreEl = document.getElementById("score-number");
    const labelEl = document.getElementById("risk-label-display");
    const signalEl = document.getElementById("score-signals");
    const deltaEl = document.getElementById("score-delta");
    const peerEl = document.getElementById("peer-info");

    // Count-up animation
    let cur = 0;
    const target = risk.score;
    const timer = setInterval(() => {
        cur = Math.min(cur + Math.ceil(target / 35), target);
        scoreEl.textContent = cur;
        if (cur >= target) clearInterval(timer);
    }, 28);

    const color =
        target >= 70 ? "var(--red)" :
            target >= 45 ? "var(--orange)" :
                target >= 25 ? "var(--amber)" : "var(--green)";

    scoreEl.style.color = color;
    labelEl.style.color = color;
    labelEl.textContent = risk.risk_label;

    const s = risk.signals;
    signalEl.innerHTML = [
        `<div class="sig-row"><span class="sig-label">Hiring change:</span> <strong>${s.hiring_decline_pct.toFixed(1)}%</strong> in 30d (Naukri + LinkedIn)</div>`,
        `<div class="sig-row"><span class="sig-label">AI in JDs:</span> <strong>${s.ai_tool_mentions_pct.toFixed(0)}%</strong> of postings mention AI tools</div>`,
        `<div class="sig-row"><span class="sig-label">WEF automation:</span> <strong>${(s.role_replacement_ratio * 100).toFixed(0)}%</strong> role replacement forecast</div>`,
        risk.extracted_skills_positive.length
            ? `<div class="sig-row"><span class="sig-label">↑ skills found:</span> ${risk.extracted_skills_positive.slice(0, 3).join(", ")}</div>` : "",
        risk.extracted_skills_at_risk.length
            ? `<div class="sig-row"><span class="sig-label">↓ at-risk skills:</span> ${risk.extracted_skills_at_risk.slice(0, 3).join(", ")}</div>` : "",
    ].filter(Boolean).join("");

    const d = risk.score_delta_30d;
    deltaEl.textContent = `${d >= 0 ? "↑" : "↓"} ${Math.abs(d)} vs 30 days ago`;
    deltaEl.style.color = d >= 0 ? "var(--red)" : "var(--green)";

    peerEl.textContent = `Top ${risk.peer_percentile}% at-risk in ${risk.sector}`;
}

// ── Reskilling Path ────────────────────────────────────────────────
function renderReskillingPath(path) {
    document.getElementById("target-role").innerHTML =
        `→ ${path.target_role}` +
        (path.l1_verified ? ` <span style="font-size:11px;font-weight:400;color:var(--text-3)">(${path.target_role_city_openings} openings in ${path.city} · L1 verified)</span>` : "");

    document.getElementById("path-weeks-list").innerHTML = path.weeks.map(w => `
    <div class="week-row">
      <span class="wk-badge">${w.week_range}</span>
      <div class="wk-body">
        <div class="wk-course">${w.course}</div>
        <div class="wk-provider">${w.provider} · <span class="wk-free">${w.cost}</span></div>
      </div>
    </div>`).join("");

    document.getElementById("path-verification").textContent =
        `${path.timeline_weeks} weeks · ~${path.weekly_hours} hrs/wk · All resources free`;
}
