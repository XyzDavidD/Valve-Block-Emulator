import React, { useCallback, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const stickPivot = { x: 1348, y: 1008 };
const stickCenterAngle = -48;
const stickHalfRange = 25;
const assetPath = (name) => `/assets/${name}.svg`;
const sourceScale = 0.65;
const sourceOffset = { x: 140, y: 72 };

function AssetImage({ name, x, y, width, height, className = '' }) {
  return (
    <image
      href={assetPath(name)}
      x={x}
      y={y}
      width={width}
      height={height}
      className={`newbuild-asset ${className}`.trim()}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

const fromSource = (name, x, y, width, height) => ({
  name,
  x: sourceOffset.x + x * sourceScale,
  y: sourceOffset.y + y * sourceScale,
  width: width * sourceScale,
  height: height * sourceScale,
});

const parts = {
  mainBackground: fromSource('main-background', 69.643, 129.254, 930, 803),
  pressureSwitch: fromSource('pressure-switch', 25.983, 168.867, 268, 166),
  solenoidValve: fromSource('solenoid-valve', 0, 358.7, 328, 100),
  pressureMonitorTop: fromSource('pressure-monitor-top', 133.602, 526.273, 179, 232),
  pressureMonitor: fromSource('pressure-monitor', 40.934, 785.38, 175, 64),
  pressureMonitorRight: fromSource('pressure-monitor-right', 316.117, 776.449, 153, 81),
  pressureOut: fromSource('pressure-out', 362.68, 0, 152, 178),
  returnIn1: fromSource('return-in-1', 601.711, 13.831, 83, 165),
  returnIn2: fromSource('return-in-2', 827.244, 13.831, 83, 165),
  rightSide: fromSource('right-side', 996.37, 147.861, 964, 731),
  reliefValve: fromSource('low-pressure-relief-valve', 835.289, 716.827, 81, 272),
  pump: fromSource('pump', 387.621, 869.092, 384, 433),
  topThing: fromSource('top-thing', 548.2, 247.9, 266, 108),
  middleThing: fromSource('middle-thing', 553.8, 454.5, 434, 218),
};

export function NewBuildHydraulicDiagram({
  pressure,
  flowIntensity = 0.25,
  solenoidOpen,
  stickPosition,
  autoMode,
  onStickChange,
  onStickInterrupt,
  onToggleAuto,
  onToggleSolenoid,
}) {
  const svgRef = useRef(null);
  const [draggingStick, setDraggingStick] = useState(false);
  const stickAngle = clamp(stickCenterAngle + stickPosition * stickHalfRange, -73, -23);
  const pressureNeedleAngle = clamp(-118 + (pressure - 72) * 3.6, -118, 72);
  const tubeDuration = `${Math.max(2.4, 5.2 - flowIntensity * 2.1)}s`;
  const sx = (value) => sourceOffset.x + value * sourceScale;
  const sy = (value) => sourceOffset.y + value * sourceScale;
  const redTubePaths = [
    `M ${sx(286)} ${sy(252)} H ${sx(390)} V ${sy(222)} H ${sx(570)} V ${sy(174)} H ${sx(628)} V ${sy(350)}`,
    `M ${sx(628)} ${sy(314)} H ${sx(894)} V ${sy(420)} H ${sx(996)}`,
    `M ${sx(304)} ${sy(560)} H ${sx(448)} V ${sy(420)} H ${sx(905)} V ${sy(520)} H ${sx(945)}`,
    `M ${sx(170)} ${sy(816)} H ${sx(322)} V ${sy(776)} H ${sx(468)} V ${sy(850)} H ${sx(570)} V ${sy(900)}`,
    `M ${sx(555)} ${sy(420)} V ${sy(650)} H ${sx(905)} V ${sy(600)} H ${sx(945)}`,
    `M ${sx(318)} ${sy(650)} H ${sx(905)}`,
  ];
  const greenTubePaths = [
    `M ${sx(320)} ${sy(410)} H ${sx(420)} V ${sy(322)} H ${sx(602)}`,
    `M ${sx(420)} ${sy(410)} V ${sy(520)} H ${sx(555)}`,
    `M ${sx(555)} ${sy(640)} H ${sx(870)} V ${sy(610)} H ${sx(996)}`,
    `M ${sx(560)} ${sy(640)} V ${sy(870)} H ${sx(664)} V ${sy(1010)}`,
    `M ${sx(830)} ${sy(82)} V ${sy(334)} H ${sx(996)}`,
    `M ${sx(598)} ${sy(520)} H ${sx(825)} V ${sy(420)} H ${sx(996)}`,
    `M ${sx(870)} ${sy(610)} V ${sy(726)} H ${sx(835)}`,
  ];

  const setStickFromPointer = useCallback(
    (event) => {
      const svg = svgRef.current;
      if (!svg) return;
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const cursor = point.matrixTransform(svg.getScreenCTM().inverse());
      const dx = cursor.x - stickPivot.x;
      const dy = stickPivot.y - cursor.y;
      const angle = clamp(Math.atan2(dx, Math.max(dy, 18)) * (180 / Math.PI), -73, -23);
      onStickChange(clamp((angle - stickCenterAngle) / stickHalfRange, -1, 1));
    },
    [onStickChange],
  );

  const handleSolenoidKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggleSolenoid();
    }
  };

  return (
    <section className="diagram-panel" aria-label="Hydraulic valve block diagram assembled from client SVGs">
      <svg
        ref={svgRef}
        className="hydraulic-svg newbuild-svg"
        viewBox="0 0 1500 1080"
        role="img"
        aria-label="Hydraulic valve block component assembly"
      >
        <defs>
          <linearGradient id="newbuild-rod-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f2f3" />
            <stop offset="52%" stopColor="#b6bdc2" />
            <stop offset="100%" stopColor="#737b83" />
          </linearGradient>
        </defs>

        <rect width="1500" height="1080" className="diagram-background" />

        <g className="legend">
          <text x="14" y="134" className="diagram-title">
            Hydraulic
          </text>
          <text x="14" y="164" className="diagram-subtitle">
            Valve Block
          </text>
          <rect x="14" y="500" width="44" height="21" className="legend-red" />
          <text x="70" y="517">
            HIGH PRESSURE
          </text>
          <rect x="14" y="535" width="44" height="21" className="legend-green" />
          <text x="70" y="552">
            LOW PRESSURE
          </text>
        </g>

        <g className="newbuild-assembled-diagram">
          <AssetImage {...parts.mainBackground} className="main-background-asset" />

          <g
            className={autoMode ? 'newbuild-tubes active' : 'newbuild-tubes'}
            style={{ '--tube-duration': tubeDuration }}
            aria-hidden="true"
          >
            {greenTubePaths.map((path) => (
              <path key={`green-base-${path}`} d={path} className="newbuild-tube-base green" />
            ))}
            {redTubePaths.map((path) => (
              <path key={`red-base-${path}`} d={path} className={solenoidOpen ? 'newbuild-tube-base red' : 'newbuild-tube-base red restricted'} />
            ))}
            {greenTubePaths.map((path) => (
              <path key={`green-light-${path}`} d={path} className="newbuild-tube-light green flow-forward" />
            ))}
            {redTubePaths.map((path) => (
              <path key={`red-light-${path}`} d={path} className={solenoidOpen ? 'newbuild-tube-light red flow-forward' : 'newbuild-tube-light red flow-forward restricted'} />
            ))}
          </g>

          <g className="newbuild-detail-things">
            <AssetImage {...parts.topThing} />
            <AssetImage {...parts.middleThing} />
            <rect
              x={parts.middleThing.x + 372.309 * sourceScale}
              y={parts.middleThing.y + 66.2959 * sourceScale}
              width={61 * sourceScale}
              height={91 * sourceScale}
              className={solenoidOpen ? 'newbuild-middle-red-patch' : 'newbuild-middle-red-patch restricted'}
            />
          </g>

          <g className="newbuild-asset-components">
            <AssetImage {...parts.pressureSwitch} />

            <g
              className="svg-hotspot newbuild-solenoid-hotspot"
              role="button"
              tabIndex="0"
              aria-label="Toggle solenoid valve"
              onClick={onToggleSolenoid}
              onKeyDown={handleSolenoidKeyDown}
            >
              <rect x={parts.solenoidValve.x} y={parts.solenoidValve.y} width={parts.solenoidValve.width} height={parts.solenoidValve.height} className="newbuild-hotspot-shape" />
              <AssetImage {...parts.solenoidValve} />
            </g>

            <AssetImage {...parts.pressureMonitorTop} />
            <AssetImage {...parts.pressureMonitor} />
            <AssetImage {...parts.pressureMonitorRight} />

            <AssetImage {...parts.pressureOut} />
            <g className="newbuild-gauge-needle" transform={`rotate(${pressureNeedleAngle} ${sourceOffset.x + 438.59 * sourceScale} ${sourceOffset.y + 75.91 * sourceScale})`}>
              <line
                x1={sourceOffset.x + 438.59 * sourceScale}
                y1={sourceOffset.y + 75.91 * sourceScale}
                x2={sourceOffset.x + 438.59 * sourceScale}
                y2={sourceOffset.y + 37 * sourceScale}
              />
            </g>

            <AssetImage {...parts.returnIn1} />
            <AssetImage {...parts.returnIn2} />
            <AssetImage {...parts.rightSide} />
            <AssetImage {...parts.reliefValve} />
            <AssetImage {...parts.pump} />
          </g>
        </g>

        <g className="labels newbuild-labels">
          <text x="286" y="48">PRESSURE OUT</text>
          <text x="900" y="48">RETURN IN</text>
          <text className="label-left" x="126" y="276">PRESSURE SWITCH</text>
          <text className="label-left" x="130" y="392">SOLENOID VALVE</text>
          <text className="label-left" x="126" y="630">PRESSURE MONITOR</text>
          <text x="712" y="894">PUMP</text>
          <text x="894" y="786">LOW PRESSURE</text>
          <text x="894" y="814">RELIEF VALVE</text>
          <text x="1170" y="630">RESERVOIR</text>
          <text x="1032" y="164">SIGHT GLASS</text>
          <text x="1308" y="198">BLEED VALVE</text>
          <text x="1268" y="548">LEVEL INDICATOR</text>
        </g>

        <g
          className={draggingStick ? 'reference-stick dragging' : 'reference-stick'}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            setDraggingStick(true);
            onStickInterrupt();
            setStickFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (draggingStick) setStickFromPointer(event);
          }}
          onPointerUp={() => setDraggingStick(false)}
          onPointerCancel={() => setDraggingStick(false)}
          role="slider"
          aria-label="Cyclic stick"
          aria-valuemin="-1"
          aria-valuemax="1"
          aria-valuenow={Number(stickPosition.toFixed(2))}
          tabIndex="0"
        >
          <rect className="reference-stick-hit-area" x="1085" y="735" width="390" height="330" rx="10" />
          <g className="reference-stick-scale" transform={`translate(${stickPivot.x} ${stickPivot.y})`}>
            <path className="reference-stick-arc" d="M-224 -62 A232 232 0 0 1 -66 -224" />
            <path className="reference-stick-tick" d="M-224 -62 L-252 -62" />
            <path className="reference-stick-tick" d="M-66 -224 L-51 -251" />
          </g>
          <g transform={`translate(${stickPivot.x} ${stickPivot.y}) rotate(${stickAngle})`}>
            <line className="reference-stick-shadow" x1="0" y1="0" x2="0" y2="-230" />
            <line className="reference-stick-shaft" x1="0" y1="0" x2="0" y2="-230" />
            <line className="reference-stick-highlight" x1="0" y1="-24" x2="0" y2="-205" />
            <g transform="translate(0 -156)">
              <rect className="reference-collar" x="-20" y="-11" width="40" height="22" rx="4" />
            </g>
            <g transform="translate(0 -235)">
              <rect className="reference-grip-main" x="-23" y="-50" width="46" height="88" rx="7" />
              <rect className="reference-grip-cap" x="-27" y="-58" width="54" height="22" rx="6" />
              <path className="reference-grip-ridges" d="M-16 -29 H16 M-16 -20 H16 M-16 -11 H16 M-16 -2 H16 M-16 7 H16 M-16 16 H16" />
              <rect className="reference-grip-end" x="-18" y="30" width="36" height="14" rx="3" />
            </g>
            <circle className="reference-pivot" cx="0" cy="0" r="19" />
            <circle className="reference-pivot-ring" cx="0" cy="0" r="12" />
            <circle className="reference-pivot-core" cx="0" cy="0" r="6" />
          </g>
        </g>

        <g
          className={autoMode ? 'auto-control active' : 'auto-control'}
          onClick={onToggleAuto}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onToggleAuto();
            }
          }}
          role="button"
          tabIndex="0"
          aria-label="Toggle automatic cyclic movement"
        >
          <rect x="1042" y="1012" width="104" height="34" rx="2" />
          <text x="1094" y="1035">AUTO</text>
        </g>
      </svg>
    </section>
  );
}
