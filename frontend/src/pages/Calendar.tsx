import { useState, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import _withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import type { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarTasks, useUpdateDeadline } from '@/hooks/useCalendar';
import type { Task } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

type WithDnD = typeof _withDragAndDrop;
// Handle CJS default export interop (Vite may not unwrap __esModule: true automatically)
const withDragAndDrop = ((_withDragAndDrop as unknown as { default: WithDnD }).default ?? _withDragAndDrop) as WithDnD;

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
});

type CalendarEvent = { id: string; title: string; start: Date; end: Date; resource: Task };

const DnDCalendar = withDragAndDrop<CalendarEvent>(BigCalendar);

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);

  const { data: tasks = [] } = useCalendarTasks(start, end);
  const updateDeadline = useUpdateDeadline();

  const events = useMemo<CalendarEvent[]>(() =>
    tasks
      .filter((t) => t.deadline)
      .map((task) => ({
        id: task.id,
        title: task.title,
        start: new Date(task.deadline!),
        end: new Date(task.deadline!),
        resource: task,
      })),
    [tasks],
  );

  const handleEventDrop = ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
    updateDeadline.mutate({
      id: event.id,
      deadline: new Date(start as Date).toISOString(),
    });
  };

  const handleEventResize = ({ event, end }: EventInteractionArgs<CalendarEvent>) => {
    updateDeadline.mutate({
      id: event.id,
      deadline: new Date(end as Date).toISOString(),
    });
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const colorMap: Record<string, string> = {
      HIGH: '#EF4444',
      MEDIUM: '#F59E0B',
      LOW: '#10B981',
    };
    return {
      style: {
        backgroundColor: colorMap[event.resource.priority] ?? '#3B82F6',
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        fontSize: '12px',
        cursor: 'grab',
      },
    };
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ml-2">
            {(['month', 'week', 'day'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                  view === v
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { priority: 'HIGH', label: 'High Priority', color: '#EF4444' },
          { priority: 'MEDIUM', label: 'Medium Priority', color: '#F59E0B' },
          { priority: 'LOW', label: 'Low Priority', color: '#10B981' },
        ].map(({ priority, label, color }) => (
          <div key={priority} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 italic">Drag events to reschedule</span>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-auto">
        <DnDCalendar
          localizer={localizer}
          events={events}
          view={view}
          date={currentDate}
          onNavigate={setCurrentDate}
          onView={setView}
          eventPropGetter={eventStyleGetter}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
          style={{ height: 600 }}
        />
      </div>
    </div>
  );
}
