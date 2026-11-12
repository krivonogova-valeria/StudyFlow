export const ICONS = {
  home: 'house',
  schedule: 'calendar',
  tasks: 'list-checks',
  cards: 'layers',
  profile: 'user',
  flag: 'flag',
  trash: 'trash-2',
  check: 'check',
  eye: 'eye',
  eyeOff: 'eye-off',
  back: 'arrow-left',
  prev: 'chevron-left',
  next: 'chevron-right',
  plus: 'plus',
  edit: 'pencil',
  clock: 'clock',
  warning: 'triangle-alert',
  streak: 'flame',
  done: 'circle-check',
  brain: 'brain',
  target: 'target'
};

export function icon(name, extraClass = '') {
  return `<i data-lucide="${ICONS[name] ?? name}" class="${extraClass}"></i>`;
}

export function renderIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { 'aria-hidden': 'true' } });
}