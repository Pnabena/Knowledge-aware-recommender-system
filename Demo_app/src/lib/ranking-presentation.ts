import type { RankingModel, RankingResult, TopK } from "@/types/ranking";

export function getRankMovement(result: RankingResult, model: RankingModel) {
  const rankMovement = result.nvRank === null || result.mmRank === null ? null : result.nvRank - result.mmRank;
  return {
    currentRank: model === "mm" ? result.mmRank : result.nvRank,
    otherRank: model === "mm" ? result.nvRank : result.mmRank,
    otherModel: model === "mm" ? "NV" : "MM",
    delta: rankMovement === null ? null : model === "mm" ? rankMovement : -rankMovement,
  };
}

/** Only orders supplied ranks and limits display; does not calculate model scores. */
export function getTopRankings(results: RankingResult[], model: RankingModel, topK: TopK) {
  const rankKey = model === "mm" ? "mmRank" : "nvRank";
  return [...results].sort((a, b) => (a[rankKey] ?? Infinity) - (b[rankKey] ?? Infinity)).slice(0, topK);
}

export function businessDetailPath(businessId: string) {
  return `/business/${encodeURIComponent(businessId)}`;
}
