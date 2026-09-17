import { readFileSync, writeFileSync } from "node:fs";
const rewrites = JSON.parse(
  readFileSync(new URL("./abstract-sense-rewrites.json", import.meta.url), "utf8"),
);

function parseCsv(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  const rows = lines.map((line) => {
    const out = [];
    let cur = "";
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        i++;
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            cur += '"';
            i += 2;
            continue;
          }
          if (line[i] === '"') {
            i++;
            break;
          }
          cur += line[i++];
        }
        continue;
      }
      if (line[i] === ",") {
        out.push(cur);
        cur = "";
        i++;
        continue;
      }
      cur += line[i++];
    }
    out.push(cur);
    return out;
  });
  return rows;
}

function esc(field) {
  if (/[",\n]/.test(field)) return `"${field.replaceAll('"', '""')}"`;
  return field;
}

const pubPath = new URL("../../data/lexicon-published.csv", import.meta.url);
const rows = parseCsv(readFileSync(pubPath, "utf8"));
const header = rows[0];
const litIdx = header.indexOf("literal") >= 0 ? header.indexOf("literal") : header.indexOf("concrete");
const rootIdx = header.indexOf("clarity");
const metIdx =
  header.indexOf("metaphorical") >= 0 ? header.indexOf("metaphorical") : header.indexOf("abstract");
const mneIdx = header.indexOf("mnemonic");

header[litIdx] = "concrete";
header[metIdx] = "abstract";

let changed = 0;
let skippedDemonym = 0;
for (const row of rows.slice(1)) {
  const root = row[rootIdx];
  const mnemonic = row[mneIdx] ?? "";
  if (/people are/i.test(mnemonic)) {
    skippedDemonym++;
    continue;
  }
  const spec = rewrites[root];
  if (!spec) continue;
  const [abstract, newMnemonic] = spec;
  if ((row[metIdx] ?? "") === abstract) continue;
  row[metIdx] = abstract;
  if (newMnemonic) row[mneIdx] = newMnemonic;
  changed++;
}

writeFileSync(pubPath, rows.map((r) => r.map(esc).join(",")).join("\n") + "\n");

const cmpPath = new URL("../../data/lexicon-compounds.csv", import.meta.url);
const cRows = parseCsv(readFileSync(cmpPath, "utf8"));
const ch = cRows[0];
const cLit = ch.indexOf("literal") >= 0 ? ch.indexOf("literal") : ch.indexOf("concrete");
const cMet = ch.indexOf("metaphorical") >= 0 ? ch.indexOf("metaphorical") : ch.indexOf("abstract");
const cMne = ch.indexOf("mnemonic");
ch[cLit] = "concrete";
ch[cMet] = "abstract";
const compoundByStem = {
  ohohulovowe: [
    "forcing",
    "house in the flower field grows plants under glass; forcing is heat-driven growth you cannot see as a room",
  ],
  eberelonogo: [
    "allegiance",
    "person in the bond field is a friend; allegiance is the unobservable sidedness",
  ],
};
for (const row of cRows.slice(1)) {
  const spec = compoundByStem[row[1]];
  if (!spec) continue;
  row[cMet] = spec[0];
  row[cMne] = spec[1];
}
writeFileSync(cmpPath, cRows.map((r) => r.map(esc).join(",")).join("\n") + "\n");

console.log(`published abstract rewrites: ${changed}; demonyms left untouched: ${skippedDemonym}`);
