import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Download, AlertCircle, Clock } from 'lucide-react';
import {
  useAnalyticsSummary, useCompletion, usePomodoroStats,
  useHeatmap, useOverdueStats, usePriorityStats
} from '@/hooks/useAnalytics';
import { analyticsService } from '@/services/analyticsService';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function Analytics() {
  const { data: summary } = useAnalyticsSummary();
  const { data: completion = [] } = useCompletion();
  const { data: pomodoro } = usePomodoroStats();
  const { data: heatmap = [] } = useHeatmap();
  const { data: overdue } = useOverdueStats();
  const { data: priority = [] } = usePriorityStats();

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      await analyticsService.exportReport(format);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="p-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <div className="flex gap-2">
          {(['csv', 'json', 'pdf'] as const).map(f => (
            <Button key={f} variant="secondary" size="sm" onClick={() => handleExport(f)} className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />{f.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Completed Today', value: summary.completedToday },
            { label: 'Total Tasks', value: summary.totalTasks },
            { label: 'Completion Rate', value: `${summary.completionRate}%` },
            { label: 'Pomodoros', value: summary.totalSessions },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Overdue & Due Soon */}
      {overdue && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-5 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdue.overdueCount}</p>
              <p className="text-xs text-red-500 mt-0.5">Overdue Tasks</p>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-5 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{overdue.dueSoonCount}</p>
              <p className="text-xs text-yellow-500 mt-0.5">Due in 24h</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tasks Completed (Last 7 Days)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={completion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tasks by Priority">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priority} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="priority" tick={{ fontSize: 11 }} width={50} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {priority.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Productivity Trend */}
      <ChartCard title="Productivity Trend">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={completion}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="completed" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Heatmap */}
      <ChartCard title="Activity Heatmap (Last 12 Weeks)">
        <HeatmapGrid data={heatmap} />
      </ChartCard>

      {/* Pomodoro Stats */}
      {pomodoro && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Pomodoro Stats</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold text-blue-600">{pomodoro.totalSessions}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{pomodoro.totalMinutes}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Minutes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{pomodoro.avgMinutes}</p>
              <p className="text-xs text-gray-500 mt-0.5">Avg Minutes/Session</p>
            </div>
          </div>
        </div>
      )}
      {/* Export Tags & Pomodoro */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Export Data</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">🏷️ Tags</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm"
                onClick={async () => { try { await analyticsService.exportTags('csv'); toast.success('Exported Tags CSV'); } catch { toast.error('Export failed'); } }}
                className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />CSV
              </Button>
              <Button variant="secondary" size="sm"
                onClick={async () => { try { await analyticsService.exportTags('json'); toast.success('Exported Tags JSON'); } catch { toast.error('Export failed'); } }}
                className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />JSON
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">🍅 Pomodoro Sessions</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm"
                onClick={async () => { try { await analyticsService.exportPomodoro('csv'); toast.success('Exported Pomodoro CSV'); } catch { toast.error('Export failed'); } }}
                className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />CSV
              </Button>
              <Button variant="secondary" size="sm"
                onClick={async () => { try { await analyticsService.exportPomodoro('json'); toast.success('Exported Pomodoro JSON'); } catch { toast.error('Export failed'); } }}
                className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />JSON
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function HeatmapGrid({ data }: { data: { date: string; count: number }[] }) {
  const countMap = Object.fromEntries(data.map(d => [d.date, d.count]));
  const maxCount = Math.max(...data.map(d => d.count), 1);

  // Tạo 12 tuần × 7 ngày
  const weeks: string[][] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 83); // 12 tuần = 84 ngày

  for (let w = 0; w < 12; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      week.push(date.toISOString().split('T')[0]!);
    }
    weeks.push(week);
  }

  const getColor = (date: string) => {
    const count = countMap[date] ?? 0;
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity < 0.5) return 'bg-blue-400 dark:bg-blue-700';
    if (intensity < 0.75) return 'bg-blue-500 dark:bg-blue-600';
    return 'bg-blue-700 dark:bg-blue-400';
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          <div className="h-3" />
          {days.map(d => (
            <div key={d} className="h-3 text-[9px] text-gray-400 flex items-center">{d}</div>
          ))}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            <div className="h-3 text-[9px] text-gray-400 text-center">
              {wi % 3 === 0 ? week[0]!.slice(5) : ''}
            </div>
            {week.map(date => (
              <div
                key={date}
                title={`${date}: ${countMap[date] ?? 0} tasks`}
                className={`w-3 h-3 rounded-sm ${getColor(date)} cursor-pointer hover:ring-1 hover:ring-blue-400`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}