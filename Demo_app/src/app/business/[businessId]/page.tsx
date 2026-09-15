import { notFound } from "next/navigation";
import { BusinessProfilePage } from "@/components/profile/business-profile-page";
import { getBusinessExplanation, getBusinessProfile, getRecommendationContext, getNotebookCases, getNotebookContext } from "@/lib/business-profile";

type PageProps = { params: Promise<{ businessId: string }>; searchParams: Promise<{ from?: string; q?: string; case?: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { businessId } = await params;
  const business = await getBusinessProfile(businessId);
  return { title: business ? `${business.name} · Local Table` : "Place not found · Local Table" };
}

export default async function BusinessPage({ params, searchParams }: PageProps) {
  const [{ businessId }, search] = await Promise.all([params, searchParams]);
  const business = await getBusinessProfile(businessId);
  if (!business) notFound();
  const from = search.from === "for-you" || search.from === "search" ? search.from : undefined;
  const query = typeof search.q === "string" ? search.q.trim() : undefined;
  const selectedCase = (await getNotebookCases()).find((item) => item.business_id === businessId) ?? null;
  if (search.case === "notebook" && !selectedCase) notFound();
  const context = search.case === "notebook"
    ? await getNotebookContext(businessId, from ?? "for-you", query)
    : await getRecommendationContext(businessId, from ?? "for-you", query);
  const explanation = context ? await getBusinessExplanation(context) : null;
  return <BusinessProfilePage key={`${businessId}-${search.case ?? "demo"}`} business={business} context={context} explanation={explanation} selectedCase={selectedCase} />;
}
