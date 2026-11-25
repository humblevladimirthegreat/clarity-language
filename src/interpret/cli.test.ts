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
  readFileSync(join(rootDir, "data", "word-slots.csv"), "utf8"),
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

describe("reading CLI: solve, clashes and stands", () => {
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

  it("solve: a fill question goes to the fill job; each filler with its why; --possible brave, --closed nobody, --json the FillAnswer", () => {
    const fillLog = join(dir, "fill-log.txt");
    writeFileSync(fillLog, ["zazozon vowurol.", "zalazun vowurol.", "zahelan thomam vudurul."].join("\n"));
    const out = run("solve", fillLog, "yel zar vowurol.");
    assert.equal(out.status, 0, out.stderr);
    assert.match(out.stdout, /^verdict filled\nreply \S.* \S+$/m);
    assert.match(out.stdout, /^filler zazozon — why: \[0\] speaker: zazozon vowurol\.\nfiller zalazun — why: \[1\] speaker: zalazun vowurol\.$/m);
    assert.match(run("solve", fillLog, "yel zar vudurul.").stdout, /^verdict unknown$/m);
    assert.match(run("solve", "--possible", fillLog, "yel zar vudurul.").stdout, /^filler zahelan — why: \[2\] /m);
    assert.match(run("solve", "--closed", fillLog, "yel zar vezuvel.").stdout, /^verdict nobody\nswitches closedWorld$/m);
    const json = JSON.parse(run("solve", "--json", fillLog, "yel zer vowurol.").stdout);
    assert.deepEqual([json.verdict, json.fillers, json.because, json.reply.shape], ["yes", [], ["t:0.0", "t:0.1"], "yes"]);
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

  it("stands: each reading's label, the attacks, the extensions; --semantics", () => {
    const out = run("stands", clash);
    assert.equal(out.status, 0, out.stderr);
    assert.match(out.stdout, /^semantics grounded$/m);
    assert.match(out.stdout, /^undec t:0\.0 \[0\] speaker: zual /m);
    assert.match(out.stdout, /^in t:0\.2 \[2\] /m);
    assert.match(out.stdout, /^attack t:0\.1 -> t:0\.0$/m);
    const preferred = JSON.parse(run("stands", "--json", "--semantics", "preferred", clash).stdout);
    assert.equal(preferred.semantics, "preferred");
    assert.equal(preferred.extensions.length, 2);
    assert.notEqual(run("stands", "--semantics", "nope", clash).status, 0);
  });

  describe("probe", () => {
    // Merged, the three turns clash ({every bird flies, Alazun is a bird, Alazun doesn't fly}); split, neither case does.
    const file = join(dir, "probe.txt");
    writeFileSync(
      file,
      [
        "# first case: no separator",
        "zual gebezel vewobol.",
        "zalazun gebezel.",
        "? yel zalazun vewobol.",
        "?~ yel zalazun vewobol.",
        "--- alone",
        "Bo: zalazun vewobol vul.",
        "zqqq qq.",
        "? yel zalazun vewobol.",
        "--- merged",
        "zual gebezel vewobol.",
        "zalazun gebezel.",
        "zalazun vewobol vul.",
      ].join("\n"),
    );

    it("each case is its own log: no clash split, a clash merged; ? and ?~ questions; a bad turn stops nothing", () => {
      const out = run("probe", file);
      assert.equal(out.status, 0, out.stderr);
      const cases = out.stdout.split(/^(?====)/m);
      assert.equal(cases.length, 3);
      assert.match(cases[0]!, /^=== case 1 \(line 2\)\nno clash\n\? yel zalazun vewobol\. -> yes because t:0\.0 t:0\.1\n\?~ yel zalazun vewobol\. -> yes because t:0\.0 t:0\.1\n$/);
      assert.match(cases[1]!, /^=== alone \(line 6\)\nskipped line 8: zqqq qq\.: /);
      assert.match(cases[1]!, /^no clash$/m);
      assert.match(cases[1]!, /^\? yel zalazun vewobol\. -> no because t:0\.0$/m);
      assert.match(cases[2]!, /^clash t:0\.0 t:0\.1 t:0\.2 atom ewobo\(z\(alazu\)\)$/m);
      // --possible asks a plain `?` with couldBe.
      assert.match(run("probe", "--possible", file).stdout, /^\?~ yel zalazun vewobol\. -> no because t:0\.0$/m);
    });

    it("a fill question goes to the fill job: its fillers bracketed, ?~ brave", () => {
      const fillFile = join(dir, "probe-fill.txt");
      writeFileSync(fillFile, ["zazozon dodozel vayebel.", "zalazun dogozel vayebel.", "zahelan thomam vudurul.", "? yel zar dar vayebel.", "? yel zar vudurul.", "?~ yel zar vudurul."].join("\n"));
      const out = run("probe", fillFile).stdout;
      assert.match(out, /^\? yel zar dar vayebel\. -> filled \[zazozon, dodozel\] \[zalazun, dogozel\] because t:0\.0 t:0\.1$/m);
      assert.match(out, /^\? yel zar vudurul\. -> unknown$/m);
      assert.match(out, /^\?~ yel zar vudurul\. -> filled \[zahelan\] because t:0\.2$/m);
    });

    it("--program adds the case's own program lines; --program=full adds the generic rules too; --json prints one object per case", () => {
      const own = run("probe", "--program", file).stdout;
      assert.match(own, /^program:\n {2}% t:0\.0\n {2}on\("t:0\.0"\)\.$/m);
      assert.doesNotMatch(own, /Generic rules|^ {2}clash\(P\) :-/m);
      const full = run("probe", "--program=full", file).stdout;
      assert.match(full, /^program:\n {2}% Generic rules/m);
      assert.ok(full.split("\n").length > own.split("\n").length + 100);
      const lines = run("probe", "--json", file).stdout.trim().split("\n").map((l) => JSON.parse(l));
      assert.equal(lines.length, 3);
      assert.equal(lines[1].label, "alone");
      assert.equal(lines[1].rejected[0].line, 8);
      assert.equal(lines[0].questions[1].job, "couldBe");
      assert.deepEqual(lines[2].clashes.clashes[0].readings, ["t:0.0", "t:0.1", "t:0.2"]);
    });

    it("--case N or --case LABEL runs one case, keeping its number; an unknown case exits 1", () => {
      const second = run("probe", "--case", "2", file);
      assert.equal(second.status, 0, second.stderr);
      assert.equal(second.stdout.match(/^===/gm)?.length, 1);
      assert.match(second.stdout, /^=== alone \(line 6\)$/m);
      assert.equal(run("probe", "--case=alone", file).stdout, second.stdout);
      assert.match(run("probe", "--case", "1", file).stdout, /^=== case 1 /m);
      assert.equal(run("probe", "--case", "4", file).status, 1);
      assert.equal(run("probe", "--case", "nope", file).status, 1);
      assert.equal(run("probe", "--case", file).status, 1);
    });

    it("--terms a,b prints only program lines naming one of those predicates, and implies --program", () => {
      const out = run("probe", "--terms", "on,clash", "--case", "3", file).stdout;
      assert.match(out, /^program:\n(?: {2}.*\bon\(.*\n?)+$/m);
      const lines = out.split("\nprogram:\n")[1]!.split("\n").filter(Boolean);
      assert.ok(lines.length > 0 && lines.every((l) => /(?<!\w)(?:on|clash)\(/.test(l)));
      // generic lines are filtered out of the own program; --program=full lets a generic predicate through.
      assert.doesNotMatch(run("probe", "--terms=clash", "--case", "3", file).stdout, /clash\(P\)/);
      assert.match(run("probe", "--terms=clash", "--program=full", "--case", "3", file).stdout, /clash\(P\) :-/);
      assert.equal(run("probe", "--terms", "", file).status, 1);
    });

    it("a solve fixture is one case, its readings tagged with the fixture labels", () => {
      const out = run("probe", join(fixtures, "solve-clash.txt"));
      assert.equal(out.status, 0, out.stderr);
      assert.equal(out.stdout.match(/^===/gm)?.length, 1);
      assert.match(out.stdout, /^clash t:0\.0=s1 t:0\.1=s2 t:0\.2=s3 atom /m);
      assert.match(out.stdout, /^clash t:0\.0=s1 t:0\.3=s4 t:0\.4=s5 atom /m);
    });

    it("exits 1 only on a usage error or an unreadable file", () => {
      assert.equal(run("probe", join(dir, "missing.txt")).status, 1);
      assert.equal(run("probe").status, 1);
      assert.equal(run("probe", "--give-up", file).status, 1);
    });
  });
});
