/* QKCcode — учебные интерпретаторы языков (Lua, GDScript, C#, JavaScript, Python).
   Один общий токенайзер/парсер/вычислитель + таблицы диалектов.
   Это учебная модель: поддерживает подмножество языка, достаточное для уроков.
   Чистый JS, без зависимостей. (c) OuRi Corp, MIT */
(function (root) {
  'use strict';

  /* ───────────────────────── таблицы диалектов ───────────────────────── */
  var LANGS = {
    lua: {
      name: 'Lua', family: 'end', comment: '--', blockComment: null,
      kwAnd: 'and', kwOr: 'or', kwNot: 'not', ne: '~=', concat: '..', pow: '^',
      trueLit: 'true', falseLit: 'false', nilLit: 'nil',
      boolPrint: ['true', 'false'], nilPrint: 'nil',
      idx1: true, intDiv: false, floorDiv: true, truthyZero: true,
      keywords: ['local', 'function', 'end', 'if', 'then', 'elseif', 'else', 'while', 'do',
        'for', 'in', 'return', 'break', 'and', 'or', 'not', 'true', 'false', 'nil', 'repeat', 'until'],
      typeWords: [], printFn: 'print'
    },
    javascript: {
      name: 'JavaScript', family: 'brace', comment: '//',
      kwAnd: '&&', kwOr: '||', kwNot: '!', ne: '!=', concat: '+', pow: '**',
      trueLit: 'true', falseLit: 'false', nilLit: 'null',
      boolPrint: ['true', 'false'], nilPrint: 'undefined',
      idx1: false, intDiv: false, floorDiv: false, truthyZero: false,
      keywords: ['var', 'let', 'const', 'function', 'return', 'if', 'else', 'while', 'for', 'of',
        'break', 'continue', 'true', 'false', 'null', 'undefined', 'new', 'typeof'],
      typeWords: [], declWords: ['var', 'let', 'const'], printFn: 'console.log'
    },
    csharp: {
      name: 'C#', family: 'brace', comment: '//',
      kwAnd: '&&', kwOr: '||', kwNot: '!', ne: '!=', concat: '+', pow: null,
      trueLit: 'true', falseLit: 'false', nilLit: 'null',
      boolPrint: ['True', 'False'], nilPrint: '',
      idx1: false, intDiv: true, floorDiv: false, truthyZero: false,
      keywords: ['using', 'namespace', 'class', 'public', 'private', 'static', 'void', 'int',
        'float', 'double', 'string', 'bool', 'char', 'var', 'return', 'if', 'else', 'while',
        'for', 'foreach', 'break', 'continue', 'true', 'false', 'null', 'new'],
      typeWords: ['int', 'float', 'double', 'string', 'bool', 'char', 'var', 'void'],
      declWords: ['int', 'float', 'double', 'string', 'bool', 'char', 'var'], printFn: 'Console.WriteLine'
    },
    python: {
      name: 'Python', family: 'indent', comment: '#',
      kwAnd: 'and', kwOr: 'or', kwNot: 'not', ne: '!=', concat: '+', pow: '**',
      trueLit: 'True', falseLit: 'False', nilLit: 'None',
      boolPrint: ['True', 'False'], nilPrint: 'None',
      idx1: false, intDiv: false, floorDiv: true, truthyZero: false,
      keywords: ['def', 'return', 'if', 'elif', 'else', 'while', 'for', 'in', 'break',
        'continue', 'pass', 'True', 'False', 'None', 'and', 'or', 'not', 'import', 'lambda'],
      typeWords: [], printFn: 'print'
    },
    gdscript: {
      name: 'GDScript', family: 'indent', comment: '#',
      kwAnd: 'and', kwOr: 'or', kwNot: 'not', ne: '!=', concat: '+', pow: '**',
      trueLit: 'true', falseLit: 'false', nilLit: 'null',
      boolPrint: ['true', 'false'], nilPrint: 'null',
      idx1: false, intDiv: false, floorDiv: false, truthyZero: false,
      keywords: ['func', 'var', 'const', 'return', 'if', 'elif', 'else', 'while', 'for', 'in',
        'break', 'continue', 'pass', 'true', 'false', 'null', 'and', 'or', 'not', 'match', 'extends'],
      typeWords: [], declWords: ['var', 'const'], printFn: 'print'
    }
  };
  var LANG_ORDER = ['lua', 'javascript', 'csharp', 'python', 'gdscript'];

  /* ───────────────────────── ошибки ───────────────────────── */
  function RErr(msg, line) {
    var e = new Error(line ? 'строка ' + line + ': ' + msg : msg);
    e.rline = line || 0;
    return e;
  }

  /* ───────────────────────── токенайзер ─────────────────────────
     token: { ty:'num'|'str'|'id'|'op'|'nl'|'ind'|'ded'|'com'|'eof', v, line }  */
  var OPS = ['===', '!==', '==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/=', '//=', '++', '--',
    '..', '//', '**', '->', '::',
    '=', '<', '>', '!', '+', '-', '*', '/', '%', '^', '.', ',', ';', ':', '?',
    '(', ')', '[', ']', '{', '}', '#'];

  function tokenize(code, lang, opts) {
    opts = opts || {};
    var D = LANGS[lang];
    if (!D) throw RErr('неизвестный язык: ' + lang);
    var toks = [], i = 0, line = 1;
    var indentStack = [0];
    var atLineStart = true;
    var bracketDepth = 0;
    var src = String(code).replace(/\r\n?/g, '\n');

    function isIdCh(c) { return /[A-Za-z0-9_$]/.test(c); }
    function isIdStart(c) { return /[A-Za-z_$]/.test(c); }
    function isDigit(c) { return c >= '0' && c <= '9'; }

    function push(ty, v, ln) { toks.push({ ty: ty, v: v, line: ln == null ? line : ln }); }

    function readString(q) {
      var start = line, out = '';
      i++; // skip quote
      while (i < src.length) {
        var c = src[i];
        if (c === '\\') {
          var n = src[i + 1];
          if (n === 'n') out += '\n';
          else if (n === 't') out += '\t';
          else if (n === '\\') out += '\\';
          else if (n === q) out += q;
          else if (n === "'") out += "'";
          else if (n === '"') out += '"';
          else out += (n || '');
          i += 2; continue;
        }
        if (c === q) { i++; return { v: out, line: start }; }
        if (c === '\n') throw RErr('незакрытая строка', start);
        out += c; i++;
      }
      throw RErr('незакрытая строка', start);
    }

    function readNumber() {
      var start = i, ln = line;
      while (i < src.length && isDigit(src[i])) i++;
      if (src[i] === '.' && isDigit(src[i + 1])) { i++; while (i < src.length && isDigit(src[i])) i++; }
      if (src[i] === 'e' || src[i] === 'E') {
        var j = i + 1; if (src[j] === '+' || src[j] === '-') j++;
        if (isDigit(src[j])) { i = j; while (i < src.length && isDigit(src[i])) i++; }
      }
      // суффиксы типов (C#: 1.5f, 2d, 3m)
      if (/[fFdDmM]/.test(src[i] || '') && !isIdCh(src[i + 1] || '')) i++;
      return { v: parseFloat(src.slice(start, i).replace(/[fFdDmM]$/, '')), line: ln };
    }

    function emitIndent() {
      // вычислить отступ текущей строки (только для indent-семейства)
      var j = i, w = 0;
      while (j < src.length && (src[j] === ' ' || src[j] === '\t')) { w += src[j] === '\t' ? 4 : 1; j++; }
      if (j >= src.length || src[j] === '\n') return; // пустая строка — пропускаем без токенов
      if (src[j] === D.comment && src.slice(j, j + D.comment.length) === D.comment) {
        // строка только с комментарием — тоже пропускаем (комментарий съесть отдельно)
        return;
      }
      var top = indentStack[indentStack.length - 1];
      if (w > top) { indentStack.push(w); push('ind', null); }
      else while (w < indentStack[indentStack.length - 1]) {
        indentStack.pop(); push('ded', null);
      }
      if (w !== indentStack[indentStack.length - 1]) throw RErr('неровные отступы', line);
    }

    while (i < src.length) {
      var c = src[i];
      if (atLineStart) {
        atLineStart = false;
        if (D.family === 'indent') {
          // комментарии на своей строке: съесть и не трогать отступы
          var jj = i, w2 = 0;
          while (jj < src.length && (src[jj] === ' ' || src[jj] === '\t')) { w2 += src[jj] === '\t' ? 4 : 1; jj++; }
          if (src.slice(jj, jj + D.comment.length) === D.comment) {
            while (i < src.length && src[i] !== '\n') {
              if (opts.keepComments) { /* соберём ниже */ }
              i++;
            }
            if (opts.keepComments) {
              var ct = src.slice(jj, i);
              push('com', ct);
            }
            if (src[i] === '\n') { i++; line++; }
            atLineStart = true;
            continue;
          }
          if (src[i] === '\n') { i++; line++; atLineStart = true; continue; } // пустая
          if (bracketDepth === 0) emitIndent();
        } else {
          while (i < src.length && (src[i] === ' ' || src[i] === '\t')) i++;
          if (i >= src.length) break;
          if (src[i] === '\n') { i++; line++; continue; } // пустая строка
          c = src[i]; // ВАЖНО: перечитать символ после пропуска отступа
        }
      }
      if (c === '\n') {
        push('nl', null); i++; line++; atLineStart = true; continue;
      }
      if (c === ' ' || c === '\t') { i++; continue; }
      // комментарий
      if (src.slice(i, i + D.comment.length) === D.comment &&
        (D.comment !== '//' || true)) {
        // lua '--' не должен ловить '--' как оператор: у lua comment='--'
        var cs = i;
        while (i < src.length && src[i] !== '\n') i++;
        if (opts.keepComments) push('com', src.slice(cs, i));
        continue;
      }
      if (c === '"' || c === "'") {
        var s = readString(c);
        push('str', s.v, s.line); continue;
      }
      if (isDigit(c) || (c === '.' && isDigit(src[i + 1]))) {
        var n = readNumber();
        push('num', n.v, n.line); continue;
      }
      if (isIdStart(c)) {
        var st = i;
        while (i < src.length && isIdCh(src[i])) i++;
        var word = src.slice(st, i);
        // каноника операторов-слов
        if (word === D.kwAnd) { push('op', '&&'); continue; }
        if (word === D.kwOr) { push('op', '||'); continue; }
        if (word === D.kwNot) { push('op', '!'); continue; }
        push('id', word); continue;
      }
      // операторы (по убыванию длины)
      var matched = null;
      for (var oi = 0; oi < OPS.length; oi++) {
        if (src.slice(i, i + OPS[oi].length) === OPS[oi]) { matched = OPS[oi]; break; }
      }
      if (!matched) {
        // lua '~='
        if (D.ne === '~=' && src.slice(i, i + 2) === '~=') matched = '!=';
        else throw RErr('неожиданный символ «' + c + '»', line);
      }
      if (matched === '!=' || (D.ne === '~=' && src.slice(i, i + 2) === '~=') ) { /* noop */ }
      i += matched.length;
      if (matched === '(' || matched === '[' || matched === '{') bracketDepth++;
      else if (matched === ')' || matched === ']' || matched === '}') bracketDepth = Math.max(0, bracketDepth - 1);
      var cv = matched;
      if (cv === '===') cv = '==';
      if (cv === '!==') cv = '!=';
      if (cv === D.ne && D.ne !== '!=') cv = '!=';
      if (cv === '**') cv = '^';
      if (cv === '..' && D.concat !== '..') { /* '..' не для не-lua */ }
      push('op', cv);
    }
    if (D.family === 'indent') {
      // закрыть оставшиеся уровни
      if (toks.length && toks[toks.length - 1].ty !== 'nl') push('nl', null);
      while (indentStack.length > 1) { indentStack.pop(); push('ded', null); }
    }
    push('eof', null);
    return toks;
  }

  /* ───────────────────────── парсер ───────────────────────── */
  function parse(tokens, lang) {
    var D = LANGS[lang];
    var p = 0;
    function peek(k) { return tokens[p + (k || 0)]; }
    function at(ty, v) { var t = tokens[p]; return t.ty === ty && (v === undefined || t.v === v); }
    function take(ty, v) { if (at(ty, v)) { var t = tokens[p]; p++; return t; } return null; }
    function expectOp(v) {
      if (!at('op', v)) throw RErr('ожидался «' + v + '», найдено «' + fmtTok(tokens[p]) + '»', tokens[p].line);
      return tokens[p++];
    }
    function fmtTok(t) {
      if (t.ty === 'eof') return 'конец кода';
      if (t.ty === 'nl' || t.ty === 'ind' || t.ty === 'ded') return '↵';
      return String(t.v);
    }
    function skipNl() { while (at('nl') || at('op', ';')) p++; }
    function line() { return tokens[p] ? tokens[p].line : 0; }

    /* — выражения (Pratt-подобные уровни) — */
    function expr() { return ternary(); }

    function ternary() {
      var a = logicOr();
      if (at('op', '?') && D.family === 'brace') {
        p++; var b = expr(); expectOp(':'); var c = expr();
        return { k: 'tern', a: a, b: b, c: c, line: a.line };
      }
      return a;
    }
    function logicOr() {
      var a = logicAnd();
      while (at('op', '||')) { p++; a = { k: 'logic', op: '||', a: a, b: logicAnd(), line: a.line }; }
      return a;
    }
    function logicAnd() {
      var a = cmp();
      while (at('op', '&&')) { p++; a = { k: 'logic', op: '&&', a: a, b: cmp(), line: a.line }; }
      return a;
    }
    function cmp() {
      var a = additive();
      while (at('op', '==') || at('op', '!=') || at('op', '<') || at('op', '>') || at('op', '<=') || at('op', '>=')) {
        var op = tokens[p++].v;
        a = { k: 'cmp', op: op, a: a, b: additive(), line: a.line };
      }
      return a;
    }
    function additive() {
      var a = multiplicative();
      while (at('op', '+') || at('op', '-') || (at('op', '..') && D.concat === '..')) {
        var op = tokens[p++].v;
        a = { k: 'bin', op: op, a: a, b: multiplicative(), line: a.line };
      }
      return a;
    }
    function multiplicative() {
      var a = power();
      while (at('op', '*') || at('op', '/') || at('op', '%') || (at('op', '//') && D.floorDiv)) {
        var op = tokens[p++].v;
        a = { k: 'bin', op: op, a: a, b: power(), line: a.line };
      }
      return a;
    }
    function power() {
      var a = unary();
      if (at('op', '^')) { p++; return { k: 'bin', op: '^', a: a, b: power(), line: a.line }; }
      return a;
    }
    function unary() {
      if (at('op', '-')) { var t = tokens[p++]; return { k: 'un', op: '-', a: unary(), line: t.line }; }
      if (at('op', '+')) { p++; return unary(); }
      if (at('op', '!')) { var t2 = tokens[p++]; return { k: 'un', op: '!', a: unary(), line: t2.line }; }
      if (at('id', D.kwNot) && D.kwNot === 'not') { var t3 = tokens[p++]; return { k: 'un', op: '!', a: unary(), line: t3.line }; }
      return postfix();
    }
    function postfix() {
      var a = primary();
      for (;;) {
        if (at('op', '(')) {
          p++; var args = [];
          skipNl();
          while (!at('op', ')')) { args.push(expr()); skipNl(); if (!take('op', ',')) break; skipNl(); }
          expectOp(')');
          a = { k: 'call', fn: a, args: args, line: a.line };
        } else if (at('op', '[')) {
          var lt = tokens[p]; p++; var ix = expr(); expectOp(']');
          a = { k: 'index', obj: a, ix: ix, line: lt.line };
        } else if (at('op', '.')) {
          p++;
          if (!at('id')) throw RErr('после «.» ожидается имя', line());
          var nm = tokens[p++].v;
          a = { k: 'member', obj: a, name: nm, line: a.line };
        } else if (at('op', '++') || at('op', '--')) {
          var op = tokens[p++].v;
          a = { k: 'post', op: op, a: a, line: a.line };
        } else break;
      }
      return a;
    }
    function primary() {
      var t = tokens[p];
      if (t.ty === 'num') { p++; return { k: 'num', v: t.v, line: t.line }; }
      if (t.ty === 'str') { p++; return { k: 'str', v: t.v, line: t.line }; }
      if (t.ty === 'id') {
        if (t.v === D.trueLit) { p++; return { k: 'bool', v: true, line: t.line }; }
        if (t.v === D.falseLit) { p++; return { k: 'bool', v: false, line: t.line }; }
        if (t.v === D.nilLit) { p++; return { k: 'nil', line: t.line }; }
        if (t.v === 'undefined' && lang === 'javascript') { p++; return { k: 'nil', line: t.line }; }
        p++; return { k: 'id', v: t.v, line: t.line };
      }
      if (at('op', '(')) { p++; skipNl(); var e = expr(); skipNl(); expectOp(')'); return e; }
      if (at('op', '[')) {
        p++; var items = [];
        skipNl();
        while (!at('op', ']')) { items.push(expr()); skipNl(); if (!take('op', ',')) break; skipNl(); }
        expectOp(']');
        return { k: 'arr', items: items, line: t.line };
      }
      if (at('op', '{') && lang === 'lua') { // конструктор таблицы
        p++; var titems = [];
        skipNl();
        while (!at('op', '}')) { titems.push(expr()); skipNl(); if (!take('op', ',') && !take('op', ';')) break; skipNl(); }
        expectOp('}');
        return { k: 'arr', items: titems, line: t.line };
      }
      if (at('op', '{') && (lang === 'javascript')) {
        p++; var props = [];
        skipNl();
        while (!at('op', '}')) {
          var key;
          if (at('str')) key = tokens[p++].v;
          else if (at('id') || at('num')) key = String(tokens[p++].v);
          else throw RErr('ожидался ключ объекта', line());
          expectOp(':');
          skipNl();
          props.push([key, expr()]);
          skipNl();
          if (!take('op', ',')) break;
          skipNl();
        }
        expectOp('}');
        return { k: 'obj', props: props, line: t.line };
      }
      if (at('op', '#') && lang === 'lua') { // #table — оператор длины
        p++; var inner = unary();
        return { k: 'len', a: inner, line: t.line };
      }
      throw RErr('неожиданное «' + fmtTok(t) + '» в выражении', t.line);
    }

    /* — операторы (statements) — */
    function parseBlockBrace() {
      expectOp('{');
      var body = [];
      skipNl();
      while (!at('op', '}')) { body.push(stmt()); skipNl(); }
      expectOp('}');
      return body;
    }
    function parseBodyBrace() {
      if (at('op', '{')) return parseBlockBrace();
      skipNl();
      return [stmt()]; // тело одним оператором: if (x) return 1;
    }
    function parseBlockIndent() {
      expectOp(':');
      skipNl();
      if (!take('ind')) throw RErr('после «:» ожидается блок с отступом', line());
      var body = [];
      skipNl();
      while (!at('ded') && !at('eof')) { body.push(stmt()); skipNl(); }
      if (!take('ded')) throw RErr('блок не закрыт (отступы)', line());
      return body;
    }
    function parseBlockEnd(termKw) {
      var body = [];
      skipNl();
      while (!(at('id') && (tokens[p].v === termKw || tokens[p].v === 'else' || tokens[p].v === 'elseif')) && !at('eof')) {
        body.push(stmt()); skipNl();
      }
      return body;
    }

    function parseParams() {
      expectOp('(');
      var params = [];
      while (!at('op', ')')) {
        // возможны типы (C#): int a, string b
        if (at('id') && D.typeWords.indexOf(tokens[p].v) >= 0 && tokens[p + 1] && tokens[p + 1].ty === 'id') p++;
        if (!at('id')) throw RErr('ожидалось имя параметра', line());
        params.push(tokens[p++].v);
        if (take('op', ':')) { if (at('id')) p++; } // аннотация типа (gdscript/python)
        if (!take('op', ',')) break;
      }
      expectOp(')');
      return params;
    }

    function isFuncDecl() {
      if (at('id', 'function') && D.family === 'brace') return true;               // js: function f(
      if (lang === 'csharp') {
        // [static] [void|int|...] Name (
        var k = 0;
        if (peek(k) && peek(k).ty === 'id' && ['public', 'private', 'static', 'protected', 'internal'].indexOf(peek(k).v) >= 0) k++;
        if (peek(k) && peek(k).ty === 'id' && ['public', 'private', 'static', 'protected', 'internal'].indexOf(peek(k).v) >= 0) k++;
        if (peek(k) && peek(k).ty === 'id' && D.typeWords.indexOf(peek(k).v) >= 0) k++;
        if (peek(k) && peek(k).ty === 'id' && peek(k + 1) && peek(k + 1).ty === 'op' && peek(k + 1).v === '(') return k >= 1;
        return false;
      }
      if (at('id', 'def') && lang === 'python') return true;
      if (at('id', 'func') && lang === 'gdscript') return true;
      if (lang === 'lua' && at('id', 'function') && peek(1) && peek(1).ty === 'id') return true;
      if (lang === 'lua' && at('id', 'local') && peek(1) && peek(1).ty === 'id' && peek(1).v === 'function') return true;
      return false;
    }

    function parseFuncDecl() {
      var ln = line(), name = null, params;
      if (lang === 'javascript') {
        take('id', 'function');
        if (at('id')) name = tokens[p++].v;
        params = parseParams();
        return { k: 'func', name: name, params: params, body: parseBlockBrace(), line: ln };
      }
      if (lang === 'csharp') {
        while (at('id') && ['public', 'private', 'static', 'protected', 'internal'].indexOf(tokens[p].v) >= 0) p++;
        var retType = null;
        if (at('id') && D.typeWords.indexOf(tokens[p].v) >= 0) retType = tokens[p++].v;
        if (at('id')) name = tokens[p++].v;
        params = parseParams();
        return { k: 'func', name: name, ret: retType, params: params, body: parseBlockBrace(), line: ln };
      }
      if (lang === 'python' || lang === 'gdscript') {
        p++; // def | func
        name = tokens[p++].v;
        params = parseParams();
        if (take('op', '->')) { if (at('id')) p++; } // возвращаемый тип
        return { k: 'func', name: name, params: params, body: parseBlockIndent(), line: ln };
      }
      if (lang === 'lua') {
        var isLocal = !!take('id', 'local');
        take('id', 'function');
        name = tokens[p++].v;
        params = parseParams();
        var body = parseBlockEnd('end');
        if (!take('id', 'end')) throw RErr('ожидался «end»', line());
        return { k: 'func', name: name, local: isLocal, params: params, body: body, line: ln };
      }
      throw RErr('не удалось разобрать функцию', ln);
    }

    function declWord() {
      if (!at('id')) return null;
      var w = tokens[p].v;
      if (D.declWords && D.declWords.indexOf(w) >= 0) return w;
      if (lang === 'csharp' && D.typeWords.indexOf(w) >= 0 && w !== 'void' &&
        peek(1) && peek(1).ty === 'id') return w;
      return null;
    }

    function stmt() {
      var ln = line();
      skipNl();
      var t = tokens[p];
      if (t.ty === 'eof') return { k: 'pass', line: ln };

      /* block families */
      if (D.family === 'indent') {
        if (at('id', 'if')) return parseIfIndent();
        if (at('id', 'while')) { p++; var wc = expr(); return { k: 'while', cond: wc, body: parseBlockIndent(), line: ln }; }
        if (at('id', 'for')) return parseForIndent();
        if (at('id', 'def') || at('id', 'func')) return parseFuncDecl();
        if (at('id', 'return')) { p++; var rv = endOfStmt() ? null : expr(); return { k: 'ret', v: rv, line: ln }; }
        if (at('id', 'break')) { p++; return { k: 'break', line: ln }; }
        if (at('id', 'continue')) { p++; return { k: 'cont', line: ln }; }
        if (at('id', 'pass')) { p++; return { k: 'pass', line: ln }; }
        if (at('id', 'extends') || at('id', 'class_name') || at('id', 'import') || at('id', 'using')) {
          // служебные строки — пропускаем до конца строки
          while (!at('nl') && !at('eof') && !at('ded')) p++;
          return { k: 'pass', line: ln };
        }
        if (at('id', 'var') || at('id', 'const')) {
          var kw = tokens[p++].v;
          var nm = tokens[p++].v;
          if (take('op', ':')) { if (at('id')) p++; } // var hp: int = 100
          var val = null;
          if (take('op', '=')) val = expr();
          return { k: 'var', name: nm, v: val, decl: kw, line: ln };
        }
        return parseExprOrAssign(ln);
      }

      if (D.family === 'end') { // lua
        if (at('id', 'if')) return parseIfEnd();
        if (at('id', 'while')) { p++; take('id', 'do') || null; var wce = expr(); take('id', 'do'); return { k: 'while', cond: wce, body: parseBlockEnd('end'), end: eatEnd(), line: ln }; }
        if (at('id', 'for')) return parseForEnd();
        if (isFuncDecl()) return parseFuncDecl();
        if (at('id', 'local')) {
          p++;
          var lname = tokens[p++].v;
          var lval = null;
          if (take('op', '=')) lval = expr();
          return { k: 'var', name: lname, v: lval, decl: 'local', line: ln };
        }
        if (at('id', 'return')) { p++; var rv2 = (at('nl') || at('eof') || at('id', 'end')) ? null : expr(); return { k: 'ret', v: rv2, line: ln }; }
        if (at('id', 'break')) { p++; return { k: 'break', line: ln }; }
        if (at('id', 'do')) { p++; var b = parseBlockEnd('end'); eatEnd(); return { k: 'block', body: b, line: ln }; }
        return parseExprOrAssign(ln);
      }

      /* brace family */
      if (at('id', 'if')) return parseIfBrace();
      if (at('id', 'while')) { p++; expectOp('('); var wc2 = expr(); expectOp(')'); return { k: 'while', cond: wc2, body: parseBodyBrace(), line: ln }; }
      if (at('id', 'for')) return parseForBrace();
      if (at('id', 'foreach') && lang === 'csharp') return parseForEachBrace();
      if (isFuncDecl()) return parseFuncDecl();
      // типизированный массив: int[] xs = {1,2} / = new int[]{1,2} / = new int[3]
      if (lang === 'csharp' && at('id') && D.typeWords.indexOf(tokens[p].v) >= 0 &&
        peek(1) && peek(1).ty === 'op' && peek(1).v === '[' &&
        peek(2) && peek(2).ty === 'op' && peek(2).v === ']' &&
        peek(3) && peek(3).ty === 'id') {
        p += 3;
        var aname = tokens[p++].v;
        expectOp('=');
        var aitems = null;
        if (at('id', 'new')) {
          p++;
          if (at('id') && D.typeWords.indexOf(tokens[p].v) >= 0) p++;
          expectOp('[');
          if (at('num')) { var sz = tokens[p++].v; expectOp(']'); aitems = []; for (var zi = 0; zi < sz && zi < 100000; zi++) aitems.push({ k: 'num', v: 0 }); }
          else { expectOp(']'); }
        }
        if (aitems === null) {
          if (at('op', '{')) {
            p++; aitems = [];
            while (!at('op', '}')) { aitems.push(expr()); if (!take('op', ',')) break; }
            expectOp('}');
          } else aitems = [expr()];
        }
        take('op', ';');
        return { k: 'var', name: aname, v: { k: 'arr', items: aitems, line: ln }, decl: 'arr', line: ln };
      }
      // модификаторы перед class/namespace
      if (lang === 'csharp') {
        var mk = 0;
        while (peek(mk) && peek(mk).ty === 'id' && ['public', 'private', 'protected', 'internal', 'static', 'abstract', 'sealed'].indexOf(peek(mk).v) >= 0) mk++;
        if (mk > 0 && peek(mk) && peek(mk).ty === 'id' && (peek(mk).v === 'class' || peek(mk).v === 'namespace')) p += mk;
      }
      if (at('id', 'class') || at('id', 'namespace') || at('id', 'using')) {
        // class { ... } / namespace X { ... } / using X; — прозрачно пропускаем
        if (at('id', 'using')) { while (!at('nl') && !at('op', ';') && !at('eof')) p++; take('op', ';'); return { k: 'pass', line: ln }; }
        p++;
        // имя (может быть составным X.Y)
        while (at('id')) { p++; take('op', '.'); }
        // наследование : Base
        if (at('op', ':')) { p++; while (at('id')) { p++; take('op', '.'); } }
        if (at('op', '{')) {
          // тело класса: разбираем как список stmt до '}'
          expectOp('{'); skipNl();
          var inner = [];
          while (!at('op', '}') && !at('eof')) { inner.push(stmt()); skipNl(); }
          expectOp('}');
          return { k: 'block', body: inner, line: ln };
        }
        return { k: 'pass', line: ln };
      }
      if (at('id', 'return')) { p++; var rv3 = (at('op', ';') || at('nl') || at('op', '}')) ? null : expr(); take('op', ';'); return { k: 'ret', v: rv3, line: ln }; }
      if (at('id', 'break')) { p++; take('op', ';'); return { k: 'break', line: ln }; }
      if (at('id', 'continue')) { p++; take('op', ';'); return { k: 'cont', line: ln }; }
      if (at('op', '{')) { return { k: 'block', body: parseBlockBrace(), line: ln }; }
      var dw = declWord();
      if (dw) {
        p++;
        var vname = tokens[p++].v;
        var vval = null;
        if (take('op', '=')) vval = expr();
        take('op', ';');
        return { k: 'var', name: vname, v: vval, decl: dw, line: ln };
      }
      return parseExprOrAssign(ln);
    }

    function eatEnd() { if (!take('id', 'end')) throw RErr('ожидался «end»', line()); return true; }
    function endOfStmt() { return at('nl') || at('eof') || at('op', ';') || at('op', '}') || at('ded'); }

    function parseExprOrAssign(ln) {
      var left = expr();
      if (at('op', '=') || at('op', '+=') || at('op', '-=') || at('op', '*=') || at('op', '/=') || at('op', '//=')) {
        var op = tokens[p++].v;
        var right = expr();
        return { k: 'assign', target: left, op: op, v: right, line: ln };
      }
      if (at('op', '++') || at('op', '--')) {
        var po = tokens[p++].v;
        return { k: 'assign', target: left, op: po === '++' ? '+=' : '-=', v: { k: 'num', v: 1 }, line: ln, post: true };
      }
      take('op', ';');
      return { k: 'expr', v: left, line: ln };
    }

    function parseIfBrace() {
      var ln = line(); p++; // if
      expectOp('('); var cond = expr(); expectOp(')');
      var body = parseBodyBrace();
      var node = { k: 'if', cond: cond, body: body, line: ln };
      skipNl();
      if (at('id', 'else')) {
        p++;
        skipNl();
        if (at('id', 'if')) { node.else = [parseIfBrace()]; }
        else node.else = parseBodyBrace();
      }
      return node;
    }
    function parseIfIndent() {
      var ln = line(); p++; // if
      var cond = expr();
      var body = parseBlockIndent();
      var rootIf = { k: 'if', cond: cond, body: body, line: ln };
      var node = rootIf;
      // elif / else на том же уровне: после ded уже съеден; ищем id elif/else
      for (;;) {
        if (at('id', 'elif') || (at('id', 'else'))) {
          if (tokens[p].v === 'elif') {
            p++; var c2 = expr(); var b2 = parseBlockIndent();
            node.else = [{ k: 'if', cond: c2, body: b2, line: ln }];
            node = node.else[0];
            continue;
          } else {
            p++; node.else = parseBlockIndent();
            break;
          }
        }
        break;
      }
      return rootIf;
    }
    function parseIfEnd() { // lua
      var ln = line(); p++; // if
      var cond = expr();
      if (!take('id', 'then')) throw RErr('ожидался «then»', line());
      var body = parseBlockEnd('end');
      var node = { k: 'if', cond: cond, body: body, line: ln, root: true };
      var cur = node;
      for (;;) {
        if (at('id', 'elseif')) {
          p++; var c2 = expr(); take('id', 'then');
          var b2 = parseBlockEnd('end');
          cur.else = [{ k: 'if', cond: c2, body: b2, line: ln }];
          cur = cur.else[0];
          continue;
        }
        if (at('id', 'else')) { p++; cur.else = parseBlockEnd('end'); }
        break;
      }
      eatEnd();
      return node;
    }
    function parseForBrace() {
      var ln = line(); p++; // for
      expectOp('(');
      if (at('id', 'of') || (at('id') && peek(1) && ((peek(1).ty === 'id' && peek(1).v === 'of') || at('op', ':')))) { /* fallthrough ниже */ }
      // for (x of arr) / for (let x of arr)
      var save = p;
      var isOf = false;
      if (at('id') && (tokens[p].v === 'let' || tokens[p].v === 'var' || tokens[p].v === 'const')) {
        if (peek(1) && peek(1).ty === 'id' && peek(2) && peek(2).ty === 'id' && peek(2).v === 'of') isOf = true;
      } else if (at('id') && peek(1) && peek(1).ty === 'id' && peek(1).v === 'of') isOf = true;
      if (isOf) {
        if (tokens[p].v === 'let' || tokens[p].v === 'var' || tokens[p].v === 'const') p++;
        var name = tokens[p++].v;
        p++; // of
        var arrE = expr(); expectOp(')');
        return { k: 'forin', name: name, arr: arrE, body: parseBodyBrace(), line: ln };
      }
      p = save;
      // классический for (init; cond; update)
      var init = null;
      if (!at('op', ';')) {
        var dw = declWord();
        if (dw) { p++; var vn = tokens[p++].v; expectOp('='); init = { k: 'var', name: vn, v: expr(), decl: dw, line: ln }; }
        else init = parseExprOrAssign(ln);
      }
      expectOp(';');
      var cond = at('op', ';') ? null : expr();
      expectOp(';');
      var upd = at('op', ')') ? null : parseExprOrAssign(ln);
      expectOp(')');
      return { k: 'for', init: init, cond: cond, upd: upd, body: parseBodyBrace(), line: ln };
    }
    function parseForEachBrace() { // c#: foreach (var x in arr)
      var ln = line(); p++;
      expectOp('(');
      if (at('id') && D.typeWords.indexOf(tokens[p].v) >= 0) p++;
      var name = tokens[p++].v;
      if (!take('id', 'in')) throw RErr('ожидался «in»', line());
      var arrE = expr(); expectOp(')');
      return { k: 'forin', name: name, arr: arrE, body: parseBodyBrace(), line: ln };
    }
    function parseForIndent() { // python/gdscript: for x in expr:
      var ln = line(); p++;
      var name = tokens[p++].v;
      if (!take('id', 'in')) throw RErr('ожидался «in»', line());
      var arrE = expr();
      return { k: 'forin', name: name, arr: arrE, body: parseBlockIndent(), line: ln };
    }
    function parseForEnd() { // lua: for i = 1, 10 [, step] do ... end
      var ln = line(); p++;
      var name = tokens[p++].v;
      if (take('op', '=')) {
        var from = expr();
        expectOp(',');
        var to = expr();
        var step = null;
        if (take('op', ',')) step = expr();
        if (!take('id', 'do')) throw RErr('ожидался «do»', line());
        var body = parseBlockEnd('end');
        eatEnd();
        return { k: 'fornum', name: name, from: from, to: to, step: step, body: body, line: ln };
      }
      throw RErr('поддерживается только числовой for (for i = 1, 10 do)', ln);
    }

    function parseProgram() {
      var body = [];
      skipNl();
      while (!at('eof')) { body.push(stmt()); skipNl(); }
      return { k: 'prog', body: body };
    }
    return parseProgram();
  }

  /* ───────────────────────── вычислитель ───────────────────────── */
  var SIG_RET = { sig: 'ret' }, SIG_BRK = { sig: 'brk' }, SIG_CNT = { sig: 'cnt' };

  function makeRunner(lang) {
    var D = LANGS[lang];
    var out = [];
    var steps = 0;
    var MAX_STEPS = 300000, MAX_OUT = 500, MAX_DEPTH = 120;
    var depth = 0;

    function Env(parent) { this.vars = Object.create(null); this.parent = parent || null; }
    Env.prototype.get = function (name) {
      var e = this;
      while (e) { if (name in e.vars) return e.vars[name]; e = e.parent; }
      return undefined;
    };
    Env.prototype.has = function (name) {
      var e = this;
      while (e) { if (name in e.vars) return true; e = e.parent; }
      return false;
    };
    Env.prototype.setLocal = function (name, v) { this.vars[name] = v; };
    Env.prototype.set = function (name, v) {
      var e = this;
      while (e) { if (name in e.vars) { e.vars[name] = v; return; } e = e.parent; }
      this.vars[name] = v;
    };

    function tooMany() { throw RErr('слишком много шагов — возможен бесконечный цикл'); }

    /* — форматирование значения в строку вывода — */
    function fmt(v) {
      if (v === null || v === undefined) return D.nilPrint;
      if (typeof v === 'boolean') return v ? D.boolPrint[0] : D.boolPrint[1];
      if (typeof v === 'number') {
        if (!isFinite(v)) return v > 0 ? 'inf' : (isNaN(v) ? 'nan' : '-inf');
        var r = Math.round(v * 1e10) / 1e10;
        return String(r);
      }
      if (typeof v === 'string') return v;
      if (Array.isArray(v)) {
        if (v.length > 60) return '[…' + v.length + ' элементов]';
        return '[' + v.map(fmtInner).join(', ') + ']';
      }
      if (typeof v === 'object' && v.__obj) {
        var parts = [];
        for (var k in v) if (k !== '__obj') parts.push(k + ': ' + fmtInner(v[k]));
        return '{ ' + parts.join(', ') + ' }';
      }
      if (typeof v === 'function' || (v && v.__fn)) return '<функция>';
      return String(v);
    }
    function fmtInner(v) {
      if (typeof v === 'string') return "'" + v.replace(/'/g, "\\'") + "'";
      return fmt(v);
    }

    function printFn(args) {
      if (out.length >= MAX_OUT) throw RErr('слишком много строк вывода (>' + MAX_OUT + ')');
      out.push(args.map(fmt).join(' '));
      return null;
    }

    function truthy(v) {
      if (D.truthyZero) return !(v === false || v === null || v === undefined); // lua
      if (v === null || v === undefined || v === false) return false;
      if (typeof v === 'number') return v !== 0 && !isNaN(v);
      if (typeof v === 'string') return v.length > 0;
      if (Array.isArray(v)) return true;
      return true;
    }

    function isInt(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; }

    function toArrIndex(v, ix, node) {
      if (!isInt(ix)) throw RErr('индекс должен быть целым числом', node.line);
      var i = D.idx1 ? ix - 1 : ix;
      if (i < 0) i += v.length; // отрицательные индексы (python/gd/lua-хвост)
      if (i < 0 || i >= v.length) {
        if (D.idx1) throw RErr('индекс ' + ix + ' вне границ (в Lua отсчёт с 1)', node.line);
        throw RErr('индекс ' + ix + ' вне границ массива', node.line);
      }
      return i;
    }

    /* — встроенные объекты/функции — */
    function makeBuiltins(rootEnv) {
      var b = {};
      b['print'] = { __fn: true, call: function (args) { return printFn(args); } };
      if (lang === 'lua') {
        b['tonumber'] = { __fn: true, call: function (a) { var n = parseFloat(a[0]); return isNaN(n) ? null : n; } };
        b['tostring'] = { __fn: true, call: function (a) { return fmt(a[0]); } };
        b['ipairs'] = { __iter: true, call: function (a) { return a[0] || []; } };
        b['math'] = mathObj();
      }
      if (lang === 'python' || lang === 'gdscript') {
        b['len'] = lenFn();
        b['range'] = rangeFn();
        b['str'] = { __fn: true, call: function (a) { return fmt(a[0]); } };
        b['int'] = { __fn: true, call: function (a) { return Math.trunc(parseFloat(a[0])) || 0; } };
        b['abs'] = { __fn: true, call: function (a) { return Math.abs(a[0]); } };
      }
      if (lang === 'python') {
        b['float'] = { __fn: true, call: function (a) { return parseFloat(a[0]); } };
        b['sum'] = { __fn: true, call: function (a) { return (a[0] || []).reduce(function (s, x) { return s + x; }, 0); } };
        b['max'] = { __fn: true, call: function (a) { return Math.max.apply(null, a[0] || []); } };
        b['min'] = { __fn: true, call: function (a) { return Math.min.apply(null, a[0] || []); } };
      }
      if (lang === 'gdscript') {
        b['float'] = { __fn: true, call: function (a) { return parseFloat(a[0]); } };
      }
      if (lang === 'javascript') {
        b['console'] = { __obj: true, log: b['print'], warn: b['print'], error: b['print'] };
        b['Math'] = mathObjJs();
      }
      if (lang === 'csharp') {
        b['Console'] = { __obj: true, WriteLine: b['print'], Write: { __fn: true, call: function (a) { if (out.length) out[out.length - 1] += a.map(fmt).join(' '); else out.push(a.map(fmt).join(' ')); return null; } } };
        b['Math'] = mathObjJs();
      }
      return b;
    }
    function lenFn() {
      return { __fn: true, call: function (a) { var v = a[0]; if (typeof v === 'string' || Array.isArray(v)) return v.length; throw RErr('len() работает со строками и списками'); } };
    }
    function rangeFn() {
      return {
        __fn: true, call: function (a) {
          var from = 0, to = 0, step = 1;
          if (a.length === 1) to = a[0];
          else { from = a[0]; to = a[1]; if (a.length > 2) step = a[2]; }
          if (step === 0) throw RErr('range: шаг не может быть 0');
          var res = [];
          if (step > 0) for (var i = from; i < to && res.length < 100000; i += step) res.push(i);
          else for (var j = from; j > to && res.length < 100000; j += step) res.push(j);
          return res;
        }
      };
    }
    function mathObj() {
      return {
        __obj: true,
        floor: { __fn: true, call: function (a) { return Math.floor(a[0]); } },
        ceil: { __fn: true, call: function (a) { return Math.ceil(a[0]); } },
        abs: { __fn: true, call: function (a) { return Math.abs(a[0]); } },
        max: { __fn: true, call: function (a) { return Math.max.apply(null, a); } },
        min: { __fn: true, call: function (a) { return Math.min.apply(null, a); } },
        sqrt: { __fn: true, call: function (a) { return Math.sqrt(a[0]); } },
        random: { __fn: true, call: function () { return Math.random(); } }
      };
    }
    function mathObjJs() {
      var m = mathObj();
      m.round = { __fn: true, call: function (a) { return Math.round(a[0]); } };
      m.pow = { __fn: true, call: function (a) { return Math.pow(a[0], a[1]); } };
      m.PI = Math.PI;
      return m;
    }

    /* — вызов методов значений — */
    function callMethod(recv, name, args, node) {
      var lname = name.toLowerCase();
      if (Array.isArray(recv)) {
        if (lname === 'push' || lname === 'append' || lname === 'add') { recv.push(args[0]); return null; }
        if (lname === 'pop' || lname === 'removeat' || lname === 'remove_at') return recv.pop();
        if (lname === 'size' || lname === 'count' || lname === 'length') return recv.length;
        if (lname === 'join') return recv.map(fmtInner).join(args[0] === undefined ? ',' : String(args[0]));
        if (lname === 'indexof' || lname === 'find') return recv.indexOf(args[0]) + (D.idx1 ? 1 : 0);
        if (lname === 'contains' || lname === 'includes') return recv.indexOf(args[0]) >= 0;
        if (lname === 'reverse') { recv.reverse(); return null; }
        if (lname === 'insert') { recv.splice(args[0] + (D.idx1 ? -1 : 0), 0, args[1]); return null; }
      }
      if (typeof recv === 'string') {
        if (lname === 'upper' || lname === 'touppercase' || lname === 'toupper') return recv.toUpperCase();
        if (lname === 'lower' || lname === 'tolowercase' || lname === 'tolower') return recv.toLowerCase();
        if (lname === 'trim') return recv.trim();
        if (lname === 'length' || lname === 'size' || lname === 'count') return recv.length;
        if (lname === 'split') return String(args[0] === undefined ? ',' : args[0]).length ? recv.split(String(args[0])) : recv.split('');
        if (lname === 'contains' || lname === 'includes' || lname === 'find') return recv.indexOf(args[0]) >= 0;
        if (lname === 'replace') return recv.split(args[0]).join(args[1]);
        if (lname === 'substring' || lname === 'substr') return recv.substring(args[0], args[1]);
        if (lname === 'startswith') return recv.indexOf(args[0]) === 0;
        if (lname === 'endswith') return recv.slice(-String(args[0]).length) === String(args[0]);
        if (lname === 'repeat') return new Array(Math.max(0, args[0] | 0) + 1).join(recv);
      }
      if (recv && recv.__obj && recv[name] !== undefined) {
        var m = recv[name];
        if (m && m.__fn) return m.call(args, node);
        return m;
      }
      throw RErr('у значения нет метода «' + name + '»', node.line);
    }

    /* — вычисление выражений — */
    function ev(n, env) {
      if (++steps > MAX_STEPS) tooMany();
      switch (n.k) {
        case 'num': case 'str': case 'bool': return n.v;
        case 'nil': return null;
        case 'id': {
          var v = env.get(n.v);
          if (v === undefined) throw RErr('неизвестная переменная «' + n.v + '»', n.line);
          return v;
        }
        case 'arr': return n.items.map(function (x) { return ev(x, env); });
        case 'obj': {
          var o = { __obj: true };
          n.props.forEach(function (pr) { o[pr[0]] = ev(pr[1], env); });
          return o;
        }
        case 'len': {
          var lv = ev(n.a, env);
          if (typeof lv === 'string' || Array.isArray(lv)) return lv.length;
          throw RErr('«#» работает со строками и таблицами', n.line);
        }
        case 'un': {
          var uv = ev(n.a, env);
          if (n.op === '-') {
            if (typeof uv !== 'number') throw RErr('минус применим только к числам', n.line);
            return -uv;
          }
          return !truthy(uv);
        }
        case 'logic': {
          var la = ev(n.a, env);
          if (n.op === '&&') return truthy(la) ? ev(n.b, env) : la;
          return truthy(la) ? la : ev(n.b, env);
        }
        case 'cmp': {
          var ca = ev(n.a, env), cb = ev(n.b, env);
          switch (n.op) {
            case '==': return eq(ca, cb);
            case '!=': return !eq(ca, cb);
            case '<': return rel(ca, cb, n) < 0;
            case '>': return rel(ca, cb, n) > 0;
            case '<=': return rel(ca, cb, n) <= 0;
            case '>=': return rel(ca, cb, n) >= 0;
          }
          break;
        }
        case 'bin': return binOp(n, ev(n.a, env), function () { return ev(n.b, env); }, env);
        case 'tern': return truthy(ev(n.a, env)) ? ev(n.b, env) : ev(n.c, env);
        case 'index': {
          var obj = ev(n.obj, env), ix = ev(n.ix, env);
          return indexGet(obj, ix, n);
        }
        case 'member': {
          var mv = ev(n.obj, env);
          return memberGet(mv, n.name, n);
        }
        case 'call': return doCall(n, env);
        case 'post': {
          var pv = ev(n.a, env);
          if (typeof pv !== 'number') throw RErr('++/-- работает только с числами', n.line);
          var nv = n.op === '++' ? pv + 1 : pv - 1;
          assignTo(n.a, nv, n, env, null);
          return nv;
        }
      }
      throw RErr('не удалось вычислить «' + n.k + '»', n.line);
    }

    function eq(a, b) {
      if (a === null || a === undefined) return b === null || b === undefined;
      if (b === null || b === undefined) return false;
      if (typeof a === 'number' && typeof b === 'number') return a === b;
      if (typeof a === 'string' || typeof b === 'string') {
        if (typeof a === 'string' && typeof b === 'string') return a === b;
        return false;
      }
      return a === b;
    }
    function rel(a, b, n) {
      if (typeof a === 'number' && typeof b === 'number') return a < b ? -1 : a > b ? 1 : 0;
      if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
      throw RErr('сравнивать можно только числа или только строки', n.line);
    }

    function binOp(n, a, getB, env) {
      if (n.op === '+' && (typeof a === 'string' || (D.concat === '+' && peekIsStr(n.b, env)))) {
        var sb = getB();
        if (typeof a === 'string' && typeof sb === 'string') return a + sb;
        if (typeof a === 'string') {
          if (lang === 'python' && typeof sb !== 'string') throw RErr('нельзя сложить строку и ' + typeName(sb) + ' — используй str() или вывод через запятую', n.line);
          return a + fmt(sb);
        }
        if (typeof sb === 'string') {
          if (lang === 'python' && typeof a !== 'string') throw RErr('нельзя сложить ' + typeName(a) + ' и строку — используй str()', n.line);
          return fmt(a) + sb;
        }
      }
      if (n.op === '..') { // lua-конкатенация
        var cb = getB();
        if ((typeof a === 'string' || typeof a === 'number') && (typeof cb === 'string' || typeof cb === 'number')) return fmt(a) + fmt(cb);
        throw RErr('«..» соединяет только строки и числа', n.line);
      }
      var b = getB();
      if (n.op === '+' && typeof a === 'string' && typeof b === 'string') return a + b;
      if (n.op === '*' && lang === 'python' && (typeof a === 'string' || typeof b === 'string')) {
        var s = typeof a === 'string' ? a : b, cnt = typeof a === 'string' ? b : a;
        return new Array(Math.max(0, cnt | 0) + 1).join(s);
      }
      if (typeof a !== 'number' || typeof b !== 'number') {
        if (n.op === '+' && (typeof a === 'string' || typeof b === 'string')) return fmt(a) + fmt(b);
        throw RErr('арифметика работает только с числами (получено: ' + typeName(a) + ' и ' + typeName(b) + ')', n.line);
      }
      switch (n.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
          if (b === 0) throw RErr('деление на ноль', n.line);
          if (D.intDiv && isInt(a) && isInt(b)) return Math.trunc(a / b);
          return a / b;
        case '//':
          if (b === 0) throw RErr('деление на ноль', n.line);
          return Math.floor(a / b);
        case '%':
          if (b === 0) throw RErr('деление на ноль', n.line);
          if (lang === 'lua' || lang === 'python' || lang === 'gdscript') return ((a % b) + b) % b;
          return a % b;
        case '^': return Math.pow(a, b);
      }
      throw RErr('неизвестная операция «' + n.op + '»', n.line);
    }
    function peekIsStr(node, env) { return !!node && node.k === 'str'; }
    function typeName(v) {
      if (v === null || v === undefined) return D.nilLit;
      if (typeof v === 'number') return 'число';
      if (typeof v === 'string') return 'строка';
      if (typeof v === 'boolean') return 'булево';
      if (Array.isArray(v)) return 'массив';
      return 'значение';
    }

    function indexGet(obj, ix, n) {
      if (typeof obj === 'string') {
        if (!isInt(ix)) throw RErr('индекс должен быть целым', n.line);
        var si = D.idx1 ? ix - 1 : ix;
        if (si < 0) si += obj.length;
        if (si < 0 || si >= obj.length) throw RErr('индекс вне границ строки', n.line);
        return obj[si];
      }
      if (Array.isArray(obj)) return obj[toArrIndex(obj, ix, n)];
      if (obj && obj.__obj) {
        var key = String(ix);
        if (key in obj) return obj[key];
        throw RErr('в объекте нет ключа «' + key + '»', n.line);
      }
      throw RErr('нельзя обращаться по индексу к ' + typeName(obj), n.line);
    }

    function memberGet(v, name, n) {
      if (v && v.__obj && name in v) return v[name];
      var lname = name.toLowerCase();
      if ((Array.isArray(v) || typeof v === 'string') && (lname === 'length' || lname === 'size' || name === 'Length' || name === 'Count')) return v.length;
      if (Array.isArray(v) && (lname === 'push' || lname === 'append' || lname === 'pop' || lname === 'join' || lname === 'indexof' || lname === 'contains' || lname === 'includes' || lname === 'reverse' || lname === 'insert' || lname === 'removeat' || lname === 'remove_at' || lname === 'count')) return { __fn: true, bound: v, method: name };
      if (typeof v === 'string' && (lname === 'upper' || lname === 'lower' || lname === 'trim' || lname === 'split' || lname === 'contains' || lname === 'replace' || lname === 'substring' || lname === 'startswith' || lname === 'endswith' || lname === 'repeat' || lname === 'toupper' || lname === 'tolower' || lname === 'touppercase' || lname === 'tolowercase' || lname === 'find')) return { __fn: true, bound: v, method: name };
      if (v && v.__obj) {
        // несуществующий ключ объекта — null (как в js undefined)
        return null;
      }
      throw RErr('у значения нет свойства «' + name + '»', n.line);
    }

    function doCall(n, env) {
      var fnNode = n.fn;
      var args = n.args.map(function (a) { return ev(a, env); });
      var fn;
      if (fnNode.k === 'member') {
        var recv = ev(fnNode.obj, env);
        return callMethod(recv, fnNode.name, args, n);
      }
      fn = ev(fnNode, env);
      if (fn && fn.__fn && fn.bound !== undefined) return callMethod(fn.bound, fn.method, args, n);
      if (fn && fn.__fn) return fn.call(args, n);
      if (fn && fn.__user) return callUser(fn, args, n);
      throw RErr('«' + (fnNode.k === 'id' ? fnNode.v : 'выражение') + '» — не функция', n.line);
    }

    function callUser(fn, args, n) {
      if (++depth > MAX_DEPTH) { depth--; throw RErr('слишком глубокая рекурсия', n.line); }
      var e = new Env(fn.closure);
      for (var i = 0; i < fn.params.length; i++) e.setLocal(fn.params[i], args[i] === undefined ? null : args[i]);
      var res = null;
      try {
        var sig = execBlock(fn.body, e);
        if (sig && sig.sig === 'ret') res = sig.v;
        else if (sig) throw RErr('break/continue вне цикла', n.line);
      } finally { depth--; }
      return res === undefined ? null : res;
    }

    /* — исполнение операторов — */
    function execBlock(body, env) {
      for (var i = 0; i < body.length; i++) {
        var sig = execStmt(body[i], env);
        if (sig) return sig;
      }
      return null;
    }

    function assignTo(target, v, n, env, op) {
      if (op && op !== '=') {
        var cur;
        if (target.k === 'id') cur = env.get(target.v);
        else if (target.k === 'index') cur = indexGet(ev(target.obj, env), ev(target.ix, env), target);
        else if (target.k === 'member') cur = memberGet(ev(target.obj, env), target.name, target);
        var baseOp = op === '+=' ? '+' : op === '-=' ? '-' : op === '*=' ? '*' : op === '//=' ? '//' : '/';
        var merged = binOp({ k: 'bin', op: baseOp, line: n.line }, cur, function () { return v; }, env);
        v = merged;
      }
      if (target.k === 'id') { env.set(target.v, v); return; }
      if (target.k === 'index') {
        var obj = ev(target.obj, env), ix = ev(target.ix, env);
        if (Array.isArray(obj)) { obj[toArrIndex(obj, ix, target)] = v; return; }
        if (obj && obj.__obj) { obj[String(ix)] = v; return; }
        throw RErr('нельзя присвоить элемент в ' + typeName(obj), n.line);
      }
      if (target.k === 'member') {
        var mo = ev(target.obj, env);
        if (mo && mo.__obj) { mo[target.name] = v; return; }
        throw RErr('нельзя присвоить свойство в ' + typeName(mo), n.line);
      }
      throw RErr('присваивание возможно только переменной, элементу или свойству', n.line);
    }

    function execStmt(s, env) {
      if (++steps > MAX_STEPS) tooMany();
      switch (s.k) {
        case 'pass': case 'expr':
          if (s.k === 'expr') ev(s.v, env);
          return null;
        case 'var': {
          var v = s.v ? ev(s.v, env) : null;
          env.setLocal(s.name, v);
          return null;
        }
        case 'assign': {
          var rv = ev(s.v, env);
          assignTo(s.target, rv, s, env, s.op);
          return null;
        }
        case 'ret': return { sig: 'ret', v: s.v ? ev(s.v, env) : null };
        case 'break': return SIG_BRK;
        case 'cont': return SIG_CNT;
        case 'block': {
          var e2 = new Env(env);
          return execBlock(s.body, e2);
        }
        case 'func': {
          var fn = { __user: true, name: s.name, params: s.params, body: s.body, closure: env };
          if (s.name) env.setLocal(s.name, fn);
          return null;
        }
        case 'if': {
          if (truthy(ev(s.cond, env))) return execBlock(s.body, new Env(env));
          if (s.else) return execBlock(s.else, new Env(env));
          return null;
        }
        case 'while': {
          var guard = 0;
          while (truthy(ev(s.cond, env))) {
            if (++guard > 100000) throw RErr('слишком долгий цикл', s.line);
            var sig = execBlock(s.body, new Env(env));
            if (sig === SIG_BRK) break;
            if (sig && sig.sig === 'ret') return sig;
          }
          return null;
        }
        case 'for': {
          var fe = new Env(env);
          if (s.init) execStmt(s.init, fe);
          var g2 = 0;
          while (s.cond === null || truthy(ev(s.cond, fe))) {
            if (++g2 > 100000) throw RErr('слишком долгий цикл', s.line);
            var sig2 = execBlock(s.body, new Env(fe));
            if (sig2 === SIG_BRK) { if (s.upd) ev(s.upd.k === 'expr' ? s.upd.v : s.upd, fe); break; }
            if (sig2 && sig2.sig === 'ret') return sig2;
            if (s.upd) {
              if (s.upd.k === 'expr') ev(s.upd.v, fe);
              else execStmt(s.upd, fe);
            }
          }
          return null;
        }
        case 'forin': {
          var arr = ev(s.arr, env);
          if (arr && arr.__fn && arr.__iter) arr = arr.call([arr], s); // не используется
          if (typeof arr === 'string') arr = arr.split('');
          if (!Array.isArray(arr)) throw RErr('в цикле for..in нужен массив или строка', s.line);
          for (var xi = 0; xi < arr.length; xi++) {
            var fe2 = new Env(env);
            fe2.setLocal(s.name, arr[xi]);
            var sig3 = execBlock(s.body, fe2);
            if (sig3 === SIG_BRK) break;
            if (sig3 && sig3.sig === 'ret') return sig3;
          }
          return null;
        }
        case 'fornum': { // lua
          var from = ev(s.from, env), to = ev(s.to, env), stp = s.step ? ev(s.step, env) : 1;
          var fe3 = new Env(env);
          var g3 = 0;
          if (stp > 0) {
            for (var iv = from; iv <= to; iv += stp) {
              if (++g3 > 100000) throw RErr('слишком долгий цикл', s.line);
              fe3.setLocal(s.name, iv);
              var sg = execBlock(s.body, new Env(fe3));
              if (sg === SIG_BRK) break;
              if (sg && sg.sig === 'ret') return sg;
            }
          } else if (stp < 0) {
            for (var jv = from; jv >= to; jv += stp) {
              if (++g3 > 100000) throw RErr('слишком долгий цикл', s.line);
              fe3.setLocal(s.name, jv);
              var sg2 = execBlock(s.body, new Env(fe3));
              if (sg2 === SIG_BRK) break;
              if (sg2 && sg2.sig === 'ret') return sg2;
            }
          } else throw RErr('шаг цикла не может быть 0', s.line);
          return null;
        }
      }
      throw RErr('неизвестный оператор «' + s.k + '»', s.line);
    }

    return {
      run: function (program) {
        var rootEnv = new Env(null);
        var builtins = makeBuiltins(rootEnv);
        Object.keys(builtins).forEach(function (k) { rootEnv.setLocal(k, builtins[k]); });
        var sig = execBlock(program.body, rootEnv);
        if (sig && sig.sig === 'ret') { /* return на верхнем уровне — игнорируем */ }
        return out;
      },
      fmt: fmt
    };
  }

  /* ───────────────────────── публичный API ───────────────────────── */
  function run(code, lang) {
    if (!LANGS[lang]) return { out: [], error: 'Неизвестный язык: ' + lang };
    try {
      var toks = tokenize(code, lang);
      var ast = parse(toks, lang);
      var runner = makeRunner(lang);
      var out = runner.run(ast);
      return { out: out, error: null };
    } catch (e) {
      var msg = (e && e.message) ? e.message : String(e);
      return { out: [], error: msg };
    }
  }

  /* проверка задачи: сравнение вывода с ожидаемым */
  function matchOutput(actual, expected) {
    var a = (actual || []).map(function (s) { return String(s).replace(/\s+$/g, ''); });
    var x = (expected || []).map(function (s) { return String(s).replace(/\s+$/g, ''); });
    // убрать пустые хвосты
    while (a.length && a[a.length - 1] === '') a.pop();
    while (x.length && x[x.length - 1] === '') x.pop();
    if (a.length !== x.length) return false;
    for (var i = 0; i < x.length; i++) {
      // числовая tolerant-сравнение
      var na = parseFloat(a[i].replace(',', '.')), nx = parseFloat(x[i].replace(',', '.'));
      if (a[i] === x[i]) continue;
      if (!isNaN(na) && !isNaN(nx) && String(na) === a[i].replace(',', '.') && Math.abs(na - nx) < 1e-9) continue;
      return false;
    }
    return true;
  }

  /* подсветка: токены → HTML (монохром) */
  function highlight(code, lang) {
    var D = LANGS[lang];
    if (!D) return esc(code);
    var toks;
    try { toks = tokenize(code, lang, { keepComments: true }); }
    catch (e) { return esc(code); }
    var html = '', lastLine = 1;
    function nlTo(line) { while (lastLine < line) { html += '\n'; lastLine++; } }
    // восстановим текст по токенам грубо: печатаем token.value с пробелами по исходнику —
    // проще: повторный проход по исходнику с разметкой по позициям невозможен (нет offset),
    // поэтому собираем из токенов: значения + одинарные пробелы между «словами».
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (t.ty === 'eof') break;
      nlTo(t.line || lastLine);
      if (t.ty === 'nl') { html += '\n'; lastLine++; continue; }
      if (t.ty === 'ind') { html += '    '; continue; }
      if (t.ty === 'ded') { continue; }
      if (t.ty === 'com') { html += '<i class="c-com">' + esc(t.v) + '</i> '; continue; }
      if (t.ty === 'str') { html += '<i class="c-str">' + esc("'" + t.v.replace(/\n/g, '\\n') + "'") + '</i>'; if (needSpace(toks, i)) html += ' '; continue; }
      if (t.ty === 'num') { html += '<i class="c-num">' + esc(String(t.v)) + '</i>'; if (needSpace(toks, i)) html += ' '; continue; }
      if (t.ty === 'id') {
        var cls = '';
        if (D.keywords.indexOf(t.v) >= 0) cls = 'c-kw';
        else if (t.v === D.trueLit || t.v === D.falseLit || t.v === D.nilLit) cls = 'c-kw';
        else if (toks[i + 1] && toks[i + 1].ty === 'op' && toks[i + 1].v === '(') cls = 'c-fn';
        html += cls ? '<i class="' + cls + '">' + esc(t.v) + '</i>' : esc(t.v);
        if (needSpace(toks, i)) html += ' ';
        continue;
      }
      if (t.ty === 'op') {
        var sep = !(t.v === '(' || t.v === '[' || t.v === '{' || t.v === '.' || t.v === ',' || t.v === ';' || t.v === ':' || t.v === ')');
        html += '<i class="c-op">' + esc(t.v) + '</i>';
        if (t.v === ',' || t.v === ';') html += ' ';
        else if (sep && needSpace(toks, i)) html += ' ';
        continue;
      }
    }
    return html;
  }
  function needSpace(toks, i) {
    var nx = toks[i + 1];
    if (!nx || nx.ty === 'nl' || nx.ty === 'eof' || nx.ty === 'ded') return false;
    if (nx.ty === 'op' && (nx.v === ')' || nx.v === ']' || nx.v === '}' || nx.v === ',' || nx.v === ';' || nx.v === '.' || nx.v === '(' || nx.v === ':')) return false;
    if (toks[i].ty === 'op' && (toks[i].v === '(' || toks[i].v === '[' || toks[i].v === '{' || toks[i].v === '.')) return false;
    return true;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  root.QCD = {
    LANGS: LANGS,
    LANG_ORDER: LANG_ORDER,
    parse: function (code, lang) { return parse(tokenize(code, lang), lang); },
    run: run,
    matchOutput: matchOutput,
    highlight: highlight,
    tokenize: tokenize,
    esc: esc
  };
})(typeof window !== 'undefined' ? window : globalThis);
