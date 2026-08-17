import { customFetch as fetch } from './apiMock';
import React, { useState, useEffect } from 'react';
import type { Permission, Employee } from '../../types/employee';

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [user, setUser] = useState<any>(null);

  // Form state for Admin manual entry (or employee entry)
  const [employeeId, setEmployeeId] = useState('');
  const [durationHours, setDurationHours] = useState('1');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async (u: any) => {
    if (u.role === 'Admin') {
      const [permRes, empRes] = await Promise.all([
        fetch('/api/permissions'),
        fetch('/api/employees')
      ]);
      setPermissions(await permRes.json());
      setEmployees(await empRes.json());
    } else {
      const permRes = await fetch(`/api/permissions?employeeId=${u.id}`);
      setPermissions(await permRes.json());
    }
  };

  useEffect(() => {
    const adminStr = '{ "role": "Admin", "id": "admin-123" }';
    if (adminStr) {
      const u = JSON.parse(adminStr);
      if (!u.role) u.role = 'Admin';
      setUser(u);
      fetchData(u);
    }
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = user.role === 'Admin' ? employeeId : user.id;
    if (!targetId) return;

    await fetch('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: targetId, date, durationHours: Number(durationHours), reason })
    });
    setReason('');
    fetchData(user);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await fetch(`/api/permissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData(user);
  };

  return (
    <div style={{ padding: '32px' }}>
      <h1 className="mb-6">{user?.role === 'Admin' ? 'Permissions Inbox' : 'My Short Permissions'}</h1>
      
      <div className="glass-card mb-6">
        <h3 className="mb-4">Request Short Leave / Permission</h3>
        <form onSubmit={handleRequest} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
          {user?.role === 'Admin' && (
            <div>
              <label className="form-label">Employee</label>
              <select className="form-input form-select" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
                <option value="">Select Employee...</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Duration</label>
            <select className="form-input form-select" value={durationHours} onChange={(e) => setDurationHours(e.target.value)}>
              <option value="1">1 Hour</option><option value="2">2 Hours</option><option value="3">3 Hours</option><option value="4">Half Day (4 hrs)</option>
            </select>
          </div>
          <div style={{ gridColumn: user?.role === 'Admin' ? 'span 2' : 'span 3' }}>
            <label className="form-label">Reason</label>
            <input type="text" className="form-input" value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Reason for permission..." />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Submit Request</button>
        </form>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {user?.role === 'Admin' && <th>Employee</th>}
                <th>Date</th><th>Duration</th><th>Reason</th><th>Status</th>
                {user?.role === 'Admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {permissions.map(perm => (
                <tr key={perm.id}>
                  {user?.role === 'Admin' && <td>{perm.employee?.firstName} {perm.employee?.lastName}</td>}
                  <td>{new Date(perm.date).toLocaleDateString()}</td>
                  <td>{perm.durationHours} hr(s)</td>
                  <td>{perm.reason}</td>
                  <td>
                    <span className={`badge badge-${perm.status === 'Approved' ? 'success' : perm.status === 'Rejected' ? 'danger' : 'warning'}`}>
                      {perm.status}
                    </span>
                  </td>
                  {user?.role === 'Admin' && (
                    <td>
                      {perm.status === 'Pending' && (
                        <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                          <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => handleStatusUpdate(perm.id, 'Approved')}>Approve</button>
                          <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleStatusUpdate(perm.id, 'Rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {permissions.length === 0 && <tr><td colSpan={6} style={{textAlign: 'center'}}>No records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
