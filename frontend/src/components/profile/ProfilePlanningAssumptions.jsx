import React, { useMemo, useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ProfilePlanningAssumptions = () => {
  const { profile, updateProfile, setPlanningStartDate, planningStartDate } = useUnifiedFinancialContext();

  const existingPrefs = useMemo(() => profile?.investment_preferences || {}, [profile]);
  const existingAssumptions = useMemo(() => existingPrefs.planning_assumptions || {}, [existingPrefs]);

  const [form, setForm] = useState({
    inflation_rate: existingAssumptions.inflation_rate ?? 0.05,
    expected_return_rate: existingAssumptions.expected_return_rate ?? 0.10,
    discount_rate: existingAssumptions.discount_rate ?? 0.125,
    risk_free_rate: existingAssumptions.risk_free_rate ?? 0.145,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [planningStart, setPlanningStart] = useState(() => {
    try {
      return (localStorage.getItem('planning_start_date') || planningStartDate || '').slice(0,7);
    } catch { return planningStartDate ? String(planningStartDate).slice(0,7) : ''; }
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const merged = {
        ...(existingPrefs || {}),
        planning_assumptions: { ...form },
      };
      await updateProfile({ investment_preferences: merged });
      setMessage('Planning assumptions saved');
    } catch (e) {
      setMessage('Failed to save planning assumptions');
    } finally {
      setSaving(false);
    }
  };

  const onSavePlanningStart = async () => {
    try {
      if (planningStart && /^\d{4}-\d{2}$/.test(planningStart)) {
        await setPlanningStartDate(planningStart);
        setMessage('Planning start saved');
      } else {
        setMessage('Enter YYYY-MM');
      }
    } catch {
      setMessage('Failed to save planning start');
    }
  };

  const Field = ({ label, name, step = 0.001 }) => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        value={form[name]}
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2"
        min="0"
        max="1"
        step={step}
      />
      <p className="text-xs text-gray-500 mt-1">Enter as decimal (e.g., 0.05 = 5%)</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Planning Assumptions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Planning Start (YYYY-MM)</label>
          <input
            type="month"
            name="planning_start"
            value={planningStart}
            onChange={(e) => setPlanningStart(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <button onClick={onSavePlanningStart} className="mt-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Save Planning Start</button>
          <p className="text-xs text-gray-500 mt-1">Used by statements and timeline; supports historical (e.g., 2020-01).</p>
        </div>
        <Field label="Inflation Rate" name="inflation_rate" />
        <Field label="Expected Return Rate" name="expected_return_rate" />
        <Field label="Discount Rate" name="discount_rate" />
        <Field label="Risk-free Rate" name="risk_free_rate" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={onSave} disabled={saving} className={`px-4 py-2 rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {saving ? 'Saving...' : 'Save Planning Assumptions'}
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
};

export default ProfilePlanningAssumptions;
