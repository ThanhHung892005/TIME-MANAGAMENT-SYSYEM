import { useState, useRef, useCallback, useEffect } from 'react';
import { pomodoroService } from '@/services/pomodoroService';
import { useSettingsStore } from '@/store/settingsStore';

type Phase = 'work' | 'break';

export function usePomodoro(linkedTaskId?: string) {
  const { pomodoro } = useSettingsStore();
  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(pomodoro.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = phase === 'work'
    ? pomodoro.workMinutes * 60
    : pomodoro.breakMinutes * 60;

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

  const start = useCallback(async () => {
    const session = await pomodoroService.startSession({
      duration: totalSeconds,
      type: phase,
      taskId: linkedTaskId,
    }).catch(() => null);

    if (session) setCurrentSessionId(session.id);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { handleTimerEnd(); return 0; }
        return prev - 1;
      });
    }, 1000);
    setIsRunning(true);
  }, [phase, totalSeconds, linkedTaskId, handleTimerEnd]);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { handleTimerEnd(); return 0; }
        return prev - 1;
      });
    }, 1000);
    setIsRunning(true);
  }, [handleTimerEnd]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    setSecondsLeft(phase === 'work' ? pomodoro.workMinutes * 60 : pomodoro.breakMinutes * 60);
    if (currentSessionId) {
      pomodoroService.endSession(currentSessionId).catch(() => null);
      setCurrentSessionId(null);
    }
  }, [phase, pomodoro, currentSessionId]);

  useEffect(() => () => clearInterval(intervalRef.current!), []);

  const progress = 1 - secondsLeft / totalSeconds;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return { phase, minutes, seconds, progress, isRunning, start, pause, resume, reset, setPhase };
}
