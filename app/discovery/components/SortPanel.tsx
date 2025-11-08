'use client';

import { useState } from 'react';
import type { SortOption, SortDirection } from '@/types/library';

interface SortPanelProps {
  sortOption: SortOption;
  sortDirection: SortDirection;
  onSortChange: (option: SortOption, direction: SortDirection) => void;
}

// Sort options available for discovery (exclude 'date-added' which is library-only)
const DISCOVERY_SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'release-date', label: 'Release Date' },
  { value: 'title', label: 'Title' },
];

export default function SortPanel({
  sortOption,
  sortDirection,
  onSortChange,
}: SortPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSortClick = (option: SortOption) => {
    // Toggle direction if same option, otherwise set to default direction
    const newDirection = option === sortOption && sortDirection === 'desc' 
      ? 'asc' 
      : 'desc';
    onSortChange(option, newDirection);
    setIsOpen(false); // Close dropdown on mobile after selection
  };

  const selectedOption = DISCOVERY_SORT_OPTIONS.find(opt => opt.value === sortOption);

  return (
    <>
      {/* Mobile Sort Dropdown */}
      <div className="lg:hidden mb-4 relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Sort:</span>
            <span className="text-sm text-muted-foreground">{selectedOption?.label || 'Popularity'}</span>
            {sortDirection === 'asc' && (
              <svg
                className="w-4 h-4 text-muted-foreground rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-40 w-full mt-2 bg-card border border-border rounded-lg shadow-lg">
              <div className="p-2 space-y-1">
                {DISCOVERY_SORT_OPTIONS.map((option) => {
                  const isSelected = sortOption === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSortClick(option.value)}
                      type="button"
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                      {isSelected && (
                        <svg
                          className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Sort Dropdown */}
      <div className="hidden lg:block relative">
        <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="w-full flex items-center justify-between px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{selectedOption?.label || 'Popularity'}</span>
            {sortDirection === 'asc' && (
              <svg
                className="w-4 h-4 text-muted-foreground rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-40 w-full mt-2 bg-card border border-border rounded-lg shadow-lg">
              <div className="p-2 space-y-1">
                {DISCOVERY_SORT_OPTIONS.map((option) => {
                  const isSelected = sortOption === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSortClick(option.value)}
                      type="button"
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                      {isSelected && (
                        <svg
                          className={`w-4 h-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
