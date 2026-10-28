/* QKCcode — курс «QKC Engine: как устроен тренажёр» (4 урока).
   О самом движке, на котором работают тесты этого сайта. */
(function () {
  window.QCOURSES = window.QCOURSES || [];
  window.QCOURSES.push({
    id: 'qkc',
    title: 'QKC Engine',
    tag: 'движок OuRi · практика',
    dialect: 'javascript',
    level: 'продвинутый',
    desc: 'Как устроен открытый движок викторин, на котором работают тесты QKCcode и тренажёр QKC на 42 823 вопроса. Формат банка, seed, оценка, встраивание.',
    intro: 'QKC Engine — открытый движок викторин компании OuRi: ноль зависимостей, один файл, MIT. Он собирает тесты из банка вопросов (детерминированно — один seed даёт один и тот же тест), проверяет ответы, считает статистику по темам и рисует виджет. Все тесты в уроках QKCcode собраны именно им. Документация: engine.qkc.runs-on.dev.',
    icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>',
    lessons: [
      {
        t: 'Что такое движок викторин',
        goal: 'понять, зачем тестам отдельный движок и что он умеет.',
        blocks: [
          ['h', 'Проблема'],
          ['p', 'Тренажёр QKC содержит **42 823 вопроса** по школьной программе с 1 по 11 класс. Чтобы собирать из них тесты, проверять ответы и показывать статистику, нужен отдельный слой — **движок**. Он отделён от данных и от интерфейса: движок не знает ни про школу, ни про HTML.'],
          ['h', 'Что умеет QKC Engine'],
          ['list', [
            '**собирать тест** из банка: фильтр по классу/предмету/четверти/темам + количество вопросов + seed',
            '**детерминированность**: один seed → один и тот же тест, до порядка вариантов ответов',
            '**оценивать**: процент, разбивка по темам, верно/неверно/пропущено',
            '**рисовать виджет** `QKC.init(...)`: режимы normal/exam/sprint, темы bw/light/dark, RU/EN',
            '**валидировать банк**: структурная проверка вопросов до запуска'
          ]],
          ['h', 'Один файл, ноль зависимостей'],
          ['p', 'Весь движок — один JS-файл (UMD): работает в браузере через `<script>`, в Node через `require`, есть ESM-сборка и пакет npm. Тесты QKCcode, которые ты проходишь в конце каждого урока, — это живой `QKC.init()`.'],
          ['code', { lang: 'javascript', code: '// банк вопросов — обычный массив\nlet bank = [\n  { t: "2 + 2 = ?", ty: "choice", o: ["3", "4", "5"], c: "4", e: "База.", tp: "math" }\n];\nconsole.log("Вопросов в банке:", bank.length);', out: 'Вопросов в банке: 1' }]
        ],
        task: {
          kind: 'code',
          prompt: 'В тренажёре QKC 42 823 вопроса. Объяви `let questions = 42823;` и выведи строку вида `"Вопросов: 42823"` (склейка строки и числа).',
          start: '// переменная и вывод\n',
          expect: ['Вопросов: 42823'],
          hint: 'console.log("Вопросов: " + questions) — строка + число даст строку.',
          solution: 'let questions = 42823;\nconsole.log("Вопросов: " + questions);'
        },
        quiz: [
          { t: 'Что гарантирует одинаковый seed теста?', ty: 'choice', o: ['случайные вопросы каждый раз', 'один и тот же набор и порядок вопросов', 'более сложный тест', 'сохранение прогресса'], c: 'один и тот же набор и порядок вопросов', e: 'Детерминированная сборка: seed полностью определяет тест.', tp: 'qkc-1' },
          { t: 'Сколько зависимостей у QKC Engine?', ty: 'input', c: '0', e: 'Ноль. Один файл, чистый JavaScript.', tp: 'qkc-1' },
          { t: 'QKC.init() рисует виджет викторины на странице.', ty: 'bool', c: 'true', e: 'Это второй слой движка: embeddable-виджет со своим CSS.', tp: 'qkc-1' }
        ]
      },
      {
        t: 'Формат вопроса и банка',
        goal: 'выучить поля вопроса: t, ty, o, c, e, tp.',
        blocks: [
          ['h', 'Вопрос — это объект'],
          ['table', { head: ['поле', 'тип', 'смысл'], rows: [
            ['`t`', 'string', 'текст вопроса'],
            ['`ty`', 'choice / bool / input', 'тип ответа'],
            ['`o`', 'string[]', 'варианты (для choice)'],
            ['`c`', 'string', 'правильный ответ'],
            ['`e`', 'string', 'объяснение после проверки'],
            ['`tp`', 'string', 'тема — для фильтров и статистики']
          ] }],
          ['code', { lang: 'javascript', code: 'let q = {\n  t: "Столица Франции?",\n  ty: "choice",\n  o: ["Лондон", "Париж", "Берлин"],\n  c: "Париж",\n  e: "Париж — столица Франции с X века.",\n  tp: "geography"\n};\nconsole.log(q.ty, q.c);', out: 'choice Париж' }],
          ['h', 'Банк — массив или контейнер'],
          ['p', 'Банк — массив таких объектов. Большой банк QKC хранится как контейнер `класс → предмет → четверть → вопросы`, движок умеет и то, и другое: `toArray()` превращает контейнер в плоский список.'],
          ['note', 'Сравнение ответов нормализуется: лишние пробелы, регистр и запятая-точка в числах не мешают. Ответ «4,0» засчитается как «4».']
        ],
        task: {
          kind: 'code',
          prompt: 'Создай объект `q` — вопрос типа `bool` с текстом `"QKC Engine написан на JavaScript"`, правильным ответом `"true"` и темой `"engine"`. Выведи через пробел `q.ty` и `q.tp`.',
          start: '// объект вопроса\n\n// вывод: ty tp\n',
          expect: ['bool engine'],
          hint: 'console.log(q.ty, q.tp) — два аргумента печатаются через пробел.',
          solution: 'let q = {\n  t: "QKC Engine написан на JavaScript",\n  ty: "bool",\n  c: "true",\n  e: "Чистый vanilla JS, без зависимостей.",\n  tp: "engine"\n};\nconsole.log(q.ty, q.tp);'
        },
        quiz: [
          { t: 'В каком поле вопроса хранится правильный ответ?', ty: 'input', c: 'c', e: 'c = correct. t — текст, o — варианты, e — объяснение.', tp: 'qkc-2' },
          { t: 'Тип вопроса «выбрать один вариант» — …', ty: 'input', c: 'choice', e: 'ty: "choice" | "bool" | "input".', tp: 'qkc-2' },
          { t: 'Поле tp нужно для порядка вопросов.', ty: 'bool', c: 'false', e: 'tp — тема: по ней фильтруют тесты и считают статистику.', tp: 'qkc-2' }
        ]
      },
      {
        t: 'Сборка теста и оценка',
        goal: 'headless-API: engine(), build(), score(), validate().',
        blocks: [
          ['h', 'Движок без интерфейса'],
          ['p', 'Headless-слой — функции для сборки и оценки. Виджет не обязателен: движок можно использовать на сервере или в тестах.'],
          ['code', { lang: 'javascript', code: '// так это выглядит в коде (здесь — псевдо-демо):\n// const eng  = QKC.engine(bank);\n// const test = eng.build({ count: 10, seed: "demo" });\n// const res  = eng.score(test, answers);\n// res → { correct, wrong, skip, total, pct, perTopic }\n\nlet correct = 8;\nlet total = 10;\nlet pct = correct / total * 100;\nconsole.log(pct + "%");', out: '80%' }],
          ['h', 'Что возвращает score'],
          ['list', [
            '`correct / wrong / skip / total` — счётчики ответов',
            '`pct` — процент верных (округлённый)',
            '`perTopic` — точность по каждой теме `tp`: видно, что повторить',
            '`validate()` — проверка структуры банка: `{ ok, errors[] }`'
          ]],
          ['h', 'Три режима виджета'],
          ['table', { head: ['режим', 'смысл'], rows: [
            ['`normal`', 'сразу проверяет каждый ответ и показывает объяснение'],
            ['`exam`', 'проверка только в конце — как настоящий экзамен'],
            ['`sprint`', 'таймер на каждый вопрос — скорость решает']
          ] }]
        ],
        task: {
          kind: 'code',
          prompt: 'Посчитай процент: `let correct = 17; let total = 20;` — выведи `"Процент: 85%"`, склеив строку с вычисленным значением (correct / total * 100).',
          start: '// переменные\n\n// вывод процента\n',
          expect: ['Процент: 85%'],
          hint: 'console.log("Процент: " + (correct / total * 100) + "%")',
          solution: 'let correct = 17;\nlet total = 20;\nconsole.log("Процент: " + (correct / total * 100) + "%");'
        },
        quiz: [
          { t: 'Какой метод проверяет структуру банка?', ty: 'input', c: 'validate', e: 'eng.validate() → { ok, errors[] }.', tp: 'qkc-3' },
          { t: 'Режим, где ответы проверяются только в конце, — …', ty: 'input', c: 'exam', e: 'exam — экзамен; normal проверяет сразу.', tp: 'qkc-3' },
          { t: 'perTopic показывает точность по темам вопросов.', ty: 'bool', c: 'true', e: 'Разбивка по tp — видно, какие темы проседают.', tp: 'qkc-3' }
        ]
      },
      {
        t: 'Встраивание в страницу',
        goal: 'подключить движок к своему сайту одним тегом script.',
        blocks: [
          ['h', 'Подключение'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<!-- 1. подключить движок -->\n<script src="https://spaj7468-cell.github.io/qkc-engine/engine.js"></script>\n\n<!-- 2. дать ему место на странице -->\n<div id="quiz"></div>\n\n<!-- 3. собрать тест -->\n<script>\n  QKC.init({\n    bank: [\n      { t: "2+2?", ty: "choice", o: ["3","4","5"], c: "4", e: "База.", tp: "math" }\n    ],\n    el: "#quiz",\n    theme: "bw",\n    lang: "ru"\n  });\n</script>' }],
          ['h', 'Способы установки'],
          ['list', [
            '`<script src="engine.js">` — файл с GitHub Pages или своего хостинга',
            '`npm install qkc-engine` + `import QKC from "qkc-engine"` — для сборок',
            'скопировать `src/core.js` к себе — движок самодостаточен',
            'работает и в Node: headless-сборка тестов на сервере'
          ]],
          ['h', 'Где посмотреть всё сразу'],
          ['p', 'Полная документация с API-справочником, REPL и песочницей — на сайте движка: [engine.qkc.runs-on.dev](https://engine.qkc.runs-on.dev/). Короткий адрес уже работает: `https://engine.qkc.runs-on.dev/` (claim [runs-on.dev#310](https://github.com/zordhalo/runs-on.dev/pull/310) смержен).'],
          ['note', 'Экзамены курсов QKCcode собираются этим же движком в режиме exam — можешь открыть DevTools и увидеть виджет QKC в DOM.']
        ],
        task: {
          kind: 'html',
          prompt: 'Каркас страницы с виджетом: `<div id="quiz">`, подключённый `<script src="engine.js">` и вызов `QKC.init` внутри второго `<script>` (проверяется структура, не выполнение).',
          start: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Мой тест</title>\n  <!-- подключи движок здесь -->\n</head>\n<body>\n  <!-- контейнер для виджета -->\n  <!-- вызов QKC.init здесь -->\n</body>\n</html>\n',
          checks: [
            { re: '<script[^>]+src="[^"]*engine[^"]*"', msg: '<script src="…engine…"> подключён' },
            { re: '<div[^>]+id="quiz"', msg: 'есть <div id="quiz">' },
            { re: 'QKC\\.init\\s*\\(', msg: 'есть вызов QKC.init(…)' }
          ],
          hint: 'Скрипт подключения — в head или перед </body>. QKC.init({ bank: [...], el: "#quiz" }) — во втором <script>.',
          solution: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Мой тест</title>\n  <script src="engine.js"></script>\n</head>\n<body>\n  <div id="quiz"></div>\n  <script>\n    QKC.init({\n      bank: [{ t: "2+2?", ty: "choice", o: ["3","4","5"], c: "4", e: "База.", tp: "math" }],\n      el: "#quiz",\n      theme: "bw",\n      lang: "ru"\n    });\n  </script>\n</body>\n</html>\n'
        },
        quiz: [
          { t: 'В какой опции QKC.init задаётся массив вопросов?', ty: 'input', c: 'bank', e: 'bank — банк; el — куда вставить виджет.', tp: 'qkc-4' },
          { t: 'Как называется npm-пакет движка?', ty: 'input', c: 'qkc-engine', e: 'npm install qkc-engine.', tp: 'qkc-4' },
          { t: 'Виджет QKC требует React или Vue.', ty: 'bool', c: 'false', e: 'Никаких фреймворков: чистый JS, свой CSS инжектится сам.', tp: 'qkc-4' }
        ]
      }
    ]
  });
})();
