import React, { useMemo, useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ProfileBudgetPreferences = () => {
  const { profile, updateProfile } = useUnifiedFinancialContext();

  const existingPrefs = useMemo(() => profile?.investment_preferences || {}, [profile]);
  const existingBudget = useMemo(() => existingPrefs.budget_preferences || {}, [existingPrefs]);

  const [form, setForm] = useState({
    zero_based_budgeting: existingBudget.zero_based_budgeting ?? true,
    overspend_alert_threshold_pct: existingBudget.overspend_alert_threshold_pct ?? 10,
    carryover_remaining: existingBudget.carryover_remaining ?? false,
    rounding_increment: existingBudget.rounding_increment ?? 50,
    // Household (saved under investment_preferences.household)
    spouse_monthly_income: (existingPrefs.household && (existingPrefs.household.spouse_monthly_income || existingPrefs.household.spouse_income)) || 0,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'overspend_alert_threshold_pct' || name === 'rounding_increment') ? Number(value) : value,
    }));
  };

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { spouse_monthly_income, ...budgetForm } = form;
      const merged = {
        ...(existingPrefs || {}),
        budget_preferences: { ...budgetForm },
        household: {
          ...(existingPrefs.household || {}),
          spouse_monthly_income: Number(spouse_monthly_income) || 0
        }
      };
      await updateProfile({ investment_preferences: merged });
      setMessage('Budget preferences saved');
    } catch (e) {
      setMessage('Failed to save budget preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Budget Preferences</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" name="zero_based_budgeting" checked={!!form.zero_based_budgeting} onChange={onChange} />
          <span className="text-gray-700">Use zero-based budgeting</span>
        </label>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Overspend alert threshold (%)</label>
          <input
            type="number"
            name="overspend_alert_threshold_pct"
            value={form.overspend_alert_threshold_pct}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            max="100"
          />
        </div>
        <label className="flex items-center gap-3">
          <input type="checkbox" name="carryover_remaining" checked={!!form.carryover_remaining} onChange={onChange} />
          <span className="text-gray-700">Carry over remaining budget</span>
        </label>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Rounding increment (KES)</label>
          <input
            type="number"
            name="rounding_increment"
            value={form.rounding_increment}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            step="10"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Spouse Monthly Income (KES)</label>
          <input
            type="number"
            name="spouse_monthly_income"
            value={form.spouse_monthly_income}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
            min="0"
            step="500"
          />
          <p className="text-xs text-gray-500 mt-1">Used in combined household totals (FE selectors).</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={onSave} disabled={saving} className={`px-4 py-2 rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {saving ? 'Saving...' : 'Save Budget Preferences'}
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
};

export default ProfileBudgetPreferences;
