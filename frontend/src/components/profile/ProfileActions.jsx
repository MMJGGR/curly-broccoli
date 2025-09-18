import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileActions = () => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const exportProfile = async () => {
    try {
      setBusy(true);
      setMessage('');
      const token = localStorage.getItem('jwt');
      const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'profile_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setMessage('Export failed');
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    const password = prompt('Enter your password to confirm account deletion:');
    if (!password) return;
    if (!window.confirm('This will permanently delete your account. Continue?')) return;
    try {
      setBusy(true);
      setMessage('');
      const token = localStorage.getItem('jwt');
      const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/auth/delete-account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) throw new Error('Delete failed');
      localStorage.removeItem('jwt');
      navigate('/auth');
    } catch (e) {
      setMessage('Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Actions</h2>
      <div className="flex flex-wrap gap-3">
        <button className={`px-4 py-2 rounded-lg text-white ${busy ? 'bg-gray-400' : 'bg-gray-700 hover:bg-gray-800'}`} onClick={exportProfile} disabled={busy}>
          Export Profile JSON
        </button>
        <button className={`px-4 py-2 rounded-lg text-white ${busy ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'}`} onClick={deleteAccount} disabled={busy}>
          Delete Account
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
};

export default ProfileActions;

