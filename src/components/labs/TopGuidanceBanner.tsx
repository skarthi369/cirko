import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LabProcedureStepDef } from "@/lib/labs/types";
import type { StepValidationInfo } from "@/lib/labs/ledValidation";

export type TopGuidanceBannerProps = {
  currentStep: LabProcedureStepDef;
  totalSteps: number;
  validation: StepValidationInfo;
  attempts: number;
  maxAttempts?: number;
  onRecordMeasurement?: () => void;
  onShowHint: () => void;
  onShowGuidedSolution: () => void;
  onToggleShowMe: () => void;
  showMeActive: boolean;
  guidedSolutionUnlocked: boolean;
  canRecord: boolean;
};

export default function TopGuidanceBanner({
  currentStep,
  totalSteps,
  validation,
  attempts,
  maxAttempts = 3,
  onRecordMeasurement,
  onShowHint,
  onShowGuidedSolution,
  onToggleShowMe,
  showMeActive,
  guidedSolutionUnlocked,
  canRecord,
}: TopGuidanceBannerProps) {
  const isCorrect = validation.errorKind === "no_error" || validation.topologyValid;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-sm shadow-xs">
      {/* Step and Task Description */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/40 font-mono text-xs text-primary px-2 py-0.5"
        >
          Step {currentStep.stepNumber} of {totalSteps}
        </Badge>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-foreground tracking-tight">
              {currentStep.title}:
            </span>
            <span className="text-xs text-muted-foreground">{currentStep.instruction}</span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[11px] font-semibold text-muted-foreground">
              Status:
            </span>
            <span
              className={`font-mono text-[11px] font-medium ${
                isCorrect ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {validation.message}
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry & Action Buttons */}
      <div className="flex items-center gap-2.5 ml-auto flex-wrap">
        {/* Live Measurements Readout Badge */}
        {validation.activeMeasurement &&
          validation.vd !== undefined &&
          validation.id !== undefined && (
            <div className="flex items-center gap-2.5 font-mono text-xs rounded border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">
              <span>Vin: {(validation.vin ?? 0).toFixed(1)}V</span>
              <span>•</span>
              <span className="font-bold">V_D: {validation.vd.toFixed(2)}V</span>
              <span>•</span>
              <span className="font-bold">I_D: {validation.id.toFixed(2)}mA</span>
            </div>
          )}

        {/* Record Measurement Trigger */}
        {onRecordMeasurement && (
          <Button
            size="sm"
            onClick={onRecordMeasurement}
            disabled={!canRecord}
            className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            📸 Record Reading
          </Button>
        )}

        {/* Show Me Mode Toggle */}
        <Button
          size="sm"
          variant={showMeActive ? "default" : "outline"}
          onClick={onToggleShowMe}
          className="font-mono text-xs gap-1.5"
        >
          🔍 {showMeActive ? "Hide Highlights" : "Show Me"}
        </Button>

        {/* Graded Hint Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={onShowHint}
          className="font-mono text-xs gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
        >
          💡 Hint {attempts > 0 ? `(${attempts}/${maxAttempts})` : ""}
        </Button>

        {/* Guided Solution Unlock Button */}
        {guidedSolutionUnlocked && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onShowGuidedSolution}
            className="font-mono text-xs gap-1.5 animate-pulse"
          >
            📘 View Guided Solution
          </Button>
        )}
      </div>
    </div>
  );
}
