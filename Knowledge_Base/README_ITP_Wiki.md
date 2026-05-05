# ITP Wiki — Project Management & Quality Assurance Knowledge Base

## Overview

This wiki contains consolidated Inspection and Test Plan (ITP) knowledge for electricity utility infrastructure projects. Documents are structured as comprehensive reference guides covering equipment specifications, testing procedures, hold points, and quality assurance requirements.

---

## Files in This Collection

### HV Switchyard Equipment (21_HV_Switchyard_Equipment_ITP.md)

**Coverage:** High-voltage switchyard equipment used in power generation and distribution projects.

**Equipment Covered:**
- Circuit Breaker (CB) — Type & routine tests, FAT/SAT procedures
- Current Transformer (CT) — Insulation, accuracy class verification
- Voltage Transformer (VT) & Capacitor Voltage Transformer (CVT) — Harmonic response, transient suppression
- Disconnector (Isolator) — Contact resistance, mechanical durability
- Surge Arrester — Protective levels, leakage current, pressure relief
- Aluminium Busbar & Conductor Specifications — Data schedules (70 MM, 80 MM, 136 MM tubes; ACC 638 strands)

**Key Sections:**
1. Equipment Technical Data & Ratings (voltage class, BIL, rated current)
2. Type Tests vs. Routine Tests — distinction and acceptance criteria
3. Factory Acceptance Tests (FAT) — pre-delivery checklist
4. Site/Field Tests — commissioning verification
5. SF6 Gas Equipment Guidance — pressure requirements, drying, purity control
6. ITP Code Explanations — activity status codes, hold point levels
7. Applicable Standards (IEC 60056, IEC 61869-2/3, IEC 62271-102, IEEE C37.04)
8. Quality Assurance Matrix — inspection hold point summary by equipment type

**Document Statistics:**
- 506 lines
- 27 KB
- 12 main equipment sections
- 35+ data/specification tables
- Hold points clearly marked as **CRITICAL**, **HOLD**, or **INSPECT**

---

### Wartsila Gas Engine Generator (22_Wartsila_Gas_Engine_Generator_ITP.md)

**Coverage:** Wartsila medium-speed gas-fueled reciprocating engine generator sets for combined cycle and standalone power generation.

**Equipment Covered:**
- Wartsila Engine Core (18V50SG, 20V34SG, 34SG models; 6-20 MW rating)
- Synchronous AC Generator (4-pole, 3.3-11 kV terminal voltage)
- Auxiliary Systems: Cooling, Lube Oil, Fuel Gas (natural gas), Fuel Oil (LFO backup), Compressed Air
- Electrical & Control Systems (AVR, governor, ECM, safety interlocks)

**Key Sections:**
1. Technical Specifications — Engine, Generator, Auxiliary Systems (detailed data tables)
2. Factory Acceptance Testing (FAT) Program
   - Phase 1: Pre-startup verification
   - Phase 2: No-load start & synchronization
   - Phase 3: Load ramp test (25%, 50%, 75%, 100% MCR)
   - Phase 4: Load rejection test
   - Phase 5: Fuel oil system test (dual-fuel)
   - Phase 6: Post-FAT verification
3. Site Acceptance Testing (SAT) Program — commissioning procedures
4. Product Conformity & Regulatory Requirements — CE marking, PED, EMC
5. ITP Code Designations — activity status & hold point authority
6. PLTMG Tobelo Project-Specific Notes — tropical ambient conditions, seawater cooling
7. Spare Parts & Maintenance Schedule — critical components, post-commissioning intervals
8. Quality Assurance Matrix — FAT & SAT hold point checklists
9. Appendices — FAT test data logging template, SAT vibration survey template

**Document Statistics:**
- 545 lines
- 33 KB
- 6 major FAT phases + SAT procedure
- 50+ technical specification tables
- FAT acceptance decision matrix included

---

## Key Features of This Wiki

### 1. Hold Point Designations

All critical inspection and test points are clearly marked:

| Level | Symbol | Meaning | Waiver Authority |
|---|---|---|---|
| **CRITICAL** | **C** | MUST witness and sign-off | PMC/Project Director ONLY |
| **HOLD** | **H** | MUST inspect; requires approval | PMC Engineering |
| **INSPECT** | **I** | Visual verification; photo record recommended | QA spot-check |

### 2. Comprehensive Testing Procedures

Each document outlines:
- **Type Tests** — performed ONCE per design at independent lab
- **Routine Tests** — performed on EVERY unit before shipment
- **Factory Acceptance Tests (FAT)** — pre-delivery qualification
- **Site Acceptance Tests (SAT)** — on-site commissioning verification

### 3. Technical Specifications & Standards

All equipment specified with:
- Rated voltages, currents, power ratings
- Basic Insulation Levels (BIL)
- Acceptance criteria with tolerances
- Cross-references to IEC, IEEE, ANSI standards

### 4. Quality Assurance Matrices

Visual tables showing:
- Inspection points by equipment type
- Hold point locations in FAT/SAT workflow
- Acceptance criteria for each phase
- Sign-off authority and waiver process

---

## How to Use This Wiki

### For QA/QC Engineers

1. **Before equipment procurement:** Review "Overview & Scope" + "Equipment Technical Data" sections
2. **During factory phase:** Reference "Factory Acceptance Tests" section; track hold point sign-offs
3. **At site commissioning:** Use "Site Acceptance Tests" procedure; compare to baseline performance data
4. **Post-commissioning:** Maintain records per "Maintenance Schedule" section

### For Project Managers

1. **Planning phase:** Extract equipment ratings and standard test durations for project schedule
2. **During execution:** Use hold point matrix to track critical inspection approvals
3. **Vendor management:** Reference "Product Conformity" requirements when evaluating OEM submittals
4. **Closeout:** Verify all certificates and test reports per "Documentation" checklists

### For Electrical/Mechanical Engineers

1. **Design reviews:** Confirm equipment specifications match project requirements
2. **During FAT:** Monitor critical test parameters; understand acceptance ranges
3. **During SAT:** Perform trending analysis; compare to FAT baseline
4. **Spare parts planning:** Reference "Spare Parts" sections for lead times and critical components

---

## Standards & References

### IEC Standards Used
- **IEC 60056** — High-voltage switchgear (Circuit Breakers)
- **IEC 61869-2/3** — Instrument transformers (CT/VT/CVT)
- **IEC 62271-102** — Disconnectors and earthing switches
- **IEC 61643-12** — Surge protective devices
- **IEC 60034-1/3** — Rotating electrical machines (Generators)

### ANSI/IEEE Standards Used
- **IEEE C37.04** — AC high-voltage circuit breaker ratings
- **IEEE C37.60** — Distribution apparatus standards
- **IEEE C57.13** — Instrument transformer standards
- **IEEE C62.11** — Metal-oxide surge arresters

### ISO Standards Used
- **ISO 10816** — Mechanical vibration evaluation
- **ISO 8573-1** — Compressed air quality
- **ISO 8601** — Natural gas quality
- **ISO 4406** — Fluid cleanliness coding

---

## Maintenance & Updates

**Document Version:** 1.0  
**Last Updated:** 2026-04-13  
**Next Review:** 2026-10-13 (6-month cycle)

To suggest updates or corrections, contact:
- **QA/QC Lead:** Quality Assurance Team
- **Technical:** Project Engineering Department
- **Standards:** Document Control / Compliance Team

---

## Document Navigation

**HV Switchyard Equipment (File 21)**
- Quick start: Section 1 (Circuit Breaker overview)
- Technical data: Tables in "1.1 Equipment Technical Data"
- Hold points: Section 10 "Quality Assurance Matrix"
- Standards: Section 9 "Applicable Standards & References"

**Wartsila Gas Engine Generator (File 22)**
- Quick start: Section 1 "Wartsila Engine Generator — Technical Specifications"
- FAT procedure: Section 2 (6 phases with acceptance criteria)
- SAT procedure: Section 3 "Site Acceptance Testing"
- Hold points: Section 8 "Quality Assurance Matrix"
- Project notes: Section 6 "PLTMG Tobelo Project-Specific Notes"

---

## Glossary of Key Abbreviations

| Term | Meaning |
|---|---|
| **BIL** | Basic Insulation Level (kV) |
| **CB** | Circuit Breaker |
| **CT** | Current Transformer |
| **CVT** | Capacitor Voltage Transformer |
| **FAT** | Factory Acceptance Test |
| **IEC** | International Electrotechnical Commission |
| **IEEE** | Institute of Electrical & Electronics Engineers |
| **ITP** | Inspection and Test Plan |
| **MCR** | Maximum Continuous Rating |
| **OEM** | Original Equipment Manufacturer |
| **PED** | Pressure Equipment Directive (EU) |
| **PMC** | Project Management Consultant |
| **SAT** | Site Acceptance Test |
| **SF6** | Sulfur Hexafluoride (insulating gas) |
| **TAN** | Total Acid Number (lube oil degradation indicator) |
| **VT** | Voltage Transformer |

