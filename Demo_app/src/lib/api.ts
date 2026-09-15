import { cache } from "react";

export const PRESENTATION_USER_ROW = 3279;
const API_BASE_URL = (process.env.RECOMMENDER_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export class DatasetApiError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

/** Request-scoped deduplication only: never substitute mock data on a service failure. */
export const fetchDataset = cache(async (path: string): Promise<unknown> => {
  // Let Next.js render-control signals and network errors propagate to the error boundary.
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new DatasetApiError(`Dataset service returned ${response.status} for ${path}`, response.status);
  return response.json();
});
