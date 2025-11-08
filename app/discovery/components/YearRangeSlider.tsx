'use client';

import { useState, useMemo } from 'react';

interface YearRangeSliderProps {
  minYear?: number;
  maxYear?: number;
  onYearRangeChange: (min: number, max: number) => void;
}

const MIN_YEAR = 1970;

export default function YearRangeSlider({
  minYear,
  maxYear,
  onYearRangeChange,
}: YearRangeSliderProps) {
  const currentYear = new Date().getFullYear();
  
  // Use props directly with defaults, derive initial state from props
  const initialMin = useMemo(() => minYear ?? MIN_YEAR, [minYear]);
  const initialMax = useMemo(() => maxYear ?? currentYear, [maxYear, currentYear]);
  
  const [localMin, setLocalMin] = useState(initialMin);
  const [localMax, setLocalMax] = useState(initialMax);
  
  // Update local state only when props change meaningfully (controlled component pattern)
  const currentMin = minYear !== undefined ? minYear : localMin;
  const currentMax = maxYear !== undefined ? maxYear : localMax;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(parseInt(e.target.value, 10), currentMax);
    setLocalMin(value);
    onYearRangeChange(value, currentMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(parseInt(e.target.value, 10), currentMin);
    setLocalMax(value);
    onYearRangeChange(currentMin, value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Release Year
        </label>
        <span className="text-sm text-muted-foreground">
          {currentMin} - {currentMax}
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Min Year Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">From</span>
            <span className="text-xs font-medium text-foreground">{currentMin}</span>
          </div>
          <input
            type="range"
            min={MIN_YEAR}
            max={currentYear}
            value={currentMin}
            onChange={handleMinChange}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((currentMin - MIN_YEAR) / (currentYear - MIN_YEAR)) * 100}%, hsl(var(--secondary)) ${((currentMin - MIN_YEAR) / (currentYear - MIN_YEAR)) * 100}%, hsl(var(--secondary)) 100%)`,
            }}
          />
        </div>

        {/* Max Year Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">To</span>
            <span className="text-xs font-medium text-foreground">{currentMax}</span>
          </div>
          <input
            type="range"
            min={MIN_YEAR}
            max={currentYear}
            value={currentMax}
            onChange={handleMaxChange}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, hsl(var(--secondary)) 0%, hsl(var(--secondary)) ${((currentMax - MIN_YEAR) / (currentYear - MIN_YEAR)) * 100}%, hsl(var(--primary)) ${((currentMax - MIN_YEAR) / (currentYear - MIN_YEAR)) * 100}%, hsl(var(--primary)) 100%)`,
            }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground pt-1">
        <span>{MIN_YEAR}</span>
        <span>{currentYear}</span>
      </div>
    </div>
  );
}

