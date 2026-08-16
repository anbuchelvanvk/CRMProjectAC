import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function TaskForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matters, setMatters] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    matter_id: '',
    task_name: '',
    due_date: '',
    priority: 'Medium',
    status: 'In Progress'
  });

  useEffect(() => {
    const fetchMatters = async () => {
      const { data } = await supabase.from('matters').select('id, matter_id_serial, clients(name)');
      if (data) setMatters(data);
    };
    fetchMatters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('tasks').insert([formData]);
      if (error) throw error;
      
      toast.success('Task created successfully!');
      navigate('/tasks');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error creating task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-secondary p-2" onClick={() => navigate('/tasks')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="h2">Create New Task</h1>
          <p className="text-muted text-sm mt-1">Assign a workflow task to a specific matter.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="form-group">
              <label className="form-label">Task Name *</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder="e.g. File GSTR-1"
                value={formData.task_name}
                onChange={(e) => setFormData({...formData, task_name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Related Matter *</label>
              <select 
                className="form-select" 
                required
                value={formData.matter_id}
                onChange={(e) => setFormData({...formData, matter_id: e.target.value})}
              >
                <option value="">-- Choose Matter --</option>
                {matters.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.matter_id_serial} - {m.clients?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select 
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/tasks')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
