export const exportProfileJson = async ({ token, base }) => {
  const res = await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
};

export const deleteAccountApi = async ({ token, base, password }) => {
  const res = await fetch(`${base}/auth/delete-account`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
};

