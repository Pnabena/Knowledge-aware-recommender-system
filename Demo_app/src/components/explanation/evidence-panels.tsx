import Image from "next/image";
import { Info, Link2, Quote } from "lucide-react";
import type { BusinessExplanation } from "@/types/explanation";
import { RankComparison, RankingMovement } from "./rank-comparison";
import { MissingVisualState } from "./missing-visual-state";

export function ExplanationOverview({ explanation }: { explanation: BusinessExplanation }) {
  const history = explanation.historyEvidence;
  const represented = history?.categories.filter((category) => category.historicalBusinessCount > 0).length ?? 0;
  return <div className="evidence-panel">
    <div className="evidence-intro"><span className="evidence-kicker">A little context</span><h3>Why this place may be relevant</h3><p>{history ? "Your previous activity contains businesses with similar characteristics. Here is a closer look at the associated evidence." : "Personalised history evidence is not available for this comparison."}</p></div>
    {history && <div className="evidence-card category-support-card"><span className="support-number">{represented}<span> / {history.categories.length}</span></span><p>of this business’s frozen target categories are represented in the selected user’s history ({Math.round(history.supportFraction * 100)}%).</p></div>}
    {history?.strongestMatch && <div className="evidence-card strongest-match"><span className="evidence-label">Strongest related place</span><div><span className="strongest-icon"><Link2 size={21} aria-hidden="true" /></span><div><h4>{history.strongestMatch.name}</h4><p>{history.strongestMatch.sharedCategories.join(" · ")}</p></div></div></div>}
    <section className="evidence-section"><h3>A different place in the ranking</h3><p className="evidence-description">The same business, compared across the two frozen models.</p><RankComparison ranking={explanation.ranking} /></section>
    {!(explanation.business.hasVisualFeature ?? explanation.business.imageAvailable) && <MissingVisualState evidence />}
    <p className="evidence-note">These are associated signals and relevant connections. They do not establish why the model produced this recommendation.</p>
  </div>;
}

export function TextEvidence({ explanation }: { explanation: BusinessExplanation }) {
  const reviews = explanation.textEvidence?.slice(0, 3) ?? [];
  return <div className="evidence-panel"><div className="evidence-intro"><span className="evidence-kicker">The words behind the place</span><h3>Representative customer evidence</h3><p>Training-review excerpts that closely represent this business’s pooled text representation.</p></div>
    <div className="evidence-info-line"><span>How were these selected?</span><span className="evidence-tooltip-wrap"><button type="button" className="evidence-info-button" aria-label="About representative text selection" aria-describedby="text-selection-tooltip"><Info size={16} /></button><span id="text-selection-tooltip" role="tooltip" className="evidence-tooltip">The review was selected because its BGE embedding was highly representative of the pooled business text representation.</span></span></div>
    {reviews.length ? reviews.map((review, index) => <article key={index} className="evidence-card text-evidence-card"><Quote size={22} aria-hidden="true" /><blockquote>{review.excerpt}</blockquote><div><span>Representation similarity</span><strong>{review.similarity.toFixed(3)}</strong></div></article>) : <div className="evidence-card"><p>Representative text evidence is not available for this business.</p></div>}
    <p className="evidence-note">A representative review summarises the text evidence. It does not show that the review caused the recommendation.{explanation.source === "mock" ? " These excerpts and similarity values are illustrative mock data." : ""}</p>
  </div>;
}

export function VisualEvidence({ explanation }: { explanation: BusinessExplanation }) {
  const visuals = explanation.visualEvidence?.slice(0, 3) ?? [];
  const top = visuals.length ? Math.max(...visuals.map((item) => item.similarity)) : undefined;
  return <div className="evidence-panel"><div className="evidence-intro"><span className="evidence-kicker">A visual impression</span><h3>Representative visual evidence</h3><p>Images associated with the business’s visual representation.</p></div>
    {!(explanation.business.hasVisualFeature ?? explanation.business.imageAvailable) ? <MissingVisualState evidence /> : <>
      {visuals.length ? <div className="visual-evidence-grid">{visuals.map((visual, index) => <figure key={`${visual.url}-${index}`}><div><Image src={visual.url} alt={`${visual.label} evidence for ${explanation.business.name}`} fill sizes="(max-width: 599px) 45vw, 230px" className="object-cover" /></div><figcaption><span>{visual.label}</span><span>{visual.similarity.toFixed(3)}</span></figcaption></figure>)}</div> : <div className="evidence-card">No representative visual evidence has been supplied.</div>}
      {explanation.visualSummary && <div className="evidence-stats"><div><span>Selected images</span><strong>{explanation.visualSummary.selectedImageCount}</strong></div><div><span>Visual diversity</span><strong>{explanation.visualSummary.labelCount}<small> labels</small></strong></div>{top !== undefined && <div><span>Top representativeness</span><strong>{top.toFixed(3)}</strong></div>}</div>}
    </>}
    <p className="evidence-note">Representative images describe available visual evidence, rather than images proven to have caused the recommendation.{explanation.source === "mock" ? " Photography and measurements here are illustrative demo assets." : ""}</p>
  </div>;
}

const signed = (value: number, decimals = 0) => `${value > 0 ? "+" : ""}${value.toFixed(decimals)}`;

export function ModelBehaviour({ explanation }: { explanation: BusinessExplanation }) {
  const evidence = explanation.modelEvidence;
  return <div className="evidence-panel"><div className="evidence-intro"><span className="evidence-kicker">A research perspective</span><h3>Recommendation comparison</h3><p>Observed ranks and sensitivity in the frozen experiment.</p></div>
    <div className="model-comparison-table"><table><thead><tr><th scope="col"><span className="sr-only">Measure</span></th><th scope="col">Non-visual</th><th scope="col">Multimodal</th></tr></thead><tbody><tr><th scope="row">Rank</th><td>#{explanation.ranking.nvRank}</td><td>#{explanation.ranking.mmRank}</td></tr><tr><th scope="row">Visual input</th><td>—</td><td>{(explanation.business.hasVisualFeature ?? explanation.business.imageAvailable) ? "Available" : "Masked"}</td></tr></tbody></table><div className="model-rank-movement"><span>Rank movement</span><RankingMovement {...explanation.ranking} /></div></div>
    {(explanation.business.hasVisualFeature ?? explanation.business.imageAvailable) ? <section className="evidence-section"><h3>Visual sensitivity</h3><p className="evidence-description">Removing this business’s visual representation from the frozen multimodal model:</p>
      {evidence?.targetVisualScoreSensitivity !== undefined || evidence?.targetVisualRankSensitivity !== undefined ? <dl className="model-sensitivity">{evidence.targetVisualScoreSensitivity !== undefined && <div><dt>Score change</dt><dd>{signed(evidence.targetVisualScoreSensitivity, 3)}</dd></div>}{evidence.targetVisualRankSensitivity !== undefined && <div><dt>Target-visual rank sensitivity</dt><dd>{signed(evidence.targetVisualRankSensitivity)} positions</dd></div>}</dl> : <p className="evidence-note">Sensitivity measurements are not available for this user and business.</p>}
      <p className="evidence-note">Rank sensitivity is the rank with target visuals removed minus the full-model rank. A positive value means removal moves the business farther from #1.{evidence?.targetVisualRankSensitivity !== undefined && <> Here: #{explanation.ranking.mmRank} → #{explanation.ranking.mmRank + evidence.targetVisualRankSensitivity}.</>}</p>
    </section> : <section className="evidence-section"><MissingVisualState evidence />{evidence?.competitiveVisualRankEffect !== undefined && <div className="evidence-card competitive-evidence"><h4>Competitive missing-modality evidence</h4><p>When visually supported competitors retained their visual representations, this target {evidence.competitiveVisualRankEffect === 0 ? "kept the same rank as" : <>ranked <strong>{Math.abs(evidence.competitiveVisualRankEffect)} positions {evidence.competitiveVisualRankEffect > 0 ? "lower" : "higher"}</strong> than</>} in the all-visuals-masked condition.</p></div>}</section>}
    <div className="evidence-disclaimer"><Info size={17} aria-hidden="true" /><p>Sensitivity indicates dependence on the visual representation but should not be interpreted as causal attribution.</p></div>
  </div>;
}
