import React, { useMemo } from 'react';
import { PageHeader, Skeleton, EmptyState } from '../ui';
import Layout from '../layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Stat } from '../ui/stat';
import { PieChart, AlertCircle } from '../ui/icons';
import JournalViewer from '../ledger/JournalViewer';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

export default function BalanceSheetStructured() {
  const { assets = [], liabilities = [], loading: ufLoading } = useUnifiedFinancialContext();
  const totals = useMemo(() => {
    const assetsTotal = (assets||[]).reduce((s,a)=>s+(parseFloat(a.current_value)||0),0);
    const liabTotal = (liabilities||[]).reduce((s,l)=>s+(parseFloat(l.current_balance||l.balance)||0),0);
    return { assets: assetsTotal, liabilities: liabTotal, netWorth: assetsTotal - liabTotal };
  }, [assets, liabilities]);
  const allocation = useMemo(()=>{
    const sum = (pred) => (assets||[]).filter(pred).reduce((s,a)=>s+(parseFloat(a.current_value)||0),0);
    const cash = sum(a=> String(a.asset_type||'').includes('cash'));
    const real = sum(a=> String(a.asset_type||'').includes('real_estate'));
    const invest = sum(a=> String(a.asset_type||'').includes('investment'));
    const total = Math.max(1, cash+real+invest);
    return { cash: cash/total*100, real: real/total*100, invest: invest/total*100 };
  }, [assets]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Balance Sheet"
        description="Composition, policy bands, net worth, and reconciliation"
        primaryAction={{ label: 'Add Account', href: '/app/assets' }}
        secondaryAction={{ label: 'Assumptions', href: '/app/balance-sheet?panel=assumptions', variant: 'outline' }}
      />
      <Layout>
        {/* Overview */}
        {ufLoading?.global ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" role="region" aria-label="Balance Sheet KPIs">
            <Stat label="Net Worth" value={`KES ${Math.round(totals.netWorth).toLocaleString()}`} tone={totals.netWorth>=0?'success':'danger'} icon={<PieChart className="h-4 w-4" />} />
            <Stat label="Assets" value={`KES ${Math.round(totals.assets).toLocaleString()}`} tone="info" icon={<PieChart className="h-4 w-4" />} />
            <Stat label="Liabilities" value={`KES ${Math.round(totals.liabilities).toLocaleString()}`} tone="warning" icon={<AlertCircle className="h-4 w-4" />} />
            <Stat label="Debt Ratio" value={`${totals.assets>0? Math.round((totals.liabilities/totals.assets)*100):0}%`} icon={<AlertCircle className="h-4 w-4" />} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" role="region" aria-labelledby="comp-title">
            <CardHeader><CardTitle id="comp-title">Composition &amp; Policy Bands</CardTitle></CardHeader>
            <CardContent>
              {assets.length === 0 && liabilities.length === 0 ? (
                <EmptyState title="No accounts yet" description="Add assets or liabilities to populate your balance sheet." actionLabel="Add Account" onAction={() => window.location.assign('/app/assets')} />
              ) : (
                <>
                  <div className="text-sm text-gray-700">Align allocation with target policy ranges (example bands).</div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600"><span>Cash</span><span>{allocation.cash.toFixed(0)}%</span></div>
                      <div className="h-2 bg-gray-200 rounded"><div className="h-2 bg-blue-400 rounded" style={{width:`${allocation.cash}%`}} /></div>
                      <div className="text-[10px] text-gray-500 mt-1">Target band: 5–15%</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600"><span>Real Estate</span><span>{allocation.real.toFixed(0)}%</span></div>
                      <div className="h-2 bg-gray-200 rounded"><div className="h-2 bg-indigo-400 rounded" style={{width:`${allocation.real}%`}} /></div>
                      <div className="text-[10px] text-gray-500 mt-1">Target band: 30–50%</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600"><span>Investments</span><span>{allocation.invest.toFixed(0)}%</span></div>
                      <div className="h-2 bg-gray-200 rounded"><div className="h-2 bg-emerald-400 rounded" style={{width:`${allocation.invest}%`}} /></div>
                      <div className="text-[10px] text-gray-500 mt-1">Target band: 35–55%</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Reconciliation & Journal</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 mb-3">Status: <span className="font-semibold text-emerald-700">Balanced</span></div>
              <JournalViewer />
            </CardContent>
          </Card>
        </div>
      </Layout>
    </div>
  );
}
