"""Import flashcard packs into a throwaway Anki collection and check that Anki accepts them.

Run through npm run flashcards; by hand: .venv/bin/python scripts/flashcards-check.py <pack.json> [...]
(each <pack.json> sits beside its <pack.apkg>).

Uses Anki's own backend (the `anki` package from requirements.txt), so it checks what a learner's
import does, with "Import any learning progress" ticked (`with_scheduling`), as the learner is told:
the note type arrives, nothing conflicts, overlapping packs share notes, cards arrive suspended where
the pack JSON says `suspend` and unsuspended elsewhere, new cards come in pack order, every card
renders a non-blank question and answer (a cloze card with a blank), and a second import adds
nothing. For the Claritish pack and for the Ageben packs together it then imports a build with one
note dropped and checks that the release search finds exactly that note, and that a card the learner
unsuspended and one they reviewed keep their state through both re-imports.
"""

import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile

from anki.collection import Collection, ImportAnkiPackageOptions, ImportAnkiPackageRequest
from anki.import_export_pb2 import ImportAnkiPackageUpdateCondition

IF_NEWER = ImportAnkiPackageUpdateCondition.IMPORT_ANKI_PACKAGE_UPDATE_CONDITION_IF_NEWER
ALWAYS = ImportAnkiPackageUpdateCondition.IMPORT_ANKI_PACKAGE_UPDATE_CONDITION_ALWAYS

# Cards per note, by the note's `model` (its own, else the pack's; flashcards-package.py builds the
# templates). An Ageben set note is a cloze: one card per distinct cloze number in its text.
TEMPLATES = {"Ageben lexicon": 2, "Claritish": 1, "Ageben overlay": 2, "Ageben set": None}
CLOZE_MODELS = {"Ageben set"}
CLOZE = re.compile(r"\{\{c(\d+)::")
# Release tag prefix and top deck, by family: a pack is Claritish by its note type, else Ageben.
FAMILIES = {"Claritish": ("claritish::release::", "Claritish"), "Ageben": ("ageben::release::", "Ageben")}
SUSPENDED = -1


def cards_of(model: str, fields: list[str]) -> int:
    per_note = TEMPLATES[model]
    if per_note is not None:
        return per_note
    return len({m.group(1) for f in fields for m in CLOZE.finditer(f)})


def visible(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<style>.*?</style>|<[^>]+>", " ", html, flags=re.S)).strip()


def release_id(decks: list[dict]) -> str:
    """A hash of the note list without tags. For Claritish it is the id src/flashcards-claritish.ts
    computes; for Ageben it only needs to differ from the build's own id."""
    body = [[d["name"], d["id"], [[n["guid"], n["fields"]] for n in d["notes"]]] for d in decks]
    text = json.dumps(body, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:8]


def drop_one(paths: list[str], prefix: str, keep: set[str], work: str) -> tuple[list[str], str, str]:
    """Write and package copies of one family's packs with one note dropped from every pack that holds
    it and the release tags recomputed over all of them, as the next release would ship. The dropped
    note is the last one of the first pack's largest deck that is not in `keep`. Returns the copies'
    JSON paths, the dropped GUID, and the new release id."""
    packs = []
    for path in paths:
        with open(path, encoding="utf-8") as f:
            packs.append(json.load(f))
    deck = max(packs[0]["decks"], key=lambda d: len(d["notes"]))
    dropped = next(n["guid"] for n in reversed(deck["notes"]) if n["guid"] not in keep)
    for pack in packs:
        for d in pack["decks"]:
            d["notes"] = [n for n in d["notes"] if n["guid"] != dropped]
    rid = release_id([d for pack in packs for d in pack["decks"]])
    script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "flashcards-package.py")
    outs = []
    for path, pack in zip(paths, packs):
        for d in pack["decks"]:
            for n in d["notes"]:
                n["tags"] = [t for t in n["tags"] if not t.startswith(prefix)] + [prefix + rid]
        out = os.path.join(work, "dropped-" + os.path.basename(path))
        with open(out, "w", encoding="utf-8") as f:
            json.dump(pack, f, ensure_ascii=False)
        subprocess.run([sys.executable, script, out, re.sub(r"\.json$", ".apkg", out)], check=True)
        outs.append(out)
    return outs, dropped, rid


def main() -> None:
    paths = sys.argv[1:]
    if not paths:
        sys.exit("usage: flashcards-check.py <pack.json> [...]")
    problems: list[str] = []
    # GUID -> cards, by note type; a note shared by overlapping packs counts once.
    guids: dict[str, dict[str, int]] = {model: {} for model in TEMPLATES}
    decks: set[str] = set()
    packs: dict[str, dict] = {}
    families: dict[str, list[str]] = {}
    for path in paths:
        with open(path, encoding="utf-8") as f:
            pack = packs[path] = json.load(f)
        if pack.get("model") not in TEMPLATES:
            sys.exit(f"{path}: unknown note type {pack.get('model')!r}")
        families.setdefault("Claritish" if pack["model"] == "Claritish" else "Ageben", []).append(path)
        for d in pack["decks"]:
            decks.add(d["name"])
            for n in d["notes"]:
                model = n.get("model", pack["model"])
                if model not in TEMPLATES:
                    sys.exit(f"{path}: note {n['guid']}: unknown note type {model!r}")
                guids[model][n["guid"]] = cards_of(model, n["fields"])
    notes = sum(len(g) for g in guids.values())
    want = {m: sum(g.values()) for m, g in guids.items()}
    want_cards = sum(want.values())

    with tempfile.TemporaryDirectory() as work:
        col = Collection(os.path.join(work, "check.anki2"))

        def load(path: str, again: bool, update=IF_NEWER) -> None:
            apkg = re.sub(r"\.json$", ".apkg", path)
            options = ImportAnkiPackageOptions(update_notes=update, update_notetypes=update, with_scheduling=True)
            log = col.import_anki_package(ImportAnkiPackageRequest(package_path=apkg, options=options)).log
            name = os.path.basename(apkg)
            for field in ("conflicting", "first_field_match", "missing_notetype", "missing_deck", "empty_first_field"):
                if len(getattr(log, field)):
                    problems.append(f"{name}: {len(getattr(log, field))} {field.replace('_', ' ')} note(s)")
            if again and len(log.new):
                problems.append(f"{name}: second import added {len(log.new)} note(s)")

        def cards_by_guid() -> dict[str, list[tuple[int, int, int]]]:
            """GUID -> its cards as (due, ord, queue)."""
            rows = col.db.all("select n.guid, c.due, c.ord, c.queue from cards c join notes n on c.nid = n.id")
            out: dict[str, list[tuple[int, int, int]]] = {}
            for guid, due, ord_, queue in rows:
                out.setdefault(guid, []).append((due, ord_, queue))
            return out

        for path in paths:
            load(path, again=False)

        # Suspension and new-card order. A note shared by overlapping packs keeps the cards of the
        # pack that brought it, so each pack is checked on the notes it brought, in import order.
        cards = cards_by_guid()
        seen: set[str] = set()
        for path in paths:
            pack, name = packs[path], os.path.basename(path)
            suspend = pack.get("suspend") is True
            brought = [n["guid"] for d in pack["decks"] for n in d["notes"] if n["guid"] not in seen]
            seen.update(brought)
            wrong = [g for g in brought for _, _, q in cards.get(g, []) if (q == SUSPENDED) != suspend]
            if wrong:
                problems.append(f"{name}: {len(wrong)} card(s) {'not ' if suspend else ''}suspended on import, e.g. {wrong[0]}")
            place = {g: i for i, g in enumerate(brought)}
            got = sorted((due, ord_, g) for g in brought for due, ord_, _ in cards.get(g, []))
            order = [(place[g], ord_) for _, ord_, g in got]
            if order != sorted(order):
                i = next(i for i, (a, b) in enumerate(zip(order, sorted(order))) if a != b)
                problems.append(f"{name}: new cards out of pack order at card {i}: {got[i][2]} ord {got[i][1]}")

        # The unlock search: each checkpoint tag finds exactly the notes that carry it. Tags are
        # hierarchical in Anki, so a page name that is a prefix of another would show here.
        by_tag: dict[str, set[str]] = {}
        for pack in packs.values():
            for d in pack["decks"]:
                for n in d["notes"]:
                    for t in n["tags"]:
                        if t.startswith("ageben::cp::"):
                            by_tag.setdefault(t, set()).add(n["guid"])
        for tag, want_guids in sorted(by_tag.items()):
            found_guids = {col.get_note(nid).guid for nid in col.find_notes(f"deck:Ageben* tag:{tag}")}
            if found_guids != want_guids:
                problems.append(f"unlock search for {tag} found {len(found_guids)} note(s); want {len(want_guids)}")
        unlock = f", unlock search right for {len(by_tag)} checkpoint tag(s)" if by_tag else ""

        # The learner's own state, which a re-import must keep: one card unsuspended, one reviewed.
        learner: dict[int, tuple] = {}
        ageben = [c for c in col.find_cards('"deck:Ageben*"', order="c.id")]
        if len(ageben) >= 2:
            col.sched.unsuspend_cards(ageben[:2])
            col.sched.set_due_date([ageben[1]], "5")

        def state(cid: int) -> tuple:
            c = col.get_card(cid)
            return (c.queue, c.type, c.due, c.ivl)

        learner = {cid: state(cid) for cid in ageben[:2]}
        keep = {col.get_card(cid).note().guid for cid in learner}

        for path in paths:
            load(path, again=True)

        if col.note_count() != notes:
            problems.append(f"{col.note_count()} notes in the collection, {notes} distinct GUIDs in the packs")
        if col.card_count() != want_cards:
            problems.append(f"{col.card_count()} cards for {notes} notes; want {want_cards}")
        missing = decks - {d.name for d in col.decks.all_names_and_ids()}
        if missing:
            problems.append(f"decks not created: {', '.join(sorted(missing))}")
        for model in TEMPLATES:
            found = col.find_cards(f'"note:{model}"')
            if len(found) != want[model]:
                problems.append(f"{len(found)} {model} cards found to render; want {want[model]}")
            for cid in found:
                card = col.get_card(cid)
                raw_q = card.question()
                q, a = visible(raw_q), visible(card.answer())
                blank = model not in CLOZE_MODELS or 'class="cloze"' in raw_q
                if not q or not a or not blank or "{{" in q + a or "front of this card is blank" in q.lower():
                    note = card.note()
                    problems.append(f"{note.guid} {note.fields[note.note_type()['sortf']]} {card.template()['name']}: bad render: {q[:60]!r}")

        # The update a learner makes: import every pack of the next build, which drops a note, then
        # search for notes outside the new release. ALWAYS, since both builds may carry the same
        # modified time.
        released = []
        for family, members in families.items():
            prefix, top = FAMILIES[family]
            outs, dropped, rid = drop_one(members, prefix, keep, work)
            if any(prefix + rid in n["tags"] for n in packs[members[0]]["decks"][0]["notes"]):
                problems.append(f"{family}: the build with a note dropped kept release id {rid}")
            for out in outs:
                load(out, again=False, update=ALWAYS)
            stale = col.find_notes(f'"deck:{top}*" -tag:{prefix}{rid}')
            found = [col.get_note(nid).guid for nid in stale]
            if found != [dropped]:
                problems.append(f"{family}: release search after dropping {dropped} found {found[:5]} ({len(found)} note(s))")
                # Show what the search saw, so one run names the cause: each note's decks and release tags.
                for nid in (stale[:5] or col.find_notes(f"guid:{dropped}")):
                    note = col.get_note(nid)
                    in_decks = sorted({col.decks.name(c.did) for c in note.cards()})
                    releases = [t for t in note.tags if "::release::" in t]
                    problems.append(f"  {note.guid}: decks {in_decks}, release tags {releases}; wanted tag {prefix}{rid}")
            released.append(family)
        for cid, before in learner.items():
            if state(cid) != before:
                problems.append(f"card {cid}: learner state (queue, type, due, ivl) {before} became {state(cid)} on re-import")
        col.close()

    for p in problems[:40]:
        print(f"  {p}", file=sys.stderr)
    if problems:
        sys.exit(f"Anki import check failed: {len(problems)} problem(s)")
    kept = f", learner state kept for {len(learner)} card(s)" if learner else ""
    search = f", release search finds the dropped note ({', '.join(released)})" if released else ""
    print(f"Anki import check: {notes} notes, {want_cards} cards, {len(decks)} decks, suspension and order as packed{unlock}{kept}{search}")


if __name__ == "__main__":
    main()
