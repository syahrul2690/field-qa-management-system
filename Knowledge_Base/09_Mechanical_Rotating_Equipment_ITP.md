# Rotating Equipment (Pump & Compressor) — Inspection & Test Plan Knowledge Base

*Consolidated from Multiple ITP Documents*  
*Last Updated: April 13, 2026*

---

## Overview & Scope

This knowledge base consolidates Inspection and Test Plan (ITP) procedures for rotating equipment in power generation plant installations. The ITP encompasses centrifugal pumps, positive displacement pumps, compressors, turbines, and associated rotating machinery used in water systems, cooling systems, steam systems, and auxiliary equipment.

### Applicable Project Documents
- A-3.04.00010: ITP For Rotating Equipment (Pump & Compressor) (Status B)
- A-3.04.00031: Field ITP for Rotating Equipment Installation (Status C - REV.1)
- A-3.04.00096: ITP For Rotating Equipment

### Equipment Scope
Rotating equipment includes:
- Centrifugal pumps (single-stage and multi-stage)
- Positive displacement pumps (gear, screw, vane)
- Reciprocating compressors and screw compressors
- Electric motors and motor-pump units
- Turbine-driven equipment
- Gearboxes and speed-change equipment
- Coupled shafts and flexible couplings
- Shaft seals and bearing assemblies
- Instrumentation (pressure, temperature, vibration)

---

## Shop Inspection Activities

Shop activities verify equipment quality, proper assembly, and functionality before shipment to project site.

### Material & Component Verification
- Component materials meet design specification (carbon steel, stainless steel, cast iron grades)
- Material test certificates (MTCs) for all pressure-containing components
- Dimensional inspection of castings and fabricated components against design
- Surface finish and corrosion protection verification per specification
- Bearing condition and preload verification
- Seal assembly integrity and material compatibility with process fluid

### Mechanical Assembly & Testing
- **Rotor Assembly**: Proper alignment, secure blade/impeller attachment, no runout
- **Bearing Installation**: Correct bearing type, preload, and installation per specification
- **Coupling Alignment**: Flexible coupling installed with proper clearance and alignment
- **Seal Installation**: Mechanical seal or packing properly installed and pressure-tested
- **Lubrication System**: Oil level verification, oil quality analysis (cleanliness, viscosity)
- **Balance Status**: Verification that rotating components are balanced to ISO 20816 standard

### Performance Testing
- **Pump Testing**:
  - Flow rate measurement at specified head (usually three points: 75%, 100%, 110% of rated flow)
  - Discharge pressure and differential pressure measurement
  - Efficiency calculation (hydraulic power / input power)
  - Motor current draw at each test point (should not exceed nameplate FLA)
  - Suction pressure/vacuum measurement and cavitation margin verification
  - Bearing and seal temperature monitoring during test

- **Compressor Testing**:
  - Discharge pressure at rated flow rate
  - Discharge temperature monitoring for normal operation
  - Motor current draw and power consumption
  - Vibration levels at each bearing location (per ISO 20816 or API 670)
  - Oil temperature and condition (if oil-flooded design)
  - Cooling capacity (if cooled unit)

### Instrumentation & Controls Verification
- Pressure transmitter outputs verified (0-4 mA or 0-10 V)
- Temperature transmitter calibration and response verification
- Vibration sensor (accelerometer) installation and response
- Flow meter (if equipped) calibration and linearity verification
- Level switch and continuous level transmitter functionality
- Emergency shutdown (ESD) interlock testing (over-speed, over-pressure, high temperature, high vibration)

### Factory Acceptance Testing (FAT)
- Complete equipment operation at design conditions for minimum 2 hours continuous
- All performance parameters within specification (±5% typical allowance)
- Bearing and seal temperatures within normal operating range
- Vibration levels acceptable per ISO 20816 standard
- No abnormal noise, odor, or operational anomalies
- Data logging and trending capability verified
- Documentation package completeness

---

## Field/Site Installation Inspection Activities

Field activities verify proper installation and integration with project infrastructure.

### Pre-Installation Preparation
- Equipment receipt inspection for shipping damage
- Equipment identification verification (nameplate, serial number, ratings)
- Storage conditions adequate (temperature 5-40°C, humidity <95%, protection from rain)
- Installation area cleanliness and space confirmation per specification
- Foundation preparation complete and verified per drawings

### Foundation & Base Installation
- **Foundation Casting/Plate**: Level verification (typically ±1 mm over 1 meter length)
- **Anchor Bolts**: Torqued to specification and safety-wired per design
- **Grout Placement**: Epoxy or concrete grout placed under equipment base; strength verified before machinery weight
- **Vibration Isolation**: Elastomer or spring isolation mounts installed if specified
- **Final Leveling**: Dial indicators verify final equipment levelness (typically ±0.5 mm over equipment length)

### Mechanical Installation
- **Shaft Coupling**: Flexible coupling installed with proper alignment (usually <0.05 mm runout)
- **Alignment Verification**: Laser alignment or dial indicator method used; alignment within tolerance before operation
- **Piping Connections**: Suction and discharge piping installed per design P&IDs
  - Suction piping: low velocities (typically <1.2 m/s), minimum elbows, no high points
  - Discharge piping: properly routed, no unsupported spans, flexible connections to absorb vibration
- **Suction Strainer**: Installed on suction line; pressure drop indicator or blockage indicator functional
- **Check Valves & Relief Valves**: Installed per design; relief valve setting verified
- **Pressure Test**: Complete system hydrostatic test at 1.5× design pressure (or per specification)
- **Flushing**: Suction and discharge lines flushed until clear (typically ISO cleanliness level 16/14/11 or better)

### Electrical Installation
- **Motor Connection**: Three-phase power supply confirmed and voltage verified within ±10% nameplate rating
- **Motor Rotation Direction**: Verified as correct per equipment design (typically CW or CCW as marked)
- **Cable Sizing**: Verified per design and electrical code (typically 125% of FLA for feeder)
- **Grounding**: Equipment grounding resistance verified (<1 Ω per code)
- **VFD Installation** (if applicable): Verified operational and communication with control system
- **Starter Installation**: Motor starter verified for correct nameplate ratings and coordination
- **Instrumentation Wiring**: All sensor and control wiring terminated and continuity verified

### Control System Integration
- Pressure transducer installation and calibration (typically ±1% of full-scale)
- Temperature transmitter installation and calibration (typically ±1°C)
- Vibration sensor mounting (location, orientation, frequency response) per specification
- Signal wiring tested for continuity and insulation resistance (>1 MΩ)
- All transmitter outputs verified (0-4 mA or 0-10 V across measurement range)
- Digital inputs (flow switch, temperature switch) tested for correct circuit closure
- Digital outputs (pump start/stop, motor control) tested for correct voltage and current capability
- Control system integration test: all signals received in SCADA/BMS and displaying correctly

### Lubrication System Setup
- **Oil Supply**: Correct oil grade installed (type and ISO viscosity grade per design)
- **Oil Level**: Verified at proper level on sight glass or dipstick
- **Oil Cleanliness**: Sampled and analyzed (typically ISO 16/14/11 or better)
- **Lubrication Circuits**: Pathways clear; coolers operational if applicable
- **Temperature Control**: Thermostatic valve adjusted; temperature gauge installed
- **Filtration**: Oil filter condition verified; bypass valve operational
- **Drain & Fill System**: Accessible and properly labeled

---

## Functional & Commissioning Tests

Final tests verify rotating equipment operates safely and meets performance requirements.

### Pre-Startup Checks
- **No-Load Rotation**: Equipment rotated by hand (or low-speed drive) to verify free rotation without binding
- **Coupling Inspection**: Flexible coupling condition verified; no visible damage or separation
- **Visual Inspection**: All connections tight, protective covers installed, debris cleared
- **Instrument Check**: All gauges and indicators reading zero or normal standby condition

### Cold Startup Test
- **Motor Startup**: Controlled startup at reduced voltage or soft-starter (if equipped)
- **Bearing Temperature**: Monitor for 15 minutes; should stabilize within 10-15°C of ambient
- **Vibration Level**: Baseline vibration measured per ISO 20816; should be low at low speed
- **Oil Pressure**: Verify adequate oil supply pressure (typically 1-5 bar minimum)
- **Seal Leakage**: Observe seal area for minor weeping (0-2 drops per minute acceptable); excessive leakage unacceptable
- **Running Sound**: Listen for normal operating sound; report any grinding, squealing, or abnormal noise
- **Current Draw**: Verify motor current draw <nameplate FLA at no-load condition

### Warm-Up Operation
- **Gradual Load Increase**: Increase system flow or pressure gradually over 30-60 minutes
- **Temperature Monitoring**: Bearing and seal temperatures continue rising; should stabilize at normal operating temperature
- **Pressure Verification**: System pressures rise to design operating range
- **Vibration Monitoring**: Continuous vibration monitoring; trend data recorded
- **Parameter Logging**: All process parameters logged for reference

### Full Load Performance Test
- **Flow Rate Measurement**: At design pressure/head; flow verified within ±5% of specification
- **Pressure Verification**: Discharge pressure within ±5% of design specification
- **Temperature**: Bearing temperatures stabilize within normal operating range (typically 60-80°C for oil-lubricated bearings)
- **Vibration**: Measured per ISO 20816; severity classification (typically Zone A acceptable)
- **Efficiency**: Power input and output measured; efficiency within ±5% of design guarantee
- **Motor Current**: Draw verified; typically 80-100% of nameplate FLA at full load
- **Seal Performance**: Seal leakage acceptable (0-5 drops per minute typical); no spraying or excessive weeping
- **Cooling**: Cooler (if present) maintaining discharge temperature within range

### Sustained Operation Test
- **24-Hour Continuous Operation**: Equipment operates at design conditions for minimum 24 hours
- **Parameter Trends**: Continuous logging of pressure, temperature, flow, vibration, current
- **No Unplanned Shutdowns**: Equipment does not trip alarms or automatic shutdown circuits
- **Data Stability**: Performance parameters remain stable (±10% variation acceptable)
- **Visual Inspection**: No visible leaks, abnormal wear, or degradation observed during test

### Emergency Shutdown Testing
- **Over-Pressure Shutdown**: Relief valve set point verified; equipment shuts down safely above setpoint
- **High Temperature Shutdown**: Temperature switch (if equipped) tested; equipment shuts down at alarm setpoint
- **High Vibration Shutdown**: Vibration alarm trigger verified (if equipment equipped with vibration monitoring)
- **Over-Speed Protection**: Over-speed governor tested (if applicable to turbine-driven equipment)
- **Power Loss Restart**: Equipment automatically restarts upon power restoration (if control logic allows)

### Instrumentation Verification
- **Pressure Gauge**: Hand pump verification against digital transmitter output; readings within ±1%
- **Temperature Indicator**: Thermometer comparison against transmitter reading; agreement within ±1°C
- **Vibration Trending**: Baseline vibration data recorded for future comparison
- **Efficiency Verification**: Input power (kW) and output hydraulic power (kW) calculated; efficiency within ±5% of design
- **Acoustic Baseline**: Sound level measurement at standard distance (typically 1 meter)

### Staff Training
- Operations staff trained on normal startup, operation, shutdown, and emergency procedures
- Maintenance procedures explained: lubrication checks, filter changes, bearing inspection, seal inspection
- Alarm response procedures understood and demonstrated
- Troubleshooting approach explained: diagnosis of common faults (cavitation, bearing failure, seal failure, coupling wear)
- Documentation review: equipment datasheets, performance curves, maintenance schedules understood

---

## Hold Points & Witness Points

### Hold Points (H) — Must Be Approved Before Proceeding

**H1** - All material test certificates and equipment documentation reviewed and approved

**H2** - Factory Acceptance Test completed with all performance criteria met; equipment approved for shipment

**H3** - Equipment receipt inspection completed; no shipping damage; equipment approved for installation

**H4** - Foundation preparation and leveling verified; epoxy grout strength confirmed; approved for equipment placement

**H5** - Mechanical installation and shaft coupling alignment verified; zero interference test passed

**H6** - Pressure test of complete system (piping and equipment) completed with zero leakage; approved for fluid fill

**H7** - Suction and discharge line flushing completed to design cleanliness; approved for equipment flushing

**H8** - Electrical installation and grounding verified; motor rotation direction confirmed; approved for energization

**H9** - Control system integration test completed; all signals verified in SCADA/BMS; approved for startup

**H10** - Pre-startup mechanical check completed: no-load rotation verified smooth, no binding

**H11** - Cold startup test completed; bearing and seal temperatures normal; approved for warm-up operation

**H12** - 24-hour continuous operation test at design conditions completed successfully; no shutdowns; approved for normal operation

**H13** - Staff training completion and competency sign-off documented

**H14** - Final performance test report approved; equipment released to Owner

### Witness Points (W) — Owner/Consultant Observation Required

**W1** - Factory Acceptance Test observation and performance verification

**W2** - Equipment receipt inspection and condition assessment

**W3** - Foundation leveling and equipment final positioning

**W4** - Shaft coupling alignment and tolerance verification

**W5** - System pressure testing and zero-leakage verification

**W6** - Line flushing and cleanliness verification

**W7** - Motor rotation direction verification before energization

**W8** - Control system sensor installation and signal verification

**W9** - Cold startup and bearing/seal temperature monitoring

**W10** - Warm-up operation and gradual load ramp-up

**W11** - Full-load performance test with all parameters monitored

**W12** - 24-hour continuous operation and parameter stability verification

**W13** - Emergency shutdown circuit testing

**W14** - Staff training demonstration and final walk-through

---

## Critical Test Parameters & Acceptance Criteria

### Pump Performance Parameters
- **Rated Flow Rate**: Specified in m³/h (typical range 10-500 m³/h for industrial pumps)
- **Rated Head**: Specified in meters or bar (typical range 10-500 m for centrifugal pumps)
- **Design Operating Point**: Flow, head, and efficiency at rated conditions
- **Suction Conditions**: Inlet pressure or NPSH (Net Positive Suction Head) requirement (typical NPSH 0.5-2.0 m)
- **Discharge Pressure**: Design pressure (typical range 2.5-25 bar for industrial pumps)
- **Temperature Rise**: Across pump (ΔT) typical 5-10°C depending on duty
- **Motor Power**: Rated power in kW; motor FLA typically 80-100% at design point

### Acceptance Criteria for Pump Testing
- **Flow Rate**: Within ±5% of design specification at rated head
- **Head/Pressure**: Within ±5% of design specification at rated flow
- **Efficiency**: Within ±5% of design guarantee (or per specification)
- **Bearing Temperature**: <80°C during 1-hour continuous test (typical; may vary by bearing type)
- **Seal Leakage**: <5 drops/minute typical; zero leakage preferred (mechanical seals); some leakage expected for packed glands
- **Vibration**: Per ISO 20816-3 Zone A acceptable; <4.5 mm/s RMS typical for pumps
- **Motor Current**: At rated point, within ±10% of predicted value based on efficiency test
- **NPSH Margin**: NPSH available should exceed NPSH required by minimum 0.5 m for cavitation-free operation

### Compressor Performance Parameters
- **Rated Displacement**: Specified in m³/min or m³/h at rated speed
- **Discharge Pressure**: Design discharge pressure (typical range 5-25 bar for industrial compressors)
- **Discharge Temperature**: Design discharge temperature (typical range 80-120°C depending on duty)
- **Drive Motor Power**: Rated power in kW; actual power draw at design conditions
- **Cooling System**: Cooler capacity (if equipped) to maintain discharge temperature within range
- **Lubrication**: Oil type and ISO viscosity grade; oil cooler setpoint

### Acceptance Criteria for Compressor Testing
- **Discharge Pressure**: Within ±5% of design pressure at rated displacement and speed
- **Discharge Temperature**: Within ±5°C of design temperature (or per specification)
- **Motor Current**: At design point, within ±10% of nameplate FLA
- **Vibration**: Per ISO 20816-3 Zone A acceptable; <4.5 mm/s RMS typical
- **Oil Temperature**: Maintained within design range (typically 50-70°C)
- **Cooler Performance**: Outlet temperature within specification setpoint (±2°C)
- **Capacity**: Actual displacement within ±5% of design displacement
- **Energy Efficiency**: Power consumption typical for design and can be benchmarked against similar equipment

### Bearing & Seal Parameters
- **Bearing Temperature**: Should stabilize within 10-15°C above ambient in steady state operation
- **Seal Leakage**: Mechanical seal 0-2 drops/minute; packed gland 0-10 drops/minute; excessive leakage is cause for replacement
- **Lubrication Flow**: Adequate supply pressure (typically 1-5 bar) for oil-lubricated bearings; no starvation
- **Bearing Play**: No detectable radial movement at bearing location; typical clearance <0.5 mm per bearing size
- **Sound Signature**: Normal bearing sound; grinding or squealing indicates imminent bearing failure

### Shaft Coupling & Alignment
- **Coupling Runout**: Measured coupling runout <0.05 mm total radial at coupling face (TIR)
- **Angular Misalignment**: <0.5° typical for flexible couplings; zero preferred for rigid couplings
- **Parallel Offset**: <0.5 mm typical; measured at coupling hubs
- **Axial Movement**: No axial movement during rotation; thrust bearing carries axial loads
- **Coupling Condition**: No visible wear, cracking, or elastomer deterioration

### Vibration Acceptance Criteria (ISO 20816-3)
- **Zone A** (Good): Vibration <4.5 mm/s RMS; newly commissioned equipment
- **Zone B** (Acceptable): Vibration 4.5-7.1 mm/s RMS; normal operation acceptable
- **Zone C** (Just Tolerable): Vibration 7.1-11.2 mm/s RMS; continue operation; schedule maintenance
- **Zone D** (Unacceptable): Vibration >11.2 mm/s RMS; immediately stop equipment; investigate root cause

---

## Inspection Responsibility Matrix

| Activity | Contractor | Consultant | Owner | Reference |
|----------|-----------|-----------|-------|-----------|
| Material Certification | Provide | Review/Approve | Monitor | MTR/CMC |
| Shop FAT | Execute | Witness | Approve | FAT Report |
| Equipment Shipment | Execute | Monitor | Verify | Receipt Insp |
| Receipt Inspection | Execute | Monitor | Verify | Condition Report |
| Foundation Prep | Execute | Inspect | Monitor | Drawings |
| Equipment Installation | Execute | Inspect | Monitor | Drawings |
| Alignment Verification | Execute | Witness | Approve | Laser Report |
| Pressure Testing | Execute | Witness | Approve | Test Report |
| Electrical Installation | Execute | Inspect | Monitor | Drawings |
| Control Integration | Execute | Test/Witness | Approve | Test Log |
| Pre-Startup Checks | Execute/Owner | Observe | Participate | Checklist |
| Cold Startup | Operator | Observe | Participate | Log |
| Performance Test | Operator/Contractor | Witness | Verify | Test Report |
| Staff Training | Contractor | Observe | Attend | Training Log |
| System Handover | Compile | Review | Accept | Sign-Off |

---

## Applicable Standards & Codes

- **ISO 20816 Series**: Vibration Severity Classification and Acceptance
  - ISO 20816-1: Machines with nominal power >15 kW and nominal speeds 120-15,000 RPM (Flexible Support)
  - ISO 20816-3: Industrial machines with nominal power >15 kW and nominal speeds 120-15,000 RPM (Rigid Support)
  - ISO 20816-5: Rotating machinery with nominal power >15 kW and nominal speeds 15,000-75,000 RPM
- **API 670**: Machinery Protection Systems
- **API 610**: Centrifugal Pumps for Petroleum, Heavy-Duty Chemical, and Gas Industry Services
- **API 672**: Centrifugal Pumps for General Refinery Services
- **ANSI/HI 9.6.1**: Centrifugal Pump Test Procedures
- **ASME B&PV Code Section VIII**: Pressure Vessel Design (for pump cases, compressor cylinders)
- **IEC 60204-1**: Electrical Safety of Industrial Machines
- **ISO 10816 Series**: Mechanical Vibration Evaluation
- **ISO 5817**: Welding Defects Classification
- **ASTM Standards**:
  - ASTM D4378: Mineral Oil-Based Hydraulic Fluids for Industrial Equipment
  - ASTM D6595: Polyalphaolefin (PAO) Hydraulic Fluids
- **IEEE 45**: IEEE Standard for Electrical Installations on Shipboard (motor grounding/protection)
- **NFPA 79**: Electrical Standard for Industrial Machinery
- **Project Specifications**: Equipment datasheets, performance guarantees, and design basis

---

## Key Documentation & Deliverables

### Pre-Installation Documents
- Equipment datasheets with performance curves and rated conditions
- Material test certificates (MTCs) for pressure-containing components
- Factory Acceptance Test report with full performance data
- Installation drawings and mechanical assembly sketches
- P&IDs showing all connections, valves, and instrumentation
- Electrical single-line diagram and motor starter specifications
- Maintenance manual and spare parts list
- Shipping documents and insurance certificates

### Installation & Testing Records
- Receipt inspection photographs and condition report
- Foundation inspection and compaction test results
- Equipment installation photographs (positioning, alignment, connections)
- Laser alignment report or dial indicator alignment data
- Pressure test certificates with witness signatures (zero leakage acceptance)
- Line flushing log and oil/fluid cleanliness analysis (ISO code)
- Electrical continuity and insulation resistance test report
- Motor rotation direction verification (with before/after alignment check)
- Control system integration test log with all signal verification
- Cold startup test log (bearing/seal temperatures, oil pressure, vibration baseline)
- 24-hour continuous operation log with hourly parameter readings
- Performance test report (flow, head/pressure, temperature, power, efficiency)
- Staff training attendance and competency sign-off

### Handover Documentation Package
- As-built P&ID marked with actual equipment settings and sensor placements
- Operations manual with startup, normal operation, shutdown, and emergency procedures
- Maintenance schedule and spare parts inventory with storage location
- Equipment warranty information and service contact details
- Troubleshooting guide for common faults (cavitation, bearing failure, seal leakage, etc.)
- Vibration baseline data for trending comparison
- Performance baseline report (actual vs. design efficiency, flow, head)
- Training records and list of authorized operators
- Spare parts recommended inventory (seals, bearings, couplings, filters, oil)
- Vendor contact information for technical support and spare parts ordering
- Complete inspection and test plan sign-off from all stakeholders

---

## Critical Lessons & Best Practices

1. **Suction Line Design**: Minimize suction line length and fittings; maintain suction velocity <1.2 m/s to avoid cavitation and pressure drop
2. **Pre-Flushing Essential**: Flush all lines to ISO 16/14/11 cleanliness before commissioning; debris is leading cause of pump failure
3. **Baseline Vibration**: Record vibration signature during commissioning for future trending; vibration increase indicates bearing wear or misalignment
4. **Temperature Monitoring**: Track bearing and seal temperatures; rising temperature trend indicates imminent bearing failure
5. **Seal Leakage Monitoring**: Minor leakage (0-2 drops/min) is normal for mechanical seals; excessive leakage requires seal replacement
6. **Coupling Alignment**: Proper alignment critical for bearing life; misalignment >0.5 mm causes rapid bearing wear and shaft breakage
7. **Oil Change Program**: Establish regular oil sampling and analysis program; oil degradation affects bearing life and seal performance
8. **Emergency Procedures**: Test emergency shutdown circuits regularly; ensure operators understand alarm responses
9. **Load Ramp-Up**: After initial startup, gradually increase system load over first 8 hours; allows bearing temperature stabilization
10. **Documentation Retention**: Keep all test reports, performance data, and maintenance records for equipment lifetime
11. **Motor Protection**: Ensure motor overload protection properly sized for equipment soft-starter ramp time
12. **Redundancy Planning**: For critical systems, consider equipment redundancy or backup; single point failures can shut down facility

---

## Reference Documents

- A-3.04.00010 GEPP-BKN2-M0-ITP-001 ITP For Rotating Equipment (Pump & Compressor) (Status B)
- A-3.04.00031 GEPP-BKN2-M0-ITP-001 REV.1 Field ITP for Rotating Equipment Installation (Status C)
- A-3.04.00096 GEPP-BKN2-M0-ITP-001 ITP For Rotating Equipment
