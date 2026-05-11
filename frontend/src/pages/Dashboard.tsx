import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Calendar, Timer, TrendingUp } from 'lucide-react';
import { useAnalyticsSummary } from '@/hooks/useAnalytics';
import { useUserStore } from '@/store/userStore';
import { formatDate, getDeadlineColor } from '@/utils/dateHelpers';
import { PRIORITY_COLORS } from '@/utils/constants';

export function Dashboard() {
  const { user } = useUserStore();
  const { data: summary, isLoading } = useAnalyticsSummary();

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Good {getGreeting()}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here's your productivity overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<CheckCircle className="w-5 h-5 text-green-500" />} label="Completed Today" value={summary.completedToday} color="green" />
            <StatCard icon={<Clock className="w-5 h-5 text-blue-500" />} label="Total Tasks" value={summary.totalTasks} color="blue" />
            <StatCard icon={<Timer className="w-5 h-5 text-purple-500" />} label="Pomodoros Done" value={summary.totalSessions} color="purple" />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-orange-500" />} label="Completion Rate" value={`${summary.completionRate}%`} color="orange" />
          </div>

          {summary.upcomingDeadlines.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Upcoming Deadlines
              </h2>
              <div className="space-y-3">
                {summary.upcomingDeadlines.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{task.title}</span>
                    </div>
                    <span className={`text-xs font-medium ${getDeadlineColor(task.deadline)}`}>
                      {formatDate(task.deadline)}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/tasks" className="inline-block mt-4 text-sm text-blue-600 hover:underline">
                View all tasks →
              </Link>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const bgMap: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
  };
  return (
    <div className={`${bgMap[color] ?? ''} rounded-xl p-5 flex flex-col gap-3`}>
      {icon}
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
