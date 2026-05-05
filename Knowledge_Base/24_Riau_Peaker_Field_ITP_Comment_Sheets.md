# Riau Peaker Field ITP Comment Sheets — QA Findings & Contractor Responses

## Document Overview

**Project:** Riau Peaker Power Plant (Gas Turbine & Gas Engine Combined Cycle)  
**Location:** Riau Province, Sumatra, Indonesia  
**Owner:** PT PLN (PERSERO)  
**Contractor:** Various mechanical, electrical, and civil contractors  
**Comment Sheets Reviewed:**
- Comment Sheet FITP_Fire Fighting_Riau Peaker_Rev_0
- Comment Sheet FITP_Gas Engine_Riau Peaker_Rev_0
- Comment Sheet FITP_Lifting Hoist Crane_Riau Peaker_Rev_0
- Comment Sheet FITP_Painting & Insulation Work_Riau Peaker_Rev_0

**Purpose:** Track QA findings from PLN QC Engineer reviews of Contractor-submitted Field Inspection & Test Plans (FITPs) and document contractor responses and corrections.

---

## 1. Executive Summary of Key Findings

### 1.1 Recurring QA Deficiencies Across All Riau Peaker FITPs

**Finding Category:** Structural Gaps in FITP Preparation

| Issue | Root Cause | Impact on QC | Required Action |
|-------|-----------|-------------|-----------------|
| **HSE Pre-Activity Section Absent** | Contractor templates missing K3/HSE elements | **High** — Safety work cannot start without signed permits | Add Permenaker No. 5/1996 compliance section with LOTO, JSA, PPE matrices |
| **References Section Empty** | Document copy-paste without populating references | **High** — No traceability to standards; acceptance criteria not objective | Populate with specific contract numbers, ISO standards, API codes, drawing numbers |
| **Acceptance Criteria Too Generic** | Placeholder text ("Engineering Spec," "Approved Drawing") not replaced with values | **Critical** — Inspectors cannot determine pass/fail objectively | Replace all generic criteria with quantified values (tolerances, limits, thresholds) |
| **Verifying Documents Mislabeled** | Confusion between Reference vs. Verifying documents | **Medium** — Reduces audit trail and traceability | Train inspectors on correct form types (Inspection Report, Work Permit, Test Report) |
| **Final Inspection / Handover Section Missing** | Templates do not include punch list and BAPPK closure | **High** — No formalized handover to commissioning | Add as final section; assign Hold Point (H) to permit-to-operate |
| **Receiving Inspection Incomplete** | No material or equipment receiving procedures | **Medium** — Defective items enter construction phase undetected | Add receiving inspection with mill certificate, nameplate, quantity checks |

---

## 2. FIRE FIGHTING SYSTEM FITP — Critical Findings

**Source Document:** Comment Sheet FITP_Fire Fighting_Riau Peaker_Rev_0  
**Date Prepared:** 30-03-2026  
**Prepared By:** M. Syahrul, Randy, Candra YS (PLN QC Team)

### 2.1 Finding #1: HSE Pre-Activity Section Absent

**Severity:** **CRITICAL** (Permenaker No. 5/1996 Compliance)

**Current State:**
- No Lock Out Tag Out (LOTO) procedure
- No Izin Kerja (Work Permit) requirement
- No Job Safety Analysis (JSA) / HIRARC
- No Personal Protective Equipment (PPE) matrix
- No Hot Work Permit (required for welding/cutting)
- No Confined Space Entry procedure

**Required Addition:**
```
HSE PRE-ACTIVITY CHECKLIST
┌─────────────────────────┬──────────┬──────────┬───────────────────┐
│ HSE Requirement         │ KSO Code │ PLN Code │ Verifying Document│
├─────────────────────────┼──────────┼──────────┼───────────────────┤
│ LOTO Certificate        │ W        │ W        │ LOTO Tag & Record │
│ Izin Kerja (Work Permit)│ W        │ H        │ Signed Izin Form  │
│ JSA / HIRARC            │ W        │ R        │ JSA Sheet         │
│ PPE Compliance          │ W        │ W        │ Inspection Report │
│ Hot Work Permit         │ W        │ H        │ Hot Work Permit   │
│ Confined Space Proc.    │ W        │ W        │ Confined Space Log│
└─────────────────────────┴──────────┴──────────┴───────────────────┘
```

**Reference Standards:** Permenaker No. 5/1996 (Indonesia K3 Regulation), Project HSE Plan  
**Contractor Response Expected:** Add dedicated HSE section as Section 1 of ITP matrix before technical work items

---

### 2.2 Finding #2: References Section Completely Empty

**Severity:** **HIGH** (Lack of Traceability)

**Current State:**
- Section 2 (References) contains only headings:
  - 2.1 Related Documents and Specifications [BLANK]
  - 2.2 Codes and Standards [BLANK]
  - 2.3 Shop Inspection Procedure [BLANK]
  - 2.4 Field Inspection Procedure [BLANK]

**Required Additions:**

**2.1 Related Documents:**
```
• Contract: 0683.4.PJ/DAN.02.01/DIR/2017 (Riau Peaker EPC)
• Engineering Specification: [RIAU-SPEC-FF-001] Fire Fighting System Specification Rev. 02
• P&ID: [RIAU-PID-FF-003] Fire Detection & Suppression Layout (Main Plant)
• Installation Drawings: [RIAU-DWG-FF-101 to FF-120] Pipe Routing & Support Details
• Equipment Datasheets: Pump Nameplate Data, Sprinkler Head Technical Data, Hose Specification
```

**2.2 Codes & Standards:**
```
• NFPA 20 (Installation of Stationary Pumps for Fire Protection) 2018
• NFPA 13 (Installation of Sprinkler Systems) 2019
• NFPA 72 (National Fire Alarm and Signaling Code) 2019
• ASME B31.1 (Power Piping) 2020 Edition
• ASME Section VIII Div. 1 (Unfired Pressure Vessels)
• API 589 (Fire Testing of Safety Systems in Petroleum Industry) [if applicable]
• SNI 03-3576 (Installation of Static Fire Protection Equipment)
• SMACNA HVAC Duct Construction Standards (if ductwork present)
```

**2.3 Shop Inspection Procedure:**
```
• GEPP-QC-FF-SHOP-001: Factory Acceptance Test Procedure for Fire Pump & Driver
• GEPP-QC-FF-SHOP-002: Sprinkler & Valve FAT Procedure
```

**2.4 Field Inspection Procedure:**
```
• This document: Field Inspection Test Plan (RGFPP-QC-FF-FITP-001)
• Field Test Report Template: RGFPP-QC-FF-TEST-001 (for pressure/flow tests)
• Field Inspection Report Template: RGFPP-QC-FF-INSP-001 (for visual inspections)
```

**Contractor Response Expected:** Populate References section with actual document numbers, revision levels, and applicable standards.

---

### 2.3 Finding #3: Piping Installation Activities Missing

**Severity:** **CRITICAL** (Scope Gap)

**Current State:**
- ITP focuses only on equipment receiving and testing
- No piping installation procedures included
- No welding or NDE activities for pipe joints

**Missing Sections to Add:**

```
SECTION 3: PIPING INSTALLATION & TESTING

3.1 Pipe Material Receiving Inspection
├─ Material Certificate Check (per ASME B31.1 Cl. 126.3)
├─ Pipe OD/Wall Dimensional Verification
├─ Surface Condition Inspection
└─ Verifying Document: Material Receiving Report

3.2 Pipe Fit-Up & Alignment
├─ Gap & Alignment Verification per Code Drawing
├─ Tack Weld Inspection (visual for cracks)
├─ Acceptance Criteria: Gap ≤ 3.2 mm per ASME B31.1
└─ PLN Code: W (Witness)

3.3 Welding of Piping Joints
├─ WPS (Welding Procedure Specification) Approval
├─ PQR (Procedure Qualification Record) Review
├─ Welder Certification Verification
├─ Hold Point: No welding without approved WPS & qualified welder (PLN: H)
└─ Verifying Document: Welder Certification + WPS Approval

3.4 Non-Destructive Examination (NDE) of Welds
├─ Penetrant Test (PT) for Socket-Weld Joints
│  └─ Acceptance: Per ASME B31.1 Cl. 137.4 (Indications ≤ 1/32" total length)
├─ Radiographic Test (RT) for Butt-Weld Joints (if required by spec)
│  └─ Acceptance: Per ASME B31.1 Cl. 137.3 (Type I or II per ASME Section VIII)
└─ Verifying Document: NDE Report + Film/Data File

3.5 Hydrostatic Pressure Test
├─ Test Pressure: 1.5 × Design Pressure per ASME B31.1 Cl. 345.4.2
├─ Hold Time: Per code (typically 30 min for fire protection piping)
├─ Acceptance: Zero visible leakage; pressure holds steady
├─ Hold Point (H): Test cannot start without PLN Supervisor presence
└─ Verifying Document: Pressure Test Report with Gauge Calibration Cert.

3.6 Post-Test Flushing
├─ Flush Direction: Per system design
├─ Flow Velocity: ≥ 2 m/s (minimum per NFPA 13 Cl. 8.15.3)
├─ Acceptance: Visual clarity of discharge water / no debris
└─ Verifying Document: Flushing Log
```

**Contractor Response Expected:** Develop and submit piping installation procedures referencing ASME B31.1 and project specifications.

---

### 2.4 Finding #4: Non-Destructive Examination (NDE) Missing

**Severity:** **CRITICAL** (Code Compliance)

**Current State:**
- No NDE activities (PT, RT, UT) for welded piping joints
- Fire protection piping has safety-critical welds

**Required Action:**

```
SECTION 3.4: NON-DESTRUCTIVE EXAMINATION (NDE)

Scope: 100% of welded fire protection piping joints

Methodology:
┌─────────────────────────┬───────────┬───────────────────┐
│ Joint Type              │ Test Type │ Reference         │
├─────────────────────────┼───────────┼───────────────────┤
│ Socket-Weld Joints      │ PT (Dye)  │ ASME Section V    │
│ Butt-Welds (< 6 mm)     │ PT        │ ASME B31.1 137.4  │
│ Butt-Welds (≥ 6 mm)     │ RT or UT  │ ASME B31.1 137.3  │
│ Fillet Welds (High Stress)│ MT/UT   │ ASME B31.1 137.4  │
└─────────────────────────┴───────────┴───────────────────┘

Acceptance Criteria:
• Penetrant Test: Per ASME B31.1 Table 335.4.2 (Indications ≤ 1/32" = 0.8 mm total length, no cracks)
• Radiographic Test: Per ASME Section VIII Div. 1 Appendix 8 (Type I or II per code)
• Ultrasonic Test: Per ASME Section V Article 4 (UT acceptance per ISO 16810-2)

Hold Point (H): All NDE results must be accepted by PLN before final closure welding or next activity
Verifying Document: NDE Report (PT Film, RT Radiograph, UT Data File) + Inspector Sign-Off
```

**Contractor Response Expected:** Submit NDE plan with examination methodology, technician qualifications, acceptance criteria referencing ASME codes.

---

### 2.5 Finding #5: Fire Pump Installation & Performance Testing Incomplete

**Severity:** **HIGH** (Critical Equipment)

**Current State:**
- Receiving inspection only; no installation procedures
- No performance test specified
- No vibration analysis requirement

**Required Addition:**

```
SECTION 3.7: FIRE PUMP INSTALLATION & TESTING

3.7.1 Pump Foundation & Anchor Bolt Verification
├─ Anchor Bolt Tightness: Per manufacturer specs (typically 70–80% yield strength)
├─ Hold-Down Nut Locking: Lock washers / thread-locking compound per design
├─ Acceptance: Bolts torqued per manufacturer, no visible movement
└─ Verifying Document: Torque Log + Inspection Report

3.7.2 Pump Installation & Leveling
├─ Alignment per Coupling Manufacturer Manual (typically ≤ 0.05 mm runout)
├─ Level Check: Rotor centerline horizontal within ± 2 mm over span
├─ Acceptance: Visual level check + dial indicator measurement
└─ Verifying Document: Alignment Verification Report

3.7.3 Grouting (if grouted installation)
├─ Grout Material: Per specification (epoxy or non-shrink cement)
├─ Cure Time: Per material datasheet (typically 7 days before operation)
├─ Acceptance: Visual hardness test + no voids detected
└─ Hold Point (H): Grouting must cure before equipment start-up (PLN: H)

3.7.4 Running Test
├─ Duration: 30 minutes at no-load condition (or per manufacturer spec)
├─ Monitoring: Bearing temperature (alert ≤ 65°C), vibration amplitude, noise
├─ Acceptance Criteria: No abnormal heat, vibration ≤ 100 μm peak-to-peak, normal bearing sound
└─ Verifying Document: Running Test Log

3.7.5 Vibration Analysis (Optional if contract specifies)
├─ Method: Per ISO 20816-3 (Pump Vibration Standard)
├─ Acceptance: Vibration Category A (< 4.5 mm/s RMS per ISO 20816-3)
└─ Verifying Document: Vibration Report

3.7.6 Performance Test — Flow & Pressure Verification
├─ Test Setup: Discharge pressure gauge, flowmeter, thermometer connected
├─ Test Conditions: Per NFPA 20 Table 4.28 (fire protection pump performance table)
├─ Acceptance Criteria:
│  ├─ Flow Rate: ≥ 100% rated flow (e.g., 1000 gpm for 1000-gpm pump)
│  ├─ Discharge Pressure: ≥ 90% rated pressure at rated flow
│  ├─ Suction Pressure: ≥ 10 psi gauge at pump inlet (positive pressure)
│  └─ Motor Current: ≤ 110% full load current per motor nameplate
├─ Hold Point (H): Performance test is HOLD POINT — PLN Supervisor must witness/sign (NFPA 20 Cl. 4.3.2)
└─ Verifying Document: Performance Test Report (NFPA 20 Form or equivalent)
```

**Contractor Response Expected:** Add fire pump installation and performance testing section with acceptance criteria per NFPA 20.

---

### 2.6 Finding #6: Hydrostatic Test — Wrong PLN Inspection Code

**Severity:** **MEDIUM** (Affects QC Decision Authority)

**Current State:**
- Item 3C(2) "Hydraulic test at 1.5 × DP" has PLN Code **"W" (Witness)**
- Standard practice requires **"H" (Hold Point)** for pressure tests

**Required Change:**
```
Item 3C(2): Hydraulic Test at 1.5 × Design Pressure
  Current:  PLN Code = W (Witness)
  CORRECTED: PLN Code = H (Hold Point) ← MANDATORY CORRECTION

Rationale:
Pressure tests are fundamental safety verifications per ASME B31.1 Cl. 345.4. 
PLN must have authority to stop work and require retest if test fails or leakage observed.
"W" (Witness) allows Contractor to proceed after test; "H" (Hold Point) requires PLN sign-off to proceed.
```

**Contractor Response Expected:** Update PLN Code for pressure test item from "W" to "H" in final FITP matrix.

---

### 2.7 Finding #7: Final Inspection & Equipment Release Section Absent

**Severity:** **HIGH** (Handover Completion)

**Current State:**
- No punch list review process
- No Berita Acara (Formal Handover Certificate) procedure
- No MDR (Manufacturer Data Record) completeness check

**Required Addition:**

```
SECTION 5: FINAL INSPECTION & EQUIPMENT RELEASE

5.1 Overall Visual & Dimensional Final Inspection
├─ Paint Condition: No peeling, chips, or corrosion (visual)
├─ Cleanliness: All dirt, dust, construction debris removed
├─ Nameplate Verification: Pump, motor, valve nameplates match purchase order
├─ Documentation: As-built drawings reviewed vs. actual installation
└─ Verifying Document: Final Inspection Report (PLN Code: R)

5.2 Punch List Review & Clearance
├─ Outstanding Items: Any incomplete work documented in punch list
├─ Corrective Action: All items addressed or accepted as-is (with documented waiver)
├─ Closure: Punch list signed by Contractor & PLN (zero open items before release)
└─ Verifying Document: Punch List Closeout Form

5.3 Inspection Release Notice (IRN) / Berita Acara Serah Terima
├─ Issued By: PLN Supervisor / Owner's Representative
├─ Issued To: Contractor's Site Manager
├─ Purpose: Formal release of equipment from construction to commissioning phase
├─ Attachments: Complete inspection sign-off checklist + test report index
├─ Hold Point (H): Equipment may not enter commissioning without IRN (PLN: H)
└─ Verifying Document: Berita Acara Serah Terima (signed by all parties)

5.4 Manufacturer Data Record (MDR) Completeness Check
├─ Contents Verification:
│  ├─ ✓ Factory Acceptance Test Report (Pump performance test from shop)
│  ├─ ✓ Material Certificates (for pressure-bearing components)
│  ├─ ✓ Manufacturer Installation Manual (printed + electronic copy)
│  ├─ ✓ Operation & Maintenance Manual (with spare parts list)
│  ├─ ✓ Pump Curve Diagram & Performance Data
│  ├─ ✓ As-Built Drawing (if configuration differs from catalog)
│  └─ ✓ Warranty Documentation (warranty period, exclusions)
├─ Acceptance: All listed items present and readable
└─ Verifying Document: MDR Checklist + Index of Included Documents

5.5 Handover to Commissioning Team
├─ Handover Meeting: Attended by Contractor, Owner, Commissioning Engineer
├─ Equipment Walkdown: System boundary, isolation points, operation instructions
├─ Documentation Handover: All inspection reports, test reports, manuals, spare parts list
├─ Commissioning Plan Review: Commissioning engineer confirms readiness
└─ Verifying Document: Handover Meeting Minutes & Attendance Sheet
```

**Contractor Response Expected:** Add final inspection and handover section as final section (Section 5) of ITP with Hold Point (H) assigned to equipment release.

---

## 3. GAS ENGINE FITP — Critical Findings

**Source Document:** Comment Sheet FITP_Gas Engine_Riau Peaker_Rev_0  
**Date Prepared:** 30-03-2026

### 3.1 Key Findings Summary

| Finding # | Issue | Severity | Root Cause |
|-----------|-------|----------|-----------|
| **1** | HSE Pre-Activity Section Absent | CRITICAL | Missing K3 compliance section |
| **2** | References Section Empty | HIGH | Incomplete document template |
| **3** | Receiving Inspection Missing | MEDIUM | Equipment delivery not covered |
| **4** | Incorrect Terminology ("Steam" in Gas Engine) | MEDIUM | Copy-paste from steam turbine template |
| **5** | Engine Mechanical Alignment Not Covered | HIGH | Scope gap; critical for performance |
| **6** | Acceptance Criteria Generic (No Numerical Limits) | CRITICAL | Inspectors cannot verify objectively |
| **7** | Verifying Documents Mislabeled | MEDIUM | Process confusion |
| **8** | Final Inspection / Handover Missing | HIGH | No formalized release procedure |

### 3.2 Finding #4: Terminology Error — "Steam Tightness Test"

**Severity:** **MEDIUM** (Documentation Accuracy)

**Current State:**
- Item 3(4) describes "Steam tightness test on governor valves/stop valves"
- **Error:** Gas engines do NOT use steam; they use fuel gas or liquid fuel

**Correction Required:**
```
ORIGINAL (INCORRECT):
Item 3(4): Steam tightness test on governor valves/stop valves
           Acceptance Criteria: Engineering Spec.; Verifying Document: Vendor Test Report

CORRECTED:
Item 3(4): Pneumatic/Fuel Gas Tightness Test on Fuel Injection System Valves
           Reference: Manufacturer Fuel System Specification [DOC-NO.]
           Test Method: Nitrogen gas at 1.5 × Design Pressure for 5 minutes minimum
           Acceptance Criteria: 
           ├─ Zero detectable leakage (no soapy water bubbles)
           ├─ Pressure drop ≤ 5% per 5 minutes per ASME B31.1
           └─ Reference: ASME B31.8 (Gas Piping) Cl. 345.4.2
           Verifying Document: Fuel Gas System Pressure Test Report
           PLN Code: H (Hold Point — no commissioning without test acceptance)
```

**Contractor Response Expected:** Revise terminology to match gas engine fuel system requirements; reference ASME B31.8 for gas piping tests.

---

### 3.3 Finding #5: Engine Mechanical Alignment Not Covered

**Severity:** **HIGH** (Critical for Equipment Longevity)

**Current State:**
- Installation section (Item 2) missing engine-to-fuel supply and engine-to-exhaust alignment
- No coupling alignment procedure for engine-to-fuel pump or engine-to-generator coupling
- No acceptance criteria for alignment tolerances

**Required Addition:**

```
SECTION 2.5: ENGINE MECHANICAL ALIGNMENT

2.5.1 Fuel System Piping Alignment
├─ Fuel Injection Nozzle Accessibility: Confirm nozzles accessible for cleaning/replacement
├─ Fuel Filter Housing Orientation: Verify bowl drain accessible for maintenance
├─ Fuel Return Line Routing: No high-point air traps; return line slopes ≥ 1:50 back to tank
├─ Acceptance: Visual inspection + dimensional check (no kinks or tight bends)
└─ Verifying Document: System Routing Inspection Report

2.5.2 Coupling Alignment (Engine to Pump/Generator if Direct Drive)
├─ Test Method: Dial indicator at pump/motor shaft coupling
├─ Alignment Tolerance:
│  ├─ Angular Misalignment: ≤ 0.15° (API 686 standard for power equipment)
│  ├─ Parallel Misalignment (Runout): ≤ 0.05 mm total indicator reading (TIR)
├─ Hold Point: Engine cannot run until coupling alignment verified (PLN: H)
└─ Verifying Document: Coupling Alignment Report (dial indicator measurement + sign-off)

2.5.3 Exhaust Manifold Connection
├─ Gasket Seating: Visual confirmation of gasket seating (no protrusion)
├─ Bolt Torque: Per manufacturer specification (typically 50–80 Nm for M8–M10 bolts)
├─ Acceptance: Bolts torqued; no visible gaps at gasket interface
└─ Verifying Document: Torque Check & Installation Report

2.5.4 Vibration Isolation Mounts
├─ Mount Condition: No cracks, excessive deformation, or oil leakage
├─ Mount Deflection: Verify spring rate per manufacturer (measured load/deflection)
├─ Acceptance: Visual inspection + load test (if required by engineer)
└─ Verifying Document: Mount Inspection Report
```

**Contractor Response Expected:** Add mechanical alignment section with acceptance criteria per API 686 or manufacturer installation manual.

---

### 3.4 Finding #6: Acceptance Criteria — All Generic, No Numerical Limits

**Severity:** **CRITICAL** (QC Objectivity)

**Current State:**
Example items throughout ITP:
- Item 2.1: "Engine installation and bolting" → Acceptance: **"Engineering Spec."**
- Item 3.2: "Pressure test" → Acceptance: **"Approved Drawing"**
- Item 4.1: "Control system test" → Acceptance: **"Manufacturer's Manual Operation"**

**Problem:** Inspectors cannot determine pass/fail without specific values.

**Required Corrections:**

```
ORIGINAL (UNACCEPTABLE):
Item 2.1: Engine Installation and Bolting
  Acceptance Criteria: Engineering Spec.

CORRECTED (OBJECTIVE):
Item 2.1: Engine Foundation Anchor Bolts — Tightness Verification
  Reference: Specification [RIAU-SPEC-GE-001] Cl. 3.2.1 & Manufacturer Manual [GE-MFG-IM-001] Cl. 5.3
  Acceptance Criteria:
  ├─ M20 × 2.5 Grade 8.8 Anchor Bolts: Torque 450 ± 20 Nm (per DIN 912 torque table)
  ├─ Bolt Preload Verification: Ultrasonic bolt tensioning or load-indicating washers (optional)
  ├─ Thread-Locking Compound: Applied to all nuts (per Loctite® 243 spec or equivalent)
  ├─ Visual Inspection: No loose bolts, washers in contact, nuts fully engaged
  └─ Measurement Method: Calibrated torque wrench ± 4% accuracy
  Verifying Document: Anchor Bolt Torque Log + Calibration Certificate
  PLN Code: W (Contractor performs, PLN witnesses first 3 bolts)
```

**Engine Performance Test Example:**
```
ORIGINAL (UNACCEPTABLE):
Item 3.5: Running Test at Rated Load
  Acceptance: Manufacturer's Manual Operation

CORRECTED (OBJECTIVE):
Item 3.5: Running Test at Rated Load
  Reference: Manufacturer Operation Manual [GE-MFG-OM-001] Cl. 7.2 & Power Plant Performance Guarantee (Schedule 6)
  Test Duration: 100 consecutive hours at ≥ 95% rated load & rated speed
  Acceptance Criteria:
  ├─ Engine Speed: 1500 ± 5 rpm [or per nameplate rating]
  ├─ Engine Output: ≥ 95% of rated power (measured by dynamometer)
  ├─ Exhaust Temperature: ≤ [XXX°C] per manufacturer limit (e.g., 450°C)
  ├─ Oil Temperature (Sump): 80–95°C (normal operating range)
  ├─ Fuel Consumption: Within ± 5% of design consumption per fuel calorific value
  ├─ Vibration: < 110% of alarm setpoint per control system (ISO 20816-3 Category B)
  ├─ No Shutdown Events: Engine runs continuously without trip/restart
  ├─ Emissions (if monitored): NOx, CO, CO₂ per environmental permit [PERMIT-NO.]
  └─ Operator Observations: Engine sound normal, no visible smoke, no component overheating
  Measurement Equipment: Fuel flow meter (±2% accuracy), thermocouples (±1°C), dynamometer, tachometer
  Verifying Document: 100-Hour Running Log (signed hourly) + Final Performance Report
  Hold Point (H): Performance test acceptance is Hold Point; engine cannot enter commercial operation without signed acceptance
```

**Contractor Response Expected:** Revise ALL acceptance criteria to include:
1. Specific reference document numbers & clause
2. Numerical limits (e.g., tolerances, thresholds, pressure values)
3. Measurement method (tool/technique)
4. Hold Point vs. Witness designation with justification

---

## 4. LIFTING HOIST & CRANE FITP — Key Findings

**Source Document:** Comment Sheet FITP_Lifting Hoist Crane_Riau Peaker_Rev_0

### 4.1 Scope: Lifting Equipment Subject to Field Inspection

**Typical Equipment Covered:**
- Diesel-Powered Telescopic Crawler Crane (100–300 ton)
- Electric Chain Hoist (5–50 ton capacity)
- Manual/Electric Rope Hoist
- Wire Rope & Slings (various capacities)
- Lifting Lugs & Anchor Points on plant equipment (generators, transformers)

### 4.2 Common Crane FITP Deficiencies

| Issue | Correction Required |
|-------|-------------------|
| **SWL (Safe Working Load) Verification Missing** | Add capacity nameplate check; link to load test per DNV 2.7-1 |
| **Wire Rope Inspection** | Add visual inspection section per ISO 4309 (rope condition grading) |
| **Load Test Procedure Incomplete** | Add test load (125% SWL), hold duration (5 min), acceptance (no permanent set) |
| **Certification & Documentation** | Add requirement for Third-party inspection certificate (TPI) for high-capacity equipment |
| **Operator Competency** | Add crane operator license verification per local regulations |
| **Maintenance Schedule Missing** | Reference manufacturer maintenance plan with inspection intervals |

### 4.3 Corrected Lifting Equipment FITP Structure

```
LIFTING EQUIPMENT FIELD INSPECTION & TEST PLAN

Section 1: Equipment Receiving & Documentation Review
├─1.1 Nameplate & Serial Number Verification
├─1.2 Manufacturer Certificate of Conformity (CE Mark if EU equipment)
├─1.3 Third-Party Inspection Certificate (for equipment > 20 tons)
└─1.4 Maintenance & Service Records Review

Section 2: Visual Inspection (Operational Readiness)
├─2.1 Structural Components — no cracks, bends, or corrosion
├─2.2 Brake System — smooth engagement, no drag, full holding capacity
├─2.3 Wire Rope Condition — per ISO 4309 Grade Limits (no excessive wear)
│   └─ Acceptance: Grade 1–2 per ISO 4309 (new/good condition)
├─2.4 Sling & Chain Condition — visual + diameter measurement
│   └─ Acceptance: No visible kinking, wear marks < 10% original diameter
├─2.5 Hook & Shackle — wear pattern, load-bearing surface condition
│   └─ Acceptance: Wear < 10% original dimensions per DNV 2.7-1
└─2.6 Electrical Systems (if powered) — cable condition, control switches

Section 3: Load Testing (Functional Verification)
├─3.1 No-Load Test (Mechanical Operation)
│   ├─ Hoist runs smoothly through full travel range
│   ├─ Brake engages/disengages without drag
│   └─ Verifying Document: No-Load Test Log
├─3.2 Load Test at 100% SWL
│   ├─ Test Load: Calibrated deadweight or water load (100% SWL)
│   ├─ Duration: Lift load 1 meter, hold 5 minutes, lower without incident
│   ├─ Observations: No swinging, jerking, or slipping
│   ├─ Brake Test: Load held safely when brake engaged; no drift
│   └─ Verifying Document: Load Test Report + Load Cell Reading Certificate
├─3.3 Load Test at 125% SWL (High-Capacity Equipment)
│   ├─ Test Load: 125% SWL (for equipment ≥ 10 tons)
│   ├─ Duration: Lift 1 meter, hold 10 minutes, lower
│   ├─ Acceptance: No permanent deformation, rope/chain not damaged
│   ├─ Hold Point (H): Test failure requires replacement/repair before use
│   └─ Verifying Document: Overload Test Certificate
└─3.4 Wire Rope / Chain Inspection Post-Test
    ├─ Diameter Measurement: At 3 points along load-bearing section
    ├─ Acceptance: Elongation < 0.5% per ISO 4309
    └─ Verifying Document: Rope Inspection Report

Section 4: Documentation & Handover
├─4.1 Inspection Release Notice (IRN)
├─4.2 Load Test Certificate (with test load value & SWL)
├─4.3 Manufacturer Maintenance Schedule
├─4.4 Operator Training & License (for powered equipment)
└─4.5 Spare Parts List (ropes, chains, hooks, brake pads)
```

---

## 5. PAINTING & INSULATION FITP — Key Findings

**Source Document:** Comment Sheet FITP_Painting & Insulation Work_Riau Peaker_Rev_0

### 5.1 Typical Deficiencies

| Deficiency | Impact | Correction |
|------------|--------|-----------|
| **Surface Preparation Not Documented** | Poor paint adhesion; premature failure | Add blasting/cleaning section with acceptance per ISO 8501-1 |
| **Paint System Specification Vague** | Wrong product applied; warranty voided | Reference specific paint system doc (primer brand/type, topcoat, dry film thickness) |
| **Dry Film Thickness (DFT) Not Measured** | Insufficient protection; corrosion risk | Add DFT measurement section per ISO 2808 (typical acceptance: 120–180 μm) |
| **Insulation Thermal Properties Not Verified** | Thermal loss increases; operational cost | Reference material datasheet; verify R-value per specification |
| **Application Temperature & Humidity Not Controlled** | Adhesion failure; blistering | Add ambient condition acceptance (typically 5–35°C, RH < 85%) |

### 5.2 Paint System FITP Structure (Typical Power Plant)

```
SECTION 2: SURFACE PREPARATION

2.1 Abrasive Blasting (Structural Steel)
├─ Blast Standard: ISO 8501-1 Grade Sa 2.5 (nearly white metal)
│   └─ Definition: 95% substrate exposed; light dust/rust shadows acceptable
├─ Blast Equipment: Approved abrasive type (aluminum oxide, iron oxide, copper slag)
├─ Surface Inspection:
│   ├─ Cleanliness: Confirm Sa 2.5 per visual standard comparator (ISO 8501-1)
│   ├─ Surface Roughness: 40–80 μm Ra (measured with surface profilometer)
│   └─ Salt Contamination Test: Soluble salts < 50 mg/m² (ISO 8502-6 chloride test)
├─ Acceptance Criteria: Uniform Sa 2.5; free of mill scale, rust, previous coating
├─ Hold Point (H): Surface must be approved before painting commences
└─ Verifying Document: Blasting Certificate + Surface Profile Report

2.2 Surface Cleaning (Non-Blasted Items: Painted Components, Structures)
├─ Method: Wire brushing, grinding, or solvent wipe per specification
├─ Cleaning Agent: Mineral spirits, acetone (per paint supplier recommendation)
├─ Acceptance: Visually clean surface; no dust, oil, or grease
└─ Verifying Document: Cleaning Inspection Report

2.3 Corrosion Inhibitor / Wash Primer (If Specified)
├─ Product: As per paint system specification [SPEC-NO.]
├─ Application: Single coat; wet film thickness 25–50 μm
├─ Cure Time: Per product datasheet (typically 24–48 hours)
├─ Acceptance: Even coverage; no runs or sags
└─ Verifying Document: Wash Primer Application Report

---

SECTION 3: PAINT SYSTEM APPLICATION

3.1 Material Quality Control
├─ Paint Batch Number & Expiration: Confirm within shelf life (typically 12 months)
├─ Paint Mixing: Per manufacturer instructions (mechanical mixer, not manual)
├─ Viscosity Verification: Per ISO 2555 (Brookfield viscometer or equivalent)
│   └─ Acceptance: ± 10% of specification viscosity
├─ Appearance Inspection: Color, clarity, absence of lumps/separation
└─ Verifying Document: Paint Batch Report + Viscosity Measurement

3.2 Primer Coat Application
├─ Product: Per paint system specification [e.g., Epoxy Polyamide Primer]
├─ Method: Spray application per ISO 12944-5 (industrial coating standard)
├─ Wet Film Thickness (WFT): 50–70 μm (measured with wet film gauge)
├─ Dry Film Thickness (DFT): 40–60 μm (measured with electromagnetic gauge per ISO 2808)
├─ Cure Time Before Topcoat: Per datasheet (typically 7–14 days @ 20°C, 50% RH)
├─ Ambient Conditions During Application:
│   ├─ Air Temperature: 5–35°C
│   ├─ Relative Humidity: 35–85% (dew point consideration: surface temp must be > dew point + 3°C)
│   └─ Acceptance: Conditions within specification; documented on application form
├─ Surface Defects: No runs, sags, orange peel, or cratering
├─ Coverage: 100% substrate covered; no holidays (bare spots)
└─ Verifying Document: Primer Application Report + DFT Measurements (3 points per m²)

3.3 Topcoat Application (Polyurethane or Acrylic)
├─ Product: Per paint system specification
├─ WFT: 60–80 μm (per product datasheet)
├─ DFT: 50–70 μm (measured per ISO 2808)
├─ Application Method: Spray or brush (per specification)
├─ Number of Coats: Typically 2 coats for industrial duty
├─ Cure Time: Per datasheet (typically 7–14 days for full hardness)
├─ Acceptance Criteria:
│   ├─ Color Match: Within acceptable shade per paint sample card
│   ├─ Gloss Level: Per specification (gloss/satin/matte)
│   ├─ Surface Finish: Smooth, uniform, no visible brush marks
│   ├─ Coverage: 100% — no primer show-through or holidays
│   └─ DFT Final: System total (primer + topcoat): 90–130 μm per specification
├─ Hold Point (H): Final paint inspection/acceptance before component installation
└─ Verifying Document: Topcoat Application Report + Final DFT Measurements

---

SECTION 4: INSULATION SYSTEM (HVAC/PIPING)

4.1 Material Receiving & Storage
├─ Material Certification: Foam insulation R-value per ASTM C518 (thermal conductivity)
├─ Manufacturer Datasheet: Verify thermal resistance, flame rating, moisture sensitivity
├─ Storage Conditions: Protected from moisture, direct sunlight (prevent degradation)
├─ Acceptance: Material properties within specification; no water damage
└─ Verifying Document: Insulation Material Receiving Report + Test Certificates

4.2 Surface Preparation for Insulation
├─ Pipe/Duct Cleaning: Removal of dirt, dust, loose paint (if applicable)
├─ Degreasing: Solvent wipe if oily surface (mineral spirits acceptable)
├─ Moisture Check: Surface must be dry (< 10% moisture content)
├─ Priming (if Required): Per insulation manufacturer (optional for most foam systems)
└─ Acceptance: Clean, dry surface ready for adhesive application

4.3 Insulation Installation
├─ Adhesive Application: Per foam manufacturer spec (contact cement, caulk, or tape)
├─ Thickness: Per specification drawing (typically 40–100 mm for HVAC ducts)
├─ Seams & Joints: Sealed with foam-compatible sealant (caulk or foil tape)
├─ Fit-Up: Insulation snugly fitted with no gaps > 5 mm
├─ Mechanical Support: Bands or straps (if required) at max. spacing per specification
└─ Verifying Document: Installation Progress Photos + Inspector Sign-Off

4.4 Quality Inspection (Insulation)
├─ Visual: Even coverage; no compression, voids, or delamination
├─ Thermal Bridge Check: No metal-to-metal contact bypassing insulation
├─ Moisture: No water seepage or condensation on surface
├─ Flame Rating Verification: Foam material grade certification (Class A if specified)
└─ Acceptance: Insulation meets specification thickness & R-value (no retest required if materials certified)

4.5 Finishing (Vapor Barrier / Jacketing)
├─ Foil Wrapper / Vapor Barrier: Applied over foam; sealed at seams
├─ Adhesive: Per foam-wrapper compatibility (typically aluminum foil + kraft paper)
├─ Sealing: All seams sealed with foil tape or mastic to prevent moisture ingress
├─ Acceptance: Vapor barrier continuous, no tears or gaps
└─ Verifying Document: Final Insulation Inspection Report
```

---

## 6. QA Document Control Framework (Best Practices)

### 6.1 Contractor Response Process for Comment Sheets

**Timeline:**
```
Day 1: Comment Sheet Issued to Contractor
         ↓
Day 14–21: Contractor Prepares Response (revisions to FITP + explanations)
         ↓
Day 21–28: PLN Reviews Contractor Response
         ↓
Day 28+: Contractor Incorporates Changes; Resubmits FITP for Final Approval
```

**Response Format (Contractor to Provide):**
```
CONTRACTOR RESPONSE TO PLN COMMENT SHEET
Document: Comment Sheet FITP_Fire Fighting_Riau Peaker_Rev_0
Date: [Response Date]
Prepared By: [Contractor QE/QA Manager Name]

Finding #1: HSE Pre-Activity Section Absent
┌────────────────────────────────────────────────────┐
│ CONTRACTOR RESPONSE:                               │
│ Status: ACCEPTED (Action Item: Revision in Progress)│
│ ├─ Action: Add Section 1 (HSE Pre-Activity)       │
│ ├─ References: Permenaker No. 5/1996, Project HSE │
│ ├─ Schedule: Revisions completed by [DATE]        │
│ └─ Revised FITP Scheduled: [DATE]                 │
│                                                    │
│ Finding #2: References Section Empty              │
│ Status: ACCEPTED                                  │
│ └─ Action: Populate Sections 2.1–2.4 with        │
│    contract numbers, standards, drawing numbers   │
│                                                    │
│ [Repeat for each finding...]                      │
└────────────────────────────────────────────────────┘
```

---

## 7. Inspection Activity Codes — Quick Reference

**Definition of QA Activity Codes per PLN/Contractor Roles:**

| Code | Meaning | Activity | Sign-Off Authority |
|------|---------|----------|------------------|
| **R** | Review | Contractor submits documentation; PLN reviews offline | PLN Manager (Can approve after desk review) |
| **W** | Witness | Contractor performs work; PLN attends and observes | PLN Inspector/Supervisor (Present during activity) |
| **H** | Hold Point | CRITICAL activity; mandatory PLN sign-off before proceeding | PLN Supervisor/Engineer (Blocks further work if rejected) |

**Example Application:**

```
Activity: Fuel System Pressure Test
└─ Contractor Role (KSO): Prepares test setup, performs test (Code: W)
└─ PLN Role: Attends test, verifies test procedure, observes results (Code: H)
└─ Outcome: If test PASSES → PLN signs test report; work proceeds
            If test FAILS → No work proceeds; corrective action required; retest mandated
```

---

## 8. Key Takeaways for Field ITP Preparation

### 8.1 Essential FITP Structure (Minimum)

1. **Cover Sheet** — Project, scope, document number, revision, signature blocks
2. **Scope & Exclusions** — Clear definition of equipment/activities in scope
3. **HSE Pre-Activity** — LOTO, Izin Kerja, JSA, PPE, permits (Permenaker No. 5/1996)
4. **References** — Contract, standards, drawings, specifications (with document numbers)
5. **Definitions** — Inspection activity codes (R, W, H) & verifying document types
6. **Material Receiving** — Mill certificates, nameplate checks, condition verification
7. **Installation Activities** — WPS/PQR, welding, alignment, torque verification
8. **Testing & Verification** — Pressure tests, functional tests, performance tests
9. **Final Inspection & Release** — Punch list, handover certificates, MDR completeness
10. **Attachments** — Test forms, calibration certificates, reference drawings

### 8.2 Critical Success Factors

✓ **Quantify Acceptance Criteria** — Replace "per spec" with actual values (e.g., "≤ 0.05 mm runout")  
✓ **Assign Correct Activity Codes** — Pressure tests = "H", visual inspections = "R", routine operations = "W"  
✓ **Reference Applicable Standards** — ASME, ISO, API, NFPA codes by edition year  
✓ **Identify Verifying Documents** — Test reports, certs, inspection forms (not reference docs like drawings)  
✓ **Plan Hold Points** — Pressure tests, safety verifications, FAT acceptance are mandatory Hold Points  
✓ **Prepare Responses Promptly** — Meet 14–21-day response deadline; track in configuration management  

---

**Document Prepared:** M. Syahrul, Randy, Candra YS (PLN QC Team)  
**Review Date:** 30-03-2026 to 02-04-2026  
**Project:** Riau Peaker Power Plant Field Commissioning QA Program  
**Reference:** Comment Sheet Series, Rev. 0

---
