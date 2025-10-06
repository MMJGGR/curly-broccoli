import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const KES = (n) => `KES ${Math.round(n || 0).toLocaleString()}`;

export default function IncomeStatement({ months = 12 }) {
  const { selectSchedules, planningStartDate } = useUnifiedFinancialContext();
  const [serverData, setServerData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        const token = localStorage.getItem('jwt');
        const res = await fetch(`${base}/api/v1/pl/statement?months=${encodeURIComponent(months)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json && Array.isArray(json.rows)) {
          setServerData(json);
        }
      } catch (_) {
        // Fallback to schedules
      }
    })();
    return () => { cancelled = true; };
  }, [months]);

  const data = useMemo(() => {
    // Prefer server data when available
    if (serverData && Array.isArray(serverData.rows)) {
      const rows = serverData.rows.map((r, idx) => ({
        idx,
        label: (() => {
          try {
            const [y, m] = String(r.period).split('-').map(Number);
            const d = new Date(y, (m || 1) - 1, 1);
            return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
          } catch { return r.period; }
        })(),
        income: r.income || 0,
        operating_expenses: r.operating_expenses || 0,
        goal_contributions: r.goal_contributions || 0,
        net_income: r.net_income || 0
      }));
      return { rows, totals: serverData.totals || { income: 0, operating_expenses: 0, goal_contributions: 0, net_income: 0 } };
    }

    try {
      const flows = selectSchedules(months);
      const byMonth = Array.from({ length: months }, () => ({ income: 0, expenses: 0, goals: 0 }));
      for (const f of flows) {
        const t = Math.min(months - 1, Math.max(0, f.t || 0));
        if (f.type === 'income') byMonth[t].income += f.amount || 0;
        if (f.type === 'expense') byMonth[t].expenses += f.amount || 0;
        if (f.type === 'goal_contribution') byMonth[t].goals += f.amount || 0;
      }
      // Build rows newest-first
      const rows = byMonth.map((m, idx) => {
        const base = planningStartDate ? new Date(planningStartDate) : new Date();
        const d = new Date(base);
        d.setMonth(d.getMonth() + idx);
        return {
          idx,
          label: d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
          income: m.income,
          operating_expenses: m.expenses,
          goal_contributions: m.goals,
          net_income: m.income + m.expenses + m.goals // expenses/goals negative
        };
      }).reverse();
      const totals = rows.reduce((s, r) => ({
        income: s.income + r.income,
        operating_expenses: s.operating_expenses + r.operating_expenses,
        goal_contributions: s.goal_contributions + r.goal_contributions,
        net_income: s.net_income + r.net_income
      }), { income: 0, operating_expenses: 0, goal_contributions: 0, net_income: 0 });
      return { rows, totals };
    } catch {
      return { rows: [], totals: { income: 0, operating_expenses: 0, goal_contributions: 0, net_income: 0 } };
    }
  }, [selectSchedules, planningStartDate, months, serverData]);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Income Statement (Last {months} Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Period</th>
                  <th>Income</th>
                  <th>Operating Expenses</th>
                  <th>Goal Contributions</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map(r => (
                  <tr key={r.idx} className="border-b">
                    <td className="py-2">{r.label}</td>
                    <td className="text-green-700">{KES(r.income)}</td>
                    <td className="text-red-700">{KES(r.operating_expenses)}</td>
                    <td className="text-purple-700">{KES(r.goal_contributions)}</td>
                    <td className={`${r.net_income >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>{KES(r.net_income)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 font-semibold">Totals</td>
                  <td className="font-semibold text-green-800">{KES(data.totals.income)}</td>
                  <td className="font-semibold text-red-800">{KES(data.totals.operating_expenses)}</td>
                  <td className="font-semibold text-purple-800">{KES(data.totals.goal_contributions)}</td>
                  <td className={`font-semibold ${data.totals.net_income >= 0 ? 'text-emerald-800' : 'text-orange-800'}`}>{KES(data.totals.net_income)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
