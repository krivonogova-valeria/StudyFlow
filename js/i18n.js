const LANG_KEY = 'studiflow-lang';
const LANGS = ['ru', 'en', 'kk'];

export const LANG_NAMES = { ru: 'Русский', en: 'English', kk: 'Қазақша' };
export const LANG_LIST = LANGS;

const DICT = {
  ru: {
    'nav.home': 'Главная',
    'nav.schedule': 'Расписание',
    'nav.tasks': 'Задачи',
    'nav.cards': 'Карточки',
    'nav.profile': 'Профиль',
    'common.soon': 'Этот раздел появится на следующем шаге.',

    'home.hello': 'Привет, {name}',
    'home.friend': 'друг',
    'home.today': 'Сегодня',
    'home.lesson1': 'пара',
    'home.lessonN': 'пары',
    'home.deadlines': 'дедлайна',
    'home.cards': 'карточек',
    'home.openSchedule': 'Открыть расписание',
    'home.nearest': 'Ближайшие дедлайны',
    'home.all': 'Все',
    'home.noActive': 'Активных задач нет. Самое время добавить новую!',
    'home.week': 'Прогресс недели',
    'home.tasksDone': 'Задачи выполнено',
    'home.cardsReviewed': 'Карточек повторено',
    'home.notes': 'Заметки',
    'home.openProfile': 'Открыть профиль',

    't.title': 'Задачи',
    't.new': 'Новая задача',
    't.name': 'Название',
    't.namePh': 'Например: Реферат по истории',
    't.subject': 'Предмет',
    't.subjectPh': 'Выберите или введите',
    't.priority': 'Приоритет',
    't.high': 'Высокий',
    't.medium': 'Средний',
    't.low': 'Низкий',
    't.deadline': 'Дедлайн',
    't.add': 'Добавить задачу',
    't.empty': 'Пока нет задач.<br>Добавьте первую или загрузите примеры.',
    't.demo': 'Загрузить примеры',
    't.emptySection': 'В этом разделе задач нет.',
    't.sort': 'Сортировка',
    't.filter': 'Фильтр задач',
    't.added': 'Задача добавлена',
    't.deleted': 'Задача удалена',
    't.markDone': 'Отметить выполненной',
    't.prioHint': 'Нажмите, чтобы изменить',
    't.delete': 'Удалить',
    't.saveError': 'Не удалось сохранить данные (хранилище недоступно)',

    'p.days': 'дн.',
    'p.streak': 'Стрик',
    'p.tasks': 'Задач',
    'p.subjects': 'Предметов',
    'p.achievements': 'Достижения',
    'p.a1': 'Первый дедлайн',
    'p.a2': '7 дней подряд',
    'p.a3': '10 задач',
    'p.bySubject': 'Прогресс по предметам',
    'p.bySubjectEmpty': 'Добавьте задачи с предметами, и здесь появится прогресс.',
    'p.settings': 'Настройки',
    'p.notif': 'Уведомления',
    'p.notifOn': 'Уведомления включены',
    'p.notifOff': 'Уведомления выключены',
    'p.theme': 'Тема',
    'p.themeDefault': 'Базовая',
    'p.themeRose': 'Роза',
    'p.themeDark': 'Нуар',
    'p.lang': 'Язык',
    'p.logout': 'Выйти',
    'p.edit': 'Редактировать профиль',
    'p.fullName': 'Имя и фамилия',
    'p.group': 'Группа',
    'p.groupOf': 'Группа {group}',
    'p.noGroup': 'Группа не указана',
    'p.cancel': 'Отмена',
    'p.save': 'Сохранить',
    'p.removePhoto': 'Удалить фото',
    'p.changePhoto': 'Изменить фото',
    'p.photoUpdated': 'Фото обновлено',
    'p.photoRemoved': 'Фото удалено',
    'p.photoError': 'Не удалось загрузить фото',
    'p.photoPick': 'Выберите изображение',
    'p.updated': 'Профиль обновлён',
    'p.enterName': 'Введите имя'
  },

  en: {
    'nav.home': 'Home',
    'nav.schedule': 'Schedule',
    'nav.tasks': 'Tasks',
    'nav.cards': 'Cards',
    'nav.profile': 'Profile',
    'common.soon': 'This section is coming in the next step.',

    'home.hello': 'Hi, {name}',
    'home.friend': 'friend',
    'home.today': 'Today',
    'home.lesson1': 'class',
    'home.lessonN': 'classes',
    'home.deadlines': 'deadlines',
    'home.cards': 'cards',
    'home.openSchedule': 'Open schedule',
    'home.nearest': 'Upcoming deadlines',
    'home.all': 'All',
    'home.noActive': 'No active tasks. Time to add a new one!',
    'home.week': 'Weekly progress',
    'home.tasksDone': 'Tasks done',
    'home.cardsReviewed': 'Cards reviewed',
    'home.notes': 'Notes',
    'home.openProfile': 'Open profile',

    't.title': 'Tasks',
    't.new': 'New task',
    't.name': 'Title',
    't.namePh': 'For example: History essay',
    't.subject': 'Subject',
    't.subjectPh': 'Choose or type',
    't.priority': 'Priority',
    't.high': 'High',
    't.medium': 'Medium',
    't.low': 'Low',
    't.deadline': 'Deadline',
    't.add': 'Add task',
    't.empty': 'No tasks yet.<br>Add your first one or load examples.',
    't.demo': 'Load examples',
    't.emptySection': 'No tasks in this section.',
    't.sort': 'Sort',
    't.filter': 'Task filter',
    't.added': 'Task added',
    't.deleted': 'Task deleted',
    't.markDone': 'Mark as done',
    't.prioHint': 'Tap to change',
    't.delete': 'Delete',
    't.saveError': 'Could not save data (storage unavailable)',

    'p.days': 'days',
    'p.streak': 'Streak',
    'p.tasks': 'Tasks',
    'p.subjects': 'Subjects',
    'p.achievements': 'Achievements',
    'p.a1': 'First deadline',
    'p.a2': '7 days in a row',
    'p.a3': '10 tasks',
    'p.bySubject': 'Progress by subject',
    'p.bySubjectEmpty': 'Add tasks with subjects and your progress will appear here.',
    'p.settings': 'Settings',
    'p.notif': 'Notifications',
    'p.notifOn': 'Notifications on',
    'p.notifOff': 'Notifications off',
    'p.theme': 'Theme',
    'p.themeDefault': 'Default',
    'p.themeRose': 'Rose',
    'p.themeDark': 'Noir',
    'p.lang': 'Language',
    'p.logout': 'Log out',
    'p.edit': 'Edit profile',
    'p.fullName': 'Full name',
    'p.group': 'Group',
    'p.groupOf': 'Group {group}',
    'p.noGroup': 'Group not set',
    'p.cancel': 'Cancel',
    'p.save': 'Save',
    'p.removePhoto': 'Remove photo',
    'p.changePhoto': 'Change photo',
    'p.photoUpdated': 'Photo updated',
    'p.photoRemoved': 'Photo removed',
    'p.photoError': 'Could not upload the photo',
    'p.photoPick': 'Choose an image',
    'p.updated': 'Profile updated',
    'p.enterName': 'Enter your name'
  },

  kk: {
    'nav.home': 'Басты бет',
    'nav.schedule': 'Кесте',
    'nav.tasks': 'Тапсырмалар',
    'nav.cards': 'Карточкалар',
    'nav.profile': 'Профиль',
    'common.soon': 'Бұл бөлім келесі қадамда пайда болады.',

    'home.hello': 'Сәлем, {name}',
    'home.friend': 'дос',
    'home.today': 'Бүгін',
    'home.lesson1': 'сабақ',
    'home.lessonN': 'сабақ',
    'home.deadlines': 'дедлайн',
    'home.cards': 'карточка',
    'home.openSchedule': 'Кестені ашу',
    'home.nearest': 'Жақын дедлайндар',
    'home.all': 'Барлығы',
    'home.noActive': 'Белсенді тапсырмалар жоқ. Жаңасын қосатын кез!',
    'home.week': 'Апта прогресі',
    'home.tasksDone': 'Орындалған тапсырмалар',
    'home.cardsReviewed': 'Қайталанған карточкалар',
    'home.notes': 'Жазбалар',
    'home.openProfile': 'Профильді ашу',

    't.title': 'Тапсырмалар',
    't.new': 'Жаңа тапсырма',
    't.name': 'Атауы',
    't.namePh': 'Мысалы: Тарихтан реферат',
    't.subject': 'Пән',
    't.subjectPh': 'Таңдаңыз немесе енгізіңіз',
    't.priority': 'Басымдық',
    't.high': 'Жоғары',
    't.medium': 'Орташа',
    't.low': 'Төмен',
    't.deadline': 'Дедлайн',
    't.add': 'Тапсырма қосу',
    't.empty': 'Әзірге тапсырмалар жоқ.<br>Біріншісін қосыңыз немесе мысалдарды жүктеңіз.',
    't.demo': 'Мысалдарды жүктеу',
    't.emptySection': 'Бұл бөлімде тапсырмалар жоқ.',
    't.sort': 'Сұрыптау',
    't.filter': 'Тапсырмаларды сүзу',
    't.added': 'Тапсырма қосылды',
    't.deleted': 'Тапсырма жойылды',
    't.markDone': 'Орындалды деп белгілеу',
    't.prioHint': 'Өзгерту үшін басыңыз',
    't.delete': 'Жою',
    't.saveError': 'Деректерді сақтау мүмкін болмады (сақтау орны қолжетімсіз)',

    'p.days': 'күн',
    'p.streak': 'Серия',
    'p.tasks': 'Тапсырма',
    'p.subjects': 'Пән',
    'p.achievements': 'Жетістіктер',
    'p.a1': 'Алғашқы дедлайн',
    'p.a2': '7 күн қатарынан',
    'p.a3': '10 тапсырма',
    'p.bySubject': 'Пәндер бойынша прогресс',
    'p.bySubjectEmpty': 'Пәні бар тапсырмаларды қосыңыз, прогресс осында пайда болады.',
    'p.settings': 'Баптаулар',
    'p.notif': 'Хабарландырулар',
    'p.notifOn': 'Хабарландырулар қосылды',
    'p.notifOff': 'Хабарландырулар өшірілді',
    'p.theme': 'Тақырып',
    'p.themeDefault': 'Негізгі',
    'p.themeRose': 'Раушан',
    'p.themeDark': 'Нуар',
    'p.lang': 'Тіл',
    'p.logout': 'Шығу',
    'p.edit': 'Профильді өңдеу',
    'p.fullName': 'Аты-жөні',
    'p.group': 'Топ',
    'p.groupOf': 'Топ {group}',
    'p.noGroup': 'Топ көрсетілмеген',
    'p.cancel': 'Бас тарту',
    'p.save': 'Сақтау',
    'p.removePhoto': 'Фотоны жою',
    'p.changePhoto': 'Фотоны өзгерту',
    'p.photoUpdated': 'Фото жаңартылды',
    'p.photoRemoved': 'Фото жойылды',
    'p.photoError': 'Фотоны жүктеу мүмкін болмады',
    'p.photoPick': 'Сурет таңдаңыз',
    'p.updated': 'Профиль жаңартылды',
    'p.enterName': 'Атыңызды енгізіңіз'
  }
};

let current = 'ru';

export function getLang() {
  return current;
}

export function initLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (LANGS.includes(saved)) current = saved;
  } catch {}
  document.documentElement.lang = current;
}

export function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  current = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
  document.documentElement.lang = lang;
}

export function t(key, params = {}) {
  const raw = DICT[current][key] ?? DICT.ru[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : ''));
}

export function longDate(date) {
  const locale = { ru: 'ru-RU', en: 'en-US', kk: 'kk-KZ' }[current];
  const s = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}