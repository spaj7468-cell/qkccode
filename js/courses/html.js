/* QKCcode — курс «HTML и CSS: разметка с нуля» (6 уроков) */
(function () {
  window.QCOURSES = window.QCOURSES || [];
  window.QCOURSES.push({
    id: 'html',
    title: 'HTML и CSS',
    tag: 'разметка · веб',
    dialect: 'html',
    level: 'с нуля',
    desc: 'Разметка страниц: теги, списки, ссылки, таблицы, формы и первый CSS. Задания проверяются живым предпросмотром.',
    intro: 'HTML — язык разметки, из которого сделана каждая страница в интернете. Этот сайт, документация QKC Engine и страница OuRi Corp — всё это HTML + CSS. Курс учит писать разметку руками: каждый урок даёт теорию, примеры и задание с живым предпросмотром.',
    icon: '<svg viewBox="0 0 24 24"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6M13.5 4l-3 16"/></svg>',
    lessons: [
      {
        t: 'Что такое HTML. Первая страница',
        goal: 'понять, что такое теги и элементы, и собрать первую страницу из заголовка и абзаца.',
        blocks: [
          ['h', 'Не язык программирования, а язык разметки'],
          ['p', '**HTML** (HyperText Markup Language) не умеет считать и принимать решения — он объясняет браузеру, **что** находится на странице: заголовок, абзац, картинка, ссылка. Страница — это дерево **элементов**, а каждый элемент записывается **тегами**.'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<h1>Заголовок страницы</h1>\n<p>Обычный абзац текста. Теги чаще всего парные: открывающий и закрывающий.</p>' }],
          ['p', 'Парные теги: `<p>текст</p>`. Одиночные: `<img>`, `<br>`, `<input>`. В открывающий тег можно положить **атрибуты** — настройки элемента: `<a href="https://example.com">ссылка</a>`.'],
          ['h', 'Скелет документа'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Моя страница</title>\n</head>\n<body>\n  <h1>Привет!</h1>\n  <p>Это моя первая страница.</p>\n</body>\n</html>' }],
          ['list', [
            '`<!DOCTYPE html>` — объявление: «это современный HTML5»',
            '`<html>` — корень дерева, `lang="ru"` — язык страницы',
            '`<head>` — служебная часть: кодировка, заголовок вкладки, стили',
            '`<body>` — всё, что видит пользователь'
          ]],
          ['note', 'В заданиях этого курса код выполняется по-настоящему: кнопка «Предпросмотр» отрисует твою разметку в мини-окне прямо на уроке — интернет не нужен.']
        ],
        task: {
          kind: 'html',
          prompt: 'Собери страницу: объявление `<!DOCTYPE html>`, заголовок `<h1>Привет, мир!</h1>` и абзац `<p>` с парой слов о себе.',
          start: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Первая страница</title>\n</head>\n<body>\n  <!-- напиши заголовок и абзац здесь -->\n</body>\n</html>\n',
          checks: [
            { re: '<!DOCTYPE html>', msg: 'есть <!DOCTYPE html>' },
            { re: '<h1[^>]*>\\s*Привет, мир!\\s*</h1>', msg: 'есть <h1>Привет, мир!</h1>' },
            { re: '<p[^>]*>[^<]{4,}</p>', msg: 'есть <p> с текстом (4+ символа)' }
          ],
          hint: 'Теги пишутся внутри <body>. Парный тег — это открывающий <p> и закрывающий </p> с текстом между ними.',
          solution: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Первая страница</title>\n</head>\n<body>\n  <h1>Привет, мир!</h1>\n  <p>Меня зовут Саша, я учусь разметке.</p>\n</body>\n</html>\n'
        },
        quiz: [
          { t: 'HTML — это…', ty: 'choice', o: ['язык программирования', 'язык разметки', 'база данных', 'графический редактор'], c: 'язык разметки', e: 'HTML описывает структуру страницы, но не содержит логики — это разметка.', tp: 'html-1' },
          { t: 'Какой тег делает абзац?', ty: 'choice', o: ['<p>', '<a>', '<div>', '<br>'], c: '<p>', e: '<p> — paragraph, абзац текста.', tp: 'html-1' },
          { t: 'Что находится внутри <head>?', ty: 'choice', o: ['видимый текст страницы', 'служебные данные: кодировка, заголовок вкладки, стили', 'таблицы', 'формы'], c: 'служебные данные: кодировка, заголовок вкладки, стили', e: '<head> — невидимая служебная часть документа.', tp: 'html-1' }
        ]
      },
      {
        t: 'Текст: заголовки, списки, выделение',
        goal: 'научиться структурировать текст: заголовки шести уровней, списки и выделение важного.',
        blocks: [
          ['h', 'Заголовки'],
          ['p', 'Заголовки идут от `<h1>` (самый важный, один на страницу) до `<h6>`. Ими размечают разделы — как оглавление книги.'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<h1>Игра</h1>\n<h2>Персонаж</h2>\n<h3>Инвентарь</h3>' }],
          ['h', 'Списки'],
          ['p', '**Маркированный** список `<ul>` — пункты без порядка. **Нумерованный** `<ol>` — шаги по порядку. Пункт всегда `<li>`.'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<ul>\n  <li>меч</li>\n  <li>щит</li>\n</ul>\n<ol>\n  <li>открыть редактор</li>\n  <li>написать код</li>\n</ol>' }],
          ['h', 'Выделение и переносы'],
          ['list', [
            '`<strong>` и `<b>` — жирный (strong — «важно по смыслу»)',
            '`<em>` и `<i>` — курсив (em — «акцент при чтении»)',
            '`<br>` — перенос строки, `<hr>` — горизонтальная линия'
          ]],
          ['note', 'Привыкай к вложенности: элементы кладутся друг в друга ровно, как эта страница собрана из разделов.']
        ],
        task: {
          kind: 'html',
          prompt: 'Сделай фрагмент: заголовок `<h2>Мой топ игр</h2>`, маркированный список `<ul>` ровно из трёх `<li>` и одно `<strong>` внутри любого пункта.',
          start: '<h2>Мой топ игр</h2>\n<!-- список здесь -->\n',
          checks: [
            { re: '<h2[^>]*>\\s*Мой топ игр\\s*</h2>', msg: 'заголовок <h2>Мой топ игр</h2>' },
            { re: '<ul>[\\s\\S]*<li>[\\s\\S]*</li>[\\s\\S]*<li>[\\s\\S]*</li>[\\s\\S]*<li>[\\s\\S]*</li>[\\s\\S]*</ul>', msg: 'в <ul> ровно три <li> (или больше)' },
            { re: '<strong>[^<]+</strong>', msg: 'есть <strong> с текстом' }
          ],
          hint: 'Каждый пункт списка — <li>…</li> внутри <ul>…</ul>. Жирный текст: <strong>название</strong>.',
          solution: '<h2>Мой топ игр</h2>\n<ul>\n  <li><strong>Blox Fruits</strong> — приключения</li>\n  <li>Minecraft — песочница</li>\n  <li>Terraria — выживание</li>\n</ul>\n'
        },
        quiz: [
          { t: 'Самый важный заголовок на странице — это…', ty: 'choice', o: ['<h6>', '<h1>', '<head>', '<title>'], c: '<h1>', e: '<h1> — заголовок первого уровня, обычно один на страницу.', tp: 'html-2' },
          { t: 'Нумерованный список начинается с тега…', ty: 'input', c: '<ol>', e: '<ol> — ordered list; <ul> — маркированный.', tp: 'html-2' },
          { t: '<br> — парный тег.', ty: 'bool', c: 'false', e: '<br> одиночный: он просто переносит строку, закрывать нечего.', tp: 'html-2' }
        ]
      },
      {
        t: 'Ссылки и картинки',
        goal: 'связать страницу с миром: гиперссылки и изображения с альтернативным текстом.',
        blocks: [
          ['h', 'Ссылки'],
          ['p', 'Тег `<a>` (anchor — якорь) с атрибутом `href` делает ссылку. Именно ссылки превращают набор страниц в **гипертекст** — веб.'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<a href="https://spaj7468-cell.github.io/qkc/">Тренажёр QKC</a>\n<a href="page2.html">Вторая страница</a>\n<a href="#section1">Якорь на раздел этой же страницы</a>\n<a href="https://example.com" target="_blank">Откроется в новой вкладке</a>' }],
          ['h', 'Картинки'],
          ['p', '`<img>` — одиночный тег. `src` — адрес файла, `alt` — описание для тех, кто не видит изображение (и для поисковиков). `width`/`height` задают размер.'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<img src="cat.png" alt="Рыжий кот спит" width="300">' }],
          ['warn', 'Всегда пиши `alt`: без него страница ломается для скринридеров, а QKCcode уважает доступность.']
        ],
        task: {
          kind: 'html',
          prompt: 'Добавь ссылку `<a>` на `https://spaj7468-cell.github.io/qkc/` с любым текстом и картинку `<img>` с `src` и непустым `alt`.',
          start: '<!-- ссылка -->\n\n<!-- картинка -->\n',
          checks: [
            { re: '<a[^>]+href="https://spaj7468-cell\\.github\\.io/qkc/"[^>]*>[^<]+</a>', msg: 'ссылка <a href="https://spaj7468-cell.github.io/qkc/">…</a>' },
            { re: '<img[^>]+src=', msg: 'есть <img> с src' },
            { re: '<img[^>]+alt="[^"]+"', msg: 'у <img> непустой alt' }
          ],
          hint: 'Атрибуты пишутся внутри открывающего тега через пробел: <a href="...">текст</a>, <img src="..." alt="...">.',
          solution: '<a href="https://spaj7468-cell.github.io/qkc/">Открыть тренажёр QKC</a>\n<img src="logo.png" alt="Логотип OuRi Corp" width="120">\n'
        },
        quiz: [
          { t: 'Атрибут адреса у ссылки — это…', ty: 'input', c: 'href', e: '<a href="адрес">. href = hyper reference.', tp: 'html-3' },
          { t: 'Зачем нужен alt у <img>?', ty: 'choice', o: ['для красоты', 'описание изображения для скринридеров и при ошибке загрузки', 'это ссылка', 'для анимации'], c: 'описание изображения для скринридеров и при ошибке загрузки', e: 'alt — альтернативный текст, часть доступности.', tp: 'html-3' },
          { t: 'target="_blank" открывает ссылку в новой вкладке.', ty: 'bool', c: 'true', e: 'Да, _blank — новое окно/вкладка.', tp: 'html-3' }
        ]
      },
      {
        t: 'Таблицы',
        goal: 'собирать табличные данные: строки, ячейки, заголовки.',
        blocks: [
          ['h', 'Структура таблицы'],
          ['p', '`<table>` содержит строки `<tr>` (table row), а строки — ячейки `<td>` (table data). Заголовки колонок — `<th>`.'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<table>\n  <tr><th>Язык</th><th>Где живёт</th></tr>\n  <tr><td>Lua</td><td>Roblox Studio</td></tr>\n  <tr><td>GDScript</td><td>Godot</td></tr>\n</table>' }],
          ['list', [
            '`<thead>`/`<tbody>` — смысловые зоны таблицы (не обязательны, но полезны)',
            '`colspan="2"` — ячейка на две колонки, `rowspan` — на две строки',
            'Таблицы — только для данных, не для вёрстки страницы'
          ]]
        ],
        task: {
          kind: 'html',
          prompt: 'Сделай таблицу `<table>` из двух строк: первая — два `<th>` («Предмет» и «Оценка»), вторая — два `<td>` с любыми значениями.',
          start: '<table>\n  <!-- строки здесь -->\n</table>\n',
          checks: [
            { re: '<table>[\\s\\S]*<tr>[\\s\\S]*<th[^>]*>[^<]+</th>[\\s\\S]*<th[^>]*>[^<]+</th>[\\s\\S]*</tr>[\\s\\S]*<tr>[\\s\\S]*<td[^>]*>[^<]+</td>[\\s\\S]*<td[^>]*>[^<]+</td>[\\s\\S]*</tr>[\\s\\S]*</table>', msg: 'две строки: <th>+<th> и <td>+<td>' }
          ],
          hint: 'Внутри <table> сначала <tr> с двумя <th>, затем ещё один <tr> с двумя <td>.',
          solution: '<table>\n  <tr><th>Предмет</th><th>Оценка</th></tr>\n  <tr><td>Информатика</td><td>5</td></tr>\n</table>\n'
        },
        quiz: [
          { t: 'Строка таблицы — это тег…', ty: 'input', c: '<tr>', e: '<tr> — table row.', tp: 'html-4' },
          { t: '<th> и <td> — одно и то же.', ty: 'bool', c: 'false', e: '<th> — заголовочная ячейка (жирная, по центру), <td> — обычная.', tp: 'html-4' }
        ]
      },
      {
        t: 'Формы: диалог со страницей',
        goal: 'собрать форму ввода: поля, подписи, кнопки.',
        blocks: [
          ['h', 'Из чего состоит форма'],
          ['p', '`<form>` объединяет элементы ввода. `<input>` — универсальное поле: его тип задаёт атрибут `type` (text, password, number, checkbox, radio…). `<button>` отправляет форму.'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<form>\n  <label for="nick">Ник:</label>\n  <input id="nick" type="text" placeholder="Введи ник">\n  <label for="age">Возраст:</label>\n  <input id="age" type="number" min="1" max="99">\n  <button type="submit">Отправить</button>\n</form>' }],
          ['list', [
            '`<label for="...">` подписывает поле и увеличивает его кликабельную зону',
            '`placeholder` — серая подсказка внутри поля',
            '`<textarea>` — многострочный текст, `<select>` + `<option>` — выпадающий список'
          ]],
          ['note', 'Именно формами тренажёр QKC собирал бы ответы, если бы не хранил всё локально. В QKCcode ответы живут в твоём браузере — форм нет.']
        ],
        task: {
          kind: 'html',
          prompt: 'Собери мини-форму: `<input type="text">` с `placeholder`, подписанный `<label>`, и `<button>` с текстом.',
          start: '<form>\n  <!-- поля здесь -->\n</form>\n',
          checks: [
            { re: '<input[^>]+type="text"[^>]*>', msg: 'есть <input type="text">' },
            { re: '<input[^>]+placeholder="[^"]+"', msg: 'у input есть placeholder' },
            { re: '<label[^>]*>[^<]+</label>', msg: 'есть <label> с текстом' },
            { re: '<button[^>]*>[^<]+</button>', msg: 'есть <button> с текстом' }
          ],
          hint: 'Порядок любой, главное — все четыре элемента: label, input type="text" с placeholder, button.',
          solution: '<form>\n  <label for="name">Как тебя зовут?</label>\n  <input id="name" type="text" placeholder="Имя">\n  <button type="submit">Поехали</button>\n</form>\n'
        },
        quiz: [
          { t: 'Какой type у поля для пароля?', ty: 'input', c: 'password', e: '<input type="password"> скрывает вводимое.', tp: 'html-5' },
          { t: '<label> нужен, чтобы…', ty: 'choice', o: ['рисовать рамки', 'подписывать поле ввода', 'создавать таблицы', 'менять цвет'], c: 'подписывать поле ввода', e: 'label подписывает input и улучшает доступность.', tp: 'html-5' }
        ]
      },
      {
        t: 'CSS: первый стиль',
        goal: 'покрасить страницу: селекторы, цвета, шрифты, отступы и рамки.',
        blocks: [
          ['h', 'Что такое CSS'],
          ['p', '**CSS** (Cascading Style Sheets) отвечает за внешний вид. Правило CSS = **селектор** + блок свойств: `селектор { свойство: значение; }`. Стили пишут в теге `<style>` внутри `<head>` или в отдельном файле (`<link rel="stylesheet" href="style.css">`).'],
          ['code', { lang: 'html', langName: 'HTML', noRun: true, code: '<style>\n  body { background: #000; color: #fff; font-family: monospace }\n  h1.title { letter-spacing: 2px; border-bottom: 2px solid #fff }\n  p { margin: 10px 0 }\n</style>\n<h1 class="title">Чёрное и белое</h1>' }],
          ['h', 'Селекторы'],
          ['list', [
            '`p` — все теги p, `h1` — все заголовки',
            '`.title` — все элементы с class="title"',
            '`#main` — элемент с id="main"',
            '`a:hover` — ссылка под курсором (состояние)'
          ]],
          ['h', 'Главные свойства'],
          ['list', [
            '`color` и `background` — цвет текста и фона',
            '`font-size`, `font-family`, `font-weight` — шрифт',
            '`padding` — внутренний отступ, `margin` — внешний',
            '`border` — рамка, `border-radius` — скругления'
          ]],
          ['note', 'Весь дизайн QKCcode — строгий монохром: `#08080a` фон, `#f4f4f5` текст, никаких других цветов. Ограничение рождает стиль.']
        ],
        task: {
          kind: 'html',
          prompt: 'Страница с `<style>`: задай `body` чёрный фон и белый текст, а заголовку `<h1 class="title">` — рамку снизу (`border-bottom`).',
          start: '<style>\n  /* стили здесь */\n</style>\n<h1 class="title">Монохром</h1>\n',
          checks: [
            { re: '<style>[\\s\\S]*body\\s*\\{[^}]*background[^}]*\\}[\\s\\S]*</style>', msg: 'body { background: … } внутри <style>' },
            { re: 'body\\s*\\{[^}]*color[^}]*\\}', msg: 'у body задан color' },
            { re: '(h1|\\.title)[^{]*\\{[^}]*border-bottom[^}]*\\}', msg: 'у h1/.title есть border-bottom' },
            { re: '<h1[^>]+class="title"', msg: '<h1 class="title"> на месте' }
          ],
          hint: 'Селектор класса — точка: .title { border-bottom: 2px solid #fff }. Можно и по тегу: h1 { … }.',
          solution: '<style>\n  body { background: #000; color: #fff; font-family: monospace }\n  .title { border-bottom: 2px solid #fff; padding-bottom: 8px }\n</style>\n<h1 class="title">Монохром</h1>\n'
        },
        quiz: [
          { t: 'Селектор .card выберет…', ty: 'choice', o: ['тег <card>', 'все элементы с class="card"', 'элемент id="card"', 'первый абзац'], c: 'все элементы с class="card"', e: 'Точка — класс, решётка — id, просто имя — тег.', tp: 'html-6' },
          { t: 'Внутренний отступ — это…', ty: 'input', c: 'padding', e: 'padding — внутри рамки, margin — снаружи.', tp: 'html-6' },
          { t: 'CSS отвечает за логику страницы.', ty: 'bool', c: 'false', e: 'CSS — только внешний вид. Логика — это JavaScript.', tp: 'html-6' }
        ]
      }
    ]
  });
})();
