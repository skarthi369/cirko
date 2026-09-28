import type { Design, PlacedPart } from "@/components/circuit/types";
import type { SimResult } from "@/lib/simulate";

export type ValidationResult = {
  valid: boolean;
  message: string;
  stepCompleted: number; // 0: missing parts, 1: parts placed, 2: topology valid, 3: sim running, 4: ready for recording
  battery?: PlacedPart;
  resistor?: PlacedPart;
  led?: PlacedPart;
  vd?: number; // Volts
  id?: number; // mA
};

function pinKey(partId: string, pinId: string) {
  return `${partId}:${pinId}`;
}

export function validateLedCircuit(design: Design, sim: SimResult | null): ValidationResult {
  const battery = design.parts.find((p) => p.type === "battery");
  const resistor = design.parts.find((p) => p.type === "resistor");
  const led = design.parts.find((p) => p.type === "led");

  if (!battery && !resistor && !led) {
    return { valid: false, message: "Place a Battery, Resistor, and LED on the canvas.", stepCompleted: 0 };
  }
  if (!battery) {
    return { valid: false, message: "Place a Battery on the canvas.", stepCompleted: 0 };
  }
  if (!resistor) {
    return { valid: false, message: "Place a Resistor on the canvas to limit current.", stepCompleted: 0 };
  }
  if (!led) {
    return { valid: false, message: "Place a Red LED on the canvas.", stepCompleted: 0 };
  }

  /* Build Union-Find pin connectivity nets */
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

  for (const part of design.parts) {
    if (part.type === "battery") {
      find(pinKey(part.id, "pos"));
      find(pinKey(part.id, "neg"));
    } else if (part.type === "resistor") {
      find(pinKey(part.id, "a"));
      find(pinKey(part.id, "b"));
    } else if (part.type === "led") {
      find(pinKey(part.id, "anode"));
      find(pinKey(part.id, "cathode"));
    }
  }

  for (const w of design.wires) {
    union(pinKey(w.from.partId, w.from.pinId), pinKey(w.to.partId, w.to.pinId));
  }

  const batPosNet = find(pinKey(battery.id, "pos"));
  const batNegNet = find(pinKey(battery.id, "neg"));
  const resANet = find(pinKey(resistor.id, "a"));
  const resBNet = find(pinKey(resistor.id, "b"));
  const ledAnodeNet = find(pinKey(led.id, "anode"));
  const ledCathodeNet = find(pinKey(led.id, "cathode"));

  // Check direct battery -> LED connection without resistor
  if (batPosNet === ledAnodeNet && batNegNet === ledCathodeNet && resANet !== batPosNet && resBNet !== batPosNet) {
    return {
      valid: false,
      message: "Resistor must be connected in series between the Battery positive terminal (+) and LED anode (A) to prevent over-current.",
      stepCompleted: 1,
      battery,
      resistor,
      led,
    };
  }

  // Check reversed LED polarity
  const isReversed =
    (ledCathodeNet === batPosNet || ledCathodeNet === resANet || ledCathodeNet === resBNet) &&
    (ledAnodeNet === batNegNet);
  if (isReversed) {
    return {
      valid: false,
      message: "LED polarity is reversed. Connect the Resistor to the LED anode (A) and the Battery negative terminal (-) to the cathode (K).",
      stepCompleted: 1,
      battery,
      resistor,
      led,
    };
  }

  // Verify series loop: Battery(+) -> Resistor -> LED(A) ... LED(K) -> Battery(-)
  const resConnectedToBatPos = resANet === batPosNet || resBNet === batPosNet;
  const resOtherPinNet = resANet === batPosNet ? resBNet : resANet;
  const resConnectedToLedAnode = resOtherPinNet === ledAnodeNet;
  const ledCathodeConnectedToBatNeg = ledCathodeNet === batNegNet;

  if (!resConnectedToBatPos) {
    return {
      valid: false,
      message: "Connect the battery (+) terminal to one pin of the resistor.",
      stepCompleted: 1,
      battery,
      resistor,
      led,
    };
  }

  if (!resConnectedToLedAnode) {
    return {
      valid: false,
      message: "Connect the other pin of the resistor to the LED anode (A).",
      stepCompleted: 1,
      battery,
      resistor,
      led,
    };
  }

  if (!ledCathodeConnectedToBatNeg) {
    return {
      valid: false,
      message: "Connect the LED cathode (K) to the battery (-) terminal to complete the loop.",
      stepCompleted: 1,
      battery,
      resistor,
      led,
    };
  }

  // Topology is verified!
  if (!sim || !sim.ok) {
    return {
      valid: true,
      message: "✓ Circuit topology verified! Click 'Start simulation' in the editor to run the experiment.",
      stepCompleted: 2,
      battery,
      resistor,
      led,
    };
  }

  const ledSim = sim.parts[led.id];
  const vd = ledSim ? Math.abs(ledSim.voltage) : 0;
  const id = ledSim ? Math.abs(ledSim.current) * 1000 : 0;

  return {
    valid: true,
    message: `✓ Circuit active! Measured LED Voltage V_D = ${vd.toFixed(2)} V, LED Current I_D = ${id.toFixed(2)} mA.`,
    stepCompleted: 3,
    battery,
    resistor,
    led,
    vd,
    id,
  };
}
