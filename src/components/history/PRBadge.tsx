import React from 'react';

interface PRBadgeProps {
  value: number;
  className?: string;
}

export function PRBadge({ value, className = '' }: PRBadgeProps) {
  if (value <= 0) return null;

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}
    >
      <span className="mr-1">PR:</span>
      {value}kg
    </div>
  );
} 