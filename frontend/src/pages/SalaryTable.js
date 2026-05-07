import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSalaries } from '../lib/api';
import { formatCurrency, displayCompany, levelColor } from '../lib/format';

function LevelBadge({ level }) {
  const color = levelColor(level);
  return (
    <span
      className="level-badge"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {level}
    </span>
  );
}

export default function SalaryTable() {
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState([]);
  const [meta, setMeta] = useState({});
  const [filters, setFilters] = useState({ companies: [], roles: [], levels: [], locations: [] });
  const [query, setQuery] = useState({ company: '', role: '', level: '', location: '', sort: 'desc', page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSalaries(query);
      setSalaries(data.data);
      setMeta(data.meta);
      if (data.filters) setFilters(data.filters);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateQuery = (key, value) => setQuery(prev => ({ ...prev, [key]: value, page: 1 }));
  const clearFilters = () => setQuery({ company: '', role: '', level: '', location: '', sort: 'desc', page: 1 });

  const toggleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Compensation Intelligence</h1>
        <p className="page-sub">
          Real structured salary data with levels — not job postings, not guesses.
        </p>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Company</label>
          <select className="filter-select" value={query.company} onChange={e => updateQuery('company', e.target.value)}>
            <option value="">All Companies</option>
            {filters.companies.map(c => <option key={c} value={c}>{displayCompany(c)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Role</label>
          <select className="filter-select" value={query.role} onChange={e => updateQuery('role', e.target.value)}>
            <option value="">All Roles</option>
            {filters.roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Level</label>
          <select className="filter-select" value={query.level} onChange={e => updateQuery('level', e.target.value)}>
            <option value="">All Levels</option>
            {filters.levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Location</label>
          <select className="filter-select" value={query.location} onChange={e => updateQuery('location', e.target.value)}>
            <option value="">All Locations</option>
            {filters.locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn btn-ghost" onClick={clearFilters}>Reset</button>
        </div>
      </div>

      {/* META BAR */}
      <div className="meta-bar">
        <span className="meta-count">
          {loading ? '...' : `${meta.total || 0} records`}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="filter-select"
            style={{ padding: '5px 10px', fontSize: 12 }}
            value={query.sort}
            onChange={e => updateQuery('sort', e.target.value)}
          >
            <option value="desc">Highest TC first</option>
            <option value="asc">Lowest TC first</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="loading"><div className="spinner" /><div>Loading...</div></div>
      ) : error ? (
        <div className="empty">
          <div className="empty-icon">⚠️</div>
          <div className="empty-text">Failed to load data</div>
          <div>{error}</div>
        </div>
      ) : salaries.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <div className="empty-text">No results found</div>
          <div>Try adjusting your filters</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Company</th>
                <th>Role</th>
                <th>Level</th>
                <th>Location</th>
                <th>Exp (yrs)</th>
                <th>Total Comp ↕</th>
                <th>Base</th>
                <th>Bonus</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map(s => (
                <tr key={s.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="compare-check"
                      checked={selected.includes(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      title="Select to compare"
                    />
                  </td>
                  <td className="td-company">
                    <Link to={`/company/${s.company}`}>{displayCompany(s.company)}</Link>
                  </td>
                  <td className="td-role">{s.role}</td>
                  <td><LevelBadge level={s.level} /></td>
                  <td style={{ color: 'var(--text2)' }}>{s.location}</td>
                  <td className="td-mono" style={{ color: 'var(--text2)' }}>{s.experience_years}</td>
                  <td>
                    <div className="td-tc">{formatCurrency(s.total_compensation)}</div>
                    <div className="td-breakdown">B+Bo+St</div>
                  </td>
                  <td className="td-mono">{formatCurrency(s.base_salary)}</td>
                  <td className="td-mono" style={{ color: s.bonus ? 'var(--text)' : 'var(--text3)' }}>
                    {s.bonus ? formatCurrency(s.bonus) : '—'}
                  </td>
                  <td className="td-mono" style={{ color: s.stock ? 'var(--accent3)' : 'var(--text3)' }}>
                    {s.stock ? formatCurrency(s.stock) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {meta.totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={query.page <= 1} onClick={() => setQuery(q => ({ ...q, page: q.page - 1 }))}>←</button>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${query.page === p ? 'active' : ''}`}
              onClick={() => setQuery(q => ({ ...q, page: p }))}>
              {p}
            </button>
          ))}
          <button className="page-btn" disabled={query.page >= meta.totalPages} onClick={() => setQuery(q => ({ ...q, page: q.page + 1 }))}>→</button>
        </div>
      )}

      {/* COMPARE BAR */}
      {selected.length > 0 && (
        <div className="compare-bar">
          <span className="compare-bar-text">
            <strong>{selected.length}</strong> selected for comparison
          </span>
          {selected.length === 2 && (
            <button className="btn btn-primary btn-sm"
              onClick={() => navigate(`/compare?id1=${selected[0]}&id2=${selected[1]}`)}>
              Compare →
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
        </div>
      )}
    </div>
  );
}
