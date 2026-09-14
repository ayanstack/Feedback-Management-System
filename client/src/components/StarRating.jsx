import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  setRating,
  editable = false,
  size = 'md',
  showLabel = true,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const ratingLabels = {
    1: '1 - Poor Experience',
    2: '2 - Fair, Needs Improvement',
    3: '3 - Good, Met Expectations',
    4: '4 - Very Good, Impressed',
    5: '5 - Outstanding & Exceptional!',
  };

  const currentDisplay = hoverRating || rating;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              disabled={!editable}
              onClick={() => editable && setRating && setRating(star)}
              onMouseEnter={() => editable && setHoverRating(star)}
              onMouseLeave={() => editable && setHoverRating(0)}
              className={`${
                editable
                  ? 'cursor-pointer hover:scale-110 transition-transform p-0.5 focus:outline-none'
                  : 'cursor-default'
              }`}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 fill-slate-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && editable && (
        <span className="text-xs font-medium text-slate-500 h-4">
          {ratingLabels[currentDisplay] || 'Click on stars to rate'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
