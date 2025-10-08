import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

// Lightweight CSV parser that handles quoted fields and commas
function parseCSV(text) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field.trim()); field = ''; i++; continue; }
    if (c === '\n' || c === '\r') {
      if (field.length > 0 || row.length > 0) { row.push(field.trim()); rows.push(row); }
      field = ''; row = [];
      // consume CRLF
      if (c === '\r' && text[i + 1] === '\n') i++;
      i++; continue;
    }
    field += c; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field.trim()); rows.push(row); }
  if (rows.length === 0) return [];
  const headers = rows[0].map(h => (h || '').toString().trim());
  return rows.slice(1).filter(r => r.length > 0 && r.some(v => (v || '').length > 0)).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
    return obj;
  });
}

const typeOptions = [
  { value: 'transactions', label: 'Transactions' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'income', label: 'Income' },
  { value: 'assets', label: 'Assets' },
  { value: 'liabilities', label: 'Liabilities' },
  { value: 'goals', label: 'Goals' },
  { value: 'budgetCategories', label: 'Budget Categories' },
  { value: 'profile', label: 'Profile' }
];

export default function SeedDataImportModal({ open, onClose, onImported }) {
  const { importSeedData } = useUnifiedFinancialContext();
  const [mode, setMode] = React.useState('json'); // 'json' | 'csv'
  const [csvType, setCsvType] = React.useState('transactions');
  const [textPreview, setTextPreview] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const fileRef = React.useRef(null);

  if (!open) return null;

  const handleFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    setTextPreview(text.slice(0, 2000));
    return text;
  };

  const onFileChange = async (e) => {
    setError('');
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    await handleFile(f);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setError('');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    await handleFile(f);
  };

  const parseAndImport = async () => {
    setBusy(true); setError('');
    try {
      const text = textPreview;
      if (!text || text.length === 0) { setError('No data provided'); setBusy(false); return; }

      if (mode === 'json') {
        let data;
        try { data = JSON.parse(text); } catch { setError('Invalid JSON'); setBusy(false); return; }
        // Accept array or object
        if (Array.isArray(data)) {
          // wrap based on guess: if each has amount and description → expenses/transactions
          const guessIsTx = data[0] && (('amount' in data[0]) || ('debit' in data[0]) || ('credit' in data[0]));
          const payload = guessIsTx ? { transactions: data } : { expenses: data };
          await importSeedData(payload);
        } else {
          await importSeedData(data);
        }
      } else {
        // CSV path
        const rows = parseCSV(text);
        if (rows.length === 0) { setError('No CSV rows found'); setBusy(false); return; }
        const payload = { [csvType]: rows };
        await importSeedData(payload);
      }
      if (onImported) onImported();
      onClose && onClose();
    } catch (e) {
      setError(e.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Import Seed Data</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close import modal">✕</button>
        </div>

        <div className="mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border ${mode==='json'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300'}`}
              onClick={()=>setMode('json')}
            >JSON</button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border -ml-px ${mode==='csv'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300'}`}
              onClick={()=>setMode('csv')}
            >CSV</button>
          </div>
        </div>

        {mode === 'csv' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">CSV Type</label>
            <select value={csvType} onChange={e=>setCsvType(e.target.value)} className="w-full border rounded-md px-3 py-2">
              {typeOptions.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
              onClick={()=>fileRef.current && fileRef.current.click()}
              onDragOver={(e)=>e.preventDefault()}
              onDrop={onDrop}
            >
              <p className="text-sm text-gray-700 mb-2">Click to select a file or drag & drop here</p>
              <p className="text-xs text-gray-500">JSON with keys (profile, income, expenses, assets, liabilities, goals, transactions, budgetCategories), or CSV for a single type</p>
              <input type="file" accept={mode==='json'?'.json,.txt':'.csv,.txt'} ref={fileRef} onChange={onFileChange} className="hidden" />
            </div>
            {textPreview && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                <textarea className="w-full border rounded-md p-2 font-mono text-xs h-40" value={textPreview} onChange={(e)=>setTextPreview(e.target.value)} />
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2" role="alert">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={parseAndImport} disabled={busy}>{busy ? 'Importing…' : 'Import'}</Button>
        </div>
      </div>
    </div>
  );
}

