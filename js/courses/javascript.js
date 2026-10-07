/* QKCcode — курс «JavaScript: первый язык» (6 уроков) */
(function () {
  window.QCOURSES = window.QCOURSES || [];
  window.QCOURSES.push({
    id: 'javascript',
    title: 'JavaScript',
    tag: 'язык веб · везде',
    dialect: 'javascript',
    level: 'с нуля',
    desc: 'Язык, который работает в каждом браузере. Переменные, условия, циклы, функции, массивы — и всё это можно запускать прямо в уроке.',
    intro: 'JavaScript — язык веба: он оживляет страницы, работает в браузере, на серверах и даже в играх. На JavaScript вручную написаны и этот сайт, и тренажёр QKC, и движок QKC Engine — нигде ни одного фреймворка. Курс ведёт от первой переменной до массивов и функций.',
    icon: '<svg viewBox="0 0 24 24"><path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5L13 2z"/></svg>',
    lessons: [
      {
        t: 'Переменные и типы',
        goal: 'научиться хранить данные в переменных и выводить их через console.log.',
        blocks: [
          ['h', 'Переменная — коробка с именем'],
          ['p', 'Переменная хранит значение, к которому можно обращаться по имени. Объявляют их словами `let` (можно менять), `const` (нельзя менять) и старым `var`.'],
          ['code', { lang: 'javascript', code: 'let nick = "Игрок";\nconst maxHp = 100;\nlet hp = maxHp;\n\nconsole.log(nick, hp);\nhp = 80;\nconsole.log("После удара:", hp);', out: 'Игрок 100\nПосле удара: 80' }],
          ['h', 'Типы значений'],
          ['list', [
            '**числа** — `42`, `3.14`, `-7` (одинаковые и для целых, и для дробных)',
            '**строки** — `"текст"` или `\'текст\'` в кавычках',
            '**булевы** — `true` (истина) и `false` (ложь)',
            '**null** — «значения нет»'
          ]],
          ['p', 'Выводит данные `console.log(...)`. В инструментах разработчика это панель Console, а в нашем учебном интерпретаторе — поле «Вывод» под кодом.'],
          ['note', 'Имена переменных пишут camelCase: `playerScore`, `maxHealth`. Имя не может начинаться с цифры.']
        ],
        task: {
          kind: 'code',
          prompt: 'Объяви `const game = "QKCcode"` и `let level = 2`, затем выведи их в одной строке через `console.log(game, level)`. Добавь ещё один вывод: `console.log("Уровень:", level + 1)`.',
          start: '// объяви переменные здесь\n\n// выведи: game level\n\n// выведи: Уровень: 3\n',
          expect: ['QKCcode 2', 'Уровень: 3'],
          hint: 'console.log принимает несколько аргументов через запятую и печатает их через пробел. Сложение level + 1 даст число 3.',
          solution: 'const game = "QKCcode";\nlet level = 2;\nconsole.log(game, level);\nconsole.log("Уровень:", level + 1);'
        },
        quiz: [
          { t: 'Какое ключевое слово объявляет константу?', ty: 'input', c: 'const', e: 'const — значение менять нельзя, let — можно.', tp: 'js-1' },
          { t: 'Значение "42" в кавычках — это…', ty: 'choice', o: ['число', 'строка', 'булево', 'null'], c: 'строка', e: 'Всё, что в кавычках — строка, даже если внутри цифры.', tp: 'js-1' },
          { t: 'let x = 5; x = 6; — так делать можно.', ty: 'bool', c: 'true', e: 'let как раз разрешает менять значение переменной.', tp: 'js-1' }
        ]
      },
      {
        t: 'Числа и строки',
        goal: 'считать, склеивать строки и применять строковые методы.',
        blocks: [
          ['h', 'Арифметика'],
          ['p', 'Операторы: `+ - * /`, остаток от деления `%`, степень `**`. Деление всегда даёт дробное число: `7 / 2 === 3.5`.'],
          ['code', { lang: 'javascript', code: 'console.log(7 + 2, 7 - 2, 7 * 2);\nconsole.log(7 / 2);\nconsole.log(7 % 2);   // остаток\nconsole.log(2 ** 10); // степень', out: '9 5 14\n3.5\n1\n1024' }],
          ['h', 'Строки'],
          ['p', 'Строки склеиваются тем же `+` — это называется **конкатенация**. У строк есть `.length` (длина) и методы вроде `.toUpperCase()`.'],
          ['code', { lang: 'javascript', code: 'let first = "Quick";\nlet second = "Knowledge";\nconsole.log(first + " " + second + " Check");\nconsole.log("qkc".toUpperCase(), "QKC".length);', out: 'Quick Knowledge Check\nQKC 3' }],
          ['warn', 'Число + строка даёт строку: `5 + " раз"` = `"5 раз"`. Следи за типами, иначе `"2" + 2` превратится в `"22"`.']
        ],
        task: {
          kind: 'code',
          prompt: 'Дана сторона квадрата `side = 7`. Выведи две строки: `"Периметр:" <число>` и `"Площадь:" <число>` (периметр = side * 4, площадь = side * side — можно через `**`).',
          start: 'const side = 7;\n\n// периметр и площадь\n',
          expect: ['Периметр: 28', 'Площадь: 49'],
          hint: 'console.log("Периметр:", side * 4) — аргументы через запятую печатаются через пробел.',
          solution: 'const side = 7;\nconsole.log("Периметр:", side * 4);\nconsole.log("Площадь:", side ** 2);'
        },
        quiz: [
          { t: 'Чему равно 7 % 2 в JavaScript?', ty: 'input', c: '1', e: '% — остаток от деления: 7 = 3*2 + 1.', tp: 'js-2' },
          { t: 'Что получится: "2" + 2 ?', ty: 'choice', o: ['4', '"22"', '22', 'ошибка'], c: '"22"', e: 'Строка + что угодно = строка: получается "22".', tp: 'js-2' },
          { t: '7 / 2 в JavaScript равно 3 (целое).', ty: 'bool', c: 'false', e: 'В JS деление всегда дробное: 3.5. Целочисленного деления как // в Python тут нет.', tp: 'js-2' }
        ]
      },
      {
        t: 'Условия: if / else',
        goal: 'научить программу выбирать путь: сравнения, логика, ветвление.',
        blocks: [
          ['h', 'Ветвление'],
          ['p', '`if (условие) { … }` выполняет блок, только если условие истинно. `else` — запасной путь, `else if` — дополнительные проверки.'],
          ['code', { lang: 'javascript', code: 'let score = 72;\n\nif (score >= 90) {\n  console.log("Отлично");\n} else if (score >= 60) {\n  console.log("Хорошо");\n} else {\n  console.log("Тренируйся ещё");\n}', out: 'Хорошо' }],
          ['h', 'Сравнения и логика'],
          ['list', [
            '`===` равно (строго), `!==` не равно, `< > <= >=`',
            '`&&` — И (оба истинны), `||` — ИЛИ (хотя бы одно), `!` — НЕ',
            'тернарный оператор: `условие ? еслиДа : еслиНет`'
          ]],
          ['code', { lang: 'javascript', code: 'let hp = 30;\nlet shield = 0;\nconsole.log(hp > 50 && shield > 0);\nconsole.log(hp > 50 || shield > 0);\nconsole.log(hp < 40 ? "Беги!" : "Держись");', out: 'false\nfalse\nБеги!' }]
        ],
        task: {
          kind: 'code',
          prompt: 'Переменная `temp = -5`. Если `temp < 0` — выведи `"Мороз"`, иначе если `temp < 20` — `"Прохладно"`, иначе `"Тепло"`. Затем тернарным оператором выведи `"Зима"` если `temp < 0`, иначе `"Лето"`.',
          start: 'const temp = -5;\n\n// if / else if / else\n\n// тернарный оператор\n',
          expect: ['Мороз', 'Зима'],
          hint: 'Вторая строка: console.log(temp < 0 ? "Зима" : "Лето")',
          solution: 'const temp = -5;\nif (temp < 0) {\n  console.log("Мороз");\n} else if (temp < 20) {\n  console.log("Прохладно");\n} else {\n  console.log("Тепло");\n}\nconsole.log(temp < 0 ? "Зима" : "Лето");'
        },
        quiz: [
          { t: 'Строгое сравнение в JavaScript — это оператор…', ty: 'input', c: '===', e: '=== сравнивает и значение, и тип; == может приводить типы.', tp: 'js-3' },
          { t: 'Что выведет: console.log(5 > 3 && 2 > 4) ?', ty: 'choice', o: ['true', 'false', '5', 'ошибку'], c: 'false', e: '&& требует истинности обоих: второе условие ложно → false.', tp: 'js-3' },
          { t: 'Блок else if выполняется всегда.', ty: 'bool', c: 'false', e: 'else if проверяется, только если предыдущее условие ложно.', tp: 'js-3' }
        ]
      },
      {
        t: 'Циклы: for и while',
        goal: 'повторять действия: счётчики, диапазоны, условие остановки.',
        blocks: [
          ['h', 'for — когда знаешь сколько раз'],
          ['p', 'Классический `for` состоит из трёх частей: старт счётчика, условие продолжения, шаг.'],
          ['code', { lang: 'javascript', code: 'for (let i = 1; i <= 3; i++) {\n  console.log("Шаг", i);\n}', out: 'Шаг 1\nШаг 2\nШаг 3' }],
          ['h', 'while — пока условие истинно'],
          ['code', { lang: 'javascript', code: 'let fuel = 3;\nwhile (fuel > 0) {\n  console.log("Топливо:", fuel);\n  fuel--;\n}\nconsole.log("Бак пуст");', out: 'Топливо: 3\nТопливо: 2\nТопливо: 1\nБак пуст' }],
          ['list', [
            '`i++` — увеличить на 1, `i--` — уменьшить',
            '`break` — немедленно выйти из цикла',
            '`continue` — перейти к следующей итерации'
          ]],
          ['warn', 'Цикл без изменения условия — бесконечный. Учебный интерпретатор остановит его сам, но в настоящем коде браузер зависнет.']
        ],
        task: {
          kind: 'code',
          prompt: 'Выведи числа от 5 до 1 (обратный отсчёт) по одному в строке с помощью `for`, а затем строку `"Старт!"`. Шаг счётчика: `i--`.',
          start: '// обратный отсчёт 5..1\n\n// затем "Старт!"\n',
          expect: ['5', '4', '3', '2', '1', 'Старт!'],
          hint: 'for (let i = 5; i >= 1; i--) { console.log(i); }',
          solution: 'for (let i = 5; i >= 1; i--) {\n  console.log(i);\n}\nconsole.log("Старт!");'
        },
        quiz: [
          { t: 'Сколько раз выполнится for (let i = 0; i < 3; i++) {…}?', ty: 'input', c: '3', e: 'i = 0, 1, 2 — три итерации, на i = 3 условие ложно.', tp: 'js-4' },
          { t: 'Какой оператор прерывает цикл досрочно?', ty: 'input', c: 'break', e: 'break выходит из цикла, continue лишь пропускает итерацию.', tp: 'js-4' },
          { t: 'while проверяет условие перед каждой итерацией.', ty: 'bool', c: 'true', e: 'Да: условие ложно сразу — тело не выполнится ни разу.', tp: 'js-4' }
        ]
      },
      {
        t: 'Функции',
        goal: 'упаковывать логику в функции: параметры, return, повторное использование.',
        blocks: [
          ['h', 'Функция — мини-программа с именем'],
          ['p', 'Функция объявляется словом `function`, принимает **параметры** и возвращает результат словом `return`. Вызов — имя со скобками: `sum(2, 3)`.'],
          ['code', { lang: 'javascript', code: 'function sum(a, b) {\n  return a + b;\n}\n\nconsole.log(sum(2, 3));\nconsole.log(sum(10, -4));', out: '5\n6' }],
          ['h', 'Зачем'],
          ['list', [
            '**не повторяться**: один раз написал — много раз вызвал',
            '**имя** документирует логику: `calcDamage(base, mult)` понятнее десяти строк',
            '**тесты**: маленькую функцию легко проверить'
          ]],
          ['code', { lang: 'javascript', code: 'function rank(score) {\n  if (score >= 90) return "S";\n  if (score >= 60) return "A";\n  return "B";\n}\nconsole.log(rank(95), rank(70), rank(10));', out: 'S A B' }],
          ['note', 'Функции могут вызывать сами себя — это **рекурсия**. Классика: факториал `n! = n * (n-1)!`.']
        ],
        task: {
          kind: 'code',
          prompt: 'Напиши функцию `mult(a, b)`, возвращающую произведение, и функцию `square(x)`, которая возвращает `mult(x, x)`. Выведи `square(6)`.',
          start: '// функция mult(a, b)\n\n// функция square(x), использующая mult\n\nconsole.log(square(6));\n',
          expect: ['36'],
          hint: 'function mult(a, b) { return a * b; } — затем square вызывает mult(x, x).',
          solution: 'function mult(a, b) {\n  return a * b;\n}\nfunction square(x) {\n  return mult(x, x);\n}\nconsole.log(square(6));'
        },
        quiz: [
          { t: 'Какое слово возвращает значение из функции?', ty: 'input', c: 'return', e: 'return завершает функцию и отдаёт значение.', tp: 'js-5' },
          { t: 'Что вернёт функция без return?', ty: 'choice', o: ['0', 'ошибку', 'undefined', 'пустую строку'], c: 'undefined', e: 'Без return результат вызова — undefined («значения нет»).', tp: 'js-5' },
          { t: 'Рекурсия — это когда функция вызывает саму себя.', ty: 'bool', c: 'true', e: 'Да, и обязательно нужен базовый случай остановки.', tp: 'js-5' }
        ]
      },
      {
        t: 'Массивы и объекты',
        goal: 'хранить коллекции: списки значений и объекты со свойствами.',
        blocks: [
          ['h', 'Массивы'],
          ['p', 'Массив — список значений в квадратных скобках. Индексы начинаются **с нуля**. `.length` — длина, `.push(x)` — добавить в конец.'],
          ['code', { lang: 'javascript', code: 'let items = ["меч", "щит"];\nitems.push("зелье");\nconsole.log(items.length);\nconsole.log(items[0], items[2]);', out: '3\nмеч зелье' }],
          ['h', 'Перебор'],
          ['code', { lang: 'javascript', code: 'let nums = [4, 8, 2];\nlet total = 0;\nfor (let n of nums) {\n  total += n;\n}\nconsole.log("Сумма:", total);\nconsole.log(nums.join("-"));', out: 'Сумма: 14\n4-8-2' }],
          ['h', 'Объекты'],
          ['p', 'Объект хранит пары «свойство: значение» — как карточка персонажа. Доступ через точку или скобки.'],
          ['code', { lang: 'javascript', code: 'let player = { name: "Neo", hp: 100 };\nconsole.log(player.name);\nplayer.hp = 75;\nconsole.log(player.hp);\nconsole.log(player);', out: 'Neo\n75\n{ name: \'Neo\', hp: 75 }' }]
        ],
        task: {
          kind: 'code',
          prompt: 'Дан массив `scores = [5, 3, 8, 1]`. Циклом `for (let s of scores)` посчитай сумму и выведи `"Сумма:" <сумма>`, затем выведи максимальный элемент через перебор и `if` (строка вида `"Макс:" 8`).',
          start: 'const scores = [5, 3, 8, 1];\nlet total = 0;\nlet best = 0;\n\n// один цикл: считай сумму и ищи максимум\n\nconsole.log("Сумма:", total);\nconsole.log("Макс:", best);\n',
          expect: ['Сумма: 17', 'Макс: 8'],
          hint: 'Внутри цикла: total += s; и if (s > best) best = s;',
          solution: 'const scores = [5, 3, 8, 1];\nlet total = 0;\nlet best = 0;\nfor (let s of scores) {\n  total += s;\n  if (s > best) best = s;\n}\nconsole.log("Сумма:", total);\nconsole.log("Макс:", best);'
        },
        quiz: [
          { t: 'Индекс первого элемента массива в JavaScript — …', ty: 'input', c: '0', e: 'Отсчёт с нуля: arr[0] — первый элемент.', tp: 'js-6' },
          { t: 'Как добавить элемент в конец массива?', ty: 'choice', o: ['arr.add(x)', 'arr.push(x)', 'arr.append(x)', 'push(arr, x)'], c: 'arr.push(x)', e: 'В JS — метод push (append — в Python, add — в C#/Java).', tp: 'js-6' },
          { t: 'Свойство объекта можно прочитать как obj.name и как obj["name"].', ty: 'bool', c: 'true', e: 'Оба способа работают; скобки нужны, если имя свойства в переменной.', tp: 'js-6' }
        ]
      }
    ]
  });
})();
