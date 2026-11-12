import { getState, setState, subscribe } from './store.js';
import { render } from './ui.js';
import { icon, renderIcons } from './icons.js';
import { renderOnboarding, renderWelcome } from './onboarding.js';
import { renderLogin, renderRegister } from './auth.js';
import { renderHome, renderTasks } from './home.js';
import { renderSchedule } from './schedule.js';
import { renderCards } from './cards.js';
import { renderNotes, isEditingNote } from './notes.js';
import { renderProfile } from './profile.js';
import { initTheme } from './theme.js';
import { initLang, t } from './i18n.js';

const root = document.getElementById('root');

const TABS = [
  { id: 'home', icon: 'home', key: 'nav.home' },
  { id: 'schedule', icon: 'schedule', key: 'nav.schedule' },
  { id: 'tasks', icon: 'tasks', key: 'nav.tasks' },
  { id: 'cards', icon: 'cards', key: 'nav.cards' },
  { id: 'profile', icon: 'profile', key: 'nav.profile' }
];

function renderPlaceholder(title) {
  render(root, `
    <section class="screen with-nav" aria-label="${title}">
      <header class="top"><h1>${title}</h1></header>
      <div class="empty">${t('common.soon')}</div>
    </section>`);
  root.onclick = null;
}

function appendNav(tab) {
  const items = TABS.map(
    (tabItem) => `
    <button data-tab="${tabItem.id}"${tabItem.id === tab ? ' aria-current="page"' : ''}>${icon(tabItem.icon)}<span>${t(tabItem.key)}</span></button>`
  ).join('');
  root.insertAdjacentHTML('beforeend', `<nav class="nav" aria-label="Menu">${items}</nav>`);
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
  else if (tab === 'schedule') renderSchedule(root);
  else if (tab === 'tasks') renderTasks(root);
  else if (tab === 'cards') renderCards(root);
  else if (tab === 'notes') renderNotes(root);
  else if (tab === 'profile') renderProfile(root);
  else renderPlaceholder(t(TABS.find((x) => x.id === tab).key));

  if (tab === 'notes' && isEditingNote()) return;
  appendNav(tab === 'notes' ? 'home' : tab);
}

initTheme();
initLang();
subscribe(draw);
draw();