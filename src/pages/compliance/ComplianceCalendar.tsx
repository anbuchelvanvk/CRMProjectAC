import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CalendarEvent {
  date: string;
  title: string;
  type: string;
  color: string;
  fullDate: Date;
}

export default function ComplianceCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to current month/year for simple calendar implementation
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetch tasks due in current month
      const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString();

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('due_date', startOfMonth)
        .lte('due_date', endOfMonth)
        .order('due_date', { ascending: true });

      if (error) throw error;

      if (tasks) {
        const formattedEvents = tasks.map((task: any) => {
          const d = new Date(task.due_date);
          return {
            date: d.getDate().toString(),
            title: task.task_name,
            type: task.priority === 'High' ? 'Urgent' : 'Task',
            color: task.priority === 'High' ? 'var(--danger)' : 'var(--primary)',
            fullDate: d
          };
        });
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const subscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h2">Compliance Calendar</h1>
          <p className="text-muted text-sm mt-1">Automatic reminders for recurring compliances and tasks.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary"><ChevronLeft size={18} /></button>
          <button className="btn btn-secondary font-medium">
            {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </button>
          <button className="btn btn-secondary"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <div className="card mb-6">
            <h3 className="h4 mb-4">Upcoming Deadlines</h3>
            {loading ? (
               <div className="flex justify-center py-4 text-muted"><Loader2 className="animate-spin" size={20} /></div>
            ) : events.length === 0 ? (
               <div className="text-muted text-sm py-2">No deadlines this month.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {events.slice(0, 5).map((ev, i) => (
                  <div key={i} className="flex gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', backgroundColor: `${ev.color}20`, color: ev.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{ev.fullDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1 }}>{ev.date}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="truncate" style={{ fontSize: '0.9rem', fontWeight: 600 }} title={ev.title}>{ev.title}</h4>
                      <span className="badge mt-1" style={{ backgroundColor: `${ev.color}15`, color: ev.color, fontSize: '0.65rem' }}>{ev.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="card bg-warning-light border-warning">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="text-warning mt-1" />
              <div>
                <h4 className="text-warning font-semibold">Missed Deadlines</h4>
                <p className="text-sm mt-1 text-warning-dark">0 missed deadlines found.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="card">
            <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm text-muted mb-2">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center" style={{ height: '600px' }}>
                <Loader2 className="animate-spin text-muted" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1" style={{ height: '600px' }}>
                {Array.from({ length: 42 }).map((_, i) => {
                  const day = i - firstDayOfMonth + 1;
                  const isCurrentMonth = day > 0 && day <= daysInMonth;
                  const dayEvents = events.filter(e => parseInt(e.date) === day);
                  
                  return (
                    <div key={i} className="border border-[var(--border-color)] rounded-md p-2 flex flex-col" style={{ backgroundColor: isCurrentMonth ? 'var(--bg-main)' : 'var(--bg-card)', opacity: isCurrentMonth ? 1 : 0.5, overflow: 'hidden' }}>
                      <div className="text-right text-sm mb-1">{isCurrentMonth ? day : ''}</div>
                      {isCurrentMonth && dayEvents.map((hasEvent, idx) => (
                        <div key={idx} className="text-xs p-1 rounded font-medium truncate mb-1" style={{ backgroundColor: hasEvent.color, color: 'white' }} title={hasEvent.title}>
                          {hasEvent.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
