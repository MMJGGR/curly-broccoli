import React from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

export default function InvestVsDebtTradeoff() {
  const ctx = useUnifiedFinancialContext();
  const [strategy, setStrategy] = React.useState('snowball');
  const [monthlyExtra, setMonthlyExtra] = React.useState('0');
  const extra = Math.max(0, parseFloat(monthlyExtra) || 0);

  // Debt scenario
  const debtPlan = React.useMemo(() => {
    try { return ctx.selectDebtPaydownPlan ? ctx.selectDebtPaydownPlan({ strategy, monthlyExtra: extra }) : null; } catch { return null; }
  }, [ctx, strategy, extra]);

  // Goals scenario: approximate coverage lift by distributing extra across underfunded goals proportionally
  const goalImpact = React.useMemo(() => {
    try {
      const goals = ctx.goals || [];
      const now = new Date();
      const under = goals.map(g => {
        const target = Math.max(0, parseFloat(g.target_amount || g.target || 0) || 0);
        const current = Math.max(0, parseFloat(g.current_amount || g.current || 0) || 0);
        const remaining = Math.max(0, target - current);
        let months = 0; try { months = Math.max(0, Math.round((new Date(g.target_date) - now) / (1000*60*60*24*30))); } catch { months = 0; }
        const req = months > 0 ? remaining / months : 0; // required per month
        return { id: g.id, name: g.name, required: req, remaining };
      }).filter(x => x.required > 0);
      const totalReq = under.reduce((s, x) => s + x.required, 0);
      const lift = totalReq > 0 ? Math.min(100, Math.round((extra / totalReq) * 100)) : 0;
      return { underfundedCount: under.length, totalMonthlyRequired: totalReq, coverageLiftPct: lift };
    } catch { return { underfundedCount: 0, totalMonthlyRequired: 0, coverageLiftPct: 0 }; }
  }, [ctx.goals, extra]);

  const applyDebt = async () => {
    try { await ctx.applyDebtPlan({ strategy, monthlyExtra: extra }); } catch {}
  };
  const applyGoals = async () => {
    try {
      const goals = ctx.goals || [];
      const cats = (ctx.selectBudgetCategories ? (ctx.selectBudgetCategories() || []) : []);
      const under = goals.filter(g => (parseFloat(g.current_amount || g.current || 0) || 0) < (parseFloat(g.target_amount || g.target || 0) || 0));
      if (under.length === 0 || extra <= 0) return;
      const per = extra / under.length;
      for (const g of under) {
        const name = `Goal: ${g.name}`;
        const existing = cats.find(c => String(c.name || '').toLowerCase() === name.toLowerCase());
        if (existing) {
          const next = (parseFloat(existing.budgeted_amount) || 0) + per;
          await ctx.updateBudgetCategory(existing.id, { budgeted_amount: next });
        } else {
          await ctx.createBudgetCategory({ name, budgeted_amount: per });
        }
      }
    } catch {}
  };

  return (
    <div className="p-6 space-y-6" data-testid="invest-vs-debt">
      <Card>
        <CardHeader>
          <CardTitle>Invest vs Debt Tradeoff (CR024)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-gray-700">Monthly Extra (KES)</label>
            <input className="border rounded px-3 py-2 w-40" type="number" value={monthlyExtra} onChange={e => setMonthlyExtra(e.target.value)} />
            <label className="text-gray-700 ml-2">Debt Strategy</label>
            <select className="border rounded px-3 py-2" value={strategy} onChange={e => setStrategy(e.target.value)}>
              <option value="snowball">Snowball</option>
              <option value="avalanche">Avalanche</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Apply to Debt</CardTitle>
          </CardHeader>
          <CardContent>
            {debtPlan ? (
              <div className="text-sm text-gray-800 space-y-2">
                <div>Strategy: <span className="font-medium">{debtPlan.strategy}</span></div>
                <div>Months to pay off: <span className="font-medium">{debtPlan.months ?? '—'}</span></div>
                <div>Estimated interest saved: <span className="font-medium text-green-700">KES {Math.round(debtPlan.interest_saved || 0).toLocaleString()}</span></div>
                <Button onClick={applyDebt} className="mt-2">Apply Debt Plan</Button>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No debts to optimize.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Apply to Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-800 space-y-2">
              <div>Underfunded goals: <span className="font-medium">{goalImpact.underfundedCount}</span></div>
              <div>Total monthly required: <span className="font-medium">KES {Math.round(goalImpact.totalMonthlyRequired || 0).toLocaleString()}</span></div>
              <div>Estimated coverage lift: <span className="font-medium text-blue-700">{goalImpact.coverageLiftPct}%</span></div>
              <Button onClick={applyGoals} className="mt-2">Allocate to Goals Budget</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

