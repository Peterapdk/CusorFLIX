'use client';

import { useState } from 'react';
import type { MediaFilter, SortOption, SortDirection } from '@/types/library';
import { getGenresByMediaType, getCurrentYear, getYearRangeOptions } from '@/lib/tmdb-genres';
import type { TMDBGenre } from '@/lib/tmdb-genres';

interface FilterSortBarProps {
  filters: MediaFilter;
  sortOption: SortOption;
  sortDirection: SortDirection;
  mediaType: 'movie' | 'tv' | 'all';
  onFilterChange: (filters: MediaFilter) => void;
  onSortChange: (option: SortOption, direction: SortDirection) => void;
  onClearFilters: () => void;
}

export default function FilterSortBar({
  filters,
  sortOption,
  sortDirection,
  mediaType,
  onFilterChange,
  onSortChange,
  onClearFilters,
}: FilterSortBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const availableGenres = getGenresByMediaType(mediaType);
  const yearOptions = getYearRangeOptions();
  const currentYear = getCurrentYear();

  const hasActiveFilters = 
    (filters.genres && filters.genres.length > 0) ||
    (filters.yearRange && (filters.yearRange.min !== undefined || filters.yearRange.max !== undefined)) ||
    (filters.ratingRange && (filters.ratingRange.min !== undefined || filters.ratingRange.max !== undefined));

  const handleGenreToggle = (genreId: number) => {
    const currentGenres = filters.genres || [];
    const newGenres = currentGenres.includes(genreId)
      ? currentGenres.filter(id => id !== genreId)
      : [...currentGenres, genreId];
    onFilterChange({ ...filters, genres: newGenres.length > 0 ? newGenres : undefined });
  };

  const handleYearRangeChange = (field: 'min' | 'max', value: string) => {
    const yearValue = value === '' ? undefined : parseInt(value, 10);
    onFilterChange({
      ...filters,
      yearRange: {
        ...filters.yearRange,
        [field]: yearValue,
      },
    });
  };

  const handleRatingRangeChange = (field: 'min' | 'max', value: string) => {
    const ratingValue = value === '' ? undefined : parseFloat(value);
    onFilterChange({
      ...filters,
      ratingRange: {
        ...filters.ratingRange,
        [field]: ratingValue,
      },
    });
  };

  const handleSortChange = (option: SortOption) => {
    // Toggle direction if same option, otherwise set to default
    const newDirection = option === sortOption && sortDirection === 'desc' ? 'asc' : 'desc';
    onSortChange(option, newDirection);
  };

  return (
    <div className="space-y-4">
      {/* Filter/Sort Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary transition-colors"
        >
          <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-sm font-medium text-foreground">
            {isExpanded ? 'Hide Filters' : 'Show Filters & Sort'}
          </span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              Active
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Expanded Filter/Sort Panel */}
      {isExpanded && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre: TMDBGenre) => {
                const isSelected = filters.genres?.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {genre.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Year Range Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Release Year
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">From</label>
                <select
                  value={filters.yearRange?.min || ''}
                  onChange={(e) => handleYearRangeChange('min', e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  {yearOptions.map((year: number) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">To</label>
                <select
                  value={filters.yearRange?.max || ''}
                  onChange={(e) => handleYearRangeChange('max', e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  {yearOptions.map((year: number) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rating Range Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Rating
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Min</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.ratingRange?.min || ''}
                  onChange={(e) => handleRatingRangeChange('min', e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Max</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.ratingRange?.max || ''}
                  onChange={(e) => handleRatingRangeChange('max', e.target.value)}
                  placeholder="10.0"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {(['date-added', 'release-date', 'rating', 'title', 'popularity'] as SortOption[]).map((option) => {
                const isSelected = sortOption === option;
                const displayName = option
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                
                return (
                  <button
                    key={option}
                    onClick={() => handleSortChange(option)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <span>{displayName}</span>
                    {isSelected && (
                      <svg
                        className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
