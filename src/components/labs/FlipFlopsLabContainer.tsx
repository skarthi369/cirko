import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { LABS_CATALOG } from "@/lib/labs/catalog";
import type { LabProcedureStepDef } from "@/lib/labs/types";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import TopGuidanceBanner from "@/components/labs/TopGuidanceBanner";
import StepChecklistPanel from "@/components/labs/StepChecklistPanel";
import LabManualSection from "@/components/labs/LabManualSection";
import PrePostTestCard from "@/components/labs/PrePostTestCard";
import GuidedSolutionModal from "@/components/labs/GuidedSolutionModal";
import CompletionCertificateModal from "@/components/labs/CompletionCertificateModal";

const LAB_META = LABS_CATALOG.find((l) => l.id === "flip-flops")!;

type FlipFlopType = "JK" | "SR" | "D" | "T";

type TimingPoint = {
  time: number;
  clk: number;
  in1: number;
  in2: number;
  q: number;
};

const PROCEDURE_STEPS: LabProcedureStepDef[] = [
  {
    stepNumber: 1,
    title: "Read Theory & Pass Pre-Test",
    instruction:
      "Understand sequential bistable multivibrators, clock edge-triggering, and pass the prerequisite test.",
    hints: [
      "Review the manual: what condition makes SR S=R=1 invalid?",
      "Take the Pre-Test questions on flip-flop states.",
      "Score at least 1 correct answer on the Pre-Test.",
    ],
    guidedSolution: {
      title: "Sequential Memory Principles",
      explanation:
        "Unlike combinational circuits, flip-flops possess memory (state Q). State transitions only occur synchronously on the active edge of a clock signal.",
      diagramText: `Inputs + Clock Pulse (↑) ──> [Bistable Flip-Flop] ──> State Q and Complement Q'`,
      expectedConnections: ["Complete Pre-Test assessment"],
      commonMistakes: ["Expecting state to change without a clock pulse."],
    },
  },
  {
    stepNumber: 2,
    title: "Test JK Flip-Flop Set (J=1, K=0)",
    instruction:
      "Select JK Flip-Flop, configure J=1, K=0, and click 'Pulse Clock' to verify state Q transitions to 1.",
    hints: [
      "Set J=1 and K=0 using the input switch toggles.",
      "Click the '⚡ Pulse Clock' button.",
      "Observe Q latching to 1 and Q' turning to 0. Log the transition.",
    ],
    guidedSolution: {
      title: "JK Synchronous Set Mode",
      explanation: "When J=1 and K=0, arriving clock pulse forces Q=1 (Set).",
      diagramText: `J=1, K=0 + Clock Pulse (↑) ==> Q = 1, Q' = 0 [Set]`,
      expectedConnections: ["J=1, K=0 pulsed"],
      commonMistakes: ["Leaving J and K at 0."],
    },
  },
  {
    stepNumber: 3,
    title: "Test JK Flip-Flop Reset (J=0, K=1)",
    instruction: "Configure J=0, K=1, pulse clock, and verify Q resets to 0.",
    hints: [
      "Set J=0 and K=1.",
      "Click '⚡ Pulse Clock'.",
      "Observe Q resetting to 0. Record the transition.",
    ],
    guidedSolution: {
      title: "JK Synchronous Reset Mode",
      explanation: "When J=0 and K=1, clock pulse forces Q=0 (Reset).",
      diagramText: `J=0, K=1 + Clock Pulse (↑) ==> Q = 0, Q' = 1 [Reset]`,
      expectedConnections: ["J=0, K=1 pulsed"],
      commonMistakes: ["Forgetting to trigger clock pulse."],
    },
  },
  {
    stepNumber: 4,
    title: "Verify JK Toggle Mode (J=1, K=1)",
    instruction:
      "Set J=1, K=1, pulse clock multiple times, and observe Q inverting on every active clock edge.",
    hints: [
      "Set both J=1 and K=1.",
      "Click '⚡ Pulse Clock' repeatedly.",
      "Notice Q flipping between 0 and 1 on every pulse (Toggling!). Record the row.",
    ],
    guidedSolution: {
      title: "JK Toggle Mode (Q_next = Q')",
      explanation:
        "The JK flip-flop eliminates the invalid state of the SR latch. When J=K=1, every clock pulse inverts Q.",
      diagramText: `J=1, K=1 + Pulse 1 ==> Q=1; Pulse 2 ==> Q=0; Pulse 3 ==> Q=1 [Toggle]`,
      expectedConnections: ["Toggle mode verified"],
      commonMistakes: ["Assuming J=1, K=1 is forbidden in a JK flip-flop."],
    },
  },
  {
    stepNumber: 5,
    title: "Test D Flip-Flop (Data Latch)",
    instruction: "Switch to 'D Flip-Flop', verify that Q mirrors D on every clock pulse.",
    hints: [
      "Select 'D Flip-Flop' in the type selector.",
      "Set D=1, pulse clock -> Q=1. Set D=0, pulse clock -> Q=0.",
      "Record transitions for the D flip-flop.",
    ],
    guidedSolution: {
      title: "D Flip-Flop Operation (Q_next = D)",
      explanation:
        "The D flip-flop transfers the data input D directly into memory state Q upon clock arrival.",
      diagramText: `D=1 + Clock ==> Q=1 | D=0 + Clock ==> Q=0`,
      expectedConnections: ["D flip-flop verified"],
      commonMistakes: ["Confusing D input with asynchronous clear."],
    },
  },
  {
    stepNumber: 6,
    title: "Inspect Live Timing Diagram",
    instruction:
      "Observe the timing trace on the digital analyzer showing Clock, Inputs, and Q over time.",
    hints: [
      "Review the multi-trace digital timing diagram under the circuit schematic.",
      "Notice the exact synchronization between rising clock edges and Q state transitions.",
      "Switch to the 'Transition Tables' tab to audit all logged states.",
    ],
    guidedSolution: {
      title: "Synchronous Timing Analysis",
      explanation:
        "The timing diagram demonstrates setup/hold discipline and synchronous state updates on clock rising edges.",
      diagramText: `Timing Diagram: Clock pulses align precisely with Q state toggles`,
      expectedConnections: ["Timing diagram reviewed"],
      commonMistakes: ["Skipping timing diagram review."],
    },
  },
  {
    stepNumber: 7,
    title: "Complete Post-Test & Claim Certificate",
    instruction:
      "Answer the Post-Test assessment to conclude the digital sequential electronics series.",
    hints: [
      "Open the 'Post-Test' tab and answer the questions on JK toggling and SR invalid states.",
      "Submit and score at least 1-2 correct answers.",
      "View and print your Sequential Electronics Certificate.",
    ],
    guidedSolution: {
      title: "Sequential Electronics Lab Complete",
      explanation:
        "You have constructed state transition tables for SR, JK, D, and T flip-flops and verified synchronous memory behavior.",
      diagramText: `Pretest [✓] -> JK [✓] -> Toggle [✓] -> D [✓] -> Posttest [✓] -> Certificate [🎓]`,
      expectedConnections: ["Post-Test submitted with passing score"],
      commonMistakes: ["Leaving post-test unsubmitted."],
    },
  },
];

type TransitionRow = {
  id: string;
  type: FlipFlopType;
  in1: number;
  in2: number;
  qBefore: number;
  qAfter: number;
  action: string;
};

export default function FlipFlopsLabContainer() {
  const [activeTab, setActiveTab] = useState("manual");
  const [ffType, setFfType] = useState<FlipFlopType>("JK");

  // Inputs
  const [in1, setIn1] = useState<number>(1); // J for JK, S for SR, D for D, T for T
  const [in2, setIn2] = useState<number>(0); // K for JK, R for SR
  const [qState, setQState] = useState<number>(0);
  const [clkPulse, setClkPulse] = useState(false);
  const [autoClock, setAutoClock] = useState(false);

  // Timing history
  const [timingHistory, setTimingHistory] = useState<TimingPoint[]>([]);
  const timeCounterRef = useRef(0);

  // Transition rows
  const [transitionRows, setTransitionRows] = useState<TransitionRow[]>(() => {
    try {
      const raw = localStorage.getItem("cirkit.lab.ff.rows.v1");
      return raw ? (JSON.parse(raw) as TransitionRow[]) : [];
    } catch {
      return [];
    }
  });

  const [theoryRead, setTheoryRead] = useState(false);
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [attemptsMap, setAttemptsMap] = useState<Record<number, number>>({});
  const [guidedSolutionUnlockedMap, setGuidedSolutionUnlockedMap] = useState<
    Record<number, boolean>
  >({});
  const [showMeActive, setShowMeActive] = useState(false);

  const [activeGuidedModalStepIndex, setActiveGuidedModalStepIndex] = useState<number | null>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("cirkit.lab.ff.rows.v1", JSON.stringify(transitionRows));
    } catch {
      /* ignore */
    }
  }, [transitionRows]);

  // Execute Clock Pulse & State Update
  const triggerClockPulse = () => {
    setClkPulse(true);
    setTimeout(() => setClkPulse(false), 200);

    const prevQ = qState;
    let nextQ = prevQ;
    let actionDesc = "Memory (No Change)";

    if (ffType === "JK") {
      const J = in1;
      const K = in2;
      if (J === 0 && K === 0) {
        nextQ = prevQ;
        actionDesc = "No Change (Hold)";
      } else if (J === 1 && K === 0) {
        nextQ = 1;
        actionDesc = "Set (Q = 1)";
      } else if (J === 0 && K === 1) {
        nextQ = 0;
        actionDesc = "Reset (Q = 0)";
      } else if (J === 1 && K === 1) {
        nextQ = prevQ === 1 ? 0 : 1;
        actionDesc = "Toggle (Q = Q')";
      }
    } else if (ffType === "SR") {
      const S = in1;
      const R = in2;
      if (S === 0 && R === 0) {
        nextQ = prevQ;
        actionDesc = "No Change (Hold)";
      } else if (S === 1 && R === 0) {
        nextQ = 1;
        actionDesc = "Set (Q = 1)";
      } else if (S === 0 && R === 1) {
        nextQ = 0;
        actionDesc = "Reset (Q = 0)";
      } else if (S === 1 && R === 1) {
        nextQ = 0;
        actionDesc = "⚠️ Invalid / Race Condition!";
      }
    } else if (ffType === "D") {
      nextQ = in1;
      actionDesc = `Latch Data (Q = ${in1})`;
    } else if (ffType === "T") {
      nextQ = in1 === 1 ? (prevQ === 1 ? 0 : 1) : prevQ;
      actionDesc = in1 === 1 ? "Toggle" : "Hold";
    }

    setQState(nextQ);

    // Append to timing history
    timeCounterRef.current += 1;
    const newPt: TimingPoint = {
      time: timeCounterRef.current,
      clk: 1,
      in1,
      in2,
      q: nextQ,
    };
    setTimingHistory((prev) => [...prev.slice(-19), newPt]);

    // Record transition row
    const rowId = `${ffType}-${in1}-${in2}-${Date.now()}`;
    const newRow: TransitionRow = {
      id: rowId,
      type: ffType,
      in1,
      in2,
      qBefore: prevQ,
      qAfter: nextQ,
      action: actionDesc,
    };
    setTransitionRows((prev) => [...prev, newRow]);
  };

  // Auto-clock effect
  useEffect(() => {
    if (!autoClock) return;
    const interval = setInterval(() => {
      triggerClockPulse();
    }, 1200);
    return () => clearInterval(interval);
  }, [autoClock, in1, in2, ffType, qState]);

  // Validation info
  const validationInfo = useMemo(() => {
    const jkRows = transitionRows.filter((r) => r.type === "JK");
    const hasSet = jkRows.some((r) => r.in1 === 1 && r.in2 === 0 && r.qAfter === 1);
    const hasReset = jkRows.some((r) => r.in1 === 0 && r.in2 === 1 && r.qAfter === 0);
    const hasToggle = jkRows.some((r) => r.in1 === 1 && r.in2 === 1);

    const message = `${ffType} Flip-Flop: State Q = ${qState}, Q' = ${qState === 1 ? 0 : 1}. Clock: ${
      clkPulse ? "RISING EDGE (↑)" : "LOW"
    }.`;

    return {
      partsPlaced: true,
      topologyValid: true,
      simulationRunning: true,
      activeMeasurement: true,
      hasSubThresholdReading: hasSet,
      hasKneeReading: hasReset,
      hasLinearReading: hasToggle,
      message,
      errorKind: "no_error" as const,
      vin: in1,
      vd: qState * 5.0,
      id: qState,
    };
  }, [transitionRows, ffType, qState, clkPulse, in1]);

  const completedStepIndices = useMemo(() => {
    const list: number[] = [];
    const jkRows = transitionRows.filter((r) => r.type === "JK");
    const dRows = transitionRows.filter((r) => r.type === "D");

    if (preScore !== null && preScore >= 1) list.push(0); // Step 1: Pre-test
    if (jkRows.some((r) => r.in1 === 1 && r.in2 === 0 && r.qAfter === 1)) list.push(1); // Step 2: Set verified
    if (jkRows.some((r) => r.in1 === 0 && r.in2 === 1 && r.qAfter === 0)) list.push(2); // Step 3: Reset verified
    if (jkRows.filter((r) => r.in1 === 1 && r.in2 === 1).length >= 2) list.push(3); // Step 4: Toggle verified
    if (dRows.length >= 2) list.push(4); // Step 5: D flip-flop verified
    if (transitionRows.length >= 6 && activeTab === "table") list.push(5); // Step 6: Timing & Tables reviewed
    if (postScore !== null && postScore >= 1) list.push(6); // Step 7: Post-test passed
    return list;
  }, [preScore, transitionRows, activeTab, postScore]);

  useEffect(() => {
    if (
      completedStepIndices.includes(currentStepIndex) &&
      currentStepIndex < PROCEDURE_STEPS.length - 1
    ) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [completedStepIndices, currentStepIndex]);

  const handleClearRows = () => {
    setTransitionRows([]);
    setTimingHistory([]);
  };

  const handleShowHint = (stepIdx: number = currentStepIndex) => {
    const stepDef = PROCEDURE_STEPS[stepIdx];
    if (!stepDef) return;
    const attempts = attemptsMap[stepIdx] ?? 0;
    const hintIdx = Math.min(attempts, stepDef.hints.length - 1);
    setHintMessage(`Attempt ${attempts + 1} Hint: ${stepDef.hints[hintIdx]}`);
    setAttemptsMap((prev) => {
      const nextVal = (prev[stepIdx] ?? 0) + 1;
      if (nextVal >= 3) {
        setGuidedSolutionUnlockedMap((gu) => ({ ...gu, [stepIdx]: true }));
      }
      return { ...prev, [stepIdx]: nextVal };
    });
  };

  const { progressPercent, totalXp } = useMemo(() => {
    let p = 0;
    let xp = 0;
    if (theoryRead) {
      p += 10;
      xp += 10;
    }
    if (preScore !== null && preScore >= 1) {
      p += 15;
      xp += 20;
    }
    if (transitionRows.some((r) => r.type === "JK" && r.action.includes("Set"))) {
      p += 15;
      xp += 15;
    }
    if (transitionRows.some((r) => r.type === "JK" && r.action.includes("Toggle"))) {
      p += 20;
      xp += 20;
    }
    if (transitionRows.filter((r) => r.type === "D").length >= 2) {
      p += 20;
      xp += 20;
    }
    if (postScore !== null && postScore >= 1) {
      p += 20;
      xp += 15;
    }
    return { progressPercent: Math.min(100, p), totalXp: Math.min(100, xp) };
  }, [theoryRead, preScore, transitionRows, postScore]);

  const isCompleted = progressPercent === 100;
  const currentStepDef = PROCEDURE_STEPS[currentStepIndex] ?? PROCEDURE_STEPS[0]!;

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/labs"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground font-mono"
          >
            ← Virtual Labs Catalog
          </Link>
          <span className="text-border">|</span>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-tight">{LAB_META.title}</h1>
            <p className="text-[11px] text-muted-foreground">
              Digital Electronics · Experiment 3 of 3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-medium text-muted-foreground">Progress:</span>
            <div className="w-28 sm:w-36">
              <Progress value={progressPercent} className="h-2" />
            </div>
            <span className="font-mono text-xs font-bold text-primary">{progressPercent}%</span>
          </div>

          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
            ⭐ {totalXp} / 100 XP
          </Badge>

          {isCompleted ? (
            <Button
              size="sm"
              onClick={() => setCertificateModalOpen(true)}
              className="font-mono text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
            >
              🎓 View Certificate
            </Button>
          ) : (
            <Badge variant="secondary" className="font-mono text-xs">
              In Progress
            </Badge>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-10 bg-transparent p-0 gap-1.5">
            <TabsTrigger
              value="manual"
              onClick={() => setTheoryRead(true)}
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              📖 Manual & Theory
            </TabsTrigger>
            <TabsTrigger
              value="pretest"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              ❓ Pre-Test {preScore !== null && `(${preScore}/1)`}
            </TabsTrigger>
            <TabsTrigger
              value="experiment"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              🔬 Sequential Workbench ({completedStepIndices.length}/{PROCEDURE_STEPS.length})
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              📊 State Tables ({transitionRows.length} Transitions)
            </TabsTrigger>
            <TabsTrigger
              value="posttest"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              📝 Post-Test {postScore !== null && `(${postScore}/1)`}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="min-h-0 flex-1 flex flex-col">
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
                title="Sequential Flip-Flops Prerequisite Assessment"
                description="Test knowledge of bistable memory latches and clock trigger conditions."
                questions={LAB_META.manual.preTestQuestions}
                onComplete={(score) => {
                  setPreScore(score);
                  if (score >= 1) setActiveTab("experiment");
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
              onRecordMeasurement={triggerClockPulse}
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
              {/* Sequential Apparatus Center */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6 bg-canvas">
                <div className="mx-auto max-w-4xl space-y-6">
                  {/* Flip-Flop Selector */}
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-xs">
                    <span className="font-mono text-xs font-bold text-muted-foreground mr-1">
                      Select Flip-Flop:
                    </span>
                    {(["JK", "SR", "D", "T"] as FlipFlopType[]).map((t) => (
                      <Button
                        key={t}
                        size="sm"
                        variant={ffType === t ? "default" : "outline"}
                        onClick={() => {
                          setFfType(t);
                          if (t === "D" || t === "T") {
                            setIn1(1);
                          } else {
                            setIn1(1);
                            setIn2(0);
                          }
                        }}
                        className="font-mono text-xs h-7"
                      >
                        {t} Flip-Flop
                      </Button>
                    ))}
                  </div>

                  {/* Circuit Workbench Schematic Card */}
                  <Card className="border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {ffType} Bistable Multivibrator Simulation
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={autoClock ? "default" : "outline"}
                            onClick={() => setAutoClock((a) => !a)}
                            className="font-mono text-[11px] h-6"
                          >
                            {autoClock ? "⏸ Stop Auto Clock" : "▶ Start 1Hz Clock"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-8 flex flex-col items-center justify-center">
                      <div className="relative w-full max-w-xl h-72 rounded-xl border border-border bg-neutral-950 p-6 flex items-center justify-between shadow-inner">
                        {/* Synchronous Inputs Column */}
                        <div className="flex flex-col gap-4 z-10">
                          {/* Input 1 (J, S, D, T) */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setIn1((v) => (v === 1 ? 0 : 1))}
                              className={`size-10 rounded-lg font-mono text-sm font-bold border-2 transition-all shadow-md ${
                                in1 === 1
                                  ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                  : "bg-neutral-800 border-neutral-600 text-neutral-400"
                              }`}
                            >
                              {in1}
                            </button>
                            <span className="font-mono text-xs font-bold text-neutral-200">
                              Input {ffType === "JK" ? "J" : ffType === "SR" ? "S" : ffType}
                            </span>
                          </div>

                          {/* Input 2 (K, R) */}
                          {(ffType === "JK" || ffType === "SR") && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setIn2((v) => (v === 1 ? 0 : 1))}
                                className={`size-10 rounded-lg font-mono text-sm font-bold border-2 transition-all shadow-md ${
                                  in2 === 1
                                    ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                    : "bg-neutral-800 border-neutral-600 text-neutral-400"
                                }`}
                              >
                                {in2}
                              </button>
                              <span className="font-mono text-xs font-bold text-neutral-200">
                                Input {ffType === "JK" ? "K" : "R"}
                              </span>
                            </div>
                          )}

                          {/* Clock Pulse Input Button */}
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={triggerClockPulse}
                              className={`size-10 rounded-lg font-mono text-base font-bold border-2 transition-all shadow-md ${
                                clkPulse
                                  ? "bg-cyan-500 border-cyan-300 text-white shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-95"
                                  : "bg-neutral-800 border-neutral-600 text-neutral-300 hover:border-cyan-400"
                              }`}
                              title="Click to pulse clock"
                            >
                              ↑
                            </button>
                            <span className="font-mono text-xs font-bold text-cyan-400">
                              CLK Pulse
                            </span>
                          </div>
                        </div>

                        {/* Central IC Box */}
                        <div className="relative flex flex-col items-center justify-center p-4">
                          <div className="size-28 rounded-2xl border-2 border-primary/60 bg-neutral-900 flex flex-col items-center justify-center shadow-lg text-center p-2">
                            <span className="font-mono text-lg font-bold text-primary">
                              {ffType} FLIP-FLOP
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400 mt-1">
                              Clock Active
                            </span>
                          </div>
                        </div>

                        {/* Q and Q' Outputs */}
                        <div className="flex flex-col gap-6 items-center z-10">
                          {/* Q */}
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`size-12 rounded-full border-4 flex items-center justify-center font-mono text-base font-bold transition-all duration-300 shadow-xl ${
                                qState === 1
                                  ? "bg-emerald-500 border-emerald-300 text-white shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                                  : "bg-neutral-900 border-neutral-700 text-neutral-500"
                              }`}
                            >
                              {qState}
                            </div>
                            <span className="font-mono text-xs font-bold text-neutral-200">
                              State Q
                            </span>
                          </div>

                          {/* Q' */}
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`size-12 rounded-full border-4 flex items-center justify-center font-mono text-base font-bold transition-all duration-300 shadow-xl ${
                                qState === 0
                                  ? "bg-amber-500 border-amber-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.8)]"
                                  : "bg-neutral-900 border-neutral-700 text-neutral-500"
                              }`}
                            >
                              {qState === 1 ? 0 : 1}
                            </div>
                            <span className="font-mono text-xs font-bold text-neutral-200">
                              Inverted Q'
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Manual Action Button */}
                      <div className="mt-6 flex items-center justify-between w-full max-w-xl">
                        <span className="font-mono text-xs text-muted-foreground">
                          State: Q = {qState}, Q' = {qState === 1 ? 0 : 1}
                        </span>

                        <Button
                          onClick={triggerClockPulse}
                          className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground"
                        >
                          ⚡ Pulse Clock & Transition State
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Real-Time Timing Waveform Diagram */}
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                      <CardTitle className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                        Digital Logic Analyzer: Timing Trace (Last 20 Clock Pulses)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {timingHistory.length === 0 ? (
                        <div className="p-6 text-center font-mono text-xs text-muted-foreground rounded border border-dashed border-border">
                          Click '⚡ Pulse Clock' above to generate timing diagram traces.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Clock Waveform Trace */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono text-cyan-400">
                              <span>Clock (CLK)</span>
                              <span>Pulses: {timingHistory.length}</span>
                            </div>
                            <div className="h-10 w-full rounded border border-neutral-800 bg-neutral-950 p-1 flex items-end">
                              <svg
                                className="w-full h-full"
                                viewBox="0 0 400 30"
                                preserveAspectRatio="none"
                              >
                                <path
                                  d={timingHistory
                                    .map((pt, i) => {
                                      const x1 = (i / 20) * 400;
                                      const x2 = ((i + 0.5) / 20) * 400;
                                      const x3 = ((i + 1) / 20) * 400;
                                      return `M ${x1} 25 L ${x1} 5 L ${x2} 5 L ${x2} 25 L ${x3} 25`;
                                    })
                                    .join(" ")}
                                  fill="none"
                                  stroke="#06b6d4"
                                  strokeWidth="2"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* State Q Waveform Trace */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono text-emerald-400">
                              <span>Output State Q(t)</span>
                              <span>Current: {qState}</span>
                            </div>
                            <div className="h-10 w-full rounded border border-neutral-800 bg-neutral-950 p-1 flex items-end">
                              <svg
                                className="w-full h-full"
                                viewBox="0 0 400 30"
                                preserveAspectRatio="none"
                              >
                                <path
                                  d={timingHistory
                                    .map((pt, i) => {
                                      const x1 = (i / 20) * 400;
                                      const x2 = ((i + 1) / 20) * 400;
                                      const y = pt.q === 1 ? 5 : 25;
                                      return `${i === 0 ? "M" : "L"} ${x1} ${y} L ${x2} ${y}`;
                                    })
                                    .join(" ")}
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="2.5"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar Checklist + State Table */}
              <aside className="w-84 shrink-0 overflow-y-auto border-l border-border bg-sidebar p-4 space-y-6">
                <StepChecklistPanel
                  steps={PROCEDURE_STEPS}
                  currentStepIndex={currentStepIndex}
                  completedStepIndices={completedStepIndices}
                  onSelectStep={(idx) => setCurrentStepIndex(idx)}
                  attemptsMap={attemptsMap}
                  onShowHint={(idx) => handleShowHint(idx)}
                  onShowGuidedSolution={(idx) => setActiveGuidedModalStepIndex(idx)}
                  guidedSolutionUnlockedMap={guidedSolutionUnlockedMap}
                />

                <hr className="border-border" />

                {/* Transitions Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        State Transitions ({transitionRows.length})
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {transitionRows.length < 6
                          ? `Pulse clock ${6 - transitionRows.length} more times`
                          : "✓ Transition history recorded"}
                      </p>
                    </div>

                    {transitionRows.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearRows}
                        className="h-7 font-mono text-[10px] text-destructive hover:bg-destructive/10"
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden bg-card text-xs font-mono">
                    <div className="grid grid-cols-4 bg-sidebar p-2 font-bold text-[11px] border-b border-border text-center">
                      <span>Type</span>
                      <span>In</span>
                      <span>Q → Q+</span>
                      <span>Action</span>
                    </div>
                    <div className="divide-y divide-border max-h-56 overflow-y-auto">
                      {transitionRows.map((r, i) => (
                        <div
                          key={r.id}
                          className="grid grid-cols-4 p-2 text-center items-center text-[11px]"
                        >
                          <span className="font-bold text-primary">{r.type}</span>
                          <span>
                            {r.in1}
                            {r.type === "JK" || r.type === "SR" ? `,${r.in2}` : ""}
                          </span>
                          <span className="font-bold">
                            {r.qBefore} → {r.qAfter}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {r.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveTab("table")}
                    className="w-full font-mono text-xs"
                  >
                    View Complete State Tables →
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* TAB 4: STATE TABLES */}
        {activeTab === "table" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card className="bg-card border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground font-mono">
                    Digital Sequential Flip-Flop Characteristic Tables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                    {/* JK Table */}
                    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                      <h4 className="font-bold text-primary">JK Flip-Flop Characteristic Table</h4>
                      <p className="text-[11px] text-muted-foreground">Q(t+1) = J · Q' + K' · Q</p>
                      <div className="grid grid-cols-4 font-bold text-muted-foreground border-b border-border py-1 text-center">
                        <span>J</span>
                        <span>K</span>
                        <span>Q(t+1)</span>
                        <span>State</span>
                      </div>
                      <div className="divide-y divide-border text-center py-1">
                        <div className="grid grid-cols-4 py-1">
                          <span>0</span>
                          <span>0</span>
                          <span>Q(t)</span>
                          <span>Hold</span>
                        </div>
                        <div className="grid grid-cols-4 py-1">
                          <span>0</span>
                          <span>1</span>
                          <span className="text-amber-500 font-bold">0</span>
                          <span>Reset</span>
                        </div>
                        <div className="grid grid-cols-4 py-1">
                          <span>1</span>
                          <span>0</span>
                          <span className="text-emerald-500 font-bold">1</span>
                          <span>Set</span>
                        </div>
                        <div className="grid grid-cols-4 py-1">
                          <span>1</span>
                          <span>1</span>
                          <span className="text-primary font-bold">Q'(t)</span>
                          <span>Toggle</span>
                        </div>
                      </div>
                    </div>

                    {/* D & T Table */}
                    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                      <h4 className="font-bold text-primary">
                        D & T Flip-Flop Characteristic Table
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        D: Q(t+1) = D | T: Q(t+1) = T ⊕ Q
                      </p>
                      <div className="grid grid-cols-4 font-bold text-muted-foreground border-b border-border py-1 text-center">
                        <span>Type</span>
                        <span>Input</span>
                        <span>Q(t+1)</span>
                        <span>Action</span>
                      </div>
                      <div className="divide-y divide-border text-center py-1">
                        <div className="grid grid-cols-4 py-1">
                          <span>D</span>
                          <span>0</span>
                          <span className="text-amber-500 font-bold">0</span>
                          <span>Reset</span>
                        </div>
                        <div className="grid grid-cols-4 py-1">
                          <span>D</span>
                          <span>1</span>
                          <span className="text-emerald-500 font-bold">1</span>
                          <span>Set</span>
                        </div>
                        <div className="grid grid-cols-4 py-1">
                          <span>T</span>
                          <span>0</span>
                          <span>Q(t)</span>
                          <span>Hold</span>
                        </div>
                        <div className="grid grid-cols-4 py-1">
                          <span>T</span>
                          <span>1</span>
                          <span className="text-primary font-bold">Q'(t)</span>
                          <span>Toggle</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("experiment")}
                      className="font-mono text-xs"
                    >
                      ← Return to Simulator
                    </Button>
                    <Button
                      onClick={() => setActiveTab("posttest")}
                      className="font-mono text-xs gap-1.5"
                    >
                      Proceed to Post-Test Assessment →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 5: POST-TEST */}
        {activeTab === "posttest" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <PrePostTestCard
                type="posttest"
                title="Flip-Flop Circuits Post-Test Assessment"
                description="Verify what you learned regarding JK toggle modes and sequential bistables."
                questions={LAB_META.manual.postTestQuestions}
                onComplete={(score) => {
                  setPostScore(score);
                  if (score >= 1) setCertificateModalOpen(true);
                }}
              />

              {isCompleted && (
                <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 p-6 text-center space-y-3">
                  <span className="text-3xl">🎉</span>
                  <h3 className="font-mono text-lg font-bold text-foreground">
                    Digital Electronics Lab Series Completed!
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    You have verified basic & universal logic gates, half & full adders, and
                    sequential flip-flops.
                  </p>
                  <Button
                    onClick={() => setCertificateModalOpen(true)}
                    className="font-mono text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xs"
                  >
                    🎓 View & Print Completion Certificate
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <GuidedSolutionModal
        open={activeGuidedModalStepIndex !== null}
        onOpenChange={(open) => !open && setActiveGuidedModalStepIndex(null)}
        step={
          activeGuidedModalStepIndex !== null
            ? (PROCEDURE_STEPS[activeGuidedModalStepIndex] ?? null)
            : null
        }
        onClose={() => setActiveGuidedModalStepIndex(null)}
      />

      <CompletionCertificateModal
        open={certificateModalOpen}
        onOpenChange={setCertificateModalOpen}
        experimentTitle={LAB_META.title}
        categoryTitle={LAB_META.categoryTitle}
        score={totalXp}
        trialsRecorded={transitionRows.length}
        onClose={() => setCertificateModalOpen(false)}
      />
    </div>
  );
}
