import type { Business } from "@/types/business";
import { BusinessCard } from "./business-card";

// The original feed's display crops are a layout choice, independent of photo metadata.
const cardAspectRatios = [.72, .80, .56, .85, .76, .74, .74, .8, .81, .95, .73, .86, .48, .80, .82, .75, .81, .78, .57, .88, .76, .82, .81, .66, .71, 1.01, .82, .75];

export function MasonryGrid({ businesses, savedIds, onToggleSave }: { businesses: Business[]; savedIds: Set<string>; onToggleSave: (id: string, business?: Business) => void }) {
  return <div className="masonry-grid">{businesses.map((business, index) => <BusinessCard key={business.id} business={business} aspectRatio={cardAspectRatios[index % cardAspectRatios.length]} saved={savedIds.has(business.id)} onToggleSave={onToggleSave} priority={index < 7} />)}</div>;
}
