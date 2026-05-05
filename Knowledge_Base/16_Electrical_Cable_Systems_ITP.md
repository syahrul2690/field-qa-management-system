# Electrical Cable Systems — Inspection & Test Plan Knowledge Base

**Document References:**
- A-3.04.00044 GEPP-BKN2-E-IT-007 ITP Cable (Status A)
- A-3.04.00079 GEPP-BKN2-E-IT-007A Shop ITP Cable (Status C)
- A-3.04.00087 GEPP-BKN2-E7-ITP-001 Shop Inspection and Test Plan for Power Cable Feeder (Status B)
- A-3.04.00089 GEPP-BKN2-E7-ITP-001 REV.1 Shop Inspection and Test Plan for Power Cable Feeder (Status A)

---

## Overview & Scope

Electrical cable systems inspection and testing covers high-voltage and low-voltage power cables used for main feeders, auxiliary systems, and distribution circuits. This ITP encompasses:

**Cable Types:**
- Main feeder cables (HV: 11 kV, 33 kV classes)
- Auxiliary power cables (LV: ≤ 1 kV)
- Control and instrumentation cables
- Cable glands, terminations, and accessories

**Test Phases:**
- Factory/Shop cable testing and certification
- Installation inspection and continuity verification
- Pre-energization insulation testing
- Functional testing under load

---

## Factory/Shop Acceptance Tests (FAT/SAT)

### Cable Manufacturing Inspection

**Hold Point 1: Cable Documentation & Type Verification**

| Parameter | Requirement | Standard |
|---|---|---|
| **Cable Type & Gauge** | Match project specification (AWG, mm²) | IEC 60502 series |
| **Conductor Material** | Copper (Cu) or Aluminum (Al) per design | Certificate of conformance |
| **Insulation Type** | Cross-linked polyethylene (XLPE) or PVC | Test report from mill |
| **Outer Sheath** | UV-resistant, flame-retardant per specification | — |
| **Reel/Drum Marking** | Type, gauge, length, voltage rating | ISO 1219 |
| **Manufacturing Certificate** | Mill test report (MTR) with test data | ISO 17025 accreditation |

**Acceptance:** All markings match specification; MTR provided and reviewed.

### Cable Insulation Resistance Testing (Factory)

**Hold Point 2: Insulation Resistance (Megohm Test)**

**For High-Voltage Cables (11 kV, 33 kV):**

| Parameter | Test Voltage | Minimum Resistance | Standard |
|---|---|---|---|
| **Insulation Resistance @ 1 min** | **1,000 V DC** | **≥ 100 MΩ per 1 km** | IEC 60502-4 |
| **Insulation Resistance @ 10 min** | 1,000 V DC | ≥ 500 MΩ per 1 km | IEC 60502-4 |
| Temperature reference | 20°C ± 5°C | — | — |
| Record trend | 1 min, 10 min values | Absorption ratio calculation | IEC 60840 |

**Absorption Ratio:**
```
Polarization Index = R_10min / R_1min
Target: ≥ 1.3 (indicates good insulation)
If PI < 1.1: investigate moisture contamination; consider drying
```

**For Low-Voltage Cables (≤ 1 kV):**

| Parameter | Test Voltage | Minimum Resistance | Standard |
|---|---|---|---|
| **Insulation Resistance @ 1 min** | **500 V DC** | **≥ 10 MΩ per 1 km** | IEC 60502-1 |
| **Acceptance** | — | Megohm meter reading stable | IEC 61557-2 |

**Test Procedure:**
1. Coil cable in loops of 5–10 m diameter (avoid sharp bends)
2. Allow 5-minute conditioning at test voltage before measurement
3. Record reading at 1 minute and 10 minutes
4. Calculate Polarization Index
5. Document ambient temperature and humidity

**Failure Criteria:**
- Any value below minimum specified
- PI < 1.1 (indicates moisture or defect)
- Non-linear resistance trend
- → Reject cable; investigate cause (moisture, manufacturing defect)

### DC High-Voltage Withstand Test

**Hold Point 3: DC Withstand Voltage (Cable Insulation Strength)**

**For 11 kV Cables:**

| Test | Voltage | Duration | Acceptance |
|---|---|---|---|
| **DC Withstand (1 min ramp)** | **13.5 kV DC** | **1 minute** | **No breakdown, I ≤ 5 mA** |
| **Leakage current monitoring** | Applied voltage | Continuous | Stable or decreasing trend |
| Ramp rate | 0–13.5 kV over 1 minute | — | — |

**Example: 33 kV Cable System**

| Test | Voltage | Duration |
|---|---|---|
| **DC Withstand (1 min ramp)** | **40 kV DC** | **1 minute** |
| Acceptance criteria | No flashover or breakdown | I ≤ 10 mA |

**Test Setup:**
- High-voltage DC source (Hipot tester)
- Leakage current meter (0–100 mA range minimum)
- Voltage regulation: ± 5% of test voltage
- Safety interlocks operational
- Ground jumper removed during test

**Failure Indicators:**
- Sudden current spike > acceptance limit
- Breakdown (sudden loss of voltage)
- Partial discharge visible as crackling sound
- → Reject cable; perform fault location analysis

### AC Voltage Withstand Test (Field-Applied Option)

**Alternative to DC Withstand (for some projects):**

| Voltage Class | AC Test Voltage | Duration |
|---|---|---|
| **11 kV** | **3 × U / √3 = 19 kV AC** | **1 minute** |
| **33 kV** | **3 × U / √3 = 57 kV AC** | **1 minute** |
| Frequency | 50 Hz ± 1 Hz | — |
| Max leakage current | ≤ 1.5 mA per 100 m | — |

---

## Site Installation Inspection

### Cable Installation Verification

**Hold Point 4: Cable Routing & Installation Inspection**

| Item | Inspection Requirement | Pass Criteria |
|---|---|---|
| **Cable Path** | No sharp bends (radius ≥ 10 × cable diameter) | Visual inspection passed |
| **Cable Support** | Clipped at 1.5 m intervals (horizontal runs); secured in trays | No sagging observed |
| **Segregation** | Power, control, comms cables physically separated | ≥ 50 mm spacing minimum |
| **Conduit Integrity** | No cracks, dents, or sharp edges | Cable can slide freely |
| **Termination Points** | All glands mechanically secure, sealed | No moisture ingress visible |
| **Identification** | Each cable labeled with circuit ID, voltage rating | Legible permanent labels |
| **Grounding** | Cable armor/shield properly bonded to ground | Continuity ≥ 0.1 Ω (4-wire method) |
| **Moisture Inspection** | Cable ends sealed immediately after termination | No condensation in terminations |

**Cable Bend Radius Requirements:**
```
Single-core cables: R_min = 12 × d (where d = outer diameter)
Multi-core cables:  R_min = 10 × d
Example: 70 mm² cable (d ≈ 12 mm):
Min radius = 120 mm for single-core, 120 mm for multi-core
```

### Continuity & Conductor Testing

**Hold Point 5: Conductor Continuity (DC Megger Test)**

| Parameter | Test Method | Acceptance Criteria |
|---|---|---|
| **Phase-to-Phase Continuity** | DC resistance @ 100 mA | < 0.1 Ω per 1 km |
| **Three-Phase Balance** | Measure R₁, R₂, R₃ | Within ± 5% of mean |
| **Shield/Armor Continuity** | Ground shield resistance | < 0.5 Ω per 100 m |
| **Test Equipment** | 4-wire Kelvin meter or digital megohm | Accuracy ± 0.01 Ω |

**Measurement Procedure:**
1. De-energize circuit completely
2. Ground all phases at termination points
3. Measure resistance from source to load end with 4-wire method
4. Record temperature; apply correction if ≠ 20°C
5. Repeat for all phases
6. Calculate balance percentage: (R_max – R_min) / R_mean × 100%

**Failure Criteria:**
- Any phase resistance > 0.1 Ω/km (indicates damaged conductor or connection)
- Balance > ± 5% (suspect open conductor or loose termination)
- Shield continuity > 0.5 Ω/100 m (grounding inadequate)

### Insulation Resistance (Site Installation)

**Hold Point 6: Megohm Testing (Site, Pre-Energization)**

**After 24-hour minimum settling (to allow moisture migration out):**

| Cable Type | Voltage | Min. Resistance | Temperature Correction |
|---|---|---|---|
| **11 kV Feeder** | **1,000 V DC** | **≥ 100 MΩ per 1 km** | Per IEC 60840 |
| **LV Auxiliary** | **500 V DC** | **≥ 10 MΩ per 1 km** | Per IEC 60502-1 |
| Acceptable trend | Stable or increasing from factory | — | Compare to factory baseline |

**Investigation Threshold:**
- If site megohm < 70% of factory baseline: cable has absorbed moisture
- **Remedial Action:** Allow drying with low-voltage heating; retest after 48 hours
- If moisture persists: replace cable section; investigate installation defect

---

## Commissioning & Functional Tests

### Pre-Energization Verification

**Hold Point 7: Complete Electrical System Check**

| Test | Method | Acceptance |
|---|---|---|
| **Insulation Resistance** | Megohm per previous section | ≥ 100 MΩ per 1 km |
| **Continuity** | 4-wire DC resistance | < 0.1 Ω per 1 km, ± 5% balance |
| **Dielectric Strength** | DC or AC withstand voltage (per earlier section) | Pass without breakdown |
| **Ground Path Resistance** | 4-wire method to local ground | < 0.5 Ω (main feeder) |

### Energization & Load Testing

**Step 1: Energization Sequence (Cold Start)**

1. **Verify secondary is de-energized and grounded**
2. **Close primary breaker slowly (ramp from 0–100% over 10 seconds)**
3. **Verify three-phase voltage balance:**
   ```
   Voltage unbalance = (V_max - V_min) / V_avg × 100%
   Acceptance: < 3% unbalance
   ```
4. **Monitor for audible corona or discharge noise**
5. **Record no-load current through cable (typically < 2% rated current)**

**Hold Point 8: No-Load & Load Stability (First 4 Hours)**

| Time | Load Level | Monitoring | Acceptance |
|---|---|---|---|
| Hour 1 | No-load | Voltage, current, temperature | Stable ± 2°C; I < 2% rated |
| Hour 2 | 25% rated | Phase balance; no vibration | Voltage unbalance < 3% |
| Hour 3 | 50% rated | Temperature stabilization begins | Cable temp < 60°C surface |
| Hour 4 | 75% rated | Thermal transient observation | Temperature rise < 5°C/hour |

**Step 2: Full Load Test (24 hours)**

After thermal stabilization at 75% load:

| Parameter | Acceptance Criteria |
|---|---|
| **Temperature Rise** | ≤ 20°C above ambient at 100% load (PVC insulation) |
| **Voltage Drop** | ≤ 5% of nominal at 100% load (IEC 60502-2) |
| **Current Unbalance** | < 10% between any two phases |
| **Harmonic Distortion** | THD_V < 5%, THD_I < 10% |

**Example: 100 A feeder at 11 kV**
```
Voltage drop = 2.5% = 0.275 kV
Current per phase = 100 ± 10 A (acceptable range)
Temperature rise example: 50°C ambient + 15°C rise = 65°C cable surface (acceptable)
```

### Shutdown & Final Inspection

**Hold Point 9: Final System Check After Load Test**

| Item | Verification |
|---|---|
| **Visual Inspection** | No signs of overheating, charring, or cable degradation |
| **Temperature Measurement** | Cable surface cooled to ambient ± 5°C after de-energization |
| **Connector Inspection** | Lugs and terminations cool to touch; no corrosion |
| **Megohm Retest** | ≥ 100 MΩ per 1 km (acceptance after thermal cycling) |

---

## Inspection Activity Matrix

| Activity | Contractor | Engineer | Owner | Code | Standard |
|---|---|---|---|---|---|
| Cable delivery & documentation | ✓ | ✓ | — | A | IEC 60502 |
| Visual inspection (factory) | ✓ | ✓ | — | A | IEC 60502 |
| Insulation resistance test (factory) | ✓ | ✓ | — | A | IEC 60502-4 |
| DC withstand test (factory) | ✓ | ✓ | — | **A (HOLD)** | IEC 60502-4 |
| Installation routing review | ✓ | ✓ | — | A | GEPP-BKN2-E7-ITP-001 |
| Conductor continuity (site) | ✓ | ✓ | — | A | IEC 61557-2 |
| Insulation resistance (site) | ✓ | ✓ | — | A | IEC 60502-4 |
| Cable termination verification | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E7-ITP-001 |
| Energization & no-load test | ✓ | ✓ | ✓ | **A (HOLD)** | GEPP-BKN2-E7-ITP-001 |
| Load ramp & temperature monitoring | ✓ | ✓ | ✓ | **A (HOLD)** | IEC 60502-2 |
| Final visual & electrical check | — | ✓ | ✓ | **A (FINAL)** | GEPP-BKN2-E7-ITP-001 |

---

## Test Parameters & Acceptance Criteria Summary

### Insulation Resistance Baseline

**Factory (New Cable):**
```
High-Voltage (11 kV):     ≥ 100 MΩ per 1 km @ 20°C (1,000 V DC)
Low-Voltage (≤ 1 kV):     ≥ 10 MΩ per 1 km @ 20°C (500 V DC)
Polarization Index:       ≥ 1.3 (at 1 min vs. 10 min)
```

**Site Installation (After 24 h settlement):**
```
Same values; if < 70% of factory baseline → drying required
```

### DC Withstand Voltage

**Standard Test Voltages by Cable Voltage Class:**

| Nominal Voltage | Test Voltage | Duration |
|---|---|---|
| **11 kV cable** | **13.5 kV DC** | **1 minute** |
| **33 kV cable** | **40 kV DC** | **1 minute** |
| **LV (≤ 1 kV)** | **3 kV DC** | **1 minute** |

**Acceptance:** No breakdown; leakage current ≤ stated limit.

### Conductor Resistance

**For Copper Conductor (Reference @ 20°C):**

| Cable Size | Typical Resistance | Formula |
|---|---|---|
| 16 mm² | ≈ 1.15 Ω/km | R = ρL/A (ρ = 0.0184 Ω·mm²/m for Cu @ 20°C) |
| 25 mm² | ≈ 0.73 Ω/km | — |
| 50 mm² | ≈ 0.365 Ω/km | — |
| 70 mm² | ≈ 0.261 Ω/km | — |
| 120 mm² | ≈ 0.153 Ω/km | — |

**Temperature Correction (if ≠ 20°C):**
```
R_θ = R_20 × [1 + α × (θ – 20)]
α = 0.00393 /°C for copper
Example: Measured @ 30°C = 0.365 × [1 + 0.00393 × (30–20)] = 0.379 Ω/km
```

### Voltage Drop Calculation

**At Rated Current (100 A example, 11 kV, 70 mm² cable, 100 m run):**

```
V_drop = I × R × cos φ + ωL × I × sin φ
Simplified (copper, pf = 0.95): V_drop ≈ 2.5% at 100 A / 100 m
Acceptance: ≤ 5% voltage drop (per IEC 60502-2)
```

### Cable Temperature Rise

**PVC Insulation (Max. Conductor Temperature = 70°C continuous):**

| Load | Ambient | Max. Conductor Temp | Temperature Rise |
|---|---|---|---|
| 50% | 40°C | ~65°C | 25°C |
| 75% | 40°C | ~68°C | 28°C |
| 100% | 40°C | ~70°C | 30°C |

**XLPE Insulation (Max. Conductor Temperature = 90°C continuous):**

| Load | Ambient | Max. Conductor Temp | Temperature Rise |
|---|---|---|---|
| 75% | 40°C | ~80°C | 40°C |
| 100% | 40°C | ~90°C | 50°C |

---

## Applicable Standards

### International Electrotechnical Commission (IEC)

- **IEC 60502-1:** PVC-Insulated Cables – Part 1: General requirements
- **IEC 60502-2:** PVC-Insulated Cables – Part 2: Test methods
- **IEC 60502-4:** XLPE-Insulated Cables – Insulation thickness
- **IEC 60840:** Cables with extruded insulation and their accessories – Test methods and requirements for XLPE cables
- **IEC 60577:** Tungsten filament lamps for use in mines susceptible to firedamp
- **IEC 61557-2:** Safety – Insulation coordination – Part 2: Insulation resistance testing

### American Standards (ASTM/IEEE)

- **ASTM B386:** Standard specification for aluminium 1350-H19 round wire for electrical purposes
- **IEEE Std 575:** Guide for the Application of Shielded Power Cable Rated 5–46 kV
- **IEEE Std 442:** Guide for the Application and Interpretation of Temperature Monitoring Thermocouples
- **IEEE Std 1202:** Standard for Testing and Performance of High-Voltage Electric Cable Accessories

### Project-Specific Standards

- **GEPP-BKN2-E-IT-007:** Project cable ITP (Status A–C)
- **GEPP-BKN2-E7-ITP-001:** Shop ITP for Power Cable Feeder (Status A–B)

### Indonesian National Standards (SNI)

- **SNI IEC 60502 series:** PVC-insulated cables per IEC equivalent

---

## Critical Hold Points Summary

| # | Activity | Test/Verification | Pass Requirement | Authority |
|---|---|---|---|---|
| 1 | **Delivery Documentation** | Cable type, gauge, voltage rating verification | All match specification | Engineer + Contractor |
| 2 | **Insulation Resistance** | Megohm test (factory) | ≥ 100 MΩ per 1 km; PI ≥ 1.3 | Contractor + Engineer |
| 3 | **DC Withstand** | High-voltage insulation strength | No breakdown; I ≤ limit | **Engineer** |
| 4 | **Installation Routing** | Cable path, support, segregation | No sharp bends, secured, separated | **Engineer + Owner** |
| 5 | **Continuity & Balance** | DC resistance, phase balance | < 0.1 Ω/km, ± 5% balance | Engineer + Contractor |
| 6 | **Site Insulation** | Megohm (pre-energization) | ≥ 100 MΩ per 1 km | Engineer + Contractor |
| 7 | **Energization Setup** | Three-phase balance, grounding | V unbalance < 3%; ground < 0.5 Ω | **Engineer + Owner** |
| 8 | **Load Testing** | Temperature rise, voltage drop | < 5% V drop; ≤ 30°C rise @ 100% | **Engineer + Owner** |
| 9 | **Final Acceptance** | Complete system check-out | All tests passed; documented | **Owner Representative** |

---

## Risk Mitigation & Troubleshooting

### Common Installation Defects

| Defect | Detection Method | Remedial Action |
|---|---|---|
| Moisture ingress | Low megohm (< 70% factory) | Dry cable with applied heat; retest after 48 h |
| Loose termination | High DC resistance (> 0.1 Ω/km) | Re-torque terminations; check lug condition |
| Unbalanced phases | DC resistance > ± 5% spread | Verify conductor gauges; check for open strand |
| Voltage unbalance | AC three-phase measurement > 3% | Check transformer tap position; load distribution |
| Excessive voltage drop | Load test > 5% | Verify cable size matches calculation; check breaker resistance |

### Drying Procedure for Moisture-Laden Cables

**If site megohm < 70% of factory baseline:**

1. **De-energize cable completely; verify with volt tester**
2. **Remove load from circuit**
3. **Apply low voltage (e.g., 10% rated V) for 24–72 hours:**
   - Creates heat through resistive losses
   - Drives moisture toward cable ends
   - Monitor current for signs of breakdown
4. **Re-megohm test after each 12-hour interval**
5. **Acceptance when megohm returns to ≥ 70% factory baseline**
6. **Then proceed with normal energization sequence**

---

## Document Evolution

| Revision | Date | Key Changes | Status |
|---|---|---|---|
| Status A | — | Initial baseline | Superseded |
| Status C | 2018 | Installation defect documentation added | Superseded |
| Rev.1 | 2019 | Load testing procedures clarified | **Current** |

---

**Document Prepared:** April 2026  
**Last Updated:** From ITPs dated 2018–2019  
**Review Cycle:** 24 months or after major cable replacement project
