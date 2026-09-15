import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DiscoveryShell } from "@/components/discovery-shell";
import { getDiscoveryFeed } from "@/lib/feed";
import { getRankingComparison } from "@/lib/rankings";

export const metadata: Metadata = { title: "Ranking Comparison · Local Table" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim();
  if (!query) redirect("/");
  const [feed, comparison] = await Promise.all([getDiscoveryFeed(), getRankingComparison(query)]);
  return <DiscoveryShell feed={feed} comparison={comparison} />;
}
