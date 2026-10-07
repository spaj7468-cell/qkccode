/* QKCcode — e2e-тесты сайта на jsdom: node --experimental-vm-modules test/e2e.mjs
   NODE_PATH=/tmp/node_modules node test/e2e.mjs */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let pass = 0, fail = 0;
const ok = (n) => { pass++; };
const bad = (n, why) => { fail++; console.log('FAIL', n, '—', why); };
const check = (name, cond, why) => cond ? ok(name) : bad(name, why || 'условие ложно');
const tick = () => new Promise(r => setTimeout(r, 90));

async function boot() {
  const html = read('index.html');
  const dom = new JSDOM(html, {
    url: 'https://spaj7468-cell.github.io/qkccode/index.html',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    resources: undefined
  });
  const w = dom.window;
  w.confirm = () => true;
  w.scrollTo = () => {};
  // порядок скриптов как в index.html
  const files = [
    'vendor/qkc-engine.js', 'js/dialects.js', 'js/i18n.js',
    'js/courses/html.js', 'js/courses/javascript.js', 'js/courses/python.js',
    'js/courses/lua.js', 'js/courses/gdscript.js', 'js/courses/csharp.js',
    'js/courses/qkc.js', 'js/app.js'
  ];
  for (const f of files) w.eval(read(f));
  // jsdom не грузит внешние ресурсы — logo и т.п. не важны
  await tick();
  return { dom, w, d: w.document };
}

const q = (d, s) => d.querySelector(s);
const qa = (d, s) => Array.from(d.querySelectorAll(s));
const click = (el) => el.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true }));

const run = async () => {
  /* ── 1. главная ── */
  {
    const { w, d } = await boot();
    check('home: герой', q(d, '.hero h1'), 'нет .hero h1');
    check('home: 7 карточек курсов', qa(d, '.ccard').length === 7, `найдено ${qa(d, '.ccard').length}`);
    const stats = qa(d, '.hero__stats b').map(b => b.textContent);
    check('home: статистика курсов=7', stats[0] === '7', stats[0]);
    check('home: статистика уроков=39', stats[1] === '39', stats[1]);
    check('home: зависимости=0', stats[5] === '0', stats[5]);
    check('home: шаги how', qa(d, '.step').length === 4);
    check('home: футер-курсы', qa(d, '#footCourses li').length === 7);
    check('home: версия движка в футере', /v1\.2\.0/.test(q(d, '#footVer').textContent), q(d, '#footVer').textContent);
    check('home: title', d.title.includes('QKCcode'), d.title);
    check('home: нет js.org', !read('index.html').includes('js.org') && !read('js/app.js').includes('js.org'));
  }

  /* ── 2. роутер: курсы → курс → урок ── */
  {
    const { w, d } = await boot();
    w.location.hash = '#/courses';
    await tick();
    check('courses: 7 карточек', qa(d, '.ccard').length === 7);

    w.location.hash = '#/course/lua';
    await tick();
    check('course/lua: заголовок', q(d, '.course-head h1').textContent.includes('Lua'), q(d, '.course-head h1').textContent);
    check('course/lua: 6 уроков', qa(d, '.lrow').length === 6, `${qa(d, '.lrow').length}`);
    check('course/lua: экзамен-панель', q(d, '.taskbox') && q(d, '.taskbox h3').textContent.includes('Итоговый'));

    w.location.hash = '#/lesson/lua/0';
    await tick();
    check('lesson: h1', q(d, '.lesson-head h1').textContent.includes('Знакомство'), q(d, '.lesson-head h1').textContent);
    check('lesson: goal', !!q(d, '.lesson-goal'));
    check('lesson: теория code-блоки', qa(d, '.theory .codebox').length >= 2);
    check('lesson: taskbox', !!q(d, '.taskbox textarea'));
    check('lesson: expect-блок', q(d, '.expect').textContent.includes('Привет, мир!'));
    check('lesson: квиз-виджет движка', !!q(d, '.quiz-mount .qkc-root'), 'QKC.init не отрисовал виджет');
    check('lesson: навигация', qa(d, '.lesson-nav a').length === 2);

    // 404-роут → главная
    w.location.hash = '#/course/nonexistent';
    await tick();
    check('роутер: неизвестный курс → home', !!q(d, '.hero h1'));
  }

  /* ── 3. задание урока: проверка кода, XP, прогресс ── */
  {
    const { w, d } = await boot();
    w.location.hash = '#/lesson/lua/0';
    await tick();
    const ta = q(d, '.taskbox textarea');
    const verdict = q(d, '.taskbox .verdict');
    // неверный код
    ta.value = 'print("не то")';
    const btns = qa(d, '.taskbox .editor__bar button');
    const checkBtn = btns.find(b => b.textContent.includes('Проверить'));
    click(checkBtn);
    await tick();
    check('task: неверно → bad', verdict.className.includes('bad'), verdict.className);
    check('task: вывод показан', q(d, '.taskbox .code-out, .taskbox .code-err') !== null);
    // верный код (решение)
    ta.value = 'print("Привет, мир!")';
    click(checkBtn);
    await tick();
    check('task: верно → ok', verdict.className.includes('ok'), verdict.className);
    const S = JSON.parse(w.localStorage.getItem('qkccode.v1'));
    check('task: прогресс записан', S.done.lua['0'].task === true, JSON.stringify(S.done));
    check('task: XP начислен', S.xp >= 20, String(S.xp));
    check('task: XP-чип в шапке', q(d, '#xpChip').textContent.includes('XP'), q(d, '#xpChip').textContent);
    // кнопка «прочитано»
    const readBtn = qa(d, '.theory button').find(b => b.textContent.includes('прочитанной'));
    click(readBtn);
    await tick();
    const S2 = JSON.parse(w.localStorage.getItem('qkccode.v1'));
    check('read: отметка + XP', S2.done.lua['0'].read === true && S2.xp >= 25, JSON.stringify(S2.done.lua['0']) + ' xp=' + S2.xp);
    // подсказка
    const hintBtn = qa(d, '.taskbox .editor__bar button').find(b => b.textContent.includes('Подсказка'));
    click(hintBtn);
    await tick();
    check('hint: показан', q(d, '.hintbox').className.includes('show'));
  }

  /* ── 4. запуск примеров теории ── */
  {
    const { w, d } = await boot();
    w.location.hash = '#/lesson/python/3';
    await tick();
    const boxes = qa(d, '.theory .codebox');
    const runBtn = boxes[0].querySelector('.codebox__bar button');
    check('theory: кнопка запуска есть', !!runBtn);
    if (runBtn) {
      click(runBtn);
      await tick();
      const outs = boxes[0].querySelectorAll('pre');
      const last = outs[outs.length - 1];
      check('theory: запуск даёт вывод', last && last.textContent.includes('Привет 0'), last && last.textContent);
    }
  }

  /* ── 5. HTML-задание: предпросмотр и проверки ── */
  {
    const { w, d } = await boot();
    w.location.hash = '#/lesson/html/0';
    await tick();
    const ta = q(d, '.taskbox textarea');
    const frame = q(d, '.taskbox .preview-frame');
    check('html-task: iframe предпросмотра', !!frame);
    check('html-task: srcdoc стартового кода', frame && frame.srcdoc.includes('DOCTYPE'), frame && frame.srcdoc.slice(0, 40));
    const checkBtn = qa(d, '.taskbox .editor__bar button').find(b => b.textContent.includes('Проверить'));
    click(checkBtn); // стартовый код не проходит
    await tick();
    const items = qa(d, '.checklist li');
    check('html-task: чеклист', items.length === 3, `${items.length}`);
    check('html-task: старт не принят', !q(d, '.taskbox .verdict').className.includes('ok'));
    // решение
    ta.value = '<!DOCTYPE html>\n<h1>Привет, мир!</h1>\n<p>Меня зовут Саша и я учусь.</p>';
    click(checkBtn);
    await tick();
    check('html-task: решение принято', q(d, '.taskbox .verdict').className.includes('ok'));
    check('html-task: все пункты чеклиста ok', qa(d, '.checklist li.ok').length === 3);
  }

  /* ── 6. экзамен курса (QKC Engine, режим exam) ── */
  {
    const { w, d } = await boot();
    w.location.hash = '#/exam/lua';
    await tick();
    check('exam: виджет смонтирован', !!q(d, '.quiz-mount .qkc-root'));
    check('exam: режим exam', q(d, '.qkc-mode') && q(d, '.qkc-mode').textContent.includes('экзамен'), q(d, '.qkc-mode') && q(d, '.qkc-mode').textContent);
  }

  /* ── 7. песочница ── */
  {
    const { w, d } = await boot();
    w.location.hash = '#/playground';
    await tick();
    const tabs = qa(d, '.play-tabs button');
    check('play: 6 вкладок (5 языков + HTML)', tabs.length === 6, `${tabs.length}`);
    const ta = q(d, '.play-layout textarea');
    check('play: пример загружен', ta.value.includes('Roblox'), ta.value.slice(0, 30));
    const runBtn = qa(d, '.editor__bar button').find(b => b.textContent.includes('Запустить'));
    click(runBtn);
    await tick();
    const out = q(d, '.play-out pre');
    check('play: вывод запуска', out && out.textContent.includes('Игрок: Steve'), out && out.textContent.slice(0, 60));
    // переключение на HTML
    const htmlTab = tabs.find(b => b.textContent === 'HTML');
    click(htmlTab);
    await tick();
    check('play: HTML-вкладка даёт iframe', !!q(d, '.play-layout iframe'));
    // переключение на Python и запуск семпла
    w.location.hash = '#/courses';
    await tick();
    w.location.hash = '#/playground';
    await tick();
    const pyTab = qa(d, '.play-tabs button').find(b => b.textContent === 'Python');
    click(pyTab);
    const runBtn2 = qa(d, '.editor__bar button').find(b => b.textContent.includes('Запустить'));
    click(runBtn2);
    await tick();
    const out2 = q(d, '.play-out pre');
    check('play: python-семпл работает', out2 && out2.textContent.includes('Привет, Мир'), out2 && out2.textContent.slice(0, 60));
  }

  /* ── 8. страница движка ── */
  {
    const { w, d } = await boot();
    w.location.hash = '#/engine';
    await tick();
    check('engine: заголовок', q(d, '.eng-hero h1').textContent === 'QKC Engine');
    check('engine: версия', q(d, '.eng-hero p.mono').textContent.includes('1.2.0'), q(d, '.eng-hero p.mono').textContent);
    check('engine: демо-виджет', !!q(d, '.quiz-mount .qkc-root'));
    check('engine: ссылки на документацию', qa(d, '.links-row a').length >= 4);
    check('engine: нет js.org', !d.body.innerHTML.includes('js.org'));
    check('engine: runs-on PR упомянут', d.body.innerHTML.includes('runs-on'));
  }

  /* ── 9. прогресс ── */
  {
    const { w, d } = await boot();
    // отметим урок через стор приложения
    const st = w.QCCODE_APP.store();
    st.xp = 100; st.done.lua = { '0': { read: true, task: true, quiz: 100 } };
    w.location.hash = '#/progress';
    w.eval('window.dispatchEvent(new Event("hashchange"))');
    await tick();
    check('progress: XP-блок', qa(d, '.xp-head b')[0].textContent === '100');
    check('progress: уровень', qa(d, '.xp-head b')[1].textContent === '1');
    check('progress: карточки курсов', qa(d, '.pcard').length === 7);
    const luaCard = qa(d, '.pcard').find(c => c.textContent.includes('Lua'));
    check('progress: точки урока lua полны', luaCard.querySelectorAll('.dots i.full').length === 1);
    // сброс
    const resetBtn = qa(d, 'button').find(b => b.textContent.includes('Сбросить'));
    click(resetBtn);
    await tick();
    const S = JSON.parse(w.localStorage.getItem('qkccode.v1'));
    check('progress: сброс', S.xp === 0 && Object.keys(S.done).length === 0);
  }

  /* ── 10. i18n и тема ── */
  {
    const { w, d } = await boot();
    click(q(d, '#btnLang'));
    await tick();
    check('i18n: EN-навигация', qa(d, '#navLinks a')[0].textContent === 'Courses', qa(d, '#navLinks a')[0].textContent);
    check('i18n: lang=en', d.documentElement.getAttribute('lang') === 'en');
    check('i18n: EN-герой', q(d, '.hero__sub').textContent.includes('monochrome'), q(d, '.hero__sub').textContent.slice(0, 60));
    const S = JSON.parse(w.localStorage.getItem('qkccode.v1'));
    check('i18n: язык сохранён', S.lang === 'en');
    click(q(d, '#btnLang'));
    await tick();
    check('i18n: обратно RU', qa(d, '#navLinks a')[0].textContent === 'Курсы');
    // тема
    click(q(d, '#btnTheme'));
    await tick();
    check('theme: light', d.documentElement.getAttribute('data-theme') === 'light');
    const S2 = JSON.parse(w.localStorage.getItem('qkccode.v1'));
    check('theme: сохранена', S2.theme === 'light');
    click(q(d, '#btnTheme'));
    check('theme: обратно dark', d.documentElement.getAttribute('data-theme') === 'dark');
    // бургер
    w.location.hash = '#/';
    await tick();
    click(q(d, '#btnBurger'));
    check('burger: меню открыто', q(d, '#navLinks').className.includes('open'));
    click(q(d, '#btnBurger'));
    check('burger: меню закрыто', !q(d, '#navLinks').className.includes('open'));
  }

  /* ── 11. персистентность между «перезагрузками» ── */
  {
    const storeJson = JSON.stringify({theme:'light',lang:'ru',motion:true,xp:300,done:{python:{'0':{read:true,task:true,quiz:90}}},exams:{},play:{lang:'lua',code:{}}});
    const { w: w2, d: d2 } = await bootSame(storeJson);
    w2.location.hash = '#/progress';
    w2.eval('window.dispatchEvent(new Event("hashchange"))');
    await tick();
    check('persist: XP пережил перезагрузку', qa(d2, '.xp-head b')[0].textContent === '300');
    check('persist: уровень 2', qa(d2, '.xp-head b')[1].textContent === '2');
    const pyCard = qa(d2, '.pcard').find(c => c.textContent.includes('Python'));
    check('persist: прогресс python', pyCard.querySelectorAll('.dots i.full').length === 1);
  }

  /* ── 12. файловая целостность: sw.js precache, ссылки index.html ── */
  {
    const sw = read('sw.js');
    const m = sw.match(/const CORE = \[([\s\S]*?)\];/);
    check('sw: CORE-список найден', !!m);
    const files = m[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean).filter(f => f !== './');
    let missing = [];
    for (const f of files) {
      const rel = f.replace(/^\.\//, '');
      if (!fs.existsSync(path.join(ROOT, rel))) missing.push(f);
    }
    check('sw: все precache-файлы существуют', missing.length === 0, missing.join(', '));
    // скрипты/стили index.html существуют
    const html = read('index.html');
    const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(x => x[1]).filter(u => !u.startsWith('http') && !u.startsWith('data:'));
    const missingRefs = refs.filter(r => !fs.existsSync(path.join(ROOT, r)));
    check('index: все локальные ресурсы существуют', missingRefs.length === 0, missingRefs.join(', '));
    // курсы из index.html существуют
    const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(x => x[1]);
    check('index: 11 локальных скриптов', scripts.length === 11, `${scripts.length}`);
    // нигде нет js.org
    let hits = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === '.git' || e.name === 'node_modules') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(js|html|css|json|md|webmanifest|txt)$/.test(e.name)) {
          const c = fs.readFileSync(p, 'utf8');
          if (/js\.org/i.test(c) && !/qkc\.js\.org-free/.test(c)) hits.push(p);
        }
      }
    };
    walk(ROOT);
    check('сайт: ноль упоминаний js.org', hits.length === 0, hits.join(', '));
    check('сайт: «сделано на JavaScript» присутствует', read('index.html').includes('JavaScript вручную') || read('js/i18n.js').includes('JavaScript вручную'));
  }

  console.log(`\ne2e: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
};

async function bootSame(storeJson) {
  const html = read('index.html');
  const dom = new JSDOM(html, {
    url: 'https://spaj7468-cell.github.io/qkccode/index.html',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const w = dom.window;
  w.confirm = () => true;
  w.scrollTo = () => {};
  w.localStorage.setItem('qkccode.v1', storeJson);
  const files = [
    'vendor/qkc-engine.js', 'js/dialects.js', 'js/i18n.js',
    'js/courses/html.js', 'js/courses/javascript.js', 'js/courses/python.js',
    'js/courses/lua.js', 'js/courses/gdscript.js', 'js/courses/csharp.js',
    'js/courses/qkc.js', 'js/app.js'
  ];
  for (const f of files) w.eval(read(f));
  await tick();
  return { dom, w, d: w.document };
}

run().catch(e => { console.error(e); process.exit(1); });
