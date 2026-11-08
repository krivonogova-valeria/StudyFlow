import { read, write } from './storage.js';
import { setState, persist } from './store.js';
import { render, showToast, setFieldError } from './ui.js';
import { icon, renderIcons } from './icons.js';
import { validateLogin, validateRegister } from './validator.js';

async function hashPassword(password) {
  try {
    if (window.crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
  }
  let h = 5381;
  for (const ch of password) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
  return `f${h}`;
}

function startSession(user) {
  setState({ user, screen: 'app', tab: 'home' });
  persist('user');
}

function passwordField(id, label, placeholder = '') {
  const autocomplete = id === 'regPass' ? 'new-password' : 'current-password';
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <div class="input-wrap">
        <input class="input" id="${id}" type="password" autocomplete="${autocomplete}" placeholder="${placeholder}">
        <button type="button" class="eye" data-act="eye" data-target="${id}" aria-label="Показать пароль">${icon('eye')}</button>
      </div>
      <p class="error" data-err="${id}"></p>
    </div>`;
}

function bindCommon(root, onSubmit) {
  root.onclick = (e) => {
    const btn = e.target.closest('[data-act], [data-go]');
    if (!btn) return;
    if (btn.dataset.go) return setState({ screen: btn.dataset.go });

    if (btn.dataset.act === 'eye') {
      const input = document.getElementById(btn.dataset.target);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
      btn.innerHTML = icon(show ? 'eyeOff' : 'eye');
      renderIcons();
    } else if (btn.dataset.act === 'forgot') {
      showToast('Восстановление пароля появится в следующей версии');
    } else if (btn.dataset.act === 'google') {
      showToast('Вход через Google требует сервера — в демо-версии недоступен');
    }
  };
  root.onsubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };
}

export function renderLogin(root) {
  render(root, `
    <section class="screen auth" aria-label="Вход">
      <button class="back" data-go="welcome" aria-label="Назад">${icon('back')}</button>
      <h1>С возвращением!</h1>
      <p class="sub">Рады видеть тебя снова. Продолжим учиться?</p>
      <form id="loginForm" novalidate>
        <div class="field">
          <label for="logEmail">Email</label>
          <input class="input" id="logEmail" type="email" autocomplete="email" placeholder="name@example.kz">
          <p class="error" data-err="logEmail"></p>
        </div>
        ${passwordField('logPass', 'Пароль', '••••••••')}
        <p class="right"><button type="button" class="link" data-act="forgot">Забыли пароль?</button></p>
        <p class="error" data-err="loginForm" style="text-align:center;margin-bottom:8px"></p>
        <button class="btn btn-primary" type="submit">Войти</button>
      </form>
      <div class="divider">или</div>
      <button class="btn btn-ghost" data-act="google"><b style="color:#4285f4">G</b> Продолжить с Google</button>
      <p class="foot">Ещё нет аккаунта? <button class="link" data-go="register">Зарегистрироваться</button></p>
    </section>`);

  bindCommon(root, async () => {
    const email = document.getElementById('logEmail').value.trim().toLowerCase();
    const password = document.getElementById('logPass').value;

    const { ok, errors } = validateLogin({ email, password });
    setFieldError('logEmail', errors.email);
    setFieldError('logPass', errors.password);
    setFieldError('loginForm', '');
    if (!ok) return;

    const user = read('users', []).find((u) => u.email === email);
    const hash = await hashPassword(password);
    if (!user || user.pass !== hash) {
      setFieldError('loginForm', 'Неверный email или пароль');
      return;
    }
    startSession({ name: user.name, group: user.group, email: user.email });
  });
}

export function renderRegister(root) {
  render(root, `
    <section class="screen auth" aria-label="Регистрация">
      <button class="back" data-go="welcome" aria-label="Назад">${icon('back')}</button>
      <h1>Создать аккаунт</h1>
      <p class="sub">Это займёт меньше минуты.</p>
      <form id="registerForm" novalidate>
        <div class="field">
          <label for="regName">Имя и фамилия</label>
          <input class="input" id="regName" autocomplete="name" placeholder="Алия Смагулова">
          <p class="error" data-err="regName"></p>
        </div>
        <div class="field">
          <label for="regGroup">Группа</label>
          <input class="input" id="regGroup" placeholder="ИТ-21-2">
        </div>
        <div class="field">
          <label for="regEmail">Email</label>
          <input class="input" id="regEmail" type="email" autocomplete="email" placeholder="name@example.kz">
          <p class="error" data-err="regEmail"></p>
        </div>
        ${passwordField('regPass', 'Пароль (минимум 6 символов)')}
        <button class="btn btn-primary" type="submit">Зарегистрироваться</button>
      </form>
      <p class="foot">Уже есть аккаунт? <button class="link" data-go="login">Войти</button></p>
    </section>`);

  bindCommon(root, async () => {
    const name = document.getElementById('regName').value.trim();
    const group = document.getElementById('regGroup').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPass').value;

    const { ok, errors } = validateRegister({ name, email, password });
    setFieldError('regName', errors.name);
    setFieldError('regEmail', errors.email);
    setFieldError('regPass', errors.password);
    if (!ok) return;

    const users = read('users', []);
    if (users.some((u) => u.email === email)) {
      setFieldError('regEmail', 'Аккаунт с таким email уже существует');
      return;
    }
    users.push({ name, group, email, pass: await hashPassword(password) });
    write('users', users);
    startSession({ name, group, email });
  });
}