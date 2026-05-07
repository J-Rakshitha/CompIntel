export function formatCurrency(amount, currency = 'INR') {
  if (amount == null) return '—';
  if (currency === 'INR') {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function displayCompany(name) {
  if (!name) return '';
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function levelColor(level) {
  const map = {
    L3: '#60a5fa', L4: '#34d399', L5: '#f59e0b', L6: '#f97316', L7: '#ef4444', L8: '#a855f7',
    SDE1: '#60a5fa', SDE2: '#34d399', SDE3: '#f59e0b',
    E3: '#60a5fa', E4: '#34d399', E5: '#f59e0b', E6: '#f97316', E7: '#ef4444',
    Junior: '#94a3b8', Mid: '#60a5fa', Senior: '#34d399', Staff: '#f59e0b',
    Principal: '#f97316', Distinguished: '#ef4444', Fellow: '#a855f7',
    IC3: '#60a5fa', IC4: '#34d399', IC5: '#f59e0b', IC6: '#f97316',
    M1: '#6366f1', M2: '#8b5cf6', M3: '#a855f7',
  };
  return map[level] || '#94a3b8';
}
