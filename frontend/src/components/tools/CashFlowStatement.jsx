import React, { useMemo, useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const fmt = (n) => `KES ${Math.round(n || 0).toLocaleString()}`;

const CashFlowStatement = () => {
  const { selectSchedules } = useUnifiedFinancialContext();
  const [periodIndex, setPeriodIndex] = useState(0);

  const cfs = useMemo(() => {
    const flows = selectSchedules(periodIndex + 1);
    const month = flows.filter(f => f.t === periodIndex);
    const operating = month.reduce((s, f) => {
      if (f.type === 'income') return s + (f.amount || 0);
      if (f.type === 'expense' || f.type === 'goal_contribution') return s + (f.amount || 0); // negative
      return s;
    }, 0);
    const financing = month.reduce((s, f) => {
      if (f.type === 'principal') return s + (f.amount || 0); // negative
      return s;
    }, 0);
    // Investing flows placeholder (asset purchases/sales not modeled here)
    const investing = 0;
    const net = operating + financing + investing;
    return { operating, financing, investing, net };
  }, [selectSchedules, periodIndex]);

  return (
    <div className="p-6" data-testid="cash-flow-statement">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Cash Flow Statement — Month {periodIndex + 1}</CardTitle>
          <div className="flex items-center gap-2">
            <button className="text-xs bg-gray-100 px-2 py-1 rounded" onClick={() => setPeriodIndex(Math.max(0, periodIndex - 1))}>Prev</button>
            <button className="text-xs bg-gray-100 px-2 py-1 rounded" onClick={() => setPeriodIndex(periodIndex + 1)}>Next</button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-sm text-blue-700">Operating</div>
              <div className="text-2xl font-bold text-blue-900">{fmt(cfs.operating)}</div>
            </div>
            <div className="p-3 bg-indigo-50 rounded">
              <div className="text-sm text-indigo-700">Investing</div>
              <div className="text-2xl font-bold text-indigo-900">{fmt(cfs.investing)}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <div className="text-sm text-purple-700">Financing</div>
              <div className="text-2xl font-bold text-purple-900">{fmt(cfs.financing)}</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded">
              <div className="text-sm text-emerald-700">Net Cash Flow</div>
              <div className={`text-2xl font-bold ${cfs.net >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>{fmt(cfs.net)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowStatement;

