import React from 'react';

interface ProgressionNoteProps {
  notes?: string;
  className?: string;
}

export function ProgressionNote({ notes, className = '' }: ProgressionNoteProps) {
  if (!notes) return null;

  return (
    <div className={`text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded ${className}`}>
      <span className="font-medium">💡 </span>
      {notes}
    </div>
  );
} 