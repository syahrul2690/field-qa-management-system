# Water Treatment Plant (WTP) — Inspection & Test Plan Knowledge Base

*Consolidated from Multiple ITP Documents*  
*Last Updated: April 13, 2026*

---

## Overview & Scope

This knowledge base consolidates Inspection and Test Plan (ITP) procedures for Water Treatment Plant systems serving power generation facilities. The WTP ITP covers equipment fabrication, assembly, shop testing, field installation, and operational commissioning.

### Applicable Project Documents
- A-3.04.00064: ITP Water Treatment Plant (Status A - REV.4)
- A-3.04.00009: Shop ITP for WTP (Status B - REV.3)
- A-3.04.00033: ITP Water Treatment Plant System (Status C)
- A-3.04.00058: ITP Water Treatment System (Status C)

### System Scope
Water Treatment Plant systems include:
- Clarification and settling tanks
- Multi-media filtration units
- Ion exchange or membrane treatment systems
- Chemical dosing and metering equipment
- UV or chlorination disinfection systems
- Storage and distribution piping
- Associated instrumentation and controls
- Electrical and hydraulic auxiliary systems

---

## Shop Inspection Activities

Shop activities verify component quality and proper assembly before delivery to site.

### Material & Equipment Verification
- Pressure vessel design code compliance (ASME, PED, or equivalent)
- Material test certificates (MTCs) for all construction materials
- Hydrostatic pressure testing of pressure vessels (1.5× design pressure minimum)
- Surface treatment and protective coating verification
- Equipment nameplate and data verification against purchase specifications

### Component Assembly & Testing
- Correct assembly of multi-stage filtration media (size gradation, density)
- Valve body leakage testing at rated pressures
- Pump performance curve verification (flow, head, power consumption)
- Motor and electrical equipment insulation testing
- Control system and instrumentation functional testing
- Pressure relief valve setting and calibration

### Treatment System Testing
- **Filter Units**: Backwash valve operation, media level verification, flow distribution uniformity
- **Ion Exchange**: Resin loading density, backwash capability, control logic verification
- **Membrane Systems**: Integrity testing, pressure relief operation, flux rate verification
- **Chemical Injection**: Proportioner calibration, injection rate verification, line flushing
- **Disinfection**: UV lamp output verification or chlorine residual testing capability

### Factory Acceptance Testing (FAT)
- Full system operational test with water circulation or test liquid
- Treatment efficiency verification with specified test water quality
- Flow rate and pressure performance confirmation
- All safety shutdown and emergency stop circuits functional
- Data logging and control system recording capabilities
- Performance documentation with test water analysis results

---

## Field/Site Installation Inspection Activities

Field activities verify correct installation and system integration with project infrastructure.

### Installation Site Preparation
- Foundation condition verification (level, compaction, bearing capacity)
- Utility connections confirmed (water supply, discharge, electrical, air)
- Ambient condition suitability (temperature, ventilation, drainage)
- Installation area cleanliness for water system components
- Preliminary cleaning and flushing of supply and discharge lines

### Equipment Installation Verification
- Equipment positioning and final leveling confirmation
- Mechanical connection quality (bolts torqued per specification)
- Flexible line routing and support (no sharp bends, proper anchoring)
- Pressure gauge installation with isolating valves
- Sampling points accessible and properly identified
- Electrical connections per approved electrical drawings
- Control sensor placement and calibration per design

### System Pressure Testing & Flushing
- **Water Supply Test**: Flush raw water lines and verify water quality
- **Pressure Test**: All piping tested at design pressure (1.5× or per specification)
- **Backwash/Rinse Test**: Circulation and backwash flow rates measured and verified
- **Media Condition**: Verify filter media remains in place and undisturbed
- **Discharge Flushing**: Flush discharge lines until clear and sediment-free
- **Documentation**: Record test pressures, flow rates, durations, and any discrepancies

### Control System Integration
- SCADA/BMS communication verified
- Sensor readings (pressure, flow, conductivity, pH) verified and displayed correctly
- Alarm and shutdown logic tested (high/low pressure, high temperature, etc.)
- Data logging and archiving functionality confirmed
- Emergency shutdown circuits tested at multiple locations
- Manual bypass or emergency mode operation verified

---

## Functional & Commissioning Tests

Final system tests verify the WTP operates safely and meets design water quality objectives.

### Startup & Initial Operation
- Gradual startup with low flow to stabilize media and resin beds
- Pressure and flow parameter observation and recording
- Visual inspection for leaks, proper drainage, and operational anomalies
- Temperature monitoring for normal operating range
- Vibration and noise assessment

### Treatment Performance Tests
- **Raw Water Quality Analysis**: Turbidity, suspended solids, hardness, iron, manganese, chloride, pH
- **Treated Water Quality**: Analysis at standardized intervals (hourly, daily) to confirm treatment targets
- **Turbidity Removal**: Target <1 NTU (or per specification) after filtration
- **Ion Exchange Performance**: Hardness reduction to design specification (typically <10 mg/L as CaCO₃)
- **Membrane System**: Permeate flux, salt rejection rate, membrane differential pressure
- **Disinfection Residual**: Free chlorine residual 0.2-0.5 mg/L or UV dose verification

### Backwash & Regeneration Cycles
- Automatic backwash cycle initiation and timing verification
- Backwash flow rates and duration measured and recorded
- Filter media resettling and condition after backwash
- Waste water disposal and environmental compliance
- Regeneration salt or chemical brine preparation and consumption
- Resin or membrane regeneration effectiveness

### System Loading & Stress Testing
- **Sustained Operation**: 24-hour continuous operation minimum, no shutdowns
- **Flow Rate Variations**: Test at 80%, 100%, and 120% of design flow rates
- **Pressure Cycling**: Monitor pressure drop across filters during loading
- **Emergency Conditions**: Simulate loss of supply, loss of power, manual override testing
- **Shutdown & Restart**: Multiple full shutdown/restart cycles without anomalies
- **Documentation**: Continuous data recording of all operating parameters

### Staff Training & Handover
- Operating staff trained in normal startup, operation, and shutdown procedures
- Emergency procedures and safety protocols understood and demonstrated
- Maintenance procedures (backwash, regeneration, filter inspection) completed with staff
- Spare parts inventory reviewed and documented
- Equipment documentation package compiled and handed over

---

## Hold Points & Witness Points

### Hold Points (H) — Must Be Approved Before Proceeding

**H1** - All material test certificates and pressure vessel design documentation reviewed and approved

**H2** - Factory Acceptance Test completion with all test results approved by Owner/Consultant

**H3** - Pressure test of field installed piping and equipment completed with zero leakage acceptance

**H4** - Water supply flushing and quality verification prior to treatment system startup

**H5** - Control system integration test with SCADA/BMS communication verified and approved

**H6** - Raw water quality baseline analysis completed and documented

**H7** - Treated water quality meets design specification continuously for minimum 72 hours of operation

**H8** - Staff training completion documented with competency sign-off

**H9** - Final system performance test approved and equipment released to Owner

### Witness Points (W) — Owner/Consultant Observation Required

**W1** - Factory pressure vessel testing and material certification review

**W2** - Factory Acceptance Test (FAT) of complete system with performance verification

**W3** - Field equipment installation positioning and mechanical assembly

**W4** - System pressure testing and flushing results recording

**W5** - Control system sensor installation and calibration verification

**W6** - Initial system startup and first 8 hours of operation

**W7** - Raw water quality analysis results

**W8** - Treated water quality measurements and comparison with targets

**W9** - Backwash/regeneration cycle operation and waste water disposal

**W10** - Staff training demonstration and competency assessment

---

## Critical Test Parameters & Acceptance Criteria

### Pressure Testing Parameters
- **Design Pressure**: Per system specification (typically 2.5-10 bar for WTP systems)
- **Test Pressure**: 1.5× design pressure minimum (4-15 bar range typical)
- **Hold Duration**: Minimum 30 minutes at test pressure
- **Leakage Acceptance**: Zero visible leakage; pressure drop not exceeding 0.2 bar in 30 minutes
- **Test Medium**: Treated water or potable water; oil/hydraulic fluid not acceptable for potable water systems

### Flow Rate Verification
- **Design Flow Rate**: Specified capacity in m³/h (typical range 100-500 m³/h)
- **Measurement Method**: Calibrated flow meter or volumetric collection method
- **Accuracy**: Measured flow within ±5% of design specification
- **Multiple Points**: Verify flow at inlet, post-filter, and discharge

### Raw Water Quality Parameters (Typical Targets)
- **Turbidity**: <50 NTU for conventional treatment (max 100 NTU for some systems)
- **Suspended Solids**: <100 mg/L
- **Total Hardness**: <200 mg/L as CaCO₃
- **Iron (Fe)**: <5 mg/L
- **Manganese (Mn)**: <1 mg/L
- **Chloride**: <250 mg/L
- **pH Range**: 6.5-8.5 for coagulation optimization

### Treated Water Quality Acceptance Criteria
- **Turbidity**: <1 NTU (ASTM 2130 Method A); some applications require <0.1 NTU
- **Total Hardness**: <10 mg/L as CaCO₃ (for ion exchange treated systems)
- **Iron (Fe)**: <0.05 mg/L
- **Manganese (Mn)**: <0.01 mg/L
- **pH Range**: 7.0-8.5 (optimized for boiler feed water)
- **Conductivity**: <50 µS/cm for demineralized water
- **Free Chlorine**: 0.2-0.5 mg/L (if chlorination used)
- **Microbial Count**: <100 CFU/mL (per system requirement)

### System Operating Parameters
- **Operating Pressure**: Within 80-110% of design operating pressure
- **Flow Pressure Drop**: Not to exceed design specification (typically 0.5-2 bar across filters)
- **Backwash Flow**: Typically 50-100% above normal operating flow for media expansion
- **Backwash Duration**: Minimum 5-10 minutes or until discharge water is clear
- **Regeneration Brine Concentration**: Resin systems typically 8-10% NaCl solution
- **Operating Temperature**: 5-40°C ambient; internal temperature per equipment rating

### Performance & Efficiency Metrics
- **Filtration Rate**: Linear velocity 5-10 m/h for gravity filters; higher for pressurized units
- **Run Length**: Hours between backwash cycles (typically 4-24 hours depending on turbidity)
- **Regeneration Frequency**: Ion exchange every 24-96 hours depending on hardness
- **Membrane Flux**: 10-30 m³/m²/day for ultrafiltration (varies by membrane type)
- **Recovery Rate**: Reverse osmosis systems typically 40-60% permeate recovery
- **Energy Consumption**: Per system specification (typically 0.5-2 kWh per 1000 L)

---

## Inspection Responsibility Matrix

| Activity | Contractor | Consultant | Owner | Reference |
|----------|-----------|-----------|-------|-----------|
| Material Certification | Provide | Review/Approve | Monitor | MTR/CMC |
| Shop Pressure Test | Execute | Witness | Approve | Test Report |
| FAT Execution | Execute | Witness | Approve | FAT Report |
| Site Installation | Execute | Inspect | Monitor | Drawings |
| Pressure Test Field | Execute | Witness | Approve | Test Report |
| System Flushing | Execute | Observe | Verify | Log/Photos |
| Control Integration | Execute | Test/Witness | Approve | Test Log |
| Raw Water Analysis | Contractor/Owner | Review | Execute | Lab Report |
| Treated Water Testing | Contractor/Owner | Review | Execute | Test Data |
| Performance Verification | Execute | Observe | Approve | Report |
| Staff Training | Contractor | Observe | Attend | Training Log |
| System Handover | Compile | Review | Accept | Sign-Off |

---

## Applicable Standards & Codes

- **ASME B&PV Code Section VIII**: Pressure Vessel Design and Construction
- **PED 2014/68/EU**: Pressure Equipment Directive (if applicable)
- **ISO 7346-1**: Waterworks Equipment Inspection and Testing
- **AWWA Standards**: American Water Works Association
  - AWWA B100: American National Standard for Water Systems
  - AWWA D100: Welded Carbon Steel Tanks for Water Storage
  - AWWA D103: Factory Coated Bolted Steel Tanks for Water Storage
- **EPA 40 CFR 141**: Drinking Water Standards (if applicable)
- **IEC 60204-1**: Electrical Safety of Industrial Machines
- **ISO 5817**: Welding Defects Classification
- **ASTM D1141**: Seawater Substitute Preparation (if applicable)
- **Project Specifications**: Equipment datasheets and design drawings
- **Local Water Authority Standards**: Project-specific requirements

---

## Key Documentation & Deliverables

### Pre-Installation Documents
- Design basis and flow/pressure calculations
- Detailed P&IDs with all control logic
- Equipment datasheets and technical specifications
- Material test certificates and welding records
- FAT reports with performance data
- Shipping and handling documentation

### Installation & Testing Records
- Field pressure test certificates with witness signatures
- Raw water quality baseline data (minimum 7 days)
- Treated water quality test results (daily, minimum 14 days continuous operation)
- Control system integration test logs and verification checklist
- Staff training attendance records and competency assessments
- As-built P&IDs and equipment location drawings
- Spare parts inventory list and storage location

### Handover Documentation
- Operations & Maintenance Manual with system description and procedures
- Troubleshooting guide for common conditions
- Preventive maintenance schedule and tasks
- Equipment warranty and service contact information
- Performance baseline report with design versus actual comparison
- Sign-off documentation from all stakeholders

---

## Critical Lessons & Best Practices

1. **Pre-installation Water Quality**: Verify raw water supply meets design assumptions 30 days before system startup
2. **Slow Startup**: Run new treatment systems at 50% flow for first 24 hours to stabilize media beds
3. **Backwash Records**: Log filter differential pressure and backwash frequency to detect premature media fouling
4. **Staff Competency**: Train staff on both normal operation and emergency procedures; conduct refresher training annually
5. **Water Quality Sampling**: Establish routine monitoring program (daily initially, then per established schedule)
6. **Documentation Update**: Maintain as-built drawings with actual equipment locations, sensor placements, and settings
7. **Spare Parts Stock**: Maintain adequate inventory of high-wear items (filter media, resin, membranes, valves, gaskets)
8. **Performance Trending**: Track treated water quality metrics to identify degradation before limit exceedance
9. **Calibration Program**: Annual calibration of pressure gauges, flow meters, and field test equipment
10. **Environmental Compliance**: Document backwash wastewater disposal method and any required treatment

---

## Reference Documents

- A-3.04.00064 GEPP-BKN2-M2-ITP-001 REV.4 Inspection and Test Plan Water Treatment Plan (WTP) (Status A)
- A-3.04.00009 GEPP-BKN2-M2-ITP-001 REV.3 Shop ITP for WTP (Status B)
- A-3.04.00033 GEPP-BKN2-M2-ITP-001 ITP Water Treatment Plant System (Status C)
- A-3.04.00058 GEPP-BKN2-M2-ITP-001 ITP Water Treatment System (Status C)
