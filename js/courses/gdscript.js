/* QKCcode — курс «GDScript для Godot» (6 уроков) */
(function () {
  window.QCOURSES = window.QCOURSES || [];
  window.QCOURSES.push({
    id: 'gdscript',
    title: 'GDScript для Godot',
    tag: 'Godot · игры',
    dialect: 'gdscript',
    level: 'с нуля',
    desc: 'Язык открытого движка Godot: похож на Python, создан специально для игр. От print до функций _ready и _process.',
    intro: 'Godot — свободный игровой движок, а GDScript — его родной язык: синтаксис как у Python, но заточен под узлы, сцены и игровой цикл. Курс даёт базу языка и показывает, как она ложится на настоящие скрипты Godot. Все задания выполняются встроенным интерпретатором GDScript.',
    icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5M4.9 4.9l3.6 3.6M15.5 15.5l3.6 3.6M19.1 4.9l-3.6 3.6M8.5 15.5l-3.6 3.6"/></svg>',
    lessons: [
      {
        t: 'Знакомство с GDScript',
        goal: 'первый print, комментарии, ощущение синтаксиса.',
        blocks: [
          ['h', 'Что за язык'],
          ['p', '**GDScript** — язык движка **Godot**. Он вдохновлён Python: те же отступы вместо скобок, `#` для комментариев, слова `if/elif/else`, `for`, `while`. Но он тесно связан с движком: классы, узлы и сигналы — часть языка.'],
          ['code', { lang: 'gdscript', code: 'print("Привет, Godot!")\nprint(2 + 2)\nprint("Жизней:", 3)', out: 'Привет, Godot!\n4\nЖизней: 3' }],
          ['p', 'Комментарий — `#` до конца строки. Отступы важны: блок тела выделяется **табуляцией** (Godot любит таб).'],
          ['code', { lang: 'gdscript', code: '# настройка сцены\nprint("сцена загружена")  # комментарий в конце строки', out: 'сцена загружена' }],
          ['note', 'Godot и GDScript полностью открыты и бесплатны — движок можно скачать и модифицировать. Как и все проекты OuRi.']
        ],
        task: {
          kind: 'code',
          prompt: 'Выведи две строки: `Godot запущен` и число `4` (вычисли его как 2 + 2).',
          start: '# первая программа\n',
          expect: ['Godot запущен', '4'],
          hint: 'print("Godot запущен") и print(2 + 2).',
          solution: 'print("Godot запущен")\nprint(2 + 2)'
        },
        quiz: [
          { t: 'GDScript синтаксически больше всего похож на…', ty: 'choice', o: ['C++', 'Python', 'Lua', 'SQL'], c: 'Python', e: 'Отступы, #, if/elif/else — почти Python.', tp: 'gd-1' },
          { t: 'Символ комментария в GDScript — …', ty: 'input', c: '#', e: 'Как в Python.', tp: 'gd-1' },
          { t: 'Godot — платный движок с подпиской.', ty: 'bool', c: 'false', e: 'Godot свободен (MIT), денег не просит.', tp: 'gd-1' }
        ]
      },
      {
        t: 'var, const и типы',
        goal: 'объявлять переменные и константы, понимать типы.',
        blocks: [
          ['h', 'Переменные и константы'],
          ['p', '`var` объявляет переменную, `const` — константу (имена констант принято писать ЗАГЛАВНЫМИ). Тип можно указать через двоеточие: `var hp: int = 100`.'],
          ['code', { lang: 'gdscript', code: 'var speed = 250\nvar player_name: String = "Игрок"\nconst MAX_LIVES = 3\n\nprint(player_name, speed)\nprint("Максимум жизней:", MAX_LIVES)', out: 'Игрок 250\nМаксимум жизней: 3' }],
          ['h', 'Базовые типы'],
          ['list', [
            '`int` — целые: 5, -2, 1000',
            '`float` — дробные: 1.5, 0.25',
            '`String` — строки: "текст"',
            '`bool` — true / false (с маленькой буквы, в отличие от Python)',
            '`null` — пустое значение'
          ]],
          ['h', 'Строки и числа'],
          ['p', 'Складывать строку с числом нельзя — приведи число к строке функцией `str()`:'],
          ['code', { lang: 'gdscript', code: 'var coins = 12\nprint("Монет: " + str(coins))\nprint("Монет:", coins)', out: 'Монет: 12\nМонет: 12' }]
        ],
        task: {
          kind: 'code',
          prompt: 'Объяви `var damage = 25` и `const CRIT_MULT = 2`. Выведи строку `"Крит: 50"`, вычислив значение как damage * CRIT_MULT (через `str()` для склейки).',
          start: '# переменные\n\n# вывод\n',
          expect: ['Крит: 50'],
          hint: 'print("Крит: " + str(damage * CRIT_MULT))',
          solution: 'var damage = 25\nconst CRIT_MULT = 2\nprint("Крит: " + str(damage * CRIT_MULT))'
        },
        quiz: [
          { t: 'Константу в GDScript объявляет слово…', ty: 'input', c: 'const', e: 'const MAX_HP = 100.', tp: 'gd-2' },
          { t: 'Что делает str(5)?', ty: 'choice', o: ['округляет', 'превращает 5 в строку "5"', 'печатает 5', 'ошибку'], c: 'превращает 5 в строку "5"', e: 'str() приводит значение к строке — нужно для склейки.', tp: 'gd-2' },
          { t: 'true в GDScript пишется с большой буквы.', ty: 'bool', c: 'false', e: 'С маленькой: true/false (с большой — в Python).', tp: 'gd-2' }
        ]
      },
      {
        t: 'Условия if / elif / else',
        goal: 'ветвить логику; двоеточия и отступы.',
        blocks: [
          ['h', 'Ветвление'],
          ['p', 'После условия — **двоеточие**, тело — блок с отступом. `elif` — «иначе если».'],
          ['code', { lang: 'gdscript', code: 'var health = 80\n\nif health > 70:\n\tprint("Почти здоров")\nelif health > 30:\n\tprint("Ранен")\nelse:\n\tprint("Критическое состояние")', out: 'Почти здоров' }],
          ['h', 'Логика'],
          ['p', 'Связки — словами: `and`, `or`, `not`. Сравнения: `==`, `!=`, `<`, `>`, `<=`, `>=`.'],
          ['code', { lang: 'gdscript', code: 'var ammo = 0\nvar has_sword = true\n\nif ammo > 0 or has_sword:\n\tprint("Можно драться")\nif not has_sword:\n\tprint("Без меча")', out: 'Можно драться' }]
        ],
        task: {
          kind: 'code',
          prompt: 'Дано `var score = 45`. Выведи `"Победа"` при score >= 50, `"Почти"` при score >= 30, иначе `"Заново"`.',
          start: 'var score = 45\n\n# if / elif / else\n',
          expect: ['Почти'],
          hint: 'elif score >= 30: затем print("Почти") с отступом (табуляция).',
          solution: 'var score = 45\nif score >= 50:\n\tprint("Победа")\nelif score >= 30:\n\tprint("Почти")\nelse:\n\tprint("Заново")'
        },
        quiz: [
          { t: '«Иначе если» в GDScript пишется как…', ty: 'input', c: 'elif', e: 'elif — как в Python (не else if и не elseif).', tp: 'gd-3' },
          { t: 'После условия if ставится…', ty: 'choice', o: ['точка с запятой', 'двоеточие', 'then', 'фигурная скобка'], c: 'двоеточие', e: 'if x > 5: — двоеточие, затем блок с отступом.', tp: 'gd-3' },
          { t: 'Логическое «ИЛИ» в GDScript — слово or.', ty: 'bool', c: 'true', e: 'and / or / not — словами.', tp: 'gd-3' }
        ]
      },
      {
        t: 'Циклы for и while',
        goal: 'range, перебор массивов, while с условием.',
        blocks: [
          ['h', 'for + range'],
          ['p', '`range(n)` — числа 0…n-1, `range(a, b)` — от a до b-1, с шагом: `range(a, b, step)`.'],
          ['code', { lang: 'gdscript', code: 'for i in range(3):\n\tprint("Кадр", i)\n\nfor i in range(1, 4):\n\tprint(i)', out: 'Кадр 0\nКадр 1\nКадр 2\n1\n2\n3' }],
          ['h', 'Перебор массива'],
          ['code', { lang: 'gdscript', code: 'var items = ["меч", "щит"]\nfor item in items:\n\tprint("Взял:", item)', out: 'Взял: меч\nВзял: щит' }],
          ['h', 'while'],
          ['code', { lang: 'gdscript', code: 'var energy = 3\nwhile energy > 0:\n\tprint("Энергия:", energy)\n\tenergy -= 1', out: 'Энергия: 3\nЭнергия: 2\nЭнергия: 1' }]
        ],
        task: {
          kind: 'code',
          prompt: 'Выведи номера волн врагов: три строки `Волна 1`, `Волна 2`, `Волна 3` — циклом `for i in range(1, 4)` со склейкой через `str()`.',
          start: '# цикл волн\n',
          expect: ['Волна 1', 'Волна 2', 'Волна 3'],
          hint: 'for i in range(1, 4): print("Волна " + str(i))',
          solution: 'for i in range(1, 4):\n\tprint("Волна " + str(i))'
        },
        quiz: [
          { t: 'range(3) даст числа…', ty: 'choice', o: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '1, 2'], c: '0, 1, 2', e: 'От нуля, верхняя граница не включается.', tp: 'gd-4' },
          { t: 'energy -= 1 означает…', ty: 'input', c: 'energy = energy - 1', e: 'Сокращённое вычитание с присваиванием.', tp: 'gd-4' },
          { t: 'for item in items переберёт массив items.', ty: 'bool', c: 'true', e: 'Да, цикл по элементам.', tp: 'gd-4' }
        ]
      },
      {
        t: 'Функции: func и return',
        goal: 'объявлять функции, возвращать значения, вызывать их.',
        blocks: [
          ['h', 'Объявление функции'],
          ['p', 'Функция — слово `func`, параметры в скобках, тело с отступом, результат — `return`.'],
          ['code', { lang: 'gdscript', code: 'func xp_for(level):\n\treturn level * 100\n\nprint(xp_for(2))\nprint(xp_for(5))', out: '200\n500' }],
          ['h', 'Функции с несколькими параметрами'],
          ['code', { lang: 'gdscript', code: 'func calc_damage(base, mult, defense):\n\tvar raw = base * mult\n\treturn raw - defense\n\nprint(calc_damage(10, 2, 5))', out: '15' }],
          ['note', 'Можно указывать типы: `func heal(hp: int, amount: int) -> int:` — движок проверит типы, а редактор подскажет автодополнение.']
        ],
        task: {
          kind: 'code',
          prompt: 'Напиши функцию `speed_up(base, bonus)`, возвращающую `base + bonus`, и выведи `speed_up(200, 50)`.',
          start: '# функция\n\n# вызов\n',
          expect: ['250'],
          hint: 'func speed_up(base, bonus): затем return base + bonus с отступом.',
          solution: 'func speed_up(base, bonus):\n\treturn base + bonus\n\nprint(speed_up(200, 50))'
        },
        quiz: [
          { t: 'Функцию в GDScript объявляет слово…', ty: 'input', c: 'func', e: 'func имя(параметры):', tp: 'gd-5' },
          { t: 'Что вернёт функция без return?', ty: 'choice', o: ['0', 'null', 'ошибку', 'пустую строку'], c: 'null', e: 'Без return результат — null.', tp: 'gd-5' },
          { t: 'Стрелка -> int у функции означает тип возвращаемого значения.', ty: 'bool', c: 'true', e: 'Да, это аннотация возвращаемого типа.', tp: 'gd-5' }
        ]
      },
      {
        t: 'Узлы, сцены и игровой цикл',
        goal: 'понять архитектуру Godot: узлы, _ready, _process, сигналы.',
        blocks: [
          ['h', 'Всё — узлы'],
          ['p', 'Игра в Godot — дерево **узлов** (Node): спрайты, камеры, кнопки, области. Узлы группируются в **сцены**, сцены вкладываются друг в друга. Скрипт вешается на узел и управляет им.'],
          ['code', { lang: 'gdscript', code: 'extends CharacterBody2D\n\nvar speed = 300\n\nfunc _ready():\n\tprint("Игрок готов!")\n\nfunc _process(delta):\n\tif health_low():\n\t\tprint("Нужна аптечка")\n\nfunc health_low():\n\treturn false', note: 'полный пример — в редакторе Godot' }],
          ['h', 'Главные функции движка'],
          ['list', [
            '`_ready()` — вызывается один раз, когда узел появился в сцене',
            '`_process(delta)` — вызывается каждый кадр; `delta` — время с прошлого кадра',
            '`_physics_process(delta)` — то же, но с фиксированным шагом физики',
            '`$Node2D` — быстрый доступ к дочернему узлу, `get_node("путь")` — полный'
          ]],
          ['h', 'Сигналы'],
          ['p', '**Сигнал** — сообщение узла миру: «здоровье кончилось», «кнопка нажата». Другие узлы подключаются к сигналу и реагируют — так сцены остаются независимыми.'],
          ['code', { lang: 'gdscript', noRun: true, note: 'выполняется только в Godot', code: '# подключение сигнала в _ready():\nfunc _ready():\n\t$Button.pressed.connect(_on_button_pressed)\n\nfunc _on_button_pressed():\n\tprint("Кнопка нажата!")' }],
          ['note', 'Наш интерпретатор выполняет чистый GDScript-подмножество (print, переменные, циклы, функции). Узлы, сигналы и $-пути живут в самом движке Godot — скачай его и попробуй эти примеры в редакторе.']
        ],
        task: {
          kind: 'code',
          prompt: 'Сымитируй узел: напиши `func _ready()` которая печатает `"Сцена готова"`, и `func _process()` которая печатает `"Кадр"`. Вызови `_ready()` один раз, а `_process()` — три раза циклом.',
          start: '# функции узла\n\n# эмуляция запуска\n',
          expect: ['Сцена готова', 'Кадр', 'Кадр', 'Кадр'],
          hint: 'for i in range(3): _process() — Godot делает это сам каждый кадр, мы — циклом.',
          solution: 'func _ready():\n\tprint("Сцена готова")\n\nfunc _process():\n\tprint("Кадр")\n\n_ready()\nfor i in range(3):\n\t_process()'
        },
        quiz: [
          { t: 'Какая функция вызывается каждый кадр?', ty: 'input', c: '_process', e: '_process(delta) — каждый кадр; _ready() — один раз.', tp: 'gd-6' },
          { t: 'Из чего собирается игра в Godot?', ty: 'choice', o: ['из полигонов', 'из узлов и сцен', 'из спрайтов PNG', 'из таблиц'], c: 'из узлов и сцен', e: 'Дерево узлов, сцены как переиспользуемые ветки.', tp: 'gd-6' },
          { t: 'delta в _process(delta) — это…', ty: 'choice', o: ['номер кадра', 'время с прошлого кадра в секундах', 'скорость игрока', 'имя узла'], c: 'время с прошлого кадра в секундах', e: 'На delta умножают скорость, чтобы движение не зависело от FPS.', tp: 'gd-6' }
        ]
      }
    ]
  });
})();
