# Wartsila Gas Engine Generator — Inspection & Test Plan Knowledge Base

## Overview & Scope

This document consolidates Inspection and Test Plan (ITP) knowledge for Wartsila medium-speed gas-fueled reciprocating engine generator sets used in combined cycle and standalone power generation applications. The focus is on Factory Acceptance Testing (FAT), Site Acceptance Testing (SAT), technical specifications, and quality assurance hold points during procurement and commissioning.

### Equipment Type & Application

**OEM:** Wartsila Corporation (Finland)  
**Equipment Class:** Medium-Speed Dual-Fuel Reciprocating Engine (Gas/Light Fuel Oil)  
**Application:** Distributed generation, combined cycle power plants, peaking plants  
**Typical Ratings:** 6 MW to 20 MW electrical output per unit  
**Fuel Type:** Natural gas (primary), light fuel oil (backup/alternative)  
**Configuration:** 4-stroke or 2-stroke crosshead design with turbocharger and intercooler  

---

## 1. Wartsila Engine Generator — Technical Specifications

### 1.1 Engine Core Technical Data

| Parameter | Unit | Typical Range | Note |
|---|---|---|---|
| **Engine Model** | — | Wartsila 18V50SG, 20V34SG, 34SG | Varies by project scope |
| **Rated Power Output (electrical)** | MW | 6 - 20 | Generator output per engine |
| **Rated Frequency** | Hz | 50 or 60 | Depends on regional grid |
| **Rated Voltage (Terminal)** | kV | 3.3 - 11 | Typical medium voltage |
| **Power Factor** | — | 0.9 lagging | Typical generator operating point |
| **Engine Speed (Design)** | rpm | 514 - 720 | Medium-speed reciprocating |
| **Stroke Type** | — | 4-stroke or 2-stroke | Design-dependent |
| **Number of Cylinders** | — | 6, 9, 12, 18, 20 | Modular design |
| **Cylinder Bore Diameter** | mm | 340 - 500 | Size-dependent |
| **Fuel Consumption (Full Load)** | g/kWh | 150 - 210 | Natural gas; LFO higher |
| **Brake Mean Effective Pressure (BMEP)** | bar | 22 - 28 | Compression ignition |
| **Compression Ratio** | — | 12:1 - 17:1 | Dual-fuel capable |
| **Turbocharger Type** | — | Single or dual stage | With intercooler |
| **Intake Air Temperature (Design)** | °C | 35 - 50 | After intercooler |
| **Exhaust Gas Temperature (Outlet)** | °C | 460 - 520 | Before turbocharger |
| **Specific Fuel Oil Consumption (SFOC)** | g/kWh | 185 - 220 | At 100% MCR on LFO |

### 1.2 Generator Technical Data

| Parameter | Unit | Value/Range | Standard |
|---|---|---|---|
| **Generator Type** | — | Synchronous AC, 4-pole | Squirrel cage / Salient pole |
| **Rated Apparent Power (S)** | MVA | Matches engine MW / 0.9 PF | Per IEC 60034-1 |
| **Rated Active Power (P)** | MW | Per engine output | At rated speed & frequency |
| **Rated Reactive Power (Q)** | MVAr | Typically 0.5 to 0.8 × P | Over-excited design |
| **Voltage Regulation** | % | ±5% at rated conditions | Per IEC 60034-3 |
| **Efficiency (at 100% load)** | % | 95 - 97 | Copper and iron losses |
| **Insulation Class** | — | H (180°C) or F (155°C) | Thermal design limit |
| **Short-Circuit Ratio (Xd)** | — | 0.45 - 0.65 | Synchronous reactance |
| **Stator Cooling** | — | Water-cooled or air-cooled | Design-dependent |
| **Rotor Cooling** | — | Self-ventilated or forced air | Copper/aluminum rotor |
| **Bearing Type** | — | Sleeve or rolling element | Bracketed design |
| **Excitation System** | — | Brushless or brush-type | Voltage regulation control |

### 1.3 Auxiliary Systems Technical Data

#### 1.3.1 Cooling System

| Component | Design Capacity | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Engine Cooling Water Flow** | 150 - 250 m³/h | Sufficient to maintain ≤70°C jacket exit | **CRITICAL** |
| **Lube Oil Cooling Capacity** | Per engine design | Maintain lube oil <45°C at rated conditions | **CRITICAL** |
| **Generator Cooling** | Per electrical design | Stator/rotor <temperature class limit | **HOLD** |
| **Intercooler Cooling** | Per turbocharger design | Intake air <50°C after intercooler | **CRITICAL** |
| **Radiator Capacity** | Total heat rejection MW | Sufficient for continuous rating at ambient +35°C | **CRITICAL** |

#### 1.3.2 Lube Oil System

| Parameter | Specification | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Oil Type** | Mineral ISO VG 40 or synthetic | Per OEM approval list | **CRITICAL** |
| **Oil Viscosity @ 40°C** | ISO VG 40 (36 - 44 cSt) | Within SAE/ISO classification | **HOLD** |
| **Oil Flash Point** | >180°C | High-temperature stability | **CRITICAL** |
| **Oil TAN (Total Acid Number)** | <0.5 mg KOH/g initial | Within OEM limits; <1.5 mg KOH/g in-service | **HOLD** |
| **Oil Contamination Particle Count** | ISO 4406 code 15/13/10 or better | <4 µm particles at commissioning | **CRITICAL** |
| **Lube Oil Pressure (Operating)** | 3 - 5 bar | At rated speed; alarm if <2.5 bar | **CRITICAL** |
| **Lube Oil Temperature** | 40 - 45°C | Maintained by cooler; heater for cold starts | **HOLD** |
| **Lube Oil Tank Capacity** | Minimum 8 - 10 hours runtime | Full tank at start of FAT | **CRITICAL** |

#### 1.3.3 Fuel Gas System (Natural Gas)

| Parameter | Specification | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Fuel Gas Supply Pressure** | 15 - 25 bar | Within design operating range | **CRITICAL** |
| **Fuel Gas Temperature** | <35°C at engine inlet | Prevent foaming; typically cooled | **HOLD** |
| **Fuel Gas Composition** | Methane-dominant (>85% CH4) | Calorific value: 35 - 42 MJ/m³ | **CRITICAL** |
| **Fuel Gas Dew Point** | <-10°C @ system pressure | Prevent water condensation | **CRITICAL** |
| **Fuel Gas Pressure Regulator** | Set to engine design pressure ±0.5 bar | Relief valve at 110% set point | **CRITICAL** |
| **Fuel Gas Supply Piping** | Carbon steel (min) or stainless | Properly sloped, drains at low points | **HOLD** |
| **Gas Train Isolation Valves** | Manual + automatic solenoid | Functional test; manual leakage test | **CRITICAL** |
| **Gas Detector (Safety)** | Explosive atmosphere sensor | Alarm <20% LEL; shutdown <40% LEL | **CRITICAL** |

#### 1.3.4 Fuel Oil System (Light Fuel Oil Backup)

| Parameter | Specification | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Fuel Oil Type** | ISO 6743-4 type HE | Viscosity: 5.0 - 24.0 cSt @ 100°C | **CRITICAL** |
| **Fuel Oil Flash Point** | >100°C | Safety requirement | **CRITICAL** |
| **Fuel Oil Sulfur Content** | <0.5% (if required) | Environmental compliance | **HOLD** |
| **Fuel Oil Storage Tank** | Clean, properly vented | <5 µm particles; free water <100 ppm | **CRITICAL** |
| **Fuel Oil Supply Pressure** | 2 - 8 bar | Filtered, heated to 40 - 50°C | **HOLD** |
| **Fuel Oil Filters (Primary/Secondary)** | 25 µm and 10 µm | Clogging indicators functional | **CRITICAL** |
| **Fuel Oil Change-Over System** | Automatic or manual solenoid | Switching sequence tested; no spillage | **CRITICAL** |

#### 1.3.5 Compressed Air/Control Air System

| Parameter | Specification | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Compressor Type** | Screw or rotary vane | Capacity: >0.5 m³/min @ 7 bar | **CRITICAL** |
| **Control Air Pressure** | 6 - 8 bar | Regulated; pressure relief at 110% | **HOLD** |
| **Control Air Quality** | ISO 8573-1 7:4:1 or better | <7 µm particles; <4 ppm water; <1 ppm oil | **CRITICAL** |
| **Air Dryer (Desiccant Type)** | Silica gel or molecular sieve | Dew point <-10°C @ 7 bar pressure | **CRITICAL** |
| **Air Receiver Tank** | Pressure vessel code (ASME/PED) | Relief valve; drain plug; pressure gauge | **HOLD** |
| **Control Valve Logic** | Pilot-operated solenoid valves | Function test; leak test (no external leakage) | **CRITICAL** |

### 1.4 Electrical & Control Systems

| System | Component | Specification | Acceptance Criterion |
|---|---|---|---|
| **Excitation** | AVR (Automatic Voltage Regulator) | Brushless, no-load saturation | Voltage control ±3% @ ±10% load step |
| **Speed Control** | Governor (Electronic or Hydraulic) | Speed droop 4 - 6% typical | Frequency stable within ±0.5 Hz |
| **Engine Control Module (ECM)** | PLC or FPGA-based | Data logging capability | All interlocks and alarms functional |
| **Protection** | Electrical relays (IEEE C37.97) | Overcurrent, overvoltage, overfrequency | Relay coordination tested |
| **Safety Instrumentation** | SIL-rated safety system | Lube oil pressure, fuel pressure, water temp | Emergency shutdown response time <2 sec |

---

## 2. Factory Acceptance Testing (FAT) — Wartsila Gas Engine Generator

### 2.1 Pre-FAT Documentation Review

| Document | Hold Point | Acceptance Criterion |
|---|---|---|---|
| **Design/Build Certificate** | **CRITICAL** | Signed by OEM Engineering and QA |
| **Type Test Certificate** (if applicable) | **CRITICAL** | From independent third-party lab for engine |
| **Material Certificates** | **HOLD** | Mill/forge certificates for major components |
| **Pressure Equipment Directive (PED) Certificate** | **CRITICAL** | For any EU-sold equipment; CE mark verification |
| **Non-Destructive Test (NDT) Reports** | **HOLD** | Radiography/UT of critical welds (if applicable) |
| **Insulation Resistance Test (Generator)** | **CRITICAL** | >100 MΩ @ 5 kV DC between stator phases and frame |
| **Megohm Trend Report** | **HOLD** | Baseline for condition monitoring post-commissioning |
| **Component Traceability** | **HOLD** | Serial numbers and manufacturing dates recorded |

### 2.2 Pre-Test Visual Inspection & Configuration

| Inspection Point | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Engine Block & Head** | No cracks, casting porosity acceptable per standard | **INSPECT** |
| **Piston & Connecting Rods** | No bending, scoring, or corrosion; proper fitment | **INSPECT** |
| **Turbocharger Assembly** | Proper alignment, no rubbing, rotor spins freely | **CRITICAL** |
| **Fuel Injection Nozzles** | Proper seating, spray pattern acceptable per OEM | **HOLD** |
| **Cylinder Liner Condition** | Surface finish acceptable; no deep scoring | **INSPECT** |
| **Crankshaft Runout** | <0.05 mm TIR (Total Indicated Runout) | **HOLD** |
| **Valve Train (Camshaft, Rockers)** | Free movement, proper clearances | **CRITICAL** |
| **Cooling System Piping** | No blockage; proper slope and drainage | **HOLD** |
| **Lube Oil System** | Oil level in tank, pump priming, filter integrity | **CRITICAL** |
| **Fuel System (Gas & Oil)** | Piping clean, filters installed, proper labeling | **HOLD** |
| **Electrical Connections** | Terminal boxes clean, wiring insulation intact | **INSPECT** |
| **Control Panel & Instruments** | All gauges functional; wiring per schematic | **HOLD** |

### 2.3 Factory Acceptance Test Program

#### Phase 1: Pre-Startup Verification (Duration: 4 - 8 hours)

| Test | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Fuel Gas Supply Verification** | Pressure 15 - 25 bar; temperature <35°C; clean | **CRITICAL** |
| **Lube Oil System Priming** | Oil circulation confirmed; no air in line; pressure 3 - 5 bar | **CRITICAL** |
| **Cooling Water Circulation** | Flow rate verified; temperature stable; no leaks | **CRITICAL** |
| **Control Air System Check** | Pressure 6 - 8 bar; dew point <-10°C; flow rate adequate | **HOLD** |
| **Electrical System Megger Test** | Stator-to-frame >100 MΩ @ 5 kV DC | **CRITICAL** |
| **Control System Function Test** | All interlocks respond; annunciators light; valves actuate | **CRITICAL** |
| **Safety System Verification** | Emergency shutdown responsive; alarms audible & visible | **CRITICAL** |

#### Phase 2: No-Load Start & Synchronization (Duration: 2 - 4 hours)

| Test | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **First Start on Natural Gas** | Engine starts smoothly; stabilizes within 30 sec | **CRITICAL** |
| **Idle Running (30 minutes)** | No abnormal vibration/noise; oil pressure 3 - 5 bar; water temp <70°C | **CRITICAL** |
| **No-Load Frequency Stability** | Frequency 50.0 ±0.5 Hz or 60.0 ±0.5 Hz; stable | **HOLD** |
| **Voltage Buildup Test** | Terminal voltage reaches 90% nominal within 10 sec startup | **CRITICAL** |
| **Synchronization Check** | Phase sequence correct; voltage balance <3%; frequency match <0.1 Hz | **CRITICAL** |
| **Lube Oil Pressure Stability** | 3 - 5 bar at idle; <3.5 bar alarm threshold verified | **HOLD** |
| **Cooling Water Circulation** | Flow adequate; temperature stable 35 - 45°C inlet; <70°C outlet | **CRITICAL** |
| **Exhaust Temperature** | Stable at 460 - 520°C; recorder operational | **HOLD** |

#### Phase 3: Load Ramp Test (Duration: 4 - 6 hours)

| Load Level | Duration | Acceptance Criterion | Hold Point |
|---|---|---|---|---|
| **25% Load** | 30 min | Stable operation; fuel consumption within ±10% of design | **HOLD** |
| **50% Load** | 30 min | All parameters nominal; no vibration; oil temp <45°C | **HOLD** |
| **75% Load** | 1 hour | Steady-state operation; lube oil pressure 3 - 5 bar; water <70°C | **CRITICAL** |
| **100% Load (MCR)** | 4 hours continuous | **CRITICAL PHASE:** Check all operating parameters continuously |
| **Parameter Logging (100% MCR)** | 4 hours | Data recorded every 5 minutes; trending analysis performed | **CRITICAL** |

**100% Load (MCR) Acceptance Criteria:**

| Parameter | Acceptance Criterion | Instrument | Hold Point |
|---|---|---|---|
| **Electrical Power Output (P)** | ±2% of nameplate MW | Power analyzer or generator control | **CRITICAL** |
| **Voltage (3-phase)** | 90% to 110% nominal; balance <3% | Voltmeter (analog/digital) | **HOLD** |
| **Frequency (Steady-State)** | ±0.5% of nominal (e.g., 50.0 ±0.25 Hz) | Frequency meter | **CRITICAL** |
| **Power Factor** | 0.9 ±0.05 lagging | Power factor meter | **HOLD** |
| **Engine Speed** | ±1% of synchronous speed (e.g., 514 ±5 rpm) | Tachometer | **CRITICAL** |
| **Fuel Gas Consumption** | Within ±10% of design datasheet | Flow meter; unit: m³/h or kg/h | **CRITICAL** |
| **Lube Oil Pressure** | 3.5 - 4.5 bar (typical normal range) | Pressure gauge | **CRITICAL** |
| **Lube Oil Temperature** | 40 - 45°C | Temperature gauge | **HOLD** |
| **Fuel Gas Pressure** | 15 - 25 bar (design operating range) | Pressure gauge | **CRITICAL** |
| **Fuel Gas Temperature** | <35°C at engine inlet | Temperature gauge | **HOLD** |
| **Cooling Water Inlet Temp** | <35°C (or per design) | Temperature gauge | **CRITICAL** |
| **Cooling Water Outlet Temp** | <70°C (or per design) | Temperature gauge | **CRITICAL** |
| **Exhaust Gas Temperature** | 460 - 520°C (before turbocharger) | Thermocouple/pyrometer | **HOLD** |
| **Turbocharger Speed** | Within design limit; typically <150% of engine speed | Laser/magnetic pickup | **CRITICAL** |
| **Vibration (Overall)** | <7.1 mm/s RMS (ISO 10816) or <0.3" displacement | Vibration sensor/meter | **CRITICAL** |
| **Combustion Pressure (Peak)** | ±5% of design mean effective pressure | Piezo transducer (if instrumented) | **HOLD** |
| **Air Intake Pressure** | Per design (typically 1.5 - 2.5 bar abs) | Pressure gauge | **HOLD** |
| **Intercooler Outlet Temp** | <50°C @ 100% load | Temperature gauge | **HOLD** |

#### Phase 4: Load Rejection Test (Duration: 1 - 2 hours)

| Test | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Sudden Load Removal (100% → 0%)** | Frequency overshoot <110% nominal; recovery within 10 sec | **CRITICAL** |
| **Governor Response** | Fuel valve closes smoothly; no hunting or oscillation | **HOLD** |
| **Voltage Transient** | <120% of nominal; dV/dt <50 V/ms | **CRITICAL** |
| **Emergency Shutdown (E-Stop) Response** | Engine stops within 5 seconds of signal | **CRITICAL** |

#### Phase 5: Fuel Oil System Test (if dual-fuel configured)

| Test | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Switch from Gas to Oil Operation** | Switchover smooth; no power loss >10%; fuel consumption per spec | **CRITICAL** |
| **Oil System Pressure** | 2 - 8 bar at rated speed | **HOLD** |
| **Oil Heater Performance** | Oil temperature reaches 40 - 50°C within design time | **HOLD** |
| **Operate on Oil for 1 hour** | All parameters nominal (same as gas operation acceptance) | **CRITICAL** |
| **Switch Back to Gas** | Smooth transition; no misfire or lag | **HOLD** |

#### Phase 6: Post-FAT Verification (Duration: 1 - 2 hours)

| Test | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Insulation Resistance Retest** | >100 MΩ @ 5 kV DC (compare to baseline) | **CRITICAL** |
| **Vibration Signature** | Compare to baseline; no significant increase in overall amplitude | **HOLD** |
| **Lube Oil Analysis** (post-test) | TAN <0.3 mg KOH/g; particle count ISO 15/13/10 | **HOLD** |
| **Component Temperature Survey** | IR thermography; all surfaces within design limits | **INSPECT** |
| **Document Complete Test Log** | All test data recorded, signed by OEM and inspector | **CRITICAL** |

### 2.4 FAT Acceptance Decision Matrix

| Condition | Action | Next Step |
|---|---|---|
| **All tests PASS; all critical hold points witnessed** | **FAT APPROVED** | Release for shipment; prepare for site commissioning |
| **Minor deviation (within waiver limit)** | Engineering review; document CAR (Corrective Action Request) | Proceed with conditions; resolve before site FAT |
| **Critical failure; cannot be repaired** | **FAT REJECTED** | Engine return to OEM; replacement unit procured |
| **Moderate issue; repairable onsite** | Perform repair + retest failed phase | Repeat relevant FAT test sequence; obtain sign-off |

---

## 3. Site Acceptance Testing (SAT) — Wartsila Gas Engine Generator

### 3.1 Pre-SAT Activities

| Activity | Hold Point | Acceptance Criterion |
|---|---|---|---|
| **Delivery Inspection** | **INSPECT** | No shipping damage; all accessories accounted for per packing list |
| **Foundation Inspection** | **CRITICAL** | Concrete strength >20 MPa; anchor bolts properly embedded & torqued |
| **Fuel Gas Supply Qualification** | **CRITICAL** | Pressure 15 - 25 bar stable; composition >85% CH4; dew point <-10°C |
| **Cooling Water Supply Qualification** | **CRITICAL** | Flow capacity per design; temperature stable <30°C; hardness <200 ppm |
| **Electrical Interconnection (Utility/Load)** | **CRITICAL** | Switchgear functional; grounding <1 Ω; voltage within ±5% nominal |
| **Insulation Resistance Test (After Installation)** | **CRITICAL** | >100 MΩ @ 5 kV DC (baseline post-transportation) |
| **Control System Checkout** | **HOLD** | All interlocks functional; alarms & shutdown verified |

### 3.2 Site Commissioning Test Procedure

#### Phase 1: System Integration Verification (Duration: 2 - 3 days)

| Verification | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Fuel Gas System Pressure Test** | All piping holds 1.5 × operating pressure for 1 hour; no leakage | **CRITICAL** |
| **Cooling Water System Flushing** | >90% of magnetic particle contamination removed; water clarity <ISO 15/13/10 | **HOLD** |
| **Lube Oil System Flushing** | Engine oil circulation without load; circulate >4 hours; particle count acceptable | **CRITICAL** |
| **Electrical Cable Insulation Test** | All motor/control cables: insulation resistance >1 MΩ @ 1 kV DC | **HOLD** |
| **Generator Stator Insulation Retest** | >100 MΩ @ 5 kV DC (post-installation baseline) | **CRITICAL** |
| **Control Panel Functional Test** | All push-buttons, switches, indicators operational | **HOLD** |

#### Phase 2: Engine Commissioning Run (Duration: 4 - 8 hours)

| Test | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **Initial Fuel Gas Introduction** | Fuel supply filtered; pressure at design point; odor detection (mercaptan) | **CRITICAL** |
| **Starting Sequence** | Engine starts within 3 attempts; startup air/fuel synchronized | **CRITICAL** |
| **Idle Mode Operation (30 min)** | Smooth idling; no misfiring; oil pressure 3 - 5 bar; temperature trending normal | **HOLD** |
| **Load Ramp to 25% MCR** | Smooth power increase; response to load transient <5 sec; no stalling | **HOLD** |
| **Sustained Operation at 50% MCR (2 hours)** | All parameters stable; fuel consumption per design; no alarms | **CRITICAL** |
| **Load Increase to 75% MCR** | Continue testing; all operating parameters nominal | **HOLD** |
| **Sustained Operation at 100% MCR (4 hours minimum)** | See FAT Phase 3 acceptance criteria (replicated for site) | **CRITICAL** |

#### Phase 3: Acceptance of Site SAT

| Condition | Action | Hold Point |
|---|---|---|---|
| **All test phases completed successfully** | **SAT APPROVED** | Release to plant operations; commence warranty period |
| **Minor deviation with CAR** | Engineering documentation; repair scheduled; limited operation | **HOLD** |
| **Critical failure** | **SAT REJECTED** | Contact OEM; arrange corrective action or unit replacement |

---

## 4. Product Conformity & Regulatory Requirements

### 4.1 Regulatory Approvals & Certifications

| Requirement | Standard/Directive | Acceptance Criterion | Hold Point |
|---|---|---|---|
| **CE Marking** | Machinery Directive 2006/42/EC | Nameplate bears CE mark; Declaration of Conformity provided | **CRITICAL** |
| **Pressure Equipment** | PED 2014/68/EU (if applicable) | Design pressure certified; relief valves certified | **CRITICAL** |
| **Electrical Safety** | Low Voltage Directive 2014/35/EU | Electrical equipment <1000 V rated; safety functions verified | **HOLD** |
| **Environmental Emissions** | ISO 8601 / 13585 (Noise) | Sound level at 1 m <90 dB(A) typical; measurement report | **HOLD** |
| **Fuel Gas System Safety** | NFPA 30 (USA) / EN 12952 (EU) | Gas detection system calibrated; overpressure protection | **CRITICAL** |
| **EMC (Electromagnetic Compatibility)** | Directive 2014/30/EU | Power quality test report; harmonic distortion <5% | **HOLD** |

### 4.2 Factory Inspection & Test Report (Conformity Certificate)

**Document Title:** Product Conformity Test Report / Factory Acceptance Test Certificate

**Mandatory Content:**

| Section | Detail | Signature Required |
|---|---|---|
| **Equipment Identification** | Model, S/N, rating, manufacturing date | OEM QA Manager |
| **Design Verification** | Design review sign-off; comparison to approved datasheet | OEM Engineering |
| **Material Traceability** | Certificates of Conformance for critical components (turbo, injectors, valves) | Material Control |
| **Pressure Testing** | Fuel system, oil system, cooling system pressure test records | Test Operator |
| **Visual Inspection Report** | Pre-FAT inspection checklist; photographic evidence if defects found | Quality Inspector |
| **FAT Test Results** | All test phases with tabulated data; trend plots if available | Test Engineer |
| **Non-Conformance & Resolutions** | Any deviations discovered and corrective actions taken | QA Manager |
| **Final Approval** | Signed authorization for release from factory; approval date | OEM QA Director |

---

## 5. ITP Code Designations — Wartsila Gas Engine Generator

### Activity Status Codes

| Code | Meaning | Implication for Procurement |
|---|---|---|
| **A** | Approved | Contractor may proceed immediately; no further approval needed |
| **B** | Approved with Comments | Contractor proceeds; must address all comments in written response |
| **I** | Information / For Record | Reference document; no action required from contractor |
| **C** | Submitted for Approval | Contractor awaits formal approval before proceeding |

### Inspection Hold Point Designation

| Level | Symbol | Authority | Waiver Process |
|---|---|---|---|
| **CRITICAL** | **C** | **MUST witness and sign-off** | PMC/Project Director authorization ONLY |
| **HOLD** | **H** | MUST inspect and approve | PMC Engineering approval |
| **INSPECT** | **I** | Verify visually; photo record recommended | QA spot-check authorized |
| **N/A** | — | Contractor responsibility; audit verification | Not applicable |

---

## 6. PLTMG Tobelo Project-Specific Notes

### 6.1 Tobelo Power Plant Configuration

Based on the STg 0020 PLTMG Paket Tobelo documentation:

| Parameter | Detail |
|---|---|
| **Project Name** | PLTMG Paket Tobelo (Combined Cycle Power Plant - Indonesia) |
| **Location** | Tobelo, North Maluku Province, Indonesia |
| **Project Capacity** | Total plant: Multiple Wartsila units; single unit specification per this ITP |
| **Fuel Supply** | Natural gas from local gas field; LFO backup capability |
| **Ambient Conditions** | Tropical location; temperature 25 - 35°C; humidity 60 - 90%; altitude <200 m |
| **Water Supply** | Seawater cooling (with intake piping from nearby source); desalination for lube oil system |

### 6.2 Site-Specific Environmental Compliance

| Aspect | Specification | Verification |
|---|---|---|
| **Air Quality** | Emissions monitoring; NO<sub>x</sub> limit per project permit | Continuous monitoring equipment installed |
| **Noise Emission** | <90 dB(A) @ 1 m per nameplate specification | Sound survey upon commissioning |
| **Wastewater** | Oil separator and coolant discharge per MARPOL/local regulations | Monthly discharge sampling |
| **Vibration** | <7.1 mm/s RMS per ISO 10816; foundation designed accordingly | Baseline vibration survey @ commissioning |
| **Safety** | Gas detection system active; emergency shutdown procedures documented | Regular safety drills; training records |

### 6.3 Commissioning Team & Contact Information

| Role | Responsibility | Contact |
|---|---|---|
| **OEM Commissioning Engineer** | On-site FAT/SAT supervision; technical guidance | Wartsila Field Service Manager |
| **Project Quality Manager** | QA oversight; hold point authority; document control | Project Management Consultant (PMC) |
| **Site Engineering Supervisor** | Coordination with installation contractor; logistics | Site Engineer (Contractor) |
| **Local Inspection Authority** | Regulatory verification; on-site sign-off | Department of Energy (Government) |

---

## 7. Spare Parts & Maintenance Records

### 7.1 Critical Spare Parts for Warranty Coverage

| Component | Spare Quantity | Lead Time (weeks) | Notes |
|---|---|---|---|
| **Fuel Injectors (set of cylinders)** | 1 set | 4 - 6 | Nozzle assembly; pressure-tested |
| **Turbocharger Rotor Kit** | 1 | 6 - 8 | Cartridge bearing assembly |
| **Lube Oil Cooler Core** | 1 | 2 - 3 | Plate-frame aluminum |
| **Generator Slip Rings & Brushes** | 1 set | 4 - 5 | Carbon brush assembly |
| **Air Intake Valve Assembly** | 1 per bank | 3 - 4 | Check valve + pilot solenoid |
| **Fuel Pressure Regulator Diaphragm** | 3 | 1 - 2 | Consumable item |
| **Control Air Dryer Cartridge** | 3 | 1 - 2 | Desiccant replacement |
| **Cylinder Head Gasket Set** | 1 | 4 - 6 | Complete set; copper-asbestos |
| **Crankshaft Oil Seals** | 2 | 2 - 3 | Fluoroelastomer (FKM) |
| **Radiator Tube Bundle** | 1 | 6 - 8 | Cooling core assembly |

### 7.2 Post-Commissioning Maintenance Schedule

| Interval | Task | Acceptance Criterion |
|---|---|---|
| **Every 500 hours or 1 month** | Lube oil analysis | TAN <0.5 mg KOH/g; particle count ISO 15/13/10 |
| **Every 500 hours** | Fuel filter change | Clean filter installed; replacement certificate |
| **Every 1000 hours or 6 months** | Visual inspection; vibration survey | Trending; no unusual wear patterns |
| **Every 2000 hours or 1 year** | Compression pressure test | Within ±10% of design BMEP | 
| **Every 4000 hours or 2 years** | Fuel injector cleaning/flow test | Flow rate within ±5% of new spec |
| **Every 8000 hours or 4 years** | Major overhaul (valve refacing, ring replacement) | Per OEM maintenance manual |

---

## 8. Quality Assurance Matrix — Key Hold Points Summary

### FAT Hold Point Checklist

| Hold Point | Test/Activity | Authority | Release Criterion |
|---|---|---|---|
| **CRITICAL-1** | Pre-FAT documentation review (Type Tests, Certs) | OEM QA Manager | All docs present & signed |
| **CRITICAL-2** | Insulation resistance test (stator/frame) | Electrical Inspector | >100 MΩ @ 5 kV DC |
| **CRITICAL-3** | Control system function test (interlocks, shutdown) | Controls Engineer | All functions verified |
| **CRITICAL-4** | 100% load sustained operation (4 hours) | Test Engineer | All parameters within spec |
| **CRITICAL-5** | Fuel system pressure & composition test | Fuel Systems Engineer | Pressure 15 - 25 bar; CH4 >85% |
| **CRITICAL-6** | Generator synchronization & voltage buildup | Electrical Engineer | Voltage rise 90% nominal in 10 sec |
| **CRITICAL-7** | FAT test log completion & signature | OEM QA Director | All data recorded; final sign-off |

### SAT Hold Point Checklist

| Hold Point | Test/Activity | Authority | Release Criterion |
|---|---|---|---|
| **CRITICAL-S1** | Foundation & anchor bolt torque verification | Structural Engineer | All bolts per spec; no settlement |
| **CRITICAL-S2** | Fuel gas supply qualification (pressure/composition) | Site Fuel Engineer | 15 - 25 bar stable; CH4 >85% |
| **CRITICAL-S3** | Insulation resistance test (post-installation) | Electrical Inspector | >100 MΩ @ 5 kV DC |
| **CRITICAL-S4** | Site commissioning run: 100% MCR (minimum 4 hours) | Commissioning Engineer | All parameters within tolerance |
| **CRITICAL-S5** | Cooling water system commissioning | Mechanical Engineer | Flow & temperature per design |
| **CRITICAL-S6** | Final SAT approval & release to operations | Project Manager | All hold points signed-off |

---

## 9. Applicable Standards & References

### International Standards

- **IEC 60034-1** — Rotating electrical machines — General characteristics
- **IEC 60034-3** — Rotating electrical machines — Thermal protection and regulation
- **ISO 8601** — Natural gas — Quality specification
- **ISO 10816** — Mechanical vibration — Evaluation of machine vibration
- **ISO 8573-1** — Compressed air quality
- **IEC 61643-12** — Low-voltage surge protective devices
- **NFPA 30** — Flammable and combustible liquids code (USA)

### OEM Documentation

- **Wartsila Engine Technical Manual** — Operation & maintenance procedures
- **Wartsila Generator Datasheet** — Electrical characteristics & test protocols
- **Wartsila Auxiliary Systems Manual** — Cooling, fuel, lube oil, control air specifications
- **Wartsila FAT/SAT Procedure Document** — Factory and site acceptance test protocols

### Project-Specific Documents

- **Project Power Plant Design Report** — System integration; electrical interconnection
- **Fuel Gas Supply Specification** — Composition limits; pressure/flow requirements
- **Cooling Water System Specification** — Temperature, flow, chemistry requirements
- **Environmental Compliance Plan** — Emissions, noise, wastewater discharge limits

---

## 10. Document Version & Approval

| Revision | Date | Prepared By | Reviewed By | Status |
|---|---|---|---|---|
| 1.0 | 2026-04-13 | Project Management | QA/QC Lead | Active |

**For updates, corrections, or technical clarifications:**  
Contact Wartsila Technical Support or Project Quality Assurance team.

---

## Appendix A: FAT Test Data Logging Template

```
Factory Acceptance Test Report
Equipment: Wartsila [Model] Gas Engine Generator
Serial Number: [XXX-XXX]
Test Date: [DD/MM/YYYY]
Location: [Wartsila Factory, Trieste/Vaasa/other]

PART A: 100% LOAD TEST PARAMETER LOG
(Logged every 5 minutes for 4-hour continuous run)

Time (hh:mm) | Power (MW) | Freq (Hz) | Voltage (kV) | Lube Oil Temp (°C) | Fuel Consumption (m³/h) | Exhaust Temp (°C)
[Data entry rows]

PART B: CRITICAL ACCEPTANCE CRITERIA VERIFICATION
[ ] Electrical Power Output: ±2% of [___] MW
[ ] Frequency Stability: ±0.5 Hz of [50/60] Hz
[ ] Voltage Balance: <3% between phases
[ ] Lube Oil Temperature: 40 - 45°C
[ ] Fuel Consumption: Within ±10% of design
[ ] All Alarms: No false triggers
[ ] Emergency Shutdown: Response time <5 sec

APPROVED BY:
___________________________            ___________________________
OEM Test Engineer (Print/Sign)      Date

___________________________            ___________________________
Project Inspector (Print/Sign)         Date
```

---

## Appendix B: SAT Vibration Survey Template

| Measurement Point | Baseline (mm/s RMS) | Post-Commissioning (mm/s RMS) | Variance (%) | Acceptance |
|---|---|---|---|---|
| **Engine Block (X-axis)** | [___] | [___] | [___] | PASS / FAIL |
| **Engine Block (Y-axis)** | [___] | [___] | [___] | PASS / FAIL |
| **Engine Block (Z-axis)** | [___] | [___] | [___] | PASS / FAIL |
| **Generator Frame (X-axis)** | [___] | [___] | [___] | PASS / FAIL |
| **Generator Frame (Y-axis)** | [___] | [___] | [___] | PASS / FAIL |
| **Generator Frame (Z-axis)** | [___] | [___] | [___] | PASS / FAIL |
| **Overall Vibration** | [___] | [___] | [___] | PASS / FAIL |

**Acceptance Limit per ISO 10816:** Overall vibration <7.1 mm/s RMS

