import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Observation } from "@/lib/labs/types";

interface AnalysisQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const ANALYSIS_QUESTIONS: AnalysisQuestion[] = [
  {
    id: "q1",
    question: "1. What physical phenomenon describes the optical output behavior below threshold?",
    options: [
      "Coherent laser oscillation with narrow linewidth",
      "Low optical output dominated by spontaneous recombination (LED-like behavior)",
      "Total optical absorption with zero photon emission",
      "Thermal blackbody radiation from the heat sink",
    ],
    correctIndex: 1,
    explanation:
      "Below threshold (I < Ith), optical gain is lower than cavity losses. Recombination is purely spontaneous and emitted photons lack phase coherence, behaving exactly like an LED.",
  },
  {
    id: "q2",
    question: "2. What fundamental condition is achieved at the lasing threshold current (Ith)?",
    options: [
      "Stimulated optical gain overcomes round-trip cavity losses (absorption + mirror transmission)",
      "The diode voltage drops to zero",
      "The semiconductor active layer melts",
      "Electron injection ceases completely",
    ],
    correctIndex: 0,
    explanation:
      "At threshold, optical gain g_th equals cavity absorption loss plus facet transmission loss. The cavity achieves sustained oscillation.",
  },
  {
    id: "q3",
    question: "3. What characterizes optical output power above threshold (I > Ith)?",
    options: [
      "Power saturates and turns off",
      "Power increases rapidly and approximately linearly with injection current",
      "Power fluctuates chaotically with time",
      "Power drops quadratically with current",
    ],
    correctIndex: 1,
    explanation:
      "Above threshold, stimulated emission dominates. The relationship P_opt = P_spon + η·(I - Ith) is approximately linear with a steep slope efficiency η.",
  },
  {
    id: "q4",
    question: "4. Why does optical output increase much more rapidly above threshold than below?",
    options: [
      "Carrier density clamps at N_th; additional injected electron-hole pairs directly convert to stimulated coherent photons",
      "The series resistance of the circuit drops to zero",
      "The ambient temperature drops automatically",
      "The mirrors become 100% reflective",
    ],
    correctIndex: 0,
    explanation:
      "Once threshold is reached, stimulated carrier lifetime drops to picoseconds. Injected carriers cannot increase the carrier density further; they are immediately consumed into stimulated laser photons.",
  },
  {
    id: "q5",
    question: "5. What is the fundamental role of stimulated emission in producing laser light?",
    options: [
      "It produces identical photons sharing the exact same frequency, phase, polarization, and direction",
      "It filters out red wavelengths to produce white light",
      "It cools the semiconductor junction",
      "It eliminates the need for electrical power",
    ],
    correctIndex: 0,
    explanation:
      "Stimulated emission clones the triggering photon, producing identical coherent photons that constructively reinforce within the Fabry-Perot cavity.",
  },
  {
    id: "q6",
    question:
      "6. How does a LASER diode's L-I curve fundamentally differ from a conventional LED's L-I curve?",
    options: [
      "A laser diode exhibits a distinct kink at threshold current with a steep post-threshold slope, whereas an LED shows a continuous smooth curve",
      "An LED only works in reverse bias",
      "A laser diode emits light at zero current",
      "An LED has a higher slope efficiency than a laser diode",
    ],
    correctIndex: 0,
    explanation:
      "LEDs exhibit a continuous, gradual sub-linear L-I relationship without a threshold. Laser diodes have two distinct regimes separated by the threshold inflection point (kink).",
  },
];

interface LaserThresholdIdentificationProps {
  observations: Observation[];
  expectedIth: number;
  onThresholdIdentified: (ith: number) => void;
  onProceedToPosttest: () => void;
}

export default function LaserThresholdIdentification({
  observations,
  expectedIth,
  onThresholdIdentified,
  onProceedToPosttest,
}: LaserThresholdIdentificationProps) {
  // Threshold user input
  const [inputVal, setInputVal] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [thresholdVerified, setThresholdVerified] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [showGuidedSol, setShowGuidedSol] = useState(false);

  // Analysis questions state
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const handleValidateThreshold = () => {
    const val = parseFloat(inputVal.trim());
    if (isNaN(val)) {
      setFeedbackMsg({
        type: "error",
        text: "Please enter a valid numerical value in mA (e.g., 18.0).",
      });
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    // Tolerance ± 1.8 mA around the expected threshold (~18.0 mA)
    const isClose = Math.abs(val - expectedIth) <= 1.8;

    if (isClose) {
      setThresholdVerified(true);
      setFeedbackMsg({
        type: "success",
        text: `✓ Excellent! Your identified threshold current Ith ≈ ${val.toFixed(1)} mA is consistent with the experimental L-I curve knee (~${expectedIth.toFixed(1)} mA).`,
      });
      onThresholdIdentified(val);
    } else {
      if (nextAttempts === 1) {
        setFeedbackMsg({
          type: "error",
          text: "Attempt 1 Hint: Look at your L-I curve where the slope abruptly steepens from ~0.05 mW/mA to ~0.35 mW/mA.",
        });
      } else if (nextAttempts === 2) {
        setFeedbackMsg({
          type: "error",
          text: "Attempt 2 Hint: Look at your observation table: below ~17 mA the optical power is under 1 mW; past 18–20 mA it rises steeply.",
        });
      } else {
        setFeedbackMsg({
          type: "error",
          text: `Attempt 3 Hint: The intersection of the spontaneous emission baseline and the stimulated emission slope marks Ith ≈ ${expectedIth.toFixed(1)} mA.`,
        });
        setShowGuidedSol(true);
      }
    }
  };

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));
  };

  const correctAnswersCount = ANALYSIS_QUESTIONS.filter(
    (q) => answers[q.id] === q.correctIndex,
  ).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
            Interactive Task
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">• Data Interpretation</span>
        </div>
        <h2 className="text-xl font-bold font-mono text-foreground mt-1">
          Threshold Current Identification & Scientific Analysis
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Inspect your experimentally generated L-I characteristic curve, identify the threshold
          inflection point (I_th), and answer the analytical interpretation questions.
        </p>
      </div>

      {/* Part 1: Interactive Threshold Identification Challenge */}
      <Card className="border-border bg-card">
        <CardHeader className="py-3 px-4 bg-sidebar border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono text-xs font-bold text-foreground">
              Task 1: Identify the Approximate Threshold Current (I_th)
            </CardTitle>
            <Badge
              variant={thresholdVerified ? "default" : "secondary"}
              className="font-mono text-[10px]"
            >
              {thresholdVerified ? "✓ Verified" : `Attempts: ${attempts} / 3`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Based on your experimental observations ({observations.length} logged data points),
            enter your estimated value for the <strong>lasing threshold current (I_th)</strong> in
            mA:
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 18.0"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={thresholdVerified}
                className="w-36 font-mono text-sm bg-sidebar"
              />
              <span className="font-mono text-xs font-bold text-muted-foreground">mA</span>
            </div>

            <Button
              onClick={handleValidateThreshold}
              disabled={thresholdVerified || !inputVal.trim()}
              className="font-mono text-xs gap-1.5"
            >
              Check Threshold Value
            </Button>

            {showGuidedSol && (
              <Button
                variant="outline"
                onClick={() => {
                  setInputVal(expectedIth.toFixed(1));
                  setThresholdVerified(true);
                  setFeedbackMsg({
                    type: "info",
                    text: `Guided Solution: Theoretical and empirical threshold for this 650 nm diode at 25°C is ${expectedIth.toFixed(1)} mA.`,
                  });
                  onThresholdIdentified(expectedIth);
                }}
                className="font-mono text-xs text-amber-500 border-amber-500/40 hover:bg-amber-500/10"
              >
                Apply Guided Solution ({expectedIth.toFixed(1)} mA)
              </Button>
            )}
          </div>

          {feedbackMsg && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono leading-relaxed ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : feedbackMsg.type === "info"
                    ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {feedbackMsg.text}
            </div>
          )}

          {/* Graphical Reference Hint */}
          <div className="rounded-lg border border-border bg-sidebar/50 p-3.5 text-xs text-muted-foreground font-mono space-y-1">
            <span className="font-bold text-foreground block text-[11px]">
              How to determine Ith from your L-I curve:
            </span>
            <p className="text-[11px] leading-relaxed">
              1. Draw the tangent line through the sub-threshold spontaneous emission points
              (shallow slope).
              <br />
              2. Draw the tangent line through the post-threshold stimulated emission points (steep
              slope).
              <br />
              3. The intersection point projected onto the horizontal current axis gives the
              threshold current <span className="text-primary font-bold">I_th</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Part 2: Analysis Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Task 2: Laser Diode Scientific Interpretation Questions
            </h3>
            <p className="text-xs text-muted-foreground">
              Interpret your experimental observations to verify conceptual understanding.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {correctAnswersCount} / {ANALYSIS_QUESTIONS.length} Correct
          </Badge>
        </div>

        <div className="space-y-4">
          {ANALYSIS_QUESTIONS.map((q) => {
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
          Threshold: {thresholdVerified ? "✓ Verified" : "Pending"} | Analysis:{" "}
          {correctAnswersCount}/{ANALYSIS_QUESTIONS.length}
        </div>
        <Button
          onClick={onProceedToPosttest}
          disabled={!thresholdVerified}
          className="font-mono text-xs gap-2 bg-primary text-primary-foreground shadow-sm"
        >
          Proceed to Post-Test Assessment →
        </Button>
      </div>
    </div>
  );
}
