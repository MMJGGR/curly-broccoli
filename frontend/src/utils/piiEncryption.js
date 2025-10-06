// Simple feature-flagged PII "encryption" stub for demo purposes.
// Replace with a proper crypto implementation in production.

export const PII_ENCRYPTION_ENABLED = (process.env.REACT_APP_PII_ENCRYPTION || '').toLowerCase() === 'true';

function b64(str) { try { return btoa(unescape(encodeURIComponent(str))); } catch { return str; } }

export function encryptPIIFields(updates) {
  if (!PII_ENCRYPTION_ENABLED || !updates || typeof updates !== 'object') return updates;
  const out = { ...updates };
  const piiKeys = ['nationalId', 'national_id', 'id_number', 'phone', 'phone_number'];
  for (const k of piiKeys) {
    if (out[k]) out[k] = `enc::${b64(String(out[k]))}`;
  }
  return out;
}

export default { PII_ENCRYPTION_ENABLED, encryptPIIFields };

