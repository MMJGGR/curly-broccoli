import React, { useEffect, useState } from 'react';

const ManualActualsModal = ({ open, onClose, categories = [] }) => {
  const [rows, setRows] = useState([]);
  const ymKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  };

  useEffect(() => {
    if (!open) return;
    const key = `manual_actuals_${ymKey()}`;
    try {
      const raw = localStorage.getItem(key);
      const obj = raw ? JSON.parse(raw) : {};
      const init = categories.map(c => ({ name: c.name, amount: obj[c.name] || '' }));
      setRows(init);
    } catch { setRows(categories.map(c => ({ name: c.name, amount: '' }))); }
  }, [open, categories]);

  const save = () => {
    const key = `manual_actuals_${ymKey()}`;
    const obj = rows.reduce((m, r) => { const v = parseFloat(r.amount)||0; if (v>0) m[r.name]=v; return m; }, {});
    localStorage.setItem(key, JSON.stringify(obj));
    onClose && onClose(true);
  };

  const saveAndPersist = async () => {
    const obj = rows.reduce((m, r) => { const v = parseFloat(r.amount)||0; if (v>0) m[r.name]=v; return m; }, {});
    const firstOfMonth = new Date(); firstOfMonth.setDate(1);
    const iso = firstOfMonth.toISOString();
    try {
      const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('jwt');
      const expenses = Object.entries(obj).map(([name, amt]) => ({ description: `Manual Actual: ${name}`, amount: amt, expense_type: 'miscellaneous', expense_date: iso }));
      const bundle = { expenses };
      await fetch(`${API}/api/v1/seed/bundle`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(bundle) });
    } catch (e) {
      console.warn('Persist manual actuals failed:', e?.message || e);
    } finally {
      save();
    }
  };

  if (!open) return null;
  const onFile = async (file) => {
    try {
      const text = await file.text();
      // Simple CSV: category,amount per line with header optional
      const lines = text.split(/\r?\n/).filter(Boolean);
      const out = {};
      for (const ln of lines.slice(1)) {
        const [name, amt] = ln.split(',');
        if (!name) continue;
        const v = Math.abs(parseFloat(amt)||0);
        if (v>0) out[name.trim()] = v;
      }
      const next = rows.map(r => ({ ...r, amount: out[r.name] !== undefined ? out[r.name] : r.amount }));
      setRows(next);
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Enter Manual Actuals (This Month)</h3>
          <button onClick={()=>onClose(false)} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="mb-3">
          <label className="text-sm text-gray-600">Import CSV (category,amount)</label>
          <input type="file" accept=".csv,text/csv" className="block mt-1" onChange={(e)=>{ const f = e.target.files && e.target.files[0]; if (f) onFile(f); }} />
        </div>
        <div className="max-h-80 overflow-auto">
          {rows.map((r, idx) => (
            <div key={idx} className="flex items-center justify-between py-1">
              <div className="text-sm text-gray-700">{r.name}</div>
              <input type="number" className="border rounded px-2 py-1 w-32" value={r.amount} onChange={(e)=>{
                const next = rows.slice(); next[idx] = { ...r, amount: e.target.value }; setRows(next);
              }} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={()=>onClose(false)} className="px-3 py-2 rounded bg-gray-200 text-gray-800">Cancel</button>
          <button onClick={save} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
          <button onClick={saveAndPersist} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700" title="Save to this device and persist to backend for P&L/exports">Save & Persist</button>
        </div>
      </div>
    </div>
  );
};

export default ManualActualsModal;
