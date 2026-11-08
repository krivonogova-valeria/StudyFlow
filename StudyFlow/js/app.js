import { getState, setState, subscribe } from './store.js';
import { remove } from './storage.js';
import { render } from './ui.js';
import { icon, renderIcons } from './icons.js';
import { renderOnboarding, renderWelcome } from './onboarding.js';
import { renderLogin, renderRegister } from './auth.js';
import { renderHome, renderTasks } from './home.js';

const root = document.getElementById('root');

const TABS = [
  { id: 'home', icon: 'home', label: 'Главная' },
  { id: 'schedule', icon: 'schedule', label: 'Расписание' },
  { id: 'tasks', icon: 'tasks', label: 'Задачи' },
  { id: 'cards', icon: 'cards', label: 'Карточки' },
  { id: 'profile', icon: 'profile', label: 'Профиль' }
];

function renderPlaceholder(title) {
  const logout =
    title === 'Профиль'
      ? '<button class="btn btn-ghost" style="margin-top:20px" data-act="logout">Выйти</button>'
      : '';
  render(root, `
    <section class="screen with-nav" aria-label="${title}">
      <header class="top"><h1>${title}</h1></header>
      <div class="empty">Этот раздел появится на следующем шаге.</div>
      ${logout}
    </section>`);

  root.onclick = (e) => {
    if (!e.target.closest('[data-act="logout"]')) return;
    remove('session');
    setState({ user: null, screen: 'welcome' });
  };
}

function appendNav(tab) {
  const items = TABS.map(
    (t) => `
    <button data-tab="${t.id}"${t.id === tab ? ' aria-current="page"' : ''}>${icon(t.icon)}<span>${t.label}</span></button>`
  ).join('');
  root.insertAdjacentHTML('beforeend', `<nav class="nav" aria-label="Основное меню">${items}</nav>`);
  root.querySelector('.nav').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    setState({ tab: btn.dataset.tab });
    window.scrollTo(0, 0);
  });
  renderIcons();
}

function draw() {
  const { screen, tab } = getState();

  if (screen === 'onboarding') return renderOnboarding(root);
  if (screen === 'welcome') return renderWelcome(root);
  if (screen === 'login') return renderLogin(root);
  if (screen === 'register') return renderRegister(root);

  if (tab === 'home') renderHome(root);
  else if (tab === 'tasks') renderTasks(root);
  else renderPlaceholder(TABS.find((t) => t.id === tab).label);
  appendNav(tab);
}

subscribe(draw);
draw();