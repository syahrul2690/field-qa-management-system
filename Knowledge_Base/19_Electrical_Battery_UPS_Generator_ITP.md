# Electrical Battery, UPS & Emergency Generator — Inspection & Test Plan Knowledge Base

**Document References:**
- A-3.04.00041 GEPP-BKN2-E-IT-004 ITP Battery and Battery Charger (Status A)
- A-3.04.00042 GEPP-BKN2-E-IT-005 ITP Uninterruptible Power Supply (Status A)
- A-3.04.00040 GEPP-BKN2-E-IT-003 ITP Emergency Gas Engine Generator (Status A)

---

## Overview & Scope

Battery, UPS, and emergency generator systems provide backup power and protection for critical electrical infrastructure. This ITP encompasses:

**Battery Systems:**
- Lead-acid batteries (stationary type for substations)
- Battery charger systems (floating charge, equalizing mode)
- Battery monitoring and maintenance procedures

**Uninterruptible Power Supplies (UPS):**
- Online double-conversion UPS systems
- Standby/offline UPS systems
- Static transfer switches for redundancy
- Battery discharge time verification

**Emergency Generators:**
- Gas/diesel engine generators
- Automatic transfer switches (ATS)
- Generator fuel supply and exhaust systems
- Load acceptance and paralleling capability

**Test Phases:**
- Factory acceptance testing (FAT)
- Shop assembly and system testing
- Site installation verification
- Commissioning and load testing

---

## Factory/Shop Acceptance Tests

### Battery System Inspection & Testing

**Hold Point 1: Battery Specification & Documentation Verification**

| Parameter | Requirement | Standard |
|---|---|---|
| **Battery Type** | Lead-acid, stationary, sealed or vented | IEC 60896-1 or IEC 60896-22 |
| **Nominal Voltage** | 110 V DC or 220 V DC per design | Equipment rating |
| **Capacity** | Amp-hour rating per specification (e.g., 100 Ah) | Nameplate rating |
| **Number of Cells** | 48 cells (110 V system) or 96 cells (220 V) | Configuration diagram |
| **Manufacturer Certificate** | Factory acceptance test report | ISO 17025 accreditation |
| **Warranty** | 10+ years typical for stationary batteries | Warranty documentation |

**Acceptance:** All parameters match specification; test certificates reviewed and approved.

### Battery Charge & Discharge Tests

**Hold Point 2: Initial Charge Test (Factory)**

**After Shipping & Storage:**

| Test | Parameter | Acceptance |
|---|---|---|
| **Open Circuit Voltage** | Measured @ each cell | ≥ 2.0 V per cell (minimum) |
| **Battery Float Voltage** | Applied @ float charger | 2.20–2.25 V per cell |
| **Charge Current** | C/10 rate (100 Ah battery → 10 A) | Stable, no sparking |
| **Charge Duration** | Full charge time | 6–8 hours typical |
| **Final Voltage** | At end of charge | 2.30–2.35 V per cell |
| **Cell Temperature Rise** | During charge | ≤ 10°C above ambient |

**Test Setup:**
1. Connect cells in series, verifying correct polarity
2. Connect to regulated DC charger (current-limited)
3. Monitor cell voltage and current at hourly intervals
4. Record ambient temperature
5. Continue charge until current drops to < 1% of C rate

**Acceptance:** All cells charge uniformly; final voltage within specification; no overheat.

**Hold Point 3: Discharge Test & Capacity Verification**

**After Initial Charge (48-hour rest period):**

| Test | Method | Acceptance |
|---|---|---|
| **Capacity Test (C/10 discharge)** | Discharge @ C/10 rate for 10 hours | Deliver ≥ 90% of rated Ah |
| **Discharge Voltage Profile** | Monitor terminal voltage during discharge | Stable until final 10% capacity |
| **Cell Voltage Drop** | Measure at start vs. end of discharge | Uniform across all cells |
| **Discharge Cutoff** | Stop when voltage reaches 1.8 V/cell | ≤ 10 hours typical |

**Capacity Calculation Example (100 Ah battery):**

```
Discharge rate: C/10 = 100 Ah / 10 hours = 10 A
Test duration: 10 hours
Expected charge withdrawn: 100 Ah × 90% = 90 Ah
Measured amps: 10 A × actual duration
If discharge continues 9.5 hours: 10 A × 9.5 h = 95 Ah (95% capacity) ✓ PASS
```

### Battery Charger Inspection & Testing

**Hold Point 4: Battery Charger Specification & Function**

| Parameter | Requirement | Standard |
|---|---|---|
| **Charger Type** | Regulated DC supply, current-limited | IEC 60938-1 |
| **Output Voltage Range** | Adjustable float: 2.20–2.25 V/cell | Voltage control |
| **Equalizing Mode** | Higher voltage 2.35–2.40 V/cell for periodic use | Monthly or quarterly |
| **Current Regulation** | 0–(C/10) adjustable output | Current control |
| **Ripple Voltage** | < 100 mV peak-to-peak | Low-ripple design |
| **Fault Protection** | Overload, short-circuit, overvoltage protection | Safety features |
| **Metering** | Voltmeter & ammeter accuracy ±2% | Built-in or external |

**Charger Functional Tests:**

| Test | Method | Acceptance |
|---|---|---|
| **Float Voltage Output** | Apply no-load, measure output voltage | 2.20–2.25 V/cell (48 cells = 105.6–108 V) |
| **Charging Current Output** | Short-circuit test with current limiting | Limits to maximum rated current |
| **Load Step Response** | Sudden load application | Recovery to setpoint within 100 ms |
| **Ripple Measurement** | Oscilloscope at charger output | < 100 mV peak-to-peak |
| **Fan Operation** | Thermal load test | Cooling fan operates as designed |

**Acceptance:** All parameters within specification; charger provides stable float voltage and current limiting.

### UPS System Factory Acceptance Testing

**Hold Point 5: UPS Type & Specification Verification**

| Parameter | Requirement | Standard |
|---|---|---|
| **UPS Type** | Online double-conversion or standby | IEC 62040-1 |
| **Input Voltage Rating** | 400 V, 3-phase, 50 Hz ± 10% acceptance range | Nameplate |
| **Output Capacity** | 50 kVA or as rated | Rated apparent power |
| **Efficiency (Online Mode)** | > 90% typical @ 50–100% load | IEC 62040-3 Annex A |
| **Transfer Time (Standby Mode)** | < 4 ms (no break transfer) | Specification |
| **Battery Runtime** | ≥ 4 hours @ 50% load | Internal batteries or external |
| **Recharge Time** | ≤ 8 hours from fully discharged | Charger specification |

**Acceptance:** All parameters within specification; system ready for site delivery.

### UPS Battery Test (Factory)

**Hold Point 6: Internal Battery Capacity & Voltage**

| Test | Method | Acceptance |
|---|---|---|
| **No-Load Voltage** | Open-circuit battery voltage | Within 95–105% of nominal |
| **Floating Mode Voltage** | With charger engaged, no load | 2.20–2.25 V/cell (batteries in series) |
| **Discharge Runtime** | Fully charge, then discharge @ 50% rated load | ≥ 4 hours rated runtime |
| **Discharge Voltage Profile** | Monitor during test discharge | Stable until final 10% capacity |

**Example: 50 kVA UPS with 4-Hour Battery:**

```
UPS output at 50% load: 25 kW
Typical battery capacity required: ~8 kWh to 10 kWh (accounting for depth of discharge ~80%)
Test: Discharge from fully charged state
Expected runtime: ≥ 4 hours
Success: Maintains output voltage ≥ 380 V (min) until battery depleted
```

### Emergency Generator Factory Inspection

**Hold Point 7: Generator Type & Nameplate Verification**

| Parameter | Requirement | Standard |
|---|---|---|
| **Generator Set Type** | Diesel or gas engine generator set | ISO 8528-1 |
| **Prime Power Rating** | kVA and kW per specification | Generator nameplate |
| **Frequency** | 50 Hz | Generator nameplate |
| **Voltage** | 400 V, 3-phase (typical for utility stations) | Generator nameplate |
| **Fuel Type** | Natural gas or diesel per design | Specification document |
| **Fuel Tank Capacity** | Sufficient for 8–24 hour runtime | Tank nameplate |
| **Engine Manufacturer** | Reputable brand (Cummins, Caterpillar, etc.) | Engine nameplate |
| **Control System** | Automatic start, load sensing | Control module specification |

**Acceptance:** All parameters match project specification; test certificates provided.

### Generator Load Test (Factory)

**Hold Point 8: Full-Load Generator Performance Test**

| Test | Parameter | Acceptance |
|---|---|---|
| **No-Load Voltage** | 400 V ±5% (open-circuit) | 380–420 V |
| **Frequency Stability** | 50 Hz ±0.5 Hz, no load | 49.5–50.5 Hz |
| **Full-Load Voltage** | 400 V ±5% (rated load applied) | 380–420 V (maintained) |
| **Load Acceptance Time** | Time to reach 100% load | ≤ 10 seconds |
| **Voltage Transient** | Overshoot/undershoot during load step | ≤ 15% of nominal voltage |
| **Three-Phase Balance** | Voltage imbalance @ rated load | ≤ 3% between phases |
| **THD (Harmonic Distortion)** | Total harmonic distortion | ≤ 5% voltage, ≤ 10% current |

**Test Configuration:**

```
Prime Mover (Diesel/Gas engine)
↓
Generator (Synchronous alternator, brushless excitation)
↓
Control Regulator (AVR—Automatic Voltage Regulator)
↓
Programmable Load Bank (or variable resistive load)
↓
Monitoring equipment (voltmeter, ammeter, frequency counter, oscilloscope)
```

**Test Sequence:**
1. Start engine, warm up for 10 minutes
2. Record no-load voltage and frequency
3. Apply load incrementally (0% → 25% → 50% → 75% → 100%)
4. At each step, record voltage, frequency, current (all phases)
5. Monitor engine speed (RPM) stability—should not fluctuate > ±2%
6. Full-load operation minimum 2 hours
7. Record fuel consumption (for efficiency calculation)

**Acceptance:** All parameters within limits; no abnormal noise or vibration from engine.

---

## Site Installation Inspection

### Battery System Installation Verification

**Hold Point 9: Battery Rack & Installation Mechanical Check**

| Item | Verification | Acceptance |
|---|---|---|
| **Mounting Structure** | Battery rack secured, level, no damage | Bolted securely; battery cells stable |
| **Cell Orientation** | Cells upright per design (flooded type) | Vent caps accessible |
| **Inter-Cell Connectors** | All connections tight, clean terminals | No corrosion; firm mechanical contact |
| **Ground Path** | Battery negative terminal bonded to ground | DC resistance < 0.1 Ω |
| **Labeling** | Cells labeled with positive/negative polarity | Legible marking on each cell |
| **Ventilation** | Adequate airflow for hydrogen/oxygen dissipation | Natural draft or forced ventilation |
| **Spill Containment** | Acid-proof tray under battery bank | Tray capacity > 110% of largest cell volume |

**Safety Precautions During Installation:**
- Wear acid-resistant gloves and eye protection
- Ensure proper ventilation (hydrogen gas hazard)
- No spark-inducing tools near battery during connection
- Keep neutralizing agent (baking soda solution) nearby

### Battery Charger Installation Verification

**Hold Point 10: Charger System Connection & Voltage Setting**

| Check | Verification | Acceptance |
|---|---|---|
| **Input AC Supply** | Voltage, frequency, phase sequence | 380–420 V, 50 Hz ±1%, correct rotation |
| **DC Output Connections** | Positive to battery +, negative to battery − | Correct polarity; tight lugs |
| **Floating Voltage Adjustment** | Set float voltage per battery type | 2.20–2.25 V/cell (verify with multimeter) |
| **Charge Current Limit** | Set to C/10 or as specified | Verify with ammeter under load |
| **Meter Calibration** | Charger voltmeter & ammeter accuracy | Compare with calibrated multimeter ±2% |
| **Remote Monitoring** | If networked charger, verify signal path | Status lights illuminate; data displayed |

**Commissioning Verification:**
1. Apply AC input power
2. Record float voltage (should stabilize in 5 minutes)
3. Apply small load (e.g., 1 A via external resistor)
4. Verify charger supplies current without voltage drop

### UPS System Site Installation

**Hold Point 11: UPS Mechanical & Electrical Installation**

| Item | Verification | Acceptance |
|---|---|---|
| **Input AC Power** | Three-phase 400 V, 50 Hz ±10% | 360–440 V acceptable input range |
| **Output Circuit Breaker** | Properly rated & connected per single-line | Breaker sized for UPS output current |
| **Static Transfer Switch** | Contacts clean & making good electrical contact | Manual transfer test successful |
| **Grounding** | UPS case bonded to ground bus | DC resistance < 0.1 Ω |
| **Cooling Fans** | Fan rotation direction verified (if removable) | Pulls air through heat sink |
| **Input/Output Cables** | All connections tight, phase sequence correct | Phase A-B-C confirmed |
| **Battery Connections** | Internal or external batteries connected | Positive/negative polarity correct |

### Emergency Generator Site Installation

**Hold Point 12: Generator & Fuel System Installation**

| Item | Verification | Acceptance |
|---|---|---|
| **Generator Mounting** | Bolted to concrete foundation per plan | Secure; vibration isolators functional |
| **Fuel Supply Line** | Connected from tank, with sediment filter | No leaks observed; filter accessible |
| **Fuel Tank Fill/Drain** | Level gauge visible, drain valve accessible | Manual operation tested |
| **Exhaust System** | Silencer and stack installed per design | Securely bolted; thermal insulation intact |
| **Cooling System** | Radiator, fan belt, hose connections | No leaks; fan rotates freely |
| **Control Panel** | Mounted locally or remotely per design | All switches & displays accessible |
| **Automatic Transfer Switch (ATS)** | Correctly wired per single-line diagram | Load switchover path verified |
| **Engine Oil & Coolant** | Fill levels correct per dipstick | Within specified range |

**Fuel Quality Verification (for Diesel):**

| Test | Requirement | Standard |
|---|---|---|
| **Fuel Grade** | ISO 4406 Grade 18/16/13 (cleanliness class) | No visible contamination |
| **Water Content** | < 200 ppm (mg/kg) by Karl Fischer | Drying cartridge if needed |
| **Sulfur Content** | < 500 ppm (high-sulfur fuel acceptable for backup) | Certificate of analysis |
| **Viscosity @ 40°C** | 5.5–9.5 cSt | Per ISO 3448 |

---

## Commissioning & Functional Tests

### Battery System Commissioning

**Hold Point 13: Pre-Service Acceptance Test**

| Test | Method | Acceptance |
|---|---|---|
| **Cell Voltage Uniformity** | Measure open-circuit voltage of each cell | All within ±0.05 V (2.10–2.15 V nominal) |
| **Float Voltage Setting** | With charger connected, measure output | 2.20–2.25 V/cell ±1% |
| **Charge Current** | Apply small load; measure charger current | Within ±5% of setpoint |
| **Load Capacity** | Discharge test @ C/10 rate | Deliver ≥ 90% rated Ah in 10 hours |

**Acceptance:** All cells uniform; charger provides stable float voltage; battery meets capacity.

### UPS System Commissioning

**Hold Point 14: UPS Transfer Test & Load Acceptance**

| Test | Method | Acceptance |
|---|---|---|
| **AC Input Present** | Monitor input voltage with meter | 380–420 V, 50 Hz ±1% |
| **Normal Mode Operation** | Load powered from AC input | No disruption; LED shows "AC OK" |
| **Transfer to Battery** | Simulate AC loss (remove input) | Instantaneous transfer < 4 ms; load maintained |
| **Battery Discharge Time** | Measure runtime at 50% load after transfer | ≥ 4 hours specified runtime |
| **Voltage Stability** | Monitor output during discharge | ±10% voltage regulation |
| **Return to AC** | Reapply input power | Automatic transfer back; charges battery |
| **Recharge Time** | Measure battery recharge from depleted state | ≤ 8 hours to full charge |

**Example: 50 kVA UPS Runtime Test**

```
Fully charge internal/external battery
Apply 50% load (25 kW) to UPS output
Record start time = 0 hours
Monitor output voltage continuously
Expected behavior:
- Hour 1: Voltage = 400 V (nominal)
- Hour 2: Voltage = 400 V
- Hour 3: Voltage = 400 V
- Hour 4: Voltage = 400 V
- Hour 4.5: Battery depleted; output falls below 380 V
Acceptance: Runtime ≥ 4 hours (test duration 4+ hours)
```

### Emergency Generator Commissioning

**Hold Point 15: Generator Start-Up & Load Acceptance**

| Phase | Test | Acceptance |
|---|---|---|
| **Warm-Up (No Load)** | Start engine, run 10 min without load | Steady RPM; no abnormal noise; oil pressure normal |
| **Voltage & Frequency Check** | No-load output voltage & frequency | 380–420 V; 49.5–50.5 Hz |
| **Load Acceptance @ 50%** | Apply 50% rated load (using load bank) | Voltage remains 380–420 V; frequency stable ±0.5 Hz |
| **Load Acceptance @ 100%** | Increase to full rated load | Voltage within limits; frequency stable; no stalling |
| **Load Step Response** | Sudden load application (0% → 100%) | Recovers to nominal voltage within 10 seconds |
| **Three-Phase Balance** | Measure phase-to-phase voltage @ full load | Voltage unbalance ≤ 3% |

**Generator Performance Acceptance:**

```
Generator rated: 100 kVA, 400 V, 3-phase, 50 Hz
Full-load current: 100 kVA / (400 V × √3) = 144 A per phase

Test result @ 100% load:
- Phase A: 399 V, 144 A
- Phase B: 398 V, 144 A
- Phase C: 401 V, 144 A
- Frequency: 50.2 Hz

Voltage unbalance = (401 - 398) / avg(399.7) × 100% = 0.75% ✓ PASS
Frequency within ±0.5 Hz: 50.2 Hz ✓ PASS
```

**Full-Load Run-In Test (Minimum 4 Hours):**

1. Operate generator at 100% rated load continuously
2. Monitor:
   - Oil temperature (should not exceed 90°C)
   - Coolant temperature (typically 75–85°C)
   - Output voltage & frequency (no significant drift)
   - Fuel consumption (calculate efficiency)
3. Accept if:
   - No overheating (oil < 95°C, coolant < 90°C)
   - Voltage/frequency stable ± 2% over test duration
   - Engine runs smoothly; no abnormal vibration
   - Fuel consumed within expected range

### Automatic Transfer Switch (ATS) Testing

**Hold Point 16: ATS Logic & Switchover Verification**

| Test | Method | Acceptance |
|---|---|---|
| **Normal Mode (AC Available)** | Apply AC input to ATS main contacts | Load connected to AC input; generator output isolated |
| **AC Loss Detection** | Remove AC input; generator auto-start activated | Start sequence initiated within 5 seconds |
| **Transfer Delay** | Wait for generator to reach speed & voltage | Typically 10–15 seconds total |
| **Load Transfer** | Static contacts switch to generator output | No transient spike; load power interrupted < 100 ms |
| **AC Return** | Reapply AC input power | ATS waits ~5 min, then transfers back to AC (configurable) |
| **Manual Override** | Manual selector switch to generator | Operator can force generator mode |

**ATS Switchover Sequence (Standard Configuration):**

```
AC Mains Lost
  ↓
ATS detects voltage loss (settable threshold: 85% nominal)
  ↓
Auto-start signal sent to generator (5 V AC command)
  ↓
Generator starter motor engages; engine starts
  ↓
Generator ramps to 50 Hz / 400 V (typically 10 seconds)
  ↓
ATS senses generator voltage/frequency acceptable
  ↓
Contacts switch to generator output (< 100 ms transfer)
  ↓
Load now powered by generator; AC mains bypassed
  ↓
(When AC restored)
ATS senses AC voltage/frequency acceptable
  ↓
5-minute delay timer starts (re-sync delay)
  ↓
After 5 minutes, ATS returns contacts to AC mains
  ↓
Generator receives stop command; shuts down (optional)
```

---

## Inspection Activity Matrix

| Activity | Contractor | Engineer | Owner | Code | Standard |
|---|---|---|---|---|---|
| Battery specification verification | ✓ | ✓ | — | A | IEC 60896-1 |
| Battery initial charge test | ✓ | ✓ | — | **A (HOLD)** | IEC 60896-1 |
| Battery discharge/capacity test | ✓ | ✓ | — | **A (HOLD)** | IEC 60896-1 |
| Charger specification & function test | ✓ | ✓ | — | A | IEC 60938-1 |
| UPS factory acceptance test | ✓ | ✓ | — | **A (HOLD)** | IEC 62040-3 |
| UPS battery runtime test | ✓ | ✓ | — | A | IEC 62040-3 |
| Generator specification & load test (factory) | ✓ | ✓ | — | **A (HOLD)** | ISO 8528-1 |
| Battery installation & rack inspection | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E-IT-004 |
| Charger installation & commissioning | ✓ | ✓ | — | A | GEPP-BKN2-E-IT-004 |
| UPS installation & transfer test | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E-IT-005 |
| Generator installation & fuel system check | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E-IT-003 |
| Battery pre-service acceptance | ✓ | ✓ | ✓ | **A (HOLD)** | IEC 60896-1 |
| UPS transfer test & runtime verification | ✓ | ✓ | ✓ | **A (HOLD)** | IEC 62040-3 |
| Generator start-up & load acceptance | ✓ | ✓ | ✓ | **A (HOLD)** | ISO 8528-1 |
| ATS logic & switchover test | ✓ | ✓ | — | A | ISO 8528-2 |
| Generator full-load run-in (4+ hours) | ✓ | ✓ | ✓ | **A (HOLD)** | GEPP-BKN2-E-IT-003 |
| Final system sign-off | — | ✓ | ✓ | **A (FINAL)** | GEPP-BKN2-E-IT-003/005 |

---

## Test Parameters & Acceptance Criteria Summary

### Lead-Acid Battery Specifications

**Voltage Ratings:**

| System | Cells | Nominal Voltage | Float Voltage | Equalize Voltage |
|---|---|---|---|---|
| **110 V DC** | 48 | 110 V | 2.20–2.25 V/cell (105.6–108 V) | 2.35–2.40 V/cell (112.8–115.2 V) |
| **220 V DC** | 96 | 220 V | 2.20–2.25 V/cell (211.2–216 V) | 2.35–2.40 V/cell (225.6–230.4 V) |

**Capacity & Discharge Rates:**

| Discharge Rate | Time to Discharge | Typical Duty |
|---|---|---|
| **C/10** | 10 hours | Float/backup power (standard rating) |
| **C/5** | 5 hours | Peak demands |
| **C/1** | 1 hour | Emergency shutdown power |

**Temperature Compensation (for Megohm Testing):**

```
Resistance decreases ~50% for every 10°C increase above 20°C
Correction formula: R_θ = R_20 × 2^((20–θ)/10)
Example: If measured at 30°C and reading is 100 MΩ:
Corrected value @ 20°C = 100 × 2^((20–30)/10) = 100 × 2^(-1) = 50 MΩ
This means actual cell resistance at 20°C reference would be 50 MΩ (lower than measured)
```

### UPS Runtime Calculation

**Formula:**

```
Runtime (hours) = Battery capacity (kWh) × Depth of discharge (%) / Load (kW)

Example:
Battery capacity: 8 kWh
Depth of discharge: 80% (stationary batteries rated for 80% DoD)
Load: 25 kW (50% of 50 kVA UPS)

Runtime = 8 × 0.80 / 25 = 0.256 hours = 15.4 minutes ✗ FAIL
(This design is insufficient for 4-hour runtime requirement)

Required battery for 4-hour runtime @ 25 kW:
Capacity = 25 kW × 4 hours / 0.80 = 125 kWh ✓
(Must increase battery from 8 kWh to 125 kWh external battery bank)
```

### Emergency Generator Performance Limits

**Voltage Regulation (Automatic Voltage Regulator—AVR):**

| Load Condition | Output Voltage | Tolerance |
|---|---|---|
| **No-Load** | 400 V nominal | ±5% (380–420 V) |
| **Load Step (0% → 100%)** | 400 V nominal | ±10% transient overshoot; recover within 2 seconds |
| **Steady-State Full Load** | 400 V nominal | ±5% (380–420 V) |

**Frequency Stability:**

| Load Condition | Output Frequency | Tolerance |
|---|---|---|
| **No-Load** | 50 Hz | ±0.5 Hz (49.5–50.5 Hz) |
| **Load Step (0% → 100%)** | 50 Hz | ±2% transient; recover within 5 seconds |
| **Steady-State Full Load** | 50 Hz | ±0.5 Hz |

**Fuel Consumption & Efficiency:**

```
100 kVA diesel generator, rated 75 kW (mechanical power)
Typical fuel consumption:
- Idle (no load): 3–5 L/hour
- 50% load: 15–18 L/hour (SFC ≈ 200 g/kWh)
- 100% load: 28–32 L/hour (SFC ≈ 210 g/kWh)

Electrical efficiency = Electrical output power / Fuel energy input
Example @ 100% load:
Fuel energy = 30 L/hr × 10.2 kWh/L (diesel) = 306 kWh/hr
Generator output = 75 kW (electrical output at 75 kW ≈ 90% of 83 kVA @ 0.9 pf)
Overall efficiency = 75 / 306 = ~24.5% (thermal + generator efficiency)
```

---

## Applicable Standards

### International Electrotechnical Commission (IEC)

- **IEC 60896-1:** Stationary lead-acid batteries – Part 1: General requirements and methods of test
- **IEC 60896-22:** Stationary lead-acid batteries – Part 22: Cyclic and float-charged batteries with non-aqueous electrolyte
- **IEC 61427:** Battery energy storage systems – General requirements and test methods
- **IEC 62040-1:** Uninterruptible power supplies (UPS) – Part 1: General and safety requirements
- **IEC 62040-3:** UPS – Part 3: Method of specifying the performance and test requirements

### American Standards (ANSI/IEEE)

- **IEEE Std 450:** IEEE Recommended Practice for Maintenance, Testing, and Replacement of Large Stationary Lead-Acid Battery Installations
- **IEEE Std 1118:** IEEE Guide for Establishing Transformer Loading Capability
- **ISO 8528-1:** Reciprocating internal combustion engine driven generator sets – Part 1: General requirements

### Project-Specific Standards

- **GEPP-BKN2-E-IT-004:** Battery and Battery Charger ITP (Status A)
- **GEPP-BKN2-E-IT-005:** Uninterruptible Power Supply ITP (Status A)
- **GEPP-BKN2-E-IT-003:** Emergency Gas Engine Generator ITP (Status A)

### Indonesian National Standards (SNI)

- **SNI IEC 60896-1:** Stationary batteries per IEC equivalent

---

## Critical Hold Points Summary

| # | Activity | Test/Verification | Pass Requirement | Authority |
|---|---|---|---|---|
| 1 | **Battery Specification** | Type, voltage, capacity documentation | All match specification | Engineer + Contractor |
| 2 | **Initial Charge Test** | Uniform charging; cell voltage, current | 2.30–2.35 V/cell final; no overheat | Contractor + Engineer |
| 3 | **Discharge & Capacity** | C/10 discharge for 10 hours | Deliver ≥ 90% rated Ah | **Engineer** |
| 4 | **Charger Function** | Float voltage, current output, ripple | 2.20–2.25 V/cell; < 100 mV ripple | Engineer + Contractor |
| 5 | **UPS Factory Test** | Load, efficiency, runtime at 50% | ≥ 4 hours runtime; ≥ 90% efficiency | **Engineer** |
| 6 | **UPS Battery Test** | Internal battery capacity & voltage | Maintain output ≥ 380 V for rated time | Engineer + Contractor |
| 7 | **Generator Load Test** | No-load & full-load voltage, frequency | 380–420 V; 49.5–50.5 Hz; no overshoot > 15% | **Engineer** |
| 8 | **Battery Installation** | Rack security, terminal connections, labeling | Secure, clean, bonded to ground | **Engineer + Owner** |
| 9 | **Charger Installation** | AC input, DC output, float voltage setting | Correct voltage on all cells | Engineer + Contractor |
| 10 | **UPS Installation** | Input/output connections, transfer switch | AC/battery paths correct; transfer < 4 ms | **Engineer + Owner** |
| 11 | **Generator Installation** | Fuel system, cooling, control panel | No leaks; tank filled; controls operational | **Engineer + Owner** |
| 12 | **ATS Logic** | Start sequence, transfer timing, return logic | Automatic switchover within 15 seconds | Engineer + Contractor |
| 13 | **Battery Pre-Service** | Cell uniformity, charger float, capacity | All cells within ±0.05 V; ≥ 90% Ah delivered | **Engineer + Owner** |
| 14 | **UPS Transfer & Runtime** | AC loss simulation, battery discharge time | Transfer < 4 ms; runtime ≥ 4 hours | **Engineer + Owner** |
| 15 | **Generator Commissioning** | Warm-up, load acceptance, stability | Voltage/frequency stable at 100% load | **Engineer + Owner** |
| 16 | **Full-Load Run-In** | 4+ hours continuous operation | No overheat; voltage/frequency stable ± 2% | **Engineer + Owner** |
| 17 | **Final Sign-Off** | All tests passed; documentation complete | Operator trained; maintenance manual provided | **Owner Representative** |

---

## Risk Mitigation & Troubleshooting

### Battery Cell Voltage Imbalance (> ±0.05 V variance)

**Possible Causes:**
- Cell manufacturing defect (internal short or open)
- Uneven charging (charger float voltage misaligned)
- Cell sulfation (crystalline buildup from deep discharge)

**Remedial Actions:**

1. **Equalize Charge (for flooded lead-acid):**
   - Switch charger to equalize mode (2.35–2.40 V/cell)
   - Charge for 2–8 hours until all cells voltage uniform
   - Temperature monitoring critical (< 60°C)

2. **Replace Defective Cell:**
   - If single cell remains < 2.0 V after equalization, replace
   - Drain battery safely; disconnect cell; remove & replace
   - Re-charge entire bank before return to service

3. **Verify Charger Float Voltage:**
   - Adjust float voltage to 2.22 V/cell (midpoint of 2.20–2.25 range)
   - All cells should then equalize naturally over days

### Generator Fails to Start (Electric or Manual Start)

**Possible Causes:**
- Engine fuel starvation
- Starter motor failure
- Battery low voltage (if electric start)
- Engine compression loss or seized

**Troubleshooting:**

1. **Check Fuel Supply:**
   - Open fuel shutoff valve (manual)
   - Listen for fuel pump operation (if electric)
   - Check tank fill level (should be ≥ 50% for cold start)

2. **Check Battery Voltage (Electric Start):**
   - If voltage < 20 V for 24 V system: charge or replace battery
   - Cold start may require 50% higher current; ensure wiring rated

3. **Manual Crank Test:**
   - If manual start available, crank by hand
   - Feel for compression resistance (should be firm)
   - If no resistance: suspect engine valve or piston failure

4. **Fuel Injector Priming:**
   - For diesel: prime fuel system (open bleeder screw, push primer until fuel flows)
   - Reinstall bleeder, attempt start

5. **If Still No Start:**
   - Contact manufacturer for inspection
   - Do not force starter (risk of winding damage)

### UPS Battery Doesn't Provide Expected Runtime

**Possible Causes:**
- Battery aged/degraded (capacity loss over time)
- Load during test exceeds 50% assumption
- Battery charger not fully charging (equalization needed)
- Temperature below 15°C (cold reduces battery output)

**Testing Protocol:**

1. **Full-Capacity Test:**
   - Fully charge battery (8 hours minimum)
   - Wait 1 hour (rest period)
   - Discharge @ C/10 rate (for standard batteries)
   - Measure time-to-cutoff (1.8 V/cell)
   - Calculate capacity: Ah = current × hours

2. **Reduce Test Load if Insufficient Runtime:**
   - If expected 4 hours but only 2 hours achieved at 50% load:
   - Try 25% load: should achieve 8 hours (proportional)
   - If 25% load still only 2 hours: battery degraded; replace

3. **Temperature Verification:**
   - Test in controlled 20°C environment
   - Cold operation reduces capacity ~2% per °C below 20°C
   - At 5°C: capacity ≈ 70% of 20°C rating

---

## Document Evolution

| Revision | Date | Key Changes | Status |
|---|---|---|---|
| Status A | 2018 | Initial baseline for project | **Current** |

---

**Document Prepared:** April 2026  
**Last Updated:** From ITPs dated 2018  
**Review Cycle:** 24 months or annually per utility maintenance schedule
