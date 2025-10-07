import React, { useMemo } from 'react';
import IncomeManagement from '../tools/IncomeManagement';
import ExpenseManagement from '../tools/ExpenseManagement';
import IncomeStatement from '../tools/IncomeStatement';
import CashFlowStatement from '../tools/CashFlowStatement';
import TrialBalanceAudit from '../tools/TrialBalanceAudit';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { Button } from '../ui/button';
import { PageHeader } from '../ui';
import Layout from '../layout/Layout';
import ScenarioControls from '../analytics/ScenarioControls';
import { loadScenario } from '../../utils/scenarioStore';

const CashFlowDashboard = () => {
  const { selectTrialBalance, selectNetCashFlow, selectSchedules } = useUnifiedFinancialContext();

  const tb = useMemo(() => {
    try { return selectTrialBalance ? selectTrialBalance(0) : null; } catch { return null; }
  }, [selectTrialBalance]);

  const netCF = useMemo(() => {
    try { return selectNetCashFlow ? selectNetCashFlow() : 0; } catch { return 0; }
  }, [selectNetCashFlow]);

  const showAudit = (tb?.suggestions && tb.suggestions.length > 0) || (netCF < 0);
  const [scenario, setScenario] = React.useState(null);
  const [scenarioDiff, setScenarioDiff] = React.useState(null);

  const onScenarioLoad = (s) => {
    setScenario(s);
    try {
      const months = 12;
      const current = selectSchedules ? selectSchedules(months) : [];
      const scn = (s?.schedules || []);
      const sum = (flows, type) => flows.filter(f => type==='net' ? ['income','expense','goal_contribution'].includes(f.type) : f.type===type)
        .reduce((acc, f) => acc + (parseFloat(f.amount)||0), 0);
      const cur = { income: sum(current,'income'), expenses: sum(current,'expense') + sum(current,'goal_contribution'), net: sum(current,'net') };
      const oth = { income: sum(scn,'income'), expenses: sum(scn,'expense') + sum(scn,'goal_contribution'), net: sum(scn,'net') };
      setScenarioDiff({ current: cur, scenario: oth, delta: { income: oth.income - cur.income, expenses: oth.expenses - cur.expenses, net: oth.net - cur.net } });
    } catch { setScenarioDiff(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Cash Flow"
        description="Income & expenses, statements, and audits"
        secondaryAction={{ label: 'Calculators', href: '/app/tools?section=calculators', variant: 'outline' }}
      />

      {showAudit && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-6 py-3 text-sm text-amber-900 flex items-center justify-between">
            <div>
              {netCF < 0 ? (
                <span>Budget deficit detected. Review expenses or increase income.</span>
              ) : (
                <span>Trial Balance has suggestions to reconcile your flows.</span>
              )}
            </div>
            <a href="#advanced-audit" className="text-amber-900 underline">Open Audit</a>
          </div>
        </div>
      )}

      <Layout className="p-6 space-y-6 text-scale break-words">
        {/* CRUD panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-4"><IncomeManagement /></div>
          <div className="bg-white rounded-xl shadow p-4"><ExpenseManagement /></div>
        </div>

        {/* Statements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-4"><IncomeStatement months={12} /></div>
          <div className="bg-white rounded-xl shadow p-4"><CashFlowStatement /></div>
        </div>

        {/* Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScenarioControls onLoadDiff={onScenarioLoad} />
          {scenarioDiff && (
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Scenario Diff (12 mo)</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Income Δ</div>
                  <div className={`font-semibold ${scenarioDiff.delta.income>=0?'text-green-700':'text-red-700'}`}>KES {Math.round(scenarioDiff.delta.income).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Expenses Δ</div>
                  <div className={`font-semibold ${scenarioDiff.delta.expenses<=0?'text-green-700':'text-red-700'}`}>KES {Math.round(scenarioDiff.delta.expenses).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Net Δ</div>
                  <div className={`font-semibold ${scenarioDiff.delta.net>=0?'text-emerald-700':'text-red-700'}`}>KES {Math.round(scenarioDiff.delta.net).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced */}
        <div id="advanced-audit" className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Trial Balance Audit</h2>
          <TrialBalanceAudit />
        </div>
      </Layout>
    </div>
  );
};

export default CashFlowDashboard;
