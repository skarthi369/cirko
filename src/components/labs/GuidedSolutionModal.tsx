import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LabProcedureStepDef } from "@/lib/labs/types";

export type GuidedSolutionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: LabProcedureStepDef | null;
  onClose: () => void;
};

export default function GuidedSolutionModal({
  open,
  onOpenChange,
  step,
  onClose,
}: GuidedSolutionModalProps) {
  if (!step) return null;
  const sol = step.guidedSolution;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <span>📘 Guided Solution Unlocked</span>
            <span>•</span>
            <span>
              Step {step.stepNumber}: {step.title}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">{sol.title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            3 failed attempts detected. Review the verified laboratory diagram and connections
            below, then apply the fix to your circuit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Schematic Diagram Block */}
          <div className="rounded-lg border border-border bg-canvas p-4 font-mono text-xs text-primary leading-relaxed overflow-x-auto shadow-inner">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              Verified Circuit Schematic
            </p>
            <pre className="text-xs text-foreground font-mono whitespace-pre">
              {sol.diagramText}
            </pre>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5 text-xs text-foreground leading-relaxed">
            <h4 className="font-bold text-primary font-mono uppercase text-[11px]">
              Why this configuration is required:
            </h4>
            <p className="text-muted-foreground">{sol.explanation}</p>
          </div>

          {/* Expected Connection Checklist */}
          {sol.expectedConnections.length > 0 && (
            <div className="rounded border border-border bg-sidebar p-3 space-y-1.5">
              <h4 className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                Connection Checklist:
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {sol.expectedConnections.map((conn, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>{conn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Pitfalls Warning */}
          {sol.commonMistakes.length > 0 && (
            <div className="rounded border border-amber-500/30 bg-amber-500/5 p-3 space-y-1 text-xs">
              <h4 className="font-mono text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                ⚠️ Common Pitfalls to Avoid:
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                {sol.commonMistakes.map((mistake, i) => (
                  <li key={i} className="list-disc list-inside">
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-3">
          <p className="mr-auto text-[11px] text-muted-foreground italic">
            * Note: The system will not automatically build this for you. You must make the
            connections yourself.
          </p>
          <Button onClick={onClose} className="font-mono text-xs">
            I Understand — Let Me Fix It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
