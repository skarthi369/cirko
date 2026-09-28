import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Observation } from "@/lib/labs/types";

interface AnalysisQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const FIBER_ANALYSIS_QUESTIONS: AnalysisQuestion[] = [
  {
    id: "q1",
    question:
      "1. What happens when the input information signal amplitude (Vin) increases within the linear range?",
    options: [
      "The optical intensity modulation depth increases, producing a proportionally larger recovered output voltage (Vout)",
      "The optical fiber changes from plastic to silica glass",
      "The laser diode turns off completely",
      "The photodetector responsivity drops to zero",
    ],
    correctIndex: 0,
    explanation:
      "Within the linear dynamic range, optical modulation depth m is proportional to Vin. Higher modulation swing yields larger optical swings and thus a proportionally higher recovered electrical output.",
  },
  {
    id: "q2",
    question: "2. How does the optical source intensity respond to the input modulating current?",
    options: [
      "Optical intensity varies linearly with current above threshold (P = η · [I - Ith]), cloning the modulating AC waveform onto the optical carrier",
      "Optical intensity remains strictly constant regardless of input current",
      "Optical intensity oscillates only at microwave frequencies",
      "Optical intensity drops as current increases",
    ],
    correctIndex: 0,
    explanation:
      "Above the threshold current Ith, the laser diode exhibits a linear L-I relationship with slope efficiency η, allowing the optical intensity envelope to mirror the modulating drive current.",
  },
  {
    id: "q3",
    question: "3. What happens to the optical signal after transmission through an optical fiber?",
    options: [
      "Optical power attenuates exponentially according to P(L) = P(0) · 10^(-αL/10) and incurs a propagation delay τ = L/v",
      "The optical signal doubles in amplitude without any loss",
      "The frequency of the light wave shifts to X-rays",
      "The signal turns into an electrical current inside the glass",
    ],
    correctIndex: 0,
    explanation:
      "As photons propagate along the core, Rayleigh scattering and material absorption cause exponential attenuation governed by α (dB/m). Fiber transit also introduces a time delay proportional to length.",
  },
  {
    id: "q4",
    question:
      "4. What does the photodetector (phototransistor) produce upon receiving light from the fiber?",
    options: [
      "An electrical photocurrent (I_det = β · R · P_rec) proportional to the instantaneous optical power received",
      "A constant DC high-voltage spark",
      "A magnetic field that repels the fiber",
      "A sound wave vibrating at 10 kHz",
    ],
    correctIndex: 0,
    explanation:
      "The photodetector acts as a square-law optical-to-electrical converter: absorbed photon flux generates an electrical collector current directly proportional to received optical power.",
  },
  {
    id: "q5",
    question:
      "5. How does the receiver output voltage (Vout) relate to the received optical light intensity?",
    options: [
      "Vout is directly proportional to received optical intensity through the load resistor (V = I_det · R_load)",
      "Vout is inversely proportional to light intensity",
      "Vout is independent of optical light intensity",
      "Vout is always exactly 5.0 Volts DC",
    ],
    correctIndex: 0,
    explanation:
      "Photocurrent flowing through the series load resistor produces an ohmic voltage drop (V = I_det · R_load). Thus output voltage is a faithful linear representation of received optical power.",
  },
  {
    id: "q6",
    question:
      "6. How does increasing optical fiber length and attenuation affect the recovered output signal?",
    options: [
      "It reduces received optical power and consequently shrinks the recovered output signal amplitude in decibels (Loss = α · L)",
      "It increases the audio pitch (frequency) of the signal",
      "It makes the recovered signal louder without limit",
      "It converts the analog sine wave into a digital square wave",
    ],
    correctIndex: 0,
    explanation:
      "Because fiber loss scales linearly in dB with length (A = α · L), longer fibers deliver lower optical flux to the detector, attenuating the recovered voltage amplitude by the exact same decibel factor.",
  },
  {
    id: "q7",
    question:
      "7. How closely does the recovered signal on Channel 2 follow the transmitted input signal on Channel 1?",
    options: [
      "With proper DC pre-biasing above Ith, Channel 2 faithfully reproduces the frequency, waveshape, and phase of Channel 1 with negligible harmonic distortion",
      "Channel 2 is completely random and shares no relationship with Channel 1",
      "Channel 2 only reproduces the positive half of the wave and destroys the negative half",
      "Channel 2 inverts the frequency by 180 degrees",
    ],
    correctIndex: 0,
    explanation:
      "When the laser is biased in its linear stimulated regime (I_bias > Ith) and modulation index m ≤ 1.0, the end-to-end electro-optical link acts as a linear transmission system with high signal fidelity.",
  },
];

interface FiberAnalysisSectionProps {
  observations: Observation[];
  onProceedToPosttest: () => void;
}

export default function FiberAnalysisSection({
  observations,
  onProceedToPosttest,
}: FiberAnalysisSectionProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));
  };

  const correctAnswersCount = FIBER_ANALYSIS_QUESTIONS.filter(
    (q) => answers[q.id] === q.correctIndex,
  ).length;

  const allAnswered = Object.keys(answers).length >= FIBER_ANALYSIS_QUESTIONS.length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
            Phase 8 • Analysis & Evaluation
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            • Signal Path Interpretation
          </span>
        </div>
        <h2 className="text-xl font-bold font-mono text-foreground mt-1">
          Intensity Modulation Link Scientific Analysis
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Evaluate the experimental behavior of the complete communication path: transmitter
          modulation, fiber waveguide attenuation, photodetector responsivity, and recovered signal
          fidelity.
        </p>
      </div>

      {/* Experimental Summary Card */}
      <Card className="border-border bg-card">
        <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
          <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            Experimental Observation Dataset Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="rounded border border-border bg-sidebar/50 p-2.5">
              <span className="text-[10px] text-muted-foreground block">Recorded Trials</span>
              <span className="text-base font-bold text-foreground">{observations.length}</span>
            </div>
            <div className="rounded border border-border bg-sidebar/50 p-2.5">
              <span className="text-[10px] text-muted-foreground block">Modulation Freq Range</span>
              <span className="text-base font-bold text-primary">1.0 – 50 kHz</span>
            </div>
            <div className="rounded border border-border bg-sidebar/50 p-2.5">
              <span className="text-[10px] text-muted-foreground block">Fiber Link Lengths</span>
              <span className="text-base font-bold text-emerald-400">1 m – 1000 m</span>
            </div>
            <div className="rounded border border-border bg-sidebar/50 p-2.5">
              <span className="text-[10px] text-muted-foreground block">Signal Fidelity</span>
              <span className="text-base font-bold text-amber-400">High Linearity</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7 Core Analysis Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            Scientific Analysis Questions ({correctAnswersCount} / {FIBER_ANALYSIS_QUESTIONS.length}{" "}
            Correct)
          </h3>
          <Badge variant="outline" className="font-mono text-xs">
            {correctAnswersCount === FIBER_ANALYSIS_QUESTIONS.length ? "✓ Complete" : "Pending"}
          </Badge>
        </div>

        <div className="space-y-4">
          {FIBER_ANALYSIS_QUESTIONS.map((q) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCorrect = answers[q.id] === q.correctIndex;

            return (
              <Card key={q.id} className="border-border bg-card">
                <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-mono text-xs font-semibold text-foreground">
                      {q.question}
                    </CardTitle>
                    {isAnswered && (
                      <Badge
                        variant={isCorrect ? "default" : "destructive"}
                        className="font-mono text-[10px]"
                      >
                        {isCorrect ? "✓ Correct" : "✗ Review"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      let btnVariant: "default" | "outline" = "outline";
                      let customClass =
                        "text-left text-xs font-mono h-auto py-2.5 px-3 justify-start leading-relaxed whitespace-normal";

                      if (revealed[q.id]) {
                        if (optIdx === q.correctIndex) {
                          customClass += " bg-emerald-600/90 text-white border-emerald-500";
                        } else if (isSelected) {
                          customClass += " bg-rose-600/90 text-white border-rose-500";
                        }
                      } else if (isSelected) {
                        btnVariant = "default";
                      }

                      return (
                        <Button
                          key={optIdx}
                          variant={btnVariant}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={customClass}
                        >
                          <span className="font-bold mr-2 shrink-0">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </Button>
                      );
                    })}
                  </div>

                  {revealed[q.id] && (
                    <div className="rounded border border-border bg-sidebar p-3 text-[11px] font-mono leading-relaxed text-muted-foreground">
                      {isCorrect ? (
                        <span className="text-emerald-400 font-bold">✓ Correct! </span>
                      ) : (
                        <span className="text-rose-400 font-bold">✗ Incorrect. </span>
                      )}
                      {q.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground font-mono">
          Analysis Status: {correctAnswersCount}/{FIBER_ANALYSIS_QUESTIONS.length} Answered
        </div>
        <Button
          onClick={onProceedToPosttest}
          disabled={!allAnswered}
          className="font-mono text-xs gap-2 bg-primary text-primary-foreground shadow-sm"
        >
          Proceed to Comprehensive Post-Test →
        </Button>
      </div>
    </div>
  );
}
