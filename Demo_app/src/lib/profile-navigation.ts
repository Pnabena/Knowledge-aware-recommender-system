/** The provider resolves recommendation context; URL values never set users or ranks. */
export function profileHref(businessId: string, source?: "for-you" | "search", query?: string) {
  const path = `/business/${encodeURIComponent(businessId)}`;
  if (!source) return path;
  const params = new URLSearchParams({ from: source });
  if (query) params.set("q", query);
  return `${path}?${params}`;
}
