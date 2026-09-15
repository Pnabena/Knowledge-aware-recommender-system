import { test } from "node:test";
import assert from "node:assert/strict";
import { getRankMovement, getTopRankings, businessDetailPath } from "../src/lib/ranking-presentation.ts";
import { mockRankings } from "../src/data/mock-rankings.ts";

const result = { businessId: "example", name: "Example", categories: ["French"], rating: 4.5, image: null, mmRank: 6, nvRank: 44 };

test("an improvement in MM is an equal decline in NV, including counterparts outside Top K", () => {
  assert.deepEqual(getRankMovement(result, "mm"), { currentRank: 6, otherRank: 44, otherModel: "NV", delta: 38 });
  assert.deepEqual(getRankMovement(result, "nv"), { currentRank: 44, otherRank: 6, otherModel: "MM", delta: -38 });
});

test("a decline in MM becomes an improvement in NV", () => {
  const declining = { ...result, mmRank: 3, nvRank: 2 };
  assert.equal(getRankMovement(declining, "mm").delta, -1);
  assert.equal(getRankMovement(declining, "nv").delta, 1);
});

test("equal ranks stay unchanged in both columns", () => {
  const unchanged = { ...result, mmRank: 4, nvRank: 4 };
  for (const model of ["mm", "nv"]) assert.ok(getRankMovement(unchanged, model).delta === 0);
});

test("both columns display their own supplied rank order at all supported limits", () => {
  const inputOrder = mockRankings.map((row) => row.businessId);
  for (const model of ["mm", "nv"]) {
    for (const limit of [5, 10, 20]) {
      const rows = getTopRankings(mockRankings, model, limit);
      assert.equal(rows.length, limit);
      assert.deepEqual(rows.map((row) => row[model === "mm" ? "mmRank" : "nvRank"]), Array.from({ length: limit }, (_, index) => index + 1));
    }
  }
  assert.deepEqual(mockRankings.map((row) => row.businessId), inputOrder, "Sorting must not mutate provider data");
});

test("Top K handles empty and short provider responses without inventing rows", () => {
  assert.deepEqual(getTopRankings([], "mm", 10), []);
  assert.deepEqual(getTopRankings([result], "nv", 20), [result]);
});

test("excluded catalogue matches remain visible without a made-up rank or movement", () => {
  const excluded = { ...result, businessId: "excluded", mmRank: null, nvRank: null };
  for (const model of ["mm", "nv"]) {
    assert.equal(getRankMovement(excluded, model).currentRank, null);
    assert.equal(getRankMovement(excluded, model).delta, null);
    assert.deepEqual(getTopRankings([excluded, result], model, 10), [result, excluded]);
  }
});

test("mock businesses have unique identities and complete, mutually consistent ranks", () => {
  assert.equal(new Set(mockRankings.map((row) => row.businessId)).size, mockRankings.length);
  assert.ok(mockRankings.some((row) => row.image === null));
  for (const row of mockRankings) {
    assert.ok(Number.isInteger(row.mmRank) && row.mmRank > 0);
    assert.ok(Number.isInteger(row.nvRank) && row.nvRank > 0);
    assert.equal(getRankMovement(row, "mm").delta + getRankMovement(row, "nv").delta, 0);
  }
});

test("future detail links safely encode the business identifier", () => {
  assert.equal(businessDetailPath("some/place ?#"), "/business/some%2Fplace%20%3F%23");
});
