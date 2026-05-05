# Earthing & Lightning Protection — Inspection & Test Plan Knowledge Base

**Document References:**
- A-3.04.00038 GEPP-BKN2-E-IT-001 ITP Earthing & Lightning Protection (Status A)
- A-3.04.00047 GEPP-BKN2-E-IT-001 ITP Earthing & Lightning Protection (Status B)

---

## Overview & Scope

Earthing (grounding) and lightning protection systems provide safety and surge protection for electrical infrastructure. This ITP covers:

**System Components:**
- Main earthing conductor (bus)
- Driven earth electrodes (rods, plates)
- Lightning arresters (surge protection devices)
- Bonding connections and continuity
- Inspection and test procedures

**Test Phases:**
- Earthing system installation verification
- Earth resistance measurement and acceptance
- Lightning protection system inspection
- Functional testing and certification

---

## Factory/Shop Acceptance Tests

### Earthing Conductor & Equipment Inspection

**Hold Point 1: Material Verification & Documentation**

| Component | Specification | Standard |
|---|---|---|
| **Earth Conductor Material** | Copper or galvanized steel per design | IEC 61936-1 |
| **Conductor Size** | Minimum 25 mm² (copper) or 50 mm² (steel) | IEC 61936-1 Table 1 |
| **Earth Rod Material** | Copper-bonded or stainless steel | IEC 61012-1 |
| **Arcing Horn Electrodes** | Stainless steel or copper for lightning | IEC 62305-3 |
| **Certificate of Conformance** | Provided for all materials | Quality documentation |

**Acceptance:** All materials comply with project specification and standards; certificates reviewed.

### Lightning Arrester Inspection & Testing

**Hold Point 2: Lightning Arrester Type & Documentation**

| Parameter | Requirement |
|---|---|
| **Arrester Type** | Metal oxide surge arrester (MOSA) or equivalent |
| **Voltage Rating** | Matches system voltage (e.g., 12 kV for 11 kV system) |
| **Nominal Discharge Current** | 10 kA or as specified |
| **Continuous Operating Voltage (COV)** | ≥ System phase-to-earth voltage |
| **Manufacturer Test Report** | Factory acceptance test certificates |

**Test Parameters from Manufacturer (to be verified):**

| Test | Voltage | Current | Acceptance |
|---|---|---|---|
| DC 1 mA Voltage | — | 1 mA | Per arrester data sheet |
| Spark-over voltage (1.2/50 μs) | — | 5 kA | ± 10% per nameplate |
| Follow current extinguishing | — | 50–100 A | Self-extinguishing |
| Power frequency withstand | 50 Hz | 10 s duration | No flashover |
| Impulse withstand | 1.2/50 μs wave | Per rating | No breakdown |

**Acceptance:** All test certificates reviewed; parameters within manufacturer specifications.

---

## Site Installation Inspection

### Earthing System Installation Verification

**Hold Point 3: Earthing System Configuration Inspection**

| Item | Verification Requirement | Pass Criteria |
|---|---|---|
| **Main Earthing Conductor Path** | Continuous from equipment to earth electrode | Visually traceable, no gaps |
| **Conductor Connections** | All joints exothermic-welded or crimped | No corrosion observed; mechanically firm |
| **Earth Rod Depth** | At least 2.5 m below surface (minimum) | Tape measurement or site record |
| **Earth Rod Spacing** | Multiple rods spaced ≥ rod length apart | Measured or design documentation |
| **Bonding to Structures** | All metallic structures bonded to main earth | Electrical continuity verified |
| **Cable Tray Earthing** | Tray bonded at intervals ≤ 20 m | Continuity verified |
| **Fencing & Handrails** | Metallic fencing grounded at intervals | Connected to main earth bus |

**Common Earthing Configuration (Small Utility Power Station):**

```
Main Transformer
    ↓ (HV neutral)
Main Earth Bus (Cu bar, minimum 25 mm² × 10 mm)
    ├─ Earth Rod #1 (3 m depth, 16 mm dia copper-bonded)
    ├─ Earth Rod #2 (3 m depth, spaced 4 m from Rod #1)
    ├─ Bonding to metallic building frame
    ├─ Bonding to cable tray
    └─ Bonding to switchgear earthing
```

### Earth Resistance Measurement

**Hold Point 4: Earth Resistance Test (Four-Terminal Method)**

**Equipment Required:**
- Clamp-on earth tester or fall-of-potential method equipment
- Test frequency: 128 Hz (standard) or 25 Hz alternative
- Accuracy: ±5% or better

**Measurement Procedure (Fall-of-Potential Method):**

1. **Drive auxiliary test stakes at increasing distances:**
   - Current stake at 20 m from main earth electrode
   - Potential stake at 10 m from main earth electrode

2. **Connect tester:**
   - Main electrode (under test) → Reference stake (current injection)
   - Voltage measurement across 10 m potential stake

3. **Record resistance value:**
   ```
   R_earth = V_measured / I_injected (in ohms)
   ```

4. **Repeat with current stake at 30 m and 40 m distances:**
   - Confirm resistance stable at plateau region
   - Use middle-distance value for official reading

**Clamp-On Method (Alternative, Simpler):**
- Applied to systems with existing ring conductors
- Results may have higher uncertainty but acceptable for verification

**Hold Point 4: Earth Resistance Acceptance Criteria**

| System Type | Maximum Earth Resistance | Standard |
|---|---|---|
| **Main Station Earth** | **≤ 1.0 Ω** | IEC 61936-1 |
| **Neutral Earthing** | **≤ 5.0 Ω** | IEC 61936-1 |
| **Equipment Local Earth** | **≤ 2.0 Ω** | IEC 61936-1 |
| **Lightning Protection Earth** | **≤ 10 Ω** (for lightning) | IEC 62305-3 |

**Example Calculation:**
```
Measured with fall-of-potential method:
V = 45 mV, I = 50 A (at 10 m potential stake)
R_earth = 45 mV / 50 A = 0.0009 Ω (too low; indicates good, parallel path)

Actual reading from device: 0.85 Ω (with distributed rods)
Acceptance: ✓ Pass (0.85 < 1.0 Ω)
```

**If Earth Resistance > Maximum Allowable:**

1. **Add parallel earth rods** (additional 3 m rods)
   - Spaced ≥ rod length (typically 4–5 m apart)
   - Each rod reduces resistance by ~30–50% depending on soil

2. **Improve soil conductivity** (salt treatment, not recommended for environment)
   - Alternative: drive rods deeper (6+ m) or use multiple electrodes

3. **Install chemical earth enhancers** (bentonite, gelatinous compounds)
   - Increases effective electrode area

### Lightning Arrester Installation Verification

**Hold Point 5: Lightning Arrester & Surge Protection Inspection**

| Item | Verification | Acceptance |
|---|---|---|
| **Arrester Location** | Mounted at transformer bushings or breaker | Within 0.5 m horizontal distance |
| **Earthing Connection** | Dedicated earth lead < 0.5 m length | Lowest inductance path |
| **Phase Lead Length** | Shortest practical path to protected equipment | < 1 m |
| **Mechanical Condition** | No cracks, corrosion, or mechanical damage | Visually sound |
| **Grounding Path Resistance** | 4-terminal measurement from arrester to earth | < 0.5 Ω per arrester |
| **Insulation Resistance** | Arrester terminals to case | ≥ 10 MΩ @ 500 V DC |

**Arrester Earth Lead Inductance:**

```
For arrester protection to be effective:
L ≈ 0.5 μH per meter of conductor length
Example: 0.5 m lead = 0.25 μH
Surge voltage during 10 kA strike:
V_surge = L × dI/dt = 0.25 × (10,000/1 μs) = 2,500 V
This voltage appears across protected equipment—minimize by short leads
```

### Bonding & Continuity Testing

**Hold Point 6: Bonding Conductor Continuity Test**

| Connection Point | DC Resistance | Test Method | Acceptance |
|---|---|---|---|
| **Main earth bar to rod electrode** | < 0.01 Ω | 4-wire DC method | ✓ Pass |
| **Earth bar to transformer case** | < 0.1 Ω | 4-wire DC method | ✓ Pass |
| **Earth bar to switchgear frame** | < 0.1 Ω | 4-wire DC method | ✓ Pass |
| **Cable armor to earth bus** | < 0.5 Ω per 100 m | Clamp-on meter | ✓ Pass |
| **Lightning arrester earth lead** | < 0.01 Ω | 4-wire DC method | ✓ Pass |

**Measurement Procedure (4-Wire Kelvin):**
1. Connect two leads to inject DC current (0.1 A–1 A)
2. Connect two leads to measure voltage across joint
3. Record resistance = V / I
4. Temperature reference: 20°C

**Failure Threshold:**
- Any measured resistance > acceptance limit indicates poor connection
- Remedial action: re-torque bolts, replate connections, or install parallel conductor

---

## Commissioning & Functional Tests

### Pre-Energization Earthing System Verification

**Hold Point 7: Complete Grounding System Check**

| Test | Measurement | Acceptance |
|---|---|---|
| **Earth Resistance (Fall-of-Potential)** | Main earth | ≤ 1.0 Ω |
| **Bonding Continuity** | All interconnections | < 0.1 Ω |
| **Arrester Condition** | Visual + insulation resistance | ≥ 10 MΩ @ 500 V |
| **Ground Path Impedance** | Transformer case to remote ground | < 0.5 Ω |

### Functional Testing Under Normal Operation

**Observation During System Energization:**

1. **Monitor for ground faults** (zero-sequence current = 0 mA at no load)
2. **Phase-to-ground voltage** (should be symmetric; all ≈ phase voltage / √3)
3. **Neutral point potential** (should remain near 0 V if earthed at transformer)

**Lightning Protection Verification (When Applicable):**

- Record any surge arrests or transients on power quality monitor
- Arrester operation indicated by: no flashover, no arcing observed
- Confirm arrester temperature within safe limits (typically 60°C continuous rating)

### Post-Incident Testing (After Lightning Strike or Fault)

**Immediate Actions:**
1. De-energize system safely
2. Verify arrester mechanical integrity (no cracks, discoloration)
3. Re-measure earth resistance at affected area
4. Test arrester insulation resistance (≥ 10 MΩ @ 500 V)

**Acceptance for Continued Operation:**
- Earth resistance still ≤ 1.0 Ω
- Arrester intact; insulation resistance normal
- No visible damage to conductors or connections

**If Arrester Shows Degradation:**
- Replace arrester immediately
- Analyze fault incident for root cause
- Consider additional surge protection if repeated incidents

---

## Inspection Activity Matrix

| Activity | Contractor | Engineer | Owner | Code | Standard |
|---|---|---|---|---|---|
| Material verification & documentation | ✓ | ✓ | — | A | IEC 61936-1 |
| Earth conductor inspection | ✓ | ✓ | — | A | IEC 61936-1 |
| Lightning arrester type verification | ✓ | ✓ | — | A | IEC 62305-3 |
| Earthing system installation check | ✓ | ✓ | — | **A (HOLD)** | IEC 61936-1 |
| Earth resistance measurement | ✓ | ✓ | — | **A (HOLD)** | IEC 61936-1 |
| Bonding continuity test | ✓ | ✓ | — | **A (HOLD)** | IEC 61936-1 |
| Arrester earth lead inspection | ✓ | ✓ | — | **A (HOLD)** | IEC 62305-3 |
| Arrester insulation test | ✓ | ✓ | — | A | IEC 62305-3 |
| Pre-energization system verification | ✓ | ✓ | ✓ | **A (HOLD)** | GEPP-BKN2-E-IT-001 |
| Functional test under load | — | ✓ | ✓ | A | GEPP-BKN2-E-IT-001 |
| Final system sign-off | — | ✓ | ✓ | **A (FINAL)** | GEPP-BKN2-E-IT-001 |

---

## Test Parameters & Acceptance Criteria Summary

### Earth Resistance Limits (Main Grounding System)

**Measurement Method:**
```
Fall-of-Potential (IEC 61936-1 preferred):
- Inject current at 50–128 Hz frequency
- Measure voltage at 10 m distance from electrode
- Measure voltage at 20 m and 30 m to confirm plateau
- Use average of plateau region (typically 20–30 m range)
```

**Target Values by System Type:**

| System | Resistance | Tolerance | Standard |
|---|---|---|---|
| **Main Station Earth** | ≤ 1.0 Ω | — | IEC 61936-1 |
| **Generator Neutral** | ≤ 5.0 Ω | — | IEC 61936-1 |
| **Switchgear Local Earth** | ≤ 2.0 Ω | — | IEC 61936-1 |
| **Lightning Rod System** | ≤ 10 Ω | — | IEC 62305-3 |

**Calculation for Multiple Parallel Rods:**

```
For N identical rods of length L, spaced S apart:
R_parallel = R_single / (1 + (N-1) × correction_factor)
Example: Two 3 m copper-bonded rods, 5 m spacing in soil ρ = 100 Ω·m
R_single ≈ 5.0 Ω
R_parallel ≈ 5.0 / (1 + 1 × 0.75) = 2.86 Ω (significant improvement)
```

### Bonding Continuity Standards

| Connection Type | DC Resistance Limit | Measurement |
|---|---|---|
| **Main earth bar to electrode** | < 0.01 Ω | 4-wire Kelvin |
| **Bar to transformer neutral** | < 0.1 Ω | 4-wire Kelvin |
| **Bar to switchgear frame** | < 0.1 Ω | 4-wire Kelvin |
| **Cable armor bonds** | < 0.5 Ω per 100 m | Clamp-on meter |
| **Lightning arrester lead** | < 0.01 Ω | 4-wire Kelvin |

### Lightning Arrester Acceptance

**Mechanical Condition:**
- No cracks, chips, or porcelain damage
- No discoloration indicating overstress
- Mounting hardware tight and corrosion-free

**Electrical Condition (Insulation Resistance):**

| Test | Voltage | Minimum | Standard |
|---|---|---|---|
| **Terminal to Case** | **500 V DC** | **≥ 10 MΩ** | IEC 62305-3 |
| **Pole to Pole** | 500 V DC | ≥ 100 MΩ | IEC 62305-3 |
| **Leakage Current @ Voltage** | — | ≤ 1 mA @ 500 V | Manufacturer spec |

**Performance Data (from Manufacturer Certificate):**

| Parameter | Acceptance | Notes |
|---|---|---|
| **1 mA Voltage** | Per nameplate ± 10% | System voltage reference |
| **10 kA Discharge Voltage** | Per nameplate ± 10% | Surge protection capability |
| **Follow Current Extinguish** | Self-extinguishing | System arc quenching |
| **Power Frequency Withstand** | 50 Hz, 10 s, 1.5 × COV | No flashover allowed |

---

## Applicable Standards

### International Electrotechnical Commission (IEC)

- **IEC 61936-1:** Power installations exceeding 1 kV AC – Part 1: Common rules (Earthing systems)
- **IEC 62305-1:** Protection against lightning – Part 1: General principles
- **IEC 62305-3:** Protection against lightning – Part 3: Physical damage to structures and life hazard
- **IEC 62305-4:** Protection against lightning – Part 4: Electrical and electronic systems within structures
- **IEC 61012-1:** Earth electrodes – Part 1: Copper and copper-bonded steel rods
- **IEC 61557-5:** Safety – Insulation coordination – Part 5: Resistance of earthing and protective conductors

### American Standards (IEEE)

- **IEEE Std 80:** Guide for Safety in AC Substation Grounding
- **IEEE Std 665:** Guide for Generating Station Grounding (Earthing)
- **ANSI/IEEE C62.1:** Standard for Surge Protectors Used on Power Circuits

### Project-Specific Standards

- **GEPP-BKN2-E-IT-001:** Project earthing and lightning protection ITP (Status A–B)

### Indonesian National Standards (SNI)

- **SNI IEC 61936-1:** Earthing systems (adopted IEC equivalent)

---

## Critical Hold Points Summary

| # | Activity | Test/Verification | Pass Requirement | Authority |
|---|---|---|---|---|
| 1 | **Material Documentation** | Conductor/arrester certificates | All comply with specification | Engineer + Contractor |
| 2 | **Arrester Type & Specs** | Nameplate, voltage rating, test certs | Correct for system voltage | Engineer |
| 3 | **Earthing System Installation** | Path routing, conductor continuity | Continuous, no gaps, bonded | **Engineer + Owner** |
| 4 | **Earth Resistance (Fall-of-Potential)** | Main earth electrode measurement | ≤ 1.0 Ω | **Engineer + Contractor** |
| 5 | **Bonding Continuity** | DC resistance at all connections | < 0.1 Ω (max) | Engineer + Contractor |
| 6 | **Arrester Earth Lead** | Resistance and mechanical condition | < 0.01 Ω; rigid, short | **Engineer** |
| 7 | **Pre-Energization System** | Complete grounding check | All tests passed | **Engineer + Owner** |
| 8 | **Functional Test** | Observation during energization | No ground faults; normal voltages | **Engineer + Owner** |
| 9 | **Final Sign-Off** | Documentation review | All tests passed and documented | **Owner Representative** |

---

## Risk Mitigation & Troubleshooting

### High Earth Resistance (> 1.0 Ω)

**Possible Causes:**
- Dry, rocky soil (high resistivity, ρ > 200 Ω·m)
- Poor rod contact with soil
- Single electrode insufficient for installation

**Remedial Actions:**

1. **Install Additional Parallel Rods:**
   - Drive second rod 4–5 m away from first
   - Measure resistance with both: typically 50–70% reduction
   - Install third rod if needed for further reduction

2. **Deepen Existing Rods:**
   - Drive to 5–6 m depth instead of minimum 2.5 m
   - Resistance improves with depth due to higher soil moisture

3. **Soil Enhancement (Limited Effectiveness):**
   - Excavate around electrode to 0.5 m depth
   - Backfill with bentonite clay mixture
   - Temporary (6–12 month) improvement; not recommended for permanent solution

4. **Increase Rod Diameter:**
   - Switch from 12 mm to 16 mm copper-bonded rod
   - Minimal improvement; primarily for mechanical strength

### Lightning Arrester Degradation (Insulation Resistance < 10 MΩ)

**Possible Causes:**
- Manufacturing defect
- Moisture ingress through porcelain
- Over-voltage stress from previous surge events
- Thermal cycling damage

**Remedial Actions:**

1. **Immediate Replacement:**
   - Remove failed arrester from service
   - Install new arrester of same type and rating
   - Verify earth lead and mechanical condition before operation

2. **Root Cause Investigation:**
   - Review power quality records for surge events
   - Check earth resistance at arrester location
   - Consider additional surge protection if repeated failures

3. **Prevention:**
   - Install new arresters with redundancy (parallel units)
   - Ensure proper earthing of arrester leads
   - Minimize lead length to <0.5 m for lowest inductance

---

## Document Evolution

| Revision | Date | Key Changes | Status |
|---|---|---|---|
| Status A | 2018 | Initial baseline for project | Superseded |
| Status B | 2019 | Arrester testing procedures clarified | **Current** |

---

**Document Prepared:** April 2026  
**Last Updated:** From ITPs dated 2018–2019  
**Review Cycle:** 24 months or after major lightning event or system modification
