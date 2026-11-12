import { isOverdue } from './utils.js';
import { PRIORITY_RANK, STATUS } from './task.js';

export const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'active', label: 'Активные' },
  { id: 'done', label: 'Выполненные' }
];

export const SORTS = [
  { id: 'deadline', label: 'По дедлайну' },
  { id: 'priority', label: 'По приоритету' },
  { id: 'urgent', label: 'Срочные сначала' }
];

export function filterTasks(tasks, filter) {
  if (filter === 'active') return tasks.filter((t) => t.status !== STATUS.DONE);
  if (filter === 'done') return tasks.filter((t) => t.status === STATUS.DONE);
  return [...tasks];
}

const time = (t) => new Date(t.deadline).getTime();

export function sortTasks(tasks, by, now = new Date()) {
  const byDeadline = (a, b) => time(a) - time(b);
  const byPriority = (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  const comparators = {
    deadline: (a, b) => byDeadline(a, b) || byPriority(a, b),
    priority: (a, b) => byPriority(a, b) || byDeadline(a, b),
    urgent: (a, b) =>
      (a.status === STATUS.DONE) - (b.status === STATUS.DONE) ||
      (!isOverdue(a, now)) - (!isOverdue(b, now)) ||
      byDeadline(a, b)
  };
  return [...tasks].sort(comparators[by] ?? comparators.deadline);
}

export function visibleTasks(tasks, { filter, sort }) {
  return sortTasks(filterTasks(tasks, filter), sort);
}