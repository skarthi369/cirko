import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LaserApparatusSetupProps {
  onStartSimulation: () => void;
}

export default function LaserApparatusSetup({ onStartSimulation }: LaserApparatusSetupProps) {
  const apparatusItems = [
    {
      id: 1,
      name: "Semiconductor Laser Diode Module",
      specs: "650 nm (AlGaInP), Visible Red, Ith ≈ 18 mA, Max Optical Power 10 mW",
      role: "Emits light via spontaneous recombination below Ith and stimulated emission above Ith.",
      icon: "⚡",
    },
    {
      id: 2,
      name: "Variable Constant-Current DC Power Supply",
      specs: "0.0 – 50.0 mA Regulated Injection Current with current limiting",
      role: "Provides calibrated forward bias current to inject electron-hole pairs into junction.",
      icon: "🎛️",
    },
    {
      id: 3,
      name: "Optical Power Meter with Photodetector Head",
      specs: "Calibrated Silicon PIN photodiode sensor, 0 – 20 mW measurement range",
      role: "Measures exact optical output power incident on the detector aperture.",
      icon: "📊",
    },
    {
      id: 4,
      name: "Digital Multimeters (Dual Display)",
      specs: "DC Ammeter (0.1 mA resolution) & DC Voltmeter (1 mV resolution)",
      role: "Continuously monitors injection current (I) and diode forward voltage (Vf).",
      icon: "📟",
    },
    {
      id: 5,
      name: "Precision Optical Bench & Mounting Rail",
      specs: "10 cm rail, 1 cm fixed transmitter-to-detector distance, light-tight enclosure",
      role: "Maintains rigid optical axis alignment and shields from ambient background light.",
      icon: "📏",
    },
    {
      id: 6,
      name: "Substrate Thermoelectric Cooler / Heat Sink",
      specs: "Peltier module with thermistor probe (15°C to 55°C range)",
      role: "Stabilizes substrate temperature; prevents thermal wavelength drift and thermal roll-off.",
      icon: "❄️",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      {/* Overview Banner */}
      <div className="rounded-xl border border-border bg-sidebar p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔬</span>
          <h2 className="text-lg font-bold font-mono text-foreground">
            Apparatus & Experimental Bench Configuration
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          The characterization setup is constructed around an optical alignment bench. A variable
          low-noise current source injects controlled forward current into the semiconductor laser
          diode while an optical power meter measures the resultant radiant flux.
        </p>
      </div>

      {/* Schematic Diagram */}
      <Card className="border-border bg-card">
        <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
          <CardTitle className="font-mono text-xs font-bold text-foreground">
            Experimental Setup Schematic & Optical Path
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 font-mono text-xs text-center text-neutral-300 shadow-inner">
            {/* SVG Visual Schematic */}
            <svg viewBox="0 0 760 160" className="w-full h-auto max-h-48 mx-auto">
              {/* Power Supply */}
              <rect
                x="20"
                y="30"
                width="130"
                height="100"
                rx="8"
                fill="#18181b"
                stroke="#3f3f46"
                strokeWidth="1.5"
              />
              <text
                x="85"
                y="60"
                textAnchor="middle"
                fill="#f4f4f5"
                fontSize="11"
                fontWeight="bold"
              >
                DC CURRENT
              </text>
              <text x="85" y="76" textAnchor="middle" fill="#a1a1aa" fontSize="10">
                SOURCE
              </text>
              <text
                x="85"
                y="105"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="11"
                fontWeight="bold"
              >
                0 – 50 mA
              </text>

              {/* Wire Connection */}
              <path
                d="M 150 80 L 250 80"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <text x="200" y="70" textAnchor="middle" fill="#f59e0b" fontSize="9">
                Current I (mA)
              </text>

              {/* Laser Diode Holder */}
              <rect
                x="250"
                y="25"
                width="120"
                height="110"
                rx="8"
                fill="#27272a"
                stroke="#ef4444"
                strokeWidth="2"
              />
              <text
                x="310"
                y="55"
                textAnchor="middle"
                fill="#f87171"
                fontSize="11"
                fontWeight="bold"
              >
                LASER DIODE
              </text>
              <text x="310" y="72" textAnchor="middle" fill="#d4d4d8" fontSize="10">
                650 nm AlGaInP
              </text>
              <circle cx="310" cy="98" r="14" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
              <text x="310" y="102" textAnchor="middle" fill="#fecaca" fontSize="11">
                ⚡
              </text>

              {/* Laser Optical Beam */}
              <defs>
                <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <polygon points="370,94 530,86 530,110 370,102" fill="url(#beamGrad)" />
              <line x1="370" y1="98" x2="530" y2="98" stroke="#ffffff" strokeWidth="1.5" />
              <text
                x="450"
                y="75"
                textAnchor="middle"
                fill="#f87171"
                fontSize="10"
                fontWeight="bold"
              >
                Coherent Laser Beam
              </text>
              <text x="450" y="125" textAnchor="middle" fill="#71717a" fontSize="9">
                Distance = 1.0 cm
              </text>

              {/* Optical Power Meter Sensor */}
              <rect
                x="530"
                y="25"
                width="130"
                height="110"
                rx="8"
                fill="#1e293b"
                stroke="#10b981"
                strokeWidth="2"
              />
              <text
                x="595"
                y="55"
                textAnchor="middle"
                fill="#34d399"
                fontSize="11"
                fontWeight="bold"
              >
                POWER METER
              </text>
              <text x="595" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10">
                PIN Sensor Head
              </text>
              <rect
                x="575"
                y="85"
                width="40"
                height="26"
                rx="4"
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="1"
              />
              <text
                x="595"
                y="102"
                textAnchor="middle"
                fill="#a7f3d0"
                fontSize="10"
                fontWeight="bold"
              >
                P (mW)
              </text>
            </svg>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground border-t border-neutral-800 pt-3">
              <span>● Electrical Drive Loop</span>
              <span>● Cleaved Fabry-Perot Cavity</span>
              <span>● Photodetector Calibrated Optical Interface</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Required Apparatus Components ({apparatusItems.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
          {apparatusItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card p-3.5 space-y-1.5 shadow-xs"
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

      {/* Safety & Protocol Checklist */}
      <Card className="border-border bg-card">
        <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
          <CardTitle className="font-mono text-xs font-bold text-foreground">
            Laboratory Precautions & Optical Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">⚠️</span>
            <span>
              <strong>Eye Safety:</strong> Never view a laser aperture directly along the optical
              axis, even at sub-threshold current levels.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold">ℹ️</span>
            <span>
              <strong>Current Limiting:</strong> Do not exceed the maximum forward rating of 45 mA
              to prevent catastrophic optical damage (COD) to the cleaved end facets.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>
              <strong>Thermal Equilibrium:</strong> Allow heatsink temperature to stabilize at 25°C
              before recording high-precision optical readings.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground font-mono">
          Apparatus and connections verified
        </div>
        <Button
          onClick={onStartSimulation}
          className="font-mono text-xs gap-2 bg-primary text-primary-foreground shadow-sm"
        >
          Enter Interactive LASER Simulation →
        </Button>
      </div>
    </div>
  );
}
