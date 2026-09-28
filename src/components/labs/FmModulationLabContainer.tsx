import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { LABS_CATALOG } from "@/lib/labs/catalog";
import type { Observation, LabProcedureStepDef } from "@/lib/labs/types";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

import TopGuidanceBanner from "@/components/labs/TopGuidanceBanner";
import StepChecklistPanel from "@/components/labs/StepChecklistPanel";
import LabManualSection from "@/components/labs/LabManualSection";
import PrePostTestCard from "@/components/labs/PrePostTestCard";
import GuidedSolutionModal from "@/components/labs/GuidedSolutionModal";
import CompletionCertificateModal from "@/components/labs/CompletionCertificateModal";

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const LAB_META = LABS_CATALOG.find((l) => l.id === "fm-modulation")!;

const PROCEDURE_STEPS: LabProcedureStepDef[] = [
  {
    stepNumber: 1,
    title: "Read Theory & Pass Pre-Test",
    instruction:
      "Understand angle modulation, constant-envelope noise immunity, frequency deviation, and pass the prerequisite test.",
    hints: [
      "Review the manual: what is Carson's Rule for FM bandwidth?",
      "Take the Pre-Test questions on frequency deviation and modulation index.",
      "Score at least 1 correct answer on the Pre-Test.",
    ],
    guidedSolution: {
      title: "Frequency Modulation Theory",
      explanation:
        "In FM, carrier frequency varies with message amplitude: f(t) = fc + kf·m(t). Peak frequency deviation Δf = kf·Am, and modulation index β = Δf / fm. Bandwidth is governed by Carson's Rule: BW = 2(Δf + fm).",
      diagramText: `[Audio fm (1 kHz)] ──> [VCO Frequency Modulator (kf = 5 kHz/V)] ──> [Constant-Envelope FM Wave]`,
      expectedConnections: ["Complete Pre-Test assessment"],
      commonMistakes: ["Thinking FM amplitude varies like AM."],
    },
  },
  {
    stepNumber: 2,
    title: "Configure Unmodulated Carrier (100 kHz)",
    instruction:
      "Set Carrier Center Frequency fc to 100 kHz and verify the nominal VCO center state.",
    hints: [
      "Set Carrier Frequency fc slider to 100 kHz.",
      "Observe the unmodulated sinusoidal carrier on CH2 of the oscilloscope.",
      "Carrier frequency is set to 100 kHz.",
    ],
    guidedSolution: {
      title: "VCO Center Frequency Setup",
      explanation:
        "Without an applied modulating voltage, the VCO oscillates at its free-running center frequency fc = 100 kHz.",
      diagramText: `Carrier fc = 100 kHz | Am = 0 V ==> Unmodulated sine wave`,
      expectedConnections: ["fc = 100 kHz"],
      commonMistakes: ["Applying large audio voltage before establishing the center frequency."],
    },
  },
  {
    stepNumber: 3,
    title: "Apply Modulating Audio & Observe Deviation (Δf = 5 kHz)",
    instruction:
      "Set Modulating Frequency fm = 1.0 kHz and Amplitude Am = 1.0 V. Observe frequency deviation Δf = 5.0 kHz (β = 5.0).",
    hints: [
      "Set Message Frequency fm to 1.0 kHz.",
      "Set Message Amplitude Am to 1.0 V.",
      "Click 'Record Reading' to log the baseline FM trial into the observation table.",
    ],
    guidedSolution: {
      title: "Moderate Modulation Index (β = 5.0)",
      explanation:
        "Δf = kf · Am = 5.0 kHz/V · 1.0 V = 5.0 kHz. Modulation index β = Δf / fm = 5.0 kHz / 1.0 kHz = 5.0. Carson Bandwidth BW = 2(5.0 + 1.0) = 12.0 kHz.",
      diagramText: `fm = 1.0 kHz, Am = 1.0 V ==> Δf = 5.0 kHz | β = 5.0 | Carson BW = 12.0 kHz`,
      expectedConnections: ["Record trial 1 in observation table"],
      commonMistakes: ["Leaving Am at 0 V."],
    },
  },
  {
    stepNumber: 4,
    title: "Increase Audio Amplitude (Am = 2.0 V, β = 10.0)",
    instruction:
      "Increase Am to 2.0 V (Δf = 10.0 kHz, β = 10.0) and observe wideband frequency compression on CH2.",
    hints: [
      "Increase Am slider to 2.0 V.",
      "Notice on the oscilloscope that cycles compress tightly during positive peaks and stretch during negative troughs.",
      "Click 'Record Reading' to log the wideband FM trial.",
    ],
    guidedSolution: {
      title: "Wideband FM Operation",
      explanation:
        "With Am = 2.0 V, Δf doubles to 10.0 kHz, giving β = 10.0. Carson's bandwidth expands to 2(10 + 1) = 22.0 kHz.",
      diagramText: `Am = 2.0 V ==> Δf = 10.0 kHz | β = 10.0 | Carson BW = 22.0 kHz`,
      expectedConnections: ["Record trial 2 in observation table"],
      commonMistakes: ["Not recording after changing Am."],
    },
  },
  {
    stepNumber: 5,
    title: "Test Narrow-band FM Mode (fm = 4.0 kHz, Am = 0.5 V)",
    instruction:
      "Set fm = 4.0 kHz and Am = 0.5 V to produce Narrow-band FM (β = 0.625 < 1), then record reading.",
    hints: [
      "Set fm to 4.0 kHz.",
      "Set Am to 0.5 V.",
      "Notice β is now less than 1 (Narrowband FM, bandwidth approaches 2·fm). Click 'Record Reading'.",
    ],
    guidedSolution: {
      title: "Narrowband FM (NBFM)",
      explanation:
        "When β < 1, only the first pair of sidebands has significant amplitude. Carson's Rule simplifies toward 2·fm, similar to AM spectrum.",
      diagramText: `fm = 4.0 kHz, Am = 0.5 V ==> Δf = 2.5 kHz | β = 0.62 | Carson BW = 13.0 kHz`,
      expectedConnections: ["Record trial 3 in observation table"],
      commonMistakes: ["Confusing narrowband FM with wideband FM."],
    },
  },
  {
    stepNumber: 6,
    title: "Inspect Spectrum & Carson Bandwidth",
    instruction:
      "Switch to the 'Spectrum & Analysis' tab to inspect Bessel sideband distribution around fc.",
    hints: [
      "Open the 'Spectrum & Analysis' tab.",
      "Examine the discrete Bessel sideband lines centered symmetrically about carrier fc.",
      "Review the Carson's Rule bandwidth comparison.",
    ],
    guidedSolution: {
      title: "Bessel Sideband Spectrum",
      explanation:
        "FM spectra theoretically contain infinitely many sidebands spaced by fm: fc ± n·fm. The number of significant sidebands is approximately (β + 1), yielding Carson bandwidth BW = 2·fm(β + 1).",
      diagramText: `Spectrum: [fc - 2fm] [fc - fm] [Carrier fc] [fc + fm] [fc + 2fm]`,
      expectedConnections: ["Spectrum & Analysis tab viewed"],
      commonMistakes: ["Expecting only two sidebands in wideband FM."],
    },
  },
  {
    stepNumber: 7,
    title: "Complete Analysis & Post-Test",
    instruction:
      "Complete the Post-Test assessment to verify understanding of Carson's Rule and earn your Lab Certificate.",
    hints: [
      "Switch to the 'Post-Test' tab.",
      "Answer questions on FM bandwidth and noise immunity.",
      "Score at least 1-2 correct answers to unlock your certificate.",
    ],
    guidedSolution: {
      title: "FM Lab Conclusion",
      explanation:
        "You have experimentally verified that FM maintains constant amplitude while encoding information in frequency variations, providing superior noise immunity at the expense of wider Carson bandwidth.",
      diagramText: `Pre-Test [✓] -> Baseline [✓] -> Wideband [✓] -> Narrowband [✓] -> Spectrum [✓] -> Certificate [✓]`,
      expectedConnections: ["Submit Post-Test"],
      commonMistakes: ["Leaving the post-test unsubmitted."],
    },
  },
];

export default function FmModulationLabContainer() {
  const [activeTab, setActiveTab] = useState<
    "manual" | "pretest" | "experiment" | "table" | "spectrum" | "posttest"
  >("manual");

  // Generator Controls
  const [carrierFreq_kHz, setCarrierFreq_kHz] = useState(100);
  const [messageFreq_kHz, setMessageFreq_kHz] = useState(1.0);
  const [messageAmp_V, setMessageAmp_V] = useState(1.0);
  const kf_kHz_per_V = 5.0; // 5 kHz/V VCO sensitivity

  // Observations
  const [observations, setObservations] = useState<Observation[]>([]);

  // Step state machine
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [attemptsMap, setAttemptsMap] = useState<Record<number, number>>({});
  const [guidedSolutionUnlockedMap, setGuidedSolutionUnlockedMap] = useState<
    Record<number, boolean>
  >({});
  const [activeGuidedModalStepIndex, setActiveGuidedModalStepIndex] = useState<number | null>(null);
  const [showMeActive, setShowMeActive] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Assessment
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);
  const [certificateOpen, setCertificateOpen] = useState(false);

  // Calculations
  const deltaF_kHz = useMemo(() => {
    return Number((kf_kHz_per_V * messageAmp_V).toFixed(2));
  }, [messageAmp_V]);

  const beta = useMemo(() => {
    if (messageFreq_kHz <= 0) return 0;
    return Number((deltaF_kHz / messageFreq_kHz).toFixed(2));
  }, [deltaF_kHz, messageFreq_kHz]);

  const carsonBW_kHz = useMemo(() => {
    return Number((2 * (deltaF_kHz + messageFreq_kHz)).toFixed(2));
  }, [deltaF_kHz, messageFreq_kHz]);

  const fmType = useMemo(() => {
    return beta < 1.0 ? "Narrow-band (NBFM)" : "Wide-band (WBFM)";
  }, [beta]);

  // Spectrum data for Recharts (Bessel-inspired sidebands)
  const spectrumData = useMemo(() => {
    const sidebandCount = Math.min(5, Math.max(1, Math.round(beta + 1)));
    const data: { frequency: string; amplitude: number; fill: string }[] = [];

    for (let n = -sidebandCount; n <= sidebandCount; n++) {
      const freq = carrierFreq_kHz + n * messageFreq_kHz;
      const isCarrier = n === 0;
      // approximate Bessel decay
      const amp = isCarrier
        ? Math.max(0.2, 1.0 / (1 + 0.2 * beta * beta))
        : Math.max(0.05, (1.0 / (Math.abs(n) + 0.5)) * Math.min(1.0, beta / 3));

      data.push({
        frequency: `${freq} kHz ${isCarrier ? "(fc)" : n > 0 ? `(+${n}fm)` : `(${n}fm)`}`,
        amplitude: Number(amp.toFixed(2)),
        fill: isCarrier ? "#f59e0b" : "#38bdf8",
      });
    }

    return data;
  }, [carrierFreq_kHz, messageFreq_kHz, beta]);

  // Validation Info
  const validationInfo = useMemo(() => {
    switch (currentStepIndex) {
      case 0:
        return {
          valid: preScore !== null,
          message:
            preScore !== null
              ? `Pre-Test verified (${preScore}/3 score).`
              : "Review Aim & Theory and complete the Pre-Test.",
          details: "FM angle modulation theory is required.",
        };
      case 1:
        return {
          valid: carrierFreq_kHz === 100,
          message:
            carrierFreq_kHz === 100
              ? "Center carrier verified at 100 kHz."
              : `Set Carrier Frequency fc to 100 kHz. Current: ${carrierFreq_kHz} kHz`,
          details: "Establishes unmodulated center frequency.",
        };
      case 2: {
        const ok = messageFreq_kHz === 1.0 && messageAmp_V === 1.0 && observations.length >= 1;
        return {
          valid: ok,
          message: ok
            ? "Baseline FM measurement recorded."
            : `Set fm = 1.0 kHz, Am = 1.0 V (Δf = 5.0 kHz) and click 'Record Reading'.`,
          details: "Documents baseline moderate modulation index.",
        };
      }
      case 3: {
        const ok = messageAmp_V >= 2.0 && observations.length >= 2;
        return {
          valid: ok,
          message: ok
            ? "Wideband FM measurement recorded."
            : `Increase Am to 2.0 V (Δf = 10.0 kHz, β = 10) and click 'Record Reading'.`,
          details: "Wideband FM expands Carson's bandwidth.",
        };
      }
      case 4: {
        const ok = messageFreq_kHz >= 3.5 && messageAmp_V <= 0.6 && observations.length >= 3;
        return {
          valid: ok,
          message: ok
            ? "Narrowband FM measurement recorded."
            : `Set fm = 4.0 kHz, Am = 0.5 V (β < 1) and click 'Record Reading'.`,
          details: "Narrowband FM confines bandwidth near 2·fm.",
        };
      }
      case 5:
        return {
          valid: activeTab === "spectrum",
          message:
            activeTab === "spectrum"
              ? "Spectrum & Bessel analysis inspected."
              : "Switch to 'Spectrum & Analysis' tab to inspect Bessel sidebands.",
          details: "Carson bandwidth bounds encompass 98% of power.",
        };
      case 6:
        return {
          valid: postScore !== null,
          message:
            postScore !== null
              ? `Post-test passed (${postScore}/3 score)!`
              : "Complete the Post-Test to earn your Certificate.",
          details: "Comprehensive angle modulation assessment.",
        };
      default:
        return { valid: true, message: "Step completed.", details: "" };
    }
  }, [
    currentStepIndex,
    preScore,
    carrierFreq_kHz,
    messageFreq_kHz,
    messageAmp_V,
    observations.length,
    activeTab,
    postScore,
  ]);

  const completedStepIndices = useMemo(() => {
    const list: number[] = [];
    if (preScore !== null && preScore >= 1) list.push(0);
    if (carrierFreq_kHz === 100 && messageFreq_kHz === 5) list.push(1);
    if (observations.length >= 1) list.push(2);
    if (observations.length >= 2) list.push(3);
    if (observations.length >= 3) list.push(4);
    if (activeTab === "spectrum" || observations.length >= 3) list.push(5);
    if (postScore !== null && postScore >= 1) list.push(6);
    return list;
  }, [preScore, carrierFreq_kHz, messageFreq_kHz, observations.length, activeTab, postScore]);

  // Handle Record Reading
  const handleRecordMeasurement = () => {
    const reading: Observation = {
      id: Date.now().toString(),
      trialNumber: observations.length + 1,
      voltage_in: messageAmp_V,
      voltage_diode: deltaF_kHz,
      current_mA: beta,
      power_mW: carsonBW_kHz,
      timestamp: new Date().toLocaleTimeString(),
      status: beta >= 1.0 ? "nominal" : "warning",
    };

    setObservations((prev) => [...prev, reading]);

    if (currentStepIndex === 2) {
      setCurrentStepIndex(3);
    } else if (currentStepIndex === 3) {
      setCurrentStepIndex(4);
    } else if (currentStepIndex === 4) {
      setCurrentStepIndex(5);
    }
  };

  const handleShowHint = (stepIdx: number) => {
    const stepDef = PROCEDURE_STEPS[stepIdx];
    if (!stepDef) return;
    const currentAttempts = attemptsMap[stepIdx] ?? 0;
    const hintIdx = Math.min(currentAttempts, stepDef.hints.length - 1);
    setHintMessage(stepDef.hints[hintIdx]);

    const newAttempts = currentAttempts + 1;
    setAttemptsMap((prev) => ({ ...prev, [stepIdx]: newAttempts }));

    if (newAttempts >= 3) {
      setGuidedSolutionUnlockedMap((prev) => ({ ...prev, [stepIdx]: true }));
    }
  };

  const currentStepDef = PROCEDURE_STEPS[currentStepIndex] || PROCEDURE_STEPS[0];

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
      {/* Top Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/labs"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground font-mono"
          >
            ← Labs Catalog
          </Link>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">📻</span>
            <h1 className="font-mono text-xs font-bold text-foreground">{LAB_META.title}</h1>
            <Badge
              variant="outline"
              className="font-mono text-[10px] text-primary border-primary/40"
            >
              IIT Roorkee Curriculum
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCarrierFreq_kHz(100);
              setMessageFreq_kHz(1.0);
              setMessageAmp_V(1.0);
              setObservations([]);
              setCurrentStepIndex(1);
            }}
            className="h-7 text-xs font-mono"
          >
            ↺ Reset Apparatus
          </Button>

          <Link to="/">
            <Button variant="ghost" size="sm" className="h-7 text-xs font-mono">
              CircuitLab Studio
            </Button>
          </Link>
        </div>
      </header>

      {/* Tabs Bar */}
      <div className="flex h-10 shrink-0 items-center border-b border-border bg-card px-4">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="h-8 bg-transparent p-0 gap-1.5">
            <TabsTrigger value="manual" className="font-mono text-xs h-7">
              📖 Manual & Theory
            </TabsTrigger>
            <TabsTrigger value="pretest" className="font-mono text-xs h-7">
              ❓ Pre-Test {preScore !== null && `(${preScore}/3)`}
            </TabsTrigger>
            <TabsTrigger value="experiment" className="font-mono text-xs h-7">
              🔬 Interactive Experiment
            </TabsTrigger>
            <TabsTrigger value="table" className="font-mono text-xs h-7">
              📊 Observations ({observations.length})
            </TabsTrigger>
            <TabsTrigger value="spectrum" className="font-mono text-xs h-7">
              📈 Spectrum & Analysis
            </TabsTrigger>
            <TabsTrigger value="posttest" className="font-mono text-xs h-7">
              📝 Post-Test {postScore !== null && `(${postScore}/3)`}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Panels */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* TAB 1: MANUAL */}
        {activeTab === "manual" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <LabManualSection
              manual={LAB_META.manual}
              onProceedToPretest={() => setActiveTab("pretest")}
            />
          </div>
        )}

        {/* TAB 2: PRE-TEST */}
        {activeTab === "pretest" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <PrePostTestCard
                type="pretest"
                title="FM Modulation Pre-Test"
                description="Assess prerequisite understanding of frequency deviation, VCO operation, and Carson's rule."
                questions={LAB_META.manual.preTestQuestions}
                onComplete={(score) => {
                  setPreScore(score);
                  if (score >= 1) {
                    if (currentStepIndex === 0) setCurrentStepIndex(1);
                    setActiveTab("experiment");
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 3: EXPERIMENT */}
        {activeTab === "experiment" && (
          <div className="flex h-full w-full flex-col min-h-0">
            <TopGuidanceBanner
              currentStep={currentStepDef}
              totalSteps={PROCEDURE_STEPS.length}
              validation={validationInfo}
              attempts={attemptsMap[currentStepIndex] ?? 0}
              onRecordMeasurement={handleRecordMeasurement}
              onShowHint={() => handleShowHint(currentStepIndex)}
              onShowGuidedSolution={() => setActiveGuidedModalStepIndex(currentStepIndex)}
              onToggleShowMe={() => setShowMeActive((prev) => !prev)}
              showMeActive={showMeActive}
              guidedSolutionUnlocked={guidedSolutionUnlockedMap[currentStepIndex] ?? false}
              canRecord={true}
            />

            {hintMessage && (
              <div className="flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-500">
                <span className="font-mono">{hintMessage}</span>
                <button
                  onClick={() => setHintMessage(null)}
                  className="text-xs font-bold hover:underline"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex min-h-0 flex-1">
              {/* Simulator Center */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6 bg-canvas">
                <div className="mx-auto max-w-4xl space-y-6">
                  {/* Dual-Trace Oscilloscope */}
                  <Card className="border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            Dual-Channel Digital Storage Oscilloscope (DSO)
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-amber-400 font-bold">
                            ● CH1 (Message m(t)): {messageFreq_kHz} kHz, {messageAmp_V} V
                          </span>
                          <span className="text-cyan-400 font-bold">
                            ● CH2 (FM Wave): Δf = ±{deltaF_kHz} kHz (Const Amp)
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      {/* CRT Screen */}
                      <div className="relative h-60 w-full rounded-lg border-2 border-neutral-800 bg-neutral-950 p-2 overflow-hidden shadow-inner">
                        <svg className="w-full h-full" viewBox="0 0 800 220">
                          {/* Grid */}
                          <defs>
                            <pattern
                              id="fm-grid"
                              width="40"
                              height="22"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 40 0 L 0 0 0 22"
                                fill="none"
                                stroke="#222"
                                strokeWidth="1"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#fm-grid)" />
                          <line x1="0" y1="110" x2="800" y2="110" stroke="#333" strokeWidth="1.5" />
                          <line x1="400" y1="0" x2="400" y2="220" stroke="#333" strokeWidth="1.5" />

                          {/* CH1: Modulating Message Wave (Amber) */}
                          <path
                            d={(() => {
                              const points: string[] = [];
                              const cycles = 2;
                              const scaleY = 30 * (messageAmp_V / 2.0);
                              for (let x = 0; x <= 800; x += 4) {
                                const t = x / 800;
                                const y = 55 - Math.cos(2 * Math.PI * cycles * t) * scaleY;
                                points.push(`${x === 0 ? "M" : "L"} ${x} ${y}`);
                              }
                              return points.join(" ");
                            })()}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.6"
                            opacity={0.8}
                          />

                          {/* CH2: FM Modulated Wave (Cyan) - Variable frequency with constant amplitude */}
                          <path
                            d={(() => {
                              const points: string[] = [];
                              const messageCycles = 2;
                              const carrierCycles = 24;
                              const amp = 45; // Constant amplitude!
                              const devFactor = Math.min(14, beta * 1.5);

                              let phase = 0;
                              for (let x = 0; x <= 800; x += 2) {
                                const t = x / 800;
                                // Instantaneous frequency = fc + dev * cos(...)
                                const instFreq =
                                  carrierCycles +
                                  devFactor * Math.cos(2 * Math.PI * messageCycles * t);
                                phase += instFreq * 2 * Math.PI * (2 / 800);
                                const y = 150 - Math.sin(phase) * amp;
                                points.push(
                                  `${x === 0 ? "M" : "L"} ${x} ${Math.max(90, Math.min(210, y))}`,
                                );
                              }
                              return points.join(" ");
                            })()}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="1.8"
                          />
                        </svg>

                        {/* Telemetry banner */}
                        <div className="absolute bottom-2 left-3 flex items-center gap-4 bg-neutral-900/80 px-3 py-1 rounded border border-neutral-700 font-mono text-[10px]">
                          <span className="text-amber-400">CH1: Message (1 kHz)</span>
                          <span className="text-cyan-400">CH2: FM Wave (Constant Env)</span>
                          <span className="text-emerald-400 font-bold">β = {beta}</span>
                          <span className="text-neutral-300">BW (Carson) = {carsonBW_kHz} kHz</span>
                          <Badge
                            variant="outline"
                            className="text-[9px] py-0 h-4 border-cyan-500/40 text-cyan-400"
                          >
                            {fmType}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Frequency Controls Station */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Carrier Generator */}
                    <Card className="border-border bg-card">
                      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                        <CardTitle className="font-mono text-xs font-bold text-foreground">
                          1. VCO Carrier Center Frequency (fc)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 font-mono text-xs">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>VCO Center Frequency (fc):</span>
                            <span className="font-bold text-amber-500">{carrierFreq_kHz} kHz</span>
                          </div>
                          <Slider
                            value={[carrierFreq_kHz]}
                            onValueChange={([val]) => setCarrierFreq_kHz(val)}
                            min={60}
                            max={140}
                            step={10}
                          />
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2 text-muted-foreground text-[11px]">
                          VCO Sensitivity kf = 5.0 kHz/V (Linear Voltage-to-Frequency Conversion)
                        </div>
                      </CardContent>
                    </Card>

                    {/* Modulating Audio Generator */}
                    <Card className="border-border bg-card">
                      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                        <CardTitle className="font-mono text-xs font-bold text-foreground">
                          2. Audio Modulating Generator (m(t))
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 font-mono text-xs">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Message Amplitude (Am):</span>
                            <span className="font-bold text-cyan-400">
                              {messageAmp_V.toFixed(1)} V
                            </span>
                          </div>
                          <Slider
                            value={[messageAmp_V]}
                            onValueChange={([val]) => setMessageAmp_V(val)}
                            min={0.2}
                            max={3.0}
                            step={0.1}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Message Frequency (fm):</span>
                            <span className="font-bold text-foreground">
                              {messageFreq_kHz.toFixed(1)} kHz
                            </span>
                          </div>
                          <Slider
                            value={[messageFreq_kHz]}
                            onValueChange={([val]) => setMessageFreq_kHz(val)}
                            min={0.5}
                            max={5.0}
                            step={0.5}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* FM Mathematical Telemetry Card */}
                  <Card className="border-border bg-card">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex flex-row items-center justify-between">
                      <CardTitle className="font-mono text-xs font-bold text-foreground">
                        3. FM Telemetry & Carson's Bandwidth Synthesis
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] text-emerald-400 border-emerald-500/40"
                      >
                        BW = 2 · (Δf + fm)
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Peak Deviation (Δf)
                          </div>
                          <div className="text-base font-bold text-amber-500 mt-1">
                            ±{deltaF_kHz} kHz
                          </div>
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Modulation Index (β)
                          </div>
                          <div className="text-base font-bold text-cyan-400 mt-1">{beta}</div>
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Carson Bandwidth
                          </div>
                          <div className="text-base font-bold text-emerald-400 mt-1">
                            {carsonBW_kHz} kHz
                          </div>
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Modulation Mode
                          </div>
                          <div className="text-xs font-bold text-foreground mt-2">{fmType}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar Checklist */}
              <div className="w-80 shrink-0 border-l border-border bg-sidebar flex flex-col">
                <StepChecklistPanel
                  steps={PROCEDURE_STEPS}
                  currentStepIndex={currentStepIndex}
                  completedStepIndices={completedStepIndices}
                  onSelectStep={(idx) => setCurrentStepIndex(idx)}
                  attemptsMap={attemptsMap}
                  guidedSolutionUnlockedMap={guidedSolutionUnlockedMap}
                  onShowHint={handleShowHint}
                  onShowGuidedSolution={(idx) => setActiveGuidedModalStepIndex(idx)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OBSERVATION TABLE */}
        {activeTab === "table" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
            <div className="mx-auto max-w-4xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-foreground">
                    Observation Table: FM Frequency Deviation & Carson Bandwidth
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Δf = kf · Am, β = Δf / fm, BW = 2(Δf + fm)
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleRecordMeasurement}
                  className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground"
                >
                  + Record Current State
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-sidebar border-b border-border text-muted-foreground">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Audio Am (V)</th>
                      <th className="p-3">Deviation Δf (kHz)</th>
                      <th className="p-3">Index β</th>
                      <th className="p-3">Carson BW (kHz)</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground">
                          No measurements recorded yet. Switch to the Experiment tab and click
                          'Record Reading'.
                        </td>
                      </tr>
                    ) : (
                      observations.map((obs) => (
                        <tr key={obs.id} className="border-b border-border/50 hover:bg-sidebar/50">
                          <td className="p-3 font-bold">{obs.trialNumber}</td>
                          <td className="p-3">{obs.voltage_in} V</td>
                          <td className="p-3 text-amber-500 font-bold">±{obs.voltage_diode} kHz</td>
                          <td className="p-3 text-cyan-400 font-bold">{obs.current_mA}</td>
                          <td className="p-3 font-bold text-emerald-400">{obs.power_mW} kHz</td>
                          <td className="p-3">
                            <Badge
                              variant={obs.status === "nominal" ? "default" : "outline"}
                              className="text-[10px]"
                            >
                              {obs.status === "nominal" ? "Wideband" : "Narrowband"}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{obs.timestamp}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SPECTRUM & ANALYSIS */}
        {activeTab === "spectrum" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card className="border-border bg-card">
                <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
                  <CardTitle className="font-mono text-xs font-bold text-foreground">
                    Frequency Domain Spectrum (Bessel Functions Harmonic Distribution)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={spectrumData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          dataKey="frequency"
                          stroke="#888"
                          tick={{ fill: "#888", fontSize: 10 }}
                        />
                        <YAxis
                          stroke="#888"
                          tick={{ fill: "#888", fontSize: 11 }}
                          label={{
                            value: "Relative Amplitude Jn(β)",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#888",
                          }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e1e24", borderColor: "#444" }}
                        />
                        <Bar dataKey="amplitude" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-center">
                    <div className="p-3 rounded border border-border bg-sidebar">
                      <span className="text-muted-foreground block text-[10px]">
                        Carson Rule Lower Bound
                      </span>
                      <span className="font-bold text-sky-400 mt-1 block">
                        {(carrierFreq_kHz - carsonBW_kHz / 2).toFixed(1)} kHz
                      </span>
                    </div>

                    <div className="p-3 rounded border border-border bg-sidebar">
                      <span className="text-muted-foreground block text-[10px]">
                        Unmodulated Carrier fc
                      </span>
                      <span className="font-bold text-amber-500 mt-1 block">
                        {carrierFreq_kHz} kHz
                      </span>
                    </div>

                    <div className="p-3 rounded border border-border bg-sidebar">
                      <span className="text-muted-foreground block text-[10px]">
                        Carson Rule Upper Bound
                      </span>
                      <span className="font-bold text-sky-400 mt-1 block">
                        {(carrierFreq_kHz + carsonBW_kHz / 2).toFixed(1)} kHz
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 6: POST-TEST */}
        {activeTab === "posttest" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <PrePostTestCard
                type="posttest"
                title="FM Modulation Post-Test"
                description="Demonstrate comprehension of Carson's rule, frequency deviation, and FM receiver limiters."
                questions={LAB_META.manual.postTestQuestions}
                onComplete={(score) => {
                  setPostScore(score);
                  if (score >= 1) {
                    setCertificateOpen(true);
                  }
                }}
              />

              {postScore !== null && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setCertificateOpen(true)}
                    className="font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    🏆 View Virtual Lab Certificate
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Guided Solution Modal */}
      {activeGuidedModalStepIndex !== null && (
        <GuidedSolutionModal
          isOpen={true}
          onClose={() => setActiveGuidedModalStepIndex(null)}
          step={PROCEDURE_STEPS[activeGuidedModalStepIndex]}
        />
      )}

      {/* Completion Certificate Modal */}
      <CompletionCertificateModal
        isOpen={certificateOpen}
        onClose={() => setCertificateOpen(false)}
        studentName="Engineering Student"
        labTitle={LAB_META.title}
        categoryTitle={LAB_META.categoryTitle}
        date={new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        preTestScore={preScore ?? 0}
        postTestScore={postScore ?? 0}
        observationsCount={observations.length}
      />
    </div>
  );
}
