const THEME_KEY = 'selectedTheme';
const THEMES = ['default', 'light-custom', 'dark-custom'];

export function getTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return THEMES.includes(saved) ? saved : 'default';
  } catch {
    return 'default';
  }
}

export function setTheme(theme) {
  const root = document.documentElement;
  if (theme === 'default') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function initTheme() {
  setTheme(getTheme());
}