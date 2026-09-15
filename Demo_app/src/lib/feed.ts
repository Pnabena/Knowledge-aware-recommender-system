import type { FeedResponse } from "@/types/business";
import type { FeedDto } from "@/types/api";
import { fetchDataset, PRESENTATION_USER_ROW } from "./api";
import { businessToCard, categoriesForBusinesses } from "./business-adapter";

/** Frozen KGRec-MM order for the existing presentation user; no query conditioning. */
export async function getDiscoveryFeed(): Promise<FeedResponse> {
  const data = await fetchDataset(`/feed/${PRESENTATION_USER_ROW}?k=30`) as FeedDto;
  const businesses = data.businesses.map(businessToCard);
  return { businesses, categories: categoriesForBusinesses(businesses), source: data.source, model: data.model, userRow: data.user_row };
}
