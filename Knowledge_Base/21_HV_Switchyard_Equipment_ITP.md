# HV Switchyard Equipment — Inspection & Test Plan Knowledge Base

## Overview & Scope

This document consolidates Inspection and Test Plan (ITP) knowledge for High Voltage (HV) Switchyard equipment used in power generation and distribution projects. The equipment operates at voltages typically ranging from 11 kV to 500 kV, with standardized testing per IEC and ANSI/IEEE specifications.

### Voltage Classes & Equipment Ratings

| Equipment Type | Rated Voltage | BIL (kV) | Rated Current (A) | Insulation Level |
|---|---|---|---|---|
| Circuit Breaker (CB) | 132 kV - 765 kV | 550 - 2050 | 1000 - 4000 | Class A |
| Current Transformer (CT) | 66 kV - 500 kV | 170 - 1550 | 100 - 2000 | Class A |
| Voltage Transformer (VT) | 66 kV - 500 kV | 170 - 1550 | 50 - 200 | Class A |
| Capacitor Voltage Transformer (CVT) | 66 kV - 500 kV | 170 - 1550 | 100 - 400 | Class A |
| Disconnector | 66 kV - 500 kV | 170 - 1550 | 1000 - 4000 | Class A |
| Surge Arrester | 66 kV - 500 kV | Special | 10 - 50 (ref) | Special |
| Aluminium Busbar Conductors | All classes | N/A | 600 - 3000 | N/A |

---

## 1. Circuit Breaker (CB) — Inspection & Test Plan

### 1.1 Equipment Technical Data

**Type:** Oil-Insulated / SF6 Gas-Insulated / Vacuum Interruption

**Rated Voltage:** 132 kV to 765 kV  
**Rated Current (Ic):** 1000 A to 4000 A  
**Rated Short Circuit Breaking Current:** Up to 63 kA  
**Basic Insulation Level (BIL):** 550 kV to 2050 kV  
**Operating Mechanism:** Spring-Loaded / Motor-Driven  

### 1.2 Type Tests

Type tests verify that the equipment design meets specifications and are performed ONCE for each unique design at an independent test laboratory.

| Test Type | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Dielectric Strength** | IEC 60056 | No flashover at 1.5 × rated voltage for 1 min | **CRITICAL** |
| **Temperature Rise** | IEC 60056 | <40°C above ambient at rated current | **HOLD** |
| **Short Circuit Withstand** | IEC 60056 | No mechanical damage at rated breaking current | **CRITICAL** |
| **Insulation Resistance** | IEC 60056 | >100 MΩ at 5 kV DC | **HOLD** |
| **Power Loss Measurement** | IEC 60056 | <25 W per phase at rated current | **CRITICAL** |
| **Operating Mechanism Test** | IEC 60056 | Minimum 3000 mechanical operations | **CRITICAL** |

### 1.3 Routine Tests (Factory)

Routine tests are performed on EVERY unit before shipment to verify manufacturing quality.

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Visual Inspection** | IEC 60056 | No cracks, corrosion, or mechanical damage | **INSPECT** |
| **Contact Resistance** | IEC 60056 | <0.5 mΩ per phase | **HOLD** |
| **Insulation Resistance** | IEC 60056 | >100 MΩ @ 5 kV DC | **CRITICAL** |
| **Partial Discharge** | IEC 60270 | <10 pC at 1.5 × rated voltage | **CRITICAL** |
| **Power Loss (No-Load)** | IEC 60056 | <5 W per phase | **HOLD** |
| **Operating Cycle Test** | IEC 60056 | 10 O-C-O cycles without failure | **CRITICAL** |

### 1.4 Factory Acceptance Tests (FAT)

| Test | Duration | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Type Test Certificate Verification** | Documentation review | Original signed by independent lab | **CRITICAL** |
| **Certificate of Conformance** | Review | Covers all routine tests performed | **CRITICAL** |
| **Pressure Relief Test** (SF6 units) | Functional test | Relief valve operates at design pressure ±10% | **HOLD** |
| **Insulation Fluid Analysis** (Oil units) | Lab analysis | Water <50 ppm, Acid <0.5 mg KOH/g | **HOLD** |
| **Operating Mechanism Count** | Functional test | Records <100 prior operations | **CRITICAL** |

### 1.5 Site/Field Tests

| Test | Frequency | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Insulation Resistance** | Upon arrival, before installation | >50 MΩ @ 5 kV DC | **HOLD** |
| **Pressure Test** (SF6 units) | Before energization | Within ±5% of design pressure | **CRITICAL** |
| **Contact Resistance Measurement** | Final commissioning | <0.5 mΩ per phase | **HOLD** |
| **Operating Cycle Verification** | Final commissioning | 3 O-C-O cycles successful | **CRITICAL** |
| **Insulation Fluid Analysis** | Final commissioning | Moisture <40 ppm, Acid <0.3 mg KOH/g | **HOLD** |

---

## 2. Current Transformer (CT) — Inspection & Test Plan

### 2.1 Equipment Technical Data

**Primary Voltage:** 66 kV to 500 kV  
**Primary Rated Current:** 100 A to 2000 A  
**Secondary Rated Current:** 5 A or 1 A standard  
**Rated Burden:** 5 VA to 30 VA  
**Accuracy Class:** 0.2, 0.5, 1.0, 3.0, 5.0  
**Basic Insulation Level (BIL):** 170 kV to 1550 kV  
**Thermal Rating:** 3 seconds at 20 × rated current  

### 2.2 Type Tests

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Dielectric Strength** | IEC 61869-2 | No flashover at 1.5 × rated voltage for 1 min | **CRITICAL** |
| **Insulation Resistance** | IEC 61869-2 | >1000 MΩ @ 5 kV DC, 1 minute | **CRITICAL** |
| **Transformer Oil Analysis** | IEC 61869-2 | Water <50 ppm, Acid <0.5 mg KOH/g | **HOLD** |
| **Accuracy Class Verification** | IEC 61869-2 | Secondary error <accuracy limit @ rated burden | **CRITICAL** |
| **Thermal Withstand** | IEC 61869-2 | No insulation degradation at 20 × rated current | **CRITICAL** |
| **Winding Resistance** | IEC 61869-2 | <5% variance between windings of same type | **HOLD** |

### 2.3 Routine Tests (Factory)

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Visual Inspection** | IEC 61869-2 | No cracks, leaks, or visible damage | **INSPECT** |
| **Insulation Resistance** | IEC 61869-2 | >100 MΩ @ 5 kV DC | **CRITICAL** |
| **Winding Resistance Measurement** | IEC 61869-2 | Primary: <0.5 Ω, Secondary: <0.05 Ω | **HOLD** |
| **Turns Ratio Verification** | IEC 61869-2 | Within ±0.5% of nameplate ratio | **CRITICAL** |
| **Insulation Oil Quality** | IEC 61869-2 | Moisture <30 ppm, Dielectric <30 kV | **HOLD** |
| **Partial Discharge** | IEC 60270 | <5 pC @ 1.5 × rated voltage | **CRITICAL** |
| **Secondary Load Test** | IEC 61869-2 | Verify burden capability with standard loads | **HOLD** |

### 2.4 Factory Acceptance Tests (FAT)

| Test | Duration | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Type Test Certificate Review** | Documentation | Signed by independent laboratory | **CRITICAL** |
| **Pressure Test** (if sealed) | Functional | Pressure relief valve operates correctly | **HOLD** |
| **Oil Sampling & Analysis** | Lab analysis | Water <20 ppm, Acid <0.2 mg KOH/g, Dielectric >35 kV | **CRITICAL** |
| **Insulation Resistance** | Measurement | >50 MΩ @ 5 kV DC | **HOLD** |
| **Turns Ratio Confirmation** | Measurement | Matches nameplate ±0.5% | **CRITICAL** |

### 2.5 Site/Field Tests

| Test | Frequency | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Visual Inspection** | Upon arrival | No damage, proper shipping configuration | **INSPECT** |
| **Insulation Resistance** | Before installation | >50 MΩ @ 5 kV DC | **HOLD** |
| **Oil Analysis** | Before energization | Water <15 ppm, Acid <0.2 mg KOH/g | **CRITICAL** |
| **Turns Ratio Verification** | Before energization | Within ±0.5% of nameplate | **CRITICAL** |
| **Secondary Burden Verification** | Before energization | Confirm connected burden <rated burden | **HOLD** |
| **System Grounding Verification** | Before energization | Secondary properly grounded at one point only | **CRITICAL** |

---

## 3. Voltage Transformer (VT) & Capacitor Voltage Transformer (CVT) — Inspection & Test Plan

### 3.1 Equipment Technical Data

**Primary Voltage:** 66 kV to 500 kV  
**Secondary Voltage:** 110 V, 220 V standard  
**Rated Burden:** 75 VA to 350 VA  
**Accuracy Class:** 0.5%, 1.0%, 1.5%  
**Basic Insulation Level (BIL):** 170 kV to 1550 kV  

**CVT-Specific Parameters:**
- Capacitor Voltage Divider Section Ratio: 100:1 to 1000:1
- Auxiliary Voltage Rating: 220 V, 50 VA typical
- Damping Resistor: Designed to limit transient overvoltage

### 3.2 Type Tests (VT & CVT)

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Dielectric Strength** | IEC 61869-3 | No flashover at 1.5 × rated voltage for 1 min | **CRITICAL** |
| **Insulation Resistance** | IEC 61869-3 | >1000 MΩ @ 5 kV DC | **CRITICAL** |
| **Accuracy Verification** | IEC 61869-3 | Secondary voltage error <accuracy limit | **CRITICAL** |
| **Transformer Oil Analysis** | IEC 61869-3 | Water <50 ppm, Acid <0.5 mg KOH/g | **HOLD** |
| **Burden Capacity Test** | IEC 61869-3 | Rated burden with <2% voltage drop | **CRITICAL** |

**CVT-Specific Type Tests:**

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Harmonic Response** | IEC 61869-3 | 3rd harmonic attenuation >25 dB | **CRITICAL** |
| **Transient Overvoltage Suppression** | IEC 61869-3 | Peak overvoltage <1.8 × rated voltage | **CRITICAL** |
| **Auxiliary Winding Performance** | IEC 61869-3 | Provides ≥95% of 220 V at rated primary voltage | **HOLD** |

### 3.3 Routine Tests (Factory)

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Visual Inspection** | IEC 61869-3 | No visible cracks, leaks, or damage | **INSPECT** |
| **Insulation Resistance** | IEC 61869-3 | >100 MΩ @ 5 kV DC | **CRITICAL** |
| **Winding Resistance** | IEC 61869-3 | Within design limits, <10% variation | **HOLD** |
| **Voltage Ratio** | IEC 61869-3 | Measured ratio ±0.5% of nameplate | **CRITICAL** |
| **Oil Quality** | IEC 61869-3 | Moisture <30 ppm, Dielectric >30 kV | **HOLD** |
| **Partial Discharge** | IEC 60270 | <5 pC @ 1.5 × rated voltage | **CRITICAL** |

### 3.4 Factory Acceptance Tests (FAT)

| Test | Duration | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Type Test Certificate Review** | Documentation | Signed by independent laboratory | **CRITICAL** |
| **Oil Sampling & Analysis** | Lab analysis | Water <20 ppm, Acid <0.2 mg KOH/g | **CRITICAL** |
| **Insulation Resistance** | Measurement | >50 MΩ @ 5 kV DC | **HOLD** |
| **Voltage Ratio Confirmation** | Measurement | Matches nameplate ±0.5% | **CRITICAL** |
| **Secondary Burden Capacity** | Measurement | Rated burden with no excessive heating | **HOLD** |

### 3.5 Site/Field Tests

| Test | Frequency | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Insulation Resistance** | Before installation | >50 MΩ @ 5 kV DC | **HOLD** |
| **Oil Analysis** | Before energization | Water <15 ppm, Acid <0.2 mg KOH/g | **CRITICAL** |
| **Voltage Ratio Verification** | Before energization | Within ±0.5% of nameplate | **CRITICAL** |
| **Connected Burden Verification** | Before energization | Actual burden <rated burden | **HOLD** |
| **System Polarity Verification** | Before energization | Correct polarity confirmed per wiring diagram | **CRITICAL** |

---

## 4. Disconnector (Isolator) — Inspection & Test Plan

### 4.1 Equipment Technical Data

**Rated Voltage:** 66 kV to 500 kV  
**Rated Current:** 1000 A to 4000 A  
**Rated Short-Time Current (peak):** 10 kA to 100 kA  
**Contact Material:** Silver-plated copper or silver-cadmium alloy  
**Mechanism Type:** Spring-Operated / Motor-Operated  
**Operating Sequence:** Load break or isolated circuit position only (does NOT break load)  

### 4.2 Type Tests

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Dielectric Strength** | IEC 62271-102 | No flashover at 1.5 × rated voltage for 1 min | **CRITICAL** |
| **Contact Resistance Measurement** | IEC 62271-102 | <0.5 mΩ per pole in closed position | **CRITICAL** |
| **Mechanical Durability** | IEC 62271-102 | Minimum 10,000 mechanical cycles without failure | **CRITICAL** |
| **Short-Time Current Withstand** | IEC 62271-102 | Withstand rated peak current without damage | **CRITICAL** |
| **Operating Force Measurement** | IEC 62271-102 | Manual operating force <800 N (typical design) | **HOLD** |

### 4.3 Routine Tests (Factory)

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Visual Inspection** | IEC 62271-102 | No mechanical damage, corrosion, or deformation | **INSPECT** |
| **Contact Resistance** | IEC 62271-102 | <0.5 mΩ per pole, all three phases | **CRITICAL** |
| **Insulation Resistance** | IEC 62271-102 | >100 MΩ @ 2.5 kV DC between open contacts | **CRITICAL** |
| **Operating Mechanism Test** | IEC 62271-102 | 20 O-C cycles performed smoothly | **CRITICAL** |
| **Lubrication Inspection** | IEC 62271-102 | Proper grease application on pivot points | **HOLD** |
| **Spring Function Test** | IEC 62271-102 | Springs compress/return smoothly within tolerance | **HOLD** |

### 4.4 Factory Acceptance Tests (FAT)

| Test | Duration | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Type Test Certificate Review** | Documentation | Signed by independent laboratory | **CRITICAL** |
| **Contact Resistance Verification** | Measurement | <0.5 mΩ per pole, all phases | **CRITICAL** |
| **Operating Cycles** | Functional test | 10 smooth O-C-O cycles without hesitation | **CRITICAL** |
| **Spring Tension Verification** | Functional test | Operating force within design range | **HOLD** |
| **Mechanical Inspection** | Visual + measurement | No visible wear, proper alignment confirmed | **INSPECT** |

### 4.5 Site/Field Tests

| Test | Frequency | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Insulation Resistance** | Before installation | >50 MΩ @ 2.5 kV DC | **HOLD** |
| **Contact Resistance Measurement** | Before energization | <0.5 mΩ per pole @ closed position | **CRITICAL** |
| **Operating Cycle Test** | Before energization | 5 O-C-O cycles, smooth operation confirmed | **CRITICAL** |
| **Mechanical Alignment** | During installation | Contacts align properly, no binding | **INSPECT** |
| **Spring Tension Verification** | During installation | Operating force within tolerance | **HOLD** |

---

## 5. Surge Arrester — Inspection & Test Plan

### 5.1 Equipment Technical Data

**Type:** Metal-Oxide (MO) or Silicon-Carbide (SiC) Non-Linear Resistor  
**Rated Voltage (MCOV):** 0.75 × system voltage class  
**Voltage Classes:** 66 kV to 500 kV systems  
**Nominal Discharge Current:** 10 kA reference; tested at 1.5 kA, 5 kA, 10 kA, 20 kA  
**Energy Absorption Capability:** Design-dependent, typically 50 kJ to 500 kJ  
**Pressure Relief Valve:** Protects against overpressure from surge energy dissipation  

### 5.2 Type Tests

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Voltage-Time Characteristics** | IEC 61643-12 | Protective level <1.5 × MCOV at 1.5 kA | **CRITICAL** |
| **Insulation Resistance** | IEC 61643-12 | >1000 MΩ @ 1 kV DC at system voltage class | **CRITICAL** |
| **Leakage Current (DC)** | IEC 61643-12 | <0.5 mA @ MCOV DC voltage | **HOLD** |
| **Leakage Current (AC)** | IEC 61643-12 | <1 mA RMS @ MCOV AC voltage | **HOLD** |
| **Surge Discharge Energy** | IEC 61643-12 | Withstand rated energy without failure/rupture | **CRITICAL** |
| **Pressure Relief Function** | IEC 61643-12 | Valve operates if arrester pressure exceeds limit | **CRITICAL** |
| **Thermal Endurance (Long Duration Current)** | IEC 61643-12 | 2 kA RMS for 100 ms; no damage | **CRITICAL** |

### 5.3 Routine Tests (Factory)

| Test | Standard | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Visual Inspection** | IEC 61643-12 | No cracks, porosity, or surface defects | **INSPECT** |
| **Insulation Resistance** | IEC 61643-12 | >100 MΩ @ 1 kV DC | **CRITICAL** |
| **Leakage Current (DC)** | IEC 61643-12 | <0.5 mA @ MCOV DC | **HOLD** |
| **Leakage Current (AC)** | IEC 61643-12 | <1 mA RMS @ MCOV AC | **HOLD** |
| **Pressure Relief Valve** | IEC 61643-12 | Functional test; opens at design pressure | **CRITICAL** |
| **Dimension Verification** | IEC 61643-12 | Dimensions within ±1% of drawing | **HOLD** |

### 5.4 Factory Acceptance Tests (FAT)

| Test | Duration | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Type Test Certificate Review** | Documentation | Signed by independent laboratory | **CRITICAL** |
| **Insulation Resistance** | Measurement | >50 MΩ @ 1 kV DC | **HOLD** |
| **Leakage Current (DC)** | Measurement | <0.5 mA @ MCOV DC | **HOLD** |
| **Leakage Current (AC)** | Measurement | <1 mA RMS @ MCOV AC | **HOLD** |
| **Pressure Relief Function** | Functional test | Valve actuates at design point | **CRITICAL** |

### 5.5 Site/Field Tests

| Test | Frequency | Acceptance Criteria | Hold Point |
|---|---|---|---|
| **Visual Inspection** | Upon arrival | No cracks, contamination, or shipping damage | **INSPECT** |
| **Insulation Resistance** | Before installation | >50 MΩ @ 1 kV DC | **HOLD** |
| **Leakage Current (DC)** | Before energization | <0.5 mA @ MCOV DC | **HOLD** |
| **Mechanical Installation** | During installation | Proper grounding; earth path <1 Ω | **CRITICAL** |
| **Pressure Relief Check** | During commissioning | Visual/mechanical test of relief function | **HOLD** |

---

## 6. Aluminium Busbar & Conductor Specifications

### 6.1 Aluminium Tube/Bus Bar Data Schedule

**Common Sizes (from ITP documentation):**

| Size | Material | Cross-Section (mm²) | Outer Diameter (mm) | Wall Thickness (mm) | Weight (kg/m) | Ampacity @ 40°C Rise (A) |
|---|---|---|---|---|---|---|
| 70 MM | 6063-T5 Aluminium | 195 | 70 | 2.5 | 0.53 | 450 |
| 80 MM | 6063-T5 Aluminium | 240 | 80 | 2.5 | 0.65 | 550 |
| 100 MM | 6063-T5 Aluminium | 300 | 100 | 2.5 | 0.81 | 700 |
| 136 MM | 6063-T5 Aluminium | 450 | 136 | 2.5 | 1.22 | 1000 |
| 150 MM | 6063-T5 Aluminium | 480 | 150 | 2.5 | 1.30 | 1100 |

### 6.2 Aluminium Conductor Strand (ACC) Specifications

**ACC 638 Conductor Type (from technical schedule):**

| Parameter | Value |
|---|---|
| **Conductor Type** | Aluminium Conductor Strand (stranded) |
| **Cross-Section Area** | 638 mm² |
| **Number of Strands** | 91 × 2.97 mm |
| **Nominal Diameter** | 31 mm |
| **DC Resistance @ 20°C** | 0.0269 Ω/km |
| **AC Resistance @ 50°C** | 0.0310 Ω/km |
| **Ampacity @ 40°C Rise** | 1850 A |
| **Ampacity @ 50°C Rise** | 1600 A |
| **Tensile Strength** | 180-210 N/mm² |
| **Modulus of Elasticity** | 69 GPa |
| **Thermal Coefficient** | 0.00403 /°C |

### 6.3 Inspection Requirements for Busbars & Conductors

| Inspection Point | Acceptance Criteria | Hold Point |
|---|---|---|
| **Visual Inspection** | No dents >5 mm, no cracks, no corrosion | **INSPECT** |
| **Dimension Verification** | Outer diameter, wall thickness within ±1% | **CRITICAL** |
| **Surface Finish** | Clean, free of dirt, oil, or grease | **INSPECT** |
| **Continuity Test (DC)** | Resistance <0.1 mΩ per 10 m length | **HOLD** |
| **Dielectric Test** | 1.5 kV AC for 1 minute, no flashover | **CRITICAL** |
| **Connection Quality** | Bolted joints: torque wrench applied per spec | **CRITICAL** |
| **Grounding Continuity** | Grounding lugs properly crimped, torqued | **CRITICAL** |

---

## 7. ITP Code Explanations

### Activity Status Codes

| Code | Meaning | Action Required |
|---|---|---|
| **A** | Approved | May proceed with activity |
| **B** | Approved with Comments | Proceed; incorporate all comments |
| **C** | Submitted for Approval | Awaiting formal approval |
| **I** | Information / For Record | For reference; no approval action required |

### Inspection Hold Point Levels

| Code | Designation | Definition |
|---|---|---|
| **CRITICAL** | Critical Hold Point | **MUST** inspect and witness; NO waiver permitted without PMC authorization |
| **HOLD** | Hold Point | MUST inspect and witness before proceeding; waiver requires PMC approval |
| **INSPECT** | Inspection Point | MUST verify visually; photographic record recommended |
| **N** | No Hold Point | Contractor responsibility; spot check by QA permitted |

### Test Result Acceptance Codes

| Code | Meaning | Action |
|---|---|---|
| **PASS** | Meets specification | Proceed; document in QC records |
| **FAIL** | Does NOT meet specification | **STOP; Investigate and Correct** |
| **CONDITIONAL PASS** | Marginal acceptance with documentation | Escalate to PMC; obtain written approval |
| **DEVIATION** | Minor non-conformance; does not affect function | Document; obtain CAR (Corrective Action Request) |

---

## 8. SF6 Gas Equipment-Specific Guidance

### SF6 Gas Pressure Requirements (from LTB-D1 Manuals)

**Typical pressure specifications for 3-column SF6-insulated equipment:**

| Operation | Pressure Level | Tolerance | Critical Limit |
|---|---|---|---|
| **Operating Pressure** | Design rating (typically 0.4-0.8 MPa) | ±5% nominal | <90% nominal |
| **Minimum Operational** | 0.9 × design rating | — | **CRITICAL** |
| **Maximum Safe** | 1.1 × design rating | — | **ALARM** |
| **Fill Pressure (cold @ 20°C)** | Per equipment nameplate | ±3% | — |
| **Pressure Relief Valve Setting** | 1.1 × design rating | ±5% | **CRITICAL** |

### SF6 Gas Drying & Moisture Control

| Measurement | Acceptance Criterion | Action if Failed |
|---|---|---|
| **Dew Point** | <-30°C @ atmospheric pressure | Recirculate through dryer |
| **Water Content (Karl Fischer)** | <100 ppm | Dry gas; re-test before re-filling |
| **Purity (Chromatography)** | >99.5% SF6; <1% air equivalent | Replace gas; purify from contamination |

### SF6 Pressure Monitoring & Testing

| Task | Frequency | Hold Point |
|---|---|---|
| **Pressure Gauge Check** | Before each operation | Visual **INSPECT** |
| **Pressure Relief Test** | Annual or per maint. plan | Functional **HOLD** |
| **Gas Purity Test** | If suspected contamination | Lab analysis **CRITICAL** |
| **Pressure Decay Test** | After 1 month of operation | <5% loss acceptable | **HOLD** |

---

## 9. Applicable Standards & References

### IEC Standards (International Electrotechnical Commission)

- **IEC 60056** — High-voltage switchgear and controlgear (Circuit Breaker specifications & testing)
- **IEC 61869-2** — Instrument transformers — Part 2: Current transformers
- **IEC 61869-3** — Instrument transformers — Part 3: Additional requirements for current transformers
- **IEC 62271-102** — High-voltage switchgear and controlgear — Disconnectors and earthing switches (Isolators)
- **IEC 61643-12** — Low-voltage surge protective devices — Surge protective device-selection and application principles
- **IEC 60270** — Partial discharge measurements
- **IEC 60296** — Mineral insulating oils for electrical equipment

### ANSI/IEEE Standards (North American)

- **IEEE C57.13** — Standard for instrument transformers
- **IEEE C37.04** — Rating structure for AC high-voltage circuit breakers rated on a symmetrical current basis
- **IEEE C62.11** — Standard for metal-oxide surge arresters
- **ANSI C37.60** — Safety requirements for overhead, pole, platform and foundation-mounted distribution apparatus

### Factory Test Documentation

**All equipment supplied under ITP shall include:**

1. Original Type Test Certificate (from OEM or independent lab)
2. Factory Test Certificate (signed by manufacturer QA)
3. Material Traceability Certificate
4. Operating Manual & Maintenance Instructions
5. As-Built Drawings (if any modifications from standard design)
6. Pressure Relief Valve Certification (for pressurized equipment)

---

## 10. Quality Assurance Matrix — Key Inspection & Test Hold Points

### Pre-Delivery (Factory) Inspection Matrix

| Equipment | Type Test Cert | Factory Tests | Oil Analysis | Insulation Resistance | Partial Discharge | Mechanical Test | Critical Hold Points |
|---|---|---|---|---|---|---|---|
| **Circuit Breaker** | **CRITICAL** | **CRITICAL** | **HOLD** | **CRITICAL** | **CRITICAL** | **CRITICAL** | DiE, OpMech, PR |
| **Current Transformer** | **CRITICAL** | **CRITICAL** | **HOLD** | **CRITICAL** | **CRITICAL** | **HOLD** | DiE, TurnsRatio, AccClass |
| **Voltage Transformer** | **CRITICAL** | **CRITICAL** | **HOLD** | **CRITICAL** | **CRITICAL** | **HOLD** | DiE, VRatio, Burden |
| **CVT** | **CRITICAL** | **CRITICAL** | **HOLD** | **CRITICAL** | **CRITICAL** | **HOLD** | DiE, Harmonics, Overvolt |
| **Disconnector** | **CRITICAL** | **CRITICAL** | N/A | **CRITICAL** | N/A | **CRITICAL** | ContRes, Mech, OpForce |
| **Surge Arrester** | **CRITICAL** | **CRITICAL** | N/A | **CRITICAL** | N/A | **HOLD** | VoltChar, LkgCurr, PR |
| **Aluminium Busbar** | Certificate | **HOLD** | N/A | **CRITICAL** | N/A | **HOLD** | Dimension, Continuity, DiE |

### Site Installation & Commissioning Matrix

| Equipment | Arrival Inspection | IR Test | Oil/Gas Analysis | Mechanical Alignment | Operational Cycle | Energization Pre-Check | Final Sign-Off |
|---|---|---|---|---|---|---|---|
| **Circuit Breaker** | **INSPECT** | **HOLD** | **CRITICAL** | **INSPECT** | **CRITICAL** | **CRITICAL** | PMC/Engineer |
| **Current Transformer** | **INSPECT** | **HOLD** | **CRITICAL** | **INSPECT** | **HOLD** | **CRITICAL** | PMC/Engineer |
| **Voltage Transformer** | **INSPECT** | **HOLD** | **CRITICAL** | **INSPECT** | **HOLD** | **CRITICAL** | PMC/Engineer |
| **Disconnector** | **INSPECT** | **HOLD** | N/A | **CRITICAL** | **CRITICAL** | **HOLD** | Site Eng. |
| **Surge Arrester** | **INSPECT** | **HOLD** | N/A | **CRITICAL** | **HOLD** | **HOLD** | Site Eng. |
| **Busbars & Conductors** | **INSPECT** | **CRITICAL** | N/A | **CRITICAL** | N/A | **HOLD** | Site Eng. |

---

## 11. Common Issues & Root Causes — Lessons Learned

### High Voltage Equipment Failure Modes

| Equipment | Common Failure Mode | Root Cause | Preventive Measure |
|---|---|---|---|
| **CB/Disconnector** | Contact pitting or erosion | Moisture in insulation; inadequate drying | Proper drying; moisture monitoring |
| **CT/VT** | Oil discoloration or degradation | Moisture absorption; thermal stress | Sealed/conservator design; regular sampling |
| **CVT** | Harmonic resonance issues | Inadequate damping resistor tuning | Pre-commissioning tuning verification |
| **Surge Arrester** | Pressure relief valve failure | Excess surge energy; clogged vent | Proper grounding; energy capacity verification |
| **Busbars** | Corrosion or poor connections | Salt spray/humidity; loose bolts | Protective coatings; torque verification |
| **SF6 Equipment** | Leakage or purity degradation | Poor sealing; contamination ingress | Pressure monitoring; sealed design; purity checks |

---

## 12. Document Version & Approval

| Revision | Date | Prepared By | Reviewed By | Status |
|---|---|---|---|---|
| 1.0 | 2026-04-13 | Project Management | QA/QC Lead | Active |

**For updates, corrections, or clarifications:** Contact Project Quality Assurance or refer to latest manufacturer ITP documents.

