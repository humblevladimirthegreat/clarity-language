import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { ask } from "./ask.js";
import { conversationLog, formatLog, formatMatch, formatReadings, parseConversation, readingsJson } from "./cli.js";
import { readText } from "./read.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);
const read = (gloss: string) => readText(glossToAgeben(gloss, tables, index), tables);

describe("reading CLI formatting", () => {
  const readings = read("h-episode-event-ALLOW-said | [z-everything | g-dog] | v-walk | th-not");

  it("prints id, frames, order, claim", () => {
    const text = formatReadings(readings).join("\n");
    assert.match(text, /^t:0\.0$/m);
    assert.match(text, /^ {2}frame \S+ \S+ "/m);
    assert.match(text, /^ {2}order \S+ > \S+ \(rule\)$/m);
    assert.match(text, /^ {2}claim verb /m);
  });

  it("JSON has no cycles and words are position and text", () => {
    const parsed = JSON.parse(readingsJson(readings));
    const word = parsed[0].frames[0].words[0];
    assert.deepEqual(Object.keys(word).sort(), ["at", "text"]);
    assert.equal(typeof word.text, "string");
  });
});

describe("reading CLI: log and ask", () => {
  const fixtures = join(rootDir, "src", "interpret", "fixtures");
  const file = join(fixtures, "paid.txt");
  const query = readFileSync(join(fixtures, "paid-query.txt"), "utf8").trim();
  const run = (...args: string[]) => {
    const out = spawnSync("node", [join(rootDir, "scripts", "reading.mjs"), ...args], { encoding: "utf8", cwd: rootDir });
    return out;
  };

  it("parseConversation: Name: sets the speaker, which carries; comments and blanks are skipped", () => {
    const { turns } = parseConversation("# c\n\nA: x y\nz\nB: w\n");
    assert.deepEqual(
      turns.map((t) => `${t.speaker}/${t.line}/${t.text}`),
      ["A/3/x y", "A/4/z", "B/5/w"],
    );
    assert.equal(parseConversation("q").turns[0]!.speaker, "speaker");
  });

  it("log prints each turn with its speaker, gloss, and readings", () => {
    const text = formatLog(conversationLog(file, tables), tables).join("\n");
    assert.match(text, /^\[0\] Sam: /m);
    assert.match(text, /^\[1\] Lee: /m);
    assert.match(text, /^\[2\] Lee: /m);
    assert.match(text, /^ {2}gloss z-Alazun \| b-Azozon \| v-pay$/m);
    assert.match(text, /^ {4}claim verb /m);
  });

  it("ask prints matches with bound blanks, path, and both glosses; the reversed roles do not match", () => {
    const log = conversationLog(file, tables);
    const matches = ask(readText(query, tables, { text: "q" })[0]!, log, { lexicon: tables });
    const text = matches.flatMap((m) => formatMatch(m, query, tables)).join("\n");
    assert.equal(matches.length, 2);
    assert.match(text, /^match t:0\.0 \[0\] Sam$/m);
    assert.match(text, /^match t:0\.1 \[1\] Lee$/m);
    assert.match(text, /^ {2}bound z = /m);
    assert.match(text, /^ {2}path 1 /m);
    assert.match(text, /^ {2}query gloss y-question \| z-wh \| b-Azozon \| v-pay$/m);
    assert.match(text, /^ {2}sentence gloss z-Alazun \| b-Azozon \| v-pay$/m);
  });

  it("the commands run from the command line", () => {
    const logOut = run("log", file);
    assert.equal(logOut.status, 0, logOut.stderr);
    assert.match(logOut.stdout, /^\[0\] Sam: /m);
    const askOut = run("ask", file, query);
    assert.equal(askOut.status, 0, askOut.stderr);
    assert.match(askOut.stdout, /^match t:0\.0 \[0\] Sam$/m);
    assert.equal(JSON.parse(run("ask", "--json", file, query).stdout).length, 2);
    const none = run("ask", file, readFileSync(join(fixtures, "paid-query.txt"), "utf8").trim().replace("bazozon", "bahelan"));
    assert.equal(none.stdout.trim(), "no match");
  });
});

describe("reading CLI: solve and clashes", () => {
  const fixtures = join(rootDir, "src", "interpret", "fixtures");
  const dir = mkdtempSync(join(tmpdir(), "reading-solve-"));
  /** A solver fixture as a conversation file: its Ageben lines, one turn each. */
  const conversation = (name: string): string => {
    const lines = readFileSync(join(fixtures, `solve-${name}.txt`), "utf8").split("\n").filter((l) => l.trim() && !/^[@=#]/.test(l));
    const file = join(dir, `${name}.txt`);
    writeFileSync(file, lines.join("\n"));
    return file;
  };
  const worked = conversation("worked");
  const clash = conversation("clash");
  const run = (...args: string[]) => spawnSync("node", [join(rootDir, "scripts", "reading.mjs"), ...args], { encoding: "utf8", cwd: rootDir });

  it("solve: no with why, unknown without defaults, yes under them, and could-be", () => {
    const no = run("solve", worked, "yel zazozon vewobol.");
    assert.equal(no.status, 0, no.stderr);
    assert.match(no.stdout, /^verdict no$/m);
    assert.match(no.stdout, /^reply No\. \S+$/m);
    assert.match(no.stdout, /^why Because of t:0\.1, t:0\.2\.$/m);
    assert.match(no.stdout, /^ {2}t:0\.2 \[2\] speaker: zazozon /m);
    assert.match(run("solve", worked, "yel zahelan vewobol.").stdout, /^verdict unknown\nreply I can't say\. /m);
    const yes = run("solve", "--defaults", worked, "yel zahelan vewobol.").stdout;
    assert.match(yes, /^verdict yes$/m);
    assert.match(yes, /^switches defaults$/m);
    const json = JSON.parse(run("solve", "--possible", "--json", worked, "yel zahelan vewobol.").stdout);
    assert.equal(json.verdict, "yes");
    assert.equal(json.reply.shape, "yes");
  });

  it("clashes: each smallest clash with its readings, and the set to give up", () => {
    const out = run("clashes", "--give-up", clash);
    assert.equal(out.status, 0, out.stderr);
    assert.match(out.stdout, /^clash These cannot all hold: t:0\.0, t:0\.1, t:0\.2\.$/m);
    assert.match(out.stdout, /^clash These cannot all hold: t:0\.0, t:0\.3, t:0\.4\.$/m);
    assert.match(out.stdout, /^give up Giving up t:0\.0 resolves every clash\.$/m);
    assert.equal(run("clashes", worked).stdout.trim(), "no clash");
    assert.deepEqual(JSON.parse(run("clashes", "--json", "--give-up", clash).stdout).giveUp.giveUp, ["t:0.0"]);
  });
});
