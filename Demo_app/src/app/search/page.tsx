import type { Metadata } from "next";
import { Suspense } from "react";
import { StaticLoading, StaticSearch } from "@/components/static-pages";

export const metadata: Metadata = { title: "Search · Local Table" };

export default function SearchPage() {
  return <Suspense fallback={<StaticLoading />}><StaticSearch /></Suspense>;
}
