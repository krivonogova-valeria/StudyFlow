const MONTHS_SHORT = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
const pad2 = (n) => String(n).padStart(2, '0');

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

export function makeId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function dayKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function isSameDay(a, b) {
  return dayKey(a) === dayKey(b);
}

export function formatLongDate(date) {
  return capitalize(date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }));
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0] || '?').charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();
}

export function formatDeadline(iso, now = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  if (isSameDay(d, now)) return `Сегодня, ${time}`;
  if (isSameDay(d, tomorrow)) return `Завтра, ${time}`;
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}, ${time}`;
}

export function isOverdue(task, now = new Date()) {
  if (task.status === 'done') return false;
  const t = new Date(task.deadline).getTime();
  return !Number.isNaN(t) && t < now.getTime();
}

export function timeLeft(task, now = new Date()) {
  const diff = new Date(task.deadline).getTime() - now.getTime();
  if (Number.isNaN(diff)) return '';
  const minutes = Math.floor(Math.abs(diff) / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const text = days >= 1 ? `${days} дн.` : hours >= 1 ? `${hours} ч.` : `${Math.max(minutes, 1)} мин.`;
  return diff < 0 ? `Просрочено на ${text}` : `Осталось ${text}`;
}

export function streak(dates, now = new Date()) {
  const set = new Set(dates || []);
  const cur = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!set.has(dayKey(cur))) cur.setDate(cur.getDate() - 1);
  let count = 0;
  while (set.has(dayKey(cur))) {
    count++;
    cur.setDate(cur.getDate() - 1);
  }
  return count;
}