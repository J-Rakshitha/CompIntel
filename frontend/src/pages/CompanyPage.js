import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCompany } from '../lib/api';
import { formatCurrency, displayCompany, levelColor } from '../lib/format';

function LevelBadge({ level }) {
  const color = levelColor(level);
  return (
    <span className="level-badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {level}
    </span>
  );
}

export default function CompanyPage() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getCompany(name)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <div className="loading"><div className="spinner" /><div>Loading...</div></div>;
  if (error) return <div className="empty"><div className="empty-icon">⚠️</div><div>{error}</div></div>;
  if (!data) return null;

  const { stats, salaries, level_distribution, role_distribution } = data;
  const maxLevelCount = Math.max(...level_distribution.map(l => l.count), 1);
  const maxRoleCount = Math.max(...role_distribution.map(r => r.count), 1);

  return (
    <div>
      <Link to="/" className="back-link">← Back to Salaries</Link>

      <div className="company-hero">
        <div className="company-name">{displayCompany(name)}</div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Median Total Comp</div>
            <div className="stat-value">{formatCurrency(stats.median_total_compensation)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Base Salary</div>
            <div className="stat-value">{formatCurrency(stats.avg_base_salary)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Bonus</div>
            <div className="stat-value">{stats.avg_bonus ? formatCurrency(stats.avg_bonus) : '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Stock (annual)</div>
            <div className="stat-value">{stats.avg_stock ? formatCurrency(stats.avg_stock) : '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Min TC</div>
            <div className="stat-value">{formatCurrency(stats.min_total)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Max TC</div>
            <div className="stat-value">{formatCurrency(stats.max_total)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Reports</div>
            <div className="stat-value">{stats.count}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Level Distribution */}
        <div className="company-hero">
          <div className="dist-title">Level Distribution</div>
          <div className="dist-bars">
            {level_distribution.map(({ level, count }) => (
              <div key={level} className="dist-row">
                <div className="dist-label"><LevelBadge level={level} /></div>
                <div className="dist-bar-wrap">
                  <div
                    className="dist-bar-fill"
                    style={{
                      width: `${(count / maxLevelCount) * 100}%`,
                      background: levelColor(level),
                    }}
                  />
                </div>
                <div className="dist-count">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="company-hero">
          <div className="dist-title">Role Distribution</div>
          <div className="dist-bars">
            {role_distribution.slice(0, 8).map(({ role, count }) => (
              <div key={role} className="dist-row">
                <div className="dist-label" style={{ width: 120, fontSize: 11 }}>{role}</div>
                <div className="dist-bar-wrap">
                  <div
                    className="dist-bar-fill"
                    style={{ width: `${(count / maxRoleCount) * 100}%`, background: 'var(--accent)' }}
                  />
                </div>
                <div className="dist-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <div className="section-header">
        <div className="section-title">All Reports ({salaries.length})</div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Level</th>
              <th>Location</th>
              <th>Exp</th>
              <th>Total Comp</th>
              <th>Base</th>
              <th>Bonus</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map(s => (
              <tr key={s.id}>
                <td className="td-role">{s.role}</td>
                <td><LevelBadge level={s.level} /></td>
                <td style={{ color: 'var(--text2)' }}>{s.location}</td>
                <td className="td-mono" style={{ color: 'var(--text2)' }}>{s.experience_years}y</td>
                <td className="td-tc">{formatCurrency(s.total_compensation)}</td>
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
    </div>
  );
}
