import { useState, useRef, useCallback, useEffect } from 'react';
import { pomodoroService } from '@/services/pomodoroService';
import { useSettingsStore } from '@/store/settingsStore';

type Phase = 'work' | 'break';

const STORAGE_KEY = 'time-manager:pomodoro-state';

type StoredPomodoroState = {
  phase: Phase;
  secondsLeft: number;
  isRunning: boolean;
  currentSessionId: string | null;
  lastUpdatedAt: number;
  settings: {
    workMinutes: number;
    breakMinutes: number;
    mode: 'standard' | 'long' | 'custom';
  };
};

export function usePomodoro(linkedTaskId?: string) {
  const { pomodoro, setPomodoroSettings } = useSettingsStore();
  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(pomodoro.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;
  const skipNextSettingsSyncRef = useRef(false);

  const totalSeconds = phase === 'work'
    ? pomodoro.workMinutes * 60
    : pomodoro.breakMinutes * 60;

  // Reset display when mode/minutes change, but NOT when pausing or restoring from localStorage
  useEffect(() => {
    if (skipNextSettingsSyncRef.current) {
      skipNextSettingsSyncRef.current = false;
      return;
    }
    if (!isRunningRef.current) {
      setSecondsLeft(totalSeconds);
    }
  }, [totalSeconds]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw) as StoredPomodoroState;
      const elapsed = saved.isRunning
        ? Math.floor((Date.now() - saved.lastUpdatedAt) / 1000)
        : 0;
      const remaining = Math.max(saved.secondsLeft - elapsed, 0);

      skipNextSettingsSyncRef.current = true;
      setPomodoroSettings(saved.settings);
      setPhase(saved.phase);
      setSecondsLeft(remaining);
      setCurrentSessionId(saved.currentSessionId);

      if (remaining > 0 && saved.isRunning) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
        localStorage.removeItem(STORAGE_KEY);
        if (saved.currentSessionId) {
          pomodoroService.endSession(saved.currentSessionId).catch(() => null);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [setPomodoroSettings]);

  useEffect(() => {
    if (!currentSessionId && !isRunning) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const state: StoredPomodoroState = {
      phase,
      secondsLeft,
      isRunning,
      currentSessionId,
      lastUpdatedAt: Date.now(),
      settings: {
        workMinutes: pomodoro.workMinutes,
        breakMinutes: pomodoro.breakMinutes,
        mode: pomodoro.mode,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [phase, secondsLeft, isRunning, currentSessionId, pomodoro.workMinutes, pomodoro.breakMinutes, pomodoro.mode]);

  const playBeep = useCallback(() => {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  }, []);

  const handleTimerEnd = useCallback(async () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    playBeep();

    if (currentSessionId) {
      await pomodoroService.endSession(currentSessionId).catch(() => null);
      setCurrentSessionId(null);
    }
    localStorage.removeItem(STORAGE_KEY);

    const nextPhase: Phase = phase === 'work' ? 'break' : 'work';
    setPhase(nextPhase);
    setSecondsLeft(
      nextPhase === 'work' ? pomodoro.workMinutes * 60 : pomodoro.breakMinutes * 60,
    );
  }, [phase, currentSessionId, playBeep, pomodoro]);

  useEffect(() => {
    document.title = isRunning
      ? `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')} — ${phase === 'work' ? 'Focus' : 'Break'}`
      : 'Time Management';
  }, [secondsLeft, isRunning, phase]);

  const runCountdown = useCallback(() => {
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { handleTimerEnd(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [handleTimerEnd]);

  const start = useCallback(async () => {
    const session = await pomodoroService.startSession({
      duration: totalSeconds,
      type: phase,
      taskId: linkedTaskId,
    }).catch(() => null);

    if (session) setCurrentSessionId(session.id);

    runCountdown();
    setIsRunning(true);
  }, [phase, totalSeconds, linkedTaskId, runCountdown]);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    runCountdown();
    setIsRunning(true);
  }, [runCountdown]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    setSecondsLeft(phase === 'work' ? pomodoro.workMinutes * 60 : pomodoro.breakMinutes * 60);
    if (currentSessionId) {
      pomodoroService.endSession(currentSessionId).catch(() => null);
      setCurrentSessionId(null);
    }
    localStorage.removeItem(STORAGE_KEY);
  }, [phase, pomodoro, currentSessionId]);

  const skipPhase = useCallback(() => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    if (currentSessionId) {
      pomodoroService.endSession(currentSessionId).catch(() => null);
      setCurrentSessionId(null);
    }
    localStorage.removeItem(STORAGE_KEY);
    const nextPhase: Phase = phase === 'work' ? 'break' : 'work';
    setPhase(nextPhase);
    setSecondsLeft(nextPhase === 'work' ? pomodoro.workMinutes * 60 : pomodoro.breakMinutes * 60);
  }, [phase, pomodoro, currentSessionId]);

  useEffect(() => {
    if (isRunning && !intervalRef.current) {
      runCountdown();
    }
  }, [isRunning, runCountdown]);

  useEffect(() => () => clearInterval(intervalRef.current!), []);

  const progress = 1 - secondsLeft / totalSeconds;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return { phase, minutes, seconds, progress, isRunning, start, pause, resume, reset, skipPhase, setPhase };
}
