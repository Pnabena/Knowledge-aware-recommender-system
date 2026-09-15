"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTopRankings } from "@/lib/ranking-presentation";
import type { RankingModel, RankingResponse, TopK } from "@/types/ranking";
import { RankingColumn } from "./ranking-column";
import { TopKSelector } from "./top-k-selector";

export function SearchResultsPage({ comparison }: { comparison: RankingResponse }) {
  const router = useRouter();
  const openBusiness = (path: string) => router.push(`${path}?${new URLSearchParams({ from: "search", q: comparison.query })}`);
  const [topK, setTopK] = useState<TopK>(10);
  const [activeModel, setActiveModel] = useState<RankingModel>("mm");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const highlightedId = hoveredId ?? selectedId;
  const selectBusiness = (id: string) => setSelectedId((previous) => previous === id ? null : id);

  return <div className="ranking-comparison">
    <h1 className="sr-only">Ranking comparison for {comparison.query}</h1>
    <div className="comparison-toolbar">
      <p className="comparison-source">{comparison.results.length} matches for “{comparison.query}” · Demo user {comparison.userRow} · Original catalogue ranks</p>
      <TopKSelector value={topK} onChange={setTopK} />
    </div>
    <div className="ranking-model-selector" role="group" aria-label="Ranking model">
      {(["mm", "nv"] as const).map((model) => <button type="button" key={model} aria-pressed={activeModel === model} aria-controls={`${model}-ranking`} onClick={() => setActiveModel(model)}>{model === "mm" ? "Multimodal" : "Non-Visual"}</button>)}
    </div>
    <p className="sr-only" role="status">Showing up to {topK} businesses per ranking.</p>
    <div className="comparison-columns">
      {(["mm", "nv"] as const).map((model) => <RankingColumn key={model} model={model} results={getTopRankings(comparison.results, model, topK)} activeModel={activeModel} highlightedId={highlightedId} selectedId={selectedId} onHighlight={setHoveredId} onSelect={selectBusiness} onOpenBusiness={openBusiness} />)}
    </div>
    {comparison.results.length === 0 && <div className="empty-state"><h2>No businesses found</h2><p>Try a business name, category or address in the New Orleans catalogue.</p></div>}
  </div>;
}
