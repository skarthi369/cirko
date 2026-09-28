import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PrePostTestQuestion } from "@/lib/labs/types";

export type PrePostTestCardProps = {
  type: "pretest" | "posttest";
  title: string;
  description: string;
  questions: PrePostTestQuestion[];
  onComplete: (score: number) => void;
  minPassingScore?: number;
  initialSubmitted?: boolean;
};

export default function PrePostTestCard({
  type,
  title,
  description,
  questions,
  onComplete,
  minPassingScore = 2,
  initialSubmitted = false,
}: PrePostTestCardProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(initialSubmitted);

  const score = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const isPassed = score >= minPassingScore;

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete(score);
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
            {type === "pretest" ? "Phase 1: Knowledge Check" : "Phase 4: Learning Assessment"}
          </span>
          {submitted && (
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                isPassed
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              Score: {score} / {questions.length} ({isPassed ? "PASSED" : "REVIEW & RETRY"})
            </span>
          )}
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">{title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {questions.map((q, idx) => {
          const selected = answers[q.id];
          const isCorrect = selected === q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`rounded-lg border p-4 space-y-3 transition-colors ${
                submitted
                  ? isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-destructive/40 bg-destructive/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-foreground">
                  Q{idx + 1}. {q.question}
                </p>
                {submitted && (
                  <span
                    className={`font-mono text-xs font-bold shrink-0 ${
                      isCorrect ? "text-emerald-500" : "text-destructive"
                    }`}
                  >
                    {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isChecked = selected === optIdx;
                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 rounded border p-2.5 text-xs cursor-pointer transition-colors ${
                        submitted
                          ? optIdx === q.correctAnswer
                            ? "border-emerald-500 bg-emerald-500/15 font-semibold text-foreground"
                            : isChecked
                              ? "border-destructive bg-destructive/15 text-foreground"
                              : "border-border/50 text-muted-foreground opacity-60"
                          : isChecked
                            ? "border-primary bg-primary/10 font-semibold text-primary"
                            : "border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${type}-${q.id}`}
                        checked={isChecked}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        disabled={submitted}
                        className="accent-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>

              {submitted && (
                <div className="rounded bg-muted/60 p-3 text-xs text-muted-foreground border border-border">
                  <p className="font-semibold text-foreground mb-0.5">Scientific Explanation:</p>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Action Controls */}
        <div className="pt-2">
          {submitted ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <p className="font-bold text-sm text-foreground">
                  Your Result: {score} of {questions.length} Correct
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPassed
                    ? "✓ Minimum passing threshold achieved! You may proceed with the experiment."
                    : "Please review the explanations above and retake the assessment to solidify your understanding."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isPassed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetake}
                    className="font-mono text-xs"
                  >
                    🔄 Retake Assessment
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className="w-full font-mono text-xs"
            >
              Submit Assessment Answers ({Object.keys(answers).length}/{questions.length} Answered)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
