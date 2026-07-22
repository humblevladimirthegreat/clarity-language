#!/usr/bin/env python3
"""Deduplicate metaphors in lexicon-published.csv.

Pass 1: country-flag rows with metaphorical=nation -> demonym per literal.
Pass 2: exact/plural/synonym clusters -> keep strongest link, others REVIEW.
"""
from __future__ import annotations

import csv
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB_PATH = ROOT / "data" / "lexicon-published.csv"

# literal -> demonym (lowercase lemma). None = leave REVIEW.
DEMONYMS: dict[str, str | None] = {
    "ascension-island": None,
    "andorra": "andorran",
    "uae": "emirati",
    "afghanistan": "afghan",
    "antigua-barbuda": "antiguan",
    "anguilla": "anguillan",
    "albania": "albanian",
    "armenia": "armenian",
    "angola": "angolan",
    "antarctica": None,
    "argentina": "argentinian",
    "american-samoa": "american-samoan",
    "austria": "austrian",
    "australia": "australian",
    "aruba": "aruban",
    "aland-islands": None,
    "azerbaijan": "azerbaijani",
    "bosnia-herzegovina": "bosnian",
    "barbados": "barbadian",
    "bangladesh": "bangladeshi",
    "belgium": "belgian",
    "burkina-faso": "burkinabe",
    "bulgaria": "bulgarian",
    "bahrain": "bahraini",
    "burundi": "burundian",
    "benin": "beninese",
    "st-barthelemy": None,
    "bermuda": "bermudian",
    "brunei": "bruneian",
    "bolivia": "bolivian",
    "caribbean-netherlands": "dutch-caribbean",
    "brazil": "brazilian",
    "bahamas": "bahamian",
    "bhutan": "bhutanese",
    "bouvet-island": None,
    "botswana": "botswanan",
    "belarus": "belarusian",
    "belize": "belizean",
    "canada": "canadian",
    "cocos-islands": None,
    "congo-kinshasa": "congolese",
    "central-african-republic": "central-african",
    "congo": None,
    "switzerland": "swiss",
    "cote-d-ivoire": "ivorian",
    "cook-islands": "cook-islander",
    "chile": "chilean",
    "cameroon": "cameroonian",
    "china": "chinese",
    "colombia": "colombian",
    "clipperton-island": None,
    "sark": None,
    "costa-rica": "costa-rican",
    "cuba": "cuban",
    "cape-verde": "cape-verdean",
    "curacao": "curacaoan",
    "christmas-island": None,
    "cyprus": "cypriot",
    "czechia": "czech",
    "germany": "german",
    "diego-garcia": None,
    "djibouti": "djiboutian",
    "denmark": "danish",
    "dominica": None,
    "dominican-republic": "dominican",
    "algeria": "algerian",
    "ceuta-melilla": None,
    "ecuador": "ecuadorian",
    "estonia": "estonian",
    "egypt": "egyptian",
    "western-sahara": "sahrawi",
    "eritrea": "eritrean",
    "spain": "spanish",
    "ethiopia": "ethiopian",
    "european-union": "european",
    "finland": "finnish",
    "fiji": "fijian",
    "falkland-islands": "falklander",
    "micronesia": "micronesian",
    "faroe-islands": "faroese",
    "france": "french",
    "gabon": "gabonese",
    "uk": "british",
    "grenada": "grenadian",
    "georgia": "georgian",
    "french-guiana": "guianese",
    "guernsey": "guernsey",
    "ghana": "ghanaian",
    "gibraltar": "gibraltarian",
    "greenland": "greenlandic",
    "gambia": "gambian",
    "guinea": "guinean",
    "guadeloupe": "guadeloupean",
    "equatorial-guinea": "equatorial-guinean",
    "greece": "greek",
    "south-georgia-south-sandwich-islands": None,
    "guatemala": "guatemalan",
    "guam": "guamanian",
    "guinea-bissau": "bissau-guinean",
    "guyana": "guyanese",
    "hong-kong": "hongkonger",
    "heard-mcdonald-islands": None,
    "honduras": "honduran",
    "croatia": "croatian",
    "haiti": "haitian",
    "hungary": "hungarian",
    "canary-islands": "canarian",
    "indonesia": "indonesian",
    "ireland": "irish",
    "israel": "israeli",
    "isle-of-man": "manx",
    "india": "indian",
    "british-indian-ocean": None,
    "iraq": "iraqi",
    "iran": "iranian",
    "iceland": "icelandic",
    "italy": "italian",
    "jersey": "jersey",
    "jamaica": "jamaican",
    "jordan": "jordanian",
    "japan": "japanese",
    "kenya": "kenyan",
    "kyrgyzstan": "kyrgyz",
    "cambodia": "cambodian",
    "kiribati": "i-kiribati",
    "comoros": "comoran",
    "st-kitts-nevis": "kittitian",
    "north-korea": "north-korean",
    "south-korea": "korean",
    "kuwait": "kuwaiti",
    "cayman-islands": "caymanian",
    "kazakhstan": "kazakh",
    "laos": "laotian",
    "lebanon": "lebanese",
    "st-lucia": "saint-lucian",
    "liechtenstein": "liechtensteiner",
    "sri-lanka": "sri-lankan",
    "liberia": "liberian",
    "lesotho": "basotho",
    "lithuania": "lithuanian",
    "luxembourg": "luxembourgish",
    "latvia": "latvian",
    "libya": "libyan",
    "morocco": "moroccan",
    "monaco": "monacan",
    "moldova": "moldovan",
    "montenegro": "montenegrin",
    "st-martin": None,
    "madagascar": "malagasy",
    "marshall-islands": "marshallese",
    "north-macedonia": "macedonian",
    "mali": "malian",
    "myanmar-burma": "burmese",
    "mongolia": "mongolian",
    "macao-sar-china": "macanese",
    "northern-mariana-islands": "mariana-islander",
    "martinique": "martiniquan",
    "mauritania": "mauritanian",
    "montserrat": "montserratian",
    "malta": "maltese",
    "mauritius": "mauritian",
    "maldives": "maldivian",
    "malawi": "malawian",
    "mexico": "mexican",
    "malaysia": "malaysian",
    "mozambique": "mozambican",
    "namibia": "namibian",
    "new-caledonia": "new-caledonian",
    "niger": "nigerien",
    "norfolk-island": "norfolk-islander",
    "nigeria": "nigerian",
    "nicaragua": "nicaraguan",
    "netherlands": "dutch",
    "norway": "norwegian",
    "nepal": "nepali",
    "nauru": "nauruan",
    "niue": "niuean",
    "new-zealand": "new-zealander",
    "oman": "omani",
    "panama": "panamanian",
    "peru": "peruvian",
    "french-polynesia": "polynesian",
    "papua-new-guinea": "papuan",
    "philippines": "filipino",
    "pakistan": "pakistani",
    "poland": "polish",
    "st-pierre-miquelon": None,
    "pitcairn-islands": "pitcairn-islander",
    "puerto-rico": "puerto-rican",
    "palestinian-territories": "palestinian",
    "portugal": "portuguese",
    "palau": "palauan",
    "paraguay": "paraguayan",
    "qatar": "qatari",
    "reunion": "reunionese",
    "romania": "romanian",
    "serbia": "serbian",
    "russia": "russian",
    "rwanda": "rwandan",
    "saudi-arabia": "saudi",
    "solomon-islands": "solomon-islander",
    "seychelles": "seychellois",
    "sudan": "sudanese",
    "sweden": "swedish",
    "singapore": "singaporean",
    "st-helena": "saint-helenian",
    "slovenia": "slovenian",
    "svalbard-jan-mayen": None,
    "slovakia": "slovak",
    "sierra-leone": "sierra-leonean",
    "san-marino": "sammarinese",
    "senegal": "senegalese",
    "somalia": "somali",
    "suriname": "surinamese",
    "south-sudan": "south-sudanese",
    "sao-tome-principe": "sao-tomean",
    "el-salvador": "salvadoran",
    "sint-maarten": "sint-maartener",
    "syria": "syrian",
    "eswatini": "swazi",
    "tristan-da-cunha": None,
    "turks-caicos": "turks-islander",
    "chad": "chadian",
    "french-southern-territories": None,
    "togo": "togolese",
    "thailand": "thai",
    "tajikistan": "tajik",
    "tokelau": "tokelauan",
    "timor-leste": "timorese",
    "turkmenistan": "turkmen",
    "tunisia": "tunisian",
    "tonga": "tongan",
    "turkiye": "turkish",
    "trinidad-tobago": "trinidadian",
    "tuvalu": "tuvaluan",
    "taiwan": "taiwanese",
    "tanzania": "tanzanian",
    "ukraine": "ukrainian",
    "uganda": "ugandan",
    "us-outlying-islands": None,
    "un": None,
    "usa": "american",
    "uruguay": "uruguayan",
    "uzbekistan": "uzbek",
    "vatican": None,
    "st-vincent-grenadines": "vincentian",
    "venezuela": "venezuelan",
    "british-virgin-islands": "british-virgin-islander",
    "us-virgin-islands": "us-virgin-islander",
    "vietnam": "vietnamese",
    "vanuatu": "vanuatuan",
    "wallis-futuna": "wallisian",
    "samoa": "samoan",
    "kosovo": "kosovar",
    "yemen": "yemeni",
    "mayotte": "mahoran",
    "south-africa": "south-african",
    "zambia": "zambian",
    "zimbabwe": "zimbabwean",
}

# Near-synonym clusters: (canonical slot key, members).
SYNONYM_GROUPS: list[tuple[str, set[str]]] = [
    ("doubt", {"doubt", "uncertainty"}),
    ("wealth", {"wealth", "riches"}),
    ("celebration", {"celebration", "festivity"}),
    ("protection", {"protection", "safety"}),
    ("romance", {"romance", "love"}),
    ("resilience", {"resilience", "toughness"}),
    ("reminder", {"reminder", "memory"}),
    ("danger", {"danger", "hazard", "threat"}),
    ("silence", {"silence", "quiet"}),
    ("conflict", {"conflict", "strife"}),
    ("approval", {"approval", "acceptance"}),
    ("healing", {"healing", "cure", "recovery"}),
    ("formality", {"formality", "formal"}),
    ("casual", {"casual", "informal"}),
    ("tradition", {"tradition", "custom"}),
    ("faith", {"faith", "belief"}),
    ("identity", {"identity", "self"}),
    ("rescue", {"rescue", "salvation"}),
    ("balance", {"balance", "equilibrium"}),
    ("value", {"value", "worth"}),
    ("prohibition", {"prohibition", "ban"}),
    ("precision", {"precision", "accuracy"}),
    ("comfort", {"comfort", "cozy", "ease"}),
    ("exploration", {"exploration", "discovery"}),
    ("generosity", {"generosity", "giving"}),
    ("grace", {"grace", "elegance"}),
    ("mobility", {"mobility", "movement"}),
    ("foundation", {"foundation", "base"}),
    ("scrutiny", {"scrutiny", "examination"}),
    ("arrival", {"arrival", "destination"}),
    ("rejuvenation", {"rejuvenation", "renewal"}),
    ("refuge", {"refuge", "sanctuary"}),
    ("indignation", {"indignation", "outrage"}),
    ("resignation", {"resignation", "surrender"}),
    ("designation", {"designation", "label"}),
    ("apathy", {"indifference", "apathy"}),
    ("secrecy", {"discretion", "secrecy", "hide", "conceal"}),
    ("infatuation", {"infatuation", "crush"}),
    ("awe", {"awe", "wonder"}),
    ("affection", {"affection", "warmth"}),
    ("bittersweet", {"bittersweet", "melancholy"}),
    ("tempting", {"tempting", "alluring"}),
    ("tease", {"tease", "taunt"}),
    ("mischief", {"mischief", "playfulness"}),
    ("crazy", {"crazy", "wild"}),
    ("shock", {"shock", "surprise"}),
    ("spy", {"spy", "surveillance"}),
    ("whisper", {"whisper", "quiet-voice"}),
    ("respect", {"respect", "honor"}),
    ("irony", {"irony", "sarcasm"}),
    ("swoon", {"swoon", "overwhelm"}),
    ("flirt", {"flirt", "charm"}),
    ("happy", {"happy", "happiness", "joy"}),
    ("innocent", {"innocent", "purity"}),
    ("dear", {"dear", "beloved"}),
    ("awkward", {"awkward", "embarrassment"}),
    ("amusement", {"amusement", "humor"}),
    ("delight", {"delight", "pleasure"}),
]

# Sovereign states and major entities get demonyms before territories sharing the same demonym.
COUNTRY_PRIORITY: set[str] = {
    "usa", "uk", "spain", "france", "germany", "italy", "china", "japan", "india",
    "brazil", "mexico", "canada", "australia", "russia", "netherlands", "belgium",
    "switzerland", "sweden", "norway", "denmark", "finland", "poland", "ukraine",
    "greece", "turkiye", "egypt", "south-africa", "nigeria", "kenya", "israel",
    "ireland", "portugal", "austria", "czechia", "hungary", "romania", "serbia",
    "croatia", "argentina", "chile", "colombia", "peru", "venezuela", "cuba",
    "dominican-republic", "congo-kinshasa", "ethiopia", "morocco", "algeria",
    "saudi-arabia", "iran", "iraq", "pakistan", "bangladesh", "thailand",
    "vietnam", "indonesia", "philippines", "malaysia", "singapore", "new-zealand",
    "south-korea", "north-korea", "taiwan", "hong-kong", "uae", "qatar", "kuwait",
    "samoa", "fiji", "jamaica", "haiti", "iceland", "luxembourg", "monaco",
    "vatican", "un", "european-union", "palestinian-territories", "kosovo",
    "georgia", "armenia", "azerbaijan", "kazakhstan", "uzbekistan", "mongolia",
    "nepal", "sri-lanka", "myanmar-burma", "cambodia", "laos", "afghanistan",
    "syria", "lebanon", "jordan", "yemen", "oman", "bahrain", "tunisia", "libya",
    "sudan", "south-sudan", "uganda", "tanzania", "rwanda", "ghana", "senegal",
    "cameroon", "angola", "mozambique", "zambia", "zimbabwe", "namibia", "botswana",
    "madagascar", "mauritius", "seychelles", "malta", "cyprus", "estonia",
    "latvia", "lithuania", "slovakia", "slovenia", "bulgaria", "albania",
    "montenegro", "north-macedonia", "moldova", "belarus", "uruguay", "paraguay",
    "bolivia", "ecuador", "guatemala", "honduras", "nicaragua", "el-salvador",
    "costa-rica", "panama", "puerto-rico", "bahamas", "barbados", "trinidad-tobago",
    "grenada", "dominica", "st-lucia", "st-vincent-grenadines", "antigua-barbuda",
    "st-kitts-nevis", "belize", "guyana", "suriname", "congo", "gabon", "niger",
    "mali", "burkina-faso", "benin", "togo", "chad", "central-african-republic",
    "eritrea", "djibouti", "somalia", "comoros", "lesotho", "eswatini", "malawi",
    "liberia", "sierra-leone", "guinea", "guinea-bissau", "equatorial-guinea",
    "cote-d-ivoire", "cape-verde", "burundi", "tajikistan", "turkmenistan",
    "kyrgyzstan", "timor-leste", "papua-new-guinea", "solomon-islands", "vanuatu",
    "tonga", "tuvalu", "kiribati", "marshall-islands", "micronesia", "palau",
    "nauru", "andorra", "liechtenstein", "san-marino", "bhutan", "brunei",
    "maldives", "french-polynesia", "new-caledonia", "reunion", "martinique",
    "guadeloupe", "curacao", "sint-maarten", "aruba", "bermuda", "cayman-islands",
    "turks-caicos", "falkland-islands", "greenland", "faroe-islands", "gibraltar",
    "guam", "american-samoa", "northern-mariana-islands", "cook-islands", "niue",
    "tokelau", "wallis-futuna", "mayotte", "western-sahara",
}

# Preferred keeper literal per metaphor slot (canonical slot key).
SLOT_KEEP_LITERAL: dict[str, str] = {
    "celebration": "party",
    "protection": "guard",
    "comfort": "hug",
    "precision": "bullseye",
    "faith": "church",
    "tradition": "christmas-tree",
    "casual": "t-shirt",
    "healing": "healing",
    "formality": "tuxedo",
    "danger": "skull-crossbones",
    "romance": "rose",
    "resilience": "cockroach",
    "identity": "fingerprint",
    "rescue": "life-ring",
    "balance": "yin-yang",
    "reminder": "bookmark",
    "value": "gemstone",
    "prohibition": "prohibited",
    "silence": "speechless",
    "conflict": "sword-crossed",
    "approval": "thumbs-up",
    "mobility": "car",
    "foundation": "brick",
    "exploration": "astronaut",
    "generosity": "wrapped-gift",
    "grace": "swan",
    "scrutiny": "magnify",
    "doubt": "think",
    "secrecy": "secret",
    "apathy": "blank",
}


def build_synonym_map() -> dict[str, str]:
    out: dict[str, str] = {}
    for canonical, members in SYNONYM_GROUPS:
        for word in members:
            out[word] = canonical
    return out


SYNONYM_MAP = build_synonym_map()


def singularize(word: str) -> str:
    w = word.strip().lower()
    if not w:
        return w
    for suf, rep in [
        ("ies", "y"),
        ("sses", "ss"),
        ("xes", "x"),
        ("zes", "z"),
        ("ches", "ch"),
        ("shes", "sh"),
        ("men", "man"),
        ("people", "person"),
        ("s", ""),
    ]:
        if len(w) > 3 and w.endswith(suf):
            return w[: -len(suf)] + rep
    return w


def metaphor_slot(word: str) -> str:
    w = word.strip().lower()
    if not w:
        return ""
    w = singularize(w)
    return SYNONYM_MAP.get(w, w)


def demonym_mnemonic(literal: str, demonym: str) -> str:
    country = literal.replace("-", " ")
    return f"{country} people are {demonym}"


def link_strength(row: dict[str, str]) -> tuple[int, int, str]:
    """Higher is stronger. Tie-break with shorter mnemonic, then emoji."""
    lit = row["literal"].strip().lower()
    meta = (row["metaphorical"] or "").strip().lower()
    mnem = (row["mnemonic"] or "").strip().lower()
    lit_words = set(re.split(r"[-\s]+", lit))

    score = 0
    if lit == meta:
        score += 200
    if meta in lit_words:
        score += 120
    if any(w in mnem for w in lit_words if len(w) > 2):
        score += 40
    if mnem.startswith(lit.replace("-", " ")):
        score += 30
    if f"{lit.replace('-', ' ')} " in mnem or f"{lit.replace('-', ' ')}," in mnem:
        score += 25
    if " means " in mnem:
        score += 15
    if len(mnem) <= 45:
        score += 10
  # penalize templated mnemonics copied across a cluster
    if mnem.count(";") >= 1 and " is " in mnem.split(";", 1)[1]:
        score -= 8
    if " is the " in mnem or " marks " in mnem and lit not in mnem:
        score -= 5

    return (score, -len(mnem), row["emoji"])


def apply_flag_demonyms(rows: list[dict[str, str]]) -> tuple[int, int]:
    used_demonyms: set[str] = set()
    filled = cleared = 0

    nation_rows = [r for r in rows if (r["metaphorical"] or "").strip().lower() == "nation"]

    def sort_key(row: dict[str, str]) -> tuple[int, str]:
        lit = row["literal"].strip()
        priority = 0 if lit in COUNTRY_PRIORITY else 1
        return (priority, lit)

    for row in sorted(nation_rows, key=sort_key):
        literal = row["literal"].strip()
        demonym = DEMONYMS.get(literal)
        if demonym is None:
            row["metaphorical"] = ""
            row["mnemonic"] = "REVIEW"
            cleared += 1
            continue
        if demonym in used_demonyms:
            row["metaphorical"] = ""
            row["mnemonic"] = "REVIEW"
            cleared += 1
            continue
        used_demonyms.add(demonym)
        row["metaphorical"] = demonym
        row["mnemonic"] = demonym_mnemonic(literal, demonym)
        filled += 1

    return filled, cleared


def apply_deduplication(rows: list[dict[str, str]]) -> int:
    """Clear weaker rows in duplicate metaphor slots. Returns cleared count."""
    slots: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        meta = (row["metaphorical"] or "").strip()
        if not meta:
            continue
        slot = metaphor_slot(meta)
        slots[slot].append(row)

    cleared = 0
    for slot, group in slots.items():
        if len(group) <= 1:
            continue
        ranked = sorted(group, key=link_strength, reverse=True)
        preferred = SLOT_KEEP_LITERAL.get(slot)
        keeper = ranked[0]
        if preferred:
            for candidate in group:
                if candidate["literal"].strip().lower() == preferred:
                    keeper = candidate
                    break
        for candidate in group:
            if candidate is keeper:
                continue
            candidate["metaphorical"] = ""
            candidate["mnemonic"] = "REVIEW"
            cleared += 1
    return cleared


def verify(rows: list[dict[str, str]]) -> list[str]:
    errors: list[str] = []
    slots: dict[str, list[str]] = defaultdict(list)
    for row in rows:
        meta = (row["metaphorical"] or "").strip()
        if not meta:
            continue
        slot = metaphor_slot(meta)
        slots[slot].append(f"{row['emoji']} {row['literal']}")

    for slot, items in slots.items():
        if len(items) > 1:
            errors.append(f"duplicate slot {slot!r}: {items}")

    nation_flags = [
        r for r in rows
        if (r["metaphorical"] or "").strip().lower() == "nation"
    ]
    if nation_flags:
        errors.append(f"{len(nation_flags)} rows still use metaphorical=nation")

    return errors


def main() -> None:
    with PUB_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    flag_filled, flag_cleared = apply_flag_demonyms(rows)
    dedup_cleared = apply_deduplication(rows)
    errors = verify(rows)

    with PUB_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    filled_meta = sum(1 for r in rows if (r["metaphorical"] or "").strip())
    review = sum(1 for r in rows if (r["mnemonic"] or "").strip() == "REVIEW")

    print(f"flags: {flag_filled} demonyms set, {flag_cleared} REVIEW")
    print(f"dedup: {dedup_cleared} rows cleared to REVIEW")
    print(f"filled metaphorical: {filled_meta}")
    print(f"REVIEW rows: {review}")
    if errors:
        print("VERIFY FAILED:")
        for e in errors[:20]:
            print(f"  - {e}")
        raise SystemExit(1)
    print("verify: ok")


if __name__ == "__main__":
    main()
