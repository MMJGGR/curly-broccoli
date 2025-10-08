// Simple Trial Balance audit log via localStorage
const KEY = 'tb_audit_log_v1';

export async function addAuditEntry(entry) {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {}
}

export function getAuditEntries() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function clearAuditEntries() {
  try { localStorage.setItem(KEY, JSON.stringify([])); } catch {}
}

export default { addAuditEntry, getAuditEntries, clearAuditEntries };

// Server-backed helpers (optional, used when available)
export async function postAuditToServer(entry) {
  try {
    const token = localStorage.getItem('jwt');
    const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    const res = await fetch(`${base}/api/v1/tb-audit/entries`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return res.ok;
  } catch { return false; }
}

export async function fetchAuditFromServer() {
  try {
    const token = localStorage.getItem('jwt');
    const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    const res = await fetch(`${base}/api/v1/tb-audit/entries`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}
