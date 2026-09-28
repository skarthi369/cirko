import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export type SamplingSubExpType = "nyquist" | "antialiasing" | "reconstruction" | "dft" | "spectral";

interface SamplingSubExperimentsProps {
  currentMode: SamplingSubExpType;
  onSelectMode: (mode: SamplingSubExpType) => void;
  messageFreq_kHz: number;
  samplingFreq_kHz: number;
}

export default function SamplingSubExperiments({
  currentMode,
  onSelectMode,
  messageFreq_kHz,
  samplingFreq_kHz,
}: SamplingSubExperimentsProps) {
  // Sub-Exp B: Anti-aliasing filter
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [interferingFreq_kHz, setInterferingFreq_kHz] = useState(3.4);

  // Sub-Exp C: Reconstruction
  const [reconMethod, setReconMethod] = useState<"zoh" | "foh" | "ideal">("zoh");
  const [delay_us, setDelay_us] = useState(25);

  // Sub-Exp D: DFT
  const [dftN, setDftN] = useState<16 | 32>(16);
  const [zeroPadding, setZeroPadding] = useState<1 | 2 | 4>(1);

  // Sub-Exp E: Windowing
  const [windowType, setWindowType] = useState<"rect" | "hanning" | "hamming" | "blackman">("rect");

  // Sub-Exp B Math
  const antialiasMetrics = useMemo(() => {
    const fs = Math.max(1.0, samplingFreq_kHz);
    const f1 = messageFreq_kHz;
    const f2 = interferingFreq_kHz;
    const f1Alias = fs < 2 * f1 ? Math.abs(fs - f1) : 0;
    const f2Alias = fs < 2 * f2 ? Math.abs(fs - f2) : 0;
    const f2Atten_dB = filterEnabled ? -24.5 : 0;
    const f2OutAmp = filterEnabled ? 0.06 : 0.65;

    return {
      f1,
      f2,
      f1Alias,
      f2Alias: Number(f2Alias.toFixed(2)),
      f2Atten_dB,
      f2OutAmp,
      filterActive: filterEnabled,
    };
  }, [messageFreq_kHz, interferingFreq_kHz, samplingFreq_kHz, filterEnabled]);

  // Sub-Exp C Math: MSE calculation
  const reconMetrics = useMemo(() => {
    const fs = samplingFreq_kHz;
    const fm = messageFreq_kHz;
    // Samples per cycle
    const spc = Math.max(1, fs / fm);
    let mse = 0;
    if (reconMethod === "zoh") {
      mse = 0.5 * Math.pow(Math.PI / spc, 2);
    } else if (reconMethod === "foh") {
      mse = 0.12 * Math.pow(Math.PI / spc, 4);
    } else {
      mse = fs >= 2 * fm ? 0.001 : 0.35;
    }
    const snr_dB = mse > 0 ? Number((-10 * Math.log10(mse)).toFixed(1)) : 99;

    return {
      method: reconMethod,
      mse: Number(mse.toFixed(4)),
      snr_dB,
      spc: Number(spc.toFixed(1)),
    };
  }, [reconMethod, samplingFreq_kHz, messageFreq_kHz]);

  // Sub-Exp D Math: Deterministic DFT
  const dftData = useMemo(() => {
    const N = dftN;
    const N_fft = N * zeroPadding;
    const fs = Math.max(1, samplingFreq_kHz);
    const fm = messageFreq_kHz;

    // Generate N time samples: x[n] = sin(2*pi*(fm/fs)*n)
    const x: number[] = [];
    for (let n = 0; n < N_fft; n++) {
      if (n < N) {
        x.push(Math.sin(2 * Math.PI * (fm / fs) * n));
      } else {
        x.push(0); // zero-padding
      }
    }

    // Compute DFT magnitude for positive frequencies
    const numBins = Math.floor(N_fft / 2);
    const bins: { freq: string; mag: number; bin: number }[] = [];

    for (let k = 0; k <= numBins; k++) {
      let real = 0;
      let imag = 0;
      for (let n = 0; n < N_fft; n++) {
        const angle = (2 * Math.PI * k * n) / N_fft;
        real += x[n]! * Math.cos(angle);
        imag -= x[n]! * Math.sin(angle);
      }
      const mag = (2 / N) * Math.sqrt(real * real + imag * imag);
      const binFreq = Number(((k * fs) / N_fft).toFixed(2));
      bins.push({
        freq: `${binFreq}k`,
        mag: Number(mag.toFixed(3)),
        bin: k,
      });
    }

    return bins;
  }, [dftN, zeroPadding, samplingFreq_kHz, messageFreq_kHz]);

  // Sub-Exp E Math: Windowing
  const windowMetrics = useMemo(() => {
    const specs = {
      rect: { name: "Rectangular", sidelobe_dB: -13.3, rolloff: "6 dB/octave", mainlobe: "4π/N" },
      hanning: { name: "Hanning", sidelobe_dB: -31.5, rolloff: "18 dB/octave", mainlobe: "8π/N" },
      hamming: { name: "Hamming", sidelobe_dB: -42.7, rolloff: "6 dB/octave", mainlobe: "8π/N" },
      blackman: {
        name: "Blackman",
        sidelobe_dB: -58.1,
        rolloff: "18 dB/octave",
        mainlobe: "12π/N",
      },
    };
    return specs[windowType];
  }, [windowType]);

  const SUB_MODES: { id: SamplingSubExpType; title: string; subtitle: string }[] = [
    { id: "nyquist", title: "A. Nyquist Sampling", subtitle: "fs ≥ 2·fm criterion & PAM" },
    { id: "antialiasing", title: "B. Anti-Aliasing Filter", subtitle: "Non-bandlimited rejection" },
    { id: "reconstruction", title: "C. Reconstruction", subtitle: "ZOH vs FOH & MSE error" },
    { id: "dft", title: "D. Frequency Sampling (DFT)", subtitle: "N-point DFT & Zero-Padding" },
    { id: "spectral", title: "E. Spectral Windowing", subtitle: "Leakage & Sidelobe control" },
  ];

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Sub-Experiment Mode Selector Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg border border-border bg-sidebar/80">
        <span className="text-[10px] text-muted-foreground font-bold px-2 uppercase tracking-wider">
          IIT Guwahati Sub-Experiments:
        </span>
        {SUB_MODES.map((mode) => {
          const isSelected = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`px-3 py-1.5 rounded text-left transition-all border ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                  : "border-border bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="text-[11px] leading-tight">{mode.title}</div>
              <div
                className={`text-[9px] opacity-75 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                {mode.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* SUB-EXP B: Anti-Aliasing Filter Experiment Panel */}
      {currentMode === "antialiasing" && (
        <Card className="border-border bg-card">
          <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-xs font-bold text-foreground">
              Sub-Experiment B: Non-Bandlimited Sampling & Anti-Aliasing Filter
            </CardTitle>
            <Badge variant={filterEnabled ? "default" : "destructive"} className="text-[10px]">
              {filterEnabled
                ? "● Anti-Aliasing Pre-Filter: ACTIVE (-24.5 dB)"
                : "○ Pre-Filter: BYPASSED (Foldover Risk)"}
            </Badge>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              When an analog input contains frequencies above the Nyquist cutoff ($f_N = f_s / 2$),
              those components fold into the baseband as destructive alias tones. An anti-aliasing
              low-pass filter must bandlimit the signal
              <strong> before</strong> entering the sampling switch.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 p-3 rounded border border-border bg-sidebar/40">
                <span className="text-foreground font-bold block text-[11px]">
                  1. Input Signal Components:
                </span>
                <div className="text-[11px] text-muted-foreground space-y-1">
                  <div>
                    • Wanted Baseband Signal:{" "}
                    <span className="font-bold text-cyan-400">{antialiasMetrics.f1} kHz</span>{" "}
                    (Amplitude 1.0 V)
                  </div>
                  <div>
                    • Out-of-band Harmonic:{" "}
                    <span className="font-bold text-rose-400">{interferingFreq_kHz} kHz</span>{" "}
                    (Amplitude 0.65 V)
                  </div>
                  <div>
                    • Sampling Frequency fs:{" "}
                    <span className="font-bold text-amber-500">{samplingFreq_kHz} kHz</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-muted-foreground">
                    Adjust Out-of-Band Component:
                  </span>
                  <Slider
                    value={[interferingFreq_kHz]}
                    onValueChange={([val]) => setInterferingFreq_kHz(val ?? 3.4)}
                    min={2.2}
                    max={5.0}
                    step={0.2}
                  />
                </div>
              </div>

              <div className="space-y-3 p-3 rounded border border-border bg-sidebar/40 flex flex-col justify-between">
                <div>
                  <span className="text-foreground font-bold block text-[11px]">
                    2. Anti-Aliasing Pre-Filter Control:
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    4th-Order Butterworth Low-Pass Filter (fc = 1.6 kHz) placed before the ADC
                    sampler.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => setFilterEnabled((e) => !e)}
                    variant={filterEnabled ? "default" : "outline"}
                    className="w-full text-xs font-mono"
                  >
                    {filterEnabled
                      ? "✓ Pre-Filter Engaged (Active)"
                      : "⚠️ Bypass Filter (Observe Ghost Foldover)"}
                  </Button>

                  <div className="p-2 rounded bg-card border border-border text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Folded Alias Tone:</span>
                      <span
                        className={
                          antialiasMetrics.filterActive
                            ? "text-emerald-400 font-bold"
                            : "text-rose-400 font-bold"
                        }
                      >
                        {antialiasMetrics.filterActive
                          ? "Attenuated to 0.06 V (Suppressed)"
                          : `Active at ${antialiasMetrics.f2Alias} kHz (0.65 V)`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SUB-EXP C: Signal Reconstruction (ZOH vs FOH & MSE Error) */}
      {currentMode === "reconstruction" && (
        <Card className="border-border bg-card">
          <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-xs font-bold text-foreground">
              Sub-Experiment C: Signal Reconstruction & Mean Square Error (MSE)
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-primary">
              SNR: {reconMetrics.snr_dB} dB (MSE = {reconMetrics.mse})
            </Badge>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Compare practical data-hold reconstruction methods:{" "}
              <strong>Zero-Order Hold (ZOH)</strong> maintains sample values constant over the
              interval $T_s$ (staircase), while <strong>First-Order Hold (FOH)</strong> applies
              linear interpolation between successive samples.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setReconMethod("zoh")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reconMethod === "zoh"
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                    : "border-border bg-sidebar hover:bg-card"
                }`}
              >
                <span className="font-bold text-foreground block text-xs">
                  1. Zero-Order Hold (ZOH)
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Staircase hold: $h_0(t) = 1$ for $0 \le t &lt; T_s$. Produces high-frequency
                  spectral steps.
                </span>
                <Badge variant="outline" className="mt-2 text-[9px]">
                  MSE ≈ 0.082 | Delay = Ts/2
                </Badge>
              </button>

              <button
                onClick={() => setReconMethod("foh")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reconMethod === "foh"
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                    : "border-border bg-sidebar hover:bg-card"
                }`}
              >
                <span className="font-bold text-foreground block text-xs">
                  2. First-Order Hold (FOH)
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Linear triangular interpolation between samples. Dramatically reduces
                  reconstruction distortion.
                </span>
                <Badge variant="outline" className="mt-2 text-[9px]">
                  MSE ≈ 0.014 | Smooth Ramp
                </Badge>
              </button>

              <button
                onClick={() => setReconMethod("ideal")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reconMethod === "ideal"
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                    : "border-border bg-sidebar hover:bg-card"
                }`}
              >
                <span className="font-bold text-foreground block text-xs">
                  3. Ideal Whittaker-Shannon (Sinc)
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Brickwall low-pass filter with sinc impulse response: $h(t) = \text{sinc}(t/T_s)$.
                  Zero MSE above Nyquist.
                </span>
                <Badge variant="outline" className="mt-2 text-[9px]">
                  MSE &lt; 0.001 | Pristine
                </Badge>
              </button>
            </div>

            <div className="p-3 rounded border border-border bg-sidebar/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
              <div>
                <span className="text-foreground font-bold">Delay Compensation: {delay_us} µs</span>
                <p className="text-[10px] text-muted-foreground">
                  Adjust phase delay introduced by the reconstruction filter network.
                </p>
              </div>
              <div className="w-48">
                <Slider
                  value={[delay_us]}
                  onValueChange={([val]) => setDelay_us(val ?? 25)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SUB-EXP D: Frequency-Domain Sampling (DFT) */}
      {currentMode === "dft" && (
        <Card className="border-border bg-card">
          <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-xs font-bold text-foreground">
              Sub-Experiment D: Frequency-Domain Sampling & Discrete Fourier Transform (DFT)
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-primary">
              N = {dftN} samples | FFT Grid = {dftN * zeroPadding} points
            </Badge>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              The Discrete Fourier Transform (DFT) samples the continuous spectrum at discrete
              frequency bins k · (fs / N). Zero-padding interpolates the spectrum on a finer grid
              without creating new information.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded border border-border bg-sidebar/40">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-[11px]">Sample Size (N):</span>
                {[16, 32].map((n) => (
                  <Button
                    key={n}
                    size="sm"
                    variant={dftN === n ? "default" : "outline"}
                    onClick={() => setDftN(n as 16 | 32)}
                    className="h-6 text-[10px] px-2.5"
                  >
                    N = {n}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-[11px]">Zero-Padding:</span>
                {[1, 2, 4].map((zp) => (
                  <Button
                    key={zp}
                    size="sm"
                    variant={zeroPadding === zp ? "default" : "outline"}
                    onClick={() => setZeroPadding(zp as 1 | 2 | 4)}
                    className="h-6 text-[10px] px-2.5"
                  >
                    {zp === 1 ? "None (1x)" : `${zp}x Padding`}
                  </Button>
                ))}
              </div>
            </div>

            {/* DFT Stems Bar Chart */}
            <div className="h-56 w-full rounded border border-border bg-sidebar/30 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dftData} margin={{ top: 10, right: 15, left: 10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.5} />
                  <XAxis
                    dataKey="freq"
                    stroke="#888"
                    tick={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
                  />
                  <YAxis stroke="#888" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} />
                  <Tooltip
                    formatter={(val) => [`${Number(val).toFixed(3)}`, "DFT Magnitude |X[k]|"]}
                    labelFormatter={(lbl) => `Frequency Bin: ${lbl}Hz`}
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#3f3f46",
                      fontSize: "10px",
                    }}
                  />
                  <Bar dataKey="mag" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SUB-EXP E: Spectral Analysis & Windowing */}
      {currentMode === "spectral" && (
        <Card className="border-border bg-card">
          <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-xs font-bold text-foreground">
              Sub-Experiment E: Spectral Analysis with Windowing Functions
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-primary">
              Window: {windowMetrics.name} ({windowMetrics.sidelobe_dB} dB Peak Sidelobe)
            </Badge>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Truncating a signal in time corresponds to convolving its spectrum with the transform
              of the window function. Tapered windows trade wider mainlobe bandwidth for
              significantly reduced spectral sidelobe leakage.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["rect", "hanning", "hamming", "blackman"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setWindowType(w)}
                  className={`p-2.5 rounded border text-left transition-colors ${
                    windowType === w
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-sidebar hover:bg-card"
                  }`}
                >
                  <span className="font-bold text-foreground block uppercase text-[11px]">{w}</span>
                  <span className="text-[9px] text-muted-foreground block mt-0.5">
                    {w === "rect"
                      ? "-13 dB Leakage"
                      : w === "hanning"
                        ? "-31 dB Sidelobe"
                        : w === "hamming"
                          ? "-43 dB Sidelobe"
                          : "-58 dB Ultra-low"}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded border border-border bg-sidebar/50 text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px]">
                  Peak Sidelobe Level:
                </span>
                <span className="text-amber-400 font-bold text-sm">
                  {windowMetrics.sidelobe_dB} dB
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Mainlobe 3dB Width:</span>
                <span className="text-cyan-400 font-bold text-sm">{windowMetrics.mainlobe}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">
                  Asymptotic Roll-off:
                </span>
                <span className="text-emerald-400 font-bold text-sm">{windowMetrics.rolloff}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
