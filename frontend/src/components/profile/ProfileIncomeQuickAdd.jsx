import React, { useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ProfileIncomeQuickAdd = () => {
  const { createIncome, fetchAllFinancialData } = useUnifiedFinancialContext();
  const [form, setForm] = useState({ name: '', monthly_amount: '', frequency: 'monthly' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const onSave = async () => {
    setSaving(true); setMsg('');
    try {
      const payload = {
        name: form.name || 'Income',
        monthly_amount: parseFloat(form.monthly_amount) || 0,
        frequency: form.frequency || 'monthly'
      };
      await createIncome(payload);
      await fetchAllFinancialData();
      setMsg('Income source added');
      setForm({ name: '', monthly_amount: '', frequency: 'monthly' });
    } catch (e) {
      setMsg('Failed to add income');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Add Income (Quick)</h2>
        <a href="/app/tools?section=income" className="text-blue-600 hover:text-blue-800 text-sm">Open Income Management →</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Salary" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Monthly Amount (KES)</label>
          <input type="number" value={form.monthly_amount} onChange={(e)=>setForm({...form, monthly_amount:e.target.value})} className="w-full border rounded-lg px-3 py-2" min="0" step="500" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Frequency</label>
          <select value={form.frequency} onChange={(e)=>setForm({...form, frequency:e.target.value})} className="w-full border rounded-lg px-3 py-2">
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={onSave} disabled={saving} className={`px-4 py-2 rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{saving ? 'Saving…' : 'Add Income'}</button>
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>
    </div>
  );
};

export default ProfileIncomeQuickAdd;

