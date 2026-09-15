export interface RecommendationContext {
  userId: string;
  userRow?: number;
  notebookCase?: boolean;
  businessId: string;
  nvRank: number;
  mmRank: number;
  source: "for-you" | "search";
  returnTo: string;
  query?: string;
}

export interface ProfileImage { url: string; label: string; alt: string; photoId?: string }
export interface ProfileReview { id: string; author: string; rating: number; excerpt: string; date: string }
export interface BusinessProfile {
  businessId: string;
  name: string;
  categories: string[];
  rating: number;
  location: string;
  about: string;
  tagline: string;
  imageAvailable: boolean;
  images: ProfileImage[];
  attributes: { label: string; value: string }[];
  reviews: ProfileReview[];
  source: "mock" | "dataset";
  reviewCount?: number;
  hasVisualFeature?: boolean;
  hours?: Record<string, string>;
}

export interface HistoryBusiness {
  businessId: string;
  name: string;
  sharedCategories: string[];
  interactionLabel: string;
}

export interface BusinessExplanation {
  businessId: string;
  userId: string;
  userRow?: number;
  notebookCase?: boolean;
  business: BusinessProfile;
  ranking: { nvRank: number; mmRank: number };
  historyEvidence?: {
    supportFraction: number;
    categories: { category: string; historicalBusinessCount: number }[];
    strongestMatch?: { name: string; sharedCategories: string[] };
    businesses: HistoryBusiness[];
  };
  textEvidence?: { excerpt: string; similarity: number }[];
  visualEvidence?: { url: string; label: string; similarity: number }[];
  visualSummary?: { selectedImageCount: number; labelCount: number };
  modelEvidence?: {
    targetVisualScoreSensitivity?: number;
    /** Masked rank minus full rank: positive means removal worsens the rank number. */
    targetVisualRankSensitivity?: number;
    /** Positive means positions lower with visually supported competitors. */
    competitiveVisualRankEffect?: number;
  };
  source: "mock" | "frozen-model";
}
