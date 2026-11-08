import { getState, setState, persist } from './store.js';
import { createTask, nextPriority, PRIORITIES, STATUS } from './task.js';
import { validateTask } from './validator.js';
import { dayKey } from './utils.js';

function save(tasks) {
  setState({ tasks }, false);
  return persist('tasks');
}

export function markActivity() {
  const { activity } = getState();
  const key = dayKey(new Date());
  if (!activity.includes(key)) {
    setState({ activity: [...activity, key] }, false);
    persist('activity');
  }
}

export function addTask(input) {
  const check = validateTask(input);
  if (!check.ok) return { ok: false, errors: check.errors };
  const saved = save([...getState().tasks, createTask(input)]);
  return { ok: true, saved };
}

export function toggleTask(id) {
  let becameDone = false;
  const tasks = getState().tasks.map((t) => {
    if (t.id !== id) return t;
    becameDone = t.status !== STATUS.DONE;
    return {
      ...t,
      status: becameDone ? STATUS.DONE : STATUS.ACTIVE,
      completedAt: becameDone ? new Date().toISOString() : null
    };
  });
  const saved = save(tasks);
  if (becameDone) markActivity();
  return saved;
}

export function removeTask(id) {
  return save(getState().tasks.filter((t) => t.id !== id));
}

export function changePriority(id, priority) {
  if (!PRIORITIES.includes(priority)) return true;
  return save(getState().tasks.map((t) => (t.id === id ? { ...t, priority } : t)));
}

export function cyclePriority(id) {
  const task = getState().tasks.find((t) => t.id === id);
  return task ? changePriority(id, nextPriority(task.priority)) : true;
}

export function addDemoTasks() {
  const at = (days, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${dayKey(d)}T${String(hour).padStart(2, '0')}:00`;
  };
  const demo = [
    ['Реферат по истории Казахстана', 'История Казахстана', at(0, 18), 'high'],
    ['Домашнее задание №7', 'Математика', at(1, 12), 'medium'],
    ['Лабораторная по алгоритмам', 'Программирование', at(3, 10), 'high'],
    ['Эссе на английском', 'Английский', at(5, 20), 'low'],
    ['Конспект лекции 4', 'Математика', at(-1, 9), 'medium']
  ];
  const created = demo.map(([title, subject, deadline, priority]) =>
    createTask({ title, subject, deadline, priority })
  );
  return save([...getState().tasks, ...created]);
}