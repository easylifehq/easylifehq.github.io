// js/theme.js

const THEME_KEY = "easylist-theme";
const DEFAULT_THEME = "classic";

export function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "candy" || saved === "classic" ? saved : DEFAULT_THEME;
}

export function applyTheme(theme) {
  const nextTheme = theme === "candy" ? "candy" : "classic";

  document.body.classList.remove("theme-classic", "theme-candy");
  document.body.classList.add(`theme-${nextTheme}`);

  localStorage.setItem(THEME_KEY, nextTheme);
  syncThemeControls(nextTheme);
}

export function initializeTheme() {
  applyTheme(getSavedTheme());
}

export function toggleTheme() {
  const current = getSavedTheme();
  const next = current === "classic" ? "candy" : "classic";
  applyTheme(next);
}

export function syncThemeControls(theme) {
  const toggleButtons = document.querySelectorAll("[data-theme-toggle]");
  const themeLabels = document.querySelectorAll("[data-theme-label]");
  const themeSelects = document.querySelectorAll("[data-theme-select]");

  toggleButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", theme === "candy" ? "true" : "false");
    btn.dataset.activeTheme = theme;
  });

  themeLabels.forEach((label) => {
    label.textContent = theme === "candy" ? "Candy Mode" : "Classic Mode";
  });

  const themeHints = document.querySelectorAll("[data-theme-hint]");
  themeHints.forEach((hint) => {
    hint.textContent = theme === "candy" ? "Classic Mode" : "Candy Mode";
  });

  themeSelects.forEach((select) => {
    select.value = theme;
  });
}

export function wireThemeControls() {
  const toggleButtons = document.querySelectorAll("[data-theme-toggle]");
  const themeSelects = document.querySelectorAll("[data-theme-select]");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
  });

  themeSelects.forEach((select) => {
    select.addEventListener("change", (event) => {
      applyTheme(event.target.value);
    });
  });
}