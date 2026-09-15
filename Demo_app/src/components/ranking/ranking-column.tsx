import type { RankingModel, RankingResult } from "@/types/ranking";
import { RankingResultCard } from "./ranking-result-card";

export const rankingLabels = {
  mm: { title: "Multimodal Ranking", description: "Ranking uses interaction, text, structured business information and visual evidence." },
  nv: { title: "Non-Visual Ranking", description: "Ranking uses interaction, text and structured business information only." },
};

interface RankingColumnProps {
  model: RankingModel;
  results: RankingResult[];
  activeModel: RankingModel;
  highlightedId: string | null;
  selectedId: string | null;
  onHighlight: (id: string | null) => void;
  onSelect: (id: string) => void;
  onOpenBusiness?: (path: string) => void;
}

export function RankingColumn({ model, results, activeModel, highlightedId, selectedId, onHighlight, onSelect, onOpenBusiness }: RankingColumnProps) {
  const labels = rankingLabels[model];
  return <section className={`ranking-column ${activeModel === model ? "is-mobile-active" : ""}`} aria-labelledby={`${model}-heading`} data-model={model} id={`${model}-ranking`}>
    <div className="ranking-column-heading"><h2 id={`${model}-heading`}>{labels.title}</h2><p>{labels.description}</p></div>
    <ol className="ranking-list" aria-label={labels.title}>
      {results.map((result) => <RankingResultCard key={result.businessId} result={result} model={model} highlighted={result.businessId === highlightedId} selected={result.businessId === selectedId} onHighlight={onHighlight} onSelect={onSelect} onOpenBusiness={onOpenBusiness} />)}
    </ol>
  </section>;
}
