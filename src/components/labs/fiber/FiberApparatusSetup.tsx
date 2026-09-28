import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FiberApparatusSetupProps {
  onStartSimulation: () => void;
  connections: {
    genToLaser: boolean;
    laserToFiber: boolean;
    fiberToDetector: boolean;
    detectorToScope: boolean;
    genToScope: boolean;
  };
  onToggleConnection: (key: string) => void;
}

export default function FiberApparatusSetup({
  onStartSimulation,
  connections,
  onToggleConnection,
}: FiberApparatusSetupProps) {
  const [testResult, setTestResult] = useState<string | null>(null);

  const apparatusList = [
    {
      id: "gen",
      name: "Precision Function Generator",
      specs: "10 Hz – 500 kHz Sine/Square/Triangle, 10 mV – 2000 mVpp Output, 50 Ω Z_out",
      role: "Generates the information baseband signal v_in(t) to modulate the laser carrier.",
      icon: "🎛️",
    },
    {
      id: "laser",
      name: "Semiconductor Laser Diode Transmitter",
      specs: "650 nm Visible Red (AlGaInP), Ith ≈ 18 mA, Built-in DC Bias Tee & Modulation Input",
      role: "Converts electrical drive current into proportional optical intensity variations.",
      icon: "⚡",
    },
    {
      id: "fiber",
      name: "Step-Index Plastic Optical Fiber (POF)",
      specs: "1.0 mm PMMA Core, 0.03 dB/m Attenuation at 650 nm, SMA-905 Optical Connectors",
      role: "Dielectric light guide confining optical photons via Total Internal Reflection.",
      icon: "〰️",
    },
    {
      id: "detector",
      name: "Silicon Phototransistor Receiver Module",
      specs: "Peak Sensitivity at 650 nm, Internal Gain β ≈ 40, Responsivity R ≈ 0.45 A/W",
      role: "Absorbs incoming photons and generates proportional collector photocurrent.",
      icon: "👁️",
    },
    {
      id: "circuit",
      name: "Detector Load Circuit & AC Pre-Amplifier",
      specs: "1 kΩ Precision Load Resistor, Low-Noise Op-Amp, AC-Coupling High-Pass Filter",
      role: "Converts detector current to voltage and strips DC bias offset.",
      icon: "🔌",
    },
    {
      id: "scope",
      name: "Dual-Trace Digital Storage Oscilloscope",
      specs: "2-Channel 20 MHz DSO (CH1: Transmitted Info, CH2: Recovered Signal)",
      role: "Simultaneously visualizes and compares input vs recovered output waveforms.",
      icon: "📟",
    },
  ];

  const allConnected =
    connections.genToLaser &&
    connections.laserToFiber &&
    connections.fiberToDetector &&
    connections.detectorToScope &&
    connections.genToScope;

  const handleRunDiagnostics = () => {
    if (allConnected) {
      setTestResult(
        "✓ Link Integrity Verified! All electrical drive loops, optical patchcords, and oscilloscope probe channels are correctly routed and continuous.",
      );
    } else {
      const missing: string[] = [];
      if (!connections.genToLaser) missing.push("Function Generator -> Laser Modulation Input");
      if (!connections.laserToFiber) missing.push("Laser Optical Port -> Fiber Patchcord Input");
      if (!connections.fiberToDetector)
        missing.push("Fiber Patchcord Output -> Photodetector Port");
      if (!connections.detectorToScope) missing.push("Detector Output -> Oscilloscope Channel 2");
      if (!connections.genToScope) missing.push("Function Generator -> Oscilloscope Channel 1");

      setTestResult(`✗ Incomplete Signal Path: Missing connection(s):\n• ${missing.join("\n• ")}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-xl border border-border bg-sidebar p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔬</span>
          <h2 className="text-lg font-bold font-mono text-foreground">
            Apparatus & Interactive Experimental Setup
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          The physical experiment requires interconnecting six core instruments into a complete
          optical communication channel. Connect each functional block to establish the signal path.
        </p>
      </div>

      {/* Interactive Optical Bench Wiring Schematic */}
      <Card className="border-border bg-card">
        <CardHeader className="py-3 px-4 bg-sidebar border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            Interactive Signal Routing & Connection Setup
          </CardTitle>
          <Badge
            variant={allConnected ? "default" : "destructive"}
            className="font-mono text-[10px]"
          >
            {allConnected ? "● Complete Optical Link" : "○ Disconnected / Incomplete"}
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Signal Flow Visualizer SVG */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 font-mono text-xs text-center text-neutral-300 shadow-inner">
            <svg viewBox="0 0 780 200" className="w-full h-auto max-h-56 mx-auto">
              {/* Block 1: Function Generator */}
              <rect
                x="20"
                y="30"
                width="120"
                height="130"
                rx="8"
                fill="#18181b"
                stroke={connections.genToLaser ? "#38bdf8" : "#52525b"}
                strokeWidth="1.5"
              />
              <text
                x="80"
                y="55"
                textAnchor="middle"
                fill="#f4f4f5"
                fontSize="10"
                fontWeight="bold"
              >
                FUNCTION GEN
              </text>
              <text x="80" y="70" textAnchor="middle" fill="#a1a1aa" fontSize="9">
                v_in(t) 1 kHz
              </text>
              <circle cx="80" cy="100" r="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="80" y="104" textAnchor="middle" fill="#38bdf8" fontSize="12">
                ∿
              </text>
              <text
                x="80"
                y="145"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="9"
                fontWeight="bold"
              >
                Output 50Ω
              </text>

              {/* Wire 1: Gen -> Laser */}
              <path
                d="M 140 100 L 190 100"
                stroke={connections.genToLaser ? "#38bdf8" : "#3f3f46"}
                strokeWidth="2.5"
                strokeDasharray={connections.genToLaser ? "none" : "4 3"}
              />

              {/* Block 2: Laser Transmitter */}
              <rect
                x="190"
                y="30"
                width="120"
                height="130"
                rx="8"
                fill="#18181b"
                stroke={connections.laserToFiber ? "#ef4444" : "#52525b"}
                strokeWidth="1.5"
              />
              <text
                x="250"
                y="55"
                textAnchor="middle"
                fill="#f87171"
                fontSize="10"
                fontWeight="bold"
              >
                LASER SOURCE
              </text>
              <text x="250" y="70" textAnchor="middle" fill="#a1a1aa" fontSize="9">
                650 nm AlGaInP
              </text>
              <circle cx="250" cy="100" r="16" fill="#450a0a" stroke="#ef4444" strokeWidth="1" />
              <text x="250" y="104" textAnchor="middle" fill="#f87171" fontSize="12">
                ⚡
              </text>
              <text
                x="250"
                y="145"
                textAnchor="middle"
                fill="#f87171"
                fontSize="9"
                fontWeight="bold"
              >
                I_bias &gt; Ith
              </text>

              {/* Wire 2: Laser -> Fiber */}
              <path
                d="M 310 100 L 360 100"
                stroke={connections.laserToFiber ? "#ef4444" : "#3f3f46"}
                strokeWidth="3.5"
                strokeDasharray={connections.laserToFiber ? "none" : "4 3"}
              />

              {/* Block 3: Optical Fiber Patchcord */}
              <rect
                x="360"
                y="45"
                width="120"
                height="100"
                rx="8"
                fill="#0f172a"
                stroke={connections.fiberToDetector ? "#10b981" : "#52525b"}
                strokeWidth="1.5"
              />
              <text
                x="420"
                y="70"
                textAnchor="middle"
                fill="#34d399"
                fontSize="10"
                fontWeight="bold"
              >
                OPTICAL FIBER
              </text>
              <text x="420" y="85" textAnchor="middle" fill="#94a3b8" fontSize="9">
                POF Link (1 m)
              </text>
              <path d="M 380 110 Q 420 90 460 110" fill="none" stroke="#10b981" strokeWidth="2.5" />
              <text x="420" y="132" textAnchor="middle" fill="#34d399" fontSize="9">
                TIR Guided Core
              </text>

              {/* Wire 3: Fiber -> Detector */}
              <path
                d="M 480 100 L 530 100"
                stroke={connections.fiberToDetector ? "#10b981" : "#3f3f46"}
                strokeWidth="3.5"
                strokeDasharray={connections.fiberToDetector ? "none" : "4 3"}
              />

              {/* Block 4: Photodetector Module */}
              <rect
                x="530"
                y="30"
                width="120"
                height="130"
                rx="8"
                fill="#18181b"
                stroke={connections.detectorToScope ? "#f59e0b" : "#52525b"}
                strokeWidth="1.5"
              />
              <text
                x="590"
                y="55"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="10"
                fontWeight="bold"
              >
                PHOTODETECTOR
              </text>
              <text x="590" y="70" textAnchor="middle" fill="#a1a1aa" fontSize="9">
                Phototransistor
              </text>
              <circle cx="590" cy="100" r="16" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
              <text x="590" y="104" textAnchor="middle" fill="#fbbf24" fontSize="12">
                👁️
              </text>
              <text
                x="590"
                y="145"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="9"
                fontWeight="bold"
              >
                R_load = 1 kΩ
              </text>

              {/* Wire 4: Detector -> Scope */}
              <path
                d="M 650 100 L 700 100"
                stroke={connections.detectorToScope ? "#f59e0b" : "#3f3f46"}
                strokeWidth="2.5"
                strokeDasharray={connections.detectorToScope ? "none" : "4 3"}
              />

              {/* Block 5: Oscilloscope */}
              <rect
                x="700"
                y="30"
                width="65"
                height="130"
                rx="8"
                fill="#18181b"
                stroke="#6366f1"
                strokeWidth="1.5"
              />
              <text
                x="732"
                y="60"
                textAnchor="middle"
                fill="#a5b4fc"
                fontSize="9"
                fontWeight="bold"
              >
                SCOPE
              </text>
              <text
                x="732"
                y="90"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="8"
                fontWeight="bold"
              >
                CH1 Tx
              </text>
              <text
                x="732"
                y="125"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="8"
                fontWeight="bold"
              >
                CH2 Rx
              </text>

              {/* Probe Wire: Gen -> Scope CH1 */}
              <path
                d="M 80 160 L 80 185 L 732 185 L 732 160"
                fill="none"
                stroke={connections.genToScope ? "#38bdf8" : "#27272a"}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            </svg>
          </div>

          {/* Interactive Connection Switches */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Required Interconnection Patches ({allConnected ? "5/5 Connected" : "Action Required"}
              ):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => onToggleConnection("genToLaser")}
                className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  connections.genToLaser
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-border bg-sidebar hover:bg-card text-muted-foreground"
                }`}
              >
                <div>
                  <span className="font-bold block text-foreground">1. Gen → Laser Driver</span>
                  <span className="text-[10px] text-muted-foreground">
                    BNC patch cable (Modulation input)
                  </span>
                </div>
                <Badge
                  variant={connections.genToLaser ? "default" : "outline"}
                  className="text-[10px]"
                >
                  {connections.genToLaser ? "Connected" : "Disconnected"}
                </Badge>
              </button>

              <button
                onClick={() => onToggleConnection("laserToFiber")}
                className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  connections.laserToFiber
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-border bg-sidebar hover:bg-card text-muted-foreground"
                }`}
              >
                <div>
                  <span className="font-bold block text-foreground">2. Laser → Optical Fiber</span>
                  <span className="text-[10px] text-muted-foreground">
                    SMA optical transmitter coupler
                  </span>
                </div>
                <Badge
                  variant={connections.laserToFiber ? "default" : "outline"}
                  className="text-[10px]"
                >
                  {connections.laserToFiber ? "Connected" : "Disconnected"}
                </Badge>
              </button>

              <button
                onClick={() => onToggleConnection("fiberToDetector")}
                className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  connections.fiberToDetector
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-border bg-sidebar hover:bg-card text-muted-foreground"
                }`}
              >
                <div>
                  <span className="font-bold block text-foreground">3. Fiber → Photodetector</span>
                  <span className="text-[10px] text-muted-foreground">
                    SMA optical receiver coupler
                  </span>
                </div>
                <Badge
                  variant={connections.fiberToDetector ? "default" : "outline"}
                  className="text-[10px]"
                >
                  {connections.fiberToDetector ? "Connected" : "Disconnected"}
                </Badge>
              </button>

              <button
                onClick={() => onToggleConnection("detectorToScope")}
                className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  connections.detectorToScope
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-border bg-sidebar hover:bg-card text-muted-foreground"
                }`}
              >
                <div>
                  <span className="font-bold block text-foreground">4. Detector → Scope CH2</span>
                  <span className="text-[10px] text-muted-foreground">
                    BNC probe to oscilloscope Channel 2
                  </span>
                </div>
                <Badge
                  variant={connections.detectorToScope ? "default" : "outline"}
                  className="text-[10px]"
                >
                  {connections.detectorToScope ? "Connected" : "Disconnected"}
                </Badge>
              </button>

              <button
                onClick={() => onToggleConnection("genToScope")}
                className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors sm:col-span-2 ${
                  connections.genToScope
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-border bg-sidebar hover:bg-card text-muted-foreground"
                }`}
              >
                <div>
                  <span className="font-bold block text-foreground">
                    5. Gen Output → Scope CH1 (Reference)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Direct monitor probe to Channel 1 for input vs output comparison
                  </span>
                </div>
                <Badge
                  variant={connections.genToScope ? "default" : "outline"}
                  className="text-[10px]"
                >
                  {connections.genToScope ? "Connected" : "Disconnected"}
                </Badge>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunDiagnostics}
                className="font-mono text-xs"
              >
                🔍 Run Connection Diagnostics
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  if (!connections.genToLaser) onToggleConnection("genToLaser");
                  if (!connections.laserToFiber) onToggleConnection("laserToFiber");
                  if (!connections.fiberToDetector) onToggleConnection("fiberToDetector");
                  if (!connections.detectorToScope) onToggleConnection("detectorToScope");
                  if (!connections.genToScope) onToggleConnection("genToScope");
                }}
                className="font-mono text-xs border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
              >
                ✓ Connect All Components
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs font-mono whitespace-pre-line leading-relaxed ${
                  allConnected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {testResult}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Apparatus Item Catalog */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Equipment & Instrument Inventory ({apparatusList.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
          {apparatusList.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card p-3.5 space-y-1 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs font-bold text-foreground">{item.name}</span>
              </div>
              <div className="text-[11px] text-primary">{item.specs}</div>
              <div className="text-[10px] text-muted-foreground leading-normal">{item.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground font-mono">
          Apparatus Verified | Setup Configured
        </div>
        <Button
          onClick={onStartSimulation}
          className="font-mono text-xs gap-2 bg-primary text-primary-foreground shadow-sm"
        >
          Proceed to Interactive Optical Experiment →
        </Button>
      </div>
    </div>
  );
}
