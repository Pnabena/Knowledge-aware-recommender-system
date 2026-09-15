import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export function RankingMovement({ nvRank, mmRank }: { nvRank: number; mmRank: number }) {
  const movement = nvRank - mmRank;
  return <span className={`explanation-movement ${movement > 0 ? "rank-up" : movement < 0 ? "rank-down" : "rank-unchanged"}`}>
    {movement > 0 ? <ArrowUp size={16} aria-hidden="true" /> : movement < 0 ? <ArrowDown size={16} aria-hidden="true" /> : <Minus size={16} aria-hidden="true" />}
    <span>{movement === 0 ? "Same rank" : `${Math.abs(movement)} ${Math.abs(movement) === 1 ? "position" : "positions"} ${movement > 0 ? "higher" : "lower"}`}</span>
  </span>;
}

export function RankComparison({ ranking }: { ranking: { nvRank: number; mmRank: number } }) {
  return <div className="explanation-rank-comparison"><div className="explanation-rank-pair"><div><span>Non-visual</span><strong><small>#</small>{ranking.nvRank}</strong></div><span className="rank-pair-arrow" aria-hidden="true">→</span><div><span>Multimodal</span><strong><small>#</small>{ranking.mmRank}</strong></div></div><RankingMovement {...ranking} /></div>;
}
