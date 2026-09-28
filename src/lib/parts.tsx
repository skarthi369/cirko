import type { ReactNode } from "react";

export type Pin = { id: string; x: number; y: number; label: string };

/** Live simulation state handed to a part's renderer. */
export type PartVisual = {
  live?: boolean;
  brightness?: number;
  rpm?: number;
  sounding?: boolean;
  current?: number;
  voltage?: number;
  pins?: Record<string, number>;
};

export type PartDef = {
  type: string;
  name: string;
  category: "Basics" | "Outputs" | "Inputs" | "Boards";
  w: number;
  h: number;
  pins: Pin[];
  defaults?: Record<string, string>;
  fields?: {
    key: string;
    label: string;
    unit?: string;
    kind?: "number" | "text" | "slider";
    min?: number;
    max?: number;
  }[];
  render: (props: Record<string, string>, sim?: PartVisual) => ReactNode;
};

const stroke = "var(--part-line)";
const body = "var(--part-body)";

function box(w: number, h: number, r = 6) {
  return <rect width={w} height={h} rx={r} fill={body} stroke={stroke} strokeWidth={1.5} />;
}

function label(text: string, w: number, y: number, size = 10) {
  return (
    <text
      x={w / 2}
      y={y}
      textAnchor="middle"
      fontSize={size}
      fill="var(--part-text)"
      fontFamily="var(--font-mono)"
    >
      {text}
    </text>
  );
}

const LED_COLORS: Record<string, string> = {
  red: "#ff4d4d",
  green: "#3ddc84",
  blue: "#4d9dff",
  yellow: "#ffd24d",
  white: "#f5f5f5",
};

export const PART_DEFS: PartDef[] = [
  {
    type: "battery",
    name: "Battery",
    category: "Basics",
    w: 80,
    h: 48,
    pins: [
      { id: "pos", x: 0, y: 16, label: "+" },
      { id: "neg", x: 0, y: 36, label: "-" },
    ],
    defaults: { voltage: "9" },
    fields: [{ key: "voltage", label: "Voltage", unit: "V" }],
    render: (p) => (
      <>
        {box(80, 48)}
        <rect
          x={14}
          y={10}
          width={52}
          height={28}
          rx={3}
          fill="var(--part-accent)"
          opacity={0.15}
        />
        {label(`${p["voltage"] ?? "9"}V`, 80, 30, 13)}
      </>
    ),
  },
  {
    type: "resistor",
    name: "Resistor",
    category: "Basics",
    w: 80,
    h: 28,
    pins: [
      { id: "a", x: 0, y: 14, label: "1" },
      { id: "b", x: 80, y: 14, label: "2" },
    ],
    defaults: { resistance: "220" },
    fields: [{ key: "resistance", label: "Resistance", unit: "Ω" }],
    render: (p) => (
      <>
        <line x1={0} y1={14} x2={16} y2={14} stroke={stroke} strokeWidth={2} />
        <line x1={64} y1={14} x2={80} y2={14} stroke={stroke} strokeWidth={2} />
        <rect
          x={16}
          y={4}
          width={48}
          height={20}
          rx={4}
          fill="var(--part-body)"
          stroke={stroke}
          strokeWidth={1.5}
        />
        <rect x={24} y={4} width={4} height={20} fill="#8b5a2b" />
        <rect x={34} y={4} width={4} height={20} fill="#c0392b" />
        <rect x={44} y={4} width={4} height={20} fill="#e0b400" />
        <text
          x={40}
          y={40}
          textAnchor="middle"
          fontSize={10}
          fill="var(--part-text)"
          fontFamily="var(--font-mono)"
        >
          {p["resistance"] ?? "220"}Ω
        </text>
      </>
    ),
  },
  {
    type: "led",
    name: "LED",
    category: "Basics",
    w: 48,
    h: 56,
    pins: [
      { id: "anode", x: 14, y: 56, label: "A" },
      { id: "cathode", x: 34, y: 56, label: "K" },
    ],
    defaults: { color: "red" },
    fields: [{ key: "color", label: "Color" }],
    render: (p, sim) => {
      const c = LED_COLORS[(p["color"] ?? "red").toLowerCase()] ?? "#ff4d4d";
      const b = sim?.live ? (sim.brightness ?? 0) : 0;
      return (
        <>
          {b > 0.02 && <circle cx={24} cy={22} r={16 + 18 * b} fill={c} opacity={0.18 + 0.3 * b} />}
          <circle
            cx={24}
            cy={22}
            r={16}
            fill={c}
            opacity={sim?.live ? 0.25 + 0.75 * b : 0.85}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <line x1={14} y1={34} x2={14} y2={56} stroke={stroke} strokeWidth={2} />
          <line x1={34} y1={34} x2={34} y2={56} stroke={stroke} strokeWidth={2} />
        </>
      );
    },
  },
  {
    type: "switch",
    name: "Slide Switch",
    category: "Basics",
    w: 72,
    h: 40,
    pins: [
      { id: "a", x: 0, y: 20, label: "1" },
      { id: "b", x: 72, y: 20, label: "2" },
    ],
    defaults: { state: "open" },
    fields: [{ key: "state", label: "State" }],
    render: (p) => (
      <>
        {box(72, 40)}
        <circle cx={16} cy={20} r={3} fill={stroke} />
        <circle cx={56} cy={20} r={3} fill={stroke} />
        <line
          x1={16}
          y1={20}
          x2={56}
          y2={(p["state"] ?? "open") === "closed" ? 20 : 8}
          stroke="var(--part-accent)"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    type: "pushbutton",
    name: "Pushbutton",
    category: "Basics",
    w: 56,
    h: 56,
    pins: [
      { id: "a1", x: 0, y: 14, label: "1a" },
      { id: "a2", x: 0, y: 42, label: "1b" },
      { id: "b1", x: 56, y: 14, label: "2a" },
      { id: "b2", x: 56, y: 42, label: "2b" },
    ],
    defaults: { pressed: "no" },
    fields: [{ key: "pressed", label: "Pressed (yes/no)" }],
    render: (p) => {
      const down = (p["pressed"] ?? "no") === "yes";
      return (
        <>
          {box(56, 56, 5)}
          <circle
            cx={28}
            cy={28}
            r={down ? 10 : 13}
            fill="var(--part-accent)"
            opacity={down ? 1 : 0.8}
            stroke={stroke}
            strokeWidth={1.5}
          />
        </>
      );
    },
  },
  {
    type: "buzzer",
    name: "Buzzer",
    category: "Outputs",
    w: 56,
    h: 56,
    pins: [
      { id: "pos", x: 18, y: 56, label: "+" },
      { id: "neg", x: 38, y: 56, label: "-" },
    ],
    defaults: { tone: "2400", resistance: "120" },
    fields: [
      { key: "tone", label: "Tone", unit: "Hz" },
      { key: "resistance", label: "Coil resistance", unit: "Ω" },
    ],
    render: (_p, sim) => (
      <>
        <circle cx={28} cy={26} r={22} fill={body} stroke={stroke} strokeWidth={1.5} />
        <circle cx={28} cy={26} r={4} fill={stroke} />
        {sim?.live && sim.sounding && (
          <>
            <circle
              cx={28}
              cy={26}
              r={26}
              fill="none"
              stroke="var(--part-accent)"
              strokeWidth={2}
              opacity={0.7}
            >
              <animate attributeName="r" values="24;34" dur="0.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur="0.7s" repeatCount="indefinite" />
            </circle>
          </>
        )}
        <line x1={18} y1={48} x2={18} y2={56} stroke={stroke} strokeWidth={2} />
        <line x1={38} y1={48} x2={38} y2={56} stroke={stroke} strokeWidth={2} />
      </>
    ),
  },
  {
    type: "motor",
    name: "DC Motor",
    category: "Outputs",
    w: 80,
    h: 56,
    pins: [
      { id: "t1", x: 0, y: 18, label: "1" },
      { id: "t2", x: 0, y: 38, label: "2" },
    ],
    defaults: { voltage: "9", rpm: "6000", resistance: "8" },
    fields: [
      { key: "voltage", label: "Rated voltage", unit: "V" },
      { key: "rpm", label: "Rated speed", unit: "rpm" },
      { key: "resistance", label: "Winding", unit: "Ω" },
    ],
    render: (_p, sim) => {
      const rpm = sim?.live ? (sim.rpm ?? 0) : 0;
      const dur = rpm > 1 ? Math.max(0.08, 60 / rpm) : 0;
      return (
        <>
          {box(80, 56, 10)}
          <circle cx={48} cy={28} r={16} fill="none" stroke={stroke} strokeWidth={1.5} />
          <g>
            <line
              x1={48}
              y1={28}
              x2={48}
              y2={14}
              stroke="var(--part-accent)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <line
              x1={48}
              y1={28}
              x2={60}
              y2={35}
              stroke="var(--part-accent)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <line
              x1={48}
              y1={28}
              x2={36}
              y2={35}
              stroke="var(--part-accent)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            {dur > 0 && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 48 28"
                to="360 48 28"
                dur={`${dur}s`}
                repeatCount="indefinite"
              />
            )}
          </g>
          <text x={18} y={34} fontSize={16} fill="var(--part-text)" fontFamily="var(--font-mono)">
            M
          </text>
        </>
      );
    },
  },
  {
    type: "rgbled",
    name: "RGB LED",
    category: "Outputs",
    w: 64,
    h: 64,
    pins: [
      { id: "r", x: 10, y: 64, label: "R" },
      { id: "cathode", x: 26, y: 64, label: "K" },
      { id: "g", x: 42, y: 64, label: "G" },
      { id: "b", x: 58, y: 64, label: "B" },
    ],
    render: (_p, sim) => {
      const b = sim?.live ? (sim.brightness ?? 0) : 0;
      return (
        <>
          {b > 0.02 && (
            <circle cx={32} cy={24} r={18 + 16 * b} fill="url(#rgbgrad)" opacity={0.25 * b + 0.1} />
          )}
          <circle
            cx={32}
            cy={24}
            r={18}
            fill="url(#rgbgrad)"
            opacity={sim?.live ? 0.3 + 0.7 * b : 1}
            stroke={stroke}
            strokeWidth={1.5}
          />
          {[10, 26, 42, 58].map((x) => (
            <line key={x} x1={x} y1={38} x2={x} y2={64} stroke={stroke} strokeWidth={2} />
          ))}
        </>
      );
    },
  },
  {
    type: "sevenseg",
    name: "7-Segment",
    category: "Outputs",
    w: 72,
    h: 96,
    pins: Array.from({ length: 8 }, (_, i) => ({
      id: `p${i + 1}`,
      x: i < 4 ? 0 : 72,
      y: 20 + (i % 4) * 20,
      label: `${i + 1}`,
    })),
    render: (_p, sim) => {
      const b = sim?.live ? (sim.brightness ?? 0) : 1;
      return (
        <>
          {box(72, 96, 5)}
          <text
            x={36}
            y={64}
            textAnchor="middle"
            fontSize={44}
            fill="var(--part-accent)"
            opacity={sim?.live ? 0.15 + 0.85 * b : 1}
            fontFamily="var(--font-mono)"
          >
            8
          </text>
        </>
      );
    },
  },
  {
    type: "potentiometer",
    name: "Potentiometer",
    category: "Inputs",
    w: 72,
    h: 64,
    pins: [
      { id: "t1", x: 12, y: 64, label: "1" },
      { id: "wiper", x: 36, y: 64, label: "W" },
      { id: "t2", x: 60, y: 64, label: "2" },
    ],
    defaults: { resistance: "10000", position: "50" },
    fields: [
      { key: "resistance", label: "Max resistance", unit: "Ω" },
      { key: "position", label: "Knob position", unit: "%", kind: "slider", min: 0, max: 100 },
    ],
    render: (p) => {
      const pos = Math.min(100, Math.max(0, parseFloat(p["position"] ?? "50") || 0));
      const angle = -135 + (pos / 100) * 270;
      return (
        <>
          <circle cx={36} cy={28} r={24} fill={body} stroke={stroke} strokeWidth={1.5} />
          <g transform={`rotate(${angle} 36 28)`}>
            <line
              x1={36}
              y1={28}
              x2={36}
              y2={8}
              stroke="var(--part-accent)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
          {[12, 36, 60].map((x) => (
            <line key={x} x1={x} y1={50} x2={x} y2={64} stroke={stroke} strokeWidth={2} />
          ))}
        </>
      );
    },
  },
  {
    type: "photoresistor",
    name: "Photoresistor",
    category: "Inputs",
    w: 56,
    h: 60,
    pins: [
      { id: "a", x: 16, y: 60, label: "1" },
      { id: "b", x: 40, y: 60, label: "2" },
    ],
    defaults: { light: "50" },
    fields: [{ key: "light", label: "Light level", unit: "%", kind: "slider", min: 0, max: 100 }],
    render: (p) => {
      const light = Math.min(100, Math.max(0, parseFloat(p["light"] ?? "50") || 0)) / 100;
      return (
        <>
          <circle
            cx={28}
            cy={24}
            r={18}
            fill="#d9c27a"
            opacity={0.35 + 0.65 * light}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <path d="M14 24 l7 -8 l7 16 l7 -16 l7 8" fill="none" stroke="#5c4a1a" strokeWidth={2} />
          <line x1={16} y1={40} x2={16} y2={60} stroke={stroke} strokeWidth={2} />
          <line x1={40} y1={40} x2={40} y2={60} stroke={stroke} strokeWidth={2} />
        </>
      );
    },
  },
  {
    type: "tempsensor",
    name: "Temp Sensor",
    category: "Inputs",
    w: 56,
    h: 60,
    pins: [
      { id: "vcc", x: 12, y: 60, label: "V" },
      { id: "out", x: 28, y: 60, label: "O" },
      { id: "gnd", x: 44, y: 60, label: "G" },
    ],
    defaults: { temp: "25" },
    fields: [{ key: "temp", label: "Temperature", unit: "°C", kind: "slider", min: -40, max: 125 }],
    render: (p) => (
      <>
        <path
          d="M6 26 A22 22 0 0 1 50 26 L50 40 L6 40 Z"
          fill={body}
          stroke={stroke}
          strokeWidth={1.5}
        />
        <text
          x={28}
          y={22}
          textAnchor="middle"
          fontSize={11}
          fill="var(--part-text)"
          fontFamily="var(--font-mono)"
        >
          {`${p["temp"] ?? "25"}°`}
        </text>
        {[12, 28, 44].map((x) => (
          <line key={x} x1={x} y1={40} x2={x} y2={60} stroke={stroke} strokeWidth={2} />
        ))}
      </>
    ),
  },
  {
    type: "arduino",
    name: "Arduino Uno",
    category: "Boards",
    w: 280,
    h: 190,
    pins: [
      ...[
        "D13",
        "D12",
        "D11",
        "D10",
        "D9",
        "D8",
        "D7",
        "D6",
        "D5",
        "D4",
        "D3",
        "D2",
        "D1",
        "D0",
      ].map((l, i) => ({ id: l, x: 268 - i * 18, y: 0, label: l })),
      ...["GND", "5V", "3V3", "VIN"].map((l, i) => ({ id: l, x: 60 + i * 24, y: 190, label: l })),
      ...["A0", "A1", "A2", "A3", "A4", "A5"].map((l, i) => ({
        id: l,
        x: 168 + i * 18,
        y: 190,
        label: l,
      })),
    ],
    render: (_p, sim) => (
      <>
        <rect width={280} height={190} rx={10} fill="#0f6b62" stroke={stroke} strokeWidth={1.5} />
        <rect x={16} y={26} width={70} height={44} rx={4} fill="#132726" stroke="#0a3b36" />
        <rect x={120} y={70} width={90} height={40} rx={3} fill="#1b1b1b" />
        <circle cx={100} cy={40} r={5} fill="#8bd450" opacity={sim?.live ? 1 : 0.25}>
          {sim?.live && (
            <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
          )}
        </circle>
        <text x={140} y={150} fontSize={16} fill="#d7f5f0" fontFamily="var(--font-mono)">
          UNO
        </text>
      </>
    ),
  },
];

export const PART_MAP = Object.fromEntries(PART_DEFS.map((d) => [d.type, d])) as Record<
  string,
  PartDef
>;

export function rotatePoint(x: number, y: number, w: number, h: number, rot: number) {
  const cx = w / 2;
  const cy = h / 2;
  const rad = (rot * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}
