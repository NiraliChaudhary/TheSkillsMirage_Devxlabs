/* ═══════════════════════════════════════════════════════════════════
   Layer 1 Dashboard — Hiring Trends · Skills · AI Risk Index
   ═══════════════════════════════════════════════════════════════════ */

let currentRange = "30d";
let trendChart = null;
let allTrendsData = [];

// ── Tab Switching ──────────────────────────────────────────────────
function switchTab(tab) {
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });

    document.getElementById(`tab-${tab}`).classList.add("active");
    const btn = document.getElementById(`tab-${tab}-btn`);
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    if (tab === "a" && allTrendsData.length === 0) loadHiringTrends();
    if (tab === "b") loadSkills();
    if (tab === "c") loadVulnerability();
}

// ── Range ──────────────────────────────────────────────────────────
function setRange(range, btn) {
    currentRange = range;
    document.querySelectorAll(".range-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadHiringTrends();
}

// ── Filters Init ───────────────────────────────────────────────────
async function loadFilters() {
    try {
        const [citiesRes, sectorsRes] = await Promise.all([API.getCities(), API.getSectors()]);

        const cityFilter = document.getElementById("city-filter");
        const sectorFilter = document.getElementById("sector-filter");
        const vulnCity = document.getElementById("vuln-city-filter");
        const vulnSector = document.getElementById("vuln-sector-filter");
        const workerCity = document.getElementById("worker-city");

        citiesRes.cities.forEach(c => {
            [cityFilter, vulnCity, workerCity].forEach(sel => {
                const o = new Option(c, c);
                sel.appendChild(o);
            });
        });

        sectorsRes.sectors.forEach(s => {
            [sectorFilter, vulnSector].forEach(sel => {
                const o = new Option(s, s);
                sel.appendChild(o);
            });
        });

        workerCity.value = "Pune";
    } catch (e) {
        console.warn("Filters: backend offline?", e);
    }
}

// ── TAB A: Hiring Trends ───────────────────────────────────────────
async function loadHiringTrends() {
    const city = document.getElementById("city-filter").value;
    const sector = document.getElementById("sector-filter").value;
    const btn = document.getElementById("refresh-btn");

    if (btn) { btn.classList.add("spinning"); btn.disabled = true; }

    try {
        const [trendsRes, tsRes] = await Promise.all([
            API.getHiringTrends({ range: currentRange, city, sector }),
            API.getTimeSeries({ range: currentRange, city: city || "Pune", sector: sector || "BPO / Voice" }),
        ]);

        allTrendsData = trendsRes.data;
        renderTrendsTable(allTrendsData.slice(0, 10));
        renderTimeSeries(tsRes);
        renderInsight(allTrendsData);
    } catch (e) {
        setEl("trends-table-wrapper", `<div class="loader">⚠️ Backend offline — start Flask with python app.py</div>`);
    }

    if (btn) { btn.classList.remove("spinning"); btn.disabled = false; }
}

function renderTrendsTable(data) {
    const wrap = document.getElementById("trends-table-wrapper");
    if (!data.length) { wrap.innerHTML = `<div class="loader">No data</div>`; return; }

    const rows = data.map(d => {
        const cls = d.trend_pct >= 0 ? "up" : "down";
        const arrow = d.trend_pct >= 0 ? "↑" : "↓";
        return `<tr>
      <td>${d.city}</td>
      <td>${d.sector}</td>
      <td>${d.job_postings.toLocaleString("en-IN")}</td>
      <td class="${cls}">${arrow} ${Math.abs(d.trend_pct)}%</td>
      <td style="color:var(--text-3);font-size:11px">${d.data_source}</td>
    </tr>`;
    }).join("");

    wrap.innerHTML = `
    <div class="table-scroll">
      <table class="data-table">
        <thead><tr><th>City</th><th>Sector</th><th>Postings</th><th>30d Δ</th><th>Source</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderTimeSeries(data) {
    document.getElementById("timeseries-label").textContent = `${data.city} · ${data.sector} · ${data.range}`;

    const ctx = document.getElementById("trend-chart").getContext("2d");
    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Job postings",
                data: data.values,
                borderColor: "#669bbc",
                backgroundColor: "rgba(102, 155, 188, 0.08)",
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: "#669bbc",
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#09090B",
                    titleColor: "#FFFFFF",
                    bodyColor: "#669bbc",
                    callbacks: { label: c => ` ${c.parsed.y.toLocaleString("en-IN")} postings` }
                }
            },
            scales: {
                x: { grid: { color: "#F3F4F6" }, ticks: { color: "#9CA3AF", font: { size: 11 } } },
                y: { grid: { color: "#F3F4F6" }, ticks: { color: "#9CA3AF", font: { size: 11 } } }
            }
        }
    });
}

function renderInsight(data) {
    const decliners = data.filter(d => d.trend_pct < -20).sort((a, b) => a.trend_pct - b.trend_pct);
    const risers = data.filter(d => d.trend_pct > 30).sort((a, b) => b.trend_pct - a.trend_pct);

    let insight = "";
    if (decliners.length) {
        const d = decliners[0];
        insight = `📉 <strong>${d.sector}</strong> hiring in <strong>${d.city}</strong> fell <strong>${Math.abs(d.trend_pct)}%</strong> over the last ${currentRange} — AI call-handling & automation cited in live JDs.`;
    } else if (risers.length) {
        const r = risers[0];
        insight = `📈 <strong>${r.sector}</strong> in <strong>${r.city}</strong> is up <strong>+${r.trend_pct}%</strong> — fastest-growing category in this window.`;
    } else {
        insight = "ℹ️ Market is relatively stable. Narrow by city or sector to see specific trends.";
    }

    document.getElementById("insight-text").innerHTML = insight;
}

// ── TAB B: Skills ──────────────────────────────────────────────────
async function loadSkills() {
    setEl("rising-skills-list", `<div class="loader">Loading…</div>`);
    setEl("declining-skills-list", `<div class="loader">Loading…</div>`);
    setEl("gap-map-grid", `<div class="loader">Mapping gaps…</div>`);

    try {
        const data = await API.getSkills();
        renderSkillsList("rising-skills-list", data.rising, "rising");
        renderSkillsList("declining-skills-list", data.declining, "declining");
        renderGapMap(data.gap_map);
        document.getElementById("rising-count").textContent = data.rising.length;
        document.getElementById("declining-count").textContent = data.declining.length;
    } catch (e) {
        setEl("rising-skills-list", `<div class="loader">⚠️ Backend offline</div>`);
    }
}

function renderSkillsList(elId, skills, type) {
    const isRising = type === "rising";
    document.getElementById(elId).innerHTML = skills.map(s => {
        const pct = isRising ? `+${s.week_over_week_change}%` : `${s.week_over_week_change}%`;
        const width = `${s.demand_index}%`;
        const govt = s.govt_equivalent ? `<span class="govt-tag">${s.govt_equivalent}</span>` : "";
        return `
      <div class="skill-item ${type}">
        <span class="sk-name">${s.skill}</span>
        <div class="sk-bar-bg"><div class="sk-bar" style="width:${width}"></div></div>
        <span class="sk-pct">${pct}</span>
        ${govt}
      </div>`;
    }).join("");
}

function renderGapMap(gapMap) {
    document.getElementById("gap-map-grid").innerHTML = gapMap.map(g => `
    <div class="gap-cell">
      <div class="gap-prog">
        <span>${g.program}</span>
        <span class="gap-score-badge">Gap ${g.gap_score}/100</span>
      </div>
      <div class="gap-score-bar"><div class="gap-score-fill" style="width:${g.gap_score}%"></div></div>
      <div class="gap-label" style="margin-top:0;">OUTDATED FOCUS</div>
      <div class="gap-tags" style="margin-bottom:12px;">${g.trains_for.map(t => `<span class="gap-tag trains">${t}</span>`).join("")}</div>
      <div class="gap-label">MARKET DEMAND (MISSING)</div>
      <div class="gap-tags">${g.market_needs.map(t => `<span class="gap-tag needs">${t}</span>`).join("")}</div>
    </div>`).join("");
}

// ── TAB C: AI Risk Index ───────────────────────────────────────────
async function loadVulnerability() {
    setEl("heatmap-grid", `<div class="loader">Computing scores…</div>`);
    setEl("vuln-table-wrapper", `<div class="loader">Scoring roles…</div>`);

    const city = document.getElementById("vuln-city-filter").value;
    const sector = document.getElementById("vuln-sector-filter").value;

    try {
        const [hmRes, vulnRes] = await Promise.all([API.getHeatmap(), API.getVulnerability({ city, sector })]);
        renderHeatmap(hmRes.heatmap);
        renderVulnTable(vulnRes.data.slice(0, 20));
    } catch (e) {
        setEl("heatmap-grid", `<div class="loader">⚠️ Backend offline</div>`);
    }
}

function renderHeatmap(heatmap) {
    document.getElementById("heatmap-grid").innerHTML = heatmap.map(h => {
        let bg;
        if (h.avg_score >= 70) bg = "var(--red)";
        else if (h.avg_score >= 45) bg = "var(--orange)";
        else if (h.avg_score >= 25) bg = "var(--amber)";
        else bg = "var(--green)";

        return `<div class="hm-cell" style="background:${bg}"
      title="${h.city} avg: ${h.avg_score} · Highest risk: ${h.highest_risk_sector}">
      <div class="hm-city">${h.city}</div>
      <div class="hm-score">${h.avg_score}</div>
      <div class="hm-sector">${h.highest_risk_sector.split("/")[0].trim()}</div>
    </div>`;
    }).join("");
}

function renderVulnTable(data) {
    const wrap = document.getElementById("vuln-table-wrapper");
    if (!data.length) { wrap.innerHTML = `<div class="loader">No data</div>`; return; }

    const scoreColor = s => s >= 70 ? "var(--red-dk)" : s >= 45 ? "var(--orange-dk)" : s >= 25 ? "var(--amber)" : "var(--green)";
    const trendArrow = t => ({ rising: "↑", falling: "↓", stable: "→" })[t] || "—";
    const trendColor = t => ({ rising: "var(--red-dk)", falling: "var(--green)", stable: "var(--text-3)" })[t];

    const rows = data.map(d => `<tr>
    <td>${d.city}</td>
    <td>${d.sector}</td>
    <td><strong style="color:${scoreColor(d.score)}">${d.score}</strong></td>
    <td style="color:${scoreColor(d.score)};font-size:11px;font-weight:600">${d.risk_label}</td>
    <td style="color:${trendColor(d.trend)}">${trendArrow(d.trend)} ${d.trend}</td>
    <td style="font-size:11px;color:var(--text-3)">${d.signals.hiring_decline_pct.toFixed(1)}% hiring / ${d.signals.ai_tool_mentions_pct.toFixed(0)}% AI JDs</td>
  </tr>`).join("");

    wrap.innerHTML = `
    <table class="data-table">
      <thead><tr><th>City</th><th>Sector</th><th>Score</th><th>Risk</th><th>Trend</th><th>Key signals</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function toggleMethodology() {
    const p = document.getElementById("methodology-panel");
    p.hidden = !p.hidden;
}

// ── Data Sources Table ─────────────────────────────────────────────
async function loadDataSources() {
    try {
        const data = await API.getSources();
        const tbody = document.getElementById("sources-tbody");
        tbody.innerHTML = data.sources.map(s => `
      <tr>
        <td>${s.name}</td>
        <td>${s.contains}</td>
        <td><a class="src-link" href="${s.url}" target="_blank" rel="noopener">${s.url.replace("https://", "")}</a></td>
      </tr>`).join("");
    } catch (e) {
        document.getElementById("sources-tbody").innerHTML = `<tr><td colspan="3" class="loader">⚠️ Backend offline</td></tr>`;
    }
}

// ── Helpers ────────────────────────────────────────────────────────
function setEl(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}
