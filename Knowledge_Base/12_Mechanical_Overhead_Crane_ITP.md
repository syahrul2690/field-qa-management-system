# Mechanical Overhead Crane — Inspection & Test Plan Knowledge Base

**Project:** GEPP Bangkanai (Peaker) Stage 2 (140 MW)  
**Owner:** PT. PLN (Persero)  
**Document Reference:** GEPP-BKN2-M7-ITP-002, GEPP-BKN2-M7-ITP-001  
**Latest Status:** Status A (Rev. 1 approved)

---

## Overview & Scope

Overhead cranes are critical material-handling equipment in industrial facilities and power plants. They require rigorous inspection and testing to ensure safe operation, structural integrity, and compliance with safety codes. This ITP establishes quality assurance requirements for procurement, fabrication, installation, and operational acceptance of overhead cranes.

**Applicable Standards:**
- **ASME B30.2:** Overhead and Gantry Cranes (Safety Code)
- **DIN 15018:** Steel Structures for Cranes
- **AWS D1.1:** Structural Welding Code — Steel
- **API RP 17A:** Recommended Practice for Design, Fabrication, and Inspection of Offshore Structures
- Local industrial safety regulations (OSHA, national equivalents)

**Operational Scope:**
- Class D/E Heavy-Duty Service (continuous operation)
- Load capacity per design specification (typically 5-50 tons for power plant applications)
- Span and lift height per facility requirements

---

## Shop/Factory Inspection Activities

### Procurement & Design Documentation (Hold Points)

All technical documents must be reviewed and approved before fabrication begins:

| Document | Approval Level | Acceptance Criteria | Verifying Authority |
|----------|---|---|---|
| **Design Calculations & Structural Analysis** | **H (Hold Point)** | Per ASME B30.2, load factors verified | **PLN Engineering** |
| **Material Specifications** | **H (Hold Point)** | Grade & properties per ASME/ASTM standards | **QA Personnel** |
| **Weld Procedure Specification (WPS)** | **H (Hold Point)** | Per AWS D1.1 Section 2 | **Certified Welding Inspector** |
| **Welder Qualification Records (WQTR)** | **H (Hold Point)** | ASME B30.2 Section 5 compliance | **Certified Welding Inspector** |
| **Drawings & Assembly Procedures** | **H (Hold Point)** | Dimensionally consistent, sequenced | **Design Engineer** |
| **Hoist & Motor Specifications** | **H (Hold Point)** | Rated capacity, duty cycle verified | **Vendor Certification** |
| **Brake & Limit Switch Specifications** | **H (Hold Point)** | Safety-rated components, redundancy confirmed | **Certified Safety Review** |

---

### Structural Fabrication (Bridge & Girders)

#### Base Metal Inspection

| No. | Activity | Inspection Type | Acceptance Criteria | Standard |
|-----|----------|---|---|---|
| 1a | **Material Mill Certificates** | Document Review | ASTM A36, A572, A588 with test reports | ASME II Part A |
| 1b | **Material Dimensional Check** | Measurement | Dimensions per drawing ±1/4" | Contract Spec |
| 1c | **Visual Material Inspection** | Visual | No surface cracks, lamination, delamination | AWS D1.1 |

**Hold Point:** All materials must be certified and visually inspected before cutting.

---

#### Cutting & Preparation

| No. | Activity | Type | Acceptance | Reference |
|-----|----------|------|---|---|
| 2a | **Cutting (Shear/Flame)** | Visual | Edges smooth, no heat damage on welds | AWS D1.1 |
| 2b | **Edge Preparation** | Visual | Bevels per WPS, cleanliness verified | AWS D1.1 Section 2 |
| 2c | **Cleaning (Prior to Welding)** | Visual | Oil, paint, scale removed per SSPC-SP-2 | SSPC SP-2 |

---

### Welding & Fabrication (Critical Hold Points)

#### Weld Quality Control

| No. | Activity | Inspection Type | Acceptance Criteria | Hold Point |
|-----|----------|---|---|---|
| 3a | **WPS Qualification (PQR)** | **Hold Point** | **ASME B30.2 & AWS D1.1** | **H** |
| 3b | **Welder Qualifications** | **Hold Point** | **WQTR current, per ASME B30.2** | **H** |
| 3c | **Tack Weld Inspection** | Visual | Per WPS, no cracks, proper fit-up | Spot Check |
| 3d | **Welding Sequence** | Witness | Per approved procedure, proper sequencing | **W** |
| 3e | **Visual Weld Inspection (100%)** | **Hold Point** | **AWS D1.1 Section 8 acceptance** | **H** |
| 3f | **Weld Cleaning (Between Passes)** | Visual | Wire brush, removal of slag & spatter | AWS D1.1 |

#### NDT Weld Testing

| No. | Method | Coverage | Acceptance Criteria | Standard |
|-----|--------|----------|---|---|
| 4a | **Ultrasonic Test (UT)** | **100% of main beam welds** | **Per ASME Section V & API RP 17A** | **ASME V** |
| 4b | **Radiography Test (RT)** | **Critical welds (per design)** | **ASME Section VIII or API RP 17A** | **ASME V** |
| 4c | **Magnetic Particle Test (MT)** | **100% of gusset plate welds** | **Per AWS D1.1 Section 8** | **AWS D1.1** |
| 4d | **Penetrant Test (PT)** | **Spot check (random 10%)** | **Per ASME Section V** | **ASME V** |

**Weld Defect Acceptance (AWS D1.1):**
- **Cracks:** Zero tolerance (mandatory rejection)
- **Porosity:** Max 1/8" dia, scattered, <5% in 6"×6" area
- **Inclusions:** Slag <3/16" single, <1/4" cumulative per 6"
- **Undercut:** Max 1/32" (0.8 mm) depth, max 10% weld length

---

### Mechanical Assembly & Component Installation

#### Hoist & Motor Assembly

| No. | Activity | Inspection | Acceptance | Reference |
|-----|----------|-----------|---|---|
| 5a | **Motor Power & Rotation** | Witness | Per nameplate rating, direction verified | Vendor Manual |
| 5b | **Brake System Test** | **Witness Test** | **Holding torque >125% of rated load** | **ASME B30.2** |
| 5c | **Limit Switches Installation** | Visual | Proper positioning, activation verified | Contract Spec |
| 5d | **Hoist Rope Attachment** | Visual | Connections per ASME B30.2, redundancy | ASME B30.2 |
| 5e | **Load Sheave Balancing** | Measurement | Balance tolerance per ISO 1940 | ISO 1940 |

---

#### Structural Assembly & Alignment

| No. | Activity | Type | Acceptance | Standard |
|-----|----------|------|---|---|
| 6a | **Girder Straightness** | Measurement | <1/4" per 10 ft (L/480 max) | ASME B30.2 |
| 6b | **End Truck Wheel Alignment** | Measurement | Parallel within 1/8" over 10 ft span | ASME B30.2 |
| 6c | **Hook Block Alignment** | Measurement | Perpendicular to beam centerline ±1/4" | ASME B30.2 |
| 6d | **Load Hook Orientation** | Visual | Proper threading, cotter pin installed | ASME B30.2 |

---

### Testing Before Shipment (Factory Acceptance Test — FAT)

#### Static Load Test (Shop Phase)

| Test | Load Applied | Duration | Acceptance | Hold Point |
|------|---|---|---|---|
| **Proof Load Test** | **125% of rated capacity** | **10 minutes** | **No permanent deformation** | **H** |
| **Brake Holding Test** | **Suspended load at 125%** | **30 minutes** | **No slippage, stable holding** | **H** |
| **Load Release Test** | **125% load, controlled lower** | **Timed descent** | **Smooth, controlled descent** | **H** |

**Load Test Documentation Required:**
- Load cell readings (calibrated instrument)
- Deformation measurements (before/after)
- Photo documentation of test setup
- Signed certification by inspector

---

#### Dynamic Performance Test (Shop)

| Test | Parameter | Acceptance | Standard |
|------|-----------|---|---|
| **No-Load Hoist Cycle** | Speed & direction | Nominal speed ±10% | Vendor Rating |
| **Hoist with 50% Rated Load** | Current draw, smooth operation | <Motor FLA, no binding | Operational Manual |
| **Load Lowering Braking** | Stopping distance | <5 ft from rated speed | ASME B30.2 |
| **Limit Switch Activation** | Upper/lower limits | Positive stop at travel limit | Contract Spec |

---

## Site/Field Installation Inspection Activities

### Receiving & Site Inspection

| No. | Activity | Inspection Type | Acceptance Criteria | Responsibility |
|-----|----------|---|---|---|
| 1a | **Equipment Condition Check** | Visual | No damage, rust, or bent components | Sub/**PP**/W |
| 1b | **Document Verification** | Review | Mill certs, test reports, manuals present | Sub/**PP**/R |
| 1c | **Dimensional Check vs. Structural Steel** | Measurement | Fits building opening per drawing | Sub/**PP**/W |

**Hold Point:** Equipment must be inspected for damage and documentation verified before installation.

---

### Structural Installation (Runway & Supports)

#### Building Support Structure Preparation

| No. | Activity | Type | Acceptance | Reference |
|-----|----------|------|---|---|
| 2a | **Building Steel Verification** | Visual | Per structural design drawings | Structural Design |
| 2b | **Support Beam Elevation Check** | Level Measurement | ±1/2" over total span | ASME B30.2 |
| 2c | **Support Lugs / Brackets** | Visual | Properly bolted, snug connections | Contract Spec |

---

#### Runway Rail Installation

| No. | Activity | Inspection | Acceptance | Standard |
|-----|----------|-----------|---|---|
| 3a | **Rail Alignment (Elevation)** | Level | ±1/2" over complete runway length | ASME B30.2 |
| 3b | **Rail Alignment (Plane)** | Laser Transit | Rails parallel within 1/8" over 10 ft | ASME B30.2 |
| 3c | **Rail Fastening (Bolts)** | Visual/Torque | Per specification, properly fastened | Contract Spec |
| 3d | **Rail Squareness to Building Columns** | Measurement | 90° ±1/4" over 10 ft | ASME B30.2 |

**Hold Point:** Runway must be properly aligned and secured before crane positioning.

---

### Crane Positioning & Leveling

| No. | Activity | Inspection | Acceptance | Hold Point |
|-----|----------|-----------|---|---|
| 4a | **Crane Placement on Runway** | Visual & Laser | Centered on rails ±1/4" | H |
| 4b | **Crane Leveling (Transverse)** | Level Measurement | ±1/4" across beam | H |
| 4c | **Crane Leveling (Longitudinal)** | Measurement | ±1/2" along span | H |
| 4d | **Wheel-to-Rail Contact** | Visual | Full surface contact, no gaps | H |

---

### Electrical & Control System Installation

#### Wiring & Controls

| No. | Activity | Inspection Type | Acceptance | Reference |
|-----|----------|---|---|---|
| 5a | **Pendant Cable Installation** | Visual | Per Code, secured, not abraded | IEC 61346 |
| 5b | **Hoist Motor Connections** | Megohm Test | >5 megohms insulation resistance | NFPA 70 |
| 5c | **Limit Switch Wiring** | Continuity Test | Open/closed states per logic | Contract Spec |
| 5d | **Emergency Stop Circuit** | **Functional Test** | **Immediate stop from any position** | **ASME B30.2** |
| 5e | **Brake Solenoid Test** | **Hold Point** | **Brake engages on power loss** | **ASME B30.2** |

---

## Functional & Commissioning Tests

### Pre-Operational Checklist

| Item | Test | Acceptance | Witness |
|------|------|---|---|
| **Visual Inspection** | Overall crane condition | No loose bolts, welds intact | QA/Inspector |
| **Lubrication** | Bearings, gearbox, hoist | Per manufacturer specification | Maintenance |
| **Hoist Rope Inspection** | Condition, attachment | No strands broken, properly secured | **Witness** |
| **Load Hook Inspection** | Crack detection, throat opening | <5% throat opening reduction | **Witness** |
| **Brake Functional Test** | Engagement/disengagement | Smooth, responsive braking | **Witness** |

---

### Static Load Test (Site Acceptance)

| Test | Load | Duration | Acceptance | Hold Point |
|------|------|----------|---|---|
| **Proof Load (Suspended)** | **100% of rated capacity** | **10 minutes** | **No permanent deformation** | **H** |
| **Proof Load (Overhead Position)** | **100% rated capacity** | **10 minutes** | **No deflection >L/400** | **H** |
| **Brake Holding Test** | **125% rated capacity** | **30 minutes** | **No slippage, stable** | **H** |

**Load Test Procedure:**
1. Lift load slowly, verify hoist function
2. Hold suspended load at rated pressure (or weight)
3. Measure beam deflection with dial indicators
4. Verify brake engagement under load
5. Controlled lowering with load
6. Document all measurements, conditions, and inspector signature

---

### Dynamic Operating Tests

#### Hoist Function Tests

| Test | Parameter | Acceptance Limit | Standard |
|------|-----------|---|---|
| **Hoist Speed (No-Load)** | Rated lifting speed | ±10% of nameplate | Vendor Spec |
| **Hoist Speed (Full Load)** | Speed under 100% rated load | Per design speed (may be reduced) | ASME B30.2 |
| **Hoist Motor Current** | Current draw under full load | <Motor FLA rating | NFPA 70 |
| **Hoist Acceleration** | Ramp-up smoothness | No jerking, controlled | Operational Manual |

#### Bridge Traverse Tests

| Test | Parameter | Acceptance | Standard |
|------|-----------|---|---|
| **Traverse Speed (No-Load)** | Rated bridge speed | ±10% of nameplate | Vendor Spec |
| **Traverse with Suspended Load** | Speed at 50% rated load | Smooth, stable motion | ASME B30.2 |
| **Stop Distance** | Braking distance from full speed | <5 feet from normal traverse speed | ASME B30.2 |
| **Directional Control** | Forward/reverse, smooth transitions | No overshooting or binding | Operational Manual |

#### Trolley Traverse Tests

| Test | Parameter | Acceptance | Reference |
|------|-----------|---|---|
| **Trolley Speed** | Rated trolley speed | ±10% of nameplate | Vendor Spec |
| **Limit Switch Response** | Upper/lower trolley limits | Positive stop at design limits | Contract Spec |
| **Load Control (Suspended)** | 50% rated load on trolley | Smooth, controlled movement | ASME B30.2 |

---

### Operational Safety Tests

#### Emergency Stop Test

| Test | Condition | Acceptance | Hold Point |
|------|-----------|---|---|
| **E-Stop Pendant Button** | **Press E-Stop during hoist operation** | **Immediate stop within 2 seconds** | **H** |
| **E-Stop from Bridge Traverse** | E-Stop during full-speed bridge motion | Stop within 5 feet | H |
| **Dual E-Stop Response** | Multiple E-Stop activation | Redundant stop confirmation | H |

---

#### Load Limiter Test (Safety Feature)

| Test | Scenario | Acceptance | Standard |
|------|----------|---|---|
| **Overload Cutoff (Hoist)** | Attempt to lift >125% rated load | Hoist motor stalls, alarm sounds | **ASME B30.2** |
| **Limit Switch Cutoff (Height)** | Hoist near upper limit | Motor cuts out before hitting limit | ASME B30.2 |
| **Slack Rope Detector** | Simulated rope failure | Brake engages, hoist stops | ASME B30.2 |

---

### Final Acceptance Test Report

| Item | Status | Comments | Inspector | Date |
|------|--------|----------|-----------|------|
| **Proof Load Test Passed** | ✓ Pass | No permanent deformation observed | | |
| **Brake Holding Test Passed** | ✓ Pass | Zero slippage at 125% load | | |
| **NDT (UT/MT) Passed** | ✓ Pass | All welds acceptable per AWS | | |
| **Electrical Tests Passed** | ✓ Pass | Insulation & continuity verified | | |
| **Dynamic Tests Passed** | ✓ Pass | All speeds within ±10% tolerance | | |
| **Safety Systems Tested** | ✓ Pass | E-Stop, overload, limits functional | | |
| **Documentation Complete** | ✓ Pass | All test reports, certs in file | | |

**Condition for Release:** All items must be ✓ Pass before operational use authorization.

---

## Inspection Activity Matrix — Responsibility

### Inspection Codes & Responsibility

| Code | Meaning | Responsibility |
|------|---------|---|
| **P** | Subcontractor performs work | Fabricator/installer performs task |
| **PP** | Main Contractor verifies | General contractor verifies & approves |
| **H** | Hold Point | Work cannot proceed without PLN acceptance |
| **W** | Witness by Owner | PLN/Client witnesses activity |
| **SW** | Spot Witness | Random/spot inspection by PLN |
| **R** | Review | Review of documents/certificates |
| **A** | Approval | Formal approval on procedure/documentation |

### Critical Hold Points Summary

| Phase | Hold Point | Authority | Go/No-Go Decision |
|-------|-----------|-----------|---|
| **Shop** | Design & structural analysis approval | PLN Engineering | Design verification |
| **Shop** | WPS & welder qualification approval | CWI & QA | Fabrication readiness |
| **Shop** | Visual weld inspection (100%) | CWI | Weld quality acceptance |
| **Shop** | NDT testing (UT 100%, RT selected) | NDT Level III Inspector | Internal defect acceptance |
| **Shop** | Proof load test (125% load) | Third-party inspector | Structural integrity |
| **Shop** | Brake holding test (125% load, 30 min) | Mechanical engineer | Safety acceptance |
| **Site** | Runway installation & alignment | PP & inspector | Crane placement readiness |
| **Site** | Crane leveling & wheel contact | Surveyor & QA | Operational readiness |
| **Site** | Static load test (100% load, 10 min) | Third-party inspector | Site structural acceptance |
| **Site** | Emergency stop & safety system test | Safety officer | Safety certification |
| **Operational** | Dynamic test completion | Commissioning agent | Handover for operation |

---

## NDT & Test Parameters

### Non-Destructive Testing Standards

| Method | Coverage | Acceptance | Standard | Personnel |
|--------|----------|-----------|----------|---|
| **Ultrasonic Test (UT)** | **100% of main beam welds** | **Per ASME Section V** | **ASME V** | **Level III NDT Cert** |
| **Radiography (RT)** | Critical welds (per design) | Per ASME Section VIII | ASME V | Level III Radiographer |
| **Magnetic Particle (MT)** | Gusset plate welds, connections | AWS D1.1 Section 8 acceptance | AWS D1.1 | Level II MT Technician |
| **Penetrant Test (PT)** | Spot check (10% random) | ASME Section V acceptance | ASME V | Level II PT Technician |
| **Visual Inspection (VI)** | 100% of fabrication & assembly | AWS D1.1 Section 8 criteria | AWS D1.1 | CWI (Certified Welding Inspector) |

---

### Key Test Parameters & Tolerances

| Parameter | Test/Acceptance | Unit | Reference |
|-----------|---|---|---|
| **Proof Load Deflection** | <L/400 (where L = girder span) | inches | ASME B30.2 |
| **Brake Holding Duration** | 30 minutes minimum | minutes | ASME B30.2 |
| **Brake Slip Rate** | Zero (no detectable slip) | — | ASME B30.2 |
| **Hoist Speed Accuracy** | ±10% of nameplate | % | Vendor Specification |
| **Bridge Traverse Speed** | ±10% of nameplate | % | Vendor Specification |
| **Stop Distance (Full Speed)** | <5 feet | feet | ASME B30.2 |
| **Emergency Stop Response** | <2 seconds | seconds | ASME B30.2 |
| **Overload Trip Point** | ≥125% of rated capacity | % | ASME B30.2 |
| **Insulation Resistance** | >5 megohms | MΩ | NFPA 70 |

---

## Acceptance Criteria

### Structural Acceptance

| Item | Acceptance Criterion | Inspection Method |
|------|---|---|
| **Girder Straightness** | <1/4" per 10 ft span (L/480 max) | Straightedge, laser transit |
| **Girder Flatness** | <1/4" over complete width | Level measurement |
| **Weld Quality** | AWS D1.1 Section 8 acceptance criteria | Visual + NDT (UT/RT/MT) |
| **Bolt Preload** | Per AISC standards (snug-tight minimum) | Torque wrench, turn-of-nut |
| **Proof Load Deflection** | Recovers to within L/480 after load removed | Dial indicators |

### Mechanical Acceptance

| Item | Acceptance Criterion | Standard |
|------|---|---|
| **Motor Operation** | Rated power, smooth acceleration | Operational Manual |
| **Hoist Speed** | ±10% of nameplate speed | ASME B30.2 |
| **Brake Torque** | >125% of rated load holding torque | ASME B30.2 |
| **Load Hook** | Throat opening <5% reduction from new | ASME B30.2 |
| **Hoist Rope** | No visible strand breaks, proper attachment | ASME B30.2 |

### Safety System Acceptance

| Item | Acceptance Criterion | Compliance |
|------|---|---|
| **Emergency Stop** | Immediate stop (<2 sec), all positions | ASME B30.2 mandatory |
| **Overload Limiter** | Prevents lifting >125% rated load | ASME B30.2 required |
| **Limit Switches** | Positive stop at travel limits | ASME B30.2 required |
| **Slack Rope Detector** | Engages brake on rope failure | ASME B30.2 recommended |
| **Pendant Cable** | Protected, minimum breaking strength | IEC 61346 standard |

---

## Applicable Standards & Codes

### Primary Standards & Regulations

| Standard | Title | Applicability |
|----------|-------|---|
| **ASME B30.2** | Overhead and Gantry Cranes | Complete design, fabrication, testing, operation |
| **AWS D1.1** | Structural Welding Code — Steel | Weld qualification, procedures, inspection |
| **DIN 15018** | Steel Structures for Cranes | Alternative design standard (European) |
| **API RP 17A** | Recommended Practice for Offshore Structures | Structural analysis, weld standards |
| **NFPA 70** | National Electrical Code (NEC) | Electrical safety, motor controls, grounding |
| **IEC 61346** | Industrial Automation Wiring & Cabling | Electrical installation standards |
| **ISO 1940** | Mechanical Vibration — Rotor Balancing | Load sheave balancing |
| **OSHA 1910.179** | Overhead & Gantry Cranes | U.S. regulatory requirements |

### Supporting Documentation

- **Mill certificates:** Material composition & mechanical properties
- **WPS/PQR:** Weld procedure qualification records
- **WQTR:** Welder qualification test records
- **Structural calculations:** Design analysis, load paths, deflection checks
- **Factory Acceptance Test (FAT) report:** Proof load, brake, NDT results
- **NDT reports:** UT, RT, MT, PT inspection results per ASME Section V
- **Electrical test certificates:** Megohm insulation, continuity tests
- **Load cell calibration:** Proof test equipment certification
- **Operational manual:** Vendor instructions, maintenance requirements

---

## Revision History & Document Control

| Rev | Date | Status | Key Changes |
|-----|------|--------|---|
| 0 | — | C | Initial document (Not Approved) |
| 1 | — | **A** | **Revised per PLN PUSMANKON comments, Final Approval** |

---

## Project-Specific Notes

**Project Name:** GEPP Bangkanai (Peaker) Stage 2 (140 MW)  
**Owner:** PT. PLN (Persero)  
**Inspection Authority:** PLN PUSMANKON (Central Construction Management)  
**Regulatory Review:** Third-party CWI and NDT Level III personnel required  
**Critical Gate:** All Hold Points must be signed off by PLN representative or authorized third-party inspector before proceeding to next phase.

