const PREFIX = 'studyflow:';

export function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
  }
}

export function loadTasks() {
  const data = read('tasks', []);
  if (!Array.isArray(data)) return [];
  return data
    .filter((t) => t && typeof t.id === 'string' && typeof t.title === 'string' && t.deadline)
    .map((t) => ({ priority: 'medium', status: 'active', subject: '', ...t }));
}