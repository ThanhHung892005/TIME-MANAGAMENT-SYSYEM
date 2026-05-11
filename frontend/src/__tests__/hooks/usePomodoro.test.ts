import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePomodoro } from '@/hooks/usePomodoro';

vi.mock('@/services/pomodoroService', () => ({
  pomodoroService: {
    startSession: vi.fn().mockResolvedValue({ id: 'session-1' }),
    endSession: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: vi.fn(() => ({
    pomodoro: { workMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, mode: 'standard' },
  })),
}));

const mockOscillator = {
  connect: vi.fn(),
  frequency: { value: 0 },
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  connect: vi.fn(),
  gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
};

const mockAudioContext = {
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGain),
  destination: {},
  currentTime: 0,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('usePomodoro', () => {
  it('initialises in work phase with full duration', () => {
    const { result } = renderHook(() => usePomodoro());

    expect(result.current.phase).toBe('work');
    expect(result.current.minutes).toBe(25);
    expect(result.current.seconds).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('start() sets isRunning to true and creates a session', async () => {
    const { pomodoroService } = await import('@/services/pomodoroService');
    const { result } = renderHook(() => usePomodoro());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(pomodoroService.startSession).toHaveBeenCalledWith({
      duration: 25 * 60,
      type: 'work',
      taskId: undefined,
    });
  });

  it('pause() stops the timer', async () => {
    const { result } = renderHook(() => usePomodoro());
    await act(async () => { await result.current.start(); });

    act(() => { result.current.pause(); });

    expect(result.current.isRunning).toBe(false);
  });

  it('resume() restarts the timer', async () => {
    const { result } = renderHook(() => usePomodoro());
    await act(async () => { await result.current.start(); });
    act(() => { result.current.pause(); });

    act(() => { result.current.resume(); });

    expect(result.current.isRunning).toBe(true);
  });

  it('counts down seconds over time', async () => {
    const { result } = renderHook(() => usePomodoro());
    await act(async () => { await result.current.start(); });

    act(() => { vi.advanceTimersByTime(3000); });

    expect(result.current.minutes).toBe(24);
    expect(result.current.seconds).toBe(57);
  });

  it('progress increases as time passes', async () => {
    const { result } = renderHook(() => usePomodoro());
    await act(async () => { await result.current.start(); });

    act(() => { vi.advanceTimersByTime(60000); });

    expect(result.current.progress).toBeGreaterThan(0);
  });

  it('reset() stops timer and restores full duration', async () => {
    const { result } = renderHook(() => usePomodoro());
    await act(async () => { await result.current.start(); });
    act(() => { vi.advanceTimersByTime(5000); });

    act(() => { result.current.reset(); });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.minutes).toBe(25);
    expect(result.current.seconds).toBe(0);
  });

  it('passes linkedTaskId to startSession', async () => {
    const { pomodoroService } = await import('@/services/pomodoroService');
    const { result } = renderHook(() => usePomodoro('task-123'));

    await act(async () => { await result.current.start(); });

    expect(pomodoroService.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: 'task-123' }),
    );
  });
});
