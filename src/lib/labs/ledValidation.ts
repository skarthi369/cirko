import type { Design, PlacedPart } from "@/components/circuit/types";
import type { SimResult } from "@/lib/simulate";

export type StepValidationInfo = {
  partsPlaced: boolean;
  topologyValid: boolean;
  simulationRunning: boolean;
  activeMeasurement: boolean;
  hasSubThresholdReading: boolean;
  hasKneeReading: boolean;
  hasLinearReading: boolean;
  message: string;
  errorKind?:
    | "missing_battery"
    | "missing_resistor"
    | "missing_led"
    | "reversed_polarity"
    | "missing_resistor_series"
    | "incomplete_loop"
    | "sim_stopped"
    | "no_error";
  battery?: PlacedPart;
  resistor?: PlacedPart;
  led?: PlacedPart;
  vin?: number;
  vd?: number; // Forward voltage in Volts
  id?: number; // Forward current in mA
};

function pinKey(partId: string, pinId: string) {
  return `${partId}:${pinId}`;
}

export function validateLedLabStep(
  design: Design,
  sim: SimResult | null,
  trialCount: number,
): StepValidationInfo {
  const battery = design.parts.find((p) => p.type === "battery");
  const resistor = design.parts.find((p) => p.type === "resistor");
  const led = design.parts.find((p) => p.type === "led");

  // Step 1 check: Parts placement
  if (!battery || !resistor || !led) {
    let msg = "Place Battery, 220 Ω Resistor, and Red LED on the canvas.";
    let err: StepValidationInfo["errorKind"] = "missing_battery";
    if (!battery) {
      msg = "Place a Battery (DC Voltage Source) from the library on the left.";
      err = "missing_battery";
    } else if (!resistor) {
      msg = "Place a 220 Ω current-limiting Resistor to protect the LED.";
      err = "missing_resistor";
    } else if (!led) {
      msg = "Place a Red LED on the canvas.";
      err = "missing_led";
    }
    return {
      partsPlaced: false,
      topologyValid: false,
      simulationRunning: false,
      activeMeasurement: false,
      hasSubThresholdReading: false,
      hasKneeReading: false,
      hasLinearReading: false,
      message: msg,
      errorKind: err,
      battery,
      resistor,
      led,
    };
  }

  // Step 2 check: Topology & Wiring
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    let root = parent.get(x)!;
    if (root !== x) {
      root = find(root);
      parent.set(x, root);
    }
    return root;
  };
  const union = (x: string, y: string) => {
    const a = find(x);
    const b = find(y);
    if (a !== b) parent.set(a, b);
  };

  // Register pins
  find(pinKey(battery.id, "pos"));
  find(pinKey(battery.id, "neg"));
  find(pinKey(resistor.id, "a"));
  find(pinKey(resistor.id, "b"));
  find(pinKey(led.id, "anode"));
  find(pinKey(led.id, "cathode"));

  for (const w of design.wires) {
    union(pinKey(w.from.partId, w.from.pinId), pinKey(w.to.partId, w.to.pinId));
  }

  const batPosNet = find(pinKey(battery.id, "pos"));
  const batNegNet = find(pinKey(battery.id, "neg"));
  const resANet = find(pinKey(resistor.id, "a"));
  const resBNet = find(pinKey(resistor.id, "b"));
  const ledAnodeNet = find(pinKey(led.id, "anode"));
  const ledCathodeNet = find(pinKey(led.id, "cathode"));

  // Check direct battery to LED without resistor
  if (
    batPosNet === ledAnodeNet &&
    batNegNet === ledCathodeNet &&
    resANet !== batPosNet &&
    resBNet !== batPosNet
  ) {
    return {
      partsPlaced: true,
      topologyValid: false,
      simulationRunning: false,
      activeMeasurement: false,
      hasSubThresholdReading: false,
      hasKneeReading: false,
      hasLinearReading: false,
      message: "Resistor must be connected in series with the LED to prevent burnout.",
      errorKind: "missing_resistor_series",
      battery,
      resistor,
      led,
    };
  }

  // Check reversed polarity (Cathode connected toward positive)
  const isReversed =
    (ledCathodeNet === batPosNet || ledCathodeNet === resANet || ledCathodeNet === resBNet) &&
    ledAnodeNet === batNegNet;
  if (isReversed) {
    return {
      partsPlaced: true,
      topologyValid: false,
      simulationRunning: false,
      activeMeasurement: false,
      hasSubThresholdReading: false,
      hasKneeReading: false,
      hasLinearReading: false,
      message:
        "LED polarity is reversed! Connect Resistor to LED Anode (A) and Battery (-) to Cathode (K).",
      errorKind: "reversed_polarity",
      battery,
      resistor,
      led,
    };
  }

  // Validate complete series loop: Battery(+) -> Resistor -> LED(A), LED(K) -> Battery(-)
  const resConnectedToBatPos = resANet === batPosNet || resBNet === batPosNet;
  const resOtherPinNet = resANet === batPosNet ? resBNet : resANet;
  const resConnectedToLedAnode = resOtherPinNet === ledAnodeNet;
  const ledCathodeConnectedToBatNeg = ledCathodeNet === batNegNet;

  if (!resConnectedToBatPos || !resConnectedToLedAnode || !ledCathodeConnectedToBatNeg) {
    let msg =
      "Wire the complete circuit: Battery(+) -> Resistor -> LED Anode, and LED Cathode -> Battery(-).";
    if (!resConnectedToBatPos) msg = "Connect the Battery (+) terminal to one pin of the Resistor.";
    else if (!resConnectedToLedAnode)
      msg = "Connect the second pin of the Resistor to the LED Anode (A).";
    else if (!ledCathodeConnectedToBatNeg)
      msg = "Connect the LED Cathode (K) to Battery (-) to close the loop.";

    return {
      partsPlaced: true,
      topologyValid: false,
      simulationRunning: false,
      activeMeasurement: false,
      hasSubThresholdReading: false,
      hasKneeReading: false,
      hasLinearReading: false,
      message: msg,
      errorKind: "incomplete_loop",
      battery,
      resistor,
      led,
    };
  }

  // Topology is valid! Now check simulation state
  const vin = parseFloat(battery.props["voltage"] ?? "1.5");
  if (!sim || !sim.ok) {
    return {
      partsPlaced: true,
      topologyValid: true,
      simulationRunning: false,
      activeMeasurement: false,
      hasSubThresholdReading: trialCount > 0,
      hasKneeReading: trialCount >= 2,
      hasLinearReading: trialCount >= 4,
      message: "✓ Circuit topology verified! Click 'Start simulation' in the toolbar.",
      errorKind: "sim_stopped",
      battery,
      resistor,
      led,
      vin,
    };
  }

  // Simulation is active: extract real physical measurements
  const ledSim = sim.parts[led.id];
  const vd = ledSim ? Math.abs(ledSim.voltage) : 0;
  const id = ledSim ? Math.abs(ledSim.current) * 1000 : 0; // convert A to mA

  return {
    partsPlaced: true,
    topologyValid: true,
    simulationRunning: true,
    activeMeasurement: true,
    hasSubThresholdReading: trialCount >= 1,
    hasKneeReading: trialCount >= 3,
    hasLinearReading: trialCount >= 4,
    message: `✓ Circuit active: Measured V_D = ${vd.toFixed(2)} V, I_D = ${id.toFixed(2)} mA (Supply = ${vin.toFixed(1)} V).`,
    errorKind: "no_error",
    battery,
    resistor,
    led,
    vin,
    vd,
    id,
  };
}
