import React from 'react';

export function ControlPanel({
  autoMode,
  pressure,
  stickPosition,
  pumpSpeed,
  flowIntensity,
  solenoidOpen,
  testSwitchVisible,
  status,
  onToggleAuto,
  onReset,
  onToggleSolenoid,
  onToggleTestSwitch,
}) {
  return (
    <section className="control-panel">
      <div className="module-header">
        <div>
          <span className="module-kicker">System</span>
          <h2>Controls</h2>
        </div>
        <span className="panel-status">{status}</span>
      </div>

      <div className="control-actions">
        <button className={autoMode ? 'primary-button active' : 'primary-button'} type="button" onClick={onToggleAuto}>
          {autoMode ? 'Stop Auto' : 'Start Auto'}
        </button>
        <button className="secondary-button" type="button" onClick={onReset}>
          Reset
        </button>
      </div>

      <dl className="telemetry-grid">
        <div>
          <dt>Pressure</dt>
          <dd>{pressure.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Stick</dt>
          <dd>{stickPosition.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Pump</dt>
          <dd>{pumpSpeed.toFixed(2)}x</dd>
        </div>
        <div>
          <dt>Flow</dt>
          <dd>{flowIntensity.toFixed(2)}</dd>
        </div>
      </dl>

      <div className="switch-row">
        <button className="secondary-button wide" type="button" onClick={onToggleTestSwitch}>
          {testSwitchVisible ? 'Hide Test Switch' : 'Show Test Switch'}
        </button>
      </div>

      {testSwitchVisible && (
        <div className="test-switch" aria-label="Solenoid valve test switch">
          <span>Solenoid Test</span>
          <button
            className={solenoidOpen ? 'toggle-switch on' : 'toggle-switch'}
            type="button"
            aria-pressed={solenoidOpen}
            onClick={onToggleSolenoid}
          >
            <span />
            {solenoidOpen ? 'Open' : 'Closed'}
          </button>
        </div>
      )}
    </section>
  );
}
