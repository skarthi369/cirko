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

const LAB_META = LABS_CATALOG.find((l) => l.id === "logic-gates")!;

type GateType = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR" | "XNOR";

type GateDef = {
  type: GateType;
  name: string;
  icCode: string;
  expression: string;
  inputs: number;
  evaluate: (a: number, b: number) => number;
  description: string;
};

const GATE_DEFS: Record<GateType, GateDef> = {
  AND: {
    type: "AND",
    name: "AND Gate",
    icCode: "IC 7408 (Quad 2-Input)",
    expression: "Y = A · B",
    inputs: 2,
    evaluate: (a, b) => (a === 1 && b === 1 ? 1 : 0),
    description: "Output is HIGH (1) if and only if all inputs are HIGH.",
  },
  OR: {
    type: "OR",
    name: "OR Gate",
    icCode: "IC 7432 (Quad 2-Input)",
    expression: "Y = A + B",
    inputs: 2,
    evaluate: (a, b) => (a === 1 || b === 1 ? 1 : 0),
    description: "Output is HIGH (1) if at least one input is HIGH.",
  },
  NOT: {
    type: "NOT",
    name: "NOT Gate (Inverter)",
    icCode: "IC 7404 (Hex Inverter)",
    expression: "Y = A'",
    inputs: 1,
    evaluate: (a) => (a === 1 ? 0 : 1),
    description: "Inverts logic state: LOW produces HIGH, HIGH produces LOW.",
  },
  NAND: {
    type: "NAND",
    name: "NAND Gate (Universal)",
    icCode: "IC 7400 (Quad 2-Input)",
    expression: "Y = (A · B)'",
    inputs: 2,
    evaluate: (a, b) => (a === 1 && b === 1 ? 0 : 1),
    description: "Universal Gate: Output is LOW only when all inputs are HIGH.",
  },
  NOR: {
    type: "NOR",
    name: "NOR Gate (Universal)",
    icCode: "IC 7402 (Quad 2-Input)",
    expression: "Y = (A + B)'",
    inputs: 2,
    evaluate: (a, b) => (a === 0 && b === 0 ? 1 : 0),
    description: "Universal Gate: Output is HIGH only when all inputs are LOW.",
  },
  XOR: {
    type: "XOR",
    name: "XOR Gate (Exclusive-OR)",
    icCode: "IC 7486 (Quad 2-Input)",
    expression: "Y = A ⊕ B",
    inputs: 2,
    evaluate: (a, b) => (a !== b ? 1 : 0),
    description: "Output is HIGH when inputs have differing logic levels.",
  },
  XNOR: {
    type: "XNOR",
    name: "XNOR Gate (Equivalence)",
    icCode: "IC 74266 (Quad 2-Input)",
    expression: "Y = (A ⊕ B)'",
    inputs: 2,
    evaluate: (a, b) => (a === b ? 1 : 0),
    description: "Output is HIGH when both inputs are equal.",
  },
};

const PROCEDURE_STEPS: LabProcedureStepDef[] = [
  {
    stepNumber: 1,
    title: "Read Theory & Complete Pre-Test",
    instruction:
      "Understand Boolean algebra rules, TTL logic levels (0V/5V), and pass the prerequisite test.",
    hints: [
      "Review the manual: what makes NAND and NOR universal gates?",
      "Take the Pre-Test questions on logic gates.",
      "Score at least 1 correct answer on the Pre-Test.",
    ],
    guidedSolution: {
      title: "Boolean Logic Principles",
      explanation:
        "Digital ICs use binary voltages: Logic 0 is 0.0V–0.8V, Logic 1 is 2.0V–5.0V. Each gate executes a specific truth table mapping.",
      diagramText: `Input Switches (A, B) ──> [TTL Logic Gate IC] ──> Output Monitor LED (Y)`,
      expectedConnections: ["Pass Pre-Test assessment"],
      commonMistakes: ["Confusing XOR with OR operations."],
    },
  },
  {
    stepNumber: 2,
    title: "Select AND Gate (7408) & Apply (0, 0)",
    instruction:
      "Choose the 7408 AND gate, set Switch A = 0 and Switch B = 0, and log the output row.",
    hints: [
      "Click the 'AND Gate' selector button in the Digital IC palette.",
      "Ensure Switch A is 0 and Switch B is 0.",
      "Click 'Record Truth Table Row' to log the (0,0) state.",
    ],
    guidedSolution: {
      title: "AND Gate Baseline Testing",
      explanation: "For an AND gate (Y = A·B), when both inputs are 0, Y = 0·0 = 0 (LED is OFF).",
      diagramText: `A = 0, B = 0 ==> Y = 0 (LED OFF, 0V)`,
      expectedConnections: ["Select AND gate", "Set A=0, B=0"],
      commonMistakes: ["Recording without verifying switch positions."],
    },
  },
  {
    stepNumber: 3,
    title: "Complete All 4 AND Gate Combinations",
    instruction:
      "Test input combinations (0,1), (1,0), and (1,1) for the AND gate to complete its truth table.",
    hints: [
      "Set A=0, B=1 and record. Set A=1, B=0 and record.",
      "Set A=1, B=1 and observe the output LED turning ON (5V). Record the final row.",
      "Complete all 4 rows for the 7408 AND gate.",
    ],
    guidedSolution: {
      title: "AND Gate Full Truth Table",
      explanation:
        "0·0 = 0 | 0·1 = 0 | 1·0 = 0 | 1·1 = 1. Only the (1,1) combination turns the LED ON.",
      diagramText: `(0,0)->0 | (0,1)->0 | (1,0)->0 | (1,1)->1 [Complete]`,
      expectedConnections: ["4 rows logged for AND gate"],
      commonMistakes: ["Leaving combinations untested."],
    },
  },
  {
    stepNumber: 4,
    title: "Verify Universal NAND Gate (7400)",
    instruction:
      "Switch to the 7400 NAND gate and record all 4 input combinations to verify De Morgan inversion.",
    hints: [
      "Select 'NAND Gate' in the top palette.",
      "Test (0,0), (0,1), (1,0) and observe Y = 1 for all of them.",
      "Set A=1, B=1 and observe Y switching to 0.",
    ],
    guidedSolution: {
      title: "NAND Gate Verification",
      explanation:
        "NAND is the negation of AND: Y = (A·B)'. Output is 1 for (0,0), (0,1), (1,0) and 0 only for (1,1).",
      diagramText: `(0,0)->1 | (0,1)->1 | (1,0)->1 | (1,1)->0 [Universal Logic Verified]`,
      expectedConnections: ["NAND gate verified"],
      commonMistakes: ["Confusing NAND with NOR."],
    },
  },
  {
    stepNumber: 5,
    title: "Verify XOR Gate (7486)",
    instruction:
      "Select the 7486 XOR gate and verify that output is HIGH only when inputs differ (A ≠ B).",
    hints: [
      "Select 'XOR Gate' in the gate selector.",
      "Test (0,1) and (1,0) -> Output Y = 1.",
      "Test (0,0) and (1,1) -> Output Y = 0.",
    ],
    guidedSolution: {
      title: "Exclusive-OR (XOR) Operation",
      explanation:
        "XOR outputs 1 if inputs are strictly unequal: Y = A'B + AB'. Foundational for binary adders.",
      diagramText: `(0,0)->0 | (0,1)->1 | (1,0)->1 | (1,1)->0`,
      expectedConnections: ["XOR truth table verified"],
      commonMistakes: ["Expecting 1,1 to produce 1."],
    },
  },
  {
    stepNumber: 6,
    title: "Inspect Verified Truth Tables & Analysis",
    instruction:
      "Switch to the 'Truth Tables' tab and review verified logic equations and De Morgan theorems.",
    hints: [
      "Open the 'Truth Tables' tab.",
      "Confirm that all tested gates match their mathematical Boolean equations.",
      "Review the universal gate equivalence notes.",
    ],
    guidedSolution: {
      title: "Truth Table Mathematical Audit",
      explanation:
        "Your recorded values have been verified against Boolean matrix equations with 100% fidelity.",
      diagramText: `Audit status: ✓ All Truth Tables Validated`,
      expectedConnections: ["Truth table inspected"],
      commonMistakes: ["Skipping table review."],
    },
  },
  {
    stepNumber: 7,
    title: "Complete Post-Test & Claim Certificate",
    instruction: "Answer the Post-Test assessment to conclude the digital logic gates laboratory.",
    hints: [
      "Open the 'Post-Test' tab and answer the questions on universal gates and XOR truth tables.",
      "Submit and score at least 1-2 correct answers.",
      "View and print your Digital Electronics Completion Certificate.",
    ],
    guidedSolution: {
      title: "Digital Logic Verification Complete",
      explanation:
        "You have constructed truth tables, verified gate ICs, and confirmed the digital logic laws.",
      diagramText: `Pretest [✓] -> AND [✓] -> NAND [✓] -> XOR [✓] -> Posttest [✓] -> Certificate [🎓]`,
      expectedConnections: ["Post-Test submitted with passing score"],
      commonMistakes: ["Leaving post-test unsubmitted."],
    },
  },
];

type RecordedRow = {
  id: string;
  gate: GateType;
  a: number;
  b: number;
  y: number;
  isCorrect: boolean;
};

export default function LogicGatesLabContainer() {
  const [activeTab, setActiveTab] = useState("manual");

  // Gate selection and digital inputs
  const [selectedGate, setSelectedGate] = useState<GateType>("AND");
  const [inputA, setInputA] = useState<number>(0);
  const [inputB, setInputB] = useState<number>(0);

  // Truth table rows
  const [recordedRows, setRecordedRows] = useState<RecordedRow[]>(() => {
    try {
      const raw = localStorage.getItem("cirkit.lab.gates.rows.v1");
      return raw ? (JSON.parse(raw) as RecordedRow[]) : [];
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
      localStorage.setItem("cirkit.lab.gates.rows.v1", JSON.stringify(recordedRows));
    } catch {
      /* ignore */
    }
  }, [recordedRows]);

  const currentGateDef = GATE_DEFS[selectedGate];
  // Calculate true output
  const outputY = currentGateDef.evaluate(inputA, inputB);
  const outputVoltage = outputY === 1 ? 5.0 : 0.0;

  // Validation
  const validationInfo = useMemo(() => {
    const andRows = recordedRows.filter((r) => r.gate === "AND");
    const nandRows = recordedRows.filter((r) => r.gate === "NAND");
    const xorRows = recordedRows.filter((r) => r.gate === "XOR");

    const message = `Logic Gate Active: ${currentGateDef.name} (${currentGateDef.expression}). Inputs A=${inputA}, B=${inputB} => Y=${outputY} (${outputVoltage}V TTL).`;

    return {
      partsPlaced: true,
      topologyValid: true,
      simulationRunning: true,
      activeMeasurement: true,
      hasSubThresholdReading: andRows.length >= 1,
      hasKneeReading: andRows.length >= 4,
      hasLinearReading: nandRows.length >= 4 && xorRows.length >= 4,
      message,
      errorKind: "no_error" as const,
      vin: inputA,
      vd: outputVoltage,
      id: outputY,
    };
  }, [recordedRows, currentGateDef, inputA, inputB, outputY, outputVoltage]);

  // Completed steps tracker
  const completedStepIndices = useMemo(() => {
    const list: number[] = [];
    const andRows = recordedRows.filter((r) => r.gate === "AND");
    const nandRows = recordedRows.filter((r) => r.gate === "NAND");
    const xorRows = recordedRows.filter((r) => r.gate === "XOR");

    if (preScore !== null && preScore >= 1) list.push(0); // Step 1: Pre-test
    if (andRows.some((r) => r.a === 0 && r.b === 0)) list.push(1); // Step 2: (0,0) logged
    if (andRows.length >= 4) list.push(2); // Step 3: AND complete
    if (nandRows.length >= 4) list.push(3); // Step 4: NAND complete
    if (xorRows.length >= 4) list.push(4); // Step 5: XOR complete
    if (recordedRows.length >= 8 && activeTab === "table") list.push(5); // Step 6: Tables inspected
    if (postScore !== null && postScore >= 1) list.push(6); // Step 7: Post-test passed
    return list;
  }, [preScore, recordedRows, activeTab, postScore]);

  useEffect(() => {
    if (
      completedStepIndices.includes(currentStepIndex) &&
      currentStepIndex < PROCEDURE_STEPS.length - 1
    ) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [completedStepIndices, currentStepIndex]);

  // Log truth table row
  const handleRecordRow = () => {
    const rowId = `${selectedGate}-${inputA}-${inputB}`;
    const newRow: RecordedRow = {
      id: rowId,
      gate: selectedGate,
      a: inputA,
      b: inputB,
      y: outputY,
      isCorrect: true,
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

  // XP & Progress
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
    if (recordedRows.some((r) => r.gate === "AND")) {
      p += 15;
      xp += 15;
    }
    if (recordedRows.filter((r) => r.gate === "AND").length >= 4) {
      p += 20;
      xp += 20;
    }
    if (recordedRows.length >= 8) {
      p += 20;
      xp += 20;
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
              Digital Electronics · Experiment 1 of 3
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
              🔬 Logic Trainer ({completedStepIndices.length}/{PROCEDURE_STEPS.length})
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              📊 Truth Tables ({recordedRows.length} Rows)
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
                title="Logic Gates Prerequisite Knowledge Assessment"
                description="Test your conceptual understanding of universal gates and Boolean logic operations."
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
              {/* Digital IC Trainer Canvas */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6 bg-canvas">
                <div className="mx-auto max-w-4xl space-y-6">
                  {/* Gate IC Selector Bar */}
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-xs">
                    <span className="font-mono text-xs font-bold text-muted-foreground mr-1">
                      Select Gate IC:
                    </span>
                    {(Object.keys(GATE_DEFS) as GateType[]).map((gt) => (
                      <Button
                        key={gt}
                        size="sm"
                        variant={selectedGate === gt ? "default" : "outline"}
                        onClick={() => setSelectedGate(gt)}
                        className="font-mono text-xs h-7"
                      >
                        {gt} ({GATE_DEFS[gt].icCode.split(" ")[1]})
                      </Button>
                    ))}
                  </div>

                  {/* Digital Breadboard Schematic */}
                  <Card className="border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {currentGateDef.name} — {currentGateDef.icCode}
                        </span>
                        <Badge variant="outline" className="font-mono text-xs text-primary">
                          {currentGateDef.expression}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-8 flex flex-col items-center justify-center">
                      {/* Schematic Graphic with Glowing High/Low Logic Lines */}
                      <div className="relative w-full max-w-xl h-64 rounded-xl border border-border bg-neutral-950 p-6 flex items-center justify-between shadow-inner">
                        {/* Input Switches Side */}
                        <div className="flex flex-col gap-8 z-10">
                          {/* Switch A */}
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
                            <div className="text-left font-mono text-xs">
                              <p className="font-bold text-neutral-200">Switch A</p>
                              <p className="text-[10px] text-neutral-400">
                                {inputA === 1 ? "5V (HIGH)" : "0V (LOW)"}
                              </p>
                            </div>
                          </div>

                          {/* Switch B (if 2-input gate) */}
                          {currentGateDef.inputs === 2 && (
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
                              <div className="text-left font-mono text-xs">
                                <p className="font-bold text-neutral-200">Switch B</p>
                                <p className="text-[10px] text-neutral-400">
                                  {inputB === 1 ? "5V (HIGH)" : "0V (LOW)"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Central Gate Symbol Graphic */}
                        <div className="relative flex flex-col items-center justify-center p-4">
                          <div className="size-24 rounded-2xl border-2 border-primary/60 bg-neutral-900 flex flex-col items-center justify-center shadow-lg">
                            <span className="font-mono text-2xl font-bold text-primary">
                              {selectedGate}
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400 mt-1">
                              {currentGateDef.icCode.split(" ")[1]}
                            </span>
                          </div>
                        </div>

                        {/* Output LED & Meter */}
                        <div className="flex flex-col items-center gap-2 z-10">
                          <div
                            className={`size-14 rounded-full border-4 flex items-center justify-center font-mono text-lg font-bold transition-all duration-300 shadow-xl ${
                              outputY === 1
                                ? "bg-emerald-500 border-emerald-300 text-white shadow-[0_0_25px_rgba(16,185,129,0.8)] animate-pulse"
                                : "bg-neutral-900 border-neutral-700 text-neutral-500"
                            }`}
                          >
                            {outputY}
                          </div>
                          <span className="font-mono text-xs font-bold text-neutral-200">
                            Output Y
                          </span>
                          <span
                            className={`font-mono text-[11px] font-bold ${
                              outputY === 1 ? "text-emerald-400" : "text-neutral-500"
                            }`}
                          >
                            {outputVoltage.toFixed(1)} V (TTL {outputY === 1 ? "HIGH" : "LOW"})
                          </span>
                        </div>
                      </div>

                      {/* Controls Bar */}
                      <div className="mt-6 flex items-center justify-between w-full max-w-xl">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInputA((v) => (v === 1 ? 0 : 1));
                            }}
                            className="font-mono text-xs"
                          >
                            Toggle A
                          </Button>
                          {currentGateDef.inputs === 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setInputB((v) => (v === 1 ? 0 : 1));
                              }}
                              className="font-mono text-xs"
                            >
                              Toggle B
                            </Button>
                          )}
                        </div>

                        <Button
                          onClick={handleRecordRow}
                          className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground"
                        >
                          📸 Record Truth Table Row ({selectedGate}: A={inputA}, B={inputB} → Y=
                          {outputY})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar: Step Checklist + Live Truth Table */}
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

                {/* Active Gate Truth Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {selectedGate} Truth Table (
                        {recordedRows.filter((r) => r.gate === selectedGate).length} /{" "}
                        {currentGateDef.inputs === 1 ? 2 : 4})
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {recordedRows.filter((r) => r.gate === selectedGate).length ===
                        (currentGateDef.inputs === 1 ? 2 : 4)
                          ? "✓ Truth table completely verified"
                          : "Log all binary input states"}
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
                    <div className="grid grid-cols-4 bg-sidebar p-2 font-bold text-[11px] border-b border-border text-center">
                      <span>A</span>
                      <span>B</span>
                      <span>Y (Obs)</span>
                      <span>Status</span>
                    </div>
                    <div className="divide-y divide-border">
                      {(currentGateDef.inputs === 1 ? [0, 1] : [0, 1, 2, 3]).map((comboIdx) => {
                        const aVal =
                          currentGateDef.inputs === 1 ? comboIdx : Math.floor(comboIdx / 2);
                        const bVal = currentGateDef.inputs === 1 ? 0 : comboIdx % 2;
                        const expected = currentGateDef.evaluate(aVal, bVal);
                        const logged = recordedRows.find(
                          (r) =>
                            r.gate === selectedGate &&
                            r.a === aVal &&
                            (currentGateDef.inputs === 1 || r.b === bVal),
                        );

                        return (
                          <div
                            key={comboIdx}
                            className={`grid grid-cols-4 p-2 text-center items-center ${
                              logged ? "bg-emerald-500/5" : "text-muted-foreground"
                            }`}
                          >
                            <span>{aVal}</span>
                            <span>{currentGateDef.inputs === 1 ? "—" : bVal}</span>
                            <span className="font-bold text-foreground">
                              {logged ? logged.y : "—"}
                            </span>
                            <span>
                              {logged ? (
                                <span className="text-emerald-500 font-bold">✓ Verified</span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Pending</span>
                              )}
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

        {/* TAB 4: TRUTH TABLES */}
        {activeTab === "table" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card className="bg-card border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground font-mono">
                    Digital Logic Verified Truth Table Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Object.keys(GATE_DEFS) as GateType[]).map((gt) => {
                      const gDef = GATE_DEFS[gt];
                      const rowsForGate = recordedRows.filter((r) => r.gate === gt);

                      return (
                        <div
                          key={gt}
                          className="rounded-lg border border-border bg-card p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="font-mono text-xs font-bold text-primary">
                              {gDef.name} ({gDef.icCode.split(" ")[1]})
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {gDef.expression}
                            </span>
                          </div>

                          <div className="text-xs font-mono grid grid-cols-3 text-center py-1 font-bold text-muted-foreground">
                            <span>A</span>
                            <span>B</span>
                            <span>Output Y</span>
                          </div>
                          <div className="divide-y divide-border text-xs font-mono text-center">
                            {(gDef.inputs === 1 ? [0, 1] : [0, 1, 2, 3]).map((idx) => {
                              const a = gDef.inputs === 1 ? idx : Math.floor(idx / 2);
                              const b = gDef.inputs === 1 ? 0 : idx % 2;
                              const logged = rowsForGate.find(
                                (r) => r.a === a && (gDef.inputs === 1 || r.b === b),
                              );

                              return (
                                <div key={idx} className="grid grid-cols-3 py-1">
                                  <span>{a}</span>
                                  <span>{gDef.inputs === 1 ? "—" : b}</span>
                                  <span
                                    className={
                                      logged
                                        ? "text-emerald-500 font-bold"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    {logged ? logged.y : "—"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("experiment")}
                      className="font-mono text-xs"
                    >
                      ← Return to Logic Trainer
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
                title="Logic Gates Post-Test Assessment"
                description="Verify what you learned regarding XOR gate truth tables and universal gate construction."
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
                    Logic Gates Laboratory Completed!
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    You have verified basic and universal digital logic gates, validated all Boolean
                    truth tables, and passed the assessment.
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
