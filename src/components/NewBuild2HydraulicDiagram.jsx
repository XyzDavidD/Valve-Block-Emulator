import React, { useCallback, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const stickPivot = { x: 1348, y: 1008 };
const stickCenterAngle = -48;
const stickHalfRange = 25;
const artworkBox = { x: 245, y: 150, width: 1080, height: 717 };
const artworkSource = { x: 0, y: 42, width: 1500, height: 996 };

const mapArtworkX = (x) => artworkBox.x + ((x - artworkSource.x) / artworkSource.width) * artworkBox.width;
const mapArtworkY = (y) => artworkBox.y + ((y - artworkSource.y) / artworkSource.height) * artworkBox.height;
const artworkExactTransform = `translate(${artworkBox.x} ${artworkBox.y}) scale(${artworkBox.width / 1961} ${artworkBox.height / 1302})`;

const GREEN_FLOW_SHAPES = [
  'M1268.53 525.189H1060.55V290.853H1268.53V525.189Z',
  'M1089.41 228.143H1360.14V189.986H1089.41V228.143Z',
  'M1060.7 200.887H1076.04V294.508H1060.7V200.887Z',
  'M1076.04 200.886H1089.41V228.141H1076.04V200.886Z',
  'M619.785 905.753H597.461V716.827H619.785V905.753Z',
  'M1251.56 835.388H1060.55V601.052H1251.56V835.388Z',
  'M554.009 502.056V454.999H783.249V527.275H748.159V600.107H783.361V671.955H553.828L554.009 454.999',
  'M294.638 379.225V394.488H311.634V415.02H294.638V502.237H406.286V522.225H273.9L272.916 429.374H268.102V379.225L294.811 379.21',
  'M879.529 367.143H858.361V297.096H879.529V367.143Z',
  'M316.16 272.347H548.739V292.559H316.16V272.347Z',
  'M316.16 272.346H336.511V371.777H316.16V272.346Z',
  'M316.16 437.552H336.511V444.639H316.16V437.552Z',
  'M344.063 437.552H308.895V371.776H344.063V437.552Z',
  'M654.617 335.527H675.868V367.143H654.617V335.527Z',
  'M504.223 415.02H479.875V719.008H504.223V415.02Z',
  'M566.184 522.225H437.357V502.238H566.184V522.225Z',
  'M878.892 437.552H479.875V415.022H878.892V437.552Z',
  'M675.616 424.107H654.617V397.942H675.616V424.107Z',
  'M878.893 426.287H858.361V397.941H878.893V426.287Z',
  'M479.875 696.84H1061.87V719.008H479.875V696.84Z',
  'M908.039 768.476H843.551V753.213H908.039V768.476Z',
  'M887.598 777.198H863.994V716.827H887.598V777.198Z',
  'M879.529 267.232H858.096V15.2186H879.529V267.232Z',
  'M1359.49 194.109H1443.35V211.12H1359.49V194.109Z',
  'M1443.17 186.479H1493.6V218.752H1443.17V186.479Z',
  'M607.029 897.417H692.225V875.566H607.029V897.417Z',
  'M671.025 887.558H691.467V1150.91H671.025V887.558Z',
  'M647.445 1127.57H691.467V1150.91H647.445V1127.57Z',
  'M648.403 1192.43H476.422V1003.83H648.403V1192.43Z',
  'M620.202 956.979H596.701V905.702H620.202V956.979Z',
];

const RED_FLOW_SHAPES = [
  'M785.604 671.956H998.453V455H785.604V671.956Z',
  'M790.198 597.858H748.158V526.619H790.198V597.858Z',
  'M412.463 450.924H382.192V429.376H386.843L387.57 378.498L358.316 378.681V394.489H349.594V415.021H358.632V473.62H413.371L412.463 450.924Z',
  'M294.638 712.635H149.934V569.638H294.638V712.635Z',
  'M432.801 654.758H410.646V371.777H432.801V654.758Z',
  'M294.637 632.337H432.801V654.758H294.637V632.337Z',
  'M813.117 312.909H737.418V250.194H813.117V312.909Z',
  'M958.478 292.542H813.371V271.296H958.478V292.542Z',
  'M958.106 460.797H937.756V291.892H958.106V460.797Z',
  'M653.996 258.032H612.518V228.42H653.996V258.032Z',
  'M653.788 333.895H613.064V305.642H653.788V333.895Z',
  'M612.516 328.626H634.666V373.139H612.516V328.626Z',
  'M943.034 394.49H410.943V371.776H943.034V394.49Z',
  'M653.996 229.168H632.562V15.2205H653.996V229.168Z',
  'M423.729 214.606H632.563V199.81H423.729V214.606Z',
  'M423.729 199.808H438.469V250.559H423.729V199.808Z',
  'M279 235.136H438.468V250.559H279V235.136Z',
  'M241.342 278.757H279.82V207.144H241.342V278.757Z',
  'M502.043 905.844L525.119 905.751V805.151H502.043V905.844Z',
  'M418.816 784.711H434.079V849.199H418.816V784.711Z',
  'M410.096 805.152H525.12V828.756H410.096V805.152Z',
  'M214.979 825.552H145.543V808.542H214.979V825.552Z',
  'M145.716 833.184H95.293V800.911H145.716V833.184Z',
  'M214.979 827.743H316.609V804.725H214.979V827.743Z',
  'M218.332 732.174H242.425V804.727H218.332V732.174Z',
];

const ANIMATED_GREEN_FLOW_SHAPES = GREEN_FLOW_SHAPES.filter(
  (_, index) => ![0, 5, 6, 28].includes(index),
);

const ANIMATED_RED_FLOW_SHAPES = RED_FLOW_SHAPES.filter(
  (_, index) => ![0, 1, 3].includes(index),
);

export function NewBuild2HydraulicDiagram({
  pressure,
  flowIntensity,
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
  const pressureNeedleAngle = clamp(-118 + ((pressure - 70) / 60) * 236, -118, 118);
  const valveBlockHref = solenoidOpen ? '/assets/valve-block-red.svg' : '/assets/valve-block-red-light.svg';
  const gaugeCenter = { x: mapArtworkX(338), y: mapArtworkY(96) };
  const flowDuration = `${Math.max(0.72, 1.85 - flowIntensity * 0.75)}s`;

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

  const handlePressureSwitchKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggleSolenoid();
    }
  };

  return (
    <section className="diagram-panel" aria-label="Hydraulic valve block diagram using exported SVG artwork">
      <svg
        ref={svgRef}
        className="hydraulic-svg newbuild2-svg"
        viewBox="0 0 1500 1080"
        role="img"
        aria-label="Hydraulic valve block schematic"
      >
        <defs>
          <linearGradient id="newbuild2-stick-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f2f3" />
            <stop offset="52%" stopColor="#b6bdc2" />
            <stop offset="100%" stopColor="#737b83" />
          </linearGradient>
          <pattern id="newbuild2-red-flow-pattern" width="36" height="26" patternUnits="userSpaceOnUse">
            <path d="M1 8 H10 M21 8 H31 M8 20 H20" className="newbuild2-pattern-line red" />
            <animateTransform attributeName="patternTransform" type="translate" from="-36 0" to="0 0" dur={flowDuration} repeatCount="indefinite" />
          </pattern>
          <pattern id="newbuild2-green-flow-pattern" width="36" height="26" patternUnits="userSpaceOnUse">
            <path d="M1 7 H11 M22 7 H32 M9 20 H21" className="newbuild2-pattern-line green" />
            <animateTransform attributeName="patternTransform" type="translate" from="36 0" to="0 0" dur={flowDuration} repeatCount="indefinite" />
          </pattern>
        </defs>

        <rect width="1500" height="1080" className="diagram-background" />
        <image
          href={valveBlockHref}
          x={artworkBox.x}
          y={artworkBox.y}
          width={artworkBox.width}
          height={artworkBox.height}
          className="newbuild2-valve-image"
          preserveAspectRatio="none"
        />

        <g
          className={autoMode ? 'newbuild2-flow-overlay active' : 'newbuild2-flow-overlay'}
          transform={artworkExactTransform}
        >
          {ANIMATED_GREEN_FLOW_SHAPES.map((shape) => (
            <path key={shape} className="newbuild2-flow-shape green" d={shape} />
          ))}
          {ANIMATED_RED_FLOW_SHAPES.map((shape) => (
            <path key={shape} className="newbuild2-flow-shape red" d={shape} />
          ))}
        </g>

        <g className="legend">
          <text x="26" y="166" className="diagram-title">
            Hydraulic
          </text>
          <text x="26" y="196" className="diagram-subtitle">
            Valve Block
          </text>
          <rect x="26" y="520" width="44" height="21" className="legend-red" />
          <text x="82" y="537">
            HIGH PRESSURE
          </text>
          <rect x="26" y="555" width="44" height="21" className="legend-green" />
          <text x="82" y="572">
            LOW PRESSURE
          </text>
        </g>

        <g className="labels newbuild2-labels">
          <text x="420" y="116">PRESSURE OUT</text>
          <text x="820" y="126">RETURN IN</text>
          <text className="label-left" x="250" y="306">PRESSURE SWITCH</text>
          <text className="label-left" x="250" y="395">SOLENOID VALVE</text>
          <text className="label-left" x="248" y="614">PRESSURE MONITOR</text>
          <text x="630" y="872">PUMP</text>
          <text x="845" y="770">LOW PRESSURE</text>
          <text x="845" y="798">RELIEF VALVE</text>
          <text x="1084" y="724">RESERVOIR</text>
          <text x="970" y="156">SIGHT GLASS</text>
          <text x="1268" y="250">BLEED VALVE</text>
          <text x="1224" y="556">LEVEL INDICATOR</text>
        </g>

        <g className="newbuild2-pressure-clock" transform={`translate(${gaugeCenter.x} ${gaugeCenter.y})`} aria-label="Pressure out">
          {autoMode ? (
            <g className="newbuild2-pressure-needle-auto">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-72 0 0;72 0 0;-72 0 0"
                dur="1.45s"
                repeatCount="indefinite"
              />
              <line className="newbuild2-pressure-needle" x1="0" y1="5" x2="0" y2="-30" />
            </g>
          ) : (
            <line className="newbuild2-pressure-needle" x1="0" y1="5" x2="0" y2="-30" transform={`rotate(${pressureNeedleAngle})`} />
          )}
          <circle className="newbuild2-pressure-hub" cx="0" cy="0" r="5.5" />
        </g>

        <g
          className="svg-hotspot newbuild2-pressure-switch-hotspot"
          role="button"
          tabIndex="0"
          aria-label="Toggle solenoid valve"
          onClick={onToggleSolenoid}
          onKeyDown={handlePressureSwitchKeyDown}
        >
          <rect x={mapArtworkX(40)} y={mapArtworkY(292)} width="190" height="82" />
        </g>

        <g
          className={draggingStick ? 'reference-stick dragging newbuild2-stick' : 'reference-stick newbuild2-stick'}
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
          <g className="newbuild2-stick-arm" transform={`translate(${stickPivot.x} ${stickPivot.y}) rotate(${stickAngle})`}>
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
          className={autoMode ? 'auto-control active newbuild2-auto-control' : 'auto-control newbuild2-auto-control'}
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
