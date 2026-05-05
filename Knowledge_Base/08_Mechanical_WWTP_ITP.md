# Waste Water Treatment Plant (WWTP) — Inspection & Test Plan Knowledge Base

*Consolidated from Multiple ITP Documents*  
*Last Updated: April 13, 2026*

---

## Overview & Scope

This knowledge base consolidates Inspection and Test Plan (ITP) procedures for Waste Water Treatment Plant systems serving power generation facilities. The WWTP ITP covers equipment fabrication, assembly, shop testing, field installation, and operational commissioning for treatment of plant process water, cooling water, and sanitary wastewater.

### Applicable Project Documents
- A-3.04.00069: ITP for Waste Water Treatment System (Status B - REV.3)
- A-3.04.00065: Inspection and Test Plan for WWTP (Status C - REV.2)
- A-3.04.00034: ITP Water Treatment Plant System (Status C)
- A-3.04.00059: ITP for Waste Water Treatment Plant System (Status C)

### System Scope
Waste Water Treatment Plant systems include:
- Equalization and surge tanks
- Primary clarification and settling tanks
- Biological treatment reactors (activated sludge, SBR, trickling filter, etc.)
- Secondary clarification and sludge settling
- Disinfection units (UV, chlorination, ozonation)
- Sludge handling and dewatering equipment
- Aeration systems and blowers
- Flow equalization and bypass piping
- Instrumentation for process monitoring (DO, MLSS, pH, flow, temperature)
- Electrical and control systems

---

## Shop Inspection Activities

Shop activities verify component quality, design compliance, and proper assembly before delivery to site.

### Material & Equipment Verification
- Tank design code compliance (ASME, API 650, or equivalent)
- Welding materials and procedures meet ASME or AWS standards
- Hydrostatic pressure testing of all pressure vessels (1.5× design minimum)
- Material test certificates for structural steel, stainless steel, and specialty materials
- Surface preparation and protective coating system verification
- Equipment nameplate compliance with specification

### Tank Fabrication & Assembly
- **Structural Integrity**: Weld examination (visual, UT, RT) per specification percentage
- **Dimensional Verification**: Tank dimensions within ±10 mm tolerance
- **Internal Features**: Baffles, weirs, diffuser installation in correct position and secure attachment
- **Surface Preparation**: Abrasive blasting to ASTM D6386 surface cleanliness standard
- **Coating System**: Applied per specification (typically epoxy coating for internal surfaces)
- **Leak Testing**: Full tank hydrostatic test at 1.5× design height of water
- **Inspection Ports**: Access hatches and sampling points functional and leak-free

### Mechanical Equipment Testing
- **Pumps**: Performance curve verification (flow, head, power), bearing condition, vibration levels
- **Blowers**: Air flow and pressure output, noise levels, vibration, motor insulation resistance
- **Aerators**: Diffuser assembly integrity, oil-free compressed air certification (if applicable)
- **Screens/Grit Removal**: Mechanical operation smoothness, bypass provision, cleaning capability
- **Mixers**: Proper rotation direction, vibration levels, torque response

### Instrumentation & Control Testing
- Dissolved oxygen (DO) probe calibration and response time
- Suspended solids (MLSS) analyzer calibration and linearity
- pH sensor calibration across full range (typically 6.5-8.5)
- Flow meters and air flow meters accuracy verification (±2% recommended)
- Temperature sensors calibration against reference
- Level switches (high, low, emergency) response and hysteresis
- Pressure transmitters and gauges calibration (±1% ASME Grade A)
- Control system logic testing in simulation mode

### Factory Acceptance Testing (FAT)
- Complete system simulation test with mock process conditions
- All mechanical equipment operation under design load
- Control system response to process setpoints and alarms
- Emergency shutdown sequences and safety interlocks
- Data logging and archiving system functionality
- Documentation package completeness and accuracy

---

## Field/Site Installation Inspection Activities

Field activities verify correct installation and system integration with project infrastructure.

### Site Preparation & Foundation
- Foundation excavation and preparation complete per drawings
- Foundation inspection and approval (compaction, bearing capacity, drainage)
- Tank pad level verification (maximum ±25 mm variation)
- Utility access points prepared (water supply, sanitary sewer connection, electrical, compressed air)
- Site access for future maintenance and equipment removal
- Groundwater and drainage provisions adequate

### Tank & Equipment Installation
- **Tank Positioning**: Proper alignment and settlement on prepared pad (±25 mm tolerance)
- **Mechanical Connections**: All bolted connections torqued per specification
- **Nozzle Installation**: Inlet, outlet, and side ports installed and pressure-tested
- **Internal Features**: Baffles and diffusers in correct position and securely attached
- **Coating Condition**: Tank internal surface inspected for damage or incomplete coverage
- **Temperature & Humidity**: Optimal conditions maintained during installation (typically 10-25°C, <85% RH)

### Piping & Utility Connections
- **Water Supply/Discharge**: Flushed and pressure-tested per specification
- **Sanitary Connections**: Sealed and sloped per code requirements
- **Compressed Air**: Oil-free verified; filter and regulator installed per standard
- **Electrical**: All connections per approved single-line diagram; grounding verified
- **Instrumentation**: Sensor locations verified per design; pilot lines flushed and deaerated
- **Pressure Testing**: Full system tested at 1.5× design pressure; zero leakage acceptance

### Equipment Commissioning
- Pump startup and operation at design flow rate; flow verified
- Blower startup at design pressure; air flow and discharge verified
- Aeration tank diffuser function observed (uniform bubble distribution)
- Level indicator (sight glass and transmitter) synchronized and calibrated
- Motor current draw recorded and compared against nameplate full-load amperage (typically within ±10%)
- Vibration and noise baseline measurements recorded

### Control System & Instrumentation Integration
- SCADA/BMS communication verified (all signals received and displayed)
- Analog input calibration (0-4 mA or 0-10 V) verified across full range
- Analog output control signals tested (pump VFD, blower damper/VFD response)
- Alarm setpoints configured and tested (high, low, deviation limits)
- Emergency shutdown interlocks functional (tank overflow, power loss, equipment fault)
- Data logging continuous recording verified
- Manual override and bypass capability tested at multiple locations

---

## Functional & Commissioning Tests

Final system tests verify WWTP operates safely and achieves design treatment performance.

### System Startup & Initial Operation
- **Gradual Startup**: Ramp flow rate from 25% to 100% design over first 2-3 weeks
- **Seed Sludge Addition**: Activated sludge seeding at 2000-3000 mg/L MLSS (if biological system)
- **Initial Observations**: Monitor for unusual odors, foam, operational anomalies
- **Parameter Logging**: Record daily flow, DO, MLSS, F/M ratio, SVI, settling
- **Staff Presence**: Experienced operator on-site during initial startup and first 48 hours

### Wastewater Characterization Testing
- **Influent Analysis** (minimum 7 days):
  - Flow rate variation (daily, weekly pattern)
  - BOD₅ and COD content
  - Suspended solids (TSS)
  - Total nitrogen and phosphorus
  - pH and alkalinity
  - Oils and greases
  - Toxicity or inhibitory substances

- **Baseline Loading**: Calculate COD and nitrogen loading rates; compare with design assumptions

### Treatment Performance Verification
- **Effluent Quality** (minimum 14 days continuous):
  - BOD₅: Target <20 mg/L or per design specification
  - COD: Target <50 mg/L or per design specification
  - TSS: Target <30 mg/L or per design specification
  - TN (Total Nitrogen): Target <15 mg/L or per specification
  - TP (Total Phosphorus): Target <2 mg/L or per specification
  - pH: Maintain 6.5-8.5
  - Disinfected Effluent (if applicable): Free chlorine residual 0.5-2 mg/L or UV dose verification

- **Biological Parameters** (if activated sludge system):
  - Mixed Liquor Suspended Solids (MLSS): 3000-4000 mg/L for conventional system
  - Food/Microorganism Ratio (F/M): 0.3-0.5 kg BOD/kg MLSS/day
  - Sludge Volume Index (SVI): <150 mL/g MLSS (low values indicate good settling)
  - Solids Retention Time (SRT): 8-12 days typical for nitrification
  - Dissolved Oxygen (DO): 2-4 mg/L in aeration tank

### Equipment Performance Testing
- **Aeration Blower**: Air flow rate measurement at design discharge pressure; noise level <85 dB
- **Return Sludge Pump**: Flow rate verified at design rate; pressures within normal range
- **Waste Sludge Pump**: Intermittent operation on timer; flow rate verified on collection
- **Diffusers**: Uniform bubble distribution observed; DO gradient acceptable
- **Clarifiers**: Sludge blanket level stable; clarifier overflow rate acceptable (<1.5 m/h typical)
- **Sludge Dewatering** (if applicable): Cake dryness and volume verified at design capacity

### Process Stability & Stress Testing
- **24-Hour Continuous Operation**: System operates continuously without manual intervention
- **Weekend Shutdown Test**: Full 2-day shutdown and restart without upset
- **Peak Flow Test**: System operates at 120% design flow for 4 hours; parameters remain acceptable
- **Emergency Bypass Test**: Flow bypass to emergency pond functional
- **Equipment Failure Simulation**: Temporary shutdown of individual equipment; emergency procedures effective
- **Compliance Documentation**: All parameters maintained within specification limits for 14-day test period

### Staff Training & Competency
- Operations training completed: startup, normal operation, shutdown procedures
- Emergency procedures trained: equipment failure, power loss, overflow conditions
- Maintenance training: equipment inspection, lubrication, filter changes, calibration
- Competency sign-off: Operations supervisor and key operators sign-off on readiness
- O&M Manual review: Staff familiar with all procedures and safety protocols

---

## Hold Points & Witness Points

### Hold Points (H) — Must Be Approved Before Proceeding

**H1** - All material test certificates and tank design documentation reviewed and approved

**H2** - Hydrostatic tank test completed successfully with no leakage acceptance

**H3** - Factory Acceptance Test approved with all performance criteria met

**H4** - Equipment shipment and on-site receipt inspection completed with no damage

**H5** - Tank placement and foundation preparation verified as acceptable

**H6** - Pressure test of all piping and utility connections completed with zero leakage

**H7** - Control system integration and instrumentation calibration verified and approved

**H8** - Influent wastewater characterization completed (minimum 7 days of data)

**H9** - Biological system stabilization confirmed (if applicable): DO, MLSS, F/M ratio acceptable for 5 consecutive days

**H10** - Effluent quality meets design specification continuously for minimum 14 days

**H11** - Sludge handling and dewatering operations verified at design capacity

**H12** - Staff training completion documented with competency sign-off

**H13** - System Performance Test Report approved; system released to Owner

### Witness Points (W) — Owner/Consultant Observation Required

**W1** - Factory pressure vessel and hydrostatic testing

**W2** - Factory Acceptance Test (FAT) of complete system

**W3** - Tank positioning and foundation preparation inspection

**W4** - Equipment installation positioning and mechanical assembly

**W5** - System pressure testing and flushing operations

**W6** - Control system sensor installation and calibration verification

**W7** - Initial equipment startup and first 24 hours of operation

**W8** - Influent wastewater sampling and analysis program

**W9** - Biological system seed sludge addition and initial operation (if applicable)

**W10** - Continuous monitoring of dissolved oxygen, MLSS, and process parameters

**W11** - Effluent quality sampling and analysis program

**W12** - Aeration system performance and settling tank operation

**W13** - Sludge handling and dewatering operation

**W14** - Staff training demonstration and competency assessment

---

## Critical Test Parameters & Acceptance Criteria

### Hydraulic & Pressure Parameters
- **Design Flow Rate**: Specified in m³/h; typical range 50-300 m³/h depending on facility size
- **Peak Flow Design**: 1.5-2.0× average daily flow typical for WWTP design
- **Operating Pressure**: Typically gravity-fed; discharge pressure <1 bar for open systems
- **Pressure Test**: 1.5× design pressure minimum; zero visible leakage acceptance
- **Pressure Drop**: Acceptable across equipment per manufacturer (typically 0.3-1 bar)

### Wastewater Quality Parameters (Influent — Typical)
- **BOD₅**: 250-400 mg/L (municipal); 100-500 mg/L (industrial — varies by source)
- **COD**: 500-800 mg/L
- **TSS**: 300-400 mg/L
- **Total Nitrogen**: 40-80 mg/L
- **Total Phosphorus**: 6-12 mg/L
- **pH**: 6.5-7.5 (optimal for biological treatment)
- **Oil & Grease**: <50 mg/L (typically removed by primary treatment)
- **Flow Variation**: Peak hourly flow 1.5-2.0× average daily flow

### Treated Effluent Quality Acceptance Criteria (Typical — May Vary by Discharge Permit)
- **BOD₅**: <20 mg/L (conventional requirement); <10 mg/L or <5 mg/L for stricter permits
- **COD**: <50 mg/L or per permit requirement
- **TSS**: <30 mg/L or per permit requirement
- **Total Nitrogen**: <15 mg/L or per permit (nitrification/denitrification systems typically achieve <10 mg/L)
- **Total Phosphorus**: <2 mg/L or per permit
- **Free Chlorine Residual** (if disinfection): 0.5-2 mg/L; typically <1 mg/L to minimize formation of DBPs
- **pH**: 6.5-8.5
- **Color**: <50 CU (Color Units) for visible discharge compliance
- **Odor**: Not objectionable at property line or per local standard
- **Fecal Coliform**: <200 CFU/100 mL (or target <100 CFU/100 mL for secondary treatment standard)

### Biological Treatment Parameters (Activated Sludge — If Applicable)
- **Mixed Liquor Suspended Solids (MLSS)**: 3000-4000 mg/L target for conventional treatment
- **Mixed Liquor Volatile Suspended Solids (MLVSS)**: 70-80% of MLSS
- **Food/Microorganism Ratio (F/M)**: 0.3-0.5 kg BOD/kg MLSS/day (lower = longer SRT, better treatment)
- **Sludge Volume Index (SVI)**: <150 mL/g MLSS (good settling); >200 indicates bulking potential
- **Solids Retention Time (SRT)**: 8-12 days for nitrification; 3-5 days for basic BOD removal
- **Hydraulic Retention Time (HRT)**: 4-8 hours in aeration tank typical
- **Dissolved Oxygen (DO)**: 2-4 mg/L in aeration basin; >1 mg/L at return sludge
- **Return Sludge Ratio**: 25-35% of influent flow rate typical

### Aeration System Parameters
- **Air Flow Rate**: Specified in m³/h or kg/h; verified by flowmeter or bubble counting
- **Air Pressure**: Design pressure at blower discharge (typically 0.3-0.5 bar above water depth)
- **Oxygen Transfer Rate**: Measured via DO uptake test; verify against design AOR (Actual Oxygen Requirement)
- **Diffuser Fouling Index**: Pressure differential across diffusers monitored (increase indicates fouling)
- **Blower Noise Level**: <85 dB at 1 meter; silencers may be required

### Sludge Handling Parameters
- **Sludge Dewatering Cake Dryness**: Typically 18-25% for belt press, 20-30% for centrifuge
- **Polymer Dosing Rate**: Typical range 5-15 kg/ton dry solids (design-dependent)
- **Sludge Production**: Verified against design (typically 0.5-1.0 kg TSS/kg BOD removed)
- **Dewatering Capacity**: Verified at design hydraulic loading (tons dry solids per day)
- **Solids Capture**: >95% minimum (measured as BOD/TSS in centrate/filtrate)

### Process Stability Indicators
- **Nitrification**: If designed, ammonia (NH₃) <2 mg/L in final effluent
- **Denitrification** (if designed): Nitrate (NO₃⁻) <10 mg/L in final effluent after further treatment
- **Phosphorus Removal** (if designed): Orthophosphate <1 mg/L in final effluent
- **Bulking Control**: SVI <150 mL/g; foam layer not present
- **Filament Presence**: F/M ratio and DO maintained to prevent filamentous organism proliferation

---

## Inspection Responsibility Matrix

| Activity | Contractor | Consultant | Owner | Reference |
|----------|-----------|-----------|-------|-----------|
| Material Certification | Provide | Review/Approve | Monitor | MTR/CMC |
| Tank Hydrostatic Test | Execute | Witness | Approve | Test Report |
| FAT Execution | Execute | Witness | Approve | FAT Report |
| Site Installation | Execute | Inspect | Monitor | Drawings |
| Pressure Test Field | Execute | Witness | Approve | Test Report |
| Control Integration | Execute | Test/Witness | Approve | Test Log |
| Influent Characterization | Owner/Lab | Review | Execute | Analysis Report |
| System Startup | Contractor/Owner | Observe | Participate | Log/Notes |
| Effluent Testing | Owner/Lab | Review | Execute | Test Data |
| Performance Verification | Execute | Observe | Verify | Report |
| Staff Training | Contractor | Observe | Attend | Training Log |
| System Handover | Compile | Review | Accept | Sign-Off |

---

## Applicable Standards & Codes

- **ASME B&PV Code Section VIII**: Pressure Vessel Design and Construction
- **API 650**: Welded Steel Tanks for Oil Storage
- **AWWA Standards**: American Water Works Association
  - AWWA D100: Welded Carbon Steel Tanks
  - AWWA D103: Bolted Steel Tanks
- **USEPA 40 CFR Part 112**: Oil Pollution Prevention
- **USEPA 40 CFR Part 264**: Standards for Managers of Hazardous Waste
- **IEC 60204-1**: Electrical Safety of Industrial Machines
- **ISO 5817**: Welding Defects Classification
- **ASTM Standards**:
  - ASTM D1141: Seawater Substitute Preparation
  - ASTM E2659: Visual Inspection
  - ASTM D6386: Surface Preparation
- **ASCE Standard 5**: Water Reclamation and Reuse
- **WEF Manual of Practice**: Activated Sludge Design and Operation
- **EPA Design Manual**: Wastewater Treatment Plants
- **Local Discharge Permit**: Project-specific water quality requirements
- **Local Building/Environmental Code**: Jurisdiction-specific standards

---

## Key Documentation & Deliverables

### Pre-Installation Documents
- Design basis with influent/effluent characteristics and loading calculations
- Detailed P&IDs with all control interlocks and logic
- Equipment datasheets and technical specifications
- Material test certificates and welding records
- FAT report with performance data under design conditions
- Shipping documents and insurance certificates

### Installation & Testing Records
- Foundation inspection report and approved for construction
- Tank hydrostatic test certificate with dated photographs
- Pressure test reports for all piping systems (zero leakage sign-off)
- Equipment installation photographs and marked-up drawings
- Control system integration test report and verified communication
- Influent characterization data (7-14 days minimum)
- Continuous operation log (24-hour minimum)
- Effluent quality test results (14 days minimum) — BOD, COD, TSS, N, P, etc.
- Biological process stability data (if applicable) — DO, MLSS, F/M, SVI trends
- Equipment performance verification (flow rates, pressures, noise levels)
- Staff training attendance records with competency sign-off

### Handover Documentation Package
- Operations & Maintenance Manual with detailed procedures
- Troubleshooting guide for common operational upsets
- Emergency procedures and contingency plans
- Preventive maintenance schedule and spare parts inventory
- Equipment warranty information and service contact details
- Performance baseline report (design vs. actual comparison)
- Training records and authorized operator sign-off
- As-built P&IDs and equipment location plan
- Quality assurance/quality control inspection records
- Handover sign-off from all stakeholders (Contractor, Consultant, Owner)

---

## Critical Lessons & Best Practices

1. **Influent Characterization**: Begin sampling 30 days before startup to understand diurnal and weekly flow/load variations
2. **Seed Sludge Quality**: Source seed sludge from stable, healthy treatment plant; quarantine for screening of inhibitory substances
3. **Gradual Startup**: Ramp influent flow from 25% to 100% over 2-3 weeks; avoid shocking biology
4. **Daily Monitoring**: Record process parameters daily (DO, MLSS, F/M, SVI) for first month to detect early upsets
5. **Bulking Prevention**: Maintain F/M ratio in design band; monitor SVI daily; control low DO and filamentous growth
6. **Effluent Quality Variability**: Expect 20-30% variation in first 2 weeks; document baseline before normal operation claim
7. **Operator Presence**: Ensure experienced operator on-site during startup and first weeks of operation
8. **Safety Equipment**: Provide confined space entry equipment, rescue harness, gas detector, and trained rescue team
9. **Odor Control**: Monitor odor complaints immediately; identify cause (overloading, DO depletion, hydrogen sulfide production)
10. **Sludge Handling**: Establish waste sludge disposal method before startup; verify capacity and regulatory compliance
11. **Maintenance Alignment**: Schedule preventive maintenance after system stabilizes; align with seasonal variations if applicable
12. **Instrument Calibration**: Establish quarterly calibration program for all instrumentation to maintain accuracy

---

## Reference Documents

- A-3.04.00069 GEPP-BKN2-M3-ITP-001 REV.3 ITP for Waste Water Treatment System (Status B)
- A-3.04.00065 GEPP-BKN2-M3-ITP-001 REV.2 Inspection and Test Plan for WWTP (Status C)
- A-3.04.00034 GEPP-BKN2-M3-ITP-001 ITP Water Treatment Plant System (Status C)
- A-3.04.00059 GEPP-BKN2-M3-ITP-001 ITP for Waste Water Treatment Plant System (Status C)
