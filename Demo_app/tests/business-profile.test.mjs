import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

// Golden responses captured from the actual local bundle, manifest and K4/K5 artefacts.
const fixture = JSON.parse(await readFile(new URL("./fixtures/frozen-dataset.json", import.meta.url), "utf8"));
const cases = JSON.parse(await readFile(new URL("./fixtures/case-context.json", import.meta.url), "utf8"));
const require = createRequire(import.meta.url);
const temporary = await mkdtemp(join(tmpdir(), "local-table-dataset-test-"));
for (const file of ["lib/api", "lib/business-adapter", "lib/business-profile", "lib/profile-navigation", "lib/feed", "lib/rankings"]) {
  const source = await readFile(new URL(`../src/${file}.ts`, import.meta.url), "utf8");
  const emitted = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const resolved = emitted.replace(/from ["'](@\/|\.\.?\/)([^"']+)["']/g, (_, prefix, name) => `from "${prefix === "@/" ? "../" : prefix}${name}.mjs"`).replace('from "react"', `from "${pathToFileURL(require.resolve("react"))}"`);
  const target = join(temporary, `${file}.mjs`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, resolved);
}
const moduleAt = (name) => import(pathToFileURL(join(temporary, `lib/${name}.mjs`)));
const { getBusinessProfile, getRecommendationContext, getBusinessExplanation, getNotebookContext } = await moduleAt("business-profile");
const { getDiscoveryFeed } = await moduleAt("feed");
const { getRankingComparison } = await moduleAt("rankings");
const { businessToCard, profileToCard } = await moduleAt("business-adapter");
const { profileHref } = await moduleAt("profile-navigation");
const originalFetch = globalThis.fetch;
let serviceDown = false;
globalThis.fetch = async (url) => {
  if (serviceDown) throw new Error("offline");
  const request = new URL(url);
  const path = request.pathname;
  const business = [fixture.business, fixture.missing, cases.ruby].find((item) => path === `/businesses/${item.business_id}`);
  let payload = business;
  if (path.startsWith("/feed/")) payload = fixture.feed;
  else if (path === "/notebook-cases") payload = cases.cases;
  else if (path === "/search") payload = request.searchParams.get("q") === "emeril" ? cases.emerilSearch : { source: "frozen-model", user_row: 3279, comparison: [] };
  else if (path === `/businesses/${cases.ruby.business_id}/notebook-case`) payload = cases.rubyCase;
  else if (path === `/businesses/${cases.ruby.business_id}/ranking`) payload = cases.rubyRanking;
  else if (path.endsWith("/ranking")) {
    const row = fixture.rankings.comparison.find((item) => path === `/businesses/${item.business_id}/ranking`);
    payload = row ? { ...row, user_id: fixture.rankings.user_id, user_row: fixture.rankings.user_row } : null;
  }
  else if (path === `/businesses/${fixture.business.business_id}/explanation`) payload = fixture.evidence;
  else if (path === `/businesses/${cases.ruby.business_id}/explanation`) payload = cases.rubyDemo;
  else if (path.endsWith("/explanation")) payload = null;
  return new Response(JSON.stringify(payload ?? null), { status: payload === undefined ? 404 : 200, headers: { "Content-Type": "application/json" } });
};
after(async () => { globalThis.fetch = originalFetch; await rm(temporary, { recursive: true, force: true }); });

test("feed retains exact frozen MM order, Yelp stars and genuine photo ownership", async () => {
  const feed = await getDiscoveryFeed();
  assert.equal(feed.source, "frozen-model");
  assert.equal(feed.userRow, 3279);
  assert.deepEqual(feed.businesses.map((item) => item.id), fixture.feed.businesses.map((item) => item.business_id));
  for (const [index, business] of feed.businesses.entries()) {
    const source = fixture.feed.businesses[index];
    assert.equal(business.rating, source.stars);
    assert.equal(business.mmRank, source.mm_rank);
    assert.deepEqual(business.photos.map((photo) => photo.id), source.photos.map((photo) => photo.photo_id));
    assert.ok(source.photos.every((photo) => photo.business_id === business.id));
  }
  assert.ok(feed.categories.slice(1).every((category) => fixture.feed.businesses.some((business) => business.categories.includes(category.label))));
});

test("profile and saved-card adapter keep the same business, rating, categories and photos", async () => {
  const profile = await getBusinessProfile(fixture.business.business_id);
  assert.equal(profile.source, "dataset");
  assert.equal(profile.name, "Herbsaint");
  assert.equal(profile.rating, 4);
  assert.equal(profile.reviewCount, 879);
  assert.deepEqual(profile.categories, fixture.business.categories);
  const card = profileToCard(profile);
  assert.equal(card.id, fixture.business.business_id);
  assert.equal(card.rating, fixture.business.stars);
  assert.deepEqual(card.photos.map((photo) => photo.src), fixture.business.photos.map((photo) => photo.image_url));
  assert.equal(await getBusinessProfile("not-in-catalogue"), null);
});

test("missing visuals never acquire replacement photos or invented evidence", async () => {
  const profile = await getBusinessProfile(fixture.missing.business_id);
  assert.equal(profile.hasVisualFeature, false);
  assert.deepEqual(profile.images, []);
  assert.deepEqual(businessToCard(fixture.missing).photos, []);
  const unsupported = await getBusinessExplanation({ businessId: fixture.missing.business_id, userId: "D76EFdD5F7XoIIyQmWTQhA", mmRank: 1, nvRank: 1, source: "for-you", returnTo: "/" });
  assert.equal(unsupported, null);
});

test("Herbsaint explanation preserves verified ranks and correctly signs removal sensitivities", async () => {
  const context = await getRecommendationContext(fixture.business.business_id, "search", "Café & Thai");
  assert.equal(context.nvRank, 44); assert.equal(context.mmRank, 6);
  assert.equal(new URL(context.returnTo, "http://localhost").searchParams.get("q"), "Café & Thai");
  const explanation = await getBusinessExplanation(context);
  assert.equal(explanation.source, "frozen-model");
  assert.equal(explanation.modelEvidence.targetVisualRankSensitivity, 762);
  assert.equal(explanation.modelEvidence.targetVisualScoreSensitivity, -fixture.evidence.summary.target_visual_score_gain);
  assert.equal(explanation.visualSummary.selectedImageCount, 5);
  assert.equal(explanation.historyEvidence.businesses.length, 10);
  assert.equal(explanation.textEvidence.length, 3);
  assert.equal(explanation.visualEvidence.length, 5);
  for (const name of ["B Mac's", "Starbucks"]) {
    assert.deepEqual(explanation.historyEvidence.businesses.find((business) => business.name === name).sharedCategories, []);
  }
  assert.equal(explanation.textEvidence[0].excerpt, fixture.evidence.text[0].text_excerpt);
  assert.equal(await getBusinessExplanation({ ...context, userId: "different-user" }), null);
  assert.equal(await getBusinessExplanation({ ...context, mmRank: 999 }), null);
});

test("search sends the query and preserves global ranks for matching businesses", async () => {
  const found = await getRankingComparison("emeril");
  assert.ok(found.results.some((row) => row.businessId === "u7uFQCoHFtBKCtbWUm6yZw"));
  for (const [index, row] of found.results.entries()) {
    assert.equal(row.nvRank, cases.emerilSearch.comparison[index].nv_rank);
    assert.equal(row.mmRank, cases.emerilSearch.comparison[index].mm_rank);
  }
  assert.deepEqual((await getRankingComparison("Different query")).results, []);
});

test("Ruby notebook case and demo context never mix users, ranks or evidence", async () => {
  const demo = await getRecommendationContext(cases.ruby.business_id, "search", "Ruby");
  const selected = await getNotebookContext(cases.ruby.business_id, "search", "Ruby");
  assert.equal(demo.userRow, 3279);
  assert.equal(selected.userRow, 3072);
  assert.deepEqual([demo.nvRank, demo.mmRank], [64, 20]);
  assert.deepEqual([selected.nvRank, selected.mmRank], [52, 13]);
  const evidence = await getBusinessExplanation(selected);
  assert.equal(evidence.historyEvidence.supportFraction, 0.6);
  assert.equal(evidence.historyEvidence.strongestMatch.name, "Russell's Marina Grill");
  assert.equal(evidence.modelEvidence.targetVisualRankSensitivity, 713);
  assert.equal(evidence.notebookCase, true);
  const demoEvidence = await getBusinessExplanation(demo);
  assert.equal(demoEvidence.historyEvidence.supportFraction, 0.8);
  assert.equal(demoEvidence.historyEvidence.strongestMatch.name, "Commander's Palace");
  assert.equal(demoEvidence.modelEvidence.targetVisualRankSensitivity, undefined);
  assert.equal(await getBusinessExplanation({ ...selected, userRow: 3279 }), null);
  assert.equal(new URL(selected.returnTo, "http://localhost").searchParams.get("q"), "Ruby");
});

test("API failure is explicit and never falls back to fictional fixtures", async () => {
  serviceDown = true;
  try { await assert.rejects(getDiscoveryFeed, /offline/); }
  finally { serviceDown = false; }
});

test("profile navigation safely preserves recommendation source and query", () => {
  const url = new URL(profileHref(fixture.business.business_id, "search", "Café & Thai / ? #"), "http://localhost");
  assert.equal(url.searchParams.get("from"), "search");
  assert.equal(url.searchParams.get("q"), "Café & Thai / ? #");
  assert.equal(url.searchParams.get("userId"), null);
});
