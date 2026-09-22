import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache, Suspense } from "react";
import { StaticBusiness, StaticLoading } from "@/components/static-pages";
import type { SearchDto } from "@/types/api";

const catalogue = cache(async () => JSON.parse(await readFile(join(process.cwd(), "public/data/catalogue.json"), "utf8")) as SearchDto);
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await catalogue()).comparison.map((item) => ({ businessId: item.business_id }));
}

type Props = { params: Promise<{ businessId: string }> };
export async function generateMetadata({ params }: Props) {
  const { businessId } = await params;
  const business = (await catalogue()).comparison.find((item) => item.business_id === businessId);
  return { title: `${business?.name ?? "Place not found"} · Local Table` };
}

export default async function BusinessPage({ params }: Props) {
  const { businessId } = await params;
  return <Suspense fallback={<StaticLoading />}><StaticBusiness businessId={businessId} /></Suspense>;
}
