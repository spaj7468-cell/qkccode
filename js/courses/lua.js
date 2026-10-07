/* QKCcode — курс «Lua для Roblox Studio» (6 уроков) */
(function () {
  window.QCOURSES = window.QCOURSES || [];
  window.QCOURSES.push({
    id: 'lua',
    title: 'Lua для Roblox Studio',
    tag: 'Roblox · игры',
    dialect: 'lua',
    level: 'с нуля',
    desc: 'Язык, на котором написаны почти все игры Roblox. От print до собственных функций — и как это ложится на Roblox Studio.',
    intro: 'Каждая игра в Roblox — это Lua (точнее, Luau, его ускоренная версия) внутри скриптов Roblox Studio. Курс учит чистому Lua: переменные, условия, циклы, функции — а шестой урок показывает, как эти знания превращаются в настоящие игровые скрипты. Задания выполняются в встроенном интерпретаторе Lua прямо на странице.',
    icon: '<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>',
    lessons: [
      {
        t: 'Знакомство с Lua',
        goal: 'запустить первый print, научиться комментариям и строкам.',
        blocks: [
          ['h', 'Что за язык'],
          ['p', '**Lua** — маленький и быстрый язык, созданный для встраивания в программы. Его главное применение сегодня — **Roblox Studio**: миллионы игр сделаны на нём. Учить Lua легко: в нём всего около двадцати ключевых слов.'],
          ['code', { lang: 'lua', code: 'print("Привет, Roblox!")\nprint(2 + 2)\nprint("Сумма:", 10 + 5)', out: 'Привет, Roblox!\n4\nСумма: 15' }],
          ['p', 'Комментарий — две черты: `--`. Всё после них до конца строки игнорируется.'],
          ['code', { lang: 'lua', code: '-- это комментарий\nprint("код") -- и это комментарий', out: 'код' }],
          ['note', 'Настоящий print в Lua разделяет аргументы табуляцией; наш учебный интерпретатор печатает их через пробел — иначе не отличишь. На синтаксис это не влияет.'],
          ['warn', 'В Roblox Studio код живёт в объектах **Script** и **LocalScript** внутри Explorer. Здесь мы учим сам язык — в Studio перенесёшь знания один в один.']
        ],
        task: {
          kind: 'code',
          prompt: 'Выведи ровно одну строку: `Привет, мир!`.',
          start: '-- первая программа\n',
          expect: ['Привет, мир!'],
          hint: 'print("Привет, мир!")',
          solution: 'print("Привет, мир!")'
        },
        quiz: [
          { t: 'Комментарий в Lua начинается с…', ty: 'input', c: '--', e: 'Две черты: -- комментарий. (// в Lua не работает!)', tp: 'lua-1' },
          { t: 'Какой движок игр использует Lua как основной язык скриптов?', ty: 'choice', o: ['Unity', 'Unreal Engine', 'Roblox Studio', 'Godot'], c: 'Roblox Studio', e: 'Roblox использует Luau — улучшенную версию Lua.', tp: 'lua-1' },
          { t: 'print("a", "b") напечатает одну строку.', ty: 'bool', c: 'true', e: 'Да, аргументы разделяются табуляцией в пределах одной строки.', tp: 'lua-1' }
        ]
      },
      {
        t: 'Переменные: local и типы',
        goal: 'объявлять переменные, склеивать строки через .., знать типы Lua.',
        blocks: [
          ['h', 'local — значит переменная'],
          ['p', 'Переменные объявляют словом `local`. Без него переменная станет глобальной — так писать не принято.'],
          ['code', { lang: 'lua', code: 'local player = "Steve"\nlocal hp = 100\nlocal alive = true\n\nprint(player, hp, alive)', out: 'Steve 100 true' }],
          ['h', 'Конкатенация — две точки'],
          ['p', 'Строки склеиваются оператором `..` (две точки). Числа при склеивании превращаются в строки автоматически.'],
          ['code', { lang: 'lua', code: 'local name = "Аня"\nlocal level = 7\nprint("Игрок " .. name .. ", уровень " .. level)', out: 'Игрок Аня, уровень 7' }],
          ['h', 'Типы Lua'],
          ['list', [
            '`number` — и целые, и дробные: 5, 3.14',
            '`string` — "текст" или \'текст\'',
            '`boolean` — true / false',
            '`nil` — «ничего»: значение отсутствует',
            '`table` — таблицы (массивы и словари) — изучим позже'
          ]],
          ['code', { lang: 'lua', code: 'local x = nil\nprint(x)\nprint(7 / 2, 7 // 2, 2 ^ 3)', out: 'nil\n3.5 3 8' }]
        ],
        task: {
          kind: 'code',
          prompt: 'Создай `local name = "Steve"` и `local level = 7`. Одной командой print выведи строку вида `Steve — уровень 7`, используя конкатенацию `..` (тире — обычный символ " — ").',
          start: '-- переменные\n\n-- вывод с ..\n',
          expect: ['Steve — уровень 7'],
          hint: 'print(name .. " — уровень " .. level)',
          solution: 'local name = "Steve"\nlocal level = 7\nprint(name .. " — уровень " .. level)'
        },
        quiz: [
          { t: 'Оператор склеивания строк в Lua — …', ty: 'input', c: '..', e: 'Две точки. Плюс строки не клеит!', tp: 'lua-2' },
          { t: 'Какое слово объявляет переменную?', ty: 'input', c: 'local', e: 'local x = 5. Без local переменная глобальная.', tp: 'lua-2' },
          { t: 'Значение «ничего» в Lua называется…', ty: 'choice', o: ['null', 'None', 'nil', 'void'], c: 'nil', e: 'nil — уникальное «пустое» значение Lua.', tp: 'lua-2' }
        ]
      },
      {
        t: 'Условия: if / then / end',
        goal: 'ветвить код по-луавски: then, elseif, end.',
        blocks: [
          ['h', 'Синтаксис условия'],
          ['p', 'После условия идёт слово `then`, блок закрывается словом `end`. «Иначе если» — `elseif`, «иначе» — `else`.'],
          ['code', { lang: 'lua', code: 'local hp = 45\n\nif hp < 25 then\n  print("Критично!")\nelseif hp < 50 then\n  print("Мало здоровья")\nelse\n  print("Всё нормально")\nend', out: 'Мало здоровья' }],
          ['h', 'Сравнения и логика'],
          ['list', [
            '`==` равно, `~=` НЕ равно (не `!=`!)',
            '`<` `>` `<=` `>=`',
            '`and`, `or`, `not` — словами'
          ]],
          ['code', { lang: 'lua', code: 'local hasKey = true\nlocal doorOpen = false\n\nif hasKey and not doorOpen then\n  print("Открываю дверь")\nend\nprint(10 ~= 5)', out: 'Открываю дверь\ntrue' }],
          ['note', 'В Lua ложными считаются только `false` и `nil`. Число 0 и пустая строка — ИСТИННЫЕ, в отличие от JS и Python!']
        ],
        task: {
          kind: 'code',
          prompt: 'Дано `local coins = 120`. Выведи `"Богач"` если coins больше 100, `"Средняк"` если больше 50, иначе `"Бедняк"`. Затем отдельной строкой выведи результат проверки `coins >= 100` (true/false).',
          start: 'local coins = 120\n\n-- условие\n\n-- проверка\n',
          expect: ['Богач', 'true'],
          hint: 'if coins > 100 then … elseif coins > 50 then … else … end. Вторая строка: print(coins >= 100).',
          solution: 'local coins = 120\nif coins > 100 then\n  print("Богач")\nelseif coins > 50 then\n  print("Средняк")\nelse\n  print("Бедняк")\nend\nprint(coins >= 100)'
        },
        quiz: [
          { t: '«Не равно» в Lua записывается как…', ty: 'input', c: '~=', e: '~= — тильда-равно. != в Lua не существует.', tp: 'lua-3' },
          { t: 'if в Lua закрывается словом…', ty: 'input', c: 'end', e: 'if … then … end. Фигурных скобок нет.', tp: 'lua-3' },
          { t: 'Число 0 в Lua считается ложным.', ty: 'bool', c: 'false', e: 'Ложны только false и nil. 0 — истинно, это ловушка для новичков!', tp: 'lua-3' }
        ]
      },
      {
        t: 'Циклы: for и while',
        goal: 'повторять действия: числовой for, while, шаг назад.',
        blocks: [
          ['h', 'Числовой for'],
          ['p', '`for i = старт, финиш do … end` повторяет блок, увеличивая i на 1 (или на шаг, если он указан). Финиш **включается**.'],
          ['code', { lang: 'lua', code: 'for i = 1, 3 do\n  print("Прыжок", i)\nend\n\nfor i = 10, 1, -3 do\n  print(i)\nend', out: 'Прыжок 1\nПрыжок 2\nПрыжок 3\n10\n7\n4\n1' }],
          ['h', 'while'],
          ['code', { lang: 'lua', code: 'local fuel = 2\nwhile fuel > 0 do\n  print("Топливо:", fuel)\n  fuel = fuel - 1\nend', out: 'Топливо: 2\nТопливо: 1' }],
          ['note', 'В Lua нет `+=` — пиши полностью: `fuel = fuel - 1`. Зато есть `break` для досрочного выхода.']
        ],
        task: {
          kind: 'code',
          prompt: 'Выведи таблицу умножения на 3: числа 3, 6, 9, …, 30 — каждое с новой строки. Используй числовой `for` от 1 до 10.',
          start: '-- for i = 1, 10 do …\n',
          expect: ['3', '6', '9', '12', '15', '18', '21', '24', '27', '30'],
          hint: 'Внутри цикла: print(3 * i).',
          solution: 'for i = 1, 10 do\n  print(3 * i)\nend'
        },
        quiz: [
          { t: 'for i = 1, 5 do выполнится … раз(а).', ty: 'input', c: '5', e: 'От 1 до 5 включительно — пять итераций (финиш включается, не как в Python!).', tp: 'lua-4' },
          { t: 'Как задать шаг -1 в числовом for?', ty: 'choice', o: ['for i = 10, 1, -1 do', 'for i = 10 to 1 step -1', 'for (i=10; i>0; i--)', 'reverse for i = 1, 10'], c: 'for i = 10, 1, -1 do', e: 'Третье число после запятой — шаг.', tp: 'lua-4' },
          { t: 'В Lua есть оператор +=.', ty: 'bool', c: 'false', e: 'Нет: только x = x + 1.', tp: 'lua-4' }
        ]
      },
      {
        t: 'Функции и таблицы',
        goal: 'писать функции, возвращать значения, трогать таблицы и оператор #.',
        blocks: [
          ['h', 'Функции'],
          ['p', 'Функция: `function имя(параметры) … end` или `local function имя(...)`. `return` возвращает значение (и сразу завершает функцию).'],
          ['code', { lang: 'lua', code: 'local function damage(base, mult)\n  return base * mult\nend\n\nprint(damage(10, 3))\nprint(damage(7, 2))', out: '30\n14' }],
          ['h', 'Таблицы'],
          ['p', 'Таблица — главная структура Lua: и массив, и словарь. Массивная часть считается **с единицы**, длину даёт оператор `#`.'],
          ['code', { lang: 'lua', code: 'local inv = {"меч", "щит", "зелье"}\nprint(#inv)\nprint(inv[1])\ninv[3] = "эликсир"\nprint(inv[3])', out: '3\nмеч\nэликсир' }],
          ['warn', 'Индексы с 1, а не с 0 — классическая ошибка после JavaScript. inv[0] в Lua обычно nil.']
        ],
        task: {
          kind: 'code',
          prompt: 'Напиши `local function heal(hp, amount)` которая возвращает `hp + amount`, но не больше 100: если сумма больше 100 — верни 100 (используй if). Выведи `heal(90, 20)` и `heal(50, 10)`.',
          start: '-- функция heal\n\n-- два вывода\n',
          expect: ['100', '60'],
          hint: 'local total = hp + amount; if total > 100 then return 100 end; return total — или через if/else.',
          solution: 'local function heal(hp, amount)\n  local total = hp + amount\n  if total > 100 then\n    return 100\n  end\n  return total\nend\n\nprint(heal(90, 20))\nprint(heal(50, 10))'
        },
        quiz: [
          { t: 'С какого индекса начинается массивная часть таблицы Lua?', ty: 'input', c: '1', e: 'С единицы — уникальная черта Lua.', tp: 'lua-5' },
          { t: 'Оператор длины таблицы — …', ty: 'input', c: '#', e: '#inv — количество элементов массивной части.', tp: 'lua-5' },
          { t: 'Функция в Lua закрывается словом end.', ty: 'bool', c: 'true', e: 'function … end, как if и циклы.', tp: 'lua-5' }
        ]
      },
      {
        t: 'Lua внутри Roblox Studio',
        goal: 'увидеть, как чистый Lua превращается в игровые скрипты Roblox.',
        blocks: [
          ['h', 'Где живёт код в Roblox'],
          ['p', 'В Roblox Studio код помещают в объекты **Script** (серверный) и **LocalScript** (на стороне игрока) внутри **Explorer**. Скрипт лежит прямо в детали (Part) или в сервисах вроде `Workspace` и `Players`.'],
          ['code', { lang: 'lua', noRun: true, note: 'выполняется только в Roblox Studio', code: '-- так выглядит скрипт внутри игры:\nlocal part = Instance.new("Part")\npart.Parent = workspace\npart.BrickColor = BrickColor.new("Really black")\n\ngame.Players.PlayerAdded:Connect(function(player)\n  print("Вошёл игрок:", player.Name)\nend)' }],
          ['h', 'Что ты уже знаешь для этих скриптов'],
          ['list', [
            '`local` — все переменные скриптов объявляются так',
            'функции и `:Connect(function(player) … end)` — обработчики событий',
            'условия — проверка здоровья, прав доступа, состояния игры',
            'циклы — спавн предметов, тики урона, отсчёт времени',
            'таблицы — инвентари, списки игроков, настройки'
          ]],
          ['h', 'Событийная модель'],
          ['p', 'Игра Roblox событийная: ты не «крутишь цикл кадров» сам, а подключаешь функции к событиям — `Touched`, `PlayerAdded`, `ClickDetector.MouseClick`. Внутри обработчика — тот же Lua, который ты выучил.'],
          ['note', 'Roblox-версия языка называется **Luau**: тот же Lua плюс типы и небольшие улучшения. Всё из этого курса работает там без изменений.']
        ],
        task: {
          kind: 'code',
          prompt: 'Симуляция жизней игрока на чистом Lua: `local lives = 3`; циклом `while` выводи `"Жизнь: " .. lives` и уменьшай жизни на 1, пока они больше 0. После цикла выведи `"Игра окончена"`.',
          start: 'local lives = 3\n\n-- while-цикл\n\n-- финальная строка\n',
          expect: ['Жизнь: 3', 'Жизнь: 2', 'Жизнь: 1', 'Игра окончена'],
          hint: 'while lives > 0 do print("Жизнь: " .. lives) lives = lives - 1 end',
          solution: 'local lives = 3\nwhile lives > 0 do\n  print("Жизнь: " .. lives)\n  lives = lives - 1\nend\nprint("Игра окончена")'
        },
        quiz: [
          { t: 'Как называется объект для серверного кода в Roblox Studio?', ty: 'input', c: 'Script', e: 'Script — сервер, LocalScript — клиент.', tp: 'lua-6' },
          { t: 'Luau — это…', ty: 'choice', o: ['другой язык, не связанный с Lua', 'версия Lua от Roblox с улучшениями', 'название детали', 'движок Godot'], c: 'версия Lua от Roblox с улучшениями', e: 'Luau = Lua + типы + производительность.', tp: 'lua-6' },
          { t: 'Событие Touched срабатывает, когда деталь кто-то коснулся.', ty: 'bool', c: 'true', e: 'Да, это стандартное событие Part в Roblox.', tp: 'lua-6' }
        ]
      }
    ]
  });
})();
