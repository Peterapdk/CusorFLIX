'use client';

interface StarRatingFilterProps {
  minRating?: number;
  onRatingChange: (rating: number | undefined) => void;
}

export default function StarRatingFilter({
  minRating,
  onRatingChange,
}: StarRatingFilterProps) {
  const ratings = [4, 6, 8] as const;

  const handleRatingClick = (rating: number) => {
    // Toggle: if already selected, deselect; otherwise select
    if (minRating === rating) {
      onRatingChange(undefined);
    } else {
      onRatingChange(rating);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Minimum Rating
      </label>
      <div className="flex gap-2">
        {ratings.map((rating) => {
          const isSelected = minRating === rating;
          return (
            <button
              key={rating}
              onClick={() => handleRatingClick(rating)}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium">{rating}+</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

