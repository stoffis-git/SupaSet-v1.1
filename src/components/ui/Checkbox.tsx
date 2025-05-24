import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  className = '',
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`
        w-5 h-5 rounded border-2 flex items-center justify-center
        transition-colors duration-200
        ${checked 
          ? 'bg-indigo-500 border-indigo-500 hover:bg-indigo-600 hover:border-indigo-600' 
          : 'bg-dark-800 border-dark-600 hover:border-indigo-500'
        }
        ${className}
      `}
    >
      {checked && <Check size={14} className="text-white" />}
    </button>
  );
}; 