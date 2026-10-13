/* QKCcode — приложение: роутер, уроки, задания, тесты (QKC Engine), прогресс, песочница.
   Чистый JS без зависимостей. (c) OuRi Corp, MIT */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var STORE_KEY = 'qkccode.v1';
  var APP_VER = '2.0.0';

  /* ───────────────────────── хранилище ───────────────────────── */
  function norm(s) {
    s = s || {};
    s.theme = s.theme === 'light' ? 'light' : 'dark';
    s.lang = s.lang === 'en' ? 'en' : 'ru';
    s.motion = s.motion !== false;
    s.xp = +s.xp || 0;
    s.done = s.done || {};
    s.exams = s.exams || {};
    s.play = s.play || {};
    s.play.lang = s.play.lang || 'lua';
    s.play.code = s.play.code || {};
    return s;
  }
  var S;
  try { S = norm(JSON.parse(localStorage.getItem(STORE_KEY) || 'null')); }
  catch (e) { S = norm({}); }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* приватный режим */ }
    paintXp();
  }
  function addXp(n) { if (n > 0) { S.xp += n; save(); } }
  function levelOf(xp) { return Math.floor(xp / 250) + 1; }
  function stOf(cid, i) {
    if (!S.done[cid]) S.done[cid] = {};
    if (!S.done[cid][i]) S.done[cid][i] = {};
    return S.done[cid][i];
  }

  /* ───────────────────────── i18n ───────────────────────── */
  function t(k, vars) {
    var dicts = window.QCI18N || {};
    var d = dicts[S.lang] || dicts.ru || {};
    var s = d[k] != null ? d[k] : ((dicts.ru || {})[k] != null ? dicts.ru[k] : k);
    if (vars) for (var v in vars) s = String(s).replace('{' + v + '}', vars[v]);
    return s;
  }
  function applyI18n(root) {
    (root || document).querySelectorAll('[data-i]').forEach(function (n) {
      n.textContent = t(n.getAttribute('data-i'));
    });
    document.documentElement.setAttribute('lang', S.lang);
    var lb = $('#btnLang'); if (lb) lb.textContent = S.lang.toUpperCase();
  }

  /* ───────────────────────── DOM-хелперы ───────────────────────── */
  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var a in attrs) {
      if (a === 'class') n.className = attrs[a];
      else if (a === 'html') n.innerHTML = attrs[a];
      else if (a === 'text') n.textContent = attrs[a];
      else if (a.slice(0, 2) === 'on') n.addEventListener(a.slice(2), attrs[a]);
      else if (attrs[a] != null) n.setAttribute(a, attrs[a]);
    }
    (kids || []).forEach(function (k) { if (k != null) n.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    return n;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function mdInline(s) {
    var out = esc(s);
    out = out.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return out;
  }

  /* ───────────────────────── данные курсов ───────────────────────── */
  var COURSES = window.QCOURSES || [];
  function courseById(id) { for (var i = 0; i < COURSES.length; i++) if (COURSES[i].id === id) return COURSES[i]; return null; }
  function lessonState(cid, i) { return (S.done[cid] && S.done[cid][i]) || {}; }
  function lessonDone(st) { return !!(st.read && st.task && st.quiz != null); }
  function coursePct(cid) {
    var c = courseById(cid); if (!c) return 0;
    var total = c.lessons.length * 3, got = 0;
    c.lessons.forEach(function (_, i) {
      var st = lessonState(cid, i);
      if (st.read) got++;
      if (st.task) got++;
      if (st.quiz != null) got++;
    });
    return total ? Math.round(got / total * 100) : 0;
  }
  function totals() {
    var lessons = 0, tasks = 0, quiz = 0;
    COURSES.forEach(function (c) {
      lessons += c.lessons.length;
      c.lessons.forEach(function (l) { if (l.task) tasks++; quiz += (l.quiz || []).length; });
    });
    return { courses: COURSES.length, lessons: lessons, tasks: tasks, quiz: quiz };
  }
  function courseBank(c) {
    var bank = [];
    c.lessons.forEach(function (l, i) {
      (l.quiz || []).forEach(function (q) { bank.push(Object.assign({ tp: q.tp || c.id + '-l' + (i + 1) }, q)); });
    });
    return bank;
  }

  /* ───────────────────────── код-боксы ───────────────────────── */
  function codeBox(langName, langKey, code, staticOut, opts) {
    opts = opts || {};
    var outPre = null;
    var bar = h('div', { class: 'codebox__bar' }, [h('span', { text: langName }), opts.note ? h('span', { class: 'muted', style: 'font-weight:400;letter-spacing:.02em;text-transform:none;font-size:.72rem', text: opts.note }) : null]);
    var pre = h('pre', { html: window.QCD.highlight(code, langKey) });
    var box = h('div', { class: 'codebox' }, [bar, pre]);
    if (staticOut != null) {
      outPre = h('pre', { class: 'code-out', text: staticOut });
      box.appendChild(outPre);
    }
    if (!opts.noRun) {
      var runBtn = h('button', {
        class: 'btn sm ghost', type: 'button', text: '▶ ' + t('lesson.run'),
        onclick: function () {
          var r = window.QCD.run(code, langKey);
          if (outPre && outPre.parentNode) outPre.remove();
          if (r.error) {
            outPre = h('pre', { class: 'code-err', text: r.error });
          } else {
            outPre = h('pre', { class: 'code-out', text: r.out.length ? r.out.join('\n') : '—' });
          }
          box.appendChild(outPre);
        }
      });
      bar.appendChild(h('span', { class: 'sp' }, [runBtn]));
    }
    return box;
  }

  /* ───────────────────────── редактор ───────────────────────── */
  function makeEditor(initial, langKey, onRun) {
    var ta = h('textarea', {
      spellcheck: 'false', 'aria-label': 'Редактор кода',
      autocapitalize: 'off', autocorrect: 'off'
    });
    ta.value = initial || '';
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var st = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, st) + '  ' + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = st + 2;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && onRun) { e.preventDefault(); onRun(); }
    });
    var wrap = h('div', { class: 'editor' }, [ta]);
    return { wrap: wrap, get: function () { return ta.value; }, set: function (v) { ta.value = v; }, ta: ta };
  }

  /* ───────────────────────── задания ───────────────────────── */
  function taskBox(cid, li, course, lesson) {
    var st = stOf(cid, li);
    var task = lesson.task;
    var box = h('div', { class: 'taskbox' });
    box.appendChild(h('h3', {}, [
      h('span', { text: t('lesson.taskT') }),
      h('span', { class: 'chipx', text: task.kind === 'html' ? 'HTML' : (window.QCD.LANGS[course.dialect] || {}).name || '' })
    ]));
    box.appendChild(h('p', { class: 'prompt', html: mdInline(task.prompt) }));

    var verdict = h('p', { class: 'verdict', role: 'status' });
    var hintBox = h('div', { class: 'hintbox', html: task.hint ? mdInline(task.hint) : '' });

    function passTask() {
      var prev = stOf(cid, li);
      if (!prev.task) { prev.task = true; addXp(20); }
      save();
      verdict.className = 'verdict show ok';
      verdict.textContent = '✓ ' + t('lesson.ok');
    }
    function failTask(msg) {
      verdict.className = 'verdict show bad';
      verdict.textContent = '✗ ' + (msg || t('lesson.fail'));
    }

    if (task.kind === 'html') {
      var ed = makeEditor(task.start || '', 'html');
      var frame = h('iframe', { class: 'preview-frame', sandbox: 'allow-scripts allow-modals', title: t('lesson.preview') });
      function showPreview() { frame.srcdoc = ed.get(); }
      var checksUl = h('ul', { class: 'checklist' });
      (task.checks || []).forEach(function (c) { checksUl.appendChild(h('li', { text: c.msg })); });
      var bar = h('div', { class: 'editor__bar' }, [
        h('button', { class: 'btn sm', type: 'button', text: '▶ ' + t('lesson.preview'), onclick: showPreview }),
        h('button', { class: 'btn sm ghost', type: 'button', text: '✓ ' + t('lesson.check'), onclick: function () {
          showPreview();
          var code = ed.get();
          var all = true;
          checksUl.querySelectorAll('li').forEach(function (liNode, ix) {
            var ok = new RegExp(task.checks[ix].re, 'i').test(code);
            liNode.className = ok ? 'ok' : '';
            if (!ok) all = false;
          });
          if (all) passTask(); else failTask();
        } }),
        task.solution ? h('button', { class: 'btn sm ghost', type: 'button', text: t('lesson.solution'), onclick: function () { ed.set(task.solution); showPreview(); } }) : null,
        h('span', { class: 'hintx', text: t('lesson.editorHint') })
      ]);
      box.appendChild(h('div', { class: 'editor' }, [])).appendChild(ed.ta);
      box.appendChild(bar);
      box.appendChild(h('div', {}, [h('b', { class: 'muted mono', text: t('lesson.checks'), style: 'font-size:.7rem;letter-spacing:.12em;text-transform:uppercase' }), checksUl]));
      box.appendChild(frame);
      requestAnimationFrame(showPreview);
    } else {
      var edc = makeEditor(task.start || '', course.dialect);
      function runCode(then) {
        var r = window.QCD.run(edc.get(), course.dialect);
        renderOut(r);
        if (then) then(r);
      }
      var outPre = h('pre', { class: 'code-out', text: '' });
      var outBox = h('div', { class: 'codebox', style: 'margin-top:12px' }, [
        h('div', { class: 'codebox__bar' }, [h('span', { text: t('lesson.output') })]),
        outPre
      ]);
      function renderOut(r) {
        outPre.className = r.error ? 'code-err' : 'code-out';
        outPre.textContent = r.error ? r.error : (r.out.length ? r.out.join('\n') : '—');
      }
      renderOut({ out: [], error: null });
      var expLines = (task.expect || []).join('\n');
      var bar2 = h('div', { class: 'editor__bar' }, [
        h('button', { class: 'btn sm ghost', type: 'button', text: '▶ ' + t('lesson.run'), onclick: function () { runCode(); } }),
        h('button', { class: 'btn sm', type: 'button', text: '✓ ' + t('lesson.check'), onclick: function () {
          runCode(function (r) {
            if (r.error) { failTask(t('lesson.err') + ' ' + r.error); return; }
            if (window.QCD.matchOutput(r.out, task.expect)) passTask();
            else failTask();
          });
        } }),
        task.hint ? h('button', { class: 'btn sm ghost', type: 'button', text: '? ' + t('lesson.hint'), onclick: function () { hintBox.classList.toggle('show'); } }) : null,
        task.solution ? h('button', { class: 'btn sm ghost', type: 'button', text: t('lesson.solution'), onclick: function () { edc.set(task.solution); runCode(); } }) : null,
        h('span', { class: 'hintx', text: t('lesson.editorHint') })
      ]);
      box.appendChild(edc.wrap);
      box.appendChild(bar2);
      box.appendChild(h('div', { class: 'expect' }, [h('b', { text: t('lesson.expected') }), document.createTextNode(expLines)]));
      box.appendChild(outBox);
    }
    box.appendChild(verdict);
    box.appendChild(hintBox);
    if (st.task) { verdict.className = 'verdict show ok'; verdict.textContent = '✓ ' + t('lesson.ok'); }
    return box;
  }

  /* ───────────────────────── тесты (QKC Engine) ───────────────────────── */
  function quizZone(cid, li, lesson, onDone) {
    if (!lesson.quiz || !lesson.quiz.length) return null;
    var zone = h('div', { class: 'quizzone' });
    zone.appendChild(h('div', { class: 'qhead' }, [
      h('h3', { text: t('lesson.quizT') }),
      h('span', { text: t('lesson.quizS') + ' · v' + (window.QKC ? window.QKC.VERSION : '?') })
    ]));
    var mount = h('div', { class: 'quiz-mount' });
    zone.appendChild(mount);
    requestAnimationFrame(function () {
      if (!window.QKC || !mount.isConnected) return;
      window.QKC.init({
        bank: lesson.quiz, el: mount, mode: 'normal', theme: 'bw', lang: S.lang,
        count: lesson.quiz.length, seed: 'qkccode-' + cid + '-' + li,
        onFinish: function (r) {
          var st = stOf(cid, li);
          var prev = st.quiz == null ? 0 : st.quiz;
          st.quiz = Math.max(prev, r.pct);
          addXp(Math.max(0, Math.round((st.quiz - prev) / 10)));
          save();
          if (onDone) onDone(st.quiz);
        }
      });
    });
    return zone;
  }

  /* ───────────────────────── карточка курса ───────────────────────── */
  function courseCard(c) {
    var pct = coursePct(c.id);
    var label = pct === 0 ? t('crs.start') : pct >= 100 ? t('crs.review') : t('crs.continue');
    return h('a', { class: 'ccard reveal', href: '#/course/' + c.id }, [
      h('div', { class: 'ccard__top' }, [
        h('div', { class: 'ccard__ico', html: c.icon }),
        h('div', {}, [
          h('h3', { text: c.title }),
          h('div', { class: 'tag', text: c.tag })
        ])
      ]),
      h('p', { text: c.desc }),
      h('div', { class: 'ccard__meta' }, [
        h('span', { text: t('crs.lessons', { n: c.lessons.length }) }),
        h('div', { class: 'pbar' }, [h('i', { style: 'width:' + pct + '%' })]),
        h('span', { class: 'go', text: label + ' →' })
      ])
    ]);
  }

  /* ─────────────────────────вью: главная ───────────────────────── */
  function viewHome() {
    var T = totals();
    var root = h('div');
    var hero = h('div', { class: 'wrap' }, [
      h('section', { class: 'hero' }, [
        h('span', { class: 'kicker reveal', text: t('hero.kicker') }),
        h('h1', {}, [
          h('span', { class: 'line', html: '<i style="font-style:normal">' + esc(t('hero.l1')) + '</i>' }),
          h('span', { class: 'line', html: '<i style="font-style:normal"><em>' + esc(t('hero.l2')) + '</em></i>' }),
          t('hero.l3') ? h('span', { class: 'line', html: '<i style="font-style:normal">' + esc(t('hero.l3')) + '</i>' }) : null
        ]),
        h('p', { class: 'hero__sub reveal', text: t('hero.sub') }),
        h('div', { class: 'hero__cta reveal' }, [
          h('a', { class: 'btn', href: '#/courses', text: t('hero.cta') }),
          h('a', { class: 'btn ghost', href: '#/playground', text: t('hero.cta2') })
        ]),
        h('div', { class: 'hero__stats reveal' }, [
          h('div', {}, [h('b', { text: String(T.courses) }), h('span', { text: t('stat.courses') })]),
          h('div', {}, [h('b', { text: String(T.lessons) }), h('span', { text: t('stat.lessons') })]),
          h('div', {}, [h('b', { text: String(T.tasks) }), h('span', { text: t('stat.tasks') })]),
          h('div', {}, [h('b', { text: String(T.quiz) }), h('span', { text: t('stat.quiz') })]),
          h('div', {}, [h('b', { text: '6' }), h('span', { text: t('stat.langs') })]),
          h('div', {}, [h('b', { text: '0' }), h('span', { text: t('stat.deps') })])
        ])
      ])
    ]);
    root.appendChild(hero);

    var startHere = h('div', { class: 'wrap' }, [
      h('section', { class: 'qcc-start', style: 'margin:8px 0 30px;padding:22px;border:1px solid var(--line);border-radius:18px;background:var(--panel)' }, [
        h('span', { class: 'kicker', text: S.lang === 'en' ? 'START HERE' : 'НАЧНИ ЗДЕСЬ' }),
        h('h2', { class: 'sec', text: S.lang === 'en' ? 'What can you do in QKCcode?' : 'Что можно сделать в QKCcode?' }),
        h('p', { class: 'sec-sub', text: S.lang === 'en' ? 'Learn programming step by step, practice in the playground, and track your progress.' : 'Изучай программирование по шагам, пробуй код в песочнице и отслеживай прогресс.' }),
        h('div', { class: 'hero__cta', style: 'display:flex;gap:10px;flex-wrap:wrap;margin-top:16px' }, [
          h('a', { class: 'btn', href: '#/courses', text: S.lang === 'en' ? 'Choose a course →' : 'Выбрать курс →' }),
          h('a', { class: 'btn ghost', href: '#/playground', text: S.lang === 'en' ? 'Try the playground' : 'Попробовать песочницу' }),
          h('a', { class: 'btn ghost', href: '#/progress', text: S.lang === 'en' ? 'View progress' : 'Посмотреть прогресс' })
        ]),
        h('div', { class: 'links-row', style: 'margin-top:14px;display:flex;gap:8px;flex-wrap:wrap' }, [
          h('span', { class: 'pill', text: 'HTML/CSS · JavaScript · Python · Lua · GDScript · C#' }),
          h('span', { class: 'pill', text: S.lang === 'en' ? 'Offline after first load' : 'Офлайн после первой загрузки' })
        ])
      ])
    ]);
    root.appendChild(startHere);

    var courses = h('div', { class: 'wrap' }, [
      h('section', { id: 'courses-sec' }, [
        h('h2', { class: 'sec reveal', text: t('home.coursesT') }),
        h('p', { class: 'sec-sub reveal', text: t('home.coursesS') }),
        h('div', { class: 'cgrid' }, COURSES.map(courseCard))
      ])
    ]);
    root.appendChild(courses);

    var how = h('div', { class: 'wrap' }, [
      h('section', {}, [
        h('h2', { class: 'sec reveal', text: t('home.howT') }),
        h('div', { class: 'steps' }, [1, 2, 3, 4].map(function (n) {
          return h('div', { class: 'step reveal' }, [h('b', { text: '0' + n }), h('p', { text: t('home.how' + n) })]);
        }))
      ])
    ]);
    root.appendChild(how);

    var off = h('div', { class: 'wrap' }, [
      h('section', { class: 'split' }, [
        h('div', { class: 'panel reveal' }, [
          h('h3', { text: t('home.offT') }),
          h('p', { text: t('home.offS') }),
          h('div', { class: 'links-row' }, [
            h('span', { class: 'pill' }, [h('i'), h('span', { text: 'PWA · service worker · manifest' })])
          ])
        ]),
        h('div', { class: 'panel reveal' }, [
          h('div', { class: 'codebox', style: 'margin:0' }, [
            h('div', { class: 'codebox__bar' }, [h('span', { text: 'offline.check' })]),
            h('pre', { html: '<i class="c-com"># открой сайт один раз с интернетом —</i>\n<i class="c-com"># дальше уроки работают в самолёте</i>\n<i class="c-kw">for</i> lesson <i class="c-kw">in</i> <i class="c-fn">range</i>(<i class="c-num">39</i>):\n    <i class="c-fn">print</i>(<i class="c-str">\'учимся офлайн\'</i>)' })
          ])
        ])
      ])
    ]);
    root.appendChild(off);

    var eng = h('div', { class: 'wrap' }, [
      h('section', { class: 'split' }, [
        h('div', { class: 'panel reveal' }, [
          h('h3', { text: t('home.engT') }),
          h('p', { text: t('home.engS') }),
          h('div', { class: 'links-row' }, [
            h('a', { href: '#/engine', text: t('home.engBtn') + ' →' }),
            h('a', { href: 'https://spaj7468-cell.github.io/qkc-engine/', target: '_blank', rel: 'noopener', html: t('eng.docs') + ' <small>github.io</small>' })
          ])
        ]),
        h('div', { class: 'panel reveal' }, [
          h('div', { class: 'eng-badge mono', style: 'margin:0 auto 16px', text: 'QKC' }),
          h('p', { class: 'mono', style: 'text-align:center;font-size:.8rem', text: 'QKC Engine v' + (window.QKC ? window.QKC.VERSION : '1.2.0') + ' · vendor/qkc-engine.js' })
        ])
      ])
    ]);
    root.appendChild(eng);
    return root;
  }

  /* ─────────────────────────вью: список курсов ───────────────────────── */
  function viewCourses() {
    return h('div', { class: 'wrap' }, [
      h('section', {}, [
        h('span', { class: 'kicker', text: t('nav.courses') }),
        h('h2', { class: 'sec', text: t('home.coursesT') }),
        h('p', { class: 'sec-sub', text: t('home.coursesS') }),
        S.lang === 'en' ? h('p', { class: 'note', text: t('ui.noteRu') }) : null,
        h('div', { class: 'cgrid' }, COURSES.map(courseCard))
      ])
    ]);
  }

  /* ─────────────────────────вью: курс ───────────────────────── */
  function viewCourse(cid) {
    var c = courseById(cid);
    if (!c) return viewHome();
    var pct = coursePct(cid);
    var examBest = S.exams[cid];
    var rows = c.lessons.map(function (l, i) {
      var st = lessonState(cid, i);
      return h('a', { class: 'lrow reveal' + (lessonDone(st) ? ' done' : ''), href: '#/lesson/' + cid + '/' + i }, [
        h('span', { class: 'lrow__n', text: lessonDone(st) ? '✓' : String(i + 1) }),
        h('span', { class: 'lrow__t' }, [
          h('b', { text: l.t }),
          h('span', { text: l.goal || '' })
        ]),
        h('span', { class: 'lrow__st', title: t('prog.read') + ' / ' + t('prog.task') + ' / ' + t('prog.quiz') }, [
          h('i', { class: st.read ? 'on' : '' }),
          h('i', { class: st.task ? 'on' : '' }),
          h('i', { class: st.quiz != null ? 'on' : '' })
        ])
      ]);
    });
    var examPanel = h('div', { class: 'taskbox reveal', style: 'margin-top:26px' }, [
      h('h3', {}, [h('span', { text: t('course.exam') }), h('span', { class: 'chipx', text: 'QKC Engine' })]),
      h('p', { class: 'prompt', text: t('course.examS') }),
      h('div', { class: 'links-row' }, [
        h('a', { class: 'btn sm', href: '#/exam/' + cid, text: t('course.examGo') + ' →' }),
        examBest != null ? h('span', { class: 'pill' }, [h('i'), h('span', { text: (examBest >= 80 ? t('course.examDone', { p: examBest }) : t('course.examBest', { p: examBest })) })]) : null
      ])
    ]);
    return h('div', { class: 'narrow' }, [
      h('div', { class: 'crumb' }, [h('a', { href: '#/courses', text: '← ' + t('course.back') })]),
      h('div', { class: 'course-head' }, [
        h('div', { class: 'ccard__ico', html: c.icon }),
        h('div', {}, [
          h('h1', { text: c.title }),
          h('div', { class: 'tag mono muted', text: c.tag + ' · ' + t('crs.level') + ': ' + c.level + ' · ' + t('crs.lessons', { n: c.lessons.length }) })
        ])
      ]),
      h('p', { class: 'course-desc', text: c.intro || c.desc }),
      h('div', { style: 'display:flex;align-items:center;gap:14px;margin:20px 0 6px' }, [
        h('div', { class: 'pbar', style: 'max-width:none' }, [h('i', { style: 'width:' + pct + '%' })]),
        h('span', { class: 'mono muted', style: 'font-size:.78rem', text: pct + '%' })
      ]),
      h('section', { style: 'margin-top:30px' }, [
        h('h2', { class: 'sec', style: 'font-size:1.3rem', text: t('course.lessonsT') }),
        h('div', { style: 'margin-top:16px' }, rows)
      ]),
      examPanel
    ]);
  }

  /* ─────────────────────────вью: урок ───────────────────────── */
  function viewLesson(cid, li) {
    var c = courseById(cid);
    if (!c || !c.lessons[li]) return viewHome();
    var lesson = c.lessons[li];
    var st = stOf(cid, li);

    var readBtn = h('button', {
      class: 'btn sm ghost', type: 'button',
      text: st.read ? '✓ ' + t('lesson.readDone') : t('lesson.read'),
      onclick: function () {
        if (!st.read) { st.read = true; addXp(5); save(); }
        readBtn.textContent = '✓ ' + t('lesson.readDone');
        updateDots();
      }
    });

    var body = h('div');
    body.appendChild(h('div', { class: 'crumb' }, [
      h('a', { href: '#/courses', text: t('nav.courses') }), h('span', { text: '/' }),
      h('a', { href: '#/course/' + cid, text: c.title }), h('span', { text: '/' }),
      h('span', { text: (li + 1) + ' · ' + lesson.t })
    ]));
    body.appendChild(h('div', { class: 'lesson-head' }, [h('h1', { text: lesson.t })]));
    if (lesson.goal) body.appendChild(h('div', { class: 'lesson-goal', html: '<b>' + esc(t('lesson.goal')) + ':</b> ' + mdInline(lesson.goal) }));

    var theory = h('div', { class: 'theory' });
    (lesson.blocks || []).forEach(function (b) {
      var kind = b[0], v = b[1];
      if (kind === 'h') theory.appendChild(h('h3', { text: v }));
      else if (kind === 'p') theory.appendChild(h('p', { html: mdInline(v) }));
      else if (kind === 'code') theory.appendChild(codeBox(v.langName || (window.QCD.LANGS[v.lang] || {}).name || v.lang, v.lang, v.code, v.out, { noRun: v.noRun, note: v.note }));
      else if (kind === 'list') theory.appendChild(h('ul', {}, v.map(function (x) { return h('li', { html: mdInline(x) }); })));
      else if (kind === 'note') theory.appendChild(h('div', { class: 'note', html: mdInline(v) }));
      else if (kind === 'warn') theory.appendChild(h('div', { class: 'warnx', html: mdInline(v) }));
      else if (kind === 'table') {
        var tb = h('table');
        if (v.head) tb.appendChild(h('thead', {}, [h('tr', {}, v.head.map(function (x) { return h('th', { html: mdInline(x) }); }))]));
        tb.appendChild(h('tbody', {}, v.rows.map(function (r) { return h('tr', {}, r.map(function (x) { return h('td', { html: mdInline(x) }); })); })));
        theory.appendChild(tb);
      }
    });
    theory.appendChild(h('div', { style: 'margin:26px 0' }, [readBtn]));
    body.appendChild(theory);

    if (lesson.task) body.appendChild(taskBox(cid, li, c, lesson));

    var dots = null;
    function updateDots() { /* мини-индикатор в шапке урока */
      if (!dots) return;
      var s2 = lessonState(cid, li);
      dots.innerHTML = '';
      [['read', s2.read], ['task', s2.task], ['quiz', s2.quiz != null]].forEach(function (pr) {
        dots.appendChild(h('i', { class: pr[1] ? 'on' : '', style: 'display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;border:1.5px solid var(--line2);' + (pr[1] ? 'background:var(--text);border-color:var(--text)' : '') }));
      });
    }
    dots = h('span', { style: 'margin-left:10px' });
    body.querySelector('.lesson-head').appendChild(dots);
    updateDots();

    if (lesson.quiz && lesson.quiz.length) {
      body.appendChild(quizZone(cid, li, lesson, function () { updateDots(); }));
    }

    var prev = li > 0 ? '#/lesson/' + cid + '/' + (li - 1) : '#/course/' + cid;
    var next = li < c.lessons.length - 1 ? '#/lesson/' + cid + '/' + (li + 1) : '#/course/' + cid;
    body.appendChild(h('div', { class: 'lesson-nav' }, [
      h('a', { class: 'btn sm ghost', href: prev, text: '← ' + (li > 0 ? c.lessons[li - 1].t : t('lesson.toCourse')) }),
      h('a', { class: 'btn sm', href: next, text: (li < c.lessons.length - 1 ? t('lesson.next') + ': ' + c.lessons[li + 1].t : t('course.back')) + ' →' })
    ]));
    return h('div', { class: 'narrow' }, [body]);
  }

  /* ─────────────────────────вью: экзамен ───────────────────────── */
  function viewExam(cid) {
    var c = courseById(cid);
    if (!c) return viewHome();
    var bank = courseBank(c);
    var mount = h('div', { class: 'quiz-mount' });
    var info = h('p', { class: 'muted mono', style: 'font-size:.8rem' });
    requestAnimationFrame(function () {
      if (!window.QKC || !mount.isConnected) return;
      window.QKC.init({
        bank: bank, el: mount, mode: 'exam', theme: 'bw', lang: S.lang,
        count: Math.min(10, bank.length), seed: 'exam-' + cid + '-' + Date.now(),
        onFinish: function (r) {
          var prev = S.exams[cid] == null ? 0 : S.exams[cid];
          if (r.pct > prev) { S.exams[cid] = r.pct; addXp(Math.round((r.pct - prev) / 5)); save(); }
          else if (S.exams[cid] == null) { S.exams[cid] = r.pct; save(); }
          info.textContent = (r.pct >= 80 ? '✓ ' + t('course.examDone', { p: r.pct }) : t('course.examBest', { p: Math.max(r.pct, prev) }));
        }
      });
    });
    return h('div', { class: 'narrow' }, [
      h('div', { class: 'crumb' }, [h('a', { href: '#/course/' + cid, text: '← ' + t('exam.back') })]),
      h('div', { class: 'lesson-head' }, [h('h1', { text: t('exam.title', { c: c.title }) })]),
      h('p', { class: 'lesson-goal', text: t('course.examS') }),
      info,
      h('section', {}, [mount])
    ]);
  }

  /* ─────────────────────────вью: песочница ───────────────────────── */
  var SAMPLES = {
    lua: '-- Lua (так пишут скрипты в Roblox Studio)\nlocal player = "Steve"\nlocal hp = 100\n\nprint("Игрок:", player)\n\nif hp >= 50 then\n  print("Здоровье в норме")\nelse\n  print("Опасно!")\nend\n\nfor i = 1, 3 do\n  print("Прыжок", i)\nend\n',
    javascript: '// JavaScript — язык браузеров\nlet score = 0;\nconst bonus = 5;\n\nfor (let i = 1; i <= 3; i++) {\n  score += i * bonus;\n  console.log("Раунд", i, "счёт:", score);\n}\n\nfunction rank(s) {\n  return s >= 20 ? "мастер" : "ученик";\n}\nconsole.log("Ранг:", rank(score));\n',
    csharp: '// C# — язык Unity\nint health = 100;\nstring playerName = "Hero";\n\nConsole.WriteLine(playerName + ": " + health);\n\nfor (int i = 0; i < 3; i++) {\n  health -= 10;\n}\n\nif (health > 50) {\n  Console.WriteLine("Ещё держимся: " + health);\n} else {\n  Console.WriteLine("Нужна аптечка: " + health);\n}\n',
    python: '# Python — простой и мощный\nname = "Мир"\nprint("Привет,", name)\n\nsquares = []\nfor i in range(1, 6):\n    squares.append(i * i)\nprint("Квадраты:", squares)\nprint("Сумма:", sum(squares))\n',
    gdscript: '# GDScript — язык движка Godot\nvar speed = 250\nvar lives = 3\n\nfunc take_damage(amount):\n\tlives -= 1\n\tprint("Осталось жизней:", lives)\n\ntake_damage(10)\ntake_damage(10)\n\nif lives <= 1:\n\tprint("Берегись!")\n',
    html: '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>Моя страница</title>\n  <style>\n    body { font-family: monospace; background: #000; color: #fff; padding: 24px }\n    h1 { border-bottom: 2px solid #fff; padding-bottom: 8px }\n  </style>\n</head>\n<body>\n  <h1>Привет, HTML!</h1>\n  <p>Это <b>моя первая</b> страница.</p>\n  <ul>\n    <li>пункт один</li>\n    <li>пункт два</li>\n  </ul>\n</body>\n</html>\n'
  };

  function viewPlayground() {
    var langs = window.QCD.LANG_ORDER.concat(['html']);
    var cur = langs.indexOf(S.play.lang) >= 0 ? S.play.lang : 'lua';
    var tabs = h('div', { class: 'play-tabs', role: 'tablist' });
    var outTitle = h('span', { text: t('play.out') });
    var outPre = h('pre', { text: '' });
    var frame = h('iframe', { class: 'preview-frame', style: 'width:100%;height:340px;border:1px solid var(--line2);border-radius:10px;background:#fff;margin-top:12px', sandbox: 'allow-scripts allow-modals', title: t('lesson.preview') });
    var outPanel = h('div', { class: 'play-out' }, [
      h('div', { class: 'codebox__bar' }, [outTitle]),
      outPre
    ]);
    var rightCol = h('div', {}, [outPanel]);
    var ed = makeEditor('', 'lua');
    function loadLang(l) {
      cur = l; S.play.lang = l; save();
      tabs.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.l === l); });
      ed.set(S.play.code[l] != null ? S.play.code[l] : (SAMPLES[l] || ''));
      if (l === 'html') {
        rightCol.innerHTML = '';
        rightCol.appendChild(h('div', { class: 'play-out' }, [h('div', { class: 'codebox__bar' }, [h('span', { text: t('lesson.preview') })])]));
        rightCol.appendChild(frame);
        frame.srcdoc = ed.get();
        outTitle.textContent = t('lesson.preview');
      } else {
        rightCol.innerHTML = '';
        rightCol.appendChild(outPanel);
        outPre.textContent = '';
        outPre.className = '';
      }
      runBtn.onclick = function () { doRun(); };
    }
    function doRun() {
      S.play.code[cur] = ed.get(); save();
      if (cur === 'html') { frame.srcdoc = ed.get(); return; }
      var r = window.QCD.run(ed.get(), cur);
      outPre.className = r.error ? 'err' : '';
      outPre.textContent = r.error ? '! ' + r.error : (r.out.length ? r.out.join('\n') : '—');
    }
    langs.forEach(function (l) {
      var nm = l === 'html' ? 'HTML' : window.QCD.LANGS[l].name;
      tabs.appendChild(h('button', { type: 'button', role: 'tab', 'data-l': l, class: l === cur ? 'on' : '', text: nm, onclick: function () { S.play.code[cur] = ed.get(); loadLang(l); } }));
    });
    var runBtn = h('button', { class: 'btn sm', type: 'button', text: '▶ ' + t('play.run'), onclick: doRun });
    var edBar = h('div', { class: 'editor__bar' }, [
      runBtn,
      h('button', { class: 'btn sm ghost', type: 'button', text: t('play.sample'), onclick: function () { ed.set(SAMPLES[cur] || ''); doRun(); } }),
      h('button', { class: 'btn sm ghost', type: 'button', text: t('play.clear'), onclick: function () { ed.set(''); } }),
      h('span', { class: 'hintx', text: t('lesson.editorHint') })
    ]);
    ed.ta.addEventListener('input', function () { if (cur === 'html') { S.play.code[cur] = ed.get(); } });
    var edWrap = h('div', {}, [ed.wrap, edBar]);
    loadLang(cur);
    return h('div', { class: 'wrap' }, [
      h('section', {}, [
        h('span', { class: 'kicker', text: t('nav.play') }),
        h('h2', { class: 'sec', text: t('play.title') }),
        h('p', { class: 'sec-sub', text: t('play.sub') }),
        tabs,
        h('div', { class: 'play-layout' }, [edWrap, rightCol]),
        h('p', { class: 'muted', style: 'font-size:.82rem;margin-top:14px', text: t('play.help') })
      ])
    ]);
  }

  /* ─────────────────────────вью: движок ───────────────────────── */
  var ENG_DEMO_RU = [
    { t: 'Какой тег создаёт заголовок самого верхнего уровня?', ty: 'choice', o: ['<head>', '<h1>', '<title>', '<header>'], c: '<h1>', e: '<h1> — заголовок первого уровня. <head> и <title> — служебные, <header> — секция-«шапка».', tp: 'html' },
    { t: 'Что выведет Python: print(7 // 2)?', ty: 'input', c: '3', e: '// — целочисленное деление: 7 // 2 = 3 (остаток отбрасывается).', tp: 'python' },
    { t: 'В JavaScript массив — это объект (typeof [] === "object").', ty: 'bool', c: 'true', e: 'Да, массивы в JS — объекты; typeof [] возвращает "object".', tp: 'js' }
  ];
  var ENG_DEMO_EN = [
    { t: 'Which tag creates the top-level heading?', ty: 'choice', o: ['<head>', '<h1>', '<title>', '<header>'], c: '<h1>', e: '<h1> is the first-level heading. <head>/<title> are metadata, <header> is a layout section.', tp: 'html' },
    { t: 'What does Python print for: print(7 // 2)?', ty: 'input', c: '3', e: '// is floor division: 7 // 2 = 3.', tp: 'python' },
    { t: 'In JavaScript an array is an object (typeof [] === "object").', ty: 'bool', c: 'true', e: 'Yes, arrays are objects; typeof [] returns "object".', tp: 'js' }
  ];

  function viewEngine() {
    var mount = h('div', { class: 'quiz-mount' });
    requestAnimationFrame(function () {
      if (!window.QKC || !mount.isConnected) return;
      window.QKC.init({
        bank: S.lang === 'en' ? ENG_DEMO_EN : ENG_DEMO_RU, el: mount,
        mode: 'normal', theme: 'bw', lang: S.lang, count: 3, seed: 'qkccode-eng-demo'
      });
    });
    return h('div', { class: 'narrow' }, [
      h('div', { class: 'eng-hero' }, [
        h('div', { class: 'eng-badge mono', text: 'QKC' }),
        h('div', {}, [
          h('h1', { style: 'font-size:clamp(1.6rem,3.4vw,2.4rem)', text: t('eng.title') }),
          h('p', { class: 'muted', style: 'margin:8px 0 0', text: t('eng.sub') }),
          h('p', { class: 'mono', style: 'font-size:.78rem;margin:8px 0 0', text: t('eng.ver') + ': ' + (window.QKC ? window.QKC.VERSION : '?') })
        ])
      ]),
      h('section', { class: 'theory' }, [
        h('h3', { text: t('eng.how') }),
        h('p', { text: t('eng.how1') }),
        h('p', { text: t('eng.how2') }),
        h('p', { text: t('eng.how3') }),
        codeBox('JavaScript', 'javascript',
          '// так урок подключает тест (настоящий код QKCcode)\nQKC.init({\n  bank: lesson.quiz,   // вопросы урока\n  el: mount,           // куда вставить виджет\n  mode: "normal",      // normal | exam | sprint\n  theme: "bw",         // строгий монохром\n  lang: "ru",          // ru | en\n  seed: "qkccode-lua-3", // тот же seed = тот же тест\n  onFinish: r => saveProgress(r.pct)\n});', null)
      ]),
      h('section', {}, [
        h('h3', { style: 'margin-bottom:12px', text: t('eng.demo') }),
        mount
      ]),
      h('section', {}, [
        h('h3', { style: 'margin-bottom:6px', text: t('eng.who') }),
        h('p', { class: 'muted', style: 'margin-bottom:14px', text: t('eng.whoS') }),
        h('div', { class: 'links-row' }, [
          h('a', { href: 'https://spaj7468-cell.github.io/qkc-engine/', target: '_blank', rel: 'noopener', html: t('eng.docs') + ' <small>зеркало, работает сейчас</small>' }),
          h('a', { href: 'https://engine.qkc.runs-on.dev', target: '_blank', rel: 'noopener', html: 'engine.qkc.runs-on.dev <small>после merge PR #310</small>' }),
          h('a', { href: 'https://github.com/spaj7468-cell/qkc-engine', target: '_blank', rel: 'noopener', text: t('eng.repo') }),
          h('a', { href: 'https://www.npmjs.com/package/qkc-engine', target: '_blank', rel: 'noopener', text: t('eng.npm') }),
          h('a', { href: 'https://spaj7468-cell.github.io/qkc/', target: '_blank', rel: 'noopener', text: t('foot.trainer') })
        ])
      ]),
      h('section', { class: 'panel' }, [
        h('h3', { text: 'Интерпретатор QKCcode' }),
        h('p', { html: mdInline('Тесты — это движок QKC Engine. А код заданий выполняет **собственный учебный интерпретатор** `js/dialects.js`: один токенайзер, три семейства парсеров (фигурные скобки — JS/C#, `end`-блоки — Lua, отступы — Python/GDScript) и общий вычислитель. Он тоже написан на JavaScript вручную и работает офлайн.') }),
        h('p', { class: 'muted', style: 'font-size:.85rem', text: t('play.help') })
      ])
    ]);
  }

  /* ─────────────────────────вью: прогресс ───────────────────────── */
  function viewProgress() {
    var T = totals();
    var lessonsDone = 0;
    COURSES.forEach(function (c) { c.lessons.forEach(function (_, i) { if (lessonDone(lessonState(c.id, i))) lessonsDone++; }); });
    var lvl = levelOf(S.xp);
    var toNext = 250 - (S.xp % 250);
    var cards = COURSES.map(function (c) {
      var pct = coursePct(c.id);
      var dots = c.lessons.map(function (_, i) {
        var st = lessonState(c.id, i);
        var parts = (st.read ? 1 : 0) + (st.task ? 1 : 0) + (st.quiz != null ? 1 : 0);
        var cls = parts === 3 ? 'full' : parts > 0 ? 'part' : '';
        return h('i', { class: cls, text: String(i + 1), title: c.lessons[i].t });
      });
      return h('div', { class: 'pcard reveal' }, [
        h('div', { class: 'top' }, [
          h('b', { text: c.title }),
          pct === 100 && S.exams[c.id] >= 80 ? h('span', { class: 'pill' }, [h('i'), h('span', { text: 'exam ✓' })]) : null,
          h('a', { href: '#/course/' + c.id, text: pct + '%' })
        ]),
        h('div', { class: 'pbar' }, [h('i', { style: 'width:' + pct + '%' })]),
        h('div', { class: 'dots' }, dots)
      ]);
    });
    return h('div', { class: 'wrap' }, [
      h('section', {}, [
        h('span', { class: 'kicker', text: t('prog.title') }),
        h('h2', { class: 'sec', text: t('prog.title') }),
        h('p', { class: 'sec-sub', text: t('prog.sub') }),
        h('div', { class: 'xp-head' }, [
          h('div', {}, [h('b', { text: String(S.xp) }), h('span', { text: t('prog.xp') })]),
          h('div', {}, [h('b', { text: String(lvl) }), h('span', { text: t('prog.level') })]),
          h('div', {}, [h('b', { text: lessonsDone + '/' + T.lessons }), h('span', { text: t('stat.lessons') })]),
          h('div', {}, [h('b', { text: String(toNext) }), h('span', { text: t('prog.toNext', { n: lvl + 1 }) })])
        ]),
        cards.length ? h('div', {}, cards) : h('p', { class: 'muted', text: t('prog.empty') }),
        h('div', { style: 'margin-top:26px' }, [
          h('button', { class: 'btn sm ghost', type: 'button', text: t('prog.reset'), onclick: function () {
            if (!confirm(t('prog.resetQ'))) return;
            S.xp = 0; S.done = {}; S.exams = {}; save(); render();
          } })
        ])
      ])
    ]);
  }

  /* ───────────────────────── роутер ───────────────────────── */
  var TITLES = { home: 'QKCcode — учись программировать офлайн' };
  function render() {
    var hash = location.hash.replace(/^#/, '') || '/';
    var seg = hash.split('/').filter(Boolean).map(decodeURIComponent);
    var main = $('#main');
    var view, navKey = 'courses', title = TITLES.home;
    var key = seg[0] || 'home';
    if (key === 'home') { view = viewHome(); navKey = ''; }
    else if (key === 'courses') { view = viewCourses(); navKey = 'courses'; title = t('nav.courses') + ' — QKCcode'; }
    else if (key === 'course') { view = viewCourse(seg[1]); navKey = 'courses'; var cc = courseById(seg[1]); title = (cc ? cc.title : 'QKCcode') + ' — QKCcode'; }
    else if (key === 'lesson') {
      view = viewLesson(seg[1], parseInt(seg[2], 10));
      navKey = 'courses';
      var lc = courseById(seg[1]);
      title = (lc && lc.lessons[parseInt(seg[2], 10)] ? lc.lessons[parseInt(seg[2], 10)].t : 'Урок') + ' — QKCcode';
    }
    else if (key === 'exam') { view = viewExam(seg[1]); navKey = 'courses'; title = t('exam.title', { c: (courseById(seg[1]) || {}).title || '' }) + ' — QKCcode'; }
    else if (key === 'playground') { view = viewPlayground(); navKey = 'playground'; title = t('play.title') + ' — QKCcode'; }
    else if (key === 'engine') { view = viewEngine(); navKey = 'engine'; title = t('eng.title') + ' — QKCcode'; }
    else if (key === 'progress') { view = viewProgress(); navKey = 'progress'; title = t('prog.title') + ' — QKCcode'; }
    else { view = viewHome(); navKey = ''; }

    main.innerHTML = '';
    main.appendChild(view);
    document.title = title;
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-nav') === navKey);
    });
    $('#navLinks').classList.remove('open');
    $('#btnBurger').setAttribute('aria-expanded', 'false');
    applyI18n(document);
    revealInit();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ───────────────────────── reveal-анимации ───────────────────────── */
  var io = null;
  function revealInit() {
    var nodes = document.querySelectorAll('.reveal:not(.in)');
    if (!S.motion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: .08 });
    }
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ───────────────────────── шапка: тема/язык/сеть/бургер ───────────────────────── */
  function paintXp() {
    var chip = $('#xpChip');
    if (chip) chip.textContent = S.xp + ' XP · L' + levelOf(S.xp);
  }
  function paintNet() {
    var dot = $('#netDot');
    if (!dot) return;
    var off = !navigator.onLine;
    dot.classList.toggle('off', off);
    dot.querySelector('span').textContent = off ? t('ui.offline') : t('ui.online');
  }
  function initChrome() {
    $('#btnTheme').addEventListener('click', function () {
      S.theme = S.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', S.theme);
      try { localStorage.setItem('ouri-corp-theme', S.theme); } catch (e) {}
      save();
    });
    $('#btnLang').addEventListener('click', function () {
      S.lang = S.lang === 'ru' ? 'en' : 'ru';
      save(); applyI18n(document); paintNet(); render();
    });
    $('#btnBurger').addEventListener('click', function () {
      var open = $('#navLinks').classList.toggle('open');
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    window.addEventListener('online', paintNet);
    window.addEventListener('offline', paintNet);
    window.addEventListener('hashchange', render);
    // футер: список курсов + версия движка
    var fc = $('#footCourses');
    if (fc) {
      COURSES.forEach(function (c) {
        fc.appendChild(h('li', {}, [h('a', { href: '#/course/' + c.id, text: c.title })]));
      });
    }
    var ev = $('#footEngVer'); if (ev && window.QKC) ev.textContent = 'v' + window.QKC.VERSION;
    paintXp(); paintNet();
  }

  /* ───────────────────────── service worker ───────────────────────── */
  function initSW() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () { /* file:// или политика */ });
    });
  }

  /* ───────────────────────── старт ───────────────────────── */
  function boot() {
    initChrome();
    applyI18n(document);
    render();
    initSW();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* для тестов */
  window.QCCODE_APP = { store: function () { return S; }, render: render, t: t, coursePct: coursePct, totals: totals, APP_VER: APP_VER };
})();
