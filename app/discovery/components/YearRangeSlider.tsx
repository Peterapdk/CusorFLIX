'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize with defaults
  const initialMin = useMemo(() => minYear ?? MIN_YEAR, [minYear]);
  const initialMax = useMemo(() => maxYear ?? currentYear, [maxYear, currentYear]);
  
  const [localMin, setLocalMin] = useState(initialMin);
  const [localMax, setLocalMax] = useState(initialMax);
  const [activeHandle, setActiveHandle] = useState<'min' | 'max' | null>(null);
  
  // Use prop values if provided, otherwise use local state
  const currentMin = minYear !== undefined ? minYear : localMin;
  const currentMax = maxYear !== undefined ? maxYear : localMax;

  // Ensure min <= max
  const safeMin = Math.min(currentMin, currentMax);
  const safeMax = Math.max(currentMin, currentMax);

  // Calculate percentage positions
  const range = currentYear - MIN_YEAR;
  const minPercent = ((safeMin - MIN_YEAR) / range) * 100;
  const maxPercent = ((safeMax - MIN_YEAR) / range) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(parseInt(e.target.value, 10), safeMax);
    setLocalMin(value);
    setActiveHandle('min');
    onYearRangeChange(value, safeMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(parseInt(e.target.value, 10), safeMin);
    setLocalMax(value);
    setActiveHandle('max');
    onYearRangeChange(safeMin, value);
  };

  const handleMouseUp = () => {
    setActiveHandle(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Release Year
        </label>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{safeMin}</span>
          <span className="text-muted-foreground">—</span>
          <span className="font-medium text-foreground">{safeMax}</span>
        </div>
      </div>
      
      {/* Dual Range Slider Container */}
      <div ref={containerRef} className="relative h-2 w-full">
        {/* Background Track */}
        <div className="absolute top-0 left-0 w-full h-2 rounded-full bg-secondary" />
        
        {/* Connected Range (between min and max) */}
        <div
          className="absolute top-0 h-2 bg-primary rounded-full z-10"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min Handle Input (overlapping) */}
        <input
          type="range"
          min={MIN_YEAR}
          max={currentYear}
          value={safeMin}
          onChange={handleMinChange}
          onMouseDown={() => setActiveHandle('min')}
          onTouchStart={() => setActiveHandle('min')}
          className="absolute top-1/2 left-0 w-full h-0 appearance-none cursor-pointer bg-transparent z-20 pointer-events-auto"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            transform: 'translateY(-50%)',
          }}
        />
        
        {/* Max Handle Input (overlapping) */}
        <input
          type="range"
          min={MIN_YEAR}
          max={currentYear}
          value={safeMax}
          onChange={handleMaxChange}
          onMouseDown={() => setActiveHandle('max')}
          onTouchStart={() => setActiveHandle('max')}
          className="absolute top-1/2 left-0 w-full h-0 appearance-none cursor-pointer bg-transparent z-20 pointer-events-auto"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            transform: 'translateY(-50%)',
          }}
        />

        {/* Min Handle Visual with Tooltip */}
        <div
          className="absolute top-1/2 z-30 group"
          style={{
            left: `calc(${minPercent}% - 9px)`,
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
          }}
        >
          <div
            className={`w-4.5 h-4.5 bg-white border-4 border-primary rounded-full cursor-pointer shadow-lg transition-transform ${
              activeHandle === 'min' ? 'scale-110' : ''
            }`}
          />
          {/* Min Tooltip - Show when dragging or hovering */}
          <div 
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white border border-border text-sm text-foreground py-1 px-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 ${
              activeHandle === 'min' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {safeMin}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
          </div>
        </div>

        {/* Max Handle Visual with Tooltip */}
        <div
          className="absolute top-1/2 z-30 group"
          style={{
            left: `calc(${maxPercent}% - 9px)`,
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
          }}
        >
          <div
            className={`w-4.5 h-4.5 bg-white border-4 border-primary rounded-full cursor-pointer shadow-lg transition-transform ${
              activeHandle === 'max' ? 'scale-110' : ''
            }`}
          />
          {/* Max Tooltip - Show when dragging or hovering */}
          <div 
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white border border-border text-sm text-foreground py-1 px-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 ${
              activeHandle === 'max' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {safeMax}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
          </div>
        </div>
      </div>

      {/* Year Labels */}
      <div className="flex justify-between text-xs text-muted-foreground pt-1">
        <span>{MIN_YEAR}</span>
        <span>{currentYear}</span>
      </div>
    </div>
  );
}
