"""Package a flashcard pack (JSON from scripts/flashcards.ts) into an Anki .apkg with genanki.

Run through npm run flashcards; by hand: .venv/bin/python scripts/flashcards-package.py <pack.json> <out.apkg>

The note type and its ids are fixed constants so a re-import updates notes and keeps review
history; note GUIDs and deck ids come from the JSON, where they derive from stable keys.
"""

import html
import json
import sys

import genanki

MODEL_ID = 1738204517
FIELDS = ["front", "concrete", "abstract", "aliases", "parts", "mnemonic", "kind"]

# Overlays (kind set) lead with the definition; roots and compounds show labeled concrete,
# abstract, and also lines, each omitted when empty.
ENGLISH = """
{{#kind}}
<div class="line"><span class="label">definition</span>{{abstract}}</div>
<div class="line"><span class="label">gloss</span>{{concrete}}</div>
{{/kind}}
{{^kind}}
{{#concrete}}<div class="line"><span class="label">concrete</span>{{concrete}}</div>{{/concrete}}
{{#abstract}}<div class="line"><span class="label">abstract</span>{{abstract}}</div>{{/abstract}}
{{#aliases}}<div class="line also"><span class="label">also</span>{{aliases}}</div>{{/aliases}}
{{/kind}}
"""

STEM = '<div class="stem">{{front}}</div>'
EXTRAS = """
{{#parts}}<div class="parts">{{parts}}</div>{{/parts}}
{{#mnemonic}}<div class="mnemonic">{{mnemonic}}</div>{{/mnemonic}}
"""

CSS = """
.card { font-family: system-ui, sans-serif; font-size: 20px; text-align: center; color: #222; background: #fff; }
.nightMode.card, .night_mode .card { color: #eee; background: #2f2f31; }
.stem { font-size: 36px; font-weight: 600; letter-spacing: 0.02em; margin: 0.4em 0; }
.english { display: inline-block; text-align: left; }
.line { margin: 0.25em 0; }
.label { display: inline-block; min-width: 6.5em; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.55; }
.also { font-size: 17px; opacity: 0.85; }
.parts { margin-top: 0.8em; font-size: 17px; }
.mnemonic { margin-top: 0.8em; font-size: 14px; font-style: italic; opacity: 0.6; }
"""

MODEL = genanki.Model(
    MODEL_ID,
    "Ageben lexicon",
    fields=[{"name": f} for f in FIELDS],
    templates=[
        {
            "name": "Recognition",
            "qfmt": STEM,
            "afmt": '{{FrontSide}}<hr id="answer"><div class="english">' + ENGLISH + "</div>" + EXTRAS,
        },
        {
            "name": "Production",
            "qfmt": '<div class="english">' + ENGLISH + "</div>",
            "afmt": '{{FrontSide}}<hr id="answer">' + STEM + EXTRAS,
        },
    ],
    css=CSS,
    sort_field_index=0,
)


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit("usage: flashcards-package.py <pack.json> <out.apkg>")
    with open(sys.argv[1], encoding="utf-8") as f:
        pack = json.load(f)
    if pack["fields"] != FIELDS:
        sys.exit(f"field mismatch: JSON has {pack['fields']}, note type has {FIELDS}")

    decks = []
    due = 0
    for d in pack["decks"]:
        deck = genanki.Deck(d["id"], d["name"])
        for n in d["notes"]:
            # Due keeps new cards in pack order: checkpoint order, then CSV order.
            deck.add_note(
                genanki.Note(
                    model=MODEL,
                    fields=[html.escape(v, quote=False) for v in n["fields"]],
                    tags=n["tags"],
                    guid=n["guid"],
                    due=due,
                )
            )
            due += 1
        decks.append(deck)
    genanki.Package(decks).write_to_file(sys.argv[2])


if __name__ == "__main__":
    main()
