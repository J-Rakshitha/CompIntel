const BASE_URL = process.env.REACT_APP_API_URL || 'https://compintel-ul49.onrender.com/api';
async function apiFetch(path, options = {}) {
  
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

export const getSalaries = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  ).toString();
  return apiFetch(`/salaries${qs ? `?${qs}` : ''}`);
};

export const getSalaryById = (id) => apiFetch(`/salaries/${id}`);

export const getCompany = (company) => apiFetch(`/company/${encodeURIComponent(company)}`);

export const getCompanies = () => apiFetch('/companies');

export const compareSalaries = (id1, id2) =>
  apiFetch(`/compare?salaryId1=${id1}&salaryId2=${id2}`);

export const ingestSalary = (data) =>
  apiFetch('/ingest-salary', { method: 'POST', body: JSON.stringify(data) });
