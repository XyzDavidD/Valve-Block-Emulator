import React from 'react';
import { useCallback, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const maxStickAngle = 32;

export function CyclicStick({ autoMode, stickPosition, onStickChange, onManualInterrupt, onToggleAuto }) {
  const padRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const stickAngle = stickPosition * maxStickAngle;

  const setFromPointer = useCallback(
    (event) => {
      const bounds = padRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const pivotX = bounds.left + bounds.width * 0.5;
      const pivotY = bounds.top + bounds.height * (205 / 260);
      const dx = event.clientX - pivotX;
      const dy = pivotY - event.clientY;
      const angle = Math.atan2(dx, Math.max(dy, bounds.height * 0.12)) * (180 / Math.PI);
      const position = clamp(angle / maxStickAngle, -1, 1);
      onStickChange(position);
    },
    [onStickChange],
  );

  const handlePointerDown = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    onManualInterrupt();
    setFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    setFromPointer(event);
  };

  const stopDragging = () => {
    setDragging(false);
  };

  return (
    <section className="stick-module" aria-label="Pilot cyclic stick">
      <div className="module-header">
        <div>
          <span className="module-kicker">Pilot Input</span>
          <h2>Cyclic Stick</h2>
        </div>
        <button className={autoMode ? 'auto-button active' : 'auto-button'} type="button" onClick={onToggleAuto}>
          AUTO
        </button>
      </div>

      <div
        ref={padRef}
        className={dragging ? 'stick-pad dragging' : 'stick-pad'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        role="slider"
        aria-valuemin="-1"
        aria-valuemax="1"
        aria-valuenow={Number(stickPosition.toFixed(2))}
        tabIndex="0"
      >
        <svg viewBox="0 0 360 260" aria-hidden="true">
          <path className="stick-arc" d="M70 198 A136 136 0 0 1 290 198" />
          <path className="stick-arc-tick" d="M82 184 L61 169" />
          <path className="stick-arc-tick" d="M180 62 L180 35" />
          <path className="stick-arc-tick" d="M278 184 L299 169" />
          <g transform={`translate(180 205) rotate(${stickAngle})`}>
            <line className="stick-shadow" x1="0" y1="0" x2="0" y2="-128" />
            <line className="stick-shaft" x1="0" y1="0" x2="0" y2="-128" />
            <rect className="stick-grip" x="-17" y="-153" width="34" height="38" rx="9" />
            <rect className="stick-grip-cap" x="-22" y="-158" width="44" height="13" rx="5" />
            <circle className="stick-pivot" cx="0" cy="0" r="14" />
            <circle className="stick-pivot-core" cx="0" cy="0" r="6" />
          </g>
          <text x="180" y="245" className="stick-readout">
            {stickPosition.toFixed(2)}
          </text>
        </svg>
      </div>
    </section>
  );
}
