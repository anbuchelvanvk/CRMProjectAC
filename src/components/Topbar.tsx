import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Topbar() {
  const { signOut } = useAuth();

  return (
    <header className="topbar">
      <div className="flex items-center gap-2" style={{ width: '300px' }}>
        <div className="flex items-center gap-2" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', width: '100%' }}>
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search clients, matters, documents..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-main)' }}>
          <Bell size={20} className="text-muted" />
          <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
        </button>
        <button 
          onClick={signOut}
          className="btn btn-secondary text-danger border-danger-light hover:bg-danger-light" 
          style={{ padding: '0.5rem', width: '40px', height: '40px', borderRadius: '50%' }}
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
