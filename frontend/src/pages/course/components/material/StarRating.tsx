import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ rating, setRating, readonly = false }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 ${!readonly && 'cursor-pointer'} transition-colors ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => !readonly && setRating && setRating(star)}
        />
      ))}
    </div>
  );
}