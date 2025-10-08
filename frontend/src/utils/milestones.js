const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export async function saveMilestone(milestone) {
  try {
    const token = localStorage.getItem('jwt');
    const res = await fetch(`${API_BASE}/api/v1/milestones/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(milestone)
    });
    if (!res.ok) throw new Error('Failed to save milestone');
    return await res.json();
  } catch (e) {
    // Fallback: localStorage persistence
    try {
      const raw = localStorage.getItem('suggested_milestones') || '[]';
      const arr = JSON.parse(raw);
      const item = { ...milestone, id: milestone.id || `local_${Date.now()}`, created_at: new Date().toISOString() };
      localStorage.setItem('suggested_milestones', JSON.stringify([...arr, item]));
      return { ok: true, milestone: item, local: true };
    } catch {
      return { ok: false };
    }
  }
}

export async function listMilestones() {
  try {
    const token = localStorage.getItem('jwt');
    const res = await fetch(`${API_BASE}/api/v1/milestones/`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error('Failed to list milestones');
    const data = await res.json();
    return data?.milestones || [];
  } catch {
    try { return JSON.parse(localStorage.getItem('suggested_milestones') || '[]'); } catch { return []; }
  }
}

export async function deleteMilestone(id) {
  try {
    const token = localStorage.getItem('jwt');
    const res = await fetch(`${API_BASE}/api/v1/milestones/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error('Failed to delete milestone');
    return true;
  } catch {
    try {
      const raw = localStorage.getItem('suggested_milestones') || '[]';
      const arr = JSON.parse(raw).filter(m => String(m.id) !== String(id));
      localStorage.setItem('suggested_milestones', JSON.stringify(arr));
      return true;
    } catch { return false; }
  }
}

export default { saveMilestone, listMilestones, deleteMilestone };

