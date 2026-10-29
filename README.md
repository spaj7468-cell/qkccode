# QKCcode — учись программировать офлайн

**QKCcode (QKC v2)** — чёрно-белая офлайн-школа программирования от [OuRi Corp](https://corp.qkc.runs-on.dev/).
В отличие от [тренажёра QKC](https://qkc.runs-on.dev/) (короткие тесты на проверку знаний), здесь **полное обучение**:
теория → запускаемый пример → практическое задание с проверкой кода → тест.

[![lessons](https://img.shields.io/badge/lessons-39-black)](#курсы)
[![courses](https://img.shields.io/badge/courses-7-black)](#курсы)
[![deps](https://img.shields.io/badge/dependencies-0-black)](#как-это-работает)
[![license](https://img.shields.io/badge/license-MIT-black)](./LICENSE)

**Живой сайт:** https://code.qkc.runs-on.dev/
Домен `code.qkc.runs-on.dev` заработает после merge заявки
[zordhalo/runs-on.dev#310](https://github.com/zordhalo/runs-on.dev/pull/310).

---

## Что внутри

- **7 курсов · 39 уроков · 39 практических заданий · 115 тестовых вопросов**
- **Офлайн целиком** — это PWA: service worker кэширует всё (страницы, курсы, интерпретатор, движок, иконки).
  Один раз открыл с интернетом → дальше учишься без сети. Прогресс живёт в `localStorage`, аккаунтов и серверов нет.
- **Пишешь и запускаешь код прямо в уроке.** Собственный учебный интерпретатор выполняет
  Lua, GDScript, C#, JavaScript и Python локально, в браузере. HTML рендерится живьём в `<iframe>`.
- **Тесты собирает [QKC Engine](https://github.com/spaj7468-cell/qkc-engine)** — тот же открытый движок викторин,
  на котором работает тренажёр QKC (42 823 вопроса). Seed-воспроизводимые тесты, оценка по темам, режимы normal/exam/sprint.
- **Строгий монохром.** Только чёрное и белое, адаптив 320–1920, уважает `prefers-reduced-motion`, доступен с клавиатуры.
- **Прогресс, XP и уровни** — копятся локально, по каждому уроку видно: теория / практика / тест.

## Курсы

| курс | язык | уроков | движок заданий |
|---|---|---|---|
| HTML и CSS | разметка | 6 | живой предпросмотр в `<iframe>` |
| JavaScript | JS | 6 | интерпретатор `dialects.js` |
| Python | Python | 5 | интерпретатор `dialects.js` |
| Lua для Roblox Studio | Lua | 6 | интерпретатор `dialects.js` |
| GDScript для Godot | GDScript | 6 | интерпретатор `dialects.js` |
| C# для Unity | C# | 6 | интерпретатор `dialects.js` |
| QKC Engine | JS + движок | 4 | интерпретатор + живой `QKC.init()` |

## Как это работает

Два движка, **ноль зависимостей**, всё написано на JavaScript вручную (без фреймворков и сборщиков):

1. **Учебный интерпретатор** — [`js/dialects.js`](js/dialects.js). Один токенайзер, три семейства парсеров
   (фигурные скобки — JS/C#, `end`-блоки — Lua, отступы — Python/GDScript) и общий tree-walking вычислитель.
   Поддерживает учебное подмножество: переменные, типы, условия, циклы, функции, списки, объекты, вывод.
   Игровые API (Roblox/Godot/Unity) не выполняются — для них в уроках есть теория и настоящие примеры,
   а выполняемые задания написаны на чистом подмножестве языка. Есть лимит шагов (защита от бесконечных циклов)
   и понятные сообщения об ошибках со номером строки.

2. **QKC Engine** — [`vendor/qkc-engine.js`](vendor/qkc-engine.js) (копия сборки движка). Собирает и оценивает
   тесты уроков и экзамены курсов, рисует виджет `QKC.init()`.

```
index.html            оболочка SPA + шапка/подвал
css/style.css         дизайн-система (монохром, адаптив)
js/dialects.js        учебный интерпретатор языков
js/i18n.js            словари интерфейса RU/EN
js/app.js             роутер, уроки, задания, тесты, прогресс, песочница
js/courses/*.js       контент курсов (по файлу на курс)
vendor/qkc-engine.js  QKC Engine (UMD-сборка)
sw.js                 service worker — полный офлайн
manifest.webmanifest  PWA-манифест
assets/               иконки (монохром)
test/                 dialects / content / e2e (jsdom)
```

## Локально

Никакой сборки не нужно — открой `index.html`. Для полного офлайна (service worker) нужен http:

```sh
# например
python3 -m http.server 8080
# → http://localhost:8080
```

## Тесты

```sh
npm install              # ставит jsdom (dev)
node test/dialects.mjs   # интерпретаторы языков
node test/content.mjs    # контент: решения заданий, примеры, валидность тестов
npm run test:e2e         # сайт на jsdom: роутер, уроки, задания, прогресс, i18n
npm test                 # всё вместе
```

- `dialects` — 86 проверок поведения Lua/JS/C#/Python/GDScript.
- `content` — прогоняет **решения всех заданий** и **все примеры с выводом** через интерпретатор,
  проверяет формат каждого вопроса под QKC Engine.
- `e2e` — поднимает сайт в jsdom и кликает по нему: главная, курс, урок, проверка кода, HTML-предпросмотр,
  экзамен, песочница, страница движка, прогресс, язык, тема.

## Семейство OuRi

- [QKC — тренажёр](https://qkc.runs-on.dev/) — 42 823 школьных вопроса
- [QKC Engine — документация](https://engine.qkc.runs-on.dev/) — движок викторин
- [Arakul Studio](https://spaj7468-cell.github.io/Arakul/) — браузерное рабочее пространство
- [OuRi Corp — о компании](https://corp.qkc.runs-on.dev/)
- [QKCcode](https://code.qkc.runs-on.dev/) — этот сайт

## Лицензия

[MIT](./LICENSE) · OuRi Corp. Бери интерпретатор, движок и контент в свои проекты — ссылка приветствуется.


## OuRi ecosystem

QKCcode is connected to the wider OuRi project family:
- [OuRi Corp — project directory](https://corp.qkc.runs-on.dev/)
- [QKC — knowledge trainer](https://qkc.runs-on.dev/)
- [QKC Engine — quiz engine and API docs](https://engine.qkc.runs-on.dev/)
- [Arakul Studio — browser workspace](https://spaj7468-cell.github.io/Arakul/)
- [All repositories](https://github.com/spaj7468-cell?tab=repositories)

Projects were created at different times and have different scopes and maturity levels. Their quality and capabilities can differ; a newer project is not automatically better at everything.

## Авторы

| Роль | Автор | Профиль |
|------|-------|---------|
| Автор | **telrino** | <https://vk.ru/telrino> |
| Соавтор | **Бро** | <https://vk.ru/id920684081> |
