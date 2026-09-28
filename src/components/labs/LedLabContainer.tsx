import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import Editor from "@/components/circuit/Editor";
import type { Design } from "@/components/circuit/types";
import type { SimResult } from "@/lib/simulate";
import { validateLedLabStep, type StepValidationInfo } from "@/lib/labs/ledValidation";
import { LABS_CATALOG } from "@/lib/labs/catalog";
import type { Observation } from "@/lib/labs/types";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import TopGuidanceBanner from "@/components/labs/TopGuidanceBanner";
import StepChecklistPanel from "@/components/labs/StepChecklistPanel";
import ObservationTable from "@/components/labs/ObservationTable";
import LabGraph from "@/components/labs/LabGraph";
import LabManualSection from "@/components/labs/LabManualSection";
import PrePostTestCard from "@/components/labs/PrePostTestCard";
import GuidedSolutionModal from "@/components/labs/GuidedSolutionModal";
import CompletionCertificateModal from "@/components/labs/CompletionCertificateModal";

const LED_LAB_META = LABS_CATALOG.find((l) => l.id === "characterization-led")!;
const PROCEDURE_STEPS = LED_LAB_META.procedureStepDefs!;

const INITIAL_LAB_DESIGN: Design = {
  name: "LED Characterization Setup",
  parts: [
    { id: "lab-bat", type: "battery", x: 120, y: 200, rotation: 0, props: { voltage: "1.5" } },
    { id: "lab-res", type: "resistor", x: 340, y: 140, rotation: 0, props: { resistance: "220" } },
    { id: "lab-led", type: "led", x: 540, y: 210, rotation: 0, props: { color: "red" } },
  ],
  wires: [
    {
      id: "lab-w1",
      from: { partId: "lab-bat", pinId: "pos" },
      to: { partId: "lab-res", pinId: "a" },
      color: "#ff5d5d",
    },
    {
      id: "lab-w2",
      from: { partId: "lab-res", pinId: "b" },
      to: { partId: "lab-led", pinId: "anode" },
      color: "#f5a524",
    },
    {
      id: "lab-w3",
      from: { partId: "lab-led", pinId: "cathode" },
      to: { partId: "lab-bat", pinId: "neg" },
      color: "#1f2933",
    },
  ],
};

export default function LedLabContainer() {
  const [activeTab, setActiveTab] = useState("manual");
  const [design, setDesign] = useState<Design>(INITIAL_LAB_DESIGN);
  const [sim, setSim] = useState<SimResult | null>(null);

  // Observations storage (isolated to lab)
  const [observations, setObservations] = useState<Observation[]>(() => {
    try {
      const raw = localStorage.getItem("cirkit.lab.led.observations.v1");
      return raw ? (JSON.parse(raw) as Observation[]) : [];
    } catch {
      return [];
    }
  });

  // Test and manual progress
  const [theoryRead, setTheoryRead] = useState(false);
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);

  // Guided step progression state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [attemptsMap, setAttemptsMap] = useState<Record<number, number>>({});
  const [guidedSolutionUnlockedMap, setGuidedSolutionUnlockedMap] = useState<
    Record<number, boolean>
  >({});
  const [showMeActive, setShowMeActive] = useState(false);

  // Modals state
  const [activeGuidedModalStepIndex, setActiveGuidedModalStepIndex] = useState<number | null>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Persist observations
  useEffect(() => {
    try {
      localStorage.setItem("cirkit.lab.led.observations.v1", JSON.stringify(observations));
    } catch {
      /* ignore */
    }
  }, [observations]);

  // Real-time circuit step validation
  const validation: StepValidationInfo = useMemo(() => {
    return validateLedLabStep(design, sim, observations.length);
  }, [design, sim, observations.length]);

  // Handle editor updates
  const handleDesignChange = useCallback((newDesign: Design, newSim: SimResult | null) => {
    setDesign(newDesign);
    setSim(newSim);
  }, []);

  // Compute completed step indices based on actual circuit & simulation state
  const completedStepIndices = useMemo(() => {
    const list: number[] = [];
    if (validation.partsPlaced) list.push(0); // Step 1: Parts placed
    if (validation.topologyValid) list.push(1); // Step 2: Wires connected
    if (validation.simulationRunning) list.push(2); // Step 3: Simulation running
    if (observations.length >= 1) list.push(3); // Step 4: First reading logged
    if (observations.length >= 3) list.push(4); // Step 5: Knee region logged
    if (observations.length >= 4) list.push(5); // Step 6: Full curve dataset
    if (postScore !== null && postScore >= 2) list.push(6); // Step 7: Post-test passed
    return list;
  }, [validation, observations.length, postScore]);

  // Auto-advance active step as student achieves milestones
  useEffect(() => {
    if (
      completedStepIndices.includes(currentStepIndex) &&
      currentStepIndex < PROCEDURE_STEPS.length - 1
    ) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [completedStepIndices, currentStepIndex]);

  // Record Measurement
  const handleRecordMeasurement = () => {
    if (
      !validation.activeMeasurement ||
      validation.vd === undefined ||
      validation.id === undefined
    ) {
      // Record failed attempt
      setAttemptsMap((prev) => {
        const nextAttempts = (prev[currentStepIndex] ?? 0) + 1;
        if (nextAttempts >= 3) {
          setGuidedSolutionUnlockedMap((gu) => ({ ...gu, [currentStepIndex]: true }));
        }
        return { ...prev, [currentStepIndex]: nextAttempts };
      });
      return;
    }

    const newObs: Observation = {
      trial: observations.length + 1,
      timestamp: Date.now(),
      voltage: Number(validation.vd.toFixed(3)),
      current: Number(validation.id.toFixed(3)),
      batteryVoltage: validation.vin,
    };

    setObservations((prev) => [...prev, newObs]);
  };

  const handleDeleteObservation = (trial: number) => {
    setObservations((prev) =>
      prev.filter((o) => o.trial !== trial).map((o, idx) => ({ ...o, trial: idx + 1 })),
    );
  };

  const handleClearObservations = () => {
    setObservations([]);
  };

  // Attempt failure trigger
  const registerStepFailure = (stepIdx: number) => {
    setAttemptsMap((prev) => {
      const nextVal = (prev[stepIdx] ?? 0) + 1;
      if (nextVal >= 3) {
        setGuidedSolutionUnlockedMap((gu) => ({ ...gu, [stepIdx]: true }));
      }
      return { ...prev, [stepIdx]: nextVal };
    });
  };

  // Hint display logic
  const handleShowHint = (stepIdx: number = currentStepIndex) => {
    const stepDef = PROCEDURE_STEPS[stepIdx];
    if (!stepDef) return;

    const attempts = attemptsMap[stepIdx] ?? 0;
    const hintIdx = Math.min(attempts, stepDef.hints.length - 1);
    const text = stepDef.hints[hintIdx]!;
    setHintMessage(`Attempt ${attempts + 1} Hint: ${text}`);

    // Increment attempt counter
    registerStepFailure(stepIdx);
  };

  // Calculate overall XP score and progress %
  const { progressPercent, totalXp } = useMemo(() => {
    let p = 0;
    let xp = 0;

    if (theoryRead) {
      p += 10;
      xp += 10;
    }
    if (preScore !== null && preScore >= 2) {
      p += 15;
      xp += 20;
    }
    if (validation.partsPlaced) {
      p += 10;
      xp += 10;
    }
    if (validation.topologyValid) {
      p += 15;
      xp += 20;
    }
    if (validation.simulationRunning) {
      p += 10;
      xp += 10;
    }
    if (observations.length >= 4) {
      p += 20;
      xp += 20;
    }
    if (postScore !== null && postScore >= 2) {
      p += 20;
      xp += 10;
    }

    return {
      progressPercent: Math.min(100, p),
      totalXp: Math.min(100, xp),
    };
  }, [theoryRead, preScore, validation, observations.length, postScore]);

  const isCompleted = progressPercent === 100;
  const currentStepDef = PROCEDURE_STEPS[currentStepIndex] ?? PROCEDURE_STEPS[0]!;

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      {/* Top Application Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/labs"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground font-mono"
          >
            ← All Virtual Labs
          </Link>
          <span className="text-border">|</span>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-tight">{LED_LAB_META.title}</h1>
            <p className="text-[11px] text-muted-foreground">
              {LED_LAB_META.categoryTitle} · IIT Roorkee Reference Methodology
            </p>
          </div>
        </div>

        {/* Gamified Progress & XP Badge */}
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

      {/* Main Tabs Navigation */}
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
              ❓ Pre-Test {preScore !== null && `(${preScore}/3)`}
            </TabsTrigger>
            <TabsTrigger
              value="experiment"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              🔬 Virtual Experiment ({completedStepIndices.length}/{PROCEDURE_STEPS.length})
            </TabsTrigger>
            <TabsTrigger
              value="graph"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              📈 V-I Graph ({observations.length})
            </TabsTrigger>
            <TabsTrigger
              value="posttest"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              📝 Post-Test {postScore !== null && `(${postScore}/3)`}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Active Tab Workspace */}
      <div className="min-h-0 flex-1 flex flex-col">
        {/* TAB 1: MANUAL & THEORY */}
        {activeTab === "manual" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <LabManualSection
              manual={LED_LAB_META.manual}
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
                title="Pre-Experiment Knowledge Check"
                description="Verify theoretical diode concepts before activating laboratory hardware."
                questions={LED_LAB_META.manual.preTestQuestions}
                onComplete={(score) => {
                  setPreScore(score);
                  if (score >= 2) {
                    setActiveTab("experiment");
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 3: VIRTUAL EXPERIMENT */}
        {activeTab === "experiment" && (
          <div className="flex h-full w-full flex-col min-h-0">
            {/* Dynamic Top Guidance Banner */}
            <TopGuidanceBanner
              currentStep={currentStepDef}
              totalSteps={PROCEDURE_STEPS.length}
              validation={validation}
              attempts={attemptsMap[currentStepIndex] ?? 0}
              onRecordMeasurement={handleRecordMeasurement}
              onShowHint={() => handleShowHint(currentStepIndex)}
              onShowGuidedSolution={() => setActiveGuidedModalStepIndex(currentStepIndex)}
              onToggleShowMe={() => setShowMeActive((prev) => !prev)}
              showMeActive={showMeActive}
              guidedSolutionUnlocked={guidedSolutionUnlockedMap[currentStepIndex] ?? false}
              canRecord={validation.activeMeasurement}
            />

            {/* Hint Notice Banner */}
            {hintMessage && (
              <div className="flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-500">
                <span className="font-mono">{hintMessage}</span>
                <button
                  onClick={() => setHintMessage(null)}
                  className="text-xs font-bold hover:underline"
                >
                  Dismiss ✕
                </button>
              </div>
            )}

            {/* Simulator Canvas + Sidebar Split */}
            <div className="flex min-h-0 flex-1">
              {/* CircuitLab Embedded Canvas */}
              <div className="min-h-0 flex-1 relative">
                <Editor
                  storageKey="cirkit.lab.led.v1"
                  initialDesign={INITIAL_LAB_DESIGN}
                  onDesignChange={handleDesignChange}
                />

                {/* Show Me Highlights Overlay Indicator */}
                {showMeActive && (
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center pt-8 bg-primary/5">
                    <div className="rounded-lg border-2 border-primary bg-card/95 p-4 text-xs font-mono shadow-xl text-center space-y-2">
                      <p className="font-bold text-primary uppercase tracking-wider">
                        🔍 Show Me Guide Active
                      </p>
                      <p className="text-foreground">
                        Step {currentStepDef.stepNumber}: {currentStepDef.instruction}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Click 'Hide Highlights' in the top banner when you are ready to make the
                        connections.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Guided Sidebar: Step Checklist + Observation Table */}
              <aside className="w-84 shrink-0 overflow-y-auto border-l border-border bg-sidebar p-4 space-y-6">
                {/* Step-by-Step Checklist */}
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

                {/* Live Observation Table */}
                <ObservationTable
                  observations={observations}
                  onDeleteObservation={handleDeleteObservation}
                  onClearAll={handleClearObservations}
                  minRequired={4}
                />

                {/* Navigate to Graph Trigger */}
                {observations.length >= 2 && (
                  <Button
                    onClick={() => setActiveTab("graph")}
                    className="w-full font-mono text-xs gap-1.5"
                  >
                    View V-I Characteristic Graph ({observations.length} readings) →
                  </Button>
                )}
              </aside>
            </div>
          </div>
        )}

        {/* TAB 4: V-I GRAPH & ANALYSIS */}
        {activeTab === "graph" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <LabGraph
                observations={observations}
                title="LED Forward Bias V-I Characteristic Plot"
                description="Dynamic experimental plot generated directly from your recorded trial observations."
              />

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
                  Proceed to Final Post-Test Assessment →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: POST-TEST & COMPLETION */}
        {activeTab === "posttest" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <PrePostTestCard
                type="posttest"
                title="Post-Experiment Knowledge Assessment"
                description="Evaluate your physical understanding of the LED knee voltage, forward resistance, and series current limiting."
                questions={LED_LAB_META.manual.postTestQuestions}
                onComplete={(score) => {
                  setPostScore(score);
                  if (score >= 2) {
                    setCertificateModalOpen(true);
                  }
                }}
              />

              {isCompleted && (
                <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 p-6 text-center space-y-3">
                  <span className="text-3xl">🎉</span>
                  <h3 className="font-mono text-lg font-bold text-foreground">
                    Virtual Laboratory Successfully Completed!
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    You have verified the non-linear forward bias characteristics of an LED,
                    recorded experimental observations, plotted the V-I curve, and passed all
                    assessments.
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

      {/* Guided Solution Modal */}
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

      {/* Completion Certificate Modal */}
      <CompletionCertificateModal
        open={certificateModalOpen}
        onOpenChange={setCertificateModalOpen}
        experimentTitle={LED_LAB_META.title}
        categoryTitle={LED_LAB_META.categoryTitle}
        score={totalXp}
        trialsRecorded={observations.length}
        onClose={() => setCertificateModalOpen(false)}
      />
    </div>
  );
}
