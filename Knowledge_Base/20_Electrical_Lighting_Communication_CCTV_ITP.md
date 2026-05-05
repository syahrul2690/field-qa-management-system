# Electrical Lighting, Communication & CCTV — Inspection & Test Plan Knowledge Base

**Document References:**
- A-3.04.00045 GEPP-BKN2-E-IT-009 ITP Lighting (Status A)
- A-3.04.00056 GEPP-BKN2-E-IT-009 Inspection Test Plan Lighting (Status C)
- A-3.04.000119 GEPP-BKN2-E-IT-011 Rev.0 ITP Electrical Communication (Paging, Telephone) System (C)
- A-3.04.000120 GEPP-BKN2-E-IT-011 Rev.1 ITP Electrical Communication (Paging, Telephone) System (A)
- A-3.04.000118 GEPP-BKN2-E-IT-012 Rev.0 ITP For Close Circuit Television (CCTV) (C)
- A-3.04.000121 GEPP-BKN2-E-IT-012 Rev.1 ITP For Close Circuit Television (CCTV) (A)

---

## Overview & Scope

Lighting, communication, and CCTV systems provide visual safety, operational awareness, and security for electrical utility facilities. This ITP encompasses:

**Lighting Systems:**
- Interior (control rooms, switchgear rooms, battery rooms)
- Exterior/Area (yard, substation, perimeter lighting)
- Emergency lighting & exit signs
- LED and traditional ballast-based fixtures

**Communication Systems:**
- Intercom and paging systems
- Telephone systems (internal/external connections)
- Signal transmission and audio clarity
- System redundancy (if applicable)

**CCTV Security Systems:**
- Fixed and PTZ (pan-tilt-zoom) cameras
- Video surveillance recording systems
- Monitor displays and control stations
- System coverage verification

**Test Phases:**
- Factory acceptance of equipment
- Installation inspection and functionality
- System integration testing
- Operational commissioning

---

## Factory/Shop Acceptance Tests

### Lighting Fixture Inspection

**Hold Point 1: Fixture Type & Specification Verification**

| Parameter | Requirement | Standard |
|---|---|---|
| **Fixture Type** | LED or fluorescent/HID per design | Project specification |
| **Voltage Rating** | 230 V 1-phase (residential/general) or 400 V 3-phase (area) | Nameplate |
| **Power Consumption** | Watts per fixture (e.g., 36 W LED, 70 W HPS) | Manufacturer specification |
| **Color Temperature** | 4000 K (neutral) or 6500 K (daylight) | Project requirement |
| **CRI (Color Rendering Index)** | ≥ 80 typical for utility work areas | Manufacturer data |
| **IP Rating** | IP54 or higher (outdoor fixtures) | Luminaire nameplate |
| **UGR (Unified Glare Rating)** | ≤ 22 (for visual comfort) | Photometric report |
| **Efficacy** | ≥ 80 lumens/watt (LED); ≥ 60 lm/W (fluorescent) | Manufacturer spec |

**Acceptance:** All parameters within specification; fixtures undamaged; ballasts (if applicable) functional.

### LED & Ballast Testing (Factory)

**Hold Point 2: Electrical Function & Output Verification**

**For LED Fixtures:**

| Test | Method | Acceptance |
|---|---|---|
| **Visual Output (Brightness)** | Power on @ rated voltage; observe illumination | Even light distribution; no dark spots |
| **Color Temperature** | Chromaticity measurement @ rated voltage | Within ±200 K of nominal (e.g., 4000 K ±200 K) |
| **Power Draw** | Measure actual power consumption @ rated V | Within ±10% of nameplate |
| **Dimming Function** | If dimmable: test across 10–100% range | Linear response; no flicker above 100 Hz |
| **Thermal Behavior** | Temperature at heat sink / case @ rated power | Stable within 60 seconds; final temp acceptable |
| **Insulation Resistance** | Megohm test @ 500 V DC (ballast/driver) | ≥ 10 MΩ |

**For Fluorescent/HID Fixtures (with Ballast):**

| Test | Method | Acceptance |
|---|---|---|
| **Ballast Function** | Apply rated voltage; observe lamp start | Lamp ignites within 5 seconds |
| **Lamp Brightness** | Measure illuminance @ 1 m distance | ≥ 95% of rated lumen output |
| **Power Factor** | Measure with power analyzer | ≥ 0.9 (efficient ballast) |
| **Harmonic Content** | THD < 20% (electronic ballast) | Low distortion |
| **Flicker Frequency** | Visual observation and frequency measurement | > 1 kHz (imperceptible to human eye) |
| **Insulation Resistance** | Ballast to case insulation | ≥ 10 MΩ @ 500 V DC |

### Emergency Lighting & Exit Signs

**Hold Point 3: Emergency Light Battery & Function**

| Test | Method | Acceptance |
|---|---|---|
| **Battery Voltage** | Measure open-circuit voltage | ≥ 95% of nominal (typically 3.6 V for emergency pack) |
| **Charge State** | Attempt auto-on mode (simulate power loss) | Lamp illuminates immediately |
| **Emergency Run Time** | Measure time from failure to 50% brightness drop | ≥ 90 minutes typical for area lighting |
| **Self-Test Function** | Trigger built-in diagnostic (if available) | LED indicator shows pass/fail |

**Charge Acceptance Criteria:**

```
Battery type: NiCd or Li-ion rechargeable pack
Full charge voltage: 3.6 V (or per battery type)
Acceptable range: 3.4–3.8 V
If < 3.3 V: battery defective; replace
```

---

## Site Installation Inspection

### Lighting System Installation Verification

**Hold Point 4: Lighting Fixture Mechanical Installation**

| Item | Verification | Acceptance |
|---|---|---|
| **Mounting** | Fixtures securely bolted/fastened per plan | No movement when pushed; fasteners tight |
| **Height & Spacing** | Per lighting design layout (typical spacing 3–5 m for interior) | Measured and matches single-line diagram |
| **Alignment** | Fixtures level; directed per design (e.g., downward for ceiling mount) | Light beam pattern as intended |
| **Electrical Connections** | Wired per schematic; phase, neutral, ground correct | No exposed conductors; lugs crimped & insulated |
| **Conduit & Cable** | No sharp bends, supported at ≤ 1.5 m intervals | Cable hangers secure; no strain on connections |
| **Earthing** | Fixture case bonded to ground bus | DC resistance < 0.1 Ω |
| **Labeling** | Circuit ID marked at fixture and breaker | Legible permanent marking |

### Lighting Control System Installation

**Hold Point 5: Lighting Control Circuit Verification**

| Component | Verification | Acceptance |
|---|---|---|
| **Manual Switches** | Location per plan; operation smooth | Switch opens/closes cleanly |
| **Automatic Sensors** | Motion/occupancy sensors installed per spec | Sensor aligned correctly; test range verified |
| **Dimming Controls** | If specified: control module installed & wired | Dimmer adjusts 10–100% smoothly |
| **Emergency Override** | Manual bypass for automatic systems | Override switch operates independent of sensor |
| **Lighting Contactor** | Pilot voltage, coil operation verified | Contacts make/break under load |
| **Photocell (if external)** | Day/night sensor position & sensitivity | Responds to ambient light changes |

### Electrical Supply Verification

**Hold Point 6: Power Supply to Lighting Circuits**

| Test | Method | Acceptance |
|---|---|---|
| **Voltage at Fixture** | Measure phase-neutral voltage at luminaire terminals | 230 V ±10% (207–253 V) for 1-phase; 400 V ±10% for 3-phase |
| **Continuity of Ground** | Megohm from fixture case to main earth | ≥ 1,000 MΩ @ 500 V DC (open circuit acceptable) |
| **Circuit Protection** | Breaker size & type verified per circuit design | Correct amperage rating for cable AWG |
| **Neutral-Ground Separation** | Check for neutral-ground bonding (should be only at main panel) | No bonding at fixtures (prevents stray current) |

---

## Communication Systems Installation

### Communication Equipment Inspection

**Hold Point 7: Communication System Type & Equipment Verification**

**For Intercom/Paging Systems:**

| Parameter | Requirement | Verification |
|---|---|---|
| **Master Station** | Central unit with microphone, controls | Installed in control room or secure location |
| **Slave Stations** | Speaker/microphone units at each area | One per zone (e.g., switchgear room, battery room) |
| **Amplifier/Processor** | Central audio processor with output power | Typically 30–60 W amplifier |
| **Cabling** | Cat5e or Cat6 for digital; balanced audio for analog | Per network design or signal cable spec |
| **Power Supply** | 110 V AC or 48 V DC per system design | Regulated, protected with breaker |

**For Telephone Systems:**

| Parameter | Requirement | Verification |
|---|---|---|
| **PBX (Private Branch Exchange)** | Central switching unit (if on-site) or connection to public carrier | Installed per telecom plan |
| **Telephone Handsets** | ≥ 2 extension phones in facility | One primary + one backup minimum |
| **Trunk Line Connections** | Connection to external PSTN or carrier | Test dial tone present |
| **Backup Battery** | UPS for phone system continuity | ≥ 4 hour runtime |

**Acceptance:** All equipment present, undamaged, connected per wiring diagram.

### Communication Cabling Installation

**Hold Point 8: Communication Cable Routing & Termination**

| Item | Verification | Acceptance |
|---|---|---|
| **Cable Path** | Separated from power cables (≥ 300 mm clearance) | No physical contact with HV/LV power cables |
| **Cable Support** | Clipped at ≤ 1.5 m intervals; secured in conduit | No sagging or strain |
| **Termination Quality** | RJ45 plugs/sockets for Cat5e/Cat6 | Pins correctly ordered (568A or 568B standard) |
| **Cable Shield** | Grounded at one end (power distribution point) | Single-point grounding prevents ground loops |
| **Continuity Test** | All pairs tested with cable tester | All 8 pins make contact; no open/short circuits |
| **Signal Quality** | Crosstalk & attenuation measured | Within spec for cable type & distance |

**RJ45 Pin Order (568B Standard—Preferred for Comms):**

```
Pin 1: White/Orange
Pin 2: Orange
Pin 3: White/Green
Pin 4: Blue
Pin 5: White/Blue
Pin 6: Green
Pin 7: White/Brown
Pin 8: Brown
```

### Communication System Functional Testing

**Hold Point 9: Audio Quality & Signal Path Verification**

**For Paging/Intercom:**

| Test | Method | Acceptance |
|---|---|---|
| **Master to All Slaves** | Broadcast message from master station | All speakers play message; intelligibility acceptable |
| **Slave Back to Master** | Call from remote station to master | Clear two-way audio; no feedback |
| **Audio Level** | Measure at each speaker (sound level meter) | ≥ 75 dB @ 1 m distance (intelligible speech level) |
| **Frequency Response** | Audio quality (speech intelligibility) | 300 Hz – 3 kHz adequate; ≥ 100 Hz – 10 kHz better |
| **Noise Floor** | Background noise level | ≤ 60 dB during silence (ambient noise) |

**For Telephone System:**

| Test | Method | Acceptance |
|---|---|---|
| **Dial Tone** | Pick up handset at each phone | Continuous tone heard; ready to dial |
| **Outgoing Call** | Dial external number (arrange test call) | Connection established; audio quality acceptable |
| **Incoming Call** | Request test call from external line | Phone rings; audio clear |
| **Call Hold** | Test hold/resume function (if available) | Music-on-hold audible; call resumes without disconnect |
| **Speakerphone** | Test hands-free operation (if available) | Two-way audio works in speakerphone mode |

**Audio Quality Assessment (Subjective):**

```
Rating scale (MOS—Mean Opinion Score):
5 = Excellent (no distortion, clear speech, no background noise)
4 = Good (slight distortion/noise but intelligible)
3 = Fair (moderate distortion/noise; speech understandable with effort)
2 = Poor (significant distortion; difficulty understanding)
1 = Bad (unintelligible)

Acceptance minimum: MOS ≥ 3.5 (good quality for operational comms)
```

---

## CCTV System Installation & Testing

### CCTV Camera & Equipment Inspection

**Hold Point 10: Camera Type & Specification Verification**

| Parameter | Requirement | Standard |
|---|---|---|
| **Camera Type** | Fixed or PTZ (pan-tilt-zoom) per design | Project specification |
| **Resolution** | ≥ 1080p (HD) or 4K for critical areas | Typical: 2 MP for general areas, 4–8 MP for recognition |
| **Sensor Type** | CCD or CMOS; progressive scan preferred | CMOS more common in modern systems |
| **Lens** | Fixed focal length (e.g., 4 mm, 8 mm) or varifocal | Per installation location (wide vs. narrow coverage) |
| **Infrared (IR) Capability** | If specified: IR LED array for night vision | Typical range 10–30 m effective distance |
| **IP Rating** | IP66 (outdoor); IP54 (semi-enclosed) | Weather/dust protection |
| **Power Consumption** | Typically 5–12 W per camera | Budgeted for PoE or separate power supply |

**Acceptance:** All cameras present, lens clean/undamaged, power cords intact.

### CCTV Cabling & Network Installation

**Hold Point 11: Camera Cabling & PoE (Power over Ethernet)**

| Item | Verification | Acceptance |
|---|---|---|
| **Cable Type** | Cat5e or Cat6 UTP for PoE (Power over Ethernet) | Per IEEE 802.3af/at standard |
| **Cable Routing** | Run in separate conduit from power cables | ≥ 300 mm horizontal clearance from HV/LV |
| **Termination** | RJ45 connectors, 568B standard | All pins in correct order; tight crimp |
| **PoE Injector** | Power over Ethernet injector module | 30 W (802.3at) typical for 1–4 cameras |
| **Network Switch** | POE-enabled switch or separate injectors | Provides voltage + data on single Cat5e pair |
| **Continuity Test** | All pairs tested; no opens/shorts | Signal quality verified with cable tester |
| **Voltage Supply** | PoE voltage at camera end | 48 V DC nominal (44–57 V acceptable range) |

**PoE Power Distribution (IEEE 802.3at Standard):**

```
Power at source (switch/injector): 48 V DC, max 95.6 W per port
Voltage loss across 100 m Cat5e: ~3–5 V typical
Voltage at camera (100 m run): ~43–45 V DC (still within spec: 44–57 V)
Maximum camera power draw: 90 W per IEEE 802.3bt (High Power PoE) 

Example: 4 cameras @ 12 W each = 48 W total
Single 802.3at injector (max 95 W): Sufficient for 4 cameras
```

### CCTV System Network Configuration

**Hold Point 12: Network Setup & IP Configuration**

| Item | Configuration | Verification |
|---|---|---|
| **Network Switch** | Managed or unmanaged PoE switch | Ping test to all cameras successful |
| **Camera IP Addresses** | Assigned static IPs (e.g., 192.168.1.101–108) | Each camera responds to IP address |
| **Recording System (NVR/DVR)** | Network video recorder or DVR unit | Connected to network; can see all cameras |
| **Video Quality Settings** | Resolution & frame rate per design | Typical: 1080p @ 30 fps; 4 MP @ 15 fps |
| **Storage Capacity** | Hard drive size for retention period | 30-day rolling buffer typical for utilities |
| **Backup Recording** | Secondary NVR or cloud backup | If required for critical facility |
| **Monitor Display** | One or more viewing monitors in control room | Connected to NVR via HDMI or network |

**IP Network Scheme (Example):**

```
Network: 192.168.1.0/24
Gateway: 192.168.1.1 (firewall/router)
Cameras: 192.168.1.101–192.168.1.110 (10 cameras)
NVR: 192.168.1.50
Monitor PC: 192.168.1.51
All devices on isolated VLAN if possible (security best practice)
```

### CCTV Camera Coverage & Image Quality Test

**Hold Point 13: Camera Coverage & Image Quality Verification**

**Coverage Map Verification (Prior to Commissioning):**

| Area | Camera | Coverage | Overlap |
|---|---|---|---|
| **Substation Yard** | Fixed camera @ 5 m height | 95% of yard area visible | 10–15% overlap with adjacent cameras |
| **Switchgear Room** | Fixed 4 mm lens camera | All switchgear panels visible | Full room coverage |
| **Control Room Door** | PTZ camera or fixed wide-angle | Entry door, personnel approach zone | No blind spots |
| **Battery Room** | Fixed camera @ 2 m height | All battery banks visible | Ceiling and floor included |
| **Perimeter Fence** | PTZ or multiple fixed cameras | Entire perimeter visible | Continuous 360° coverage |

**Image Quality Assessment:**

| Metric | Measurement | Acceptance |
|---|---|---|
| **Daytime Illumination** | Lux meter @ camera view | ≥ 100 lux (adequately bright for color) |
| **Nighttime (with IR)** | Visual inspection with IR on | Subjects clearly visible at rated IR distance |
| **Sharpness/Focus** | Visual inspection of live video | Objects at typical viewing distance in focus |
| **Color Accuracy** | Observe color rendering (uniforms, vehicles) | Colors accurate; no color shift |
| **Temporal Stability** | Observe 1-minute continuous video | No flicker, jitter, or frame drops |
| **Glare/Bloom** | If bright light sources visible | Mild bloom acceptable; no saturation artifacts |

**Resolution & Detail Testing (Using Test Pattern or Live Scene):**

```
1080p (2 MP) camera: Can distinguish face details @ ~5 m distance
4 MP camera: Can distinguish face details @ ~10 m distance
8 MP camera: Can distinguish face details @ ~15 m distance

For utility facility: 1080p adequate for most applications
4 MP recommended for access gates / restricted areas (better facial recognition)
```

---

## Commissioning & Functional Tests

### Lighting System Commissioning

**Hold Point 14: Lighting Illuminance & Coverage Verification**

**Interior Lighting (Switchgear, Control Rooms):**

| Room Type | Illuminance Target | Measurement Points | Acceptance |
|---|---|---|---|
| **Control Room** | ≥ 500 lux | Desk surface, display screens | All points ≥ 500 lux; uniform within ±20% |
| **Switchgear Room** | ≥ 300 lux | Breaker face, connections, labels | All points ≥ 300 lux; legible identification |
| **Battery Room** | ≥ 200 lux | Cell tops, warning labels | All points ≥ 200 lux; cells clearly visible |
| **Mechanical Room** | ≥ 150 lux | Work areas, emergency equipment | All points ≥ 150 lux |

**Exterior/Area Lighting (Substation Yard, Perimeter):**

| Area | Illuminance Target | Measurement Points | Acceptance |
|---|---|---|---|
| **General Yard Area** | ≥ 20 lux | Grid points 10 m spacing | All points ≥ 20 lux; uniform (max/min ratio ≤ 3) |
| **Equipment Access Zones** | ≥ 50 lux | Around transformer, switchgear | All access points ≥ 50 lux |
| **Perimeter** | ≥ 10 lux | Along fence line | All points ≥ 10 lux; deterrent lighting effect |
| **Emergency/Hazard Areas** | ≥ 30 lux | Near high-voltage equipment | Adequate for safe egress |

**Measurement Procedure:**

1. Perform measurements after dark (9 PM or later for best results)
2. Use calibrated lux meter (light meter)
3. Place meter at work plane height (0.85 m for desk, ground for yard)
4. Grid points: Minimum 9 points per area (3×3 layout)
5. Record each measurement; calculate average and standard deviation
6. Acceptance: All points ≥ minimum; standard deviation ≤ 20% of average

**Example Calculation (Switchgear Room 5m × 4m):**

```
Fixtures: 2 × 70 W HPS with 3000 lumens each, mounted 3 m high
Test grid: 3×3 points on floor
Measurements (lux):
450 | 520 | 460
480 | 580 | 520
440 | 510 | 470

Average = (450+520+460+480+580+520+440+510+470) / 9 = 502 lux
Min = 440 lux, Max = 580 lux
Std Dev = 46 lux (46/502 = 9% variation)
Acceptance: ✓ PASS (all ≥ 300 lux; uniform ±20%)
```

### Communication System Commissioning

**Hold Point 15: Full System Integration & Audio Quality**

**Paging/Intercom Integration Test:**

| Test Scenario | Procedure | Acceptance |
|---|---|---|
| **All-Call Broadcast** | Master initiates all-call message | All slave speakers activate; message audible in all zones |
| **Zone Call** | Master calls specific area (e.g., battery room) | Only target zone speaker activates |
| **Two-Way Call** | Remote station requests master; conversation | Clear two-way audio; no feedback or echo |
| **Emergency Alert** | Trigger emergency alert (if implemented) | Distinctive tone broadcasts; interrupts normal operation |
| **Off-Peak Silence** | No pages during 22:00–06:00 (if programmed) | System follows schedule |

**Audio Quality Measurement:**

- **Sound Level (SPL):** Measure with sound level meter at 1 m
  - Target: 75–85 dB(A) for intelligible speech
  - Below 70 dB: too quiet; increase amplifier gain
  - Above 95 dB: too loud; risk of hearing damage; reduce gain

- **Intelligibility Test (Subjective):**
  - Have operator broadcast sample message
  - Observer at typical listening position rates clarity
  - MOS ≥ 3.5 required (see earlier scale)

**Telephone System Commissioning:**

| Test | Procedure | Acceptance |
|---|---|---|
| **Internal Calls** | Dial from one phone to another (extension) | Connection established; audio clear |
| **External Calls** | Dial public number (coordinate test call) | Rings externally; connects; audio clear |
| **Call Transfer** | Transfer call between phones | No disconnect; seamless transfer |
| **Emergency Calls** | Dial 999/911/emergency service | Calls go through; location identified (if required) |

---

## CCTV System Commissioning

### CCTV System Startup & Video Quality Verification

**Hold Point 16: Video Recording & Playback Test**

| Test | Procedure | Acceptance |
|---|---|---|
| **Live Video Feed** | View all cameras on monitoring station | All cameras displaying live video; clear image |
| **Recording Initiation** | Trigger recording start (automatic) | NVR records video from all cameras continuously |
| **Timestamp Accuracy** | Verify date/time stamp on recorded video | Timestamp correct and synchronized across cameras |
| **Event Logging** | Configure motion detection or alarm trigger | System logs events with timestamp and camera ID |
| **Playback** | Retrieve recorded video from 1 hour prior | Playback smooth; no corruption; timestamp accurate |
| **Search Function** | Search for events by date/time/camera | Fast retrieval (< 10 seconds for any event) |

**Video Quality Assessment (Live & Recorded):**

```
Visual inspection of monitor display:
- Color accuracy: Objects render with correct colors (no color shift)
- Sharpness: Details legible (faces at specified distance, license plates if applicable)
- Temporal smoothness: Video plays without stuttering (30 fps smooth; 15 fps acceptable for lower-resolution cameras)
- Noise level: Minimal video noise/grain in lit areas
- Dark areas: IR night vision shows subjects clearly (if equipped)

Recorded video should match live video quality; no degradation from compression
```

**Hard Drive Storage Verification:**

```
Formula: Required storage = (bitrate × 3600 seconds × 24 hours × days) / 8 bits/byte

Example: 4 MP camera @ 1080p, 15 fps, H.264 compression
Typical bitrate: 2–4 Mbps per camera
4 cameras × 3 Mbps × 3600 × 24 × 30 days / 8 = ~1.3 TB per month

NVR hard drives: Typical 1–4 TB capacity
30-day retention with 4 cameras: 4 TB hard drive recommended (allows ~30 days rolling buffer)
```

### PTZ Camera Control Test (if applicable)

**Hold Point 17: Pan-Tilt-Zoom Functionality**

| Control | Test Method | Acceptance |
|---|---|---|
| **Pan (Left/Right)** | Command camera to move 90° left, then right | Smooth movement; reaches endpoints without overshoot |
| **Tilt (Up/Down)** | Command camera to move 45° up, then down | Smooth movement; stops at limits |
| **Zoom (In/Out)** | Zoom from wide to maximum magnification | Smooth zoom; image remains in focus at all magnifications |
| **Preset Positions** | Program 3–5 preset positions (e.g., north, south, center) | Recall each preset; camera moves to exact position |
| **Focus Adjustment** | Auto-focus or manual focus verification | Objects at various distances in focus |
| **Speed Adjustment** | Verify pan/tilt speed adjustable (slow to fast) | Multiple speed steps functional |

**Speed Test (Pan):**

```
Pan speed: Measure time to traverse 180° (wide FOV to opposite side)
Fast mode: Should complete in < 5 seconds
Medium mode: ~10 seconds
Slow mode: ~20 seconds (for smooth operator tracking)
```

---

## Inspection Activity Matrix

| Activity | Contractor | Engineer | Owner | Code | Standard |
|---|---|---|---|---|---|
| Lighting fixture inspection (factory) | ✓ | ✓ | — | A | IEC 60081/IEC 60950-1 |
| LED/ballast electrical test (factory) | ✓ | ✓ | — | **A (HOLD)** | IEC 60050/IEC 61000-3 |
| Emergency light battery test (factory) | ✓ | ✓ | — | A | BS 5266-7 |
| Lighting fixture installation | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E-IT-009 |
| Lighting control system installation | ✓ | ✓ | — | A | GEPP-BKN2-E-IT-009 |
| Electrical supply to fixtures | ✓ | ✓ | — | A | IEC 60364 |
| Communication equipment verification | ✓ | ✓ | — | A | GEPP-BKN2-E-IT-011 |
| Communication cabling installation | ✓ | ✓ | — | **A (HOLD)** | EIA/TIA-568 (RJ45 standard) |
| Communication system functional test | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E-IT-011 |
| CCTV camera inspection & mounting | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E-IT-012 |
| CCTV cabling & PoE installation | ✓ | ✓ | — | A | IEEE 802.3af/at (PoE standard) |
| CCTV network configuration | ✓ | ✓ | — | A | GEPP-BKN2-E-IT-012 |
| CCTV coverage & image quality test | ✓ | ✓ | — | **A (HOLD)** | GEPP-BKN2-E-IT-012 |
| Lighting illuminance test | ✓ | ✓ | ✓ | **A (HOLD)** | IEC 60081 / ISO 12004 |
| Communication audio quality test | ✓ | ✓ | ✓ | **A (HOLD)** | GEPP-BKN2-E-IT-011 |
| CCTV live video & recording test | ✓ | ✓ | ✓ | **A (HOLD)** | GEPP-BKN2-E-IT-012 |
| PTZ camera control test (if applicable) | ✓ | ✓ | — | A | Camera manufacturer spec |
| Final system sign-off | — | ✓ | ✓ | **A (FINAL)** | GEPP-BKN2-E-IT-009/011/012 |

---

## Test Parameters & Acceptance Criteria Summary

### Lighting System Requirements

**Color Temperature Standards (by Application):**

| Application | Color Temperature | Reason |
|---|---|---|
| **Office/Control Rooms** | 4000 K (neutral white) | Reduces eye strain; promotes alertness |
| **Outdoor/Industrial** | 4000–6500 K | Good color rendering; visibility at night |
| **Emergency/Exit Lighting** | 3000 K (warm) | Avoids glare; easier for emergency evacuation |

**Color Rendering Index (CRI):**

| Rating | Quality | Typical Application |
|---|---|---|
| **CRI ≥ 90** | Excellent | Control rooms, color-critical work (recommended for utility) |
| **CRI 80–90** | Good | General facilities, switchgear rooms |
| **CRI < 80** | Poor | Not recommended for safety-critical areas |

**Illuminance Standards (by Area—IEC 61215):**

```
Task-specific lighting (inspection, work): ≥ 500 lux
Control room / Display monitoring: ≥ 500 lux
Switchgear room / Equipment access: ≥ 300 lux
Stairways, corridors: ≥ 100 lux
General work areas: ≥ 150–300 lux
Outdoor yard/perimeter: ≥ 10–50 lux (depending on security level)
```

### Communication System Performance Standards

**Audio Quality Metrics:**

| Parameter | Target | Measurement |
|---|---|---|
| **Sound Pressure Level (SPL)** | 75–85 dB(A) | Sound level meter @ 1 m |
| **Frequency Response** | 300 Hz – 3 kHz minimum | Speech intelligibility range |
| **Signal-to-Noise Ratio** | ≥ 20 dB SNR | Noise floor suppression |
| **Total Harmonic Distortion (THD)** | < 10% @ full output | Amplifier linearity |
| **Intelligibility (Subjective)** | MOS ≥ 3.5 | Two-way conversation assessment |

**Telephone System Standards (per ITU-T):**

| Parameter | Specification |
|---|---|
| **Dial Tone** | 350 Hz + 440 Hz (DTMF tones) |
| **Ring Tone** | 400–600 Hz, 1–2 kHz modulated |
| **Call Clarity (MOS)** | ≥ 4.0 (good quality) |
| **Call Setup Time** | < 5 seconds (local); < 20 seconds (long distance) |

### CCTV System Performance Standards

**Resolution by Application:**

| Application | Minimum Resolution | Rationale |
|---|---|---|
| **General surveillance** | 1080p (2 MP) | Face recognition at 5–10 m |
| **Access gate / Entry** | 4 MP | Facial features at 10–15 m; license plate recognition |
| **Perimeter coverage** | 1080p (wide angle) | Wide FOV; continuous fence monitoring |
| **Critical asset** | 4–8 MP | High detail; post-incident forensics |

**Frame Rate Standards:**

| Scene Type | Frame Rate | Reason |
|---|---|---|
| **Static scenes** | 15 fps | Sufficient for motion detection; bandwidth efficient |
| **Dynamic/moving subjects** | 30 fps | Smooth motion capture; better forensic detail |
| **High-speed events** | 60 fps (if available) | Captures rapid movements (not typical for utility) |

**Illuminance for CCTV:**

| Lighting Condition | Illuminance | Camera Type | Performance |
|---|---|---|---|
| **Bright daylight** | > 10,000 lux | Color or IR | Excellent clarity; full resolution |
| **Typical indoor** | 100–1000 lux | Color | Good color; full resolution |
| **Dim (dusk/indoor shadows)** | 10–100 lux | Color with sensitivity | Acceptable; slight noise |
| **Dark (no artificial light)** | < 10 lux | IR-equipped | Monochrome IR image; night vision mode |

---

## Applicable Standards

### International Electrotechnical Commission (IEC)

- **IEC 60081:** Double-capped fluorescent lamps
- **IEC 60950-1:** Safety of information technology equipment
- **IEC 61215:** Crystalline silicon terrestrial photovoltaic (PV) modules
- **IEC 61000-3-2:** Harmonic current emissions (lighting ballasts)
- **IEC 61000-3-3:** Flicker and voltage changes

### American Standards (ANSI/IEEE)

- **ANSI/IEEE C62.35:** Surge Protectors Used on Information Technology Equipment
- **IEEE 1100:** Recommended Practice for Powering and Grounding Electronic Equipment (EMI/RFI considerations)
- **NFPA 70 (NEC):** National Electrical Code – Lighting installation requirements

### Communication Standards (ITU-T, IEEE)

- **ITU-T G.114:** One-way transmission time (call quality)
- **IEEE 802.3:** Ethernet & PoE (Power over Ethernet)
- **EIA/TIA-568:** Commercial Building Telecommunications Cabling Standard

### CCTV Standards (ISO, IEEE)

- **ISO 19591:** Closed Circuit Television (CCTV) System design
- **IEEE 1394:** FireWire (high-speed video transmission, if applicable)

### Project-Specific Standards

- **GEPP-BKN2-E-IT-009:** Lighting ITP (Status A–C)
- **GEPP-BKN2-E-IT-011:** Communication System ITP (Rev. 0–1)
- **GEPP-BKN2-E-IT-012:** CCTV ITP (Rev. 0–1)

### Indonesian National Standards (SNI)

- **SNI 03-6197:** Minimum Illuminance and Color Rendering Index on Indoor Lighting Design
- **SNI 8653:** Information Security Management System Implementation Guidelines

---

## Critical Hold Points Summary

| # | Activity | Test/Verification | Pass Requirement | Authority |
|---|---|---|---|---|
| 1 | **Lighting Fixture Spec** | Type, power, color, IP rating | All match specification | Engineer + Contractor |
| 2 | **LED/Ballast Electrical** | Output, power draw, insulation | ±10% power; ≥ 10 MΩ | Engineer |
| 3 | **Emergency Light Battery** | Charge state, runtime, self-test | ≥ 90 min runtime; test passed | Contractor + Engineer |
| 4 | **Lighting Installation** | Mounting, height, electrical | Secure, per plan, bonded | **Engineer + Owner** |
| 5 | **Control Circuit** | Switches, sensors, contactor | All operate per design | Engineer + Contractor |
| 6 | **Power Supply** | Voltage at fixture, ground continuity | 230 V ±10%; ≥ 1,000 MΩ | Engineer |
| 7 | **Comms Equipment** | Paging/phone system completeness | All units present & undamaged | Contractor + Engineer |
| 8 | **Comms Cabling** | Cat5e/Cat6, termination, continuity | 568B standard; all pairs tested | **Engineer + Owner** |
| 9 | **Comms Functional** | Audio quality, two-way, all zones | MOS ≥ 3.5; intelligible speech | **Engineer + Owner** |
| 10 | **CCTV Camera** | Type, resolution, mounting | Correct spec; secure install | Engineer + Contractor |
| 11 | **CCTV Cabling & PoE** | Cat5e/Cat6, RJ45, PoE voltage | 48 V DC at camera; all IPs responding | **Engineer + Owner** |
| 12 | **CCTV Network** | IP config, NVR connection, storage | All cameras visible on NVR; storage adequate | Engineer + Contractor |
| 13 | **CCTV Coverage & Image** | Area coverage, image quality, focus | Full coverage with specified overlap; clear image | **Engineer + Owner** |
| 14 | **Lighting Illuminance** | Lux measurement at all areas | All points ≥ minimum; uniform ±20% | **Engineer + Owner** |
| 15 | **Comms Audio Quality** | SPL, frequency response, intelligibility | 75–85 dB(A); MOS ≥ 3.5 | **Engineer + Owner** |
| 16 | **CCTV Video & Recording** | Live feed, recording, playback, timestamp | All cameras recording; playback smooth | **Engineer + Owner** |
| 17 | **PTZ Controls (if applicable)** | Pan/tilt/zoom/preset movements | All movements smooth; presets exact | Engineer + Contractor |
| 18 | **Final Sign-Off** | All systems operational & documented | All tests passed; manuals provided | **Owner Representative** |

---

## Risk Mitigation & Troubleshooting

### Lighting Illuminance Below Target (< minimum lux)

**Possible Causes:**
- Insufficient fixture quantity or wattage
- Buildup of dust/dirt on lenses reducing output
- Fixture height too high (inverse square law: lux ∝ 1/distance²)
- Dimmer setting accidentally reduced

**Remedial Actions:**

1. **Clean Fixtures:**
   - Use soft dry cloth to clean lens/reflector
   - Can improve output by 10–20%

2. **Increase Number of Fixtures:**
   - Install additional fixtures to increase lumens delivered
   - Space new fixtures 1–2 m from existing for even coverage

3. **Upgrade to Higher-Efficiency Bulbs:**
   - Replace 70 W HPS with 100 W (if circuit amperage allows)
   - Or upgrade to LED (same output, lower watts)

4. **Check Dimmer/Control Settings:**
   - Verify dimmer is at 100% (if adjustable)
   - Reset to default if misconfigured

### Audio Quality Issues in Communication System

**Problem: Feedback/Howling in Paging System**

**Possible Causes:**
- Microphone too close to speaker
- Gain set too high (positive feedback loop)
- Ground loop (multiple ground paths causing hum)

**Remedial Actions:**

1. **Reposition Microphone:**
   - Move microphone away from speakers (at least 3 m)
   - Use directional cardioid microphone (rejects rear/side sound)

2. **Reduce Amplifier Gain:**
   - Lower master volume by 10–20%
   - Keep output at 75–85 dB (acceptable level)

3. **Eliminate Ground Loops:**
   - Ensure only one ground connection point (at main panel)
   - Use audio isolation transformer if multiple grounds exist

**Problem: Low Audio Level (< 70 dB)**

**Possible Causes:**
- Amplifier gain set too low
- Microphone faulty or not connected
- Cabling break/poor connection

**Remedial Actions:**

1. **Increase Amplifier Gain:**
   - Turn up master volume to 75–85 dB target
   - Verify no feedback at higher levels

2. **Test Microphone:**
   - Tap on microphone; verify sound heard in speakers
   - If no response: replace microphone

3. **Check Cabling:**
   - Verify XLR/RCA plugs fully seated
   - Test with cable tester for continuity
   - If broken: re-terminate or replace cable

### CCTV Camera No Video or Poor Image

**Problem: No Video from One Camera**

**Possible Causes:**
- PoE power not reaching camera (cabling issue)
- Camera IP address conflict
- Network switch PoE port failed

**Troubleshooting:**

1. **Check Power (PoE Voltage):**
   - Measure DC voltage on Cat5e pins at camera end
   - Should be 44–57 V DC
   - If 0 V: check switch port; test with different camera

2. **Verify IP Address:**
   - Ping camera IP from NVR / control PC
   - If no response: check DHCP settings or reassign static IP
   - Use camera default IP from manufacturer docs

3. **Swap PoE Port on Switch:**
   - Move Cat5e cable to different switch port
   - If camera then works: original port faulty; contact IT

**Problem: Poor Image Quality (Blurry, Low Detail)**

**Possible Causes:**
- Camera focus not set correctly
- Lens dirty or damaged
- Insufficient lighting
- Compression artifacts (codec setting)

**Remedial Actions:**

1. **Adjust Focus:**
   - Switch to manual focus (if available)
   - Focus on objects at typical viewing distance
   - Re-test with live feed

2. **Clean Lens:**
   - Use soft lens cloth (not paper)
   - Gently wipe to remove dust/fingerprints
   - Check for cracks (if cracked: replace camera)

3. **Improve Lighting:**
   - If dark: add supplemental lighting or enable IR
   - Position light to eliminate glare/shadows

4. **Check Compression Settings:**
   - Reduce compression (increase bitrate) if bandwidth allows
   - Use H.264 for good balance of quality & storage
   - Verify camera firmware current (updates may improve algorithm)

---

## Document Evolution

| Revision | Date | Key Changes | Status |
|---|---|---|---|
| Status A | 2018 | Initial baseline (Lighting ITP-009) | **Current** |
| Status C | 2018 | CCTV & Comms systems added (ITP-011/012) | Superseded |
| Rev.1 | 2019 | PoE/Ethernet specs clarified; audio testing added | **Current for Comms/CCTV** |

---

**Document Prepared:** April 2026  
**Last Updated:** From ITPs dated 2018–2019  
**Review Cycle:** 24 months or after major system upgrade or technology change
