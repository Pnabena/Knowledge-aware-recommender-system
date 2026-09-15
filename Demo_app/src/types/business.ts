/** UI contracts. Adapt FastAPI response fields to these types at the data boundary. */
export interface BusinessPhoto {
  id: string;
  src: string;
  alt: string;
  label?: string;
  width?: number;
  height?: number;
}

export interface Business {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  categoryIds: string[];
  rating: number;
  photos: BusinessPhoto[];
  aspectRatio: number;
  caption?: string;
  businessRow?: number;
  categories?: string[];
  address?: string;
  reviewCount?: number;
  mmRank?: number;
  mmScore?: number;
  hasVisualFeature?: boolean;
  source?: "dataset";
}

export interface Category { id: string; label: string }
export interface FeedResponse { businesses: Business[]; categories: Category[]; savedBusinesses?: Business[]; source?: "frozen-model"; model?: "KGRec-MM"; userRow?: number }
