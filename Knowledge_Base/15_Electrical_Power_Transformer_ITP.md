# Power Transformer — Inspection & Test Plan Knowledge Base

**Document References:**
- A-3.04.00048 GEPP-BKN2-E-FAT-001 FAT Procedure for Power Transformer Testing 60 MVA 150.11kV (Status B)
- A-3.04.00049 GEPP-BKN2-E-IT-008 Inspection and Test Plan for Power Transformer (Status B)
- A-3.04.00068 GEPP-BKN2-E-IT-008 REV.1 ITP for Power Transformer (Status B)
- A-3.04.00076 GEPP-BKN2-E-IT-008 REV.2 Shop Inspection and Test Plan Power Transformer (Status B)
- A-3.04.00095 GEPP-BKN2-E-IT-008 REV.4 Shop Inspection and Test Plan For Power Transformer (Status B)
- A-3.04.000102 GEPP-BKN2-E-IT-008 Shop ITP for Power Transformer Rev5 (B)
- A-3.04.000124 GEPP-BKN2-E-IT-008 Rev.3 ITP for Power Transformer (B)
- A-3.04.00055 GEPP-BKN2-E-IT-008 Inspection Test Plan Generator Transformer (Status C)

---

## Overview & Scope

Power transformer inspection and testing covers factory acceptance testing (FAT), shop inspection and testing (SAT), and site installation verification for large capacity transformers used in electrical power systems. These ITPs apply to:

- **Power Transformers:** 60 MVA class, 150.11 kV high voltage windings
- **Generator Transformers:** Rated for unit auxiliary and main generator output
- **Test Phases:** Factory FAT → Shop SAT → Site Installation Inspection → Commissioning Tests

**Key Scope Elements:**
- Pre-assembly inspection and documentation
- Core and winding insulation testing
- Oil quality and dielectric strength verification
- Mechanical condition and assembly verification
- Performance tests under load and no-load conditions
- Field verification and functional testing

---

## Factory/Shop Acceptance Tests (FAT/SAT)

### Pre-Test Documentation Requirements

1. **Transformer Nameplate Verification**
   - Rating: 60 MVA / 150.11 kV
   - Phase configuration: 3-phase, 50 Hz
   - Vector group and cooling type (e.g., ONAN)
   - Serial number and manufacturer data
   - Tap changer range and position

2. **Shipping & Condition Inspection**
   - Visual inspection for transport damage
   - Verification of cable glands, bushings, and connections
   - Oil level and color assessment
   - Temperature and humidity recording

### Core Insulation & Winding Tests

**Hold Point 1: Core Insulation Megohm Tests**

| Test Parameter | Minimum Value | Test Duration | Standard |
|---|---|---|---|
| **Insulation Resistance (HV winding to ground)** | **≥1,000 MΩ (at 20°C reference)** | 1 minute | IEC 60076-3 |
| **Insulation Resistance (LV winding to ground)** | **≥1,000 MΩ (at 20°C reference)** | 1 minute | IEC 60076-3 |
| **Insulation Resistance (HV to LV)** | **≥100 MΩ** | 1 minute | IEC 60076-3 |
| Megohm meter range | 100 V – 1000 V DC | — | IEC 61557 |
| Temperature correction | Applied to 20°C reference | — | IEC 60076-3 Table 11 |

**Acceptance Criteria:**
- All values measured ≥ minimum specified
- Values stable during measurement interval
- Document trend from previous tests if available
- Reject if any value < 80% of minimum

**Hold Point 2: AC Withstand Voltage (High Pot) Test**

| Test Parameter | Value | Duration | Hold Point |
|---|---|---|---|
| **HV Winding Test Voltage** | **2 × U + 1000 V** (where U = rated voltage) | **1 minute** | **HOLD** |
| **LV Winding Test Voltage** | **2 × U + 1000 V** | **1 minute** | **HOLD** |
| Ramp rate | 0–2 kV/min (max 2 kV/min) | — | — |
| Maximum leakage current | ≤ 1 mA | — | IEC 60076-3 |
| Acceptance | No flashover or breakdown | — | **MANDATORY PASS** |

**Test Procedure:**
1. Apply voltage gradually at controlled ramp rate
2. Maintain test voltage for full 1-minute duration
3. Monitor leakage current continuously (must not exceed 1 mA)
4. Reduce voltage smoothly after hold time
5. Record voltage, current, and duration

**Failure Criteria:**
- Any flashover or partial discharge
- Leakage current > 1 mA at any point
- Breakdown during ramp-up
- → Reject transformer; investigate root cause

### Oil Dielectric Strength Testing

**Hold Point 3: Oil Dielectric Breakdown Voltage (DBV)**

| Parameter | Minimum Value | Test Method | Standard |
|---|---|---|---|
| **Dielectric Breakdown Voltage** | **≥30 kV** | ASTM D1816 or IEC 60156 | IEC 60060-1 |
| Number of samples | ≥ 5 samples from tank | — | IEC 60156 |
| Sample identification | Each marked with location, date, time | — | Quality control |
| Sample container | Filtered, clean, sealed bottles | — | IEC 60156 Annex |

**Testing Sequence:**
1. Collect oil from **lowest drain point** after settling (allow 2+ hours)
2. Filter through 3 μm filter before test
3. Condition samples to 20°C ± 5°C
4. Test in calibrated DBV apparatus
5. Record all breakdown values
6. Calculate arithmetic mean of 5 samples

**Acceptance:**
- Mean DBV ≥ 30 kV
- No single sample < 28 kV
- All samples stable between measurements

**Oil Moisture Content (Karl Fischer Titration)**

| Parameter | Maximum Value | Standard |
|---|---|---|
| **Water Content (by mass)** | **≤35 ppm (mg/kg)** | IEC 60814 |
| Acidity (Total Acid Number) | ≤ 0.3 mg KOH/g | ASTM D664 |
| Color | ≤ ASTM D1500 color 3 | ASTM D1500 |
| Viscosity (at 40°C) | Rated viscosity ± 10% | ASTM D445 |

### No-Load & Load Loss Tests

**Test Condition Setup:**
- Three-phase balanced supply ± 2%
- Frequency within 50 Hz ± 0.5 Hz
- Thermometer or RTD at winding hotspot location
- Duration: Minimum 4 hours at rated load for temperature stabilization

| Test | Parameter | Tolerance | Hold Point |
|---|---|---|---|
| **No-Load Loss (Iron Loss)** | Measured actual vs. nameplate | ±10% | Acceptance |
| **Load Loss (Copper Loss)** | At 75°C reference, 100% rated current | ±10% nameplate | Acceptance |
| **Temperature Rise** | HV & LV windings at rated load, 40°C ambient | Per IEC 60076-2 | **HOLD** |
| **Zero-Sequence Impedance** | If specified | ±10% | Acceptance |

**Temperature Rise Acceptance Criteria (at 40°C ambient, rated load, ONAN cooling):**
- HV winding: ≤ 65°C rise
- LV winding: ≤ 65°C rise
- Top oil: ≤ 65°C rise

### Sound Level Test

| Parameter | Maximum dB | Method | Standard |
|---|---|---|---|
| **Audible Noise Level** | ≤ 85 dB(A) @ 1 m distance | Sound level meter, A-weighting | IEC 60076-10 |
| Measurement distance | 1 meter from transformer surface | — | IEC 60076-10 |
| Background noise | ≥ 6 dB below measured level | — | IEC 60076-10 |
| Test position | Perpendicular to most affected side | — | — |

---

## Site Installation Inspection

### Pre-Installation Verification

**Hold Point: Installation Condition Inspection**

1. **Transformer Foundation**
   - Concrete pad level, stable, free of cracks
   - Adequate draining (slope ≥ 1%)
   - Corrosion-resistant mounting pads

2. **Cable/Bushing Connections**
   - All cable entries through approved conduits
   - Bushing condition: no cracks, corrosion, or contamination
   - Cable terminations checked for tightness
   - Grounding continuity verified with meggohm (≥1 MΩ)

3. **Oil System Inspection**
   - Oil level gauge readable and accurate
   - Breather operational (silica gel fresh)
   - Drain valve operational (no leaks)
   - Expansion tank functioning

### Functional Testing Before Energization

**Hold Point: Megohm Testing (Site Installation)**

After 24 hours minimum settling time at site:

| Winding Pair | Minimum Resistance | Test Duration |
|---|---|---|
| **HV to Ground** | **≥1,000 MΩ** | 1 minute |
| **LV to Ground** | **≥1,000 MΩ** | 1 minute |
| **HV to LV** | **≥100 MΩ** | 1 minute |

**Failure Investigation:**
- If < 80% of factory baseline: investigate moisture/contamination
- Allow drying/degassing if required
- Re-test after remedial action

**Hold Point: Turns Ratio Test**

| Parameter | Tolerance |
|---|---|
| HV to LV Turns Ratio | ±0.5% |
| All tap positions | Within specification |

**AC Insulation Verification (Abbreviated High Pot)**

For installed transformers (instead of full high pot):

| Test | Voltage | Duration |
|---|---|---|
| Reduced voltage withstand | 50% of factory test voltage | 1 minute |
| Acceptance | No visible discharge/flashover | — |

---

## Commissioning & Functional Tests

### Energization Sequence

**Step 1: System Configuration Verification**
- Primary supply breaker operational
- Secondary load breaker operational
- Tap changer at specified position (usually center position)
- Cooling fans functional
- Oil circulation pump operational (if forced cooling)

**Step 2: Vacuum Pressure Impregnation (VPI) Status Check**
- For VPI transformers: confirm oven baking schedule completed
- Oil degassing: verify transformer has been under vacuum or nitrogen flushing
- Oil color: should be light to medium (ASTM D1500 ≤ 3)

**Hold Point: Incipient Fault Detection (Partial Discharge)**

| Parameter | Acceptance |
|---|---|
| **Partial Discharge at Rated Voltage** | **< 5 pC (picocoulombs)** |
| **Duration of PD monitoring** | **≥ 30 minutes at rated voltage** |
| **Stability** | **No trending upward; stable PD level** |

If PD > 5 pC:
- Reduce voltage to 50% and retest
- If PD persists, investigate dielectric failure
- Consider oil filtration and drying; retest after conditioning

### Load Testing & Stability

**Ramp Test (First 24 Hours)**
- Hour 1: 25% rated load
- Hour 2: 50% rated load
- Hour 4–8: 75% rated load
- Hour 24: 100% rated load

**Monitoring Parameters:**
- Winding temperatures (contact thermometers, RTD)
- Top oil temperature
- Output voltage and current (3-phase balance)
- Cooling system operation

**Acceptance Criteria:**
- Temperature stable ± 2°C after each load increment
- Temperature rise < nameplate maximum
- Output frequency = 50 Hz ± 0.5 Hz
- 3-phase voltage unbalance < 3%

### Final Acceptance Test

**Visual Inspection Checklist**
- [ ] No oil leaks from tank or bushings
- [ ] Cooling fans operating smoothly
- [ ] Oil level stable within normal range
- [ ] Transformer terminals free of moisture/corrosion
- [ ] Grounding connections tight and corrosion-free
- [ ] All cable terminations verified for phase balance

**Electrical Performance Summary**
- [ ] Turns ratio: within ± 0.5%
- [ ] Insulation resistance: ≥ 1,000 MΩ
- [ ] Short-circuit impedance: within ± 5% of design
- [ ] Load loss (at 75°C): within ± 10% of nameplate
- [ ] No-load loss: within ± 10% of nameplate
- [ ] Temperature rise: within limits at rated load
- [ ] Partial discharge: < 5 pC (if applicable)
- [ ] Oil DBV: ≥ 30 kV

---

## Inspection Activity Matrix

| Activity | Contractor | Engineer | Owner | Code | Standard |
|---|---|---|---|---|---|
| Shipping condition inspection | ✓ | ✓ | — | — | GEPP-BKN2-E-IT-008 |
| Pre-assembly documentation review | ✓ | ✓ | ✓ | A | IEC 60076-3 |
| Megohm testing (factory) | ✓ | ✓ | — | A | IEC 60076-3 Table 11 |
| AC withstand voltage (high pot) | ✓ | ✓ | ✓ | **A (HOLD)** | IEC 60076-3 |
| Oil sampling and analysis | ✓ | ✓ | — | A | IEC 60156, IEC 60814 |
| Oil dielectric breakdown voltage | Lab | ✓ | — | A | IEC 60156 |
| No-load loss test | ✓ | ✓ | — | A | IEC 60076-3 |
| Load loss test (temperature rise) | ✓ | ✓ | ✓ | **A (HOLD)** | IEC 60076-2 |
| Audible noise measurement | ✓ | ✓ | — | A | IEC 60076-10 |
| Foundation inspection (site) | ✓ | ✓ | ✓ | **A (HOLD)** | GEPP-BKN2-E-IT-008 |
| Megohm testing (site, pre-energization) | ✓ | ✓ | — | A | IEC 60076-3 |
| Turns ratio verification | ✓ | ✓ | — | A | IEC 60076-3 |
| Partial discharge test | ✓ | ✓ | — | A | IEC 60270 |
| Load ramp commissioning | ✓ | ✓ | ✓ | **A (HOLD)** | GEPP-BKN2-E-IT-008 |
| Final inspection sign-off | — | ✓ | ✓ | **A (FINAL)** | GEPP-BKN2-E-IT-008 |

---

## Test Parameters & Acceptance Criteria Summary

### Insulation Resistance (Megohm) Tests

**Factory Testing:**
```
HV Winding to Ground:  ≥ 1,000 MΩ @ 20°C (reference temperature)
LV Winding to Ground:  ≥ 1,000 MΩ @ 20°C (reference temperature)
HV to LV Windings:     ≥ 100 MΩ @ 20°C
```

**Site Installation (after 24-hour settling):**
```
Same values; if <80% of factory baseline → investigate moisture
```

**Temperature Correction Formula:**
- For every 10°C above 20°C: resistance decreases by ~50%
- Record ambient temperature; apply correction per IEC 60076-3 Table 11

### High-Voltage Withstand Test

**Test Voltage Formula:**
```
U_test = 2 × U_rated + 1,000 V (for HV windings)
```

**Example (150.11 kV transformer):**
```
U_test = 2 × 150.11 + 1 = 301.22 kV (rounded to 305 kV)
Duration: 1 minute
Leakage current limit: ≤ 1 mA
Ramp rate: ≤ 2 kV/minute
```

**LV Winding (typically 12 kV):**
```
U_test = 2 × 12 + 1 = 25 kV
Duration: 1 minute
```

### Oil Quality Baseline Requirements

| Test | Minimum/Maximum | Remarks |
|---|---|---|
| **Dielectric Breakdown Voltage (DBV)** | **≥ 30 kV** | 5 samples, mean ± no single < 28 kV |
| **Water Content (Karl Fischer)** | **≤ 35 ppm** | Critical for moisture ingress |
| **Total Acid Number (TAN)** | **≤ 0.3 mg KOH/g** | Oxidation indicator |
| **Color** | **≤ ASTM D1500 #3** | Degradation indicator |
| **Viscosity @ 40°C** | **Nameplate ± 10%** | Cooling efficiency impact |
| **Interfacial Tension (IFT)** | **≥ 24 mN/m** | Additive depletion indicator |

### Transformer Thermal Performance

**Temperature Rise Limits (at 40°C Ambient, ONAN):**

| Winding/Component | Class B | Class F | Class H |
|---|---|---|---|
| HV Winding | 65°C | 100°C | 125°C |
| LV Winding | 65°C | 100°C | 125°C |
| Top Oil | 65°C | 100°C | 125°C |

**Load Loss (Copper Loss) Verification:**
```
Measured Load Loss @ 75°C = (Nameplate ± 10%)
Tolerance band example for 100 kW nameplate loss:
Acceptance range: 90 kW to 110 kW
```

---

## Applicable Standards

### International Electrotechnical Commission (IEC)

- **IEC 60076-1:** General requirements for power transformers
- **IEC 60076-2:** Temperature rise for power transformers
- **IEC 60076-3:** Insulation levels, dielectric test levels, and external clearances
- **IEC 60076-10:** Determination of sound levels
- **IEC 60156:** Determination of the breakdown voltage of insulating oils by the disruptive-discharge method
- **IEC 60270:** High-voltage test techniques – Partial discharge measurements
- **IEC 60814:** Mineral insulating oils – Determination of water by Karl Fischer reagent
- **IEC 61557-1:** Safety – Insulation coordination – Part 1: Definitions, principles and rules

### American Standards (ASTM/IEEE)

- **ASTM D1500:** Standard test method for color of petroleum products
- **ASTM D445:** Standard test method for kinematic viscosity of transparent and opaque liquids
- **ASTM D664:** Standard test method for acid number of petroleum products
- **ASTM D1816:** Standard test method for dielectric breakdown voltage of mineral insulating oils
- **IEEE Std 57.104:** IEEE Guide for the Interpretation of Gases Generated in Mineral Oil-Immersed Transformers (DGA)

### Project-Specific Standards

- **GEPP-BKN2-E-IT-008:** Project ITP standard for Power Transformers (Rev.1–5)
- **GEPP-BKN2-E-FAT-001:** Factory Acceptance Test Procedure for Power Transformers
- **SPLN Handbook:** Standard requirement for electrical utility projects in Indonesia

### Indonesian National Standards (SNI)

- **SNI IEC 60076 series:** Adopted IEC standards for local compliance

---

## Critical Hold Points Summary

| # | Activity | Test/Verification | Pass Requirement | Authority |
|---|---|---|---|---|
| 1 | **Factory Insulation Test** | Megohm (HV/LV to ground) | ≥ 1,000 MΩ | Engineer + Contractor |
| 2 | **Factory High Pot** | AC withstand @ 2U+1000V | No breakdown, I ≤ 1 mA | **Engineer + Owner** |
| 3 | **Oil Quality** | DBV (5 samples) | Mean ≥ 30 kV, all ≥ 28 kV | Engineer + Contractor |
| 4 | **Load Loss & Temp Rise** | Temperature stabilization | Within nameplate limits | **Engineer + Owner** |
| 5 | **Foundation (Site)** | Concrete condition, slope | Level, stable, drained | **Engineer + Owner** |
| 6 | **Pre-Energization Insulation** | Megohm @ 24h settlement | ≥ 1,000 MΩ (>80% factory) | Engineer + Contractor |
| 7 | **Partial Discharge** | PD monitoring @ rated V | < 5 pC for 30 minutes | **Engineer + Owner** |
| 8 | **Load Ramp Commissioning** | Temperature rise stability | Stable ± 2°C per increment | **Engineer + Owner** |
| 9 | **Final System Sign-Off** | Complete functional check | All tests passed, documented | **Owner Representative** |

---

## Document Evolution & Version Control

| Revision | Date | Key Changes | Status |
|---|---|---|---|
| Status A | — | Initial baseline | Superseded |
| Status B | Oct 2018 – Aug 2019 | Field experience updates, load test clarifications | Active |
| Rev.1 | — | Turns ratio tolerance tightened to ±0.5% | Superseded |
| Rev.2 | — | Added partial discharge acceptance criteria | Superseded |
| Rev.3 | — | Oil sampling protocol refined | Superseded |
| Rev.4 | — | Temperature monitoring clarifications | Superseded |
| Rev.5 | — | Site commissioning procedure finalized | **Current** |

**Note:** Use Rev.5 as baseline for new projects; previous revisions available for legacy system reference only.

---

## Responsibility Matrix

- **Contractor (Manufacturer/Supplier):** Factory testing, documentation, initial compliance
- **Engineer (EPC/Consultant):** Witness testing, acceptance authority, hold point approval
- **Owner (Utility):** Final sign-off, commissioning supervision, operational handover

---

**Document Prepared:** April 2026  
**Last Updated:** From ITPs dated 2018–2019  
**Review Cycle:** 24 months or after major project experience
