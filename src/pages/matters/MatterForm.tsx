import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function MatterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    matter_id_serial: `MAT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    client_id: '',
    service_type: 'GST',
    priority: 'Medium',
    due_date: '',
    status: 'In Progress'
  });

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('clients').select('id, name');
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('matters').insert([formData]);
      if (error) throw error;
      
      toast.success('Matter created successfully!');
      navigate('/matters');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error creating matter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-secondary p-2" onClick={() => navigate('/matters')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="h2">Create New Matter</h1>
          <p className="text-muted text-sm mt-1">Open a new service request or case for a client.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="form-group">
              <label className="form-label">Matter ID (Auto-generated)</label>
              <input 
                type="text" 
                className="form-input bg-[var(--bg-main)]" 
                value={formData.matter_id_serial}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Select Client *</label>
              <select 
                className="form-select" 
                required
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              >
                <option value="">-- Choose Client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Type *</label>
              <select 
                className="form-select"
                value={formData.service_type}
                onChange={(e) => setFormData({...formData, service_type: e.target.value})}
              >
                <option value="GST">GST Compliance</option>
                <option value="Income Tax">Income Tax Return</option>
                <option value="Audit">Statutory Audit</option>
                <option value="Company Incorporation">Company Incorporation</option>
                <option value="Consulting">Consulting</option>
              </select>
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
              <label className="form-label">Initial Status</label>
              <select 
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="In Progress">In Progress</option>
                <option value="Pending Documents">Pending Documents</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/matters')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Matter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
