import React from 'react';

const StatCard = ({ label, value, delta, positive = true }) => (
  <div className="p-4 bg-white rounded-xl shadow">
    <div className="text-sm text-gray-600">{label}</div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {typeof delta !== 'undefined' && (
      <div className={`text-xs mt-1 ${positive ? 'text-green-700' : 'text-red-700'}`}>{delta}</div>
    )}
  </div>
);

export default StatCard;

