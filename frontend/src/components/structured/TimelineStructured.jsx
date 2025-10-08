import React, { useMemo } from 'react';
import { PageHeader, Skeleton, EmptyState } from '../ui';
import Layout from '../layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Stat } from '../ui/stat';
import { CheckCircle2, Target as TargetIcon, Shield } from '../ui/icons';
import { useTimeline } from '../../contexts/TimelineContext';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

export default function TimelineStructured() {
  const { milestones = [], alignmentScore = 0, loading, error } = useTimeline();
  const { planningStartDate, setPlanningStartDate } = useUnifiedFinancialContext();
  const [events, setEvents] = React.useState([]);
  React.useEffect(()=>{
    (async ()=>{
      try{
        const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        const token = localStorage.getItem('jwt');
        const res = await fetch(`${base}/api/v1/events/recent`, { headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok){ const json = await res.json(); setEvents(Array.isArray(json.events)? json.events:[]);} 
      } catch {}
    })();
  },[]);
  const done = (milestones||[]).filter(m=>m.completed).length;
  const next = (milestones||[]).find(m=>!m.completed);
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Timeline"
        description="Milestones, lanes, dependencies, and actions"
        primaryAction={{ label: 'Add Milestone', href: '/app/plan' }}
        secondaryAction={{ label: 'Plan Controls', href: '/app/plan', variant: 'outline' }}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" role="region" aria-label="Timeline KPIs">
            <Stat label="Progress" value={`${Math.round(alignmentScore||0)}%`} tone="info" icon={<CheckCircle2 className="h-4 w-4" />} />
            <Stat label="Completed" value={`${done}/${milestones.length}`} icon={<CheckCircle2 className="h-4 w-4" />} />
            <Stat label="Next" value={next? (next.name || next.category || '—') : '—'} icon={<TargetIcon className="h-4 w-4" />} />
            <Stat label="Risk Status" value="Low" tone="success" icon={<Shield className="h-4 w-4" />} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card role="region" aria-labelledby="planning-title">
            <CardHeader><CardTitle id="planning-title">Planning Start</CardTitle></CardHeader>
            <CardContent>
              <label className="text-sm text-gray-700 mr-2" htmlFor="planning-month">Start Month</label>
              <input id="planning-month" type="month" className="border rounded px-2 py-1 text-sm" value={(planningStartDate || '').slice(0,7)} onChange={(e)=>setPlanningStartDate(`${e.target.value}-01`)} />
              <div className="text-xs text-gray-500 mt-1">Align schedules and labels from this month.</div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2" role="region" aria-labelledby="lanes-title">
            <CardHeader><CardTitle id="lanes-title">Milestones (Lanes)</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-2 w-4/5" />
                </>
              ) : (milestones.length === 0 ? (
                <EmptyState title="No milestones yet" description="Add goals to populate your timeline." actionLabel="Add Goal" onAction={() => window.location.assign('/app/plan')} />
              ) : (
                <>
                  <div className="text-sm text-gray-700 mb-2">Financial Health</div>
                  <div className="h-2 bg-gray-200 rounded mb-4"><div className="h-2 bg-green-400 rounded" style={{width:'100%'}} /></div>
                  <div className="text-sm text-gray-700 mb-2">Debt</div>
                  <div className="h-2 bg-gray-200 rounded mb-4"><div className="h-2 bg-blue-400 rounded" style={{width:'100%'}} /></div>
                  <div className="text-sm text-gray-700 mb-2">Goals</div>
                  <div className="h-2 bg-gray-200 rounded"><div className="h-2 bg-blue-400 rounded" style={{width:'68%'}} /></div>
                  <div className="text-xs text-gray-500 mt-2">Dependencies indicated in detailed view</div>
                </>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Event Log (Recent)</CardTitle></CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-sm text-gray-600">No recent events.</div>
              ) : (
                <ul className="text-sm text-gray-800 space-y-2">
                  {events.slice(0,6).map((e,idx)=> (
                    <li key={idx} className="flex items-center justify-between border-b pb-1">
                      <span className="truncate mr-2">{e.title || e.type}</span>
                      <span className="text-gray-500 whitespace-nowrap">{new Date(e.timestamp).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </div>
  );
}
