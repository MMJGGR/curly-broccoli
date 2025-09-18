import React, { useEffect, useState, useMemo } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ProfileHealth = () => {
  const { profile } = useUnifiedFinancialContext();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchState = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        const res = await fetch(`${base}/api/v1/onboarding-v2-clean/state`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch onboarding state');
        const data = await res.json();
        setOnboarding(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchState();
  }, []);

  const { scorePct, missing } = useMemo(() => {
    const missingFields = [];
    const p = profile || {};
    // Core fields
    if (!p.first_name) missingFields.push('First name');
    if (!p.last_name) missingFields.push('Last name');
    if (!p.date_of_birth) missingFields.push('Date of birth');
    if (!(p.monthly_income || p.annual_income)) missingFields.push('Income');
    // Risk
    if (!Array.isArray(p.questionnaire) || p.questionnaire.length === 0) missingFields.push('Risk questionnaire');
    // Onboarding completion adds weight
    const completed = Array.isArray(onboarding?.completed_steps) ? onboarding.completed_steps.length : 0;
    const baseFields = 5; // first, last, dob, income, questionnaire
    const totalPossible = baseFields + 1; // + onboarding complete signal
    let achieved = baseFields - missingFields.length;
    if (onboarding?.is_complete) achieved += 1;
    const pct = Math.max(0, Math.min(100, Math.round((achieved / totalPossible) * 100)));
    return { scorePct: pct, missing: missingFields };
  }, [profile, onboarding]);

  if (loading) return null;
  if (error) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Health</h2>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-200">
          <span className="text-xl font-bold text-blue-700">{scorePct}%</span>
        </div>
        <div className="flex-1">
          {missing.length === 0 ? (
            <p className="text-gray-700">Your profile looks complete.</p>
          ) : (
            <div>
              <p className="text-gray-700 mb-1">Missing fields:</p>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHealth;

