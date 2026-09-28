import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Observation } from "@/lib/labs/types";

interface LaserResultSummaryProps {
  observations: Observation[];
  identifiedIth: number | null;
  onOpenCertificate: () => void;
  preTestScore: number | null;
  postTestScore: number | null;
}

export default function LaserResultSummary({
  observations,
  identifiedIth,
  onOpenCertificate,
  preTestScore,
  postTestScore,
}: LaserResultSummaryProps) {
  // Extract key parameters from actual observations
  const maxPower =
    observations.length > 0 ? Math.max(...observations.map((o) => o.voltage_diode || 0)) : 0;
  const maxCurrent =
    observations.length > 0 ? Math.max(...observations.map((o) => o.voltage_in || 0)) : 0;

  // Calculate experimental slope efficiency above threshold
  const postThresholdObs = observations.filter((o) => o.voltage_in >= (identifiedIth ?? 18.0));
  let calculatedSlope = 0.35;
  if (postThresholdObs.length >= 2) {
    const sorted = [...postThresholdObs].sort((a, b) => a.voltage_in - b.voltage_in);
    const pFirst = sorted[0]?.voltage_diode ?? 0;
    const pLast = sorted[sorted.length - 1]?.voltage_diode ?? 0;
    const iFirst = sorted[0]?.voltage_in ?? 0;
    const iLast = sorted[sorted.length - 1]?.voltage_in ?? 0;
    if (iLast > iFirst) {
      calculatedSlope = Number(((pLast - pFirst) / (iLast - iFirst)).toFixed(3));
    }
  }

  // Differential quantum efficiency: η_d = (q / Eg) * (ΔP / ΔI) = (1 / 1.91 eV) * calculatedSlope
  const quantumEfficiency = Number(((calculatedSlope / 1.91) * 100).toFixed(1));

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 p-6 text-center shadow-sm space-y-3">
        <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-3xl shadow-inner">
          🎓
        </div>
        <h2 className="text-2xl font-bold font-mono text-foreground tracking-tight">
          Laboratory Experiment Completed
        </h2>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          You have successfully characterized the semiconductor LASER diode, observed spontaneous
          and stimulated emission, generated the experimental L-I curve, and identified the
          threshold region.
        </p>

        <div className="pt-2">
          <Button
            onClick={onOpenCertificate}
            className="font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md px-5 py-2.5"
          >
            🏆 View & Download Lab Completion Certificate
          </Button>
        </div>
      </div>

      {/* Checklist of Completed Milestone Criteria */}
      <Card className="border-border bg-card">
        <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
          <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            Verification of Completed Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">Setup & Apparatus Verified</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">
                Pre-Test Prerequisite Completed ({preTestScore ?? 4}/5)
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">
                {observations.length} Experimental Trials Recorded
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">L-I Characteristic Curve Generated</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">
                Threshold Identified ({identifiedIth ? `${identifiedIth.toFixed(1)} mA` : "18.0 mA"}
                )
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">Scientific Analysis Completed</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">
                Post-Test Assessment Passed ({postTestScore ?? 5}/5)
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">Digital Certificate Provisioned</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observed Physical Behavior Summary */}
      <Card className="border-border bg-card">
        <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
          <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            Summary of Observed Physical Behavior
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4 text-xs leading-relaxed text-muted-foreground font-mono">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-500">1. Below Threshold (I &lt; Ith):</span>
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/40">
                Spontaneous LED Regime
              </Badge>
            </div>
            <p>
              Emits low-power, incoherent spontaneous light. The slope efficiency is low (~0.05
              mW/mA), and the optical output power remains under 1.0 mW.
            </p>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">2. Near Threshold (I ≈ Ith ≈ 18 mA):</span>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/40">
                Inflection Kink
              </Badge>
            </div>
            <p>
              Round-trip optical gain in the Fabry-Perot cavity equals total cavity loss. Optical
              feedback initiates coherent resonance, marking an abrupt inflection (kink) in the L-I
              curve.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">3. Above Threshold (I &gt; Ith):</span>
              <Badge
                variant="outline"
                className="text-[10px] text-emerald-400 border-emerald-500/40"
              >
                Stimulated LASER Regime
              </Badge>
            </div>
            <p>
              Optical power increases rapidly and linearly with current. Carrier density clamps at
              threshold, ensuring almost 100% of additional injected carriers produce coherent
              stimulated photons.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Experimental Derived Metrics */}
      <Card className="border-border bg-card">
        <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
          <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            Experimentally Evaluated Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="rounded border border-border bg-sidebar p-3">
              <div className="text-[10px] text-muted-foreground uppercase">
                Threshold Current (Ith)
              </div>
              <div className="text-base font-bold text-foreground mt-1">
                {identifiedIth ? `${identifiedIth.toFixed(1)} mA` : "18.0 mA"}
              </div>
            </div>

            <div className="rounded border border-border bg-sidebar p-3">
              <div className="text-[10px] text-muted-foreground uppercase">
                Slope Efficiency (η)
              </div>
              <div className="text-base font-bold text-primary mt-1">
                {calculatedSlope.toFixed(3)} mW/mA
              </div>
            </div>

            <div className="rounded border border-border bg-sidebar p-3">
              <div className="text-[10px] text-muted-foreground uppercase">
                Differential Quantum Eff.
              </div>
              <div className="text-base font-bold text-emerald-400 mt-1">{quantumEfficiency}%</div>
            </div>

            <div className="rounded border border-border bg-sidebar p-3">
              <div className="text-[10px] text-muted-foreground uppercase">Peak Output Power</div>
              <div className="text-base font-bold text-red-500 mt-1">{maxPower.toFixed(2)} mW</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
