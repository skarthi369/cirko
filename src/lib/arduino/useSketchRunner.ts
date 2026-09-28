import { useCallback, useEffect, useRef, useState } from "react";
import { Sketch, SketchError, type SketchHost } from "./interpreter";

export type PinStates = Record<string, string>; // "D13" -> "HIGH" | "LOW" | "IN" | "0".."255"

type Options = {
  source: string;
  running: boolean;
  /** Reads the live 0..1023 analog value of an Arduino pin from the circuit. */
  readAnalog: (pin: string) => number;
  /** Reads the live logic level of an Arduino pin from the circuit. */
  readDigital: (pin: string) => number;
};

const pinName = (pin: number | string) => (typeof pin === "number" ? `D${pin}` : pin);
const MAX_LINES = 300;

export function useSketchRunner({ source, running, readAnalog, readDigital }: Options) {
  const [pins, setPins] = useState<PinStates>({});
  const [serial, setSerial] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pinsRef = useRef<PinStates>({});
  const serialRef = useRef<string[]>([]);
  const bufferRef = useRef("");
  const readARef = useRef(readAnalog);
  const readDRef = useRef(readDigital);
  readARef.current = readAnalog;
  readDRef.current = readDigital;

  const clearSerial = useCallback(() => {
    serialRef.current = [];
    bufferRef.current = "";
    setSerial([]);
  }, []);

  useEffect(() => {
    if (!running) {
      setPins({});
      pinsRef.current = {};
      return;
    }

    let cancelled = false;
    let raf = 0;
    let dirty = false;
    const modes: Record<string, string> = {};

    const setPin = (pin: string, value: string) => {
      if (pinsRef.current[pin] === value) return;
      pinsRef.current = { ...pinsRef.current, [pin]: value };
      dirty = true;
    };

    const pushSerial = (text: string) => {
      bufferRef.current += text;
      const parts = bufferRef.current.split("\n");
      bufferRef.current = parts.pop() ?? "";
      if (parts.length) {
        serialRef.current = [...serialRef.current, ...parts].slice(-MAX_LINES);
        dirty = true;
      }
    };

    const host: SketchHost = {
      pinMode: (pin, mode) => {
        const p = pinName(pin);
        modes[p] = mode;
        setPin(p, mode === "OUTPUT" ? "LOW" : "IN");
      },
      digitalWrite: (pin, value) => {
        const p = pinName(pin);
        if (modes[p] !== "OUTPUT" && value) setPin(p, "IN");
        else setPin(p, value ? "HIGH" : "LOW");
      },
      digitalRead: (pin) => readDRef.current(pinName(pin)),
      analogWrite: (pin, value) => {
        const p = pinName(pin);
        modes[p] = "OUTPUT";
        setPin(p, value >= 255 ? "HIGH" : value <= 0 ? "LOW" : String(value));
      },
      analogRead: (pin) => readARef.current(pinName(pin)),
      tone: (pin) => setPin(pinName(pin), "HIGH"),
      noTone: (pin) => setPin(pinName(pin), "LOW"),
      print: pushSerial,
      millis: () => performance.now(),
    };

    let sketch: Sketch;
    try {
      sketch = new Sketch(source, host);
    } catch (err) {
      setError(err instanceof SketchError || err instanceof Error ? err.message : String(err));
      return;
    }
    setError(null);

    let gen: Generator<{ type: "delay"; ms: number }, void, void> = sketch.begin();
    let phase: "setup" | "loop" = "setup";
    let waitUntil = 0;

    const flush = () => {
      if (!dirty) return;
      dirty = false;
      setPins(pinsRef.current);
      setSerial(serialRef.current);
    };

    const step = () => {
      if (cancelled) return;
      const now = performance.now();
      const deadline = now + 8; // keep the UI responsive
      try {
        while (performance.now() < deadline) {
          if (performance.now() < waitUntil) break;
          const r = gen.next();
          if (r.done) {
            if (phase === "setup") phase = "loop";
            gen = sketch.tick();
            continue;
          }
          waitUntil = performance.now() + r.value.ms;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        flush();
        return;
      }
      flush();
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [source, running]);

  return { pins, serial, error, clearSerial };
}
