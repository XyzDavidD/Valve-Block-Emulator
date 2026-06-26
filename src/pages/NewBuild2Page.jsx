import React from 'react';
import { NewBuild2HydraulicDiagram } from '../components/NewBuild2HydraulicDiagram.jsx';
import { useEmulatorState } from '../hooks/useEmulatorState.js';

export function NewBuild2Page() {
  const emulator = useEmulatorState();

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="H135 hydraulic valve block emulator new build 2">
        <NewBuild2HydraulicDiagram
          pressure={emulator.pressure}
          pumpSpeed={emulator.pumpSpeed}
          flowIntensity={emulator.flowIntensity}
          solenoidOpen={emulator.solenoidOpen}
          stickPosition={emulator.stickPosition}
          autoMode={emulator.autoMode}
          onStickChange={emulator.setManualStickPosition}
          onStickInterrupt={emulator.interruptAuto}
          onToggleAuto={emulator.toggleAuto}
          onToggleSolenoid={emulator.toggleSolenoid}
        />
      </section>
    </main>
  );
}
