import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Matter {
  id: string;
  matter_id_serial: string;
  client_id: string;
  clients: { name: string };
  service_type: string;
  priority: string;
  due_date: string;
  status: string;
  assigned_staff_id: string; // we'll just show ID or placeholder for now until profiles table is made
}

export default function MatterList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatters = async () => {
    try {
      const { data, error } = await supabase
        .from('matters')
        .select(`
          *,
          clients ( name )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setMatters(data as any);
    } catch (error) {
      console.error('Error fetching matters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatters();

    const subscription = supabase
      .channel('public:matters')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matters' }, () => {
        fetchMatters();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'In Progress': return 'badge-info';
      case 'Completed': return 'badge-success';
      case 'Filed': return 'badge-success';
      case 'Awaiting Dept Response': return 'badge-warning';
      case 'Pending Documents': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return 'text-danger';
    if (priority === 'Medium') return 'text-warning';
    return 'text-muted';
  };

  const filteredMatters = matters.filter(m => 
    m.matter_id_serial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h2">Matters</h1>
          <p className="text-muted text-sm mt-1">Manage ongoing and completed matters.</p>
        </div>
        <Link to="/matters/new" className="btn btn-primary">
          <Plus size={18} />
          New Matter
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 form-group mb-0" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by client, matter number, or service..." 
              style={{ paddingLeft: '36px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ width: 'auto' }} onChange={() => toast('Filtering by service applied')}>
            <option value="">All Services</option>
            <option value="GST">GST Compliance</option>
            <option value="IT">Income Tax</option>
            <option value="Audit">Audit</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} onChange={() => toast('Filtering by status applied')}>
            <option value="">All Statuses</option>
            <option value="progress">In Progress</option>
            <option value="pending">Pending Documents</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="table-container">
          {loading ? (
             <div className="flex justify-center py-8 text-muted">
               <Loader2 className="animate-spin" size={24} />
             </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Matter Info</th>
                  <th>Client</th>
                  <th>Service Type</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted">No matters found.</td>
                  </tr>
                ) : (
                  filteredMatters.map((matter) => (
                    <tr key={matter.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{matter.matter_id_serial}</div>
                        <div className="flex items-center gap-1 text-xs mt-1">
                          <AlertCircle size={12} className={getPriorityColor(matter.priority)} />
                          <span className={getPriorityColor(matter.priority)}>{matter.priority} Priority</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{matter.clients?.name || 'Unknown Client'}</div>
                      </td>
                      <td>{matter.service_type}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-muted" />
                          <span>{matter.due_date ? new Date(matter.due_date).toLocaleDateString('en-GB') : '-'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(matter.status)}`}>
                          {matter.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary text-xs py-1" onClick={() => toast(`Opening details for ${matter.matter_id_serial}`)}>View Details</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
