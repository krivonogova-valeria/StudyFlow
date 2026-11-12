import { STATUS } from './task.js';

export function calcProgress(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === STATUS.DONE).length;
  return {
    total,
    done,
    active: total - done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100)
  };
}

export function progressBoxHtml(stats) {
  return `
    <div class="card progress-card">
      <div class="progress-row"><span>Прогресс</span><span>${stats.percent}% · ${stats.done} из ${stats.total}</span></div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
           aria-valuenow="${stats.percent}" aria-label="Выполнено задач">
        <i style="width:${stats.percent}%"></i>
      </div>
    </div>`;
}

export function renderProgress(box, stats) {
  const prev = box.querySelector('.bar > i')?.style.width || '0%';
  box.innerHTML = progressBoxHtml(stats);
  const bar = box.querySelector('.bar > i');
  bar.style.width = prev;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      bar.style.width = `${stats.percent}%`;
    })
  );
}

export function subjectProgress(tasks) {
  const map = new Map();
  tasks.forEach((t) => {
    const name = t.subject || 'Без предмета';
    const item = map.get(name) ?? { subject: name, done: 0, total: 0 };
    item.total += 1;
    if (t.status === STATUS.DONE) item.done += 1;
    map.set(name, item);
  });
  return [...map.values()].map((i) => ({ ...i, percent: Math.round((i.done / i.total) * 100) }));
}