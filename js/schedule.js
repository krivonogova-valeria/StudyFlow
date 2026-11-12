import { getState, setState, persist } from './store.js';
import { render, showToast, setFieldError } from './ui.js';
import { icon } from './icons.js';
import { BELLS } from './scheduleData.js';
import { escapeHtml, dayKey, formatLongDate, isSameDay, makeId } from './utils.js';

const DAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DAY_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const PALETTE = ['#7a6cf2', '#3b6fe0', '#1f8f68', '#d9730d', '#c7352f', '#0e8fa3', '#a23fb5'];

let mode = 'day';
let selected = new Date();

const dayIndex = (date) => (date.getDay() + 6) % 7;

function colorFor(title) {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function roomLabel(room) {
  return /^\d/.test(room) ? `ауд. ${room}` : room;
}

function pairsWord(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'пара';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) return 'пары';
  return 'пар';
}

export function lessonsOfDay(schedule, index) {
  return schedule
    .filter((l) => l.day === index)
    .sort((a, b) => a.start.localeCompare(b.start) || a.pair - b.pair);
}

export function subjectsFrom(schedule) {
  const map = new Map();
  schedule.forEach((l) => {
    const item = map.get(l.title) ?? { title: l.title, teachers: new Set(), rooms: new Set(), count: 0 };
    if (l.teacher) item.teachers.add(l.teacher);
    if (l.room) item.rooms.add(l.room);
    item.count += 1;
    map.set(l.title, item);
  });
  return [...map.values()]
    .map((s) => ({ title: s.title, teachers: [...s.teachers], rooms: [...s.rooms], count: s.count }))
    .sort((a, b) => a.title.localeCompare(b.title, 'ru'));
}

function lessonHtml(lesson, isTodayList) {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const current = isTodayList && lesson.start <= hhmm && hhmm < lesson.end;
  const info = [`${lesson.pair} пара`, lesson.teacher, lesson.room && roomLabel(lesson.room)]
    .filter(Boolean)
    .join(' · ');

  return `
    <li class="card lesson${current ? ' now' : ''}">
      <div class="l-time">${lesson.start}<small>${lesson.end}</small></div>
      <div class="l-body" style="border-color:${colorFor(lesson.title)}">
        <b>${escapeHtml(lesson.title)}</b>
        <span>${escapeHtml(info)}</span>
      </div>
      <button class="icon-btn" data-del="${lesson.id}" aria-label="Удалить пару ${escapeHtml(lesson.title)}">${icon('trash')}</button>
    </li>`;
}

function dayBody(schedule) {
  const idx = dayIndex(selected);
  const monday = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() - idx);
  const todaySelected = isSameDay(selected, new Date());

  const strip = DAY_SHORT.map((name, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const sel = i === idx;
    return `<button data-date="${dayKey(d)}" class="${sel ? 'sel' : ''}" aria-label="${formatLongDate(d)}"${sel ? ' aria-current="date"' : ''}>${name}<b>${d.getDate()}</b></button>`;
  }).join('');

  const lessons = lessonsOfDay(schedule, idx);

  return `
    <div class="date-nav">
      <button class="icon-btn" data-shift="-1" aria-label="Предыдущий день">${icon('prev')}</button>
      <div><b>${formatLongDate(selected)}</b></div>
      <button class="icon-btn" data-shift="1" aria-label="Следующий день">${icon('next')}</button>
    </div>
    <div class="week-strip">${strip}</div>
    ${lessons.length
      ? `<ul class="list">${lessons.map((l) => lessonHtml(l, todaySelected)).join('')}</ul>`
      : '<div class="empty">В этот день пар нет</div>'}`;
}

function weekBody(schedule) {
  const todayIdx = dayIndex(new Date());
  return DAY_FULL.map((name, i) => {
    const lessons = lessonsOfDay(schedule, i);
    return `
      <div class="week-day">
        <h3>${name}</h3>
        ${lessons.length
          ? `<ul class="list">${lessons.map((l) => lessonHtml(l, i === todayIdx)).join('')}</ul>`
          : '<p class="t-sub">Пар нет</p>'}
      </div>`;
  }).join('');
}

function subjectsBody(schedule) {
  const subjects = subjectsFrom(schedule);
  if (!subjects.length) return '<div class="empty">Предметов пока нет</div>';
  return `<ul class="list" style="margin-top:14px">${subjects.map((s) => `
    <li class="card">
      <div class="t-title">${escapeHtml(s.title)}</div>
      <div class="t-sub">${escapeHtml(s.teachers.join(', ') || 'Преподаватель не указан')}</div>
      <div class="chips">
        <span class="chip">${s.count} ${pairsWord(s.count)} в неделю</span>
        ${s.rooms.map((r) => `<span class="chip">${escapeHtml(roomLabel(r))}</span>`).join('')}
      </div>
    </li>`).join('')}</ul>`;
}

function formHtml(schedule) {
  const subjectOptions = subjectsFrom(schedule)
    .map((s) => `<option value="${escapeHtml(s.title)}"></option>`)
    .join('');
  const dayOptions = DAY_FULL.map(
    (name, i) => `<option value="${i}"${i === dayIndex(selected) ? ' selected' : ''}>${name}</option>`
  ).join('');
  const pairOptions = Object.entries(BELLS)
    .map(([n, t]) => `<option value="${n}">${n} пара (${t.start}–${t.end})</option>`)
    .join('');

  return `
    <details class="card form-card" style="margin-top:16px">
      <summary>Добавить пару ${icon('plus')}</summary>
      <form id="lessonForm" novalidate>
        <div class="field">
          <label for="lTitle">Предмет</label>
          <input class="input" id="lTitle" list="lessonSubjects" placeholder="Физика">
          <datalist id="lessonSubjects">${subjectOptions}</datalist>
          <p class="error" data-err="lTitle"></p>
        </div>
        <div class="field">
          <label for="lTeacher">Преподаватель</label>
          <input class="input" id="lTeacher" placeholder="Иванов И. И.">
        </div>
        <div class="row2">
          <div class="field">
            <label for="lRoom">Аудитория</label>
            <input class="input" id="lRoom" placeholder="1409">
          </div>
          <div class="field">
            <label for="lDay">День</label>
            <select class="input" id="lDay">${dayOptions}</select>
          </div>
        </div>
        <div class="field">
          <label for="lPair">Пара</label>
          <select class="input" id="lPair">${pairOptions}</select>
        </div>
        <button class="btn btn-primary" type="submit">Добавить</button>
      </form>
    </details>`;
}

function submitLesson() {
  const title = document.getElementById('lTitle').value.trim();
  setFieldError('lTitle', title ? '' : 'Введите название предмета');
  if (!title) return;

  const day = Number(document.getElementById('lDay').value);
  const pair = Number(document.getElementById('lPair').value);
  const { schedule } = getState();

  if (schedule.some((l) => l.day === day && l.pair === pair && l.title === title)) {
    showToast('Такая пара уже есть в расписании');
    return;
  }

  const lesson = {
    id: makeId('s'),
    day,
    pair,
    start: BELLS[pair].start,
    end: BELLS[pair].end,
    title,
    teacher: document.getElementById('lTeacher').value.trim(),
    room: document.getElementById('lRoom').value.trim()
  };
  setState({ schedule: [...schedule, lesson] });
  if (!persist('schedule')) showToast('Не удалось сохранить данные (хранилище недоступно)');
  else showToast('Пара добавлена');
}

export function renderSchedule(root) {
  const { schedule } = getState();
  const body = mode === 'day' ? dayBody(schedule) : mode === 'week' ? weekBody(schedule) : subjectsBody(schedule);
  const modes = [
    { id: 'day', label: 'День' },
    { id: 'week', label: 'Неделя' },
    { id: 'subjects', label: 'Предметы' }
  ];

  render(root, `
    <section class="screen with-nav" aria-label="Расписание">
      <header class="top"><h1>Расписание</h1></header>
      <div class="seg" role="group" aria-label="Режим" style="display:flex">
        ${modes.map((m) => `<button style="flex:1" data-mode="${m.id}" aria-pressed="${mode === m.id}">${m.label}</button>`).join('')}
      </div>
      ${body}
      ${formHtml(schedule)}
    </section>`);

  root.onclick = (e) => {
    const modeBtn = e.target.closest('[data-mode]');
    if (modeBtn) {
      mode = modeBtn.dataset.mode;
      return setState({});
    }

    const dateBtn = e.target.closest('[data-date]');
    if (dateBtn) {
      const [y, m, d] = dateBtn.dataset.date.split('-').map(Number);
      selected = new Date(y, m - 1, d);
      return setState({});
    }

    const shiftBtn = e.target.closest('[data-shift]');
    if (shiftBtn) {
      selected = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + Number(shiftBtn.dataset.shift));
      return setState({});
    }

    const delBtn = e.target.closest('[data-del]');
    if (delBtn) {
      setState({ schedule: getState().schedule.filter((l) => l.id !== delBtn.dataset.del) });
      persist('schedule');
    }
  };

  root.onsubmit = (e) => {
    e.preventDefault();
    if (e.target.id === 'lessonForm') submitLesson();
  };
}