import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Observation } from "@/lib/labs/types";

interface FiberResultSummaryProps {
  observations: Observation[];
  preTestScore: number | null;
  postTestScore: number | null;
  onOpenCertificate: () => void;
}

export default function FiberResultSummary({
  observations,
  preTestScore,
  postTestScore,
  onOpenCertificate,
}: FiberResultSummaryProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 p-6 text-center shadow-sm space-y-3">
        <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-3xl shadow-inner">
          🎓
        </div>
        <h2 className="text-2xl font-bold font-mono text-foreground tracking-tight">
          Optical Fiber Intensity Modulation Lab Complete!
        </h2>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          You have successfully configured the optical transmitter, modulated the semiconductor
          laser, transmitted information through the optical fiber waveguide, and recovered the
          analog signal at the photodetector receiver.
        </p>

        <div className="pt-2">
          <Button
            onClick={onOpenCertificate}
            className="font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md px-5 py-2.5"
          >
            🏆 View & Claim Lab Completion Certificate
          </Button>
        </div>
      </div>

      {/* Verified Milestones Checklist */}
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
              <span className="text-foreground">Information Signal Source Configured</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">
                Laser DC Pre-Biasing (I_bias &gt; Ith) Verified
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">Optical Fiber TIR Waveguide Connected</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">Photodetector & Amplifier Configured</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">Dual-Trace Oscilloscope Probing Active</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">
                {observations.length} Experimental Observations Logged
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">
                Input vs. Output Waveform & Linearity Analyzed
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>✓</span>
              <span className="text-foreground">
                Prerequisite & Post-Test Assessments Passed ({preTestScore ?? 5}/5,{" "}
                {postTestScore ?? 5}/5)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observed Physical Relationships Summary */}
      <Card className="border-border bg-card">
        <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
          <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            Scientific Principles & Experimental Findings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4 text-xs leading-relaxed text-muted-foreground font-mono">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">1. Linear Intensity Modulation:</span>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/40">
                Transmitter Principle
              </Badge>
            </div>
            <p>
              By pre-biasing the laser diode at I_bias = 25 mA (well above Ith = 18 mA), the
              operating point is centered in the linear stimulated emission region. The emitted
              optical power envelope mirrors the electrical modulating voltage without lower-half
              waveform clipping.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">2. Optical Waveguide Attenuation:</span>
              <Badge
                variant="outline"
                className="text-[10px] text-emerald-400 border-emerald-500/40"
              >
                Channel Principle
              </Badge>
            </div>
            <p>
              Light confined by total internal reflection within the plastic optical fiber core
              suffers attenuation according to Beer-Lambert's law: P(L) = P(0) · 10^(-αL/10).
              Plotted in decibels, attenuation increases linearly with distance at α ≈ 0.03 dB/m.
            </p>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-500">
                3. Photodetection & Direct Signal Recovery:
              </span>
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/40">
                Receiver Principle
              </Badge>
            </div>
            <p>
              The phototransistor absorbs received optical photons and produces collector current
              I_det = β · R · P_rec. Passing through load resistor R_load and AC-coupling delivers a
              clean voltage waveform v_out(t) matching the shape and frequency of the input tone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
