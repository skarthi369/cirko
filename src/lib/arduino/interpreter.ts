/**
 * A small Arduino-C interpreter.
 *
 * Supports the subset of sketch code people actually write on a breadboard:
 * variables, arithmetic, if/else, for, while, do/while, break, continue,
 * user functions, arrays, and the core Arduino calls (pinMode, digitalWrite,
 * digitalRead, analogRead, analogWrite, delay, millis, Serial.*, tone, map...).
 *
 * Execution is generator based: every delay() yields back to the caller so the
 * simulator can advance the circuit between statements.
 */

export type SketchHost = {
  pinMode(pin: number | string, mode: string): void;
  digitalWrite(pin: number | string, value: number): void;
  digitalRead(pin: number | string): number;
  analogWrite(pin: number | string, value: number): void;
  analogRead(pin: number | string): number;
  tone(pin: number | string, freq: number): void;
  noTone(pin: number | string): void;
  print(text: string): void;
  millis(): number;
};

export class SketchError extends Error {
  line: number;
  constructor(message: string, line = 0) {
    super(line ? `Line ${line}: ${message}` : message);
    this.line = line;
  }
}

/* ------------------------------------------------------------------ */
/* Lexer                                                               */
/* ------------------------------------------------------------------ */

type TokKind = "num" | "str" | "char" | "id" | "punc" | "eof";
type Tok = { kind: TokKind; value: string; line: number };

const PUNCS = [
  "<<=", ">>=", "...",
  "==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<", ">>", "->", "::",
  "{", "}", "(", ")", "[", "]", ";", ",", ".", "+", "-", "*", "/", "%", "=", "<", ">", "!", "&", "|", "^", "~", "?", ":",
];

function lex(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  let line = 1;
  while (i < src.length) {
    const c = src[i]!;
    if (c === "\n") {
      line++;
      i++;
      continue;
    }
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        if (src[i] === "\n") line++;
        i++;
      }
      i += 2;
      continue;
    }
    if (c === "#") {
      // preprocessor: keep #define NAME VALUE, ignore the rest of the line
      let end = i;
      while (end < src.length && src[end] !== "\n") end++;
      const text = src.slice(i, end).trim();
      const m = /^#define\s+([A-Za-z_]\w*)\s+(.+)$/.exec(text);
      if (m) {
        toks.push({ kind: "id", value: "#define", line });
        toks.push({ kind: "id", value: m[1]!, line });
        for (const t of lex(m[2]!)) if (t.kind !== "eof") toks.push({ ...t, line });
        toks.push({ kind: "punc", value: ";", line });
      }
      i = end;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i;
      if (c === "0" && (src[i + 1] === "x" || src[i + 1] === "X" || src[i + 1] === "b" || src[i + 1] === "B")) {
        j = i + 2;
        while (j < src.length && /[0-9a-fA-F]/.test(src[j]!)) j++;
      } else {
        while (j < src.length && /[0-9.eE]/.test(src[j]!)) {
          if ((src[j] === "e" || src[j] === "E") && /[+-]/.test(src[j + 1] ?? "")) j++;
          j++;
        }
      }
      while (j < src.length && /[uUlLfF]/.test(src[j]!)) j++;
      toks.push({ kind: "num", value: src.slice(i, j), line });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j]!)) j++;
      toks.push({ kind: "id", value: src.slice(i, j), line });
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1;
      let out = "";
      while (j < src.length && src[j] !== quote) {
        if (src[j] === "\\") {
          const n = src[j + 1];
          out += n === "n" ? "\n" : n === "t" ? "\t" : n === "0" ? "\0" : (n ?? "");
          j += 2;
        } else {
          out += src[j];
          j++;
        }
      }
      toks.push({ kind: quote === '"' ? "str" : "char", value: out, line });
      i = j + 1;
      continue;
    }
    const p = PUNCS.find((q) => src.startsWith(q, i));
    if (!p) throw new SketchError(`Unexpected character "${c}"`, line);
    toks.push({ kind: "punc", value: p, line });
    i += p.length;
  }
  toks.push({ kind: "eof", value: "", line });
  return toks;
}

/* ------------------------------------------------------------------ */
/* AST + parser                                                        */
/* ------------------------------------------------------------------ */

type Expr =
  | { k: "num"; v: number }
  | { k: "str"; v: string }
  | { k: "ident"; name: string; line: number }
  | { k: "un"; op: string; e: Expr }
  | { k: "post"; op: string; e: Expr }
  | { k: "pre"; op: string; e: Expr }
  | { k: "bin"; op: string; a: Expr; b: Expr }
  | { k: "assign"; op: string; target: Expr; value: Expr }
  | { k: "cond"; c: Expr; a: Expr; b: Expr }
  | { k: "call"; callee: string; args: Expr[]; line: number }
  | { k: "index"; arr: Expr; idx: Expr };

type Stmt =
  | { k: "expr"; e: Expr }
  | { k: "decl"; name: string; init: Expr | null; arraySize: Expr | null; items: Expr[] | null }
  | { k: "if"; c: Expr; then: Stmt; else: Stmt | null }
  | { k: "while"; c: Expr; body: Stmt }
  | { k: "do"; c: Expr; body: Stmt }
  | { k: "for"; init: Stmt | null; c: Expr | null; step: Expr | null; body: Stmt }
  | { k: "block"; body: Stmt[] }
  | { k: "return"; e: Expr | null }
  | { k: "break" }
  | { k: "continue" }
  | { k: "empty" };

type FnDef = { name: string; params: string[]; body: Stmt };

const TYPE_WORDS = new Set([
  "void", "int", "long", "short", "char", "float", "double", "bool", "boolean", "byte", "word",
  "unsigned", "signed", "const", "static", "volatile", "uint8_t", "uint16_t", "uint32_t",
  "int8_t", "int16_t", "int32_t", "size_t", "String",
]);

function parse(src: string): { fns: Map<string, FnDef>; globals: Stmt[] } {
  const toks = lex(src);
  let pos = 0;
  const peek = (o = 0) => toks[pos + o]!;
  const at = (v: string) => peek().value === v && (peek().kind === "punc" || peek().kind === "id");
  const next = () => toks[pos++]!;
  const expect = (v: string) => {
    if (!at(v)) throw new SketchError(`Expected "${v}" but found "${peek().value || "end of file"}"`, peek().line);
    return next();
  };
  const eat = (v: string) => (at(v) ? (next(), true) : false);

  const skipTypeWords = () => {
    let seen = false;
    while (peek().kind === "id" && TYPE_WORDS.has(peek().value)) {
      next();
      seen = true;
    }
    while (at("*") || at("&")) next();
    return seen;
  };

  /* ---- expressions ---- */
  function parsePrimary(): Expr {
    const t = peek();
    if (t.kind === "num") {
      next();
      const raw = t.value.replace(/[uUlLfF]+$/, "");
      const v = /^0[bB]/.test(raw) ? parseInt(raw.slice(2), 2) : Number(raw);
      return { k: "num", v: Number.isFinite(v) ? v : 0 };
    }
    if (t.kind === "str") {
      next();
      return { k: "str", v: t.value };
    }
    if (t.kind === "char") {
      next();
      return { k: "num", v: t.value.charCodeAt(0) || 0 };
    }
    if (at("(")) {
      next();
      // cast like (int)x
      if (peek().kind === "id" && TYPE_WORDS.has(peek().value) && toks[pos + 1]!.value === ")") {
        next();
        next();
        return parseUnary();
      }
      const e = parseExpr();
      expect(")");
      return e;
    }
    if (t.kind === "id") {
      next();
      let name = t.value;
      while (at(".") || at("::")) {
        next();
        name += "." + next().value;
      }
      if (at("(")) {
        next();
        const args: Expr[] = [];
        if (!at(")")) {
          do args.push(parseAssign());
          while (eat(","));
        }
        expect(")");
        return { k: "call", callee: name, args, line: t.line };
      }
      let e: Expr = { k: "ident", name, line: t.line };
      while (at("[")) {
        next();
        const idx = parseExpr();
        expect("]");
        e = { k: "index", arr: e, idx };
      }
      return e;
    }
    throw new SketchError(`Unexpected "${t.value || "end of file"}"`, t.line);
  }

  function parsePostfix(): Expr {
    let e = parsePrimary();
    while (at("++") || at("--")) e = { k: "post", op: next().value, e };
    return e;
  }

  function parseUnary(): Expr {
    if (at("!") || at("-") || at("+") || at("~")) {
      const op = next().value;
      return { k: "un", op, e: parseUnary() };
    }
    if (at("++") || at("--")) {
      const op = next().value;
      return { k: "pre", op, e: parseUnary() };
    }
    return parsePostfix();
  }

  const PREC: Record<string, number> = {
    "*": 11, "/": 11, "%": 11,
    "+": 10, "-": 10,
    "<<": 9, ">>": 9,
    "<": 8, "<=": 8, ">": 8, ">=": 8,
    "==": 7, "!=": 7,
    "&": 6, "^": 5, "|": 4,
    "&&": 3, "||": 2,
  };

  function parseBin(minPrec: number): Expr {
    let left = parseUnary();
    for (;;) {
      const t = peek();
      if (t.kind !== "punc") break;
      const prec = PREC[t.value];
      if (prec === undefined || prec < minPrec) break;
      next();
      const right = parseBin(prec + 1);
      left = { k: "bin", op: t.value, a: left, b: right };
    }
    return left;
  }

  function parseAssign(): Expr {
    const left = parseBin(0);
    const ops = ["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="];
    if (peek().kind === "punc" && ops.includes(peek().value)) {
      const op = next().value;
      return { k: "assign", op, target: left, value: parseAssign() };
    }
    if (at("?")) {
      next();
      const a = parseAssign();
      expect(":");
      const b = parseAssign();
      return { k: "cond", c: left, a, b };
    }
    return left;
  }

  const parseExpr = (): Expr => {
    let e = parseAssign();
    while (at(",")) {
      next();
      e = { k: "bin", op: ",", a: e, b: parseAssign() };
    }
    return e;
  };

  /* ---- statements ---- */
  function parseBlock(): Stmt {
    expect("{");
    const body: Stmt[] = [];
    while (!at("}") && peek().kind !== "eof") body.push(parseStmt());
    expect("}");
    return { k: "block", body };
  }

  function looksLikeDecl(): boolean {
    if (peek().kind !== "id") return false;
    if (!TYPE_WORDS.has(peek().value)) return false;
    let o = 0;
    while (peek(o).kind === "id" && TYPE_WORDS.has(peek(o).value)) o++;
    while (peek(o).value === "*" || peek(o).value === "&") o++;
    return peek(o).kind === "id";
  }

  function parseDecl(): Stmt {
    skipTypeWords();
    const decls: Stmt[] = [];
    do {
      const name = next().value;
      let arraySize: Expr | null = null;
      let items: Expr[] | null = null;
      let init: Expr | null = null;
      if (at("[")) {
        next();
        arraySize = at("]") ? null : parseExpr();
        expect("]");
      }
      if (eat("=")) {
        if (at("{")) {
          next();
          items = [];
          if (!at("}")) {
            do items.push(parseAssign());
            while (eat(","));
          }
          expect("}");
        } else {
          init = parseAssign();
        }
      }
      decls.push({ k: "decl", name, init, arraySize, items });
    } while (eat(","));
    eat(";");
    return decls.length === 1 ? decls[0]! : { k: "block", body: decls };
  }

  function parseStmt(): Stmt {
    if (at("{")) return parseBlock();
    if (at(";")) {
      next();
      return { k: "empty" };
    }
    if (at("#define")) {
      next();
      const name = next().value;
      const value = parseExpr();
      eat(";");
      return { k: "decl", name, init: value, arraySize: null, items: null };
    }
    if (at("if")) {
      next();
      expect("(");
      const c = parseExpr();
      expect(")");
      const then = parseStmt();
      let els: Stmt | null = null;
      if (at("else")) {
        next();
        els = parseStmt();
      }
      return { k: "if", c, then, else: els };
    }
    if (at("while")) {
      next();
      expect("(");
      const c = parseExpr();
      expect(")");
      return { k: "while", c, body: parseStmt() };
    }
    if (at("do")) {
      next();
      const body = parseStmt();
      expect("while");
      expect("(");
      const c = parseExpr();
      expect(")");
      eat(";");
      return { k: "do", c, body };
    }
    if (at("for")) {
      next();
      expect("(");
      let init: Stmt | null = null;
      if (!at(";")) init = looksLikeDecl() ? parseDecl() : { k: "expr", e: parseExpr() };
      eat(";");
      const c = at(";") ? null : parseExpr();
      expect(";");
      const step = at(")") ? null : parseExpr();
      expect(")");
      return { k: "for", init, c, step, body: parseStmt() };
    }
    if (at("return")) {
      next();
      const e = at(";") ? null : parseExpr();
      eat(";");
      return { k: "return", e };
    }
    if (at("break")) {
      next();
      eat(";");
      return { k: "break" };
    }
    if (at("continue")) {
      next();
      eat(";");
      return { k: "continue" };
    }
    if (looksLikeDecl()) return parseDecl();
    const e = parseExpr();
    eat(";");
    return { k: "expr", e };
  }

  /* ---- top level ---- */
  const fns = new Map<string, FnDef>();
  const globals: Stmt[] = [];
  while (peek().kind !== "eof") {
    if (at("#define")) {
      globals.push(parseStmt());
      continue;
    }
    const start = pos;
    const hadType = skipTypeWords();
    if (peek().kind === "id" && peek(1).value === "(") {
      const name = next().value;
      expect("(");
      const params: string[] = [];
      if (!at(")")) {
        do {
          skipTypeWords();
          if (peek().kind === "id") params.push(next().value);
          while (at("[")) {
            next();
            expect("]");
          }
        } while (eat(","));
      }
      expect(")");
      if (at(";")) {
        next(); // forward declaration
        continue;
      }
      fns.set(name, { name, params, body: parseBlock() });
      continue;
    }
    pos = start;
    if (hadType || looksLikeDecl()) globals.push(parseStmt());
    else globals.push(parseStmt());
  }
  return { fns, globals };
}

/* ------------------------------------------------------------------ */
/* Interpreter                                                         */
/* ------------------------------------------------------------------ */

type Yield = { type: "delay"; ms: number };
type Value = number | string | boolean | number[] | string[];

class Scope {
  vars = new Map<string, Value>();
  constructor(public parent: Scope | null = null) {}
  get(name: string): Value | undefined {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let s: Scope | null = this;
    while (s) {
      if (s.vars.has(name)) return s.vars.get(name);
      s = s.parent;
    }
    return undefined;
  }
  has(name: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let s: Scope | null = this;
    while (s) {
      if (s.vars.has(name)) return true;
      s = s.parent;
    }
    return false;
  }
  set(name: string, v: Value) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let s: Scope | null = this;
    while (s) {
      if (s.vars.has(name)) {
        s.vars.set(name, v);
        return;
      }
      s = s.parent;
    }
    this.vars.set(name, v);
  }
  declare(name: string, v: Value) {
    this.vars.set(name, v);
  }
}

const CONSTANTS: Record<string, number> = {
  HIGH: 1, LOW: 0, true: 1, false: 0, INPUT: 0, OUTPUT: 1, INPUT_PULLUP: 2,
  LED_BUILTIN: 13, PI: Math.PI, A0: 14, A1: 15, A2: 16, A3: 17, A4: 18, A5: 19,
  DEC: 10, HEX: 16, BIN: 2, OCT: 8,
};

const BREAK = Symbol("break");
const CONTINUE = Symbol("continue");
type Flow = typeof BREAK | typeof CONTINUE | { ret: Value } | undefined;

const analogName = (n: number) => (n >= 14 && n <= 19 ? `A${n - 14}` : n);

export class Sketch {
  private fns: Map<string, FnDef>;
  private globalStmts: Stmt[];
  private globals = new Scope();
  private startedAt = 0;
  private steps = 0;

  constructor(source: string, private host: SketchHost) {
    const { fns, globals } = parse(source);
    this.fns = fns;
    this.globalStmts = globals;
    if (!fns.has("setup") && !fns.has("loop")) {
      throw new SketchError("A sketch needs a setup() and a loop() function.");
    }
  }

  /** Runs global declarations + setup(). */
  *begin(): Generator<Yield, void, void> {
    this.startedAt = this.host.millis();
    this.globals = new Scope();
    for (const s of this.globalStmts) yield* this.exec(s, this.globals);
    const setup = this.fns.get("setup");
    if (setup) yield* this.exec(setup.body, new Scope(this.globals));
  }

  /** Runs one pass of loop(). */
  *tick(): Generator<Yield, void, void> {
    const loop = this.fns.get("loop");
    if (!loop) {
      yield { type: "delay", ms: 50 };
      return;
    }
    yield* this.exec(loop.body, new Scope(this.globals));
  }

  private budget() {
    if (++this.steps > 200000) {
      this.steps = 0;
      throw new SketchError("This sketch is looping without any delay — add a delay() so the board can breathe.");
    }
  }

  private *exec(s: Stmt, scope: Scope): Generator<Yield, Flow, void> {
    this.budget();
    switch (s.k) {
      case "empty":
        return undefined;
      case "expr":
        yield* this.eval(s.e, scope);
        return undefined;
      case "decl": {
        if (s.items) {
          const vals: number[] = [];
          for (const it of s.items) vals.push(Number(yield* this.eval(it, scope)) || 0);
          scope.declare(s.name, vals);
        } else if (s.arraySize) {
          const n = Number(yield* this.eval(s.arraySize, scope)) || 0;
          scope.declare(s.name, new Array<number>(Math.max(0, Math.min(4096, n))).fill(0));
        } else {
          scope.declare(s.name, s.init ? yield* this.eval(s.init, scope) : 0);
        }
        return undefined;
      }
      case "block": {
        const inner = new Scope(scope);
        for (const st of s.body) {
          const f = yield* this.exec(st, inner);
          if (f) return f;
        }
        return undefined;
      }
      case "if": {
        if (truthy(yield* this.eval(s.c, scope))) return yield* this.exec(s.then, scope);
        if (s.else) return yield* this.exec(s.else, scope);
        return undefined;
      }
      case "while": {
        while (truthy(yield* this.eval(s.c, scope))) {
          this.budget();
          const f = yield* this.exec(s.body, scope);
          if (f === BREAK) break;
          if (f && f !== CONTINUE) return f;
        }
        return undefined;
      }
      case "do": {
        for (;;) {
          this.budget();
          const f = yield* this.exec(s.body, scope);
          if (f === BREAK) break;
          if (f && f !== CONTINUE) return f;
          if (!truthy(yield* this.eval(s.c, scope))) break;
        }
        return undefined;
      }
      case "for": {
        const inner = new Scope(scope);
        if (s.init) yield* this.exec(s.init, inner);
        for (;;) {
          this.budget();
          if (s.c && !truthy(yield* this.eval(s.c, inner))) break;
          const f = yield* this.exec(s.body, inner);
          if (f === BREAK) break;
          if (f && f !== CONTINUE) return f;
          if (s.step) yield* this.eval(s.step, inner);
        }
        return undefined;
      }
      case "return":
        return { ret: s.e ? yield* this.eval(s.e, scope) : 0 };
      case "break":
        return BREAK;
      case "continue":
        return CONTINUE;
      default:
        return undefined;
    }
  }

  private *eval(e: Expr, scope: Scope): Generator<Yield, Value, void> {
    this.budget();
    switch (e.k) {
      case "num":
        return e.v;
      case "str":
        return e.v;
      case "ident": {
        if (scope.has(e.name)) return scope.get(e.name)!;
        if (e.name in CONSTANTS) return CONSTANTS[e.name]!;
        return 0;
      }
      case "index": {
        const arr = yield* this.eval(e.arr, scope);
        const i = Number(yield* this.eval(e.idx, scope));
        if (Array.isArray(arr)) return (arr[i] as number) ?? 0;
        if (typeof arr === "string") return arr.charCodeAt(i) || 0;
        return 0;
      }
      case "un": {
        const v = Number(yield* this.eval(e.e, scope));
        if (e.op === "!") return truthy(v) ? 0 : 1;
        if (e.op === "-") return -v;
        if (e.op === "~") return ~v;
        return v;
      }
      case "pre": {
        const cur = Number(yield* this.eval(e.e, scope));
        const nv = e.op === "++" ? cur + 1 : cur - 1;
        yield* this.store(e.e, nv, scope);
        return nv;
      }
      case "post": {
        const cur = Number(yield* this.eval(e.e, scope));
        yield* this.store(e.e, e.op === "++" ? cur + 1 : cur - 1, scope);
        return cur;
      }
      case "bin": {
        if (e.op === "&&") return truthy(yield* this.eval(e.a, scope)) && truthy(yield* this.eval(e.b, scope)) ? 1 : 0;
        if (e.op === "||") return truthy(yield* this.eval(e.a, scope)) || truthy(yield* this.eval(e.b, scope)) ? 1 : 0;
        const a = yield* this.eval(e.a, scope);
        const b = yield* this.eval(e.b, scope);
        if (e.op === ",") return b;
        if (e.op === "+" && (typeof a === "string" || typeof b === "string")) return `${str(a)}${str(b)}`;
        const x = Number(a);
        const y = Number(b);
        switch (e.op) {
          case "+": return x + y;
          case "-": return x - y;
          case "*": return x * y;
          case "/": return y === 0 ? 0 : x / y;
          case "%": return y === 0 ? 0 : x % y;
          case "<": return x < y ? 1 : 0;
          case "<=": return x <= y ? 1 : 0;
          case ">": return x > y ? 1 : 0;
          case ">=": return x >= y ? 1 : 0;
          case "==": return x === y ? 1 : 0;
          case "!=": return x !== y ? 1 : 0;
          case "&": return x & y;
          case "|": return x | y;
          case "^": return x ^ y;
          case "<<": return x << y;
          case ">>": return x >> y;
          default: return 0;
        }
      }
      case "cond":
        return truthy(yield* this.eval(e.c, scope))
          ? yield* this.eval(e.a, scope)
          : yield* this.eval(e.b, scope);
      case "assign": {
        let value = yield* this.eval(e.value, scope);
        if (e.op !== "=") {
          const cur = yield* this.eval(e.target, scope);
          const op = e.op.slice(0, -1);
          if (op === "+" && (typeof cur === "string" || typeof value === "string")) value = `${str(cur)}${str(value)}`;
          else {
            const x = Number(cur);
            const y = Number(value);
            value =
              op === "+" ? x + y
              : op === "-" ? x - y
              : op === "*" ? x * y
              : op === "/" ? (y === 0 ? 0 : x / y)
              : op === "%" ? (y === 0 ? 0 : x % y)
              : op === "&" ? (x & y)
              : op === "|" ? (x | y)
              : op === "^" ? (x ^ y)
              : op === "<<" ? x << y
              : op === ">>" ? x >> y
              : y;
          }
        }
        yield* this.store(e.target, value, scope);
        return value;
      }
      case "call":
        return yield* this.call(e, scope);
      default:
        return 0;
    }
  }

  private *store(target: Expr, value: Value, scope: Scope): Generator<Yield, void, void> {
    if (target.k === "ident") {
      scope.set(target.name, value);
      return;
    }
    if (target.k === "index" && target.arr.k === "ident") {
      const arr = scope.get(target.arr.name);
      const i = Number(yield* this.eval(target.idx, scope));
      if (Array.isArray(arr)) (arr as number[])[i] = Number(value);
    }
  }

  private *call(e: Expr & { k: "call" }, scope: Scope): Generator<Yield, Value, void> {
    const args: Value[] = [];
    for (const a of e.args) args.push(yield* this.eval(a, scope));
    const n = (i: number) => Number(args[i] ?? 0);
    const h = this.host;
    const name = e.callee;

    switch (name) {
      case "pinMode":
        h.pinMode(analogName(n(0)), n(1) === 1 ? "OUTPUT" : n(1) === 2 ? "INPUT_PULLUP" : "INPUT");
        return 0;
      case "digitalWrite":
        h.digitalWrite(analogName(n(0)), truthy(args[1]) ? 1 : 0);
        return 0;
      case "digitalRead":
        return h.digitalRead(analogName(n(0)));
      case "analogWrite":
        h.analogWrite(analogName(n(0)), Math.max(0, Math.min(255, Math.round(n(1)))));
        return 0;
      case "analogRead":
        return h.analogRead(analogName(n(0)));
      case "tone":
        h.tone(analogName(n(0)), n(1));
        return 0;
      case "noTone":
        h.noTone(analogName(n(0)));
        return 0;
      case "delay":
        yield { type: "delay", ms: Math.max(0, n(0)) };
        return 0;
      case "delayMicroseconds":
        yield { type: "delay", ms: Math.max(0, n(0) / 1000) };
        return 0;
      case "millis":
        return Math.round(h.millis() - this.startedAt);
      case "micros":
        return Math.round((h.millis() - this.startedAt) * 1000);
      case "map": {
        const [x, inMin, inMax, outMin, outMax] = [n(0), n(1), n(2), n(3), n(4)];
        if (inMax === inMin) return outMin;
        return Math.round(((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin);
      }
      case "constrain":
        return Math.min(n(2), Math.max(n(1), n(0)));
      case "min":
        return Math.min(n(0), n(1));
      case "max":
        return Math.max(n(0), n(1));
      case "abs":
        return Math.abs(n(0));
      case "sqrt":
        return Math.sqrt(Math.max(0, n(0)));
      case "pow":
        return Math.pow(n(0), n(1));
      case "sin":
        return Math.sin(n(0));
      case "cos":
        return Math.cos(n(0));
      case "tan":
        return Math.tan(n(0));
      case "round":
        return Math.round(n(0));
      case "floor":
        return Math.floor(n(0));
      case "ceil":
        return Math.ceil(n(0));
      case "random":
        return args.length > 1
          ? Math.floor(n(0) + Math.random() * (n(1) - n(0)))
          : Math.floor(Math.random() * Math.max(1, n(0)));
      case "randomSeed":
      case "Serial.begin":
      case "Serial.flush":
      case "Serial.end":
      case "interrupts":
      case "noInterrupts":
        return 0;
      case "Serial.print":
        h.print(fmtSerial(args));
        return 0;
      case "Serial.println":
        h.print(`${fmtSerial(args)}\n`);
        return 0;
      case "Serial.available":
        return 0;
      case "String":
        return str(args[0] ?? "");
      default:
        break;
    }

    const fn = this.fns.get(name);
    if (!fn) throw new SketchError(`Unknown function "${name}()"`, e.line);
    const inner = new Scope(this.globals);
    fn.params.forEach((p, i) => inner.declare(p, args[i] ?? 0));
    const flow = yield* this.exec(fn.body, inner);
    return flow && typeof flow === "object" && "ret" in flow ? flow.ret : 0;
  }
}

function truthy(v: Value | undefined): boolean {
  if (typeof v === "string") return v.length > 0;
  if (Array.isArray(v)) return true;
  return Boolean(Number(v));
}

function str(v: Value): string {
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(2);
  return String(v);
}

function fmtSerial(args: Value[]): string {
  const v = args[0] ?? "";
  const base = args.length > 1 ? Number(args[1]) : undefined;
  if (typeof v === "number" && base && [2, 8, 16].includes(base)) {
    return Math.round(v).toString(base).toUpperCase();
  }
  if (typeof v === "number" && args.length > 1 && Number.isFinite(base)) return v.toFixed(base ?? 2);
  return str(v);
}

/** Quick syntax check without running anything. */
export function checkSketch(source: string): string | null {
  try {
    parse(source);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

export const DEFAULT_SKETCH = `// Blink an LED on pin 13
void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(13, HIGH);
  Serial.println("on");
  delay(500);
  digitalWrite(13, LOW);
  Serial.println("off");
  delay(500);
}
`;
