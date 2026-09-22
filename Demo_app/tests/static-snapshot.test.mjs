import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const publicRoot = fileURLToPath(new URL("../public/", import.meta.url));
const json = (path) => JSON.parse(readFileSync(resolve(publicRoot, path), "utf8"));
const manifest = json("data/manifest.json");
const catalogue = json("data/catalogue.json");

test("the static snapshot contains every catalogue business and exact-case identity", () => {
  assert.equal(manifest.businesses, 2516);
  assert.equal(catalogue.comparison.length, 2516);
  assert.equal(new Set(catalogue.comparison.map((item) => item.business_id)).size, 2516);
  assert.equal(readdirSync(resolve(publicRoot, "data/businesses")).length, 2516);
  assert.equal(manifest.recommender_sha256, "1bdb1831dc6e6c8b6d28a3ac8d76d25c7e55a7b3c8c87dab80b7e46b90e45487");
  const cases = json("data/notebook-cases.json");
  assert.equal(cases.length, 5);
  for (const row of catalogue.comparison) {
    const record = json(`data/businesses/${row.business_id}.json`);
    assert.equal(record.business.business_id, row.business_id);
    if (row.mm_rank === null) {
      assert.equal(record.ranking, null);
      assert.equal(record.evidence, null);
    } else {
      assert.equal(record.ranking.nv_rank, row.nv_rank);
      assert.equal(record.ranking.mm_rank, row.mm_rank);
      assert.equal(record.evidence.summary.user_row, 3279);
      assert.equal(record.evidence.summary.user_id, catalogue.user_id);
      assert.equal(record.evidence.summary.nv_rank, row.nv_rank);
      assert.equal(record.evidence.summary.mm_rank, row.mm_rank);
    }
    const selected = cases.find((item) => item.business_id === row.business_id);
    assert.deepEqual(record.notebook_case?.summary ?? null, selected ?? null);
  }
});

test("all exported files match their hashes and every photo URL is self-contained", () => {
  for (const [path, hash] of Object.entries(manifest.sha256)) {
    const filename = resolve(publicRoot, path);
    assert.ok(filename.startsWith(publicRoot.replace(/\/$/, "") + sep));
    const bytes = readFileSync(filename);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), hash, path);
    if (path.endsWith(".json")) {
      const text = bytes.toString("utf8");
      assert.ok(!text.includes("/business-image/"), path);
      for (const match of text.matchAll(/"image_url":"(.*?)"/g)) {
        assert.match(match[1], /^\/photos\/[A-Za-z0-9_-]{22}\.jpg$/);
        assert.ok(manifest.sha256[match[1].slice(1)], match[1]);
      }
    }
  }
  assert.equal(readdirSync(resolve(publicRoot, "photos")).length, manifest.photos);
});
