"use client";

import { Bookmark, Utensils } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FeedResponse } from "@/types/business";
import type { RankingResponse } from "@/types/ranking";
import { Navigation } from "./navigation";
import { Header } from "./header";
import { CategoryTabs } from "./category-tabs";
import { MasonryGrid } from "./masonry-grid";
import { useDiscoveryState } from "./discovery-state";
import { SearchResultsPage } from "./ranking/search-results-page";

export function DiscoveryShell({ feed, comparison }: { feed: FeedResponse; comparison?: RankingResponse }) {
  const router = useRouter();
  const { view, setView, savedIds, savedBusinesses, toggleSave } = useDiscoveryState();
  const [category, setCategory] = useState("for-you");
  const catalog = view === "saved" ? [...new Map([...feed.businesses, ...savedBusinesses.values()].map((business) => [business.id, business])).values()] : feed.businesses;
  const businesses = catalog.filter((business) => (category === "for-you" || business.categoryIds.includes(category)) && (view === "home" || savedIds.has(business.id)));

  return (
    <>
      <a href="#feed" className="skip-link">{comparison ? "Skip to ranking comparison" : "Skip to restaurant feed"}</a>
      <Navigation view={comparison ? "home" : view} onViewChange={(nextView) => { setView(nextView); setCategory("for-you"); if (comparison) router.push("/"); else window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      <div className="app-content">
        <div className="sticky-shell"><Header key={comparison?.query ?? "home"} query={comparison?.query} />{!comparison && <CategoryTabs categories={feed.categories} selected={category} onSelect={setCategory} />}</div>
        <main id="feed" className={comparison ? "comparison-content" : "feed-content"} tabIndex={-1}>
          {comparison ? <SearchResultsPage key={comparison.query} comparison={comparison} /> : <>
          <h1 className={view === "home" ? "sr-only" : "mb-6 text-2xl font-semibold tracking-tight"}>{view === "home" ? "Discover restaurants picked for you" : "Your saved places"}</h1>
          {view === "home" && feed.source === "frozen-model" && <p className="comparison-source" style={{ marginBottom: 16 }}>Demo user {feed.userRow} · Frozen KGRec-MM recommendations · New Orleans</p>}
          <p className="sr-only" role="status">{businesses.length} {businesses.length === 1 ? "place" : "places"}{view === "saved" ? " saved" : " in this category"}</p>
          {businesses.length ? <MasonryGrid businesses={businesses} savedIds={savedIds} onToggleSave={toggleSave} /> : <div className="empty-state">
            {view === "saved" ? <Bookmark size={32} strokeWidth={1.4} /> : <Utensils size={32} strokeWidth={1.4} />}
            <h2>{view === "saved" ? "Keep a little inspiration" : "More good things are on the way"}</h2>
            <p>{view === "saved" ? "Save places you love and find them here." : "Explore For You to find your next favourite spot."}</p>
            <button onClick={() => { setView("home"); setCategory("for-you"); }}>Explore For You</button>
          </div>}
          </>}
        </main>
      </div>
    </>
  );
}
