import { PRIORITIES } from './task.js';

export const MAX_TITLE = 120;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateTask(input = {}) {
  const errors = {};
  const title = typeof input.title === 'string' ? input.title.trim() : '';

  if (!title) errors.title = 'Введите название задачи';
  else if (title.length > MAX_TITLE) errors.title = `Название слишком длинное (максимум ${MAX_TITLE})`;

  if (!input.deadline) errors.deadline = 'Укажите дедлайн';
  else if (Number.isNaN(new Date(input.deadline).getTime())) errors.deadline = 'Некорректная дата';

  if (input.priority && !PRIORITIES.includes(input.priority)) errors.priority = 'Неизвестный приоритет';

  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateRegister({ name = '', email = '', password = '' }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Введите имя';
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Введите корректный email';
  if (password.length < 6) errors.password = 'Пароль должен быть не короче 6 символов';
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateLogin({ email = '', password = '' }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Введите email';
  if (!password) errors.password = 'Введите пароль';
  return { ok: Object.keys(errors).length === 0, errors };
}