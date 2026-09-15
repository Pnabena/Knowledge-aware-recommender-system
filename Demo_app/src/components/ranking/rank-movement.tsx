import { ArrowDown, ArrowUp } from "lucide-react";
import { getRankMovement } from "@/lib/ranking-presentation";
import type { RankingModel, RankingResult } from "@/types/ranking";

export function RankMovement({ result, model }: { result: RankingResult; model: RankingModel }) {
  const { delta, otherRank, otherModel } = getRankMovement(result, model);
  if (delta === null) return <span className="rank-movement rank-unchanged">Excluded from recommendations</span>;
  if (delta === 0) return <span className="rank-movement rank-unchanged">Same rank</span>;
  const up = delta > 0;
  return <span className={`rank-movement ${up ? "rank-up" : "rank-down"}`} aria-label={`${up ? "Up" : "Down"} ${Math.abs(delta)} from ${otherModel} rank ${otherRank}`}>
    {up ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />}
    <span>{Math.abs(delta)} from {otherModel} #{otherRank}</span>
  </span>;
}
