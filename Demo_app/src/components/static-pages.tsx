"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDiscoveryFeed } from "@/lib/feed";
import { getRankingComparison } from "@/lib/rankings";
import { getBusinessExplanation, getBusinessProfile, getNotebookCases, getNotebookContext, getRecommendationContext } from "@/lib/business-profile";
import { DiscoveryShell } from "./discovery-shell";
import { BusinessProfilePage } from "./profile/business-profile-page";

export function StaticLoading() {
  return <main className="empty-state" role="status"><p>Loading the frozen demo…</p></main>;
}

function useStaticData<T>(key: string, load: () => Promise<T>): T | undefined {
  const [result, setResult] = useState<{ key: string; data?: T; error?: Error }>();
  useEffect(() => {
    let active = true;
    load().then(
      (data) => { if (active) setResult({ key, data }); },
      (error) => { if (active) setResult({ key, error: error instanceof Error ? error : new Error(String(error)) }); },
    );
    return () => { active = false; };
  }, [key, load]);
  if (result?.key !== key) return undefined;
  if (result.error) throw result.error;
  return result.data;
}

export function StaticHome() {
  const feed = useStaticData("home", getDiscoveryFeed);
  return feed ? <DiscoveryShell feed={feed} /> : <StaticLoading />;
}

export function StaticSearch() {
  const query = useSearchParams().get("q")?.trim() ?? "";
  const load = useCallback(async () => {
    const [feed, comparison] = await Promise.all([getDiscoveryFeed(), getRankingComparison(query)]);
    return { feed, comparison };
  }, [query]);
  const result = useStaticData(query, load);
  if (!query) return <StaticHome />;
  return result ? <DiscoveryShell key={query} {...result} /> : <StaticLoading />;
}

export function StaticBusiness({ businessId }: { businessId: string }) {
  const params = useSearchParams();
  const source = params.get("from") === "search" ? "search" : "for-you";
  const query = params.get("q")?.trim();
  const notebook = params.get("case") === "notebook";
  const key = JSON.stringify([businessId, source, query, notebook]);
  const load = useCallback(async () => {
    const [business, cases] = await Promise.all([getBusinessProfile(businessId), getNotebookCases()]);
    const selectedCase = cases.find((item) => item.business_id === businessId) ?? null;
    if (!business || (notebook && !selectedCase)) return null;
    const context = await (notebook ? getNotebookContext : getRecommendationContext)(businessId, source, query);
    const explanation = context ? await getBusinessExplanation(context) : null;
    return { business, context, explanation, selectedCase };
  }, [businessId, source, query, notebook]);
  const result = useStaticData(key, load);
  if (result === undefined) return <StaticLoading />;
  if (result === null) return <main className="empty-state"><h1>This place or notebook case is unavailable</h1><Link href="/">Return to For You</Link></main>;
  return <BusinessProfilePage key={key} {...result} />;
}
