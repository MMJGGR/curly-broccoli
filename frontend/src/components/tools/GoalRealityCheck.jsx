import React, { useEffect, useMemo, useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const KES = (n) => `KES ${Math.round(n || 0).toLocaleString()}`;

function monthsUntil(dateStr) {
  try {
    const now = new Date();
    const tgt = new Date(dateStr);
    const years = (tgt - now) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, Math.round(years * 12));
  } catch {
    return 0;
  }
}

const GoalRealityCheck = () => {
  const { goals: goalsState, selectNetCashFlow, createBudgetCategory, updateGoal } = useUnifiedFinancialContext();
  const [strategy, setStrategy] = useState('A'); // A: adjust timeline, B: allocate surplus, C: suggest cuts
  const [allocationMode, setAllocationMode] = useState('equal'); // equal | priority
  const [plan, setPlan] = useState(null);
  const surplus = selectNetCashFlow();

  const goals = useMemo(() => {
    // Handle both array and overview-object shapes
    if (Array.isArray(goalsState)) return goalsState;
    if (goalsState && Array.isArray(goalsState.goals)) return goalsState.goals;
    return [];
  }, [goalsState]);

  const enriched = useMemo(() => goals.map((g) => {
    const target = parseFloat(g.target_amount || g.target || 0) || 0;
    const current = parseFloat(g.current_amount || g.current || 0) || 0;
    const months = monthsUntil(g.target_date);
    const requiredMonthly = months > 0 ? Math.max(0, (target - current) / months) : target - current;
    // Priority can come from backend field if present
    const pr = (g.priority || '').toString().toLowerCase();
    const priority = pr === 'high' || pr === 'medium' || pr === 'low' ? pr : undefined;
    return { id: g.id, name: g.name, target, current, target_date: g.target_date, months, requiredMonthly, priority };
  }), [goals]);

  const totalRequired = enriched.reduce((s, g) => s + (g.requiredMonthly || 0), 0);

  const weightFor = (name, priority) => {
    if (priority) {
      if (priority === 'high') return 3;
      if (priority === 'medium') return 2;
      return 1;
    }
    const n = (name || '').toLowerCase();
    if (n.includes('emergency') || n.includes('debt') || n.includes('retirement')) return 3;
    if (n.includes('home') || n.includes('education')) return 2;
    return 1; // investment/other
  };

  const computePlan = () => {
    const s = surplus;
    if (s <= 0 || enriched.length === 0) {
      setPlan({ summary: `No surplus available. Consider reducing expenses.`, items: [] });
      return;
    }

    if (strategy === 'A') {
      // Adjust timelines proportionally so that sum(required) == surplus
      const ratio = totalRequired > 0 ? totalRequired / s : 1;
      const items = enriched.map((g) => {
        const adjMonths = Math.ceil((g.months || 1) * ratio);
        const newDate = new Date();
        newDate.setMonth(newDate.getMonth() + adjMonths);
        const iso = newDate.toISOString().slice(0, 10);
        return { id: g.id, name: g.name, new_target_date: iso, note: `Adjust to ${adjMonths} months` };
      });
      setPlan({ summary: `Timelines adjusted to fit monthly surplus (${KES(s)}).`, items });
    } else if (strategy === 'B') {
      if (allocationMode === 'equal') {
        const perGoal = s / enriched.length;
        const items = enriched.map((g) => ({ id: g.id, name: g.name, monthly_allocation: perGoal }));
        setPlan({ summary: `Surplus allocated equally across goals.`, items });
      } else {
        // Priority-weighted with caps at required
        let remaining = s;
        const reqMap = enriched.map(g => ({ id: g.id, name: g.name, required: Math.max(0, g.requiredMonthly || 0), weight: weightFor(g.name, g.priority), alloc: 0 }));
        // allocate iteratively to respect caps
        let guard = 0;
        while (remaining > 0 && guard < 10) {
          const needers = reqMap.filter(x => x.alloc < x.required);
          if (needers.length === 0) break;
          const totalWeight = needers.reduce((sum, x) => sum + (x.weight || 1), 0) || 1;
          let distributed = 0;
          for (const n of needers) {
            const share = (remaining * (n.weight / totalWeight)) || 0;
            const capRoom = n.required - n.alloc;
            const add = Math.min(share, capRoom);
            n.alloc += add;
            distributed += add;
          }
          if (distributed <= 0.01) break; // prevent infinite loop on tiny remainders
          remaining -= distributed;
          guard++;
        }
        const items = reqMap.map(r => ({ id: r.id, name: r.name, monthly_allocation: r.alloc }));
        setPlan({ summary: `Surplus allocated by priority with caps at required.`, items });
      }
    } else {
      // Suggest cuts to cover deficit (if any)
      const deficit = Math.max(0, totalRequired - s);
      setPlan({ summary: `Suggest reducing discretionary expenses by ${KES(deficit)} to meet goal timelines.`, items: [] });
    }
  };

  useEffect(() => { computePlan(); /* eslint-disable-next-line */ }, [strategy, surplus, goalsState]);

  const applyPlan = async () => {
    if (!plan) return;
    // Strategy A: update target dates via goals endpoint
    if (strategy === 'A') {
      for (const it of plan.items) {
        try { await updateGoal(it.id, { target_date: it.new_target_date }); } catch (e) { /* non-fatal */ }
      }
      alert('Timelines updated to fit surplus.');
    }
    // Strategy B: create/update budget categories for goal savings (simple approach)
    if (strategy === 'B') {
      for (const it of plan.items) {
        try { await createBudgetCategory({ name: `Goal: ${it.name}`, budgeted_amount: Math.round(it.monthly_allocation) }); } catch (e) { /* non-fatal */ }
      }
      alert('Created/updated budget categories for goal allocations.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Goal Funding Reality Check</h2>
      <p className="text-gray-600 mb-4">Compare required monthly savings for your goals against your current monthly surplus and choose a plan.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Monthly Surplus</p>
          <p className={`text-2xl font-bold ${surplus >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>{KES(surplus)}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Required for Goals</p>
          <p className="text-2xl font-bold text-purple-800">{KES(totalRequired)}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 mb-1">Feasibility</p>
          <p className="text-2xl font-bold text-green-800">{totalRequired <= surplus ? 'On Track' : 'Shortfall'}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Strategy</p>
          <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="A">A: Adjust timelines to fit surplus</option>
            <option value="B">B: Allocate surplus across goals</option>
            <option value="C">C: Suggest budget cuts</option>
          </select>
          {strategy === 'B' && (
            <div className="mt-2">
              <p className="text-sm text-yellow-700 mb-1">Allocation Mode</p>
              <select value={allocationMode} onChange={(e)=>setAllocationMode(e.target.value)} className="w-full border rounded px-2 py-1">
                <option value="equal">Equal Split</option>
                <option value="priority">Priority-weighted (caps at required)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Before vs After snapshot */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Before vs After</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-1">Goal</th>
              <th>Current</th>
              <th>Target</th>
              <th>Months left</th>
              <th>Required/mo</th>
              {strategy === 'A' && <th>After: Target Date</th>}
              {strategy === 'B' && <th>After: Monthly Allocation</th>}
            </tr>
          </thead>
          <tbody>
            {enriched.map((g) => {
              const planMap = new Map((plan?.items || []).map(it => [it.id, it]));
              const p = planMap.get(g.id);
              return (
                <tr key={`before-after-${g.id}`} className="border-t">
                  <td className="py-1">{g.name}</td>
                  <td>{KES(g.current)}</td>
                  <td>{KES(g.target)}</td>
                  <td>{g.months}</td>
                  <td>{KES(g.requiredMonthly)}</td>
                  {strategy === 'A' && <td>{p?.new_target_date || '—'}</td>}
                  {strategy === 'B' && <td>{p ? KES(p.monthly_allocation) : '—'}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Plan Preview</h3>
        <p className="text-gray-700 mb-3">{plan?.summary}</p>
        {strategy === 'A' && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600"><th className="py-1">Goal</th><th>New Target Date</th><th>Note</th></tr>
            </thead>
            <tbody>
              {plan?.items?.map((it) => (
                <tr key={it.id} className="border-t"><td className="py-1">{it.name}</td><td>{it.new_target_date}</td><td>{it.note}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {strategy === 'B' && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600"><th className="py-1">Goal</th><th>Monthly Allocation</th></tr>
            </thead>
            <tbody>
              {plan?.items?.map((it) => (
                <tr key={it.id} className="border-t"><td className="py-1">{it.name}</td><td>{KES(it.monthly_allocation)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={computePlan} className="bg-gray-100 border px-4 py-2 rounded">Recompute</button>
        {(strategy === 'A' || strategy === 'B') && (
          <button onClick={applyPlan} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Apply Plan</button>
        )}
      </div>
    </div>
  );
};

export default GoalRealityCheck;
