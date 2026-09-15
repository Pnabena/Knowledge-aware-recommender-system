"use client";

import type { RankingModel, RankingResult } from "@/types/ranking";
import { businessDetailPath, getRankMovement } from "@/lib/ranking-presentation";
import { BusinessImage } from "./business-image";
import { RankingRating } from "./ranking-rating";
import { RankMovement } from "./rank-movement";

interface RankingResultCardProps {
  result: RankingResult;
  model: RankingModel;
  highlighted: boolean;
  selected: boolean;
  onHighlight: (id: string | null) => void;
  onSelect: (id: string) => void;
  /** Navigation is injected so the row can also be reused without a router. */
  onOpenBusiness?: (path: string) => void;
}

export function RankingResultCard({ result, model, highlighted, selected, onHighlight, onSelect, onOpenBusiness }: RankingResultCardProps) {
  const { currentRank } = getRankMovement(result, model);
  return <li className="ranking-list-item" value={currentRank ?? undefined}>
    <button type="button" className={`ranking-result-card ${highlighted ? "is-highlighted" : ""} ${selected ? "is-selected" : ""}`} data-business-id={result.businessId} aria-pressed={selected}
      onMouseEnter={() => onHighlight(result.businessId)} onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(result.businessId)} onBlur={() => onHighlight(null)}
      onClick={() => { onSelect(result.businessId); onOpenBusiness?.(businessDetailPath(result.businessId)); }}>
      <BusinessImage image={result.image} name={result.name} categories={result.categories} />
      <span className="ranking-business-info"><span className="ranking-business-name">{result.name}</span><span className="ranking-categories">{result.categories.slice(0, 2).join(" · ")}</span></span>
      <RankingRating rating={result.rating} />
      <span className="ranking-position"><span className="rank-number" aria-label={currentRank === null ? "Not ranked" : `Rank ${currentRank}`}>{currentRank !== null && <span className="rank-hash" aria-hidden="true">#</span>}{currentRank ?? "—"}</span><RankMovement result={result} model={model} /></span>
    </button>
  </li>;
}
