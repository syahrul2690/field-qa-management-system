# Mechanical HVAC Systems — Inspection & Test Plan Knowledge Base

**Project:** GEPP Bangkanai (Peaker) Stage 2 (140 MW)  
**Owner:** PT. PLN (Persero)  
**Document Reference:** GEPP-BKN2-M5-ITP-001 (Rev. 0, 1, 2)  
**Status:** Status A (Latest approved revision)

---

## Overview & Scope

HVAC (Heating, Ventilation, and Air Conditioning) systems in utility power plants require comprehensive inspection and testing at critical control points to ensure operational reliability, safety, and energy efficiency. This ITP establishes a framework for quality assurance across shop fabrication, site installation, and functional commissioning phases.

**Applicable Standards:**
- ASHRAE 90.1 (Energy Standard for Buildings)
- SMACNA (Sheet Metal and Air Conditioning Contractors National Association)
- NFPA 90A (Standard for the Installation of Air Conditioning and Ventilating Systems)
- Local building codes and contract specifications

**Document Status:**
- **Rev. 0:** Initial version (Status C - Not Approved)
- **Rev. 1:** Revised per PLN comments (Status C)
- **Rev. 2:** Final approved version (Status A)

---

## Shop/Factory Inspection Activities

### QA/QC Documentation (Mandatory Hold Points)

All technical documentation must be reviewed and approved before equipment fabrication and assembly commence:

| Document | Approval Level | Acceptance Criteria | Verifying Authority |
|----------|---|---|---|
| **Design & Equipment Schedule** | **H (Hold Point)** | Per contract specifications | **PLN Engineering** |
| **Equipment Datasheets (Fans, Coils, Filters, etc.)** | **H (Hold Point)** | Certified performance ratings | **Vendor** |
| **Ductwork Shop Drawings** | **H (Hold Point)** | Per SMACNA standards | **Contract Spec** |
| **PLC/Control System Logic Diagrams** | **H (Hold Point)** | Functional logic per design | **Control Engineer** |
| **Material Specifications & Certifications** | **H (Hold Point)** | ASME/ISO standards compliance | **Mill Certificates** |
| **Quality Assurance Procedure** | **H (Hold Point)** | Inspection/test methodology documented | **Main Contractor** |
| **Commissioning Test Plan** | **H (Hold Point)** | Pre-startup procedures defined | **Commissioning Agent** |

---

### Equipment & Component Fabrication

#### Fan Units — Centrifugal & Axial Flow

| No. | Activity | Inspection Type | Acceptance Criteria | Standard |
|-----|----------|---|---|---|
| 1a | **Rotor/Impeller Balancing** | **Hold Point** | Balance tolerance per ISO 1940 G6.3 | ISO 1940 |
| 1b | **Bearing Assembly & Lubrication** | Witness | Greasing per specification | Vendor Manual |
| 1c | **Motor Coupling Alignment** | Visual | Runout <0.05" at rim | Mechanical Standards |
| 1d | **Vibration Baseline Test** | Spot Witness | <0.2 ips (overall) at rated speed | ISO 20816 |

---

#### Ductwork Fabrication (Shop Phase)

| No. | Activity | Inspection | Acceptance | Reference Standard |
|-----|----------|-----------|---|---|
| 2a | **Material Gauge & Dimensions** | Visual | Per SMACNA standards | SMACNA Manual |
| 2b | **Seam Welding/Riveting** | Visual + Leak Test | Airtight per ASHRAE 90.1 | ASHRAE 90.1 |
| 2c | **Ductboard Assembly** | Visual | Per manufacturer specs | ASHRAE 90.1 |
| 2d | **Insulation Installation** | Visual | No gaps, proper coverage | Contract Spec |
| 2e | **Air-Tightness Test (Pressure Drop)** | **Witness Test** | **Leakage <5% of rated CFM** | **ASHRAE 90.1** |
| 2f | **Cleanliness Verification** | Visual | No debris, contamination before shipping | EPA NADCA |

---

#### Heat Exchange & Cooling Coil Units

| No. | Activity | Inspection | Acceptance | Reference |
|-----|----------|-----------|---|---|
| 3a | **Tube & Fin Inspection** | Visual | No clogging, corrosion <5% | Vendor Spec |
| 3b | **Pressure Test (Hydrostatic)** | **Hold Point** | **1.5× Operating Pressure** | **Mechanical Code** |
| 3c | **Cleanliness Flushing** | Verification | Water clarity per ISO 4406 | ISO 4406 |
| 3d | **Thermal Performance Test** | Witness | ±5% of rated capacity | Contract Spec |

**Test Parameters for Coil Hydrostatic:**
- **Test Pressure:** 1.5× max operating pressure (typically 150-300 psi depending on design)
- **Hold Duration:** 15 minutes minimum
- **Acceptance:** Zero weeping, no permanent deformation
- **Documentation:** Pressure gauge reading (calibrated), test date, time, temperature

---

#### Filter Bank Assembly

| No. | Activity | Inspection | Acceptance Criteria | Standard |
|-----|----------|-----------|---|---|
| 4a | **Frame & Seal Installation** | Visual | Frame squareness ±1/4", seals intact | Contract Spec |
| 4b | **Filter Media Quality** | Visual | MERV rating verified, no damage | ASHRAE 52.2 |
| 4c | **Differential Pressure Gauge Calibration** | Calibration | Within ±5% accuracy | ISO 9001 |
| 4d | **Housing Pressure Test** | Witness | 2" W.C. pressure retention | Contract Spec |

---

### Mechanical Connections & Vibration Control

| Activity | Inspection | Acceptance | Reference |
|----------|-----------|---|---|
| **Flexible Duct Connections** | Visual | Minimum 4" straight section before flex | SMACNA |
| **Vibration Isolation Mounts** | Visual | Proper load rating, deflection per design | Manufacturer Spec |
| **Vibration Test (Low-Speed Run)** | **Witness** | **Vibration <0.1 ips at fan outlet** | **ISO 20816** |

---

## Site/Field Installation Inspection Activities

### Receiving & Handling at Site

| No. | Activity | Inspection | Acceptance | Responsibility |
|-----|----------|-----------|---|---|
| 1a | **Equipment Condition Inspection** | Visual | No damage, bent fins, corrosion | Sub/**PP**/W |
| 1b | **Documentation Review** | Review | Mill certs, performance data present | Sub/**PP**/R |
| 1c | **Dimensional Verification** | Visual | Fits architectural openings per drawing | Sub/**PP**/W |

---

### Ductwork Installation (Field/Site Phase)

| No. | Activity | Inspection Type | Acceptance Criteria | Hold Point |
|-----|----------|---|---|---|
| 2a | **Duct Hanger & Support Installation** | Visual | Per SMACNA spacing standards | No |
| 2b | **Duct Routing & Alignment** | Visual | Proper clearances, no compression | No |
| 2c | **Sealing & Duct Tape/Mastic Application** | **Witness** | **Joints sealed per ASHRAE 90.1** | **H** |
| 2d | **Thermal Insulation Application** | Witness | Vapor barrier intact, taped seams | W |
| 2e | **Ductwork Pressure Drop Test** | **Witness Test** | **Leakage <5% of design CFM** | **H** |
| 2f | **Ductwork Cleanliness Inspection** | Visual | No construction debris, lint traps installed | H |

---

### Equipment Installation

#### Fan Unit Mounting

| Activity | Type | Acceptance | Standard |
|----------|------|---|---|
| **Motor Base Elevation** | Visual | Fan outlet aligned ±1/2" to ductwork | SMACNA |
| **Vibration Isolator Deflection** | Measurement | Proper spring rate per design load | Manufacturer |
| **Coupling Guard Installation** | Visual | Per OSHA requirements, accessible | OSHA 1910 |
| **Motor Direction Rotation Check** | **Witness** | Rotation verified before load testing | Operational Manual |

#### Coil Installation

| Activity | Inspection | Acceptance | Standard |
|----------|-----------|---|---|
| **Flow Direction Verification** | Visual | Per design (counterflow for efficiency) | Contract Spec |
| **Liquid & Vapor Line Connections** | Visual | Properly sized per engineering spec | EPA 40 CFR 82 |
| **Drain Line Slope & Trap** | Visual | 1/8" drop per foot minimum | SMACNA |
| **Refrigerant Charge Verification** | **Witness** | Per manufacturer data plate & charge sheet | EPA Certification |

---

### Control System Installation

| Activity | Type | Acceptance | Reference |
|----------|------|---|---|
| **PLC/DDC Panel Wiring** | Visual | Color-coded per IEC 61346, labeled | IEC 61346 |
| **Sensor Installation & Calibration** | Calibration | ±1.0°F temperature sensors, ±2% RH | ISO 9001 |
| **Damper Actuator Linkage** | Visual | Full stroke range verified | Contract Spec |
| **Control Logic Functional Test** | **Witness** | Per commissioning sequence | Commissioning Plan |

---

## Functional & Commissioning Tests

### Pre-Startup Checks (Critical Hold Points)

| No. | Activity | Test Type | Acceptance Criteria | Pass/Fail |
|-----|----------|-----------|---|---|
| 1a | **System Visual Cleanliness** | **Visual Inspection** | **No debris in ducts, coils, or filters** | **Must Pass** |
| 1b | **Door & Damper Operation** | **Functional** | **Full range motion, no binding** | **Must Pass** |
| 1c | **Safety Interlock Verification** | **Functional** | **Proper shutdown response to alarms** | **Must Pass** |
| 1d | **Electrical System Tests** | **Megohm Test** | **>5 megohms insulation resistance** | **Must Pass** |

---

### System Startup & Performance Verification

#### Low-Speed Run-In (Soft Start)

| Phase | Activity | Acceptance | Duration |
|-------|----------|---|---|
| **Phase 1** | Fan rotation verification, vibration <0.5 ips | **Pass/Fail** | 5 minutes |
| **Phase 2** | Incremental speed ramp to 50% rated | Stable operation, no noise | 15 minutes |
| **Phase 3** | Ramp to 75% rated speed | Monitor motor current <FLA | 15 minutes |
| **Phase 4** | Full-speed operation, stabilization | Vibration <0.2 ips, temp normal | 30 minutes |

**Total Run-In:** Minimum 1 hour before full load test.

---

#### Airflow Performance Testing

| Parameter | Test Method | Acceptance Criteria | Standard |
|-----------|-------------|---|---|
| **System Airflow (CFM)** | **Pitot Tube Traverse** | **±10% of design CFM** | **ASHRAE 111** |
| **Static Pressure (in. W.C.)** | **Manometer Measurement** | **Per ductwork design** | **ASHRAE 111** |
| **Air Temperature (°F)** | **Thermocouple grid** | **±2°F of setpoint** | **ASHRAE 111** |
| **Humidity Level (%)** | **Psychrometer** | **±5% RH of design** | **ASHRAE 55** |

---

#### Equipment Efficiency Testing

| Equipment | Parameter | Test Method | Acceptance |
|-----------|-----------|---|---|
| **Fan Unit** | Power consumption (kW) | Electrical measurement | ≤Design wattage |
| **Heat Exchange Coil** | Temperature drop across coil | Temperature measurement | ±5% of rated capacity |
| **Filter Bank** | Pressure drop (in. W.C.) | Differential gauge | Per filter manufacturer |

---

#### Control System Commissioning

| No. | Control Function | Test | Acceptance | Witness |
|-----|---|---|---|---|
| 1 | **Temperature Setpoint Control** | Set to 72°F, verify response | ±1°F within 10 min | **Witness** |
| 2 | **Supply Fan Modulation** | Adjust ductstat, verify CFM change | ±5% CFM response | **Witness** |
| 3 | **Cooling Valve Modulation** | Modulate water flow, verify temp control | Stable operation | **Witness** |
| 4 | **Outdoor Air Damper Sequencing** | Test lockout during heating mode | No mixed air | **Witness** |
| 5 | **Alarm & Shutdown Response** | Trigger simulated faults | System responds per logic | **Witness** |

---

### Noise & Vibration Acceptance Testing

| Parameter | Measurement Point | Acceptance Limit | Standard |
|-----------|---|---|---|
| **Sound Level (dBA)** | 3 ft from supply outlet | Per ASHRAE 90.1 (typically 40-50 dBA) | ASHRAE 90.1 |
| **Vibration (IPS)** | Fan bearing housing | **<0.2 ips overall** | **ISO 20816** |
| **Vibration (IPS)** | Ductwork supports | <0.1 ips | ISO 20816 |

---

## Inspection Activity Matrix

### Hold Point Summary (Work Cannot Proceed Without Acceptance)

| Phase | Hold Point | Authority | Release Criterion |
|-------|-----------|-----------|---|
| **Shop** | Design drawing approval | **PLN Engineering** | Technical review passed |
| **Shop** | Equipment datasheets | **Vendor certification** | Rated capacity verified |
| **Shop** | WPS/Material certs | **QA Personnel** | Conformance to spec |
| **Shop** | Fan balancing | **ISO 1940 certification** | Balance report <G6.3 |
| **Shop** | Ductwork air-tightness | **Air-test report** | ≤5% leakage accepted |
| **Field** | Ductwork sealing & pressure test | **Commissioning agent** | Leakage verified ≤5% |
| **Field** | Control system functional test | **Commissioning authority** | Logic verified functional |
| **Startup** | System cleanliness verification | **QA/QC inspector** | Visual inspection passed |
| **Startup** | Low-speed run-in completion | **Commissioning agent** | 1-hour run without fault |
| **Final** | Airflow & temperature verification | **Witness test** | ±10% CFM, ±2°F |

---

## NDT & Test Parameters

### Non-Destructive Testing Methods

| Method | Equipment | Application | Acceptance | Standard |
|--------|-----------|---|---|---|
| **Visual Inspection** | Light source, magnifying glass | Welds, fins, seals, connections | No defects visible | ASHRAE |
| **Leak Detection** | Soap bubble test | Duct seams, coil connections | No bubbles (zero leakage) | EPA |
| **Pressure Drop Test** | Manometer, pitot tubes | Ductwork, filters, coils | Per design specification | ASHRAE 111 |
| **Thermal Imaging** | IR camera | Coil performance, insulation voids | Uniform temperature gradient | ASHRAE 90.1 |
| **Sound Measurement** | Sound meter (dBA) | Equipment noise | ≤50 dBA at 3 ft | ASHRAE 90.1 |
| **Vibration Analysis** | Accelerometer | Fan/motor vibration | <0.2 ips at rated speed | ISO 20816 |

---

### Key Test Parameters & Tolerances

| Test | Parameter | Acceptance Range | Measurement Unit |
|------|-----------|---|---|
| **Ductwork Air-Tightness** | Leakage rate | ≤5% of design CFM | CFM or % |
| **Fan Balancing** | Residual unbalance | ISO 1940 G6.3 | mm/s |
| **Vibration Level** | Overall vibration | <0.2 ips (fan speed) | Inches/second |
| **Temperature Control** | Deviation from setpoint | ±2°F steady-state | °F |
| **Humidity Control** | Deviation from setpoint | ±5% RH | %RH |
| **Airflow Accuracy** | System CFM vs design | ±10% | CFM or % |
| **Pressure Drop (Clean Filter)** | Initial drop | Per manufacturer curve | in. W.C. |

---

## Acceptance Criteria

### Design & Equipment Acceptance

**Equipment Performance Requirements:**
- **Fan Curves:** Within ±10% of nameplate CFM at design static pressure
- **Motor Efficiency:** IE3 (Premium Efficiency) per EN 60034-30
- **Noise Levels:** ≤50 dBA (typical office/residential applications)
- **Vibration:** ISO 20816 Zone A (newly commissioned machines)

### Installation Quality Acceptance

| Item | Acceptance Criterion | Inspection Method |
|------|---|---|
| **Ductwork Sealing** | Airtight per ASHRAE 90.1 (≤5% leakage) | Pressure drop test |
| **Insulation Coverage** | 100% continuous, no voids | Visual inspection |
| **Hanger Spacing** | Per SMACNA standards (typically 4-6 ft) | Tape measure |
| **Vibration Isolation** | Proper deflection per design | Visual & measurement |
| **Filter Installation** | MERV rating per design, tight seal | Visual inspection |
| **Refrigerant Charge** | ±0.5 oz of specification | Weighing & superheat calc |

### Commissioning Acceptance

| Test | Acceptance Limit | Standard |
|------|---|---|
| **Airflow (CFM)** | ±10% of design | ASHRAE 111 |
| **Temperature Control** | ±2°F of setpoint | ASHRAE 90.1 |
| **Humidity Control** | ±5% RH of setpoint | ASHRAE 55 |
| **Pressure Drop (Ductwork)** | Per design calculation | SMACNA |
| **Sound Level** | ≤50 dBA at 3 ft | ASHRAE 90.1 |

---

## Applicable Standards & Codes

### Primary Standards

| Standard | Title | Applicability |
|----------|-------|---|
| **ASHRAE 90.1** | Energy Standard for Buildings | Energy efficiency, ductwork sealing, performance testing |
| **ASHRAE 62.1** | Ventilation for Acceptable Indoor Air Quality | Outdoor air requirements, air quality standards |
| **ASHRAE 55** | Thermal Comfort | Comfort criteria, temperature/humidity ranges |
| **ASHRAE 111** | Measuring Airflow in HVAC Systems | CFM measurement methods, pitot tube traverse |
| **SMACNA** | Sheet Metal & Air Conditioning Manual | Ductwork design, installation, leak testing |
| **NFPA 90A** | Installation of Air Conditioning & Ventilating Systems | Safety, codes, smoke damper testing |
| **EPA 40 CFR 82** | Protection of Stratospheric Ozone | Refrigerant handling, certification requirements |
| **ISO 1940** | Mechanical Vibration — Rotor Balancing | Fan rotor balancing acceptance |
| **ISO 20816** | Mechanical Vibration — Measurement & Evaluation | Vibration severity assessment |

### Supporting Documentation

- **Equipment datasheets:** Fan curves, coil performance, filter specifications
- **Commissioning test plan:** Sequence of tests, acceptance criteria, witness requirements
- **Control logic diagrams:** PLC/DDC logic for operation, alarms, interlocks
- **Calibration certificates:** Thermocouples, pressure gauges, sound meters
- **Refrigerant charge sheet:** Weights, superheat readings, EPA compliance
- **Run-in log:** Hours of operation, vibration readings, temperature trends
- **Noise survey report:** Sound measurements at various locations
- **Test reports:** Airflow, pressure drop, thermal performance

---

## Revision History & Document Control

| Rev | Date | Status | Key Changes |
|-----|------|--------|---|
| 0 | 2020-11-08 | C | Initial release, comment status |
| 1 | 2021-02-08 | C | Revised per PLN PUSMANKON review |
| 2 | 2021-02-28 | **A** | **Final approved version, all hold points confirmed** |

---

## Critical Quality Gates

### Phase 1: Design & Equipment Selection
- PLN Engineering approves design drawings (**Hold Point**)
- All equipment performance datasheets verified
- Control system logic approved by commissioning authority

### Phase 2: Shop Fabrication & Testing
- Fan balancing per ISO 1940 (**Hold Point**)
- Ductwork air-tightness verified ≤5% leakage (**Hold Point**)
- All coil pressure tests passed at 1.5× operating pressure (**Hold Point**)

### Phase 3: Site Installation
- Ductwork sealed and pressure-tested in field (**Hold Point**)
- Equipment mounted on vibration isolators per design
- Refrigerant system charged per EPA standards

### Phase 4: Functional Commissioning
- System cleanliness verified before startup (**Hold Point**)
- Low-speed run-in completed (1 hour minimum) (**Hold Point**)
- Airflow, temperature, humidity within ±10%, ±2°F, ±5% RH
- Control system functional test passed

