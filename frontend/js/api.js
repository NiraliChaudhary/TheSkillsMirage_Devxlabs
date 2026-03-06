/* ── TheSkillsMirage API Client ──────────────────────────────── */
const API_BASE = "http://localhost:5000/api";

async function apiFetch(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(`[API] ${endpoint} failed:`, err);
        throw err;
    }
}

const API = {
    getCities: () => apiFetch("/hiring-trends/cities"),
    getSectors: () => apiFetch("/hiring-trends/sectors"),
    getHiringTrends: (p = {}) => apiFetch(`/hiring-trends/?${new URLSearchParams(p)}`),
    getTimeSeries: (p = {}) => apiFetch(`/hiring-trends/timeseries?${new URLSearchParams(p)}`),
    getSkills: () => apiFetch("/skills/"),
    getVulnerability: (p = {}) => apiFetch(`/vulnerability/?${new URLSearchParams(p)}`),
    getHeatmap: () => apiFetch("/vulnerability/heatmap"),
    analyzeWorker: (body) => apiFetch("/worker/analyze", { method: "POST", body: JSON.stringify(body) }),
    chat: (body) => apiFetch("/chat/", { method: "POST", body: JSON.stringify(body) }),
    getSources: () => apiFetch("/meta/sources"),
};

