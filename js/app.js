// js/app.js
(() => {
  // ----------------------------
  // Hamburger (works everywhere)
  // ----------------------------
  function initHamburger() {
    const hamburger = document.querySelector(".hamburger");
    const navBar = document.querySelector(".nav-bar");
    if (!hamburger || !navBar) return;

    const toggle = () => navBar.classList.toggle("active");
    hamburger.addEventListener("click", toggle);

    // keyboard accessibility
    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    // close menu when clicking a nav link (mobile)
    navBar.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => navBar.classList.remove("active"));
    });
  }

  // -----------------------------------
  // Translations (works on every page)
  // -----------------------------------
  async function loadTranslations(lang) {
    // Always load English first as a fallback, then override with user language if available.
    const fallbacks = ["en", lang].filter(Boolean);

    let merged = {};
    for (const code of fallbacks) {
      try {
        const res = await fetch(getTranslationPath(code), { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        merged = { ...merged, ...data };
      } catch (e) {
        // ignore missing language file
      }
    }
    applyTranslations(merged);
  }

  function applyTranslations(translations) {
    document.querySelectorAll("[data-translate]").forEach((el) => {
      const key = el.getAttribute("data-translate");
      if (!key) return;
      if (translations[key] == null) return;

      // Use innerHTML so your existing translations can include <strong>, <br>, etc.
      el.innerHTML = translations[key];
    });
  }

  // This makes translations folder work from BOTH:
  // - /index.html
  // - /pages/anything.html
  // If page path includes "/pages/", go up one folder.
  function getTranslationPath(lang) {
    const inPagesFolder = window.location.pathname.includes("/pages/");
    return inPagesFolder
      ? `../translations/${lang}.json`
      : `translations/${lang}.json`;
  }

  function detectLanguage() {
    return (navigator.language || "en").split("-")[0];
  }

  // -----------------------------------
  // Smooth scroll for hash links
  // (optional, but nice everywhere)
  // -----------------------------------
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // -----------------------------------
  // Init
  // -----------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initHamburger();
    initSmoothScroll();

    const lang = detectLanguage();
    loadTranslations(lang);
  });
})();
