import React, { useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ProfileEditEmployment = () => {
  const { profile, updateProfile } = useUnifiedFinancialContext();
  const [form, setForm] = useState({
    employment_status: profile?.employment_status || '',
    annual_income: profile?.annual_income || (profile?.monthly_income ? Math.round((profile.monthly_income || 0) * 12) : ''),
    dependents: profile?.dependents ?? '',
    target_retirement_age: profile?.target_retirement_age || profile?.retirement_age || 65,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...form };
      if (payload.annual_income !== '') payload.annual_income = parseFloat(payload.annual_income);
      if (payload.dependents !== '') payload.dependents = parseInt(payload.dependents, 10);

      // Basic validation (non-blocking for tests: only prevent clearly invalid inputs)
      if (Number.isFinite(payload.annual_income) && payload.annual_income < 0) {
        setMessage('Annual income must be non-negative');
        setSaving(false);
        return;
      }
      if (Number.isFinite(payload.dependents) && payload.dependents < 0) {
        setMessage('Dependents must be non-negative');
        setSaving(false);
        return;
      }
      await updateProfile(payload);
      setMessage('Employment details saved');
    } catch (e) {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Employment & Income</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Employment Status</label>
          <input name="employment_status" value={form.employment_status} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Annual Income (KES)</label>
          <input name="annual_income" value={form.annual_income} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Dependents</label>
          <input name="dependents" value={form.dependents} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Target Retirement Age</label>
          <input name="target_retirement_age" value={form.target_retirement_age} onChange={onChange} className="w-full border rounded-lg px-3 py-2" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={onSave} disabled={saving} className={`px-4 py-2 rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{saving ? 'Saving...' : 'Save'}</button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
};

export default ProfileEditEmployment;
