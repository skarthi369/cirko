export type LabCategoryId =
  "optical-communication" | "digital-electronics" | "communication-systems";

export type LabDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type LabStatus = "available" | "in_development";

export type PrePostTestQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type LabApparatusItem = {
  name: string;
  specification: string;
  quantity: number | string;
};

export type LabProcedureStepDef = {
  stepNumber: number;
  title: string;
  instruction: string;
  hints: [string, string, string]; // [Attempt 1: general, Attempt 2: specific, Attempt 3: instructional]
  guidedSolution: {
    title: string;
    explanation: string;
    diagramText: string;
    expectedConnections: string[];
    commonMistakes: string[];
  };
};

export type LabManualData = {
  aim: string;
  theory: {
    overview: string;
    keyPoints: string[];
    equations: { title: string; formula: string; description: string }[];
  };
  apparatus: LabApparatusItem[];
  circuitSetupDescription: string;
  procedureSteps: string[];
  preTestQuestions: PrePostTestQuestion[];
  postTestQuestions: PrePostTestQuestion[];
  references: { title: string; url?: string; author?: string }[];
};

export type LabMeta = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: LabCategoryId;
  categoryTitle: string;
  shortObjective: string;
  difficulty: LabDifficulty;
  estimatedDuration: string;
  status: LabStatus;
  path: string;
  iitrReferenceUrl: string;
  manual: LabManualData;
  procedureStepDefs?: LabProcedureStepDef[];
};

export type Observation = {
  trial: number;
  timestamp?: number;
  voltage: number; // Forward voltage V_D (V)
  current: number; // Forward current I_D (mA)
  batteryVoltage?: number; // Vin (V)
  notes?: string;
};

export type StepState = {
  currentStepIndex: number;
  attempts: Record<number, number>; // stepIndex -> failure count
  guidedSolutionUnlocked: Record<number, boolean>;
  showMeActive: boolean;
};
