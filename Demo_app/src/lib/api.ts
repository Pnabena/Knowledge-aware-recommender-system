import type { BusinessDto, CaseEvidenceDto, FeedDto, NotebookCaseDto, RankingItemDto, SearchDto } from "@/types/api";

export const PRESENTATION_USER_ROW = 3279;

export class DatasetApiError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

interface StaticBusiness {
  business: BusinessDto;
  ranking: (RankingItemDto & { user_id: string; user_row: number }) | null;
  evidence: CaseEvidenceDto | null;
  notebook_case: CaseEvidenceDto | null;
}

type Catalogue = Omit<SearchDto, "comparison"> & { comparison: (SearchDto["comparison"][number] & { search_text: string })[] };
const documents = new Map<string, Promise<unknown>>();

/** Fetch only bundled, same-origin JSON. Failed reads can be retried. */
function readDocument<T>(path: string): Promise<T> {
  let pending = documents.get(path);
  if (!pending) {
    pending = fetch(path, { signal: AbortSignal.timeout(20000) }).then(async (response) => {
      if (!response.ok) throw new DatasetApiError(`Static data returned ${response.status} for ${path}`, response.status);
      return response.json();
    }).catch((error) => { documents.delete(path); throw error; });
    documents.set(path, pending);
  }
  return pending as Promise<T>;
}

function searchText(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/ß/g, "ss").replace(/ς/g, "σ").replace(/[^\p{L}\p{N}\s]/gu, "");
}

/** Preserve the existing data adapter contract using the exported frozen snapshot. */
export async function fetchDataset(path: string): Promise<unknown> {
  const url = new URL(path, "https://static.invalid");
  const user = url.searchParams.get("user_row");
  if (user !== null && user !== String(PRESENTATION_USER_ROW)) {
    throw new DatasetApiError("This snapshot contains demo user 3279 and the five explicit notebook cases.", 404);
  }
  if (url.pathname === "/notebook-cases") return readDocument<NotebookCaseDto[]>("/data/notebook-cases.json");
  if (url.pathname === `/feed/${PRESENTATION_USER_ROW}`) {
    const feed = await readDocument<FeedDto>("/data/feed.json");
    const k = Number(url.searchParams.get("k") ?? 30);
    if (!Number.isInteger(k) || k < 1 || k > 30) throw new DatasetApiError("Static feed supports 1–30 results.", 422);
    return { ...feed, k, businesses: feed.businesses.slice(0, k) };
  }
  if (url.pathname === "/search") {
    const catalogue = await readDocument<Catalogue>("/data/catalogue.json");
    const query = (url.searchParams.get("q") ?? "").trim();
    const tokens = searchText(query).split(/\s+/).filter(Boolean);
    const comparison = tokens.length ? catalogue.comparison.filter((row) => tokens.every((token) => row.search_text.includes(token))).sort((a, b) => (a.mm_rank ?? Infinity) - (b.mm_rank ?? Infinity)) : [];
    return { ...catalogue, query, comparison, total: comparison.length };
  }
  const match = url.pathname.match(/^\/businesses\/([A-Za-z0-9_-]{22})(?:\/(ranking|explanation|notebook-case))?$/);
  if (match) {
    const record = await readDocument<StaticBusiness>(`/data/businesses/${match[1]}.json`);
    switch (match[2]) {
      case "ranking": return record.ranking;
      case "explanation": return record.evidence;
      case "notebook-case": return record.notebook_case;
      default: return record.business;
    }
  }
  throw new DatasetApiError(`No exported data for ${url.pathname}`, 404);
}
