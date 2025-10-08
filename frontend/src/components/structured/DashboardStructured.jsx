import React, { useMemo } from 'react';
import { PageHeader, Skeleton, EmptyState } from '../ui';
import { TrendingUp, Target as TargetIcon, CheckCircle2, AlertCircle } from '../ui/icons';
import Layout from '../layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Stat } from '../ui/stat';
import SpendingAnalyticsPanel from '../analytics/SpendingAnalyticsPanel';
import JournalViewer from '../ledger/JournalViewer';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { useTimeline } from '../../contexts/TimelineContext';

export default function DashboardStructured() {
  const { selectNetCashFlow, selectSurplusAfterGoals, loading: ufLoading, errors: ufErrors } = useUnifiedFinancialContext();
  const { milestones = [], alignmentScore = 0, loading: tlLoading, error: tlError } = useTimeline();

  const surplus = useMemo(() => {
    try { return selectNetCashFlow ? selectNetCashFlow() : 0; } catch { return 0; }
  }, [selectNetCashFlow]);
  const afterGoals = useMemo(() => {
    try { return selectSurplusAfterGoals ? selectSurplusAfterGoals() : surplus; } catch { return surplus; }
  }, [selectSurplusAfterGoals, surplus]);
  const nextMilestone = (milestones || []).find(m => !m.completed);

  const loading = Boolean(ufLoading?.global) || Boolean(tlLoading);
  const errorMsg = tlError || ufErrors?.global || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Dashboard"
        description="Overview, Decision Center, Progress & Health, Analytics"
        primaryAction={{ label: 'Add Goal', href: '/app/plan' }}
        secondaryAction={{ label: 'Review Budget', href: '/app/budget', variant: 'outline' }}
      />
      <Layout>
        {/* Overview */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" role="region" aria-label="Dashboard KPIs">
            <Stat label="Monthly Surplus" value={`KES ${Math.round(surplus).toLocaleString()}`} tone={surplus>=0?'success':'danger'} icon={<TrendingUp className="h-4 w-4" />} />
            <Stat label="After‑Goals Surplus" value={`KES ${Math.round(afterGoals).toLocaleString()}`} tone={afterGoals>=0?'success':'warning'} icon={<TrendingUp className="h-4 w-4" />} />
            <Stat label="Alignment" value={`${Math.round(alignmentScore||0)}%`} tone="info" icon={<CheckCircle2 className="h-4 w-4" />} />
            <Stat label="Next Milestone" value={nextMilestone ? `${nextMilestone.name || nextMilestone.category} • ${nextMilestone.age || ''}` : '—'} icon={<TargetIcon className="h-4 w-4" />} />
          </div>
        )}

        {/* Decision Center */}
        <Card className="mb-6" role="region" aria-labelledby="nba-title">
          <CardHeader><CardTitle id="nba-title">Next Best Action</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-4 w-2/3 mb-3" />
                <Skeleton className="h-8 w-1/3" />
              </>
            ) : (
              <>
                <div className="text-sm text-gray-800 mb-3">{afterGoals >= 0 ? 'Allocate part of your surplus to accelerate your next milestone.' : 'Deficit detected — review discretionary categories to restore surplus.'}</div>
                <div className="flex gap-2">
                  <a className="px-3 py-2 text-sm rounded-md bg-blue-50 border border-blue-200 text-blue-700" href="/app/plan" aria-label="Apply allocation in Plan">Apply Allocation</a>
                  <a className="px-3 py-2 text-sm rounded-md border" href="/app/cash-flow" aria-label="Open P and L statements">Open P&L</a>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress & Health */}
          <Card className="lg:col-span-1" role="region" aria-labelledby="ph-title">
            <CardHeader><CardTitle id="ph-title">Progress &amp; Health</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-700">Timeline Progress: <span className="font-semibold">{Math.round(alignmentScore||0)}%</span></div>
                  <div className="text-sm text-gray-700 mt-2">Budget Health: <span className={`font-semibold ${surplus>=0?'text-emerald-700':'text-red-700'}`}>{surplus>=0?'Healthy':'Deficit'}</span></div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Analytics & Evidence */}
          <div className="lg:col-span-2 space-y-6">
            {errorMsg ? (
              <EmptyState title="Data temporarily unavailable" description="Some panels failed to load. Please try again shortly." />
            ) : (
              <>
                <SpendingAnalyticsPanel months={6} />
                <JournalViewer />
              </>
            )}
          </div>
        </div>
      </Layout>
    </div>
  );
}
