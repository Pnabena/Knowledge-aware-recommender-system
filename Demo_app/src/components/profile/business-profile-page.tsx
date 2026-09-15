"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { BusinessExplanation, BusinessProfile, RecommendationContext } from "@/types/explanation";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { useDiscoveryState } from "@/components/discovery-state";
import { profileToCard } from "@/lib/business-adapter";
import { RankingRating } from "@/components/ranking/ranking-rating";
import { ExplanationDrawer } from "@/components/explanation/explanation-drawer";
import { MissingVisualState } from "@/components/explanation/missing-visual-state";
import { BusinessGallery } from "./business-gallery";
import { BusinessSummary } from "./business-summary";
import type { NotebookCaseDto } from "@/types/api";
import { PRESENTATION_USER_ROW } from "@/lib/api";

export function BusinessProfilePage({ business, context, explanation, selectedCase }: { business: BusinessProfile; context: RecommendationContext | null; explanation: BusinessExplanation | null; selectedCase: NotebookCaseDto | null }) {
  const router = useRouter();
  const { setView, savedIds, toggleSave } = useDiscoveryState();
  const [explanationOpen, setExplanationOpen] = useState(false);
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [business.businessId]);
  const returnTo = context?.returnTo ?? "/";
  const contextParams = new URLSearchParams({ from: context?.source ?? "for-you", ...(context?.query ? { q: context.query } : {}) });
  const demoHref = `/business/${encodeURIComponent(business.businessId)}?${contextParams}`;
  contextParams.set("case", "notebook");
  const caseHref = `/business/${encodeURIComponent(business.businessId)}?${contextParams}`;
  // Keep the drawer available for recommendations even when optional evidence is absent.
  // The fallback contains only verified ranks and profile data; each evidence tab handles absence.
  const drawerExplanation: BusinessExplanation | null = explanation ?? (context ? {
    businessId: business.businessId, userId: context.userId, userRow: context.userRow, notebookCase: context.notebookCase, business,
    ranking: { nvRank: context.nvRank, mmRank: context.mmRank }, source: "frozen-model",
  } : null);
  return <>
    <a href="#business-profile" className="skip-link">Skip to business profile</a>
    <Navigation view="home" onViewChange={(view) => { setView(view); router.push("/"); }} />
    <div className="app-content">
      <div className="sticky-shell"><Header query={context?.query} /></div>
      <main id="business-profile" className="profile-content" tabIndex={-1}>
        <div className="profile-breadcrumb"><Link href={returnTo}><ArrowLeft size={17} aria-hidden="true" />{context?.source === "search" ? "Back to results" : "Back to For You"}</Link><span className="profile-demo-note">{business.source === "dataset" ? "Yelp dataset · frozen snapshot" : "Demo profile · illustrative details & reviews"}</span></div>
        <section className="profile-case-context" aria-label="Recommendation context">
          <p><strong>{context?.notebookCase ? `Notebook case · User ${context.userRow}` : `Demo user ${PRESENTATION_USER_ROW}`}</strong>{context && <span>KGRec-NV #{context.nvRank} → KGRec-MM #{context.mmRank}</span>}</p>
          {selectedCase && <><p>{selectedCase.case_type} uses user {selectedCase.user_row}. Ranks and history depend on the selected user.</p><nav aria-label="Choose evidence context"><Link href={demoHref} aria-current={!context?.notebookCase ? "page" : undefined}>Demo user {PRESENTATION_USER_ROW}</Link><Link href={caseHref} aria-current={context?.notebookCase ? "page" : undefined}>Notebook case · User {selectedCase.user_row}</Link></nav></>}
          {!context && <p>This business is excluded from recommendations for this user because it occurs in the training or validation history.</p>}
        </section>
        <div className="profile-top"><BusinessGallery business={business} /><BusinessSummary business={business} context={context} saved={savedIds.has(business.businessId)} onSave={() => toggleSave(business.businessId, profileToCard(business))} onExplain={() => setExplanationOpen(true)} /></div>
        <div className="profile-details-grid">
          <div>
            <section className="profile-section"><h2>A little about this place</h2>{business.about && <p className="profile-about">{business.about}</p>}<div className="profile-category-chips" aria-label="Business categories">{business.categories.map((category) => <span key={category}>{category}</span>)}</div></section>
            <section className="profile-section"><div className="profile-section-heading"><h2>From the table</h2><span>Representative customer reviews</span></div><div className="profile-reviews">{business.reviews.length === 0 && <p className="profile-image-note">Representative review excerpts are not available for this business.</p>}{business.reviews.map((review) => <article key={review.id} className="profile-review"><div className="profile-review-heading"><span className="review-avatar" aria-hidden="true">{review.author[0]}</span><div><h3>{review.author}</h3><time>{review.date}</time></div><RankingRating rating={review.rating} /></div><p>“{review.excerpt}”</p></article>)}</div>{business.source === "mock" && <p className="profile-image-note">These sample reviews are fictional and are included to demonstrate the interface.</p>}</section>
          </div>
          <aside className="profile-facts"><h2>Good to know</h2><dl>{business.attributes.map((attribute) => <div key={attribute.label}><dt>{attribute.label}</dt><dd>{attribute.value}</dd></div>)}</dl>{business.source === "dataset" && <p className="profile-image-note">Attributes recorded in the Yelp dataset snapshot.</p>}<div className="profile-location-card"><MapPin size={20} aria-hidden="true" /><div><strong>{business.location}</strong><p>A little local discovery</p></div></div></aside>
        </div>
        <section className="profile-section profile-all-photos"><div className="profile-section-heading"><h2>A closer look</h2><span>Image gallery</span></div>{business.imageAvailable && business.images.length > 0 ? <div className="profile-photo-grid">{business.images.map((image) => <figure key={image.url}><div><Image src={image.url} alt={image.alt} fill sizes="(max-width: 599px) 45vw, 30vw" className="object-cover" /></div><figcaption>{image.label}</figcaption></figure>)}</div> : <MissingVisualState />}</section>
      </main>
    </div>
    {drawerExplanation && <ExplanationDrawer key={business.businessId} explanation={drawerExplanation} detailedEvidenceAvailable={Boolean(explanation)} open={explanationOpen} onClose={() => setExplanationOpen(false)} />}
  </>;
}
