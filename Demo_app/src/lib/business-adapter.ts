import type { Business, Category } from "@/types/business";
import type { BusinessDto } from "@/types/api";
import type { BusinessProfile } from "@/types/explanation";

export const categoryId = (category: string) => `category:${category}`;

export function businessToCard(item: BusinessDto): Business {
  return {
    id: item.business_id, businessRow: item.business_row, name: item.name,
    location: [item.city, item.state].filter(Boolean).join(", "),
    address: [item.address, item.city, item.state, item.postal_code].filter(Boolean).join(", "),
    categories: item.categories, cuisine: item.categories.join(" · "),
    categoryIds: item.categories.map(categoryId), rating: item.stars, reviewCount: item.review_count,
    mmRank: item.mm_rank, mmScore: item.mm_score, hasVisualFeature: item.has_visual_feature,
    photos: item.has_visual_feature ? item.photos.map((photo) => ({
      id: photo.photo_id, src: photo.image_url, label: photo.label,
      alt: `${photo.label} photo of ${item.name}`, width: photo.width, height: photo.height,
    })) : [],
    // Standalone fallback; MasonryGrid preserves the original feed display crops.
    aspectRatio: .8,
    source: "dataset",
  };
}

export function categoriesForBusinesses(businesses: Business[]): Category[] {
  const categories = [...new Set(businesses.flatMap((business) => business.categories ?? []))];
  return [{ id: "for-you", label: "For You" }, ...categories.sort((a, b) => a.localeCompare(b)).map((label) => ({ id: categoryId(label), label }))];
}

/** Retains a real profile saved outside the current top 30 across client navigation. */
export function profileToCard(profile: BusinessProfile): Business {
  return {
    id: profile.businessId, name: profile.name, location: profile.location, categories: profile.categories,
    cuisine: profile.categories.join(" · "), categoryIds: profile.categories.map(categoryId),
    rating: profile.rating, reviewCount: profile.reviewCount, hasVisualFeature: profile.hasVisualFeature,
    photos: profile.imageAvailable ? profile.images.map((image) => ({ id: image.photoId ?? image.url, src: image.url, alt: image.alt, label: image.label })) : [],
    aspectRatio: .8, source: "dataset",
  };
}
