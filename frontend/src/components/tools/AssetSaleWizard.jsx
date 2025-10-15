import React from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

export default function AssetSaleWizard() {
  const { assets = [], liabilities = [], goals = [], applyAssetSale, fetchAllFinancialData } = useUnifiedFinancialContext();
  const [form, setForm] = React.useState({ assetId: '', salePrice: '', fees: '', debtAlloc: [], goalAlloc: [] });
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const selectedAsset = React.useMemo(() => (assets || []).find(a => a.id === form.assetId), [assets, form.assetId]);
  const netProceeds = React.useMemo(() => {
    const price = parseFloat(form.salePrice) || 0;
    const fees = parseFloat(form.fees) || 0;
    return Math.max(0, price - fees);
  }, [form.salePrice, form.fees]);
  const debtTotal = (form.debtAlloc || []).reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
  const goalTotal = (form.goalAlloc || []).reduce((s, g) => s + (parseFloat(g.amount) || 0), 0);
  const allocTotal = debtTotal + goalTotal;

  const updateDebtAlloc = (idx, next) => {
    const arr = (form.debtAlloc || []).slice();
    arr[idx] = { ...arr[idx], ...next };
    setForm(f => ({ ...f, debtAlloc: arr }));
  };
  const updateGoalAlloc = (idx, next) => {
    const arr = (form.goalAlloc || []).slice();
    arr[idx] = { ...arr[idx], ...next };
    setForm(f => ({ ...f, goalAlloc: arr }));
  };

  const addDebtRow = () => setForm(f => ({ ...f, debtAlloc: [...(f.debtAlloc || []), { liabilityId: '', amount: '' }] }));
  const addGoalRow = () => setForm(f => ({ ...f, goalAlloc: [...(f.goalAlloc || []), { goalId: '', amount: '' }] }));
  const removeDebtRow = (i) => setForm(f => ({ ...f, debtAlloc: (f.debtAlloc || []).filter((_, idx) => idx !== i) }));
  const removeGoalRow = (i) => setForm(f => ({ ...f, goalAlloc: (f.goalAlloc || []).filter((_, idx) => idx !== i) }));

  const apply = async () => {
    setBusy(true); setMsg('');
    try {
      const payload = {
        assetId: form.assetId,
        salePrice: parseFloat(form.salePrice) || 0,
        fees: parseFloat(form.fees) || 0,
        allocations: {
          debts: (form.debtAlloc || []).filter(d => d.liabilityId && parseFloat(d.amount) > 0).map(d => ({ liabilityId: d.liabilityId, amount: parseFloat(d.amount) })),
          goals: (form.goalAlloc || []).filter(g => g.goalId && parseFloat(g.amount) > 0).map(g => ({ goalId: g.goalId, amount: parseFloat(g.amount) }))
        }
      };
      const res = await applyAssetSale(payload);
      if (!res?.ok) { setMsg('Failed to apply sale.'); setBusy(false); return; }
      await fetchAllFinancialData();
      setMsg('Asset sale applied successfully.');
    } catch (e) {
      setMsg(e?.message || 'Error applying asset sale');
    } finally { setBusy(false); }
  };

  return (
    <div className="p-6 space-y-6" data-testid="asset-sale-wizard">
      <Card>
        <CardHeader>
          <CardTitle>Asset Sale → Debt/Goal Allocation (CR023)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Asset</label>
              <select className="w-full border rounded px-3 py-2" value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}>
                <option value="">Select asset</option>
                {(assets || []).map(a => (
                  <option key={a.id} value={a.id}>{a.name} — KES {Math.round(a.current_value || 0).toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Sale Price (KES)</label>
              <input className="w-full border rounded px-3 py-2" type="number" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Fees/Costs (KES)</label>
              <input className="w-full border rounded px-3 py-2" type="number" value={form.fees} onChange={e => setForm(f => ({ ...f, fees: e.target.value }))} />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-700">Net Proceeds: <span className="font-semibold">KES {Math.round(netProceeds).toLocaleString()}</span></div>
          {selectedAsset?.description && (
            <div className="mt-1 text-xs text-gray-500">{selectedAsset.description}</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Allocate to Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(form.debtAlloc || []).map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select className="flex-1 border rounded px-2 py-2" value={row.liabilityId} onChange={e => updateDebtAlloc(idx, { liabilityId: e.target.value })}>
                    <option value="">Select liability</option>
                    {(liabilities || []).map(l => (
                      <option key={l.id} value={l.id}>{l.name} — Bal KES {Math.round(l.current_balance || 0).toLocaleString()}</option>
                    ))}
                  </select>
                  <input className="w-40 border rounded px-2 py-2" type="number" placeholder="Amount" value={row.amount} onChange={e => updateDebtAlloc(idx, { amount: e.target.value })} />
                  <button className="text-red-600 px-2 py-2" onClick={() => removeDebtRow(idx)} aria-label="Remove debt row">✕</button>
                </div>
              ))}
              <Button variant="outline" onClick={addDebtRow}>+ Add Debt Allocation</Button>
              <div className="text-xs text-gray-600">Subtotal: KES {Math.round(debtTotal).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allocate to Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(form.goalAlloc || []).map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select className="flex-1 border rounded px-2 py-2" value={row.goalId} onChange={e => updateGoalAlloc(idx, { goalId: e.target.value })}>
                    <option value="">Select goal</option>
                    {(goals || []).map(g => (
                      <option key={g.id || g.name} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <input className="w-40 border rounded px-2 py-2" type="number" placeholder="Amount" value={row.amount} onChange={e => updateGoalAlloc(idx, { amount: e.target.value })} />
                  <button className="text-red-600 px-2 py-2" onClick={() => removeGoalRow(idx)} aria-label="Remove goal row">✕</button>
                </div>
              ))}
              <Button variant="outline" onClick={addGoalRow}>+ Add Goal Allocation</Button>
              <div className="text-xs text-gray-600">Subtotal: KES {Math.round(goalTotal).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Allocated: <span className={`font-semibold ${allocTotal > netProceeds ? 'text-red-700' : ''}`}>KES {Math.round(allocTotal).toLocaleString()}</span> of KES {Math.round(netProceeds).toLocaleString()}</div>
            <Button onClick={apply} disabled={busy || !form.assetId || netProceeds <= 0 || allocTotal > netProceeds}>{busy ? 'Applying…' : 'Apply Sale & Allocations'}</Button>
          </div>
          {msg && <div className="mt-2 text-sm text-gray-700">{msg}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

