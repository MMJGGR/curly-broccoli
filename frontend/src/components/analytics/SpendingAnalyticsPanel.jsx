import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, EmptyState } from '../ui';

const SpendingAnalyticsPanel = ({ months = 6 }) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    // Dev guard: avoid duplicate fetches in StrictMode by caching within session
    const guardKey = `spending_analytics_${months}`;
    try { if (sessionStorage.getItem(guardKey) === '1') { setLoading(false); return; } } catch {}
    (async () => {
      setLoading(true); setError(null);
      try {
        const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        const token = localStorage.getItem('jwt');
        const res = await fetch(`${base}/api/v1/analytics-v2/spending?months=${encodeURIComponent(months)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    try { sessionStorage.setItem(guardKey, '1'); } catch {}
    return () => { cancelled = true; };
  }, [months]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Spending Analytics</CardTitle></CardHeader>
        <CardContent className="text-scale break-words">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Spending Analytics</CardTitle></CardHeader>
        <CardContent className="text-scale break-words">
          <EmptyState title="Analytics unavailable" description="We couldn't load spending analytics right now." />
        </CardContent>
      </Card>
    );
  }

  const totals = data?.totals || { total_income: 0, total_expenses: 0, net_cash_flow: 0 };
  const breakdown = data?.category_breakdown || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Analytics (Last {months} months)</CardTitle>
      </CardHeader>
      <CardContent className="text-scale break-words">
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-600">Income</div>
            <div className="font-semibold text-green-700">KES {Math.round(totals.total_income).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-600">Expenses</div>
            <div className="font-semibold text-red-700">KES {Math.round(totals.total_expenses).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-600">Net</div>
            <div className={`font-semibold ${totals.net_cash_flow >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>KES {Math.round(totals.net_cash_flow).toLocaleString()}</div>
          </div>
        </div>
        <div className="space-y-2">
          {Object.keys(breakdown).length === 0 ? (
            <EmptyState title="No spending data" description="Start recording expenses to see analytics here." />
          ) : (
            Object.entries(breakdown).map(([cat, amt]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-700">{cat.replace('_',' ')}</span>
                <span className="font-medium">KES {Math.round(amt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingAnalyticsPanel;
