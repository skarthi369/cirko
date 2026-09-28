import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PART_DEFS, PART_MAP, rotatePoint } from "@/lib/parts";
import { emptyDesign, WIRE_COLORS, type Design, type PlacedPart, type Wire, type WireEnd } from "./types";
import { simulate, fmtAmp, fmtVolt } from "@/lib/simulate";

/** Ready-made demo: 9 V battery → 220 Ω resistor → red LED → back to battery. */
function demoDesign(): Design {
  const battery: PlacedPart = { id: "demo-bat", type: "battery", x: 140, y: 200, rotation: 0, props: { voltage: "9" } };
  const resistor: PlacedPart = {
    id: "demo-res",
    type: "resistor",
    x: 360,
    y: 150,
    rotation: 0,
    props: { resistance: "220" },
  };
  const led: PlacedPart = { id: "demo-led", type: "led", x: 560, y: 220, rotation: 0, props: { color: "red" } };
  return {
    name: "Battery · resistor · LED",
    parts: [battery, resistor, led],
    wires: [
      { id: "demo-w1", from: { partId: "demo-bat", pinId: "pos" }, to: { partId: "demo-res", pinId: "a" }, color: "#ff5d5d" },
      { id: "demo-w2", from: { partId: "demo-res", pinId: "b" }, to: { partId: "demo-led", pinId: "anode" }, color: "#f5a524" },
      { id: "demo-w3", from: { partId: "demo-led", pinId: "cathode" }, to: { partId: "demo-bat", pinId: "neg" }, color: "#1f2933" },
    ],
  };
}

import { Link } from "@tanstack/react-router";
import type { SimResult } from "@/lib/simulate";

export type EditorProps = {
  storageKey?: string | null;
  initialDesign?: Design;
  onDesignChange?: (design: Design, sim: SimResult | null) => void;
  headerExtra?: React.ReactNode;
};

const DEFAULT_STORAGE_KEY = "cirkit.design.v1";
const GRID = 10;

const uid = () => Math.random().toString(36).slice(2, 10);
const snap = (v: number) => Math.round(v / GRID) * GRID;

function pinWorld(part: PlacedPart, pinId: string) {
  const def = PART_MAP[part.type];
  const pin = def?.pins.find((p) => p.id === pinId);
  if (!def || !pin) return null;
  const r = rotatePoint(pin.x, pin.y, def.w, def.h, part.rotation);
  return { x: part.x + r.x, y: part.y + r.y };
}

type Drag =
  | { kind: "part"; id: string; dx: number; dy: number; moved: boolean }
  | { kind: "pan"; sx: number; sy: number; ox: number; oy: number }
  | null;

export default function Editor({
  storageKey = DEFAULT_STORAGE_KEY,
  initialDesign,
  onDesignChange,
  headerExtra,
}: EditorProps = {}) {
  const [design, setDesign] = useState<Design>(initialDesign ?? emptyDesign);
  const [past, setPast] = useState<Design[]>([]);
  const [future, setFuture] = useState<Design[]>([]);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [selected, setSelected] = useState<{ kind: "part" | "wire"; id: string } | null>(null);
  const [pending, setPending] = useState<WireEnd | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [wireColor, setWireColor] = useState<string>(WIRE_COLORS[0]!);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);
  const [running, setRunning] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<Drag>(null);
  const loadedRef = useRef(false);
  const designRef = useRef<Design>(initialDesign ?? emptyDesign());

  /* ---------- persistence ---------- */
  useEffect(() => {
    if (!storageKey) {
      loadedRef.current = true;
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDesign(JSON.parse(raw) as Design);
    } catch {
      /* ignore corrupt saves */
    }
    loadedRef.current = true;
  }, [storageKey]);

  useEffect(() => {
    designRef.current = design;
    if (!loadedRef.current || !storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(design));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1200);
    return () => clearTimeout(t);
  }, [design, storageKey]);

  /* ---------- history ---------- */
  const commit = useCallback((updater: (d: Design) => Design) => {
    setDesign((prev) => {
      const next = updater(prev);
      if (next === prev) return prev;
      setPast((p) => [...p.slice(-49), prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1]!;
      setDesign((cur) => {
        setFuture((f) => [cur, ...f].slice(0, 50));
        return prev;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0]!;
      setDesign((cur) => {
        setPast((p) => [...p, cur]);
        return next;
      });
      return f.slice(1);
    });
  }, []);

  /* ---------- coords ---------- */
  const toWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - view.x) / view.scale,
        y: (clientY - rect.top - view.y) / view.scale,
      };
    },
    [view],
  );

  /* ---------- part ops ---------- */
  const addPart = useCallback(
    (type: string, at?: { x: number; y: number }) => {
      const def = PART_MAP[type];
      if (!def) return;
      const rect = svgRef.current?.getBoundingClientRect();
      const center = at ?? {
        x: (((rect?.width ?? 800) / 2) - view.x) / view.scale,
        y: (((rect?.height ?? 600) / 2) - view.y) / view.scale,
      };
      const d0 = designRef.current;
      const part: PlacedPart = {
        id: uid(),
        type,
        x: snap(center.x - def.w / 2 + (at ? 0 : (d0.parts.length % 5) * 40)),
        y: snap(center.y - def.h / 2 + (at ? 0 : Math.floor(d0.parts.length / 5) * 40)),
        rotation: 0,
        props: { ...(def.defaults ?? {}) },
      };
      commit((d) => ({ ...d, parts: [...d.parts, part] }));
      setSelected({ kind: "part", id: part.id });
    },
    [commit, view],
  );

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    commit((d) =>
      selected.kind === "part"
        ? {
            ...d,
            parts: d.parts.filter((p) => p.id !== selected.id),
            wires: d.wires.filter((w) => w.from.partId !== selected.id && w.to.partId !== selected.id),
          }
        : { ...d, wires: d.wires.filter((w) => w.id !== selected.id) },
    );
    setSelected(null);
  }, [commit, selected]);

  const rotateSelected = useCallback(() => {
    if (selected?.kind !== "part") return;
    commit((d) => ({
      ...d,
      parts: d.parts.map((p) => (p.id === selected.id ? { ...p, rotation: (p.rotation + 90) % 360 } : p)),
    }));
  }, [commit, selected]);

  const duplicateSelected = useCallback(() => {
    if (selected?.kind !== "part") return;
    const src = design.parts.find((p) => p.id === selected.id);
    if (!src) return;
    const copy = { ...src, id: uid(), x: src.x + 20, y: src.y + 20, props: { ...src.props } };
    commit((d) => ({ ...d, parts: [...d.parts, copy] }));
    setSelected({ kind: "part", id: copy.id });
  }, [commit, design.parts, selected]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      } else if (e.key.toLowerCase() === "r") {
        rotateSelected();
      } else if (e.key === "Escape") {
        setPending(null);
        setSelected(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected, duplicateSelected, redo, rotateSelected, undo]);

  /* ---------- pointer ---------- */
  const onPointerMove = (e: React.PointerEvent) => {
    const w = toWorld(e.clientX, e.clientY);
    setCursor(w);
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === "pan") {
      setView((v) => ({ ...v, x: drag.ox + (e.clientX - drag.sx), y: drag.oy + (e.clientY - drag.sy) }));
    } else {
      drag.moved = true;
      setDesign((d) => ({
        ...d,
        parts: d.parts.map((p) => (p.id === drag.id ? { ...p, x: snap(w.x - drag.dx), y: snap(w.y - drag.dy) } : p)),
      }));
    }
  };

  const endDrag = () => {
    const drag = dragRef.current;
    if (drag?.kind === "part" && drag.moved) {
      setPast((p) => [...p.slice(-49), design]);
      setFuture([]);
    }
    dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setView((v) => {
      const scale = Math.min(3, Math.max(0.25, v.scale * factor));
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const k = scale / v.scale;
      return { scale, x: mx - (mx - v.x) * k, y: my - (my - v.y) * k };
    });
  };

  const clickPin = (partId: string, pinId: string) => {
    if (!pending) {
      setPending({ partId, pinId });
      return;
    }
    if (pending.partId === partId && pending.pinId === pinId) {
      setPending(null);
      return;
    }
    const wire: Wire = { id: uid(), from: pending, to: { partId, pinId }, color: wireColor };
    commit((d) => ({ ...d, wires: [...d.wires, wire] }));
    setPending(null);
    setSelected({ kind: "wire", id: wire.id });
  };

  /* ---------- derived ---------- */
  const selectedPart = selected?.kind === "part" ? design.parts.find((p) => p.id === selected.id) : undefined;
  const selectedDef = selectedPart ? PART_MAP[selectedPart.type] : undefined;
  const partById = useMemo(() => Object.fromEntries(design.parts.map((p) => [p.id, p])), [design.parts]);
  const sim = useMemo(() => (running ? simulate(design) : null), [running, design]);
  const selectedSim = selectedPart ? sim?.parts[selectedPart.id] : undefined;

  useEffect(() => {
    onDesignChange?.(design, sim);
  }, [design, sim, onDesignChange]);

  const setProp = useCallback(
    (partId: string, key: string, value: string) =>
      commit((d) => ({
        ...d,
        parts: d.parts.map((p) => (p.id === partId ? { ...p, props: { ...p.props, [key]: value } } : p)),
      })),
    [commit],
  );

  const wirePath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = Math.max(30, Math.abs(b.x - a.x) * 0.45);
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${design.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    file.text().then((t) => {
      try {
        const parsed = JSON.parse(t) as Design;
        if (Array.isArray(parsed.parts) && Array.isArray(parsed.wires)) {
          commit(() => ({ name: parsed.name ?? "Imported circuit", parts: parsed.parts, wires: parsed.wires }));
        }
      } catch {
        /* ignore bad file */
      }
    });
  };

  const categories = ["Basics", "Outputs", "Inputs", "Boards"] as const;
  const filtered = PART_DEFS.filter((d) => d.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      {/* Toolbar */}
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-sidebar px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded bg-primary font-mono text-sm font-bold text-primary-foreground">
            C
          </span>
          <h1 className="font-mono text-sm font-semibold tracking-tight">CirkitLab</h1>
          <Link
            to={"/labs" as any}
            className="ml-1 inline-flex items-center rounded border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            🧪 Labs
          </Link>
        </div>
        {headerExtra}
        <input
          value={design.name}
          onChange={(e) => setDesign((d) => ({ ...d, name: e.target.value }))}
          className="w-52 rounded border border-border bg-input px-2 py-1 text-sm outline-none focus:border-primary"
          aria-label="Circuit name"
        />
        <div className="flex items-center gap-1">
          <ToolButton onClick={undo} disabled={!past.length}>Undo</ToolButton>
          <ToolButton onClick={redo} disabled={!future.length}>Redo</ToolButton>
          <ToolButton onClick={rotateSelected} disabled={selected?.kind !== "part"}>Rotate</ToolButton>
          <ToolButton onClick={duplicateSelected} disabled={selected?.kind !== "part"}>Duplicate</ToolButton>
          <ToolButton onClick={deleteSelected} disabled={!selected}>Delete</ToolButton>
        </div>
        <div className="flex items-center gap-1">
          <ToolButton onClick={exportJson}>Export</ToolButton>
          <label className="cursor-pointer rounded border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:bg-muted">
            Import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
            />
          </label>
          <ToolButton
            onClick={() => {
              commit(() => emptyDesign());
              setSelected(null);
            }}
          >
            Clear
          </ToolButton>
          <ToolButton
            onClick={() => {
              commit(() => demoDesign());
              setSelected(null);
              setRunning(true);
            }}
          >
            Demo circuit
          </ToolButton>
        </div>
        <button
          onClick={() => setRunning((r) => !r)}
          data-testid="run-toggle"
          className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
            running ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {running ? "Stop simulation" : "Start simulation"}
        </button>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>{Math.round(view.scale * 100)}%</span>
          <ToolButton onClick={() => setView({ x: 0, y: 0, scale: 1 })}>Reset view</ToolButton>
          <span className={saved ? "text-primary" : ""}>{saved ? "Saved" : "Autosave on"}</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Palette */}
        <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
          <div className="p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search parts…"
              className="w-full rounded border border-border bg-input px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
            {categories.map((cat) => {
              const items = filtered.filter((d) => d.category === cat);
              if (!items.length) return null;
              return (
                <section key={cat} className="mb-5">
                  <h2 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{cat}</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((def) => (
                      <button
                        key={def.type}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/part", def.type)}
                        onClick={() => addPart(def.type)}
                        className="group flex h-20 cursor-grab flex-col items-center justify-center gap-1 rounded-md border border-border bg-card p-1 transition-colors hover:border-primary"
                        title={`Add ${def.name}`}
                      >
                        <svg viewBox={`-4 -4 ${def.w + 8} ${def.h + 8}`} className="h-9 w-full">
                          {def.render(def.defaults ?? {})}
                        </svg>
                        <span className="text-[10px] leading-tight text-muted-foreground group-hover:text-foreground">
                          {def.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </aside>

        {/* Canvas */}
        <main className="relative min-w-0 flex-1 bg-canvas">
          <svg
            ref={svgRef}
            className="h-full w-full touch-none"
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onWheel={onWheel}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const type = e.dataTransfer.getData("text/part");
              if (type) addPart(type, toWorld(e.clientX, e.clientY));
            }}
            onPointerDown={(e) => {
              if (e.target === svgRef.current || (e.target as Element).classList.contains("canvas-bg")) {
                setSelected(null);
                setPending(null);
                dragRef.current = { kind: "pan", sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
              }
            }}
          >
            <defs>
              <pattern id="grid" width={GRID * 2} height={GRID * 2} patternUnits="userSpaceOnUse">
                <circle cx={1} cy={1} r={1} fill="var(--canvas-grid)" />
              </pattern>
              <linearGradient id="rgbgrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff5d5d" />
                <stop offset="50%" stopColor="#8bd450" />
                <stop offset="100%" stopColor="#6aa9ff" />
              </linearGradient>
            </defs>
            <rect className="canvas-bg" width="100%" height="100%" fill="url(#grid)" />

            <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
              {/* wires */}
              {design.wires.map((w) => {
                const a = partById[w.from.partId] && pinWorld(partById[w.from.partId]!, w.from.pinId);
                const b = partById[w.to.partId] && pinWorld(partById[w.to.partId]!, w.to.pinId);
                if (!a || !b) return null;
                const isSel = selected?.kind === "wire" && selected.id === w.id;
                return (
                  <g key={w.id} onPointerDown={(e) => { e.stopPropagation(); setSelected({ kind: "wire", id: w.id }); }}>
                    <path d={wirePath(a, b)} fill="none" stroke="transparent" strokeWidth={14} className="cursor-pointer" />
                    <path
                      d={wirePath(a, b)}
                      fill="none"
                      stroke={w.color}
                      strokeWidth={isSel ? 5 : 3}
                      strokeLinecap="round"
                      opacity={isSel ? 1 : 0.92}
                    />
                    {sim?.ok && (
                      <text
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 - 8}
                        textAnchor="middle"
                        fontSize={10}
                        fill="var(--accent)"
                        className="pointer-events-none font-mono"
                      >
                        {fmtAmp(sim.wires[w.id] ?? 0)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* pending wire */}
              {pending &&
                partById[pending.partId] &&
                (() => {
                  const a = pinWorld(partById[pending.partId]!, pending.pinId);
                  if (!a) return null;
                  return (
                    <path
                      d={wirePath(a, cursor)}
                      fill="none"
                      stroke={wireColor}
                      strokeWidth={2.5}
                      strokeDasharray="6 5"
                      opacity={0.8}
                    />
                  );
                })()}

              {/* parts */}
              {design.parts.map((part) => {
                const def = PART_MAP[part.type];
                if (!def) return null;
                 const isSel = selected?.kind === "part" && selected.id === part.id;
                 const ps = sim?.parts[part.id];
                 return (
                  <g
                    key={part.id}
                    transform={`translate(${part.x} ${part.y})`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const w = toWorld(e.clientX, e.clientY);
                      setSelected({ kind: "part", id: part.id });
                      dragRef.current = { kind: "part", id: part.id, dx: w.x - part.x, dy: w.y - part.y, moved: false };
                      (e.target as Element).setPointerCapture?.(e.pointerId);
                    }}
                    className="cursor-move"
                  >
                    <g transform={`rotate(${part.rotation} ${def.w / 2} ${def.h / 2})`}>
                      {isSel && (
                        <rect
                          x={-6}
                          y={-6}
                          width={def.w + 12}
                          height={def.h + 12}
                          rx={8}
                          fill="none"
                          stroke="var(--primary)"
                          strokeDasharray="5 4"
                          strokeWidth={1.5}
                        />
                      )}
                      {def.render(
                        part.props,
                        ps
                          ? {
                              live: true,
                              ...(ps.brightness !== undefined ? { brightness: ps.brightness } : {}),
                              ...(ps.rpm !== undefined ? { rpm: ps.rpm } : {}),
                              ...(ps.sounding !== undefined ? { sounding: ps.sounding } : {}),
                              current: ps.current,
                              voltage: ps.voltage,
                              pins: ps.pins,
                            }
                          : undefined,
                      )}
                    </g>
                    {ps && (
                      <text
                        x={def.w / 2}
                        y={-10}
                        textAnchor="middle"
                        fontSize={10}
                        fill="var(--primary)"
                        className="pointer-events-none font-mono"
                        data-testid={`readout-${part.type}`}
                      >
                        {`${fmtVolt(Math.abs(ps.voltage))} · ${fmtAmp(ps.current)}`}
                      </text>
                    )}
                    {def.pins.map((pin) => {
                      const r = rotatePoint(pin.x, pin.y, def.w, def.h, part.rotation);
                      const active = pending?.partId === part.id && pending.pinId === pin.id;
                      return (
                        <g
                          key={pin.id}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            clickPin(part.id, pin.id);
                          }}
                          className="cursor-crosshair"
                        >
                          <circle cx={r.x} cy={r.y} r={7} fill="transparent" />
                          <circle
                            cx={r.x}
                            cy={r.y}
                            r={active ? 5 : 3.5}
                            fill={active ? "var(--wire)" : "var(--pin)"}
                            stroke="var(--canvas)"
                            strokeWidth={1}
                          />
                          {ps && (
                            <text
                              x={r.x}
                              y={r.y + 16}
                              textAnchor="middle"
                              fontSize={9}
                              fill="var(--muted-foreground)"
                              className="pointer-events-none font-mono"
                            >
                              {fmtVolt(ps.pins[pin.id] ?? 0)}
                            </text>
                          )}
                          <title>{`${def.name} · ${pin.label}`}</title>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-card/85 px-3 py-2 font-mono text-[11px] text-muted-foreground">
            Drag parts in · click two pins to wire · R rotate · Del remove · scroll to zoom · drag empty space to pan
          </div>

          {sim && sim.notes.length > 0 && (
            <div className="absolute right-3 top-3 max-w-xs space-y-1" data-testid="sim-notes">
              {sim.notes.map((n) => (
                <p key={n} className="rounded border border-accent/50 bg-card/95 px-3 py-2 text-[11px] text-accent">
                  {n}
                </p>
              ))}
            </div>
          )}
          {running && !sim?.ok && (
            <p className="absolute right-3 top-3 rounded border border-border bg-card/95 px-3 py-2 text-[11px] text-muted-foreground">
              Nothing is flowing yet — complete a loop from + back to −.
            </p>
          )}
        </main>

        {/* Inspector */}
        <aside className="w-64 shrink-0 overflow-y-auto border-l border-border bg-sidebar p-4">
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Inspector</h2>

          <div className="mb-5">
            <p className="mb-2 text-xs text-muted-foreground">Wire color</p>
            <div className="flex flex-wrap gap-2">
              {WIRE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setWireColor(c);
                    if (selected?.kind === "wire") {
                      commit((d) => ({
                        ...d,
                        wires: d.wires.map((w) => (w.id === selected.id ? { ...w, color: c } : w)),
                      }));
                    }
                  }}
                  aria-label={`Wire color ${c}`}
                  className={`size-6 rounded-full border-2 ${wireColor === c ? "border-primary" : "border-border"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {selectedPart && selectedDef ? (
            <div className="space-y-3">
              <div>
                <p className="font-mono text-sm">{selectedDef.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedDef.pins.length} pins · {selectedPart.rotation}°
                </p>
              </div>
              {selectedSim && (
                <div
                  className="rounded border border-primary/40 bg-card p-2 font-mono text-[11px] text-primary"
                  data-testid="live-readings"
                >
                  <p className="mb-1 uppercase tracking-wider text-muted-foreground">Live readings</p>
                  <p>Voltage {fmtVolt(Math.abs(selectedSim.voltage))}</p>
                  <p>Current {fmtAmp(selectedSim.current)}</p>
                  <p>Power {(Math.abs(selectedSim.power) * 1000).toFixed(1)} mW</p>
                  {selectedSim.brightness !== undefined && (
                    <p>Brightness {(selectedSim.brightness * 100).toFixed(0)}%</p>
                  )}
                  {selectedSim.rpm !== undefined && <p>Speed {selectedSim.rpm} rpm</p>}
                  {selectedSim.reading && <p>{selectedSim.reading}</p>}
                </div>
              )}
              {(selectedDef.fields ?? []).map((f) =>
                f.kind === "slider" ? (
                  <label key={f.key} className="block text-xs">
                    <span className="mb-1 block text-muted-foreground">
                      {f.label} {f.unit ? `(${f.unit})` : ""} · {selectedPart.props[f.key] ?? ""}
                    </span>
                    <input
                      type="range"
                      min={f.min ?? 0}
                      max={f.max ?? 100}
                      value={Number(selectedPart.props[f.key] ?? f.min ?? 0)}
                      onChange={(e) => setProp(selectedPart.id, f.key, e.target.value)}
                      className="w-full accent-primary"
                    />
                  </label>
                ) : (
                  <label key={f.key} className="block text-xs">
                    <span className="mb-1 block text-muted-foreground">
                      {f.label} {f.unit ? `(${f.unit})` : ""}
                    </span>
                    <input
                      value={selectedPart.props[f.key] ?? ""}
                      onChange={(e) => setProp(selectedPart.id, f.key, e.target.value)}
                      className="w-full rounded border border-border bg-input px-2 py-1 text-sm outline-none focus:border-primary"
                    />
                  </label>
                ),
              )}
              {selectedPart.type === "pushbutton" && (
                <button
                  onMouseDown={() => setProp(selectedPart.id, "pressed", "yes")}
                  onMouseUp={() => setProp(selectedPart.id, "pressed", "no")}
                  onMouseLeave={() => setProp(selectedPart.id, "pressed", "no")}
                  className="w-full rounded border border-border bg-secondary px-2 py-1.5 text-xs hover:bg-muted"
                >
                  Hold to press
                </button>
              )}
              {selectedPart.type === "switch" && (
                <button
                  onClick={() =>
                    commit((d) => ({
                      ...d,
                      parts: d.parts.map((p) =>
                        p.id === selectedPart.id
                          ? { ...p, props: { ...p.props, state: p.props['state'] === "closed" ? "open" : "closed" } }
                          : p,
                      ),
                    }))
                  }
                  className="w-full rounded border border-border bg-secondary px-2 py-1.5 text-xs hover:bg-muted"
                >
                  Toggle switch
                </button>
              )}
              <div className="rounded border border-border bg-card p-2 text-[11px] text-muted-foreground">
                <p className="mb-1 font-mono uppercase tracking-wider">Connections</p>
                {design.wires.filter((w) => w.from.partId === selectedPart.id || w.to.partId === selectedPart.id)
                  .length === 0 ? (
                  <p>No wires yet.</p>
                ) : (
                  design.wires
                    .filter((w) => w.from.partId === selectedPart.id || w.to.partId === selectedPart.id)
                    .map((w) => {
                      const other = w.from.partId === selectedPart.id ? w.to : w.from;
                      const mine = w.from.partId === selectedPart.id ? w.from : w.to;
                      const otherPart = partById[other.partId];
                      return (
                        <p key={w.id} className="font-mono">
                          {mine.pinId} → {otherPart ? PART_MAP[otherPart.type]?.name : "?"}.{other.pinId}
                        </p>
                      );
                    })
                )}
              </div>
            </div>
          ) : selected?.kind === "wire" ? (
            <p className="text-xs text-muted-foreground">Wire selected. Pick a color above or press Delete.</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select a part on the canvas to edit its values, or drag a new one in from the left.
            </p>
          )}

          <div className="mt-6 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <p>{design.parts.length} parts</p>
            <p>{design.wires.length} wires</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:bg-muted disabled:opacity-40"
    >
      {children}
    </button>
  );
}
