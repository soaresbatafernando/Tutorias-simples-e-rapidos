import { useState } from "react";
import { Star } from "lucide-react";

export const StarRating = ({ 
  rating = 0, 
  onRate, 
  readonly = false, 
  size = "md" 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (value) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };

  return (
    <div className="star-rating" data-testid="star-rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          onMouseEnter={() => !readonly && setHoverRating(value)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          disabled={readonly}
          className={`star ${readonly ? "cursor-default" : ""}`}
          data-testid={`star-${value}`}
          aria-label={`${value} estrelas`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              (hoverRating || rating) >= value
                ? "star-filled fill-yellow-500"
                : "star-empty"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
