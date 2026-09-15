import { Star } from "lucide-react";

export function RankingRating({ rating }: { rating: number }) {
  return <span className="ranking-rating" aria-label={`${rating} out of 5 stars`}>
    <span className="ranking-stars" aria-hidden="true">{[0, 1, 2, 3, 4].map((index) => <span key={index} className="ranking-star">
      <Star size={16} fill="currentColor" strokeWidth={0} className="ranking-star-empty" />
      <span className="ranking-star-fill" style={{ width: `${Math.min(1, Math.max(0, rating - index)) * 100}%` }}><Star size={16} fill="currentColor" strokeWidth={0} /></span>
    </span>)}</span>
    <span className="ranking-rating-number">{rating}</span>
  </span>;
}
