"""Import flashcard packs into a throwaway Anki collection and check that Anki accepts them.

Run through npm run flashcards; by hand: .venv/bin/python scripts/flashcards-check.py <pack.json> [...]
(each <pack.json> sits beside its <pack.apkg>).

Uses Anki's own backend (the `anki` package from requirements.txt), so it checks what a learner's
import does: the note type arrives, nothing conflicts, overlapping packs share notes, every card
renders a non-blank question and answer, and a second import adds nothing.
"""

import json
import os
import re
import sys
import tempfile

from anki.collection import Collection, ImportAnkiPackageOptions, ImportAnkiPackageRequest
from anki.import_export_pb2 import ImportAnkiPackageUpdateCondition

IF_NEWER = ImportAnkiPackageUpdateCondition.IMPORT_ANKI_PACKAGE_UPDATE_CONDITION_IF_NEWER


def visible(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<style>.*?</style>|<[^>]+>", " ", html, flags=re.S)).strip()


def main() -> None:
    packs = sys.argv[1:]
    if not packs:
        sys.exit("usage: flashcards-check.py <pack.json> [...]")
    problems: list[str] = []
    guids: set[str] = set()
    decks: set[str] = set()
    for path in packs:
        with open(path, encoding="utf-8") as f:
            for d in json.load(f)["decks"]:
                decks.add(d["name"])
                guids.update(n["guid"] for n in d["notes"])

    with tempfile.TemporaryDirectory() as work:
        col = Collection(os.path.join(work, "check.anki2"))

        def load(path: str, again: bool) -> None:
            apkg = re.sub(r"\.json$", ".apkg", path)
            options = ImportAnkiPackageOptions(update_notes=IF_NEWER, update_notetypes=IF_NEWER)
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

        if col.note_count() != len(guids):
            problems.append(f"{col.note_count()} notes in the collection, {len(guids)} distinct GUIDs in the packs")
        if col.card_count() != 2 * len(guids):
            problems.append(f"{col.card_count()} cards for {len(guids)} notes; want two per note")
        missing = decks - {d.name for d in col.decks.all_names_and_ids()}
        if missing:
            problems.append(f"decks not created: {', '.join(sorted(missing))}")
        cards = col.find_cards('"note:Agazan lexicon"')
        if len(cards) != 2 * len(guids):
            problems.append(f"{len(cards)} Agazan lexicon cards found to render; want {2 * len(guids)}")
        for cid in cards:
            card = col.get_card(cid)
            q, a = visible(card.question()), visible(card.answer())
            if not q or not a or "{{" in q + a or "front of this card is blank" in q.lower():
                problems.append(f"{card.note()['front']} {card.template()['name']}: bad render: {q[:60]!r}")
        col.close()

    for p in problems[:40]:
        print(f"  {p}", file=sys.stderr)
    if problems:
        sys.exit(f"Anki import check failed: {len(problems)} problem(s)")
    print(f"Anki import check: {len(guids)} notes, {2 * len(guids)} cards, {len(decks)} decks")


if __name__ == "__main__":
    main()
