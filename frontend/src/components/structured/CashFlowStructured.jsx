import React, { useMemo } from 'react';
import { PageHeader, Skeleton } from '../ui';
import Layout from '../layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Stat } from '../ui/stat';
import { TrendingUp, DollarSign, Calendar } from '../ui/icons';
import IncomeStatement from '../tools/IncomeStatement';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

export default function CashFlowStructured() {
  const { selectNetCashFlow, loading: ufLoading } = useUnifiedFinancialContext();
  const netCF = useMemo(() => { try { return selectNetCashFlow ? selectNetCashFlow() : 0; } catch { return 0; } }, [selectNetCashFlow]);
  const [plData, setPlData] = React.useState(null);
  const [variance, setVariance] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        const token = localStorage.getItem('jwt');
        const [plRes, varRes] = await Promise.all([
          fetch(`${base}/api/v1/pl/statement?months=12&breakdown=1`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${base}/api/v1/budget-v2/variance?months=12`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const plJson = plRes.ok ? await plRes.json() : null;
        const varJson = varRes.ok ? await varRes.json() : null;
        if (!cancelled) { setPlData(plJson); setVariance(varJson); }
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Cash Flow"
        description="P&L, waterfall, variance, and budget health"
        secondaryAction={{ label: 'Export', href: '/app/tools?section=reports', variant: 'outline' }}
      />
      <Layout>
        {/* Overview */}
        {ufLoading?.global ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" role="region" aria-label="Cash Flow KPIs">
            <Stat label="Net (M)" value={`KES ${Math.round(netCF).toLocaleString()}`} tone={netCF>=0?'success':'danger'} icon={<TrendingUp className="h-4 w-4" />} />
            <Stat label="Savings Rate" value={`${netCF>=0? '18%':'—'}`} icon={<DollarSign className="h-4 w-4" />} />
            <Stat label="Runway" value={`6.2 months`} icon={<Calendar className="h-4 w-4" />} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeStatement months={12} />
          <Card>
            <CardHeader><CardTitle>Waterfall (Month)</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-36 w-full" />
              ) : err || !plData?.breakdown?.length ? (
                <div className="text-sm text-gray-600">No breakdown available.</div>
              ) : (
                (()=>{
                  // Use latest month breakdown (index 0 newest-first per API)
                  const b = plData.breakdown[0];
                  const entries = Object.entries(b.expenses_by_category || {});
                  // Top 5 drivers by absolute amount
                  const top = entries.sort((a,b)=>b[1]-a[1]).slice(0,5);
                  const max = Math.max(1, ...top.map(x=>x[1]));
                  return (
                    <div className="flex items-end gap-3 h-36">
                      {top.map(([name, val], idx)=> (
                        <div key={name} title={`${name}: KES ${Math.round(val).toLocaleString()}`} className={`w-8 rounded ${idx%2? 'bg-red-300':'bg-blue-300'}`} style={{height: `${Math.max(8, (val/max)*100)}%`}} />
                      ))}
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Variance Table</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : err || !variance?.rows?.length ? (
                <div className="text-sm text-gray-600">No variance data.</div>
              ) : (
                <div className="overflow-auto">
                  <table className="min-w-[480px] w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="py-2 pr-4">Period</th>
                        <th className="py-2 pr-4">Category</th>
                        <th className="py-2 pr-4">Budget</th>
                        <th className="py-2 pr-4">Actual</th>
                        <th className="py-2 pr-4">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variance.rows.slice(0,3).map((row, i)=>{
                        const cats = Object.entries(row.categories).slice(0,5);
                        return cats.map(([name,vals], j)=> (
                          <tr key={`${row.period}_${name}`} className="border-b">
                            <td className="py-2 pr-4 whitespace-nowrap">{j===0? row.period : ''}</td>
                            <td className="py-2 pr-4">{name}</td>
                            <td className="py-2 pr-4 tabular-nums">KES {Math.round(vals.budget).toLocaleString()}</td>
                            <td className="py-2 pr-4 tabular-nums">KES {Math.round(vals.actual).toLocaleString()}</td>
                            <td className={`py-2 pr-4 tabular-nums ${vals.variance>=0?'text-emerald-700':'text-red-700'}`}>KES {Math.round(vals.variance).toLocaleString()}</td>
                          </tr>
                        ))
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Cash Runway</CardTitle></CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded"><div className="h-3 bg-green-400 rounded" style={{width:'68%'}} /></div>
              <div className="text-xs text-gray-600 mt-1">~6.2 months</div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </div>
  );
}
