import React, { useState, useMemo } from 'react';
import { saveScenario, loadScenario, listScenarios, deleteScenario } from '../../utils/scenarioStore';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ScenarioControls = ({ className = '', onLoadDiff = null, horizonMonths = 24 }) => {
  const { selectSchedules } = useUnifiedFinancialContext();
  const [name, setName] = useState('A');
  const scenarios = useMemo(() => listScenarios(), []);
  const [active, setActive] = useState(null);

  const capture = () => {
    try {
      const flows = selectSchedules ? selectSchedules(horizonMonths) : [];
      saveScenario(name, flows);
      alert(`Saved scenario ${name}`);
    } catch {}
  };

  const load = () => {
    const s = loadScenario(name);
    setActive(s);
    if (onLoadDiff && s) onLoadDiff(s);
  };

  const remove = () => {
    deleteScenario(name);
    setActive(null);
    alert(`Deleted scenario ${name}`);
  };

  return (
    <div className={`bg-white border rounded p-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">Scenario Controls</div>
      <div className="flex items-center gap-2">
        <select value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1 text-sm">
          {[...new Set(['A','B',...scenarios])].map(n => (<option key={n} value={n}>{n}</option>))}
        </select>
        <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded" onClick={capture}>Save</button>
        <button className="text-sm bg-gray-100 px-3 py-1 rounded" onClick={load}>Load</button>
        <button className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded" onClick={remove}>Delete</button>
      </div>
      {active && (
        <div className="mt-2 text-xs text-gray-500">Loaded {name} • {new Date(active.savedAt).toLocaleString()}</div>
      )}
    </div>
  );
};

export default ScenarioControls;

