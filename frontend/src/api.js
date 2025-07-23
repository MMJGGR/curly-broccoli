let rawBase;
try {
  rawBase = new Function('return import.meta.env.VITE_API_BASE_URL')();
} catch {
  rawBase = process.env.VITE_API_BASE_URL;
}
const API_BASE = rawBase && rawBase !== 'undefined' ? rawBase : '';

function buildHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(method, path, token, body) {
  const opts = {
    method,
    headers: buildHeaders(token),
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = await res.json();
      msg = data.detail || data.message || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Account CRUD
export const createAccount = (token, data) =>
  request('POST', '/accounts/', token, data);
export const listAccounts = (token) =>
  request('GET', '/accounts/', token);
export const updateAccount = (token, id, data) =>
  request('PUT', `/accounts/${id}`, token, data);
export const deleteAccount = (token, id) =>
  request('DELETE', `/accounts/${id}`, token);

// Transaction CRUD
export const createTransaction = (token, data) =>
  request('POST', '/transactions/', token, data);
export const listTransactions = (token) =>
  request('GET', '/transactions/', token);
export const updateTransaction = (token, id, data) =>
  request('PUT', `/transactions/${id}`, token, data);
export const deleteTransaction = (token, id) =>
  request('DELETE', `/transactions/${id}`, token);

// Milestone CRUD
export const createMilestone = (token, data) =>
  request('POST', '/milestones/', token, data);
export const listMilestones = (token) =>
  request('GET', '/milestones/', token);
export const updateMilestone = (token, id, data) =>
  request('PUT', `/milestones/${id}`, token, data);
export const deleteMilestone = (token, id) =>
  request('DELETE', `/milestones/${id}`, token);

// Goal CRUD
export const createGoal = (token, data) =>
  request('POST', '/goals/', token, data);
export const listGoals = (token) =>
  request('GET', '/goals/', token);
export const updateGoal = (token, id, data) =>
  request('PUT', `/goals/${id}`, token, data);
export const deleteGoal = (token, id) =>
  request('DELETE', `/goals/${id}`, token);
