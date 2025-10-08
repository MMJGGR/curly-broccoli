import React from 'react';

// Simple statistic tile for summary values
export const Stat = ({
  label,
  value,
  icon = null,
  tone = 'default', // 'default' | 'success' | 'danger' | 'warning' | 'info'
}) => {
  const tones = {
    default: { ring: 'bg-gray-100', text: 'text-gray-900', accent: 'text-gray-600' },
    success: { ring: 'bg-green-100', text: 'text-green-700', accent: 'text-green-600' },
    danger: { ring: 'bg-red-100', text: 'text-red-700', accent: 'text-red-600' },
    warning: { ring: 'bg-yellow-100', text: 'text-yellow-700', accent: 'text-yellow-600' },
    info: { ring: 'bg-blue-100', text: 'text-blue-700', accent: 'text-blue-600' }
  };
  const t = tones[tone] || tones.default;

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${t.ring} rounded-full flex items-center justify-center`}>
              <span className={`${t.accent} text-lg`}>{icon || '•'}</span>
            </div>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
              <dd className={`text-lg font-semibold ${t.text}`}>{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

