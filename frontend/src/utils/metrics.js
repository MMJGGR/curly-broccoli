export function markStart(name) {
  try { performance.mark(`${name}-start`); } catch {}
}

export function markEnd(name) {
  try { performance.mark(`${name}-end`); performance.measure(name, `${name}-start`, `${name}-end`); } catch {}
}

export function getMeasure(name) {
  try { const m = performance.getEntriesByName(name).slice(-1)[0]; return m ? m.duration : null; } catch { return null; }
}

export function report(name, extra = {}) {
  const duration = getMeasure(name);
  const payload = { name, duration, ts: new Date().toISOString(), ...extra };
  try { if (window.__metricsCollector) window.__metricsCollector(payload); } catch {}
  // Best-effort POST to backend metrics ingest (ignore failures)
  try {
    const token = localStorage.getItem('jwt');
    fetch((process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000') + '/api/v1/metrics/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: JSON.stringify({ name, duration, extra })
    }).catch(()=>{});
  } catch {}
  return payload;
}

export default { markStart, markEnd, getMeasure, report };
