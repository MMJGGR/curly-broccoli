import React from 'react';

const RecommendedAllocation = ({ allocation }) => {
  if (!allocation || typeof allocation !== 'object') return null;
  const entries = Object.entries(allocation).filter(([k, v]) => typeof v === 'number');
  if (entries.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended Allocation</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {entries.map(([asset, pct]) => (
          <div key={asset} className="border border-gray-100 rounded-lg p-3 flex items-center justify-between">
            <div className="text-gray-700 capitalize">{asset}</div>
            <div className="font-semibold text-blue-600">{Math.round(pct)}%</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-3">
        Based on your risk profile and financial planning data.
      </div>
    </div>
  );
};

export default RecommendedAllocation;

