import React from 'react';
import { HydraulicDiagram } from './components/HydraulicDiagram.jsx';
import { useEmulatorState } from './hooks/useEmulatorState.js';
import { NewBuild2Page } from './pages/NewBuild2Page.jsx';
import { NewBuildPage } from './pages/NewBuildPage.jsx';
import './styles/global.css';

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '');

  if (path === '/newbuild') {
    return <NewBuildPage />;
  }

  if (path === '/newbuild2') {
    return <NewBuild2Page />;
  }

  return <MainBuildPage />;
}

function MainBuildPage() {
  const emulator = useEmulatorState();

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="H135 hydraulic valve block emulator">
        <HydraulicDiagram
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
