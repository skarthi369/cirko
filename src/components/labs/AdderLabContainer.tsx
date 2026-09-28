import { useState, useMemo, useEffect } from "react";
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

const LAB_META = LABS_CATALOG.find((l) => l.id === "half-full-adder")!;

type AdderMode = "half" | "full";

const PROCEDURE_STEPS: LabProcedureStepDef[] = [
  {
    stepNumber: 1,
    title: "Read Theory & Pass Pre-Test",
    instruction: "Understand binary arithmetic (1+1 = 10_2) and pass the prerequisite assessment.",
    hints: [
      "Review the formula: Half Adder Sum = A ⊕ B, Carry = A · B.",
      "Take the Pre-Test questions on binary addition.",
      "Score at least 1 correct answer on the Pre-Test.",
    ],
    guidedSolution: {
      title: "Binary Addition Principles",
      explanation:
        "Adding two binary bits produces Sum and Carry: 0+0=0, 0+1=1, 1+0=1, 1+1=10_2 (Sum 0, Carry 1). A Full Adder adds a third input Cin.",
      diagramText: `Inputs (A, B, Cin) ──> [Cascaded Half Adders + OR Gate] ──> Sum (S), Carry (Cout)`,
      expectedConnections: ["Complete Pre-Test assessment"],
      commonMistakes: ["Forgetting that 1+1 creates a Carry bit."],
    },
  },
  {
    stepNumber: 2,
    title: "Verify Half Adder Mode (4 Rows)",
    instruction: "Select 'Half Adder' mode and record combinations (0,0), (0,1), (1,0), and (1,1).",
    hints: [
      "Toggle Switch A and Switch B to all 4 combinations.",
      "Click 'Record Adder Row' for each state.",
      "Verify that only (1,1) sets Carry = 1.",
    ],
    guidedSolution: {
      title: "Half Adder Truth Table",
      explanation: "Sum = A ⊕ B, Carry = A · B. Complete all 4 rows in the table.",
      diagramText: `(0,0)->S0,C0 | (0,1)->S1,C0 | (1,0)->S1,C0 | (1,1)->S0,C1`,
      expectedConnections: ["4 Half Adder rows recorded"],
      commonMistakes: ["Switching to Full Adder before finishing Half Adder."],
    },
  },
  {
    stepNumber: 3,
    title: "Switch to Full Adder Mode",
    instruction: "Click 'Full Adder (3 Inputs)' to activate the third carry-in bit (Cin).",
    hints: [
      "Click the 'Full Adder' selector button.",
      "Notice the third input switch (Cin) appears.",
      "Begin testing with Cin = 0.",
    ],
    guidedSolution: {
      title: "Full Adder Circuit Configuration",
      explanation:
        "Full Adder sums three 1-bit inputs: A, B, and Cin. It requires two XOR gates, two AND gates, and one OR gate.",
      diagramText: `Sum = A ⊕ B ⊕ Cin | Cout = AB + Cin(A ⊕ B)`,
      expectedConnections: ["Full Adder mode active"],
      commonMistakes: ["Leaving Cin unasserted."],
    },
  },
  {
    stepNumber: 4,
    title: "Test Full Adder with Cin = 0 (4 Combinations)",
    instruction:
      "Set Cin = 0 and record combinations 000, 010, 100, and 110 into the Full Adder table.",
    hints: [
      "Keep Cin = 0. Vary A and B across 0 and 1.",
      "Record each row into the table.",
      "Verify that (1,1,0) produces Sum=0, Cout=1.",
    ],
    guidedSolution: {
      title: "Full Adder Low Carry State",
      explanation: "When Cin=0, Full Adder outputs match standard Half Adder behavior.",
      diagramText: `(000)->S0,C0 | (010)->S1,C0 | (100)->S1,C0 | (110)->S0,C1`,
      expectedConnections: ["4 rows logged with Cin=0"],
      commonMistakes: ["Accidentally toggling Cin."],
    },
  },
  {
    stepNumber: 5,
    title: "Test Full Adder with Cin = 1 (All 8 Combinations)",
    instruction:
      "Set Cin = 1 and record the remaining 4 combinations (001, 011, 101, 111) to complete the 8-row table.",
    hints: [
      "Turn Cin = 1. Test A=0, B=0 (1+0+0 = Sum 1, Carry 0).",
      "Test A=1, B=1, Cin=1 (1+1+1 = Sum 1, Carry 1, decimal 3!).",
      "Complete all 8 rows for the Full Adder.",
    ],
    guidedSolution: {
      title: "Full Adder Complete 8-Row Matrix",
      explanation:
        "The critical state is (1,1,1): 1+1+1 = 3 in decimal, which is 11 in binary (Sum=1, Cout=1).",
      diagramText: `(1,1,1) => Sum = 1, Carry = 1 (Decimal 3)`,
      expectedConnections: ["All 8 Full Adder rows logged"],
      commonMistakes: ["Thinking 1+1+1 produces Carry 0."],
    },
  },
  {
    stepNumber: 6,
    title: "Review Arithmetic Summary & Tables",
    instruction:
      "Inspect the 'Arithmetic Tables' tab and confirm that binary addition matches decimal math.",
    hints: [
      "Switch to the 'Arithmetic Tables' tab.",
      "Verify the 8-row truth table and cascade logic diagram.",
      "Confirm all 8 states are marked verified.",
    ],
    guidedSolution: {
      title: "Binary Arithmetic Verification Audit",
      explanation:
        "Every output bit perfectly satisfies S = A ⊕ B ⊕ Cin and Cout = AB + Cin(A ⊕ B).",
      diagramText: `Audit Status: ✓ Full Adder 8/8 Combinations Verified`,
      expectedConnections: ["Arithmetic table reviewed"],
      commonMistakes: ["Skipping table review."],
    },
  },
  {
    stepNumber: 7,
    title: "Complete Post-Test & Claim Certificate",
    instruction: "Answer the Post-Test assessment to conclude the Adder Laboratory.",
    hints: [
      "Open the 'Post-Test' tab and answer the questions on Half Adders and OR gates required.",
      "Submit and score at least 1-2 correct answers.",
      "View and print your Digital Arithmetic Certificate.",
    ],
    guidedSolution: {
      title: "Adder Laboratory Complete",
      explanation:
        "You have constructed Half and Full Adders, verified binary carry propagation, and validated the ALU arithmetic foundation.",
      diagramText: `Pretest [✓] -> Half Adder [✓] -> Full Adder [✓] -> Posttest [✓] -> Certificate [🎓]`,
      expectedConnections: ["Post-Test submitted with passing score"],
      commonMistakes: ["Leaving post-test unsubmitted."],
    },
  },
];

type AdderRow = {
  id: string;
  mode: AdderMode;
  a: number;
  b: number;
  cin: number;
  sum: number;
  carry: number;
};

export default function AdderLabContainer() {
  const [activeTab, setActiveTab] = useState("manual");
  const [mode, setMode] = useState<AdderMode>("full");

  // Inputs
  const [inputA, setInputA] = useState<number>(0);
  const [inputB, setInputB] = useState<number>(0);
  const [inputCin, setInputCin] = useState<number>(0);

  // Table rows
  const [recordedRows, setRecordedRows] = useState<AdderRow[]>(() => {
    try {
      const raw = localStorage.getItem("cirkit.lab.adder.rows.v1");
      return raw ? (JSON.parse(raw) as AdderRow[]) : [];
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
      localStorage.setItem("cirkit.lab.adder.rows.v1", JSON.stringify(recordedRows));
    } catch {
      /* ignore */
    }
  }, [recordedRows]);

  // Mathematical calculations
  const { sum, carry, decimalTotal } = useMemo(() => {
    if (mode === "half") {
      const s = inputA ^ inputB;
      const c = inputA & inputB;
      return { sum: s, carry: c, decimalTotal: inputA + inputB };
    } else {
      const s = inputA ^ inputB ^ inputCin;
      const c = (inputA & inputB) | (inputCin & (inputA ^ inputB));
      return { sum: s, carry: c, decimalTotal: inputA + inputB + inputCin };
    }
  }, [mode, inputA, inputB, inputCin]);

  // Validation
  const validationInfo = useMemo(() => {
    const halfRows = recordedRows.filter((r) => r.mode === "half");
    const fullRows = recordedRows.filter((r) => r.mode === "full");

    const message = `${mode === "half" ? "Half Adder" : "Full Adder"} Active: A=${inputA}, B=${inputB}${
      mode === "full" ? `, Cin=${inputCin}` : ""
    } => Sum=${sum}, Carry=${carry} (Decimal: ${decimalTotal}).`;

    return {
      partsPlaced: true,
      topologyValid: true,
      simulationRunning: true,
      activeMeasurement: true,
      hasSubThresholdReading: halfRows.length >= 4,
      hasKneeReading: fullRows.length >= 4,
      hasLinearReading: fullRows.length >= 8,
      message,
      errorKind: "no_error" as const,
      vin: decimalTotal,
      vd: sum * 5.0,
      id: carry * 5.0,
    };
  }, [recordedRows, mode, inputA, inputB, inputCin, sum, carry, decimalTotal]);

  const completedStepIndices = useMemo(() => {
    const list: number[] = [];
    const halfRows = recordedRows.filter((r) => r.mode === "half");
    const fullRows = recordedRows.filter((r) => r.mode === "full");

    if (preScore !== null && preScore >= 1) list.push(0); // Step 1: Pre-test
    if (halfRows.length >= 4) list.push(1); // Step 2: Half Adder done
    if (mode === "full") list.push(2); // Step 3: Full Adder mode active
    if (fullRows.filter((r) => r.cin === 0).length >= 4) list.push(3); // Step 4: Cin=0 tested
    if (fullRows.length >= 8) list.push(4); // Step 5: All 8 Full Adder rows logged
    if (fullRows.length >= 8 && activeTab === "table") list.push(6); // Step 6: Tables inspected
    if (postScore !== null && postScore >= 1) list.push(6); // Step 7: Post-test passed
    return list;
  }, [preScore, recordedRows, mode, activeTab, postScore]);

  useEffect(() => {
    if (
      completedStepIndices.includes(currentStepIndex) &&
      currentStepIndex < PROCEDURE_STEPS.length - 1
    ) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [completedStepIndices, currentStepIndex]);

  const handleRecordRow = () => {
    const rowId = `${mode}-${inputA}-${inputB}-${mode === "full" ? inputCin : 0}`;
    const newRow: AdderRow = {
      id: rowId,
      mode,
      a: inputA,
      b: inputB,
      cin: mode === "full" ? inputCin : 0,
      sum,
      carry,
    };

    setRecordedRows((prev) => {
      const filtered = prev.filter((r) => r.id !== rowId);
      return [...filtered, newRow];
    });
  };

  const handleClearRows = () => {
    setRecordedRows([]);
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
    if (recordedRows.filter((r) => r.mode === "half").length >= 4) {
      p += 20;
      xp += 20;
    }
    if (recordedRows.filter((r) => r.mode === "full").length >= 8) {
      p += 35;
      xp += 35;
    }
    if (postScore !== null && postScore >= 1) {
      p += 20;
      xp += 15;
    }
    return { progressPercent: Math.min(100, p), totalXp: Math.min(100, xp) };
  }, [theoryRead, preScore, recordedRows, postScore]);

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
              Digital Electronics · Experiment 2 of 3
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
              🔬 Adder Simulation ({completedStepIndices.length}/{PROCEDURE_STEPS.length})
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              📊 Arithmetic Tables ({recordedRows.length} Rows)
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
                title="Binary Adder Prerequisite Assessment"
                description="Test binary carry and sum arithmetic fundamentals."
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
              onRecordMeasurement={handleRecordRow}
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
              {/* Adder Circuit Canvas */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6 bg-canvas">
                <div className="mx-auto max-w-4xl space-y-6">
                  {/* Mode Selector */}
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-xs">
                    <span className="font-mono text-xs font-bold text-muted-foreground mr-1">
                      Select Circuit:
                    </span>
                    <Button
                      size="sm"
                      variant={mode === "half" ? "default" : "outline"}
                      onClick={() => setMode("half")}
                      className="font-mono text-xs h-7"
                    >
                      Half Adder (2 Inputs)
                    </Button>
                    <Button
                      size="sm"
                      variant={mode === "full" ? "default" : "outline"}
                      onClick={() => setMode("full")}
                      className="font-mono text-xs h-7"
                    >
                      Full Adder (3 Inputs)
                    </Button>
                  </div>

                  {/* Schematic Card */}
                  <Card className="border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {mode === "half"
                            ? "Half Adder Circuit"
                            : "Full Adder Circuit (2x 7486, 2x 7408, 1x 7432)"}
                        </span>
                        <Badge variant="outline" className="font-mono text-xs text-primary">
                          {mode === "half"
                            ? "S = A ⊕ B, C = A·B"
                            : "S = A ⊕ B ⊕ Cin, Cout = AB + Cin(A ⊕ B)"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-8 flex flex-col items-center justify-center">
                      <div className="relative w-full max-w-xl h-72 rounded-xl border border-border bg-neutral-950 p-6 flex items-center justify-between shadow-inner">
                        {/* Binary Switches */}
                        <div className="flex flex-col gap-5 z-10">
                          {/* A */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setInputA((v) => (v === 1 ? 0 : 1))}
                              className={`size-10 rounded-lg font-mono text-sm font-bold border-2 transition-all shadow-md ${
                                inputA === 1
                                  ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                  : "bg-neutral-800 border-neutral-600 text-neutral-400"
                              }`}
                            >
                              {inputA}
                            </button>
                            <span className="font-mono text-xs font-bold text-neutral-200">
                              Bit A
                            </span>
                          </div>

                          {/* B */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setInputB((v) => (v === 1 ? 0 : 1))}
                              className={`size-10 rounded-lg font-mono text-sm font-bold border-2 transition-all shadow-md ${
                                inputB === 1
                                  ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                  : "bg-neutral-800 border-neutral-600 text-neutral-400"
                              }`}
                            >
                              {inputB}
                            </button>
                            <span className="font-mono text-xs font-bold text-neutral-200">
                              Bit B
                            </span>
                          </div>

                          {/* Cin (if Full Adder) */}
                          {mode === "full" && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setInputCin((v) => (v === 1 ? 0 : 1))}
                                className={`size-10 rounded-lg font-mono text-sm font-bold border-2 transition-all shadow-md ${
                                  inputCin === 1
                                    ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                    : "bg-neutral-800 border-neutral-600 text-neutral-400"
                                }`}
                              >
                                {inputCin}
                              </button>
                              <span className="font-mono text-xs font-bold text-neutral-200">
                                Carry In (Cin)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Central Adder Logic Block */}
                        <div className="relative flex flex-col items-center justify-center p-4">
                          <div className="size-28 rounded-2xl border-2 border-primary/60 bg-neutral-900 flex flex-col items-center justify-center shadow-lg text-center p-2">
                            <span className="font-mono text-lg font-bold text-primary">
                              {mode === "half" ? "HALF ADDER" : "FULL ADDER"}
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400 mt-1">
                              Σ = {decimalTotal} (Base 10)
                            </span>
                          </div>
                        </div>

                        {/* Output Status Bit LEDs */}
                        <div className="flex flex-col gap-6 items-center z-10">
                          {/* Sum */}
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`size-12 rounded-full border-4 flex items-center justify-center font-mono text-base font-bold transition-all duration-300 shadow-xl ${
                                sum === 1
                                  ? "bg-emerald-500 border-emerald-300 text-white shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                                  : "bg-neutral-900 border-neutral-700 text-neutral-500"
                              }`}
                            >
                              {sum}
                            </div>
                            <span className="font-mono text-xs font-bold text-neutral-200">
                              Sum (S)
                            </span>
                          </div>

                          {/* Carry */}
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`size-12 rounded-full border-4 flex items-center justify-center font-mono text-base font-bold transition-all duration-300 shadow-xl ${
                                carry === 1
                                  ? "bg-amber-500 border-amber-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.8)]"
                                  : "bg-neutral-900 border-neutral-700 text-neutral-500"
                              }`}
                            >
                              {carry}
                            </div>
                            <span className="font-mono text-xs font-bold text-neutral-200">
                              Carry Out (C)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-6 flex items-center justify-between w-full max-w-xl">
                        <span className="font-mono text-xs text-muted-foreground">
                          Binary Result: {carry}
                          {sum}_2 = Decimal {decimalTotal}
                        </span>

                        <Button
                          onClick={handleRecordRow}
                          className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground"
                        >
                          📸 Record Row (A={inputA}, B={inputB}
                          {mode === "full" ? `, Cin=${inputCin}` : ""} → S={sum}, C={carry})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar Checklist + Table */}
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

                {/* Live Adder Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {mode === "half" ? "Half Adder" : "Full Adder"} Table (
                        {recordedRows.filter((r) => r.mode === mode).length} /{" "}
                        {mode === "half" ? 4 : 8})
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {recordedRows.filter((r) => r.mode === mode).length ===
                        (mode === "half" ? 4 : 8)
                          ? "✓ Truth table complete"
                          : "Log all binary combinations"}
                      </p>
                    </div>

                    {recordedRows.length > 0 && (
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
                    <div className="grid grid-cols-5 bg-sidebar p-2 font-bold text-[11px] border-b border-border text-center">
                      <span>A</span>
                      <span>B</span>
                      <span>{mode === "full" ? "Cin" : "—"}</span>
                      <span>Sum</span>
                      <span>Carry</span>
                    </div>
                    <div className="divide-y divide-border">
                      {(mode === "half" ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6, 7]).map((combo) => {
                        const a = mode === "half" ? Math.floor(combo / 2) : Math.floor(combo / 4);
                        const b = mode === "half" ? combo % 2 : Math.floor((combo % 4) / 2);
                        const cin = mode === "half" ? 0 : combo % 2;
                        const logged = recordedRows.find(
                          (r) =>
                            r.mode === mode &&
                            r.a === a &&
                            r.b === b &&
                            (mode === "half" || r.cin === cin),
                        );

                        return (
                          <div
                            key={combo}
                            className={`grid grid-cols-5 p-2 text-center items-center ${
                              logged ? "bg-emerald-500/5 font-bold" : "text-muted-foreground"
                            }`}
                          >
                            <span>{a}</span>
                            <span>{b}</span>
                            <span>{mode === "full" ? cin : "—"}</span>
                            <span className={logged ? "text-emerald-500" : ""}>
                              {logged ? logged.sum : "—"}
                            </span>
                            <span className={logged ? "text-amber-500" : ""}>
                              {logged ? logged.carry : "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveTab("table")}
                    className="w-full font-mono text-xs"
                  >
                    View Complete Verified Tables →
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* TAB 4: ARITHMETIC TABLES */}
        {activeTab === "table" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card className="bg-card border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground font-mono">
                    Binary Arithmetic Verified Truth Tables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Half Adder */}
                    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                      <h4 className="font-mono text-xs font-bold text-primary">
                        Half Adder (2 Inputs)
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Sum = A ⊕ B, Carry = A · B
                      </p>
                      <div className="grid grid-cols-4 font-mono text-xs text-center font-bold text-muted-foreground py-1 border-b border-border">
                        <span>A</span>
                        <span>B</span>
                        <span>Sum</span>
                        <span>Carry</span>
                      </div>
                      <div className="divide-y divide-border font-mono text-xs text-center">
                        {[0, 1, 2, 3].map((combo) => {
                          const a = Math.floor(combo / 2);
                          const b = combo % 2;
                          const logged = recordedRows.find(
                            (r) => r.mode === "half" && r.a === a && r.b === b,
                          );
                          return (
                            <div key={combo} className="grid grid-cols-4 py-1.5">
                              <span>{a}</span>
                              <span>{b}</span>
                              <span className="text-emerald-500 font-bold">
                                {logged ? logged.sum : a ^ b}
                              </span>
                              <span className="text-amber-500 font-bold">
                                {logged ? logged.carry : a & b}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Full Adder */}
                    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                      <h4 className="font-mono text-xs font-bold text-primary">
                        Full Adder (3 Inputs)
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Sum = A ⊕ B ⊕ Cin, Cout = AB + Cin(A ⊕ B)
                      </p>
                      <div className="grid grid-cols-5 font-mono text-xs text-center font-bold text-muted-foreground py-1 border-b border-border">
                        <span>A</span>
                        <span>B</span>
                        <span>Cin</span>
                        <span>Sum</span>
                        <span>Cout</span>
                      </div>
                      <div className="divide-y divide-border font-mono text-xs text-center">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((combo) => {
                          const a = Math.floor(combo / 4);
                          const b = Math.floor((combo % 4) / 2);
                          const cin = combo % 2;
                          const logged = recordedRows.find(
                            (r) => r.mode === "full" && r.a === a && r.b === b && r.cin === cin,
                          );
                          const expSum = a ^ b ^ cin;
                          const expC = (a & b) | (cin & (a ^ b));
                          return (
                            <div key={combo} className="grid grid-cols-5 py-1.5">
                              <span>{a}</span>
                              <span>{b}</span>
                              <span>{cin}</span>
                              <span className="text-emerald-500 font-bold">
                                {logged ? logged.sum : expSum}
                              </span>
                              <span className="text-amber-500 font-bold">
                                {logged ? logged.carry : expC}
                              </span>
                            </div>
                          );
                        })}
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
                title="Adder Circuits Post-Test Assessment"
                description="Verify what you learned regarding full adder synthesis and binary addition."
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
                    Adder Circuits Laboratory Completed!
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    You have verified Half and Full binary adder circuits, logged all truth tables,
                    and passed the assessment.
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
        trialsRecorded={recordedRows.length}
        onClose={() => setCertificateModalOpen(false)}
      />
    </div>
  );
}
