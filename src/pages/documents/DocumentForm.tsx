import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, UploadCloud } from 'lucide-react';

export default function DocumentForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matters, setMatters] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    matter_id: '',
    client_id: '',
    name: '',
    category: 'Mandatory'
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
    
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${formData.client_id}/${formData.matter_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. We don't get a public URL for private buckets. We just store the path.
      // 3. Insert record into documents table
      const { error: dbError } = await supabase.from('documents').insert([{
        matter_id: formData.matter_id,
        client_id: formData.client_id,
        name: formData.name || file.name,
        category: formData.category,
        file_url: filePath, // Storing the path, not a public URL, for security
        status: 'Received'
      }]);

      if (dbError) throw dbError;
      
      toast.success('Document uploaded successfully!');
      navigate('/documents');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error uploading document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-secondary p-2" onClick={() => navigate('/documents')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="h2">Upload Document</h1>
          <p className="text-muted text-sm mt-1">Upload client files or deliverables to secure cloud storage.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 mb-6">
            
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

            <div className="form-group">
              <label className="form-label">Document Name *</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder="e.g. FY 23-24 Bank Statement"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Mandatory">Mandatory KYC</option>
                <option value="Financials">Financials / Statements</option>
                <option value="Deliverable">Final Deliverable</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select File *</label>
              <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-8 text-center hover:bg-[var(--bg-main)] transition-colors relative">
                <input 
                  type="file" 
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
                <div className="flex flex-col items-center justify-center text-muted pointer-events-none">
                  <UploadCloud size={40} className="mb-2 text-primary" />
                  <p className="font-medium text-[var(--text-main)] mb-1">
                    {file ? file.name : 'Click or drag file to upload'}
                  </p>
                  <p className="text-xs">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, JPG, PNG or DOCX (Max 10MB)'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/documents')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
