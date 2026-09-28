export interface LaserPhysicalState {
  current_mA: number;
  voltage_V: number;
  power_mW: number;
  isLasing: boolean;
  wavelength_nm: number;
  effectiveIth_mA: number;
  temperature_C: number;
  slopeEfficiency_mW_per_mA: number;
  regime: "off" | "spontaneous" | "threshold" | "lasing";
  coherenceStatus: string;
  beamDivergence_deg: number;
}

export const BASE_I_THRESHOLD = 18.0; // mA at 25°C
export const SPON_SLOPE = 0.045; // mW/mA
export const STIM_SLOPE = 0.345; // mW/mA
export const V_KNEE = 1.55; // V
export const R_INTERNAL = 16.5; // Ω

/**
 * Deterministic physics calculation for 650 nm AlGaInP semiconductor laser diode
 * Based on IIT Roorkee Optical Communication Laboratory standards
 */
export function calculateLaserPhysics(
  injectionCurrent_mA: number,
  temperature_C: number,
  isActive: boolean,
): LaserPhysicalState {
  if (!isActive || injectionCurrent_mA <= 0) {
    return {
      current_mA: 0,
      voltage_V: 0,
      power_mW: 0,
      isLasing: false,
      wavelength_nm: 650,
      effectiveIth_mA: BASE_I_THRESHOLD + (temperature_C - 25) * 0.15,
      temperature_C,
      slopeEfficiency_mW_per_mA: 0,
      regime: "off",
      coherenceStatus: "Power Off",
      beamDivergence_deg: 0,
    };
  }

  // Temperature effect: threshold rises ~0.15 mA per °C above 25°C
  const effectiveIth = BASE_I_THRESHOLD + (temperature_C - 25) * 0.15;
  const current = injectionCurrent_mA;

  let power = 0;
  let isLasing = false;
  let regime: LaserPhysicalState["regime"] = "spontaneous";
  let coherenceStatus = "Incoherent Spontaneous Emission";
  let beamDivergence_deg = 35;

  if (current < effectiveIth - 1.0) {
    // Sub-threshold LED-like region
    power = current * SPON_SLOPE;
    regime = "spontaneous";
    coherenceStatus = "Low-power Incoherent Spontaneous Light (LED-like)";
    beamDivergence_deg = 35;
  } else if (current >= effectiveIth - 1.0 && current <= effectiveIth + 1.0) {
    // Threshold transition region (knee)
    const sponBase = (effectiveIth - 1.0) * SPON_SLOPE;
    const progress = (current - (effectiveIth - 1.0)) / 2.0;
    power = sponBase + progress * progress * 0.8 + progress * 0.4;
    regime = "threshold";
    coherenceStatus = "Stimulated Emission Threshold (Onset of Optical Feedback)";
    beamDivergence_deg = 20;
    isLasing = current >= effectiveIth;
  } else {
    // Above threshold stimulated emission region
    isLasing = true;
    regime = "lasing";
    const sponBase = effectiveIth * SPON_SLOPE;
    power = sponBase + (current - effectiveIth) * STIM_SLOPE;
    coherenceStatus = "High-power Coherent Monochromatic Laser Radiation";
    beamDivergence_deg = 8;
  }

  // Forward voltage across p-n junction with internal resistance
  const voltage = current > 0.05 ? V_KNEE + (current / 1000) * R_INTERNAL : 0;
  // Wavelength shifts ~0.2 nm/°C with temperature
  const wavelength = 650 + (temperature_C - 25) * 0.2;
  const slopeEfficiency = isLasing ? STIM_SLOPE : SPON_SLOPE;

  return {
    current_mA: Number(current.toFixed(2)),
    voltage_V: Number(voltage.toFixed(3)),
    power_mW: Number(Math.max(0, power).toFixed(3)),
    isLasing,
    wavelength_nm: Number(wavelength.toFixed(1)),
    effectiveIth_mA: Number(effectiveIth.toFixed(1)),
    temperature_C,
    slopeEfficiency_mW_per_mA: Number(slopeEfficiency.toFixed(3)),
    regime,
    coherenceStatus,
    beamDivergence_deg,
  };
}
