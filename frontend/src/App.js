import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import SalaryTable from './pages/SalaryTable';
import CompanyPage from './pages/CompanyPage';
import ComparePage from './pages/ComparePage';
import SubmitPage from './pages/SubmitPage';
import './App.css';

function Nav() {
  const { pathname } = useLocation();
  const links = [
    { to: '/', label: 'Salaries' },
    { to: '/compare', label: 'Compare' },
    { to: '/submit', label: 'Add Data' },
  ];
  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        <span className="nav-logo">⚡</span>
        <span>CompIntel</span>
      </Link>
      <div className="nav-links">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`nav-link ${pathname === l.to ? 'active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Nav />
        <main className="main">
          <Routes>
            <Route path="/" element={<SalaryTable />} />
            <Route path="/company/:name" element={<CompanyPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/submit" element={<SubmitPage />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>CompIntel — Structured compensation intelligence. Data is community-contributed.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
