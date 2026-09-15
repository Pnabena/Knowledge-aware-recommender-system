import { mockBusinesses } from "./mock-feed";
import { mockRankings } from "./mock-rankings";
import type { BusinessProfile, BusinessExplanation } from "@/types/explanation";

// Illustrative demo data only. No quotes or experimental findings from real businesses.
export const demoUserId = "demo-user";

const labels: Record<string, string> = {
  "warm-interior": "Inside", cafe: "Inside", "dining-room": "Inside", restaurant: "Inside",
  terrace: "Inside", bar: "Drinks", coffee: "Drinks",
};
const photoLabel = (url: string) => labels[url.split("/").pop()?.replace(".jpg", "") ?? ""] ?? "Food";
const rankingById = new Map(mockRankings.map((row) => [row.businessId, row]));

export const mockProfiles: BusinessProfile[] = mockBusinesses.map((business) => {
  const ranking = rankingById.get(business.id);
  const categories = ranking?.categories ?? business.cuisine.split(" · ");
  const images = ranking?.image === null ? [] : business.photos.map((photo) => ({ url: photo.src, label: photoLabel(photo.src), alt: photo.alt }));
  return {
    businessId: business.id, name: business.name, categories, rating: business.rating,
    location: "New Orleans, Louisiana", tagline: business.caption ?? "A place to slow down and savour the moment.",
    about: `${business.name} brings ${categories.map((category) => category.toLowerCase()).join(" and ")} together in an easygoing New Orleans setting. Come for a relaxed meal, settle into the atmosphere, and make a little time for good company.`,
    imageAvailable: images.length > 0, images,
    attributes: [{ label: "Price range", value: "$$ · Moderate" }, { label: "Good for", value: "A relaxed meal" }, { label: "Service", value: "Table service" }, { label: "Atmosphere", value: "Casual & welcoming" }],
    reviews: [
      { id: `${business.id}-review-1`, author: "Alex M.", rating: 5, date: "August 2026", excerpt: "An easy place to spend an unhurried evening. We enjoyed the welcoming atmosphere and the care that went into our meal." },
      { id: `${business.id}-review-2`, author: "Jordan L.", rating: 4, date: "July 2026", excerpt: "A comfortable spot to catch up with friends. The service was friendly and there was something for everyone at the table." },
    ], source: "mock" as const,
  };
});

for (const ranking of mockRankings) {
  if (mockProfiles.some((profile) => profile.businessId === ranking.businessId)) continue;
  const images = ranking.image ? [{ url: ranking.image, label: photoLabel(ranking.image), alt: `Illustrative ${photoLabel(ranking.image).toLowerCase()} photograph` }] : [];
  mockProfiles.push({
    businessId: ranking.businessId, name: ranking.name, categories: ranking.categories, rating: ranking.rating,
    location: "New Orleans, Louisiana", tagline: "Familiar flavours. A little discovery.",
    about: `${ranking.name} is a neighbourhood-style ${ranking.categories[0].toLowerCase()} spot for sharing a meal and catching up. Its relaxed setting makes room for both a quick visit and a longer evening around the table.`,
    imageAvailable: images.length > 0, images,
    attributes: [{ label: "Price range", value: "$$ · Moderate" }, { label: "Cuisine", value: ranking.categories[0] }, { label: "Good for", value: "Lunch & dinner" }, { label: "Atmosphere", value: "Relaxed & social" }],
    reviews: [
      { id: `${ranking.businessId}-review-1`, author: "Sam R.", rating: 5, date: "August 2026", excerpt: "A warm welcome and plenty of flavour. It felt like a lovely little discovery, with a relaxed pace and thoughtful service." },
      { id: `${ranking.businessId}-review-2`, author: "Jamie K.", rating: 4, date: "July 2026", excerpt: "A good choice for a casual meal together. We liked the variety and the friendly atmosphere." },
    ], source: "mock",
  });
}

/** Explicit supplied fixture ranks, not generated model logic. */
export const feedOnlyRanks: Record<string, { nvRank: number; mmRank: number }> = {
  "03": { nvRank: 44, mmRank: 6 }, "04": { nvRank: 25, mmRank: 12 },
  "05": { nvRank: 19, mmRank: 49 }, "06": { nvRank: 10, mmRank: 10 },
  "07": { nvRank: 28, mmRank: 17 }, "08": { nvRank: 14, mmRank: 22 },
  "09": { nvRank: 16, mmRank: 16 }, "11": { nvRank: 35, mmRank: 11 },
  "12": { nvRank: 8, mmRank: 15 }, "13": { nvRank: 30, mmRank: 8 },
  "14": { nvRank: 23, mmRank: 7 }, "15": { nvRank: 12, mmRank: 12 },
  "16": { nvRank: 7, mmRank: 18 }, "17": { nvRank: 20, mmRank: 14 },
  "18": { nvRank: 15, mmRank: 23 }, "19": { nvRank: 9, mmRank: 9 },
  "21": { nvRank: 24, mmRank: 16 }, "23": { nvRank: 22, mmRank: 13 },
  "24": { nvRank: 18, mmRank: 21 }, "25": { nvRank: 21, mmRank: 19 },
  "27": { nvRank: 26, mmRank: 20 },
};

// Future dataset adapters can resolve these cases by genuine business/user identifiers.
// This registry deliberately supplies no invented photos, reviews, or experiment results.
export const dissertationCaseRegistry = [
  { key: "mothers-restaurant", name: "Mother's Restaurant" },
  { key: "herbsaint", name: "Herbsaint" },
  { key: "emerils", name: "Emeril's" },
  { key: "witches-brew-tours", name: "Witches Brew Tours" },
  { key: "ruby-slipper", name: "Ruby Slipper" },
];

export function mockEvidenceFor(profile: BusinessProfile): Pick<BusinessExplanation, "historyEvidence" | "textEvidence" | "visualEvidence" | "visualSummary" | "modelEvidence"> {
  const categories = profile.categories.map((category, index) => ({ category, historicalBusinessCount: index === 0 ? 8 : 2 }));
  const shared = profile.categories;
  return {
    historyEvidence: {
      supportFraction: 1,
      categories,
      strongestMatch: { name: "Riverbend Table", sharedCategories: shared },
      // A representative local subset of the larger mock history counted above.
      businesses: [
        { businessId: "history-riverbend", name: "Riverbend Table", sharedCategories: shared, interactionLabel: "Reviewed in your demo history" },
        { businessId: "history-magnolia", name: "Magnolia House", sharedCategories: shared.slice(0, 1), interactionLabel: "Reviewed in your demo history" },
      ],
    },
    textEvidence: profile.reviews.slice(0, 3).map((review, index) => ({ excerpt: review.excerpt, similarity: index === 0 ? .945 : .918 })),
    visualEvidence: profile.imageAvailable ? profile.images.slice(0, 3).map((image, index) => ({ url: image.url, label: image.label, similarity: [.903, .881, .864][index] })) : [],
    visualSummary: { selectedImageCount: profile.images.length, labelCount: new Set(profile.images.map((image) => image.label)).size },
    modelEvidence: profile.imageAvailable
      ? { targetVisualScoreSensitivity: -.931, targetVisualRankSensitivity: -762 }
      : { competitiveVisualRankEffect: 578 },
  };
}
