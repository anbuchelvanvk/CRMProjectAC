import { customFetch as fetch } from './apiMock';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Monitor, Star } from 'lucide-react';
import type { Employee } from '../../types/employee';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [activeTab, setActiveTab] = useState('Profile');
  const [employee, setEmployee] = useState<Partial<Employee>>({
    id: isNew ? `EMP-${Math.floor(Math.random() * 90000) + 10000}` : '',
    firstName: '', lastName: '', email: '', phone: '',
    department: 'Engineering', position: '', status: 'Active', salary: 0,
  });

  const [assets, setAssets] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/employees/${id}`)
        .then(res => res.json())
        .then(data => setEmployee(data));
        
      fetch(`/api/advanced/assets/${id}`).then(r => r.json()).then(setAssets);
      fetch(`/api/advanced/performance/${id}`).then(r => r.json()).then(setReviews);
      fetch(`/api/advanced/documents/${id}`).then(r => r.json()).then(setDocuments);
    }
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setEmployee({ ...employee, [e.target.name]: value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/employees' : `/api/employees/${id}`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(employee) });
    navigate('/employees');
  };

  const handleAddAsset = async () => {
    const name = prompt('Asset Name (e.g. MacBook Pro)');
    const serialNo = prompt('Serial Number');
    if (!name || !serialNo) return;
    await fetch('/api/advanced/assets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: id, name, serialNo })
    });
    fetch(`/api/advanced/assets/${id}`).then(r => r.json()).then(setAssets);
  };

  const handleAddReview = async () => {
    const period = prompt('Period (e.g. Q3 2026)');
    const rating = prompt('Rating (1-5)');
    const comments = prompt('Comments');
    if (!period || !rating || !comments) return;
    await fetch('/api/advanced/performance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: id, reviewerId: 'admin', period, rating, comments })
    });
    fetch(`/api/advanced/performance/${id}`).then(r => r.json()).then(setReviews);
  };

  const handleAddDocument = async () => {
    const name = prompt('Document Name (e.g. ID Card, Resume)');
    const fileUrl = prompt('File URL (placeholder)');
    if (!name || !fileUrl) return;
    await fetch('/api/advanced/documents', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: id, name, fileUrl })
    });
    fetch(`/api/advanced/documents/${id}`).then(r => r.json()).then(setDocuments);
  };

  return (
    <div style={{ padding: '32px' }}>
      <button className="btn btn-outline mb-6" onClick={() => navigate('/employees')} style={{ padding: '8px 16px' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="mb-2">{isNew ? 'Add Employee' : `${employee.firstName} ${employee.lastName}`}</h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-6">{isNew ? 'Create a new team member profile.' : 'Manage employee profile, assets, and performance.'}</p>

      {!isNew && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
          {['Profile', 'Documents', 'Assets', 'Performance'].map(tab => (
            <button 
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Documents' && <FileText size={16} />}
              {tab === 'Assets' && <Monitor size={16} />}
              {tab === 'Performance' && <Star size={16} />}
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="glass-card">
        {activeTab === 'Profile' && (
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group"><label className="form-label">Employee ID</label><input type="text" className="form-input" name="id" value={employee.id || ''} onChange={handleChange} disabled={!isNew} required /></div>
            <div className="form-group"><label className="form-label">First Name</label><input type="text" className="form-input" name="firstName" value={employee.firstName || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input type="text" className="form-input" name="lastName" value={employee.lastName || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" name="email" value={employee.email || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Phone</label><input type="text" className="form-input" name="phone" value={employee.phone || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Department</label>
              <select className="form-input form-select" name="department" value={employee.department} onChange={handleChange}>
                <option>Engineering</option><option>Design</option><option>Marketing</option><option>HR</option><option>Finance</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Position</label><input type="text" className="form-input" name="position" value={employee.position} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Base Salary</label><input type="number" className="form-input" name="salary" value={employee.salary} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-input form-select" name="status" value={employee.status} onChange={handleChange}>
                <option>Active</option><option>On Leave</option><option>Terminated</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary"><Save size={18} /> {isNew ? 'Create Employee' : 'Save Changes'}</button>
            </div>
          </form>
        )}

        {activeTab === 'Assets' && (
          <div>
            <div className="flex-between mb-4">
              <h3>Assigned Assets</h3>
              <button className="btn btn-primary" onClick={handleAddAsset}>+ Assign Asset</button>
            </div>
            <table className="table">
              <thead><tr><th>Name</th><th>Serial No</th><th>Assigned On</th><th>Status</th></tr></thead>
              <tbody>
                {assets.map(a => <tr key={a.id}><td>{a.name}</td><td>{a.serialNo}</td><td>{new Date(a.assignedOn).toLocaleDateString()}</td><td><span className="badge badge-success">{a.status}</span></td></tr>)}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Performance' && (
          <div>
            <div className="flex-between mb-4">
              <h3>Performance Reviews</h3>
              <button className="btn btn-primary" onClick={handleAddReview}>+ Add Review</button>
            </div>
            <table className="table">
              <thead><tr><th>Period</th><th>Rating</th><th>Comments</th><th>Date</th></tr></thead>
              <tbody>
                {reviews.map(r => <tr key={r.id}><td>{r.period}</td><td>{'⭐'.repeat(r.rating)}</td><td>{r.comments}</td><td>{new Date(r.createdAt).toLocaleDateString()}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Documents' && (
          <div>
            <div className="flex-between mb-4">
              <h3>Document Vault</h3>
              <button className="btn btn-primary" onClick={handleAddDocument}>+ Upload Document</button>
            </div>
            <table className="table">
              <thead><tr><th>Document Name</th><th>File URL</th><th>Uploaded On</th></tr></thead>
              <tbody>
                {documents.map(d => <tr key={d.id}><td>{d.name}</td><td><a href={d.fileUrl} target="_blank" style={{ color: 'var(--primary)' }}>View File</a></td><td>{new Date(d.uploadedAt).toLocaleDateString()}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;
