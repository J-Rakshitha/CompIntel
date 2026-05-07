import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSalaries, compareSalaries } from '../lib/api';
import { formatCurrency, displayCompany, levelColor } from '../lib/format';

function LevelBadge({ level }) {
  const color = levelColor(level);
  return (
    <span className="level-badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {level}
    </span>
  );
}

function DiffBadge({ value, suffix = '' }) {
  if (value == null) return <span className="compare-diff diff-neu">—</span>;
  const cls = value > 0 ? 'diff-pos' : value < 0 ? 'diff-neg' : 'diff-neu';
  const prefix = value > 0 ? '+' : '';
  return <span className={`compare-diff ${cls}`}>{prefix}{typeof value === 'number' && !isNaN(value) ? value.toLocaleString() : value}{suffix}</span>;
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [salaryList, setSalaryList] = useState([]);
  const [id1, setId1] = useState(searchParams.get('id1') || '');
  const [id2, setId2] = useState(searchParams.get('id2') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    getSalaries({ limit: 100 })
      .then(d => setSalaryList(d.data))
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => {
    if (id1 && id2 && id1 !== id2) {
      setLoading(true);
      setError(null);
      compareSalaries(id1, id2)
        .then(setResult)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id1, id2]);

  const handleCompare = () => {
    if (!id1 || !id2) return setError('Please select two salary records');
    if (id1 === id2) return setError('Please select two different salary records');
    setSearchParams({ id1, id2 });
  };

  const salaryLabel = (s) =>
    `${displayCompany(s.company)} · ${s.role} · ${s.level} · ${formatCurrency(s.total_compensation)}`;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Compare Compensation</h1>
        <p className="page-sub">Select two salary records for a side-by-side breakdown.</p>
      </div>

      {/* SELECTOR */}
      <div className="company-hero">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Salary A</label>
            <select className="form-select" value={id1} onChange={e => setId1(e.target.value)} disabled={listLoading}>
              <option value="">Select a record...</option>
              {salaryList.map(s => <option key={s.id} value={s.id}>{salaryLabel(s)}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Salary B</label>
            <select className="form-select" value={id2} onChange={e => setId2(e.target.value)} disabled={listLoading}>
              <option value="">Select a record...</option>
              {salaryList.filter(s => s.id !== id1).map(s => <option key={s.id} value={s.id}>{salaryLabel(s)}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleCompare} disabled={!id1 || !id2}>
            Compare
          </button>
        </div>
        {error && <div className="form-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      {/* RESULT */}
      {loading && <div className="loading"><div className="spinner" /><div>Comparing...</div></div>}

      {result && !loading && (
        <>
          <div className="compare-grid">
            {/* SALARY A */}
            <div className="compare-card">
              <div className="compare-card-title">Salary A</div>
              <div className="compare-field">
                <div className="compare-field-label">Company</div>
                <div className="compare-field-value">{displayCompany(result.salary1.company)}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Role</div>
                <div className="compare-field-value" style={{ fontSize: 13, fontFamily: 'Inter', fontWeight: 500 }}>{result.salary1.role}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Level</div>
                <div><LevelBadge level={result.salary1.level} /></div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Location</div>
                <div className="compare-field-value" style={{ fontSize: 13 }}>{result.salary1.location}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Experience</div>
                <div className="compare-field-value">{result.salary1.experience_years} yrs</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Base Salary</div>
                <div className="compare-field-value">{formatCurrency(result.salary1.base_salary)}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Bonus</div>
                <div className="compare-field-value">{result.salary1.bonus ? formatCurrency(result.salary1.bonus) : '—'}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Stock (annual)</div>
                <div className="compare-field-value">{result.salary1.stock ? formatCurrency(result.salary1.stock) : '—'}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Total Compensation</div>
                <div className="compare-field-value td-tc">{formatCurrency(result.salary1.total_compensation)}</div>
              </div>
            </div>

            {/* SALARY B */}
            <div className="compare-card">
              <div className="compare-card-title">Salary B</div>
              <div className="compare-field">
                <div className="compare-field-label">Company</div>
                <div className="compare-field-value">{displayCompany(result.salary2.company)}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Role</div>
                <div className="compare-field-value" style={{ fontSize: 13, fontFamily: 'Inter', fontWeight: 500 }}>{result.salary2.role}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Level</div>
                <div><LevelBadge level={result.salary2.level} /></div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Location</div>
                <div className="compare-field-value" style={{ fontSize: 13 }}>{result.salary2.location}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Experience</div>
                <div className="compare-field-value">{result.salary2.experience_years} yrs</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Base Salary</div>
                <div className="compare-field-value">{formatCurrency(result.salary2.base_salary)}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Bonus</div>
                <div className="compare-field-value">{result.salary2.bonus ? formatCurrency(result.salary2.bonus) : '—'}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Stock (annual)</div>
                <div className="compare-field-value">{result.salary2.stock ? formatCurrency(result.salary2.stock) : '—'}</div>
              </div>
              <div className="compare-field">
                <div className="compare-field-label">Total Compensation</div>
                <div className="compare-field-value td-tc">{formatCurrency(result.salary2.total_compensation)}</div>
              </div>
            </div>
          </div>

          {/* DIFF TABLE */}
          <div className="company-hero" style={{ marginTop: 24 }}>
            <div className="section-title" style={{ marginBottom: 20 }}>Difference (A vs B)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: 'Base Salary', diff: result.comparison.base_salary },
                { label: 'Bonus', diff: result.comparison.bonus },
                { label: 'Stock', diff: result.comparison.stock },
                { label: 'Total Comp', diff: result.comparison.total_compensation },
              ].map(({ label, diff }) => (
                <div key={label} className="stat-card">
                  <div className="stat-label">{label}</div>
                  <DiffBadge value={diff.absolute} />
                  {diff.percentage != null && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                      {diff.percentage > 0 ? '+' : ''}{diff.percentage}%
                    </div>
                  )}
                </div>
              ))}
              <div className="stat-card">
                <div className="stat-label">Level</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{result.comparison.level_difference}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
