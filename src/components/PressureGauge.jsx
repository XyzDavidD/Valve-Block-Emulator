import React from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function PressureGauge({ pressure }) {
  const normalized = clamp((pressure - 70) / 60, 0, 1);
  const angle = -125 + normalized * 250;

  return (
    <g className="pressure-gauge" aria-label={`Pressure ${pressure.toFixed(1)}`}>
      <circle cx="0" cy="0" r="45" className="gauge-bezel" />
      <circle cx="0" cy="0" r="38" className="gauge-face" />
      {Array.from({ length: 14 }).map((_, index) => {
        const tickAngle = -125 + index * (250 / 13);
        const isMajor = index % 3 === 0;
        return (
          <line
            key={tickAngle}
            className={isMajor ? 'gauge-tick gauge-tick-major' : 'gauge-tick'}
            x1="0"
            y1={isMajor ? '-31' : '-34'}
            x2="0"
            y2="-38"
            transform={`rotate(${tickAngle})`}
          />
        );
      })}
      <line
        className="gauge-needle"
        x1="0"
        y1="7"
        x2="0"
        y2="-29"
        transform={`rotate(${angle})`}
      />
      <circle cx="0" cy="0" r="5" className="gauge-hub" />
      <text x="0" y="28" className="gauge-value">
        {pressure.toFixed(1)}
      </text>
    </g>
  );
}
