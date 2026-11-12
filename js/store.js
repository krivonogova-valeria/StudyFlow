import { read, write, loadTasks } from './storage.js';
import { DEFAULT_SCHEDULE } from './scheduleData.js';

const session = read('session', null);

const state = {
  screen: session ? 'app' : read('onboarded', false) ? 'welcome' : 'onboarding',
  slide: 0,
  tab: 'home',
  user: session,
  tasks: loadTasks(),
  settings: { filter: 'all', sort: 'deadline', ...read('settings', {}) },
  schedule: read('schedule', DEFAULT_SCHEDULE),
  cards: read('cards', []),
  activity: read('activity', [])
};

const STORAGE_KEYS = {
  tasks: 'tasks',
  settings: 'settings',
  schedule: 'schedule',
  cards: 'cards',
  activity: 'activity',
  user: 'session'
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch, notify = true) {
  Object.assign(state, patch);
  if (notify) listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function persist(...names) {
  return names.every((name) => write(STORAGE_KEYS[name], state[name]));
}