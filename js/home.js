import { getState, setState, persist } from './store.js';
import { render, showToast, setFieldError } from './ui.js';
import { icon, renderIcons } from './icons.js';
import { escapeHtml, formatDeadline, initials, isOverdue, isSameDay, timeLeft } from './utils.js';
import { PRIORITY_LABEL, STATUS } from './task.js';
import { addDemoTasks, addTask, cyclePriority, removeTask, toggleTask } from './taskService.js';
import { calcProgress, progressBoxHtml, renderProgress } from './progress.js';
import { FILTERS, SORTS, filterTasks, sortTasks, visibleTasks } from './filters.js';
import { subjectsFrom } from './schedule.js';
import { t, longDate } from './i18n.js';

function taskCardHtml(task) {
  const now = new Date();
  const done = task.status === STATUS.DONE;
  const overdue = isOverdue(task, now);
  const tone = done ? 'ok' : overdue ? 'danger' : 'warn';
  const label = PRIORITY_LABEL[task.priority];

  const chips = [
    `<span class="chip ${tone}">${icon(overdue ? 'warning' : 'clock')} ${escapeHtml(formatDeadline(task.deadline, now))}</span>`,
    done
      ? '<span class="chip ok">✓</span>'
      : `<span class="chip${overdue ? ' danger' : ''}">${escapeHtml(timeLeft(task, now))}</span>`
  ].join('');

  return `
    <li class="card task${done ? ' done' : ''}${overdue ? ' overdue' : ''}">
      <button class="check" data-act="toggle" data-id="${task.id}" role="checkbox"
              aria-checked="${done}" aria-label="${t('t.markDone')}: ${escapeHtml(task.title)}">${done ? icon('check') : ''}</button>
      <div>
        <div class="t-title">${escapeHtml(task.title)}</div>
        ${task.subject ? `<div class="t-sub">${escapeHtml(task.subject)}</div>` : ''}
        <div class="chips">${chips}</div>
      </div>
      <div class="t-actions">
        <button class="icon-btn p-${task.priority}" data-act="prio" data-id="${task.id}"
                aria-label="${t('t.priority')}: ${label}. ${t('t.prioHint')}" title="${t('t.priority')}: ${label}">${icon('flag')}</button>
        <button class="icon-btn" data-act="del" data-id="${task.id}"
                aria-label="${t('t.delete')}: ${escapeHtml(task.title)}" title="${t('t.delete')}">${icon('trash')}</button>
      </div>
    </li>`;
}

function handleTaskAction(e, after) {
  const btn = e.target.closest('[data-act="toggle"], [data-act="prio"], [data-act="del"]');
  if (!btn) return false;
  const { act, id } = btn.dataset;
  const warn = (saved) => {
    if (!saved) showToast(t('t.saveError'));
  };

  if (act === 'toggle') {
    warn(toggleTask(id));
    after();
  } else if (act === 'prio') {
    warn(cyclePriority(id));
    after();
  } else if (act === 'del') {
    btn.closest('.task')?.classList.add('removing');
    setTimeout(() => {
      warn(removeTask(id));
      after();
      showToast(t('t.deleted'));
    }, 220);
  }
  return true;
}

export function renderHome(root) {
  const { user, tasks, schedule, cards } = getState();
  const now = new Date();
  const firstName = (user?.name || '').split(/\s+/)[0] || t('home.friend');
  const lessonsToday = schedule.filter((l) => l.day === (now.getDay() + 6) % 7).length;
  const dueToday = tasks.filter((x) => x.status !== STATUS.DONE && isSameDay(new Date(x.deadline), now)).length;
  const nearest = sortTasks(filterTasks(tasks, 'active'), 'deadline').slice(0, 3);
  const stats = calcProgress(tasks);
  const reviewed = cards.filter((c) => c.reviewed > 0).length;

  render(root, `
    <section class="screen with-nav" aria-label="${t('nav.home')}">
      <header class="top">
        <div>
          <h1>${t('home.hello', { name: escapeHtml(firstName) })} 👋</h1>
          <p class="date">${escapeHtml(longDate(now))}</p>
        </div>
        <div class="top-actions">
          <button class="icon-btn notes-btn" data-tab="notes" aria-label="${t('home.notes')}">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
          </button>
          <button class="avatar" data-tab="profile" aria-label="${t('home.openProfile')}">${user?.photo ? `<img src="${user.photo}" alt="">` : escapeHtml(initials(user?.name))}</button>
        </div>
      </header>

      <div class="hero">
        <h2>${t('home.today')}</h2>
        <div class="hero-stats">
          <div><b>${lessonsToday}</b><span>${lessonsToday === 1 ? t('home.lesson1') : t('home.lessonN')}</span></div>
          <div><b>${dueToday}</b><span>${t('home.deadlines')}</span></div>
          <div><b>${cards.length}</b><span>${t('home.cards')}</span></div>
        </div>
        <button class="btn" data-tab="schedule">${t('home.openSchedule')}</button>
      </div>

      <div class="section-h"><h2>${t('home.nearest')}</h2><button class="link" data-tab="tasks">${t('home.all')}</button></div>
      ${nearest.length
        ? `<ul class="list">${nearest.map(taskCardHtml).join('')}</ul>`
        : `<div class="empty">${t('home.noActive')}</div>`}

      <div class="section-h" style="margin-top:22px"><h2>${t('home.week')}</h2></div>
      <div class="card week-prog">
        <div class="donut" style="background:conic-gradient(var(--primary) ${stats.percent * 3.6}deg, var(--track) 0)"
             role="img" aria-label="${stats.percent}%"><span>${stats.percent}%</span></div>
        <dl>
          <div><dt>${t('home.tasksDone')}</dt><dd>${stats.done}/${stats.total}</dd></div>
          <div><dt>${t('home.cardsReviewed')}</dt><dd>${reviewed}/${cards.length}</dd></div>
        </dl>
      </div>
    </section>`);

  root.onclick = (e) => {
    if (handleTaskAction(e, () => setState({}))) return;
    const tab = e.target.closest('[data-tab]');
    if (tab) setState({ tab: tab.dataset.tab });
  };
}

function taskListHtml() {
  const { tasks, settings } = getState();
  if (!tasks.length) {
    return `<div class="empty">${t('t.empty')}<br>
            <button class="btn btn-ghost btn-sm" data-act="demo">${t('t.demo')}</button></div>`;
  }
  const list = visibleTasks(tasks, settings);
  if (!list.length) return `<div class="empty">${t('t.emptySection')}</div>`;
  return `<ul class="list">${list.map(taskCardHtml).join('')}</ul>`;
}

function refreshTaskList() {
  const box = document.getElementById('progressBox');
  const list = document.getElementById('taskList');
  if (!box || !list) return;
  renderProgress(box, calcProgress(getState().tasks));
  list.innerHTML = taskListHtml();
  renderIcons();
}

function submitTaskForm() {
  const input = {
    title: document.getElementById('tTitle').value,
    subject: document.getElementById('tSubject').value,
    priority: document.getElementById('tPrio').value,
    deadline: document.getElementById('tDeadline').value
  };
  const result = addTask(input);
  setFieldError('tTitle', result.errors?.title);
  setFieldError('tDeadline', result.errors?.deadline);

  if (!result.ok) {
    document.getElementById(result.errors.title ? 'tTitle' : 'tDeadline').focus();
    return;
  }
  if (!result.saved) showToast(t('t.saveError'));
  ['tTitle', 'tSubject', 'tDeadline'].forEach((id) => {
    document.getElementById(id).value = '';
  });
  document.getElementById('tPrio').value = 'medium';
  refreshTaskList();
  showToast(t('t.added'));
  document.getElementById('tTitle').focus();
}

export function renderTasks(root) {
  const { settings, tasks, schedule } = getState();
  const subjectOptions = subjectsFrom(schedule)
    .map((s) => `<option value="${escapeHtml(s.title)}"></option>`)
    .join('');
  const filterButtons = FILTERS.map(
    (f) => `<button data-filter="${f.id}" aria-pressed="${settings.filter === f.id}">${f.label}</button>`
  ).join('');
  const sortOptions = SORTS.map(
    (s) => `<option value="${s.id}"${settings.sort === s.id ? ' selected' : ''}>${s.label}</option>`
  ).join('');

  render(root, `
    <section class="screen with-nav" aria-label="${t('t.title')}">
      <header class="top"><h1>${t('t.title')}</h1></header>
      <div id="progressBox">${progressBoxHtml(calcProgress(tasks))}</div>

      <details class="card form-card" open>
        <summary>${t('t.new')} ${icon('plus')}</summary>
        <form id="taskForm" novalidate>
          <div class="field">
            <label for="tTitle">${t('t.name')}</label>
            <input class="input" id="tTitle" maxlength="140" placeholder="${t('t.namePh')}">
            <p class="error" data-err="tTitle"></p>
          </div>
          <div class="row2">
            <div class="field">
              <label for="tSubject">${t('t.subject')}</label>
              <input class="input" id="tSubject" list="taskSubjects" placeholder="${t('t.subjectPh')}">
              <datalist id="taskSubjects">${subjectOptions}</datalist>
            </div>
            <div class="field">
              <label for="tPrio">${t('t.priority')}</label>
              <select class="input" id="tPrio">
                <option value="high">${t('t.high')}</option>
                <option value="medium" selected>${t('t.medium')}</option>
                <option value="low">${t('t.low')}</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="tDeadline">${t('t.deadline')}</label>
            <input class="input" id="tDeadline" type="datetime-local">
            <p class="error" data-err="tDeadline"></p>
          </div>
          <button class="btn btn-primary" type="submit">${t('t.add')}</button>
        </form>
      </details>

      <div class="toolbar">
        <div class="seg" role="group" aria-label="${t('t.filter')}">${filterButtons}</div>
        <label class="sr-only" for="sortSel">${t('t.sort')}</label>
        <select id="sortSel">${sortOptions}</select>
      </div>
      <div id="taskList">${taskListHtml()}</div>
    </section>`);

  root.onclick = (e) => {
    if (handleTaskAction(e, refreshTaskList)) return;

    const filterBtn = e.target.closest('[data-filter]');
    if (filterBtn) {
      setState({ settings: { ...getState().settings, filter: filterBtn.dataset.filter } }, false);
      persist('settings');
      root.querySelectorAll('[data-filter]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.filter === getState().settings.filter))
      );
      refreshTaskList();
    } else if (e.target.closest('[data-act="demo"]')) {
      addDemoTasks();
      refreshTaskList();
    }
  };

  root.onchange = (e) => {
    if (e.target.id !== 'sortSel') return;
    setState({ settings: { ...getState().settings, sort: e.target.value } }, false);
    persist('settings');
    refreshTaskList();
  };

  root.onsubmit = (e) => {
    e.preventDefault();
    if (e.target.id === 'taskForm') submitTaskForm();
  };
}

setInterval(() => {
  const s = getState();
  if (s.screen === 'app' && s.tab === 'tasks' && !document.activeElement?.matches('input, select, textarea')) {
    refreshTaskList();
  }
}, 60000);