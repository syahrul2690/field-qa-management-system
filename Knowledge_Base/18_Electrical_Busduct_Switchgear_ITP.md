# Electrical Busduct, Switchgear & MCC — Inspection & Test Plan Knowledge Base

**Document References:**
- A-3.04.00039 GEPP-BKN2-E-IT-002 ITP Bus Duct Generator (Status A)
- A-3.04.00043 GEPP-BKN2-E-IT-006 ITP Switchgear (Status A)
- A-3.04.000101 GEPP-BKN2-E5-ITP-001 ITP FOR LV SWITCHGEAR & MCC REV1 (B)
- A-3.04.00088 GEPP-BKN2-E2-INS-001 Factory Inspection and Test Plan for Non-Segregated Phase Busduct 11 kV, 630 A (Status C)
- A-3.04.00097 GEPP-BKN2-E2-INS-001 Rev 1. Factory Inspection and Test Plan for Non-Segregated Phase Busduct 11 kV, 630 A (Status B)
- A-3.04.000123 GEPP-BKN2-E2-INS-001 Rev.2 Factory ITP NSPB (A)

---

## Overview & Scope

Busduct and switchgear inspection and testing covers electrical distribution equipment including:

**Bus Duct Systems:**
- Main generator bus duct (typically 3-phase, high current, low voltage)
- Non-segregated phase busduct (NSPB) systems (11 kV, 630 A class)
- Isolated phase busduct (IPB) for large generator units
- Factory acceptance and site commissioning tests

**Switchgear & Motor Control Centers:**
- Low-voltage switchgear (≤ 1 kV)
- Medium-voltage switchgear (1 kV – 35 kV)
- Motor Control Centers (MCC)
- Factory testing and functional verification

**Test Phases:**
- Factory acceptance testing (FAT)
- Shop assembly inspection
- Site installation verification
- Commissioning and functional testing

---

## Factory/Shop Acceptance Tests

### Bus Duct Manufacturing Verification

**Hold Point 1: Type & Specification Verification**

| Parameter | Verification | Standard |
|---|---|---|
| **Bus Duct Type** | NSPB or IPB per design document | IEC 60076-3 |
| **Voltage Rating** | 11 kV, 22 kV, or as specified | Type label inspection |
| **Current Rating** | 630 A, 1000 A, or as rated | Nameplate verification |
| **Frequency** | 50 Hz | Nameplate check |
| **Insulation System** | SF₆ gas-insulated or air-insulated | Design specification |
| **Phase Configuration** | 3-phase per specification | Configuration diagram |
| **Enclosure Type** | Segregated or non-segregated phases | Physical inspection |
| **Manufacturer Test Certificates** | Factory testing documentation | Reviewed and approved |

**Acceptance:** All parameters match project specification; test certificates complete.

### Busduct Insulation Testing (Factory)

**Hold Point 2: Insulation Resistance (Megohm Test)**

**For 11 kV Bus Duct Systems:**

| Test | Voltage | Minimum Resistance | Duration |
|---|---|---|---|
| **Phase-to-Phase (all combinations)** | **1,000 V DC** | **≥ 100 MΩ** | 1 minute |
| **Phase-to-Ground (all phases)** | 1,000 V DC | ≥ 100 MΩ | 1 minute |
| **Between Sections (if multi-section)** | 1,000 V DC | ≥ 100 MΩ | 1 minute |

**Test Procedure:**
1. All bus duct sections assembled and electrically connected
2. Ground the neutral/armor throughout the entire length
3. Isolate section under test (disconnect from external circuits)
4. Apply test voltage for 1 minute minimum
5. Record megohm reading at stable state

**Temperature Reference:** 20°C ± 5°C (apply correction per IEC 60502-3 if ≠ 20°C)

**Failure Criteria:**
- Any measured value < 100 MΩ indicates contamination or manufacturing defect
- Repeated failure: factory rework required (cleaning, drying)

### Busduct AC Withstand (High-Pot) Test

**Hold Point 3: AC Voltage Withstand Test**

**For 11 kV NSPB System:**

| Test Configuration | Test Voltage | Duration | Acceptance |
|---|---|---|---|
| **Phase-to-Phase** | **2U + 1000 = 23 kV AC** | **1 minute** | **No breakdown; I ≤ 1 mA** |
| **Phase-to-Ground** | 2U + 1000 = 23 kV AC | 1 minute | No breakdown; I ≤ 1 mA |
| **Between Sections** | Same as phase-to-phase | 1 minute | No breakdown |

**Test Setup:**
- High-voltage AC source (50 Hz)
- Voltage ramp rate: ≤ 2 kV/minute
- Leakage current measurement: 0–100 mA range
- Safety interlocks: all access doors locked during test
- Ground return path confirmed before test

**Leakage Current Acceptance:**
```
For 11 kV system @ 23 kV test:
Acceptable leakage current ≤ 1 mA (0.04% of test voltage / impedance)
If current trending upward: STOP immediately, investigate breakdown path
```

**Post-Test Verification:**
1. Reduce voltage to zero slowly (≤ 2 kV/minute)
2. Visual inspection for arc marks, discoloration, or damage
3. Insulation resistance retest (≥ 100 MΩ required)
4. Document any anomalies

### Switchgear & MCC Factory Inspection

**Hold Point 4: Switchgear Type & Assembly Verification**

| Item | Verification | Standard |
|---|---|---|
| **Breaker Type & Rating** | MCCBs, ACBs, or VCBs per design | Type label, rating plate |
| **Rated Breaking Capacity** | 50 kA or as specified | Breaker nameplate |
| **Voltage Rating** | 400 V LV or 6 kV MV per design | Equipment nameplate |
| **Frequency** | 50 Hz | Equipment specification |
| **Enclosure Class** | IP 54, IP 55, or as specified | Enclosure marking |
| **Mechanical Operation** | Breakers trip/close smoothly | Manual operation test |
| **Interlocking** | All mechanical interlocks functional | Visual/manual check |
| **Cable Entries & Glands** | All entries sealed, cable clamps tight | Physical inspection |

**Acceptance:** All equipment installed, secured, interlocks tested, no missing components.

### Switchgear Control Circuit Testing

**Hold Point 5: Control & Protection Circuit Verification**

| Circuit | Test | Acceptance |
|---|---|---|
| **Trip Coil Continuity** | DC resistance measurement | < 10 Ω (typical) |
| **Closing Solenoid** | Electrical continuity & coil resistance | Per coil specification |
| **Protection Relay** | Functional test per relay type | Per manufacturer specification |
| **Auxiliary Contacts** | Make/break on breaker operation | Operate as designed |
| **Status Lights** | Illuminate on breaker operation | All colors functional |
| **Alarm Circuits** | Continuity & voltage presence | 110 V DC or 230 V AC per design |

---

## Site Installation Inspection

### Bus Duct Installation Verification

**Hold Point 6: Busduct Mechanical Installation Check**

| Item | Verification | Acceptance Criteria |
|---|---|---|
| **Support Structure** | Busduct supported at specified intervals | Securely bolted, no deflection |
| **Alignment** | Phase planes level, sections aligned | Visual alignment confirmed |
| **Expansion Joints** | Proper spacing at temperature expansion points | Per design (typically ≤ 10 m intervals) |
| **Cable Terminations** | Cable lugs properly crimped and torqued | Tight, no corrosion visible |
| **Grounding Continuity** | Ground/armor bonded at all sections | Continuity < 0.5 Ω per section |
| **Clearances** | Minimum clearance to structures maintained | 50 mm minimum (non-segregated) |
| **Gasket Condition** | Rubber gaskets in place, not hardened | Flexible, no cracks |
| **Hardware** | All bolts, screws, hardware present | No missing fasteners |

**Common Installation Defect—Gas Leakage in SF₆ Busduct:**
- Monitor for hissing sound after assembly
- Check pressure gauge on filled sections
- Typical acceptance: ≥ 0.5 bar pressure after 24 hours
- If pressure < 0.5 bar: investigate leak location; repair by manufacturer

### Switchgear Installation Verification

**Hold Point 7: Switchgear Mechanical & Electrical Installation**

| Item | Verification | Pass Criteria |
|---|---|---|
| **Mounting** | Switchgear bolted to floor/wall per plan | Secure, no movement |
| **Cable Entries** | Entry points sealed with approved glands | No moisture ingress |
| **Breaker Operation** | Manual and powered operation (if motorized) | Smooth, no binding |
| **Interlocking** | Door opens only when safe to do so | Safety interlocks prevent hazards |
| **Labeling** | All breakers, circuits, and controls labeled | Permanent, legible identification |
| **Earthing** | Main earth bus bonded to switchgear frame | DC resistance < 0.1 Ω |
| **Cables Terminated** | All terminations tight, phase sequence correct | No loose connections |

### Control Power Supply Verification

**Hold Point 8: Control Voltage & Batteries (if applicable)**

| Component | Test | Acceptance |
|---|---|---|
| **Control Power Transformer** | Output voltage & insulation | ±10% of rated; ≥ 10 MΩ |
| **Batteries (UPS/Emergency)** | Voltage, discharge time capability | Full charge; ≥ 4 hour runtime |
| **DC Bus Voltage** | 110 V DC or 230 V AC per design | ±10% of nominal |
| **Continuity to Control Coils** | Power present at coil terminals | All breaker coils supplied |

---

## Commissioning & Functional Tests

### Pre-Energization System Check

**Hold Point 9: Complete System Verification**

| Test | Method | Acceptance |
|---|---|---|
| **Insulation Resistance** | Megohm @ 1,000 V DC | ≥ 100 MΩ for busduct; ≥ 10 MΩ for MCC |
| **Continuity** | DC resistance (4-wire method) | Busduct: < 0.01 Ω per section; MCC: per cable spec |
| **AC Withstand** | High-pot @ rated test voltage | No breakdown; leakage < 1 mA |
| **Ground Path** | Measured to earth reference | < 0.5 Ω from switchgear to ground |
| **Control Circuits** | Voltage & continuity | ≥ 110 V DC (or 230 V AC) at coils |

### Energization Sequence

**Step 1: Initial Energization (No-Load)**

1. **Verify all breakers in OFF position**
2. **Check external load disconnected (or breaker open)**
3. **Close main source breaker slowly**
4. **Monitor for:**
   - Audible noise from busduct (should be silent or low hum)
   - Odor (SF₆ systems should have no odor)
   - Temperature rise (expected < 5°C in first hour)

**Hold Point 10: No-Load Verification**

| Parameter | Measurement | Acceptance |
|---|---|---|
| **Phase Voltage (All Three)** | Three-phase balance at load end | ≤ 3% voltage unbalance |
| **Frequency** | 50 Hz ± 0.5 Hz | Stable frequency |
| **No-Load Current** | Zero-sequence + positive-sequence | < 1% rated current |
| **Harmonic Distortion** | THD at busduct output | THD_V < 5%, THD_I < 10% |

### Load Ramp Testing (24-Hour Run-In)

**Temperature Monitoring Points:**
- Busduct conductor surface (IR thermometer or thermocouple)
- Switchgear enclosure top panel
- Cable terminations at both ends
- Transformer windings (if stepped-down for control power)

**Load Profile:**

| Time | Load | Monitoring | Thermal Acceptance |
|---|---|---|---|
| Hour 1 | 0% (no-load) | Baseline temps | Stable within ±2°C |
| Hour 2 | 25% rated | No load switching | Temp rise < 5°C |
| Hour 4 | 50% rated | Phase balance | Temp rise < 10°C |
| Hour 8 | 75% rated | Harmonic distortion | Temp rise < 15°C |
| Hour 24 | 100% rated | Thermal equilibrium | Final rise ≤ 40°C at 40°C ambient |

**Temperature Rise Limits (Standard):**

| Component | PVC Insulation | XLPE Insulation |
|---|---|---|
| **Busduct Conductor** | 40°C rise @ 100% | 50°C rise @ 100% |
| **Switchgear Enclosure** | 35°C rise @ 100% | 35°C rise @ 100% |
| **Cable Terminations** | 30°C rise @ 100% | 30°C rise @ 100% |
| **Transformer Windings** | 65°C rise @ rated | 65°C rise @ rated |

### Breaker & Control Functional Testing

**Hold Point 11: Switching Operation & Protection Relay Test**

| Test | Method | Acceptance |
|---|---|---|
| **Manual Breaker Trip** | Pull trip lever; observe breaker opening | Opens smoothly, contacts separate fully |
| **Remote Close Command** | Send close signal (if motorized) | Closes and latches properly |
| **Over-Current Protection** | Adjust relay; inject test current | Relay operates at setpoint ± 5% |
| **Time Delay (if programmed)** | Test time-delayed protection | Operates within programmed time ± 5% |
| **Auxiliary Contact Verification** | Check status contact signals | Contacts make/break per breaker state |

**Example: Feeder Breaker Test**

```
Setpoint: 500 A (for 630 A feeder)
Test current injected: 525 A
Expected trip time: 0.5 seconds (if instantaneous or fast curve)
Acceptance: Breaker operates within 0.5–0.7 seconds
```

### Generator Bus Duct Specific Tests (if applicable)

**Synchronization Check (for Parallel Generator Operation):**

| Parameter | Synchronization Check | Acceptance |
|---|---|---|
| **Voltage Equality** | Generator V ≈ Grid V | Within ±5% voltage |
| **Frequency Match** | Gen freq = Grid freq | Within ±0.1 Hz |
| **Phase Sequence** | Generator ABC = Grid ABC | Correct phase order |
| **Phase Angle** | Generator leading/lagging | Zero phase difference (0° ± 3°) |

**Closing on Sync (Parallel Connection):**
1. Wait for synchronizing signal (indicator light or relay)
2. Issue close command to tie breaker
3. Monitor for:
   - No fault current spike (< 200 A typical for generator paralleling)
   - Current sharing between generators (balanced within ±10%)
   - Reactive power transfer (Q → 0 A as generator settles)

---

## Inspection Activity Matrix

| Activity | Contractor | Engineer | Owner | Code | Standard |
|---|---|---|---|---|---|
| Type & spec verification (factory) | ✓ | ✓ | — | A | IEC 60502 |
| Insulation resistance test (factory) | ✓ | ✓ | — | A | IEC 60076-3 |
| AC withstand test (factory) | ✓ | ✓ | ✓ | **A (HOLD)** | IEC 60076-3 |
| Switchgear assembly inspection | ✓ | ✓ | — | A | GEPP-BKN2-E-IT-006 |
| Control circuit testing (factory) | ✓ | ✓ | — | A | IEC 61012 |
| Busduct mechanical install | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E2-INS-001 |
| Grounding continuity check | ✓ | ✓ | — | A | IEC 61936-1 |
| Switchgear mechanical install | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E-IT-006 |
| Pre-energization verification | ✓ | ✓ | ✓ | **A (HOLD)** | GEPP-BKN2-E-IT-006 |
| No-load energization test | ✓ | ✓ | ✓ | **A (HOLD)** | IEC 61012 |
| Load ramp & thermal monitoring | ✓ | ✓ | ✓ | **A (HOLD)** | GEPP-BKN2-E-IT-006 |
| Breaker functional test | ✓ | ✓ | — | A | IEC 61012 |
| Protection relay calibration | ✓ | ✓ | — | A | Relay manufacturer |
| Final system sign-off | — | ✓ | ✓ | **A (FINAL)** | GEPP-BKN2-E-IT-006 |

---

## Test Parameters & Acceptance Criteria Summary

### Bus Duct Insulation Limits

**Insulation Resistance (Megohm):**

| System Voltage | Test Voltage | Minimum Resistance | Reference |
|---|---|---|---|
| **11 kV NSPB** | **1,000 V DC** | **≥ 100 MΩ** | IEC 60076-3 |
| **22 kV NSPB** | 1,000 V DC | ≥ 100 MΩ | IEC 60076-3 |
| **Generator Bus (3-phase, LV)** | 500 V DC | ≥ 100 MΩ | IEC 61012 |

**AC Withstand Voltage:**

| System Voltage | Test Voltage | Formula | Duration |
|---|---|---|---|
| **11 kV** | **23 kV AC** | 2U + 1000 V | 1 minute |
| **22 kV** | 45 kV AC | 2U + 1000 V | 1 minute |
| **Generator Bus LV** | 3 kV AC | 2 × rated + 1000 V | 1 minute |

### Switchgear & MCC Test Parameters

**Breaker Control Coil Resistance (DC Megohm @ 500 V):**

| Coil Type | Typical Resistance | Minimum Insulation |
|---|---|---|
| **Trip Coil** | 5–15 Ω (typical) | ≥ 10 MΩ |
| **Closing Solenoid** | 2–10 Ω (typical) | ≥ 10 MΩ |
| **Alarm Coil** | 500–1000 Ω (typical) | ≥ 10 MΩ |

**Protection Relay Pickup Current (Example: Inverse Time Overcurrent):**

```
Setpoint: 500 A for 630 A feeder (80% pickup)
Test: Inject 525 A (105% of pickup)
Expected trip time @ 525 A: 0.5–2 seconds (depending on curve type)
Acceptance: Within ±5% of design curve
```

**Thermal Performance:**

| Component | 40°C Ambient | 50°C Ambient |
|---|---|---|
| **Busduct @ 100% load** | ≤ 40°C rise (final temp 80°C) | ≤ 30°C rise (final temp 80°C) |
| **Switchgear enclosure** | ≤ 35°C rise (final temp 75°C) | ≤ 25°C rise (final temp 75°C) |
| **Cable terminators** | ≤ 30°C rise (final temp 70°C) | ≤ 20°C rise (final temp 70°C) |

---

## Applicable Standards

### International Electrotechnical Commission (IEC)

- **IEC 60076-3:** Power transformers – Part 3: Insulation levels and dielectric tests
- **IEC 61012-1:** Bushings and similar devices – Part 1: Definitions, test procedures, and acceptance criteria
- **IEC 61936-1:** Power installations exceeding 1 kV AC – Part 1: Common rules
- **IEC 62305-3:** Protection against lightning – Part 3: Physical damage to structures

### American Standards (ANSI/IEEE)

- **ANSI C37.20.2:** Switchgear Assemblies – Metal-Clad and Station-Type Cubicle Switchgear
- **IEEE Std 1415:** Guide for Induction Machinery Maintenance Testing and Failure Analysis
- **IEEE Std 1415.1:** Induction Machinery Maintenance and Diagnostics

### Project-Specific Standards

- **GEPP-BKN2-E-IT-002:** Bus Duct Generator ITP (Status A)
- **GEPP-BKN2-E-IT-006:** Switchgear ITP (Status A)
- **GEPP-BKN2-E5-ITP-001:** LV Switchgear & MCC ITP (Rev. 1 Status B)
- **GEPP-BKN2-E2-INS-001:** NSPB Factory ITP (Rev. 1–2, Status A–B)

### Indonesian National Standards (SNI)

- **SNI IEC 61012-1:** Electrical bushings per IEC equivalent
- **SNI IEC 61936-1:** Power installations per IEC equivalent

---

## Critical Hold Points Summary

| # | Activity | Test/Verification | Pass Requirement | Authority |
|---|---|---|---|---|
| 1 | **Type & Specification** | Equipment nameplate and documentation | All match specification | Engineer + Contractor |
| 2 | **Insulation Resistance** | Megohm test (factory, all phases) | ≥ 100 MΩ | Contractor + Engineer |
| 3 | **AC Withstand** | High-pot @ 2U + 1000 V | No breakdown; I ≤ 1 mA | **Engineer** |
| 4 | **Switchgear Assembly** | Mechanical & control circuit checks | All components present; interlocks functional | Engineer + Contractor |
| 5 | **Control Circuits** | Coil resistance & voltage checks | Per specification; ≥ 10 MΩ insulation | Engineer + Contractor |
| 6 | **Busduct Installation** | Mechanical & grounding verification | Secure, aligned, bonded | **Engineer + Owner** |
| 7 | **Switchgear Installation** | Mounting, cable entries, labeling | Secure, sealed, labeled | **Engineer + Owner** |
| 8 | **Control Power** | Voltage & battery capacity | ±10% rated; full charge | Engineer + Contractor |
| 9 | **Pre-Energization** | Comprehensive system check | All tests passed; ≥ 100 MΩ | **Engineer + Owner** |
| 10 | **No-Load Test** | Phase balance & no-load current | < 3% voltage unbalance; I < 1% rated | **Engineer + Owner** |
| 11 | **Load Ramp & Thermal** | 24-hour run-in with temperature monitoring | ≤ 40°C rise @ 100% load | **Engineer + Owner** |
| 12 | **Functional Tests** | Breaker switching & relay protection | Trip/close smooth; protection operates @ setpoint | Engineer + Contractor |
| 13 | **Final Sign-Off** | Documentation review & acceptance | All tests passed; commissioned | **Owner Representative** |

---

## Risk Mitigation & Troubleshooting

### Low Insulation Resistance (< 100 MΩ)

**Possible Causes:**
- Manufacturing contamination (moisture, conductive dust)
- Improper assembly (foreign material in insulation gaps)
- Moisture absorption in busduct interior

**Remedial Actions:**

1. **Dry Out Using Low Voltage:**
   - De-energize completely
   - Apply 10% rated voltage for 24–48 hours
   - Retest megohm every 12 hours
   - Repeat until ≥ 100 MΩ achieved

2. **Chemical Drying:**
   - For sealed busduct: contact manufacturer for dehumidification cartridge
   - Install temporary desiccant packages inside duct
   - Allow 3–5 days equilibration

3. **Mechanical Cleaning:**
   - Open accessible sections
   - Clean with dry compressed air (filtered)
   - Reassemble with desiccant packages
   - Reseal all openings immediately

### High Temperature Rise (> 40°C @ 100% Load)

**Possible Causes:**
- Undersized busduct for load
- Poor thermal contact at terminations (high contact resistance)
- Inadequate ventilation around switchgear enclosure
- Blocked cooling fans in MCC

**Remedial Actions:**

1. **Check Contact Resistance at Terminations:**
   - Measure DC resistance of each phase
   - If > 0.01 Ω: re-torque bolts, clean contacts, apply thermal compound
   - Verify no loose hardware

2. **Improve Ventilation:**
   - Clear obstructions around switchgear
   - Verify cooling fans operational (if motorized)
   - Install additional ventilation if required

3. **Load Assessment:**
   - Verify actual load ≤ 100% of busduct rating
   - If load > rating: upsize busduct or redistribute load

### Breaker Won't Trip at Setpoint

**Possible Causes:**
- Protection relay miscalibrated
- Broken current transformer (CT)
- Loose wiring in relay circuit
- Mechanical jam in breaker trip mechanism

**Troubleshooting:**

1. **Verify Current to Relay:**
   - With known test current injected, measure voltage across ammeter in relay circuit
   - If no current: check CT secondary and wiring

2. **Test Relay in Isolation:**
   - Disconnect relay; apply test voltage & current
   - If relay operates: recheck circuit connections
   - If relay doesn't operate: replace relay

3. **Mechanical Check:**
   - Manually check breaker trip lever movement (manual trip)
   - If stuck: apply light lubricant; do not force
   - If still stuck: contact manufacturer for inspection

---

## Document Evolution

| Revision | Date | Key Changes | Status |
|---|---|---|---|
| Status A | 2018 | Initial baseline for project | Superseded |
| Status B | 2019 | NSPB testing procedures expanded; Rev. 2 added | Superseded |
| Rev.1 (LV Switchgear) | 2019 | MCC testing clarifications | **Current** |

---

**Document Prepared:** April 2026  
**Last Updated:** From ITPs dated 2018–2019  
**Review Cycle:** 24 months or after major equipment replacement
