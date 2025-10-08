const KEY = 'timeline_scenarios_v1';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function write(obj) { try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch {} }

export function saveScenario(name, schedules) {
  const store = read();
  store[name] = { savedAt: new Date().toISOString(), schedules };
  write(store);
  return true;
}

export function loadScenario(name) {
  const store = read();
  return store[name] || null;
}

export function listScenarios() { return Object.keys(read()); }

export function deleteScenario(name) {
  const store = read();
  delete store[name];
  write(store);
}

export default { saveScenario, loadScenario, listScenarios, deleteScenario };

