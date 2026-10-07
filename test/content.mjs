/* QKCcode — тесты контента: решения заданий, примеры с выводом, валидность квизов.
   node test/content.mjs */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
const __dir = path.dirname(fileURLToPath(import.meta.url));
require(path.join(__dir, '..', 'js', 'dialects.js'));
const QCD = globalThis.QCD;
globalThis.window = globalThis;
window.QCOURSES = [];
for (const f of ['html', 'javascript', 'python', 'lua', 'gdscript', 'csharp', 'qkc']) {
  require(path.join(__dir, '..', 'js', 'courses', f + '.js'));
}

let pass = 0, fail = 0;
const ok = (n) => pass++;
const bad = (n, why) => { fail++; console.log('FAIL', n, '—', why); };

const courses = window.QCOURSES;
if (courses.length !== 7) bad('courses', `ожидалось 7 курсов, найдено ${courses.length}`);
else ok('courses');

for (const c of courses) {
  if (!c.id || !c.title || !c.icon || !Array.isArray(c.lessons) || !c.lessons.length) { bad(c.id, 'структура курса неполная'); continue; }
  c.lessons.forEach((l, li) => {
    const tag = `${c.id}/L${li + 1}`;
    if (!l.t) bad(tag, 'нет заголовка урока');
    if (!l.blocks || !l.blocks.length) bad(tag, 'нет теории');
    if (!l.quiz || !l.quiz.length) bad(tag, 'нет квиза');

    // код-блоки с ожидаемым выводом
    (l.blocks || []).forEach((b, bi) => {
      if (b[0] !== 'code') return;
      const v = b[1];
      if (v.noRun) { if (v.out != null) bad(`${tag}/b${bi}`, 'noRun-блок не должен иметь out'); return; }
      if (!v.code || !v.lang) { bad(`${tag}/b${bi}`, 'код-блок без code/lang'); return; }
      if (v.out == null) return; // запускаемый без фиксированного вывода — ок
      const r = QCD.run(v.code, v.lang);
      if (r.error) bad(`${tag}/b${bi}`, `ошибка выполнения: ${r.error}`);
      else if (!QCD.matchOutput(r.out, v.out.split('\n'))) bad(`${tag}/b${bi}`, `вывод не совпал: ждал ${JSON.stringify(v.out.split('\n'))}, получил ${JSON.stringify(r.out)}`);
      else ok(`${tag}/b${bi}`);
    });

    // задание
    if (l.task) {
      const tk = l.task;
      if (!tk.prompt) bad(`${tag}/task`, 'нет условия');
      if (tk.kind === 'code') {
        if (!tk.expect || !tk.solution) { bad(`${tag}/task`, 'нет expect/solution'); }
        else {
          const r = QCD.run(tk.solution, c.dialect);
          if (r.error) bad(`${tag}/task`, `решение падает: ${r.error}`);
          else if (!QCD.matchOutput(r.out, tk.expect)) bad(`${tag}/task`, `решение даёт ${JSON.stringify(r.out)}, ждали ${JSON.stringify(tk.expect)}`);
          else ok(`${tag}/task`);
          if (tk.start) {
            const rs = QCD.run(tk.start, c.dialect);
            if (!rs.error && rs.out.length && QCD.matchOutput(rs.out, tk.expect)) bad(`${tag}/task-start`, 'стартовый код уже решает задачу');
            else ok(`${tag}/task-start`);
          }
        }
      } else if (tk.kind === 'html') {
        if (!tk.checks || !tk.checks.length || !tk.solution) { bad(`${tag}/task`, 'нет checks/solution'); }
        else {
          for (const ch of tk.checks) {
            let re; try { re = new RegExp(ch.re, 'i'); } catch (e) { bad(`${tag}/task`, `битый regex: ${ch.re}`); continue; }
            if (!re.test(tk.solution)) bad(`${tag}/task`, `решение не проходит проверку «${ch.msg}» (${ch.re})`);
            else ok(`${tag}/check`);
          }
          if (tk.start) {
            const allPass = tk.checks.every(ch => new RegExp(ch.re, 'i').test(tk.start));
            if (allPass) bad(`${tag}/task-start`, 'стартовый код уже проходит все проверки');
            else ok(`${tag}/task-start`);
          }
        }
      } else bad(`${tag}/task`, 'неизвестный kind: ' + tk.kind);
    }

    // квизы — формат QKC Engine
    (l.quiz || []).forEach((q, qi) => {
      const qt = `${tag}/q${qi}`;
      if (!q.t || !q.ty || q.c == null || !q.tp) { bad(qt, 'неполный вопрос'); return; }
      if (q.ty === 'choice') {
        if (!q.o || q.o.length < 2) { bad(qt, 'choice без вариантов'); return; }
        if (!q.o.includes(q.c)) { bad(qt, `правильный ответ «${q.c}» не среди вариантов`); return; }
      } else if (q.ty === 'bool') {
        if (!['true', 'false'].includes(String(q.c))) { bad(qt, 'bool ответ не true/false'); return; }
      } else if (q.ty !== 'input') { bad(qt, 'неизвестный ty: ' + q.ty); return; }
      ok(qt);
    });
  });
}

// итоговая статистика контента
let lessons = 0, tasks = 0, quiz = 0;
for (const c of courses) { lessons += c.lessons.length; c.lessons.forEach(l => { if (l.task) tasks++; quiz += (l.quiz || []).length; }); }
console.log(`\ncontent: ${pass} passed, ${fail} failed · ${courses.length} курсов, ${lessons} уроков, ${tasks} заданий, ${quiz} вопросов`);
process.exit(fail ? 1 : 0);
