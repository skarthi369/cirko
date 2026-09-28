import type { LabProcedureStepDef } from "@/lib/labs/types";

export type StepChecklistPanelProps = {
  steps?: LabProcedureStepDef[];
  currentStepIndex?: number;
  completedStepIndices?: number[];
  onSelectStep?: (index: number) => void;
  attemptsMap?: Record<number, number>;
  onShowHint?: (stepIndex: number) => void;
  onShowGuidedSolution?: (stepIndex: number) => void;
  guidedSolutionUnlockedMap?: Record<number, boolean>;
  onToggleShowMe?: () => void;
  showMeActive?: boolean;
};

export default function StepChecklistPanel({
  steps = [],
  currentStepIndex = 0,
  completedStepIndices = [],
  onSelectStep = () => {},
  attemptsMap = {},
  onShowHint = () => {},
  onShowGuidedSolution = () => {},
  guidedSolutionUnlockedMap = {},
  onToggleShowMe,
  showMeActive = false,
}: StepChecklistPanelProps) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  const safeCompleted = Array.isArray(completedStepIndices) ? completedStepIndices : [];
  const safeAttemptsMap = attemptsMap ?? {};
  const safeUnlockedMap = guidedSolutionUnlockedMap ?? {};

  const currentStep = safeSteps[currentStepIndex] ?? safeSteps[0];
  const currentAttempts = safeAttemptsMap[currentStepIndex] ?? 0;
  const isUnlocked = safeUnlockedMap[currentStepIndex] ?? false;

  return (
    <div className="flex flex-col h-full space-y-3 p-3 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <span>📋</span> PROCEDURE
        </h3>
        <span className="font-mono text-[11px] font-semibold text-primary">
          {safeCompleted.length} / {safeSteps.length} Done
        </span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {safeSteps.map((step, idx) => {
          const isDone = safeCompleted.includes(idx);
          const isCurrent = currentStepIndex === idx;

          return (
            <button
              type="button"
              key={step.stepNumber ?? idx}
              onClick={() => onSelectStep(idx)}
              className={`w-full text-left rounded-md px-2.5 py-2 cursor-pointer transition-all border ${
                isCurrent
                  ? "border-primary bg-primary/10 shadow-xs"
                  : isDone
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                    : "border-border/50 bg-card/60 hover:bg-card hover:border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono text-xs font-bold">
                  {isDone ? (
                    <span className="text-emerald-500">✓</span>
                  ) : isCurrent ? (
                    <span className="text-primary animate-pulse">●</span>
                  ) : (
                    <span className="text-muted-foreground">○</span>
                  )}
                </span>
                <span
                  className={`font-mono text-xs truncate ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isDone
                        ? "text-emerald-400 font-medium"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* CURRENT STEP Focused Card */}
      {currentStep && (
        <div className="rounded-lg border border-primary/40 bg-sidebar/95 p-3.5 space-y-2.5 font-mono shadow-md mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
              CURRENT STEP {currentStep.stepNumber}
            </span>
            <span className="text-[10px] text-amber-500 font-bold">
              Attempts: {Math.min(3, currentAttempts)} / 3
            </span>
          </div>

          <p className="text-xs font-semibold text-foreground leading-snug">
            {currentStep.instruction}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => onShowHint(currentStepIndex)}
              className="flex-1 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-2 py-1 text-[11px] font-bold transition-colors text-center"
            >
              💡 Show Hint
            </button>

            {onToggleShowMe && (
              <button
                type="button"
                onClick={onToggleShowMe}
                className={`flex-1 rounded border px-2 py-1 text-[11px] font-bold transition-colors text-center ${
                  showMeActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                🔍 {showMeActive ? "Hide Help" : "Show Me"}
              </button>
            )}

            {isUnlocked && (
              <button
                type="button"
                onClick={() => onShowGuidedSolution(currentStepIndex)}
                className="w-full rounded border border-destructive bg-destructive/15 hover:bg-destructive/25 text-destructive px-2 py-1 text-[11px] font-bold transition-colors text-center animate-pulse"
              >
                📘 View Guided Solution
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
