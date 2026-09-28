import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { LABS_CATALOG } from "@/lib/labs/catalog";
import type { Observation, LabProcedureStepDef } from "@/lib/labs/types";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

import TopGuidanceBanner from "@/components/labs/TopGuidanceBanner";
import StepChecklistPanel from "@/components/labs/StepChecklistPanel";
import PrePostTestCard from "@/components/labs/PrePostTestCard";
import GuidedSolutionModal from "@/components/labs/GuidedSolutionModal";
import CompletionCertificateModal from "@/components/labs/CompletionCertificateModal";

import { calculateLaserPhysics, BASE_I_THRESHOLD } from "./laser/LaserSimulationModel";
import LaserTheorySection from "./laser/LaserTheorySection";
import LaserApparatusSetup from "./laser/LaserApparatusSetup";
import LaserThresholdIdentification from "./laser/LaserThresholdIdentification";
import LaserResultSummary from "./laser/LaserResultSummary";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

const LAB_META = LABS_CATALOG.find((l) => l.id === "characterization-laser-diode")!;

const PROCEDURE_STEPS: LabProcedureStepDef[] = [
  {
    stepNumber: 1,
    title: "Aim & Learning Objectives",
    instruction:
      "Review the experiment aim: characterize the laser diode by studying electrical input vs optical output and identifying the threshold region.",
    hints: [
      "Read the experimental aim and specific learning objectives in the Overview tab.",
      "Identify the difference between spontaneous emission (LED mode) and stimulated emission (LASER mode).",
      "Notice that threshold current Ith separates these two operating regions.",
    ],
    guidedSolution: {
      title: "Aim & Theoretical Foundation",
      explanation:
        "The objective is to measure optical power P_opt as a function of injection current I, demonstrating that below Ith optical output is faint spontaneous light (LED mode) and above Ith output increases steeply and linearly (LASER mode).",
      diagramText: `Input Current [0–50 mA] ──> [Laser Diode] ──> [Optical Output] ──> [Observation] ──> [L-I Graph]`,
      expectedConnections: ["Read the Aim section", "Proceed to Theory tab"],
      commonMistakes: [
        "Skipping the aim and entering the simulation without understanding the p-n junction physics.",
      ],
    },
  },
  {
    stepNumber: 2,
    title: "Read Theory (Sections A–K)",
    instruction:
      "Study sections A–K on p-n junctions, energy barrier, LED region, threshold condition, population inversion, and stimulated emission.",
    hints: [
      "Review the Theory tab and expand the sections.",
      "Answer the inline 'Check Your Understanding' questions to verify comprehension.",
      "Understand why optical gain overcomes cavity losses only when I >= Ith.",
    ],
    guidedSolution: {
      title: "Comprehensive Laser Theory",
      explanation:
        "Under forward bias, injected carriers lower the built-in potential barrier. At high injection, population inversion is achieved ((E_Fc - E_Fv) > Eg). Stimulated emission amplifies light in the Fabry-Perot cavity, reaching laser threshold when gain equals cavity loss.",
      diagramText: `p-n junction with energy barrier ──> Forward bias injection ──> Population inversion ──> Stimulated emission cascade ──> Coherent laser beam`,
      expectedConnections: ["Complete theory checklist", "Answer check questions"],
      commonMistakes: ["Confusing spontaneous recombination with stimulated coherent emission."],
    },
  },
  {
    stepNumber: 3,
    title: "Complete Prerequisite Pre-Test",
    instruction:
      "Pass the Pre-Test assessment on p-n junction, threshold current, stimulated emission, and population inversion.",
    hints: [
      "Navigate to the Pre-Test tab.",
      "Answer the 5 multiple choice questions on laser diode principles.",
      "Score at least 1/5 (recommended 3+) to unlock the experimental apparatus.",
    ],
    guidedSolution: {
      title: "Pre-Test Prerequisites",
      explanation:
        "Key concepts tested: 1) Stimulated emission produces cloned coherent photons; 2) Below threshold diode behaves as an LED; 3) Fabry-Perot cavity provides optical feedback via cleaved mirror facets; 4) Quasi-Fermi levels separation exceeds bandgap energy; 5) Forward bias reduces built-in junction barrier.",
      diagramText: `Pre-Test Assessment [✓ Passed] ──> Unlocks Apparatus & Interactive Simulation`,
      expectedConnections: ["Submit pre-test assessment with passing grade"],
      commonMistakes: ["Skipping the pre-test before configuring the apparatus."],
    },
  },
  {
    stepNumber: 4,
    title: "Configure LASER Drive Circuit",
    instruction:
      "Inspect the apparatus in the Interactive LASER tab and ensure the regulated DC power supply is active.",
    hints: [
      "Navigate to the 'Interactive LASER' tab.",
      "Ensure the laser power supply is switched on (click 'Turn On Laser' if paused).",
      "Verify the 650 nm AlGaInP laser module, optical bench rail, and photodetector power meter head are aligned.",
    ],
    guidedSolution: {
      title: "Laser Drive Circuit Configuration",
      explanation:
        "The laser diode must be forward-biased by a constant-current source. Alignment along the 1 cm optical bench ensures all emitted flux strikes the calibrated photodetector head.",
      diagramText: `DC Current Source [0–50 mA] ──[Current I]──> [Laser Diode (650 nm)] ──(Beam)──> [Power Meter]`,
      expectedConnections: ["Power supply active", "Optical axis aligned"],
      commonMistakes: ["Leaving the power supply paused."],
    },
  },
  {
    stepNumber: 5,
    title: "Set Sub-Threshold Current (5.0 mA)",
    instruction:
      "Set injection current to 5.0 mA (well below threshold Ith ≈ 18 mA) and inspect the faint spontaneous emission.",
    hints: [
      "Adjust the Forward Current slider or click the '5 mA' preset button.",
      "Observe the digital ammeter showing 5.0 mA and voltmeter showing ~1.63 V.",
      "Notice the optical power meter reading is very low (< 0.3 mW) because lasing has not started.",
    ],
    guidedSolution: {
      title: "Sub-Threshold Injection Setting",
      explanation:
        "At I = 5.0 mA, the injection rate is insufficient for population inversion. Spontaneous emission dominates (LED mode), generating faint, incoherent red light with wide beam divergence (35°).",
      diagramText: `I = 5.0 mA < Ith (18.0 mA) => P_opt ≈ 0.23 mW (Spontaneous Emission, LED mode)`,
      expectedConnections: ["Current set to 5.0 mA", "Faint glow observed"],
      commonMistakes: [
        "Setting current above threshold immediately without establishing the baseline.",
      ],
    },
  },
  {
    stepNumber: 6,
    title: "Measure & Record Baseline Reading",
    instruction:
      "Click 'Record Reading' to log your first experimental observation into the observation table.",
    hints: [
      "Click the 'Record Reading' or '+ Record Measurement' button.",
      "Verify Trial 1 appears in the observation table with I = 5.0 mA, P ≈ 0.23 mW, and Regime 'Spontaneous LED'.",
      "This point establishes the sub-threshold baseline for your L-I curve.",
    ],
    guidedSolution: {
      title: "Baseline Data Logging",
      explanation:
        "Logging sub-threshold data points allows plotting the spontaneous emission slope (η_spon ≈ 0.045 mW/mA).",
      diagramText: `Trial 1 Logged: I = 5.0 mA | Vf = 1.63 V | P_opt = 0.23 mW | LED Mode`,
      expectedConnections: ["Trial 1 recorded in observation table"],
      commonMistakes: ["Forgetting to click record before changing the slider."],
    },
  },
  {
    stepNumber: 7,
    title: "Record Sub-Threshold Progression (10, 15 mA)",
    instruction:
      "Adjust injection current to 10.0 mA and 15.0 mA and record measurements for each setting.",
    hints: [
      "Use the '10 mA' preset button and click 'Record Reading'.",
      "Next, select 15.0 mA and record another reading.",
      "Observe that optical power grows very slowly with current below threshold.",
    ],
    guidedSolution: {
      title: "Sub-Threshold Data Points",
      explanation:
        "Recording points at 10 mA and 15 mA proves that below threshold, power remains small (< 1 mW) with a shallow slope efficiency.",
      diagramText: `Trials 2 & 3: I = 10.0 mA (P ≈ 0.45 mW), I = 15.0 mA (P ≈ 0.68 mW)`,
      expectedConnections: ["Readings recorded at 10.0 mA and 15.0 mA"],
      commonMistakes: ["Jumping straight past the threshold without logging sub-threshold slope."],
    },
  },
  {
    stepNumber: 8,
    title: "Step Across Threshold Knee (18, 20 mA)",
    instruction:
      "Step current to 18.0 mA and 20.0 mA to capture the sharp transition from spontaneous to stimulated emission.",
    hints: [
      "Set current to 18.0 mA and record reading (threshold onset, knee point).",
      "Set current to 20.0 mA and record reading: notice optical power jumping to ~1.5 mW and beam brightening!",
      "Observe the beam divergence narrowing from 35° down to 8° as coherent laser oscillation begins.",
    ],
    guidedSolution: {
      title: "Threshold Inversion Transition",
      explanation:
        "At Ith ≈ 18 mA, stimulated gain equals cavity round-trip loss. At 20 mA, stimulated emission dominates, carrier density clamps, and laser feedback produces coherent collimated light.",
      diagramText: `I = 18.0 mA (Kink Point) ──> I = 20.0 mA (P_opt ≈ 1.50 mW, Coherent Stimulated Emission)`,
      expectedConnections: ["Observations recorded at 18.0 mA and 20.0 mA"],
      commonMistakes: [
        "Stepping across the threshold with too large an interval, missing the knee.",
      ],
    },
  },
  {
    stepNumber: 9,
    title: "Record Lasing Region Readings (25–40 mA)",
    instruction:
      "Record readings in the stimulated lasing region at 25 mA, 30 mA, 35 mA, and 40 mA (minimum 6 total trials).",
    hints: [
      "Record readings at 25 mA, 30 mA, 35 mA, and 40 mA.",
      "Notice how rapidly and linearly optical power increases with current in this region.",
      "Ensure you have at least 6 total observations recorded in the table.",
    ],
    guidedSolution: {
      title: "Linear Stimulated Emission Region",
      explanation:
        "Above threshold, extra injected electrons are converted directly into stimulated laser photons, producing a steep linear slope: P_opt = P_spon + η·(I - Ith) with η ≈ 0.345 mW/mA.",
      diagramText: `I = 25 mA (3.2 mW) ──> 30 mA (4.9 mW) ──> 35 mA (6.7 mW) ──> 40 mA (8.4 mW)`,
      expectedConnections: ["At least 6 total observations recorded across full range"],
      commonMistakes: ["Logging fewer than 6 observations."],
    },
  },
  {
    stepNumber: 10,
    title: "Plot Characteristic & Discover Threshold",
    instruction:
      "Switch to the 'L-I Graph' tab, inspect the generated curve from your measurements, and identify the threshold knee.",
    hints: [
      "Click the 'L-I Graph' tab to view the plotted curve of Optical Power vs Current.",
      "Observe the two distinct linear regimes: shallow spontaneous slope and steep lasing slope.",
      "Use the interactive threshold discovery slider to identify the intersection point (Ith ≈ 18.0 mA).",
    ],
    guidedSolution: {
      title: "L-I Curve Discovery & Tangent Intersection",
      explanation:
        "The L-I curve shows an abrupt inflection (kink). By projecting the intersection of the two tangent lines onto the horizontal current axis, you discover Ith ≈ 18.0 mA.",
      diagramText: `Power (mW)
   ^                     / (Stimulated Slope η ≈ 0.35 mW/mA)
   |                    /
   |             ______/  ◄── Kink at Ith ≈ 18.0 mA
   |  __________/ (Spontaneous Slope η ≈ 0.045 mW/mA)
   +-------------------------> Current (mA)`,
      expectedConnections: ["Graph tab inspected", "Kink identified"],
      commonMistakes: ["Assuming the laser curve is a single straight line without an inflection."],
    },
  },
  {
    stepNumber: 11,
    title: "Quantitative Analysis & Slope Efficiency",
    instruction:
      "Switch to 'Threshold & Analysis' tab, validate your identified threshold current, and answer the interpretation questions.",
    hints: [
      "Enter your identified threshold current in mA (e.g. 18.0) and click 'Check Threshold Value'.",
      "Review the calculated slope efficiency η = ΔP / ΔI and differential quantum efficiency.",
      "Answer the 6 scientific interpretation questions.",
    ],
    guidedSolution: {
      title: "Scientific Data Analysis",
      explanation:
        "Slope efficiency η = (P_last - P_first) / (I_last - I_first) in the lasing region measures how efficiently current converts into light. Differential quantum efficiency η_d = (q/Eg) · η.",
      diagramText: `Identified Ith ≈ 18.0 mA | Experimental Slope η ≈ 0.345 mW/mA | η_d ≈ 18%`,
      expectedConnections: ["Threshold verified", "6 analysis questions answered"],
      commonMistakes: ["Entering the turn-on voltage instead of threshold current."],
    },
  },
  {
    stepNumber: 12,
    title: "Comprehensive Post-Test & Certification",
    instruction:
      "Complete the Post-Test assessment to conclude the laboratory and generate your verified completion certificate.",
    hints: [
      "Switch to the 'Post-Test' tab.",
      "Answer all 5 questions on threshold identification, slope efficiency, and carrier clamping.",
      "Pass the post-test and claim your verifiable digital certificate.",
    ],
    guidedSolution: {
      title: "Final Laboratory Verification",
      explanation:
        "Congratulations! You have completed the characterization of a semiconductor laser diode, discovering the threshold current, measuring slope efficiency, and mastering p-n junction optoelectronics.",
      diagramText: `Aim [✓] ──> Theory [✓] ──> Pretest [✓] ──> Apparatus [✓] ──> Simulation [✓] ──> Graph [✓] ──> Analysis [✓] ──> Posttest [✓] ──> Certificate [🎓]`,
      expectedConnections: ["Post-test completed with passing score"],
      commonMistakes: ["Exiting without claiming the certificate."],
    },
  },
];

export default function LaserLabContainer() {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "theory"
    | "pretest"
    | "apparatus"
    | "experiment"
    | "table"
    | "graph"
    | "analysis"
    | "posttest"
    | "result"
  >("overview");

  // Interactive Apparatus Controls
  const [injectionCurrent, setInjectionCurrent] = useState(15.0); // mA
  const [temperature, setTemperature] = useState(25); // °C (affects threshold)
  const [laserActive, setLaserActive] = useState(true);

  // Graph state
  const [graphMode, setGraphMode] = useState<"LI" | "LI_LOG" | "VI">("LI");
  const [inspectionIth, setInspectionIth] = useState(18.0);

  // Observations storage (isolated state key)
  const [observations, setObservations] = useState<Observation[]>(() => {
    try {
      const raw = localStorage.getItem("cirkit.lab.laser.observations.v2");
      return raw ? (JSON.parse(raw) as Observation[]) : [];
    } catch {
      return [];
    }
  });

  // Test states
  const [theoryChecksAnswered, setTheoryChecksAnswered] = useState<string[]>([]);
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);
  const [identifiedIth, setIdentifiedIth] = useState<number | null>(null);

  // Step state machine
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [attemptsMap, setAttemptsMap] = useState<Record<number, number>>({});
  const [guidedSolutionUnlockedMap, setGuidedSolutionUnlockedMap] = useState<
    Record<number, boolean>
  >({});
  const [showMeActive, setShowMeActive] = useState(false);

  // Modals
  const [activeGuidedModalStepIndex, setActiveGuidedModalStepIndex] = useState<number | null>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Save observations isolated to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cirkit.lab.laser.observations.v2", JSON.stringify(observations));
    } catch {
      /* ignore */
    }
  }, [observations]);

  // Deterministic physical simulation calculation
  const physicalMetrics = useMemo(() => {
    return calculateLaserPhysics(injectionCurrent, temperature, laserActive);
  }, [injectionCurrent, temperature, laserActive]);

  // Step validation
  const validationInfo = useMemo(() => {
    const hasPretest = preScore !== null && preScore >= 1;
    const subThresholdCount = observations.filter((o) => o.voltage_in < BASE_I_THRESHOLD).length;
    const hasSubThreshold = subThresholdCount >= 1;
    const hasSubThresholdMultiple = subThresholdCount >= 2;
    const hasThreshold = observations.some(
      (o) => o.voltage_in >= BASE_I_THRESHOLD - 1 && o.voltage_in <= BASE_I_THRESHOLD + 4,
    );
    const hasLinear = observations.some((o) => o.voltage_in > BASE_I_THRESHOLD + 4);
    const hasAdequateTrials = observations.length >= 6;
    const hasAnalysis = identifiedIth !== null;
    const hasPosttest = postScore !== null && postScore >= 1;

    let message = "Laser drive circuit active. Adjust injection current to record readings.";
    if (physicalMetrics.isLasing) {
      message = `✓ Lasing Active! Output Power P_opt = ${physicalMetrics.power_mW.toFixed(2)} mW (I = ${physicalMetrics.current_mA.toFixed(1)} mA).`;
    } else if (physicalMetrics.current_mA > 0) {
      message = `Spontaneous Emission: P_opt = ${physicalMetrics.power_mW.toFixed(2)} mW (Below threshold Ith ≈ ${physicalMetrics.effectiveIth_mA} mA).`;
    }

    return {
      valid:
        currentStepIndex === 0 ||
        (currentStepIndex === 1 && theoryChecksAnswered.length >= 1) ||
        (currentStepIndex === 2 && hasPretest) ||
        (currentStepIndex === 3 && laserActive) ||
        (currentStepIndex === 4 &&
          physicalMetrics.current_mA <= 10 &&
          physicalMetrics.current_mA > 0) ||
        (currentStepIndex === 5 && observations.length >= 1) ||
        (currentStepIndex === 6 && hasSubThresholdMultiple) ||
        (currentStepIndex === 7 && hasThreshold) ||
        (currentStepIndex === 8 && hasAdequateTrials) ||
        (currentStepIndex === 9 && observations.length >= 5) ||
        (currentStepIndex === 10 && hasAnalysis) ||
        (currentStepIndex === 11 && hasPosttest),
      partsPlaced: true,
      topologyValid: true,
      simulationRunning: laserActive,
      activeMeasurement: laserActive && injectionCurrent > 0,
      hasSubThresholdReading: hasSubThreshold,
      hasKneeReading: hasThreshold,
      hasLinearReading: hasLinear,
      message,
      errorKind: "no_error" as const,
      vin: physicalMetrics.voltage_V,
      vd: physicalMetrics.voltage_V,
      id: physicalMetrics.current_mA,
      hasPretest,
      hasAdequateTrials,
    };
  }, [
    preScore,
    observations,
    physicalMetrics,
    laserActive,
    injectionCurrent,
    currentStepIndex,
    identifiedIth,
    postScore,
    theoryChecksAnswered.length,
  ]);

  // Completed steps tracker
  const completedStepIndices = useMemo(() => {
    const list: number[] = [0]; // Step 1: Aim reviewed
    if (theoryChecksAnswered.length >= 1) list.push(1); // Step 2: Theory
    if (preScore !== null && preScore >= 1) list.push(2); // Step 3: Pre-test
    if (laserActive) list.push(3); // Step 4: Apparatus configured
    if (physicalMetrics.current_mA <= 10 && physicalMetrics.current_mA > 0) list.push(4); // Step 5: Sub-threshold set
    if (observations.length >= 1) list.push(5); // Step 6: Baseline recorded
    if (observations.filter((o) => o.voltage_in < BASE_I_THRESHOLD).length >= 2) list.push(6); // Step 7: Sub-threshold progression recorded
    if (
      observations.some(
        (o) => o.voltage_in >= BASE_I_THRESHOLD - 1 && o.voltage_in <= BASE_I_THRESHOLD + 4,
      )
    )
      list.push(7); // Step 8: Threshold recorded
    if (observations.length >= 6) list.push(8); // Step 9: Stimulated recorded
    if (observations.length >= 5) list.push(9); // Step 10: Graph plotted
    if (identifiedIth !== null) list.push(10); // Step 11: Analysis
    if (postScore !== null && postScore >= 1) list.push(11); // Step 12: Post-test
    return list;
  }, [
    theoryChecksAnswered.length,
    preScore,
    laserActive,
    physicalMetrics.current_mA,
    observations,
    identifiedIth,
    postScore,
  ]);

  // Navigate according to step selection
  const handleSelectStep = (idx: number) => {
    setCurrentStepIndex(idx);
    if (idx === 0) setActiveTab("overview");
    else if (idx === 1) setActiveTab("theory");
    else if (idx === 2) setActiveTab("pretest");
    else if (idx === 3) setActiveTab("apparatus");
    else if (idx >= 4 && idx <= 8) setActiveTab("experiment");
    else if (idx === 9) setActiveTab("graph");
    else if (idx === 10) setActiveTab("analysis");
    else if (idx === 11) setActiveTab("posttest");
  };

  // Auto-advance step
  useEffect(() => {
    if (
      completedStepIndices.includes(currentStepIndex) &&
      currentStepIndex < PROCEDURE_STEPS.length - 1
    ) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [completedStepIndices, currentStepIndex]);

  // Record trial
  const handleRecordMeasurement = () => {
    const newObs: Observation = {
      id: Date.now().toString(),
      trialNumber: observations.length + 1,
      voltage_in: physicalMetrics.current_mA, // store Injection Current in mA
      voltage_diode: physicalMetrics.power_mW, // store Optical Output Power in mW
      current_mA: physicalMetrics.voltage_V, // store Forward Voltage in V
      power_mW: physicalMetrics.slopeEfficiency_mW_per_mA, // store slope
      timestamp: new Date().toLocaleTimeString(),
      status: physicalMetrics.isLasing ? "nominal" : "warning",
    };
    setObservations((prev) => [...prev, newObs]);

    if (currentStepIndex === 5 && observations.length >= 0) {
      setCurrentStepIndex(6);
    } else if (currentStepIndex === 6 && observations.length >= 2) {
      setCurrentStepIndex(7);
    } else if (currentStepIndex === 7 && physicalMetrics.current_mA >= 18) {
      setCurrentStepIndex(8);
    } else if (currentStepIndex === 8 && observations.length >= 5) {
      setCurrentStepIndex(9);
    }
  };

  const handleClearObservations = () => {
    setObservations([]);
  };

  const handleDeleteObservation = (id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
  };

  const handleExportCSV = () => {
    if (observations.length === 0) return;
    const headers =
      "Trial,Current_I_mA,Voltage_Vf_V,Optical_Power_mW,Slope_Efficiency_mW_per_mA,Regime,Timestamp\n";
    const rows = observations
      .map(
        (o) =>
          `${o.trialNumber},${o.voltage_in},${o.current_mA},${o.voltage_diode},${o.power_mW},"${
            o.voltage_in >= BASE_I_THRESHOLD ? "Stimulated LASER" : "Spontaneous LED"
          }",${o.timestamp}`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laser_diode_measurements_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Dynamic Graph Analysis & Tangent Fitting
  const graphAnalysis = useMemo(() => {
    const sorted = [...observations].sort((a, b) => a.voltage_in - b.voltage_in);
    const subPoints = sorted.filter((o) => o.voltage_in < inspectionIth);
    const postPoints = sorted.filter((o) => o.voltage_in >= inspectionIth);

    // Sub-threshold slope
    let sponSlope = 0.045;
    if (subPoints.length >= 2) {
      const p1 = subPoints[0]!.voltage_diode;
      const p2 = subPoints[subPoints.length - 1]!.voltage_diode;
      const i1 = subPoints[0]!.voltage_in;
      const i2 = subPoints[subPoints.length - 1]!.voltage_in;
      if (i2 > i1) sponSlope = Math.max(0.01, (p2 - p1) / (i2 - i1));
    }

    // Stimulated slope
    let stimSlope = 0.345;
    if (postPoints.length >= 2) {
      const p1 = postPoints[0]!.voltage_diode;
      const p2 = postPoints[postPoints.length - 1]!.voltage_diode;
      const i1 = postPoints[0]!.voltage_in;
      const i2 = postPoints[postPoints.length - 1]!.voltage_in;
      if (i2 > i1) stimSlope = Math.max(0.05, (p2 - p1) / (i2 - i1));
    }

    const slopeRatio = stimSlope / sponSlope;

    return {
      subPointsCount: subPoints.length,
      postPointsCount: postPoints.length,
      sponSlope: Number(sponSlope.toFixed(3)),
      stimSlope: Number(stimSlope.toFixed(3)),
      slopeRatio: Number(slopeRatio.toFixed(1)),
    };
  }, [observations, inspectionIth]);

  // Progress & XP
  const { progressPercent, totalXp } = useMemo(() => {
    let p = 0;
    let xp = 0;
    if (theoryChecksAnswered.length > 0) {
      p += 10;
      xp += 10;
    }
    if (preScore !== null && preScore >= 1) {
      p += 15;
      xp += 20;
    }
    if (validationInfo.hasSubThresholdReading) {
      p += 15;
      xp += 15;
    }
    if (validationInfo.hasKneeReading) {
      p += 15;
      xp += 15;
    }
    if (observations.length >= 5) {
      p += 15;
      xp += 15;
    }
    if (identifiedIth !== null) {
      p += 15;
      xp += 15;
    }
    if (postScore !== null && postScore >= 1) {
      p += 15;
      xp += 10;
    }
    return { progressPercent: Math.min(100, p), totalXp: Math.min(100, xp) };
  }, [
    theoryChecksAnswered.length,
    preScore,
    validationInfo,
    observations.length,
    identifiedIth,
    postScore,
  ]);

  const isCompleted = progressPercent >= 95 && postScore !== null;
  const currentStepDef = PROCEDURE_STEPS[currentStepIndex] ?? PROCEDURE_STEPS[0]!;

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* Top Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/labs"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground font-mono"
          >
            ← Virtual Labs Catalog
          </Link>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">🔴</span>
            <h1 className="font-mono text-xs font-bold tracking-tight text-foreground">
              {LAB_META.title}
            </h1>
            <Badge
              variant="outline"
              className="font-mono text-[10px] text-primary border-primary/40"
            >
              IIT Roorkee Curriculum
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">Progress:</span>
            <div className="w-24 sm:w-28">
              <Progress value={progressPercent} className="h-1.5" />
            </div>
            <span className="font-mono text-[11px] font-bold text-primary">{progressPercent}%</span>
          </div>

          <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/40">
            ⭐ {totalXp} XP
          </Badge>

          {isCompleted && (
            <Button
              size="sm"
              onClick={() => setCertificateModalOpen(true)}
              className="h-7 font-mono text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
            >
              🎓 Certificate
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInjectionCurrent(15.0);
              setTemperature(25);
              setObservations([]);
              setIdentifiedIth(null);
              setCurrentStepIndex(1);
            }}
            className="h-7 font-mono text-[11px]"
          >
            ↺ Reset Apparatus
          </Button>

          <Link to="/">
            <Button variant="ghost" size="sm" className="h-7 font-mono text-[11px]">
              CircuitLab Studio
            </Button>
          </Link>
        </div>
      </header>

      {/* Tabs Bar following Complete Student Journey */}
      <div className="flex h-10 shrink-0 items-center border-b border-border bg-card px-4 overflow-x-auto">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="h-8 bg-transparent p-0 gap-1">
            <TabsTrigger value="overview" className="font-mono text-xs h-7">
              🎯 Overview & Aim
            </TabsTrigger>
            <TabsTrigger value="theory" className="font-mono text-xs h-7">
              📖 Theory (A–K)
            </TabsTrigger>
            <TabsTrigger value="pretest" className="font-mono text-xs h-7">
              ❓ Pre-Test{" "}
              {preScore !== null && `(${preScore}/${LAB_META.manual.preTestQuestions.length})`}
            </TabsTrigger>
            <TabsTrigger value="apparatus" className="font-mono text-xs h-7">
              🧰 Apparatus & Setup
            </TabsTrigger>
            <TabsTrigger value="experiment" className="font-mono text-xs h-7">
              🔬 Interactive LASER
            </TabsTrigger>
            <TabsTrigger value="table" className="font-mono text-xs h-7">
              📊 Observations ({observations.length})
            </TabsTrigger>
            <TabsTrigger value="graph" className="font-mono text-xs h-7">
              📈 L-I Graph
            </TabsTrigger>
            <TabsTrigger value="analysis" className="font-mono text-xs h-7">
              🔍 Threshold & Analysis {identifiedIth !== null && "✓"}
            </TabsTrigger>
            <TabsTrigger value="posttest" className="font-mono text-xs h-7">
              📝 Post-Test{" "}
              {postScore !== null && `(${postScore}/${LAB_META.manual.postTestQuestions.length})`}
            </TabsTrigger>
            <TabsTrigger value="result" className="font-mono text-xs h-7">
              🏆 Result & Summary
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Panels */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* TAB 1: OVERVIEW & AIM */}
        {activeTab === "overview" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Hero Banner */}
              <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-card via-sidebar to-card p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs text-primary border-primary/40"
                  >
                    IIT Roorkee Virtual Lab Structure
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">Experiment 2</span>
                </div>
                <h2 className="text-2xl font-bold font-mono text-foreground tracking-tight">
                  Characterization of LASER Diode
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Study the transition of a semiconductor laser diode from spontaneous LED-like
                  emission to coherent stimulated lasing, plot the Light Output vs. Current (L-I)
                  curve, identify the threshold current (Ith), and evaluate differential slope
                  efficiency.
                </p>
              </div>

              {/* Aim Section */}
              <Card className="border-border bg-card">
                <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
                  <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                    1. Aim & Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
                  <p className="text-foreground font-semibold text-sm">
                    Aim: To characterize the semiconductor LASER diode by studying its electrical
                    input (forward current and voltage) and optical output behavior, and identifying
                    the threshold current region (I_th).
                  </p>
                  <div className="space-y-1.5 pt-2">
                    <span className="text-foreground font-bold block text-xs">
                      Specific Educational Objectives:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>
                        Understand the LASER diode as a forward-biased p-n junction with an energy
                        barrier.
                      </li>
                      <li>
                        Observe the low-current LED region dominated by incoherent spontaneous
                        emission.
                      </li>
                      <li>
                        Identify the threshold current (Ith) where optical gain overcomes round-trip
                        cavity losses.
                      </li>
                      <li>
                        Observe population inversion and the onset of stimulated coherent emission.
                      </li>
                      <li>
                        Record deterministic optical output power vs. forward injection current.
                      </li>
                      <li>
                        Plot the complete L-I characteristic curve and determine slope efficiency η
                        = ΔP / ΔI.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Student Journey Roadmap */}
              <Card className="border-border bg-card">
                <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
                  <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                    2. Recommended Student Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
                    <div className="p-3 rounded border border-border bg-sidebar/50">
                      <span className="text-primary font-bold block">1. Aim & Theory</span>
                      <span className="text-[10px] text-muted-foreground">Sections A–K</span>
                    </div>
                    <div className="p-3 rounded border border-border bg-sidebar/50">
                      <span className="text-primary font-bold block">2. Pre-Test</span>
                      <span className="text-[10px] text-muted-foreground">Prerequisite Check</span>
                    </div>
                    <div className="p-3 rounded border border-border bg-sidebar/50">
                      <span className="text-primary font-bold block">3. Simulation</span>
                      <span className="text-[10px] text-muted-foreground">Record Readings</span>
                    </div>
                    <div className="p-3 rounded border border-border bg-sidebar/50">
                      <span className="text-primary font-bold block">4. Graph & Ith</span>
                      <span className="text-[10px] text-muted-foreground">Threshold Kink</span>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <Button
                      onClick={() => setActiveTab("theory")}
                      className="font-mono text-xs gap-2 bg-primary text-primary-foreground shadow-sm"
                    >
                      Begin Interactive Theory (Sections A–K) →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: THEORY (A-K with interactive mini checks) */}
        {activeTab === "theory" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <LaserTheorySection
              onProceedToPretest={() => setActiveTab("pretest")}
              onCheckAnswered={(checkId) => {
                if (!theoryChecksAnswered.includes(checkId)) {
                  setTheoryChecksAnswered((prev) => [...prev, checkId]);
                }
              }}
            />
          </div>
        )}

        {/* TAB 3: PRE-TEST */}
        {activeTab === "pretest" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <PrePostTestCard
                type="pretest"
                title="Laser Diode Prerequisite Assessment"
                description="Verify foundational understanding of p-n junctions, LED vs LASER mode, population inversion, and stimulated emission."
                questions={LAB_META.manual.preTestQuestions}
                onComplete={(score) => {
                  setPreScore(score);
                  if (score >= 1) {
                    if (currentStepIndex === 0) setCurrentStepIndex(1);
                    setActiveTab("apparatus");
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: APPARATUS & SETUP */}
        {activeTab === "apparatus" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <LaserApparatusSetup onStartSimulation={() => setActiveTab("experiment")} />
          </div>
        )}

        {/* TAB 5: EXPERIMENT (Interactive simulation with guidance banner & procedure sidebar) */}
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
              canRecord={laserActive && injectionCurrent > 0}
            />

            {hintMessage && (
              <div className="flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-500 font-mono">
                <span>{hintMessage}</span>
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
                  {/* Optical Bench Visualizer */}
                  <Card className="border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🔬</span>
                          <CardTitle className="font-mono text-xs font-bold text-foreground">
                            Optical Bench: Semiconductor Laser Characterization Station
                          </CardTitle>
                        </div>
                        <Badge
                          variant={physicalMetrics.isLasing ? "default" : "secondary"}
                          className="font-mono text-[10px]"
                        >
                          {physicalMetrics.isLasing
                            ? "● Coherent Stimulated Lasing"
                            : "○ Sub-Threshold Spontaneous (LED)"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="relative h-48 w-full rounded-xl border border-border bg-neutral-950 p-4 flex items-center justify-between overflow-hidden shadow-inner">
                        {/* Laser Diode Source */}
                        <div className="z-10 flex flex-col items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-center shadow-lg">
                          <div className="size-10 rounded-full border-2 border-red-500 bg-red-950/60 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                            ⚡
                          </div>
                          <span className="font-mono text-[11px] font-bold text-neutral-200">
                            Laser Diode
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400">
                            λ = {physicalMetrics.wavelength_nm} nm
                          </span>
                        </div>

                        {/* Coherent Laser Beam Simulation */}
                        <div className="relative flex-1 h-16 mx-4 flex items-center justify-center">
                          {laserActive && injectionCurrent > 0 && (
                            <>
                              {/* Background Glow */}
                              <div
                                className="absolute h-10 w-full rounded-full transition-all duration-300"
                                style={{
                                  background: physicalMetrics.isLasing
                                    ? "linear-gradient(90deg, rgba(239,68,68,0.85), rgba(239,68,68,0.5))"
                                    : "linear-gradient(90deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))",
                                  filter: physicalMetrics.isLasing ? "blur(8px)" : "blur(14px)",
                                }}
                              />
                              {/* Beam Core */}
                              <div
                                className="relative w-full rounded-full transition-all duration-200"
                                style={{
                                  height: physicalMetrics.isLasing
                                    ? `${Math.min(10, Math.max(3, physicalMetrics.power_mW))}px`
                                    : "2px",
                                  backgroundColor: "#ff3b30",
                                  boxShadow: physicalMetrics.isLasing
                                    ? "0 0 14px #ff3b30, 0 0 28px #ff3b30"
                                    : "none",
                                  opacity: physicalMetrics.isLasing ? 1 : 0.45,
                                }}
                              />
                              {physicalMetrics.isLasing && (
                                <div className="absolute top-1 font-mono text-[10px] font-bold text-red-400 tracking-widest uppercase animate-pulse">
                                  Stimulated Emission (Coherent Beam)
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Optical Power Meter Sensor */}
                        <div className="z-10 flex flex-col items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-center shadow-lg">
                          <div className="size-10 rounded-md border-2 border-emerald-500 bg-emerald-950/60 flex items-center justify-center font-mono text-xs font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                            PM
                          </div>
                          <span className="font-mono text-[11px] font-bold text-neutral-200">
                            Power Meter
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">
                            {physicalMetrics.power_mW.toFixed(2)} mW
                          </span>
                        </div>
                      </div>

                      {/* Live Telemetry Display */}
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                        <div className="rounded border border-border bg-card p-3">
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Injection Current (I)
                          </span>
                          <p className="text-lg font-bold text-foreground mt-0.5">
                            {physicalMetrics.current_mA.toFixed(1)} mA
                          </p>
                        </div>
                        <div className="rounded border border-border bg-card p-3">
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Forward Voltage (V_f)
                          </span>
                          <p className="text-lg font-bold text-primary mt-0.5">
                            {physicalMetrics.voltage_V.toFixed(2)} V
                          </p>
                        </div>
                        <div className="rounded border border-border bg-card p-3">
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Optical Power (P_opt)
                          </span>
                          <p className="text-lg font-bold text-emerald-500 mt-0.5">
                            {physicalMetrics.power_mW.toFixed(2)} mW
                          </p>
                        </div>
                        <div className="rounded border border-border bg-card p-3">
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Threshold (I_th)
                          </span>
                          <p className="text-lg font-bold text-amber-500 mt-0.5">
                            ~{physicalMetrics.effectiveIth_mA.toFixed(1)} mA
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Laser Control Panel */}
                  <Card className="border-border bg-card">
                    <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border">
                      <CardTitle className="font-mono text-xs font-bold text-foreground">
                        Precision Power Supply & Temperature Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Current Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-mono text-xs font-semibold text-foreground">
                            Forward Injection Current (0.0 mA – 40.0 mA):
                          </label>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setInjectionCurrent((prev) =>
                                  Math.max(0, Number((prev - 1).toFixed(1))),
                                )
                              }
                              className="h-6 w-7 p-0 font-mono text-xs"
                            >
                              -1
                            </Button>
                            <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded bg-primary/10">
                              {injectionCurrent.toFixed(1)} mA
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setInjectionCurrent((prev) =>
                                  Math.min(45, Number((prev + 1).toFixed(1))),
                                )
                              }
                              className="h-6 w-7 p-0 font-mono text-xs"
                            >
                              +1
                            </Button>
                          </div>
                        </div>
                        <Slider
                          value={[injectionCurrent]}
                          min={0}
                          max={40}
                          step={0.5}
                          onValueChange={(vals) => setInjectionCurrent(vals[0] ?? 0)}
                          className="w-full"
                        />
                        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                          <span>0 mA (Off)</span>
                          <span className="text-amber-500 font-bold">Ith ≈ 18 mA</span>
                          <span>40 mA (Max Safe Drive)</span>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="text-[11px] font-mono text-muted-foreground self-center mr-1">
                            Preset Steps:
                          </span>
                          {[5, 10, 15, 18, 20, 25, 30, 35, 40].map((val) => (
                            <Button
                              key={val}
                              size="sm"
                              variant={injectionCurrent === val ? "default" : "outline"}
                              onClick={() => setInjectionCurrent(val)}
                              className="h-6 font-mono text-[10px] px-2"
                            >
                              {val} mA
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Temperature Slider */}
                      <div className="space-y-2 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          <label className="font-mono text-xs font-semibold text-foreground">
                            Substrate Heatsink Temperature:
                          </label>
                          <span className="font-mono text-xs font-bold text-muted-foreground">
                            {temperature} °C
                          </span>
                        </div>
                        <Slider
                          value={[temperature]}
                          min={15}
                          max={55}
                          step={1}
                          onValueChange={(vals) => setTemperature(vals[0] ?? 25)}
                          className="w-full"
                        />
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Higher temperatures elevate threshold current (Ith) by ~0.15 mA/°C and
                          slightly red-shift emission wavelength by ~0.2 nm/°C.
                        </p>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLaserActive((a) => !a)}
                          className="font-mono text-xs"
                        >
                          {laserActive ? "⏸ Pause Emission" : "▶ Turn On Laser"}
                        </Button>

                        <Button
                          onClick={handleRecordMeasurement}
                          className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground"
                        >
                          📸 Record Measurement (I = {physicalMetrics.current_mA.toFixed(1)} mA, P ={" "}
                          {physicalMetrics.power_mW.toFixed(2)} mW)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar: Step Checklist Panel */}
              <div className="w-80 shrink-0 border-l border-border bg-sidebar flex flex-col">
                <StepChecklistPanel
                  steps={PROCEDURE_STEPS}
                  currentStepIndex={currentStepIndex}
                  completedStepIndices={completedStepIndices}
                  onSelectStep={handleSelectStep}
                  attemptsMap={attemptsMap}
                  guidedSolutionUnlockedMap={guidedSolutionUnlockedMap}
                  onShowHint={handleShowHint}
                  onShowGuidedSolution={(idx) => setActiveGuidedModalStepIndex(idx)}
                  onToggleShowMe={() => setShowMeActive((prev) => !prev)}
                  showMeActive={showMeActive}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OBSERVATION TABLE */}
        {activeTab === "table" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
            <div className="mx-auto max-w-4xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-mono text-sm font-bold text-foreground">
                    Observation Table: Laser Diode Characterization
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Deterministic experimental measurements recorded across sub-threshold and
                    stimulated regimes.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {observations.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCSV}
                        className="font-mono text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                      >
                        📥 Export CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearObservations}
                        className="font-mono text-xs text-destructive hover:bg-destructive/10"
                      >
                        Clear Log
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    onClick={handleRecordMeasurement}
                    className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground"
                  >
                    + Record Current State
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-sidebar border-b border-border text-muted-foreground">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Current I (mA)</th>
                      <th className="p-3">Voltage Vf (V)</th>
                      <th className="p-3">Optical Power (mW)</th>
                      <th className="p-3">Slope Eff (mW/mA)</th>
                      <th className="p-3">Operating Regime</th>
                      <th className="p-3">Time</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-muted-foreground">
                          No measurements recorded yet. Switch to the Interactive LASER tab and
                          click 'Record Reading'.
                        </td>
                      </tr>
                    ) : (
                      observations.map((obs) => (
                        <tr key={obs.id} className="border-b border-border/50 hover:bg-sidebar/50">
                          <td className="p-3 font-bold">{obs.trialNumber}</td>
                          <td className="p-3 font-bold">{obs.voltage_in.toFixed(1)} mA</td>
                          <td className="p-3 text-primary">{obs.current_mA.toFixed(2)} V</td>
                          <td className="p-3 font-bold text-emerald-500">
                            {obs.voltage_diode.toFixed(2)} mW
                          </td>
                          <td className="p-3 text-muted-foreground">{obs.power_mW.toFixed(3)}</td>
                          <td className="p-3">
                            <Badge
                              variant={obs.voltage_in >= BASE_I_THRESHOLD ? "default" : "outline"}
                              className="text-[10px]"
                            >
                              {obs.voltage_in >= BASE_I_THRESHOLD
                                ? "Stimulated LASER"
                                : "Spontaneous LED"}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{obs.timestamp}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteObservation(obs.id)}
                              className="text-muted-foreground hover:text-destructive text-[11px] font-mono"
                              title="Delete observation"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: L-I GRAPH (with LED, Threshold, and Laser regions clearly highlighted) */}
        {activeTab === "graph" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="py-3 px-4 bg-sidebar border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                      {graphMode === "LI"
                        ? "Light Output Power vs. Injected Current (L-I) Characteristic Curve"
                        : "Forward Voltage vs. Injected Current (V-I) Electrical Curve"}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground font-mono">
                      {graphMode === "LI"
                        ? "Dynamic plot generated from student experimental measurements. Clearly shows the low-current LED region, the threshold kink, and the post-threshold stimulated laser slope."
                        : "Diode electrical turn-on characteristics with internal dynamic junction resistance."}
                    </CardDescription>
                  </div>

                  {/* Mode Toggle Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant={graphMode === "LI" ? "default" : "outline"}
                      onClick={() => setGraphMode("LI")}
                      className="font-mono text-xs h-7 px-3"
                    >
                      L-I Linear (P vs I)
                    </Button>
                    <Button
                      size="sm"
                      variant={graphMode === "LI_LOG" ? "default" : "outline"}
                      onClick={() => setGraphMode("LI_LOG")}
                      className="font-mono text-xs h-7 px-3"
                    >
                      L-log(I) Semilog (P vs log10 I) [IIT Roorkee]
                    </Button>
                    <Button
                      size="sm"
                      variant={graphMode === "VI" ? "default" : "outline"}
                      onClick={() => setGraphMode("VI")}
                      className="font-mono text-xs h-7 px-3"
                    >
                      V-I Curve (Vf vs I)
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {observations.length < 2 ? (
                    <div className="p-6 rounded-lg border border-dashed border-border bg-sidebar/50 text-center text-xs text-muted-foreground font-mono">
                      Please record at least 3 to 5 observations across 0–40 mA in the Interactive
                      LASER tab to generate the curve.
                    </div>
                  ) : (
                    <>
                      <div className="h-80 w-full rounded-lg border border-border bg-sidebar/40 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={[...observations]
                              .sort((a, b) => a.voltage_in - b.voltage_in)
                              .map((o) => ({
                                ...o,
                                log_current: Number(
                                  Math.log10(Math.max(0.1, o.voltage_in)).toFixed(3),
                                ),
                              }))}
                            margin={{ top: 15, right: 30, left: 15, bottom: 25 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.6} />

                            {graphMode === "LI" && (
                              <>
                                {/* Reference area for Low-Current LED region */}
                                <ReferenceArea
                                  x1={0}
                                  x2={inspectionIth}
                                  fill="#f59e0b"
                                  fillOpacity={0.08}
                                  label={{
                                    value: "LED Region (Spontaneous)",
                                    fill: "#f59e0b",
                                    fontSize: 10,
                                    position: "insideTopLeft",
                                  }}
                                />

                                {/* Reference area for Lasing region */}
                                <ReferenceArea
                                  x1={inspectionIth}
                                  x2={40}
                                  fill="#10b981"
                                  fillOpacity={0.08}
                                  label={{
                                    value: "LASER Region (Stimulated)",
                                    fill: "#10b981",
                                    fontSize: 10,
                                    position: "insideTopRight",
                                  }}
                                />

                                {/* Threshold Reference Line */}
                                <ReferenceLine
                                  x={inspectionIth}
                                  stroke="#ef4444"
                                  strokeWidth={2}
                                  strokeDasharray="4 4"
                                  label={{
                                    value: `Threshold Ith ≈ ${inspectionIth.toFixed(1)} mA`,
                                    fill: "#ef4444",
                                    fontSize: 11,
                                    position: "top",
                                  }}
                                />
                              </>
                            )}

                            {graphMode === "LI_LOG" && (
                              <>
                                <ReferenceArea
                                  x1={0}
                                  x2={Number(Math.log10(Math.max(0.1, inspectionIth)).toFixed(3))}
                                  fill="#f59e0b"
                                  fillOpacity={0.08}
                                  label={{
                                    value: "LED Pre-Lasing Slope",
                                    fill: "#f59e0b",
                                    fontSize: 10,
                                    position: "insideTopLeft",
                                  }}
                                />
                                <ReferenceArea
                                  x1={Number(Math.log10(Math.max(0.1, inspectionIth)).toFixed(3))}
                                  x2={2.0}
                                  fill="#10b981"
                                  fillOpacity={0.08}
                                  label={{
                                    value: "LASER Post-Lasing Slope",
                                    fill: "#10b981",
                                    fontSize: 10,
                                    position: "insideTopRight",
                                  }}
                                />
                                <ReferenceLine
                                  x={Number(Math.log10(Math.max(0.1, inspectionIth)).toFixed(3))}
                                  stroke="#ef4444"
                                  strokeWidth={2}
                                  strokeDasharray="4 4"
                                  label={{
                                    value: `log10(Ith) = ${Math.log10(inspectionIth).toFixed(2)} (Ith = ${inspectionIth.toFixed(1)} mA)`,
                                    fill: "#ef4444",
                                    fontSize: 11,
                                    position: "top",
                                  }}
                                />
                              </>
                            )}

                            <XAxis
                              dataKey={graphMode === "LI_LOG" ? "log_current" : "voltage_in"}
                              type="number"
                              domain={[0, "auto"]}
                              unit={graphMode === "LI_LOG" ? "" : " mA"}
                              stroke="#888"
                              tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                              label={{
                                value:
                                  graphMode === "LI_LOG"
                                    ? "log10 [ Forward Current If (mA) ]"
                                    : "Forward Injection Current I (mA)",
                                position: "bottom",
                                offset: 10,
                                fill: "#888",
                                fontSize: 11,
                              }}
                            />
                            <YAxis
                              dataKey={graphMode === "VI" ? "current_mA" : "voltage_diode"}
                              type="number"
                              unit={graphMode === "VI" ? " V" : " mW"}
                              domain={[0, "auto"]}
                              stroke="#888"
                              tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                              label={{
                                value:
                                  graphMode === "VI"
                                    ? "Forward Voltage Vf (V)"
                                    : "Optical Power P (mW)",
                                angle: -90,
                                position: "insideLeft",
                                fill: "#888",
                                fontSize: 11,
                              }}
                            />
                            <Tooltip
                              formatter={(value: unknown) => [
                                `${Number(value).toFixed(2)} ${graphMode === "VI" ? "V" : "mW"}`,
                                graphMode === "VI" ? "Forward Voltage" : "Optical Power",
                              ]}
                              labelFormatter={(lbl) =>
                                graphMode === "LI_LOG"
                                  ? `log10(If): ${Number(lbl).toFixed(3)} (If ≈ ${Math.pow(10, Number(lbl)).toFixed(1)} mA)`
                                  : `Current: ${Number(lbl).toFixed(1)} mA`
                              }
                              contentStyle={{
                                backgroundColor: "#18181b",
                                borderColor: "#3f3f46",
                                fontSize: "11px",
                                fontFamily: "var(--font-mono)",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey={graphMode === "VI" ? "current_mA" : "voltage_diode"}
                              stroke={
                                graphMode === "LI"
                                  ? "#ef4444"
                                  : graphMode === "LI_LOG"
                                    ? "#ec4899"
                                    : "#38bdf8"
                              }
                              strokeWidth={2.5}
                              dot={{
                                r: 5,
                                fill:
                                  graphMode === "LI"
                                    ? "#ef4444"
                                    : graphMode === "LI_LOG"
                                      ? "#ec4899"
                                      : "#38bdf8",
                                stroke: "#ffffff",
                                strokeWidth: 1.5,
                              }}
                              activeDot={{ r: 7 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Interactive Threshold Discovery & Tangent Fit Tool */}
                      <div className="rounded-xl border border-primary/40 bg-sidebar/50 p-4 space-y-3 font-mono">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🔬</span>
                            <span className="text-xs font-bold text-foreground">
                              Interactive Threshold Discovery Tool (Tangent Inspection)
                            </span>
                          </div>
                          <span className="text-xs font-bold text-primary">
                            Candidate Ith = {inspectionIth.toFixed(1)} mA
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Slide the marker to find the knee where the slope abruptly increases.
                          Tangent lines will fit the spontaneous slope ($I &lt; I_{"{th}"}$) and
                          stimulated slope ($I &gt; I_{"{th}"}$).
                        </p>

                        <Slider
                          value={[inspectionIth]}
                          min={10}
                          max={26}
                          step={0.5}
                          onValueChange={(vals) => setInspectionIth(vals[0] ?? 18.0)}
                          className="w-full"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                          <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30">
                            <span className="text-amber-500 font-bold block text-[11px]">
                              1. Sub-Threshold Slope (η_spon):
                            </span>
                            <span className="text-sm font-bold text-foreground mt-0.5 block">
                              {graphAnalysis.sponSlope} mW/mA
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {graphAnalysis.subPointsCount} points below Ith (LED Mode)
                            </span>
                          </div>

                          <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                            <span className="text-emerald-400 font-bold block text-[11px]">
                              2. Stimulated Slope (η_stim):
                            </span>
                            <span className="text-sm font-bold text-foreground mt-0.5 block">
                              {graphAnalysis.stimSlope} mW/mA
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {graphAnalysis.postPointsCount} points above Ith (LASER Mode)
                            </span>
                          </div>

                          <div className="p-2.5 rounded bg-primary/10 border border-primary/30">
                            <span className="text-primary font-bold block text-[11px]">
                              3. Slope Amplification Ratio:
                            </span>
                            <span className="text-sm font-bold text-foreground mt-0.5 block">
                              {graphAnalysis.slopeRatio}× Steeper
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Optical gain exceeds cavity loss!
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Region Demarcation Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                          <span className="font-bold text-amber-500 block">
                            1. Low-Current LED Region
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-1 block">
                            I &lt; 18 mA: Incoherent spontaneous light with shallow slope (~0.045
                            mW/mA).
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
                          <span className="font-bold text-red-400 block">
                            2. Threshold Kink (I_th)
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-1 block">
                            I ≈ 18 mA: Optical gain reaches threshold, initiating coherent
                            stimulated emission.
                          </span>
                        </div>

                        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                          <span className="font-bold text-emerald-400 block">3. LASER Region</span>
                          <span className="text-[11px] text-muted-foreground mt-1 block">
                            I &gt; 18 mA: Steep linear power growth (~0.35 mW/mA) with
                            monochromatic, collimated beam.
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("experiment")}
                      className="font-mono text-xs"
                    >
                      ← Return to Simulator
                    </Button>
                    <Button
                      onClick={() => setActiveTab("analysis")}
                      className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground"
                    >
                      Proceed to Threshold Identification & Analysis →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 8: THRESHOLD IDENTIFICATION & ANALYSIS */}
        {activeTab === "analysis" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <LaserThresholdIdentification
              observations={observations}
              expectedIth={BASE_I_THRESHOLD}
              onThresholdIdentified={(ith) => {
                setIdentifiedIth(ith);
                if (currentStepIndex === 5) setCurrentStepIndex(6);
              }}
              onProceedToPosttest={() => setActiveTab("posttest")}
            />
          </div>
        )}

        {/* TAB 9: POST-TEST */}
        {activeTab === "posttest" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <PrePostTestCard
                type="posttest"
                title="Laser Diode Characterization Post-Test"
                description="Demonstrate conceptual mastery of threshold current determination, differential quantum efficiency, and stimulated emission."
                questions={LAB_META.manual.postTestQuestions}
                onComplete={(score) => {
                  setPostScore(score);
                  if (score >= 1) {
                    setActiveTab("result");
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 10: RESULT & CERTIFICATE */}
        {activeTab === "result" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <LaserResultSummary
              observations={observations}
              identifiedIth={identifiedIth}
              preTestScore={preScore}
              postTestScore={postScore}
              onOpenCertificate={() => setCertificateModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Guided Solution Modal */}
      {activeGuidedModalStepIndex !== null && (
        <GuidedSolutionModal
          open={true}
          onOpenChange={(open) => !open && setActiveGuidedModalStepIndex(null)}
          step={PROCEDURE_STEPS[activeGuidedModalStepIndex] ?? null}
          onClose={() => setActiveGuidedModalStepIndex(null)}
        />
      )}

      {/* Completion Certificate Modal */}
      <CompletionCertificateModal
        open={certificateModalOpen}
        onOpenChange={setCertificateModalOpen}
        experimentTitle={LAB_META.title}
        categoryTitle={LAB_META.categoryTitle}
        score={totalXp}
        trialsRecorded={observations.length}
        onClose={() => setCertificateModalOpen(false)}
      />
    </div>
  );
}
