import { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, CheckCircle, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Comms() {
  const [activeTab, setActiveTab] = useState('templates');
  const [showConfig, setShowConfig] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [config, setConfig] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: ''
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'Updates',
    content: ''
  });

  const [templates, setTemplates] = useState([
    { id: '1', name: 'Welcome Message', content: 'Dear [Client Name], welcome to [Firm Name]. We have successfully registered your profile.', type: 'Onboarding' },
    { id: '2', name: 'Payment Reminder', content: 'Dear [Client Name], this is a reminder for your pending fee of [Amount] for [Service].', type: 'Billing' },
    { id: '3', name: 'Document Request', content: 'We require [Document Name] to proceed with your [Matter Name]. Please upload it ASAP.', type: 'Action Required' },
    { id: '4', name: 'Task Completed', content: 'Good news! We have successfully filed your [Service Name].', type: 'Updates' },
  ]);

  useEffect(() => {
    // Check if previously connected in localStorage
    const savedConfig = localStorage.getItem('whatsapp_config');
    if (savedConfig) {
      setIsConnected(true);
      setConfig(JSON.parse(savedConfig));
    }
    // Load custom templates if any
    const savedTemplates = localStorage.getItem('whatsapp_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    
    // Simulate API validation delay
    setTimeout(() => {
      if (config.accessToken.length > 20) {
        localStorage.setItem('whatsapp_config', JSON.stringify(config));
        setIsConnected(true);
        setShowConfig(false);
        toast.success('Successfully connected to WhatsApp Cloud API!');
      } else {
        toast.error('Invalid Access Token. Please check your Meta Developer Dashboard.');
      }
      setIsConnecting(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect the WhatsApp API? Automated messages will stop.')) {
      localStorage.removeItem('whatsapp_config');
      setIsConnected(false);
      setConfig({ phoneNumberId: '', businessAccountId: '', accessToken: '' });
      toast.success('WhatsApp disconnected.');
    }
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTemplates = [...templates, { ...newTemplate, id: Date.now().toString() }];
    setTemplates(updatedTemplates);
    localStorage.setItem('whatsapp_templates', JSON.stringify(updatedTemplates));
    setShowTemplateBuilder(false);
    setNewTemplate({ name: '', type: 'Updates', content: '' });
    toast.success('New template created successfully!');
  };

  const insertVariable = (variable: string) => {
    setNewTemplate({ ...newTemplate, content: newTemplate.content + variable });
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== id);
      setTemplates(updatedTemplates);
      localStorage.setItem('whatsapp_templates', JSON.stringify(updatedTemplates));
      toast.success('Template deleted.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h2">WhatsApp Automation & Comms</h1>
          <p className="text-muted text-sm mt-1">Manage message templates and automated client notifications.</p>
        </div>
        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="badge badge-success"><CheckCircle size={14} className="mr-1"/> Connected</span>
            <button className="btn btn-secondary text-sm" onClick={() => setShowConfig(true)}>Configure</button>
            <button className="btn btn-secondary text-danger border-danger-light text-sm" onClick={handleDisconnect}>Disconnect</button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => setShowConfig(true)}>
            <MessageSquare size={18} />
            Connect WhatsApp API
          </button>
        )}
      </div>

      {showConfig && (
        <div className="card mb-6 border-primary-light shadow-lg">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-color)]">
            <h3 className="h3 text-primary">WhatsApp Meta API Configuration</h3>
            <button className="text-muted hover:text-[var(--text-main)]" onClick={() => setShowConfig(false)}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleConnect}>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="col-span-2 md:col-span-1 form-group">
                <label className="form-label">Phone Number ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. 10293847561"
                  value={config.phoneNumberId}
                  onChange={(e) => setConfig({...config, phoneNumberId: e.target.value})}
                />
              </div>
              <div className="col-span-2 md:col-span-1 form-group">
                <label className="form-label">WhatsApp Business Account ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. 987654321012"
                  value={config.businessAccountId}
                  onChange={(e) => setConfig({...config, businessAccountId: e.target.value})}
                />
              </div>
              <div className="col-span-2 form-group">
                <label className="form-label">Permanent Access Token</label>
                <input 
                  type="password" 
                  className="form-input" 
                  required 
                  placeholder="EAAI... (From Meta Developer Console)"
                  value={config.accessToken}
                  onChange={(e) => setConfig({...config, accessToken: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setShowConfig(false)} disabled={isConnecting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isConnecting}>
                {isConnecting ? <Loader2 className="animate-spin" size={18} /> : (isConnected ? 'Update Connection' : 'Verify & Connect')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-4 border-b border-[var(--border-color)] mb-6 pb-2">
        <button 
          className={`font-medium pb-2 ${activeTab === 'templates' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-[var(--text-main)]'}`}
          onClick={() => setActiveTab('templates')}
        >
          Message Templates
        </button>
        <button 
          className={`font-medium pb-2 ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-[var(--text-main)]'}`}
          onClick={() => setActiveTab('history')}
        >
          Communication History
        </button>
      </div>

      {showTemplateBuilder && (
        <div className="card mb-6 border-primary-light shadow-lg">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-color)]">
            <h3 className="h3 text-primary">Template Builder</h3>
            <button className="text-muted hover:text-[var(--text-main)]" onClick={() => setShowTemplateBuilder(false)}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSaveTemplate}>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="form-group">
                <label className="form-label">Template Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. GST Filing Reminder"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
                >
                  <option value="Onboarding">Onboarding</option>
                  <option value="Billing">Billing</option>
                  <option value="Action Required">Action Required</option>
                  <option value="Updates">Updates</option>
                </select>
              </div>
              
              <div className="col-span-2 form-group">
                <div className="flex justify-between items-end mb-2">
                  <label className="form-label mb-0">Message Content</label>
                  <div className="flex gap-2">
                    <button type="button" className="badge badge-primary cursor-pointer hover:bg-primary hover:text-white" onClick={() => insertVariable('[Client Name]')}>+ Client Name</button>
                    <button type="button" className="badge badge-primary cursor-pointer hover:bg-primary hover:text-white" onClick={() => insertVariable('[Amount]')}>+ Amount</button>
                    <button type="button" className="badge badge-primary cursor-pointer hover:bg-primary hover:text-white" onClick={() => insertVariable('[Service Name]')}>+ Service Name</button>
                  </div>
                </div>
                <textarea 
                  className="form-textarea" 
                  required 
                  rows={4}
                  placeholder="Draft your message here..."
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                />
                <p className="text-xs text-muted mt-1">Note: Variables like [Client Name] will be auto-replaced before sending.</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setShowTemplateBuilder(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Template</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'templates' ? (
        <div className="grid grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="card relative group">
              <button 
                className="absolute top-4 right-4 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteTemplate(tpl.id)}
                title="Delete Template"
              >
                <X size={16} />
              </button>
              <div className="flex justify-between items-start mb-4 pr-6">
                <div>
                  <h3 className="h4">{tpl.name}</h3>
                  <span className="badge badge-info mt-2">{tpl.type}</span>
                </div>
                <button 
                  className="btn btn-secondary text-xs p-2" 
                  onClick={() => isConnected ? toast.success(`Template '${tpl.name}' sent manually`) : toast.error('Please connect WhatsApp API first.')}
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--bg-main)', borderLeft: '4px solid var(--success)' }}>
                <p className="text-sm font-medium" style={{ color: '#128C7E' }}>WhatsApp Preview</p>
                <p className="text-sm mt-2">{tpl.content}</p>
              </div>
            </div>
          ))}
          
          <div 
            className="card flex flex-col items-center justify-center text-center p-8 border-dashed border-2 cursor-pointer hover:bg-[var(--bg-main)] transition-colors" 
            onClick={() => setShowTemplateBuilder(true)}
          >
            <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="h4 mb-1">Create New Template</h3>
            <p className="text-muted text-sm max-w-xs">Draft a new automated message using dynamic variables like [Client Name].</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 form-group mb-0" style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }} />
              <input type="text" className="form-input" placeholder="Search message history..." style={{ paddingLeft: '36px' }} />
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Message Type</th>
                  <th>Sent At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted">No recent communication history. Messages sent via the API will appear here.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
