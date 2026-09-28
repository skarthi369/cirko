import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WaveformSample, SimulationResultMetrics } from "./IntensityModulationSimulationModel";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface FiberOscilloscopeProps {
  metrics: SimulationResultMetrics;
  waveforms: WaveformSample[];
  connections: {
    genToScope: boolean;
    detectorToScope: boolean;
  };
}

export default function FiberOscilloscope({
  metrics,
  waveforms,
  connections,
}: FiberOscilloscopeProps) {
  const [displayMode, setDisplayMode] = useState<"dual" | "ch1" | "ch2" | "optical">("dual");
  const [isPaused, setIsPaused] = useState(false);

  // Scaled data for oscilloscope grid
  const chartData = waveforms.map((sample) => {
    return {
      time_us: sample.time_us,
      ch1_vin: connections.genToScope ? sample.vin_mV : 0,
      ch2_vout: connections.detectorToScope ? sample.vout_mV : 0,
      laserPower_mW: sample.laserPower_mW,
      receivedPower_mW: sample.receivedPower_mW,
    };
  });

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden font-mono">
      <CardHeader className="py-2.5 px-4 bg-sidebar border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📟</span>
          <CardTitle className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            Dual-Trace Digital Storage Oscilloscope (DSO)
          </CardTitle>
          <Badge
            variant={metrics.isClipped ? "destructive" : "outline"}
            className="text-[10px] font-mono"
          >
            {metrics.isClipped ? "⚠️ Waveform Clipped (Under-biased)" : "✓ Linear Modulation"}
          </Badge>
        </div>

        {/* Oscilloscope Channels & Pause Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center rounded-md border border-border bg-card p-0.5 text-[10px]">
            <button
              onClick={() => setDisplayMode("dual")}
              className={`px-2 py-1 rounded transition-colors ${
                displayMode === "dual"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dual (CH1 + CH2)
            </button>
            <button
              onClick={() => setDisplayMode("ch1")}
              className={`px-2 py-1 rounded transition-colors ${
                displayMode === "ch1"
                  ? "bg-amber-500 text-black font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CH1 (Tx Vin)
            </button>
            <button
              onClick={() => setDisplayMode("ch2")}
              className={`px-2 py-1 rounded transition-colors ${
                displayMode === "ch2"
                  ? "bg-emerald-500 text-black font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CH2 (Rx Vout)
            </button>
            <button
              onClick={() => setDisplayMode("optical")}
              className={`px-2 py-1 rounded transition-colors ${
                displayMode === "optical"
                  ? "bg-red-500 text-white font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Optical Flux
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPaused((p) => !p)}
            className="h-7 text-xs px-2.5"
          >
            {isPaused ? "▶ RUN" : "⏸ STOP"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Oscilloscope Cathode Ray Tube / LCD Graticule Screen */}
        <div className="relative h-64 sm:h-72 w-full rounded-xl border border-neutral-700 bg-neutral-950 p-2 shadow-inner overflow-hidden">
          {/* Phosphor Grid Lines Overlay */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-8 pointer-events-none opacity-20">
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className="border-b border-r border-emerald-500/50" />
            ))}
          </div>

          {/* Real-time Oscilloscope Waveform Display */}
          <div className="relative h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" opacity={0.8} />

                <XAxis
                  dataKey="time_us"
                  type="number"
                  unit=" µs"
                  stroke="#71717a"
                  tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                  label={{
                    value: "Time (µs)",
                    position: "bottom",
                    offset: 5,
                    fill: "#71717a",
                    fontSize: 10,
                  }}
                />

                <YAxis
                  type="number"
                  stroke="#71717a"
                  tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                  domain={displayMode === "optical" ? [0, "auto"] : ["auto", "auto"]}
                  unit={displayMode === "optical" ? " mW" : " mV"}
                  label={{
                    value: displayMode === "optical" ? "Optical Power (mW)" : "Voltage (mV)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#71717a",
                    fontSize: 10,
                  }}
                />

                <Tooltip
                  formatter={(val: unknown, name: unknown) => [
                    `${Number(val).toFixed(2)}`,
                    name === "ch1_vin"
                      ? "CH1 (Tx Input Vin)"
                      : name === "ch2_vout"
                        ? "CH2 (Rx Output Vout)"
                        : name === "laserPower_mW"
                          ? "Laser Optical Power (mW)"
                          : "Received Fiber Power (mW)",
                  ]}
                  labelFormatter={(lbl) => `Time: ${Number(lbl).toFixed(2)} µs`}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                  }}
                />

                <Legend
                  wrapperStyle={{
                    paddingTop: "4px",
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                  }}
                />

                {/* Channel 1: Input Information Signal (Yellow) */}
                {(displayMode === "dual" || displayMode === "ch1") && (
                  <Line
                    type="monotone"
                    dataKey="ch1_vin"
                    name="CH1: Input v_in(t)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={!isPaused}
                  />
                )}

                {/* Channel 2: Recovered Output Signal (Cyan/Emerald) */}
                {(displayMode === "dual" || displayMode === "ch2") && (
                  <Line
                    type="monotone"
                    dataKey="ch2_vout"
                    name="CH2: Recovered v_out(t)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={!isPaused}
                  />
                )}

                {/* Optical Carrier Modulation Waveforms */}
                {displayMode === "optical" && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="laserPower_mW"
                      name="Laser Tx Optical Power (mW)"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="receivedPower_mW"
                      name="Fiber Rx Power (mW)"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      dot={false}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live On-Screen Telemetry & Measurement Readouts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
          <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-center">
            <span className="text-[10px] text-amber-400 block font-bold">CH1 Input Vin (pp)</span>
            <span className="text-sm font-bold text-foreground">
              {connections.genToScope ? `${metrics.vin_pp_mV.toFixed(0)} mV` : "NC"}
            </span>
          </div>

          <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-2 text-center">
            <span className="text-[10px] text-emerald-400 block font-bold">CH2 Output Vo (pp)</span>
            <span className="text-sm font-bold text-foreground">
              {connections.detectorToScope ? `${metrics.vout_pp_mV.toFixed(0)} mV` : "NC"}
            </span>
          </div>

          <div className="rounded border border-border bg-card p-2 text-center">
            <span className="text-[10px] text-muted-foreground block font-bold">
              Signal Freq (f_m)
            </span>
            <span className="text-sm font-bold text-primary">
              {metrics.frequency_kHz.toFixed(1)} kHz
            </span>
          </div>

          <div className="rounded border border-border bg-card p-2 text-center">
            <span className="text-[10px] text-muted-foreground block font-bold">
              Voltage Gain (Vo/Vin)
            </span>
            <span className="text-sm font-bold text-foreground">
              {metrics.voltageGain.toFixed(3)}
            </span>
          </div>

          <div className="rounded border border-border bg-card p-2 text-center">
            <span className="text-[10px] text-muted-foreground block font-bold">Mod Index (m)</span>
            <span className="text-sm font-bold text-foreground">
              {metrics.modulationIndex.toFixed(2)}
            </span>
          </div>

          <div className="rounded border border-border bg-card p-2 text-center">
            <span className="text-[10px] text-muted-foreground block font-bold">
              Fiber Attenuation
            </span>
            <span className="text-sm font-bold text-foreground">
              {metrics.fiberAttenuation_dB.toFixed(2)} dB
            </span>
          </div>
        </div>

        {/* Warning notices */}
        {(!connections.genToScope || !connections.detectorToScope) && (
          <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-400 flex items-center justify-between">
            <span>
              ⚠️ Oscilloscope probe disconnected: {!connections.genToScope && "[CH1 Disconnected] "}
              {!connections.detectorToScope && "[CH2 Disconnected]"}
            </span>
            <span className="font-bold">Connect probes in Setup</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
