import React from 'react';
import { PressureGauge } from './PressureGauge.jsx';

export function HydraulicDiagram({
  pressure,
  pumpSpeed,
  flowIntensity,
  solenoidOpen,
  testSwitchVisible,
  onToggleSolenoid,
}) {
  const redDash = `${Math.max(2.8, 5.8 - flowIntensity * 1.8)}s`;
  const greenDash = `${Math.max(2.6, 5.4 - flowIntensity * 1.7)}s`;
  const pumpDuration = `${Math.max(1.8, 4.8 - pumpSpeed * 1.7)}s`;
  const labels = [
    { id: 'pressure-out', x: 382, y: 102, width: 150, lines: ['PRESSURE OUT'], leader: 'M532 101 L570 132' },
    { id: 'return-in', x: 790, y: 106, width: 120, lines: ['RETURN IN'], leader: 'M846 112 L806 172' },
    { id: 'pressure-switch', x: 76, y: 330, width: 150, lines: ['PRESSURE SWITCH'], leader: 'M226 344 L304 319' },
    { id: 'solenoid', x: 76, y: 424, width: 138, lines: ['SOLENOID VALVE'], leader: 'M214 438 L306 440' },
    { id: 'monitor', x: 72, y: 620, width: 158, lines: ['PRESSURE MONITOR'], leader: 'M230 634 L322 607' },
    { id: 'pump', x: 500, y: 776, width: 86, lines: ['PUMP'], leader: 'M543 760 L551 728' },
    { id: 'relief', x: 792, y: 708, width: 160, lines: ['LOW PRESSURE', 'RELIEF VALVE'], leader: 'M788 704 L775 640' },
    { id: 'reservoir', x: 1010, y: 606, width: 116, lines: ['RESERVOIR'], leader: 'M1010 594 L966 548' },
    { id: 'sight-glass', x: 962, y: 248, width: 128, lines: ['SIGHT GLASS'], leader: 'M1016 274 L1016 316' },
    { id: 'bleed', x: 1180, y: 262, width: 120, lines: ['BLEED VALVE'], leader: 'M1220 288 L1220 316' },
    { id: 'level', x: 1138, y: 530, width: 158, lines: ['LEVEL INDICATOR'], leader: 'M1218 516 L1218 488' },
  ];
  const handleSolenoidKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggleSolenoid();
    }
  };

  return (
    <section className="diagram-panel" aria-label="Hydraulic valve block diagram">
      <svg
        className="hydraulic-svg"
        viewBox="0 0 1380 820"
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

        <rect width="1380" height="820" className="diagram-background" />

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
          <rect x="862" y="260" width="172" height="330" className="reservoir-shell" />
          <rect x="922" y="346" width="70" height="172" className="reservoir-window" />
          <rect x="355" y="296" width="76" height="76" className="black-cap" />
          <rect x="327" y="496" width="92" height="76" className="black-cap" />
        </g>

        <g className="green-flow" style={{ '--flow-duration': greenDash, '--flow-opacity': 0.44 + flowIntensity * 0.14 }}>
          <path className="flow-base green" d="M431 346 H512 V431 H471 V532 H667 V451 H798" />
          <path className="flow-base green" d="M657 615 V532 H905 V602 H959 V316 H1137" />
          <path className="flow-base green" d="M703 346 H737 V512 H596 V652 H532 V713" />
          <path className="flow-base green" d="M872 623 V712 H767 V642" />
          <path className="flow-dash green" d="M431 346 H512 V431 H471 V532 H667 V451 H798" />
          <path className="flow-dash green" d="M657 615 V532 H905 V602 H959 V316 H1137" />
          <path className="flow-dash green" d="M703 346 H737 V512 H596 V652 H532 V713" />
          <path className="flow-dash green" d="M872 623 V712 H767 V642" />
        </g>

        <g
          className={solenoidOpen ? 'red-flow' : 'red-flow restricted'}
          style={{ '--flow-duration': redDash, '--flow-opacity': solenoidOpen ? 0.46 + flowIntensity * 0.13 : 0.24 }}
        >
          <path className="flow-base red" d="M430 305 H566 V266 H667 V171" />
          <path className="flow-base red" d="M681 330 H838 V382 H768 V443 H906" />
          <path className="flow-base red" d="M430 497 H517 V370 H604 V424 H873" />
          <path className="flow-base red" d="M394 572 V632 H569 V604" />
          <path className="flow-base red" d="M596 604 V660 H651" />
          <path className="flow-dash red" d="M430 305 H566 V266 H667 V171" />
          <path className="flow-dash red" d="M681 330 H838 V382 H768 V443 H906" />
          <path className="flow-dash red" d="M430 497 H517 V370 H604 V424 H873" />
          <path className="flow-dash red" d="M394 572 V632 H569 V604" />
          <path className="flow-dash red" d="M596 604 V660 H651" />
        </g>

        <g className="components">
          <g className="pressure-switch">
            <rect x="255" y="284" width="105" height="70" className="component-shell" />
            <rect x="327" y="296" width="36" height="48" className={solenoidOpen ? 'valve-indicator-open' : 'valve-indicator-closed'} />
            <line x1="226" y1="319" x2="255" y2="319" className="thin-line" />
            <path d="M272 302 h42 v35 h-42 v-9 h20 v-17 h-20 z" className="switch-trace" />
            <path d="M315 309 h19" className="spring-line" />
            <path d="M317 335 h19" className="spring-line" />
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
              <rect x="234" y="405" width="150" height="70" className="component-shell" />
              <rect x="247" y="418" width="55" height="44" className="coil-fill" />
              <path d="M303 441 h53" className="spring-line heavy" />
              <circle cx="384" cy="440" r="14" className={solenoidOpen ? 'hotspot-dot open' : 'hotspot-dot closed'} />
              <rect x="370" y="421" width="22" height="38" className={solenoidOpen ? 'valve-indicator-open' : 'valve-indicator-closed'} />
            </g>
          </g>

          <g className="pressure-monitor">
            <rect x="238" y="592" width="76" height="32" className="component-shell" />
            <rect x="322" y="586" width="72" height="44" className="component-shell" />
            <path d="M315 607 h62" className="spring-line heavy" />
            <circle cx="377" cy="607" r="11" className="hotspot-dot" />
          </g>

          <g className="core-valves">
            <rect x="595" y="318" width="118" height="53" className="metal-sleeve" />
            <rect x="642" y="283" width="44" height="122" className="red-fill" />
            <rect x="712" y="323" width="82" height="48" className="spring-box" />
            <path d="M730 346 l9 -18 l9 36 l9 -36 l9 36 l9 -36 l9 18" className="spring-zig" />
            <rect x="704" y="445" width="184" height="106" className="large-spool" />
            <path d="M719 494 h108 l40 -30 v60 l-40 -30" className="red-fill" />
            <rect x="674" y="456" width="68" height="68" className="spring-box green-spring-box" />
            <path d="M688 490 l8 -22 l8 44 l8 -44 l8 44 l8 -44 l8 22" className="spring-zig" />
            <circle cx="723" cy="490" r="14" className="hotspot-dot" />
          </g>

          <g className="ports">
            <g transform="translate(664 172)">
              <path d="M-23 0 h46 v107 h-46 z" className="threaded-port" />
              <path d="M-16 0 l32 0 m-32 13 h32 m-32 13 h32 m-32 13 h32 m-32 13 h32" className="port-thread-lines" />
              <rect x="-10" y="0" width="20" height="108" className="red-fill" />
            </g>
            <g transform="translate(802 170)">
              <path d="M-23 0 h46 v130 h-46 z" className="threaded-port" />
              <path d="M-16 0 l32 0 m-32 13 h32 m-32 13 h32 m-32 13 h32 m-32 13 h32" className="port-thread-lines" />
              <rect x="-8" y="0" width="16" height="130" className="green-fill" />
            </g>
            <line x1="1145" y1="316" x2="1210" y2="316" className="bleed-body" />
            <rect x="1136" y="303" width="80" height="28" className="component-shell" />
            <rect x="1211" y="298" width="35" height="38" className="threaded-port" />
            <rect x="1240" y="305" width="13" height="24" className="black-cap" />
          </g>

          <g className="sight-glass">
            <rect x="923" y="293" width="236" height="34" className="glass-tube" />
            <rect x="901" y="286" width="24" height="48" className="glass-end" />
            <rect x="1159" y="286" width="24" height="48" className="glass-end" />
            <rect x="941" y="304" width="196" height="13" className="green-fill transparent" />
          </g>

          <g className="level-indicator">
            <line x1="1038" y1="488" x2="1268" y2="488" className="indicator-line" />
            <rect x="1038" y="471" width="262" height="34" className="indicator-glass" />
            <line x1="1226" y1="471" x2="1226" y2="505" className="level-red-mark" />
            <line x1="1288" y1="471" x2="1288" y2="505" className="level-red-mark" />
          </g>

          <g className="relief-valve">
            <rect x="748" y="593" width="54" height="92" className="component-shell" />
            <circle cx="775" cy="608" r="13" className="metal-ball" />
            <path d="M775 621 l-17 13 l34 13 l-34 13 l34 13" className="spring-zig vertical" />
            <rect x="762" y="685" width="27" height="38" className="threaded-port" />
          </g>

          <g className="pump" style={{ '--pump-duration': pumpDuration, '--pump-power': pumpSpeed }}>
            <path
              d="M492 661 H606 C624 682 630 724 612 762 H482 C462 724 469 683 492 661 Z"
              className="pump-housing"
            />
            <rect x="516" y="672" width="70" height="70" className="green-fill pump-chamber" />
            <g transform="translate(551 725)">
              <g className="pump-rotor">
                <line x1="-42" y1="0" x2="42" y2="0" className="pump-blade" />
                <line x1="0" y1="-54" x2="0" y2="54" className="pump-blade secondary" />
                <circle cx="0" cy="0" r="8" className="pump-hub" />
              </g>
            </g>
            <rect x="541" y="633" width="20" height="108" className="pump-piston" />
            <rect x="530" y="624" width="42" height="15" className="pump-plate" />
          </g>

          {testSwitchVisible && (
            <g className="test-switch-callout">
              <path d="M266 405 C206 388 188 337 223 300" />
              <rect x="118" y="250" width="112" height="42" rx="6" />
              <text x="176" y="281">
                TEST
              </text>
              <circle cx="240" cy="298" r="6" className={solenoidOpen ? 'test-light open' : 'test-light closed'} />
            </g>
          )}
        </g>

        <g transform="translate(585 146)">
          <PressureGauge pressure={pressure} />
        </g>

        <g className="label-leaders">
          {labels.map((label) => (
            <path key={label.id} d={label.leader} />
          ))}
        </g>

        <g className="labels">
          {labels.map((label) => {
            const height = label.lines.length > 1 ? 44 : 28;
            return (
              <g key={label.id} className="label-callout" transform={`translate(${label.x} ${label.y})`}>
                <rect x="0" y="0" width={label.width} height={height} rx="5" />
                <text x={label.width / 2} y={label.lines.length > 1 ? 17 : 19}>
                  {label.lines.map((line, index) => (
                    <tspan key={line} x={label.width / 2} dy={index === 0 ? 0 : 16}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </section>
  );
}
