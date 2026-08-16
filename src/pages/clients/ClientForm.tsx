import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [initialFetchLoading, setInitialFetchLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Individual',
    mobile: '',
    email: '',
    pan: '',
    gstin: '',
    address: '',
    referral: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchClient = async () => {
        try {
          const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
          if (error) throw error;
          if (data) {
            setFormData({
              name: data.name || '',
              type: data.type || 'Individual',
              mobile: data.mobile || '',
              email: data.email || '',
              pan: data.pan || '',
              gstin: data.gstin || '',
              address: data.address || '',
              referral: data.referral || ''
            });
          }
        } catch (err: any) {
          setError('Failed to load client details.');
        } finally {
          setInitialFetchLoading(false);
        }
      };
      fetchClient();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Generate a simple ID if not editing
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const client_id_serial = `CLI-2024-${randomNum}`;

    try {
      if (isEditing) {
        const { error: dbError } = await supabase
          .from('clients')
          .update({
            ...formData,
            pan: formData.pan.toUpperCase(),
            gstin: formData.gstin.toUpperCase(),
          })
          .eq('id', id);
        
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('clients')
          .insert([
            {
              ...formData,
              client_id_serial,
              status: 'Active',
              pan: formData.pan.toUpperCase(),
              gstin: formData.gstin.toUpperCase(),
            }
          ]);

        if (dbError) {
          if (dbError.code === '23505') {
            throw new Error('A client with this PAN or Mobile already exists (Duplicate Check).');
          }
          throw dbError;
        }
      }
      
      navigate('/clients');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the client.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h2">{isEditing ? 'Edit Client' : 'Add New Client'}</h1>
          <p className="text-muted text-sm mt-1">{isEditing ? 'Update client information.' : 'Register a new client in the system.'}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/clients')} disabled={loading}>
            <X size={18} />
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Client
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-danger-light text-danger rounded-md text-sm border border-danger font-medium">
          {error}
        </div>
      )}

      {initialFetchLoading ? (
        <div className="flex justify-center py-8 text-muted">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
      <div className="card max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1 form-group">
              <label className="form-label">Client Name *</label>
              <input 
                type="text" 
                className="form-input" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                placeholder="Full name or company name"
              />
            </div>
            
            <div className="col-span-2 md:col-span-1 form-group">
              <label className="form-label">Client Type *</label>
              <select 
                className="form-select" 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                required
              >
                <option value="Individual">Individual</option>
                <option value="HUF">HUF</option>
                <option value="Partnership">Partnership Firm</option>
                <option value="LLP">LLP</option>
                <option value="Corporate">Corporate</option>
                <option value="Trust">Trust & Society</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-1 form-group">
              <label className="form-label">Mobile Number *</label>
              <input 
                type="tel" 
                className="form-input" 
                name="mobile" 
                value={formData.mobile} 
                onChange={handleChange} 
                required 
                placeholder="+91"
              />
            </div>

            <div className="col-span-2 md:col-span-1 form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="email@example.com"
              />
            </div>

            <div className="col-span-2 md:col-span-1 form-group">
              <label className="form-label">PAN Number</label>
              <input 
                type="text" 
                className="form-input" 
                name="pan" 
                value={formData.pan} 
                onChange={handleChange} 
                placeholder="ABCDE1234F"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="col-span-2 md:col-span-1 form-group">
              <label className="form-label">GSTIN</label>
              <input 
                type="text" 
                className="form-input" 
                name="gstin" 
                value={formData.gstin} 
                onChange={handleChange} 
                placeholder="22ABCDE1234F1Z5"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="col-span-2 form-group">
              <label className="form-label">Address</label>
              <textarea 
                className="form-input" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                rows={3}
                placeholder="Full registered address"
              />
            </div>

            <div className="col-span-2 md:col-span-1 form-group">
              <label className="form-label">Referral Source</label>
              <input 
                type="text" 
                className="form-input" 
                name="referral" 
                value={formData.referral} 
                onChange={handleChange} 
                placeholder="How did they hear about us?"
              />
            </div>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
