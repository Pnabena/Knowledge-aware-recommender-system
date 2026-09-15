import { Bookmark, Check, MapPin, Sparkles } from "lucide-react";
import { RankingRating } from "@/components/ranking/ranking-rating";
import type { BusinessProfile, RecommendationContext } from "@/types/explanation";

export function BusinessSummary({ business, context, saved, onSave, onExplain }: { business: BusinessProfile; context: RecommendationContext | null; saved: boolean; onSave: () => void; onExplain: () => void }) {
  return <div className="profile-summary">
    <span className="profile-eyebrow">A place to discover</span>
    <h1>{business.name}</h1>
    <p className="profile-cuisine">{business.categories.join(" · ")}</p>
    <div className="profile-rating"><RankingRating rating={business.rating} /><span>{business.reviewCount ?? business.reviews.length} {business.source === "dataset" ? "Yelp reviews" : "representative reviews"}</span></div>
    <p className="profile-location"><MapPin size={16} aria-hidden="true" />{business.location}</p>
    {business.tagline && <p className="profile-tagline">{business.tagline}</p>}
    <div className="profile-summary-meta">{business.attributes.slice(0, 2).map((attribute) => <div key={attribute.label}><span>{attribute.label}</span><strong>{attribute.value}</strong></div>)}</div>
    <div className="profile-actions">
      {context && <button className="profile-primary-button" onClick={onExplain}><Sparkles size={17} aria-hidden="true" />Why this place?</button>}
      <button className={`profile-save-button ${saved ? "is-saved" : ""}`} onClick={onSave} aria-pressed={saved}>{saved ? <Check size={17} aria-hidden="true" /> : <Bookmark size={17} aria-hidden="true" />}{saved ? "Saved" : "Save place"}</button>
    </div>
    {context ? <p className="profile-context-note">Explore evidence associated with this recommendation.</p> : <p className="profile-context-note">Open this place from For You or a ranking result to explore recommendation evidence.</p>}
  </div>;
}
