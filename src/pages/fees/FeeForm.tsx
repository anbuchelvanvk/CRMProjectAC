import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function FeeForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matters, setMatters] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    invoice_id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    matter_id: '',
    client_id: '',
    total_amount: '',
    advance_paid: '0',
  });

  useEffect(() => {
    const fetchMatters = async () => {
      const { data } = await supabase.from('matters').select('id, matter_id_serial, client_id, clients(name)');
      if (data) setMatters(data);
    };
    fetchMatters();
  }, []);

  const handleMatterChange = (matterId: string) => {
    const selectedMatter = matters.find(m => m.id === matterId);
    if (selectedMatter) {
      setFormData({ ...formData, matter_id: matterId, client_id: selectedMatter.client_id });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const total = parseFloat(formData.total_amount);
      const advance = parseFloat(formData.advance_paid);
      const balance = total - advance;

      const { error } = await supabase.from('fees').insert([{
        invoice_id: formData.invoice_id,
        matter_id: formData.matter_id,
        client_id: formData.client_id,
        total_amount: total,
        advance_paid: advance,
        balance: balance,
        status: balance <= 0 ? 'Fully Paid' : (advance > 0 ? 'Advance Paid' : 'Pending')
      }]);

      if (error) throw error;
      
      toast.success('Invoice generated successfully!');
      navigate('/fees');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error generating invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-secondary p-2" onClick={() => navigate('/fees')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="h2">Create Invoice</h1>
          <p className="text-muted text-sm mt-1">Generate a new fee quotation or invoice.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="form-group">
              <label className="form-label">Invoice ID (Auto-generated)</label>
              <input 
                type="text" 
                className="form-input bg-[var(--bg-main)]" 
                value={formData.invoice_id}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Related Matter & Client *</label>
              <select 
                className="form-select" 
                required
                value={formData.matter_id}
                onChange={(e) => handleMatterChange(e.target.value)}
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
                <label className="form-label">Total Fee Amount (₹) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Advance Paid (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="0"
                  step="0.01"
                  value={formData.advance_paid}
                  onChange={(e) => setFormData({...formData, advance_paid: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/fees')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
