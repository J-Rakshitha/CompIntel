import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ingestSalary } from '../lib/api';

const LEVELS = [
  'L1','L2','L3','L4','L5','L6','L7','L8',
  'SDE1','SDE2','SDE3',
  'E3','E4','E5','E6','E7','E8',
  'IC3','IC4','IC5','IC6',
  'M1','M2','M3',
  'Junior','Mid','Senior','Senior-II','Staff','Principal','Distinguished','Fellow',
];

const LOCATIONS = [
  'Bangalore','Hyderabad','Pune','Mumbai','Gurgaon','Noida','Chennai',
  'Delhi','Kolkata','Ahmedabad','Remote',
  'San Francisco','New York','Seattle','Austin','London','Singapore',
];

const initialForm = {
  company: '', role: '', level: '', location: '',
  experience_years: '', base_salary: '', bonus: '', stock: '',
  confidence_score: '0.9',
};

export default function SubmitPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);
    setLoading(true);
    try {
      await ingestSalary({
        ...form,
        experience_years: Number(form.experience_years),
        base_salary: Number(form.base_salary),
        bonus: form.bonus ? Number(form.bonus) : 0,
        stock: form.stock ? Number(form.stock) : 0,
        confidence_score: Number(form.confidence_score),
      });
      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/" className="back-link">← Back to Salaries</Link>
      <div className="page-header">
        <h1 className="page-title">Add Compensation Data</h1>
        <p className="page-sub">Contribute structured salary data. All submissions are anonymous.</p>
      </div>

      <form className="submit-form" onSubmit={handleSubmit}>
        {success && (
          <div className="form-success" style={{ marginBottom: 20 }}>
            ✅ Salary record submitted successfully! Thank you for contributing.
          </div>
        )}
        {errors.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {errors.map((e, i) => <div key={i} className="form-error">❌ {e}</div>)}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company *</label>
            <input className="form-input" placeholder="e.g. Google" value={form.company} onChange={e => update('company', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <input className="form-input" placeholder="e.g. Software Engineer" value={form.role} onChange={e => update('role', e.target.value)} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Level * <span className="form-hint">(standardized)</span></label>
            <select className="form-select" value={form.level} onChange={e => update('level', e.target.value)} required>
              <option value="">Select level...</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <select className="form-select" value={form.location} onChange={e => update('location', e.target.value)} required>
              <option value="">Select location...</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Years of Experience *</label>
          <input className="form-input" type="number" min="0" max="50" step="0.5"
            placeholder="e.g. 4" value={form.experience_years} onChange={e => update('experience_years', e.target.value)} required />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 20, marginTop: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Compensation (Annual, in ₹)
          </div>

          <div className="form-group">
            <label className="form-label">Base Salary * (₹/year)</label>
            <input className="form-input" type="number" min="0" placeholder="e.g. 2500000"
              value={form.base_salary} onChange={e => update('base_salary', e.target.value)} required />
            <span className="form-hint">Annual fixed salary in rupees</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Annual Bonus (₹)</label>
              <input className="form-input" type="number" min="0" placeholder="0 if none"
                value={form.bonus} onChange={e => update('bonus', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Stock / RSU (₹/year)</label>
              <input className="form-input" type="number" min="0" placeholder="Annual vesting value"
                value={form.stock} onChange={e => update('stock', e.target.value)} />
              <span className="form-hint">Annual RSU vesting value</span>
            </div>
          </div>
        </div>

        {form.base_salary && (
          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 14, marginBottom: 20, fontFamily: 'JetBrains Mono', fontSize: 14 }}>
            <span style={{ color: 'var(--text3)' }}>Total Comp: </span>
            <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>
              ₹{(
                (Number(form.base_salary) || 0) +
                (Number(form.bonus) || 0) +
                (Number(form.stock) || 0)
              ).toLocaleString('en-IN')}
            </span>
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
          {loading ? 'Submitting...' : 'Submit Salary Data'}
        </button>

        <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
          Data is validated and normalized before storage. No personal information is collected.
        </p>
      </form>
    </div>
  );
}
