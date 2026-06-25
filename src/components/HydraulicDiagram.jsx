import React, { useCallback, useRef, useState } from 'react';
import { PressureGauge } from './PressureGauge.jsx';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const stickPivot = { x: 1348, y: 1008 };
const stickCenterAngle = -48;
const stickHalfRange = 25;

export function HydraulicDiagram({
  pressure,
  pumpSpeed,
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
  const redDash = `${Math.max(2.8, 5.8 - flowIntensity * 1.8)}s`;
  const greenDash = `${Math.max(2.6, 5.4 - flowIntensity * 1.7)}s`;
  const pumpDuration = `${Math.max(1.8, 4.8 - pumpSpeed * 1.7)}s`;
  const stickAngle = clamp(stickCenterAngle + stickPosition * stickHalfRange, -73, -23);

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
    <section className="diagram-panel" aria-label="Hydraulic valve block diagram">
      <svg
        ref={svgRef}
        className="hydraulic-svg"
        viewBox="0 0 1500 1080"
        role="img"
        aria-label="Animated hydraulic valve block schematic"
      >

        <defs>
          <pattern id="machining" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="#c5c8ca" strokeWidth="2" opacity="0.55" />
          </pattern>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#1e242b" floodOpacity="0.16" />
          </filter>
          <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8ecef" />
            <stop offset="52%" stopColor="#b8bec3" />
            <stop offset="100%" stopColor="#8f969b" />
          </linearGradient>
          <linearGradient id="dark-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#777b80" />
            <stop offset="100%" stopColor="#3c4147" />
          </linearGradient>
          <marker id="flow-arrow-red" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0 0 L7 3.5 L0 7 z" fill="#b71918" />
          </marker>
          <marker id="flow-arrow-green" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0 0 L7 3.5 L0 7 z" fill="#18a83c" />
          </marker>
        </defs>

        <rect width="1500" height="1080" className="diagram-background" />

        <g className="legend">
          <text x="48" y="134" className="diagram-title">
            Hydraulic
          </text>
          <text x="48" y="164" className="diagram-subtitle">
            Valve Block
          </text>
          <rect x="48" y="500" width="44" height="21" className="legend-red" />
          <text x="104" y="517">
            HIGH PRESSURE
          </text>
          <rect x="48" y="535" width="44" height="21" className="legend-green" />
          <text x="104" y="552">
            LOW PRESSURE
          </text>
        </g>

        <g className="valve-block" filter="url(#soft-shadow)">
          <path
            className="machined-block"
            d="M360 265 H772 V232 H838 V265 H920 V300 H1002 V430 H955 V620 H835 V586 H724 V640 H523 V606 H362 V514 H333 V402 H360 Z"
          />
          <path
            className="machined-cut"
            d="M409 296 H720 V263 H771 V335 H913 V398 H827 V470 H525 V543 H412 Z"
          />
          <rect x="778" y="360" width="156" height="168" className="reservoir-block" />
          <rect x="838" y="254" width="204" height="366" className="reservoir-shell-underlay" />
          <path className="pressure-switch-backplate" d="M355 276 H431 V296 H410 V342 H431 V360 H355 V342 H370 V296 H355 Z" />
          <rect x="327" y="496" width="92" height="76" className="black-cap" />
        </g>

        <g className="green-flow" style={{ '--flow-duration': greenDash, '--flow-opacity': 0.96 }}>
          <path className="flow-base green" d="M384 440 H471 V532 H596 V642 H767 V642 H872 V623" />
          <path className="flow-base green" d="M431 346 H512 V431 H471" />
          <path className="flow-base green" d="M471 532 H667 V451 H798 V316 H1137" />
          <path className="flow-base green" d="M802 170 V316 H959 V602 H905 V532 H596" />
          <path className="flow-base green" d="M703 346 H737 V512 H596 V652 H532 V713" />
          <path className="flow-base green" d="M872 623 V712 H767" />
          <path className="flow-base green" d="M596 532 H657 V615" />
          <path className="flow-dash green flow-forward" d="M384 440 H471 V532 H596 V642 H767 V642 H872 V623" />
          <path className="flow-dash green flow-forward" d="M431 346 H512 V431 H471" />
          <path className="flow-dash green flow-forward" d="M471 532 H667 V451 H798 V316 H1137" />
          <path className="flow-dash green flow-forward" d="M802 170 V316 H959 V602 H905 V532 H596" />
          <path className="flow-dash green flow-forward" d="M703 346 H737 V512 H596 V652 H532 V713" />
          <path className="flow-dash green flow-forward" d="M872 623 V712 H767" />
          <path className="flow-dash green flow-forward" d="M596 532 H657 V615" />
          <circle className="flow-junction green" cx="471" cy="532" r="9" />
          <circle className="flow-junction green" cx="596" cy="532" r="9" />
          <circle className="flow-junction green" cx="596" cy="642" r="9" />
          <circle className="flow-junction green" cx="737" cy="512" r="8" />
          <circle className="flow-junction green" cx="798" cy="316" r="8" />
          <circle className="flow-junction green" cx="959" cy="316" r="8" />
          <circle className="flow-junction green" cx="959" cy="602" r="8" />
          <circle className="flow-junction green" cx="767" cy="642" r="8" />
        </g>

        <g
          className={solenoidOpen ? 'red-flow' : 'red-flow restricted'}
          style={{ '--flow-duration': redDash, '--flow-opacity': solenoidOpen ? 0.96 : 0.34 }}
        >
          <path className="flow-base red" d="M430 305 H566 V266 H667 V171 V330 H838 V382 H768 V443 H906" />
          <path className="flow-base red" d="M430 497 H517 V370 H604 V424 H873 V382 H838" />
          <path className="flow-base red" d="M394 572 V632 H569 V604 H651 V660 H596 V632 H517 V497" />
          <path className="flow-base red" d="M517 370 V497 H430" />
          <path className="flow-base red" d="M604 424 V604 H569" />
          <path className="flow-base red" d="M667 330 V424 H604" />
          <path className="flow-base red" d="M838 382 V443 H873" />
          <path className="flow-dash red flow-reverse" d="M430 305 H566 V266 H667 V171 V330 H838 V382 H768 V443 H906" />
          <path className="flow-dash red flow-forward" d="M430 497 H517 V370 H604 V424 H873 V382 H838" />
          <path className="flow-dash red flow-forward" d="M394 572 V632 H569 V604 H651 V660 H596 V632 H517 V497" />
          <path className="flow-dash red flow-forward" d="M517 370 V497 H430" />
          <path className="flow-dash red flow-forward" d="M604 424 V604 H569" />
          <path className="flow-dash red flow-forward" d="M667 330 V424 H604" />
          <path className="flow-dash red flow-forward" d="M838 382 V443 H873" />
          <circle className="flow-junction red" cx="566" cy="266" r="8" />
          <circle className="flow-junction red" cx="667" cy="330" r="9" />
          <circle className="flow-junction red" cx="838" cy="382" r="9" />
          <circle className="flow-junction red" cx="604" cy="424" r="9" />
          <circle className="flow-junction red" cx="517" cy="497" r="9" />
          <circle className="flow-junction red" cx="569" cy="604" r="8" />
          <circle className="flow-junction red" cx="596" cy="632" r="8" />
          <circle className="flow-junction red" cx="651" cy="660" r="8" />
        </g>

        <g className="components">
          <g className="pressure-switch">
            <line x1="218" y1="314" x2="252" y2="314" className="thin-line" />
            <line x1="218" y1="326" x2="252" y2="326" className="thin-line red-tint" />
            <rect x="245" y="301" width="16" height="38" className="pressure-thread-nose" />
            <path d="M247 304 h14 m-14 7 h14 m-14 7 h14 m-14 7 h14 m-14 7 h14" className="pressure-thread-lines" />
            <rect x="261" y="287" width="86" height="62" className="pressure-switch-shell" />
            <rect x="272" y="299" width="44" height="38" className="pressure-switch-contact" />
            <path d="M281 306 h21 v10 h-16 v8 h16 v8 h-21" className="switch-trace" />
            <path d="M316 318 h29" className="pressure-switch-spring" />
            <rect x="345" y="297" width="25" height="43" className={`${solenoidOpen ? 'red-fill' : 'green-fill'} pressure-switch-plunger`} />
            <rect x="365" y="276" width="70" height="20" className="pressure-switch-pad" />
            <rect x="365" y="340" width="70" height="20" className="pressure-switch-pad" />
            <rect x="370" y="296" width="38" height="44" className="pressure-switch-side-guide" />
          </g>

          <g
            className="svg-hotspot"
            role="button"
            tabIndex="0"
            aria-label="Toggle solenoid valve"
            onClick={onToggleSolenoid}
            onKeyDown={handleSolenoidKeyDown}
          >
            <g className="solenoid-valve">
              <line x1="210" y1="426" x2="238" y2="426" className="thin-line" />
              <line x1="210" y1="442" x2="238" y2="442" className="thin-line" />
              <rect x="238" y="407" width="38" height="64" className="solenoid-thread-nose" />
              <path d="M240 410 h28 m-28 8 h34 m-34 8 h34 m-34 8 h34 m-34 8 h34 m-34 8 h28" className="pressure-thread-lines" />
              <rect x="276" y="414" width="95" height="50" className="solenoid-shell" />
              <rect x="292" y="430" width="24" height="18" className="solenoid-black-core" />
              <path d="M317 439 l8 -18 l8 36 l8 -36 l8 36 l8 -36 l8 18" className="solenoid-spring" />
              <rect x="370" y="424" width="20" height="34" className="valve-indicator-open" />
              <circle cx="388" cy="441" r="13" className="hotspot-dot open" />
            </g>
          </g>

          <g className="left-coil-block">
            <rect x="325" y="500" width="98" height="88" className="left-coil-housing" />
            <rect x="338" y="513" width="72" height="62" className="left-coil-window" />
            <rect x="347" y="520" width="56" height="48" className="left-coil-core" />
            <path d="M347 523 H403 M347 529 H403 M347 535 H403 M347 541 H403 M347 547 H403 M347 553 H403 M347 559 H403 M347 565 H403" className="left-coil-lines" />
            <rect x="407" y="513" width="8" height="62" className="left-coil-white-side" />
          </g>

          <g className="pressure-monitor">
            <rect x="232" y="596" width="13" height="24" className="black-cap" />
            <path d="M245 587 H304 L318 607 L304 627 H245 Z" className="monitor-threaded-body" />
            <path d="M252 590 h44 m-44 8 h51 m-51 8 h58 m-58 8 h51 m-51 8 h44" className="monitor-thread-lines" />
            <circle cx="285" cy="607" r="9" className="metal-ball" />
            <path d="M300 607 l8 -14 l8 28 l8 -28 l8 28 l8 -14" className="monitor-spring" />
            <rect x="340" y="596" width="94" height="22" className="red-fill monitor-pipe" />
            <rect x="417" y="584" width="86" height="46" className="monitor-red-chamber" />
            <path d="M432 607 l10 -24 l10 48 l10 -48 l10 48 l10 -24" className="spring-zig" />
            <circle cx="486" cy="607" r="14" className="metal-ball" />
            <rect x="500" y="590" width="16" height="34" className="monitor-stop" />
          </g>

          <g className="core-valves">
            <rect x="595" y="318" width="118" height="53" className="metal-sleeve" />
            <rect x="642" y="283" width="44" height="122" className="red-fill" />
            <rect x="712" y="323" width="82" height="48" className="spring-box" />
            <path d="M730 346 l9 -18 l9 36 l9 -36 l9 36 l9 -36 l9 18" className="spring-zig" />
            <g className="middle-spool-assembly">
              <rect x="590" y="430" width="172" height="158" className="middle-green-area" />
              <rect x="748" y="430" width="156" height="158" className="middle-red-area" />
              <rect x="724" y="408" width="28" height="196" className="middle-land middle-land-left" />
              <rect x="746" y="408" width="31" height="196" className="middle-land middle-land-right" />
              <rect x="710" y="445" width="44" height="116" className="middle-spool-stop" />
              <path d="M747 497 H834 L872 469 V525 L834 497 H747 Z" className="middle-red-piston" />
              <rect x="860" y="452" width="16" height="13" className="middle-seal" />
              <rect x="860" y="541" width="16" height="13" className="middle-seal" />
              <rect x="654" y="462" width="78" height="58" className="middle-spring-box" />
              <path d="M668 493 l8 -24 l8 48 l8 -48 l8 48 l8 -48 l8 24" className="middle-spring" />
              <circle cx="720" cy="493" r="14" className="metal-ball" />
              <line x1="590" y1="430" x2="590" y2="588" className="middle-chamber-edge" />
              <line x1="904" y1="430" x2="904" y2="588" className="middle-chamber-edge" />
            </g>
          </g>

          <g className="ports">
            <g className="top-port pressure-out-port" transform="translate(664 166)">
              <path d="M-28 0 H28 L22 8 L28 16 L22 24 L28 32 L22 40 L28 48 L22 56 L28 64 H-28 L-22 56 L-28 48 L-22 40 L-28 32 L-22 24 L-28 16 L-22 8 Z" className="top-threaded-port" />
              <rect x="-22" y="64" width="44" height="28" className="top-port-collar" />
              <path d="M-34 92 H34 V150 H20 V115 H-20 V150 H-34 Z" className="top-port-seat" />
              <rect x="-10" y="0" width="20" height="150" className="red-fill top-port-fluid" />
            </g>
            <g className="top-port return-in-port" transform="translate(802 166)">
              <path d="M-28 0 H28 L22 8 L28 16 L22 24 L28 32 L22 40 L28 48 L22 56 L28 64 H-28 L-22 56 L-28 48 L-22 40 L-28 32 L-22 24 L-28 16 L-22 8 Z" className="top-threaded-port" />
              <rect x="-22" y="64" width="44" height="28" className="top-port-collar" />
              <path d="M-34 92 H34 V150 H20 V115 H-20 V150 H-34 Z" className="top-port-seat" />
              <rect x="-8" y="0" width="16" height="150" className="green-fill top-port-fluid" />
            </g>
            <g className="bleed-valve">
              <rect x="1122" y="298" width="52" height="37" className="bleed-threaded-sleeve" />
              <path d="M1126 305 l7 7 l7 -7 l7 7 l7 -7 l7 7 l7 -7" className="bleed-thread-lines" />
              <rect x="1170" y="303" width="47" height="29" className="green-fill bleed-green-plug" />
              <rect x="1217" y="296" width="48" height="43" className="bleed-threaded-end" />
              <path d="M1222 303 l8 7 l8 -7 l8 7 l8 -7" className="bleed-thread-lines" />
              <rect x="1254" y="305" width="15" height="26" className="black-cap" />
            </g>
          </g>

          <g className="right-reservoir-detail">
            <path className="reservoir-shell" d="M838 254 H1042 V620 H1018 V338 H990 V464 H1042 V482 H990 V604 H1018 V620 H838 Z" />
            <rect x="838" y="316" width="204" height="34" className="reservoir-top-rail" />
            <rect x="838" y="604" width="204" height="34" className="reservoir-bottom-rail" />
            <rect x="858" y="348" width="78" height="126" className="green-fill reservoir-green-chamber" />
            <rect x="858" y="536" width="78" height="122" className="green-fill reservoir-green-chamber" />
            <rect x="914" y="360" width="80" height="214" className="reservoir-piston" />
            <rect x="994" y="350" width="56" height="114" className="reservoir-window" />
            <rect x="994" y="482" width="56" height="122" className="reservoir-window" />
            <rect x="838" y="594" width="22" height="14" className="reservoir-seal" />
            <rect x="934" y="474" width="50" height="9" className="reservoir-seal" />
            <rect x="934" y="656" width="50" height="9" className="reservoir-seal" />
            <rect x="1026" y="604" width="30" height="24" className="reservoir-foot" />
          </g>

          <g className="sight-glass">
            <rect x="838" y="254" width="72" height="70" className="sight-dark-block" />
            <rect x="1070" y="254" width="66" height="70" className="sight-dark-block" />
            <rect x="866" y="266" width="242" height="24" className="sight-glass-channel" />
            <rect x="854" y="302" width="254" height="24" className="sight-shadow" />
            <rect x="854" y="280" width="278" height="31" className="green-fill sight-fluid" />
            <rect x="854" y="256" width="14" height="54" className="glass-end" />
            <rect x="1108" y="256" width="14" height="54" className="glass-end" />
          </g>

          <g className="level-indicator">
            <rect x="1028" y="456" width="32" height="36" className="level-collar" />
            <rect x="1058" y="464" width="292" height="35" className="indicator-glass" />
            <line x1="1044" y1="481" x2="1286" y2="481" className="indicator-line" />
            <line x1="1228" y1="464" x2="1228" y2="499" className="level-red-mark" />
            <line x1="1332" y1="464" x2="1332" y2="499" className="level-red-mark" />
            <rect x="1024" y="471" width="18" height="18" className="reservoir-seal" />
          </g>

          <g className="relief-valve">
            <rect x="746" y="588" width="62" height="16" className="green-fill relief-cap" />
            <rect x="750" y="604" width="54" height="86" className="relief-body" />
            <circle cx="777" cy="620" r="13" className="metal-ball" />
            <path d="M777 635 l-18 12 l36 13 l-36 13 l36 13" className="spring-zig vertical" />
            <rect x="762" y="690" width="30" height="42" className="relief-stem" />
            <path d="M762 696 h30 m-30 7 h30 m-30 7 h30 m-30 7 h30 m-30 7 h30" className="relief-thread-lines" />
            <rect x="758" y="732" width="38" height="12" className="relief-foot" />
          </g>

          <g className={autoMode ? 'pump auto-running' : 'pump'} style={{ '--pump-duration': pumpDuration, '--pump-power': pumpSpeed }}>
            <path
              d="M487 648 H611 L627 674 V706 H638 V742 H626 V764 H604 L591 796 H568 V773 H535 V828 H511 V773 H483 V796 H459 V764 H446 V735 H458 V700 H470 V674 Z"
              className="pump-housing"
            />
            <path
              className="pump-hatch-lines"
              d="M468 684 l36 -36 M458 714 l66 -66 M450 744 l94 -94 M462 770 l122 -122 M494 782 l116 -116 M567 648 l58 58 M590 674 l38 38 M590 724 l34 34"
            />
            <path className="green-fill pump-cavity" d="M499 686 H536 L552 702 V764 H498 Z" />
            <path className="green-fill pump-cavity" d="M564 686 H602 V764 H552 V702 Z" />
            <path className="pump-green-return" d="M600 646 H632 V778 H594" />
            <rect x="499" y="650" width="38" height="72" className="pump-dark-top" />
            <rect x="565" y="650" width="34" height="86" className="pump-dark-top" />
            <path className="pump-feed red" d="M520 604 V656" />
            <path className="pump-feed green" d="M582 592 V666" />
            <g className="pump-cartridge pump-cartridge-red">
              <rect x="512" y="650" width="18" height="103" rx="8" className="pump-cartridge-glass" />
              <line x1="521" y1="680" x2="521" y2="746" className="pump-cartridge-highlight" />
            </g>
            <g className="pump-cartridge pump-cartridge-green">
              <rect x="574" y="654" width="18" height="101" rx="8" className="pump-cartridge-glass" />
              <line x1="583" y1="682" x2="583" y2="748" className="pump-cartridge-highlight" />
            </g>
            <rect x="514" y="648" width="14" height="28" rx="3" className="pump-carousel-slug red" />
            <rect x="576" y="648" width="14" height="28" rx="3" className="pump-carousel-slug green" />
            <rect x="542" y="628" width="20" height="178" className="pump-static-shaft" />
            <line x1="551" y1="642" x2="551" y2="840" className="pump-center-rod" />
            <rect x="504" y="735" width="94" height="17" rx="7" className="pump-crossbar" />
            <rect x="536" y="624" width="42" height="16" className="pump-backplate-static" />
            <rect x="530" y="816" width="38" height="12" className="pump-bottom-notch" />
          </g>

        </g>

        <g transform="translate(585 146)">
          <PressureGauge pressure={pressure} />
        </g>
        <path className="gauge-pressure-tube" d="M585 191 V220 H620 V178 H654" />
        <rect x="574" y="190" width="22" height="24" className="gauge-mount-stem" />
        <rect x="565" y="212" width="42" height="16" className="gauge-mount-foot" />

        <g className="labels">
          <text x="360" y="82">PRESSURE OUT</text>
          <text x="852" y="94">RETURN IN</text>
          <text className="label-left" x="220" y="338">PRESSURE SWITCH</text>
          <text className="label-left" x="216" y="454">SOLENOID VALVE</text>
          <text className="label-left" x="220" y="650">PRESSURE MONITOR</text>
          <text x="654" y="850">PUMP</text>
          <text x="836" y="750">LOW PRESSURE</text>
          <text x="836" y="778">RELIEF VALVE</text>
          <text x="1096" y="660">RESERVOIR</text>
          <text x="976" y="232">SIGHT GLASS</text>
          <text x="1242" y="258">BLEED VALVE</text>
          <text x="1188" y="552">LEVEL INDICATOR</text>
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
