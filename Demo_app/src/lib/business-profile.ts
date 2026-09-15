import { cache } from "react";
import type { BusinessDto, CaseEvidenceDto, NotebookCaseDto, RankingItemDto } from "@/types/api";
import type { BusinessExplanation, BusinessProfile, RecommendationContext } from "@/types/explanation";
import { DatasetApiError, fetchDataset, PRESENTATION_USER_ROW } from "./api";

function profileAttributes(item: BusinessDto): BusinessProfile["attributes"] {
  const values: BusinessProfile["attributes"] = [];
  const price = Number(item.attributes.RestaurantsPriceRange2);
  if (Number.isInteger(price) && price >= 1 && price <= 4) values.push({ label: "Price range", value: "$".repeat(price) });
  for (const [key, label] of [["OutdoorSeating", "Outdoor seating"], ["RestaurantsReservations", "Reservations"], ["RestaurantsDelivery", "Delivery"], ["RestaurantsTakeOut", "Takeout"], ["WheelchairAccessible", "Wheelchair accessible"]]) {
    const value = item.attributes[key];
    if (value === true || value === "True") values.push({ label, value: "Yes" });
    if (value === false || value === "False") values.push({ label, value: "No" });
  }
  return values;
}

export const getBusinessProfile = cache(async (businessId: string): Promise<BusinessProfile | null> => {
  let item: BusinessDto;
  try { item = await fetchDataset(`/businesses/${encodeURIComponent(businessId)}`) as BusinessDto; }
  catch (error) { if (error instanceof DatasetApiError && error.status === 404) return null; throw error; }
  return {
    businessId: item.business_id, name: item.name, categories: item.categories, rating: item.stars,
    reviewCount: item.review_count, location: [item.address, item.city, item.state, item.postal_code].filter(Boolean).join(", "),
    about: "", tagline: "", attributes: profileAttributes(item), hours: item.hours,
    hasVisualFeature: item.has_visual_feature, imageAvailable: item.has_visual_feature && item.photos.length > 0,
    images: item.has_visual_feature ? item.photos.map((photo) => ({ photoId: photo.photo_id, url: photo.image_url, label: photo.label, alt: `${photo.label} photo of ${item.name}` })) : [],
    reviews: (item.review_excerpts ?? []).map((review) => ({ id: review.review_id, author: "Yelp reviewer", date: review.date.slice(0, 10), rating: review.stars, excerpt: review.text_excerpt })),
    source: "dataset",
  };
});

export async function getRecommendationContext(businessId: string, source: RecommendationContext["source"], query?: string): Promise<RecommendationContext | null> {
  const ranking = await fetchDataset(`/businesses/${encodeURIComponent(businessId)}/ranking?user_row=${PRESENTATION_USER_ROW}`) as (RankingItemDto & { user_id: string; user_row: number }) | null;
  if (!ranking) return null;
  return {
    businessId, userId: ranking.user_id, userRow: ranking.user_row, nvRank: ranking.nv_rank, mmRank: ranking.mm_rank, source,
    returnTo: source === "search" && query ? `/search?${new URLSearchParams({ q: query })}` : "/",
    ...(query ? { query } : {}),
  };
}

export const getNotebookCases = cache(async () => await fetchDataset("/notebook-cases") as NotebookCaseDto[]);

export async function getNotebookContext(businessId: string, source: RecommendationContext["source"], query?: string): Promise<RecommendationContext | null> {
  const evidence = await fetchDataset(`/businesses/${encodeURIComponent(businessId)}/notebook-case`) as CaseEvidenceDto | null;
  if (!evidence) return null;
  const summary = evidence.summary;
  return {
    businessId, userId: summary.user_id, userRow: summary.user_row, notebookCase: true,
    nvRank: summary.nv_rank, mmRank: summary.mm_rank, source,
    returnTo: source === "search" && query ? `/search?${new URLSearchParams({ q: query })}` : "/",
    ...(query ? { query } : {}),
  };
}

export async function getBusinessExplanation(context: RecommendationContext): Promise<BusinessExplanation | null> {
  const evidence = await fetchDataset(context.notebookCase
    ? `/businesses/${encodeURIComponent(context.businessId)}/notebook-case`
    : `/businesses/${encodeURIComponent(context.businessId)}/explanation?user_row=${context.userRow ?? PRESENTATION_USER_ROW}`) as CaseEvidenceDto | null;
  if (!evidence) return null;
  const summary = evidence.summary;
  if (summary.business_id !== context.businessId || summary.user_id !== context.userId || summary.user_row !== (context.userRow ?? PRESENTATION_USER_ROW) || summary.nv_rank !== context.nvRank || summary.mm_rank !== context.mmRank) return null;
  const business = await getBusinessProfile(context.businessId);
  if (!business) return null;
  const history = evidence.history.map((item) => ({ businessId: item.business_id, name: item.name, sharedCategories: item.shared_categories.split(",").map((value) => value.trim()).filter(Boolean), interactionLabel: "Training interaction" }));
  return {
    businessId: business.businessId, userId: context.userId, userRow: summary.user_row, notebookCase: context.notebookCase, business, source: "frozen-model",
    ranking: { nvRank: summary.nv_rank, mmRank: summary.mm_rank },
    historyEvidence: {
      supportFraction: summary.target_category_support_fraction,
      categories: evidence.category_overlap.map((item) => ({ category: item.category, historicalBusinessCount: item.historical_business_count })),
      businesses: history,
      ...(history[0] ? { strongestMatch: { name: history[0].name, sharedCategories: history[0].sharedCategories } } : {}),
    },
    textEvidence: evidence.text.map((item) => ({ excerpt: item.text_excerpt, similarity: item.text_representativeness })),
    visualEvidence: evidence.visual.map((item) => ({ url: item.image_url, label: item.label, similarity: item.visual_representativeness })),
    visualSummary: { selectedImageCount: summary.selected_image_count, labelCount: summary.label_diversity },
    modelEvidence: {
      // Score gain is full minus masked; rank gain is masked rank minus full rank.
      ...(summary.target_visual_score_gain !== null ? { targetVisualScoreSensitivity: -summary.target_visual_score_gain } : {}),
      ...(summary.target_visual_rank_gain !== null ? { targetVisualRankSensitivity: summary.target_visual_rank_gain } : {}),
      ...(summary.competitive_visual_rank_effect !== null ? { competitiveVisualRankEffect: summary.competitive_visual_rank_effect } : {}),
    },
  };
}
