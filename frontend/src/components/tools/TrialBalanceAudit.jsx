import React, { useEffect, useMemo, useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { getAuditEntries, clearAuditEntries, fetchAuditFromServer } from '../../utils/tbAuditLog';

const fmt = (n) => `KES ${Math.round(n || 0).toLocaleString()}`;

const TrialBalanceAudit = () => {
  const { selectTrialBalance, applySuggestions, fetchAllFinancialData } = useUnifiedFinancialContext();
  const [periodIndex, setPeriodIndex] = useState(0);
  const [filters, setFilters] = useState({ maintenance: true, loans: true, goals: true, rent: true });
  const [audit, setAudit] = useState([]);
  const tbRaw = useMemo(() => selectTrialBalance(periodIndex), [selectTrialBalance, periodIndex]);
  const tb = useMemo(() => {
    if (!tbRaw?.suggestions) return tbRaw;
    const filtered = tbRaw.suggestions.filter(s => {
      if (s.type === 'end_expense') return filters.rent;
      if (s.type === 'set_goal_contribution') return filters.goals;
      if (s.type?.includes('expense_loan') || s.type === 'update_expense_amount') return filters.loans;
      if (s.type?.includes('maintenance') || s.type?.includes('insurance') || s.type?.includes('property_tax')) return filters.maintenance;
      return true;
    });
    return { ...tbRaw, suggestions: filtered };
  }, [tbRaw, filters]);

  useEffect(() => {
    (async () => {
      const server = await fetchAuditFromServer();
      if (server && server.length > 0) setAudit(server);
      else setAudit(getAuditEntries());
    })();
  }, []);

  const applyAll = async () => {
    if (!tb?.suggestions || tb.suggestions.length === 0) return;
    await applySuggestions(tb.suggestions);
    await fetchAllFinancialData();
    alert('Suggestions applied');
    setAudit(getAuditEntries());
  };

  return (
    <div className="p-6 space-y-6" data-testid="trial-balance-audit">
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance — Period {periodIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="outline" onClick={() => setPeriodIndex(Math.max(0, periodIndex - 1))}>Prev</Button>
            <div className="text-sm text-gray-600">Month: {periodIndex + 1}</div>
            <Button variant="outline" onClick={() => setPeriodIndex(periodIndex + 1)}>Next</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded border">
              <div className="text-sm text-blue-700">Income</div>
              <div className="text-2xl font-bold text-blue-900">{fmt(tb?.totals?.income || 0)}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded border">
              <div className="text-sm text-purple-700">Expenses</div>
              <div className="text-2xl font-bold text-purple-900">{fmt(Math.abs(tb?.totals?.expenses || 0))}</div>
            </div>
            <div className="p-3 bg-green-50 rounded border">
              <div className="text-sm text-green-700">Net Cash Flow</div>
              <div className={`text-2xl font-bold ${ (tb?.totals?.netCashFlow || 0) >= 0 ? 'text-green-900' : 'text-red-900'}`}>{fmt(tb?.totals?.netCashFlow || 0)}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-emerald-50 rounded border">
              <div className="text-sm text-emerald-700">Assets</div>
              <div className="text-2xl font-bold text-emerald-900">{fmt(tb?.totals?.assets || 0)}</div>
            </div>
            <div className="p-3 bg-rose-50 rounded border">
              <div className="text-sm text-rose-700">Liabilities</div>
              <div className="text-2xl font-bold text-rose-900">{fmt(tb?.totals?.liabilities || 0)}</div>
            </div>
            <div className="p-3 bg-indigo-50 rounded border">
              <div className="text-sm text-indigo-700">Net Worth</div>
              <div className={`text-2xl font-bold ${ (tb?.totals?.netWorth || 0) >= 0 ? 'text-indigo-900' : 'text-red-900'}`}>{fmt(tb?.totals?.netWorth || 0)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Proposed Suggestions</CardTitle>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 flex items-center gap-1"><input type="checkbox" checked={filters.rent} onChange={e => setFilters({...filters, rent: e.target.checked})} /> Rent</label>
            <label className="text-xs text-gray-600 flex items-center gap-1"><input type="checkbox" checked={filters.goals} onChange={e => setFilters({...filters, goals: e.target.checked})} /> Goals</label>
            <label className="text-xs text-gray-600 flex items-center gap-1"><input type="checkbox" checked={filters.loans} onChange={e => setFilters({...filters, loans: e.target.checked})} /> Loans</label>
            <label className="text-xs text-gray-600 flex items-center gap-1"><input type="checkbox" checked={filters.maintenance} onChange={e => setFilters({...filters, maintenance: e.target.checked})} /> Maint/Ins/Tax</label>
            <Button onClick={applyAll} disabled={!tb?.suggestions || tb.suggestions.length === 0}>Apply All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {(!tb?.suggestions || tb.suggestions.length === 0) ? (
            <div className="text-gray-500">No suggestions for this period.</div>
          ) : (
            <div className="space-y-2">
              {tb.suggestions.map((s, idx) => (
                <div key={idx} className="border rounded p-3 bg-gray-50 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.type}</div>
                    <div className="text-sm text-gray-600">{s.reason || s.name || ''}</div>
                  </div>
                  <div className="text-sm text-gray-800">
                    {s.monthly_amount ? fmt(s.monthly_amount) : (s.amount ? fmt(s.amount) : '')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Audit Log</CardTitle>
          <Button variant="outline" onClick={() => { clearAuditEntries(); setAudit([]); }}>Clear</Button>
        </CardHeader>
        <CardContent>
          {audit.length === 0 ? (
            <div className="text-gray-500">No audit entries yet.</div>
          ) : (
            <div className="space-y-2 text-sm">
              {audit.slice().reverse().map((e, i) => (
                <div key={i} className="border rounded p-3 bg-white">
                  <div className="text-gray-700 font-medium">{new Date(e.timestamp).toLocaleString()}</div>
                  <ul className="list-disc list-inside text-gray-600">
                    {(e.suggestions || []).map((s, j) => (
                      <li key={j}>{s.type} {s.name ? `— ${s.name}` : ''} {s.amount ? `(${fmt(s.amount)})` : ''}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialBalanceAudit;
