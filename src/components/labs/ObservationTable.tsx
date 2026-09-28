import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Observation } from "@/lib/labs/types";

export type ObservationTableProps = {
  observations: Observation[];
  onDeleteObservation?: (trial: number) => void;
  onClearAll: () => void;
  minRequired?: number;
};

export default function ObservationTable({
  observations,
  onDeleteObservation,
  onClearAll,
  minRequired = 4,
}: ObservationTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Observation Log ({observations.length})
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {observations.length < minRequired
              ? `Collect ${minRequired - observations.length} more reading${
                  minRequired - observations.length > 1 ? "s" : ""
                } for graph plotting`
              : "✓ Minimum sample dataset collected"}
          </p>
        </div>

        {observations.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 font-mono text-[10px] text-destructive hover:bg-destructive/10"
          >
            Clear Log
          </Button>
        )}
      </div>

      {observations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-sidebar/50 p-6 text-center text-xs text-muted-foreground">
          <p className="font-medium text-foreground">No measurements recorded yet.</p>
          <p className="mt-1">
            Turn on the simulation, adjust the supply voltage in the Inspector, and click{" "}
            <strong>📸 Record Reading</strong>.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-sidebar">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 text-[11px] font-mono">Trial</TableHead>
                <TableHead className="h-8 text-[11px] font-mono">Vin (V)</TableHead>
                <TableHead className="h-8 text-[11px] font-mono">V_D (V)</TableHead>
                <TableHead className="h-8 text-[11px] font-mono">I_D (mA)</TableHead>
                {onDeleteObservation && (
                  <TableHead className="h-8 text-[11px] font-mono text-right">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {observations.map((obs) => (
                <TableRow key={obs.trial} className="h-7 text-xs font-mono">
                  <TableCell className="py-1 font-semibold">{obs.trial}</TableCell>
                  <TableCell className="py-1 text-muted-foreground">
                    {obs.batteryVoltage !== undefined ? obs.batteryVoltage.toFixed(2) : "—"}
                  </TableCell>
                  <TableCell className="py-1 font-bold text-primary">
                    {obs.voltage.toFixed(2)}
                  </TableCell>
                  <TableCell className="py-1 font-medium">{obs.current.toFixed(2)}</TableCell>
                  {onDeleteObservation && (
                    <TableCell className="py-1 text-right">
                      <button
                        onClick={() => onDeleteObservation(obs.trial)}
                        className="text-muted-foreground hover:text-destructive text-[11px]"
                        title="Delete reading"
                      >
                        ✕
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
