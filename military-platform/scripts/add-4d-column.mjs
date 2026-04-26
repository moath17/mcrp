/**
 * Adds a "4D" column to the "Key" sheet in the root workbook
 * "نماذج جمع المعلومات.xlsx" and writes:
 *   - "Deployment Support" for paths مسار 9 and مسار 10
 *   - Evenly-distributed "Detect" | "Deter" | "Defend" for paths مسار 1..8
 *     (deterministic shuffle so results are reproducible)
 *
 * The updated workbook is saved back in place AND copied to
 * military-platform/data/default.xlsx so the app reseeds from it.
 */
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const platformRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(platformRoot, "..");

const SOURCE_XLSX = path.join(workspaceRoot, "نماذج جمع المعلومات.xlsx");
const DEFAULT_XLSX = path.join(platformRoot, "data", "default.xlsx");

const KEY_SHEET = "Key";
const COL_PATH = "المسار";
const COL_4D = "4D";

const DEPLOYMENT_PATHS = new Set(["مسار 9", "مسار 10"]);
const THREE_LABELS = ["Detect", "Deter", "Defend"];

// Deterministic 32-bit hash for stable seeded shuffles.
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function evenlyDistribute(count, labels, rng) {
  const assignment = new Array(count);
  const indices = Array.from({ length: count }, (_, i) => i);
  shuffleInPlace(indices, rng);
  for (let k = 0; k < count; k++) {
    assignment[indices[k]] = labels[k % labels.length];
  }
  return assignment;
}

function updateWorkbook(wb) {
  if (!wb.Sheets[KEY_SHEET]) {
    throw new Error(`Sheet "${KEY_SHEET}" not found. Available: ${wb.SheetNames.join(", ")}`);
  }
  const sheet = wb.Sheets[KEY_SHEET];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  // Group row indices by path
  const byPath = new Map();
  rows.forEach((row, idx) => {
    const p = String(row[COL_PATH] || "").trim();
    if (!byPath.has(p)) byPath.set(p, []);
    byPath.get(p).push(idx);
  });

  // Assign 4D values
  for (const [pathName, idxList] of byPath) {
    if (DEPLOYMENT_PATHS.has(pathName)) {
      for (const i of idxList) rows[i][COL_4D] = "Deployment Support";
      continue;
    }

    // For paths 1..8 (and anything else non-deployment), distribute evenly.
    const rng = mulberry32(hash32(`4D::${pathName}`));
    const labels = evenlyDistribute(idxList.length, THREE_LABELS, rng);
    idxList.forEach((i, k) => {
      rows[i][COL_4D] = labels[k];
    });
  }

  // Rebuild sheet preserving original header order + 4D at the end
  const originalHeader = Object.keys(rows[0] || {});
  const header = originalHeader.includes(COL_4D)
    ? originalHeader
    : [...originalHeader, COL_4D];

  const newSheet = XLSX.utils.json_to_sheet(rows, { header });
  wb.Sheets[KEY_SHEET] = newSheet;

  return {
    totalRows: rows.length,
    counts: rows.reduce((acc, r) => {
      const v = r[COL_4D] || "";
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {}),
    byPath: Array.from(byPath.entries()).map(([p, arr]) => [p, arr.length]),
  };
}

function main() {
  if (!fs.existsSync(SOURCE_XLSX)) {
    throw new Error(`Source workbook not found: ${SOURCE_XLSX}`);
  }

  const buf = fs.readFileSync(SOURCE_XLSX);
  const wb = XLSX.read(buf, { type: "buffer", cellDates: true });

  const stats = updateWorkbook(wb);

  // Save back to the workspace-root file AND sync default.xlsx for seeding
  XLSX.writeFile(wb, SOURCE_XLSX);
  fs.mkdirSync(path.dirname(DEFAULT_XLSX), { recursive: true });
  XLSX.writeFile(wb, DEFAULT_XLSX);

  console.log("Done. Summary:");
  console.log("  Total rows:", stats.totalRows);
  console.log("  4D counts:", stats.counts);
  console.log("  Rows per path:");
  for (const [p, n] of stats.byPath) console.log(`    ${p}: ${n}`);
  console.log("Saved:");
  console.log("  -", SOURCE_XLSX);
  console.log("  -", DEFAULT_XLSX);
}

main();
