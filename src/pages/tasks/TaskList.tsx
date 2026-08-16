import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Filter, Paperclip, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  matter_id: string;
  matters: { matter_id_serial: string; clients: { name: string } };
  task_name: string;
  due_date: string;
  status: string;
  priority: string;
  assigned_staff_id: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          matters ( matter_id_serial, clients ( name ) )
        `)
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      if (data) setTasks(data as any);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    const subscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
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
          <h1 className="h2">Tasks & Work Progress</h1>
          <p className="text-muted text-sm mt-1">Track assignments and update progress.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => toast('Showing my tasks')}>My Tasks</button>
          <Link to="/tasks/new" className="btn btn-primary">Create Task</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="h4">Active Tasks</h3>
              <button className="btn btn-secondary text-sm py-1"><Filter size={14} /> Filter</button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8 text-muted">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted">No tasks found.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg border border-[var(--border-color)] hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-main)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" style={{ marginTop: '5px', transform: 'scale(1.2)' }} checked={task.status === 'Completed'} readOnly />
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{task.task_name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted mt-1">
                            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{task.matters?.matter_id_serial}</span>
                            <span>•</span>
                            <span>{task.matters?.clients?.name}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${task.status === 'Completed' ? 'badge-success' : task.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--border-color)]">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-danger font-medium">
                          <Clock size={14} />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted">
                          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '10px', fontWeight: 'bold' }}>
                            Unk
                          </div>
                          <span>Staff</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="btn btn-secondary text-xs py-1"><Paperclip size={14} /> Attach</button>
                        <button className="btn btn-secondary text-xs py-1"><MessageSquare size={14} /> Update</button>
                        <button className="btn btn-primary text-xs py-1">Mark Complete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
