# AI Agent — Knowledge Base Reading Protocol

**Purpose:** This file defines the mandatory reading protocol for any AI agent operating on ITP reviews, QA/QC analysis, document summarization, or project management tasks within this system.

Before performing any analysis, review, summarization, or insight generation on submitted documents, the AI **MUST** follow the reading sequence below.

---

## Default Reading Flow

```
START
  │
  ▼
[1] Read agent.md (this file) — load reading protocol & KB map
  │
  ▼
[2] Read MANDATORY CORE files (always read first, regardless of task)
  │
  ▼
[3] Identify task type → select DOMAIN-SPECIFIC files from catalog below
  │
  ▼
[4] Read selected domain files
  │
  ▼
[5] Process the submitted document / perform requested task
  │
  ▼
[6] Output: review, summary, analysis, or insight — grounded in KB
END
```

---

## Step 2 — Mandatory Core Files (Always Read First)

These files establish foundational context, project governance, and QA/QC framework. Read **all** of them before any task.

| Priority | File | Why It's Mandatory |
|----------|------|--------------------|
| 1 | `INDEX_Batch_ITP_Knowledge_Base.md` | Master catalog, cross-references, batch summary, project statistics |
| 2 | `README_ITP_Wiki.md` | Wiki overview, how-to-use guide, hold point authority levels, glossary |
| 3 | `01_PMBOK_2025_Project_Management_Framework.md` | PM framework baseline — all reviews should align to PMBOK principles |
| 4 | `04_Project_Quality_Plan_Field.md` | Project-level QA/QC governance, inspection authority, sign-off protocols |
| 5 | `02_Site_Quality_Plan_Mechanical_Electrical.md` | Site-level quality plan covering mech & elec scope |
| 6 | `03_Site_Quality_Plan_Schedule_Rev3.md` | Quality schedule, inspection milestones, ITP submission timelines |

---

## Step 3 — Task-Type Decision Matrix

Use this table to select which additional domain files to read based on the task at hand.

| If the submitted document / task is about... | Read these files |
|----------------------------------------------|-----------------|
| **Civil / Structural works** | `05_Civil_Works_ITP_Knowledge.md` |
| **Fire protection / suppression systems** | `06_Mechanical_Fire_Fighting_ITP.md` |
| **Water treatment plant (WTP)** | `07_Mechanical_WTP_ITP.md` |
| **Wastewater treatment (WWTP)** | `08_Mechanical_WWTP_ITP.md` |
| **Rotating equipment** (pumps, compressors, turbines) | `09_Mechanical_Rotating_Equipment_ITP.md` |
| **Tanks / pressure vessels / storage** | `10_Mechanical_Fabricated_Tanks_ITP.md` |
| **HVAC / ventilation / air handling** | `11_Mechanical_HVAC_ITP.md` |
| **Overhead cranes / hoists / lifting** | `12_Mechanical_Overhead_Crane_ITP.md` |
| **Piping / ductwork / flow systems** | `13_Piping_Duct_ITP.md` |
| **Field installation & functional commissioning (general)** | `14_Field_Installation_Functional_ITP_Mech_Elec.md` |
| **Power transformers** | `15_Electrical_Power_Transformer_ITP.md` |
| **Cable systems / trays / terminations** | `16_Electrical_Cable_Systems_ITP.md` |
| **Earthing / lightning protection / grounding** | `17_Electrical_Earthing_Lightning_ITP.md` |
| **Busduct / switchgear / MCC** | `18_Electrical_Busduct_Switchgear_ITP.md` |
| **Battery systems / UPS / emergency generators** | `19_Electrical_Battery_UPS_Generator_ITP.md` |
| **Lighting / communication systems / CCTV** | `20_Electrical_Lighting_Communication_CCTV_ITP.md` |
| **HV switchyard / circuit breakers / transformers (HV)** | `21_HV_Switchyard_Equipment_ITP.md` |
| **Gas engine generators (Wartsila / reciprocating engines)** | `22_Wartsila_Gas_Engine_Generator_ITP.md` |
| **Factory Test Programs (FTP) / steam turbines** | `23_PLTU_Lombok_FTP2_Factory_Test_Program.md` |
| **ITP comment sheets / contractor responses** | `24_Riau_Peaker_Field_ITP_Comment_Sheets.md` |
| **PLTMG / power barge electrical systems** | `25_PLTMG_Ambon_Field_Electrical_ITP.md` |
| **Spare parts / maintenance planning** | `26_Mandatory_Spare_Parts.md` |
| **Any multi-system / comprehensive review** | Read all files relevant to systems present in the document |

---

## Step 4 — Reading Priority Rules

1. **Never skip mandatory core files.** They provide the QA/QC framework that all domain knowledge must be evaluated against.
2. **When in doubt, read more.** If a document touches multiple systems, read all relevant domain files.
3. **Cross-reference files are linked.** File 14 (`Field_Installation_Functional_ITP_Mech_Elec`) consolidates practices from Files 10–13. Read the specific file first, then File 14 for integration context.
4. **INDEX file is the navigation hub.** If uncertain which files are relevant, re-read `INDEX_Batch_ITP_Knowledge_Base.md` — it has a cross-reference map.

---

## Knowledge Base File Catalog

All 26 knowledge base files, organized by category.

### Project Governance & Frameworks

| File | Title | Scope |
|------|-------|-------|
| `01_PMBOK_2025_Project_Management_Framework.md` | PMBOK 2025 PM Framework | PMI PMBOK 8th Edition — principles, performance domains, value delivery |
| `02_Site_Quality_Plan_Mechanical_Electrical.md` | Site Quality Plan — Mech & Elec | Site-level QA/QC procedures, inspection codes (H/W/R/A), responsibility matrix |
| `03_Site_Quality_Plan_Schedule_Rev3.md` | Site Quality Plan Schedule Rev.3 | ITP submission milestones, quality schedule, approval timelines |
| `04_Project_Quality_Plan_Field.md` | Project Quality Plan (Field) | Field-level QA governance, NCR process, hold point authority (GEPP-BKN2) |

### Mechanical Systems ITPs

| File | Title | Scope |
|------|-------|-------|
| `05_Civil_Works_ITP_Knowledge.md` | Civil Works ITP | Foundations, structural steel, concrete, earthworks, civil QA |
| `06_Mechanical_Fire_Fighting_ITP.md` | Fire Fighting ITP | Fire suppression, sprinkler, deluge, CO2 systems; NFPA standards |
| `07_Mechanical_WTP_ITP.md` | Water Treatment Plant ITP | WTP equipment, filtration, chemical dosing, water quality testing |
| `08_Mechanical_WWTP_ITP.md` | Wastewater Treatment Plant ITP | WWTP systems, effluent quality, biological/chemical treatment |
| `09_Mechanical_Rotating_Equipment_ITP.md` | Rotating Equipment ITP | Pumps, compressors, fans; alignment, vibration, performance testing |
| `10_Mechanical_Fabricated_Tanks_ITP.md` | Fabricated Tanks ITP | Shop/site tank fabrication; API 650, ASME VIII; NDT, hydrostatic tests |
| `11_Mechanical_HVAC_ITP.md` | HVAC Systems ITP | Air handling, ductwork, fan systems; ASHRAE standards, duct pressure test |
| `12_Mechanical_Overhead_Crane_ITP.md` | Overhead Crane ITP | Crane fabrication, static/dynamic load testing, ASME B30.2; safety systems |
| `13_Piping_Duct_ITP.md` | Piping & Duct ITP | ASME B31.1 piping, SMACNA ductwork; NDT, hydrostatic, flushing |
| `14_Field_Installation_Functional_ITP_Mech_Elec.md` | Field Installation & Functional ITP | Comprehensive mech/elec installation, commissioning, soft-start, performance verification |

### Electrical Systems ITPs

| File | Title | Scope |
|------|-------|-------|
| `15_Electrical_Power_Transformer_ITP.md` | Power Transformer ITP | HV/MV transformers; FAT/SAT, insulation test, oil quality, bushing test |
| `16_Electrical_Cable_Systems_ITP.md` | Cable Systems ITP | LV/MV/HV cables; routing, termination, insulation resistance, continuity |
| `17_Electrical_Earthing_Lightning_ITP.md` | Earthing & Lightning ITP | Grounding grid, earth resistance (<1 Ω), lightning protection, equipotential bonding |
| `18_Electrical_Busduct_Switchgear_ITP.md` | Busduct & Switchgear ITP | LV/MV busduct, MCC, switchgear; dielectric test, contact resistance, protection relay |
| `19_Electrical_Battery_UPS_Generator_ITP.md` | Battery, UPS & Generator ITP | VRLA/Li battery, UPS, diesel emergency gen; capacity test, load bank test |
| `20_Electrical_Lighting_Communication_CCTV_ITP.md` | Lighting, Comms & CCTV ITP | Area lighting, emergency lighting, PA/intercom, CCTV, fiber optic |
| `21_HV_Switchyard_Equipment_ITP.md` | HV Switchyard Equipment ITP | CB, CT, VT/CVT, disconnectors, surge arrester; IEC/IEEE FAT & SAT |
| `22_Wartsila_Gas_Engine_Generator_ITP.md` | Wartsila Gas Engine Generator ITP | Wartsila 18V50SG/20V34SG FAT/SAT; load ramp, load rejection, dual-fuel |
| `25_PLTMG_Ambon_Field_Electrical_ITP.md` | PLTMG Ambon Field Electrical ITP | PLTMG power barge electrical systems, field commissioning |

### Reference & Special Purpose

| File | Title | Scope |
|------|-------|-------|
| `23_PLTU_Lombok_FTP2_Factory_Test_Program.md` | PLTU Lombok FTP2 Factory Test Program | Steam turbine/generator factory test; thermal performance, vibration, control |
| `24_Riau_Peaker_Field_ITP_Comment_Sheets.md` | Riau Peaker ITP Comment Sheets | Contractor comment response sheets; ITP review cycle, approval process examples |
| `26_Mandatory_Spare_Parts.md` | Mandatory Spare Parts | Critical spare parts list, lead times, commissioning spares, O&M spares |
| `INDEX_Batch_ITP_Knowledge_Base.md` | Index — Batch ITP Knowledge Base | Master index, cross-references, batch processing summary |
| `README_ITP_Wiki.md` | ITP Wiki README | Wiki overview, usage guide, hold point authority, glossary |

---

## Key Concepts Reference

### Hold Point Authority Levels

| Code | Meaning | Authority |
|------|---------|-----------|
| **H** | Hold Point — work CANNOT proceed | PLN (Client) sign-off required |
| **W** | Witness — Client must be present | PLN or authorized 3rd party |
| **SW** | Spot Witness — periodic check | Random/periodic PLN inspection |
| **R** | Review documentation | Main contractor verification |
| **A** | Formal approval required | PLN engineering approval |
| **P** | Perform & initial | Subcontractor self-inspection |

### Inspection Code Symbols

| Symbol | Role | Responsibility |
|--------|------|----------------|
| **Sub** | Subcontractor | Performs activity, initial inspection |
| **PP** | Main Contractor (PP = Pelaksana Pekerjaan) | Verification & approval |
| **PLN** | Client (PT. PLN Persero) | Hold point approval, witness |

### Standard NDT Methods

| Method | Abbreviation | Application |
|--------|-------------|-------------|
| Visual Inspection | VI | All welds (AWS D1.1 Section 8) |
| Ultrasonic Test | UT | Internal defects, pressure vessels |
| Radiography Test | RT | Weld internal quality (ASME V) |
| Penetrant Test | PT | Surface-breaking defects |
| Magnetic Particle | MT | Ferrous surface/near-surface |

### Common Acceptance Criteria

| Parameter | Acceptance Criterion | Standard |
|-----------|---------------------|----------|
| Hydrostatic test | 1.5× design pressure, zero leakage, 10 min hold | ASME B31.1 |
| Airflow / CFM | ±10% of design | ASHRAE 111 |
| Temperature control | ±2°F of setpoint | ASHRAE 55 |
| Vibration (operating) | <0.2 ips overall velocity | ISO 20816 |
| Insulation resistance (LV motor) | >5 MΩ at 500 VDC | NFPA 70 |
| Grounding continuity | <0.1 Ω to facility ground | NFPA 70 |
| Ductwork leakage | ≤5% design CFM at 6 in. W.C. | ASHRAE 90.1 |
| Earthing resistance | <1 Ω (HV systems) | IEC 61936 |
| Alignment TIR (rotating eq.) | <0.05" TIR (couplings) | ASME B73.1 |
| Flange bolt torque tolerance | ±10% of spec, star pattern | ASME B16.5 |

---

## Agent Behavior Rules

1. **Always read KB first.** Do not analyze, review, or give insight on any submitted document without completing Steps 1–4 above.
2. **Cite KB sources.** When making a finding, reference the relevant KB file (e.g., "Per `10_Mechanical_Fabricated_Tanks_ITP.md`: hydrostatic test must be at 1.5× design pressure...").
3. **Flag deviations.** If the submitted document deviates from KB standards/acceptance criteria, flag it explicitly as a finding.
4. **Use KB hold point levels.** When reviewing an ITP submitted by a contractor, validate hold points against the KB definitions above.
5. **Apply project context.** This KB is grounded in PLN utility projects (GEPP Bangkanai, Riau Peaker, PLTMG Ambon). Apply project governance standards accordingly.
6. **Report gaps.** If the submitted document covers a system not in the KB, note the knowledge gap and rely on referenced standards (ASME, IEC, IEEE, ASHRAE, NFPA, ISO) cited across KB files.

---

## Quick-Start Checklists

### Reviewing a Contractor-Submitted ITP

- [ ] Read mandatory core files (Steps 1–2)
- [ ] Identify systems covered → select domain files (Step 3)
- [ ] Read selected domain files (Step 4)
- [ ] Check ITP structure matches KB template (scope, phases, hold points, responsibility matrix)
- [ ] Verify hold points are correctly coded (H/W/SW/R/A)
- [ ] Validate acceptance criteria match KB standards
- [ ] Confirm applicable standards are cited correctly
- [ ] Check NDT methods are appropriate for material/joint type
- [ ] Flag any missing hold points or insufficient inspection coverage
- [ ] Output: structured review findings with severity (Critical / Major / Minor / Comment)

### Summarizing / Extracting Insights from a Technical Document

- [ ] Read mandatory core files
- [ ] Identify relevant domain → read domain file(s)
- [ ] Extract: scope, key equipment/systems, hold points, test parameters, acceptance criteria
- [ ] Compare extracted data to KB baseline
- [ ] Highlight unique or project-specific requirements
- [ ] Note alignment/misalignment with PMBOK governance principles
- [ ] Output: structured summary with KB cross-references

### Generating a Field QA Report

- [ ] Read mandatory core files + `04_Project_Quality_Plan_Field.md`
- [ ] Identify systems in scope → read domain files
- [ ] Use hold point matrix from KB as report structure
- [ ] Report each system: installation phase, commissioning phase, functional testing phase
- [ ] Flag open hold points (not yet signed off)
- [ ] List NCRs (Non-Conformance Reports) if any
- [ ] Output: structured field QA status report

---

*Last Updated: 2026-04-13 | Knowledge Base Version: 1.0 | Project Reference: GEPP Bangkanai Stage 2 (140MW), PT. PLN (Persero)*
