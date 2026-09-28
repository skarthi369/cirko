import type { LabMeta, LabCategoryId } from "./types";

export const CATEGORY_INFO: Record<
  LabCategoryId,
  { title: string; description: string; icon: string; experimentCount: number }
> = {
  "optical-communication": {
    title: "Optical Communication",
    description:
      "Study optoelectronic semiconductor sources, optical fibers, modulation schemes, and photodetectors.",
    icon: "🔦",
    experimentCount: 3,
  },
  "digital-electronics": {
    title: "Digital Electronics",
    description:
      "Construct boolean logic gates, combinational adders/subtractors, and sequential flip-flop memory units.",
    icon: "⚡",
    experimentCount: 3,
  },
  "communication-systems": {
    title: "Communication Systems",
    description:
      "Analyze analog modulation, frequency deviation, envelope detection, and Nyquist pulse sampling.",
    icon: "📡",
    experimentCount: 3,
  },
};

export const LABS_CATALOG: LabMeta[] = [
  // -------------------------------------------------------------
  // CATEGORY 1: OPTICAL COMMUNICATION
  // -------------------------------------------------------------
  {
    id: "characterization-led",
    slug: "characterization-led",
    title: "Characterization of LED",
    shortTitle: "1. Characterization of LED",
    category: "optical-communication",
    categoryTitle: "Optical Communication",
    shortObjective:
      "Study voltage-current (V-I) forward bias characteristics, determine knee voltage (Vk) and dynamic forward resistance (Rf).",
    difficulty: "Beginner",
    estimatedDuration: "25–35 min",
    status: "available",
    path: "/labs/optical-communication/characterization-led",
    iitrReferenceUrl: "https://oc-iitr.vlabs.ac.in/exp/characterization-led/",
    procedureStepDefs: [
      {
        stepNumber: 1,
        title: "Place Required Apparatus",
        instruction:
          "Drag a DC Battery (variable voltage source), a 220 Ω current-limiting Resistor, and a Red LED onto the canvas.",
        hints: [
          "Check the left component library under 'Basics' for Battery, Resistor, and LED.",
          "Ensure all three components (Battery, Resistor, and LED) are placed onto the canvas grid.",
          "Place a DC Battery, a Resistor (220 Ω), and a Red LED on the canvas.",
        ],
        guidedSolution: {
          title: "Component Placement Setup",
          explanation:
            "A standard diode characterization setup requires an adjustable DC source (Battery), a current-limiting resistor (220 Ω) to protect against thermal runaway, and the device under test (LED).",
          diagramText: `[DC Battery (+/-)]  ----->  [220Ω Resistor]  ----->  [Red LED (A/K)]`,
          expectedConnections: ["Battery on left", "Resistor in center", "LED on right"],
          commonMistakes: [
            "Forgetting the resistor: An LED without a series resistor will suffer destructive over-current (> 40 mA).",
            "Leaving parts unconnected on canvas.",
          ],
        },
      },
      {
        stepNumber: 2,
        title: "Wire the Forward-Bias Circuit",
        instruction:
          "Connect Battery (+) to Resistor pin 1. Connect Resistor pin 2 to LED Anode (A). Connect LED Cathode (K) back to Battery (-).",
        hints: [
          "Click a pin to begin drawing a wire, then click the destination pin.",
          "Ensure the LED Anode (A) connects toward the positive side via the resistor, and Cathode (K) connects to negative (-).",
          "Form the series loop: Battery(+) -> Resistor -> LED Anode (A), and LED Cathode (K) -> Battery(-).",
        ],
        guidedSolution: {
          title: "Correct Forward-Bias Topology",
          explanation:
            "For forward bias, the P-side (Anode) must be at a higher potential than the N-side (Cathode). The series resistor is positioned between supply (+) and Anode (A).",
          diagramText: `
  (+) ───[ Wire ]───> (Resistor Pin a)
                      (Resistor Pin b) ───[ Wire ]───> (LED Anode A)
  (-) <──[ Wire ]─── (LED Cathode K)
          `,
          expectedConnections: [
            "Battery pin 'pos' -> Resistor pin 'a'",
            "Resistor pin 'b' -> LED pin 'anode'",
            "LED pin 'cathode' -> Battery pin 'neg'",
          ],
          commonMistakes: [
            "Reversing LED polarity (Cathode to resistor): Diode stays reverse-biased with zero current.",
            "Connecting Battery directly to LED without passing through the series resistor.",
          ],
        },
      },
      {
        stepNumber: 3,
        title: "Start Simulation & Set Initial Voltage",
        instruction:
          "Click 'Start simulation' in the top toolbar. Click the Battery and adjust Voltage to 0.5 V to start sub-threshold characterization.",
        hints: [
          "Look at the toolbar above the canvas and click 'Start simulation' (the button turns green/accent).",
          "Select the Battery on the canvas, open the Inspector on the right, and set Voltage to 0.5 V.",
          "Turn on simulation via 'Start simulation' and set Battery voltage to 0.5 V in the Inspector.",
        ],
        guidedSolution: {
          title: "Starting the Simulation Engine",
          explanation:
            "The simulator computes the Modified Nodal Analysis (MNA) equations. At 0.5 V, the LED is below knee voltage (~1.8 V), so current remains negligible (~0 mA).",
          diagramText: `Toolbar: [ Start simulation ]  ==>  Click Battery  ==>  Inspector: Voltage = 0.5 V`,
          expectedConnections: ["Simulation active", "Battery voltage = 0.5 V"],
          commonMistakes: ["Forgetting to click Start simulation before recording readings."],
        },
      },
      {
        stepNumber: 4,
        title: "Record Initial Sub-Threshold Reading",
        instruction:
          "Observe that at 0.5 V, forward current If is virtually 0 mA. Click 'Record Measurement' to log trial 1.",
        hints: [
          "Click the 'Record Measurement' button in the guidance banner at the top of the canvas.",
          "Check the live measurement badge: V_D is approx 0.50 V and I_D is 0.00 mA.",
          "Press 'Record Measurement' to add the 0.5 V reading into the observation table.",
        ],
        guidedSolution: {
          title: "Sub-Threshold Reading",
          explanation:
            "Before reaching the forward barrier potential (knee voltage), the depletion region prevents significant majority carrier recombination.",
          diagramText: `Reading 1: Vin = 0.5 V | V_D = 0.50 V | I_D = 0.00 mA`,
          expectedConnections: ["Trial recorded in Observation Table"],
          commonMistakes: ["Attempting to record without running the simulation."],
        },
      },
      {
        stepNumber: 5,
        title: "Vary Voltage Through Knee Region (1.0 V – 2.0 V)",
        instruction:
          "Select the Battery, set Voltage to 1.5 V, and record trial 2. Then set Voltage to 2.0 V and record trial 3. Observe current beginning to conduct.",
        hints: [
          "Click the Battery, change Voltage in the Inspector to 1.5 V, click Record Measurement. Repeat for 2.0 V.",
          "At 2.0 V, V_D reaches ~1.8 V and current I_D jumps to ~0.9 mA as conduction begins.",
          "Collect measurements at 1.5 V and 2.0 V into your observation table.",
        ],
        guidedSolution: {
          title: "Knee Region Conduction",
          explanation:
            "Between 1.5 V and 2.0 V, the applied forward bias overcomes the built-in barrier potential (~1.8 V for red GaAsP LEDs). Electrons recombine with holes, emitting photons.",
          diagramText: `
  Vin = 1.5 V => V_D ~ 1.50 V, I_D ~ 0.00 mA
  Vin = 2.0 V => V_D ~ 1.81 V, I_D ~ 0.81 mA (Knee transition!)
          `,
          expectedConnections: ["At least 3 total trials recorded"],
          commonMistakes: ["Changing voltage without clicking Record Measurement."],
        },
      },
      {
        stepNumber: 6,
        title: "Vary Voltage Above Knee (2.5 V – 5.0 V) & Plot",
        instruction:
          "Increase Battery Voltage to 2.5 V, 3.0 V, and 5.0 V, recording each measurement (minimum 4 total trials). Then switch to the 'V-I Graph' tab to inspect the curve.",
        hints: [
          "Set Battery to 2.5 V, 3.0 V, and 5.0 V, recording a measurement for each step.",
          "Notice how V_D stays clamped near ~1.85 V - 2.0 V while current I_D increases linearly due to the series resistor.",
          "Record at least 4-5 trials across 0.5 V - 5.0 V and open the 'V-I Graph' tab.",
        ],
        guidedSolution: {
          title: "Linear Conduction Region & Dynamic Resistance",
          explanation:
            "Beyond the knee voltage, the diode's dynamic forward resistance Rf = ΔV / ΔI becomes very small (~14 Ω). The series resistor absorbs the extra supply voltage: V_res = Vin - V_D.",
          diagramText: `
  Vin = 3.0 V => V_D ~ 1.87 V, I_D ~ 4.8 mA
  Vin = 5.0 V => V_D ~ 1.99 V, I_D ~ 13.7 mA
          `,
          expectedConnections: ["4+ trials recorded", "V-I Graph inspected"],
          commonMistakes: [
            "Recording fewer than 4 data points, making slope calculation inaccurate.",
          ],
        },
      },
      {
        stepNumber: 7,
        title: "Complete Analysis & Post-Test",
        instruction:
          "Review the calculated Knee Voltage (Vk) and Dynamic Resistance (Rf) in the Graph tab, then complete the Post-Test to earn your Lab Certificate.",
        hints: [
          "Switch to the 'Post-Test' tab and answer the 3 concluding questions.",
          "Score at least 2 out of 3 on the Post-Test to unlock the Lab Completion Certificate.",
          "Finish the Post-Test and view your Virtual Lab Certificate.",
        ],
        guidedSolution: {
          title: "Lab Completion and Scientific Takeaway",
          explanation:
            "You have experimentally verified that an LED operates as a non-linear forward-biased diode with a distinct threshold voltage Vk (~1.8 V) and requires series resistance for current limiting.",
          diagramText: `Checklist: Theory [✓] -> Pretest [✓] -> Circuit [✓] -> 4+ Trials [✓] -> Posttest [✓]`,
          expectedConnections: ["Post-Test submitted with passing score"],
          commonMistakes: ["Leaving the post-test unsubmitted."],
        },
      },
    ],
    manual: {
      aim: "To study and plot the Voltage-Current (V-I) forward bias characteristics of a Light Emitting Diode (LED) and determine its forward knee voltage (Vk) and dynamic forward resistance (Rf).",
      theory: {
        overview:
          "A Light Emitting Diode (LED) is a specially doped P-N semiconductor junction diode made from direct bandgap materials such as Gallium Arsenide Phosphide (GaAsP) or Gallium Nitride (GaN). Under forward bias, majority carriers (electrons in N-region, holes in P-region) are injected across the junction and recombine radiatively, releasing energy in the form of optical photons: E = h·c / λ.",
        keyPoints: [
          "Forward Knee Voltage (Vk): Below Vk, negligible current flows. Once forward voltage exceeds Vk (~1.8 V for Red GaAsP), current increases exponentially.",
          "Role of Series Resistor (R_series): An LED has very low internal dynamic resistance (Rf ≈ 10–20 Ω) once active. Without a series resistor, excessive current (> 40 mA) causes irreversible thermal destruction.",
          "Dynamic Forward Resistance (Rf): Calculated from the reciprocal slope of the linear forward conduction region: Rf = ΔV_D / ΔI_D.",
          "Emission Wavelength: Directly governed by the semiconductor bandgap energy: λ = 1240 / Eg (nm).",
        ],
        equations: [
          {
            title: "Diode Shockley Equation",
            formula: "I_D = I_S · [exp(q · V_D / (n · k · T)) - 1]",
            description:
              "Relates forward diode current (I_D) to junction voltage (V_D), ideality factor (n), and thermal voltage (k·T/q).",
          },
          {
            title: "Series Loop Kirchoff's Voltage Law",
            formula: "V_in = V_D + I_D · R_series",
            description:
              "Demonstrates how the series resistor drops excess supply voltage to stabilize diode operating point.",
          },
          {
            title: "Dynamic Resistance",
            formula: "R_f = (V_D2 - V_D1) / (I_D2 - I_D1)",
            description:
              "Calculated from the differential change in voltage over change in current above knee voltage.",
          },
        ],
      },
      apparatus: [
        { name: "Regulated DC Power Supply", specification: "0 – 10 V Variable DC", quantity: 1 },
        { name: "Current Limiting Resistor", specification: "220 Ω, 0.25 W, ±5%", quantity: 1 },
        {
          name: "Light Emitting Diode",
          specification: "Standard Red (GaAsP), λ ≈ 660 nm, Vf ≈ 1.8 V",
          quantity: 1,
        },
        { name: "Digital Multimeter / Voltmeter", specification: "0 – 20 V DC Range", quantity: 1 },
        {
          name: "Digital Milliammeter / Ammeter",
          specification: "0 – 50 mA DC Range",
          quantity: 1,
        },
        { name: "Connecting Wires", specification: "Low resistance test leads", quantity: 3 },
      ],
      circuitSetupDescription:
        "Connect the variable DC power supply positive (+) terminal to one terminal of the 220 Ω series resistor. Connect the other terminal of the resistor to the LED Anode (A). Connect the LED Cathode (K) to the negative (-) terminal of the DC supply to complete the forward-biased series circuit loop.",
      procedureSteps: [
        "1. Identify the components: DC Battery, 220 Ω Resistor, and Red LED.",
        "2. Place the components on the breadboard/canvas workspace.",
        "3. Wire the circuit in forward-bias: Battery(+) -> Resistor -> LED(Anode), and LED(Cathode) -> Battery(-).",
        "4. Turn on the simulation engine using 'Start simulation'.",
        "5. Set the supply voltage to an initial low value (0.5 V) below knee voltage.",
        "6. Measure and record the forward diode voltage V_D (V) and current I_D (mA) in the observation table.",
        "7. Increase supply voltage in gradual steps (1.0 V, 1.5 V, 2.0 V, 2.5 V, 3.0 V, 5.0 V).",
        "8. Record corresponding values of V_D and I_D for each step.",
        "9. Plot the V-I characteristic curve (I_D on Y-axis vs V_D on X-axis).",
        "10. Determine the knee voltage (Vk) and calculate the dynamic forward resistance Rf = ΔV / ΔI.",
      ],
      preTestQuestions: [
        {
          id: 1,
          question:
            "What is the primary function of connecting a resistor in series with a Light Emitting Diode?",
          options: [
            "To step up the DC voltage supplied to the LED",
            "To limit forward current and protect the diode from thermal destruction",
            "To rectify AC signals into DC signals",
            "To shift the emission wavelength to infrared",
          ],
          correctAnswer: 1,
          explanation:
            "Because an activated LED has very small internal resistance (~14 Ω), connecting it directly across a voltage source causes excessive current (> 40 mA) that burns the junction. The series resistor drops the surplus voltage and limits current.",
        },
        {
          id: 2,
          question:
            "Under which biasing condition does a semiconductor LED conduct current and emit optical radiation?",
          options: [
            "Reverse Bias",
            "Forward Bias",
            "Zero Bias (Thermal Equilibrium)",
            "Avalanche Breakdown Bias",
          ],
          correctAnswer: 1,
          explanation:
            "An LED emits light via spontaneous radiative recombination of injected majority carriers, which occurs only under forward bias when external voltage overcomes the junction barrier potential.",
        },
        {
          id: 3,
          question:
            "What is the typical forward knee voltage (Vk) for a standard red semiconductor LED (GaAsP)?",
          options: ["0.2 V – 0.3 V", "1.8 V – 2.0 V", "5.0 V – 5.5 V", "12.0 V"],
          correctAnswer: 1,
          explanation:
            "Standard red LEDs made from Gallium Arsenide Phosphide have a bandgap energy Eg ≈ 1.8 eV – 1.9 eV, corresponding to a forward knee threshold voltage of approximately 1.8 V – 2.0 V.",
        },
      ],
      postTestQuestions: [
        {
          id: 1,
          question:
            "What happens to the LED forward current (I_D) when applied forward voltage is below knee voltage (V_D < Vk)?",
          options: [
            "Current increases linearly with applied voltage",
            "Current remains virtually zero due to the barrier potential of the depletion layer",
            "Current flows in the reverse direction",
            "Current oscillates at the optical frequency",
          ],
          correctAnswer: 1,
          explanation:
            "Below the knee threshold, applied voltage is insufficient to overcome the built-in electric field of the P-N junction. Only negligible minority carrier leakage current flows.",
        },
        {
          id: 2,
          question:
            "When supply voltage is increased significantly beyond the knee voltage (e.g. from 3 V to 5 V), how does the LED voltage (V_D) behave?",
          options: [
            "V_D stays relatively clamped near ~1.85 V – 2.0 V while the series resistor absorbs the extra voltage",
            "V_D increases linearly to 5 V",
            "V_D drops to 0 V",
            "V_D becomes negative",
          ],
          correctAnswer: 0,
          explanation:
            "Once strongly conducting, the diode voltage V_D increases very little because of low forward dynamic resistance. By KVL (Vin = V_D + I·R), the series resistor absorbs almost all additional voltage.",
        },
        {
          id: 3,
          question:
            "The inverse slope (ΔV_D / ΔI_D) of the linear portion of the V-I curve above the knee voltage represents the:",
          options: [
            "Dynamic forward resistance (Rf) of the diode",
            "Junction barrier capacitance",
            "Reverse breakdown impedance",
            "Thermal noise factor",
          ],
          correctAnswer: 0,
          explanation:
            "By Ohm's differential definition, Rf = dV / dI. The reciprocal slope of the forward-conduction region gives the dynamic forward resistance of the semiconductor diode.",
        },
      ],
      references: [
        {
          title: "IIT Roorkee Virtual Labs — Optical Communication: Characterization of LED",
          url: "https://oc-iitr.vlabs.ac.in/exp/characterization-led/",
          author: "Indian Institute of Technology Roorkee",
        },
        {
          title: "Optical Fiber Communications: Principles and Practice (3rd Edition)",
          author: "John M. Senior, Prentice Hall",
        },
        {
          title: "Semiconductor Optoelectronic Devices",
          author: "Pallab Bhattacharya, Pearson Education",
        },
      ],
    },
  },

  {
    id: "characterization-laser-diode",
    slug: "characterization-laser-diode",
    title: "Characterization of Laser Diode",
    shortTitle: "2. Laser Diode Characterization",
    category: "optical-communication",
    categoryTitle: "Optical Communication",
    shortObjective:
      "Study light output power versus forward current (L-I) characteristics and determine lasing threshold current (Ith).",
    difficulty: "Intermediate",
    estimatedDuration: "30–40 min",
    status: "available",
    path: "/labs/optical-communication/characterization-laser-diode",
    iitrReferenceUrl: "https://oc-iitr.vlabs.ac.in/List%20of%20experiments.html",
    manual: {
      aim: "To study the Light-Current (L-I) and Voltage-Current (V-I) characteristics of a semiconductor laser diode and determine its threshold current (Ith) and slope efficiency (η).",
      theory: {
        overview:
          "A semiconductor Laser Diode (LD) operates on the principle of stimulated emission within an optical resonant cavity (Fabry-Perot cavity). Below the threshold current (I < Ith), it operates like an LED emitting spontaneous, incoherent light. Above threshold current (I > Ith), stimulated emission dominates and coherent, monochromatic, directional laser light is emitted.",
        keyPoints: [
          "Threshold Current (Ith): The minimum injection current required for stimulated optical gain to overcome internal cavity losses (absorption, scattering, and facet mirror transmission).",
          "Slope Efficiency (η): The rate of increase in optical output power per unit increase in injected current above threshold: η = ΔP / ΔI (mW/mA).",
          "Lasing Cavity: Cleaved semiconductor crystal facets act as partial mirrors forming the optical feedback cavity.",
        ],
        equations: [
          {
            title: "Optical Output Power Above Threshold",
            formula: "P_opt = η_ext · (h·c / (q·λ)) · (I - I_th)",
            description:
              "Shows that optical power scales linearly with injection current above threshold current Ith.",
          },
          {
            title: "Differential Quantum Efficiency",
            formula: "η_d = (q / E_g) · (ΔP_opt / ΔI)",
            description:
              "Measures the fraction of injected electron-hole pairs that generate emitted laser photons.",
          },
        ],
      },
      apparatus: [
        {
          name: "Semiconductor Laser Diode Module",
          specification: "λ = 650 nm (Visible Red), Ith ≈ 15–25 mA",
          quantity: 1,
        },
        {
          name: "Regulated Current Source / Power Supply",
          specification: "0 – 50 mA Adjustable DC",
          quantity: 1,
        },
        {
          name: "Optical Power Meter / Photodetector",
          specification: "Calibrated 0 – 10 mW Range",
          quantity: 1,
        },
        { name: "Digital Multimeter", specification: "DC Voltage & Current", quantity: 2 },
      ],
      circuitSetupDescription:
        "Connect the variable current source to the Laser Diode in forward-bias with series current limiting. Align the optical emission facet directly with the photodetector / optical power meter head at a fixed distance (1 cm) inside an enclosed optical bench.",
      procedureSteps: [
        "1. Study the threshold current concept and optical cavity amplification.",
        "2. Complete the Pre-Test on stimulated emission and Fabry-Perot cavities.",
        "3. Configure the forward-biased laser driver circuit.",
        "4. Adjust injection current from 0 mA to 40 mA in increments of 2 mA.",
        "5. Measure optical output power P (mW) on the optical power meter.",
        "6. Plot the L-I curve (Optical Power vs Injected Current).",
        "7. Identify the kink in the curve denoting the lasing threshold current Ith.",
        "8. Calculate external differential quantum efficiency from the linear post-threshold slope.",
      ],
      preTestQuestions: [
        {
          id: 1,
          question:
            "What fundamental optical process distinguishes laser emission from LED emission?",
          options: [
            "Spontaneous Emission",
            "Stimulated Emission",
            "Photoelectric Absorption",
            "Auger Recombination",
          ],
          correctAnswer: 1,
          explanation:
            "Laser emission is governed by stimulated emission, in which an incident photon triggers an excited electron to drop to a lower state, releasing a second identical, coherent photon.",
        },
        {
          id: 2,
          question:
            "What happens to the optical output power of a laser diode when injected current is below threshold (I < Ith)?",
          options: [
            "Laser emits high-power coherent beams",
            "Laser emits faint, incoherent spontaneous light like an LED",
            "Optical output power is strictly zero",
            "The laser diode conducts in reverse bias",
          ],
          correctAnswer: 1,
          explanation:
            "Below threshold, optical gain is insufficient to overcome cavity losses, so stimulated emission cannot sustain. The diode behaves as a weak spontaneous LED.",
        },
        {
          id: 3,
          question:
            "What physical mechanism provides optical feedback in a semiconductor Fabry-Perot laser diode?",
          options: [
            "Cleaved semiconductor end facets acting as partially reflecting mirrors",
            "External magnetic focusing coils",
            "A prism beam splitter",
            "A series inductor",
          ],
          correctAnswer: 0,
          explanation:
            "The natural refractive index mismatch between semiconductor (n ≈ 3.5) and air (n ≈ 1) provides ~30% Fresnel reflectivity at cleaved crystal facets, forming the resonant cavity.",
        },
        {
          id: 4,
          question:
            "What condition is required to achieve population inversion in a semiconductor laser diode?",
          options: [
            "The quasi-Fermi level separation (E_Fc - E_Fv) must exceed the photon bandgap energy h·ν",
            "The diode must be maintained at absolute zero temperature",
            "The junction must be reverse biased with high breakdown voltage",
            "The series resistance of the circuit must be zero",
          ],
          correctAnswer: 0,
          explanation:
            "Under strong forward bias, high carrier injection pushes the quasi-Fermi levels into the conduction and valence bands such that (E_Fc - E_Fv) > h·ν, ensuring stimulated emission exceeds optical absorption.",
        },
        {
          id: 5,
          question:
            "How does forward bias lower the energy barrier across the laser diode's p-n junction?",
          options: [
            "Forward bias opposes the built-in potential barrier, narrowing depletion width and enabling electron-hole injection",
            "Forward bias turns the semiconductor into a physical vacuum",
            "Forward bias increases the built-in barrier to prevent current flow",
            "Forward bias switches the dopants from p-type to n-type",
          ],
          correctAnswer: 0,
          explanation:
            "An applied forward bias V_f reduces the built-in potential (V_bi - V_f), allowing large numbers of electrons and holes to inject across the junction into the active recombination region.",
        },
      ],
      postTestQuestions: [
        {
          id: 1,
          question: "On an L-I characteristic plot, how is the threshold current (Ith) identified?",
          options: [
            "At the point where the curve crosses zero voltage",
            "At the sharp knee/elbow where optical power begins rising steeply and linearly",
            "At the maximum power saturation point",
            "At half the breakdown voltage",
          ],
          correctAnswer: 1,
          explanation:
            "The threshold current Ith is the abrupt inflection point where the slope changes from low (spontaneous) to steep linear (stimulated lasing).",
        },
        {
          id: 2,
          question: "The slope (ΔP / ΔI) of the L-I curve above threshold current represents:",
          options: [
            "Slope efficiency (differential quantum efficiency)",
            "Thermal leakage coefficient",
            "Depletion capacitance",
            "Photodetector dark current",
          ],
          correctAnswer: 0,
          explanation:
            "Above threshold, the rate of optical power increase per unit injection current (mW/mA) defines the laser diode's slope efficiency η.",
        },
        {
          id: 3,
          question:
            "Why does laser light exhibit narrow spectral linewidth compared to broad LED emission?",
          options: [
            "Resonant optical cavity mode selection amplifies specific longitudinal frequencies",
            "Lasers use higher voltage batteries",
            "Lasers absorb all optical harmonics",
            "LEDs have lower thermal conductivity",
          ],
          correctAnswer: 0,
          explanation:
            "The Fabry-Perot cavity creates constructive interference only for discrete resonant longitudinal cavity modes, producing monochromatic, coherent output.",
        },
        {
          id: 4,
          question:
            "What happens to the carrier density inside the active region when injection current exceeds threshold (I > Ith)?",
          options: [
            "It clamps at the threshold density N_th because stimulated lifetime drops to picoseconds",
            "It increases exponentially towards infinity",
            "It drops abruptly to zero",
            "It oscillates randomly between positive and negative values",
          ],
          correctAnswer: 0,
          explanation:
            "Above threshold, round-trip optical gain is clamped at the loss value, which pins the carrier density at N_th. Any extra injected carriers are immediately converted into stimulated photons.",
        },
        {
          id: 5,
          question:
            "Comparing LED-region and LASER-region operation, which characteristic is observed above threshold?",
          options: [
            "High slope efficiency (~0.35 mW/mA), narrow beam divergence, and high coherence",
            "Low slope efficiency (~0.045 mW/mA), broad 35° divergence, and incoherent light",
            "Decreasing optical output with increasing current",
            "Zero forward voltage across the terminals",
          ],
          correctAnswer: 0,
          explanation:
            "Above threshold, the device operates in the lasing regime characterized by a steep slope efficiency (~0.35 mW/mA), narrow collimated beam divergence, and phase coherence.",
        },
      ],
      references: [
        {
          title: "IIT Roorkee Virtual Labs — Semiconductor Laser Characterization",
          url: "https://oc-iitr.vlabs.ac.in/List%20of%20experiments.html",
        },
        { title: "Optoelectronics and Photonics: Principles and Practices", author: "S.O. Kasap" },
      ],
    },
  },

  {
    id: "laser-fiber-intensity-modulation",
    slug: "laser-fiber-intensity-modulation",
    title: "Intensity Modulation of Laser Through Fiber",
    shortTitle: "3. Fiber Intensity Modulation",
    category: "optical-communication",
    categoryTitle: "Optical Communication",
    shortObjective:
      "Demonstrate analog and digital intensity modulation of a laser diode and transmission through optical fiber.",
    difficulty: "Advanced",
    estimatedDuration: "35–45 min",
    status: "available",
    path: "/labs/optical-communication/laser-fiber-intensity-modulation",
    iitrReferenceUrl: "https://oc-iitr.vlabs.ac.in/List%20of%20experiments.html",
    manual: {
      aim: "To demonstrate optical intensity modulation (IM/DD) of a semiconductor laser source with an electrical information signal, transmit through an optical fiber link, and recover the signal at a PIN photodetector.",
      theory: {
        overview:
          "Intensity Modulation with Direct Detection (IM/DD) is the foundational modulation technique in optical telecommunications. The electrical information signal m(t) modulates the drive current of a DC-biased laser diode above its threshold current (I_bias > Ith). The modulated optical beam propagates through an optical fiber link suffering attenuation (α dB/km) and is detected by a square-law PIN photodetector: I_photo(t) = R_resp · P_rec(t).",
        keyPoints: [
          "Bias Current Point: The laser must be pre-biased above Ith to prevent signal clipping and non-linear distortion.",
          "Modulation Index (m): Ratio of peak AC signal current to DC bias current: m = I_m / (I_bias - Ith).",
          "Fiber Attenuation: Optical power decays exponentially with distance: P(L) = P(0) · 10^(-α·L / 10).",
        ],
        equations: [
          {
            title: "Modulated Laser Drive Current",
            formula: "I(t) = I_bias + I_m · sin(2π·f_m·t)",
            description: "Superimposes sinusoidal electrical information onto DC bias current.",
          },
          {
            title: "Photodetector Demodulated Current",
            formula: "I_det(t) = R_resp · P_opt(t)",
            description:
              "PIN photodiode responsivity R_resp (A/W) recovers the original modulating waveform.",
          },
        ],
      },
      apparatus: [
        {
          name: "Laser Diode Transmitter Module",
          specification: "650 nm with built-in bias tee and analog modulation input",
          quantity: 1,
        },
        {
          name: "Function Generator",
          specification: "100 Hz – 1 MHz Sine & Square wave, 0–2 Vpp",
          quantity: 1,
        },
        {
          name: "Plastic Optical Fiber (POF) Patchcord",
          specification: "1 mm core, Length = 1 m & 10 m, SMA connectors",
          quantity: 2,
        },
        {
          name: "Optical Receiver / PIN Photodiode",
          specification: "Silicon PIN detector with transimpedance amplifier",
          quantity: 1,
        },
        {
          name: "Dual-Channel Oscilloscope",
          specification: "20 MHz Bandwidth (CH1 = Tx, CH2 = Rx)",
          quantity: 1,
        },
      ],
      circuitSetupDescription:
        "Connect the function generator output to the Laser Transmitter modulation input. Connect the laser optical output port to the optical fiber patchcord SMA connector. Connect the other end of the fiber to the receiver photodetector input. Display transmitted signal on Oscilloscope CH1 and received signal on CH2.",
      procedureSteps: [
        "1. Review the principles of Intensity Modulation and Direct Detection (IM/DD).",
        "2. Complete the Pre-Test on optical modulation and receiver responsivity.",
        "3. Set laser DC bias current above threshold (I_bias = 25 mA).",
        "4. Apply a 1 kHz, 500 mVpp sinusoidal signal from the function generator.",
        "5. Observe transmitted optical signal on Oscilloscope CH1.",
        "6. Connect the 1-meter optical fiber patchcord to the receiver photodiode.",
        "7. Observe the recovered analog electrical waveform on Oscilloscope CH2.",
        "8. Vary the modulation frequency and measure frequency response and signal attenuation.",
      ],
      preTestQuestions: [
        {
          id: 1,
          question:
            "Why must the laser diode be DC-biased above threshold before applying an AC modulating signal?",
          options: [
            "To prevent the laser from shutting off during negative signal swings and causing severe distortion",
            "To increase the fiber refractive index",
            "To eliminate all optical attenuation",
            "To convert the optical wavelength to infrared",
          ],
          correctAnswer: 0,
          explanation:
            "If the laser drops below threshold Ith during the negative cycle of the input wave, lasing ceases, producing catastrophic clipping distortion.",
        },
        {
          id: 2,
          question: "What parameter defines the attenuation rate of an optical fiber link?",
          options: [
            "Loss coefficient α measured in dB/km",
            "Capacitance per unit length in pF/m",
            "Magnetic permeability in H/m",
            "Thermal noise index in Kelvin",
          ],
          correctAnswer: 0,
          explanation:
            "Fiber loss is quantified by the attenuation coefficient α (dB/km), governed by Rayleigh scattering and material absorption.",
        },
        {
          id: 3,
          question:
            "What type of receiver photodetector is commonly employed for direct intensity detection?",
          options: [
            "PIN photodiode or Avalanche Photodiode (APD) / Phototransistor",
            "Gunn diode",
            "Zener diode",
            "Tunnel diode",
          ],
          correctAnswer: 0,
          explanation:
            "PIN photodiodes, APDs, and phototransistors convert incoming optical photon energy into electron-hole pairs, generating proportional photocurrent.",
        },
        {
          id: 4,
          question:
            "What property of the optical light wave is varied by the information signal in Intensity Modulation?",
          options: [
            "The optical radiant flux / power (intensity) of the emitted light",
            "The fundamental frequency of the light wave",
            "The spatial polarization angle of the wave",
            "The atomic weight of the semiconductor substrate",
          ],
          correctAnswer: 0,
          explanation:
            "Intensity Modulation varies the optical radiant flux (power) emitted by the source in direct correspondence to the modulating baseband voltage.",
        },
        {
          id: 5,
          question:
            "How does light propagate through the core of an optical fiber cable without escaping?",
          options: [
            "Via Total Internal Reflection (TIR) at the core-cladding boundary",
            "Through external copper shielding currents",
            "By magnetic levitation inside the glass",
            "Via gravitational lensing along the cable jacket",
          ],
          correctAnswer: 0,
          explanation:
            "Because the core has a higher refractive index than the surrounding cladding (n1 > n2), light entering within the acceptance cone undergoes continuous Total Internal Reflection.",
        },
      ],
      postTestQuestions: [
        {
          id: 1,
          question:
            "In direct detection optical receivers, what is the mathematical relationship between received optical power and generated photocurrent?",
          options: [
            "Photocurrent is proportional to the square root of optical power",
            "Photocurrent is directly proportional to received optical power (I = R · P)",
            "Photocurrent is independent of optical power",
            "Photocurrent is inversely proportional to optical power",
          ],
          correctAnswer: 1,
          explanation:
            "A semiconductor photodiode produces electron-hole pairs proportional to incoming photon flux: I_photo = Responsivity · Power.",
        },
        {
          id: 2,
          question:
            "If an optical fiber has an attenuation of 3 dB, what fraction of optical power reaches the detector?",
          options: [
            "Approximately 50% (half power)",
            "Approximately 10% (one-tenth power)",
            "Exactly 100% (zero loss)",
            "Approximately 1%",
          ],
          correctAnswer: 0,
          explanation:
            "A 3 dB attenuation corresponds to a power ratio of 10^(-3/10) ≈ 0.501, meaning exactly half of the optical power is transmitted.",
        },
        {
          id: 3,
          question: "What happens if modulation amplitude Im exceeds (I_bias - Ith)?",
          options: [
            "Over-modulation occurs, clipping the bottom peaks of the optical waveform",
            "The optical beam doubles in frequency",
            "The photodetector explodes",
            "The transmission speed exceeds c",
          ],
          correctAnswer: 0,
          explanation:
            "When Im > (I_bias - Ith), the instantaneous drive current drops below Ith during negative valleys, extinguishing stimulated lasing and clipping the output.",
        },
        {
          id: 4,
          question:
            "How does the receiver circuit convert the detected photocurrent into a measurable voltage?",
          options: [
            "By passing the photocurrent through a load resistor (V = I · R) and amplifying with an op-amp",
            "By storing the charge in a mechanical flywheel",
            "By boiling water in a micro-chamber",
            "By reflecting the light with a mirror",
          ],
          correctAnswer: 0,
          explanation:
            "The photocurrent creates an ohmic voltage drop across a precision load resistor R_load, which is then AC-coupled and amplified for oscilloscope display.",
        },
        {
          id: 5,
          question:
            "Why is direct intensity modulation (IM/DD) widely utilized in practical optical fiber links?",
          options: [
            "It offers simplicity, low cost, and reliable performance without requiring complex optical phase-locking or local oscillators",
            "It completely eliminates the speed-of-light limit",
            "It requires zero electrical power at both transmitter and receiver",
            "It only works with invisible ultraviolet radiation",
          ],
          correctAnswer: 0,
          explanation:
            "Intensity Modulation with Direct Detection (IM/DD) avoids complex optical phase mixers and local laser oscillators, making it the most cost-effective and robust scheme for short-to-medium optical communication links.",
        },
      ],
      references: [
        {
          title: "IIT Roorkee Virtual Labs — Intensity Modulation of Laser Output",
          url: "https://oc-iitr.vlabs.ac.in/List%20of%20experiments.html",
        },
        { title: "Optical Fiber Communications", author: "Gerd Keiser, McGraw-Hill" },
      ],
    },
  },

  // -------------------------------------------------------------
  // CATEGORY 2: DIGITAL ELECTRONICS
  // -------------------------------------------------------------
  {
    id: "logic-gates",
    slug: "logic-gates",
    title: "Logic Gates Verification",
    shortTitle: "4. Logic Gates Verification",
    category: "digital-electronics",
    categoryTitle: "Digital Electronics",
    shortObjective:
      "Verify the truth tables of basic and universal logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR).",
    difficulty: "Beginner",
    estimatedDuration: "20–30 min",
    status: "available",
    path: "/labs/digital-electronics/logic-gates",
    iitrReferenceUrl: "https://vlab.co.in",
    manual: {
      aim: "To verify the operation and truth tables of fundamental and universal digital logic gates: AND, OR, NOT, NAND, NOR, and XOR using digital ICs.",
      theory: {
        overview:
          "Logic gates are the foundational building blocks of digital electronic systems. They perform Boolean operations on binary input signals (Logic 0 = 0 V, Logic 1 = 5 V TTL) producing a single binary output according to Boolean algebra rules. NAND and NOR are known as universal gates because any combinational circuit can be realized solely using either gate type.",
        keyPoints: [
          "AND Gate: Output is HIGH only if all inputs are HIGH (Y = A · B).",
          "OR Gate: Output is HIGH if at least one input is HIGH (Y = A + B).",
          "NOT Gate (Inverter): Inverts logic level (Y = A').",
          "NAND Gate: Negated AND; universal gate (Y = (A · B)').",
          "NOR Gate: Negated OR; universal gate (Y = (A + B)').",
          "XOR Gate (Exclusive OR): Output is HIGH when inputs are unequal (Y = A ⊕ B = A·B' + A'·B).",
        ],
        equations: [
          {
            title: "Boolean AND Function",
            formula: "Y = A · B",
            description: "Binary product operation.",
          },
          {
            title: "De Morgan's First Theorem",
            formula: "(A · B)' = A' + B'",
            description: "Converts NAND to an equivalent negative-OR gate.",
          },
        ],
      },
      apparatus: [
        {
          name: "Digital IC Trainer Kit",
          specification: "Regulated +5 V DC supply, binary toggle switches, logic monitor LEDs",
          quantity: 1,
        },
        {
          name: "TTL Logic ICs",
          specification: "7408 (AND), 7432 (OR), 7404 (NOT), 7400 (NAND), 7486 (XOR)",
          quantity: 5,
        },
        {
          name: "Breadboard & Patch Cords",
          specification: "Single strand wire leads",
          quantity: 1,
        },
      ],
      circuitSetupDescription:
        "Mount the IC on the breadboard. Connect Pin 14 to +5 V (VCC) and Pin 7 to Ground (GND). Connect gate inputs (Pins 1 and 2) to digital input switches A and B. Connect gate output (Pin 3) to an indicator LED with series resistor.",
      procedureSteps: [
        "1. Read the theory of Boolean operations and De Morgan's laws.",
        "2. Complete the Pre-Test on logic gate truth tables.",
        "3. Select a gate IC (e.g. 7408 Quad 2-input AND gate).",
        "4. Apply input combinations (0,0), (0,1), (1,0), (1,1).",
        "5. Observe the output LED state (ON = 1, OFF = 0).",
        "6. Record observed outputs in the Truth Table.",
        "7. Repeat for OR, NOT, NAND, NOR, and XOR gates.",
      ],
      preTestQuestions: [
        {
          id: 1,
          question: "Which of the following logic gates is classified as a Universal Gate?",
          options: ["AND Gate", "OR Gate", "NAND Gate", "XOR Gate"],
          correctAnswer: 2,
          explanation:
            "NAND and NOR gates are universal gates because any arbitrary Boolean expression or logic circuit can be synthesized using only NAND or only NOR gates.",
        },
        {
          id: 2,
          question:
            "In standard 74xx TTL logic families, what voltage range corresponds to a valid Logic HIGH (1)?",
          options: ["2.0 V to 5.0 V", "0.0 V to 0.8 V", "-5.0 V to 0.0 V", "12.0 V to 15.0 V"],
          correctAnswer: 0,
          explanation:
            "TTL logic specifications define Logic HIGH input thresholds from 2.0 V to 5.0 V, while Logic LOW is from 0.0 V to 0.8 V.",
        },
        {
          id: 3,
          question:
            "According to De Morgan's theorem, what is the equivalent representation of (A + B)'?",
          options: ["A' · B'", "A' + B'", "A · B", "(A · B)'"],
          correctAnswer: 0,
          explanation:
            "De Morgan's Second Theorem states that the complement of a logical sum equals the product of the individual complements: (A + B)' = A' · B'.",
        },
      ],
      postTestQuestions: [
        {
          id: 1,
          question: "What are the output states of a 2-input XOR gate for inputs (0,0) and (1,1)?",
          options: ["Both 0", "Both 1", "0 then 1", "1 then 0"],
          correctAnswer: 0,
          explanation:
            "An Exclusive-OR (XOR) gate yields 1 only when the inputs differ. When inputs are equal (0,0 or 1,1), output is 0.",
        },
        {
          id: 2,
          question: "Which IC number corresponds to the standard TTL Quad 2-Input NAND gate?",
          options: ["7400", "7408", "7432", "7404"],
          correctAnswer: 0,
          explanation:
            "The 7400 contains four independent 2-input NAND gates in a 14-pin DIP package.",
        },
        {
          id: 3,
          question:
            "If all inputs of an 8-input NAND gate are 1 except one input which is 0, what is the gate output?",
          options: ["Logic 1", "Logic 0", "High Impedance (Z)", "Floating 2.5 V"],
          correctAnswer: 0,
          explanation:
            "By definition, a NAND gate output is 0 ONLY if all inputs are 1. If any input is 0, the product is 0, so the negated output is 1.",
        },
      ],
      references: [
        {
          title: "Digital Logic and Computer Design",
          author: "M. Morris Mano, Pearson Education",
        },
      ],
    },
  },

  {
    id: "half-full-adder",
    slug: "half-full-adder",
    title: "Half & Full Adder Circuits",
    shortTitle: "5. Half & Full Adder",
    category: "digital-electronics",
    categoryTitle: "Digital Electronics",
    shortObjective:
      "Construct and verify binary addition combinational logic circuits producing Sum and Carry.",
    difficulty: "Intermediate",
    estimatedDuration: "30–40 min",
    status: "available",
    path: "/labs/digital-electronics/half-full-adder",
    iitrReferenceUrl: "https://vlab.co.in",
    manual: {
      aim: "To design, construct, and verify the truth table of binary Half Adder and Full Adder combinational logic circuits.",
      theory: {
        overview:
          "Binary adders are essential arithmetic combinational logic circuits used in computer Arithmetic Logic Units (ALUs). A Half Adder adds two single-bit inputs (A and B) producing Sum (S) and Carry (C). A Full Adder accounts for a carry-in bit from a previous lower significant bit position (Cin) in addition to operands A and B.",
        keyPoints: [
          "Half Adder Equations: Sum = A ⊕ B, Carry = A · B.",
          "Full Adder Equations: Sum = A ⊕ B ⊕ Cin, Carry = (A · B) + (Cin · (A ⊕ B)).",
          "Full Adder Construction: Can be implemented using two cascaded Half Adders and one OR gate.",
        ],
        equations: [
          {
            title: "Half Adder Sum & Carry",
            formula: "Sum = A ⊕ B,  Carry = A · B",
            description: "Boolean logic for adding two single binary bits.",
          },
          {
            title: "Full Adder Carry Out",
            formula: "C_out = (A · B) + (C_in · (A ⊕ B))",
            description: "Majority function determining if addition generates an overflow carry.",
          },
        ],
      },
      apparatus: [
        { name: "Digital IC Trainer Kit", specification: "+5 V DC, input toggles", quantity: 1 },
        { name: "IC 7486 (Quad 2-Input XOR)", specification: "14-pin DIP TTL", quantity: 1 },
        { name: "IC 7408 (Quad 2-Input AND)", specification: "14-pin DIP TTL", quantity: 1 },
        { name: "IC 7432 (Quad 2-Input OR)", specification: "14-pin DIP TTL", quantity: 1 },
        { name: "Connecting Wires", specification: "Patch cords", quantity: 10 },
      ],
      circuitSetupDescription:
        "Connect inputs A and B to the XOR gate for Sum and to an AND gate for Carry. For Full Adder, feed the intermediate Half Adder sum and Cin to a second XOR gate, combining partial carries with an OR gate.",
      procedureSteps: [
        "1. Understand binary addition and carry propagation principles.",
        "2. Wire the Half Adder circuit using 7486 (XOR) and 7408 (AND).",
        "3. Apply all 4 input combinations: (0,0), (0,1), (1,0), (1,1).",
        "4. Record observed Sum and Carry outputs.",
        "5. Wire the Full Adder circuit incorporating carry-in (Cin).",
        "6. Test all 8 input combinations (000 to 111) and record the complete 8-row truth table.",
      ],
      preTestQuestions: [
        {
          id: 1,
          question: "What are the Sum and Carry outputs of a Half Adder when both inputs are 1?",
          options: [
            "Sum = 0, Carry = 1",
            "Sum = 1, Carry = 0",
            "Sum = 1, Carry = 1",
            "Sum = 0, Carry = 0",
          ],
          correctAnswer: 0,
          explanation: "In binary: 1 + 1 = 10_2 (decimal 2). Thus Sum = 0 and Carry = 1.",
        },
        {
          id: 2,
          question: "Which logic gate generates the Sum output in a binary Half Adder?",
          options: ["XOR Gate", "AND Gate", "OR Gate", "NOR Gate"],
          correctAnswer: 0,
          explanation:
            "The Sum bit evaluates to 1 when inputs differ (0+1=1, 1+0=1), which is the exact definition of an Exclusive-OR (XOR) operation.",
        },
        {
          id: 3,
          question:
            "What is the total number of input combinations in a 3-input Full Adder truth table?",
          options: [
            "8 combinations (2^3)",
            "4 combinations (2^2)",
            "16 combinations (2^4)",
            "6 combinations",
          ],
          correctAnswer: 0,
          explanation:
            "With three binary inputs (A, B, Cin), there are 2^3 = 8 possible permutations from 000_2 to 111_2.",
        },
      ],
      postTestQuestions: [
        {
          id: 1,
          question: "How many Half Adders and OR gates are required to construct one Full Adder?",
          options: [
            "2 Half Adders and 1 OR gate",
            "1 Half Adder and 2 OR gates",
            "3 Half Adders",
            "2 Half Adders and 2 AND gates",
          ],
          correctAnswer: 0,
          explanation:
            "A standard Full Adder is synthesized from two cascaded Half Adders and one OR gate to combine the two partial carries.",
        },
        {
          id: 2,
          question:
            "When inputs A=1, B=1, and Cin=1 are applied to a Full Adder, what are the outputs?",
          options: [
            "Sum = 1, Carry = 1 (1+1+1 = 11_2)",
            "Sum = 0, Carry = 1",
            "Sum = 1, Carry = 0",
            "Sum = 0, Carry = 0",
          ],
          correctAnswer: 0,
          explanation: "1 + 1 + 1 = 3 in decimal, which is binary 11_2: Sum = 1 and Cout = 1.",
        },
        {
          id: 3,
          question: "What is the propagation delay limitation of a standard Ripple Carry Adder?",
          options: [
            "Carry bits must ripple sequentially through each full adder stage from LSB to MSB",
            "It requires negative power supplies",
            "It only adds even numbers",
            "Its clock speed cannot exceed 1 Hz",
          ],
          correctAnswer: 0,
          explanation:
            "In a ripple carry adder, higher order stages must wait for the carry bit to propagate from preceding lower stages, introducing proportional O(N) latency.",
        },
      ],
      references: [
        { title: "Digital Principles and Applications", author: "Malvino and Leach, McGraw-Hill" },
      ],
    },
  },

  {
    id: "flip-flops",
    slug: "flip-flops",
    title: "Flip-Flop Circuits (SR, JK, D, T)",
    shortTitle: "6. Flip-Flop Circuits",
    category: "digital-electronics",
    categoryTitle: "Digital Electronics",
    shortObjective:
      "Analyze sequential bistable multivibrators: Set-Reset, Jack-Kilby, Data, and Toggle flip-flops.",
    difficulty: "Advanced",
    estimatedDuration: "35–45 min",
    status: "available",
    path: "/labs/digital-electronics/flip-flops",
    iitrReferenceUrl: "https://vlab.co.in",
    manual: {
      aim: "To construct, trigger, and verify the characteristic state tables of SR, D, JK, and T flip-flops using digital logic gates and ICs.",
      theory: {
        overview:
          "Unlike combinational circuits, sequential logic circuits possess internal memory. A flip-flop is a bistable multivibrator capable of storing 1 bit of binary information (State Q = 0 or 1). State transitions occur synchronously in response to clock pulse edges (positive or negative edge-triggered).",
        keyPoints: [
          "SR Flip-Flop: S=1 Sets Q=1; R=1 Resets Q=0; S=R=1 is an invalid/forbidden state.",
          "JK Flip-Flop: Eliminates the forbidden state; J=K=1 toggles the output (Q_next = Q').",
          "D Flip-Flop (Data): Delays input by 1 clock cycle; prevents invalid states (Q_next = D).",
          "T Flip-Flop (Toggle): T=1 toggles output on clock pulse; foundational for binary counters.",
        ],
        equations: [
          {
            title: "JK Flip-Flop Characteristic Equation",
            formula: "Q(t+1) = J · Q' + K' · Q",
            description: "Predicts next state based on current state Q and inputs J and K.",
          },
          {
            title: "D Flip-Flop Characteristic Equation",
            formula: "Q(t+1) = D",
            description: "Next state mirrors current data input D on active clock edge.",
          },
        ],
      },
      apparatus: [
        {
          name: "Digital IC Trainer Kit",
          specification: "Single clock pulse generator, LED indicators",
          quantity: 1,
        },
        {
          name: "IC 7476 (Dual JK Flip-Flop with Preset/Clear)",
          specification: "16-pin DIP",
          quantity: 1,
        },
        { name: "IC 7474 (Dual D Flip-Flop)", specification: "14-pin DIP", quantity: 1 },
        { name: "Patch leads", specification: "Connecting wires", quantity: 8 },
      ],
      circuitSetupDescription:
        "Connect VCC (+5 V) and GND to the IC. Connect clock pin to a debounced manual pulser switch. Connect Q and Q' outputs to logic status monitor LEDs.",
      procedureSteps: [
        "1. Understand the difference between combinational and clocked sequential logic.",
        "2. Wire the 7476 JK Flip-Flop on the breadboard.",
        "3. Test synchronous Set (J=1, K=0), Reset (J=0, K=1), and Memory (J=0, K=0) modes.",
        "4. Verify the Toggle condition by setting J=1, K=1 and pulsing the clock.",
        "5. Wire a D Flip-Flop (7474) and verify that Q follows D upon clock arrival.",
        "6. Record full characteristic state tables for all configurations.",
      ],
      preTestQuestions: [
        {
          id: 1,
          question:
            "What is the primary condition that makes the SR flip-flop input S=1, R=1 undesirable?",
          options: [
            "It creates an ambiguous/forbidden race condition where outputs Q and Q' are both 0",
            "It causes an immediate short circuit to ground",
            "It forces the clock frequency to double",
            "It consumes infinite DC current",
          ],
          correctAnswer: 0,
          explanation:
            "In an SR latch, S=1 and R=1 violates the requirement that Q and Q' be complementary, leading to an indeterminate state when inputs return to 0.",
        },
        {
          id: 2,
          question:
            "How does a D (Data) flip-flop eliminate the invalid state found in an SR latch?",
          options: [
            "By ensuring the inputs are always complementary through an internal inverter: R = S'",
            "By running at twice the clock speed",
            "By removing the ground connection",
            "By using four separate power supplies",
          ],
          correctAnswer: 0,
          explanation:
            "A D flip-flop ties S = D and R = D' using an inverter, ensuring S and R can never both be 1 simultaneously.",
        },
        {
          id: 3,
          question:
            "What is the key functional difference between a latch and an edge-triggered flip-flop?",
          options: [
            "Latches are level-sensitive while flip-flops update state only on clock transition edges",
            "Latches only store zeros",
            "Flip-flops cannot store data",
            "Latches require an external inductor",
          ],
          correctAnswer: 0,
          explanation:
            "A latch is transparent whenever the enable signal is HIGH, whereas an edge-triggered flip-flop samples inputs only on the instantaneous rising or falling clock edge.",
        },
      ],
      postTestQuestions: [
        {
          id: 1,
          question:
            "In a JK flip-flop, what is the next state Q(t+1) when J=1 and K=1 upon receiving an active clock pulse?",
          options: [
            "Q(t+1) = Q'(t) [Toggles]",
            "Q(t+1) = 1 [Always Set]",
            "Q(t+1) = 0 [Always Reset]",
            "Q(t+1) = Indeterminate",
          ],
          correctAnswer: 0,
          explanation:
            "When J=1 and K=1, the JK flip-flop toggles its output to the opposite logic level on every clock pulse.",
        },
        {
          id: 2,
          question: "How is a T (Toggle) flip-flop constructed from a standard JK flip-flop?",
          options: [
            "By connecting inputs J and K together to a single T input: J = K = T",
            "By tying J to VCC and leaving K floating",
            "By connecting Q output back to ground",
            "By removing the clock line",
          ],
          correctAnswer: 0,
          explanation:
            "Tying J and K together creates a Toggle flip-flop: when T=0, J=K=0 (Hold); when T=1, J=K=1 (Toggle).",
        },
        {
          id: 3,
          question:
            "If a 10 kHz clock signal is applied to a T flip-flop configured in Toggle mode (T=1), what is the frequency of output Q?",
          options: ["5 kHz (Divide-by-2 frequency divider)", "10 kHz", "20 kHz", "0 Hz (DC)"],
          correctAnswer: 0,
          explanation:
            "Because the output toggles once every clock pulse, it takes two clock cycles for Q to complete one full cycle (HIGH then LOW), dividing input frequency by 2.",
        },
      ],
      references: [
        {
          title: "Digital Design: With an Introduction to the Verilog HDL",
          author: "M. Morris Mano & Michael Ciletti",
        },
      ],
    },
  },

  // -------------------------------------------------------------
  // CATEGORY 3: COMMUNICATION SYSTEMS
  // -------------------------------------------------------------
  {
    id: "am-modulation",
    slug: "am-modulation",
    title: "AM Modulation & Envelope Detection",
    shortTitle: "7. AM Modulation",
    category: "communication-systems",
    categoryTitle: "Communication Systems",
    shortObjective:
      "Generate Amplitude Modulated (AM) waves, calculate modulation index (m), and recover audio via envelope detection.",
    difficulty: "Intermediate",
    estimatedDuration: "30–40 min",
    status: "available",
    path: "/labs/communication-systems/am-modulation",
    iitrReferenceUrl: "https://vlab.co.in",
    manual: {
      aim: "To generate a Double Sideband Full Carrier (DSB-FC) Amplitude Modulated signal, measure modulation index (m) under under-, critical-, and over-modulation, and demodulate using a diode envelope detector.",
      theory: {
        overview:
          "In Amplitude Modulation (AM), the instantaneous amplitude of a high-frequency sinusoidal carrier wave c(t) = Ac·cos(2π·fc·t) is varied linearly with the instantaneous value of a low-frequency message baseband signal m(t) = Am·cos(2π·fm·t). The resulting spectrum consists of the carrier and two symmetric sidebands (USB and LSB): Bandwidth = 2·fm.",
        keyPoints: [
          "Modulation Index (m): Defined as m = Am / Ac. For distortionless envelope detection, m ≤ 1.",
          "Under-modulation (m < 1): Clear envelope; easily recovered without distortion.",
          "Critical modulation (m = 1): 100% modulation with maximum efficiency.",
          "Over-modulation (m > 1): Carrier envelope crosses zero, leading to severe envelope detector distortion.",
        ],
        equations: [
          {
            title: "Standard AM Time-Domain Waveform",
            formula: "s(t) = A_c · [1 + m · cos(2π·f_m·t)] · cos(2π·f_c·t)",
            description: "Mathematical expression for standard DSB-FC amplitude modulated wave.",
          },
          {
            title: "Modulation Index from Trapezoid / Envelope",
            formula: "m = (V_max - V_min) / (V_max + V_min)",
            description:
              "Direct oscilloscope measurement formula using peak and trough envelope amplitudes.",
          },
        ],
      },
      apparatus: [
        {
          name: "AM Modulator Trainer Kit",
          specification: "Balanced modulator / analog multiplier IC AD633",
          quantity: 1,
        },
        {
          name: "Dual Audio Signal Generator",
          specification: "Carrier fc = 100 kHz, Message fm = 1 kHz",
          quantity: 1,
        },
        {
          name: "Diode Envelope Demodulator",
          specification: "Germanium diode (1N34A), R = 10 kΩ, C = 0.01 µF",
          quantity: 1,
        },
        {
          name: "Dual-Channel Oscilloscope",
          specification: "20 MHz with XY trapezoid mode",
          quantity: 1,
        },
      ],
      circuitSetupDescription:
        "Connect message signal generator (1 kHz) to modulating input and RF carrier generator (100 kHz) to carrier input. Connect AM output to Oscilloscope CH1 and to the input of the diode envelope detector. Connect demodulated filter output to CH2.",
      procedureSteps: [
        "1. Study the mathematical representation and frequency spectrum of AM.",
        "2. Complete the Pre-Test on AM bandwidth and modulation index.",
        "3. Configure carrier frequency fc = 100 kHz, Ac = 2 V.",
        "4. Configure modulating message frequency fm = 1 kHz, Am = 1 V (m = 0.5).",
        "5. Observe the modulated AM waveform on the oscilloscope.",
        "6. Measure Vmax and Vmin to compute modulation index m.",
        "7. Increase Am to 2 V (m = 1.0) and 3 V (m = 1.5, overmodulation).",
        "8. Pass the signal through the diode envelope detector and observe audio recovery.",
      ],
      preTestQuestions: [
        {
          id: 1,
          question:
            "What is the total transmission bandwidth of a standard AM DSB-FC wave modulated by maximum audio frequency fm?",
          options: ["BW = fm", "BW = 2 · fm", "BW = 4 · fm", "BW = fc / 2"],
          correctAnswer: 1,
          explanation:
            "Standard AM comprises carrier fc, lower sideband (fc - fm), and upper sideband (fc + fm). The total bandwidth is (fc + fm) - (fc - fm) = 2·fm.",
        },
        {
          id: 2,
          question:
            "How is the modulation index m defined in terms of carrier amplitude Ac and modulating amplitude Am?",
          options: ["m = Am / Ac", "m = Ac / Am", "m = Am · Ac", "m = Ac + Am"],
          correctAnswer: 0,
          explanation:
            "The modulation index m equals the ratio of peak modulating message amplitude to unmodulated carrier amplitude: m = Am / Ac.",
        },
        {
          id: 3,
          question:
            "In a standard AM spectrum, where are the two information-bearing sidebands situated?",
          options: [
            "At fc - fm (Lower Sideband) and fc + fm (Upper Sideband)",
            "At 2·fc and 3·fc",
            "At 0 Hz and fm",
            "Only at the carrier frequency fc",
          ],
          correctAnswer: 0,
          explanation:
            "Trigonometric product expansion cos(A)·cos(B) yields two sum-and-difference sideband frequencies centered about the carrier: fc ± fm.",
        },
      ],
      postTestQuestions: [
        {
          id: 1,
          question:
            "What undesirable effect occurs in an envelope detector receiver when modulation index m exceeds 1 (overmodulation)?",
          options: [
            "Diagonal clipping and envelope phase inversion distortion",
            "Carrier frequency shifts to zero",
            "Power output drops to zero",
            "Bandwidth triples",
          ],
          correctAnswer: 0,
          explanation:
            "When m > 1, the envelope crosses the zero axis and inverts phase, causing severe harmonic distortion in simple diode envelope detectors.",
        },
        {
          id: 2,
          question:
            "At 100% modulation (m = 1.0), what percentage of total transmitted power is contained in the two sidebands?",
          options: ["33.3% (One-third)", "50.0% (Half)", "100.0%", "10.0%"],
          correctAnswer: 0,
          explanation:
            "Total power Pt = Pc(1 + m^2/2). For m=1, Pt = 1.5·Pc. The sidebands hold 0.5·Pc, which is 0.5 / 1.5 = 33.3% of total power.",
        },
        {
          id: 3,
          question:
            "How is the modulation index m calculated from oscilloscope Vmax and Vmin envelope measurements?",
          options: [
            "m = (Vmax - Vmin) / (Vmax + Vmin)",
            "m = Vmax / Vmin",
            "m = (Vmax + Vmin) / 2",
            "m = Vmax - Vmin",
          ],
          correctAnswer: 0,
          explanation:
            "Because Vmax = Ac(1+m) and Vmin = Ac(1-m), the difference is 2·Ac·m and the sum is 2·Ac, giving m = (Vmax - Vmin) / (Vmax + Vmin).",
        },
      ],
      references: [
        {
          title: "Electronic Communication Systems",
          author: "George Kennedy and Bernard Davis, McGraw-Hill",
        },
      ],
    },
  },

  {
    id: "fm-modulation",
    slug: "fm-modulation",
    title: "Frequency Modulation (FM) Characteristics",
    shortTitle: "8. Frequency Modulation",
    category: "communication-systems",
    categoryTitle: "Communication Systems",
    shortObjective:
      "Observe frequency deviation (Δf), modulation index (β), and Carson's rule bandwidth in Frequency Modulation.",
    difficulty: "Intermediate",
    estimatedDuration: "35–45 min",
    status: "available",
    path: "/labs/communication-systems/fm-modulation",
    iitrReferenceUrl: "https://vlab.co.in",
    manual: {
      aim: "To generate a Frequency Modulated (FM) signal using a Voltage-Controlled Oscillator (VCO), measure maximum frequency deviation (Δf), and determine transmission bandwidth using Carson's Rule.",
      theory: {
        overview:
          "In Frequency Modulation (FM), the instantaneous frequency of the sinusoidal carrier wave is varied linearly in direct proportion to the amplitude of the message baseband signal: f(t) = fc + kf·m(t). Unlike AM, the amplitude of an FM signal remains constant, providing superior immunity to atmospheric and amplitude noise.",
        keyPoints: [
          "Frequency Deviation (Δf): Peak departure of carrier frequency from nominal fc: Δf = kf · Am.",
          "Modulation Index (β): Ratio of frequency deviation to modulating frequency: β = Δf / fm.",
          "Carson's Rule Bandwidth: Effective transmission bandwidth encompassing 98% of total power: BW = 2 · (Δf + fm) = 2 · fm · (1 + β).",
        ],
        equations: [
          {
            title: "FM Time-Domain Waveform",
            formula: "s(t) = A_c · cos[2π·f_c·t + β · sin(2π·f_m·t)]",
            description: "Angle modulated waveform with constant carrier envelope Ac.",
          },
          {
            title: "Carson's Bandwidth Rule",
            formula: "BW = 2 · (Δf + f_m) = 2 · f_m · (1 + β)",
            description: "Practical transmission bandwidth rule for frequency modulated signals.",
          },
        ],
      },
      apparatus: [
        {
          name: "FM Modulator Trainer Kit",
          specification: "IC 8038 / 566 VCO-based FM generator",
          quantity: 1,
        },
        {
          name: "Audio Frequency Generator",
          specification: "Sine wave 100 Hz – 10 kHz",
          quantity: 1,
        },
        {
          name: "Spectrum Analyzer / Digital Oscilloscope",
          specification: "FFT mode with frequency cursor",
          quantity: 1,
        },
      ],
      circuitSetupDescription:
        "Connect the modulating message generator to the frequency control input pin of the VCO. Connect the VCO output to the oscilloscope and spectrum analyzer.",
      procedureSteps: [
        "1. Study constant-envelope angle modulation and Carson's bandwidth.",
        "2. Complete the Pre-Test on frequency deviation and Bessel sidebands.",
        "3. Set unmodulated carrier frequency fc = 100 kHz.",
        "4. Apply a 1 kHz modulating sine wave and observe the FM wave expanding and compressing.",
        "5. Vary modulating amplitude Am and observe corresponding frequency deviation Δf.",
        "6. Calculate modulation index β = Δf / fm and verify Carson's rule bandwidth.",
      ],
      preTestQuestions: [
        {
          id: 1,
          question:
            "Why does Frequency Modulation (FM) offer superior noise immunity compared to Amplitude Modulation (AM)?",
          options: [
            "Because atmospheric noise primarily disturbs signal amplitude, which is ignored by FM limiters",
            "Because FM requires zero bandwidth",
            "Because FM operates exclusively at DC",
            "Because FM signals carry twice as much optical power",
          ],
          correctAnswer: 0,
          explanation:
            "Most environmental and electrical noise manifests as random amplitude fluctuations. FM receivers use limiters to strip amplitude noise before demodulation without losing information.",
        },
        {
          id: 2,
          question:
            "How is the FM modulation index β calculated from peak frequency deviation Δf and modulating frequency fm?",
          options: ["β = Δf / fm", "β = fm / Δf", "β = Δf · fm", "β = Δf + fm"],
          correctAnswer: 0,
          explanation:
            "By definition, the angle modulation index β represents the peak phase deviation in radians: β = Δf / fm.",
        },
        {
          id: 3,
          question:
            "What mathematical functions govern the amplitudes of individual sideband harmonics in FM spectra?",
          options: [
            "Bessel functions of the first kind: Jn(β)",
            "Fourier transform unit step functions",
            "Laguerre polynomials",
            "Laplace transforms",
          ],
          correctAnswer: 0,
          explanation:
            "The series expansion of an FM wave yields sideband coefficients given by Bessel functions of the first kind: Jn(β).",
        },
      ],
      postTestQuestions: [
        {
          id: 1,
          question:
            "According to Carson's Rule, what is the transmission bandwidth of an FM signal with Δf = 50 kHz and fm = 15 kHz?",
          options: ["BW = 130 kHz", "BW = 65 kHz", "BW = 100 kHz", "BW = 30 kHz"],
          correctAnswer: 0,
          explanation:
            "Carson's Rule: BW = 2 · (Δf + fm) = 2 · (50 kHz + 15 kHz) = 2 · 65 kHz = 130 kHz.",
        },
        {
          id: 2,
          question: "What distinguishes Narrowband FM (NBFM) from Wideband FM (WBFM)?",
          options: [
            "In NBFM, β < 1 and bandwidth approximates 2·fm, whereas in WBFM β >> 1 with many significant sidebands",
            "NBFM has zero frequency deviation",
            "WBFM uses amplitude variations",
            "NBFM only transmits DC signals",
          ],
          correctAnswer: 0,
          explanation:
            "For β < 1, higher-order Bessel harmonics are negligible, so only the first pair of sidebands matters, making NBFM bandwidth ≈ 2·fm.",
        },
        {
          id: 3,
          question: "What is the function of the limiter stage in an FM superheterodyne receiver?",
          options: [
            "To clip off extraneous amplitude variations and atmospheric noise before frequency demodulation",
            "To amplify the carrier to 100 V",
            "To convert FM directly into AM",
            "To invert the frequency spectrum",
          ],
          correctAnswer: 0,
          explanation:
            "Since FM information resides solely in zero-crossing timing and frequency variations, hard limiters strip amplitude noise spikes without corrupting the signal.",
        },
      ],
      references: [
        {
          title: "Communication Systems (5th Edition)",
          author: "Simon Haykin & Michael Moher, Wiley",
        },
      ],
    },
  },

  {
    id: "sampling-pam",
    slug: "sampling-pam",
    title: "Nyquist Sampling & Pulse Amplitude Modulation",
    shortTitle: "9. Sampling & PAM",
    category: "communication-systems",
    categoryTitle: "Communication Systems",
    shortObjective:
      "Verify the Nyquist-Shannon Sampling Theorem, observe spectral aliasing, and reconstruct signals via low-pass filtering.",
    difficulty: "Advanced",
    estimatedDuration: "35–45 min",
    status: "available",
    path: "/labs/communication-systems/sampling-pam",
    iitrReferenceUrl: "https://vlab.co.in",
    manual: {
      aim: "To demonstrate the Nyquist-Shannon Sampling Theorem, generate natural and flat-top Pulse Amplitude Modulated (PAM) signals, observe aliasing distortion when fs < 2·fm, and reconstruct the analog signal using a low-pass filter.",
      theory: {
        overview:
          "Sampling is the bridge connecting the continuous analog world with discrete digital signal processing. According to the Nyquist-Shannon theorem, a band-limited continuous-time signal containing no frequencies higher than fm can be completely reconstructed without information loss if sampled at a rate fs ≥ 2·fm (the Nyquist Rate). Sampling below this threshold causes spectral overlap known as aliasing.",
        keyPoints: [
          "Nyquist Rate: Minimum sampling frequency for exact recovery: fs_min = 2 · fm.",
          "Aliasing Distortion: When fs < 2·fm, high-frequency spectral copies fold into the baseband, permanently corrupting the signal.",
          "Anti-Aliasing Filter: Low-pass filter preceding the sampler to eliminate components above fs / 2.",
          "Reconstruction Filter: Low-pass filter with cutoff fc = fm applied after the sampler to extract the original signal.",
        ],
        equations: [
          {
            title: "Nyquist Sampling Theorem Criterion",
            formula: "f_s ≥ 2 · f_m",
            description:
              "Condition for perfect continuous-time signal reconstruction from discrete samples.",
          },
          {
            title: "Folded Alias Frequency",
            formula: "f_alias = |f_s - f_m|",
            description:
              "Location of the false frequency component generated under sub-Nyquist sampling.",
          },
        ],
      },
      apparatus: [
        {
          name: "Sampling & Reconstruction Trainer Kit",
          specification: "Analog switch CD4066, sample-and-hold LF398",
          quantity: 1,
        },
        {
          name: "Continuous Analog Signal Generator",
          specification: "Sine wave 500 Hz – 5 kHz",
          quantity: 1,
        },
        {
          name: "Pulse Clock Generator",
          specification: "Square wave sampling clock 1 kHz – 20 kHz",
          quantity: 1,
        },
        {
          name: "Butterworth Low-Pass Reconstruction Filter",
          specification: "4th-order active filter, fc = 3 kHz",
          quantity: 1,
        },
        { name: "Dual-Channel Oscilloscope", specification: "20 MHz", quantity: 1 },
      ],
      circuitSetupDescription:
        "Connect analog message signal to the input of the sampling switch. Connect the pulse clock generator to the control gate. Route the sampled output to the oscilloscope and to the input of the reconstruction low-pass filter.",
      procedureSteps: [
        "1. Study the Nyquist sampling criterion and impulse train multiplication in frequency domain.",
        "2. Complete the Pre-Test on sampling rates and anti-aliasing filters.",
        "3. Configure analog message frequency fm = 1 kHz.",
        "4. Set sampling frequency fs = 10 kHz (fs > 2·fm, oversampling).",
        "5. Observe the sampled PAM pulse train on Oscilloscope CH1.",
        "6. Connect the sampled output to the Low-Pass Filter and verify perfect 1 kHz reconstruction on CH2.",
        "7. Reduce sampling frequency to fs = 1.5 kHz (fs < 2·fm, under-sampling).",
        "8. Observe aliasing distortion and measure the false beat frequency (f_alias = 500 Hz).",
      ],
      preTestQuestions: [
        {
          id: 1,
          question:
            "If an analog voice signal has a maximum frequency component fm = 3.4 kHz, what is its theoretical minimum Nyquist sampling rate?",
          options: ["3.4 kHz", "6.8 kHz", "8.0 kHz", "13.6 kHz"],
          correctAnswer: 1,
          explanation:
            "By the Nyquist criterion: fs_min = 2 · fm = 2 · 3.4 kHz = 6.8 kHz (Standard telecom systems use 8 kHz to provide guard bands).",
        },
        {
          id: 2,
          question:
            "What is the primary function of an anti-aliasing filter placed before an analog-to-digital sampler?",
          options: [
            "To remove signal frequency components higher than fs / 2 (the Nyquist frequency)",
            "To amplify the DC offset to 5 V",
            "To convert the continuous signal to a square wave",
            "To eliminate the need for a clock generator",
          ],
          correctAnswer: 0,
          explanation:
            "An anti-aliasing low-pass filter attenuates all frequencies above half the sampling rate (fs/2), ensuring that spectral foldover cannot corrupt the sampled bandwidth.",
        },
        {
          id: 3,
          question:
            "In Pulse Amplitude Modulation (PAM), what parameter of the pulse carrier train is varied by the message?",
          options: [
            "Pulse amplitudes vary directly with instantaneous message signal levels",
            "Pulse frequency is modulated",
            "Pulse width is varied while amplitude stays constant",
            "Pulse position in time is shifted",
          ],
          correctAnswer: 0,
          explanation:
            "In PAM, periodic pulse amplitudes directly mirror the instantaneous sampled amplitude of the continuous modulating signal.",
        },
      ],
      postTestQuestions: [
        {
          id: 1,
          question:
            "What physical distortion occurs when a 4 kHz sine wave is sampled at 6 kHz without an anti-aliasing filter?",
          options: [
            "The signal is reconstructed as an alias at |6 - 4| = 2 kHz",
            "The signal frequency becomes 10 kHz",
            "The signal amplitude doubles",
            "No distortion occurs",
          ],
          correctAnswer: 0,
          explanation:
            "Because fs < 2·fm (6 kHz < 8 kHz), aliasing occurs and the spectral foldover creates a false 2 kHz alias tone: f_alias = |fs - fm| = 2 kHz.",
        },
        {
          id: 2,
          question:
            "What type of filter is required to reconstruct the smooth continuous analog waveform from discrete PAM pulse samples?",
          options: [
            "A Low-Pass Filter with cutoff frequency fc = fm",
            "A High-Pass Filter with cutoff at 1 MHz",
            "A Band-Stop Notch Filter at 60 Hz",
            "An all-pass delay line",
          ],
          correctAnswer: 0,
          explanation:
            "A low-pass reconstruction filter extracts the baseband message spectrum (-fm to +fm) while rejecting all high-frequency sampling clock harmonics (fs, 2·fs, etc.).",
        },
        {
          id: 3,
          question: "What happens in flat-top PAM sampling known as the 'aperture effect'?",
          options: [
            "High frequency baseband attenuation due to the sinc(f·τ) frequency response of finite pulse duration",
            "The sampling frequency drops to zero",
            "Aliasing is completely eliminated without a filter",
            "The signal amplitude increases exponentially",
          ],
          correctAnswer: 0,
          explanation:
            "Holding each sample constant for duration τ produces a rectangular time window whose Fourier transform is a sinc function, causing mild high-frequency roll-off known as the aperture effect.",
        },
      ],
      references: [
        {
          title: "Signals and Systems (2nd Edition)",
          author: "Alan V. Oppenheim & Alan S. Willsky, Prentice Hall",
        },
      ],
    },
  },
];
