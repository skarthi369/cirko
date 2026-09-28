/**
 * IntensityModulationSimulationModel.ts
 *
 * Deterministic mathematical & physical model for Intensity Modulation of Laser Output
 * Through an Optical Fiber Link (IIT Roorkee Optical Communication Virtual Lab standard).
 *
 * Signal Chain:
 * Information Signal (v_in)
 *   ↓
 * Laser Source (DC Bias + AC Modulation -> I_laser)
 *   ↓
 * Optical Intensity (P_opt)
 *   ↓
 * Optical Fiber (Attenuation & Propagation Delay -> P_rec)
 *   ↓
 * Photodetector / Phototransistor (Responsivity & Gain -> I_det)
 *   ↓
 * Series Resistor (I_det · R_load -> V_det)
 *   ↓
 * Amplification & AC Recovery -> v_out(t)
 */

export interface SimulationParameters {
  // Input Information Signal
  inputAmplitude_mVpp: number; // 10 to 2000 mVpp
  inputFrequency_kHz: number; // 0.1 to 200 kHz
  waveformType: "sine" | "triangle" | "square";
  signalGeneratorActive: boolean;

  // Laser Diode Source
  laserBiasCurrent_mA: number; // 15 to 40 mA (Ith ≈ 18 mA)
  laserActive: boolean;

  // Optical Fiber Link
  fiberLength_m: number; // 1 to 1000 m
  fiberAttenuation_dB_per_m: number; // default 0.03 dB/m for POF
  fiberConnected: boolean;

  // Receiver & Photodetector
  detectorConnected: boolean;
  loadResistance_ohms: number; // default 1000 Ω (1 kΩ)
  amplifierGain: number; // default 1.8
}

export interface WaveformSample {
  time_us: number;
  vin_mV: number;
  laserCurrent_mA: number;
  laserPower_mW: number;
  receivedPower_mW: number;
  detectorCurrent_uA: number;
  detectorVoltage_mV: number;
  vout_mV: number;
}

export interface SimulationResultMetrics {
  vin_pp_mV: number;
  vout_pp_mV: number;
  frequency_kHz: number;
  laserBiasCurrent_mA: number;
  peakLaserPower_mW: number;
  minLaserPower_mW: number;
  avgLaserPower_mW: number;
  receivedOpticalPower_mW: number;
  fiberAttenuation_dB: number;
  peakDetectorCurrent_uA: number;
  voltageGain: number; // Vout_pp / Vin_pp
  linkLoss_dB: number;
  modulationIndex: number;
  isClipped: boolean;
  isLasing: boolean;
  propagationDelay_ns: number;
  waveforms: WaveformSample[];
}

export const LASER_ITH_MA = 18.0;
export const LASER_SLOPE_EFF_MW_PER_MA = 0.35;
export const LASER_MOD_SENSITIVITY_MA_PER_MV = 0.01; // 10 mA per Volt
export const SPONTANEOUS_POWER_MW = 0.25;
export const PHOTODETECTOR_RESPONSIVITY_A_PER_W = 0.45;
export const PHOTOTRANSISTOR_GAIN_BETA = 40.0;
export const SPEED_OF_LIGHT_IN_FIBER_M_PER_S = 2.0e8; // n ≈ 1.5
export const RECEIVER_CUTOFF_FREQ_KHZ = 250.0;

export function simulateIntensityModulation(params: SimulationParameters): SimulationResultMetrics {
  const {
    inputAmplitude_mVpp,
    inputFrequency_kHz,
    waveformType,
    signalGeneratorActive,
    laserBiasCurrent_mA,
    laserActive,
    fiberLength_m,
    fiberAttenuation_dB_per_m,
    fiberConnected,
    detectorConnected,
    loadResistance_ohms,
    amplifierGain,
  } = params;

  // If laser is off or disconnected, power is 0
  const isTransmitterActive = laserActive && laserBiasCurrent_mA > 0;
  const isLinkComplete = isTransmitterActive && fiberConnected && detectorConnected;

  // Input voltage peak
  const vin_peak_mV = signalGeneratorActive ? inputAmplitude_mVpp / 2 : 0;
  const freq_kHz = Math.max(0.01, inputFrequency_kHz);
  const period_us = 1000 / freq_kHz;

  // Fiber propagation loss and delay
  const fiberAttenuation_dB = fiberConnected
    ? Number((fiberLength_m * fiberAttenuation_dB_per_m).toFixed(2))
    : 999;
  const fiberTransmissionFactor = fiberConnected ? Math.pow(10, -fiberAttenuation_dB / 10) : 0;
  const propagationDelay_ns = fiberConnected
    ? Number(((fiberLength_m / SPEED_OF_LIGHT_IN_FIBER_M_PER_S) * 1e9).toFixed(1))
    : 0;

  // Modulation index: m = (I_mod_peak) / (I_bias - Ith)
  const imod_peak_mA = vin_peak_mV * LASER_MOD_SENSITIVITY_MA_PER_MV;
  const biasAboveThreshold = Math.max(0.1, laserBiasCurrent_mA - LASER_ITH_MA);
  const modulationIndex = isTransmitterActive
    ? Number(Math.min(2.5, imod_peak_mA / biasAboveThreshold).toFixed(2))
    : 0;
  const isClipped =
    isTransmitterActive &&
    signalGeneratorActive &&
    laserBiasCurrent_mA - imod_peak_mA < LASER_ITH_MA;

  // Receiver frequency roll-off filter factor
  const freqRollOff = 1 / Math.sqrt(1 + Math.pow(freq_kHz / RECEIVER_CUTOFF_FREQ_KHZ, 2));

  // Generate 120 deterministic time samples over 2 full cycles
  const totalDuration_us = 2 * period_us;
  const numSamples = 120;
  const waveforms: WaveformSample[] = [];

  let peakLaserPower = 0;
  let minLaserPower = 9999;
  let sumLaserPower = 0;
  let sumRecPower = 0;
  let maxVout = -9999;
  let minVout = 9999;
  let peakDetectorCurrent_uA = 0;

  for (let i = 0; i < numSamples; i++) {
    const t_us = (i / (numSamples - 1)) * totalDuration_us;
    const phase = (2 * Math.PI * t_us) / period_us;

    // 1. Input Information Signal v_in(t)
    let vin_mV = 0;
    if (signalGeneratorActive) {
      if (waveformType === "sine") {
        vin_mV = vin_peak_mV * Math.sin(phase);
      } else if (waveformType === "triangle") {
        const norm = (phase % (2 * Math.PI)) / (2 * Math.PI);
        vin_mV = vin_peak_mV * (norm < 0.5 ? 4 * norm - 1 : 3 - 4 * norm);
      } else if (waveformType === "square") {
        vin_mV = Math.sin(phase) >= 0 ? vin_peak_mV : -vin_peak_mV;
      }
    }

    // 2. Modulated Laser Drive Current I_laser(t)
    let laserCurrent_mA = 0;
    if (isTransmitterActive) {
      laserCurrent_mA = laserBiasCurrent_mA + vin_mV * LASER_MOD_SENSITIVITY_MA_PER_MV;
      laserCurrent_mA = Math.max(0, laserCurrent_mA);
    }

    // 3. Laser Optical Intensity P_opt(t)
    let laserPower_mW = 0;
    if (isTransmitterActive) {
      if (laserCurrent_mA >= LASER_ITH_MA) {
        laserPower_mW =
          SPONTANEOUS_POWER_MW + (laserCurrent_mA - LASER_ITH_MA) * LASER_SLOPE_EFF_MW_PER_MA;
      } else {
        // Sub-threshold faint spontaneous emission
        laserPower_mW = SPONTANEOUS_POWER_MW * (laserCurrent_mA / Math.max(1, LASER_ITH_MA));
      }
      laserPower_mW = Math.max(0, laserPower_mW);
    }

    // 4. Optical Fiber Transmission -> P_rec(t)
    const receivedPower_mW = isLinkComplete ? laserPower_mW * fiberTransmissionFactor : 0;

    // 5. Photodetector / Phototransistor -> I_det(t)
    // Photocurrent I_ph = R_resp · P_rec; Detector current = beta · I_ph
    const detectorCurrent_mA = isLinkComplete
      ? (receivedPower_mW / 1000) *
        PHOTODETECTOR_RESPONSIVITY_A_PER_W *
        PHOTOTRANSISTOR_GAIN_BETA *
        1000
      : 0;
    const current_uA = detectorCurrent_mA * 1000;

    // 6. Resistor Conversion to Voltage -> V_load(t) = I_det · R_L
    const detectorVoltage_mV = isLinkComplete
      ? (detectorCurrent_mA / 1000) * loadResistance_ohms * 1000
      : 0;

    // 7. Amplification & AC-Coupling Recovery -> v_out(t)
    // The AC-coupling stage removes DC bias and amplifies:
    let vout_mV = 0;
    if (isLinkComplete && signalGeneratorActive) {
      // Small phase delay due to fiber transit:
      const phaseLag = (2 * Math.PI * (propagationDelay_ns / 1000)) / period_us;
      let delayedInputNorm = Math.sin(phase - phaseLag);
      if (waveformType === "triangle") {
        const norm =
          ((((phase - phaseLag) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI);
        delayedInputNorm = norm < 0.5 ? 4 * norm - 1 : 3 - 4 * norm;
      } else if (waveformType === "square") {
        delayedInputNorm = Math.sin(phase - phaseLag) >= 0 ? 1 : -1;
      }

      // Clip if laser current dropped below threshold
      let clippedWave = delayedInputNorm;
      if (isClipped) {
        clippedWave = Math.max(-0.25, delayedInputNorm);
      }

      vout_mV =
        vin_peak_mV *
        clippedWave *
        fiberTransmissionFactor *
        (loadResistance_ohms / 1000) *
        amplifierGain *
        freqRollOff;
    }

    // Accumulate metrics
    peakLaserPower = Math.max(peakLaserPower, laserPower_mW);
    minLaserPower = Math.min(minLaserPower, laserPower_mW);
    sumLaserPower += laserPower_mW;
    sumRecPower += receivedPower_mW;
    maxVout = Math.max(maxVout, vout_mV);
    minVout = Math.min(minVout, vout_mV);
    peakDetectorCurrent_uA = Math.max(peakDetectorCurrent_uA, current_uA);

    waveforms.push({
      time_us: Number(t_us.toFixed(2)),
      vin_mV: Number(vin_mV.toFixed(2)),
      laserCurrent_mA: Number(laserCurrent_mA.toFixed(2)),
      laserPower_mW: Number(laserPower_mW.toFixed(3)),
      receivedPower_mW: Number(receivedPower_mW.toFixed(4)),
      detectorCurrent_uA: Number(current_uA.toFixed(2)),
      detectorVoltage_mV: Number(detectorVoltage_mV.toFixed(2)),
      vout_mV: Number(vout_mV.toFixed(2)),
    });
  }

  const avgLaserPower = isTransmitterActive ? sumLaserPower / numSamples : 0;
  const avgRecPower = isLinkComplete ? sumRecPower / numSamples : 0;
  const vout_pp_mV = isLinkComplete && signalGeneratorActive ? Math.max(0, maxVout - minVout) : 0;
  const voltageGain =
    signalGeneratorActive && inputAmplitude_mVpp > 0
      ? Number((vout_pp_mV / inputAmplitude_mVpp).toFixed(3))
      : 0;

  const linkLoss_dB =
    vout_pp_mV > 0 && inputAmplitude_mVpp > 0
      ? Number((20 * Math.log10(inputAmplitude_mVpp / vout_pp_mV)).toFixed(2))
      : 99.9;

  return {
    vin_pp_mV: signalGeneratorActive ? inputAmplitude_mVpp : 0,
    vout_pp_mV: Number(vout_pp_mV.toFixed(1)),
    frequency_kHz: freq_kHz,
    laserBiasCurrent_mA,
    peakLaserPower_mW: Number(peakLaserPower.toFixed(2)),
    minLaserPower_mW: Number((minLaserPower === 9999 ? 0 : minLaserPower).toFixed(2)),
    avgLaserPower_mW: Number(avgLaserPower.toFixed(2)),
    receivedOpticalPower_mW: Number(avgRecPower.toFixed(3)),
    fiberAttenuation_dB,
    peakDetectorCurrent_uA: Number(peakDetectorCurrent_uA.toFixed(1)),
    voltageGain,
    linkLoss_dB: Math.min(99.9, Math.max(0, linkLoss_dB)),
    modulationIndex,
    isClipped,
    isLasing: isTransmitterActive && laserBiasCurrent_mA >= LASER_ITH_MA,
    propagationDelay_ns,
    waveforms,
  };
}
