import React, { useCallback, useState } from 'react';
import { Input } from '.';
import { useDebounce } from '../../hooks/useDebounce';

export interface ExerciseSearchProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  className?: string;
}

export function ExerciseSearch({ 
  onSearch, 
  placeholder = 'Search exercises...',
  className = ''
}: ExerciseSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebounce((term: string) => {
    onSearch(term);
  }, 300);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  return (
    <div className={`w-full ${className}`}>
      <Input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
} 