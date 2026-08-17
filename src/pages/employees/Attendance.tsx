import { customFetch as fetch } from './apiMock';
import React, { useState, useEffect } from 'react';
import type { Attendance, Employee } from '../../types/employee';

const AttendancePage = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState('Present');

  const fetchData = async () => {
    try {
      const [attRes, empRes] = await Promise.all([
        fetch('/api/attendance'),
        fetch('/api/employees')
      ]);
      const attData = await attRes.json();
      const empData = await empRes.json();
      setRecords(attData);
      setEmployees(empData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    try {
      const payload = {
        employeeId,
        date: new Date().toISOString(),
        status,
        checkIn: status === 'Present' || status === 'Half-Day' ? new Date().toISOString() : null,
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Loading...</div>;

  return (
    <div style={{ padding: '32px' }}>
      <h1 className="mb-6">Attendance Management</h1>
      
      <div className="glass-card mb-6">
        <h3 className="mb-4">Mark Today's Attendance</h3>
        <form onSubmit={handleMarkAttendance} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Employee</label>
            <select className="form-input form-select" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
              <option value="">Select Employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>
          <div style={{ width: '200px' }}>
            <label className="form-label">Status</label>
            <select className="form-input form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Present">Present</option>
              <option value="Half-Day">Half-Day</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            Submit
          </button>
        </form>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Check In</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.employee?.firstName} {record.employee?.lastName}</td>
                  <td>
                    <span className={`badge badge-${record.status === 'Present' ? 'success' : record.status === 'Absent' ? 'danger' : 'warning'}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '--'}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '16px' }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
