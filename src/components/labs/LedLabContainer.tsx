import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import Editor from "@/components/circuit/Editor";
import type { Design, PlacedPart } from "@/components/circuit/types";
import type { SimResult } from "@/lib/simulate";
import { validateLedCircuit, type ValidationResult } from "@/lib/labs/ledValidation";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export type Observation = {
  trial: number;
  voltage: number; // V_D (V)
  current: number; // I_D (mA)
  batteryVoltage?: number | undefined;
};

const INITIAL_LAB_DESIGN: Design = {
  name: "LED Characterization Setup",
  parts: [
    { id: "lab-bat", type: "battery", x: 120, y: 200, rotation: 0, props: { voltage: "1.5" } },
    { id: "lab-res", type: "resistor", x: 340, y: 140, rotation: 0, props: { resistance: "220" } },
    { id: "lab-led", type: "led", x: 540, y: 210, rotation: 0, props: { color: "red" } },
  ],
  wires: [
    { id: "lab-w1", from: { partId: "lab-bat", pinId: "pos" }, to: { partId: "lab-res", pinId: "a" }, color: "#ff5d5d" },
    { id: "lab-w2", from: { partId: "lab-res", pinId: "b" }, to: { partId: "lab-led", pinId: "anode" }, color: "#f5a524" },
    { id: "lab-w3", from: { partId: "lab-led", pinId: "cathode" }, to: { partId: "lab-bat", pinId: "neg" }, color: "#1f2933" },
  ],
};

const PRE_TEST_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary purpose of connecting a series resistor with an LED in a circuit?",
    options: [
      "To increase the total voltage delivered to the LED",
      "To limit the forward current and prevent LED burnout",
      "To convert DC voltage into AC voltage",
      "To store energy when the circuit is switched off",
    ],
    answer: 1,
  },
  {
    id: 2,
    question: "What is the typical forward knee voltage (V_k) for a standard red semiconductor LED?",
    options: ["0.2 V", "1.8 V – 2.0 V", "5.0 V", "12.0 V"],
    answer: 1,
  },
  {
    id: 3,
    question: "Under which biasing condition does a Light Emitting Diode conduct current and emit photons?",
    options: ["Reverse Bias", "Forward Bias", "Zero Bias", "Breakdown Bias"],
    answer: 1,
  },
];

const POST_TEST_QUESTIONS = [
  {
    id: 1,
    question: "What happens to the LED current (I_D) when applied voltage is below the knee voltage (V < V_k)?",
    options: [
      "Current rises exponentially",
      "Current remains virtually zero (negligible leakage current)",
      "Current flows in reverse direction",
      "Current reaches maximum power limit",
    ],
    answer: 1,
  },
  {
    id: 2,
    question: "When battery voltage is increased significantly past knee voltage, how do V_D and Resistor voltage behave?",
    options: [
      "V_D stays relatively constant near ~1.8V-2V while the resistor absorbs the extra voltage",
      "V_D increases linearly to match battery voltage",
      "Resistor voltage stays at zero",
      "V_D drops to zero",
    ],
    answer: 0,
  },
  {
    id: 3,
    question: "The inverse slope (ΔV / ΔI) of the V-I curve above knee voltage represents:",
    options: [
      "Dynamic forward resistance (r_f) of the LED",
      "Capacitance of the depletion layer",
      "Inductance of the wire lead",
      "Reverse breakdown resistance",
    ],
    answer: 0,
  },
];

export default function LedLabContainer() {
  const [activeTab, setActiveTab] = useState("experiment");
  const [design, setDesign] = useState<Design>(INITIAL_LAB_DESIGN);
  const [sim, setSim] = useState<SimResult | null>(null);
  const [observations, setObservations] = useState<Observation[]>(() => {
    try {
      const raw = localStorage.getItem("cirkit.lab.led.observations.v1");
      return raw ? (JSON.parse(raw) as Observation[]) : [];
    } catch {
      return [];
    }
  });

  const [preAnswers, setPreAnswers] = useState<Record<number, number>>({});
  const [preSubmitted, setPreSubmitted] = useState(false);
  const [postAnswers, setPostAnswers] = useState<Record<number, number>>({});
  const [postSubmitted, setPostSubmitted] = useState(false);
  const [theoryRead, setTheoryRead] = useState(false);

  // Persistence for observations
  useEffect(() => {
    try {
      localStorage.setItem("cirkit.lab.led.observations.v1", JSON.stringify(observations));
    } catch {
      /* ignore */
    }
  }, [observations]);

  // Validation
  const validation: ValidationResult = useMemo(() => {
    return validateLedCircuit(design, sim);
  }, [design, sim]);

  // Handle design change callback from Editor
  const handleDesignChange = (newDesign: Design, newSim: SimResult | null) => {
    setDesign(newDesign);
    setSim(newSim);
  };

  // Record trial
  const recordTrial = () => {
    if (!validation.valid || validation.vd === undefined || validation.id === undefined) return;
    const bat = validation.battery;
    const batV = bat ? parseFloat(bat.props['voltage'] ?? "1.5") : undefined;

    const newObs: Observation = {
      trial: observations.length + 1,
      voltage: Number(validation.vd.toFixed(3)),
      current: Number(validation.id.toFixed(3)),
      batteryVoltage: batV,
    };

    setObservations((prev) => [...prev, newObs]);
  };

  // Clear observations
  const clearObservations = () => {
    setObservations([]);
  };

  // Scores
  const preScore = useMemo(() => {
    if (!preSubmitted) return 0;
    return PRE_TEST_QUESTIONS.filter((q) => preAnswers[q.id] === q.answer).length;
  }, [preAnswers, preSubmitted]);

  const postScore = useMemo(() => {
    if (!postSubmitted) return 0;
    return POST_TEST_QUESTIONS.filter((q) => postAnswers[q.id] === q.answer).length;
  }, [postAnswers, postSubmitted]);

  // Calculate Progress %
  const progressPercent = useMemo(() => {
    let p = 0;
    if (theoryRead) p += 15;
    if (preSubmitted && preScore >= 2) p += 20;
    if (validation.valid) p += 20;
    if (observations.length >= 3) p += 20;
    if (postSubmitted && postScore >= 2) p += 25;
    return Math.min(100, p);
  }, [theoryRead, preSubmitted, preScore, validation.valid, observations.length, postSubmitted, postScore]);

  // Dynamic analysis calculations
  const analysis = useMemo(() => {
    if (observations.length < 2) return null;
    const sorted = [...observations].sort((a, b) => a.voltage - b.voltage);
    const minV = sorted[0]!.voltage;
    const maxV = sorted[sorted.length - 1]!.voltage;
    const maxI = sorted[sorted.length - 1]!.current;
    
    // Estimate knee voltage V_k (first point where current exceeds 0.5 mA)
    const kneeObs = sorted.find((o) => o.current > 0.5);
    const vk = kneeObs ? kneeObs.voltage : 1.8;

    // Estimate forward resistance Rf = delta V / delta I above knee
    const highPts = sorted.filter((o) => o.current > 1.0);
    let rf = 0;
    if (highPts.length >= 2) {
      const p1 = highPts[0]!;
      const p2 = highPts[highPts.length - 1]!;
      const dV = p2.voltage - p1.voltage;
      const dI = (p2.current - p1.current) / 1000; // convert mA to A
      if (dI > 0) rf = dV / dI;
    }

    return { minV, maxV, maxI, vk, rf };
  }, [observations]);

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4">
        <div className="flex items-center gap-3">
          <Link
            to={"/labs" as any}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            ← Back to Labs
          </Link>
          <span className="text-border">|</span>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-tight">
              Optical Communication: Characterization of LED
            </h1>
            <p className="text-[11px] text-muted-foreground">Experiment 1 of 3 · V-I Characteristics Study</p>
          </div>
        </div>

        {/* Progress & Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-medium text-muted-foreground">Progress:</span>
            <div className="w-32">
              <Progress value={progressPercent} className="h-2" />
            </div>
            <span className="font-mono text-xs font-bold text-primary">{progressPercent}%</span>
          </div>

          {progressPercent === 100 ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">✓ Completed</Badge>
          ) : (
            <Badge variant="outline" className="font-mono text-xs">
              In Progress
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border bg-card px-4">
            <TabsList className="h-10 bg-transparent p-0 gap-2">
              <TabsTrigger value="aim" onClick={() => setTheoryRead(true)}>
                📖 Aim & Theory
              </TabsTrigger>
              <TabsTrigger value="pretest">❓ Pre-Test</TabsTrigger>
              <TabsTrigger value="experiment">🔬 Virtual Experiment</TabsTrigger>
              <TabsTrigger value="graph">📈 V-I Graph ({observations.length})</TabsTrigger>
              <TabsTrigger value="posttest">📝 Post-Test</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: AIM & THEORY */}
          <TabsContent value="aim" className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Aim of the Experiment</CardTitle>
                  <CardDescription>
                    To study and plot the Voltage-Current (V-I) forward bias characteristics of a Light Emitting Diode (LED) and determine its forward knee voltage (V_k) and dynamic resistance (R_f).
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Theory & Working Principle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    A Light Emitting Diode (LED) is a heavily doped P-N semiconductor junction diode operating under <strong>forward bias</strong>. When a sufficient forward voltage (V_D &gt; V_k) is applied, free electrons from the N-region cross the junction and recombine with holes in the P-region, emitting light photons.
                  </p>
                  <div className="rounded-md border border-border bg-muted/30 p-4 font-mono text-xs text-foreground">
                    <p className="font-bold">Key Electronic Equations:</p>
                    <p className="mt-1">
                      1. Diode Current: I_D = I_S * (e^(q*V_D / n*k*T) - 1)
                    </p>
                    <p className="mt-1">
                      2. Series Resistor Constraint: V_bat = V_D + I_D * R_series
                    </p>
                  </div>
                  <p>
                    <strong>Knee Voltage (V_k):</strong> Below the knee voltage (V_D &lt; V_k), negligible forward current flows. Once V_D reaches V_k (~1.8 V for Red LED), forward current rises exponentially.
                  </p>
                  <p>
                    <strong>Role of Series Resistor (R_series):</strong> Because an LED has very low dynamic resistance once turned on, connecting an un-limited voltage source directly across it will cause destructive over-current (I_D &gt; 40 mA). A series resistor (220 Ω) absorbs the surplus voltage and limits current to safe operating levels.
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("pretest")}>Proceed to Pre-Test →</Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: PRE-TEST */}
          <TabsContent value="pretest" className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Pre-Experiment Knowledge Assessment</CardTitle>
                  <CardDescription>
                    Answer the following questions to verify your theoretical understanding before starting the experiment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {PRE_TEST_QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="rounded-lg border border-border p-4 space-y-3 bg-card">
                      <p className="font-medium text-sm">
                        Q{idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 rounded border p-2.5 text-xs cursor-pointer transition-colors ${
                              preAnswers[q.id] === optIdx
                                ? "border-primary bg-primary/10 font-medium"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`pre-${q.id}`}
                              checked={preAnswers[q.id] === optIdx}
                              onChange={() => setPreAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              disabled={preSubmitted}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {preSubmitted ? (
                    <div className="flex items-center justify-between rounded bg-muted p-4">
                      <div>
                        <p className="font-bold text-sm">
                          Your Score: {preScore} / {PRE_TEST_QUESTIONS.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {preScore >= 2
                            ? "✓ Excellent! Pre-test passed. You can now proceed to the experiment."
                            : "Review the theory and try again."}
                        </p>
                      </div>
                      <Button onClick={() => setActiveTab("experiment")}>Go to Virtual Experiment →</Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setPreSubmitted(true)}
                      disabled={Object.keys(preAnswers).length < PRE_TEST_QUESTIONS.length}
                      className="w-full"
                    >
                      Submit Pre-Test Answers
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: VIRTUAL EXPERIMENT */}
          <TabsContent value="experiment" className="min-h-0 flex-1">
            <div className="flex h-full w-full flex-col">
              {/* Lab Guidance & Controls Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-4 py-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-primary">Status:</span>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      validation.valid ? "text-emerald-500" : "text-amber-500"
                    }`}
                  >
                    {validation.message}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {validation.valid && validation.vd !== undefined && validation.id !== undefined && (
                    <div className="flex items-center gap-3 font-mono text-xs rounded border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                      <span>V_D = {validation.vd.toFixed(2)} V</span>
                      <span>I_D = {validation.id.toFixed(2)} mA</span>
                    </div>
                  )}

                  <Button
                    size="sm"
                    onClick={recordTrial}
                    disabled={!validation.valid || validation.vd === undefined}
                    className="font-mono text-xs"
                  >
                    📸 Record Measurement
                  </Button>
                </div>
              </div>

              {/* Main Content Layout: Editor (Left) + Observations Panel (Right) */}
              <div className="flex min-h-0 flex-1">
                {/* Simulator Canvas Embed */}
                <div className="min-h-0 flex-1">
                  <Editor
                    storageKey="cirkit.lab.led.v1"
                    initialDesign={INITIAL_LAB_DESIGN}
                    onDesignChange={handleDesignChange}
                  />
                </div>

                {/* Live Observations Panel */}
                <aside className="w-80 shrink-0 overflow-y-auto border-l border-border bg-sidebar p-4 space-y-4">
                  <div>
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Student Instructions
                    </h3>
                    <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside leading-relaxed">
                      <li>Ensure Battery, 220Ω Resistor, and Red LED are placed on canvas.</li>
                      <li>Wire Battery (+) → Resistor → LED Anode (A).</li>
                      <li>Wire LED Cathode (K) → Battery (-).</li>
                      <li>Click <strong>Start simulation</strong> in toolbar.</li>
                      <li>Select Battery and adjust Voltage (e.g. 0.5V, 1.0V, 1.5V, 2.0V, 3.0V, 5.0V).</li>
                      <li>Click <strong>Record Measurement</strong> to save trials.</li>
                    </ol>
                  </div>

                  <hr className="border-border" />

                  {/* Observations Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Observations ({observations.length})
                      </h3>
                      {observations.length > 0 && (
                        <button
                          onClick={clearObservations}
                          className="font-mono text-[10px] text-destructive hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {observations.length === 0 ? (
                      <div className="rounded border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                        No trials recorded yet. Adjust voltage and click Record Measurement above.
                      </div>
                    ) : (
                      <div className="rounded border border-border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="h-8 text-[11px] font-mono">#</TableHead>
                              <TableHead className="h-8 text-[11px] font-mono">V_D (V)</TableHead>
                              <TableHead className="h-8 text-[11px] font-mono">I_D (mA)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {observations.map((obs) => (
                              <TableRow key={obs.trial} className="h-7 text-xs font-mono">
                                <TableCell className="py-1">{obs.trial}</TableCell>
                                <TableCell className="py-1 font-semibold text-primary">
                                  {obs.voltage.toFixed(2)}
                                </TableCell>
                                <TableCell className="py-1">{obs.current.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  {observations.length >= 3 && (
                    <Button onClick={() => setActiveTab("graph")} className="w-full text-xs">
                      View V-I Graph →
                    </Button>
                  )}
                </aside>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: V-I GRAPH */}
          <TabsContent value="graph" className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Forward Bias V-I Characteristic Curve</CardTitle>
                  <CardDescription>
                    Plot generated directly from your recorded experimental trial observations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {observations.length === 0 ? (
                    <Alert variant="destructive">
                      <AlertTitle>No Data Recorded</AlertTitle>
                      <AlertDescription>
                        Please complete trials in the Virtual Experiment tab first to generate the plot.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="h-80 w-full rounded border border-border bg-card p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={[...observations].sort((a, b) => a.voltage - b.voltage)}
                            margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                              dataKey="voltage"
                              type="number"
                              unit=" V"
                              domain={[0, "auto"]}
                              label={{ value: "LED Voltage V_D (V)", position: "bottom", offset: 0 }}
                            />
                            <YAxis
                              dataKey="current"
                              type="number"
                              unit=" mA"
                              domain={[0, "auto"]}
                              label={{ value: "LED Current I_D (mA)", angle: -90, position: "left" }}
                            />
                            <Tooltip
                              formatter={(value: any, name: any) => [
                                `${Number(value).toFixed(2)} ${name === "current" ? "mA" : "V"}`,
                                name === "current" ? "LED Current I_D" : "LED Voltage V_D",
                              ]}
                              labelFormatter={(lbl) => `LED Voltage: ${lbl} V`}
                            />
                            <Line
                              type="monotone"
                              dataKey="current"
                              stroke="var(--primary)"
                              strokeWidth={2.5}
                              dot={{ r: 5, fill: "var(--primary)" }}
                              activeDot={{ r: 8 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Experimental Analysis */}
                      {analysis && (
                        <div className="rounded border border-border bg-muted/20 p-4 space-y-2 font-mono text-xs">
                          <p className="font-bold text-sm text-foreground">Experimental Data Analysis:</p>
                          <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                            <p>• Observed Knee Voltage (V_k): <span className="text-foreground font-semibold">{analysis.vk.toFixed(2)} V</span></p>
                            <p>• Max Recorded Current (I_max): <span className="text-foreground font-semibold">{analysis.maxI.toFixed(2)} mA</span></p>
                            <p>• Dynamic Forward Resistance (R_f): <span className="text-foreground font-semibold">{analysis.rf > 0 ? `${analysis.rf.toFixed(1)} Ω` : "N/A"}</span></p>
                            <p>• Voltage Sweep Range: <span className="text-foreground font-semibold">{analysis.minV.toFixed(2)} V – {analysis.maxV.toFixed(2)} V</span></p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={() => setActiveTab("posttest")}>Proceed to Post-Test →</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 5: POST-TEST */}
          <TabsContent value="posttest" className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Post-Experiment Assessment</CardTitle>
                  <CardDescription>
                    Test your understanding of the experimental observations and V-I characteristic curve.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {POST_TEST_QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="rounded-lg border border-border p-4 space-y-3 bg-card">
                      <p className="font-medium text-sm">
                        Q{idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 rounded border p-2.5 text-xs cursor-pointer transition-colors ${
                              postAnswers[q.id] === optIdx
                                ? "border-primary bg-primary/10 font-medium"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`post-${q.id}`}
                              checked={postAnswers[q.id] === optIdx}
                              onChange={() => setPostAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              disabled={postSubmitted}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {postSubmitted ? (
                    <div className="flex items-center justify-between rounded bg-emerald-500/10 border border-emerald-500/30 p-4">
                      <div>
                        <p className="font-bold text-sm text-emerald-500">
                          Final Score: {postScore} / {POST_TEST_QUESTIONS.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {postScore >= 2
                            ? "🎉 Congratulations! You have successfully completed the Characterization of LED Virtual Lab."
                            : "Review your experiment data and try again."}
                        </p>
                      </div>
                      <Link to={"/labs" as any}>
                        <Button variant="default">Back to All Virtual Labs</Button>
                      </Link>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setPostSubmitted(true)}
                      disabled={Object.keys(postAnswers).length < POST_TEST_QUESTIONS.length}
                      className="w-full"
                    >
                      Submit Post-Test Answers
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
