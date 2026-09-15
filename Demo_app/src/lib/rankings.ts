import type { RankingResponse } from "@/types/ranking";
import type { SearchDto } from "@/types/api";
import { fetchDataset, PRESENTATION_USER_ROW } from "./api";

/** Filter the full catalogue by query; preserve the original global model ranks. */
export async function getRankingComparison(query: string): Promise<RankingResponse> {
  const data = await fetchDataset(`/search?${new URLSearchParams({ q: query, user_row: String(PRESENTATION_USER_ROW) })}`) as SearchDto;
  return {
    query, source: data.source, userRow: data.user_row,
    results: data.comparison.map((item) => ({
      businessId: item.business_id, name: item.name, categories: item.categories,
      rating: item.stars, image: item.has_visual_feature ? item.image_url : null,
      nvRank: item.nv_rank, mmRank: item.mm_rank, nvScore: item.nv_score ?? undefined, mmScore: item.mm_score ?? undefined,
    })),
  };
}
