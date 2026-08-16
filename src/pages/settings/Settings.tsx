import { useState } from 'react';
import { Save, User, Building, Shield, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="h2">Settings</h1>
          <p className="text-muted text-sm mt-1">Manage your firm preferences and system configurations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => toast.success('Settings saved successfully!')}>
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <div className="card p-2 flex flex-col gap-1">
            <button 
              className={`flex items-center gap-3 p-3 rounded-md text-left w-full transition-colors ${activeTab === 'profile' ? 'bg-primary-light text-primary font-medium' : 'hover:bg-[var(--bg-main)] text-muted'}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} /> My Profile
            </button>
            <button 
              className={`flex items-center gap-3 p-3 rounded-md text-left w-full transition-colors ${activeTab === 'firm' ? 'bg-primary-light text-primary font-medium' : 'hover:bg-[var(--bg-main)] text-muted'}`}
              onClick={() => setActiveTab('firm')}
            >
              <Building size={18} /> Firm Details
            </button>
            <button 
              className={`flex items-center gap-3 p-3 rounded-md text-left w-full transition-colors ${activeTab === 'security' ? 'bg-primary-light text-primary font-medium' : 'hover:bg-[var(--bg-main)] text-muted'}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={18} /> Security & Roles
            </button>
            <button 
              className={`flex items-center gap-3 p-3 rounded-md text-left w-full transition-colors ${activeTab === 'notifications' ? 'bg-primary-light text-primary font-medium' : 'hover:bg-[var(--bg-main)] text-muted'}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} /> Notifications
            </button>
          </div>
        </div>

        <div className="col-span-3">
          {activeTab === 'profile' && (
            <div className="card animate-fade-in">
              <h3 className="h4 mb-4 pb-4 border-b border-[var(--border-color)]">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled />
                  <p className="text-xs text-muted mt-1">Managed via Supabase Auth</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input type="text" className="form-input" value="Administrator" disabled />
                </div>
                
                <div className="col-span-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                  <h4 className="text-sm font-semibold mb-3">Account Security</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">Security Question</label>
                      <select 
                        className="form-select"
                        value={localStorage.getItem('sec_q') || ''}
                        onChange={(e) => localStorage.setItem('sec_q', e.target.value)}
                      >
                        <option value="">Select a question...</option>
                        <option value="What was your childhood nickname?">What was your childhood nickname?</option>
                        <option value="In what city did your parents meet?">In what city did your parents meet?</option>
                        <option value="What is the name of your favorite pet?">What is the name of your favorite pet?</option>
                        <option value="What high school did you attend?">What high school did you attend?</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Security Answer</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="Enter your answer"
                        value={localStorage.getItem('sec_a') || ''}
                        onChange={(e) => localStorage.setItem('sec_a', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'firm' && (
            <div className="card animate-fade-in">
              <h3 className="h4 mb-4 pb-4 border-b border-[var(--border-color)]">Firm Configuration</h3>
              <p className="text-muted text-sm mb-4">Firm settings are managed securely via environment variables and core database configuration.</p>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="card animate-fade-in">
              <h3 className="h4 mb-4 pb-4 border-b border-[var(--border-color)]">Security & Roles</h3>
              <p className="text-muted text-sm mb-4">Your account is secured by Supabase Row-Level Security (RLS). Only authenticated users can access the database.</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card animate-fade-in">
              <h3 className="h4 mb-4 pb-4 border-b border-[var(--border-color)]">Notifications</h3>
              <p className="text-muted text-sm mb-4">System notifications are routed through the WhatsApp Meta API and in-app Toasts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
