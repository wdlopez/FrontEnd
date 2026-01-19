import React from 'react';

export default function KpiCard({ title, value, delta, icon, className = '', accentColor }) {
  const wrapperStyle = accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined;
  const iconStyle = accentColor ? { color: accentColor } : undefined;

  return (
    <div style={wrapperStyle} className={`bg-white dark:bg-dark3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-300">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
        </div>
        {icon ? <div className={`ml-3 text-3xl ${accentColor ? '' : 'text-primary'}`} style={iconStyle}>{icon}</div> : null}
      </div>
      {typeof delta !== 'undefined' && (
        <div className={`mt-3 text-sm ${delta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {delta >= 0 ? '+' : ''}{delta}%
        </div>
      )}
    </div>
  );
}
