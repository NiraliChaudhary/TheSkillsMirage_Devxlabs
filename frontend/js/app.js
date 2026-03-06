/* ═══════════════════════════════════════════════════════════════════
   App Bootstrap
   ═══════════════════════════════════════════════════════════════════ */

// ── Theme Toggle ──────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem("sm-theme");
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";

  if (isDark) {
    html.removeAttribute("data-theme");
    localStorage.setItem("sm-theme", "light");
  } else {
    html.setAttribute("data-theme", "dark");
    localStorage.setItem("sm-theme", "dark");
  }
}

// Apply theme BEFORE DOM renders to avoid flash of wrong theme
initTheme();

document.addEventListener("DOMContentLoaded", async () => {
  // Load filters + initial data in parallel
  await loadFilters();
  await loadHiringTrends();

  // Active nav on scroll
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => l.classList.remove("active-nav"));
        const a = document.querySelector(`.nav-link[href="#${id}"]`);
        if (a) a.classList.add("active-nav");
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));

  // Auto-refresh Layer 1 every 5 minutes during demo
  setInterval(() => {
    if (document.getElementById("tab-a").classList.contains("active")) {
      loadHiringTrends();
    }
  }, 5 * 60 * 1000);
});
