import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientForm from './pages/clients/ClientForm';
import MatterList from './pages/matters/MatterList';
import MatterForm from './pages/matters/MatterForm';
import TaskList from './pages/tasks/TaskList';
import TaskForm from './pages/tasks/TaskForm';
import DocumentList from './pages/documents/DocumentList';
import DocumentForm from './pages/documents/DocumentForm';
import FeeList from './pages/fees/FeeList';
import FeeForm from './pages/fees/FeeForm';
import ComplianceCalendar from './pages/compliance/ComplianceCalendar';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Comms from './pages/comms/Comms';
import Settings from './pages/settings/Settings';
import Employees from './pages/employees/Employees';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import AttendancePage from './pages/employees/Attendance';
import PermissionsPage from './pages/employees/Permissions';
import LeavesPage from './pages/employees/Leaves';
import SalaryPage from './pages/employees/Salary';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center text-muted">Loading CRM...</div>;
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Component to redirect away from login if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="clients/new" element={<ClientForm />} />
        <Route path="clients/edit/:id" element={<ClientForm />} />
        <Route path="matters" element={<MatterList />} />
        <Route path="matters/new" element={<MatterForm />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="tasks/new" element={<TaskForm />} />
        <Route path="documents" element={<DocumentList />} />
        <Route path="documents/new" element={<DocumentForm />} />
        <Route path="fees" element={<FeeList />} />
        <Route path="fees/new" element={<FeeForm />} />
        <Route path="compliance" element={<ComplianceCalendar />} />
        <Route path="comms" element={<Comms />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/new" element={<EmployeeDetails />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="salary" element={<SalaryPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' } }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
