"""Package a flashcard pack (JSON from scripts/flashcards.ts) into an Anki .apkg with genanki.

Run through npm run flashcards; by hand: .venv/bin/python scripts/flashcards-package.py <pack.json> <out.apkg>

The pack JSON's `model` names the default note type ("Ageben lexicon", "Claritish", "Ageben overlay"
or "Ageben set") and `fields` its field order. A note may name another type in its own `model`;
the pack's `modelFields` then gives that type's field order, keyed by name.
Each note type and its ids are fixed constants so a re-import updates notes and keeps review
history; note GUIDs and deck ids come from the JSON, where they derive from stable keys.
"""

import html
import json
import sys

import genanki

MODEL_ID = 1738204517
CLARITISH_MODEL_ID = 1738204518
OVERLAY_MODEL_ID = 1738204519
SET_MODEL_ID = 1738204520
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
# `parts` is HTML: a compound's parts, or a root's or closed word's letters (one `.letter` line each).
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
.letter { text-align: left; font-size: 16px; margin: 0.15em auto; max-width: 28em; }
.letter > code:first-child { display: inline-block; min-width: 2.6em; font-weight: 600; }
.cue { margin-top: 0.8em; font-size: 16px; }
.mnemonic { margin-top: 0.8em; font-size: 14px; font-style: italic; opacity: 0.6; }
"""

LEXICON_MODEL = genanki.Model(
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

# Claritish: the form on the front; the meaning (HTML from the cheat sheet, with a muted `.also`
# line for a row's other ending forms) and a small, muted lesson line on the back. One template; the Ageben packs never share these notes.
CLARITISH_CSS = CSS + """
.meaning { display: inline-block; text-align: left; margin: 0.25em 0; }
.lesson { margin-top: 1em; font-size: 13px; opacity: 0.55; }
.also { margin-top: 0.35em; font-size: 14px; opacity: 0.7; }
"""

CLARITISH_MODEL = genanki.Model(
    CLARITISH_MODEL_ID,
    "Claritish",
    fields=[{"name": f} for f in ["front", "meaning", "lesson"]],
    templates=[
        {
            "name": "Recognition",
            "qfmt": STEM,
            "afmt": '{{FrontSide}}<hr id="answer"><div class="meaning">{{meaning}}</div>'
            + '{{#lesson}}<div class="lesson">{{lesson}}</div>{{/lesson}}',
        },
    ],
    css=CLARITISH_CSS,
    sort_field_index=0,
)

# Ageben overlay: `example` holds the example sentence as HTML with the overlay word wrapped in
# <span class="overlay">; recognition highlights it, production blanks it. The back: definition,
# per-slot readings (empty when one reading), the word note a slot note extends; then `host`, HTML: where
# each letter of the overlay word comes from, ending with its host's concrete sense (flashcards.md#letters);
# then the mnemonic as the cue from the host to the meaning, the example's morph gloss and the anchor link.
OVERLAY_FIELDS = ["example", "form", "definition", "readings", "host", "slot_of", "gloss", "link", "mnemonic", "kind"]

OVERLAY_BACK = """
<div class="english">
<div class="line"><span class="label">definition</span>{{definition}}</div>
{{#readings}}<div class="line readings">{{readings}}</div>{{/readings}}
{{#slot_of}}<div class="line"><span class="label">new slot of</span>{{slot_of}}</div>{{/slot_of}}
</div>
{{#host}}<div class="parts">{{host}}</div>{{/host}}
{{#mnemonic}}<div class="cue"><span class="label">cue</span>{{mnemonic}}</div>{{/mnemonic}}
{{#gloss}}<div class="gloss">{{gloss}}</div>{{/gloss}}
{{#link}}<div class="link"><a href="{{link}}">grammar section</a></div>{{/link}}
"""

EXAMPLE_CSS = """
.example { font-size: 28px; margin: 0.4em 0; }
.overlay { font-weight: 700; color: #1a5fb4; background: rgba(26, 95, 180, 0.12); border-radius: 0.2em; padding: 0 0.15em; }
.nightMode .overlay, .night_mode .overlay { color: #99c1f1; background: rgba(153, 193, 241, 0.15); }
.blank .overlay { color: transparent; background: none; border-bottom: 2px solid #888; }
.readings { font-size: 17px; }
.gloss { margin-top: 0.8em; font-size: 15px; font-family: ui-monospace, monospace; opacity: 0.8; }
.link { margin-top: 0.6em; font-size: 13px; }
"""

OVERLAY_MODEL = genanki.Model(
    OVERLAY_MODEL_ID,
    "Ageben overlay",
    fields=[{"name": f} for f in OVERLAY_FIELDS],
    templates=[
        {
            "name": "Recognition",
            "qfmt": '<div class="example">{{example}}</div>',
            "afmt": '{{FrontSide}}<hr id="answer">' + OVERLAY_BACK,
        },
        {
            "name": "Production",
            "qfmt": '<div class="english"><div class="line"><span class="label">definition</span>{{definition}}</div></div>'
            + '<div class="example blank">{{example}}</div>'
            # The CSS hides the word; the script also takes it out of the page, so its length and
            # a text selection give nothing away.
            + "<script>document.querySelectorAll('.blank .overlay').forEach((e) => { e.textContent = '\\u2003\\u2003\\u2003'; });</script>",
            "afmt": '<div class="example">{{example}}</div><hr id="answer">' + OVERLAY_BACK,
        },
    ],
    css=CSS + EXAMPLE_CSS,
    sort_field_index=1,
)

# Ageben set: an Anki Cloze type, one blank per member ({{c1::...}}), the other members showing.
# `title` names the set (the kind, or the scale or ending it teaches); `text` is the cloze HTML.
SET_FIELDS = ["text", "title", "link", "mnemonic"]

SET_MODEL = genanki.Model(
    SET_MODEL_ID,
    "Ageben set",
    fields=[{"name": f} for f in SET_FIELDS],
    templates=[
        {
            "name": "Cloze",
            "qfmt": '{{#title}}<div class="title">{{title}}</div>{{/title}}<div class="example">{{cloze:text}}</div>',
            "afmt": '{{#title}}<div class="title">{{title}}</div>{{/title}}<div class="example">{{cloze:text}}</div>'
            + '{{#link}}<div class="link"><a href="{{link}}">grammar section</a></div>{{/link}}'
            + '{{#mnemonic}}<div class="mnemonic">{{mnemonic}}</div>{{/mnemonic}}',
        },
    ],
    css=CSS + EXAMPLE_CSS + """
.title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.55; }
.cloze { font-weight: 700; color: #1a5fb4; }
.nightMode .cloze, .night_mode .cloze { color: #99c1f1; }
""",
    model_type=genanki.Model.CLOZE,
    sort_field_index=1,
)

# Note type by name (the JSON's `model`), with the fields that already hold HTML (never escaped).
MODELS = {
    "Ageben lexicon": (LEXICON_MODEL, {"parts"}),
    "Claritish": (CLARITISH_MODEL, {"meaning"}),
    "Ageben overlay": (OVERLAY_MODEL, {"example", "readings", "host"}),
    "Ageben set": (SET_MODEL, {"text"}),
}


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit("usage: flashcards-package.py <pack.json> <out.apkg>")
    with open(sys.argv[1], encoding="utf-8") as f:
        pack = json.load(f)
    field_orders = {pack.get("model"): pack.get("fields"), **pack.get("modelFields", {})}
    checked: dict[str, tuple[genanki.Model, set[str], list[str]]] = {}

    def note_type(name: str) -> tuple[genanki.Model, set[str], list[str]]:
        """The note type a note names, its HTML fields and field order, checked against the JSON once."""
        if name not in checked:
            if name not in MODELS:
                sys.exit(f"unknown note type {name!r}; use {', '.join(MODELS)}")
            model, html_fields = MODELS[name]
            names = [f["name"] for f in model.fields]
            if field_orders.get(name) != names:
                sys.exit(f"field mismatch: JSON has {field_orders.get(name)} for {name}, note type has {names}")
            checked[name] = (model, html_fields, names)
        return checked[name]

    note_type(pack.get("model"))
    suspend = pack.get("suspend") is True
    decks = []
    due = 0
    for d in pack["decks"]:
        deck = genanki.Deck(d["id"], d["name"])
        for n in d["notes"]:
            model, html_fields, names = note_type(n.get("model", pack["model"]))
            if len(n["fields"]) != len(names):
                sys.exit(f"note {n['guid']}: {len(n['fields'])} fields, note type {model.name} has {len(names)}")
            # Due keeps new cards in pack order: checkpoint order, then CSV order.
            note = genanki.Note(
                model=model,
                fields=[v if name in html_fields else html.escape(v, quote=False) for name, v in zip(names, n["fields"])],
                tags=n["tags"],
                guid=n["guid"],
                due=due,
            )
            # genanki 0.13 caches note.cards; each Card's `suspend` writes queue -1.
            for card in note.cards:
                card.suspend = suspend
            deck.add_note(note)
            due += 1
        decks.append(deck)
    genanki.Package(decks).write_to_file(sys.argv[2])


if __name__ == "__main__":
    main()
