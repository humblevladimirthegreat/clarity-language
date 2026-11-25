import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { advancedUnits, beginnerUnits, intermediateUnits, lessonPages, levelReviewPages } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { NOT_CORE_ROOTS } from "./core-vocabulary.js";
import {
  anchorCheckpoint,
  buildNotes,
  checkpointTag,
  closedEnglish,
  closedGloss,
  coveredByEndingNote,
  LEXICON_MODEL,
  LEXICAL_ENDING_FORMS,
  loadFlashcardInputs,
  NOTE_FIELDS,
  noteGuid,
  OVERLAY_FIELDS,
  OVERLAY_MODEL,
  packJson,
  releaseId,
  productionGlosses,
  SCALE_ENDING_KINDS,
  SET_FIELDS,
  SET_MODEL,
  type FlashcardNote,
  type FlashcardNotes,
} from "./flashcards.js";
import { buildPack, checkpointNotes, noteCards, packTsvs, unitDeckName } from "./flashcards-packs.js";
import { endingNoteKey, endingReading, SCALE_ANCHOR, SCALE_NOTE_KEY } from "./flashcards-endings.js";
import { overlayExamples, overlayRowKey } from "./flashcards-examples.js";
import { overlaySetNotes, setNoteKey, SET_MIN_MEMBERS } from "./flashcards-sets.js";
import { highlightExample, hostLine, slotNoteKey, slotReadings, slotTaughtByMForm, wordNoteGloss } from "./flashcards-overlays.js";
import { loadDefaultTables } from "./parse/index.js";
import { BANDS } from "./lint/learning-order.js";
import { morphGlossLine } from "./parse/morph-gloss.js";

const pages = lessonPages();
const inputs = loadFlashcardInputs(pages, levelReviewPages);
const tables = loadDefaultTables();
const started = performance.now();
const examples = overlayExamples(inputs.overlays, inputs, tables);
const elapsed = Math.round(performance.now() - started);
const notes = buildNotes(inputs, examples);
const rebuild = (published: typeof inputs.published) => buildNotes({ ...inputs, published }, examples);
const allNotes = (n: FlashcardNotes) => [...n.roots, ...n.compounds, ...n.closed, ...n.overlays, ...n.slots, ...n.sets, ...n.endings, ...n.names];

describe("buildNotes", () => {
  it("makes one note per published root, compound, and overlay sense form an ending note does not cover", () => {
    assert.equal(notes.roots.length, inputs.published.length);
    assert.equal(notes.compounds.length, inputs.compounds.length);
    const senseForms = new Set(inputs.overlays.filter((r) => !coveredByEndingNote(r)).map((r) => r.senseForm));
    assert.deepEqual(notes.overlays.map((n) => n.key).sort(), [...senseForms].sort());
    assert.ok(notes.overlays.every((n) => n.model === OVERLAY_MODEL && n.fields.form === n.key && !n.fields.slot_of));
    assert.ok(!notes.overlays.some((n) => n.key === "ubol" || n.key === "ubor"));
  });

  it("folds the rows of a sense form at its first checkpoint into one note, tagged with each slot", () => {
    const rows = inputs.overlays.filter((r) => r.senseForm === "unam");
    assert.ok(rows.length >= 2);
    const note = notes.overlays.find((n) => n.key === "unam")!;
    for (const { pos } of rows) assert.ok(note.tags.includes(`ageben::pos::${pos}`), pos);
    assert.ok(note.tags.includes("ageben::stage::beginner"));
    assert.ok(note.tags.includes(anchorCheckpoint(rows[0]!.anchor, inputs)!.tag));
    assert.equal(note.fields.definition, rows[0]!.definition);
    assert.equal(note.fields.readings, "");
    assert.equal(note.fields.mnemonic, rows[0]!.mnemonic);
    assert.equal(note.fields.link, "https://clarityconlang.com/grammar/sakes.html#word-shape");
    // A slot taught at a later checkpoint is not folded in: ezem on g comes after h and th.
    const ezem = notes.overlays.find((n) => n.key === "ezem")!;
    assert.deepEqual(ezem.tags.filter((t) => t.startsWith("ageben::pos::")), ["ageben::pos::h", "ageben::pos::th"]);
  });

  it("lists readings per slot where the folded rows' definitions differ", () => {
    const def = (form: string, pos: string) => inputs.overlays.find((r) => r.senseForm === form && r.pos === pos)!.definition;
    assert.equal(slotReadings([{ pos: "h", definition: "a" }, { pos: "th", definition: "b" }, { pos: "g", definition: "b" }]), '<div class="line"><span class="label">h</span>a</div><div class="line"><span class="label">th / g</span>b</div>');
    const ezem = notes.overlays.find((n) => n.key === "ezem")!;
    assert.ok(ezem.fields.readings.includes(def("ezem", "h")) && ezem.fields.readings.includes(def("ezem", "th")));
    const enam = notes.overlays.find((n) => n.key === "enam")!;
    assert.ok(enam.fields.readings.includes('<span class="label">h / g / w</span>'), enam.fields.readings);
  });

  it("highlights the overlay word in the example and carries the example's morph gloss", () => {
    for (const n of [...notes.overlays, ...notes.slots]) {
      const spans = n.fields.example.match(/<span class="overlay">[^<]+<\/span>/g) ?? [];
      assert.equal(spans.length, 1, `${n.key}: ${n.fields.example}`);
      assert.ok(n.fields.gloss.trim(), n.key);
      assert.match(n.fields.link, /^https:\/\/clarityconlang\.com\/grammar\/[a-z0-9-]+\.html#[a-z0-9-]+$/, n.key);
    }
    assert.equal(highlightExample("zazozon daledel van", new Set(["an@v"]), tables), 'zazozon daledel <span class="overlay">van</span>');
  });

  it("names the host root and its concrete sense; bare-vowel forms have no host line", () => {
    const una = inputs.published.find((r) => r.root === "una")!;
    assert.equal(notes.overlays.find((n) => n.key === "unam")!.fields.host, `una (${una.concrete})`);
    assert.equal(notes.overlays.find((n) => n.key === "an")!.fields.host, "");
    assert.equal(hostLine("an", inputs.published), "");
  });

  it("adds a slot note only at a later checkpoint that puts a known form in a new slot", () => {
    const index = new Map(inputs.checkpoints.map((c, i) => [checkpointTag(c.page, c.band), i]));
    const cpOf = (tags: readonly string[]) => index.get(tags.find((t) => t.startsWith("ageben::cp::"))!)!;
    const rowAt = (r: (typeof inputs.overlays)[number]) => index.get(anchorCheckpoint(r.anchor, inputs)!.tag)!;
    const posTags = (tags: readonly string[]) => tags.filter((t) => t.startsWith("ageben::pos::")).map((t) => t.slice("ageben::pos::".length));
    const rows = inputs.overlays.filter((r) => !coveredByEndingNote(r));
    assert.ok(notes.slots.length > 0);
    for (const n of notes.slots) {
      const word = notes.overlays.find((w) => w.key === n.fields.form);
      assert.ok(word, n.key);
      const at = cpOf(n.tags);
      assert.ok(at > cpOf(word.tags), `${n.key}: not after its word note`);
      assert.equal(n.key, slotNoteKey(n.fields.form, inputs.checkpoints[at]!.page));
      assert.equal(n.fields.slot_of, `${word.fields.form} · ${word.fields.definition}`);
      const known = new Set(rows.filter((r) => r.senseForm === n.fields.form && rowAt(r) < at).map((r) => r.pos));
      for (const pos of posTags(n.tags)) assert.ok(!known.has(pos), `${n.key}: ${pos} taught earlier`);
    }
    // Every new slot at a later checkpoint has its note, unless the ending set's -m form carries it.
    for (const r of rows) {
      const at = rowAt(r);
      const earlier = rows.filter((o) => o.senseForm === r.senseForm && rowAt(o) < at);
      if (earlier.length === 0 || earlier.some((o) => o.pos === r.pos) || slotTaughtByMForm(r, inputs.overlays, new Set(earlier.map((o) => o.gloss)))) continue;
      assert.ok(notes.slots.some((n) => n.fields.form === r.senseForm && cpOf(n.tags) === at && n.tags.includes(`ageben::pos::${r.pos}`)), `${r.senseForm}@${r.pos} ${r.anchor}`);
    }
    const ezem = notes.slots.find((n) => n.key === "ezem@more-hinges")!;
    assert.deepEqual(posTags(ezem.tags), ["g"]);
    const ezemG = inputs.overlays.filter((r) => r.senseForm === "ezem" && r.pos === "g");
    assert.equal(ezem.guid, noteGuid("overlay", "ezem@more-hinges", wordNoteGloss(ezemG)));
    assert.equal(ezem.fields.definition, ezemG[0]!.definition);
  });

  it("gives an ending set's new slot to its -m form only when the reading carries over", () => {
    const keys = new Set(notes.slots.map((n) => n.key));
    assert.ok(keys.has("omam@universality") && keys.has("evum@universality") && keys.has("ewem@same-role-words"));
    for (const key of ["omal@universality", "omar@universality", "eyur@universality", "eyul@universality", "evul@universality", "evur@universality"]) {
      assert.ok(!keys.has(key), key);
    }
    // ewel reads *like* in the cite slot, taught as *exactly-like*: its own slot note.
    const ewel = notes.slots.find((n) => n.key === "ewel@same-role-words");
    assert.ok(ewel);
    assert.deepEqual(ewel.tags.filter((t) => t.startsWith("ageben::pos::")), ["ageben::pos::cite"]);
    assert.equal(ewel.guid, noteGuid("overlay", "ewel@same-role-words", "like"));
    const set = [{ senseForm: "xam", pos: "w", kind: "may" as const }];
    const xal = (pos: string, kind: "may" | "notional", gloss = "X-find") => ({ senseForm: "xal", pos, kind, gloss });
    const taught = new Set(["X-find"]);
    assert.equal(slotTaughtByMForm(xal("w", "may"), set, taught), true);
    assert.equal(slotTaughtByMForm(xal("w", "may", "X-other"), set, taught), false);
    assert.equal(slotTaughtByMForm(xal("th", "may"), set, taught), false);
    assert.equal(slotTaughtByMForm(xal("w", "notional"), set, taught), false);
    assert.equal(slotTaughtByMForm({ ...xal("w", "may"), senseForm: "xam" }, set, taught), false);
  });

  it("orders overlay notes by checkpoint", () => {
    const order = new Map(inputs.checkpoints.map((c) => [checkpointTag(c.page, c.band), inputs.checkpoints.indexOf(c)]));
    const at = notes.overlays.map((n) => order.get(n.tags.find((t) => t.startsWith("ageben::cp::"))!)!);
    assert.deepEqual(at, [...at].sort((a, b) => a - b));
  });

  it("derives GUIDs from source, spelling and concrete gloss, not row order", () => {
    const reversed = rebuild([...inputs.published].reverse());
    const guid = new Map(reversed.roots.map((n) => [n.key, n.guid]));
    for (const n of notes.roots) assert.equal(guid.get(n.key), n.guid);
    for (const n of notes.roots) assert.equal(n.guid, noteGuid("root", n.key, n.fields.concrete));
    for (const n of notes.compounds) assert.equal(n.guid, noteGuid("compound", n.key, n.fields.concrete));
    assert.equal(notes.overlays.find((n) => n.key === "unam")!.guid, noteGuid("overlay", "unam", "autonomy"));
    const ezemGlosses = inputs.overlays.filter((r) => r.senseForm === "ezem" && r.pos !== "g").map((r) => r.gloss);
    assert.equal(notes.overlays.find((n) => n.key === "ezem")!.guid, noteGuid("overlay", "ezem", wordNoteGloss(ezemGlosses.map((gloss) => ({ gloss })))));
    assert.equal(wordNoteGloss([{ gloss: "b" }, { gloss: "a" }, { gloss: "b" }]), "a / b");
    const all = allNotes(notes).map((n) => n.guid);
    assert.equal(new Set(all).size, all.length);
  });

  it("keeps the GUID through an alias or mnemonic edit; a respelling or new gloss makes a new one", () => {
    const [a, b] = inputs.published;
    const edited = rebuild([{ ...a!, mnemonic: `${a!.mnemonic} x`, englishAliases: ["zz"] }, ...inputs.published.slice(1)]);
    assert.equal(edited.roots[0]!.guid, notes.roots[0]!.guid);
    // A retie hands row a the old spelling of row b: the note must not inherit b's history.
    const retied = rebuild([{ ...a!, root: b!.root }, ...inputs.published.slice(1)]);
    assert.notEqual(retied.roots[0]!.guid, notes.roots[1]!.guid);
    assert.notEqual(retied.roots[0]!.guid, notes.roots[0]!.guid);
    const reglossed = rebuild([{ ...a!, concrete: `${a!.concrete} x` }, ...inputs.published.slice(1)]);
    assert.notEqual(reglossed.roots[0]!.guid, notes.roots[0]!.guid);
  });

  it("tags every note with one release id that changes only when content changes", () => {
    const all = allNotes(notes);
    const id = releaseId(all);
    assert.match(id, /^[0-9a-f]{8}$/);
    for (const n of all) assert.equal(n.tags.filter((t) => t.startsWith("ageben::release::")).join(), `ageben::release::${id}`, n.key);
    const reversed = rebuild([...inputs.published].reverse());
    assert.equal(releaseId(allNotes(reversed)), id);
    assert.equal(releaseId(all.map((n) => ({ ...n, tags: [] }))), id);
    const [a] = inputs.published;
    const edited = rebuild([{ ...a!, mnemonic: `${a!.mnemonic} x` }, ...inputs.published.slice(1)]);
    assert.notEqual(releaseId(allNotes(edited)), id);
  });

  it("tags core words and overlays with the checkpoint that first drills them", () => {
    for (const n of [...notes.roots, ...notes.compounds]) {
      const cps = n.tags.filter((t) => t.startsWith("ageben::cp::"));
      if (!n.core) {
        assert.deepEqual(cps, [], n.key);
        continue;
      }
      const cp = inputs.checkpoints.find((c) => c.anchor === n.core)!;
      assert.deepEqual(cps, [`ageben::cp::${cp.page.replace(/\.md$/, "")}::${cp.band}`], n.key);
    }
    for (const n of [...notes.overlays, ...notes.slots, ...notes.sets, ...notes.endings, ...notes.names]) assert.equal(n.tags.filter((t) => t.startsWith("ageben::cp::")).length, 1, n.key);
    assert.ok(!notes.roots.some((n) => n.tags.some((t) => t.startsWith("ageben::core::"))));
  });

  it("shows a compound's parts with each root's concrete gloss", () => {
    const row = inputs.compounds.find((r) => inputs.published.some((p) => p.root === r.left) && inputs.published.some((p) => p.root === r.right))!;
    const gloss = (root: string) => inputs.published.find((p) => p.root === root)!.concrete;
    const note = notes.compounds.find((n) => n.key === row.stem)!;
    assert.equal(note.fields.parts, `${row.left} (${gloss(row.left)}) + ${row.join} + ${row.right} (${gloss(row.right)})`);
  });

  it("gives no two production fronts the same glosses", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const n of allNotes(notes)) {
      const key = productionGlosses(n);
      if (seen.has(key)) dupes.push(`${seen.get(key)} / ${n.key}: ${key}`);
      else seen.set(key, n.key);
    }
    assert.deepEqual(dupes, []);
  });
});

describe("closed-word notes", () => {
  it("maps every closed-word row to a checkpoint on its page, in its band", () => {
    const missing = inputs.closedWords.filter((r) => !anchorCheckpoint(r.anchor, inputs)).map((r) => `${r.form} ${r.anchor}`);
    assert.deepEqual(missing, []);
    for (const row of inputs.closedWords) {
      const cp = anchorCheckpoint(row.anchor, inputs)!;
      assert.equal(cp.page, row.anchor.split("#")[0]);
      assert.equal(cp.band, inputs.anchorBand(row.anchor));
    }
  });

  it("makes one Ageben lexicon note per row, tagged with its kind, band and checkpoint", () => {
    assert.equal(notes.closed.length, inputs.closedWords.length);
    for (const row of inputs.closedWords) {
      const note = notes.closed.find((n) => n.key === row.form && n.guid === noteGuid("closed", row.form, row.english))!;
      assert.ok(note, row.form);
      assert.equal(note.model, LEXICON_MODEL);
      assert.equal(note.fields.front, row.form);
      assert.equal(note.fields.kind, row.kind);
      const cp = anchorCheckpoint(row.anchor, inputs)!;
      assert.deepEqual(note.tags.slice(0, 4), ["ageben::closed", `ageben::closed::${row.kind}`, `ageben::stage::${cp.band}`, cp.tag]);
    }
  });

  it("renders the *…* markup as plain text, the starred words as the gloss", () => {
    assert.equal(closedEnglish("*one*, generic *you*, *people*"), "one, generic you, people");
    assert.equal(closedGloss("*one*, generic *you*, *people*"), "one, you, people");
    assert.ok(notes.closed.every((n) => !n.fields.abstract.includes("*") && n.fields.concrete));
  });

  it("orders closed words by checkpoint", () => {
    const order = new Map(inputs.checkpoints.map((c) => [checkpointTag(c.page, c.band), inputs.checkpoints.indexOf(c)]));
    const at = notes.closed.map((n) => order.get(n.tags.find((t) => t.startsWith("ageben::cp::"))!)!);
    assert.deepEqual(at, [...at].sort((a, b) => a - b));
  });
});

describe("set notes", () => {
  const cpOf = (tags: readonly string[]) => tags.find((t) => t.startsWith("ageben::cp::"))!;
  const membersOf = (text: string) => [...text.matchAll(/\{\{c\d+::<code>([^<]+)<\/code>\}\}/g)].map((m) => m[1]!);

  it("makes one cloze set note per kind with three or more word notes at one checkpoint", () => {
    const groups = new Map<string, string[]>();
    for (const n of notes.overlays) {
      if (SCALE_ENDING_KINDS.has(n.fields.kind) && !n.fields.form.endsWith("m")) continue;
      const key = setNoteKey(n.fields.kind, cpOf(n.tags).split("::")[2]!);
      groups.set(key, [...(groups.get(key) ?? []), n.fields.form]);
    }
    const expected = [...groups].filter(([, forms]) => forms.length >= SET_MIN_MEMBERS);
    assert.deepEqual(notes.sets.map((n) => [n.key, membersOf(n.fields.text)]).sort(), expected.sort());
    for (const n of notes.sets) {
      assert.equal(n.model, SET_MODEL);
      assert.equal(n.guid, noteGuid("set", n.key, ""));
      assert.equal(n.fields.mnemonic, "");
      assert.match(n.fields.link, /^https:\/\/clarityconlang\.com\/grammar\/[a-z-]+\.html#/);
    }
  });

  it("blanks each member with its English, as the design's phasal set", () => {
    const phasal = notes.sets.find((n) => n.key === "phasal@already-still-yet")!;
    assert.equal(
      phasal.fields.text,
      "{{c1::<code>avem</code>}} <i>already</i> · {{c2::<code>awum</code>}} <i>still</i> · {{c3::<code>elom</code>}} <i>not yet</i> · {{c4::<code>uvum</code>}} <i>no longer</i>",
    );
    assert.equal(phasal.fields.title, "Phasal words");
    // Lexical -l / -r forms of a scale-ending kind keep word notes but stay out of its set.
    assert.ok(notes.overlays.some((n) => n.key === "elol"));
  });

  it("tags a set note with its members' checkpoint and sorts it after them", () => {
    for (const set of notes.sets) {
      const members = membersOf(set.fields.text).map((f) => notes.overlays.find((n) => n.key === f)!);
      for (const m of members) assert.equal(cpOf(m.tags), cpOf(set.tags), `${set.key}: ${m.key}`);
      assert.ok(set.tags.includes(`ageben::overlay::${members[0]!.fields.kind}`));
    }
    const order = BANDS.flatMap((band) => buildPack(band, notes, inputs).decks.flatMap((d) => d.notes.map((n) => n.key)));
    for (const set of notes.sets) for (const f of membersOf(set.fields.text)) assert.ok(order.indexOf(f) < order.indexOf(set.key), set.key);
    assert.deepEqual(overlaySetNotes(inputs, notes.overlays).map((n) => n.key), notes.sets.map((n) => n.key));
  });
});

describe("ending notes", () => {
  const cpOf = (tags: readonly string[]) => tags.find((t) => t.startsWith("ageben::cp::"));
  const cloze = (l: string, m: string, r: string) =>
    `{{c1::<code>-l</code>}} <i>${l}</i> · {{c2::<code>-m</code>}} <i>${m}</i> · {{c3::<code>-r</code>}} <i>${r}</i>`;

  it("puts the scale note first, at sakes.md#beginner-practice, as an Ageben set note", () => {
    const scale = notes.endings[0]!;
    assert.equal(scale.key, SCALE_NOTE_KEY);
    assert.equal(scale.model, SET_MODEL);
    assert.equal(scale.guid, noteGuid("set", SCALE_NOTE_KEY, ""));
    assert.equal(cpOf(scale.tags), "ageben::cp::sakes::beginner");
    assert.equal(scale.fields.text, cloze("settled", "default", "passing"));
    assert.equal(scale.fields.link, "https://clarityconlang.com/grammar/knowing.html#settled-to-passing");
    assert.ok(inputs.pageText(SCALE_ANCHOR.split("#")[0]!).includes(`id="${SCALE_ANCHOR.split("#")[1]}"`));
  });

  it("gives each scale-ending kind one ending note, at its first -l / -r checkpoint", () => {
    const order = new Map(inputs.checkpoints.map((c) => [checkpointTag(c.page, c.band), inputs.checkpoints.indexOf(c)]));
    assert.deepEqual(notes.endings.slice(1).map((n) => n.key).sort(), [...SCALE_ENDING_KINDS].map(endingNoteKey).sort());
    for (const kind of SCALE_ENDING_KINDS) {
      const note = notes.endings.find((n) => n.key === endingNoteKey(kind))!;
      const first = Math.min(...inputs.overlays.filter((r) => r.kind === kind && coveredByEndingNote(r)).map((r) => order.get(anchorCheckpoint(r.anchor, inputs)!.tag)!));
      assert.equal(order.get(cpOf(note.tags)!), first, kind);
      assert.ok(note.tags.includes(`ageben::overlay::${kind}`), kind);
      assert.equal(note.guid, noteGuid("set", endingNoteKey(kind), ""));
      assert.equal(new Set([...note.fields.text.matchAll(/\{\{c(\d+)::/g)].map((m) => m[1])).size, 3, kind);
    }
    const at = notes.endings.map((n) => order.get(cpOf(n.tags)!)!);
    assert.deepEqual(at, [...at].sort((a, b) => a - b));
    const evidential = notes.endings.find((n) => n.key === endingNoteKey("evidential"))!;
    assert.ok(evidential.fields.text.startsWith(cloze("strong", "default", "weak")));
    assert.equal(cpOf(evidential.tags), "ageben::cp::evidentiality::intermediate");
    // Lexical endings keep their word notes and stay off the ending note's forms.
    const phasal = notes.endings.find((n) => n.key === endingNoteKey("phasal"))!;
    assert.ok(phasal.fields.text.startsWith(cloze("lasting", "default", "for now")));
    assert.ok(!phasal.fields.text.includes("elom"));
    for (const form of LEXICAL_ENDING_FORMS) assert.ok(notes.overlays.some((n) => n.key === form), form);
  });

  it("reads an ending off a gloss's suffix", () => {
    assert.equal(endingReading("MEMORY.strong"), "strong");
    assert.equal(endingReading("already.for-now"), "for now");
    assert.equal(endingReading("WANT-passing"), "passing");
    assert.equal(endingReading("MEMORY"), undefined);
    assert.equal(endingReading("not-yet"), undefined);
  });
});

describe("packs", () => {
  const cpOf = (n: FlashcardNote) => n.tags.find((t) => t.startsWith("ageben::cp::"));
  const bandPacks = BANDS.map((band) => buildPack(band, notes, inputs));
  const grammarNotes = [...notes.closed, ...notes.overlays, ...notes.slots, ...notes.sets, ...notes.endings, ...notes.names];
  const coreNotes = [...notes.roots, ...notes.compounds].filter((n) => n.core);

  it("puts every core word, closed word and grammar note in one band pack, the band of its checkpoint", () => {
    const packed = bandPacks.flatMap((p) => p.decks.flatMap((d) => d.notes.map((n) => ({ band: p.id, n }))));
    assert.deepEqual(packed.map((p) => p.n.guid).sort(), [...coreNotes, ...grammarNotes].map((n) => n.guid).sort());
    const bandOf = new Map(inputs.checkpoints.map((c) => [c.anchor, c.band]));
    for (const { band, n } of packed) {
      if (n.core) assert.equal(bandOf.get(n.core), band, n.key);
      else assert.ok(cpOf(n)?.endsWith(`::${band}`), `${n.key} ${cpOf(n)}`);
    }
    assert.ok(!packed.some((p) => NOT_CORE_ROOTS.has(p.n.key) && p.n.source === "root"));
  });

  it("names one subdeck per sidebar unit with notes, numbered as in the band, in sidebar order", () => {
    const names = { beginner: "1 Beginner", intermediate: "2 Intermediate", advanced: "3 Advanced" };
    for (const [b, units] of [["beginner", beginnerUnits], ["intermediate", intermediateUnits], ["advanced", advancedUnits]] as const) {
      const pack = buildPack(b, notes, inputs);
      const expected = units.map((u, i) => `Ageben::${names[b]}::${String(i + 1).padStart(2, "0")} ${u.text}`);
      const got = pack.decks.map((d) => d.name);
      assert.deepEqual(got, expected.filter((name) => got.includes(name)));
      assert.ok(got.length > 0, b);
      for (const d of pack.decks) assert.ok(d.notes.length > 0, d.name);
    }
    assert.equal(unitDeckName({ band: "beginner", number: 4, title: "Why and what for", pages: [] }), "Ageben::1 Beginner::04 Why and what for");
  });

  it("keeps checkpoint order inside a unit: each subdeck runs through its checkpoints in path order", () => {
    const at = new Map(inputs.checkpoints.map((c, i) => [checkpointTag(c.page, c.band), i]));
    const coreAt = new Map(inputs.checkpoints.map((c, i) => [c.anchor, i]));
    for (const pack of bandPacks) {
      const order = pack.decks.flatMap((d) => d.notes.map((n) => (n.core ? coreAt.get(n.core)! : at.get(cpOf(n)!)!)));
      assert.deepEqual(order, [...order].sort((a, b) => a - b), pack.id);
    }
  });

  it("orders a checkpoint: core words, closed words, then per overlay kind its word, slot, ending and set notes", () => {
    const rank = (n: FlashcardNote) =>
      n.source === "root" || n.source === "compound" ? 0
      : n.source === "closed" ? 1
      : n.model === OVERLAY_MODEL ? (n.fields.slot_of ? 3 : 2)
      : n.key.includes("@") ? 5 : 4;
    const kindOf = (n: FlashcardNote) => (n.model === OVERLAY_MODEL ? n.fields.kind : n.key === SCALE_NOTE_KEY ? "sake" : n.tags.includes("ageben::names") ? "names" : n.tags.find((t) => t.startsWith("ageben::overlay::"))!.slice(17));
    let checked = 0;
    for (const checkpoint of inputs.checkpoints) {
      const here = checkpointNotes(notes, checkpoint);
      const lexical = here.filter((n) => rank(n) <= 1).map(rank);
      assert.deepEqual(lexical, [...lexical].sort(), checkpoint.anchor);
      const grammar = here.slice(lexical.length);
      assert.ok(grammar.every((n) => rank(n) >= 2), checkpoint.anchor);
      const runs: { kind: string; ranks: number[] }[] = [];
      for (const n of grammar) {
        if (runs.at(-1)?.kind === kindOf(n)) runs.at(-1)!.ranks.push(rank(n));
        else runs.push({ kind: kindOf(n), ranks: [rank(n)] });
      }
      assert.equal(new Set(runs.map((r) => r.kind)).size, runs.length, `${checkpoint.anchor}: a kind splits`);
      for (const r of runs) assert.deepEqual(r.ranks, [...r.ranks].sort(), `${checkpoint.anchor} ${r.kind}`);
      if (runs.length > 1 || lexical.length > 0) checked++;
    }
    assert.ok(checked > 10);
    // The scale note sits with the sake kind at sakes.md, before the sake set note if there is one.
    const sakes = checkpointNotes(notes, inputs.checkpoints.find((c) => c.anchor === "sakes.md#beginner-practice")!);
    const scale = sakes.findIndex((n) => n.key === SCALE_NOTE_KEY);
    assert.ok(scale > 0 && kindOf(sakes[scale - 1]!) === "sake", sakes.map((n) => n.key).join(" "));
  });

  it("digit-syllable and letter-name notes: one cloze set per group, one blank per row, at the row's checkpoint", () => {
    assert.deepEqual(notes.names.map((n) => n.key), ["names:digits", "names:digit-letters", "names:other-letters", "names:vowels"]);
    for (const note of notes.names) {
      const group = note.key.slice("names:".length);
      const rows = inputs.soundNames.filter((r) => r.group === group);
      assert.equal(noteCards(note), rows.length, note.key);
      assert.equal(note.tags.filter((t) => t.startsWith("ageben::cp::")).length, 1, note.key);
    }
    const digits = notes.names[0]!;
    assert.equal(digits.fields.text.split(" · ")[0], "{{c1::<code>ba</code>}} 1");
    assert.ok(checkpointNotes(notes, inputs.checkpoints.find((c) => c.anchor === "numbers.md#beginner-practice")!).includes(digits));
    const letters = notes.names.slice(1);
    const intermediate = checkpointNotes(notes, inputs.checkpoints.find((c) => c.anchor === "proper-names.md#intermediate-practice")!);
    for (const n of letters) assert.ok(intermediate.includes(n), n.key);
  });

  it("no checkpoint adds more than 45 new cards", () => {
    const LIMIT = 45;
    const over = inputs.checkpoints
      .filter((c) => !c.review)
      .map((c) => ({ anchor: c.anchor, cards: checkpointNotes(notes, c).reduce((sum, n) => sum + noteCards(n), 0) }))
      .filter((c) => c.cards > LIMIT)
      .map((c) => `${c.anchor}: ${c.cards}`);
    assert.deepEqual(over, [], `checkpoints over ${LIMIT} new cards`);
  });

  it("Everything: all roots, compounds, closed words and overlay word notes, one deck per source", () => {
    const decks = buildPack("everything", notes, inputs).decks;
    assert.deepEqual(decks.map((d) => [d.name, d.notes.length]), [
      ["Ageben::Everything::Roots", inputs.published.length],
      ["Ageben::Everything::Compounds", inputs.compounds.length],
      ["Ageben::Everything::Closed", inputs.closedWords.length],
      ["Ageben::Everything::Overlays", notes.overlays.length],
    ]);
    assert.deepEqual(packJson({ id: "everything", decks }).modelFields, { [OVERLAY_MODEL]: OVERLAY_FIELDS });
  });

  it("ships every card of every Ageben pack suspended", () => {
    for (const pack of bandPacks) assert.equal(packJson(pack).suspend, true, pack.id);
  });

  it("names each non-lexicon note type in the pack JSON, with its field order", () => {
    const json = packJson(bandPacks[0]!);
    assert.deepEqual(json.modelFields, { [OVERLAY_MODEL]: OVERLAY_FIELDS, [SET_MODEL]: SET_FIELDS });
    for (const n of json.decks.flatMap((d) => d.notes)) {
      const fields = n.model === OVERLAY_MODEL ? OVERLAY_FIELDS : n.model === SET_MODEL ? SET_FIELDS : json.fields;
      assert.equal(n.fields.length, fields.length, n.guid);
    }
  });

  it("writes one TSV per note type, each with its own header and one line per note", () => {
    const pack = bandPacks[0]!;
    const tsvs = packTsvs(pack);
    assert.deepEqual(tsvs.map((t) => [t.model, t.suffix]), [[LEXICON_MODEL, ""], [OVERLAY_MODEL, "-overlay"], [SET_MODEL, "-set"]]);
    for (const [i, fields] of [NOTE_FIELDS, OVERLAY_FIELDS, SET_FIELDS].entries()) {
      const lines = tsvs[i]!.text.trimEnd().split("\n");
      const model = tsvs[i]!.model;
      assert.ok(lines.includes(`#notetype:${model}`));
      assert.ok(lines.includes(`#html:${model !== LEXICON_MODEL}`));
      const body = lines.filter((l) => !l.startsWith("#"));
      assert.equal(body.length, pack.decks.flatMap((d) => d.notes).filter((n) => n.model === model).length, model);
      assert.ok(body.every((l) => l.split("\t").length === fields.length + 3), model);
    }
    assert.deepEqual(packTsvs(buildPack("everything", notes, inputs)).map((t) => t.suffix), ["", "-overlay"]);
  });

  it("counts cards per note: two for lexicon and overlay notes, one per cloze for set notes", () => {
    const phasal = notes.sets.find((n) => n.key === "phasal@already-still-yet")!;
    assert.equal(noteCards(phasal), 4);
    assert.equal(noteCards(notes.overlays[0]!), 2);
    assert.equal(noteCards(notes.roots[0]!), 2);
  });
});

describe("anchorCheckpoint", () => {
  it("maps every overlay row's anchor to a checkpoint on its page, in its band", () => {
    const missing = inputs.overlays.filter((r) => !anchorCheckpoint(r.anchor, inputs)).map((r) => `${r.senseForm} ${r.anchor}`);
    assert.deepEqual(missing, []);
    for (const row of inputs.overlays) {
      const cp = anchorCheckpoint(row.anchor, inputs)!;
      assert.equal(cp.page, row.anchor.split("#")[0]);
      assert.equal(cp.band, inputs.anchorBand(row.anchor));
      assert.equal(cp.tag, `ageben::cp::${cp.page.replace(/\.md$/, "")}::${cp.band}`);
      assert.ok(inputs.checkpoints.some((c) => c.anchor === `${cp.page}#${cp.id}` && !c.review));
    }
  });

  it("maps a checkpoint heading to itself and an unknown anchor to nothing", () => {
    const cp = inputs.checkpoints.find((c) => !c.review)!;
    assert.equal(anchorCheckpoint(cp.anchor, inputs)?.anchor, cp.anchor);
    assert.equal(anchorCheckpoint("clause.md#no-such-section", inputs), undefined);
  });
});

describe("overlayExamples", () => {
  it("gives every overlay row an example, except the -l / -r forms an ending note covers", (t) => {
    t.diagnostic(`overlayExamples: ${inputs.overlays.length} rows in ${elapsed} ms`);
    const missing = inputs.overlays
      .filter((row) => !coveredByEndingNote(row) && !examples.has(overlayRowKey(row)))
      .map((row) => overlayRowKey(row));
    assert.deepEqual(missing, [], `overlay rows with no example (sense_form@pos anchor):\n${missing.join("\n")}`);
  });

  it("exempts only scale-ending -l / -r forms, never the lexical ones", () => {
    assert.ok(coveredByEndingNote({ kind: "evidential", senseForm: "ubol" }));
    assert.ok(!coveredByEndingNote({ kind: "evidential", senseForm: "ubom" }));
    assert.ok(!coveredByEndingNote({ kind: "may", senseForm: "omal" }));
    for (const form of LEXICAL_ENDING_FORMS) assert.ok(!coveredByEndingNote({ kind: "phasal", senseForm: form }), form);
  });

  it("glosses every example with the page glosser, naming the overlay's slot word", () => {
    const unnamed: string[] = [];
    for (const row of inputs.overlays) {
      const example = examples.get(overlayRowKey(row));
      if (!example) continue;
      assert.ok(example.gloss.trim(), overlayRowKey(row));
      assert.equal(example.gloss, morphGlossLine(example.text, tables, { strict: true }));
      // The slot word's gloss: the row's gloss, or the parser's label for it, which the definition names.
      const labels = example.gloss.split("|").map((w) => w.replace(/[[\]{}]/g, "").trim().replace(/^[a-z]+-/, ""));
      if (!example.gloss.includes(row.gloss) && !labels.some((l) => l && row.definition.includes(l))) unnamed.push(`${overlayRowKey(row)}: ${example.gloss}`);
    }
    assert.deepEqual(unnamed, []);
  });

  // A small page: a short example outside the anchor section, a longer one inside it, and a lone citation.
  const page = [
    "# Page",
    "",
    "## Elsewhere {#elsewhere}",
    "",
    "Short: `zazozon thomam`.",
    "",
    "## Taught {#taught}",
    "",
    "Citation: `thomam`. Sentence: `zalazun thomam dahelan vudurul.`",
    "",
    "## Cited only {#cited}",
    "",
    "Citation: `thomam`.",
    "",
    "### Practice {#practice}",
    "",
  ].join("\n");
  const sectionOf = (id: string) => {
    const offset = page.indexOf(`{#${id}}`);
    const next = page.indexOf("\n#", offset);
    return { band: "beginner" as const, line: page.slice(0, offset).split("\n").length, offset: page.lastIndexOf("\n", offset) + 1, end: next < 0 ? page.length : next + 1 };
  };
  const fake = {
    checkpoints: [{ anchor: "p.md#practice", page: "p.md", band: "beginner", line: page.split("\n").indexOf("### Practice {#practice}") + 1, review: false }] as unknown as typeof inputs.checkpoints,
    anchorSection: (anchor: string) => sectionOf(anchor.split("#")[1]!),
    pageText: () => page,
  };
  const may = inputs.overlays.find((r) => r.senseForm === "omam" && r.pos === "th")!;

  it("prefers an example in the anchor section over a shorter one elsewhere on the page", () => {
    const example = overlayExamples([{ ...may, anchor: "p.md#taught" }], fake, tables).get(overlayRowKey({ ...may, anchor: "p.md#taught" }));
    assert.equal(example?.text, "zalazun thomam dahelan vudurul.");
    assert.equal(example?.from, "section");
  });

  it("never takes a lone citation; falls back to the rest of the page", () => {
    const row = { ...may, anchor: "p.md#cited" };
    const example = overlayExamples([row], fake, tables).get(overlayRowKey(row));
    assert.equal(example?.text, "zazozon thomam");
    assert.equal(example?.from, "page");
  });
});
