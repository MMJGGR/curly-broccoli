import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, EmptyState, Skeleton } from '../ui';

const JournalViewer = () => {
  const [entries, setEntries] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${base}/api/v1/ledger/journal`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setEntries(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [base, token]);

  React.useEffect(() => { load(); }, [load]);

  const seedCOA = async () => {
    try {
      await fetch(`${base}/api/v1/ledger/seed-coa`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      await load();
    } catch {}
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Journal Entries</CardTitle>
          <Button variant="outline" size="sm" onClick={load} aria-label="Refresh journal">Refresh</Button>
        </div>
      </CardHeader>
      <CardContent className="text-scale break-words">
        {loading && (
          <>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-20 w-full" />
          </>
        )}
        {!loading && error && (
          <EmptyState title="Unable to load journal" description="Try again in a moment." />
        )}
        {!loading && !error && entries && entries.length === 0 && (
          <EmptyState
            title="No journal entries"
            description="Seed a default chart of accounts and begin posting entries."
            actionLabel="Seed Accounts"
            onAction={seedCOA}
          />
        )}
        {!loading && !error && entries && entries.length > 0 && (
          <div className="overflow-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2">Timestamp</th>
                  <th>Description</th>
                  <th>Lines</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 50).map((e, idx) => (
                  <tr key={idx} className="border-b align-top">
                    <td className="py-2 whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="py-2 pr-4">{e.description || '-'}</td>
                    <td className="py-2">
                      <div className="space-y-1">
                        {(e.lines || []).map((l, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{l.account_type}</span>
                            <span className="tabular-nums">
                              {l.debit ? `Dr KES ${Math.round(l.debit).toLocaleString()}` : ''}
                              {l.credit ? ` Cr KES ${Math.round(l.credit).toLocaleString()}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalViewer;
