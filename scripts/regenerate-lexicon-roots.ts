/**
 * Reassign overlay/pronoun host roots from English literals, then retie overlay
 * sense-forms to those published roots. Join-series overlays (`an`, `on`, …) stay.
 *
 * Run: npx tsx scripts/regenerate-lexicon-roots.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { escapeCsvField, parseCsv } from "../src/csv.js";
import { parseOverlayCsv, senseFormRoot } from "../src/lexicon-search.js";
import { toUniqueClarityWord } from "../src/word-converter.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");
const overlayPath = join(rootDir, "data", "lexicon-overlays.csv");

const JOIN_SENSE_FORMS = new Set([
  "an",
  "on",
  "aon",
  "un",
  "uan",
  "uon",
  "en",
  "aen",
  "oen",
  "uen",
]);

const PRONOUN_ROOTS = new Set(["umogo", "ehado", "ana", "enu", "odo"]);

function serializeCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h] ?? "")).join(",")),
  ];
  return `${lines.join("\n")}\n`;
}

function main(): void {
  const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
  const { headers, rows } = parseCsv(readFileSync(publishedPath, "utf8"));

  const byEmoji = new Map<string, Record<string, string>>();
  for (const row of rows) {
    if (row.emoji) {
      byEmoji.set(row.emoji, row);
    }
  }

  const hostRows = new Map<string, Record<string, string>>();
  for (const overlay of overlays) {
    if (JOIN_SENSE_FORMS.has(overlay.senseForm)) {
      continue;
    }
    if (!overlay.emoji) {
      continue;
    }
    const published = byEmoji.get(overlay.emoji);
    if (published) {
      hostRows.set(published.emoji, published);
    }
  }
  for (const emoji of ["🎤", "🎧", "🤝", "😐", "🤤"]) {
    const published = byEmoji.get(emoji);
    if (published) {
      hostRows.set(emoji, published);
    }
  }

  const used = new Set<string>();
  for (const row of rows) {
    const root = (row.clarity ?? "").trim();
    if (root && ![...hostRows.values()].includes(row)) {
      used.add(root);
    }
  }

  const oldToNew = new Map<string, string>();
  for (const row of hostRows.values()) {
    const oldRoot = (row.clarity ?? "").trim();
    const neu = toUniqueClarityWord((row.literal ?? "").trim(), used);
    row.clarity = neu;
    oldToNew.set(oldRoot, neu);
    console.log(`${oldRoot === neu ? "KEEP" : "CHG "} ${row.literal} ${oldRoot} -> ${neu}`);
  }

  for (const overlay of overlays) {
    if (JOIN_SENSE_FORMS.has(overlay.senseForm)) {
      continue;
    }
    if (!overlay.emoji) {
      continue;
    }
    const published = byEmoji.get(overlay.emoji);
    if (!published) {
      continue;
    }
    const newRoot = published.clarity;
    let oldRoot: string | null = null;
    for (const [old, neu] of oldToNew) {
      if (neu === newRoot) {
        oldRoot = old;
        break;
      }
    }
    if (oldRoot && overlay.senseForm.startsWith(oldRoot) && oldRoot.length >= 3) {
      overlay.senseForm = newRoot + overlay.senseForm.slice(oldRoot.length);
    } else {
      const ending = overlay.senseForm.match(/[lmnr]$/)?.[0] ?? "";
      const extra = overlay.senseForm.includes("x") ? overlay.senseForm.slice(overlay.senseForm.indexOf("x")) : ending;
      overlay.senseForm = extra.startsWith("x") ? newRoot + extra : newRoot + ending;
    }
  }

  const overlayHeaders = ["sense_form", "pos", "emoji", "definition", "mnemonic"];
  writeFileSync(publishedPath, serializeCsv(headers, rows));
  writeFileSync(
    overlayPath,
    serializeCsv(
      overlayHeaders,
      overlays.map((o) => ({
        sense_form: o.senseForm,
        pos: o.pos,
        emoji: o.emoji,
        definition: o.definition,
        mnemonic: o.mnemonic,
      })),
    ),
  );

  console.log(`Host map (${oldToNew.size} changes):`);
  for (const [oldRoot, neu] of [...oldToNew.entries()].sort((a, b) => b[0].length - a[0].length)) {
    console.log(`  ${oldRoot} -> ${neu}`);
  }
}

main();
