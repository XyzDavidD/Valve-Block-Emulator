import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (start, end, amount) => start + (end - start) * amount;

const initialState = {
  autoMode: false,
  stickPosition: 0,
  pressure: 103,
  pumpSpeed: 0.25,
  flowIntensity: 0.25,
  solenoidOpen: true,
  testSwitchVisible: false,
  pausedByUser: true,
};

export function useNewBuildEmulatorState() {
  const [autoMode, setAutoMode] = useState(initialState.autoMode);
  const [stickPosition, setStickPosition] = useState(initialState.stickPosition);
  const [pressure, setPressure] = useState(initialState.pressure);
  const [pumpSpeed, setPumpSpeed] = useState(initialState.pumpSpeed);
  const [flowIntensity, setFlowIntensity] = useState(initialState.flowIntensity);
  const [solenoidOpen, setSolenoidOpen] = useState(initialState.solenoidOpen);
  const [testSwitchVisible, setTestSwitchVisible] = useState(initialState.testSwitchVisible);
  const [pausedByUser, setPausedByUser] = useState(initialState.pausedByUser);
  const frameRef = useRef();
  const currentStickRef = useRef(initialState.stickPosition);
  const pressureRef = useRef(initialState.pressure);
  const pumpSpeedRef = useRef(initialState.pumpSpeed);
  const flowIntensityRef = useRef(initialState.flowIntensity);
  const manualStickRef = useRef(initialState.stickPosition);
  const autoPhaseRef = useRef(0);
  const lastTimeRef = useRef();

  const deriveSignals = useCallback((position, movementSpeed, solenoidIsOpen) => {
    const valveFactor = solenoidIsOpen ? 1 : 0.58;
    const targetPressure = 103 + position * 10 + Math.abs(position) * 4 + movementSpeed * 3.4;
    const nextPressure = lerp(pressureRef.current, targetPressure * valveFactor + 48 * (1 - valveFactor), 0.06);
    pressureRef.current = clamp(nextPressure, 72, 122);

    const targetPumpSpeed = clamp(0.2 + movementSpeed * 0.42 + Math.abs(position) * 0.34, 0.18, 1.15);
    const targetFlowIntensity = clamp(0.22 + Math.abs(position) * 0.42 + movementSpeed * 0.2, 0.16, 0.88);
    pumpSpeedRef.current = lerp(pumpSpeedRef.current, targetPumpSpeed, 0.08);
    flowIntensityRef.current = lerp(flowIntensityRef.current, solenoidIsOpen ? targetFlowIntensity : targetFlowIntensity * 0.48, 0.08);

    return {
      pressure: pressureRef.current,
      pumpSpeed: pumpSpeedRef.current,
      flowIntensity: flowIntensityRef.current,
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const tick = (now) => {
      if (!mounted) return;
      const previousTime = lastTimeRef.current ?? now;
      const delta = clamp((now - previousTime) / 1000, 0.016, 0.05);
      lastTimeRef.current = now;

      if (autoMode) {
        autoPhaseRef.current += delta * 0.82;
      }

      const targetStick = autoMode ? Math.sin(autoPhaseRef.current) * 0.92 : manualStickRef.current;
      const smoothing = autoMode ? 0.06 : 0.32;
      const nextStick = lerp(currentStickRef.current, targetStick, smoothing);
      const movementSpeed = Math.min(Math.abs(nextStick - currentStickRef.current) / delta, 1.2);
      currentStickRef.current = clamp(nextStick, -1, 1);

      const signals = deriveSignals(currentStickRef.current, movementSpeed, solenoidOpen);
      setStickPosition(currentStickRef.current);
      setPressure(signals.pressure);
      setPumpSpeed(signals.pumpSpeed);
      setFlowIntensity(signals.flowIntensity);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [autoMode, deriveSignals, solenoidOpen]);

  const interruptAuto = useCallback(() => {
    setAutoMode(false);
    setPausedByUser(false);
  }, []);

  const setManualStickPosition = useCallback((value) => {
    const nextValue = clamp(value, -1, 1);
    manualStickRef.current = nextValue;
    currentStickRef.current = lerp(currentStickRef.current, nextValue, 0.72);
    setStickPosition(currentStickRef.current);
    setPausedByUser(false);
  }, []);

  const toggleAuto = useCallback(() => {
    setAutoMode((current) => {
      const next = !current;
      setPausedByUser(!next);
      if (!next) {
        manualStickRef.current = currentStickRef.current;
      } else {
        const normalized = clamp(currentStickRef.current / 0.92, -1, 1);
        autoPhaseRef.current = Math.asin(normalized);
        lastTimeRef.current = undefined;
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    currentStickRef.current = initialState.stickPosition;
    manualStickRef.current = initialState.stickPosition;
    autoPhaseRef.current = 0;
    lastTimeRef.current = undefined;
    pressureRef.current = initialState.pressure;
    pumpSpeedRef.current = initialState.pumpSpeed;
    flowIntensityRef.current = initialState.flowIntensity;
    setAutoMode(false);
    setStickPosition(initialState.stickPosition);
    setPressure(initialState.pressure);
    setPumpSpeed(initialState.pumpSpeed);
    setFlowIntensity(initialState.flowIntensity);
    setSolenoidOpen(true);
    setPausedByUser(true);
  }, []);

  const toggleSolenoid = useCallback(() => {
    setSolenoidOpen((current) => !current);
  }, []);

  const toggleTestSwitch = useCallback(() => {
    setTestSwitchVisible((current) => !current);
  }, []);

  const status = useMemo(() => {
    if (autoMode) return 'Auto running';
    return pausedByUser ? 'Paused' : 'Manual';
  }, [autoMode, pausedByUser]);

  return {
    autoMode,
    stickPosition,
    pressure,
    pumpSpeed,
    flowIntensity,
    solenoidOpen,
    testSwitchVisible,
    status,
    interruptAuto,
    setManualStickPosition,
    toggleAuto,
    reset,
    toggleSolenoid,
    toggleTestSwitch,
  };
}
