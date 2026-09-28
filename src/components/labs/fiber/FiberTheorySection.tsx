import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FiberTheorySectionProps {
  onProceedToPretest: () => void;
  onCheckAnswered?: (checkId: string) => void;
}

const THEORY_SECTIONS_LIST = [
  { key: "secA", code: "A", title: "Optical Fiber Communication" },
  { key: "secB", code: "B", title: "Information Signal" },
  { key: "secC", code: "C", title: "Intensity Modulation" },
  { key: "secD", code: "D", title: "Laser as Optical Source" },
  { key: "secE", code: "E", title: "Source Current and Optical Intensity" },
  { key: "secF", code: "F", title: "Optical Fiber Transmission" },
  { key: "secG", code: "G", title: "Photodetector" },
  { key: "secH", code: "H", title: "Phototransistor" },
  { key: "secI", code: "I", title: "Detector Current" },
  { key: "secJ", code: "J", title: "Conversion to Voltage" },
  { key: "secK", code: "K", title: "Amplification" },
  { key: "secL", code: "L", title: "Recovery of Information Signal" },
];

interface FlowBlockInfo {
  id: string;
  name: string;
  icon: string;
  enters: string;
  changes: string;
  leaves: string;
  formula: string;
}

const FLOW_BLOCKS: FlowBlockInfo[] = [
  {
    id: "input",
    name: "1. Information Input Signal",
    icon: "🔊",
    enters: "Analog audio, voice, or test tones from a function generator.",
    changes: "Generates time-varying electrical voltage v_in(t) = V_m·sin(2πf_m t).",
    leaves: "Modulating voltage signal applied to the laser driver bias network.",
    formula: "v_{in}(t) = V_m \\sin(2\\pi f_m t)",
  },
  {
    id: "laser",
    name: "2. Laser Optical Source",
    icon: "⚡",
    enters: "DC bias current I_bias combined with AC modulating current i_m(t).",
    changes:
      "Stimulated emission converts forward injection current into proportional optical flux.",
    leaves: "Intensity-modulated optical carrier beam P_opt(t) at 650 nm.",
    formula: "P_{opt}(t) = \\eta \\cdot [I_{bias} + k_{mod} v_{in}(t) - I_{th}]",
  },
  {
    id: "fiber",
    name: "3. Optical Fiber Channel",
    icon: "〰️",
    enters: "High-intensity optical beam launched into the fiber core.",
    changes:
      "Guides photons via Total Internal Reflection (TIR); suffers exponential attenuation (α dB/m).",
    leaves: "Attenuated and propagation-delayed optical power P_rec(t) at link end.",
    formula: "P_{rec}(t) = P_{opt}(t - \\tau) \\cdot 10^{-\\alpha L / 10}",
  },
  {
    id: "detector",
    name: "4. Photodetector / Phototransistor",
    icon: "👁️",
    enters: "Received optical photons striking the photosensitive semiconductor junction.",
    changes:
      "Generates electron-hole pairs via internal photoelectric effect; multiplies carriers with internal gain β.",
    leaves: "Demodulated electrical detector current I_det(t) mirroring the light intensity.",
    formula: "I_{det}(t) = \\beta \\cdot \\mathcal{R} \\cdot P_{rec}(t)",
  },
  {
    id: "output",
    name: "5. Load Resistor & Output Recovery",
    icon: "📈",
    enters: "Signal photocurrent I_det(t) flowing through load resistor R_load.",
    changes:
      "Ohmic conversion (V_det = I_det · R_load) followed by AC-coupling to remove DC offset.",
    leaves: "Faithfully reconstructed electrical replica v_out(t) ready for oscilloscope analysis.",
    formula: "v_{out}(t) = A_v \\cdot [I_{det}(t) R_{load} - V_{DC}]",
  },
];

export default function FiberTheorySection({
  onProceedToPretest,
  onCheckAnswered,
}: FiberTheorySectionProps) {
  // Expandable sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    secA: true,
    secB: true,
    secC: true,
    secD: false,
    secE: false,
    secF: false,
    secG: false,
    secH: false,
    secI: false,
    secJ: false,
    secK: false,
    secL: false,
  });

  // Selected block in interactive flow diagram
  const [selectedBlockId, setSelectedBlockId] = useState<string>("input");

  // Theory check state
  const [check1Answer, setCheck1Answer] = useState<number | null>(null);
  const [check2Answer, setCheck2Answer] = useState<number | null>(null);
  const [check3Answer, setCheck3Answer] = useState<number | null>(null);
  const [check4Answer, setCheck4Answer] = useState<number | null>(null);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    THEORY_SECTIONS_LIST.forEach((s) => {
      next[s.key] = true;
    });
    setExpandedSections(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    THEORY_SECTIONS_LIST.forEach((s) => {
      next[s.key] = false;
    });
    setExpandedSections(next);
  };

  const selectedBlock = FLOW_BLOCKS.find((b) => b.id === selectedBlockId) ?? FLOW_BLOCKS[0]!;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-card via-sidebar to-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
                IIT Roorkee Reference
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">Experiment 3</span>
            </div>
            <h2 className="text-xl font-bold font-mono text-foreground mt-2">
              Intensity Modulation of Laser Output Through Optical Fiber
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Explore the end-to-end optical transmission chain: encoding an information signal into
              laser intensity variations, propagating through a dielectric optical waveguide, and
              converting light back to electrical voltage at the photodetector.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="h-7 text-xs font-mono"
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="h-7 text-xs font-mono"
            >
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Signal Flow Diagram */}
      <Card className="border-primary/40 bg-card shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔀</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                Interactive Signal-Flow Architecture
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-[10px] text-primary border-primary/40"
            >
              Click any block to inspect signal transitions
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Signal Chain Clickable Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 font-mono text-xs">
            {FLOW_BLOCKS.map((block, idx) => {
              const isSelected = block.id === selectedBlockId;
              return (
                <button
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between h-24 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                      : "border-border bg-sidebar/50 hover:bg-sidebar"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{block.icon}</span>
                    <span className="text-[10px] text-muted-foreground font-bold">
                      Step {idx + 1}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-foreground block line-clamp-1">
                      {block.name.split(". ")[1]}
                    </span>
                    <span className="text-[9px] text-primary font-mono block mt-0.5">
                      {block.formula}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector Box for Selected Block */}
          <div className="rounded-xl border border-primary/30 bg-sidebar/60 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedBlock.icon}</span>
                <span className="font-bold text-sm text-foreground">{selectedBlock.name}</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-primary">
                {selectedBlock.formula}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded border border-border bg-card/60 space-y-1">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                  1. What Enters?
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {selectedBlock.enters}
                </p>
              </div>

              <div className="p-3 rounded border border-border bg-card/60 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  2. What Changes?
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {selectedBlock.changes}
                </p>
              </div>

              <div className="p-3 rounded border border-border bg-card/60 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  3. What Leaves?
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {selectedBlock.leaves}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Sections (A through L) */}
      <div className="space-y-4">
        {/* A. Optical Fiber Communication */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secA")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  A
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Optical Fiber Communication
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secA ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secA && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                Optical fiber communication is the transmission of information from one place to
                another by sending pulses or analog variations of light through an optical fiber.
                Compared to traditional copper wire conductors, optical links offer orders of
                magnitude greater bandwidth, immunity to electromagnetic interference (EMI), and
                significantly lower signal attenuation over long transmission distances.
              </p>
              <div className="rounded border border-border bg-sidebar/40 p-3 text-[11px] space-y-1">
                <span className="text-foreground font-bold block">
                  Key Architectural Advantages:
                </span>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li>
                    Carrier Frequency: Optical carriers operate around 10^14 Hz (~460 THz for 650 nm
                    red light).
                  </li>
                  <li>
                    Total Dielectric Isolation: Glass and plastic fibers carry no electrical
                    currents, eliminating spark hazards and ground loops.
                  </li>
                  <li>
                    Massive Bandwidth-Distance Product: Enables gigabit and terabit throughputs
                    across continental backbones.
                  </li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>

        {/* B. Information Signal */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secB")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  B
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Information Signal
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secB ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secB && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                The information or baseband signal represents the intelligence to be
                transmitted—such as audio, video, sensor telemetry, or digital bitstreams. In this
                laboratory, a precision signal generator creates an electrical information signal:
              </p>
              <div className="rounded bg-sidebar p-3 text-center text-primary font-bold">
                v_in(t) = V_m · sin(2π · f_m · t)
              </div>
              <p>
                where V_m is the peak modulating voltage amplitude (10 mV to 2000 mV p-p) and f_m is
                the modulating frequency (10 Hz to 500 kHz). This electrical waveform directly
                regulates the optical transmitter.
              </p>
            </CardContent>
          )}
        </Card>

        {/* C. Intensity Modulation */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secC")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  C
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Intensity Modulation (IM/DD)
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secC ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secC && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                In optical communication, modulation can alter properties of the optical carrier
                such as its intensity, frequency, or phase. In{" "}
                <strong>Intensity Modulation (IM)</strong>, the instantaneous optical power
                (intensity) emitted by the optical source is made to vary in direct proportion to
                the modulating information signal.
              </p>
              <p>
                At the receiver, <strong>Direct Detection (DD)</strong> is employed: a square-law
                photodetector directly converts the received optical intensity into a proportional
                electrical current without requiring local optical oscillators or coherent phase
                mixing.
              </p>
            </CardContent>
          )}
        </Card>

        {/* THEORY CHECK 1 */}
        <div className="rounded-xl border border-primary/40 bg-sidebar/40 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">❓</span>
            <span className="font-bold text-foreground">
              Check Your Understanding (1/4): What controls the optical intensity of the source?
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 0, text: "The forward injection current through the laser diode" },
              { id: 1, text: "The physical diameter of the optical fiber cable" },
              { id: 2, text: "The atmospheric humidity of the laboratory" },
              { id: 3, text: "The reverse breakdown voltage of the photodetector" },
            ].map((opt) => (
              <Button
                key={opt.id}
                variant={
                  check1Answer === opt.id ? (opt.id === 0 ? "default" : "destructive") : "outline"
                }
                onClick={() => {
                  setCheck1Answer(opt.id);
                  if (opt.id === 0 && onCheckAnswered) onCheckAnswered("check1");
                }}
                className="justify-start text-xs font-mono h-auto py-2 px-3 text-left whitespace-normal"
              >
                {opt.text}
              </Button>
            ))}
          </div>

          {check1Answer !== null && (
            <div className="rounded p-3 bg-card border border-border text-[11px] leading-relaxed">
              {check1Answer === 0 ? (
                <span className="text-emerald-400 font-bold">✓ Correct! </span>
              ) : (
                <span className="text-rose-400 font-bold">✗ Incorrect. </span>
              )}
              In a semiconductor laser diode, photon generation is governed by electron-hole
              recombination; increasing the forward injection current proportionally increases the
              emitted optical intensity.
            </div>
          )}
        </div>

        {/* D. Laser as Optical Source */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secD")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  D
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Laser as Optical Source
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secD ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secD && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                A semiconductor laser diode (e.g., AlGaInP at 650 nm) is preferred over a standard
                LED in high-speed optical communications because of:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Narrow spectral linewidth (&lt; 1 nm vs. 30–50 nm for LEDs), minimizing chromatic
                  dispersion.
                </li>
                <li>
                  High slope efficiency (η ≈ 0.35 mW/mA), yielding strong optical modulation for
                  small drive swings.
                </li>
                <li>
                  High directional coupling efficiency into the small core of an optical fiber due
                  to narrow beam divergence.
                </li>
                <li>
                  Picosecond carrier recombination lifetimes allowing gigahertz modulation rates.
                </li>
              </ul>
            </CardContent>
          )}
        </Card>

        {/* E. Source Current and Optical Intensity */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secE")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  E
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Source Current and Optical Intensity
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secE ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secE && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                To achieve linear intensity modulation without severe waveform distortion, the laser
                diode must be{" "}
                <strong>
                  pre-biased with a DC current (I_bias) above its threshold current (I_th ≈ 18 mA)
                </strong>
                .
              </p>
              <div className="rounded bg-sidebar p-3 text-center text-primary font-bold">
                I(t) = I_bias + k_mod · v_in(t)
              </div>
              <p>
                If the modulating signal is too large or the bias is set below I_th, the
                instantaneous current will drop into the sub-threshold spontaneous emission regime
                during negative swings, extinguishing stimulated lasing and clipping the bottom
                peaks of the optical wave (over-modulation).
              </p>
            </CardContent>
          )}
        </Card>

        {/* F. Optical Fiber Transmission */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secF")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  F
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Optical Fiber Transmission & Attenuation
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secF ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secF && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                The optical fiber guides light through its higher-refractive-index core (n1)
                surrounded by lower-index cladding (n2) via Total Internal Reflection. As the light
                wave propagates, optical power decays exponentially according to the Beer-Lambert
                attenuation law:
              </p>
              <div className="rounded bg-sidebar p-3 text-center text-primary font-bold">
                P_rec(L) = P_tx · 10^(-α · L / 10)
              </div>
              <p>
                where α is the attenuation coefficient (in dB/m or dB/km) and L is the link
                distance. For Plastic Optical Fiber (POF) at 650 nm, α is approximately 0.03 dB/m
                (30 dB/km).
              </p>
            </CardContent>
          )}
        </Card>

        {/* THEORY CHECK 2 */}
        <div className="rounded-xl border border-primary/40 bg-sidebar/40 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">❓</span>
            <span className="font-bold text-foreground">
              Check Your Understanding (2/4): What carries the optical signal from transmitter to
              receiver?
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 0, text: "The optical fiber waveguide via total internal reflection" },
              { id: 1, text: "A twisted-pair copper telephone cable" },
              { id: 2, text: "An electrical AC coaxial ground shield" },
              { id: 3, text: "A magnetic ferrite toroid inductor" },
            ].map((opt) => (
              <Button
                key={opt.id}
                variant={
                  check2Answer === opt.id ? (opt.id === 0 ? "default" : "destructive") : "outline"
                }
                onClick={() => {
                  setCheck2Answer(opt.id);
                  if (opt.id === 0 && onCheckAnswered) onCheckAnswered("check2");
                }}
                className="justify-start text-xs font-mono h-auto py-2 px-3 text-left whitespace-normal"
              >
                {opt.text}
              </Button>
            ))}
          </div>

          {check2Answer !== null && (
            <div className="rounded p-3 bg-card border border-border text-[11px] leading-relaxed">
              {check2Answer === 0 ? (
                <span className="text-emerald-400 font-bold">✓ Correct! </span>
              ) : (
                <span className="text-rose-400 font-bold">✗ Incorrect. </span>
              )}
              The dielectric optical fiber carries the modulated photons confined within its core
              through successive boundary reflections, isolating the signal from external
              electromagnetic noise.
            </div>
          )}
        </div>

        {/* G. Photodetector */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secG")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  G
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Photodetector & Responsivity
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secG ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secG && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                A photodetector performs the reverse operation of a light source: it absorbs
                incident photons with energy greater than its semiconductor bandgap (hν &gt; Eg) and
                generates free electron-hole pairs.
              </p>
              <p>
                The fundamental conversion efficiency is defined by the{" "}
                <strong>Photodetector Responsivity (R_resp)</strong> in Amperes per Watt:
              </p>
              <div className="rounded bg-sidebar p-3 text-center text-primary font-bold">
                R_resp = I_photo / P_rec = (η_q · q) / (h · ν)
              </div>
              <p>
                For a silicon PIN photodetector at 650 nm, R_resp is typically 0.40 to 0.50 A/W.
              </p>
            </CardContent>
          )}
        </Card>

        {/* H. Phototransistor */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secH")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  H
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Phototransistor Detector Model
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secH ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secH && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                In the IIT Roorkee experimental apparatus, the optical receiver employs a
                <strong>phototransistor</strong>. Light strikes the reverse-biased base-collector
                junction, generating a primary photocurrent I_photo.
              </p>
              <p>
                The bipolar transistor structure provides an internal current gain (h_FE or β ≈
                40–100), yielding a much larger collector current:
              </p>
              <div className="rounded bg-sidebar p-3 text-center text-primary font-bold">
                I_c = β · I_photo = β · R_resp · P_rec
              </div>
              <p>
                This internal gain provides high sensitivity to faint light arriving from the fiber.
              </p>
            </CardContent>
          )}
        </Card>

        {/* THEORY CHECK 3 */}
        <div className="rounded-xl border border-primary/40 bg-sidebar/40 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">❓</span>
            <span className="font-bold text-foreground">
              Check Your Understanding (3/4): What converts the received light into an electrical
              current?
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              {
                id: 0,
                text: "The photodetector / phototransistor via internal photoelectric absorption",
              },
              { id: 1, text: "The function generator sine wave oscillator" },
              { id: 2, text: "The DC power supply transformer" },
              { id: 3, text: "The SMA connector dielectric jacket" },
            ].map((opt) => (
              <Button
                key={opt.id}
                variant={
                  check3Answer === opt.id ? (opt.id === 0 ? "default" : "destructive") : "outline"
                }
                onClick={() => {
                  setCheck3Answer(opt.id);
                  if (opt.id === 0 && onCheckAnswered) onCheckAnswered("check3");
                }}
                className="justify-start text-xs font-mono h-auto py-2 px-3 text-left whitespace-normal"
              >
                {opt.text}
              </Button>
            ))}
          </div>

          {check3Answer !== null && (
            <div className="rounded p-3 bg-card border border-border text-[11px] leading-relaxed">
              {check3Answer === 0 ? (
                <span className="text-emerald-400 font-bold">✓ Correct! </span>
              ) : (
                <span className="text-rose-400 font-bold">✗ Incorrect. </span>
              )}
              The photodetector absorbs incoming photons and creates electron-hole pairs across its
              junction, producing an electrical current proportional to the optical power.
            </div>
          )}
        </div>

        {/* I. Detector Current */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secI")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  I
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Detector Current Characteristics
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secI ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secI && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>The total detector current contains two components:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>DC Quiescent Current (I_DC):</strong> Produced by the laser DC bias power
                  and ambient background light.
                </li>
                <li>
                  <strong>AC Signal Current (i_ac):</strong> Mirrors the sinusoidal intensity
                  modulation impressed at the transmitter.
                </li>
              </ul>
              <div className="rounded bg-sidebar p-3 text-center text-primary font-bold">
                I_det(t) = I_DC + i_m · sin(2π · f_m · t)
              </div>
            </CardContent>
          )}
        </Card>

        {/* J. Conversion to Voltage */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secJ")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  J
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Conversion to Voltage
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secJ ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secJ && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                Because oscilloscopes and recording instruments measure voltage, the detector
                current must be converted to a voltage signal. In the receiver circuit, the
                photocurrent flows through a precision load resistor R_load:
              </p>
              <div className="rounded bg-sidebar p-3 text-center text-primary font-bold">
                V_load(t) = I_det(t) · R_load
              </div>
              <p>
                For a 1 kΩ load resistor, every 1 mA of detector current yields 1.0 Volt of output.
              </p>
            </CardContent>
          )}
        </Card>

        {/* K. Amplification */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secK")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  K
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Signal Amplification & AC Coupling
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secK ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secK && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                The small signal developed across R_load passes through an AC-coupling blocking
                capacitor (which removes the stationary DC bias offset) and enters a low-noise
                operational amplifier with voltage gain A_v. This boosts the recovered waveform to a
                robust level matching the original generator amplitude.
              </p>
            </CardContent>
          )}
        </Card>

        {/* L. Recovery of Information Signal */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secL")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  L
                </Badge>
                <CardTitle className="font-mono text-xs font-bold text-foreground">
                  Recovery of Information Signal
                </CardTitle>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {expandedSections.secL ? "▼" : "▶"}
              </span>
            </div>
          </CardHeader>
          {expandedSections.secL && (
            <CardContent className="p-4 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
              <p>
                The recovered output signal v_out(t) is displayed on Channel 2 of the dual-trace
                oscilloscope alongside the original input signal on Channel 1.
              </p>
              <div className="rounded bg-sidebar p-3 text-center text-primary font-bold">
                v_out(t) ≈ G_link · v_in(t - τ)
              </div>
              <p>
                When properly biased and aligned, the output waveform maintains the exact frequency,
                shape, and phase relationship of the input information signal, proving faithful
                optical transmission!
              </p>
            </CardContent>
          )}
        </Card>

        {/* THEORY CHECK 4 */}
        <div className="rounded-xl border border-primary/40 bg-sidebar/40 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">❓</span>
            <span className="font-bold text-foreground">
              Check Your Understanding (4/4): What does the detector output voltage represent?
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              {
                id: 0,
                text: "A reconstructed electrical replica of the transmitted information signal",
              },
              { id: 1, text: "The static room temperature of the fiber core" },
              { id: 2, text: "The series resistance of the battery lead wires" },
              { id: 3, text: "The mechanical tension applied to the cable" },
            ].map((opt) => (
              <Button
                key={opt.id}
                variant={
                  check4Answer === opt.id ? (opt.id === 0 ? "default" : "destructive") : "outline"
                }
                onClick={() => {
                  setCheck4Answer(opt.id);
                  if (opt.id === 0 && onCheckAnswered) onCheckAnswered("check4");
                }}
                className="justify-start text-xs font-mono h-auto py-2 px-3 text-left whitespace-normal"
              >
                {opt.text}
              </Button>
            ))}
          </div>

          {check4Answer !== null && (
            <div className="rounded p-3 bg-card border border-border text-[11px] leading-relaxed">
              {check4Answer === 0 ? (
                <span className="text-emerald-400 font-bold">✓ Correct! </span>
              ) : (
                <span className="text-rose-400 font-bold">✗ Incorrect. </span>
              )}
              Because the optical intensity carries the modulation and the detector produces current
              proportional to intensity, the final output voltage is a faithful reconstruction of
              the original input signal.
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="text-xs text-muted-foreground font-mono">
          Theory Sections A–L Studied | Checks Complete
        </div>
        <Button
          onClick={onProceedToPretest}
          className="font-mono text-xs gap-2 bg-primary text-primary-foreground shadow-sm"
        >
          Proceed to Prerequisite Pre-Test Assessment →
        </Button>
      </div>
    </div>
  );
}
