import React, { useMemo, useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ProfilePreferences = () => {
  const { profile, updateProfile } = useUnifiedFinancialContext();
  const initialPrefs = useMemo(() => {
    const p = profile || {};
    return (
      p.preferences || p.investment_preferences || {
        notifications: true,
        dataSharing: false,
        marketingEmails: false,
        newsletterSubscription: false,
      }
    );
  }, [profile]);

  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const toggle = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const merged = { ...(profile?.investment_preferences || {}), ...prefs };
      await updateProfile({ investment_preferences: merged });
      setMessage('Preferences saved');
    } catch (e) {
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Preferences</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={!!prefs.notifications} onChange={() => toggle('notifications')} />
          <span className="text-gray-700">Enable Notifications</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={!!prefs.dataSharing} onChange={() => toggle('dataSharing')} />
          <span className="text-gray-700">Allow Data Sharing</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={!!prefs.marketingEmails} onChange={() => toggle('marketingEmails')} />
          <span className="text-gray-700">Marketing Emails</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={!!prefs.newsletterSubscription} onChange={() => toggle('newsletterSubscription')} />
          <span className="text-gray-700">Newsletter Subscription</span>
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
};

export default ProfilePreferences;
