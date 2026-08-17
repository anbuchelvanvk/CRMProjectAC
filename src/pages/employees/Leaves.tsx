import { customFetch as fetch } from './apiMock';
import React, { useState, useEffect } from 'react';

const Leaves = () => {
  const [balance, setBalance] = useState<any>({ annual: 14, sick: 7, casual: 7 });
  const [requests, setRequests] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const [type, setType] = useState('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchData = async (u: any) => {
    if (u.role === 'Admin') {
      const res = await fetch('/api/advanced/leaves');
      setRequests(await res.json());
    } else {
      const res = await fetch(`/api/advanced/leaves/${u.id}`);
      const data = await res.json();
      if (data.balance) setBalance(data.balance);
      if (data.requests) setRequests(data.requests);
    }
  };

  useEffect(() => {
    const adminStr = '{ "role": "Admin", "id": "admin-123" }';
    if (adminStr) {
      const u = JSON.parse(adminStr);
      if (!u.role) u.role = 'Admin'; // Admins don't have a role property in the DB
      setUser(u);
      fetchData(u);
    }
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await fetch('/api/advanced/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: user.id, type, startDate, endDate, reason })
    });
    setStartDate(''); setEndDate(''); setReason('');
    fetchData(user);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await fetch(`/api/advanced/leaves/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData(user);
  };

  const renderTable = () => (
    <table className="table">
      <thead>
        <tr>
          {user?.role === 'Admin' && <th>Employee</th>}
          <th>Type</th><th>Duration</th><th>Reason</th><th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {requests.map(req => (
          <tr key={req.id}>
            {user?.role === 'Admin' && <td>{req.employee?.firstName} {req.employee?.lastName}</td>}
            <td>{req.type}</td>
            <td>{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
            <td>{req.reason}</td>
            <td>
              <span className={`badge badge-${req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : req.status === 'Withdrawn' ? 'warning' : 'warning'}`}>
                {req.status}
              </span>
            </td>
            <td>
              {user?.role === 'Admin' && req.status === 'Pending' && (
                <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                  <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => handleStatusUpdate(req.id, 'Approved')}>Approve</button>
                  <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleStatusUpdate(req.id, 'Rejected')}>Reject</button>
                </div>
              )}
              {user?.role !== 'Admin' && (req.status === 'Pending' || req.status === 'Approved') && (
                <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => handleStatusUpdate(req.id, 'Withdrawn')}>Withdraw</button>
              )}
            </td>
          </tr>
        ))}
        {requests.length === 0 && <tr><td colSpan={6} style={{textAlign: 'center'}}>No requests found.</td></tr>}
      </tbody>
    </table>
  );

  if (user?.role === 'Admin') {
    return (
      <div style={{ padding: '32px' }}>
        <h1 className="mb-6">Leave Approvals Inbox</h1>
        <div className="glass-card table-container">{renderTable()}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <h1 className="mb-6">Leave Management</h1>
      <div className="dashboard-grid mb-6">
         <div className="glass-card"><p className="form-label">Annual Leave</p><h2 style={{color:'var(--primary)'}}>{balance?.annual || 0} Days</h2></div>
         <div className="glass-card"><p className="form-label">Sick Leave</p><h2 style={{color:'var(--success)'}}>{balance?.sick || 0} Days</h2></div>
         <div className="glass-card"><p className="form-label">Casual Leave</p><h2 style={{color:'var(--warning)'}}>{balance?.casual || 0} Days</h2></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div className="glass-card">
          <h3 className="mb-4">Request Leave</h3>
          <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group"><label className="form-label">Leave Type</label>
              <select className="form-input form-select" value={type} onChange={e => setType(e.target.value)}><option>Annual</option><option>Sick</option><option>Casual</option></select>
            </div>
            <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-input" required value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-input" required value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Reason</label><input type="text" className="form-input" required value={reason} onChange={e => setReason(e.target.value)} /></div>
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </form>
        </div>
        <div className="glass-card">
          <h3 className="mb-4">My Leave History</h3>
          <div className="table-container">{renderTable()}</div>
        </div>
      </div>
    </div>
  );
};

export default Leaves;
