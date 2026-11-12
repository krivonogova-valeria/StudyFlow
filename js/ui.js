import { renderIcons } from './icons.js';

export function render(root, html) {
  root.innerHTML = html;
  renderIcons();
}

let toastTimer;

export function showToast(message) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

export function setFieldError(fieldId, message = '') {
  const err = document.querySelector(`[data-err="${fieldId}"]`);
  if (err) err.textContent = message;
  const input = document.getElementById(fieldId);
  if (!input) return;
  input.classList.toggle('invalid', Boolean(message));
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

export function setTheme(themeName) {
  if (themeName === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }
  localStorage.setItem('selectedTheme', themeName);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  setTheme(savedTheme);
});