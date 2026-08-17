import { customFetch as fetch } from './apiMock';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Employee } from '../../types/employee';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (err) {
        console.error('Failed to delete employee:', err);
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '32px' }}>Loading employees...</div>;
  }

  return (
    <div style={{ padding: '32px' }}>
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ marginBottom: '8px' }}>Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your team members and roles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/employees/new')}>
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/employees/${emp.id}`)}>
                  <td>
                    <div className="flex-center gap-3" style={{ justifyContent: 'flex-start' }}>
                      <div className="avatar-text">
                        {emp.firstName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.position}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{emp.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.phone}</div>
                  </td>
                  <td>{emp.department}</td>
                  <td>
                    <span className={`badge badge-${emp.status === 'Active' ? 'success' : emp.status === 'On Leave' ? 'warning' : 'danger'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '6px', border: 'none', color: 'var(--text-main)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/employees/${emp.id}`);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '6px', border: 'none', color: 'var(--danger)' }}
                        onClick={(e) => handleDelete(emp.id, e)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                    No employees found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;
