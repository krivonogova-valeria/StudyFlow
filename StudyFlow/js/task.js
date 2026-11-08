import { makeId } from './utils.js';

export const PRIORITIES = ['high', 'medium', 'low'];
export const PRIORITY_LABEL = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
export const STATUS = { ACTIVE: 'active', DONE: 'done' };

export function createTask({ title, subject = '', deadline, priority = 'medium' }) {
  return {
    id: makeId('t'),
    title: title.trim(),
    subject: (subject || '').trim(),
    deadline,
    priority,
    status: STATUS.ACTIVE,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
}

export function nextPriority(priority) {
  return PRIORITIES[(PRIORITIES.indexOf(priority) + 1) % PRIORITIES.length];
}