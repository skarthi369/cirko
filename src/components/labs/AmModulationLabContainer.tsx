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

const LAB_META = LABS_CATALOG.find((l) => l.id === "am-modulation")!;

const PROCEDURE_STEPS: LabProcedureStepDef[] = [
  {
    stepNumber: 1,
    title: "Read Theory & Pass Pre-Test",
    instruction:
      "Review standard DSB-FC amplitude modulation, sideband creation, and complete prerequisite assessment.",
    hints: [
      "Review the manual: why does standard AM bandwidth equal 2 · fm?",
      "Take the Pre-Test questions on modulation index and envelope detection.",
      "Score at least 1 correct answer on the Pre-Test.",
    ],
    guidedSolution: {
      title: "Amplitude Modulation Principles",
      explanation:
        "In AM DSB-FC, the message signal varies the envelope: s(t) = Ac[1 + m·cos(2πfmt)]cos(2πfct). Modulation index m = Am/Ac determines whether the signal is under-modulated (m < 1), 100% modulated (m = 1), or over-modulated (m > 1).",
      diagramText: `[Audio fm (1 kHz)] ──> [Analog Multiplier / Modulator] ──> [Diode Envelope Detector] ──> [Audio Out]
[Carrier fc (100 kHz)] ─┘`,
      expectedConnections: ["Complete Pre-Test assessment"],
      commonMistakes: ["Confusing modulation index with carrier frequency."],
    },
  },
  {
    stepNumber: 2,
    title: "Configure Under-Modulation (m = 0.50)",
    instruction:
      "Set Carrier Ac = 2.0 V and Modulating Am = 1.0 V (m = 0.50). Observe the clear envelope without clipping.",
    hints: [
      "Adjust Carrier Amplitude Ac to 2.0 V.",
      "Adjust Message Amplitude Am to 1.0 V.",
      "Check the modulation index badge: it should show m = 0.50 (Under-Modulated).",
    ],
    guidedSolution: {
      title: "Under-Modulation Setup (m = 0.50)",
      explanation:
        "When Am < Ac, m < 1. The envelope never reaches zero (Vmin = Ac(1 - m) = 1.0 V > 0), allowing distortionless envelope detection.",
      diagramText: `Ac = 2.0 V, Am = 1.0 V ==> m = 0.50 | Vmax = 3.0 V, Vmin = 1.0 V`,
      expectedConnections: ["Ac = 2.0 V", "Am = 1.0 V", "m = 0.50"],
      commonMistakes: ["Setting Am higher than Ac for under-modulation."],
    },
  },
  {
    stepNumber: 3,
    title: "Record Under-Modulation Measurement",
    instruction:
      "Click 'Record Reading' to log the m = 0.50 operating point into the observation table.",
    hints: [
      "Click 'Record Reading' in the top guidance banner.",
      "Verify trial 1 appears in the observation table with m = 0.50.",
      "Observe Vmax = 3.0 V and Vmin = 1.0 V.",
    ],
    guidedSolution: {
      title: "Logging Under-Modulated Trial",
      explanation: "Recording baseline readings documents experimental envelope voltages.",
      diagramText: `Trial 1: Ac = 2.0 V | Am = 1.0 V | m = 0.50 | BW = 2.0 kHz | Under-Modulated`,
      expectedConnections: ["Trial 1 recorded in observation table"],
      commonMistakes: ["Not clicking Record Reading before adjusting sliders."],
    },
  },
  {
    stepNumber: 4,
    title: "Test Critical 100% Modulation (m = 1.00)",
    instruction:
      "Increase Message Amplitude Am to 2.0 V (Am = Ac, m = 1.00) and record the critical modulation measurement.",
    hints: [
      "Increase Am to 2.0 V so that Am equals Ac.",
      "Notice Vmin drops to 0.0 V: the envelope just touches the horizontal zero axis.",
      "Click 'Record Reading' to log the 100% modulation point.",
    ],
    guidedSolution: {
      title: "Critical 100% Modulation",
      explanation:
        "At m = 1.0, maximum permissible power is transferred to sidebands (33% of total power) without envelope phase crossover or distortion.",
      diagramText: `Ac = 2.0 V, Am = 2.0 V ==> m = 1.00 | Vmax = 4.0 V, Vmin = 0.0 V (Touches Zero)`,
      expectedConnections: ["Am = 2.0 V", "Record trial 2"],
      commonMistakes: ["Leaving Am below 2.0 V."],
    },
  },
  {
    stepNumber: 5,
    title: "Demonstrate Over-Modulation & Envelope Distortion",
    instruction:
      "Increase Message Amplitude Am to 3.0 V (m = 1.50) and observe envelope phase inversion clipping.",
    hints: [
      "Increase Am to 3.0 V so m = 1.50.",
      "Observe the red Over-Modulated warning: the carrier crosses zero and inverts phase.",
      "Record the over-modulated measurement.",
    ],
    guidedSolution: {
      title: "Over-Modulation Envelope Distortion",
      explanation:
        "When m > 1, the envelope crosses zero. A simple diode detector cannot track negative envelope excursions, generating severe harmonic distortion in recovered audio.",
      diagramText: `Ac = 2.0 V, Am = 3.0 V ==> m = 1.50 [OVERMODULATION DISTORTION]`,
      expectedConnections: ["Am = 3.0 V", "Record trial 3"],
      commonMistakes: [
        "Assuming diode detector can recover over-modulated signals without distortion.",
      ],
    },
  },
  {
    stepNumber: 6,
    title: "Inspect Frequency Spectrum & Sidebands",
    instruction:
      "Switch to the 'Spectrum & Analysis' tab to inspect the Carrier (fc) and two sidebands (fc - fm, fc + fm).",
    hints: [
      "Open the 'Spectrum & Analysis' tab.",
      "Examine the 3 discrete spectral peaks: Carrier (100 kHz), Lower Sideband (99 kHz), Upper Sideband (101 kHz).",
      "Verify Carson/AM transmission bandwidth BW = 2 · fm = 2.0 kHz.",
    ],
    guidedSolution: {
      title: "AM Frequency Domain Representation",
      explanation:
        "An AM wave contains exactly three spectral components: Carrier at fc, Lower Sideband (LSB) at fc - fm, and Upper Sideband (USB) at fc + fm. Total bandwidth BW = 2·fm.",
      diagramText: `Spectrum: [LSB: 99 kHz] ─── [Carrier: 100 kHz] ─── [USB: 101 kHz] (BW = 2 kHz)`,
      expectedConnections: ["Spectrum & Analysis tab viewed"],
      commonMistakes: [
        "Thinking AM bandwidth depends on carrier frequency instead of message frequency.",
      ],
    },
  },
  {
    stepNumber: 7,
    title: "Complete Analysis & Post-Test",
    instruction:
      "Complete the Post-Test assessment to verify mastery of AM theory and unlock your Virtual Lab Certificate.",
    hints: [
      "Switch to the 'Post-Test' tab.",
      "Answer questions on envelope distortion and bandwidth.",
      "Score at least 1-2 correct answers to earn your completion certificate.",
    ],
    guidedSolution: {
      title: "AM Lab Conclusion",
      explanation:
        "You have experimentally verified the AM equation, observed the effect of modulation index on waveform geometry, and demonstrated distortion in diode envelope detection.",
      diagramText: `Pre-Test [✓] -> Under-Mod [✓] -> 100% Mod [✓] -> Over-Mod [✓] -> Spectrum [✓] -> Certificate [✓]`,
      expectedConnections: ["Submit Post-Test"],
      commonMistakes: ["Leaving the post-test unsubmitted."],
    },
  },
];

export default function AmModulationLabContainer() {
  const [activeTab, setActiveTab] = useState<
    "manual" | "pretest" | "experiment" | "table" | "spectrum" | "posttest"
  >("manual");

  // Generator Controls
  const [carrierFreq_kHz, setCarrierFreq_kHz] = useState(100);
  const [carrierAmp_V, setCarrierAmp_V] = useState(2.0);
  const [messageFreq_kHz, setMessageFreq_kHz] = useState(1.0);
  const [messageAmp_V, setMessageAmp_V] = useState(1.0);
  const [detectorCap_nF, setDetectorCap_nF] = useState(10); // 10 nF filter
  const [isGeneratorActive, setIsGeneratorActive] = useState(true);

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

  // AM Calculations
  const modulationIndex = useMemo(() => {
    if (carrierAmp_V <= 0) return 0;
    return Number((messageAmp_V / carrierAmp_V).toFixed(2));
  }, [messageAmp_V, carrierAmp_V]);

  const vMax = useMemo(() => {
    return Number((carrierAmp_V * (1 + modulationIndex)).toFixed(2));
  }, [carrierAmp_V, modulationIndex]);

  const vMin = useMemo(() => {
    const val = carrierAmp_V * (1 - modulationIndex);
    return Number(Math.max(0, val).toFixed(2));
  }, [carrierAmp_V, modulationIndex]);

  const bandwidth_kHz = useMemo(() => {
    return Number((2 * messageFreq_kHz).toFixed(1));
  }, [messageFreq_kHz]);

  const powerMetrics = useMemo(() => {
    const pc = (carrierAmp_V * carrierAmp_V) / 2;
    const pt = pc * (1 + (modulationIndex * modulationIndex) / 2);
    const sidebandPower = pt - pc;
    const efficiency = (sidebandPower / pt) * 100;
    return {
      carrierPower_W: Number(pc.toFixed(2)),
      totalPower_W: Number(pt.toFixed(2)),
      sidebandPower_W: Number(sidebandPower.toFixed(2)),
      efficiency_pct: Number(efficiency.toFixed(1)),
    };
  }, [carrierAmp_V, modulationIndex]);

  const modulationState = useMemo(() => {
    if (modulationIndex < 0.98) return "under";
    if (modulationIndex <= 1.02) return "critical";
    return "over";
  }, [modulationIndex]);

  // Spectrum data for Recharts
  const spectrumData = useMemo(() => {
    const lsbFreq = carrierFreq_kHz - messageFreq_kHz;
    const usbFreq = carrierFreq_kHz + messageFreq_kHz;
    const lsbAmp = (carrierAmp_V * modulationIndex) / 2;
    const usbAmp = lsbAmp;

    return [
      { frequency: `${lsbFreq} kHz (LSB)`, amplitude: Number(lsbAmp.toFixed(2)), fill: "#38bdf8" },
      { frequency: `${carrierFreq_kHz} kHz (Carrier)`, amplitude: carrierAmp_V, fill: "#f59e0b" },
      { frequency: `${usbFreq} kHz (USB)`, amplitude: Number(usbAmp.toFixed(2)), fill: "#38bdf8" },
    ];
  }, [carrierFreq_kHz, messageFreq_kHz, carrierAmp_V, modulationIndex]);

  // Step Validation
  const validationInfo = useMemo(() => {
    switch (currentStepIndex) {
      case 0: // Pre-test
        return {
          valid: preScore !== null,
          message:
            preScore !== null
              ? `Pre-Test verified (${preScore}/3 score).`
              : "Review Aim & Theory and complete the Pre-Test.",
          details: "Theory understanding of AM equation s(t) is required.",
        };
      case 1: {
        // Under-modulation
        const ok = modulationIndex >= 0.45 && modulationIndex <= 0.55;
        return {
          valid: ok,
          message: ok
            ? `Under-modulation verified: m = ${modulationIndex}`
            : `Current m = ${modulationIndex}. Set Ac = 2.0 V, Am = 1.0 V (m = 0.50).`,
          details: "Under-modulation ensures envelope never touches zero.",
        };
      }
      case 2: {
        // Record under-modulation
        const hasRec = observations.length >= 1;
        return {
          valid: hasRec,
          message: hasRec
            ? `${observations.length} reading(s) recorded.`
            : "Click 'Record Reading' to log the m = 0.50 trial.",
          details: "Logging measurements populates the observation table.",
        };
      }
      case 3: {
        // Critical modulation (m = 1.0)
        const ok = modulationIndex >= 0.95 && modulationIndex <= 1.05 && observations.length >= 2;
        return {
          valid: ok,
          message: ok
            ? "Critical modulation (100%) recorded."
            : `Set Am = 2.0 V (m = 1.00) and click 'Record Reading'. Current m = ${modulationIndex}`,
          details: "At 100% modulation, envelope touches zero axis without clipping.",
        };
      }
      case 4: {
        // Over-modulation (m = 1.5)
        const ok = modulationIndex >= 1.4 && observations.length >= 3;
        return {
          valid: ok,
          message: ok
            ? "Over-modulation recorded."
            : `Increase Am to 3.0 V (m = 1.50) and click 'Record Reading'. Current m = ${modulationIndex}`,
          details: "Notice the carrier phase inversion and clipped envelope.",
        };
      }
      case 5: // Spectrum tab
        return {
          valid: activeTab === "spectrum",
          message:
            activeTab === "spectrum"
              ? "Spectrum & sidebands inspected."
              : "Switch to 'Spectrum & Analysis' tab to inspect sidebands.",
          details: "AM bandwidth is strictly 2 · fm.",
        };
      case 6: // Post-test
        return {
          valid: postScore !== null,
          message:
            postScore !== null
              ? `Post-test passed (${postScore}/3 score)!`
              : "Complete the Post-Test to earn your Certificate.",
          details: "Mastery assessment unlocks certification.",
        };
      default:
        return { valid: true, message: "Step completed.", details: "" };
    }
  }, [currentStepIndex, preScore, modulationIndex, observations.length, activeTab, postScore]);

  const completedStepIndices = useMemo(() => {
    const list: number[] = [];
    if (preScore !== null && preScore >= 1) list.push(0);
    if (modulationIndex >= 0.45 && modulationIndex <= 0.55) list.push(1);
    if (observations.length >= 1) list.push(2);
    if (observations.length >= 2) list.push(3);
    if (observations.length >= 3) list.push(4);
    if (activeTab === "spectrum" || observations.length >= 3) list.push(5);
    if (postScore !== null && postScore >= 1) list.push(6);
    return list;
  }, [preScore, modulationIndex, observations.length, activeTab, postScore]);

  // Handle Record Reading
  const handleRecordMeasurement = () => {
    const reading: Observation = {
      id: Date.now().toString(),
      trialNumber: observations.length + 1,
      voltage_in: carrierAmp_V,
      voltage_diode: vMax,
      current_mA: vMin,
      power_mW: Number((modulationIndex * 100).toFixed(0)), // store m% in power col
      timestamp: new Date().toLocaleTimeString(),
      status: modulationState === "over" ? "warning" : "nominal",
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
            <span className="text-sm">📡</span>
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
              setCarrierAmp_V(2.0);
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
                title="AM Modulation Pre-Test"
                description="Assess prerequisite knowledge of amplitude modulation, frequency spectra, and envelope detection."
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
              canRecord={isGeneratorActive}
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
                  {/* Dual-Trace Oscilloscope Card */}
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
                            ● CH1 (AM Modulated): Vmax={vMax}V, Vmin={vMin}V
                          </span>
                          <span className="text-cyan-400 font-bold">
                            ● CH2 (Diode Detected Audio): {messageFreq_kHz} kHz
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      {/* Oscilloscope CRT Screen */}
                      <div className="relative h-60 w-full rounded-lg border-2 border-neutral-800 bg-neutral-950 p-2 overflow-hidden shadow-inner">
                        <svg className="w-full h-full" viewBox="0 0 800 220">
                          {/* Grid */}
                          <defs>
                            <pattern
                              id="am-grid"
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
                          <rect width="100%" height="100%" fill="url(#am-grid)" />
                          <line x1="0" y1="110" x2="800" y2="110" stroke="#333" strokeWidth="1.5" />
                          <line x1="400" y1="0" x2="400" y2="220" stroke="#333" strokeWidth="1.5" />

                          {isGeneratorActive && (
                            <>
                              {/* CH1: Modulated AM waveform (Amber) */}
                              <path
                                d={(() => {
                                  const points: string[] = [];
                                  const messageCycles = 2;
                                  const carrierCycles = 40;
                                  const scaleY = 32;

                                  for (let x = 0; x <= 800; x += 2) {
                                    const t = x / 800;
                                    const env =
                                      carrierAmp_V *
                                      (1 +
                                        modulationIndex *
                                          Math.cos(2 * Math.PI * messageCycles * t));
                                    const carrier = Math.cos(2 * Math.PI * carrierCycles * t);
                                    const y = 110 - env * carrier * scaleY;
                                    points.push(
                                      `${x === 0 ? "M" : "L"} ${x} ${Math.max(10, Math.min(210, y))}`,
                                    );
                                  }
                                  return points.join(" ");
                                })()}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="1.8"
                                opacity={0.9}
                              />

                              {/* Upper Envelope Guideline (Cyan dashed) */}
                              <path
                                d={(() => {
                                  const points: string[] = [];
                                  const messageCycles = 2;
                                  const scaleY = 32;
                                  for (let x = 0; x <= 800; x += 4) {
                                    const t = x / 800;
                                    const env =
                                      carrierAmp_V *
                                      (1 +
                                        modulationIndex *
                                          Math.cos(2 * Math.PI * messageCycles * t));
                                    const y = 110 - env * scaleY;
                                    points.push(
                                      `${x === 0 ? "M" : "L"} ${x} ${Math.max(10, Math.min(210, y))}`,
                                    );
                                  }
                                  return points.join(" ");
                                })()}
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="1.2"
                                strokeDasharray="4 4"
                                opacity={0.7}
                              />

                              {/* CH2: Demodulated Output (Green) */}
                              <path
                                d={(() => {
                                  const points: string[] = [];
                                  const messageCycles = 2;
                                  const scaleY = 28;
                                  for (let x = 0; x <= 800; x += 4) {
                                    const t = x / 800;
                                    // if overmodulated, diode clips negative part
                                    let env =
                                      modulationIndex * Math.cos(2 * Math.PI * messageCycles * t);
                                    if (modulationIndex > 1.0 && env < -1.0) {
                                      env = -1.0; // clipping distortion
                                    }
                                    const y = 110 - env * scaleY;
                                    points.push(
                                      `${x === 0 ? "M" : "L"} ${x} ${Math.max(10, Math.min(210, y))}`,
                                    );
                                  }
                                  return points.join(" ");
                                })()}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                              />
                            </>
                          )}
                        </svg>

                        {/* On-screen Telemetry Overlay */}
                        <div className="absolute bottom-2 left-3 flex items-center gap-4 bg-neutral-900/80 px-3 py-1 rounded border border-neutral-700 font-mono text-[10px]">
                          <span className="text-amber-400">CH1: 1.0 V/div</span>
                          <span className="text-emerald-400">CH2: 0.5 V/div</span>
                          <span className="text-neutral-400">Time: 0.2 ms/div</span>
                          <span
                            className={
                              modulationState === "over"
                                ? "text-rose-400 font-bold animate-pulse"
                                : modulationState === "critical"
                                  ? "text-emerald-400 font-bold"
                                  : "text-sky-400"
                            }
                          >
                            Index m = {modulationIndex} ({modulationState.toUpperCase()})
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Modulation Control Station */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Carrier Generator */}
                    <Card className="border-border bg-card">
                      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                        <CardTitle className="font-mono text-xs font-bold text-foreground">
                          1. RF Carrier Generator (c(t))
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4 font-mono text-xs">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Carrier Amplitude (Ac):</span>
                            <span className="font-bold text-amber-500">
                              {carrierAmp_V.toFixed(1)} V
                            </span>
                          </div>
                          <Slider
                            value={[carrierAmp_V]}
                            onValueChange={([val]) => setCarrierAmp_V(val)}
                            min={1.0}
                            max={4.0}
                            step={0.5}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Carrier Frequency (fc):</span>
                            <span className="font-bold text-foreground">{carrierFreq_kHz} kHz</span>
                          </div>
                          <Slider
                            value={[carrierFreq_kHz]}
                            onValueChange={([val]) => setCarrierFreq_kHz(val)}
                            min={50}
                            max={150}
                            step={10}
                          />
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
                            min={0.5}
                            max={3.5}
                            step={0.5}
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
                            max={3.0}
                            step={0.5}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Envelope Demodulator & RC Filter */}
                  <Card className="border-border bg-card">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex flex-row items-center justify-between">
                      <CardTitle className="font-mono text-xs font-bold text-foreground">
                        3. Diode Envelope Demodulator (1N34A Germanium + RC Filter)
                      </CardTitle>
                      <Badge
                        variant={modulationState === "over" ? "destructive" : "default"}
                        className="font-mono text-[10px]"
                      >
                        {modulationState === "over"
                          ? "Envelope Clipping Distortion"
                          : "Clean Recovery"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Modulation Index (m)
                          </div>
                          <div className="text-base font-bold text-amber-500 mt-1">
                            {modulationIndex}
                          </div>
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            AM Bandwidth (2·fm)
                          </div>
                          <div className="text-base font-bold text-cyan-400 mt-1">
                            {bandwidth_kHz} kHz
                          </div>
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Sideband Power Ratio
                          </div>
                          <div className="text-base font-bold text-emerald-400 mt-1">
                            {powerMetrics.efficiency_pct}%
                          </div>
                        </div>

                        <div className="rounded border border-border bg-sidebar p-2.5">
                          <div className="text-[10px] text-muted-foreground uppercase">
                            Envelope Peak Vmax
                          </div>
                          <div className="text-base font-bold text-foreground mt-1">{vMax} V</div>
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
                    Observation Table: AM Modulation Index & Envelope Voltages
                  </h3>
                  <p className="text-xs text-muted-foreground">m = (Vmax - Vmin) / (Vmax + Vmin)</p>
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
                      <th className="p-3">Carrier Ac (V)</th>
                      <th className="p-3">Vmax (V)</th>
                      <th className="p-3">Vmin (V)</th>
                      <th className="p-3">Index m (%)</th>
                      <th className="p-3">Status</th>
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
                          <td className="p-3">{obs.voltage_diode} V</td>
                          <td className="p-3">{obs.current_mA} V</td>
                          <td className="p-3 font-bold text-primary">{obs.power_mW}%</td>
                          <td className="p-3">
                            <Badge
                              variant={obs.status === "warning" ? "destructive" : "default"}
                              className="text-[10px]"
                            >
                              {obs.status === "warning" ? "Over-Modulated" : "Nominal"}
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
                    Frequency Domain Spectrum (FFT Analysis)
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
                          tick={{ fill: "#888", fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#888"
                          tick={{ fill: "#888", fontSize: 11 }}
                          label={{
                            value: "Amplitude (V)",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#888",
                          }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e1e24", borderColor: "#444" }}
                        />
                        <Bar dataKey="amplitude" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-center">
                    <div className="p-3 rounded border border-border bg-sidebar">
                      <span className="text-muted-foreground block text-[10px]">
                        Lower Sideband (fc - fm)
                      </span>
                      <span className="font-bold text-sky-400 mt-1 block">
                        {carrierFreq_kHz - messageFreq_kHz} kHz (
                        {((carrierAmp_V * modulationIndex) / 2).toFixed(2)} V)
                      </span>
                    </div>

                    <div className="p-3 rounded border border-border bg-sidebar">
                      <span className="text-muted-foreground block text-[10px]">
                        Carrier Center (fc)
                      </span>
                      <span className="font-bold text-amber-500 mt-1 block">
                        {carrierFreq_kHz} kHz ({carrierAmp_V.toFixed(1)} V)
                      </span>
                    </div>

                    <div className="p-3 rounded border border-border bg-sidebar">
                      <span className="text-muted-foreground block text-[10px]">
                        Upper Sideband (fc + fm)
                      </span>
                      <span className="font-bold text-sky-400 mt-1 block">
                        {carrierFreq_kHz + messageFreq_kHz} kHz (
                        {((carrierAmp_V * modulationIndex) / 2).toFixed(2)} V)
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
                title="AM Modulation Post-Test"
                description="Demonstrate conceptual mastery of modulation index limits and Carson transmission bandwidth."
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
