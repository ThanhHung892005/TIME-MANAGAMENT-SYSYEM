import { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { useQuery } from '@tanstack/react-query';
import { pomodoroService } from '@/services/pomodoroService';
import { formatRelative } from '@/utils/dateHelpers';

export function Pomodoro() {
  const [linkedTaskId, setLinkedTaskId] = useState<string | undefined>();
  const { pomodoro, setPomodoroSettings } = useSettingsStore();
  const { data: tasks = [] } = useTasks();
  const { data: history = [] } = useQuery({
    queryKey: ['pomodoro', 'history'],
    queryFn: () => pomodoroService.getHistory(20),
  });

  const { phase, minutes, seconds, progress, isRunning, start, pause, resume, reset } = usePomodoro(linkedTaskId);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Pomodoro Timer</h1>

      <div className="flex flex-col items-center mb-8">
        <div className="flex gap-2 mb-6">
          {(['standard', 'long'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPomodoroSettings({ mode, ...{ standard: { workMinutes: 25, breakMinutes: 5 }, long: { workMinutes: 50, breakMinutes: 10 } }[mode] })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${pomodoro.mode === mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="relative w-52 h-52">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
            <circle
              cx="100" cy="100" r={radius} fill="none"
              stroke={phase === 'work' ? '#3B82F6' : '#10B981'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold font-mono text-gray-900 dark:text-gray-100">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`text-sm font-medium capitalize mt-1 ${phase === 'work' ? 'text-blue-500' : 'text-green-500'}`}>
              {phase === 'work' ? 'Focus Time' : 'Break Time'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={reset} aria-label="Reset timer" className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <RotateCcw className="w-5 h-5 text-gray-500" />
          </button>
          <Button
            onClick={isRunning ? pause : (progress === 0 ? start : resume)}
            size="lg"
            className="flex items-center gap-2 px-8"
          >
            {isRunning ? <><Pause className="w-5 h-5" />Pause</> : <><Play className="w-5 h-5" />Start</>}
          </Button>
          <button onClick={reset} aria-label="Skip phase" className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <SkipForward className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Link to task</label>
        <select
          value={linkedTaskId ?? ''}
          onChange={(e) => setLinkedTaskId(e.target.value || undefined)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No task linked</option>
          {tasks.filter((t) => t.status !== 'COMPLETED').map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Sessions</h2>
          <div className="space-y-2">
            {history.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.type === 'work' ? 'bg-blue-500' : 'bg-green-500'}`} />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{s.type}</span>
                  {s.task && <span className="text-gray-400 truncate max-w-32">— {s.task.title}</span>}
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span>{Math.floor(s.duration / 60)}m</span>
                  <span>{formatRelative(s.startedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
