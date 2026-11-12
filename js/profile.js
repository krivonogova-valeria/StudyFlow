import { getState, setState, persist } from './store.js';
import { read, write, remove } from './storage.js';
import { render, showToast, setFieldError } from './ui.js';
import { icon } from './icons.js';
import { escapeHtml, initials, streak } from './utils.js';
import { calcProgress, subjectProgress } from './progress.js';
import { subjectsFrom } from './schedule.js';
import { getTheme, setTheme } from './theme.js';
import { t, getLang, setLang, LANG_NAMES, LANG_LIST } from './i18n.js';

let editing = false;
let langOpen = false;

const THEMES = ['default', 'light-custom', 'dark-custom'];
const THEME_KEYS = {
  default: 'p.themeDefault',
  'light-custom': 'p.themeRose',
  'dark-custom': 'p.themeDark'
};
const NOTIF_KEY = 'studiflow-notifications';

const svg = (paths) =>
  `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  bell: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
  moon: svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
  globe: svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
  logout: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>'),
  chevron: svg('<path d="m9 18 6-6-6-6"/>')
};

function notificationsOn() {
  try {
    return localStorage.getItem(NOTIF_KEY) !== 'off';
  } catch {
    return true;
  }
}

function setNotifications(on) {
  try {
    localStorage.setItem(NOTIF_KEY, on ? 'on' : 'off');
  } catch {}
}

function updateUser(patch) {
  const user = { ...getState().user, ...patch };
  setState({ user });
  persist('user');
  write('users', read('users', []).map((u) => (u.email === user.email ? { ...u, ...patch } : u)));
}

function saveProfile() {
  const name = document.getElementById('pName').value.trim();
  const group = document.getElementById('pGroup').value.trim();
  setFieldError('pName', name ? '' : t('p.enterName'));
  if (!name) return;

  editing = false;
  updateUser({ name, group });
  showToast(t('p.updated'));
}

function resizeImage(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function changePhoto(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast(t('p.photoPick'));
    return;
  }
  try {
    const photo = await resizeImage(file);
    updateUser({ photo });
    showToast(t('p.photoUpdated'));
  } catch {
    showToast(t('p.photoError'));
  }
}

function languageRows() {
  const lang = getLang();
  return LANG_LIST.map(
    (code) => `
      <button type="button" class="set-row" data-act="set-lang" data-lang="${code}" style="padding-left:58px">
        <span class="set-label">${LANG_NAMES[code]}</span>
        ${code === lang ? '<span class="set-value" style="color:var(--primary);font-weight:800">✓</span>' : ''}
      </button>`
  ).join('');
}

export function renderProfile(root) {
  const { user, tasks, schedule, activity } = getState();
  const stats = calcProgress(tasks);
  const days = streak(activity);
  const subjectsCount = subjectsFrom(schedule).length;
  const progress = subjectProgress(tasks);
  const currentTheme = getTheme();

  const achievements = [
    { icon: 'target', title: t('p.a1'), unlocked: stats.done >= 1 },
    { icon: 'streak', title: t('p.a2'), unlocked: days >= 7 },
    { icon: 'done', title: t('p.a3'), unlocked: stats.done >= 10 }
  ];

  const avatarInner = user.photo
    ? `<img src="${user.photo}" alt="">`
    : escapeHtml(initials(user.name));

  const editBlock = editing
    ? `<form id="profileForm" class="card" style="margin-top:14px;text-align:left" novalidate>
        <div class="field">
          <label for="pName">${t('p.fullName')}</label>
          <input class="input" id="pName" value="${escapeHtml(user.name)}">
          <p class="error" data-err="pName"></p>
        </div>
        <div class="field">
          <label for="pGroup">${t('p.group')}</label>
          <input class="input" id="pGroup" value="${escapeHtml(user.group || '')}">
        </div>
        <div class="row2">
          <button type="button" class="btn btn-ghost" data-act="cancel">${t('p.cancel')}</button>
          <button class="btn btn-primary" type="submit">${t('p.save')}</button>
        </div>
      </form>`
    : `<button class="btn btn-ghost btn-sm" style="margin:12px auto 0" data-act="edit">${icon('edit')} ${t('p.edit')}</button>`;

  render(root, `
    <section class="screen with-nav" aria-label="${t('nav.profile')}">
      <div class="profile-head">
        <label class="avatar-upload" for="avatarInput" title="${t('p.changePhoto')}">
          <div class="avatar big">${avatarInner}</div>
          <span class="avatar-edit" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </span>
        </label>
        <input type="file" id="avatarInput" accept="image/*" hidden>
        ${user.photo ? `<button type="button" class="avatar-remove" data-act="remove-photo">${t('p.removePhoto')}</button>` : ''}
        <h1>${escapeHtml(user.name)}</h1>
        ${user.group ? `<p>${t('p.groupOf', { group: escapeHtml(user.group) })}</p>` : `<p>${t('p.noGroup')}</p>`}
        ${editBlock}
      </div>

      <div class="stat3">
        <div class="card">${icon('streak')}<b>${days} ${t('p.days')}</b><span>${t('p.streak')}</span></div>
        <div class="card">${icon('done')}<b>${stats.done}</b><span>${t('p.tasks')}</span></div>
        <div class="card">${icon('cards')}<b>${subjectsCount}</b><span>${t('p.subjects')}</span></div>
      </div>

      <div class="section-h"><h2>${t('p.achievements')}</h2></div>
      <div class="ach">
        ${achievements.map((a) => `
          <div class="${a.unlocked ? '' : 'locked'}">
            <div class="badge">${icon(a.icon)}</div>${a.title}
          </div>`).join('')}
      </div>

      <div class="section-h"><h2>${t('p.bySubject')}</h2></div>
      ${progress.length
        ? `<div class="card subj">${progress.map((p) => `
            <div>
              <div class="progress-row"><span>${escapeHtml(p.subject)}</span><span>${p.percent}%</span></div>
              <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
                   aria-valuenow="${p.percent}" aria-label="${escapeHtml(p.subject)}"><i style="width:${p.percent}%"></i></div>
            </div>`).join('')}</div>`
        : `<div class="empty">${t('p.bySubjectEmpty')}</div>`}

      <div class="section-h" style="margin-top:22px"><h2>${t('p.settings')}</h2></div>
      <div class="card settings">
        <div class="set-row">
          <span class="set-ico">${ICONS.bell}</span>
          <span class="set-label">${t('p.notif')}</span>
          <label class="switch">
            <input type="checkbox" id="notifSwitch" aria-label="${t('p.notif')}"${notificationsOn() ? ' checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        <button type="button" class="set-row" data-act="theme">
          <span class="set-ico">${ICONS.moon}</span>
          <span class="set-label">${t('p.theme')}</span>
          <span class="set-value">${t(THEME_KEYS[currentTheme])}</span>
          <span class="set-chev">${ICONS.chevron}</span>
        </button>
        <button type="button" class="set-row" data-act="lang">
          <span class="set-ico">${ICONS.globe}</span>
          <span class="set-label">${t('p.lang')}</span>
          <span class="set-value">${LANG_NAMES[getLang()]}</span>
          <span class="set-chev">${ICONS.chevron}</span>
        </button>
        ${langOpen ? languageRows() : ''}
        <button type="button" class="set-row danger" data-act="logout">
          <span class="set-ico">${ICONS.logout}</span>
          <span class="set-label">${t('p.logout')}</span>
        </button>
      </div>
    </section>`);

  root.onclick = (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === 'edit') {
      editing = true;
      setState({});
    } else if (act === 'cancel') {
      editing = false;
      setState({});
    } else if (act === 'remove-photo') {
      updateUser({ photo: '' });
      showToast(t('p.photoRemoved'));
    } else if (act === 'theme') {
      const next = THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length];
      setTheme(next);
      setState({});
    } else if (act === 'lang') {
      langOpen = !langOpen;
      setState({});
    } else if (act === 'set-lang') {
      setLang(btn.dataset.lang);
      langOpen = false;
      setState({});
    } else if (act === 'logout') {
      editing = false;
      langOpen = false;
      remove('session');
      setState({ user: null, screen: 'welcome', tab: 'home' });
    }
  };

  root.onchange = (e) => {
    if (e.target.id === 'avatarInput') changePhoto(e.target.files[0]);
    if (e.target.id === 'notifSwitch') {
      setNotifications(e.target.checked);
      showToast(e.target.checked ? t('p.notifOn') : t('p.notifOff'));
    }
  };

  root.onsubmit = (e) => {
    e.preventDefault();
    if (e.target.id === 'profileForm') saveProfile();
  };
}