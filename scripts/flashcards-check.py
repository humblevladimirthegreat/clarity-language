"""Import flashcard packs into a throwaway Anki collection and check that Anki accepts them.

Run through npm run flashcards; by hand: .venv/bin/python scripts/flashcards-check.py <pack.json> [...]
(each <pack.json> sits beside its <pack.apkg>).

Uses Anki's own backend (the `anki` package from requirements.txt), so it checks what a learner's
import does: the note type arrives, nothing conflicts, overlapping packs share notes, every card
renders a non-blank question and answer, and a second import adds nothing. For a Claritish pack it
then imports a build with one note dropped and checks that the release search finds exactly that note.
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
CLOZE = re.compile(r"\{\{c(\d+)::")
RELEASE_TAG = "claritish::release::"


def cards_of(model: str, fields: list[str]) -> int:
    per_note = TEMPLATES[model]
    if per_note is not None:
        return per_note
    return len({m.group(1) for f in fields for m in CLOZE.finditer(f)})


def visible(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<style>.*?</style>|<[^>]+>", " ", html, flags=re.S)).strip()


def release_id(decks: list[dict]) -> str:
    """The release id src/flashcards-claritish.ts computes: a hash of the note list without tags."""
    body = [[d["name"], d["id"], [[n["guid"], n["fields"]] for n in d["notes"]]] for d in decks]
    text = json.dumps(body, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:8]


def drop_one(path: str, work: str) -> tuple[str, str, str]:
    """Write and package a copy of a Claritish pack with its last note dropped and the release
    tags recomputed. Returns the copy's JSON path, the dropped GUID, and the new release id."""
    with open(path, encoding="utf-8") as f:
        pack = json.load(f)
    deck = max(pack["decks"], key=lambda d: len(d["notes"]))
    dropped = deck["notes"].pop()["guid"]
    rid = release_id(pack["decks"])
    for d in pack["decks"]:
        for n in d["notes"]:
            n["tags"] = [t for t in n["tags"] if not t.startswith(RELEASE_TAG)] + [RELEASE_TAG + rid]
    out = os.path.join(work, "dropped.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(pack, f, ensure_ascii=False)
    script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "flashcards-package.py")
    subprocess.run([sys.executable, script, out, re.sub(r"\.json$", ".apkg", out)], check=True)
    return out, dropped, rid


def main() -> None:
    packs = sys.argv[1:]
    if not packs:
        sys.exit("usage: flashcards-check.py <pack.json> [...]")
    problems: list[str] = []
    # GUID -> cards, by note type; a note shared by overlapping packs counts once.
    guids: dict[str, dict[str, int]] = {model: {} for model in TEMPLATES}
    decks: set[str] = set()
    claritish: list[str] = []
    for path in packs:
        with open(path, encoding="utf-8") as f:
            pack = json.load(f)
        if pack.get("model") not in TEMPLATES:
            sys.exit(f"{path}: unknown note type {pack.get('model')!r}")
        if pack["model"] == "Claritish":
            claritish.append(path)
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
            options = ImportAnkiPackageOptions(update_notes=update, update_notetypes=update)
            log = col.import_anki_package(ImportAnkiPackageRequest(package_path=apkg, options=options)).log
            name = os.path.basename(apkg)
            for field in ("conflicting", "first_field_match", "missing_notetype", "missing_deck", "empty_first_field"):
                if len(getattr(log, field)):
                    problems.append(f"{name}: {len(getattr(log, field))} {field.replace('_', ' ')} note(s)")
            if again and len(log.new):
                problems.append(f"{name}: second import added {len(log.new)} note(s)")

        for path in packs:
            load(path, again=False)
        for path in packs:
            load(path, again=True)

        if col.note_count() != notes:
            problems.append(f"{col.note_count()} notes in the collection, {notes} distinct GUIDs in the packs")
        if col.card_count() != want_cards:
            problems.append(f"{col.card_count()} cards for {notes} notes; want {want_cards}")
        missing = decks - {d.name for d in col.decks.all_names_and_ids()}
        if missing:
            problems.append(f"decks not created: {', '.join(sorted(missing))}")
        for model in TEMPLATES:
            cards = col.find_cards(f'"note:{model}"')
            if len(cards) != want[model]:
                problems.append(f"{len(cards)} {model} cards found to render; want {want[model]}")
            for cid in cards:
                card = col.get_card(cid)
                q, a = visible(card.question()), visible(card.answer())
                if not q or not a or "{{" in q + a or "front of this card is blank" in q.lower():
                    note = card.note()
                    problems.append(f"{note.guid} {note.fields[note.note_type()['sortf']]} {card.template()['name']}: bad render: {q[:60]!r}")

        # The update a learner makes: import a build that drops a note, then search for notes
        # outside the new release. ALWAYS, since both builds may carry the same modified time.
        released = ""
        for path in claritish:
            out, dropped, rid = drop_one(path, work)
            load(out, again=False, update=ALWAYS)
            stale = col.find_notes(f'"deck:Claritish*" -tag:{RELEASE_TAG}{rid}')
            found = [col.get_note(nid).guid for nid in stale]
            if found != [dropped]:
                problems.append(f"release search after dropping {dropped} found {found[:5]} ({len(found)} note(s))")
            released = ", release search finds the dropped note"
        col.close()

    for p in problems[:40]:
        print(f"  {p}", file=sys.stderr)
    if problems:
        sys.exit(f"Anki import check failed: {len(problems)} problem(s)")
    print(f"Anki import check: {notes} notes, {want_cards} cards, {len(decks)} decks{released}")


if __name__ == "__main__":
    main()
