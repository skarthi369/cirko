import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TheoryQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const THEORY_CHECKS: Record<string, TheoryQuestion> = {
  check1: {
    id: "check1",
    question: "What happens when a laser diode reaches the lasing threshold current (Ith)?",
    options: [
      "Optical output ceases completely",
      "Stimulated emission becomes dominant over cavity losses",
      "The device behaves like an open circuit",
      "Current drops to zero due to negative resistance",
    ],
    correctIndex: 1,
    explanation:
      "At threshold, round-trip optical gain in the cavity precisely balances all internal losses, causing stimulated emission to rapidly dominate and produce intense coherent light.",
  },
  check2: {
    id: "check2",
    question: "Below the threshold current (I < Ith), how does the laser diode operate?",
    options: [
      "It produces high-power collimated coherent beams",
      "It operates similarly to an LED, producing low-intensity incoherent spontaneous light",
      "It remains in reverse breakdown with no light emission",
      "It emits monochromatic microwave frequencies",
    ],
    correctIndex: 1,
    explanation:
      "Below threshold, round-trip gain is insufficient for lasing. The device operates in the spontaneous emission regime, exactly like an ordinary LED.",
  },
  check3: {
    id: "check3",
    question: "What is necessary to achieve stimulated emission in a semiconductor laser?",
    options: [
      "Population inversion (more electrons in conduction band than valence band states)",
      "Zero forward voltage across the p-n junction",
      "High ambient humidity",
      "Reverse bias breakdown voltage exceeding 100 V",
    ],
    correctIndex: 0,
    explanation:
      "Population inversion is a prerequisite for laser amplification; the density of excited electrons in the conduction band must exceed lower energy states so stimulated photon emission exceeds absorption.",
  },
  check4: {
    id: "check4",
    question:
      "Why does optical output power increase much more rapidly with current above threshold?",
    options: [
      "The carrier density clamps at threshold, and all additional injected electrons generate stimulated coherent photons",
      "The series resistance becomes zero",
      "The semiconductor turns into a superconductor",
      "The diode absorbs ambient room light and reflects it",
    ],
    correctIndex: 0,
    explanation:
      "Above threshold, the carrier density remains clamped at the threshold density N_th. Any extra injection current beyond Ith is almost entirely converted into coherent stimulated photons with high differential quantum efficiency.",
  },
};

interface LaserTheorySectionProps {
  onProceedToPretest: () => void;
  onCheckAnswered?: (checkId: string) => void;
}

const THEORY_SECTIONS_LIST = [
  { key: "secA", code: "A", title: "What is a LASER Diode?" },
  { key: "secB", code: "B", title: "p-n Junction Structure" },
  { key: "secC", code: "C", title: "Energy Barrier & Built-In Potential" },
  { key: "secD", code: "D", title: "Electrical Behavior & Rectification" },
  { key: "secE", code: "E", title: "Low-Current LED Region" },
  { key: "secF", code: "F", title: "Threshold Current (Ith)" },
  { key: "secG", code: "G", title: "Population Inversion Condition" },
  { key: "secH", code: "H", title: "Stimulated Emission Mechanism" },
  { key: "secI", code: "I", title: "Coherent Light Generation & Optical Cavity" },
  { key: "secJ", code: "J", title: "Optical Output Above Threshold" },
  { key: "secK", code: "K", title: "LASER Diode Characteristic Curve (L-I)" },
];

export default function LaserTheorySection({
  onProceedToPretest,
  onCheckAnswered,
}: LaserTheorySectionProps) {
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    secA: true,
    secB: true,
    secC: false,
    secD: false,
    secE: true,
    secF: true,
    secG: false,
    secH: true,
    secI: false,
    secJ: true,
    secK: true,
  });

  // Interactive checks answers
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleAll = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    THEORY_SECTIONS_LIST.forEach((s) => {
      next[s.key] = expand;
    });
    setExpandedSections(next);
  };

  const handleSelectOption = (checkKey: string, optIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [checkKey]: optIndex }));
    setShowFeedback((prev) => ({ ...prev, [checkKey]: true }));
    onCheckAnswered?.(checkKey);
  };

  const completedChecksCount = Object.keys(userAnswers).filter(
    (k) => userAnswers[k] === THEORY_CHECKS[k]?.correctIndex,
  ).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
                IIT Roorkee Reference Syllabus
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">• Module 2</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground font-mono mt-1">
              Physical Theory: Semiconductor LASER Diode Operation
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Explore the transition from low-current spontaneous emission (LED mode) to stimulated
              monochromatic lasing (LASER mode) in semiconductor p-n junctions.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0 font-mono text-xs">
            <span className="text-muted-foreground">Theory Checks Mastered:</span>
            <Badge
              variant={completedChecksCount >= 3 ? "default" : "secondary"}
              className="text-xs px-2.5 py-0.5"
            >
              {completedChecksCount} / {Object.keys(THEORY_CHECKS).length} Verified
            </Badge>
          </div>
        </div>
      </div>

      {/* Interactive Theory Progress Checklist Widget (IIT Virtual Lab Format) */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">📋</span>
            <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
              LASER DIODE THEORY CHECKLIST (SECTIONS A–K)
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleAll(true)}
              className="h-6 font-mono text-[11px] px-2 text-primary"
            >
              Expand All
            </Button>
            <span className="text-border">|</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleAll(false)}
              className="h-6 font-mono text-[11px] px-2 text-muted-foreground"
            >
              Collapse All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-xs">
            {THEORY_SECTIONS_LIST.map((sec) => {
              const isOpen = expandedSections[sec.key];
              return (
                <button
                  key={sec.key}
                  onClick={() => toggleSection(sec.key)}
                  className={`flex items-center gap-2 p-2 rounded text-left transition-colors border ${
                    isOpen
                      ? "border-primary/40 bg-primary/10 text-primary font-bold"
                      : "border-border/60 bg-sidebar/30 text-muted-foreground hover:bg-sidebar"
                  }`}
                >
                  <span className={isOpen ? "text-primary" : "text-muted-foreground"}>
                    {isOpen ? "●" : "○"}
                  </span>
                  <span className="truncate">
                    {sec.code}. {sec.title}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Structured Sections A through K */}
      <div className="space-y-4">
        {/* A. What is a LASER diode? */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secA")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary">A.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                What is a LASER Diode?
              </CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {expandedSections.secA ? "▲ Collapse" : "▼ Expand"}
            </span>
          </CardHeader>
          {expandedSections.secA && (
            <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                A <span className="font-semibold text-foreground">LASER</span> (Light Amplification
                by Stimulated Emission of Radiation) diode is a specialized semiconductor p-n
                junction device designed to produce high-intensity, monochromatic, highly
                directional, and{" "}
                <span className="font-semibold text-primary">coherent optical radiation</span>.
              </p>
              <p>
                Unlike standard light sources that emit light isotropically and randomly in phase, a
                semiconductor laser uses an optical resonant cavity (typically a Fabry-Perot cavity)
                to selectively amplify light photons through stimulated optical emission.
              </p>
            </CardContent>
          )}
        </Card>

        {/* B. p-n junction */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secB")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary">B.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                p-n Junction Structure
              </CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {expandedSections.secB ? "▲ Collapse" : "▼ Expand"}
            </span>
          </CardHeader>
          {expandedSections.secB && (
            <CardContent className="p-4 space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>
                A semiconductor laser diode consists of heavily doped{" "}
                <span className="font-semibold text-foreground">p-type</span> (excess holes) and{" "}
                <span className="font-semibold text-foreground">n-type</span> (excess conduction
                electrons) regions forming an active optical waveguide layer between them:
              </p>

              {/* p-n junction diagram */}
              <div className="rounded-lg border border-border bg-neutral-950 p-4 text-center font-mono text-[11px]">
                <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                  <div className="flex-1 bg-blue-950/80 border border-blue-600 rounded p-2 text-blue-200">
                    <div className="font-bold">p-Type Cladding</div>
                    <div className="text-[9px] text-blue-400 mt-1">High Hole Density (p+)</div>
                  </div>
                  <div className="w-24 bg-red-950/90 border border-red-500 rounded p-2 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                    <div className="font-bold">Active Layer</div>
                    <div className="text-[9px] text-red-300 mt-1">Recombination</div>
                  </div>
                  <div className="flex-1 bg-emerald-950/80 border border-emerald-600 rounded p-2 text-emerald-200">
                    <div className="font-bold">n-Type Cladding</div>
                    <div className="text-[9px] text-emerald-400 mt-1">
                      High Electron Density (n+)
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">
                  Cleaved Facet Mirror (R1 ≈ 30%) ◄────── Cavity Length L ──────► Cleaved Facet
                  Mirror (R2 ≈ 30%)
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* C. Energy Barrier */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secC")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary">C.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                Junction & Energy Barrier
              </CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {expandedSections.secC ? "▲ Collapse" : "▼ Expand"}
            </span>
          </CardHeader>
          {expandedSections.secC && (
            <CardContent className="p-4 space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>
                In thermal equilibrium (zero external bias), diffusion of electrons and holes across
                the metallurgical junction forms a space-charge depletion region with a built-in
                potential barrier <span className="font-semibold text-foreground">V_bi</span>.
              </p>
              <p>
                This energy barrier impedes further majority carrier transport until an external
                forward bias voltage{" "}
                <span className="font-mono font-bold text-primary">V_f &gt; V_knee</span> (approx
                1.55 V for 650 nm AlGaInP) is applied to lower the barrier and inject copious
                carriers into the active recombination zone.
              </p>

              {/* Energy Band & Barrier Diagram SVG */}
              <div className="rounded-lg border border-border bg-neutral-950 p-4 font-mono text-xs">
                <div className="text-[11px] font-bold text-neutral-300 text-center mb-2">
                  Energy Band Diagram Under Forward Bias (V_f &gt; 0)
                </div>
                <svg viewBox="0 0 540 130" className="w-full h-auto max-h-36 mx-auto">
                  {/* p-type valence and conduction */}
                  <path
                    d="M 30 40 L 170 40 Q 230 40 270 70 Q 310 100 510 100"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                  <text x="60" y="32" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    Conduction Band (Ec)
                  </text>

                  {/* Valence band */}
                  <path
                    d="M 30 85 L 170 85 Q 230 85 270 115 Q 310 145 510 145"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                  />
                  <text x="60" y="105" fill="#34d399" fontSize="10" fontWeight="bold">
                    Valence Band (Ev)
                  </text>

                  {/* Bandgap Energy Eg */}
                  <line
                    x1="140"
                    y1="42"
                    x2="140"
                    y2="83"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow)"
                  />
                  <text x="148" y="65" fill="#f59e0b" fontSize="10">
                    Eg ≈ 1.91 eV
                  </text>

                  {/* Fermi levels */}
                  <line
                    x1="30"
                    y1="52"
                    x2="200"
                    y2="52"
                    stroke="#e11d48"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <text x="70" y="62" fill="#f43f5e" fontSize="9">
                    E_Fc (Quasi-Fermi Conduction)
                  </text>

                  {/* Energy Barrier reduction arrow */}
                  <rect
                    x="250"
                    y="45"
                    width="40"
                    height="40"
                    rx="4"
                    fill="#3f3f46"
                    fillOpacity="0.4"
                    stroke="#a1a1aa"
                    strokeWidth="1"
                  />
                  <text x="270" y="68" textAnchor="middle" fill="#fef08a" fontSize="10">
                    q(Vbi - Vf)
                  </text>

                  <text x="100" y="125" textAnchor="middle" fill="#94a3b8" fontSize="9">
                    p-Type Region
                  </text>
                  <text x="440" y="125" textAnchor="middle" fill="#94a3b8" fontSize="9">
                    n-Type Region
                  </text>
                </svg>
              </div>
            </CardContent>
          )}
        </Card>

        {/* D. Electrical Behavior */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secD")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary">D.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                Electrical Behavior & Rectification
              </CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {expandedSections.secD ? "▲ Collapse" : "▼ Expand"}
            </span>
          </CardHeader>
          {expandedSections.secD && (
            <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                Electrically, the laser diode behaves like a high-speed rectifier p-n junction
                diode. In reverse bias, only negligible leakage dark current flows.
              </p>
              <p>
                In forward bias, once the forward voltage exceeds the junction knee voltage:
                <br />
                <span className="font-mono text-foreground font-semibold">
                  V_f = V_knee + I_d · R_s
                </span>
                <br />
                The injection current increases rapidly, governed by the series bulk semiconductor
                resistance <span className="font-mono">R_s</span> (~15–20 Ω).
              </p>
            </CardContent>
          )}
        </Card>

        {/* E. Low-current LED Region */}
        <Card className="border-border bg-card border-amber-500/30">
          <CardHeader
            onClick={() => toggleSection("secE")}
            className="cursor-pointer py-3.5 px-4 bg-amber-500/10 hover:bg-amber-500/15 transition-colors border-b border-amber-500/30 flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-amber-500">E.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                Low-Current LED Region (Spontaneous Emission)
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-[10px] text-amber-500 border-amber-500/40"
            >
              I &lt; Ith
            </Badge>
          </CardHeader>
          {expandedSections.secE && (
            <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                When small injection currents (e.g., 0 to 15 mA) are applied, the rate of optical
                amplification is lower than the cavity losses (absorption, scattering, and facet
                leakage).
              </p>
              <p>Under this sub-threshold condition:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Light is generated solely by{" "}
                  <span className="font-semibold text-foreground">spontaneous recombination</span>{" "}
                  of electron-hole pairs.
                </li>
                <li>
                  The emitted optical power is relatively small (typically &lt; 0.5 mW) and grows
                  very slowly with current (slope efficiency ~0.045 mW/mA).
                </li>
                <li>
                  The light is <span className="font-semibold text-amber-400">incoherent</span>, has
                  broad spectral linewidth (~30 nm), and exhibits wide spatial beam divergence
                  (35°), behaving indistinguishably from a conventional LED.
                </li>
              </ul>
            </CardContent>
          )}
        </Card>

        {/* Theory Check 1 */}
        <div className="rounded-lg border border-primary/40 bg-sidebar p-4 space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary">
            <span>🧠 Check Your Understanding: LED vs Laser Operation</span>
          </div>
          <p className="text-xs text-foreground font-medium">{THEORY_CHECKS.check2.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEORY_CHECKS.check2.options.map((opt, idx) => {
              const isSelected = userAnswers.check2 === idx;
              const isCorrect = idx === THEORY_CHECKS.check2.correctIndex;
              let btnClass = "text-left text-xs font-mono h-auto py-2 px-3 justify-start";
              if (showFeedback.check2) {
                if (isCorrect) btnClass += " bg-emerald-600 text-white hover:bg-emerald-600";
                else if (isSelected) btnClass += " bg-rose-600 text-white hover:bg-rose-600";
              }

              return (
                <Button
                  key={idx}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleSelectOption("check2", idx)}
                  className={btnClass}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                </Button>
              );
            })}
          </div>
          {showFeedback.check2 && (
            <div className="p-2.5 rounded bg-card border border-border text-[11px] text-muted-foreground">
              {userAnswers.check2 === THEORY_CHECKS.check2.correctIndex ? (
                <span className="text-emerald-400 font-bold">✓ Correct! </span>
              ) : (
                <span className="text-rose-400 font-bold">✗ Not quite. </span>
              )}
              {THEORY_CHECKS.check2.explanation}
            </div>
          )}
        </div>

        {/* F. Threshold Current */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secF")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary">F.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                Threshold Current (I_th)
              </CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {expandedSections.secF ? "▲ Collapse" : "▼ Expand"}
            </span>
          </CardHeader>
          {expandedSections.secF && (
            <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                The <span className="font-semibold text-foreground">Threshold Current (I_th)</span>{" "}
                is the critical operating point at which optical gain from stimulated emission
                precisely balances total cavity loss:
              </p>
              <div className="rounded border border-border bg-neutral-950 p-2.5 font-mono text-[11px] text-center text-primary">
                g_th = α_internal + (1 / 2L) · ln(1 / (R_1 · R_2))
              </div>
              <p>
                Where <span className="font-mono">α_internal</span> represents internal
                absorption/scattering, <span className="font-mono">L</span> is cavity length, and{" "}
                <span className="font-mono">R_1, R_2</span> are facet mirror reflectivities. At this
                threshold current (typically ~18 mA for 650 nm devices), optical feedback initiates
                laser oscillation.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Theory Check 1: Lasing Threshold */}
        <div className="rounded-lg border border-primary/40 bg-sidebar p-4 space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary">
            <span>🧠 Check Your Understanding: Lasing Threshold Condition</span>
          </div>
          <p className="text-xs text-foreground font-medium">{THEORY_CHECKS.check1.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEORY_CHECKS.check1.options.map((opt, idx) => {
              const isSelected = userAnswers.check1 === idx;
              const isCorrect = idx === THEORY_CHECKS.check1.correctIndex;
              let btnClass = "text-left text-xs font-mono h-auto py-2 px-3 justify-start";
              if (showFeedback.check1) {
                if (isCorrect) btnClass += " bg-emerald-600 text-white hover:bg-emerald-600";
                else if (isSelected) btnClass += " bg-rose-600 text-white hover:bg-rose-600";
              }

              return (
                <Button
                  key={idx}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleSelectOption("check1", idx)}
                  className={btnClass}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                </Button>
              );
            })}
          </div>
          {showFeedback.check1 && (
            <div className="p-2.5 rounded bg-card border border-border text-[11px] text-muted-foreground">
              {userAnswers.check1 === THEORY_CHECKS.check1.correctIndex ? (
                <span className="text-emerald-400 font-bold">✓ Correct! </span>
              ) : (
                <span className="text-rose-400 font-bold">✗ Incorrect. </span>
              )}
              {THEORY_CHECKS.check1.explanation}
            </div>
          )}
        </div>

        {/* G. Population Inversion */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secG")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary">G.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                Population Inversion Condition
              </CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {expandedSections.secG ? "▲ Collapse" : "▼ Expand"}
            </span>
          </CardHeader>
          {expandedSections.secG && (
            <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                Under ordinary thermal conditions, electrons predominantly occupy lower valence
                energy states. To produce net optical gain rather than net absorption, a condition
                called <span className="font-semibold text-foreground">Population Inversion</span>{" "}
                must be maintained.
              </p>
              <p>
                In heavily doped degenerate semiconductors, this requires the quasi-Fermi energy
                separation to exceed the optical bandgap energy:
                <br />
                <span className="font-mono text-primary font-bold">
                  (E_Fc - E_Fv) &gt; h·ν &gt; E_g
                </span>
                <br />
                This condition guarantees that incoming photons trigger more stimulated emission
                events than absorption events.
              </p>
            </CardContent>
          )}
        </Card>

        {/* H. Stimulated Emission */}
        <Card className="border-border bg-card border-primary/30">
          <CardHeader
            onClick={() => toggleSection("secH")}
            className="cursor-pointer py-3.5 px-4 bg-primary/10 hover:bg-primary/15 transition-colors border-b border-primary/30 flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary">H.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                Stimulated Emission Mechanism
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-[10px] text-primary border-primary/40"
            >
              Coherent Amplification
            </Badge>
          </CardHeader>
          {expandedSections.secH && (
            <CardContent className="p-4 space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>
                In <span className="font-semibold text-foreground">stimulated emission</span>, an
                incident photon of energy <span className="font-mono">h·ν ≈ E_g</span> perturbates
                an excited electron in the conduction band, causing it to recombine with a hole in
                the valence band.
              </p>
              <p>
                This recombination releases a{" "}
                <span className="font-semibold text-primary">second photon</span> possessing the
                exact same:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-center">
                <div className="p-2 rounded bg-sidebar border border-border">1. Wavelength (λ)</div>
                <div className="p-2 rounded bg-sidebar border border-border">2. Phase (φ)</div>
                <div className="p-2 rounded bg-sidebar border border-border">3. Polarization</div>
                <div className="p-2 rounded bg-sidebar border border-border">4. Direction</div>
              </div>

              {/* Stimulated Emission Photon Diagram */}
              <div className="rounded-lg border border-border bg-neutral-950 p-4 font-mono text-xs text-center">
                <div className="text-[11px] font-bold text-neutral-300 mb-2">
                  Photon Multiplication Cascade via Stimulated Recombination
                </div>
                <svg viewBox="0 0 520 100" className="w-full h-auto max-h-28 mx-auto">
                  {/* Energy levels */}
                  <line x1="30" y1="25" x2="220" y2="25" stroke="#38bdf8" strokeWidth="2" />
                  <text x="40" y="18" fill="#38bdf8" fontSize="9">
                    Conduction Band (Excited Level E2)
                  </text>
                  <line x1="30" y1="75" x2="220" y2="75" stroke="#34d399" strokeWidth="2" />
                  <text x="40" y="90" fill="#34d399" fontSize="9">
                    Valence Band (Ground Level E1)
                  </text>

                  {/* Incident photon wave */}
                  <path
                    d="M 10 50 Q 20 40 30 50 T 50 50 T 70 50"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <polygon points="70,50 63,46 63,54" fill="#ef4444" />
                  <text x="25" y="42" fill="#f87171" fontSize="8">
                    Trigger (hν)
                  </text>

                  {/* Electron drop */}
                  <circle
                    cx="120"
                    cy="25"
                    r="5"
                    fill="#facc15"
                    stroke="#ca8a04"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 120 32 L 120 68"
                    stroke="#facc15"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                  <polygon points="120,70 116,62 124,62" fill="#facc15" />

                  {/* Emitted Twin Photons */}
                  <path
                    d="M 140 40 Q 155 30 170 40 T 200 40 T 230 40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <polygon points="230,40 223,36 223,44" fill="#ef4444" />
                  <text x="235" y="43" fill="#f87171" fontSize="8">
                    Photon 1 (hν)
                  </text>

                  <path
                    d="M 140 60 Q 155 50 170 60 T 200 60 T 230 60"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <polygon points="230,60 223,56 223,64" fill="#ef4444" />
                  <text x="235" y="63" fill="#f87171" fontSize="8">
                    Photon 2 (hν, Coherent)
                  </text>

                  {/* Cascade text */}
                  <rect
                    x="330"
                    y="25"
                    width="170"
                    height="50"
                    rx="6"
                    fill="#18181b"
                    stroke="#3f3f46"
                    strokeWidth="1"
                  />
                  <text
                    x="415"
                    y="45"
                    textAnchor="middle"
                    fill="#facc15"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    Avalanche Gain
                  </text>
                  <text x="415" y="62" textAnchor="middle" fill="#94a3b8" fontSize="9">
                    N Photons → 2N Photons
                  </text>
                </svg>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Theory Check 3: Stimulated Emission Requirement */}
        <div className="rounded-lg border border-primary/40 bg-sidebar p-4 space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary">
            <span>🧠 Check Your Understanding: Stimulated Emission Condition</span>
          </div>
          <p className="text-xs text-foreground font-medium">{THEORY_CHECKS.check3.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEORY_CHECKS.check3.options.map((opt, idx) => {
              const isSelected = userAnswers.check3 === idx;
              const isCorrect = idx === THEORY_CHECKS.check3.correctIndex;
              let btnClass = "text-left text-xs font-mono h-auto py-2 px-3 justify-start";
              if (showFeedback.check3) {
                if (isCorrect) btnClass += " bg-emerald-600 text-white hover:bg-emerald-600";
                else if (isSelected) btnClass += " bg-rose-600 text-white hover:bg-rose-600";
              }

              return (
                <Button
                  key={idx}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleSelectOption("check3", idx)}
                  className={btnClass}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                </Button>
              );
            })}
          </div>
          {showFeedback.check3 && (
            <div className="p-2.5 rounded bg-card border border-border text-[11px] text-muted-foreground">
              {userAnswers.check3 === THEORY_CHECKS.check3.correctIndex ? (
                <span className="text-emerald-400 font-bold">✓ Correct! </span>
              ) : (
                <span className="text-rose-400 font-bold">✗ Incorrect. </span>
              )}
              {THEORY_CHECKS.check3.explanation}
            </div>
          )}
        </div>

        {/* I. Coherent Light Generation */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secI")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary">I.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                Coherent Light Generation & Optical Feedback
              </CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {expandedSections.secI ? "▲ Collapse" : "▼ Expand"}
            </span>
          </CardHeader>
          {expandedSections.secI && (
            <CardContent className="p-4 space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>
                Cleaved crystalline end facets of the semiconductor chip act as partially reflecting
                mirrors (~30% Fresnel reflectivity due to high refractive index difference between
                semiconductor <span className="font-mono">n ≈ 3.5</span> and air{" "}
                <span className="font-mono">n ≈ 1</span>).
              </p>
              <p>
                Photons traveling perpendicular to these facets bounce back and forth through the
                active gain region, building intense constructive interference exclusively for
                discrete longitudinal cavity modes satisfying:
                <br />
                <span className="font-mono text-primary font-bold">2 · n · L = m · λ</span>
              </p>

              {/* Optical Cavity Diagram SVG */}
              <div className="rounded-lg border border-border bg-neutral-950 p-4 font-mono text-xs text-center">
                <div className="text-[11px] font-bold text-neutral-300 mb-2">
                  Fabry-Perot Resonant Cavity Feedback
                </div>
                <svg viewBox="0 0 540 100" className="w-full h-auto max-h-28 mx-auto">
                  {/* Left Facet Mirror */}
                  <rect
                    x="70"
                    y="20"
                    width="14"
                    height="60"
                    fill="#a1a1aa"
                    stroke="#e4e4e7"
                    strokeWidth="1.5"
                  />
                  <text x="77" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="9">
                    R1 ≈ 30%
                  </text>

                  {/* Active Gain Medium */}
                  <rect
                    x="84"
                    y="30"
                    width="372"
                    height="40"
                    fill="#7f1d1d"
                    fillOpacity="0.4"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <text
                    x="270"
                    y="55"
                    textAnchor="middle"
                    fill="#fca5a5"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    Active Waveguide Gain Medium (L ≈ 300 µm)
                  </text>

                  {/* Right Facet Mirror */}
                  <rect
                    x="456"
                    y="20"
                    width="14"
                    height="60"
                    fill="#a1a1aa"
                    stroke="#e4e4e7"
                    strokeWidth="1.5"
                  />
                  <text x="463" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="9">
                    R2 ≈ 30%
                  </text>

                  {/* Internal round-trip wave */}
                  <path
                    d="M 90 40 L 450 40 L 90 60 L 450 60"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Transmitted output beam */}
                  <polygon points="475,44 530,36 530,64 475,56" fill="#ef4444" fillOpacity="0.7" />
                  <text x="500" y="76" textAnchor="middle" fill="#f87171" fontSize="9">
                    Laser Beam
                  </text>
                </svg>
              </div>
            </CardContent>
          )}
        </Card>

        {/* J. Optical Output Above Threshold */}
        <Card className="border-border bg-card border-emerald-500/30">
          <CardHeader
            onClick={() => toggleSection("secJ")}
            className="cursor-pointer py-3.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors border-b border-emerald-500/30 flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-emerald-500">J.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                Optical Output Above Threshold (Lasing Regime)
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-[10px] text-emerald-500 border-emerald-500/40"
            >
              I &gt; Ith
            </Badge>
          </CardHeader>
          {expandedSections.secJ && (
            <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                When injection current exceeds threshold (
                <span className="font-mono font-bold text-foreground">I &gt; I_th</span>):
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Carrier density clamps at threshold (<span className="font-mono">N ≈ N_th</span>),
                  meaning carrier lifetime drops from nanoseconds (spontaneous) to picoseconds
                  (stimulated).
                </li>
                <li>
                  Every additional injected electron-hole pair is almost immediately converted into
                  an emitted laser photon.
                </li>
                <li>
                  Optical output power increases{" "}
                  <span className="font-semibold text-emerald-400">
                    much more rapidly and linearly
                  </span>
                  :
                  <br />
                  <span className="font-mono text-foreground font-bold">
                    P_opt = P_spon + η · (I - I_th)
                  </span>
                </li>
                <li>
                  The slope efficiency{" "}
                  <span className="font-mono font-bold text-primary">η = ΔP / ΔI</span> is
                  substantially higher (typically ~0.35 mW/mA vs ~0.045 mW/mA below threshold).
                </li>
              </ul>
            </CardContent>
          )}
        </Card>

        {/* Theory Check 4: Rapid Post-Threshold Growth */}
        <div className="rounded-lg border border-primary/40 bg-sidebar p-4 space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary">
            <span>🧠 Check Your Understanding: Slope Efficiency & Carrier Clamping</span>
          </div>
          <p className="text-xs text-foreground font-medium">{THEORY_CHECKS.check4.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEORY_CHECKS.check4.options.map((opt, idx) => {
              const isSelected = userAnswers.check4 === idx;
              const isCorrect = idx === THEORY_CHECKS.check4.correctIndex;
              let btnClass = "text-left text-xs font-mono h-auto py-2 px-3 justify-start";
              if (showFeedback.check4) {
                if (isCorrect) btnClass += " bg-emerald-600 text-white hover:bg-emerald-600";
                else if (isSelected) btnClass += " bg-rose-600 text-white hover:bg-rose-600";
              }

              return (
                <Button
                  key={idx}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleSelectOption("check4", idx)}
                  className={btnClass}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                </Button>
              );
            })}
          </div>
          {showFeedback.check4 && (
            <div className="p-2.5 rounded bg-card border border-border text-[11px] text-muted-foreground">
              {userAnswers.check4 === THEORY_CHECKS.check4.correctIndex ? (
                <span className="text-emerald-400 font-bold">✓ Correct! </span>
              ) : (
                <span className="text-rose-400 font-bold">✗ Incorrect. </span>
              )}
              {THEORY_CHECKS.check4.explanation}
            </div>
          )}
        </div>

        {/* K. LASER Characteristic Curve */}
        <Card className="border-border bg-card">
          <CardHeader
            onClick={() => toggleSection("secK")}
            className="cursor-pointer py-3.5 px-4 bg-sidebar/50 hover:bg-sidebar transition-colors border-b border-border flex flex-row items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-primary">K.</span>
              <CardTitle className="font-mono text-xs font-bold text-foreground">
                Complete LASER Diode Characteristic Curve (L-I)
              </CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {expandedSections.secK ? "▲ Collapse" : "▼ Expand"}
            </span>
          </CardHeader>
          {expandedSections.secK && (
            <CardContent className="p-4 space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>
                The complete Light vs Current (L-I) curve exhibits two distinct linear regimes
                joined by a characteristic inflection point (kink) at the threshold current:
              </p>

              {/* ASCII / Visual Graph Schematic */}
              <div className="rounded-lg border border-border bg-neutral-950 p-4 font-mono text-[11px] space-y-2">
                <div className="text-amber-400 font-bold">Power P (mW)</div>
                <div className="pl-4 text-neutral-300">
                  {"   ^"}
                  <br />
                  {"   |                         /  [STIMULATED LASER REGION]"}
                  <br />
                  {"   |                        /   Slope η ≈ 0.35 mW/mA"}
                  <br />
                  {"   |                       /"}
                  <br />
                  {"   |                      /"}
                  <br />
                  {"   |              _______/  ◄─── Kink at Threshold Current Ith ≈ 18 mA"}
                  <br />
                  {"   |  ___________/  [SPONTANEOUS LED REGION]"}
                  <br />
                  {"   | /              Slope η_spon ≈ 0.045 mW/mA"}
                  <br />
                  {"   +-------------------------------------> Current I (mA)"}
                  <br />
                  {"   0                 18.0 mA"}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground font-mono">
          Reviewed all theoretical principles (Sections A–K)
        </div>
        <Button
          onClick={onProceedToPretest}
          className="font-mono text-xs gap-2 bg-primary text-primary-foreground"
        >
          Proceed to Pre-Test Assessment →
        </Button>
      </div>
    </div>
  );
}
