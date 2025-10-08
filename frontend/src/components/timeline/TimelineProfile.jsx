import React from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const TimelineProfile = () => {
  const { profile, selectRiskProfile, updateProfile, fetchProfile } = useUnifiedFinancialContext();
  const risk = selectRiskProfile();
  const [form, setForm] = React.useState({
    monthly_income: '',
    retirement_age: '',
    dependents: ''
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setForm({
        monthly_income: profile.monthly_income ?? '',
        retirement_age: profile.retirement_age ?? 65,
        dependents: profile.dependents ?? 0
      });
    }
  }, [profile]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        monthly_income: parseFloat(form.monthly_income) || null,
        retirement_age: parseInt(form.retirement_age) || null,
        dependents: parseInt(form.dependents) || 0
      });
      await fetchProfile();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timeline Profile</h1>
          <p className="text-gray-600">Edit core fields and see cross‑app recalculation via selectors</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (KES)</label>
              <input
                type="number"
                value={form.monthly_income}
                onChange={e => setForm({ ...form, monthly_income: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retirement Age</label>
              <input
                type="number"
                value={form.retirement_age}
                onChange={e => setForm({ ...form, retirement_age: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dependents</label>
              <input
                type="number"
                value={form.dependents}
                onChange={e => setForm({ ...form, dependents: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Risk Profile</h2>
          <p className="text-gray-700">Score: {risk?.score ?? '—'}% • Level: {risk?.level ?? 'Not assessed'}</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineProfile;

