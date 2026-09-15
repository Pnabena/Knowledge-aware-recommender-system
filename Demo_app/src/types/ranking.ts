export type RankingModel = "mm" | "nv";
export type TopK = 5 | 10 | 20;

/** Ranks are supplied by the data provider, never computed from the search query. */
export interface RankingResult {
  businessId: string;
  name: string;
  categories: string[];
  rating: number;
  image: string | null;
  nvRank: number | null;
  mmRank: number | null;
  nvScore?: number;
  mmScore?: number;
}

export interface RankingResponse {
  query: string;
  userRow?: number;
  results: RankingResult[];
  source: "mock" | "frozen-model";
}
