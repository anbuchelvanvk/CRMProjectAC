import { customFetch as fetch } from './apiMock';
import React, { useState, useEffect } from 'react';
import type { SalarySlip, Employee } from '../../types/employee';

const SalaryPage = () => {
  const [salaries, setSalaries] = useState<SalarySlip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState(new Date().getFullYear());
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);

  const fetchData = async () => {
    try {
      const [salRes, empRes] = await Promise.all([
        fetch('/api/salary'),
        fetch('/api/employees')
      ]);
      setSalaries(await salRes.json());
      setEmployees(await empRes.json());
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    try {
      const payload = {
        employeeId, month, year, basic: emp.salary, allowances, deductions
      };
      const res = await fetch('/api/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setAllowances(0);
        setDeductions(0);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Loading...</div>;

  return (
    <div style={{ padding: '32px' }}>
      <h1 className="mb-6">Payroll & Salary</h1>
      
      <div className="glass-card mb-6">
        <h3 className="mb-4">Generate Salary Slip</h3>
        <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
          <div>
            <label className="form-label">Employee</label>
            <select className="form-input form-select" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
              <option value="">Select Employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} (Basic: ${emp.salary})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Month</label>
            <select className="form-input form-select" value={month} onChange={(e) => setMonth(e.target.value)}>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Year</label>
            <input type="number" className="form-input" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
          </div>
          <div>
            <label className="form-label">Allowances (+)</label>
            <input type="number" className="form-input" value={allowances} onChange={(e) => setAllowances(Number(e.target.value))} required />
          </div>
          <div>
            <label className="form-label">Deductions (-)</label>
            <input type="number" className="form-input" value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            Generate Slip
          </button>
        </form>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Employee</th>
                <th>Basic</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map(slip => (
                <tr key={slip.id}>
                  <td>{slip.month} {slip.year}</td>
                  <td>{slip.employee?.firstName} {slip.employee?.lastName}</td>
                  <td>${slip.basic}</td>
                  <td><span style={{ color: 'var(--success)' }}>+${slip.allowances}</span></td>
                  <td><span style={{ color: 'var(--danger)' }}>-${slip.deductions}</span></td>
                  <td style={{ fontWeight: 600 }}>${slip.netSalary}</td>
                  <td>
                    <span className="badge badge-success">Paid</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalaryPage;
