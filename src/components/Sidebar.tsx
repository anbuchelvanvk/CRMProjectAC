import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  IndianRupee, 
  CheckSquare, 
  MessageCircle, 
  Calendar, 
  Settings,
  UserCheck,
  Clock,
  Banknote,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', path: '/clients', icon: Users },
  { name: 'Matters', path: '/matters', icon: Briefcase },
  { name: 'Tasks & Progress', path: '/tasks', icon: CheckSquare },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Fees', path: '/fees', icon: IndianRupee },
  { name: 'Communications', path: '/comms', icon: MessageCircle },
  { name: 'Compliance Calendar', path: '/compliance', icon: Calendar },
  { name: 'Team Directory', path: '/employees', icon: UserCheck },
  { name: 'Attendance', path: '/attendance', icon: Clock },
  { name: 'Permissions', path: '/permissions', icon: ShieldCheck },
  { name: 'Leaves', path: '/leaves', icon: Calendar },
  { name: 'Salary', path: '/salary', icon: Banknote },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Briefcase size={20} />
        </div>
        <div className="sidebar-logo-text">CRM Pro</div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.path} className="sidebar-nav-item">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 600 }}>
            AD
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--sidebar-text)' }}>Admin User</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--sidebar-text-muted)' }}>Principal</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
