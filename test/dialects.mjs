/* QKCcode — юнит-тесты учебных интерпретаторов (node test/dialects.mjs) */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
const __dir = path.dirname(fileURLToPath(import.meta.url));
require(path.join(__dir, '..', 'js', 'dialects.js'));
const QCD = globalThis.QCD;

let pass = 0, fail = 0;
function out(lang, code) { return QCD.run(code, lang); }
function check(name, lang, code, expected, expectError) {
  const r = out(lang, code);
  if (expectError) {
    if (r.error) { pass++; }
    else { fail++; console.log('FAIL', name, '— ожидалась ошибка, получено', JSON.stringify(r.out)); }
    return;
  }
  if (r.error) { fail++; console.log('FAIL', name, '— ошибка:', r.error); return; }
  if (QCD.matchOutput(r.out, expected)) pass++;
  else { fail++; console.log('FAIL', name, '\n  ждал:', JSON.stringify(expected), '\n  получил:', JSON.stringify(r.out)); }
}

/* ── Lua ── */
check('lua hello', 'lua', 'print("Привет, Roblox!")', ['Привет, Roblox!']);
check('lua vars', 'lua', 'local name = "Steve"\nlocal hp = 100\nprint(name, hp)', ['Steve 100']);
check('lua concat', 'lua', 'local a = "2 + 2 = "\nprint(a .. 4)', ['2 + 2 = 4']);
check('lua arith', 'lua', 'print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(2 ^ 3)', ['3.5', '3', '1', '8']);
check('lua if', 'lua', 'local x = 5\nif x > 3 then\n  print("big")\nelseif x == 3 then\n  print("three")\nelse\n  print("small")\nend', ['big']);
check('lua while', 'lua', 'local i = 1\nwhile i <= 3 do\n  print(i)\n  i = i + 1\nend', ['1', '2', '3']);
check('lua for', 'lua', 'for i = 1, 5 do\n  print(i * 2)\nend', ['2', '4', '6', '8', '10']);
check('lua for step', 'lua', 'for i = 10, 1, -3 do print(i) end', ['10', '7', '4', '1']);
check('lua func', 'lua', 'local function sum(a, b)\n  return a + b\nend\nprint(sum(2, 3))', ['5']);
check('lua bool/nil', 'lua', 'print(true)\nprint(false)\nprint(nil)', ['true', 'false', 'nil']);
check('lua logic', 'lua', 'print(5 > 3 and "yes" or "no")', ['yes']);
check('lua neq', 'lua', 'if 1 ~= 2 then print("ok") end', ['ok']);
check('lua not', 'lua', 'local f = false\nif not f then print("neg") end', ['neg']);
check('lua comments', 'lua', '-- комментарий\nprint(1) -- и тут', ['1']);
check('lua table len', 'lua', 'local t = {10, 20, 30}\nprint(#t)\nprint(t[1])', ['3', '10']);
check('lua truthy zero', 'lua', 'if 0 then print("zero is truthy") end', ['zero is truthy']);
check('lua str esc', 'lua', 'print("a\\nb")', ['a\nb']);
check('lua unknown var', 'lua', 'print(abc)', null, true);

/* ── JavaScript ── */
check('js hello', 'javascript', 'console.log("Привет, мир!");', ['Привет, мир!']);
check('js vars', 'javascript', 'let name = "QKC";\nconst year = 2026;\nconsole.log(name, year);', ['QKC 2026']);
check('js templateless concat', 'javascript', 'let s = "2+2=" + 4;\nconsole.log(s);', ['2+2=4']);
check('js if else', 'javascript', 'let x = 7;\nif (x % 2 === 0) {\n  console.log("even");\n} else {\n  console.log("odd");\n}', ['odd']);
check('js for', 'javascript', 'for (let i = 1; i <= 4; i++) {\n  console.log(i);\n}', ['1', '2', '3', '4']);
check('js while', 'javascript', 'let n = 3;\nwhile (n > 0) { console.log(n); n--; }', ['3', '2', '1']);
check('js func', 'javascript', 'function mul(a, b) {\n  return a * b;\n}\nconsole.log(mul(3, 4));', ['12']);
check('js arrowless ternary', 'javascript', 'let a = 5;\nconsole.log(a > 3 ? "big" : "small");', ['big']);
check('js array', 'javascript', 'let arr = [1, 2, 3];\narr.push(4);\nconsole.log(arr.length);\nconsole.log(arr[0], arr[3]);', ['4', '1 4']);
check('js for of', 'javascript', 'let xs = ["a", "b"];\nfor (let x of xs) console.log(x);', ['a', 'b']);
check('js object', 'javascript', 'let p = { name: "Ana", age: 12 };\nconsole.log(p.name);\np.age = 13;\nconsole.log(p.age);', ['Ana', '13']);
check('js join', 'javascript', 'console.log([1, 2, 3].join("-"));', ['1-2-3']);
check('js div float', 'javascript', 'console.log(7 / 2);', ['3.5']);
check('js and or', 'javascript', 'console.log(true && false);\nconsole.log(true || false);', ['false', 'true']);
check('js recursion', 'javascript', 'function f(n) { if (n <= 1) return 1; return n * f(n - 1); }\nconsole.log(f(5));', ['120']);
check('js infinite loop guard', 'javascript', 'while (true) { }', null, true);
check('js nested loops', 'javascript', 'for (let i = 1; i <= 2; i++)\n  for (let j = 1; j <= 2; j++)\n    console.log(i + "" + j);', ['11', '12', '21', '22']);
check('js string methods', 'javascript', 'console.log("qkc".toUpperCase());\nconsole.log("QKCcode".length);', ['QKC', '7']);

/* ── C# ── */
check('cs hello', 'csharp', 'Console.WriteLine("Привет, Unity!");', ['Привет, Unity!']);
check('cs types', 'csharp', 'int hp = 100;\nstring name = "Hero";\ndouble speed = 1.5;\nbool alive = true;\nConsole.WriteLine(name + " " + hp);', ['Hero 100']);
check('cs int div', 'csharp', 'Console.WriteLine(7 / 2);\nConsole.WriteLine(7 % 2);', ['3', '1']);
check('cs float suffix', 'csharp', 'float f = 2.5f;\nConsole.WriteLine(f * 2);', ['5']);
check('cs bool print', 'csharp', 'Console.WriteLine(true);\nConsole.WriteLine(false);', ['True', 'False']);
check('cs if', 'csharp', 'int score = 10;\nif (score >= 9) {\n  Console.WriteLine("A");\n} else if (score >= 5) {\n  Console.WriteLine("B");\n} else {\n  Console.WriteLine("C");\n}', ['A']);
check('cs for', 'csharp', 'for (int i = 0; i < 3; i++) {\n  Console.WriteLine(i);\n}', ['0', '1', '2']);
check('cs method', 'csharp', 'static int Add(int a, int b) {\n  return a + b;\n}\nConsole.WriteLine(Add(2, 5));', ['7']);
check('cs void method', 'csharp', 'void Say(string s) {\n  Console.WriteLine(s);\n}\nSay("hi");', ['hi']);
check('cs foreach', 'csharp', 'int[] arr = {1, 2, 3};\nforeach (int x in arr) { Console.WriteLine(x); }', ['1', '2', '3']);
check('cs new array', 'csharp', 'int[] xs = new int[] {7, 8};\nConsole.WriteLine(xs[0]);', ['7']);
check('cs array index', 'csharp', 'int[] xs = new int[] {5, 6};\nConsole.WriteLine(xs[1]);', ['6']);
check('cs class wrapper', 'csharp', 'using UnityEngine;\npublic class Player : MonoBehaviour {\n  void Start() {\n    Console.WriteLine("start");\n  }\n}', []);
check('cs start call', 'csharp', 'void Start() {\n  Console.WriteLine("start");\n}\nStart();', ['start']);
check('cs and or not', 'csharp', 'Console.WriteLine(!false);\nConsole.WriteLine(true && false);', ['True', 'False']);
check('cs string concat num', 'csharp', 'int x = 5;\nConsole.WriteLine("x=" + x);', ['x=5']);

/* ── Python ── */
check('py hello', 'python', 'print("Привет!")', ['Привет!']);
check('py vars', 'python', 'name = "Мир"\ncount = 3\nprint(name, count)', ['Мир 3']);
check('py bool', 'python', 'print(True)\nprint(False)\nprint(None)', ['True', 'False', 'None']);
check('py if elif', 'python', 'x = 5\nif x > 10:\n    print("big")\nelif x == 5:\n    print("five")\nelse:\n    print("small")', ['five']);
check('py for range', 'python', 'for i in range(3):\n    print(i)', ['0', '1', '2']);
check('py for range 2', 'python', 'for i in range(1, 4):\n    print(i * 10)', ['10', '20', '30']);
check('py while', 'python', 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1', ['3', '2', '1']);
check('py def', 'python', 'def greet(name):\n    return "Привет, " + name + "!"\n\nprint(greet("Aня"))', ['Привет, Aня!']);
check('py list', 'python', 'xs = [1, 2, 3]\nxs.append(4)\nprint(len(xs))\nprint(xs)', ['4', "[1, 2, 3, 4]"]);
check('py for in list', 'python', 'for x in ["a", "b"]:\n    print(x)', ['a', 'b']);
check('py fdiv', 'python', 'print(7 / 2)\nprint(7 // 2)', ['3.5', '3']);
check('py str concat err', 'python', 'print("x" + 5)', null, true);
check('py str mul', 'python', 'print("-" * 5)', ['-----']);
check('py indent err', 'python', 'if True:\nprint(1)', null, true);
check('py nested func', 'python', 'def outer(n):\n    def inner(m):\n        return m * 2\n    return inner(n) + 1\nprint(outer(4))', ['9']);
check('py comments', 'python', '# коммент\nprint(42)  # inline', ['42']);
check('py nested loops', 'python', 'for i in range(2):\n    for j in range(2):\n        print(i, j)', ['0 0', '0 1', '1 0', '1 1']);
check('py sum/max', 'python', 'print(sum([1, 2, 3]))\nprint(max([4, 7, 2]))', ['6', '7']);
check('py str int', 'python', 'print(str(5) + " раз")\nprint(int("42"))', ['5 раз', '42']);

/* ── GDScript ── */
check('gd hello', 'gdscript', 'print("Привет, Godot!")', ['Привет, Godot!']);
check('gd vars', 'gdscript', 'var hp = 100\nconst MAX_HP = 200\nprint(hp, "/", MAX_HP)', ['100 / 200']);
check('gd if elif', 'gdscript', 'var x = 3\nif x > 5:\n\tprint("big")\nelif x == 3:\n\tprint("three")\nelse:\n\tprint("small")', ['three']);
check('gd for range', 'gdscript', 'for i in range(3):\n\tprint(i)', ['0', '1', '2']);
check('gd func', 'gdscript', 'func damage(base, mult):\n\treturn base * mult\n\nprint(damage(10, 2))', ['20']);
check('gd while', 'gdscript', 'var n = 2\nwhile n >= 0:\n\tprint(n)\n\tn -= 1', ['2', '1', '0']);
check('gd array', 'gdscript', 'var items = ["sword", "shield"]\nitems.append("potion")\nprint(items.size())\nprint(items)', ['3', "['sword', 'shield', 'potion']"]);
check('gd extends', 'gdscript', 'extends Node2D\n\nfunc _ready():\n\tprint("ready!")\n\n_ready()', ['ready!']);
check('gd bool', 'gdscript', 'print(true)\nprint(false)\nprint(null)', ['true', 'false', 'null']);
check('gd and or', 'gdscript', 'print(true and false)\nprint(not false)', ['false', 'true']);
check('gd typed var', 'gdscript', 'var speed: float = 2.5\nvar label: String = "go"\nprint(label, speed)', ['go 2.5']);

/* ── общие механизмы ── */
check('steps guard', 'python', 'i = 0\nwhile True:\n    i += 1', null, true);
check('div zero', 'lua', 'print(1 / 0)', null, true);
check('unclosed string', 'javascript', 'console.log("oops)', null, true);
check('matchOutput trailing spaces', 'lua', 'print("a ")', ['a']);

console.log(`\ndialects: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
