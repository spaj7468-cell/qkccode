/* QKCcode — курс «C# для Unity» (6 уроков) */
(function () {
  window.QCOURSES = window.QCOURSES || [];
  window.QCOURSES.push({
    id: 'csharp',
    title: 'C# для Unity',
    tag: 'Unity · игры',
    dialect: 'csharp',
    level: 'с нуля',
    desc: 'Строгий язык с типами, на котором делают игры в Unity: от Console.WriteLine до методов и MonoBehaviour.',
    intro: 'C# («си-шарп») — язык Microsoft, ставший главным языком движка Unity. Он строгий: у каждой переменной есть тип, каждая строка заканчивается точкой с запятой, блоки живут в фигурных скобках. Эта дисциплина окупается в больших проектах. Задания курса выполняются встроенным интерпретатором подмножества C#.',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 2l8.7 5v10L12 22l-8.7-5V7L12 2z"/><path d="M12 12l8.7-5M12 12v10M12 12L3.3 7"/></svg>',
    lessons: [
      {
        t: 'Знакомство с C#',
        goal: 'первый вывод, структура программы, точки с запятой.',
        blocks: [
          ['h', 'Строгий и взрослый'],
          ['p', 'C# — компилируемый язык со строгой типизацией: программу сначала собирает компилятор, и он не пропустит опечатки. Каждая инструкция заканчивается `;`, блоки кода живут в `{ }`.'],
          ['code', { lang: 'csharp', code: 'Console.WriteLine("Привет, Unity!");\nConsole.WriteLine(2 + 2);\nConsole.WriteLine("Уровень: " + 7);', out: 'Привет, Unity!\n4\nУровень: 7' }],
          ['h', 'Комментарии'],
          ['code', { lang: 'csharp', code: '// однострочный комментарий\nConsole.WriteLine("код"); // и в конце строки', out: 'код' }],
          ['note', 'В Unity ты пишешь классы-скрипты (MonoBehaviour), но весь код внутри методов — ровно тот C#, который мы учим. `Console.WriteLine` в играх заменяет `Debug.Log`.']
        ],
        task: {
          kind: 'code',
          prompt: 'Выведи строку `Игра запущена` и следом число `100` (как результат 50 * 2).',
          start: '// две команды вывода\n',
          expect: ['Игра запущена', '100'],
          hint: 'Console.WriteLine("Игра запущена"); затем Console.WriteLine(50 * 2);',
          solution: 'Console.WriteLine("Игра запущена");\nConsole.WriteLine(50 * 2);'
        },
        quiz: [
          { t: 'Чем заканчивается каждая инструкция C#?', ty: 'input', c: ';', e: 'Точка с запятой обязательна.', tp: 'cs-1' },
          { t: 'Какая команда выводит текст в консоль?', ty: 'choice', o: ['print()', 'Console.WriteLine()', 'echo()', 'System.out()'], c: 'Console.WriteLine()', e: 'В Unity для лога используют Debug.Log, но синтаксис тот же.', tp: 'cs-1' },
          { t: 'C# — язык с динамической типизацией, как Python.', ty: 'bool', c: 'false', e: 'C# строго типизирован: тип переменной объявляется и не меняется.', tp: 'cs-1' }
        ]
      },
      {
        t: 'Переменные и типы',
        goal: 'int, float, string, bool, var; целочисленное деление.',
        blocks: [
          ['h', 'Тип объявляется сразу'],
          ['p', 'Перед именем переменной пишется её тип: `int` (целое), `float`/`double` (дробное), `string` (строка), `bool` (true/false). `var` — «определи тип сам».'],
          ['code', { lang: 'csharp', code: 'int health = 100;\nfloat speed = 5.5f;\nstring playerName = "Hero";\nbool isAlive = true;\nvar level = 3;\n\nConsole.WriteLine(playerName + " " + health);\nConsole.WriteLine(isAlive);\nConsole.WriteLine(speed * 2);', out: 'Hero 100\nTrue\n11' }],
          ['h', 'Целочисленное деление'],
          ['p', 'Важная особенность: `int / int` даёт **целое** — дробная часть отбрасывается.'],
          ['code', { lang: 'csharp', code: 'Console.WriteLine(7 / 2);   // целочисленное!\nConsole.WriteLine(7 % 2);   // остаток\nConsole.WriteLine(7.5 / 2); // дробные дают 3.75', out: '3\n1\n3.75' }],
          ['warn', '7 / 2 == 3 — классическая ловушка C#. Хочешь дробный результат — используй float/double (например, 7.5 / 2).']
        ],
        task: {
          kind: 'code',
          prompt: 'Объяви `int coins = 7;` и `int players = 2;`. Выведи результат `coins / players` (целочисленный) и следом остаток `coins % players` — две строки.',
          start: '// переменные\n\n// два вывода\n',
          expect: ['3', '1'],
          hint: 'Console.WriteLine(coins / players); Console.WriteLine(coins % players);',
          solution: 'int coins = 7;\nint players = 2;\nConsole.WriteLine(coins / players);\nConsole.WriteLine(coins % players);'
        },
        quiz: [
          { t: 'Тип целого числа в C# — …', ty: 'input', c: 'int', e: 'int — 32-битное целое.', tp: 'cs-2' },
          { t: 'Чему равно 7 / 2 в C# (обе переменные int)?', ty: 'input', c: '3', e: 'Целочисленное деление отбрасывает дробную часть.', tp: 'cs-2' },
          { t: 'Значения true/false в C# печатаются как…', ty: 'choice', o: ['true/false', 'True/False', '1/0', 'yes/no'], c: 'True/False', e: 'Console.WriteLine(true) напечатает True с большой буквы.', tp: 'cs-2' }
        ]
      },
      {
        t: 'Условия if / else',
        goal: 'ветвления со скобками и фигурными блоками.',
        blocks: [
          ['h', 'Синтаксис'],
          ['p', 'Условие — в круглых скобках, блок — в фигурных. `else if` — дополнительные ветки.'],
          ['code', { lang: 'csharp', code: 'int score = 75;\n\nif (score >= 90) {\n  Console.WriteLine("Мастер");\n} else if (score >= 60) {\n  Console.WriteLine("Боец");\n} else {\n  Console.WriteLine("Новичок");\n}', out: 'Боец' }],
          ['h', 'Логика'],
          ['list', [
            '`==`, `!=`, `<`, `>`, `<=`, `>=` — сравнения',
            '`&&` — И, `||` — ИЛИ, `!` — НЕ',
            'условие обязательно даёт `bool`: `if (health <= 0)`'
          ]],
          ['code', { lang: 'csharp', code: 'bool hasKey = true;\nint doors = 2;\nif (hasKey && doors > 0) {\n  Console.WriteLine("Открываю");\n}\nif (!hasKey) {\n  Console.WriteLine("Ищи ключ");\n}', out: 'Открываю' }]
        ],
        task: {
          kind: 'code',
          prompt: 'Дано `int ammo = 0;` и `bool melee = true;`. Если `ammo > 0` — выведи `"Огонь!"`, иначе если `melee` — `"Ближний бой"`, иначе `"Беги"`. Затем отдельной строкой выведи `"Готов"` если `ammo > 0 || melee`.',
          start: 'int ammo = 0;\nbool melee = true;\n\n// условие\n\n// вторая проверка\n',
          expect: ['Ближний бой', 'Готов'],
          hint: 'else if (melee) { … } — bool можно проверять без сравнения. Второе: if (ammo > 0 || melee).',
          solution: 'int ammo = 0;\nbool melee = true;\nif (ammo > 0) {\n  Console.WriteLine("Огонь!");\n} else if (melee) {\n  Console.WriteLine("Ближний бой");\n} else {\n  Console.WriteLine("Беги");\n}\nif (ammo > 0 || melee) {\n  Console.WriteLine("Готов");\n}'
        },
        quiz: [
          { t: 'Логическое «И» в C# — …', ty: 'input', c: '&&', e: '&& — И, || — ИЛИ, ! — НЕ.', tp: 'cs-3' },
          { t: 'Блок кода в C# выделяется…', ty: 'choice', o: ['отступами', 'фигурными скобками', 'словами begin/end', 'двоеточиями'], c: 'фигурными скобками', e: '{ } — как в JavaScript.', tp: 'cs-3' },
          { t: 'if (x = 5) — корректная проверка равенства.', ty: 'bool', c: 'false', e: '= присваивает; проверка — двойное ==.', tp: 'cs-3' }
        ]
      },
      {
        t: 'Циклы for, while, foreach',
        goal: 'три способа повторять код.',
        blocks: [
          ['h', 'for'],
          ['code', { lang: 'csharp', code: 'for (int i = 1; i <= 3; i++) {\n  Console.WriteLine("Попытка " + i);\n}', out: 'Попытка 1\nПопытка 2\nПопытка 3' }],
          ['h', 'while'],
          ['code', { lang: 'csharp', code: 'int fuel = 2;\nwhile (fuel > 0) {\n  Console.WriteLine("Топливо: " + fuel);\n  fuel--;\n}', out: 'Топливо: 2\nТопливо: 1' }],
          ['h', 'foreach и массивы'],
          ['p', 'Массив объявляется как `int[] nums = {1, 2, 3};`. `foreach` перебирает элементы без индексов.'],
          ['code', { lang: 'csharp', code: 'string[] items = { "меч", "щит" };\nforeach (string item in items) {\n  Console.WriteLine("Взял: " + item);\n}\nConsole.WriteLine(items.Length);', out: 'Взял: меч\nВзял: щит\n2' }]
        ],
        task: {
          kind: 'code',
          prompt: 'Циклом `for` выведи обратный отсчёт `3`, `2`, `1` (по одному в строке), затем строку `Пуск!`.',
          start: '// for от 3 до 1\n\n// Пуск!\n',
          expect: ['3', '2', '1', 'Пуск!'],
          hint: 'for (int i = 3; i >= 1; i--) { Console.WriteLine(i); }',
          solution: 'for (int i = 3; i >= 1; i--) {\n  Console.WriteLine(i);\n}\nConsole.WriteLine("Пуск!");'
        },
        quiz: [
          { t: 'Какой цикл перебирает массив без индексов?', ty: 'input', c: 'foreach', e: 'foreach (var x in arr) { … }.', tp: 'cs-4' },
          { t: 'i++ означает…', ty: 'choice', o: ['i = 1', 'i = i + 1', 'i * 2', 'сброс i'], c: 'i = i + 1', e: 'Инкремент: увеличить на единицу.', tp: 'cs-4' },
          { t: 'Длину массива даёт свойство…', ty: 'input', c: 'Length', e: 'arr.Length — с большой буквы.', tp: 'cs-4' }
        ]
      },
      {
        t: 'Методы (функции)',
        goal: 'объявлять методы с типами параметров и возвращаемого значения.',
        blocks: [
          ['h', 'Метод с результатом'],
          ['p', 'Перед именем метода пишется тип результата (`void` — «ничего не возвращает»), у параметров тоже есть типы.'],
          ['code', { lang: 'csharp', code: 'static int Sum(int a, int b) {\n  return a + b;\n}\n\nConsole.WriteLine(Sum(2, 5));\nConsole.WriteLine(Sum(10, 10));', out: '7\n20' }],
          ['h', 'void-метод'],
          ['code', { lang: 'csharp', code: 'void Announce(string message) {\n  Console.WriteLine("Внимание: " + message);\n}\n\nAnnounce("босс появился");', out: 'Внимание: босс появился' }],
          ['h', 'Логика внутри методов'],
          ['code', { lang: 'csharp', code: 'int CalcDamage(int baseDmg, bool crit) {\n  if (crit) {\n    return baseDmg * 2;\n  }\n  return baseDmg;\n}\n\nConsole.WriteLine(CalcDamage(10, true));\nConsole.WriteLine(CalcDamage(10, false));', out: '20\n10' }]
        ],
        task: {
          kind: 'code',
          prompt: 'Напиши метод `static int Max(int a, int b)`, возвращающий большее из двух чисел (через if). Выведи `Max(4, 9)` и `Max(12, 3)`.',
          start: '// метод Max\n\n// два вызова\n',
          expect: ['9', '12'],
          hint: 'if (a > b) { return a; } return b;',
          solution: 'static int Max(int a, int b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}\n\nConsole.WriteLine(Max(4, 9));\nConsole.WriteLine(Max(12, 3));'
        },
        quiz: [
          { t: 'Тип метода, который ничего не возвращает, — …', ty: 'input', c: 'void', e: 'void Метод() { … }', tp: 'cs-5' },
          { t: 'У параметров метода в C# указываются типы.', ty: 'bool', c: 'true', e: 'int a, string b — типы обязательны.', tp: 'cs-5' },
          { t: 'Что вернёт Sum(3, 4), если метод static int Sum(int a, int b) { return a + b; }?', ty: 'input', c: '7', e: 'Простое сложение параметров.', tp: 'cs-5' }
        ]
      },
      {
        t: 'C# внутри Unity',
        goal: 'MonoBehaviour, Start/Update, компоненты — как C# управляет игрой.',
        blocks: [
          ['h', 'Скрипт = компонент'],
          ['p', 'В Unity скрипт — это класс, наследующий `MonoBehaviour`. Его вешают как **компонент** на объект сцены (GameObject), и движок сам вызывает особые методы.'],
          ['code', { lang: 'csharp', noRun: true, note: 'выполняется только в Unity', code: 'using UnityEngine;\n\npublic class Player : MonoBehaviour {\n  public float speed = 5f;\n\n  void Start() {\n    Debug.Log("Игрок создан");\n  }\n\n  void Update() {\n    float h = Input.GetAxis("Horizontal");\n    transform.Translate(h * speed * Time.deltaTime, 0, 0);\n  }\n}' }],
          ['h', 'Методы жизненного цикла'],
          ['list', [
            '`Start()` — один раз перед первым кадром: инициализация',
            '`Update()` — каждый кадр: ввод, движение, логика',
            '`OnCollisionEnter(...)` — при столкновении',
            '`SerializeField` / `public` поля — видно и настраивается в инспекторе Unity'
          ]],
          ['h', 'Что из курса здесь пригодилось'],
          ['p', 'Всё: переменные `float speed` и `int health`, условия для урона, циклы для спавна врагов, методы для действий. `Time.deltaTime` умножают на скорость, чтобы движение не зависело от FPS — как `delta` в Godot.'],
          ['note', 'Наш интерпретатор выполняет подмножество C# без Unity-API. Настоящие `Debug.Log`, `transform` и `Input` живут в редакторе Unity — код выше вставишь туда без изменений.']
        ],
        task: {
          kind: 'code',
          prompt: 'Сымитируй скрипт Unity на чистом C#: напиши метод `void Start()` который печатает `"Сцена загружена"`, и метод `void Update(int frame)` который печатает `"Кадр " + frame`. Вызови `Start()` один раз, затем `Update(1)` и `Update(2)`.',
          start: '// методы Start и Update\n\n// вызовы\n',
          expect: ['Сцена загружена', 'Кадр 1', 'Кадр 2'],
          hint: 'void Update(int frame) { Console.WriteLine("Кадр " + frame); } — вызовы: Update(1); Update(2);',
          solution: 'void Start() {\n  Console.WriteLine("Сцена загружена");\n}\nvoid Update(int frame) {\n  Console.WriteLine("Кадр " + frame);\n}\n\nStart();\nUpdate(1);\nUpdate(2);'
        },
        quiz: [
          { t: 'От какого класса наследуется скрипт Unity?', ty: 'input', c: 'MonoBehaviour', e: 'public class Player : MonoBehaviour.', tp: 'cs-6' },
          { t: 'Какой метод вызывается каждый кадр?', ty: 'input', c: 'Update', e: 'Update() — каждый кадр, Start() — один раз.', tp: 'cs-6' },
          { t: 'На что умножают скорость в Update, чтобы движение не зависело от FPS?', ty: 'choice', o: ['Time.deltaTime', 'Random.value', 'frameCount', 'speed / 2'], c: 'Time.deltaTime', e: 'Время последнего кадра — аналог delta в Godot.', tp: 'cs-6' }
        ]
      }
    ]
  });
})();
