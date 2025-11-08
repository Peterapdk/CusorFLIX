'use client';

import { useState, useMemo } from 'react';

interface YearSliderProps {
  year?: number;
  onYearChange: (year: number | undefined) => void;
}

const MIN_YEAR = 1970;

export default function YearSlider({
  year,
  onYearChange,
}: YearSliderProps) {
  const currentYear = new Date().getFullYear();
  
  // Use props directly with defaults
  const initialYear = useMemo(() => year ?? currentYear, [year, currentYear]);
  
  const [localYear, setLocalYear] = useState(initialYear);
  
  // Use prop value if provided, otherwise use local state
  const currentYearValue = year !== undefined ? year : localYear;

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setLocalYear(value);
    onYearChange(value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Release Year
        </label>
        <span className="text-sm text-muted-foreground">
          {currentYearValue}
        </span>
      </div>
      
      <div>
        <input
          type="range"
          min={MIN_YEAR}
          max={currentYear}
          value={currentYearValue}
          onChange={handleYearChange}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, hsl(var(--secondary)) 0%, hsl(var(--secondary)) ${((currentYearValue - MIN_YEAR) / (currentYear - MIN_YEAR)) * 100}%, hsl(var(--primary)) ${((currentYearValue - MIN_YEAR) / (currentYear - MIN_YEAR)) * 100}%, hsl(var(--primary)) 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground pt-1">
        <span>{MIN_YEAR}</span>
        <span>{currentYear}</span>
      </div>
    </div>
  );
}

