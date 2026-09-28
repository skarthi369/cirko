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
import SamplingSubExperiments, { type SamplingSubExpType } from "./sampling/SamplingSubExperiments";

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const LAB_META = LABS_CATALOG.find((l) => l.id === "sampling-pam")!;

const PROCEDURE_STEPS: LabProcedureStepDef[] = [
  {
    stepNumber: 1,
    title: "Read Theory & Pass Pre-Test",
    instruction:
      "Understand the Nyquist-Shannon Sampling Theorem, aliasing foldover, reconstruction filtering, and pass the prerequisite test.",
    hints: [
      "Review the manual: what is the Nyquist criterion (fs >= 2·fm)?",
      "Take the Pre-Test questions on minimum sampling rate and alias frequencies.",
      "Score at least 1 correct answer on the Pre-Test.",
    ],
    guidedSolution: {
      title: "Nyquist-Shannon Sampling Criterion",
      explanation:
        "To reconstruct a continuous signal of bandwidth fm, the sampling rate must satisfy fs ≥ 2·fm. If fs < 2·fm, high frequencies fold into baseband as alias frequencies f_alias = |fs - fm|.",
      diagramText: `[Analog Audio fm] ──> [Sample & Hold Switch (Clock fs)] ──> [Low-Pass Filter] ──> [Reconstructed Output]`,
      expectedConnections: ["Complete Pre-Test assessment"],
      commonMistakes: [
        "Assuming sampling below 2·fm only reduces volume rather than creating false frequencies.",
      ],
    },
  },
  {
    stepNumber: 2,
    title: "Configure Oversampling (fs = 10 kHz, fm = 1 kHz)",
    instruction:
      "Set Message Frequency fm = 1.0 kHz and Sampling Clock fs = 10.0 kHz (fs = 10·fm >> 2·fm).",
    hints: [
      "Set Message Frequency fm to 1.0 kHz.",
      "Set Sampling Clock fs to 10.0 kHz.",
      "Observe that fs / (2·fm) = 5.0 (well above the Nyquist rate).",
    ],
    guidedSolution: {
      title: "Oversampled Regime (fs >> 2·fm)",
      explanation:
        "At 10 kHz, the sampler captures 10 points per sine cycle. High sampling harmonics are easily rejected by the low-pass reconstruction filter.",
      diagramText: `fm = 1.0 kHz, fs = 10.0 kHz ==> Nyquist Ratio = 5.0x (Clean Reconstruction)`,
      expectedConnections: ["fm = 1.0 kHz", "fs = 10.0 kHz"],
      commonMistakes: ["Setting sampling frequency below 2 kHz during oversampling step."],
    },
  },
  {
    stepNumber: 3,
    title: "Record Oversampled Reading & Inspect CH2",
    instruction:
      "Observe the clean 1.0 kHz reconstructed sine wave on CH2 and click 'Record Reading' to log trial 1.",
    hints: [
      "Click 'Record Reading' in the guidance banner to save trial 1.",
      "Check oscilloscope CH2: the reconstructed signal matches the input 1 kHz sine wave perfectly.",
      "Log the oversampled measurement.",
    ],
    guidedSolution: {
      title: "Clean Reconstruction Logging",
      explanation:
        "The 4th-order Butterworth low-pass filter eliminates discrete sampling clock pulses, restoring the original smooth analog waveform without aliasing.",
      diagramText: `Trial 1: fm = 1.0 kHz | fs = 10.0 kHz | Alias: None | Status: Nominal`,
      expectedConnections: ["Trial 1 recorded in observation table"],
      commonMistakes: ["Forgetting to record before moving sliders."],
    },
  },
  {
    stepNumber: 4,
    title: "Test Critical Nyquist Rate (fs = 2.0 kHz)",
    instruction:
      "Set Sampling Clock fs to 2.0 kHz (exactly fs = 2·fm) and record the critical boundary measurement.",
    hints: [
      "Decrease the fs slider to 2.0 kHz.",
      "Notice fs is exactly twice fm (2 samples per cycle, the theoretical theoretical minimum).",
      "Click 'Record Reading' to save trial 2.",
    ],
    guidedSolution: {
      title: "Critical Nyquist Rate",
      explanation:
        "At fs = 2·fm, the sampling sideband (fs - fm = 1.0 kHz) directly abuts the message frequency. In theory, an ideal brick-wall filter is required.",
      diagramText: `fm = 1.0 kHz, fs = 2.0 kHz ==> Critical Nyquist Rate (fs = 2·fm)`,
      expectedConnections: ["fs = 2.0 kHz", "Trial 2 recorded"],
      commonMistakes: ["Leaving fs higher than 2.0 kHz."],
    },
  },
  {
    stepNumber: 5,
    title: "Induce Aliasing Distortion (fs = 1.4 kHz < 2·fm)",
    instruction:
      "Decrease fs to 1.4 kHz (sub-Nyquist) and observe the false folded alias tone f_alias = |1.4 - 1.0| = 400 Hz.",
    hints: [
      "Set Sampling Clock fs to 1.4 kHz.",
      "Notice the red ALIASING WARNING banner.",
      "Look at oscilloscope CH2: the reconstructed waveform has dropped to 400 Hz (a false alias beat frequency!). Click 'Record Reading'.",
    ],
    guidedSolution: {
      title: "Spectral Foldover Aliasing Distortion",
      explanation:
        "When fs < 2·fm (1.4 kHz < 2.0 kHz), the lower sideband (fs - fm = 0.4 kHz) folds into the audible passband. The receiver incorrectly reconstructs a 400 Hz tone that was never in the original signal!",
      diagramText: `fs = 1.4 kHz, fm = 1.0 kHz ==> f_alias = |1.4 - 1.0| = 400 Hz [IRREVERSIBLE ALIASING]`,
      expectedConnections: ["fs = 1.4 kHz", "Trial 3 recorded with aliasing"],
      commonMistakes: ["Believing the original signal can still be recovered after aliasing."],
    },
  },
  {
    stepNumber: 6,
    title: "Inspect Frequency Spectrum & Foldover",
    instruction:
      "Switch to the 'Spectrum & Analysis' tab to inspect the spectral overlap and alias peak.",
    hints: [
      "Open the 'Spectrum & Analysis' tab.",
      "Observe the spectral lines: message tone fm, sampling clock fs, and the folded alias tone.",
      "Review the anti-aliasing filter recommendations.",
    ],
    guidedSolution: {
      title: "Frequency Domain Sampling Representation",
      explanation:
        "Sampling corresponds to convolving the baseband signal with a Dirac comb: S(f) = (1/Ts) Σ M(f - n·fs). Aliasing happens when spectral copies overlap.",
      diagramText: `Spectrum: [Alias: 0.4 kHz] ─── [Message: 1.0 kHz] ─── [Sampling Clock: 1.4 kHz]`,
      expectedConnections: ["Spectrum & Analysis tab viewed"],
      commonMistakes: ["Confusing the sampling clock harmonic with the alias tone."],
    },
  },
  {
    stepNumber: 7,
    title: "Complete Analysis & Post-Test",
    instruction:
      "Complete the Post-Test assessment to verify mastery of sampling theory and unlock your Virtual Lab Certificate.",
    hints: [
      "Switch to the 'Post-Test' tab.",
      "Answer questions on Nyquist rate and anti-aliasing filtering.",
      "Score at least 1-2 correct answers to earn your completion certificate.",
    ],
    guidedSolution: {
      title: "Sampling Lab Conclusion",
      explanation:
        "You have experimentally verified the Nyquist-Shannon Sampling Theorem, demonstrated that fs ≥ 2·fm prevents aliasing, and observed how sub-Nyquist sampling creates false alias tones.",
      diagramText: `Pre-Test [✓] -> Oversampling [✓] -> Nyquist [✓] -> Aliasing [✓] -> Spectrum [✓] -> Certificate [✓]`,
      expectedConnections: ["Submit Post-Test"],
      commonMistakes: ["Leaving the post-test unsubmitted."],
    },
  },
];

export default function SamplingPamLabContainer() {
  const [activeTab, setActiveTab] = useState<
    "manual" | "pretest" | "experiment" | "table" | "spectrum" | "posttest"
  >("manual");

  // Generator Controls
  const [messageFreq_kHz, setMessageFreq_kHz] = useState(1.0);
  const [samplingFreq_kHz, setSamplingFreq_kHz] = useState(10.0);
  const [pulseDuty_pct, setPulseDuty_pct] = useState(30);
  const [subExpMode, setSubExpMode] = useState<SamplingSubExpType>("nyquist");

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
  const nyquistRate_kHz = useMemo(() => {
    return Number((2 * messageFreq_kHz).toFixed(2));
  }, [messageFreq_kHz]);

  const nyquistRatio = useMemo(() => {
    if (nyquistRate_kHz <= 0) return 0;
    return Number((samplingFreq_kHz / nyquistRate_kHz).toFixed(2));
  }, [samplingFreq_kHz, nyquistRate_kHz]);

  const isAliasing = useMemo(() => {
    return samplingFreq_kHz < nyquistRate_kHz - 0.05;
  }, [samplingFreq_kHz, nyquistRate_kHz]);

  const aliasFrequency_kHz = useMemo(() => {
    if (!isAliasing) return 0;
    return Number(Math.abs(samplingFreq_kHz - messageFreq_kHz).toFixed(2));
  }, [isAliasing, samplingFreq_kHz, messageFreq_kHz]);

  const reconstructedFreq_kHz = useMemo(() => {
    if (isAliasing) return aliasFrequency_kHz;
    return messageFreq_kHz;
  }, [isAliasing, aliasFrequency_kHz, messageFreq_kHz]);

  // Spectrum data for Recharts
  const spectrumData = useMemo(() => {
    const data: { frequency: string; amplitude: number; fill: string }[] = [];

    // Message frequency
    data.push({
      frequency: `${messageFreq_kHz} kHz (Baseband)`,
      amplitude: 1.0,
      fill: "#38bdf8",
    });

    // If aliasing, show folded alias peak
    if (isAliasing && aliasFrequency_kHz > 0) {
      data.push({
        frequency: `${aliasFrequency_kHz} kHz (ALIAS)`,
        amplitude: 0.85,
        fill: "#f43f5e",
      });
    }

    // Sampling frequency
    data.push({
      frequency: `${samplingFreq_kHz} kHz (Sampling Clock fs)`,
      amplitude: 0.9,
      fill: "#f59e0b",
    });

    // Lower Sideband fs - fm
    const lsb = Number(Math.abs(samplingFreq_kHz - messageFreq_kHz).toFixed(2));
    if (!isAliasing) {
      data.push({
        frequency: `${lsb} kHz (fs - fm)`,
        amplitude: 0.5,
        fill: "#a855f7",
      });
    }

    // Upper Sideband fs + fm
    const usb = Number((samplingFreq_kHz + messageFreq_kHz).toFixed(2));
    data.push({
      frequency: `${usb} kHz (fs + fm)`,
      amplitude: 0.5,
      fill: "#a855f7",
    });

    return data;
  }, [messageFreq_kHz, samplingFreq_kHz, isAliasing, aliasFrequency_kHz]);

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
          details: "Nyquist sampling theorem prerequisites.",
        };
      case 1: {
        const ok = messageFreq_kHz === 1.0 && samplingFreq_kHz >= 8.0;
        return {
          valid: ok,
          message: ok
            ? "Oversampling verified (fs = 10 kHz, fm = 1 kHz)."
            : `Set fm = 1.0 kHz and fs = 10.0 kHz. Current fs = ${samplingFreq_kHz} kHz`,
          details: "fs >= 2·fm ensures alias-free sampling.",
        };
      }
      case 2: {
        const ok = observations.length >= 1;
        return {
          valid: ok,
          message: ok
            ? "Oversampled measurement recorded."
            : "Observe clean sine wave on CH2 and click 'Record Reading'.",
          details: "Logs the baseline oversampled state.",
        };
      }
      case 3: {
        const ok = samplingFreq_kHz >= 1.9 && samplingFreq_kHz <= 2.1 && observations.length >= 2;
        return {
          valid: ok,
          message: ok
            ? "Critical Nyquist rate recorded (fs = 2.0 kHz)."
            : `Set fs = 2.0 kHz (exactly 2·fm) and click 'Record Reading'. Current: ${samplingFreq_kHz} kHz`,
          details: "The boundary condition of the sampling theorem.",
        };
      }
      case 4: {
        const ok = isAliasing && observations.length >= 3;
        return {
          valid: ok,
          message: ok
            ? `Aliasing recorded (Alias f = ${aliasFrequency_kHz} kHz).`
            : `Set fs = 1.4 kHz (< 2·fm) to induce aliasing and click 'Record Reading'.`,
          details: "Observe the false beat frequency on oscilloscope CH2.",
        };
      }
      case 5:
        return {
          valid: activeTab === "spectrum",
          message:
            activeTab === "spectrum"
              ? "Spectrum & aliasing foldover inspected."
              : "Switch to 'Spectrum & Analysis' tab to inspect the folded alias peak.",
          details: "Frequency foldover occurs into the baseband.",
        };
      case 6:
        return {
          valid: postScore !== null,
          message:
            postScore !== null
              ? `Post-test passed (${postScore}/3 score)!`
              : "Complete the Post-Test to earn your Certificate.",
          details: "Mastery of sampling & PAM signal reconstruction.",
        };
      default:
        return { valid: true, message: "Step completed.", details: "" };
    }
  }, [
    currentStepIndex,
    preScore,
    messageFreq_kHz,
    samplingFreq_kHz,
    observations.length,
    isAliasing,
    aliasFrequency_kHz,
    activeTab,
    postScore,
  ]);

  const completedStepIndices = useMemo(() => {
    const list: number[] = [];
    if (preScore !== null && preScore >= 1) list.push(0);
    if (messageFreq_kHz === 2 && samplingFreq_kHz === 10) list.push(1);
    if (observations.length >= 1) list.push(2);
    if (observations.length >= 2) list.push(3);
    if (observations.length >= 3) list.push(4);
    if (activeTab === "spectrum" || observations.length >= 3) list.push(5);
    if (postScore !== null && postScore >= 1) list.push(6);
    return list;
  }, [preScore, messageFreq_kHz, samplingFreq_kHz, observations.length, activeTab, postScore]);

  // Handle Record Reading
  const handleRecordMeasurement = () => {
    const reading: Observation = {
      id: Date.now().toString(),
      trialNumber: observations.length + 1,
      voltage_in: messageFreq_kHz,
      voltage_diode: samplingFreq_kHz,
      current_mA: nyquistRatio,
      power_mW: isAliasing ? aliasFrequency_kHz : reconstructedFreq_kHz,
      timestamp: new Date().toLocaleTimeString(),
      status: isAliasing ? "warning" : "nominal",
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
            <span className="text-sm">⚡</span>
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
              setMessageFreq_kHz(1.0);
              setSamplingFreq_kHz(10.0);
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
                title="Nyquist Sampling Pre-Test"
                description="Assess prerequisite knowledge of sampling rates, pulse amplitude modulation, and spectral foldover."
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
                  {/* IIT Guwahati 5 Sub-Experiments Architecture */}
                  <SamplingSubExperiments
                    currentMode={subExpMode}
                    onSelectMode={setSubExpMode}
                    messageFreq_kHz={messageFreq_kHz}
                    samplingFreq_kHz={samplingFreq_kHz}
                  />

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
                          <span className="text-cyan-400 font-bold">
                            ● CH1 (Input + PAM Pulses): fm={messageFreq_kHz} kHz, fs=
                            {samplingFreq_kHz} kHz
                          </span>
                          <span
                            className={
                              isAliasing
                                ? "text-rose-400 font-bold animate-pulse"
                                : "text-emerald-400 font-bold"
                            }
                          >
                            ● CH2 (Reconstructed LPF): {reconstructedFreq_kHz} kHz{" "}
                            {isAliasing ? "(ALIASING DISTORTION)" : "(CLEAN)"}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      {/* CRT Screen */}
                      <div className="relative h-64 w-full rounded-lg border-2 border-neutral-800 bg-neutral-950 p-2 overflow-hidden shadow-inner">
                        <svg className="w-full h-full" viewBox="0 0 800 240">
                          {/* Grid */}
                          <defs>
                            <pattern
                              id="pam-grid"
                              width="40"
                              height="24"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 40 0 L 0 0 0 24"
                                fill="none"
                                stroke="#222"
                                strokeWidth="1"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#pam-grid)" />
                          <line x1="0" y1="120" x2="800" y2="120" stroke="#333" strokeWidth="1.5" />
                          <line x1="400" y1="0" x2="400" y2="240" stroke="#333" strokeWidth="1.5" />

                          {/* CH1: Input Continuous Analog Wave (Cyan thin) */}
                          <path
                            d={(() => {
                              const points: string[] = [];
                              const cycles = 2;
                              const scaleY = 35;
                              for (let x = 0; x <= 800; x += 4) {
                                const t = x / 800;
                                const y = 60 - Math.sin(2 * Math.PI * cycles * t) * scaleY;
                                points.push(`${x === 0 ? "M" : "L"} ${x} ${y}`);
                              }
                              return points.join(" ");
                            })()}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="1.2"
                            strokeDasharray="3 3"
                            opacity={0.6}
                          />

                          {/* CH1: Discrete Sampled PAM Pulses (Amber Flat-Top Bars) */}
                          {(() => {
                            const bars: React.ReactNode[] = [];
                            const totalSamples = Math.round(
                              (samplingFreq_kHz / messageFreq_kHz) * 2,
                            );
                            const clampedSamples = Math.min(60, Math.max(4, totalSamples));
                            const stepX = 800 / clampedSamples;
                            const barWidth = Math.max(3, stepX * (pulseDuty_pct / 100));

                            for (let i = 0; i < clampedSamples; i++) {
                              const x = i * stepX + stepX * 0.2;
                              const t = x / 800;
                              const val = Math.sin(2 * Math.PI * 2 * t);
                              const sampleHeight = val * 35;
                              const y = 60 - sampleHeight;
                              bars.push(
                                <g key={i}>
                                  <line
                                    x1={x}
                                    y1={60}
                                    x2={x}
                                    y2={y}
                                    stroke="#f59e0b"
                                    strokeWidth={barWidth}
                                    opacity={0.85}
                                  />
                                  <circle cx={x} cy={y} r={2} fill="#fbbf24" />
                                </g>,
                              );
                            }
                            return bars;
                          })()}

                          {/* Divider line between channels */}
                          <line
                            x1="0"
                            y1="120"
                            x2="800"
                            y2="120"
                            stroke="#444"
                            strokeDasharray="2 2"
                          />

                          {/* CH2: Reconstructed Output after Low-Pass Filter (Green / Red if aliased) */}
                          <path
                            d={(() => {
                              const points: string[] = [];
                              const baseCycles = 2;
                              const cycles = isAliasing
                                ? baseCycles * (reconstructedFreq_kHz / messageFreq_kHz)
                                : baseCycles;
                              const scaleY = 38;

                              for (let x = 0; x <= 800; x += 4) {
                                const t = x / 800;
                                const y = 180 - Math.sin(2 * Math.PI * cycles * t) * scaleY;
                                points.push(`${x === 0 ? "M" : "L"} ${x} ${y}`);
                              }
                              return points.join(" ");
                            })()}
                            fill="none"
                            stroke={isAliasing ? "#f43f5e" : "#10b981"}
                            strokeWidth="2.2"
                          />
                        </svg>

                        {/* Telemetry banner */}
                        <div className="absolute bottom-2 left-3 flex items-center gap-4 bg-neutral-900/80 px-3 py-1 rounded border border-neutral-700 font-mono text-[10px]">
                          <span className="text-cyan-400">
                            CH1: Input ({messageFreq_kHz} kHz) + PAM
                          </span>
                          <span
                            className={
                              isAliasing ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"
                            }
                          >
                            CH2: LPF Out ({reconstructedFreq_kHz} kHz)
                          </span>
                          <span className="text-amber-400">Clock: fs = {samplingFreq_kHz} kHz</span>
                          <Badge
                            variant={isAliasing ? "destructive" : "outline"}
                            className="text-[9px] py-0 h-4"
                          >
                            {isAliasing ? "⚠️ SPECTRAL ALIASING" : "✓ OVERSAMPLED"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Frequency Controls Station */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Analog Message Generator */}
                    <Card className="border-border bg-card">
                      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                        <CardTitle className="font-mono text-xs font-bold text-foreground">
                          1. Continuous Analog Message Generator (m(t))
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 font-mono text-xs">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Message Frequency (fm):</span>
                            <span className="font-bold text-cyan-400">
                              {messageFreq_kHz.toFixed(1)} kHz
                            </span>
                          </div>
                          <Slider
                            value={[messageFreq_kHz]}
                            onValueChange={([val]) => setMessageFreq_kHz(val)}
                            min={0.5}
                            max={3.0}
                            step={0.5}
                          />
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2 text-muted-foreground text-[11px]">
                          Nyquist Rate Threshold: 2 · fm = {nyquistRate_kHz} kHz
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pulse Clock Sampler */}
                    <Card className="border-border bg-card">
                      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                        <CardTitle className="font-mono text-xs font-bold text-foreground">
                          2. Sampling Clock Pulse Generator (fs)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 font-mono text-xs">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Sampling Clock (fs):</span>
                            <span className="font-bold text-amber-500">
                              {samplingFreq_kHz.toFixed(1)} kHz
                            </span>
                          </div>
                          <Slider
                            value={[samplingFreq_kHz]}
                            onValueChange={([val]) => setSamplingFreq_kHz(val)}
                            min={1.0}
                            max={16.0}
                            step={0.2}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Pulse Duty Cycle:</span>
                            <span className="font-bold text-foreground">{pulseDuty_pct}%</span>
                          </div>
                          <Slider
                            value={[pulseDuty_pct]}
                            onValueChange={([val]) => setPulseDuty_pct(val)}
                            min={20}
                            max={50}
                            step={5}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Nyquist Theorem Mathematical Telemetry */}
                  <Card className="border-border bg-card">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex flex-row items-center justify-between">
                      <CardTitle className="font-mono text-xs font-bold text-foreground">
                        3. Nyquist-Shannon Criterion & Reconstruction Status
                      </CardTitle>
                      <Badge
                        variant={isAliasing ? "destructive" : "default"}
                        className="font-mono text-[10px]"
                      >
                        {isAliasing
                          ? "fs < 2·fm (Aliasing Active)"
                          : "fs ≥ 2·fm (Nyquist Satisfied)"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Nyquist Rate (2·fm)
                          </div>
                          <div className="text-base font-bold text-cyan-400 mt-1">
                            {nyquistRate_kHz} kHz
                          </div>
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Sampling Ratio (fs/2fm)
                          </div>
                          <div className="text-base font-bold text-amber-500 mt-1">
                            {nyquistRatio}x
                          </div>
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Reconstructed Tone
                          </div>
                          <div
                            className={
                              isAliasing
                                ? "text-base font-bold text-rose-500 mt-1"
                                : "text-base font-bold text-emerald-400 mt-1"
                            }
                          >
                            {reconstructedFreq_kHz} kHz
                          </div>
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Folded Alias |fs - fm|
                          </div>
                          <div className="text-base font-bold text-rose-400 mt-1">
                            {isAliasing ? `${aliasFrequency_kHz} kHz` : "None (0 kHz)"}
                          </div>
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
                    Observation Table: Nyquist Sampling & Aliasing Frequencies
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Criterion: fs ≥ 2·fm | Alias tone: f_alias = |fs - fm|
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
                      <th className="p-3">Signal fm (kHz)</th>
                      <th className="p-3">Sampling fs (kHz)</th>
                      <th className="p-3">Nyquist Ratio</th>
                      <th className="p-3">Output f (kHz)</th>
                      <th className="p-3">Aliasing</th>
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
                          <td className="p-3">{obs.voltage_in} kHz</td>
                          <td className="p-3 text-amber-500 font-bold">{obs.voltage_diode} kHz</td>
                          <td className="p-3 text-cyan-400 font-bold">{obs.current_mA}x</td>
                          <td className="p-3 font-bold">{obs.power_mW} kHz</td>
                          <td className="p-3">
                            <Badge
                              variant={obs.status === "warning" ? "destructive" : "default"}
                              className="text-[10px]"
                            >
                              {obs.status === "warning" ? "Aliased" : "Clean"}
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
                    Frequency Domain Spectrum (Sampling Sidebands & Aliasing Foldover)
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
                            value: "Magnitude",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#888",
                          }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e1e24", borderColor: "#444" }}
                        />
                        <Bar dataKey="amplitude" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-center">
                    <div className="p-3 rounded border border-border bg-sidebar">
                      <span className="text-muted-foreground block text-[10px]">
                        Continuous Baseband fm
                      </span>
                      <span className="font-bold text-sky-400 mt-1 block">
                        {messageFreq_kHz} kHz
                      </span>
                    </div>

                    <div className="p-3 rounded border border-border bg-sidebar">
                      <span className="text-muted-foreground block text-[10px]">
                        Sampling Clock fs
                      </span>
                      <span className="font-bold text-amber-500 mt-1 block">
                        {samplingFreq_kHz} kHz
                      </span>
                    </div>

                    <div className="p-3 rounded border border-border bg-sidebar">
                      <span className="text-muted-foreground block text-[10px]">
                        Aliasing Foldover Status
                      </span>
                      <span
                        className={
                          isAliasing
                            ? "font-bold text-rose-500 mt-1 block"
                            : "font-bold text-emerald-400 mt-1 block"
                        }
                      >
                        {isAliasing ? `Active (${aliasFrequency_kHz} kHz)` : "None (Safe)"}
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
                title="Nyquist Sampling Post-Test"
                description="Demonstrate comprehension of the Nyquist criterion, anti-aliasing filters, and PAM pulse trains."
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
