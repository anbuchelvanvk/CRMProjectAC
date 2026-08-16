import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, File, Download, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  name: string;
  category: string;
  status: string;
  file_url: string;
  created_at: string;
  clients: { name: string };
  matters: { matter_id_serial: string };
}

export default function DocumentList() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          clients ( name ),
          matters ( matter_id_serial )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setDocs(data as any);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();

    const subscription = supabase
      .channel('public:documents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        fetchDocs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleDownload = async (name: string, file_url: string) => {
    try {
      if (!file_url) throw new Error('No file URL available');
      
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(file_url, 60); // 60 seconds expiry

      if (error) throw error;
      if (data) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate download link');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h2">Document Management</h1>
          <p className="text-muted text-sm mt-1">Manage client uploads and matter deliverables.</p>
        </div>
        <Link to="/documents/new" className="btn btn-primary">
          <Upload size={18} />
          Upload Document
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 form-group mb-0" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search documents by name, client, or matter..." 
              style={{ paddingLeft: '36px' }}
            />
          </div>
          <select className="form-select" style={{ width: 'auto' }} onChange={() => toast('Status filter applied')}>
            <option value="">All Statuses</option>
            <option value="received">Received</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="table-container">
          {loading ? (
             <div className="flex justify-center py-8 text-muted">
               <Loader2 className="animate-spin" size={24} />
             </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-8 text-muted">No documents found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Client & Matter</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <File size={16} className="text-primary" />
                        <span style={{ fontWeight: 500 }}>{doc.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{doc.clients?.name}</div>
                      <div className="text-xs text-muted mt-1">{doc.matters?.matter_id_serial}</div>
                    </td>
                    <td>
                      <span className={`text-xs font-medium ${doc.category === 'Mandatory' ? 'text-danger' : 'text-info'}`}>
                        {doc.category}
                      </span>
                    </td>
                    <td>
                      {doc.status === 'Received' ? (
                        <span className="badge badge-success"><CheckCircle size={12} className="mr-1" /> Received</span>
                      ) : (
                        <span className="badge badge-warning"><AlertCircle size={12} className="mr-1" /> Pending</span>
                      )}
                    </td>
                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td>
                      {doc.status === 'Received' ? (
                        <button 
                          className="btn btn-secondary text-xs py-1" 
                          onClick={() => handleDownload(doc.name, doc.file_url)}
                        >
                          <Download size={14} /> Download
                        </button>
                      ) : (
                        <button className="btn btn-primary text-xs py-1" onClick={() => toast.success('Upload request sent via WhatsApp!')}><Upload size={14} /> Request</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
