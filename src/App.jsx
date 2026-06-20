import React from 'react';
import { ControlPanel } from './components/ControlPanel.jsx';
import { CyclicStick } from './components/CyclicStick.jsx';
import { HydraulicDiagram } from './components/HydraulicDiagram.jsx';
import { useEmulatorState } from './hooks/useEmulatorState.js';
import './styles/global.css';

export default function App() {
  const emulator = useEmulatorState();

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="H135 hydraulic valve block emulator">
        <header className="app-header">
          <div>
            <p className="eyebrow">HTML5 Technical Emulator Prototype</p>
            <h1>Hydraulic Valve Block</h1>
          </div>
          <div className="status-pill" data-mode={emulator.autoMode ? 'auto' : 'manual'}>
            {emulator.status}
          </div>
        </header>

        <div className="emulator-grid">
          <HydraulicDiagram
            pressure={emulator.pressure}
            pumpSpeed={emulator.pumpSpeed}
            flowIntensity={emulator.flowIntensity}
            solenoidOpen={emulator.solenoidOpen}
            testSwitchVisible={emulator.testSwitchVisible}
            onToggleSolenoid={emulator.toggleSolenoid}
          />

          <aside className="side-panel" aria-label="Emulator controls">
            <ControlPanel
              autoMode={emulator.autoMode}
              pressure={emulator.pressure}
              stickPosition={emulator.stickPosition}
              pumpSpeed={emulator.pumpSpeed}
              flowIntensity={emulator.flowIntensity}
              solenoidOpen={emulator.solenoidOpen}
              testSwitchVisible={emulator.testSwitchVisible}
              status={emulator.status}
              onToggleAuto={emulator.toggleAuto}
              onReset={emulator.reset}
              onToggleSolenoid={emulator.toggleSolenoid}
              onToggleTestSwitch={emulator.toggleTestSwitch}
            />

            <CyclicStick
              autoMode={emulator.autoMode}
              stickPosition={emulator.stickPosition}
              onStickChange={emulator.setManualStickPosition}
              onManualInterrupt={emulator.interruptAuto}
              onToggleAuto={emulator.toggleAuto}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}
