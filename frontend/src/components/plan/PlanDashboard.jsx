import React, { useMemo, useState, useEffect } from 'react';
import GoalsOverview from '../goals/GoalsOverview';
import { EmptyState } from '../ui/empty-state';
import GoalRealityCheck from '../tools/GoalRealityCheck';
import { useTimeline } from '../../contexts/TimelineContext';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { generateAudits, auditsToMilestones } from '../../utils/auditEngine';
import { Button } from '../ui/button';
import ProbabilityGauge from '../analytics/ProbabilityGauge';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import ScenarioControls from '../analytics/ScenarioControls';
import { markStart, markEnd, report } from '../../utils/metrics';

const PlanDashboard = () => {
  const { milestones = [], currentAge } = useTimeline();
  const {
    goals = [],
    selectBudgetCategories,
    fetchBudgetCategories,
    createBudgetCategory,
    updateBudgetCategory,
    selectBudgetAlerts,
    selectDebtPaydownPlan,
    selectRetirementReadiness
  } = useUnifiedFinancialContext();

  const [editState, setEditState] = useState({});

  useEffect(() => {
    try { if (fetchBudgetCategories) fetchBudgetCategories(); } catch {}
  }, [fetchBudgetCategories]);

  const goalBudgetMap = useMemo(() => {
    try {
      const cats = selectBudgetCategories ? selectBudgetCategories() : [];
      const map = new Map();
      (cats || []).forEach(c => {
        if (typeof c.name === 'string' && c.name.startsWith('Goal: ')) {
          const name = c.name.replace('Goal: ', '').trim();
          map.set(name.toLowerCase(), { amount: parseFloat(c.budgeted_amount) || 0, id: c.id, raw: c });
        }
      });
      return map;
    } catch { return new Map(); }
  }, [selectBudgetCategories]);

  const goalCoverage = useMemo(() => {
    const out = [];
    const now = new Date();
    for (const g of goals || []) {
      const target = parseFloat(g.target_amount || 0);
      const current = parseFloat(g.current_amount || 0);
      const remaining = Math.max(0, target - current);
      let months = 0;
      try {
        const d = new Date(g.target_date);
        months = Math.max(0, Math.round((d - now) / (1000 * 60 * 60 * 24 * 30)));
      } catch { months = 0; }
      const required = months > 0 ? remaining / months : 0;
      const entry = goalBudgetMap.get((g.name || '').toLowerCase());
      const budgeted = entry?.amount || 0;
      const pct = required > 0 ? Math.min(100, Math.round((budgeted / required) * 100)) : (budgeted > 0 ? 100 : 0);
      out.push({ id: g.id || g.name, name: g.name, required, budgeted, pct, catId: entry?.id || null });
    }
    return out;
  }, [goals, goalBudgetMap]);

  const goalsImpactSummary = useMemo(() => {
    try {
      const underfunded = goalCoverage.filter(g => g.pct < 100);
      const fullyFunded = goalCoverage.filter(g => g.pct >= 100);
      const avgPct = goalCoverage.length > 0 ? Math.round(goalCoverage.reduce((s, g) => s + g.pct, 0) / goalCoverage.length) : 0;
      return { underfundedCount: underfunded.length, fullyFundedCount: fullyFunded.length, avgCoveragePct: avgPct };
    } catch { return { underfundedCount: 0, fullyFundedCount: 0, avgCoveragePct: 0 }; }
  }, [goalCoverage]);

  const upcomingMilestones = useMemo(() => {
    const future = (milestones || []).filter(m => !currentAge || m.age >= currentAge);
    return future.slice(0, 4);
  }, [milestones, currentAge]);

  // Derived audits and milestone suggestions
  const unifiedSnapshot = {
    incomes: (useUnifiedFinancialContext?.incomes) ? undefined : undefined,
  };
  const ctx = useUnifiedFinancialContext();
  const audits = useMemo(() => generateAudits({
    incomes: ctx.incomes,
    expenses: ctx.expenses,
    liabilities: ctx.liabilities,
    assets: ctx.assets,
    goals: ctx.goals,
    budgetCategories: ctx.selectBudgetCategories ? ctx.selectBudgetCategories() : []
  }), [ctx]);
  const suggestedMilestones = useMemo(() => auditsToMilestones(audits), [audits]);

  // Likelihood score (budget surplus heuristic)
  const analytics = useAnalytics();
  const likelihood = useMemo(() => {
    try {
      const income = (ctx.incomes || []).reduce((s, i) => s + (i.monthly_amount || i.amount || 0), 0);
      const exp = (ctx.expenses || []).reduce((s, e) => s + (e.monthly_equivalent || e.amount || 0), 0);
      const sr = income > 0 ? Math.max(0, (income - exp) / income) : 0;
      // Map savings rate to a probability curve with soft floor
      return Math.max(0.1, Math.min(0.95, 0.5 + (sr - 0.2) * 1.2));
    } catch { return 0.5; }
  }, [ctx.incomes, ctx.expenses]);

  // Budget alerts (transactions vs budget)
  const budgetAlerts = useMemo(() => {
    try { return selectBudgetAlerts ? selectBudgetAlerts({ thresholdPct: 0.0 }) : []; } catch { return []; }
  }, [selectBudgetAlerts]);

  // Debt payoff (v1)
  const debtPlan = useMemo(() => {
    try { return selectDebtPaydownPlan ? selectDebtPaydownPlan({ strategy: 'snowball' }) : null; } catch { return null; }
  }, [selectDebtPaydownPlan]);

  // Retirement readiness (v1)
  const retire = useMemo(() => {
    try { return selectRetirementReadiness ? selectRetirementReadiness() : null; } catch { return null; }
  }, [selectRetirementReadiness]);

  return (
    <div className="min-h-screen bg-gray-50">
      {(() => { try { markStart('view-plan'); setTimeout(() => { markEnd('view-plan'); report('view-plan'); }, 0); } catch {} return null; })()}
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Plan</h1>
            <Button asChild variant="outline" size="sm">
              <a href="/app/tools?section=calculators" aria-label="Open financial calculators">More ▸ Calculators</a>
            </Button>
          </div>
          <p className="text-sm text-gray-600">Goals, audits, coverage, and budget alignment</p>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Likelihood Gauge + Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Plan Likelihood</h2>
            <ProbabilityGauge probability={likelihood} size="small" />
          </div>
          <ScenarioControls />
        </div>

        {/* Budget Alerts (basic) */}
        {budgetAlerts && budgetAlerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="font-semibold text-amber-900 mb-2">Budget Alerts</div>
            <ul className="text-sm text-amber-900 grid grid-cols-1 md:grid-cols-2 gap-2">
              {budgetAlerts.map((a) => (
                <li key={a.id} className="flex justify-between">
                  <span>{a.category}</span>
                  <span>
                    KES {Math.round(a.actual).toLocaleString()} / {Math.round(a.budgeted).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Advisor-style summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Goals Impact (v1)</h2>
            <div className="text-sm text-gray-800">
              <div>Avg Coverage: <span className="font-medium">{goalsImpactSummary.avgCoveragePct}%</span></div>
              <div>Underfunded Goals: <span className="font-medium text-amber-700">{goalsImpactSummary.underfundedCount}</span></div>
              <div>Fully Funded Goals: <span className="font-medium text-green-700">{goalsImpactSummary.fullyFundedCount}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Debt Paydown Plan (v1)</h2>
            {debtPlan ? (
              <div className="text-sm text-gray-800">
                <div>Strategy: <span className="font-medium">{debtPlan.strategy}</span></div>
                <div>Months to pay off: <span className="font-medium">{debtPlan.months ?? '—'}</span></div>
                <div>Estimated interest saved: <span className="font-medium text-green-700">KES {Math.round(debtPlan.interest_saved || 0).toLocaleString()}</span></div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No debts to optimize.</div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Retirement Readiness (v1)</h2>
            {retire ? (
              <div className="text-sm text-gray-800">
                <div>Readiness Score: <span className="font-medium">{retire.score != null ? `${Math.round(retire.score * 100)}%` : '—'}</span></div>
                <div>Monthly Gap: <span className="font-medium {retire.monthly_gap>0?'text-red-700':'text-green-700'}">KES {Math.round(retire.monthly_gap || 0).toLocaleString()}</span></div>
                <div>Years to Retirement: <span className="font-medium">{retire.years_to_retirement ?? '—'}</span></div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Add age and retirement age to see readiness.</div>
            )}
          </div>
        </div>

        {/* Milestone Cards hub */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Milestones</h2>
            <a href="/app/dashboard?view=milestones" className="text-sm text-blue-600 hover:underline">Open Timeline</a>
          </div>
          {upcomingMilestones.length === 0 ? (
            <EmptyState
              icon="🗓️"
              title="No Milestones Yet"
              description="Add goals to populate your timeline milestone plan."
              actionLabel="Go to Goals"
              onAction={() => navigate('/app/tools?section=goals')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMilestones.map((m, idx) => (
                <div key={m.id || idx} className="border rounded-lg p-4 hover:shadow transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Age {m.age}</div>
                      <div className="font-medium text-gray-800">{m.title}</div>
                    </div>
                    <div className="text-2xl">🎯</div>
                  </div>
                  {m.target_amount ? (
                    <div className="mt-2 text-sm text-green-700">KES {Math.round(m.target_amount).toLocaleString()}</div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Milestones from Audits */}
        {suggestedMilestones.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Suggested Milestones</h2>
              <span className="text-xs text-gray-500">Derived from audits</span>
            </div>
            <div className="space-y-3">
              {suggestedMilestones.slice(0,4).map((m, idx) => (
                <div key={m.id || idx} className="flex items-center gap-3 border rounded p-3">
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{m.title}</div>
                    {m.timeline_impact && <div className="text-xs text-gray-500">{m.timeline_impact}</div>}
                  </div>
                  <button
                    className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    onClick={async () => {
                      try {
                        const { saveMilestone } = await import('../../utils/milestones');
                        const res = await saveMilestone(m);
                        if (res?.ok) {
                          alert(res.local ? 'Added milestone (local fallback)' : 'Saved milestone');
                        } else {
                          alert('Failed to save milestone');
                        }
                      } catch {
                        // Local fallback if dynamic import fails
                        try {
                          const raw = localStorage.getItem('suggested_milestones') || '[]';
                          const arr = JSON.parse(raw);
                          localStorage.setItem('suggested_milestones', JSON.stringify([...arr, m]));
                          alert('Added to local milestone suggestions');
                        } catch {}
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals coverage + audit */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Goals Coverage & Audit</h2>
            <a href="#goals-audit" className="text-sm text-blue-600 hover:underline">Details</a>
          </div>
          {goalCoverage.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="No Goals Yet"
              description="Create a goal and align your budget to make steady progress."
              actionLabel="Create Goal"
              onAction={() => navigate('/app/tools?section=goals')}
            />
          ) : (
            <div className="space-y-3">
              {goalCoverage.map(g => (
                <div key={g.id} className="">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium text-gray-800">{g.name}</div>
                    <div className="text-gray-600">Req: KES {Math.round(g.required).toLocaleString()} / mo</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className={`h-2 rounded-full ${g.pct >= 100 ? 'bg-green-600' : 'bg-blue-600'}`} style={{ width: `${g.pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1 text-gray-600">
                    <div>Budgeted: KES {Math.round(g.budgeted).toLocaleString()}</div>
                    <div>Coverage: {g.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Budget Edits for Goal Categories */}
        {goalCoverage.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Budget Edits (Goal Categories)</h2>
            <div className="space-y-3">
              {goalCoverage.map(g => {
                const key = (g.name || '').toLowerCase();
                const current = editState[key] ?? (Number.isFinite(g.budgeted) ? g.budgeted : 0);
                return (
                  <div key={g.id} className="flex items-center gap-3">
                    <div className="w-56 text-sm text-gray-700">Goal: {g.name}</div>
                    <input
                      type="number"
                      value={current}
                      onChange={e => setEditState({ ...editState, [key]: parseFloat(e.target.value || '0') })}
                      className="w-40 border rounded px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-gray-500">KES / month</span>
                    <button
                      className="ml-auto text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={async () => {
                        const name = `Goal: ${g.name}`;
                        const amt = Number.isFinite(current) ? Math.max(0, current) : 0;
                        try {
                          if (g.catId) {
                            await updateBudgetCategory(g.catId, { budgeted_amount: amt });
                          } else {
                            await createBudgetCategory({ name, budgeted_amount: amt });
                          }
                          if (fetchBudgetCategories) fetchBudgetCategories();
                        } catch (e) { console.warn('Quick budget edit failed', e?.message); }
                      }}
                    >
                      Save
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Goals Overview + Reality Check + Audit table */}
        <div className="space-y-6">
          <GoalsOverview />
          <div className="max-w-6xl mx-auto">
            <GoalRealityCheck />
          </div>
          {/* Goals Audit Table */}
          {goalCoverage.length > 0 && (
            <div id="goals-audit" className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Goals Audit</h3>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-gray-600">
                    <tr>
                      <th className="py-2 pr-4">Goal</th>
                      <th className="py-2 pr-4">Required/mo</th>
                      <th className="py-2 pr-4">Budgeted/mo</th>
                      <th className="py-2 pr-4">Coverage</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goalCoverage.map(g => (
                      <tr key={g.id} className="border-t">
                        <td className="py-2 pr-4 text-gray-800">{g.name}</td>
                        <td className="py-2 pr-4">KES {Math.round(g.required).toLocaleString()}</td>
                        <td className="py-2 pr-4">KES {Math.round(g.budgeted).toLocaleString()}</td>
                        <td className="py-2 pr-4">{g.pct}%</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${g.pct >= 100 ? 'bg-green-100 text-green-700' : g.pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {g.pct >= 100 ? 'Covered' : g.pct >= 50 ? 'Partial' : 'Underfunded'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDashboard;
