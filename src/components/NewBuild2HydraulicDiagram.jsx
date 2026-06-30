import React, { useCallback, useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const stickPivot = { x: 1348, y: 1008 };
const stickCenterAngle = -48;
const stickHalfRange = 25;
const autoCycleSeconds = (Math.PI * 2) / 0.82;
const autoCycleDuration = `${autoCycleSeconds.toFixed(2)}s`;
const flowLineDuration = '1.38s';
const pumpRunawayFlowLineDuration = '0.32s';
const flowLineTravel = 36;
const defaultPressureReadout = 103.0;
const pumpRunawayPressure = 122.0;
const pumpRunawayNeedleAngle = 45;
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
  (_, index) => ![0, 1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 15, 20, 21, 23, 24, 25, 26, 27, 28, 29].includes(index),
);

const ANIMATED_RED_FLOW_SHAPES = RED_FLOW_SHAPES.filter(
  (_, index) => ![0, 1, 2, 3, 6, 7, 8, 9, 10, 12, 14, 15, 16, 17, 21, 22].includes(index),
);

const PARTIAL_RED_HORIZONTAL_FLOW_SHAPES = [
  'M634.666 394.49H410.943V371.776H634.666V394.49Z',
];
const PUMP_RUNAWAY_RED_HORIZONTAL_FLOW_SHAPES = [
  RED_FLOW_SHAPES[12],
];
const PUMP_RUNAWAY_RED_DOWN_FLOW_SHAPES = [
  'M958.106 460.797H937.756V394.49H958.106V460.797Z',
];

const GREEN_HORIZONTAL_FLOW_INDEXES = new Set([9, 11, 15, 16, 20, 25, 27]);
const GREEN_RIGHT_HORIZONTAL_FLOW_INDEXES = new Set([19]);
const RED_HORIZONTAL_FLOW_INDEXES = new Set([5, 6, 7, 9, 10, 12]);
const RED_REVERSE_HORIZONTAL_FLOW_INDEXES = new Set([20, 23]);

const ANIMATED_GREEN_HORIZONTAL_FLOW_SHAPES = GREEN_FLOW_SHAPES.filter(
  (_, index) => ANIMATED_GREEN_FLOW_SHAPES.includes(GREEN_FLOW_SHAPES[index]) && GREEN_HORIZONTAL_FLOW_INDEXES.has(index),
);

const ANIMATED_GREEN_RIGHT_HORIZONTAL_FLOW_SHAPES = GREEN_FLOW_SHAPES.filter(
  (_, index) => ANIMATED_GREEN_FLOW_SHAPES.includes(GREEN_FLOW_SHAPES[index]) && GREEN_RIGHT_HORIZONTAL_FLOW_INDEXES.has(index),
);

const ANIMATED_GREEN_VERTICAL_FLOW_SHAPES = GREEN_FLOW_SHAPES.filter(
  (_, index) => (
    ANIMATED_GREEN_FLOW_SHAPES.includes(GREEN_FLOW_SHAPES[index])
    && !GREEN_HORIZONTAL_FLOW_INDEXES.has(index)
    && !GREEN_RIGHT_HORIZONTAL_FLOW_INDEXES.has(index)
  ),
);

const PUMP_RUNAWAY_GREEN_VERTICAL_FLOW_SHAPES = ANIMATED_GREEN_VERTICAL_FLOW_SHAPES.filter(
  (shape) => ![
    GREEN_FLOW_SHAPES[8],
    GREEN_FLOW_SHAPES[13],
    GREEN_FLOW_SHAPES[14],
    GREEN_FLOW_SHAPES[17],
    GREEN_FLOW_SHAPES[18],
    GREEN_FLOW_SHAPES[21],
    GREEN_FLOW_SHAPES[22],
  ].includes(shape),
);
const PUMP_RUNAWAY_GREEN_EXTRA_VERTICAL_FLOW_SHAPES = [
  'M504.223 719.008H479.875V542.225H504.223V719.008Z',
];

const PUMP_RUNAWAY_GREEN_HORIZONTAL_FLOW_SHAPES = ANIMATED_GREEN_HORIZONTAL_FLOW_SHAPES.filter(
  (shape) => ![GREEN_FLOW_SHAPES[16], GREEN_FLOW_SHAPES[20]].includes(shape),
);
const PUMP_RUNAWAY_GREEN_EXTRA_HORIZONTAL_FLOW_SHAPES = [
  'M566.184 522.225H504.223V502.238H566.184V522.225Z',
];
const PUMP_RUNAWAY_GREEN_RIGHT_HORIZONTAL_FLOW_SHAPES = [
  'M479.875 696.84H619.785V719.008H479.875V696.84Z',
];

const ANIMATED_RED_HORIZONTAL_FLOW_SHAPES = RED_FLOW_SHAPES.filter(
  (_, index) => ANIMATED_RED_FLOW_SHAPES.includes(RED_FLOW_SHAPES[index]) && RED_HORIZONTAL_FLOW_INDEXES.has(index),
);

const ANIMATED_RED_REVERSE_HORIZONTAL_FLOW_SHAPES = RED_FLOW_SHAPES.filter(
  (_, index) => ANIMATED_RED_FLOW_SHAPES.includes(RED_FLOW_SHAPES[index]) && RED_REVERSE_HORIZONTAL_FLOW_INDEXES.has(index),
);

const ANIMATED_RED_VERTICAL_FLOW_SHAPES = RED_FLOW_SHAPES.filter(
  (_, index) => (
    ANIMATED_RED_FLOW_SHAPES.includes(RED_FLOW_SHAPES[index])
    && !RED_HORIZONTAL_FLOW_INDEXES.has(index)
    && !RED_REVERSE_HORIZONTAL_FLOW_INDEXES.has(index)
  ),
);

const PUMP_RUNAWAY_RED_VERTICAL_FLOW_SHAPES = ANIMATED_RED_VERTICAL_FLOW_SHAPES.filter(
  (shape) => ![RED_FLOW_SHAPES[2], RED_FLOW_SHAPES[11], RED_FLOW_SHAPES[13]].includes(shape),
);

const TRAINING_MENU_ITEMS = ['FREEZE', 'CLICKPOINTS', 'TEST', 'ABNORMAL', 'RESET', 'QUIT'];
const ABNORMAL_MENU_ITEMS = ['PUMP RUNAWAY', 'RES OVERFILL', 'AIR IN SYSTEM', 'PUMP FAILURE'];
const trainingMenu = {
  x: 8,
  y: 780,
  width: 300,
  rowHeight: 36,
};
const abnormalMenu = {
  x: trainingMenu.x + trainingMenu.width,
  width: 340,
};
const pumpSource = { x: 387.621, y: 869.092 };
const pumpOverlay = {
  slugY: pumpSource.y + 36.7385,
  leftX: pumpSource.x + 114.328,
  centerX: pumpSource.x + 164.443,
  rightX: pumpSource.x + 208.83,
  slugWidth: 24,
  slugHeight: 184,
  holderX: pumpSource.x + 88.8008,
  holderY: pumpSource.y + 208.5,
  holderWidth: 158,
  holderHeight: 24,
};
const pumpHolderCenter = {
  x: pumpOverlay.holderX + pumpOverlay.holderWidth / 2,
  y: pumpOverlay.holderY + pumpOverlay.holderHeight / 2,
};
const airInSystemDelayMs = 2000;
const airInSystemDurationMs = 10000;
const pumpRunawayDelayMs = 2000;
const pumpRunawayMotionDurationMs = 18000;
const airChamber = {
  leftX: 553.828,
  redBaseX: 783.361,
  rightX: 998.453,
  topY: 454.999,
  bottomY: 671.956,
  movingStartX: 665.762,
  movingY: 291.647,
  movingWidth: 1143,
  movingHeight: 544,
  greenPath: 'M554.009 502.056V454.999H783.249V527.275H748.159V600.107H783.361V671.955H553.828L554.009 454.999',
  rightUpperGreen: { x: 1060.55, y: 290.853, width: 207.98, height: 234.336 },
  rightLowerGreen: { x: 1060.55, y: 601.053, width: 191.01, height: 234.336 },
};
airChamber.height = airChamber.bottomY - airChamber.topY;
airChamber.greenWidth = airChamber.redBaseX - airChamber.leftX;
airChamber.redBaseWidth = airChamber.rightX - airChamber.redBaseX;
airChamber.travel = airChamber.greenWidth * 0.35;
airChamber.rightUpperGreenTravel = airChamber.rightUpperGreen.width * 0.35;
airChamber.rightLowerGreenTravel = airChamber.rightLowerGreen.width * 0.35;
airChamber.rightGreenCoverBleed = 12;
airChamber.rightGreenCoverEndBleed = 24;
airChamber.rightUpperGreenCoverOffsetY = 0;
airChamber.rightLowerGreenCoverOffsetY = 0;
const runwayChamber = {
  ...airChamber,
  movingStartX: airChamber.movingStartX,
  movingY: 454.8,
  movingWidth: 395,
  movingHeight: 218,
  travel: airChamber.greenWidth * 0.25,
};
const runwayThingFlow = {
  x: 151,
  y: 100,
  width: 92,
  height: 16,
};

export function NewBuild2HydraulicDiagram({
  pressure,
  pumpSpeed = 0.25,
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
  const [abnormalMenuOpen, setAbnormalMenuOpen] = useState(false);
  const [activeTrainingButton, setActiveTrainingButton] = useState(null);
  const [activeAbnormalButton, setActiveAbnormalButton] = useState(null);
  const [autoPressureValue, setAutoPressureValue] = useState(101.3);
  const [resOverfillAutoStage, setResOverfillAutoStage] = useState('res');
  const [airBleedActive, setAirBleedActive] = useState(false);
  const [bleedRainActive, setBleedRainActive] = useState(false);
  const [airProgress, setAirProgress] = useState(0);
  const [runwayProgress, setRunwayProgress] = useState(0);
  const airProgressRef = useRef(0);
  const pumpRunawayMode = activeAbnormalButton === 'PUMP RUNAWAY';
  const pumpFailureMode = activeAbnormalButton === 'PUMP FAILURE';
  const resOverfillMode = activeAbnormalButton === 'RES OVERFILL';
  const airInSystemMode = activeAbnormalButton === 'AIR IN SYSTEM';
  const motionVisualActive = (pumpRunawayMode || autoMode || draggingStick) && !pumpFailureMode && !airInSystemMode;
  const testMode = activeTrainingButton === 'TEST';
  const stickAngle = clamp(stickCenterAngle + stickPosition * stickHalfRange, -73, -23);
  const pressureNeedleAngle = clamp(-118 + ((pressure - 70) / 60) * 236, -118, 118);
  const displayedPressureNeedleAngle = pumpFailureMode ? 12 : (pumpRunawayMode ? pumpRunawayNeedleAngle : pressureNeedleAngle);
  const defaultMode = !activeAbnormalButton && !testMode;
  const showPressureReadout = motionVisualActive || defaultMode || testMode || pumpFailureMode;
  const pressureReadoutValue = testMode || pumpFailureMode
    ? 0
    : (pumpRunawayMode ? pumpRunawayPressure : (motionVisualActive ? autoPressureValue : defaultPressureReadout));
  const valveBlockHref = (() => {
    if (pumpFailureMode) return '/assets/valve-block-failure.svg';
    if (pumpRunawayMode) return '/assets/valve-block-runway.svg';
    if (resOverfillMode) {
      if (resOverfillAutoStage === 'auto') return '/assets/valve-auto1.svg';
      if (resOverfillAutoStage === 'auto2') return '/assets/valve-auto2.svg';
      return '/assets/valve-block-res.svg';
    }
    if (airInSystemMode) return airBleedActive ? '/assets/valve-block-air.svg' : '/assets/airinsystem.svg';
    if (testMode) return '/assets/valve-block-test.svg';
    return solenoidOpen ? '/assets/valve-block-red.svg' : '/assets/valve-block-red-light.svg';
  })();
  const gaugeCenter = { x: mapArtworkX(338), y: mapArtworkY(96) };
  const pumpDuration = '2.24s';
  const redToCenter = pumpOverlay.centerX - pumpOverlay.leftX;
  const redToRight = pumpOverlay.rightX - pumpOverlay.leftX;
  const greenToCenter = pumpOverlay.centerX - pumpOverlay.rightX;
  const greenToLeft = pumpOverlay.leftX - pumpOverlay.rightX;
  const airTravel = airChamber.travel * airProgress;
  const airGreenWidth = airChamber.greenWidth - airTravel;
  const airRedExpansionX = airChamber.redBaseX - airTravel;
  const airMovingX = airChamber.movingStartX - airTravel;
  const airRightUpperGreenCoverWidth = airChamber.rightUpperGreenTravel * airProgress;
  const airRightLowerGreenCoverWidth = airChamber.rightLowerGreenTravel * airProgress;
  const runwayTravel = runwayChamber.travel * runwayProgress;
  const runwayGreenWidth = runwayChamber.greenWidth - runwayTravel;
  const runwayRedExpansionX = runwayChamber.redBaseX - runwayTravel;
  const runwayMovingX = runwayChamber.movingStartX - runwayTravel;

  useEffect(() => {
    if (!motionVisualActive) {
      setAutoPressureValue(101.3);
      return undefined;
    }

    let frameId;
    let startTime;

    const tickPressure = (now) => {
      startTime ??= now;
      const elapsed = (now - startTime) / 1000;
      const phase = (Math.sin((elapsed / autoCycleSeconds) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      setAutoPressureValue(101.3 + phase * 1.7);
      frameId = requestAnimationFrame(tickPressure);
    };

    frameId = requestAnimationFrame(tickPressure);

    return () => cancelAnimationFrame(frameId);
  }, [motionVisualActive]);

  useEffect(() => {
    if (!resOverfillMode || !autoMode) {
      setResOverfillAutoStage('res');
      return undefined;
    }

    setResOverfillAutoStage('res');
    const timers = [
      setTimeout(() => setResOverfillAutoStage('auto'), 2000),
      setTimeout(() => setResOverfillAutoStage('auto2'), 5200),
      setTimeout(() => setResOverfillAutoStage('auto'), 8200),
      setTimeout(() => setResOverfillAutoStage('auto2'), 10200),
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [autoMode, resOverfillMode]);

  useEffect(() => {
    airProgressRef.current = airProgress;
  }, [airProgress]);

  useEffect(() => {
    if (!airInSystemMode || !airBleedActive) {
      airProgressRef.current = 0;
      setAirProgress(0);
      return undefined;
    }

    if (!bleedRainActive || airProgressRef.current >= 1) return undefined;

    let frameId;
    let startTime;
    const startProgress = airProgressRef.current;

    const timer = setTimeout(() => {
      const tickAir = (now) => {
        startTime ??= now;
        const elapsed = now - startTime;
        const progress = clamp(startProgress + elapsed / airInSystemDurationMs, 0, 1);
        airProgressRef.current = progress;
        setAirProgress(progress);

        if (progress < 1) {
          frameId = requestAnimationFrame(tickAir);
        }
      };

      frameId = requestAnimationFrame(tickAir);
    }, startProgress === 0 ? airInSystemDelayMs : 0);

    return () => {
      clearTimeout(timer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [airBleedActive, airInSystemMode, bleedRainActive]);

  useEffect(() => {
    if (!pumpRunawayMode) {
      setRunwayProgress(0);
      return undefined;
    }

    let frameId;
    let startTime;

    setRunwayProgress(0);

    const timer = setTimeout(() => {
      const tickRunway = (now) => {
        startTime ??= now;
        const elapsed = now - startTime;
        const progress = clamp(elapsed / pumpRunawayMotionDurationMs, 0, 1);
        setRunwayProgress(progress);

        if (progress < 1) {
          frameId = requestAnimationFrame(tickRunway);
        }
      };

      frameId = requestAnimationFrame(tickRunway);
    }, pumpRunawayDelayMs);

    return () => {
      clearTimeout(timer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [pumpRunawayMode]);

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

  const handleTrainingButtonKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const activateTrainingButton = (item) => {
    setActiveTrainingButton((current) => (current === item ? null : item));
    if (item !== 'ABNORMAL') {
      setAbnormalMenuOpen(false);
      setActiveAbnormalButton(null);
      setAirBleedActive(false);
      setBleedRainActive(false);
    }
  };

  const activateAbnormalButton = (item) => {
    setActiveTrainingButton('ABNORMAL');
    setActiveAbnormalButton(item);
    setAirBleedActive(false);
    setBleedRainActive(false);
    setAbnormalMenuOpen(true);
  };

  const activateAirBleed = () => {
    if (airInSystemMode) {
      if (!airBleedActive) {
        setAirBleedActive(true);
        setBleedRainActive(true);
      } else {
        setBleedRainActive((current) => !current);
      }
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
          <pattern id="newbuild2-red-flow-vertical-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M5 8 H15 M22 18 H33 M8 30 H19" className="newbuild2-pattern-line red" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`0 ${flowLineTravel}`}
              to="0 0"
              dur={flowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-red-flow-vertical-fast-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M5 8 H15 M22 18 H33 M8 30 H19" className="newbuild2-pattern-line red" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`0 ${flowLineTravel}`}
              to="0 0"
              dur={pumpRunawayFlowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-red-flow-down-fast-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M5 8 H15 M22 18 H33 M8 30 H19" className="newbuild2-pattern-line red" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`0 -${flowLineTravel}`}
              to="0 0"
              dur={pumpRunawayFlowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-red-flow-horizontal-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M5 8 H15 M22 18 H33 M8 30 H19" className="newbuild2-pattern-line red" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`-${flowLineTravel} 0`}
              to="0 0"
              dur={flowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-red-flow-horizontal-fast-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M5 8 H15 M22 18 H33 M8 30 H19" className="newbuild2-pattern-line red" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`-${flowLineTravel} 0`}
              to="0 0"
              dur={pumpRunawayFlowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-red-flow-reverse-horizontal-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M5 8 H15 M22 18 H33 M8 30 H19" className="newbuild2-pattern-line red" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`${flowLineTravel} 0`}
              to="0 0"
              dur={flowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-red-flow-reverse-horizontal-fast-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M5 8 H15 M22 18 H33 M8 30 H19" className="newbuild2-pattern-line red" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`${flowLineTravel} 0`}
              to="0 0"
              dur={pumpRunawayFlowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-green-flow-vertical-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M7 6 H18 M24 17 H34 M4 29 H15" className="newbuild2-pattern-line green" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`0 -${flowLineTravel}`}
              to="0 0"
              dur={flowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-green-flow-vertical-fast-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M7 6 H18 M24 17 H34 M4 29 H15" className="newbuild2-pattern-line green" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`0 -${flowLineTravel}`}
              to="0 0"
              dur={pumpRunawayFlowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-green-flow-horizontal-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M7 6 H18 M24 17 H34 M4 29 H15" className="newbuild2-pattern-line green" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`${flowLineTravel} 0`}
              to="0 0"
              dur={flowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-green-flow-horizontal-fast-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M7 6 H18 M24 17 H34 M4 29 H15" className="newbuild2-pattern-line green" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`${flowLineTravel} 0`}
              to="0 0"
              dur={pumpRunawayFlowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-green-flow-right-horizontal-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M7 6 H18 M24 17 H34 M4 29 H15" className="newbuild2-pattern-line green" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`-${flowLineTravel} 0`}
              to="0 0"
              dur={flowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          <pattern id="newbuild2-green-flow-right-horizontal-fast-pattern" width={flowLineTravel} height={flowLineTravel} patternUnits="userSpaceOnUse">
            <path d="M7 6 H18 M24 17 H34 M4 29 H15" className="newbuild2-pattern-line green" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from={`-${flowLineTravel} 0`}
              to="0 0"
              dur={pumpRunawayFlowLineDuration}
              calcMode="linear"
              repeatCount="indefinite"
            />
          </pattern>
          {airInSystemMode && airBleedActive ? (
            <clipPath id="newbuild2-air-green-clip" clipPathUnits="userSpaceOnUse">
              <rect
                x={airChamber.leftX}
                y={airChamber.topY}
                width={airGreenWidth}
                height={airChamber.height}
              />
            </clipPath>
          ) : null}
          {pumpRunawayMode ? (
            <clipPath id="newbuild2-runway-green-clip" clipPathUnits="userSpaceOnUse">
              <rect
                x={runwayChamber.leftX}
                y={runwayChamber.topY}
                width={runwayGreenWidth}
                height={runwayChamber.height}
              />
            </clipPath>
          ) : null}
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

        {pumpRunawayMode ? (
          <g className="newbuild2-runway-motion" transform={artworkExactTransform} aria-hidden="true">
            <rect
              className="runway-chamber-cover"
              x={runwayChamber.leftX}
              y={runwayChamber.topY}
              width={runwayChamber.rightX - runwayChamber.leftX}
              height={runwayChamber.height}
            />
            <path className="runway-chamber-green" d={runwayChamber.greenPath} clipPath="url(#newbuild2-runway-green-clip)" />
            <rect
              className="runway-chamber-red runway-chamber-red-base"
              x={runwayChamber.redBaseX}
              y={runwayChamber.topY}
              width={runwayChamber.redBaseWidth}
              height={runwayChamber.height}
            />
            <rect
              className="runway-chamber-red runway-chamber-red-expansion"
              x={runwayRedExpansionX}
              y={runwayChamber.topY}
              width={runwayTravel}
              height={runwayChamber.height}
            />
            <image
              className="runway-moving-element"
              href="/assets/runway-thing.svg"
              x={runwayMovingX}
              y={runwayChamber.movingY}
              width={runwayChamber.movingWidth}
              height={runwayChamber.movingHeight}
              preserveAspectRatio="none"
            />
            <rect
              className="runway-thing-red-flow"
              x={runwayMovingX + runwayThingFlow.x}
              y={runwayChamber.movingY + runwayThingFlow.y}
              width={runwayThingFlow.width}
              height={runwayThingFlow.height}
            />
          </g>
        ) : null}

        <g
          className={
            motionVisualActive
              ? `newbuild2-flow-overlay active${pumpRunawayMode ? ' pump-runaway' : ''}`
              : 'newbuild2-flow-overlay'
          }
          transform={artworkExactTransform}
        >
          {[
            ...(pumpRunawayMode ? PUMP_RUNAWAY_GREEN_VERTICAL_FLOW_SHAPES : ANIMATED_GREEN_VERTICAL_FLOW_SHAPES),
            ...(pumpRunawayMode ? PUMP_RUNAWAY_GREEN_EXTRA_VERTICAL_FLOW_SHAPES : []),
          ].map((shape) => (
            <path key={shape} className="newbuild2-flow-shape green vertical" d={shape} />
          ))}
          {[
            ...(pumpRunawayMode ? PUMP_RUNAWAY_GREEN_HORIZONTAL_FLOW_SHAPES : ANIMATED_GREEN_HORIZONTAL_FLOW_SHAPES),
            ...(pumpRunawayMode ? PUMP_RUNAWAY_GREEN_EXTRA_HORIZONTAL_FLOW_SHAPES : []),
          ].map((shape) => (
            <path key={shape} className="newbuild2-flow-shape green horizontal" d={shape} />
          ))}
          {(pumpRunawayMode ? PUMP_RUNAWAY_GREEN_RIGHT_HORIZONTAL_FLOW_SHAPES : ANIMATED_GREEN_RIGHT_HORIZONTAL_FLOW_SHAPES).map((shape) => (
            <path key={shape} className="newbuild2-flow-shape green right-horizontal" d={shape} />
          ))}
          {(pumpRunawayMode ? PUMP_RUNAWAY_RED_VERTICAL_FLOW_SHAPES : ANIMATED_RED_VERTICAL_FLOW_SHAPES).map((shape) => (
            <path key={shape} className="newbuild2-flow-shape red vertical" d={shape} />
          ))}
          {[
            ...ANIMATED_RED_HORIZONTAL_FLOW_SHAPES,
            ...(pumpRunawayMode ? PUMP_RUNAWAY_RED_HORIZONTAL_FLOW_SHAPES : []),
          ].map((shape) => (
            <path key={shape} className="newbuild2-flow-shape red horizontal" d={shape} />
          ))}
          {(pumpRunawayMode ? [] : PARTIAL_RED_HORIZONTAL_FLOW_SHAPES).map((shape) => (
            <path key={shape} className="newbuild2-flow-shape red horizontal" d={shape} />
          ))}
          {(pumpRunawayMode ? PUMP_RUNAWAY_RED_DOWN_FLOW_SHAPES : []).map((shape) => (
            <path key={shape} className="newbuild2-flow-shape red down" d={shape} />
          ))}
          {[
            ...ANIMATED_RED_REVERSE_HORIZONTAL_FLOW_SHAPES,
          ].map((shape) => (
            <path key={shape} className="newbuild2-flow-shape red reverse-horizontal" d={shape} />
          ))}
        </g>

        {resOverfillMode && autoMode && resOverfillAutoStage === 'auto' ? (
          <g className="newbuild2-res-bubbles" transform={artworkExactTransform} aria-hidden="true">
            <g className="res-bubble-stream">
              {[
                { x: 879, delay: '0s', radius: 5.2 },
                { x: 861, delay: '0.32s', radius: 4.5 },
                { x: 893, delay: '0.66s', radius: 3.8 },
                { x: 873, delay: '0.94s', radius: 4.2 },
                { x: 886, delay: '1.24s', radius: 3.4 },
              ].map((bubble) => (
                <circle key={`${bubble.x}-${bubble.delay}`} cx={bubble.x} cy="970" r={bubble.radius}>
                  <animate
                    attributeName="cy"
                    values="970;1088"
                    dur="1.55s"
                    begin={bubble.delay}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0.85;0"
                    keyTimes="0;0.16;0.78;1"
                    dur="1.55s"
                    begin={bubble.delay}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>
          </g>
        ) : null}

        {airInSystemMode && airBleedActive ? (
          <g className="newbuild2-air-in-system" transform={artworkExactTransform} aria-hidden="true">
            <rect
              className="air-chamber-cover"
              x={airChamber.leftX}
              y={airChamber.topY}
              width={airChamber.rightX - airChamber.leftX}
              height={airChamber.height}
            />
            <path className="air-chamber-green" d={airChamber.greenPath} clipPath="url(#newbuild2-air-green-clip)" />
            <rect
              className="air-chamber-red air-chamber-red-base"
              x={airChamber.redBaseX}
              y={airChamber.topY}
              width={airChamber.redBaseWidth}
              height={airChamber.height}
            />
            <rect
              className="air-chamber-red air-chamber-red-expansion"
              x={airRedExpansionX}
              y={airChamber.topY}
              width={airTravel}
              height={airChamber.height}
            />
            <rect
              className="air-right-green-cover"
              x={airChamber.rightUpperGreen.x + airChamber.rightUpperGreen.width - airRightUpperGreenCoverWidth - airChamber.rightGreenCoverBleed}
              y={airChamber.rightUpperGreen.y + airChamber.rightUpperGreenCoverOffsetY}
              width={airRightUpperGreenCoverWidth + airChamber.rightGreenCoverBleed + airChamber.rightGreenCoverEndBleed}
              height={airChamber.rightUpperGreen.height}
            />
            <rect
              className="air-right-green-cover"
              x={airChamber.rightLowerGreen.x + airChamber.rightLowerGreen.width - airRightLowerGreenCoverWidth - airChamber.rightGreenCoverBleed}
              y={airChamber.rightLowerGreen.y + airChamber.rightLowerGreenCoverOffsetY}
              width={airRightLowerGreenCoverWidth + airChamber.rightGreenCoverBleed + airChamber.rightGreenCoverEndBleed}
              height={airChamber.rightLowerGreen.height}
            />
            <image
              className="air-moving-element"
              href="/assets/moving-element.svg"
              x={airMovingX}
              y={airChamber.movingY}
              width={airChamber.movingWidth}
              height={airChamber.movingHeight}
              preserveAspectRatio="none"
            />
          </g>
        ) : null}

        {airInSystemMode && airBleedActive ? (
          <g className="newbuild2-bleed-bubbles" transform={artworkExactTransform} aria-hidden="true">
            {bleedRainActive ? (
              <g className="bleed-bubble-stream">
                {[
                  { x: 1558, delay: '0s', radius: 4.6 },
                  { x: 1572, delay: '0.24s', radius: 3.8 },
                  { x: 1562, delay: '0.48s', radius: 4.1 },
                  { x: 1577, delay: '0.72s', radius: 3.3 },
                  { x: 1566, delay: '0.96s', radius: 3.7 },
                  { x: 1574, delay: '1.2s', radius: 3.1 },
                ].map((bubble) => (
                  <circle key={`bleed-${bubble.x}-${bubble.delay}`} cx={bubble.x} cy="204" r={bubble.radius}>
                    <animate
                      attributeName="cy"
                      values="204;454"
                      dur="1.55s"
                      begin={bubble.delay}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.9;0.86;0"
                      keyTimes="0;0.14;0.82;1"
                      dur="1.55s"
                      begin={bubble.delay}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
              </g>
            ) : null}
            <g className="bleed-bubble-puddle">
              <ellipse cx="1564" cy="486" rx="66" ry="30" />
              <ellipse cx="1517" cy="471" rx="42" ry="28" />
              <ellipse cx="1541" cy="501" rx="58" ry="27" />
              <ellipse cx="1607" cy="499" rx="54" ry="28" />
              <ellipse cx="1602" cy="466" rx="45" ry="25" />
            </g>
          </g>
        ) : null}

        <g
          className="newbuild2-pump-cycle"
          transform={artworkExactTransform}
          style={{ '--pump-cycle-duration': pumpDuration }}
          aria-hidden="true"
        >
          <g className="pump-cycle-slug pump-cycle-red">
            {pumpFailureMode ? null : (
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0 0; ${redToCenter} 0; ${redToRight} 0; ${redToCenter} 0; 0 0`}
                keyTimes="0;0.25;0.5;0.75;1"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
                dur={pumpDuration}
                repeatCount="indefinite"
              />
            )}
            <image
              href="/assets/left-red.svg"
              x={pumpOverlay.leftX}
              y={pumpOverlay.slugY}
              width={pumpOverlay.slugWidth}
              height={pumpOverlay.slugHeight}
              preserveAspectRatio="none"
            />
          </g>
          <g className="pump-cycle-slug pump-cycle-green">
            {pumpFailureMode ? null : (
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0 0; ${greenToCenter} 0; ${greenToLeft} 0; ${greenToCenter} 0; 0 0`}
                keyTimes="0;0.25;0.5;0.75;1"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
                dur={pumpDuration}
                repeatCount="indefinite"
              />
            )}
            <image
              href="/assets/right-green.svg"
              x={pumpOverlay.rightX}
              y={pumpOverlay.slugY}
              width={pumpOverlay.slugWidth}
              height={pumpOverlay.slugHeight}
              preserveAspectRatio="none"
            />
          </g>
          <g
            className={motionVisualActive || pumpFailureMode ? 'pump-cycle-holder-wrap auto' : 'pump-cycle-holder-wrap'}
            transform={
              pumpFailureMode
                ? `rotate(10 ${pumpHolderCenter.x} ${pumpHolderCenter.y})`
                : (pumpRunawayMode ? `rotate(18 ${pumpHolderCenter.x} ${pumpHolderCenter.y})` : undefined)
            }
          >
            {motionVisualActive && !pumpRunawayMode ? (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values={`0 ${pumpHolderCenter.x} ${pumpHolderCenter.y}; -10 ${pumpHolderCenter.x} ${pumpHolderCenter.y}; 0 ${pumpHolderCenter.x} ${pumpHolderCenter.y}; 10 ${pumpHolderCenter.x} ${pumpHolderCenter.y}; 0 ${pumpHolderCenter.x} ${pumpHolderCenter.y}`}
                keyTimes="0;0.25;0.5;0.75;1"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
                dur={autoCycleDuration}
                repeatCount="indefinite"
              />
            ) : null}
            <image
              className="pump-cycle-holder"
              href="/assets/red-green-holder.svg"
              x={pumpOverlay.holderX}
              y={pumpOverlay.holderY}
              width={pumpOverlay.holderWidth}
              height={pumpOverlay.holderHeight}
              preserveAspectRatio="none"
            />
          </g>
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
          {showPressureReadout ? (
            <text className="newbuild2-pressure-readout" x="485" y="88">
              {pressureReadoutValue.toFixed(1)}
            </text>
          ) : null}
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
          {testMode || pumpFailureMode ? (
            <g className="newbuild2-test-alert" aria-label="Hydraulic pressure alert">
              <rect x="16" y="318" width="176" height="31" />
              <text x="26" y="342">HYD PRESS</text>
            </g>
          ) : null}
        </g>

        {airInSystemMode ? (
          <g
            className={airBleedActive ? 'newbuild2-bleed-trigger active' : 'newbuild2-bleed-trigger'}
            role="button"
            tabIndex="0"
            aria-label="Activate bleed valve air purge"
            aria-pressed={bleedRainActive}
            onClick={activateAirBleed}
            onKeyDown={(event) => handleTrainingButtonKeyDown(event, activateAirBleed)}
          >
            <rect className="bleed-trigger-hitbox" x="1162" y="220" width="106" height="58" />
            <path className="bleed-trigger-simple-arrow" d="M1257 250H1219M1219 250L1231 240M1219 250L1231 260" />
          </g>
        ) : null}

        <g className="newbuild2-training-menu" aria-label="Training control menu">
          <rect
            className="training-menu-shell"
            x={trainingMenu.x}
            y={trainingMenu.y}
            width={trainingMenu.width}
            height={TRAINING_MENU_ITEMS.length * trainingMenu.rowHeight}
          />
          {TRAINING_MENU_ITEMS.map((item, index) => {
            const rowY = trainingMenu.y + index * trainingMenu.rowHeight;

            if (item === 'ABNORMAL') {
              return (
                <g
                  key={item}
                  className={
                    abnormalMenuOpen
                      ? 'training-menu-row training-menu-button training-menu-abnormal open'
                      : 'training-menu-row training-menu-button training-menu-abnormal'
                  }
                  role="button"
                  tabIndex="0"
                  aria-label="Abnormal menu"
                  aria-pressed={activeTrainingButton === item}
                  onPointerEnter={() => setAbnormalMenuOpen(true)}
                  onPointerLeave={() => setAbnormalMenuOpen(false)}
                  onClick={() => {
                    activateTrainingButton(item);
                    setAbnormalMenuOpen(true);
                  }}
                  onKeyDown={(event) => handleTrainingButtonKeyDown(event, () => {
                    activateTrainingButton(item);
                    setAbnormalMenuOpen(true);
                  })}
                  onFocus={() => setAbnormalMenuOpen(true)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setAbnormalMenuOpen(false);
                    }
                  }}
                >
                  <rect
                    className="training-menu-cell menu-row-highlight"
                    x={trainingMenu.x}
                    y={rowY}
                    width={trainingMenu.width}
                    height={trainingMenu.rowHeight}
                  />
                  <text x={trainingMenu.x + trainingMenu.width / 2} y={rowY + 26}>{item}</text>
                  <text className="training-menu-arrow" x={trainingMenu.x + trainingMenu.width - 28} y={rowY + 26}>
                    &gt;
                  </text>
                  <g
                    className="training-submenu"
                    transform={`translate(${abnormalMenu.x} ${rowY})`}
                    aria-label="Abnormal submenu"
                  >
                    <rect
                      className="training-menu-shell"
                      x="0"
                      y="0"
                      width={abnormalMenu.width}
                      height={ABNORMAL_MENU_ITEMS.length * trainingMenu.rowHeight}
                    />
                    {ABNORMAL_MENU_ITEMS.map((submenuItem, submenuIndex) => (
                      <g
                        key={submenuItem}
                        className={
                          activeAbnormalButton === submenuItem
                            ? 'training-menu-row training-menu-button training-submenu-button active'
                            : 'training-menu-row training-menu-button training-submenu-button'
                        }
                        role="button"
                        tabIndex="0"
                        aria-label={submenuItem}
                        aria-pressed={activeAbnormalButton === submenuItem}
                        onClick={(event) => {
                          event.stopPropagation();
                          activateAbnormalButton(submenuItem);
                        }}
                        onKeyDown={(event) => handleTrainingButtonKeyDown(event, () => activateAbnormalButton(submenuItem))}
                      >
                        <rect
                          className="training-menu-cell"
                          x="0"
                          y={submenuIndex * trainingMenu.rowHeight}
                          width={abnormalMenu.width}
                          height={trainingMenu.rowHeight}
                        />
                        <rect
                          className="training-menu-checkbox"
                          x="22"
                          y={submenuIndex * trainingMenu.rowHeight + 10}
                          width="14"
                          height="14"
                        />
                        <text x="48" y={submenuIndex * trainingMenu.rowHeight + 26}>{submenuItem}</text>
                      </g>
                    ))}
                  </g>
                </g>
              );
            }

            return (
              <g
                key={item}
                className={
                  activeTrainingButton === item
                    ? 'training-menu-row training-menu-button active'
                    : 'training-menu-row training-menu-button'
                }
                role="button"
                tabIndex="0"
                aria-label={item}
                aria-pressed={activeTrainingButton === item}
                onClick={() => activateTrainingButton(item)}
                onKeyDown={(event) => handleTrainingButtonKeyDown(event, () => activateTrainingButton(item))}
              >
                <rect
                  className="training-menu-cell"
                  x={trainingMenu.x}
                  y={rowY}
                  width={trainingMenu.width}
                  height={trainingMenu.rowHeight}
                />
                <text x={trainingMenu.x + trainingMenu.width / 2} y={rowY + 26}>{item}</text>
              </g>
            );
          })}
        </g>

        <g className="newbuild2-pressure-clock" transform={`translate(${gaugeCenter.x} ${gaugeCenter.y})`} aria-label="Pressure out">
          {motionVisualActive && !pumpRunawayMode ? (
            <g className="newbuild2-pressure-needle-auto">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-90 0 0;90 0 0;-90 0 0"
                calcMode="spline"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
                dur={autoCycleDuration}
                repeatCount="indefinite"
              />
              <line className="newbuild2-pressure-needle" x1="0" y1="5" x2="0" y2="-30" />
            </g>
          ) : (
            <line className="newbuild2-pressure-needle" x1="0" y1="5" x2="0" y2="-30" transform={`rotate(${displayedPressureNeedleAngle})`} />
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
