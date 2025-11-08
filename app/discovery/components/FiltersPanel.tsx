'use client';

import { useState } from 'react';
import type { MediaFilter } from '@/types/library';
import { getGenresByMediaType } from '@/lib/tmdb-genres';
import { MAJOR_LANGUAGES } from '@/lib/tmdb-languages';
import type { TMDBGenre } from '@/lib/tmdb-genres';
import StarRatingFilter from './StarRatingFilter';
import YearRangeSlider from './YearRangeSlider';

interface FiltersPanelProps {
  filters: MediaFilter;
  mediaType: 'movie' | 'tv' | 'all';
  onFilterChange: (filters: MediaFilter) => void;
  onClearFilters: () => void;
}

export default function FiltersPanel({
  filters,
  mediaType,
  onFilterChange,
  onClearFilters,
}: FiltersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const availableGenres = getGenresByMediaType(mediaType);

  const hasActiveFilters =
    (filters.genres && filters.genres.length > 0) ||
    (filters.yearRange && (filters.yearRange.min !== undefined || filters.yearRange.max !== undefined)) ||
    filters.minRating !== undefined ||
    (filters.languages && filters.languages.length > 0);

  const activeFilterCount =
    (filters.genres?.length || 0) +
    (filters.minRating ? 1 : 0) +
    (filters.languages?.length || 0) +
    (filters.yearRange?.min || filters.yearRange?.max ? 1 : 0);

  const handleGenreToggle = (genreId: number) => {
    const currentGenres = filters.genres || [];
    const newGenres = currentGenres.includes(genreId)
      ? currentGenres.filter((id) => id !== genreId)
      : [...currentGenres, genreId];
    onFilterChange({
      ...filters,
      genres: newGenres.length > 0 ? newGenres : undefined,
    });
  };

  const handleLanguageToggle = (languageCode: string) => {
    const currentLanguages = filters.languages || [];
    const newLanguages = currentLanguages.includes(languageCode)
      ? currentLanguages.filter((code) => code !== languageCode)
      : [...currentLanguages, languageCode];
    onFilterChange({
      ...filters,
      languages: newLanguages.length > 0 ? newLanguages : undefined,
    });
  };

  const handleRatingChange = (rating: number | undefined) => {
    onFilterChange({
      ...filters,
      minRating: rating,
    });
  };

  const handleYearRangeChange = (min: number, max: number) => {
    const currentYear = new Date().getFullYear();
    const MIN_YEAR = 1970;
    
    onFilterChange({
      ...filters,
      yearRange: {
        min: min !== MIN_YEAR ? min : undefined,
        max: max !== currentYear ? max : undefined,
      },
    });
  };

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        type="button"
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg mb-4"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <svg
          className="w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </button>

      {/* Mobile Filter Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Filters Panel */}
      <div
        className={`w-full lg:w-64 bg-card border border-border rounded-lg p-4 space-y-6 ${
          isMobileOpen
            ? 'lg:block fixed inset-y-0 left-0 z-50 overflow-y-auto lg:relative lg:z-auto'
            : 'hidden lg:block'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              type="button"
              className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              <svg
                className={`w-5 h-5 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
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
            <button
              onClick={() => setIsMobileOpen(false)}
              type="button"
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close filters"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Language
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {MAJOR_LANGUAGES.map((lang) => {
                const isSelected = filters.languages?.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageToggle(lang.code)}
                    type="button"
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {lang.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Genres
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {availableGenres.map((genre: TMDBGenre) => {
                const isSelected = filters.genres?.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreToggle(genre.id)}
                    type="button"
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

          {/* Star Rating Filter */}
          <StarRatingFilter
            minRating={filters.minRating}
            onRatingChange={handleRatingChange}
          />

          {/* Year Range Slider */}
          <YearRangeSlider
            minYear={filters.yearRange?.min}
            maxYear={filters.yearRange?.max}
            onYearRangeChange={handleYearRangeChange}
          />

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              type="button"
              className="w-full px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
      </div>
    </>
  );
}

