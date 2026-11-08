import { getState, setState } from './store.js';
import { write } from './storage.js';
import { render } from './ui.js';

const wrap = (inner) =>
  `<svg viewBox="0 0 240 200" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="95" r="80" fill="#e9eaff"/><ellipse cx="120" cy="178" rx="62" ry="7" fill="#dfe1fa"/>${inner}</svg>`;

const ART = {
  study: wrap(`
    <rect x="46" y="40" width="58" height="36" rx="10" fill="#2fa37a"/><path d="M60 76l-4 14 20-14z" fill="#2fa37a"/>
    <rect x="56" y="50" width="32" height="5" rx="2.5" fill="#fff"/><rect x="56" y="61" width="22" height="5" rx="2.5" fill="#fff"/>
    <circle cx="52" cy="112" r="20" fill="#f0900f"/><text x="52" y="118" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" font-family="sans-serif">A+</text>
    <path d="M96 172c0-34 12-52 36-52s36 18 36 52z" fill="#5b5bf0"/>
    <circle cx="128" cy="84" r="25" fill="#f6c9a0"/><path d="M103 80c2-22 46-26 52 0-8-8-30-12-52 0z" fill="#3d3a8c"/>
    <circle cx="119" cy="86" r="2.4" fill="#2b2b45"/><circle cx="137" cy="86" r="2.4" fill="#2b2b45"/>
    <path d="M120 95q8 6 16 0" stroke="#2b2b45" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <rect x="150" y="82" width="38" height="62" rx="8" transform="rotate(8 169 113)" fill="#fff" stroke="#3b6fe0" stroke-width="4"/>
    <rect x="158" y="94" width="22" height="5" rx="2.5" fill="#b9b6f2" transform="rotate(8 169 113)"/>
    <circle cx="168" cy="132" r="6" fill="#2fa37a"/>
    <path d="M190 54l5 10 10 5-10 5-5 10-5-10-10-5 10-5z" fill="#f0b90f"/>`),
  calendar: wrap(`
    <rect x="62" y="56" width="116" height="94" rx="16" fill="#fff" stroke="#e1e3f7" stroke-width="2"/>
    <path d="M62 72a16 16 0 0116-16h84a16 16 0 0116 16v14H62z" fill="#6c6cf2"/>
    <rect x="88" y="44" width="7" height="22" rx="3.5" fill="#4b49c8"/><rect x="146" y="44" width="7" height="22" rx="3.5" fill="#4b49c8"/>
    <g fill="#e4e6f2"><rect x="76" y="98" width="14" height="14" rx="4"/><rect x="100" y="98" width="14" height="14" rx="4"/><rect x="148" y="98" width="14" height="14" rx="4"/>
    <rect x="76" y="120" width="14" height="14" rx="4"/><rect x="100" y="120" width="14" height="14" rx="4"/><rect x="124" y="120" width="14" height="14" rx="4"/></g>
    <rect x="124" y="98" width="14" height="14" rx="4" fill="#2fa37a"/><rect x="148" y="120" width="14" height="14" rx="4" fill="#f0900f"/>
    <rect x="100" y="140" width="14" height="14" rx="4" fill="#e0453f"/>
    <circle cx="58" cy="124" r="14" fill="#2fa37a"/><path d="M51 124l5 5 9-10" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="150" y="142" width="42" height="18" rx="9" transform="rotate(-8 171 151)" fill="#f2b705"/>
    <path d="M192 78l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#5b5bf0"/><circle cx="50" cy="78" r="5" fill="#f0900f"/>`),
  cards: wrap(`
    <rect x="60" y="42" width="62" height="42" rx="9" transform="rotate(-8 91 63)" fill="#fff" stroke="#5b5bf0" stroke-width="4"/>
    <rect x="72" y="54" width="30" height="5" rx="2.5" fill="#b9b6f2" transform="rotate(-8 91 63)"/>
    <rect x="120" y="38" width="62" height="42" rx="9" transform="rotate(8 151 59)" fill="#fff" stroke="#3b6fe0" stroke-width="4"/>
    <rect x="132" y="50" width="32" height="5" rx="2.5" fill="#b9b6f2" transform="rotate(8 151 59)"/>
    <rect x="92" y="68" width="58" height="40" rx="9" fill="#fff" stroke="#2fa37a" stroke-width="4"/>
    <rect x="102" y="80" width="30" height="5" rx="2.5" fill="#7fd1b0"/><rect x="102" y="91" width="20" height="5" rx="2.5" fill="#bfe8d8"/>
    <path d="M54 132q34-14 62 0v34q-28-12-62 0z" fill="none" stroke="#5b5bf0" stroke-width="7" stroke-linejoin="round"/>
    <path d="M126 132q28-14 62 0v34q-34-12-62 0z" fill="none" stroke="#5b5bf0" stroke-width="7" stroke-linejoin="round"/>
    <path d="M44 80l5 10 10 5-10 5-5 10-5-10-10-5 10-5z" fill="#f0b90f"/><circle cx="196" cy="100" r="5" fill="#f0900f"/>`),
  rocket: wrap(`
    <path d="M120 28c22 16 30 44 24 78h-48c-6-34 2-62 24-78z" fill="#fff" stroke="#5b5bf0" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="120" cy="70" r="12" fill="#3aa0ee" stroke="#5b5bf0" stroke-width="4"/>
    <path d="M96 92c-14 6-22 20-22 36 12-4 20-8 30-16zM144 92c14 6 22 20 22 36-12-4-20-8-30-16z" fill="#6c6cf2"/>
    <path d="M108 112h24l-12 34z" fill="#f2a100"/><path d="M114 112h12l-6 18z" fill="#e0453f"/>
    <path d="M66 66l5 10 10 5-10 5-5 10-5-10-10-5 10-5z" fill="#f0b90f"/><path d="M178 94l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#5b5bf0"/>
    <circle cx="82" cy="30" r="5" fill="#3b6fe0"/><circle cx="62" cy="116" r="6" fill="#2fa37a"/><circle cx="190" cy="132" r="6" fill="#e5599a"/>`)
};

const SLIDES = [
  { art: 'study', title: 'Учись с удовольствием', text: 'Все пары, дедлайны и заметки в одном приложении. Учёба перестанет быть хаосом.' },
  { art: 'calendar', title: 'Ничего не забудь', text: 'Календарь подскажет каждую пару и дедлайн — ничего не ускользнёт из виду.' },
  { art: 'cards', title: 'Запоминай легко', text: 'Флеш-карточки превратят зубрёжку в игру: повторяй вовремя — и помни надолго.' }
];

function finish() {
  write('onboarded', true);
  setState({ screen: 'welcome', slide: 0 });
}

export function renderOnboarding(root) {
  const { slide } = getState();
  const s = SLIDES[slide];
  const dots = SLIDES.map((_, i) => `<span class="dot${i === slide ? ' on' : ''}"></span>`).join('');

  render(root, `
    <section class="screen onb" aria-label="Знакомство с приложением">
      <div class="onb-art">${ART[s.art]}</div>
      <div>
        <h1>${s.title}</h1>
        <p>${s.text}</p>
        <div class="dots" role="img" aria-label="Шаг ${slide + 1} из ${SLIDES.length}">${dots}</div>
        <div class="stack">
          <button class="btn btn-primary" data-act="next">Далее</button>
          <button class="btn-text" data-act="skip">Пропустить</button>
        </div>
      </div>
    </section>`);

  root.onclick = (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (btn.dataset.act === 'skip') finish();
    else if (slide < SLIDES.length - 1) setState({ slide: slide + 1 });
    else finish();
  };
}

export function renderWelcome(root) {
  render(root, `
    <section class="screen onb" aria-label="Добро пожаловать">
      <div class="onb-art">${ART.rocket}</div>
      <div>
        <h1>Готов начать?</h1>
        <p>Создай аккаунт — и получи расписание, задачи, заметки и карточки в одном месте.</p>
        <div class="stack" style="margin-top:24px">
          <button class="btn btn-primary" data-go="register">Создать аккаунт</button>
          <button class="btn btn-ghost" data-go="login">У меня уже есть аккаунт</button>
        </div>
      </div>
    </section>`);

  root.onclick = (e) => {
    const btn = e.target.closest('[data-go]');
    if (btn) setState({ screen: btn.dataset.go });
  };
}