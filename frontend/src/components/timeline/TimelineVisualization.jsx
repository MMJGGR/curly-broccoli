/**
 * Timeline Visualization - Main Timeline interface (70% screen)
 * Interactive Timeline with milestones, confidence bands, and persona-based styling
 */
import React, { useMemo, useState, useRef } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { saveScenario, loadScenario, listScenarios, deleteScenario } from '../../utils/scenarioStore';
import { pvOfIncomes, pvOfExpenses } from '../../utils/valuation';

const TimelineVisualization = () => {
  const {
    milestones = [],
    currentAge,
    personaTheme,
    confidenceBands,
    timelineSpan,
    loading,
    error
  } = useTimeline();

  const { selectSchedules, profile, expenses: ctxExpenses, applySuggestions, fetchAllFinancialData, planningStartDate } = useUnifiedFinancialContext();

  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [timelineScale, setTimelineScale] = useState(1);
  const timelineRef = useRef(null);

  // Calculate Timeline dimensions
  const startAge = timelineSpan?.start_age || currentAge || 25;
  const endAge = timelineSpan?.end_age || startAge + 40;
  const totalYears = endAge - startAge;
  const totalMonths = Math.max(12, Math.round(totalYears * 12));

  // Build a lightweight net cash flow series (monthly)
  const netSeries = useMemo(() => {
    try {
      const flows = selectSchedules(totalMonths);
      const sums = Array.from({ length: totalMonths }, () => ({ inc: 0, exp: 0, goal: 0 }));
      for (const f of flows) {
        const t = Math.min(totalMonths - 1, Math.max(0, f.t || 0));
        if (f.type === 'income') sums[t].inc += f.amount || 0;
        if (f.type === 'expense') sums[t].exp += f.amount || 0; // negative
        if (f.type === 'goal_contribution') sums[t].goal += f.amount || 0; // negative
      }
      return sums.map(s => (s.inc + s.exp + s.goal));
    } catch {
      return [];
    }
  }, [selectSchedules, totalMonths]);

  const netPath = useMemo(() => {
    if (!Array.isArray(netSeries) || netSeries.length === 0) return '';
    const h = 60; // px height for sparkline
    const w = Math.max(240, Math.min(1200, netSeries.length * 6));
    const minV = Math.min(0, ...netSeries);
    const maxV = Math.max(0, ...netSeries);
    const span = Math.max(1, maxV - minV);
    const xStep = w / (netSeries.length - 1);
    const yOf = v => h - ((v - minV) / span) * h;
    return netSeries.map((v, i) => `${i === 0 ? 'M' : 'L'} ${Math.round(i * xStep)},${Math.round(yOf(v))}`).join(' ');
  }, [netSeries]);

  // Month labels (every 6 months) based on planningStartDate
  const monthLabels = useMemo(() => {
    try {
      const labels = [];
      if (!planningStartDate) return labels;
      const base = new Date(planningStartDate);
      for (let i = 0; i < totalMonths; i += 6) {
        const d = new Date(base);
        d.setMonth(d.getMonth() + i);
        const lbl = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        labels.push({ i, label: lbl });
      }
      return labels;
    } catch { return []; }
  }, [planningStartDate, totalMonths]);

  // Build schedule-based overlay tracks (Income / Expenses / Goal Funding)
  const tracks = useMemo(() => {
    try {
      const flows = selectSchedules(totalMonths);
      const sums = Array.from({ length: totalMonths }, () => ({ inc: 0, exp: 0, goal: 0 }));
      for (const f of flows) {
        const t = Math.min(totalMonths - 1, Math.max(0, f.t || 0));
        if (f.type === 'income') sums[t].inc += f.amount || 0;
        if (f.type === 'expense') sums[t].exp += f.amount || 0; // negative
        if (f.type === 'goal_contribution') sums[t].goal += f.amount || 0; // negative
      }
      const toSegments = (arr, pred) => {
        const segs = [];
        let s = null;
        for (let i = 0; i < arr.length; i++) {
          if (pred(arr[i])) {
            if (s == null) s = i;
          } else if (s != null) {
            segs.push({ start: s, len: i - s });
            s = null;
          }
        }
        if (s != null) segs.push({ start: s, len: arr.length - s });
        return segs;
      };
      const incomeSegs = toSegments(sums, v => v.inc > 0.01);
      const expenseSegs = toSegments(sums, v => v.exp < -0.01);
      const goalSegs = toSegments(sums, v => v.goal < -0.01);
      return { incomeSegs, expenseSegs, goalSegs };
    } catch {
      return { incomeSegs: [], expenseSegs: [], goalSegs: [] };
    }
  }, [selectSchedules, totalMonths]);

  // Scenario controls
  const [scenarioName, setScenarioName] = useState('A');
  const [availableScenarios, setAvailableScenarios] = useState(listScenarios());
  const [scenarioTracks, setScenarioTracks] = useState(null);
  const [scenarioDiff, setScenarioDiff] = useState(null);

  const captureScenario = () => {
    const flows = selectSchedules(totalMonths);
    saveScenario(scenarioName, flows);
    setAvailableScenarios(listScenarios());
    alert(`Saved scenario ${scenarioName}`);
  };

  const getAssumptionRates = () => {
    try {
      const raw = localStorage.getItem('advanced_assumptions_autosave');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      const r = obj?.rates || obj; // try nested or root
      if (!r) return null;
      return {
        incomeDiscountRate: parseFloat(r.incomeDiscountRate) || 12.5,
        expenseDiscountRate: parseFloat(r.expenseDiscountRate) || 10.5,
        incomeGrowthRate: parseFloat(r.incomeGrowthRate) || 3.0,
        expenseInflationRate: parseFloat(r.expenseInflationRate) || 5.5,
        valuationMode: (obj.valuationMode || 'nominal')
      };
    } catch { return null; }
  };

  const loadScenarioTracks = (name) => {
    const s = loadScenario(name);
    if (!s) { setScenarioTracks(null); return; }
    const sums = Array.from({ length: totalMonths }, () => ({ inc: 0, exp: 0, goal: 0 }));
    (s.schedules || []).forEach(f => {
      const t = Math.min(totalMonths - 1, Math.max(0, f.t || 0));
      if (f.type === 'income') sums[t].inc += f.amount || 0;
      if (f.type === 'expense') sums[t].exp += f.amount || 0;
      if (f.type === 'goal_contribution') sums[t].goal += f.amount || 0;
    });
    const toSegments = (arr, pred) => {
      const segs = [];
      let sidx = null;
      for (let i = 0; i < arr.length; i++) {
        if (pred(arr[i])) { if (sidx == null) sidx = i; }
        else if (sidx != null) { segs.push({ start: sidx, len: i - sidx }); sidx = null; }
      }
      if (sidx != null) segs.push({ start: sidx, len: arr.length - sidx });
      return segs;
    };
    const incomeSegs = toSegments(sums, v => v.inc > 0.01);
    const expenseSegs = toSegments(sums, v => v.exp < -0.01);
    const goalSegs = toSegments(sums, v => v.goal < -0.01);
    setScenarioTracks({ incomeSegs, expenseSegs, goalSegs });

    // Diff Summary (Totals + PV delta)
    try {
      const rates = getAssumptionRates() || { incomeDiscountRate: 12.5, expenseDiscountRate: 10.5, incomeGrowthRate: 3.0, expenseInflationRate: 5.5, valuationMode: 'nominal' };
      // Current flows
      const currentFlows = selectSchedules(totalMonths);
      const curInc = currentFlows.filter(f => f.type === 'income').reduce((s, f) => s + (f.amount || 0), 0);
      const curExp = currentFlows.filter(f => f.type === 'expense' || f.type === 'goal_contribution').reduce((s, f) => s + (f.amount || 0), 0);
      const curNCF = curInc + curExp;
      // Scenario flows
      const scnInc = (s.schedules || []).filter(f => f.type === 'income').reduce((s0, f) => s0 + (f.amount || 0), 0);
      const scnExp = (s.schedules || []).filter(f => f.type === 'expense' || f.type === 'goal_contribution').reduce((s0, f) => s0 + (f.amount || 0), 0);
      const scnNCF = scnInc + scnExp;
      // PV deltas (nominal; default rates)
      const curIncPV = pvOfIncomes(currentFlows.filter(f => f.type === 'income').map(f => ({ t: f.t, amount: f.amount })), rates.incomeDiscountRate/100, 0.0, rates.valuationMode || 'nominal');
      const curExpPV = pvOfExpenses(currentFlows.filter(f => f.type === 'expense' || f.type === 'goal_contribution').map(f => ({ t: f.t, amount: f.amount })), rates.expenseDiscountRate/100, rates.expenseInflationRate/100, rates.valuationMode || 'nominal');
      const scnIncPV = pvOfIncomes((s.schedules || []).filter(f => f.type === 'income').map(f => ({ t: f.t, amount: f.amount })), rates.incomeDiscountRate/100, 0.0, rates.valuationMode || 'nominal');
      const scnExpPV = pvOfExpenses((s.schedules || []).filter(f => f.type === 'expense' || f.type === 'goal_contribution').map(f => ({ t: f.t, amount: f.amount })), rates.expenseDiscountRate/100, rates.expenseInflationRate/100, rates.valuationMode || 'nominal');
      setScenarioDiff({
        totals: {
          current: { income: curInc, expenses: curExp, net: curNCF },
          scenario: { income: scnInc, expenses: scnExp, net: scnNCF },
          delta: { income: scnInc - curInc, expenses: scnExp - curExp, net: scnNCF - curNCF }
        },
        pv: {
          current: { income: curIncPV, expenses: curExpPV, net: curIncPV - curExpPV },
          scenario: { income: scnIncPV, expenses: scnExpPV, net: scnIncPV - scnExpPV },
          delta: { income: scnIncPV - curIncPV, expenses: scnExpPV - curExpPV, net: (scnIncPV - curIncPV) - (scnExpPV - curExpPV) }
        }
      });
    } catch {
      setScenarioDiff(null);
    }
  };

  // Calculate position for age on Timeline
  const getPositionForAge = (age) => {
    return ((age - startAge) / totalYears) * 100;
  };

  // Handle milestone click
  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
  };

  // Handle Timeline zoom
  const handleZoom = (delta) => {
    const newScale = Math.max(0.5, Math.min(3, timelineScale + delta));
    setTimelineScale(newScale);
  };

  // Loading state - skeleton
  if (loading) {
    return (
      <div className="timeline-visualization h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-pulse h-12 w-12 mx-auto mb-4 bg-blue-100 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Timeline</h3>
          <p className="text-gray-600 text-sm">Preparing your financial journey visualization</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="timeline-visualization h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load Timeline</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="timeline-visualization h-full w-full relative overflow-x-auto overflow-y-hidden"
      ref={timelineRef}
      style={{ 
        background: `linear-gradient(135deg, ${personaTheme?.secondary || '#f8fafc'} 0%, #ffffff 100%)`,
      }}
    >
      {/* Timeline Header */}
      <div className="timeline-header p-6 border-b border-gray-200 bg-white bg-opacity-80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Your Financial Journey
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              {currentAge ? `Age ${currentAge} - ${endAge} • Interactive Timeline` : 'Interactive Timeline View'}
            </p>
            {/* Year/Age ticks */}
            <div className="mt-2 text-[11px] text-gray-500">
              <div className="flex justify-between">
                {Array.from({ length: Math.max(2, Math.floor(totalYears / 5) + 1) }, (_, i) => startAge + i * 5)
                  .filter(age => age <= endAge)
                  .map(age => (
                    <span key={age}>Age {age}</span>
                  ))}
              </div>
            </div>
          </div>
          
          {/* Timeline Controls */}
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex">
              <button
                onClick={() => handleZoom(-0.2)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors border-r border-gray-200"
              >
                🔍- Zoom Out
              </button>
              <button
                onClick={() => handleZoom(0.2)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-r-lg transition-colors"
              >
                🔍+ Zoom In
              </button>
            </div>
            <div className="text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
              Scale: {Math.round(timelineScale * 100)}%
            </div>

            {/* Scenario Controls */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-600">Scenario:</span>
              <input className="text-xs border rounded px-2 py-1 w-16" value={scenarioName} onChange={e => setScenarioName(e.target.value)} />
              <button className="text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded" onClick={captureScenario}>Save</button>
              <select className="text-xs border rounded px-2 py-1" onChange={e => loadScenarioTracks(e.target.value)} defaultValue="">
                <option value="">Load…</option>
                {availableScenarios.map(n => (<option key={n} value={n}>{n}</option>))}
              </select>
              <button className="text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded" onClick={() => { deleteScenario(scenarioName); setAvailableScenarios(listScenarios()); setScenarioTracks(null); }}>Delete</button>
            </div>
          </div>
        </div>
        {/* Net Cash Flow sparkline */}
        <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm max-w-full">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-medium text-gray-700">Net Cash Flow (monthly)</div>
            <div className="text-[11px] text-gray-500">Income − Expenses − Goal Contributions</div>
          </div>
          <div className="overflow-hidden">
            {netPath ? (
              <svg width="100%" viewBox={`0 0 ${Math.max(240, Math.min(1200, netSeries.length * 6))} 60`} preserveAspectRatio="none">
                <path d={netPath} fill="none" stroke="#16a34a" strokeWidth="2" />
              </svg>
            ) : (
              <div className="h-[60px] flex items-center justify-center text-gray-400 text-xs">No data</div>
            )}
          </div>
          {/* X-axis month labels */}
          {monthLabels.length > 0 && (
            <div className="mt-1 text-[10px] text-gray-500">
              <div className="flex justify-between">
                {monthLabels.map(m => (
                  <span key={m.i}>{m.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="timeline-container relative h-full p-6" style={{ minWidth: `${timelineScale * 100}%` }}>
        
        {/* Confidence Bands Background */}
        {confidenceBands && (
          <div className="confidence-bands absolute inset-0 pointer-events-none">
            {/* Optimistic band */}
            <div
              className="absolute h-12 rounded-lg opacity-20"
              style={{
                backgroundColor: personaTheme?.primary || '#2563eb',
                top: '40%',
                left: '0%',
                right: '0%'
              }}
            />
            {/* Realistic band */}
            <div
              className="absolute h-8 rounded-lg opacity-30"
              style={{
                backgroundColor: personaTheme?.primary || '#2563eb',
                top: '42%',
                left: '0%',
                right: '0%'
              }}
            />
            {/* Pessimistic band */}
            <div
              className="absolute h-4 rounded-lg opacity-40"
              style={{
                backgroundColor: personaTheme?.primary || '#2563eb',
                top: '44%',
                left: '0%',
                right: '0%'
              }}
            />
          </div>
        )}

        {/* Timeline Axis */}
        <div className="timeline-axis relative h-full">
          {/* Main Timeline Line */}
          <div
            className="absolute h-1 rounded-full"
            style={{
              backgroundColor: personaTheme?.primary || '#2563eb',
              top: '50%',
              left: '0%',
              right: '0%',
              transform: 'translateY(-50%)'
            }}
          />

          {/* Current Age Marker */}
          {currentAge && (
            <div
              className="absolute flex flex-col items-center"
              style={{
                left: `${getPositionForAge(currentAge)}%`,
                top: '40%',
                transform: 'translateX(-50%)'
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: personaTheme?.accent || '#1d4ed8' }}
              />
              <div className="mt-2 text-xs font-semibold text-gray-700">
                NOW
              </div>
              <div className="text-xs text-gray-500">
                Age {currentAge}
              </div>
            </div>
          )}

          {/* Milestone Markers */}
          {milestones.map((milestone, index) => {
            const position = getPositionForAge(milestone.age);
            const isFuture = milestone.age > currentAge;
            const isSelected = selectedMilestone?.id === milestone.id;

            return (
              <div
                key={milestone.id || index}
                className={`absolute flex flex-col items-center cursor-pointer transition-all duration-200 ${
                  isSelected ? 'scale-110 z-10' : 'hover:scale-105'
                }`}
                style={{
                  left: `${position}%`,
                  top: isFuture ? '20%' : '70%',
                  transform: 'translateX(-50%)'
                }}
                onClick={() => handleMilestoneClick(milestone)}
              >
                {/* Milestone Icon */}
                <div
                  className={`w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                    isFuture ? 'opacity-70' : 'opacity-100'
                  }`}
                  style={{
                    backgroundColor: getMilestoneColor(milestone.category, personaTheme)
                  }}
                >
                  {getMilestoneIcon(milestone.category)}
                </div>

                {/* Milestone Label */}
                <div className={`mt-2 text-center ${isSelected ? 'bg-white p-2 rounded-lg shadow-lg' : ''}`}>
                  <div className="text-xs font-semibold text-gray-800 max-w-20 truncate">
                    {milestone.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Age {milestone.age}
                  </div>
                  {milestone.target_amount && (
                    <div className="text-xs text-green-600 font-medium">
                      ${formatAmount(milestone.target_amount)}
                    </div>
                  )}
                  {milestone.progress !== undefined && (
                    <div className="text-xs text-gray-500">
                      {Math.round(milestone.progress)}% done
                    </div>
                  )}
                </div>

                {/* Connection Line to Timeline */}
                <div
                  className="absolute w-px bg-gray-300"
                  style={{
                    height: isFuture ? '120px' : '100px',
                    top: isFuture ? '32px' : '-100px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            );
          })}

          {/* Age Markers */}
          {Array.from({ length: Math.ceil(totalYears / 5) }, (_, i) => {
            const age = startAge + (i * 5);
            const position = getPositionForAge(age);

            return (
              <div
                key={age}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${position}%`,
                  top: '48%',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="w-px h-4 bg-gray-400" />
                <div className="text-xs text-gray-500 mt-1">
                  {age}
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule Tracks Overlay */}
        <div className="mt-16">
          <div className="mb-2 text-xs text-gray-600">Income</div>
          <div className="relative h-3 bg-gray-200 rounded-full">
            {tracks.incomeSegs.map((seg, idx) => (
              <div key={`inc-${idx}`} className="absolute h-3 bg-emerald-500 rounded-full" style={{ left: `${(seg.start/totalMonths)*100}%`, width: `${(seg.len/totalMonths)*100}%` }} />
            ))}
            {scenarioTracks?.incomeSegs?.map((seg, idx) => (
               <div key={`inc-s-${idx}`} className="absolute h-1 bg-emerald-800 rounded-full opacity-60" style={{ top: '1px', left: `${(seg.start/totalMonths)*100}%`, width: `${(seg.len/totalMonths)*100}%` }} />
            ))}
          </div>
          <div className="mt-4 mb-2 text-xs text-gray-600">Expenses (click to end rent at month)</div>
          <div className="relative h-3 bg-gray-200 rounded-full"
               onClick={async (e) => {
                 try {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const x = e.clientX - rect.left; // px within track
                   const ratio = Math.max(0, Math.min(1, x / rect.width));
                   const monthIndex = Math.floor(ratio * totalMonths);
                   // Find a rent-like expense
                   const rent = (ctxExpenses || []).find(ex => {
                     const et = (ex.expense_type || '').toLowerCase();
                     const d = (ex.description || '').toLowerCase();
                     return et === 'rent' || (et === 'housing' && d.includes('rent'));
                   });
                   if (!rent) { alert('No rent expense found.'); return; }
                   // Compute end date monthIndex months from now
                   const end = new Date(); end.setMonth(end.getMonth() + monthIndex);
                   const iso = end.toISOString().slice(0,10);
                   await applySuggestions([{ type: 'end_expense', id: rent.id, payment_end_date: iso, reason: `End at month ${monthIndex+1}` }]);
                   await fetchAllFinancialData();
                   alert(`Suggested to end rent on ${iso}`);
                 } catch {}
               }}>
            {tracks.expenseSegs.map((seg, idx) => (
              <div key={`exp-${idx}`} className="absolute h-3 bg-rose-500 rounded-full" style={{ left: `${(seg.start/totalMonths)*100}%`, width: `${(seg.len/totalMonths)*100}%` }} />
            ))}
            {scenarioTracks?.expenseSegs?.map((seg, idx) => (
               <div key={`exp-s-${idx}`} className="absolute h-1 bg-rose-800 rounded-full opacity-60" style={{ top: '1px', left: `${(seg.start/totalMonths)*100}%`, width: `${(seg.len/totalMonths)*100}%` }} />
            ))}
          </div>
          <div className="mt-4 mb-2 text-xs text-gray-600">Goal Funding (click to boost monthly contribution by KES 1,000)</div>
          <div className="relative h-3 bg-gray-200 rounded-full"
               onClick={async () => {
                 try {
                   // Propose adding goal contributions equally across active goals by +1000
                   const flows = selectSchedules(12);
                   const goalsActive = new Set(flows.filter(f => f.type === 'goal_contribution').map(f => f.name?.replace('Goal: ', '')).filter(Boolean));
                   if (goalsActive.size === 0) { alert('No active goal funding detected.'); return; }
                   const per = 1000;
                   const suggestions = Array.from(goalsActive).map(n => ({ type: 'set_goal_contribution', name: n, monthly_amount: per }));
                   await applySuggestions(suggestions);
                   await fetchAllFinancialData();
                   alert('Proposed boosting goal contributions by KES 1,000 per goal');
                 } catch {}
               }}>
            {tracks.goalSegs.map((seg, idx) => (
              <div key={`goal-${idx}`} className="absolute h-3 bg-indigo-500 rounded-full" style={{ left: `${(seg.start/totalMonths)*100}%`, width: `${(seg.len/totalMonths)*100}%` }} />
            ))}
            {scenarioTracks?.goalSegs?.map((seg, idx) => (
               <div key={`goal-s-${idx}`} className="absolute h-1 bg-indigo-800 rounded-full opacity-60" style={{ top: '1px', left: `${(seg.start/totalMonths)*100}%`, width: `${(seg.len/totalMonths)*100}%` }} />
            ))}
          </div>
        </div>

        {/* Scenario Diff Summary */}
        {scenarioDiff && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Scenario Diff Summary (Totals over horizon)</h3>
              <div className="text-xs text-gray-500">PV (nominal): inc 12%, exp 10.5% / infl 5.5%</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded">
                <div className="font-medium text-blue-800 mb-1">Income</div>
                <div className="text-gray-700">Current: KES {Math.round(scenarioDiff.totals.current.income).toLocaleString()}</div>
                <div className="text-gray-700">Scenario: KES {Math.round(scenarioDiff.totals.scenario.income).toLocaleString()}</div>
                <div className={`font-semibold ${scenarioDiff.totals.delta.income>=0? 'text-green-700':'text-red-700'}`}>Δ: KES {Math.round(scenarioDiff.totals.delta.income).toLocaleString()}</div>
                <div className="text-xs text-blue-700 mt-1">PV Δ: KES {Math.round(scenarioDiff.pv.delta.income).toLocaleString()}</div>
              </div>
              <div className="p-3 bg-rose-50 rounded">
                <div className="font-medium text-rose-800 mb-1">Expenses</div>
                <div className="text-gray-700">Current: KES {Math.round(Math.abs(scenarioDiff.totals.current.expenses)).toLocaleString()}</div>
                <div className="text-gray-700">Scenario: KES {Math.round(Math.abs(scenarioDiff.totals.scenario.expenses)).toLocaleString()}</div>
                <div className={`font-semibold ${scenarioDiff.totals.delta.expenses<=0? 'text-green-700':'text-red-700'}`}>Δ: KES {Math.round(scenarioDiff.totals.delta.expenses).toLocaleString()}</div>
                <div className="text-xs text-rose-700 mt-1">PV Δ: KES {Math.round(scenarioDiff.pv.delta.expenses).toLocaleString()}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded">
                <div className="font-medium text-emerald-800 mb-1">Net</div>
                <div className={`font-semibold ${scenarioDiff.totals.current.net>=0? 'text-emerald-700':'text-red-700'}`}>Current: KES {Math.round(scenarioDiff.totals.current.net).toLocaleString()}</div>
                <div className={`font-semibold ${scenarioDiff.totals.scenario.net>=0? 'text-emerald-700':'text-red-700'}`}>Scenario: KES {Math.round(scenarioDiff.totals.scenario.net).toLocaleString()}</div>
                <div className={`font-semibold ${scenarioDiff.totals.delta.net>=0? 'text-emerald-700':'text-red-700'}`}>Δ: KES {Math.round(scenarioDiff.totals.delta.net).toLocaleString()}</div>
                <div className="text-xs text-emerald-700 mt-1">PV Δ: KES {Math.round(scenarioDiff.pv.delta.net).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Milestone Detail Panel */}
        {selectedMilestone && (
          <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl p-6 border border-gray-200 z-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedMilestone.title}
              </h3>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Target Age:</span>
                <span className="text-sm font-medium">{selectedMilestone.age}</span>
              </div>
              
              {selectedMilestone.target_amount && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Target Amount:</span>
                  <span className="text-sm font-medium text-green-600">
                    ${formatAmount(selectedMilestone.target_amount)}
                  </span>
                </div>
              )}

              {selectedMilestone.progress !== undefined && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <span className="text-sm font-medium">{Math.round(selectedMilestone.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: personaTheme?.primary || '#2563eb',
                        width: `${selectedMilestone.progress}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedMilestone.timeline_impact && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">{selectedMilestone.timeline_impact}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getMilestoneColor = (category, theme) => {
  const colors = {
    emergency: '#ef4444',
    investment: theme?.primary || '#2563eb',
    education: '#8b5cf6',
    housing: '#f59e0b',
    retirement: '#059669',
    healthcare: '#ec4899',
    general: theme?.accent || '#6b7280'
  };
  return colors[category] || colors.general;
};

const getMilestoneIcon = () => '';

const formatAmount = (amount) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toLocaleString();
};

export default TimelineVisualization;
