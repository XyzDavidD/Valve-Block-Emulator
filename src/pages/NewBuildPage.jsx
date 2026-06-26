import React from 'react';
import { NewBuildHydraulicDiagram } from '../components/NewBuildHydraulicDiagram.jsx';
import { useNewBuildEmulatorState } from '../hooks/useNewBuildEmulatorState.js';

export function NewBuildPage() {
  const emulator = useNewBuildEmulatorState();

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="H135 hydraulic valve block emulator new build">
        <NewBuildHydraulicDiagram
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
