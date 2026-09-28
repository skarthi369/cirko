import { PART_MAP } from "@/lib/parts";
import type { Design, PlacedPart } from "@/components/circuit/types";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

export const num = (s: string | undefined, d: number) => {
  const v = parseFloat(s ?? "");
  return Number.isFinite(v) ? v : d;
};

const R_OFF = 1e11; // open branch
const R_ON = 0.02; // closed switch / ideal wire
const LEAK = 1e-9; // node-to-ground leak keeps the matrix solvable

/** Every branch obeys: I(a -> b) = (Va - Vb - E) / R */
type Branch = {
  partId: string;
  pinA: string;
  pinB: string;
  a: string; // node key
  b: string; // node key
  R: number;
  E: number;
  diode?: { vf: number; rOn: number };
  on?: boolean;
};

export type PartSim = {
  type: string;
  current: number; // A, main branch
  voltage: number; // V across the part
  power: number; // W
  brightness?: number; // 0..1
  rpm?: number;
  sounding?: boolean;
  reading?: string; // sensor read-out
  pins: Record<string, number>; // pin -> volts
  pinCurrents: Record<string, number>; // pin -> A (positive = into the part)
};

export type SimResult = {
  ok: boolean;
  parts: Record<string, PartSim>;
  wires: Record<string, number>; // wire id -> current (A)
  nodes: Record<string, number>; // pin key -> volts
  notes: string[];
};

const key = (partId: string, pinId: string) => `${partId}:${pinId}`;

/* ------------------------------------------------------------------ */
/* Part models                                                         */
/* ------------------------------------------------------------------ */

type Model = { a: string; b: string; R: number; E: number; diode?: { vf: number; rOn: number } };

const LED_VF: Record<string, number> = {
  red: 1.8,
  yellow: 2.0,
  green: 2.1,
  blue: 3.0,
  white: 3.1,
};

export function modelsFor(part: PlacedPart): Model[] {
  const p = part.props;
  switch (part.type) {
    case "battery":
      return [{ a: "pos", b: "neg", R: 0.15, E: num(p['voltage'], 9) }];

    case "resistor":
      return [{ a: "a", b: "b", R: Math.max(0.1, num(p['resistance'], 220)), E: 0 }];

    case "led": {
      const vf = LED_VF[(p['color'] ?? "red").toLowerCase()] ?? 1.8;
      return [{ a: "anode", b: "cathode", R: R_OFF, E: 0, diode: { vf, rOn: 14 } }];
    }

    case "switch":
      return [{ a: "a", b: "b", R: (p['state'] ?? "open") === "closed" ? R_ON : R_OFF, E: 0 }];

    case "pushbutton": {
      const down = (p['pressed'] ?? "no") === "yes";
      return [
        { a: "a1", b: "a2", R: R_ON, E: 0 },
        { a: "b1", b: "b2", R: R_ON, E: 0 },
        { a: "a1", b: "b1", R: down ? R_ON : R_OFF, E: 0 },
      ];
    }

    case "buzzer":
      return [{ a: "pos", b: "neg", R: Math.max(1, num(p['resistance'], 120)), E: 0 }];

    case "motor":
      return [{ a: "t1", b: "t2", R: Math.max(0.5, num(p['resistance'], 8)), E: 0 }];

    case "rgbled": {
      return [
        { a: "r", b: "cathode", R: R_OFF, E: 0, diode: { vf: 1.8, rOn: 14 } },
        { a: "g", b: "cathode", R: R_OFF, E: 0, diode: { vf: 2.1, rOn: 14 } },
        { a: "b", b: "cathode", R: R_OFF, E: 0, diode: { vf: 3.0, rOn: 14 } },
      ];
    }

    case "sevenseg": {
      // pins 1-4 are segment anodes against pin 8 (common cathode) in this simplified model
      return [1, 2, 3, 4, 5, 6, 7].map((i) => ({
        a: `p${i}`,
        b: "p8",
        R: R_OFF,
        E: 0,
        diode: { vf: 1.9, rOn: 30 },
      }));
    }

    case "potentiometer": {
      const total = Math.max(1, num(p['resistance'], 10000));
      const pos = Math.min(100, Math.max(0, num(p['position'], 50))) / 100;
      return [
        { a: "t1", b: "wiper", R: Math.max(0.5, total * pos), E: 0 },
        { a: "wiper", b: "t2", R: Math.max(0.5, total * (1 - pos)), E: 0 },
      ];
    }

    case "photoresistor": {
      const light = Math.min(100, Math.max(0, num(p['light'], 50)));
      // dark ~1 MΩ, bright ~200 Ω
      const R = 200 + 1_000_000 * Math.pow(1 - light / 100, 2.2);
      return [{ a: "a", b: "b", R, E: 0 }];
    }

    case "tempsensor": {
      // TMP36-like: Vout = 0.5 V + 10 mV/°C, 1 kΩ output impedance
      const t = num(p['temp'], 25);
      const vout = 0.5 + 0.01 * t;
      return [
        { a: "vcc", b: "gnd", R: 50000, E: 0 },
        { a: "out", b: "gnd", R: 1000, E: vout },
      ];
    }

    case "arduino": {
      const out: Model[] = [];
      out.push({ a: "5V", b: "GND", R: 0.2, E: 5 });
      out.push({ a: "3V3", b: "GND", R: 0.2, E: 3.3 });
      out.push({ a: "VIN", b: "GND", R: R_OFF, E: 0 });
      for (let i = 0; i <= 13; i++) {
        const pin = `D${i}`;
        const mode = p[pin] ?? "IN";
        if (mode === "HIGH") out.push({ a: pin, b: "GND", R: 25, E: 5 });
        else if (mode === "LOW") out.push({ a: pin, b: "GND", R: 25, E: 0 });
        else out.push({ a: pin, b: "GND", R: R_OFF, E: 0 });
      }
      for (const pin of ["A0", "A1", "A2", "A3", "A4", "A5"]) {
        out.push({ a: pin, b: "GND", R: 1e8, E: 0 }); // high-impedance analog input
      }
      return out;
    }

    default:
      return [];
  }
}

/* ------------------------------------------------------------------ */
/* Linear solver (Gaussian elimination, partial pivoting)              */
/* ------------------------------------------------------------------ */

function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r]![col]!) > Math.abs(A[piv]![col]!)) piv = r;
    if (Math.abs(A[piv]![col]!) < 1e-18) return null;
    if (piv !== col) {
      [A[piv], A[col]] = [A[col]!, A[piv]!];
      [b[piv], b[col]] = [b[col]!, b[piv]!];
    }
    const pv = A[col]![col]!;
    for (let r = col + 1; r < n; r++) {
      const f = A[r]![col]! / pv;
      if (f === 0) continue;
      for (let c = col; c < n; c++) A[r]![c] = A[r]![c]! - f * A[col]![c]!;
      b[r] = b[r]! - f * b[col]!;
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r]!;
    for (let c = r + 1; c < n; c++) s -= A[r]![c]! * x[c]!;
    x[r] = s / A[r]![r]!;
  }
  return x.every((v) => Number.isFinite(v)) ? x : null;
}

/* ------------------------------------------------------------------ */
/* Simulation                                                          */
/* ------------------------------------------------------------------ */

export function simulate(design: Design): SimResult {
  const notes: string[] = [];
  const empty: SimResult = { ok: false, parts: {}, wires: {}, nodes: {}, notes };
  if (!design.parts.length) return empty;

  /* union-find over pins joined by wires */
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    let root = parent.get(x)!;
    if (root !== x) {
      root = find(root);
      parent.set(x, root);
    }
    return root;
  };
  const union = (x: string, y: string) => {
    const a = find(x);
    const b = find(y);
    if (a !== b) parent.set(a, b);
  };

  for (const part of design.parts) {
    const def = PART_MAP[part.type];
    if (!def) continue;
    for (const pin of def.pins) find(key(part.id, pin.id));
  }
  for (const w of design.wires) union(key(w.from.partId, w.from.pinId), key(w.to.partId, w.to.pinId));

  /* branches */
  const branches: Branch[] = [];
  for (const part of design.parts) {
    for (const m of modelsFor(part)) {
      branches.push({
        partId: part.id,
        pinA: m.a,
        pinB: m.b,
        a: find(key(part.id, m.a)),
        b: find(key(part.id, m.b)),
        R: m.R,
        E: m.E,
        ...(m.diode ? { diode: m.diode, on: false } : {}),
      });
    }
  }
  if (!branches.length) return empty;

  /* node numbering, ground = a GND/neg node when one exists */
  const nodeSet = new Set<string>();
  for (const br of branches) {
    nodeSet.add(br.a);
    nodeSet.add(br.b);
  }
  let ground: string | null = null;
  for (const part of design.parts) {
    const gndPin = part.type === "arduino" ? "GND" : part.type === "battery" ? "neg" : null;
    if (gndPin) {
      ground = find(key(part.id, gndPin));
      if (part.type === "arduino") break;
    }
  }
  if (!ground) ground = [...nodeSet][0]!;

  const nodes = [...nodeSet].filter((n) => n !== ground);
  const index = new Map(nodes.map((n, i) => [n, i] as const));
  const n = nodes.length;
  if (n === 0) return empty;

  let volts: number[] = new Array<number>(n).fill(0);

  const buildAndSolve = () => {
    const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    const b = new Array<number>(n).fill(0);
    for (let i = 0; i < n; i++) A[i]![i] = LEAK;
    for (const br of branches) {
      const R = br.diode ? (br.on ? br.diode.rOn : R_OFF) : br.R;
      const E = br.diode ? (br.on ? br.diode.vf : 0) : br.E;
      const G = 1 / R;
      const ia = index.get(br.a);
      const ib = index.get(br.b);
      if (ia !== undefined) {
        A[ia]![ia] = A[ia]![ia]! + G;
        b[ia] = b[ia]! + G * E;
        if (ib !== undefined) A[ia]![ib] = A[ia]![ib]! - G;
      }
      if (ib !== undefined) {
        A[ib]![ib] = A[ib]![ib]! + G;
        b[ib] = b[ib]! - G * E;
        if (ia !== undefined) A[ib]![ia] = A[ib]![ia]! - G;
      }
    }
    return solveLinear(A, b);
  };

  const v = (node: string) => (node === ground ? 0 : (volts[index.get(node)!] ?? 0));

  /* iterate diode states until they settle */
  let ok = false;
  for (let iter = 0; iter < 60; iter++) {
    const sol = buildAndSolve();
    if (!sol) break;
    volts = sol;
    ok = true;
    let changed = false;
    for (const br of branches) {
      if (!br.diode) continue;
      const vak = v(br.a) - v(br.b);
      const shouldBeOn = br.on ? vak > br.diode.vf * 0.85 : vak > br.diode.vf;
      if (shouldBeOn !== br.on) {
        br.on = shouldBeOn;
        changed = true;
      }
    }
    if (!changed) break;
  }
  if (!ok) {
    notes.push("Could not solve this circuit — check for shorted power rails.");
    return empty;
  }

  /* per-part results */
  const nodeVolts: Record<string, number> = {};
  for (const part of design.parts) {
    const def = PART_MAP[part.type];
    if (!def) continue;
    for (const pin of def.pins) nodeVolts[key(part.id, pin.id)] = v(find(key(part.id, pin.id)));
  }

  const parts: Record<string, PartSim> = {};
  for (const part of design.parts) {
    const def = PART_MAP[part.type];
    if (!def) continue;
    const sim: PartSim = {
      type: part.type,
      current: 0,
      voltage: 0,
      power: 0,
      pins: {},
      pinCurrents: {},
    };
    for (const pin of def.pins) {
      sim.pins[pin.id] = nodeVolts[key(part.id, pin.id)] ?? 0;
      sim.pinCurrents[pin.id] = 0;
    }
    let best = 0;
    for (const br of branches.filter((x) => x.partId === part.id)) {
      const R = br.diode ? (br.on ? br.diode.rOn : R_OFF) : br.R;
      const E = br.diode ? (br.on ? br.diode.vf : 0) : br.E;
      const vab = v(br.a) - v(br.b);
      const i = (vab - E) / R;
      sim.pinCurrents[br.pinA] = (sim.pinCurrents[br.pinA] ?? 0) + i;
      sim.pinCurrents[br.pinB] = (sim.pinCurrents[br.pinB] ?? 0) - i;
      if (Math.abs(i) > Math.abs(best)) {
        best = i;
        sim.voltage = vab;
      }
    }
    sim.current = best;
    sim.power = Math.abs(sim.current * sim.voltage);
    parts[part.id] = sim;
  }

  /* behaviour derived from the electrical solution */
  for (const part of design.parts) {
    const sim = parts[part.id];
    if (!sim) continue;
    const p = part.props;
    switch (part.type) {
      case "led":
        sim.brightness = clamp01(Math.abs(sim.current) / 0.02);
        break;
      case "rgbled": {
        const ir = Math.abs(sim.pinCurrents['r'] ?? 0);
        const ig = Math.abs(sim.pinCurrents['g'] ?? 0);
        const ib = Math.abs(sim.pinCurrents['b'] ?? 0);
        sim.brightness = clamp01(Math.max(ir, ig, ib) / 0.02);
        sim.reading = `R ${(ir * 1000).toFixed(1)} mA · G ${(ig * 1000).toFixed(1)} mA · B ${(ib * 1000).toFixed(1)} mA`;
        break;
      }
      case "sevenseg":
        sim.brightness = clamp01(Math.abs(sim.current) / 0.015);
        break;
      case "motor": {
        const nominal = num(p['voltage'], 9);
        sim.rpm = Math.round(clamp01(Math.abs(sim.voltage) / nominal) * num(p['rpm'], 6000));
        break;
      }
      case "buzzer":
        sim.sounding = Math.abs(sim.voltage) > 1.5;
        sim.reading = sim.sounding ? `${num(p['tone'], 2400)} Hz` : "silent";
        break;
      case "photoresistor": {
        const light = num(p['light'], 50);
        const R = 200 + 1_000_000 * Math.pow(1 - Math.min(100, Math.max(0, light)) / 100, 2.2);
        sim.reading = `${light.toFixed(0)}% light · ${fmtOhm(R)}`;
        break;
      }
      case "tempsensor": {
        const t = num(p['temp'], 25);
        sim.reading = `${t.toFixed(1)} °C · out ${(sim.pins['out'] ?? 0).toFixed(2)} V`;
        break;
      }
      case "potentiometer": {
        const pos = num(p['position'], 50);
        sim.reading = `${pos.toFixed(0)}% · wiper ${(sim.pins['wiper'] ?? 0).toFixed(2)} V`;
        break;
      }
      case "arduino": {
        sim.reading = ["A0", "A1", "A2", "A3", "A4", "A5"]
          .map((a) => `${a} ${Math.round((clamp(sim.pins[a] ?? 0, 0, 5) / 5) * 1023)}`)
          .join("  ");
        break;
      }
      default:
        break;
    }
    if (part.type === "led" && Math.abs(sim.current) > 0.04) {
      notes.push("LED current is over 40 mA — add a series resistor before it burns out.");
    }
    if (part.type === "battery" && Math.abs(sim.current) > 3) {
      notes.push("Battery is delivering over 3 A — that looks like a short circuit.");
    }
  }

  /* wire currents: use the pin current at an end that owns only this wire */
  const wireCountPerPin = new Map<string, number>();
  for (const w of design.wires) {
    for (const e of [w.from, w.to]) {
      const k = key(e.partId, e.pinId);
      wireCountPerPin.set(k, (wireCountPerPin.get(k) ?? 0) + 1);
    }
  }
  const wires: Record<string, number> = {};
  for (const w of design.wires) {
    let cur = 0;
    for (const e of [w.from, w.to]) {
      if ((wireCountPerPin.get(key(e.partId, e.pinId)) ?? 0) === 1) {
        const c = parts[e.partId]?.pinCurrents[e.pinId];
        if (c !== undefined && Math.abs(c) > Math.abs(cur)) cur = Math.abs(c);
      }
    }
    wires[w.id] = cur;
  }

  return { ok: true, parts, wires, nodes: nodeVolts, notes: [...new Set(notes)] };
}

/* ------------------------------------------------------------------ */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function fmtOhm(r: number) {
  if (r >= 1e6) return `${(r / 1e6).toFixed(2)} MΩ`;
  if (r >= 1e3) return `${(r / 1e3).toFixed(2)} kΩ`;
  return `${r.toFixed(0)} Ω`;
}

export function fmtAmp(i: number) {
  const a = Math.abs(i);
  if (a < 1e-6) return "0 A";
  if (a < 1e-3) return `${(a * 1e6).toFixed(0)} µA`;
  if (a < 1) return `${(a * 1e3).toFixed(2)} mA`;
  return `${a.toFixed(2)} A`;
}

export function fmtVolt(v: number) {
  return `${v.toFixed(2)} V`;
}
