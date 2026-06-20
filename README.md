# H135 Hydraulic Valve Block Emulator

Standalone HTML5 proof-of-concept for a 2D hydraulic training emulator inspired by the supplied Airbus H135 valve-block screenshots and video notes.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Implemented

- Vite + React standalone frontend.
- Responsive SVG recreation of the hydraulic valve block with labelled pressure out, return in, pressure switch, solenoid valve, pressure monitor, pump, low pressure relief valve, reservoir, sight glass, bleed valve, and level indicator.
- Animated red high-pressure and green low-pressure flow paths.
- Circular pressure gauge with moving needle and live numeric pressure.
- Pilot cyclic stick with AUTO motion and pointer/touch dragging.
- Linked animation model where stick movement drives pressure, pump speed, flow intensity, and pump/back-plate motion.
- Basic control panel with AUTO, reset, pressure, stick position, pump speed, flow intensity, and status.
- Solenoid hotspot plus optional test switch panel that toggles the valve open/closed and changes the flow intensity.

## Visual Approximations

The original production media assets are not available as clean files, so the diagram, pump, stick, switch, reservoir, and line geometry are recreated in SVG/CSS as a professional demo approximation. The animation is intentionally illustrative rather than a physically accurate hydraulic simulation.

## Next Steps For A Full Version

- Replace approximation artwork with approved CAD or illustrator-derived assets.
- Match the reference video timings and fault states exactly.
- Expand the solenoid and test-switch behavior into validated training scenarios.
- Add clickpoints, freeze/test/abnormal modes, captions, and assessment hooks.
- Create a technical specification and change log with the client.
