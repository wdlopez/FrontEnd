import React from 'react';

export default function Skeleton({ className = 'h-6 w-full rounded', lines = 3 }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-full" />
      ))}
    </div>
  );
}
