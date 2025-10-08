import React, { useMemo } from 'react';
import { PageHeader, Skeleton, EmptyState, Alert } from '../ui';
import { Target as TargetIcon, CheckCircle2, TrendingUp } from '../ui/icons';
import Layout from '../layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Stat } from '../ui/stat';
import SpendingAnalyticsPanel from '../analytics/SpendingAnalyticsPanel';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import ScenarioControls from '../analytics/ScenarioControls';

export default function PlanStructured() {
  const { goals = [], selectBudgetCategories, selectRetirementReadiness, loading: ufLoading, errors: ufErrors } = useUnifiedFinancialContext();
  const readiness = useMemo(() => {
    try { return selectRetirementReadiness ? selectRetirementReadiness() : null; } catch { return null; }
  }, [selectRetirementReadiness]);
  const cats = useMemo(() => { try { return selectBudgetCategories ? selectBudgetCategories() : []; } catch { return []; } }, [selectBudgetCategories]);
  const goalCoverage = useMemo(() => {
    const map = new Map();
    (cats||[]).forEach(c=>{ if (c.name && c.name.startsWith('Goal: ')) map.set(c.name.replace('Goal: ','').toLowerCase(), parseFloat(c.budgeted_amount)||0); });
    return (goals||[]).slice(0,3).map(g=>({ name:g.name, budgeted: map.get((g.name||'').toLowerCase())||0 }));
  }, [cats, goals]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Plan"
        description="Scenarios, readiness, and goal coverage"
        primaryAction={{ label: 'Add Goal', href: '/app/tools?section=goals' }}
        secondaryAction={{ label: 'Rebalance', href: '/app/balance-sheet', variant: 'outline' }}
      />
      <Layout>
        {ufErrors?.global && (
          <Alert variant="warning" title="Some data may be unavailable">We could not load all plan data. Panels will show partial information.</Alert>
        )}
        {/* Overview */}
        {ufLoading?.global ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" role="region" aria-label="Plan KPIs">
            <Stat label="Goals" value={`${goals.length}`} tone="info" icon={<TargetIcon className="h-4 w-4" />} />
            <Stat label="Avg Coverage" value={`${Math.round(goalCoverage.length? goalCoverage.reduce((s,g)=>s+(g.budgeted>0?100:0),0)/goalCoverage.length : 0)}%`} icon={<TrendingUp className="h-4 w-4" />} />
            <Stat label="Readiness" value={readiness? `${Math.round((readiness.score||0)*100)}%` : '—'} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>
        )}

        {/* Decision Center */}
        <Card className="mb-6">
          <CardHeader><CardTitle>Next Best Action</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-gray-800 mb-3">Increase contribution for an underfunded goal to improve timeline certainty.</div>
            <div className="flex gap-2">
              <a className="px-3 py-2 text-sm rounded-md bg-blue-50 border border-blue-200 text-blue-700" href="/app/plan" aria-label="Apply plan adjustment">Apply Adjustment</a>
              <a className="px-3 py-2 text-sm rounded-md border" href="/app/dashboard" aria-label="Preview pro forma impact">Preview Pro‑Forma</a>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Portfolio */}
            <Card role="region" aria-labelledby="goal-portfolio-title">
              <CardHeader><CardTitle id="goal-portfolio-title">Goal Portfolio</CardTitle></CardHeader>
              <CardContent>
                {ufLoading?.goals ? (
                  <>
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-4/5 mt-2" />
                  </>
                ) : goalCoverage.length === 0 ? (
                  <EmptyState title="No goals yet" description="Add a goal to start tracking coverage." actionLabel="Add Goal" onAction={() => window.location.assign('/app/tools?section=goals')} />
                ) : (
                  <div className="space-y-3">
                    {goalCoverage.map((g, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm"><span>{g.name}</span><span className="tabular-nums">Budgeted: KES {Math.round(g.budgeted).toLocaleString()}</span></div>
                        <div className="h-2 bg-gray-200 rounded"><div className="h-2 bg-blue-400 rounded" style={{width: `${Math.min(100, g.budgeted>0?100:0)}%`}} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <SpendingAnalyticsPanel months={6} />
          </div>

          {/* Scenarios + Readiness */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Scenarios</CardTitle></CardHeader>
              <CardContent>
                <ScenarioControls />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Readiness</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm">Score: <span className="font-semibold">{readiness? `${Math.round((readiness.score||0)*100)}%` : '—'}</span></div>
                <div className="text-sm mt-1">Monthly Gap: <span className={`font-semibold ${readiness && readiness.monthly_gap>0?'text-red-700':'text-emerald-700'}`}>{readiness? `KES ${Math.round(readiness.monthly_gap||0).toLocaleString()}` : '—'}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </div>
  );
}
