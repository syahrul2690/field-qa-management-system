# PLTMG Ambon Field Inspection & Test Plan (F-ITP) — Electrical Works

## Document Overview

**Project:** PLTMG Ambon (Gas-Fired Power Plant, Modular Generating Unit)  
**Location:** Ambon, Maluku Province, Indonesia  
**Owner:** PT PLN (PERSERO)  
**Contractor(s):** Electrical installation and testing contractor(s)  
**Document:** F-ITP FOR ELECTRICAL WORKS PLTMG AMBON2_0 (Rev. 0)  
**Purpose:** Field Inspection & Test Plan for all electrical works from material receiving through final commissioning tests

**Scope of Electrical Works:**
- Power Transformers (Unit Transformer, Auxiliary Transformer)
- Medium Voltage (MV) Switchgear & Distribution
- Low Voltage (LV) Service Systems & Panels
- Electrical Motors (Pump motors, Cooling fan motors, Auxiliary motors)
- Cable Installation (Underground and tray-mounted)
- Lighting & Receptacle Systems
- Generator (Synchronous generator) & Excitation System
- Neutral Grounding Resistor (NGR) & Surge Arrester
- Uninterrupted Power Supply (UPS) & Battery Charger
- Control & Instrumentation Wiring
- Emergency Systems (Fire Alarm System per Instrumentation scope)

---

## 1. QA Findings & Required Revisions (Rev. 0 → Rev. 1)

### 1.1 Document Administration Issues

| Issue | Current State | Required Correction |
|-------|---------------|-------------------|
| **Revision Number** | Submitted as Rev. 1 | Resubmit as **Rev. 0** (first submission) |
| **Approval Date** | Column blank | Fill "Checked" and "Approved" dates before issue |
| **Legend of Inspection Classifications** | Missing | Add definitions of **M (Monitoring Point)** and **H (Hold Point)** |
| **Frequency Column** | Empty throughout | Fill with inspection frequency per activity (e.g., "Once per installation", "Daily during cable work") |
| **Table Headers** | Not repeated on page breaks | Repeat table headers on each new sheet for readability |
| **Commissioning Test Exclusion** | Mixed into FITP items | Extract all commissioning tests; state "Excluded from this F-ITP" |

### 1.2 Inspection Activity Code Definitions (To Be Added)

**Mandatory Addition to FITP Introduction:**

```
LEGEND OF INSPECTION & VERIFICATION ACTIVITIES

Monitoring Point (M):
  Definition: Continuous or random observation of work by QC personnel or 
  consultant, without stopping the workflow. Work continues; inspector confirms 
  compliance during ongoing activities (not at specific completion points).
  
  Example: Cable installation progress — daily visual patrol to verify correct 
  route, no physical damage, proper support spacing.
  
  Authority: QC Inspector (Contractor's in-house QC team or Owner's QC 
  representative). "M" activities do not block work progression.

Hold Point (H):
  Definition: A mandatory verification step where WORK MUST STOP until a 
  designated authority inspects and formally releases the activity. Without 
  written sign-off/approval, the contractor CANNOT PROCEED to the next stage.
  
  Example: Power transformer pressure test completion — test cannot proceed 
  without authorization; result cannot be accepted without Owner/Engineer 
  signature. Failure blocks further work.
  
  Authority: Owner/PLN Supervisor, Independent Engineer, or authorized PLN QC 
  representative. "H" activities carry contractual weight and permit-to-proceed 
  authority.

Acceptance Criteria Verification:
  All items require "Level of Acceptance / Reference" with:
  • Contract document reference (e.g., Contract 0683.4 Clause X.X.X)
  • Manufacturer document reference (e.g., Installation Manual Doc. No. ABC-123)
  • Specific numerical acceptance limits or tolerance values
  • Applicable standard (e.g., IEC 60038, IEEE 242)
```

### 1.3 Document Structure Improvements

**Current Issue:** ITP description (narrative) does not align with checklist form items.

**Required Alignment:**
```
Section 2 (POWER TRANSFORMER):
├─ F-ITP Narrative: "Power transformer to be delivered, inspected for 
│  shipping damage, installed on foundation, connected to HV & LV 
│  bushings, and tested per factory acceptance test report validation."
│
├─ Checklist Form Items MUST match narrative:
│  ├─ Item 2.1: Transformer Delivery & Receiving Inspection (Monitoring Point)
│  ├─ Item 2.2: Foundation & Installation (Hold Point after bolt torque check)
│  ├─ Item 2.3: Oil System Commissioning (Hold Point before energization)
│  ├─ Item 2.4: Electrical Connection & Labeling (Review)
│  └─ Item 2.5: Pre-Commissioning Test Verification (Hold Point)
│
└─ CONSISTENCY CHECK: Every paragraph in narrative must have 
   corresponding checklist items and vice versa.
```

---

## 2. POWER TRANSFORMER F-ITP — Detailed Requirements

### 2.1 Section A: Installation & Receiving

#### 2.1.1 Transformer Delivery & Shipping Damage Inspection

**Activity:** Monitoring Point (M) — Continuous observation during unloading

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Visual Condition** | No dents, cracks, oil leaks | Manufacturer Manual [DOC-NO.] | Delivery Inspection Report |
| **Nameplate Verification** | Capacity (MVA), voltage (HV/LV), cooling class matches PO | Contract Schedule 1.2 (Equipment List) | Transformer Nameplate + Equipment Log |
| **Serial Number Check** | Matches factory test report & purchase order | Factory Acceptance Test Report | Serial Number Verification Form |
| **Oil Leakage** | **NEW ITEM** — Zero visible oil seepage from seals, gaskets, drain plug | IEC 60076-2 Cl. 8.1.2 | Visual Inspection Report (photo documentation) |
| **Shock Lock Recorder** | **NEW ITEM** — Verify shock lock installed & functional; observe maximum shock during transport | Manufacturer Installation Manual | Shock Lock Recorder Reading Report |
| **Mechanical Protection (Bushings)** | **NEW ITEM** — Protective caps on HV & LV bushings present; no damage to porcelain | Manufacturer Manual [DOC-NO.] | Inspection Report + Photos |

**Hold Point (H):** Only after all shipping damage items inspected and documented may transformer be moved to installation location.

#### 2.1.2 Foundation & Seismic Anchoring Installation

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Foundation Bolts** | **NEW ITEM** — M20 Grade 8.8 anchor bolts torqued per manufacturer spec (typically 500–600 Nm) | Transformer Installation Manual [GE/SIEMENS-IM] Cl. 5.2 | Torque Check Log + Calibration Certificate |
| **Bolt Tightness Verification** | All bolts within ±5% of specified torque value | Mfr. Installation Manual | Torque Wrench Cert. (±4% accuracy) |
| **Leveling** | Foundation level ± 2 mm per transformer length | Mfr. Manual + Project Standard | Level Instrument Calibration Report |
| **Seismic Restraint (if required)** | Angle braces/tie-down installed per drawing; stress-free installation | Project Electrical Design Spec. [SPEC-NO.] | Installation Inspection Report |

**Hold Point (H):** Transformer may not be energized until foundation bolting verified & signed.

#### 2.1.3 Oil System Commissioning

**Activity:** Monitoring & Witness Points

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Silica Gel Quality Check** | **NEW ITEM** — Silica gel color indicator blue (dry), not pink/red (saturated) | IEC 60076-2 Cl. 4.4.2 | Silica Gel Inspection Report (photo) |
| **Oil Type & Batch Verification** | Transformer oil batch number & delivery date confirmed; certificate on file | Specification [SPEC-OIL-001]; IEC 60296 | Oil Certificate + Batch Log |
| **Oil Filling** | Oil temperature during filling 15–25°C; final tank level matches gauge | Mfr. Manual [DOC-NO.] Cl. 6.2 | Oil Filling Log (time, temperature, level) |
| **Oil Flushing (if applicable)** | Not required for sealed transformers; if top-oil type, flushing per procedure | IEC 60076-2 Cl. 8.2.1 | Flushing Certificate (if performed) |
| **Breathing/Dehydrating Filter** | Desiccant cartridge installed; drain plug sealed; breather cap in place | Mfr. Manual | Breathing Filter Installation Report |

**Hold Point (H):** Oil system must be commissioned and verified before transformer energization.

#### 2.1.4 Electrical Connections & Terminations

**Activity:** Witness & Review

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **HV Bushing Connection** | **NEW ITEM** — Tightening bolt and nut torqued per design (e.g., M12 @ 80 Nm for 138 kV transformer) | Manufacturer Manual [DOC-NO.] Cl. 7.1 | Torque Check Log |
| **LV Bushing Connection** | All lug crimped or bolted connections tight; no visible gaps | Mfr. Manual Cl. 7.2 | Connection Inspection Report + Photos |
| **Marshalling Kiosk Connections** | **NEW ITEM** — All terminal connections in MV/HV switchgear marshalling kiosk checked; phase labeling correct (R-Y-B or 1-2-3) | Project Control Wiring Diagram [CWD-NO.] | Continuity Test Report + Connection Photos |
| **Tap Changer (if present)** | **NEW ITEM** — On-load tap changer (OLTC) mechanical operation verified; motor brake check | Mfr. OLTC Manual [DOC-NO.] | Tap Changer Test Report |
| **Cable Lugs & Ferrules** | Size matches conductor gauge; crimped per standard; no corrosion | Cable Spec. [CSP-001] + AWS D1.1 | Cable Lug Installation Report |

**Hold Point (H):** Electrical connections verified before any energization or insulation testing.

#### 2.1.5 Relay Protection System Checkout

**Activity:** Witness & Functional Test

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Differential Relay (87T)** | **NEW ITEM** — Percentage differential slope set per transformer impedance (typically 15–30%); CT secondary polarity confirmed | Project Protection Scheme [PS-DOC-NO.] | Protection Setting Sheet + Test Report |
| **Overcurrent Relay (50/51)** | Pickup current set per cable rating; time dial per coordination chart | Project Coordination Study | Relay Setting Data Sheet |
| **Earth Fault Relay (51N)** | NGR resistor voltage drop verified; relay pickup threshold set correctly | Earthing Design Spec. [EDS-NO.] | NGR Voltage Test + Relay Setting Log |
| **Temperature Alarm (Winding/Oil)** | Alarm setpoint verified (e.g., oil 75°C alarm, 85°C trip; winding 95°C alarm, 105°C trip) | Transformer Spec. [TS-001] Cl. 4.1.2 | Temperature Sensor Calibration Cert. |

**Hold Point (H):** Protection relays must be tested & accepted before equipment energization.

---

### 2.2 Section B: Testing & Verification

#### 2.2.1 Dissolved Gas Analysis (DGA) — Oil Analysis

**Activity:** Hold Point (H) — Lab test; result review

| Test Parameter | Acceptance Criteria | Reference | Acceptance Limit |
|----------------|-------------------|-----------|-----------------|
| **Oil Sample Collection** | Sample extracted from transformer oil via sampling valve; chain of custody documented | IEC 60076-3 Cl. 7.1 | Fresh sample within 48 hours of collection |
| **Dissolved Gas Concentration (PPM)** | **NEW ITEM** — Hydrogen, Methane, Ethane, Ethylene, Acetylene measured via chromatography | IEC 60599 (Fault diagnosis code for transformers) | See table below |
| **Gas Ratio Analysis** | C2H2/C2H4, CH4/H2, C2H4/C2H6 ratios evaluated per Duval Triangle method | IEC 60599 Figure 1 | Within normal range (no fault indicators) |

**Dissolved Gas Acceptance Limits (IEC 60599):**

| Gas | Concentration (ppm) | Condition | Action |
|-----|-------------------|-----------|--------|
| **H2** | < 100 | Normal | Accept |
| **CH4** | < 120 | Normal | Accept |
| **C2H6** | < 50 | Normal | Accept |
| **C2H4** | < 50 | Normal | Accept |
| **C2H2** | 0–1 | Normal | Accept |
|  | > 1 | Indicates fault (arcing/sparking) | **REJECT — Do not energize** |

**Verifying Document:** Laboratory Test Report (certified by accredited lab per ISO/IEC 17025) with signed DGA certificate.

**Hold Point (H):** Transformer cannot be energized if C2H2 > 1 ppm or fault gases elevated.

#### 2.2.2 Oil Water Content Test

**Activity:** Hold Point (H)

| Test Parameter | Acceptance Criteria | Method | Limit |
|----------------|-------------------|--------|-------|
| **Water Content in Oil** | **NEW ITEM** — Moisture measured in fresh transformer oil | IEC 60814 (Karl Fischer Titration) or ISO 6304 | **≤ 50 ppm** (water vapor saturation point) |
| **Degradation Products** | Acid number (AN) measured; degradation assessment | IEC 61125 | AN ≤ 0.2 mg KOH/g (acceptable for new oil) |

**Acceptance:** If water content > 50 ppm, oil must be dried (vacuum drying at 65°C until water < 50 ppm) before energization.

**Verifying Document:** Oil Test Certificate (KF titration result) + Drying Log (if drying performed).

#### 2.2.3 Oil Breakdown Voltage Test (Dielectric Breakdown)

**Activity:** Hold Point (H)

| Test Parameter | Acceptance Criteria | Method | Limit |
|----------------|-------------------|--------|-------|
| **Dielectric Breakdown** | **NEW ITEM** — Breakdown voltage measured per IEC 60156 standard | Breakdown Voltage Tester (ASTM D877 or IEC 60156 method A) | **≥ 30 kV** (minimum acceptable value) |
| **Repeatability** | Test repeated 6 times; minimum 3 of 6 tests ≥ 30 kV | IEC 60156 Cl. 5.1 | Avg. ≥ 28 kV (or ≥ 30 kV per ASTM D877) |

**Acceptance:** If breakdown voltage < 30 kV, oil is contaminated; replace oil and retest.

**Verifying Document:** Oil Breakdown Voltage Test Certificate (from accredited lab).

---

## 3. MEDIUM VOLTAGE (MV) SWITCHGEAR F-ITP

### 3.1 Section A: Installation Inspection

#### 3.1.1 MV Switchgear Delivery & Unpacking

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Shipping Damage Inspection** | No visible damage, dents, or bent bus bars | Switchgear Mfr. Manual | Delivery Inspection Report |
| **Equipment Rating Verification** | **NEW ITEM** — Nameplate rating (voltage, current, frequency) matches purchase order & design specification | Project Equipment List [EL-001] | Rating Verification Log |
| **Breaker Type & Capacity Check** | **NEW ITEM** — Breaker model, current rating, trip setting matches circuit schedule | Project Circuit Schedule [CS-001] | Breaker Specification Matrix |

#### 3.1.2 MV Switchgear Installation in Cubicle/Control Room

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Visual Inspection** | **NEW ITEM** — Paint intact, no corrosion, all covers/doors fitted correctly | Mfr. Manual [SG-IM-001] | Visual Inspection Report + Photos |
| **Grounding Connection** | **NEW ITEM** — PE (protective earth) bar connected to cable armor & switchgear frame via copper conductor ≥ 6 mm²; resistance measured ≤ 0.1 Ω | Earthing Design Spec. [EDS-001] Cl. 3.2 | Earth Resistance Test Report (per BS 7622) |
| **Busbar Bolted Connection Tightness** | **NEW ITEM** — Main bus bars bolted securely; torque checked per manufacturer design (typically M8 @ 35 Nm, M10 @ 70 Nm) | Switchgear Mfr. Manual Cl. 8.1 | Torque Check Log |
| **Ingress Protection (IP) Rating Verification** | **NEW ITEM** — IP rating matches specification (typically IP54 for outdoor, IP23 for indoor); no loose cable glands or openings | Project Electrical Design Spec. [SPEC-MV-001] Cl. 4.2 | IP Rating Inspection Report |
| **Heating & Anti-Condensation System** | **NEW ITEM** — Heater installed & functional; thermostat set to prevent condensation inside enclosure | Switchgear Mfr. Manual + Project Climate Analysis | Heater Function Check Report |
| **Guidance Documents Inside Panel** | **NEW ITEM** — Instruction plate, single-line diagram, emergency shutdown procedure posted inside panel | Project Cable & Control Diagram [CCD-001] | Document Placement Inspection Report |
| **Phase Code & Continuity** | **NEW ITEM** — All phases marked R-Y-B or 1-2-3 per standard; continuity verified for each circuit (using megohm meter or low-resistance ohmmeter) | IEC 60038 (Standard Voltages) + Project Design | Continuity Test Report (Phase-to-Phase / Phase-to-Neutral) |
| **Busbar Bolted Connection (Repeat)** | **NEW ITEM** — All busbar bolts verified tight again before energization | Mfr. Manual | Final Torque Check Log |

#### 3.1.3 MV Switchgear Electrical Protection

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Relay Protection System** | **NEW ITEM** — Current Transformer (CT) secondary circuit grounded per IEC 61375 (short-circuit at relay terminal block); Potential Transformer (PT) fused correctly per specification | Project Protection Scheme [PS-001] | Protection Circuit Diagram + Verification Report |
| **Overcurrent Relay Setting** | Pickup current set per feeder cable ampacity; time coordination verified with upstream protection | Project Coordination Study [CS-001] Appendix B | Relay Setting Data Sheet (signed) |

**Hold Point (H):** All installation items verified before energization.

---

## 4. LOW VOLTAGE (LV) SERVICE SYSTEMS F-ITP

### 4.1 Section A: Installation

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Wiring Connection Verification** | **NEW ITEM** — Phase & neutral connections inside LV panel match project Single-Line Diagram (SLD) and Control Wiring Diagram (CWD); phase continuity verified | Project CWD [CWD-001] | Continuity Test Report (L1-L2-L3-N-PE mapping) |
| **Ingress Protection (IP)** | **NEW ITEM** — LV panel IP rating (typically IP54 or IP65 for outdoor, IP23 for indoors) verified; cable glands tight, no openings | Project Electrical Spec. [SPEC-LV-001] Cl. 3.1 | IP Rating Inspection Report + Gland Torque Log |
| **Breaker Rating & Capacity** | **NEW ITEM** — Main breaker and feeder breakers rated per circuit load; short-circuit rating ≥ available fault level (e.g., 50 kA at 380 V LV bus) | Project Circuit Schedule [CS-001] + Short-Circuit Study | Breaker Rating Verification Matrix |
| **Busbar Bolted Connection** | **NEW ITEM** — Main horizontal & vertical bus bars bolted securely with copper lugs; torque per design (e.g., M8 @ 30 Nm) | Mfr. Panel Design Manual | Torque Check Log |

**Hold Point (H):** After all connections verified, panel release for functional testing.

---

## 5. ELECTRICAL MOTOR INSTALLATION F-ITP

### 5.1 Section A: Motor Installation & Direction Check

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Direction of Rotation** | **NEW ITEM** — Phase sequence verified (R-Y-B or ABC) using phase rotation meter; motor rotation direction confirmed per design (clockwise viewed from non-drive end, or per P&ID) | Project P&ID [PID-001] Motor Legend | Phase Sequence Test Report + Rotation Direction Confirmation |
| **Rotation Test Method** | Use 3-phase phase rotation meter or momentary jogging at low voltage (with mechanical coupling disconnected to avoid load shock) | IEEE 112 (Electric Motor Testing) | Phase Rotation Meter Calibration Cert. |

**Hold Point (H):** Motor cannot be operated under load until rotation direction verified.

---

## 6. CABLE INSTALLATION F-ITP

### 6.1 Section A: Cable Installation & Testing

#### 6.1.1 Underground Cable Outer Sheath Test

**Activity:** Hold Point (H)

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Outer Sheath Integrity** | **NEW ITEM** — HV/MV underground cable outer sheath tested for continuity & insulation integrity per IEC 60440 | Cable Specification [CS-002] + IEC 60440 | Outer Sheath Continuity Test Report |
| **Test Method** | Megohm meter applied between outer sheath conductor and ground at 2500 V DC for 1 minute | IEC 60440 Cl. 9.5.2 | Resistance measurement ≥ 10 MΩ (minimum acceptance) |
| **Test Locations** | Cable tested at cable entrance points (substations, load centers) and at least 500 m intervals for long runs | IEC 60440 | Test Location Log |

**Acceptance:** Outer sheath insulation ≥ 10 MΩ per section. If any section fails, locate fault and repair/replace that cable length.

**Verifying Document:** Outer Sheath Test Certificate with megohm readings at each test point.

---

## 7. LIGHTING & RECEPTACLE INSTALLATION F-ITP

### 7.1 Section A: Installation

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Emergency Lighting Installation** | **NEW ITEM** — Emergency luminaires installed in exit routes, stairwells, and emergency assembly areas per building code | Project Lighting Plan [LP-001] + NFPA 101 (Life Safety Code) | Emergency Lighting Fixture Placement Report + Photometric Verification |
| **Panel Identification** | **NEW ITEM** — Inside lighting/receptacle panel: circuit identification matches project Circuit Schedule; label format per standard (e.g., "Lighting Panel LP-1, Circuit 01: Office A Floor 2") | Project Circuit Schedule [CS-001] | Panel Label Verification Report |

### 7.2 Section B: Testing

| Test Item | Acceptance Criteria | Reference | Verifying Document |
|-----------|-------------------|-----------|------------------|
| **Emergency Lighting Backup Time Test** | **NEW ITEM** — Emergency battery-backed luminaire tested to confirm minimum 90-minute operation (per NFPA 101) or contract requirement (e.g., LOTO emergency lighting: 8 hours per facility need) | NFPA 101 & Project Spec. [SPEC-LT-001] | Emergency Lighting Run Test Report (timed discharge log) |
| **Test Procedure** | Disconnect main power; observe emergency light activation and duration; measure light output (lumens) at key points; confirm burnout of standard fixture doesn't affect emergency operation | NFPA 101 Cl. 7.8.1 | Test Data Sheet (power-off time vs. light output, battery voltage decay curve) |

**Hold Point (H):** Emergency lighting cannot be accepted until run-test completed & logged.

---

## 8. GENERATOR & EXCITER SYSTEM F-ITP

### 8.1 Scope Clarification

**Mechanical Aspects** (Included in Mechanical F-ITP):
- Rotor & stator assembly
- Bearing installation
- Coupling alignment
- Lubrication system

**Electrical Aspects** (Included in Electrical F-ITP):
- Stator winding insulation
- Rotor field winding
- Excitation system functional testing
- Protection relay configuration

### 8.2 Section A: Generator Electrical Installation & Connection

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **NGR (Neutral Grounding Resistor) Installation** | **NEW ITEM** — Copper/stainless steel resistor mounted on insulated ceramic stand; PE conductor connected from resistor to earthing system; resistance value measured per design (e.g., 10 Ω for 11 kV 50 MVA transformer) | Earthing Design Spec. [EDS-001] Cl. 4.1 & Mfr. Manual | NGR Installation Report + Resistance Measurement Cert. |
| **Current Transformer (CT) at NGR** | **NEW ITEM** — CT mounted around NGR to detect earth fault current; secondary winding wound on same toroid; CT ratio verified (e.g., 50/5 A) | Neutral Earthing Protection Scheme [NEPS-001] | CT Installation & Ratio Verification Report |
| **Potential Transformer (PT) at Generator Terminal** | **NEW ITEM** — PT connected phase-to-neutral to measure generator voltage; fused correctly per design (e.g., 3A fuse for 110 V secondary) | Excitation & Synchronization Scheme [ESS-001] | PT Installation & Fuse Verification Report |
| **Surge Arrester at Generator Terminal** | **NEW ITEM** — Metal Oxide Varistor (MOV) arrester installed at HV generator outlet bushing to protect winding from switching surges; grounding wire short & direct | Project Electrical Design Spec. [SPEC-GEN-001] Cl. 5.2 | Arrester Installation & Grounding Resistance Report |
| **Generator Outlet Bushing Connections** | **NEW ITEM** — All bolts and nuts tightened per manufacturer specification; contact surfaces visually clean | Generator Mfr. Installation Manual [GEN-IM-001] Cl. 6.1 | Torque Check & Connection Verification Report |
| **Phase & Ground Continuity** | Continuity verified from generator terminals through cable to switchgear using megohm meter; insulation ≥ 100 MΩ (at 2500 V DC for 1 min) | IEC 60038 + IEEE 43 (Rotating Machinery Insulation) | Continuity Test Report (all phases + PE) |

#### 8.2.1 Generator Excitation System

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Automatic Voltage Regulator (AVR)** | **NEW ITEM** — AVR control unit mounted in panel; field winding slip ring connection verified; excitation voltage output ≤ 125 V DC nominal | Excitation System Manual [EXC-IM-001] | AVR Connection Verification Report |
| **Exciter Field & Armature** | Field winding insulation resistance ≥ 10 MΩ; armature winding checked for continuity | Generator Mfr. Manual + IEEE 43 | Insulation Resistance Test Report |
| **Voltage Regulator Functional Test** | AVR output voltage response measured during load steps (±10% step response within 2–3 seconds); damping ratio verified (no oscillation) | Excitation System Test Procedure [ETP-001] | AVR Functional Test Report (step response curves) |

**Hold Point (H):** Excitation system functional testing is Hold Point before synchronization.

### 8.3 Section B: Generator Protection Relays

| Protection Function | Setting Criterion | Reference | Verifying Document |
|-------------------|-----------------|-----------|------------------|
| **Loss of Excitation (40)** | Underexcitation alarm & trip setpoints calculated from machine capability curve (per IEEE 1110); alarm at 95%, trip at 85% of rated exciter voltage | IEEE 1110 (Rotating Machinery) + Project Protection Scheme | Protection Setting Data Sheet + Capability Curve Plot |
| **Reverse Power (32)** | Reverse power export alarm & trip if generator exports power (motoring condition detected); setpoint typically -5% rated MVA | IEEE C37.102 (Synchronous Machine Protection) | Protection Setting Data Sheet |
| **Overfrequency (81O)** | Frequency cutoff setpoint (e.g., 52 Hz for 50 Hz nominal); prevents generator overspeed | IEEE C37.102 | Protection Setting Data Sheet |
| **Underfrequency (81U)** | Frequency disconnect setpoint (e.g., 48 Hz for 50 Hz nominal); protects turbine/mechanical system during grid disturbance | IEEE C37.102 | Protection Setting Data Sheet |

**Hold Point (H):** All generator protection relays verified & tested before unit synchronization.

---

## 9. UPS & BATTERY CHARGER F-ITP

### 9.1 Section A: Installation

| Inspection Item | Acceptance Criteria | Reference | Verifying Document |
|-----------------|-------------------|-----------|------------------|
| **Cooling System Check** | **NEW ITEM** — Air intake filters clean (visual check); cooling fan motor running without noise; air discharge unobstructed; ambient temp ≤ 40°C | UPS Mfr. Manual [UPS-IM-001] Cl. 4.1 | Cooling System Inspection Report |
| **Battery Installation** | Battery cells installed per wiring diagram; polarity verified; inter-cell connections torqued | Battery Mfr. Manual + Project DC System Design | Battery String Torque Check Log |
| **Charger Output Voltage & Current** | Charger output set to design float voltage (e.g., 2.25 V/cell for lead-acid = 27 V for 12-cell battery string); charge current ≤ rated value (per charger capacity) | Charger Mfr. Manual [CHG-IM-001] Cl. 5.2 | Charger Setting Verification Report |

---

## 10. SCOPE EXCLUSIONS & ADDITIONAL SUBMISSIONS

### 10.1 Systems Excluded from This F-ITP (To Be Submitted Separately)

| System | Responsible Party | Submission Status |
|--------|------------------|------------------|
| **CCTV System** | **NEW ITEM** — Electrical contractor to submit separate CCTV F-ITP | To Be Submitted |
| **Cathodic Protection (CP)** | **NEW ITEM** — CP contractor to submit CP System F-ITP | To Be Submitted |
| **Emergency Diesel Generator (EDG)** | **NEW ITEM** — EDG contractor to submit EDG Fuel System & Control F-ITP (mechanical scope in Mechanical ITP) | To Be Submitted |
| **Fire Alarm System** | **NEW ITEM** — Fire alarm system is INSTRUMENTATION scope; excluded from electrical F-ITP | Instrumentation F-ITP |

### 10.2 150 kV Switchyard Detailed Breakdown

**Current State:** "150 kV Switchyard" listed as single item  
**Required:** Contractor shall provide detailed breakdown into sub-items:

```
150 kV SWITCHYARD ELECTRICAL WORK

├─ Disconnector Switch (DS)
│  ├─ Manual operation check
│  ├─ Blade contact pressure verification
│  └─ Grounding blade insertion & removal test
│
├─ Circuit Breaker (CB)
│  ├─ Mechanical operation (closing time, opening time)
│  ├─ Contact resistance measurement
│  ├─ Insulation resistance verification
│  ├─ Trip coil functional test
│  └─ Tripping delay verification
│
├─ Earthing Switch (ES)
│  ├─ Grounding contact pressure check
│  └─ Operating mechanism verification
│
├─ Current Transformer (CT)
│  ├─ Insulation resistance test
│  ├─ CT ratio verification (burden test)
│  ├─ Excitation curve measurement
│  └─ Secondary winding grounding verification
│
├─ Potential Transformer (PT) / Coupling Capacitor Voltage Transformer (CCVT)
│  ├─ Insulation resistance & Hi-Pot test
│  ├─ Turns ratio verification
│  ├─ Burden measurement
│  └─ Polarity check
│
├─ Surge Arrester (LA) / Lightning Arrester
│  ├─ Leakage current measurement (temperature corrected)
│  ├─ Visual condition check
│  └─ Grounding resistance ≤ 0.1 Ω
│
└─ Protection Relays & Control
   ├─ Differential relay (87L) setting & functional test
   ├─ Distance relay (21) setting verification
   ├─ Overcurrent relay (50/51) setting per coordination study
   └─ Earth fault relay (51N/67N) pickup & time curve verification
```

**Verifying Document:** Detailed 150 kV Switchyard F-ITP with sub-item matrix, acceptance criteria per IEEE/IEC, test procedures, and witness points for each major component.

---

## 11. Commissioning Tests (EXCLUDED from This F-ITP)

**The following tests are COMMISSIONING activities and shall be EXCLUDED from F-ITP:**

- Generator synchronization and paralleling with grid
- Full-load performance tests (turbine, generator efficiency measurement)
- System transient stability tests
- Fault simulation tests (3-phase short-circuit, line-to-ground fault, etc.)
- Control system dynamic response tests (load ramp, frequency control response)
- Protection relay operation under actual fault conditions
- Cooling system performance under rated load

**Note:** These tests are covered in Commissioning Test Plan (CTP) or Dynamic Control System Test Plan (DCSTP), separate documents.

---

## 12. Key Takeaways for PLTMG Ambon F-ITP Rev. 1 Submission

### 12.1 Must-Do Revisions

1. **Add Definitions Section:** Include Monitoring Point (M) vs. Hold Point (H) legend
2. **Populate All Acceptance Criteria:** Replace generic "Engineering Spec" with specific values, tolerances, and reference documents
3. **Add All Missing Installation Items:**
   - Silica gel inspection (Power Transformer)
   - Oil system commissioning checks
   - Mechanical protection verification (bushings)
   - Shock lock recorder reading
   - Relay protection setting verification for all protection systems

4. **Add Oil Testing Section (Power Transformer):**
   - Dissolved Gas Analysis (DGA) with IEC 60599 limits
   - Water content (Karl Fischer titration)
   - Breakdown voltage (IEC 60156)

5. **Refine MV Switchgear Items:**
   - Visual condition inspection
   - Grounding connection verification
   - Busbar bolted connection torque
   - IP rating verification
   - Heater/anti-condensation system check
   - Phase sequence & continuity test
   - Protection relay setting

6. **Add Generator Electrical Protection:**
   - NGR installation & resistance measurement
   - CT at NGR for earth fault detection
   - PT at generator terminal
   - Surge arrester installation
   - AVR functional test (voltage response, transient response)
   - All 8 generator protection relays: 40 (Loss of Excitation), 32 (Reverse Power), 81O (Overfrequency), 81U (Underfrequency), etc.

7. **Add Lighting & Emergency System Tests:**
   - Emergency lighting backup time test (90 min per NFPA 101)
   - Emergency battery operation log

8. **Break Down 150 kV Switchyard:**
   - Separate items for DS, CB, ES, CT, PT, LA, Protection Relays
   - Include specific test procedures & acceptance criteria for each

9. **Clarify Scope Exclusions:**
   - State "Commissioning tests excluded"
   - Confirm Fire Alarm is Instrumentation scope
   - Plan submission of CCTV, Cathodic Protection, EDG F-ITPs

---

**Document Prepared For:** PLTMG Ambon Project, PT PLN (PERSERO)  
**Reference:** F-ITP Contractor Review Comments, Rev. 0 → Rev. 1 Revision Action Items  
**Target Submission Date:** Rev. 1 (Corrected F-ITP)  
**Approval Authority:** PLN Owner's Engineer & Project Manager

---
