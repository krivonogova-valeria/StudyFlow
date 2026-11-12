import { getState, setState } from './store.js';
import { read, write } from './storage.js';
import { render, showToast } from './ui.js';
import { escapeHtml } from './utils.js';
import { subjectsFrom } from './schedule.js';
import { SEED_CARDS } from './cardsData.js';

const NONE = '__none';
const SEEDED_KEY = 'cardsSeeded';
let mode = 'subjects';
let session = null;
let flipped = false;
let picked = null;

const load = () => read('cards', []);
const save = (cards) => write('cards', cards);
const redraw = () => setState({});
const subjectKey = (c) => (c.subject && c.subject.trim() ? c.subject.trim() : NONE);
const subjectName = (key) => (key === NONE ? 'Без предмета' : key);

function seed() {
  try {
    if (localStorage.getItem(SEEDED_KEY)) return;
    localStorage.setItem(SEEDED_KEY, '1');
  } catch {
    return;
  }
  const merged = [...load(), ...SEED_CARDS];
  save(merged);
  setState({ cards: merged }, false);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions(card) {
  const others = load().filter((c) => c.id !== card.id && c.a !== card.a);
  const same = shuffle(others.filter((c) => subjectKey(c) === subjectKey(card)));
  const rest = shuffle(others.filter((c) => subjectKey(c) !== subjectKey(card)));
  const wrong = [];
  [...same, ...rest].forEach((c) => {
    if (wrong.length < 3 && !wrong.includes(c.a)) wrong.push(c.a);
  });
  return shuffle([card.a, ...wrong]);
}

function startSession(ids, kind, title) {
  if (!ids.length) {
    showToast('Нет карточек для прохождения');
    return;
  }
  session = { ids: shuffle(ids), i: 0, known: 0, unknown: 0, wrong: [], kind, title, done: false, opts: {} };
  flipped = false;
  picked = null;
  mode = 'session';
  redraw();
}

function record(known) {
  const list = load();
  const id = session.ids[session.i];
  const card = list.find((c) => c.id === id);
  if (card) {
    card.reviewed = (card.reviewed || 0) + 1;
    if (known) card.known = (card.known || 0) + 1;
    save(list);
  }
  if (known) session.known += 1;
  else {
    session.unknown += 1;
    session.wrong.push(id);
  }
}

function advance() {
  session.i += 1;
  flipped = false;
  picked = null;
  if (session.i >= session.ids.length) session.done = true;
  redraw();
}

function addCard() {
  const q = document.getElementById('cQ').value.trim();
  const a = document.getElementById('cA').value.trim();
  const subject = document.getElementById('cSubject').value.trim();
  if (!q || !a) {
    showToast('Заполните вопрос и ответ');
    return;
  }
  const cards = load();
  cards.push({ id: `c${Date.now()}`, q, a, subject, known: 0, reviewed: 0 });
  save(cards);
  showToast('Карточка добавлена');
  redraw();
}

function groups(cards) {
  const map = new Map();
  cards.forEach((c) => {
    const k = subjectKey(c);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(c);
  });
  return [...map.entries()].sort((a, b) => subjectName(a[0]).localeCompare(subjectName(b[0]), 'ru'));
}

function subjectsView(cards) {
  if (!cards.length) {
    return '<div class="empty">Карточек пока нет. Откройте «Все карточки» и добавьте первую.</div>';
  }
  const rows = groups(cards).map(([key, list]) => {
    const learned = list.filter((c) => (c.known || 0) > 0).length;
    const pct = Math.round((learned / list.length) * 100);
    return `
      <button type="button" class="card subj-card" data-act="start-subject" data-subject="${escapeHtml(key)}">
        <div class="subj-top">
          <b>${escapeHtml(subjectName(key))}</b>
          <span>${list.length} карт.</span>
        </div>
        <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
        <small>Выучено ${learned} из ${list.length}</small>
      </button>`;
  }).join('');
  return `
    <button type="button" class="card test-card" data-act="start-test">
      <b>Тест: все предметы</b>
      <span>${cards.length} карточек вперемешку</span>
    </button>
    <div class="section-h"><h2>По предметам</h2></div>
    <div class="list">${rows}</div>`;
}

function sessionView() {
  const s = session;
  if (s.done) {
    const total = s.ids.length;
    return `
      <div class="card flash result">
        <div class="q">Готово!</div>
        <div class="a">Верно: ${s.known} из ${total}</div>
        <div class="t-sub">Ошибок: ${s.unknown}</div>
      </div>
      <div class="list" style="margin-top:14px">
        ${s.wrong.length ? '<button class="btn btn-primary" data-act="retry-wrong">Повторить ошибки</button>' : ''}
        <button class="btn btn-ghost" data-act="restart">Пройти ещё раз</button>
        <button class="btn btn-ghost" data-act="to-subjects">К предметам</button>
      </div>`;
  }

  const c = load().find((x) => x.id === s.ids[s.i]);
  if (!c) {
    s.i += 1;
    if (s.i >= s.ids.length) s.done = true;
    return sessionView();
  }

  const pct = Math.round((s.i / s.ids.length) * 100);
  const head = `
    <p class="card-counter">${escapeHtml(s.title)} · ${s.i + 1} / ${s.ids.length}${s.kind === 'test' && c.subject ? ` · ${escapeHtml(c.subject)}` : ''}</p>
    <div class="bar" style="margin-bottom:12px" aria-hidden="true"><i style="width:${pct}%"></i></div>`;

  if (!s.opts[s.i]) s.opts[s.i] = buildOptions(c);
  const opts = s.opts[s.i];

  if (opts.length < 2) {
    return `${head}
      <div class="card flash flip" data-act="flip" role="button" tabindex="0">
        ${flipped ? `<div class="a">${escapeHtml(c.a)}</div>` : `<div class="q">${escapeHtml(c.q)}</div>`}
        <span class="flip-hint">${flipped ? 'Ответ' : 'Нажмите, чтобы увидеть ответ'}</span>
      </div>
      ${flipped
        ? `<div class="row2" style="margin-top:14px">
            <button class="btn btn-ghost" data-act="again">Не знаю</button>
            <button class="btn btn-primary" data-act="know">Знаю</button>
          </div>`
        : '<button class="btn btn-primary" style="margin-top:14px" data-act="flip">Показать ответ</button>'}`;
  }

  const answered = picked !== null;
  const isRight = answered && opts[picked] === c.a;
  const optionsHtml = opts.map((text, idx) => {
    let cls = 'opt';
    if (answered) {
      if (text === c.a) cls += ' correct';
      else if (idx === picked) cls += ' wrong';
      else cls += ' dim';
    }
    return `<button type="button" class="${cls}" data-act="pick" data-i="${idx}"${answered ? ' disabled' : ''}>${escapeHtml(text)}</button>`;
  }).join('');

  const last = s.i + 1 >= s.ids.length;
  return `${head}
    <div class="card flash quiz-q"><div class="q">${escapeHtml(c.q)}</div></div>
    <div class="opts">${optionsHtml}</div>
    ${answered
      ? `<p class="quiz-result ${isRight ? 'ok' : 'bad'}">${isRight ? 'Верно!' : 'Неверно. Правильный ответ выделен зелёным.'}</p>
         <button class="btn btn-primary" data-act="next">${last ? 'Завершить' : 'Дальше'}</button>`
      : ''}`;
}

function listView(cards) {
  const names = new Set(subjectsFrom(getState().schedule).map((s) => s.title));
  cards.forEach((c) => c.subject && names.add(c.subject));
  const options = [...names].map((n) => `<option value="${escapeHtml(n)}"></option>`).join('');
  return `
    <form id="cardForm" class="card form-card" novalidate>
      <div class="field">
        <label for="cQ">Вопрос</label>
        <input class="input" id="cQ" placeholder="Например: Что такое СУБД?">
      </div>
      <div class="field">
        <label for="cA">Ответ</label>
        <input class="input" id="cA" placeholder="Система управления базами данных">
      </div>
      <div class="field">
        <label for="cSubject">Предмет</label>
        <input class="input" id="cSubject" list="cardSubjects" placeholder="Выберите или введите">
        <datalist id="cardSubjects">${options}</datalist>
      </div>
      <button class="btn btn-primary" type="submit">Добавить карточку</button>
    </form>

    <div class="section-h"><h2>Все карточки (${cards.length})</h2></div>
    ${cards.length
      ? cards.map((c) => `
        <div class="card pair" style="margin-bottom:10px">
          <div>
            <div class="t-title">${escapeHtml(c.q)}</div>
            <div class="t-sub">${escapeHtml(c.a)}${c.subject ? ` · ${escapeHtml(c.subject)}` : ''}</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="delete" data-id="${c.id}">Удалить</button>
        </div>`).join('')
      : '<div class="empty">Пока пусто.</div>'}`;
}

export function renderCards(root) {
  seed();
  const cards = load();
  if (mode === 'session' && !session) mode = 'subjects';

  const tabActive = mode === 'session' && session.kind === 'test' ? 'test' : mode === 'list' ? 'list' : 'subjects';
  const body = mode === 'session' ? sessionView() : mode === 'list' ? listView(cards) : subjectsView(cards);

  render(root, `
    <section class="screen with-nav" aria-label="Карточки">
      <header class="top"><h1>Карточки</h1></header>
      <div class="toolbar">
        <button class="btn btn-sm ${tabActive === 'subjects' ? 'btn-primary' : 'btn-ghost'}" data-mode="subjects">Предметы</button>
        <button class="btn btn-sm ${tabActive === 'test' ? 'btn-primary' : 'btn-ghost'}" data-mode="test">Тест</button>
        <button class="btn btn-sm ${tabActive === 'list' ? 'btn-primary' : 'btn-ghost'}" data-mode="list">Все карточки</button>
      </div>
      ${body}
    </section>`);

  root.onchange = null;

  root.onclick = (e) => {
    const modeBtn = e.target.closest('[data-mode]');
    if (modeBtn) {
      const m = modeBtn.dataset.mode;
      flipped = false;
      picked = null;
      if (m === 'test') {
        startSession(load().map((c) => c.id), 'test', 'Тест');
      } else {
        session = null;
        mode = m;
        redraw();
      }
      return;
    }

    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === 'start-test') {
      startSession(load().map((c) => c.id), 'test', 'Тест');
    } else if (act === 'start-subject') {
      const key = btn.dataset.subject;
      const ids = load().filter((c) => subjectKey(c) === key).map((c) => c.id);
      startSession(ids, 'subject', subjectName(key));
    } else if (act === 'pick') {
      if (picked !== null) return;
      const c = load().find((x) => x.id === session.ids[session.i]);
      const idx = Number(btn.dataset.i);
      picked = idx;
      record(session.opts[session.i][idx] === c.a);
      redraw();
    } else if (act === 'next') {
      advance();
    } else if (act === 'flip') {
      flipped = !flipped;
      redraw();
    } else if (act === 'again') {
      record(false);
      advance();
    } else if (act === 'know') {
      record(true);
      advance();
    } else if (act === 'retry-wrong') {
      startSession([...session.wrong], session.kind, session.title);
    } else if (act === 'restart') {
      const key = session.kind === 'subject' ? session.title : null;
      const pool = key
        ? load().filter((c) => subjectName(subjectKey(c)) === key).map((c) => c.id)
        : load().map((c) => c.id);
      startSession(pool, session.kind, session.title);
    } else if (act === 'to-subjects') {
      session = null;
      mode = 'subjects';
      redraw();
    } else if (act === 'delete') {
      save(load().filter((c) => c.id !== btn.dataset.id));
      showToast('Карточка удалена');
      redraw();
    }
  };

  root.onsubmit = (e) => {
    e.preventDefault();
    if (e.target.id === 'cardForm') addCard();
  };
}