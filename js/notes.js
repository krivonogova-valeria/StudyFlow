import { setState } from './store.js';
import { read, write } from './storage.js';
import { render, showToast } from './ui.js';
import { escapeHtml } from './utils.js';

let view = 'list';
let layout = 'grid';
let query = '';
let editId = null;
let draftTags = [];

const COLORS = ['primary', 'amber', 'green', 'red'];
const SEEDED_KEY = 'notesSeeded';

const svg = (p, s = 20) =>
  `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

const I = {
  back: svg('<path d="m15 18-6-6 6-6"/>'),
  search: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  grid: svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  link: svg('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'),
  image: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>'),
  trash: svg('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  ul: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>')
};

function seed() {
  try {
    if (localStorage.getItem(SEEDED_KEY)) return;
    localStorage.setItem(SEEDED_KEY, '1');
  } catch {
    return;
  }
  if (read('notes', []).length) return;
  const d = (m, day) => new Date(2026, m, day).getTime();
  write('notes', [
    { id: 'n1', title: 'Лекция 8: Наследование', body: 'Полиморфизм в Python, переопределение методов и MRO. Примеры с абстрактными классами и интерфейсами.', tags: ['Программирование', 'Лекция'], updated: d(9, 7) },
    { id: 'n2', title: 'Неравенства', body: 'Метод интервалов, квадратичные неравенства, типовые ошибки на контрольной.', tags: ['Математика'], updated: d(9, 6) },
    { id: 'n3', title: 'Phrasal verbs', body: 'get up, run into, look after, give up — 30 самых частых фразовых глаголов с примерами.', tags: ['Английский'], updated: d(9, 5) },
    { id: 'n4', title: 'История: XX век', body: 'Причины и последствия революции, ключевые даты и деятели для экзамена.', tags: ['История'], updated: d(9, 3) }
  ]);
}

const load = () => read('notes', []);
const save = (notes) => write('notes', notes);
const redraw = () => setState({});

export const isEditingNote = () => view === 'edit';

function sanitize(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  doc.querySelectorAll('script, style, iframe, object, embed').forEach((n) => n.remove());
  doc.body.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((a) => {
      if (a.name.startsWith('on')) el.removeAttribute(a.name);
      if ((a.name === 'href' || a.name === 'src') && /^\s*javascript:/i.test(a.value)) el.removeAttribute(a.name);
    });
  });
  return doc.body.innerHTML;
}

function plain(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

function colorOf(tags) {
  if (!tags.length) return 'plain';
  let h = 0;
  for (const ch of tags[0]) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
}

function plural(n) {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return 'заметка';
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return 'заметки';
  return 'заметок';
}

function filtered() {
  const q = query.trim().toLowerCase();
  return load()
    .filter((n) => !q || `${n.title} ${plain(n.body)} ${n.tags.join(' ')}`.toLowerCase().includes(q))
    .sort((a, b) => b.updated - a.updated);
}

function cardsHtml(notes) {
  if (!notes.length) {
    return `<div class="empty">${query ? 'Ничего не найдено.' : 'Заметок пока нет. Нажмите «Новая заметка».'}</div>`;
  }
  return notes.map((n) => `
    <article class="note note-${colorOf(n.tags)}" data-act="open" data-id="${n.id}" tabindex="0">
      <h3>${escapeHtml(n.title || 'Без названия')}</h3>
      <p>${escapeHtml(plain(n.body).slice(0, 110))}</p>
      <div class="note-foot">
        <span class="note-tag">${n.tags[0] ? escapeHtml(n.tags[0]) : ''}</span>
        <time>${fmtDate(n.updated)}</time>
      </div>
    </article>`).join('');
}

function updateList() {
  const notes = filtered();
  const box = document.getElementById('notesList');
  const count = document.getElementById('notesCount');
  if (box) box.innerHTML = cardsHtml(notes);
  if (count) count.textContent = `${notes.length} ${plural(notes.length)}`;
}

function renderList(root) {
  const total = filtered().length;
  render(root, `
    <section class="screen with-nav" aria-label="Заметки">
      <header class="notes-head">
        <button class="icon-btn" data-tab="home" aria-label="Назад">${I.back}</button>
        <h1>Заметки</h1>
      </header>
      <div class="notes-search">${I.search}<input id="notesSearch" type="search" placeholder="Поиск заметок…" value="${escapeHtml(query)}"></div>
      <div class="notes-meta">
        <span id="notesCount">${total} ${plural(total)}</span>
        <div class="layout-switch">
          <button type="button" class="${layout === 'grid' ? 'on' : ''}" data-layout="grid" aria-label="Сетка">${I.grid}</button>
          <button type="button" class="${layout === 'list' ? 'on' : ''}" data-layout="list" aria-label="Список">${I.list}</button>
        </div>
      </div>
      <div id="notesList" class="${layout === 'grid' ? 'notes-grid' : 'notes-list'}">${cardsHtml(filtered())}</div>
      <div class="fab-wrap"><button class="btn btn-primary fab" data-act="new">${I.plus} Новая заметка</button></div>
    </section>`);
}

function tagsHtml() {
  return `${draftTags.map((t, i) => `<span class="tag-chip">${escapeHtml(t)}<button type="button" data-act="rm-tag" data-i="${i}" aria-label="Убрать тег">×</button></span>`).join('')}
    <label class="tag-add">${I.plus}<input id="tagInput" placeholder="Тег" maxlength="24"></label>`;
}

function renderEditor(root) {
  const note = load().find((n) => n.id === editId);
  render(root, `
    <section class="screen editor" aria-label="Заметка">
      <header class="editor-top">
        <button class="icon-btn" data-act="back" aria-label="Назад">${I.back}</button>
        <h2>Заметка</h2>
        ${note ? `<button class="icon-btn" data-act="delete" aria-label="Удалить">${I.trash}</button>` : '<span class="icon-btn ghost"></span>'}
      </header>
      <input class="note-title" id="nTitle" placeholder="Заголовок" value="${escapeHtml(note ? note.title : '')}">
      <div class="note-body" id="nBody" contenteditable="true" data-placeholder="Текст заметки…">${note ? sanitize(note.body) : ''}</div>
      <div class="note-toolbar">
        <button type="button" data-cmd="bold" aria-label="Жирный"><b>B</b></button>
        <button type="button" data-cmd="italic" aria-label="Курсив"><i>I</i></button>
        <button type="button" data-cmd="underline" aria-label="Подчёркнутый"><u>U</u></button>
        <button type="button" data-cmd="insertUnorderedList" aria-label="Список">${I.ul}</button>
        <button type="button" data-cmd="link" aria-label="Ссылка">${I.link}</button>
        <button type="button" data-cmd="image" aria-label="Фото">${I.image}</button>
        <input type="file" id="noteImage" accept="image/*" hidden>
      </div>
      <div class="note-tags" id="tagsBox">${tagsHtml()}</div>
      <div class="editor-save"><button class="btn btn-primary" data-act="save">Сохранить</button></div>
    </section>`);
}

function saveCurrent() {
  const titleEl = document.getElementById('nTitle');
  const bodyEl = document.getElementById('nBody');
  if (!titleEl || !bodyEl) return false;
  const title = titleEl.value.trim();
  const body = sanitize(bodyEl.innerHTML);
  const empty = !title && !plain(body) && !bodyEl.querySelector('img') && !draftTags.length;
  const notes = load();

  if (empty) {
    if (editId) save(notes.filter((n) => n.id !== editId));
    return false;
  }
  if (!editId) editId = `n${Date.now()}`;
  const data = { id: editId, title, body, tags: [...draftTags], updated: Date.now() };
  const i = notes.findIndex((n) => n.id === editId);
  if (i >= 0) notes[i] = data;
  else notes.push(data);
  save(notes);
  return true;
}

function refreshTags(focus) {
  const box = document.getElementById('tagsBox');
  if (!box) return;
  box.innerHTML = tagsHtml();
  if (focus) document.getElementById('tagInput').focus();
}

function addTag(value) {
  const tag = value.trim().replace(/,$/, '');
  if (!tag || draftTags.includes(tag) || draftTags.length >= 5) return;
  draftTags.push(tag);
  refreshTags(true);
}

function resizeImage(file, maxW = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const k = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * k);
        canvas.height = Math.round(img.height * k);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function insertImage(file) {
  if (!file || !file.type.startsWith('image/')) return;
  try {
    const src = await resizeImage(file);
    const body = document.getElementById('nBody');
    body.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount || !body.contains(sel.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(body);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    document.execCommand('insertImage', false, src);
  } catch {
    showToast('Не удалось добавить фото');
  }
}

function runCommand(cmd) {
  const body = document.getElementById('nBody');
  if (cmd === 'image') {
    document.getElementById('noteImage').click();
    return;
  }
  body.focus();
  if (cmd === 'link') {
    const url = prompt('Ссылка (https://…)');
    if (url && /^(https?:\/\/|mailto:)/i.test(url.trim())) document.execCommand('createLink', false, url.trim());
    else if (url) showToast('Ссылка должна начинаться с https://');
  } else {
    document.execCommand(cmd, false, null);
  }
}

export function renderNotes(root) {
  seed();
  if (view === 'edit') renderEditor(root);
  else renderList(root);

  root.onchange = (e) => {
    if (e.target.id === 'noteImage') {
      insertImage(e.target.files[0]);
      e.target.value = '';
    }
  };

  root.oninput = (e) => {
    if (e.target.id === 'notesSearch') {
      query = e.target.value;
      updateList();
    }
  };

  root.onkeydown = (e) => {
    if (e.target.id === 'tagInput' && (e.key === 'Enter' || e.key === ',')) {
      e.preventDefault();
      addTag(e.target.value);
    } else if (e.target.classList?.contains('note') && e.key === 'Enter') {
      e.target.click();
    }
  };

  root.onpaste = (e) => {
    if (e.target.closest?.('#nBody')) {
      e.preventDefault();
      document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
    }
  };

  root.onmousedown = (e) => {
    if (e.target.closest('[data-cmd]')) e.preventDefault();
  };

  root.onclick = (e) => {
    const cmdBtn = e.target.closest('[data-cmd]');
    if (cmdBtn) return runCommand(cmdBtn.dataset.cmd);

    const layoutBtn = e.target.closest('[data-layout]');
    if (layoutBtn) {
      layout = layoutBtn.dataset.layout;
      return redraw();
    }

    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      view = 'list';
      query = '';
      return setState({ tab: tabBtn.dataset.tab });
    }

    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === 'new') {
      editId = null;
      draftTags = [];
      view = 'edit';
      redraw();
    } else if (act === 'open') {
      const note = load().find((n) => n.id === btn.dataset.id);
      if (!note) return;
      editId = note.id;
      draftTags = [...note.tags];
      view = 'edit';
      redraw();
    } else if (act === 'save') {
      const ok = saveCurrent();
      view = 'list';
      editId = null;
      if (ok) showToast('Заметка сохранена');
      redraw();
    } else if (act === 'back') {
      view = 'list';
      editId = null;
      redraw();
    } else if (act === 'delete') {
      if (confirm('Удалить заметку?')) {
        if (editId) save(load().filter((n) => n.id !== editId));
        view = 'list';
        editId = null;
        showToast('Заметка удалена');
        redraw();
      }
    } else if (act === 'rm-tag') {
      draftTags.splice(Number(btn.dataset.i), 1);
      refreshTags(false);
    }
  };
}