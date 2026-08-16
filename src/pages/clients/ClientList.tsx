import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Edit, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  client_id_serial: string;
  name: string;
  type: string;
  mobile: string;
  email?: string;
  address?: string;
  gstin?: string;
  pan: string;
  status: string;
  created_at: string;
}

export default function ClientList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        toast.success(`${name} deleted successfully.`);
        fetchClients();
      } catch (error: any) {
        toast.error('Failed to delete client. They might be linked to existing matters.');
      }
    }
  };

  useEffect(() => {
    fetchClients();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchClients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.client_id_serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h2">Clients</h1>
          <p className="text-muted text-sm mt-1">Manage your client database.</p>
        </div>
        <Link to="/clients/new" className="btn btn-primary">
          <Plus size={18} />
          Add Client
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 form-group mb-0" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by name, PAN, mobile or Client ID..." 
              style={{ paddingLeft: '36px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => toast('Filter panel coming soon!', { icon: '🛠️' })}>
            <Filter size={18} />
            Filters
          </button>
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
                  <th>Client ID</th>
                  <th>Client Name</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>PAN</th>
                  <th>Status</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted">No clients found.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{client.client_id_serial}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{client.name}</div>
                      </td>
                      <td>{client.type}</td>
                      <td>{client.mobile}</td>
                      <td>{client.pan || '-'}</td>
                      <td>
                        <span className={`badge ${client.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                          {client.status}
                        </span>
                      </td>
                      <td>{client.created_at ? format(new Date(client.created_at), 'dd MMM, yyyy') : '-'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-muted hover:text-primary transition-colors" 
                            title="View Details"
                            onClick={() => {
                              alert(`Client Info:\n\nName: ${client.name}\nEmail: ${client.email || 'N/A'}\nAddress: ${client.address || 'N/A'}\nGSTIN: ${client.gstin || 'N/A'}`);
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          <Link 
                            to={`/clients/edit/${client.id}`} 
                            className="text-muted hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Link>
                          <div className="relative group">
                            <button className="text-muted hover:text-danger transition-colors cursor-pointer" title="Delete" onClick={() => handleDelete(client.id, client.name)}>
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted">Showing {filteredClients.length} of {clients.length} clients</span>
            <div className="flex gap-2">
              <button className="btn btn-secondary text-sm" onClick={() => toast('Previous page')}>Previous</button>
              <button className="btn btn-secondary text-sm" onClick={() => toast('Next page')}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
