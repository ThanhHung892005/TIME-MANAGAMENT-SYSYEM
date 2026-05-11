import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { useAnalyticsSummary, useCompletion, usePomodoroStats } from '@/hooks/useAnalytics';
import { analyticsService } from '@/services/analyticsService';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function Analytics() {
  const { data: summary } = useAnalyticsSummary();
  const { data: completion = [] } = useCompletion();
  const { data: pomodoro } = usePomodoroStats();

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      await analyticsService.exportReport(format);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport('csv')} className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('json')} className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')} className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />PDF
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Tasks Completed (Last 7 Days)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={completion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Productivity Trend">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={completion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

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
