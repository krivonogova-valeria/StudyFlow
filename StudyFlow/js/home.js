import { getState, setState, persist } from './store.js';
import { render, showToast, setFieldError } from './ui.js';
import { icon, renderIcons } from './icons.js';
import { escapeHtml, formatDeadline, formatLongDate, initials, isOverdue, isSameDay, timeLeft } from './utils.js';
import { PRIORITY_LABEL, STATUS } from './task.js';
import { addDemoTasks, addTask, cyclePriority, removeTask, toggleTask } from './taskService.js';
import { calcProgress, progressBoxHtml, renderProgress } from './progress.js';
import { FILTERS, SORTS, filterTasks, sortTasks, visibleTasks } from './filters.js';

const SAVE_ERROR = 'Не удалось сохранить данные (хранилище недоступно)';

function taskCardHtml(task) {
  const now = new Date();
  const done = task.status === STATUS.DONE;
  const overdue = isOverdue(task, now);
  const tone = done ? 'ok' : overdue ? 'danger' : 'warn';
  const label = PRIORITY_LABEL[task.priority];

  const chips = [
    `<span class="chip ${tone}">${icon(overdue ? 'warning' : 'clock')} ${escapeHtml(formatDeadline(task.deadline, now))}</span>`,
    done
      ? '<span class="chip ok">Выполнено</span>'
      : `<span class="chip${overdue ? ' danger' : ''}">${escapeHtml(timeLeft(task, now))}</span>`
  ].join('');

  return `
    <li class="card task${done ? ' done' : ''}${overdue ? ' overdue' : ''}">
      <button class="check" data-act="toggle" data-id="${task.id}" role="checkbox"
              aria-checked="${done}" aria-label="Отметить выполненной: ${escapeHtml(task.title)}">${done ? icon('check') : ''}</button>
      <div>
        <div class="t-title">${escapeHtml(task.title)}</div>
        ${task.subject ? `<div class="t-sub">${escapeHtml(task.subject)}</div>` : ''}
        <div class="chips">${chips}</div>
      </div>
      <div class="t-actions">
        <button class="icon-btn p-${task.priority}" data-act="prio" data-id="${task.id}"
                aria-label="Приоритет: ${label}. Нажмите, чтобы изменить" title="Приоритет: ${label}">${icon('flag')}</button>
        <button class="icon-btn" data-act="del" data-id="${task.id}"
                aria-label="Удалить задачу ${escapeHtml(task.title)}" title="Удалить">${icon('trash')}</button>
      </div>
    </li>`;
}

function handleTaskAction(e, after) {
  const btn = e.target.closest('[data-act="toggle"], [data-act="prio"], [data-act="del"]');
  if (!btn) return false;
  const { act, id } = btn.dataset;
  const warn = (saved) => {
    if (!saved) showToast(SAVE_ERROR);
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
      showToast('Задача удалена');
    }, 220);
  }
  return true;
}

export function renderHome(root) {
  const { user, tasks, schedule, cards } = getState();
  const now = new Date();
  const firstName = (user?.name || '').split(/\s+/)[0] || 'друг';
  const lessonsToday = schedule.filter((l) => l.day === (now.getDay() + 6) % 7).length;
  const dueToday = tasks.filter((t) => t.status !== STATUS.DONE && isSameDay(new Date(t.deadline), now)).length;
  const nearest = sortTasks(filterTasks(tasks, 'active'), 'deadline').slice(0, 3);
  const stats = calcProgress(tasks);
  const reviewed = cards.filter((c) => c.reviewed > 0).length;

  render(root, `
    <section class="screen with-nav" aria-label="Главная">
      <header class="top">
        <div>
          <h1>Привет, ${escapeHtml(firstName)} 👋</h1>
          <p class="date">${formatLongDate(now)}</p>
        </div>
        <button class="avatar" data-tab="profile" aria-label="Открыть профиль">${escapeHtml(initials(user?.name))}</button>
      </header>

      <div class="hero">
        <h2>Сегодня</h2>
        <div class="hero-stats">
          <div><b>${lessonsToday}</b><span>${lessonsToday === 1 ? 'пара' : 'пары'}</span></div>
          <div><b>${dueToday}</b><span>дедлайна</span></div>
          <div><b>${cards.length}</b><span>карточек</span></div>
        </div>
        <button class="btn" data-tab="schedule">Открыть расписание</button>
      </div>

      <div class="section-h"><h2>Ближайшие дедлайны</h2><button class="link" data-tab="tasks">Все</button></div>
      ${nearest.length
        ? `<ul class="list">${nearest.map(taskCardHtml).join('')}</ul>`
        : '<div class="empty">Активных задач нет. Самое время добавить новую!</div>'}

      <div class="section-h" style="margin-top:22px"><h2>Прогресс недели</h2></div>
      <div class="card week-prog">
        <div class="donut" style="background:conic-gradient(var(--primary) ${stats.percent * 3.6}deg, #e4e6f7 0)"
             role="img" aria-label="${stats.percent}%"><span>${stats.percent}%</span></div>
        <dl>
          <div><dt>Задачи выполнено</dt><dd>${stats.done}/${stats.total}</dd></div>
          <div><dt>Карточек повторено</dt><dd>${reviewed}/${cards.length}</dd></div>
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
    return `<div class="empty">Пока нет задач.<br>Добавьте первую или загрузите примеры.<br>
            <button class="btn btn-ghost btn-sm" data-act="demo">Загрузить примеры</button></div>`;
  }
  const list = visibleTasks(tasks, settings);
  if (!list.length) return '<div class="empty">В этом разделе задач нет.</div>';
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
  if (!result.saved) showToast(SAVE_ERROR);
  ['tTitle', 'tSubject', 'tDeadline'].forEach((id) => {
    document.getElementById(id).value = '';
  });
  document.getElementById('tPrio').value = 'medium';
  refreshTaskList();
  showToast('Задача добавлена');
  document.getElementById('tTitle').focus();
}

export function renderTasks(root) {
  const { settings, tasks } = getState();
  const filterButtons = FILTERS.map(
    (f) => `<button data-filter="${f.id}" aria-pressed="${settings.filter === f.id}">${f.label}</button>`
  ).join('');
  const sortOptions = SORTS.map(
    (s) => `<option value="${s.id}"${settings.sort === s.id ? ' selected' : ''}>${s.label}</option>`
  ).join('');

  render(root, `
    <section class="screen with-nav" aria-label="Задачи">
      <header class="top"><h1>Задачи</h1></header>
      <div id="progressBox">${progressBoxHtml(calcProgress(tasks))}</div>

      <details class="card form-card" open>
        <summary>Новая задача ${icon('plus')}</summary>
        <form id="taskForm" novalidate>
          <div class="field">
            <label for="tTitle">Название</label>
            <input class="input" id="tTitle" maxlength="140" placeholder="Например: Реферат по истории">
            <p class="error" data-err="tTitle"></p>
          </div>
          <div class="row2">
            <div class="field">
              <label for="tSubject">Предмет</label>
              <input class="input" id="tSubject" placeholder="История">
            </div>
            <div class="field">
              <label for="tPrio">Приоритет</label>
              <select class="input" id="tPrio">
                <option value="high">Высокий</option>
                <option value="medium" selected>Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="tDeadline">Дедлайн</label>
            <input class="input" id="tDeadline" type="datetime-local">
            <p class="error" data-err="tDeadline"></p>
          </div>
          <button class="btn btn-primary" type="submit">Добавить задачу</button>
        </form>
      </details>

      <div class="toolbar">
        <div class="seg" role="group" aria-label="Фильтр задач">${filterButtons}</div>
        <label class="sr-only" for="sortSel">Сортировка</label>
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