import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, FileText, Plus, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Fee {
  id: string;
  invoice_id: string;
  total_amount: number;
  advance_paid: number;
  balance: number;
  status: string;
  created_at: string;
  clients: { name: string };
  matters: { matter_id_serial: string };
}

export default function FeeList() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFees = async () => {
    try {
      const { data, error } = await supabase
        .from('fees')
        .select(`
          *,
          clients ( name ),
          matters ( matter_id_serial )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setFees(data as any);
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();

    const subscription = supabase
      .channel('public:fees')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fees' }, () => {
        fetchFees();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const totalOutstanding = fees.reduce((sum, fee) => sum + Number(fee.balance), 0);
  const totalCollected = fees.reduce((sum, fee) => sum + Number(fee.advance_paid), 0);
  const pendingCount = fees.filter(f => f.balance > 0).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h2">Fee Management</h1>
          <p className="text-muted text-sm mt-1">Track fee quotations, advances, and full payments.</p>
        </div>
        <Link to="/fees/new" className="btn btn-primary">
          <Plus size={18} />
          Create Invoice
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card text-center py-6">
          <h3 className="text-muted text-sm font-medium mb-2">Total Outstanding</h3>
          <div className="h1 text-danger">₹{totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="card text-center py-6">
          <h3 className="text-muted text-sm font-medium mb-2">Total Collected</h3>
          <div className="h1 text-success" style={{ color: 'var(--secondary)' }}>₹{totalCollected.toLocaleString()}</div>
        </div>
        <div className="card text-center py-6">
          <h3 className="text-muted text-sm font-medium mb-2">Pending Invoices</h3>
          <div className="h1">{pendingCount}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 form-group mb-0" style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by client or invoice number..." 
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        <div className="table-container">
          {loading ? (
             <div className="flex justify-center py-8 text-muted">
               <Loader2 className="animate-spin" size={24} />
             </div>
          ) : fees.length === 0 ? (
            <div className="text-center py-8 text-muted">No invoices found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client / Matter</th>
                  <th>Total Fee</th>
                  <th>Advance Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id}>
                    <td><span style={{ fontWeight: 600 }}>{fee.invoice_id}</span></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{fee.clients?.name}</div>
                      <div className="text-xs text-muted mt-1">{fee.matters?.matter_id_serial}</div>
                    </td>
                    <td>₹{fee.total_amount.toLocaleString()}</td>
                    <td>₹{fee.advance_paid.toLocaleString()}</td>
                    <td><span className={fee.balance > 0 ? 'text-danger font-medium' : 'text-success font-medium'}>₹{fee.balance.toLocaleString()}</span></td>
                    <td>
                      <span className={`badge ${fee.status === 'Fully Paid' ? 'badge-success' : fee.status === 'Advance Paid' ? 'badge-info' : 'badge-warning'}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary text-xs py-1" onClick={() => toast('Payment gateway integration pending', { icon: '💳' })}><IndianRupee size={14} /> Record Pay</button>
                        <button className="btn btn-secondary text-xs py-1" onClick={() => toast.success(`Generating receipt for ${fee.invoice_id}`)}><FileText size={14} /> Receipt</button>
                      </div>
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
