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

import {
  simulateIntensityModulation,
  LASER_ITH_MA,
  type SimulationParameters,
} from "./fiber/IntensityModulationSimulationModel";
import FiberTheorySection from "./fiber/FiberTheorySection";
import FiberApparatusSetup from "./fiber/FiberApparatusSetup";
import FiberOscilloscope from "./fiber/FiberOscilloscope";
import FiberAnalysisSection from "./fiber/FiberAnalysisSection";
import FiberResultSummary from "./fiber/FiberResultSummary";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

const LAB_META = LABS_CATALOG.find((l) => l.id === "laser-fiber-intensity-modulation")!;

const PROCEDURE_STEPS: LabProcedureStepDef[] = [
  {
    stepNumber: 1,
    title: "Aim & Signal Chain Overview",
    instruction:
      "Review the experiment aim: transmit an information signal by modulating laser intensity, sending light through optical fiber, and recovering the signal at a photodetector.",
    hints: [
      "Inspect the Overview tab to understand the end-to-end signal transmission chain.",
      "Identify the 5 core stages: Input Signal -> Laser Source -> Optical Fiber -> Photodetector -> Output Recovery.",
      "Notice that the message directly controls laser intensity (IM/DD technique).",
    ],
    guidedSolution: {
      title: "Aim & Core Communication Concept",
      explanation:
        "The objective is to characterize the analog AC transmission behavior of a laser diode intensity modulation system through a dielectric optical fiber. An electrical signal modulates the drive current of a pre-biased laser, travels as light through fiber, and is converted back to voltage by a phototransistor.",
      diagramText: `Input Signal [v_in(t)] ──> [Laser Driver] ──(Optical Fiber)──> [Photodetector] ──> [Scope CH2]`,
      expectedConnections: ["Review Aim and learning objectives", "Proceed to Theory tab"],
      commonMistakes: [
        "Skipping the theoretical signal flow and attempting to operate instruments blindly.",
      ],
    },
  },
  {
    stepNumber: 2,
    title: "Study Interactive Theory (Sections A–L)",
    instruction:
      "Study sections A through L, click through the interactive signal-flow blocks, and complete the inline comprehension checks.",
    hints: [
      "Open the 'Theory (A–L)' tab and expand the sections.",
      "Click each block in the signal-flow diagram to inspect What Enters, What Changes, and What Leaves.",
      "Answer the 4 inline 'Check Your Understanding' questions.",
    ],
    guidedSolution: {
      title: "Comprehensive Intensity Modulation Theory",
      explanation:
        "Intensity modulation directly superimposes the information wave onto the optical carrier. Pre-biasing above threshold (I_bias > Ith) keeps the laser operating in its linear stimulated emission regime, avoiding severe lower-half signal clipping.",
      diagramText: `v_in(t) ──> i_mod(t) ──> P_opt(t) = η·(I_bias + i_mod - Ith) ──> P_rec(t) = P_opt·10^(-αL/10) ──> v_out(t)`,
      expectedConnections: ["Complete theory checklist and inline checks"],
      commonMistakes: [
        "Confusing intensity modulation (AM of light) with coherent optical frequency modulation.",
      ],
    },
  },
  {
    stepNumber: 3,
    title: "Pass Prerequisite Pre-Test",
    instruction:
      "Complete the 5-question pre-test assessment on optical modulation, fiber attenuation, and photodetector responsivity.",
    hints: [
      "Switch to the 'Pre-Test' tab.",
      "Answer all 5 questions on DC biasing, fiber loss, and phototransistor principles.",
      "Submit the assessment to unlock the experimental apparatus.",
    ],
    guidedSolution: {
      title: "Pre-Test Prerequisite Verification",
      explanation:
        "Essential concepts tested: 1) Laser pre-bias prevents extinction clipping; 2) Attenuation scales in dB with length; 3) Phototransistor provides internal gain β; 4) Modulating signal varies optical intensity; 5) Total internal reflection guides light in the fiber core.",
      diagramText: `Pre-Test Assessment [✓ Passed] ──> Unlocks Laboratory Apparatus & Patch Panels`,
      expectedConnections: ["Passing score on Pre-Test assessment"],
      commonMistakes: ["Entering the practical simulator without passing the pre-test."],
    },
  },
  {
    stepNumber: 4,
    title: "Interconnect Lab Apparatus & Probes",
    instruction:
      "In the 'Apparatus & Setup' tab, verify that all 5 electrical and optical patch cables are connected.",
    hints: [
      "Open the 'Apparatus & Setup' tab.",
      "Ensure all 5 patch connections are green: Gen->Laser, Laser->Fiber, Fiber->Detector, Detector->Scope CH2, and Gen->Scope CH1.",
      "Click 'Connect All Components' or toggle each patch button.",
    ],
    guidedSolution: {
      title: "Apparatus Signal Path Configuration",
      explanation:
        "The transmitter connects via BNC to the function generator and via SMA optical connector to the fiber patchcord. The fiber output feeds the photodetector, whose electrical output connects to Scope CH2. Scope CH1 monitors the input reference.",
      diagramText: `[Function Gen] ──BNC──> [Laser Diode] ──SMA──> [Optical Fiber] ──SMA──> [Detector] ──BNC──> [Scope CH2]`,
      expectedConnections: ["All 5 component connections established"],
      commonMistakes: [
        "Leaving the fiber patchcord disconnected while running the electrical simulation.",
      ],
    },
  },
  {
    stepNumber: 5,
    title: "Set Laser DC Bias Above Threshold (25.0 mA)",
    instruction:
      "In the 'Interactive Experiment' tab, adjust the Laser DC Bias Current to 25.0 mA (greater than Ith = 18.0 mA).",
    hints: [
      "Navigate to the 'Interactive Experiment' tab.",
      "Use the 'Laser DC Bias Current' slider to set exactly 25.0 mA (or click the '25 mA' preset).",
      "Notice the operating regime indicator confirming 'Linear Stimulated Lasing'.",
    ],
    guidedSolution: {
      title: "Laser Operating Point (Q-Point) Centering",
      explanation:
        "With Ith = 18.0 mA, setting I_bias = 25.0 mA gives a 7.0 mA margin above threshold. This allows up to ±7.0 mA of AC signal modulation without driving the laser into sub-threshold clipping.",
      diagramText: `I_bias = 25.0 mA > Ith (18.0 mA) => Operating point centered in linear L-I zone`,
      expectedConnections: ["Laser Bias Current set to 25.0 mA"],
      commonMistakes: [
        "Setting bias below 18.0 mA, which cuts off the laser beam during negative cycles.",
      ],
    },
  },
  {
    stepNumber: 6,
    title: "Configure Modulating Signal (1 kHz, 500 mVpp)",
    instruction: "Set the Function Generator to 1.0 kHz sine wave with an amplitude of 500 mVpp.",
    hints: [
      "Adjust the 'Signal Frequency' slider to 1.0 kHz.",
      "Set 'Modulating Amplitude' to 500 mVpp.",
      "Verify the sine waveform selector is highlighted.",
    ],
    guidedSolution: {
      title: "Information Signal Initialization",
      explanation:
        "A 1.0 kHz, 500 mVpp tone produces an AC current swing of ±2.5 mA (via k_mod = 0.01 mA/mV). Instantaneous current swings from 22.5 mA to 27.5 mA, remaining strictly in the linear lasing zone.",
      diagramText: `v_in(t) = 0.25·sin(2π·1000·t) V ==> I(t) = 25.0 mA + 2.5·sin(2π·1000·t) mA`,
      expectedConnections: ["Frequency = 1.0 kHz, Amplitude = 500 mVpp"],
      commonMistakes: ["Leaving the function generator turned off."],
    },
  },
  {
    stepNumber: 7,
    title: "Run Experiment & Observe Oscilloscope",
    instruction:
      "Observe the dual-trace oscilloscope: Channel 1 (Yellow) shows the transmitted wave and Channel 2 (Green) shows the recovered output.",
    hints: [
      "Ensure the simulation is active (click 'Turn On Simulation' if paused).",
      "Look at the oscilloscope display: verify that CH2 reproduces the sinusoidal wave of CH1.",
      "Check that the clipping warning indicator is clear (green 'Linear Modulation').",
    ],
    guidedSolution: {
      title: "Dual-Trace Waveform Synchronization",
      explanation:
        "The oscilloscope displays both traces simultaneously. Channel 1 displays the electrical input v_in(t) and Channel 2 displays the demodulated electrical voltage v_out(t) after transmission through the fiber link.",
      diagramText: `CH1 (Input v_in): 500 mVpp ∿∿∿  ──(Fiber Link)──>  CH2 (Output v_out): ~490 mVpp ∿∿∿`,
      expectedConnections: ["Simulation active", "Both traces visible"],
      commonMistakes: ["Not turning on the simulation before observing the scope."],
    },
  },
  {
    stepNumber: 8,
    title: "Record 1-meter Baseline Observation",
    instruction:
      "With Fiber Length set to 1 m, click 'Record Reading' to log your baseline observation (Trial 1).",
    hints: [
      "Ensure the 'Optical Fiber Length' slider is set to 1 m.",
      "Click the '+ Record Current State' button.",
      "Verify Trial 1 appears in the Observation Table with Vin ≈ 500 mV, Vo ≈ 490 mV, Gain ≈ 0.98.",
    ],
    guidedSolution: {
      title: "Baseline Link Transmission Logging",
      explanation:
        "At 1 meter length, fiber attenuation is negligible (< 0.03 dB). This trial establishes the benchmark voltage gain and reference optical power.",
      diagramText: `Trial 1 Logged: L = 1 m | Vin = 500 mV | Vo ≈ 490 mV | Gain ≈ 0.98 | Loss ≈ 0.2 dB`,
      expectedConnections: ["Trial 1 recorded in observation table"],
      commonMistakes: ["Modifying sliders before recording the baseline reading."],
    },
  },
  {
    stepNumber: 9,
    title: "Measure Optical Attenuation with Distance",
    instruction:
      "Step fiber length to 10 m, 50 m, 100 m, 200 m, and 500 m, recording a reading at each step.",
    hints: [
      "Move the fiber length slider to 10 m and click 'Record Reading'.",
      "Next, test at 50 m, 100 m, 200 m, and 500 m.",
      "Observe that as fiber length increases, received optical power and output voltage Vo shrink proportionally.",
    ],
    guidedSolution: {
      title: "Fiber Attenuation Step Measurements",
      explanation:
        "As fiber length L increases, total link loss A_fiber = α · L increases at 0.03 dB/m. At 100 m, loss is 3.0 dB (50% power transmission); at 500 m, loss is 15.0 dB.",
      diagramText: `L = 10 m (Vo ≈ 460 mV) ──> 50 m (Vo ≈ 345 mV) ──> 100 m (Vo ≈ 245 mV) ──> 500 m (Vo ≈ 87 mV)`,
      expectedConnections: ["At least 4 observations logged across distance"],
      commonMistakes: ["Recording multiple trials at the same distance."],
    },
  },
  {
    stepNumber: 10,
    title: "Test Modulating Amplitude Linearity (Vin vs Vo)",
    instruction:
      "Set Fiber Length to 1 m and test input amplitudes: 200 mV, 500 mV, 1000 mV, and 1500 mVpp (log at least 6 total trials).",
    hints: [
      "Reset fiber length to 1 m.",
      "Test input amplitudes at 200 mV, 500 mV, 1000 mV, and 1500 mVpp.",
      "Record each measurement into the observation table (ensure at least 6 total rows).",
    ],
    guidedSolution: {
      title: "Input-Output Linearity Characterization",
      explanation:
        "Plotting Vo versus Vin reveals the dynamic transfer linearity of the intensity modulation link. In the linear region, Vo increases proportionally with Vin.",
      diagramText: `Vin = 200 mV (Vo ≈ 196 mV) ──> 500 mV (Vo ≈ 490 mV) ──> 1000 mV (Vo ≈ 980 mV) ──> 1500 mV (Vo ≈ 1470 mV)`,
      expectedConnections: ["Minimum 6 total observations recorded in table"],
      commonMistakes: ["Recording fewer than 6 observations."],
    },
  },
  {
    stepNumber: 11,
    title: "Scientific Analysis & Linearity Graph",
    instruction:
      "Open the 'Graphs' and 'Analysis' tabs, verify the Vin vs Vo linearity curve, and answer the 7 interpretation questions.",
    hints: [
      "Open the 'Transfer & Attenuation Graphs' tab to inspect the linear transfer plot.",
      "Switch to the 'Analysis' tab.",
      "Answer all 7 questions on optical modulation, fiber attenuation, photodetector output, and signal recovery.",
    ],
    guidedSolution: {
      title: "Data Interpretation & Link Evaluation",
      explanation:
        "The linear Vin vs Vo curve verifies high fidelity transmission. The slope represents the net link transfer gain G_v = Vo / Vin.",
      diagramText: `Linearity Curve [✓ Verified] ──> 7 Analysis Questions [✓ Answered]`,
      expectedConnections: ["Graphs inspected", "All 7 analysis questions answered"],
      commonMistakes: ["Skipping the analysis questions before post-test."],
    },
  },
  {
    stepNumber: 12,
    title: "Post-Test Assessment & Certification",
    instruction:
      "Complete the 5-question comprehensive post-test to conclude the optical communication laboratory and generate your verified certificate.",
    hints: [
      "Open the 'Post-Test' tab.",
      "Answer the 5 multiple choice questions on direct detection, fiber loss in dB, and over-modulation clipping.",
      "Submit your assessment and claim your digital completion certificate.",
    ],
    guidedSolution: {
      title: "Final Laboratory Verification",
      explanation:
        "Congratulations! You have mastered the complete optical communication path: information encoding, direct intensity modulation, dielectric waveguide propagation, square-law detection, and analog signal recovery.",
      diagramText: `Aim [✓] ──> Theory [✓] ──> Pretest [✓] ──> Setup [✓] ──> Experiment [✓] ──> Table [✓] ──> Graph [✓] ──> Analysis [✓] ──> Posttest [✓] ──> Certificate [🎓]`,
      expectedConnections: ["Post-test completed with passing score"],
      commonMistakes: ["Exiting without claiming the certificate."],
    },
  },
];

export default function FiberModulationLabContainer() {
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

  // Interactive Apparatus & Instrument Controls
  const [inputAmplitude_mVpp, setInputAmplitude_mVpp] = useState(500); // 10 to 2000 mVpp
  const [inputFrequency_kHz, setInputFrequency_kHz] = useState(1.0); // 0.1 to 200 kHz
  const [waveformType, setWaveformType] = useState<"sine" | "triangle" | "square">("sine");
  const [signalGeneratorActive, setSignalGeneratorActive] = useState(true);

  const [laserBiasCurrent_mA, setLaserBiasCurrent_mA] = useState(25.0); // mA (Ith = 18 mA)
  const [laserActive, setLaserActive] = useState(true);

  const [fiberLength_m, setFiberLength_m] = useState(1); // 1 to 1000 m
  const [fiberAttenuation_dB_per_m] = useState(0.03); // 0.03 dB/m for POF

  const [loadResistance_ohms] = useState(1000); // 1 kΩ
  const [amplifierGain] = useState(1.8);

  // Connection Matrix
  const [connections, setConnections] = useState({
    genToLaser: true,
    laserToFiber: true,
    fiberToDetector: true,
    detectorToScope: true,
    genToScope: true,
  });

  const handleToggleConnection = (key: string) => {
    setConnections((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  // Observations storage (isolated to this lab)
  const [observations, setObservations] = useState<Observation[]>(() => {
    try {
      const raw = localStorage.getItem("cirkit.lab.intensity_mod.observations.v1");
      return raw ? (JSON.parse(raw) as Observation[]) : [];
    } catch {
      return [];
    }
  });

  // Save observations isolated
  useEffect(() => {
    try {
      localStorage.setItem(
        "cirkit.lab.intensity_mod.observations.v1",
        JSON.stringify(observations),
      );
    } catch {
      /* ignore */
    }
  }, [observations]);

  // Test states
  const [theoryChecksAnswered, setTheoryChecksAnswered] = useState<string[]>([]);
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);

  // Procedure state machine
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [attemptsMap, setAttemptsMap] = useState<Record<number, number>>({});
  const [guidedSolutionUnlockedMap, setGuidedSolutionUnlockedMap] = useState<
    Record<number, boolean>
  >({});
  const [showMeActive, setShowMeActive] = useState(false);

  // Modals & hints
  const [activeGuidedModalStepIndex, setActiveGuidedModalStepIndex] = useState<number | null>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Graph display toggle
  const [graphMode, setGraphMode] = useState<"transfer" | "attenuation">("transfer");

  // Deterministic simulation execution
  const simulationParams: SimulationParameters = useMemo(() => {
    return {
      inputAmplitude_mVpp,
      inputFrequency_kHz,
      waveformType,
      signalGeneratorActive,
      laserBiasCurrent_mA,
      laserActive,
      fiberLength_m,
      fiberAttenuation_dB_per_m,
      fiberConnected: connections.laserToFiber && connections.fiberToDetector,
      detectorConnected: connections.detectorToScope,
      loadResistance_ohms,
      amplifierGain,
    };
  }, [
    inputAmplitude_mVpp,
    inputFrequency_kHz,
    waveformType,
    signalGeneratorActive,
    laserBiasCurrent_mA,
    laserActive,
    fiberLength_m,
    fiberAttenuation_dB_per_m,
    connections,
    loadResistance_ohms,
    amplifierGain,
  ]);

  const metrics = useMemo(() => {
    return simulateIntensityModulation(simulationParams);
  }, [simulationParams]);

  // Step Validation info
  const validationInfo = useMemo(() => {
    const hasPretest = preScore !== null && preScore >= 1;
    const allConnected =
      connections.genToLaser &&
      connections.laserToFiber &&
      connections.fiberToDetector &&
      connections.detectorToScope &&
      connections.genToScope;
    const hasBias = laserBiasCurrent_mA >= LASER_ITH_MA + 2;
    const hasAdequateTrials = observations.length >= 6;
    const hasPosttest = postScore !== null && postScore >= 1;

    let message = "Optical transmission link active. Adjust parameters to record readings.";
    if (!allConnected) {
      message = "⚠️ Incomplete signal path: Check connections in the Apparatus & Setup tab.";
    } else if (metrics.isClipped) {
      message = `⚠️ Warning: Laser modulation clipped! Increase DC bias current above ${LASER_ITH_MA} mA.`;
    } else if (metrics.vout_pp_mV > 0) {
      message = `✓ Linear Transmission: Vin = ${metrics.vin_pp_mV} mVpp, Vout = ${metrics.vout_pp_mV} mVpp (Gain = ${metrics.voltageGain.toFixed(2)}).`;
    }

    return {
      valid:
        currentStepIndex === 0 ||
        (currentStepIndex === 1 && theoryChecksAnswered.length >= 1) ||
        (currentStepIndex === 2 && hasPretest) ||
        (currentStepIndex === 3 && allConnected) ||
        (currentStepIndex === 4 && hasBias) ||
        (currentStepIndex === 5 && inputFrequency_kHz === 1.0 && inputAmplitude_mVpp === 500) ||
        (currentStepIndex === 6 && metrics.vout_pp_mV > 0) ||
        (currentStepIndex === 7 && observations.length >= 1) ||
        (currentStepIndex === 8 && observations.length >= 4) ||
        (currentStepIndex === 9 && hasAdequateTrials) ||
        (currentStepIndex === 10 && observations.length >= 5) ||
        (currentStepIndex === 11 && hasPosttest),
      partsPlaced: true,
      topologyValid: allConnected,
      simulationRunning: laserActive && signalGeneratorActive,
      activeMeasurement: metrics.vout_pp_mV > 0,
      hasSubThresholdReading: false,
      hasKneeReading: false,
      hasLinearReading: true,
      message,
      errorKind: "no_error" as const,
      vin: metrics.vin_pp_mV,
      vd: metrics.vout_pp_mV,
      id: metrics.peakDetectorCurrent_uA,
      hasPretest,
      hasAdequateTrials,
    };
  }, [
    preScore,
    connections,
    laserBiasCurrent_mA,
    observations.length,
    postScore,
    currentStepIndex,
    theoryChecksAnswered.length,
    inputFrequency_kHz,
    inputAmplitude_mVpp,
    metrics,
    laserActive,
    signalGeneratorActive,
  ]);

  // Completed steps tracker
  const completedStepIndices = useMemo(() => {
    const list: number[] = [0]; // Step 1: Aim reviewed
    if (theoryChecksAnswered.length >= 1) list.push(1); // Step 2: Theory
    if (preScore !== null && preScore >= 1) list.push(2); // Step 3: Pre-test
    if (
      connections.genToLaser &&
      connections.laserToFiber &&
      connections.fiberToDetector &&
      connections.detectorToScope &&
      connections.genToScope
    )
      list.push(3); // Step 4: Apparatus connected
    if (laserBiasCurrent_mA >= LASER_ITH_MA + 2) list.push(4); // Step 5: Bias set
    if (inputFrequency_kHz === 1.0 && inputAmplitude_mVpp === 500) list.push(5); // Step 6: Modulating signal
    if (metrics.vout_pp_mV > 0 && !metrics.isClipped) list.push(6); // Step 7: Scope inspected
    if (observations.length >= 1) list.push(7); // Step 8: Baseline logged
    if (observations.length >= 4) list.push(8); // Step 9: Distance tests logged
    if (observations.length >= 6) list.push(9); // Step 10: Amplitude linearity logged
    if (observations.length >= 5) list.push(10); // Step 11: Graphs & Analysis
    if (postScore !== null && postScore >= 1) list.push(11); // Step 12: Post-test
    return list;
  }, [
    theoryChecksAnswered.length,
    preScore,
    connections,
    laserBiasCurrent_mA,
    inputFrequency_kHz,
    inputAmplitude_mVpp,
    metrics.vout_pp_mV,
    metrics.isClipped,
    observations.length,
    postScore,
  ]);

  // Handle step selection from sidebar
  const handleSelectStep = (idx: number) => {
    setCurrentStepIndex(idx);
    if (idx === 0) setActiveTab("overview");
    else if (idx === 1) setActiveTab("theory");
    else if (idx === 2) setActiveTab("pretest");
    else if (idx === 3) setActiveTab("apparatus");
    else if (idx >= 4 && idx <= 6) setActiveTab("experiment");
    else if (idx >= 7 && idx <= 9) setActiveTab("experiment");
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

  // Record an observation trial
  const handleRecordMeasurement = () => {
    const newObs: Observation = {
      id: `trial_${Date.now()}`,
      trialNumber: observations.length + 1,
      voltage_in: metrics.vin_pp_mV, // Vin (mVpp)
      current_mA: metrics.vout_pp_mV, // Vout (mVpp)
      voltage_diode: metrics.receivedOpticalPower_mW, // P_rec (mW)
      power_mW: metrics.voltageGain, // Gain (Vo/Vin)
      state_label: `${fiberLength_m}m fiber (${metrics.fiberAttenuation_dB} dB loss)`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    setObservations((prev) => [...prev, newObs]);
  };

  const handleClearObservations = () => {
    setObservations([]);
    try {
      localStorage.removeItem("cirkit.lab.intensity_mod.observations.v1");
    } catch {
      /* ignore */
    }
  };

  const handleDeleteObservation = (id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
  };

  const handleExportCSV = () => {
    if (observations.length === 0) return;
    const headers = [
      "Trial",
      "Vin_mVpp",
      "Vout_mVpp",
      "VoltageGain_Vo_over_Vin",
      "ReceivedPower_mW",
      "FiberLength_m",
      "Timestamp",
    ];
    const rows = observations.map((o) => [
      o.trialNumber,
      o.voltage_in,
      o.current_mA,
      o.power_mW.toFixed(3),
      o.voltage_diode.toFixed(3),
      o.state_label,
      o.timestamp,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "intensity_modulation_observations.csv");
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

  // Progress & XP calculation
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
    if (validationInfo.topologyValid) {
      p += 15;
      xp += 15;
    }
    if (observations.length >= 1) {
      p += 15;
      xp += 15;
    }
    if (observations.length >= 5) {
      p += 15;
      xp += 15;
    }
    if (completedStepIndices.includes(10)) {
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
    validationInfo.topologyValid,
    observations.length,
    completedStepIndices,
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
            <span className="text-sm">〰️</span>
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
              setInputAmplitude_mVpp(500);
              setInputFrequency_kHz(1.0);
              setLaserBiasCurrent_mA(25.0);
              setFiberLength_m(1);
              setObservations([]);
              setCurrentStepIndex(1);
            }}
            className="h-7 font-mono text-[11px]"
          >
            ↺ Reset Link
          </Button>

          <Link to="/">
            <Button variant="ghost" size="sm" className="h-7 font-mono text-[11px]">
              CircuitLab Studio
            </Button>
          </Link>
        </div>
      </header>

      {/* Tabs Bar Following Complete Student Journey */}
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
              📖 Theory (A–L)
            </TabsTrigger>
            <TabsTrigger value="pretest" className="font-mono text-xs h-7">
              ❓ Pre-Test{" "}
              {preScore !== null && `(${preScore}/${LAB_META.manual.preTestQuestions.length})`}
            </TabsTrigger>
            <TabsTrigger value="apparatus" className="font-mono text-xs h-7">
              🧰 Apparatus & Setup
            </TabsTrigger>
            <TabsTrigger value="experiment" className="font-mono text-xs h-7">
              🔬 Interactive Experiment
            </TabsTrigger>
            <TabsTrigger value="table" className="font-mono text-xs h-7">
              📊 Observations ({observations.length})
            </TabsTrigger>
            <TabsTrigger value="graph" className="font-mono text-xs h-7">
              📈 Linearity Graphs
            </TabsTrigger>
            <TabsTrigger value="analysis" className="font-mono text-xs h-7">
              🔍 Analysis & Linearity
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
                    IIT Roorkee Virtual Lab Standard
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">Experiment 3</span>
                </div>
                <h2 className="text-2xl font-bold font-mono text-foreground tracking-tight">
                  Intensity Modulation of Laser Output Through an Optical Fiber
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Study how an analog information signal modulates the radiant intensity of a
                  semiconductor laser diode, propagates through a dielectric optical fiber link, and
                  is detected and demodulated back into an electrical waveform at the photodetector
                  receiver.
                </p>
              </div>

              {/* Aim Section */}
              <Card className="border-border bg-card">
                <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
                  <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                    1. Aim & Educational Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3 font-mono text-xs text-muted-foreground leading-relaxed">
                  <p className="text-foreground font-semibold text-sm">
                    Aim: To demonstrate the principles of optical intensity modulation (IM/DD) by
                    modulating a semiconductor laser source with an electrical information signal,
                    transmitting light through an optical fiber waveguide, and recovering the
                    original analog signal at the photodetector receiver.
                  </p>
                  <div className="space-y-1.5 pt-2">
                    <span className="text-foreground font-bold block text-xs">
                      Specific Learning Objectives:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>
                        Understand direct intensity modulation (IM) and direct detection (DD) in
                        optical communications.
                      </li>
                      <li>
                        Observe the role of DC pre-biasing the laser above threshold current (I_bias
                        &gt; Ith) to avoid clipping.
                      </li>
                      <li>
                        Trace the complete communication path: Signal Generator → Laser Driver →
                        Optical Fiber → Photodetector → Load Resistor → Amplifier → Scope.
                      </li>
                      <li>
                        Measure optical fiber propagation attenuation (α in dB/m) over variable
                        patchcord lengths.
                      </li>
                      <li>
                        Observe and compare transmitted (CH1) and recovered (CH2) waveforms on a
                        dual-trace oscilloscope.
                      </li>
                      <li>
                        Plot the input amplitude (Vin) versus output amplitude (Vo) linearity curve
                        and evaluate link transfer gain.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Complete Signal Path Visual Roadmap */}
              <Card className="border-border bg-card">
                <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
                  <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                    2. Complete End-to-End Communication Chain
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs text-center">
                    <div className="p-3 rounded border border-border bg-sidebar/50">
                      <span className="text-primary font-bold block">1. Input Signal</span>
                      <span className="text-[10px] text-muted-foreground">v_in(t) Voltage</span>
                    </div>
                    <div className="p-3 rounded border border-border bg-sidebar/50">
                      <span className="text-primary font-bold block">2. Laser Source</span>
                      <span className="text-[10px] text-muted-foreground">Intensity P_opt(t)</span>
                    </div>
                    <div className="p-3 rounded border border-border bg-sidebar/50">
                      <span className="text-primary font-bold block">3. Optical Fiber</span>
                      <span className="text-[10px] text-muted-foreground">
                        TIR Waveguide (α dB)
                      </span>
                    </div>
                    <div className="p-3 rounded border border-border bg-sidebar/50">
                      <span className="text-primary font-bold block">4. Detector</span>
                      <span className="text-[10px] text-muted-foreground">
                        Photocurrent I_det(t)
                      </span>
                    </div>
                    <div className="p-3 rounded border border-border bg-sidebar/50">
                      <span className="text-primary font-bold block">5. Output Recovery</span>
                      <span className="text-[10px] text-muted-foreground">v_out(t) Replica</span>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <Button
                      onClick={() => setActiveTab("theory")}
                      className="font-mono text-xs gap-2 bg-primary text-primary-foreground shadow-sm"
                    >
                      Begin Interactive Theory (Sections A–L) →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: THEORY (A-L) */}
        {activeTab === "theory" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <FiberTheorySection
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
                title="Intensity Modulation Prerequisite Assessment"
                description="Verify understanding of direct intensity modulation, laser DC pre-biasing, optical fiber attenuation, and photodetector responsivity."
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
            <FiberApparatusSetup
              onStartSimulation={() => setActiveTab("experiment")}
              connections={connections}
              onToggleConnection={handleToggleConnection}
            />
          </div>
        )}

        {/* TAB 5: INTERACTIVE EXPERIMENT */}
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
              canRecord={metrics.vout_pp_mV > 0}
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
              {/* Simulator Center Canvas */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6 bg-canvas">
                <div className="mx-auto max-w-4xl space-y-6">
                  {/* Dual-Trace Oscilloscope Component */}
                  <FiberOscilloscope
                    metrics={metrics}
                    waveforms={metrics.waveforms}
                    connections={{
                      genToScope: connections.genToScope,
                      detectorToScope: connections.detectorToScope,
                    }}
                  />

                  {/* Optical Communication Equipment Control Racks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rack 1: Function Generator Controls */}
                    <Card
                      className={`border-border bg-card transition-all ${
                        showMeActive && (currentStepIndex === 5 || currentStepIndex === 6)
                          ? "ring-2 ring-primary shadow-lg"
                          : ""
                      }`}
                    >
                      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>🎛️</span>
                          <CardTitle className="font-mono text-xs font-bold text-foreground">
                            1. Function Generator (Tx Information)
                          </CardTitle>
                        </div>
                        <Badge
                          variant={signalGeneratorActive ? "default" : "secondary"}
                          className="font-mono text-[10px]"
                        >
                          {signalGeneratorActive ? "● RF Active" : "○ Generator OFF"}
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-4 space-y-4 font-mono text-xs">
                        {/* Waveform Selector */}
                        <div className="space-y-1">
                          <label className="text-muted-foreground text-[11px] block font-bold">
                            Modulating Waveform:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(["sine", "triangle", "square"] as const).map((w) => (
                              <button
                                key={w}
                                onClick={() => setWaveformType(w)}
                                className={`py-1 px-2 rounded border text-center uppercase tracking-wider text-[10px] font-bold ${
                                  waveformType === w
                                    ? "border-primary bg-primary/20 text-primary"
                                    : "border-border bg-sidebar hover:bg-card text-muted-foreground"
                                }`}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Modulating Amplitude */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px]">
                              Modulating Amplitude (Vin):
                            </span>
                            <span className="text-foreground font-bold">
                              {inputAmplitude_mVpp} mVpp
                            </span>
                          </div>
                          <Slider
                            value={[inputAmplitude_mVpp]}
                            min={50}
                            max={1800}
                            step={50}
                            onValueChange={(vals) => setInputAmplitude_mVpp(vals[0] ?? 500)}
                            className="w-full"
                          />
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>50 mVpp</span>
                            <span>Preset: 500 mV</span>
                            <span>1800 mVpp</span>
                          </div>
                        </div>

                        {/* Modulating Frequency */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px]">
                              Modulating Frequency (f_m):
                            </span>
                            <span className="text-primary font-bold">
                              {inputFrequency_kHz.toFixed(1)} kHz
                            </span>
                          </div>
                          <Slider
                            value={[inputFrequency_kHz]}
                            min={0.2}
                            max={50}
                            step={0.2}
                            onValueChange={(vals) => setInputFrequency_kHz(vals[0] ?? 1.0)}
                            className="w-full"
                          />
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>200 Hz</span>
                            <span>Preset: 1.0 kHz</span>
                            <span>50 kHz</span>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSignalGeneratorActive((a) => !a)}
                            className="h-7 text-xs"
                          >
                            {signalGeneratorActive ? "⏸ Mute Signal" : "▶ Enable Signal"}
                          </Button>
                          <span className="text-[10px] text-muted-foreground">Z_out = 50 Ω</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rack 2: Laser Diode Transmitter Controls */}
                    <Card
                      className={`border-border bg-card transition-all ${
                        showMeActive && currentStepIndex === 4
                          ? "ring-2 ring-primary shadow-lg"
                          : ""
                      }`}
                    >
                      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>⚡</span>
                          <CardTitle className="font-mono text-xs font-bold text-foreground">
                            2. Laser Diode Driver (650 nm)
                          </CardTitle>
                        </div>
                        <Badge
                          variant={metrics.isLasing ? "default" : "secondary"}
                          className="font-mono text-[10px]"
                        >
                          {metrics.isLasing ? "● Stimulated Lasing" : "○ Sub-Threshold"}
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-4 space-y-4 font-mono text-xs">
                        {/* Laser DC Bias Current Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px]">
                              Laser DC Pre-Bias Current:
                            </span>
                            <span className="text-foreground font-bold">
                              {laserBiasCurrent_mA.toFixed(1)} mA
                            </span>
                          </div>
                          <Slider
                            value={[laserBiasCurrent_mA]}
                            min={10}
                            max={35}
                            step={0.5}
                            onValueChange={(vals) => setLaserBiasCurrent_mA(vals[0] ?? 25.0)}
                            className="w-full"
                          />
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>10 mA (Off)</span>
                            <span className="text-amber-500 font-bold">Ith ≈ 18 mA</span>
                            <span>35 mA (Max Safe)</span>
                          </div>
                        </div>

                        {/* Quick Bias Presets */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] text-muted-foreground self-center mr-1">
                            Presets:
                          </span>
                          {[15, 18, 20, 25, 30].map((val) => (
                            <button
                              key={val}
                              onClick={() => setLaserBiasCurrent_mA(val)}
                              className={`px-2 py-0.5 rounded text-[10px] border ${
                                laserBiasCurrent_mA === val
                                  ? "border-primary bg-primary/20 text-primary font-bold"
                                  : "border-border bg-sidebar hover:bg-card text-muted-foreground"
                              }`}
                            >
                              {val} mA
                            </button>
                          ))}
                        </div>

                        {/* Laser Optical Telemetry */}
                        <div className="p-2.5 rounded border border-border bg-sidebar/40 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Peak Optical Flux:</span>
                            <span className="font-bold text-red-400">
                              {metrics.peakLaserPower_mW.toFixed(2)} mW
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Modulation Depth (m):</span>
                            <span className="font-bold text-foreground">
                              {metrics.modulationIndex.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLaserActive((a) => !a)}
                            className="h-7 text-xs"
                          >
                            {laserActive ? "⏸ Disable Laser" : "▶ Turn On Laser"}
                          </Button>
                          <span className="text-[10px] text-muted-foreground">λ = 650 nm</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rack 3: Optical Fiber Link Controls */}
                    <Card
                      className={`border-border bg-card transition-all ${
                        showMeActive && (currentStepIndex === 8 || currentStepIndex === 9)
                          ? "ring-2 ring-primary shadow-lg"
                          : ""
                      }`}
                    >
                      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>〰️</span>
                          <CardTitle className="font-mono text-xs font-bold text-foreground">
                            3. Optical Fiber Waveguide Channel
                          </CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] text-emerald-400 border-emerald-500/40"
                        >
                          {fiberLength_m} meter POF Link
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-4 space-y-4 font-mono text-xs">
                        {/* Fiber Length Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-[11px]">
                              Fiber Patchcord Length:
                            </span>
                            <span className="text-emerald-400 font-bold">
                              {fiberLength_m} meters
                            </span>
                          </div>
                          <Slider
                            value={[fiberLength_m]}
                            min={1}
                            max={500}
                            step={1}
                            onValueChange={(vals) => setFiberLength_m(vals[0] ?? 1)}
                            className="w-full"
                          />
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>1 m (Baseline)</span>
                            <span>100 m</span>
                            <span>500 m</span>
                          </div>
                        </div>

                        {/* Quick Length Presets */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] text-muted-foreground self-center mr-1">
                            Length Presets:
                          </span>
                          {[1, 10, 50, 100, 200, 500].map((val) => (
                            <button
                              key={val}
                              onClick={() => setFiberLength_m(val)}
                              className={`px-2 py-0.5 rounded text-[10px] border ${
                                fiberLength_m === val
                                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold"
                                  : "border-border bg-sidebar hover:bg-card text-muted-foreground"
                              }`}
                            >
                              {val} m
                            </button>
                          ))}
                        </div>

                        {/* Attenuation Telemetry */}
                        <div className="p-2.5 rounded border border-border bg-sidebar/40 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Loss (A = α · L):</span>
                            <span className="font-bold text-foreground">
                              {metrics.fiberAttenuation_dB.toFixed(2)} dB
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Transit Delay (τ):</span>
                            <span className="font-bold text-foreground">
                              {metrics.propagationDelay_ns.toFixed(1)} ns
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rack 4: Receiver & Data Logging Trigger */}
                    <Card className="border-border bg-card">
                      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>👁️</span>
                          <CardTitle className="font-mono text-xs font-bold text-foreground">
                            4. Optical Receiver & Observation Logger
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] text-primary">
                          Phototransistor + TIA
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-4 space-y-4 font-mono text-xs">
                        <div className="p-2.5 rounded border border-border bg-sidebar/40 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Received Optical Power:</span>
                            <span className="font-bold text-emerald-400">
                              {metrics.receivedOpticalPower_mW.toFixed(3)} mW
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Detector Current (I_det):</span>
                            <span className="font-bold text-foreground">
                              {metrics.peakDetectorCurrent_uA.toFixed(1)} µA
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Recovered Voltage (Vout):</span>
                            <span className="font-bold text-foreground">
                              {metrics.vout_pp_mV.toFixed(1)} mVpp
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Link Voltage Gain (Vo/Vin):
                            </span>
                            <span className="font-bold text-primary">
                              {metrics.voltageGain.toFixed(3)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            onClick={handleRecordMeasurement}
                            className="w-full font-mono text-xs gap-1.5 bg-primary text-primary-foreground shadow-sm"
                          >
                            📸 Record Observation (Vin = {metrics.vin_pp_mV} mV, Vo ={" "}
                            {metrics.vout_pp_mV} mV)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Sidebar: Persistent Step Checklist Panel */}
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
                    Observation Table: Optical Intensity Modulation Link
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Deterministic experimental measurements recorded across modulating amplitudes,
                    frequencies, and fiber lengths.
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
                        Clear Table
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
                      <th className="p-3">Input Vin (mVpp)</th>
                      <th className="p-3">Output Vo (mVpp)</th>
                      <th className="p-3">Voltage Gain (Vo/Vin)</th>
                      <th className="p-3">Rec Power (mW)</th>
                      <th className="p-3">Fiber Link State</th>
                      <th className="p-3">Time</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-muted-foreground">
                          No observations recorded yet. Go to 'Interactive Experiment' and click
                          'Record Observation'.
                        </td>
                      </tr>
                    ) : (
                      observations.map((obs) => (
                        <tr key={obs.id} className="border-b border-border/50 hover:bg-sidebar/50">
                          <td className="p-3 font-bold">{obs.trialNumber}</td>
                          <td className="p-3 font-bold text-amber-400">
                            {obs.voltage_in.toFixed(0)} mV
                          </td>
                          <td className="p-3 font-bold text-emerald-400">
                            {obs.current_mA.toFixed(0)} mV
                          </td>
                          <td className="p-3 text-primary font-bold">{obs.power_mW.toFixed(3)}</td>
                          <td className="p-3 text-muted-foreground">
                            {obs.voltage_diode.toFixed(3)} mW
                          </td>
                          <td className="p-3 text-muted-foreground">{obs.state_label}</td>
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

        {/* TAB 7: GRAPHS */}
        {activeTab === "graph" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="py-3 px-4 bg-sidebar border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                      {graphMode === "transfer"
                        ? "Transfer Characteristic: Output Voltage (Vo) vs. Input Voltage (Vin)"
                        : "Link Attenuation: Optical Power vs. Distance"}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground font-mono">
                      {graphMode === "transfer"
                        ? "Verifies the dynamic linearity of the optical intensity modulation link. Evaluates transfer gain G = ΔVo / ΔVin."
                        : "Visualizes the exponential decay of optical power across varying patchcord lengths."}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant={graphMode === "transfer" ? "default" : "outline"}
                      onClick={() => setGraphMode("transfer")}
                      className="font-mono text-xs h-7 px-3"
                    >
                      Vin vs. Vo Linearity
                    </Button>
                    <Button
                      size="sm"
                      variant={graphMode === "attenuation" ? "default" : "outline"}
                      onClick={() => setGraphMode("attenuation")}
                      className="font-mono text-xs h-7 px-3"
                    >
                      Power vs. Distance
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {observations.length < 2 ? (
                    <div className="p-6 rounded-lg border border-dashed border-border bg-sidebar/50 text-center text-xs text-muted-foreground font-mono">
                      Please record at least 3 to 5 observations in the Interactive Experiment tab
                      to plot the characteristic curve.
                    </div>
                  ) : (
                    <div className="h-80 w-full rounded-lg border border-border bg-sidebar/40 p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={[...observations].sort((a, b) =>
                            graphMode === "transfer"
                              ? a.voltage_in - b.voltage_in
                              : a.trialNumber - b.trialNumber,
                          )}
                          margin={{ top: 15, right: 30, left: 15, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.6} />

                          {graphMode === "transfer" && (
                            <ReferenceArea
                              x1={0}
                              x2={1200}
                              fill="#10b981"
                              fillOpacity={0.07}
                              label={{
                                value: "High Fidelity Linear Dynamic Region",
                                fill: "#10b981",
                                fontSize: 10,
                                position: "insideTopLeft",
                              }}
                            />
                          )}

                          <XAxis
                            dataKey={graphMode === "transfer" ? "voltage_in" : "trialNumber"}
                            type="number"
                            domain={[0, "auto"]}
                            unit={graphMode === "transfer" ? " mV" : ""}
                            stroke="#888"
                            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                            label={{
                              value:
                                graphMode === "transfer"
                                  ? "Modulating Input Amplitude Vin (mVpp)"
                                  : "Observation Trial Index",
                              position: "bottom",
                              offset: 10,
                              fill: "#888",
                              fontSize: 11,
                            }}
                          />
                          <YAxis
                            dataKey={graphMode === "transfer" ? "current_mA" : "voltage_diode"}
                            type="number"
                            unit={graphMode === "transfer" ? " mV" : " mW"}
                            domain={[0, "auto"]}
                            stroke="#888"
                            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
                            label={{
                              value:
                                graphMode === "transfer"
                                  ? "Recovered Output Amplitude Vo (mVpp)"
                                  : "Received Optical Power (mW)",
                              angle: -90,
                              position: "insideLeft",
                              fill: "#888",
                              fontSize: 11,
                            }}
                          />
                          <Tooltip
                            formatter={(value: unknown) => [
                              `${Number(value).toFixed(1)} ${graphMode === "transfer" ? "mV" : "mW"}`,
                              graphMode === "transfer" ? "Output Amplitude" : "Received Power",
                            ]}
                            labelFormatter={(lbl) =>
                              graphMode === "transfer" ? `Input Vin: ${lbl} mV` : `Trial: ${lbl}`
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
                            dataKey={graphMode === "transfer" ? "current_mA" : "voltage_diode"}
                            stroke={graphMode === "transfer" ? "#10b981" : "#38bdf8"}
                            strokeWidth={2.5}
                            dot={{
                              r: 5,
                              fill: graphMode === "transfer" ? "#10b981" : "#38bdf8",
                              stroke: "#ffffff",
                              strokeWidth: 1.5,
                            }}
                            activeDot={{ r: 7 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
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
                      Proceed to Analysis & Interpretation →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 8: ANALYSIS */}
        {activeTab === "analysis" && (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <FiberAnalysisSection
              observations={observations}
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
                title="Optical Fiber Intensity Modulation Post-Test"
                description="Demonstrate conceptual mastery of intensity modulation with direct detection (IM/DD), optical fiber attenuation, and signal recovery."
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
            <FiberResultSummary
              observations={observations}
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
