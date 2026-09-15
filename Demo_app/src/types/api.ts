/** DTOs for the local FastAPI service. All identity and evidence fields are dataset-backed. */
export interface SelectedPhotoDto {
  photo_id: string; business_id: string; label: string; selection_rank: number;
  width: number; height: number; image_url: string;
}
export interface BusinessDto {
  source: "dataset"; business_id: string; business_row: number; name: string;
  address: string; city: string; state: string; postal_code: string;
  stars: number; review_count: number; categories: string[]; is_open: boolean;
  has_visual_feature: boolean; image_url: string | null; photos: SelectedPhotoDto[];
  attributes: Record<string, string | boolean | number | null>; hours: Record<string, string>;
  mm_rank?: number; mm_score?: number; nv_rank?: number;
  review_excerpts?: TextEvidenceDto[];
}
export interface FeedDto {
  source: "frozen-model"; model: "KGRec-MM"; user_row: number; user_id: string; k: number;
  businesses: BusinessDto[];
}
export interface RankingItemDto {
  business_row: number; business_id: string; name: string; categories: string[];
  stars: number; review_count: number; address: string; city: string; state: string;
  nv_rank: number; mm_rank: number; nv_score: number; mm_score: number;
  rank_movement: number; has_visual_feature: boolean; image_url: string | null;
}
export interface RankingDto {
  source: "frozen-model"; user_row: number; user_id: string; candidate_businesses: number; k: number;
  comparison: RankingItemDto[];
}
export interface SearchDto {
  source: "frozen-model"; user_row: number; user_id: string; total: number;
  comparison: (Omit<RankingItemDto, "nv_rank" | "mm_rank" | "nv_score" | "mm_score"> & {
    nv_rank: number | null; mm_rank: number | null; nv_score: number | null; mm_score: number | null;
  })[];
}
export interface NotebookCaseDto {
  business_id: string; business_name: string; case_type: string;
  user_row: number; user_id: string; nv_rank: number; mm_rank: number;
}
export interface TextEvidenceDto {
  business_id: string; review_id: string; date: string; stars: number;
  text_representativeness: number; text_excerpt: string;
}
export interface CaseEvidenceDto {
  source: "frozen-model";
  summary: {
    business_id: string; user_id: string; user_row: number; nv_rank: number; mm_rank: number;
    target_category_support_fraction: number; selected_image_count: number; label_diversity: number;
    target_visual_score_gain: number | null; target_visual_rank_gain: number | null;
    competitive_visual_rank_effect: number | null;
  };
  category_overlap: { category: string; historical_business_count: number }[];
  history: { business_id: string; name: string; shared_categories: string; shared_category_count: number }[];
  text: TextEvidenceDto[];
  visual: { business_id: string; photo_id: string; label: string; image_url: string; visual_representativeness: number }[];
}
