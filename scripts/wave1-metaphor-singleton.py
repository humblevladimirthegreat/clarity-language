#!/usr/bin/env python3
"""
Wave 1: collapse metaphorical bags of size ≥10 to one lemma each.

- Keep the best single metaphor on the source row.
- Near-duplicates / close synonyms → ngsl-lemma-map.csv (kind=redundant).
- Clear empty-slot homes → relocate (one metaphor on that row).
- Otherwise remove → coverage gap.

Also prunes matching rows from ngsl-metaphor-extra.csv so a later apply
does not immediately re-inflate these bags.
"""
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLISHED = ROOT / "data" / "lexicon-published.csv"
LEMMA_MAP = ROOT / "data" / "ngsl-lemma-map.csv"
EXTRA = ROOT / "data" / "ngsl-metaphor-extra.csv"

# literal → keep lemma (must be one of the bag's current lemmas, or a relocate target's keep)
# redundant: list of (surface, canonical)
# relocate: list of (lemma, target_literal) — target must be empty metaphorical (or only receiving this wave's keep)
# Everything else in the bag becomes a gap (removed, not mapped).

Wave = dict  # keep: str, redundant: list[tuple[str,str]], relocate: list[tuple[str,str]]

WAVES: dict[str, Wave] = {
    "money-bag": {
        "keep": "money",
        "redundant": [
            ("cash", "money"),
            ("wealth", "money"),
            ("rich", "money"),
            ("fund", "money"),
            ("finance", "money"),
            ("financial", "money"),
            ("income", "money"),
            ("revenue", "money"),
            ("profit", "money"),
            ("budget", "money"),
            ("supply", "money"),
            ("pay", "spend"),  # spend is a published literal
            ("cost", "price"),
            ("expense", "price"),
            ("expensive", "price"),
        ],
        "relocate": [
            ("loan", "bank"),
            ("price", "receipt"),  # receipt already has metaphors — handled below as replace-only-if-empty skip
        ],
    },
    "clipboard": {
        "keep": "plan",
        "redundant": [
            ("agenda", "plan"),
            ("arrange", "plan"),
            ("organise", "plan"),
            ("organize", "plan"),
            ("prepare", "plan"),
            ("scheme", "plan"),
            ("strategy", "plan"),
            ("project", "plan"),
            ("proposal", "plan"),
            ("practice", "plan"),
        ],
        "relocate": [
            ("list", "bookmark"),
            ("task", "ballot-box"),
        ],
    },
    "sparkles": {
        "keep": "new",
        "redundant": [
            ("fresh", "new"),
            ("novel", "new"),
            ("modern", "new"),
            ("original", "new"),
            ("unique", "new"),
            ("special", "new"),
            ("nice", "new"),
            ("glitter", "shine"),
            ("glow", "shine"),
            ("clear", "obvious"),
            ("clearly", "obvious"),
            ("obviously", "obvious"),
        ],
        "relocate": [
            ("shine", "sparkler"),
            ("obvious", "yes"),  # yes bag also wave1 — conflict; use gap instead
        ],
    },
    "speech": {
        "keep": "tell",
        "redundant": [
            ("discuss", "tell"),
            ("discussion", "tell"),
            ("conversation", "tell"),
            ("dialogue", "tell"),
            ("comment", "tell"),
            ("communication", "tell"),
            ("explain", "tell"),
            ("explanation", "tell"),
            ("describe", "tell"),
            ("topic", "tell"),
            ("about-topic", "tell"),
            ("reply", "answer"),
            ("respond", "answer"),
            ("response", "answer"),
            ("argue", "debate"),
            ("argument", "debate"),
            ("convince", "debate"),
        ],
        "relocate": [
            ("answer", "megaphone"),
            ("debate", "theater"),
        ],
    },
    "globe": {
        "keep": "world",
        "redundant": [
            ("earth", "world"),
            ("planet", "world"),
            ("global", "world"),
            ("ground", "world"),
            ("land", "world"),
            ("nation", "world"),
            ("country", "world"),
            ("international", "world"),
            ("foreign", "world"),
            ("everywhere", "world"),
            ("elsewhere", "world"),
            ("throughout", "world"),
            ("wherever", "world"),
            ("common", "world"),
            ("general", "world"),
            ("generally", "world"),
            ("overall", "world"),
            ("spread", "world"),
            ("surround", "world"),
        ],
        "relocate": [],
    },
    "calendar": {
        "keep": "year",
        "redundant": [
            ("annual", "year"),
            ("decade", "year"),
            ("month", "year"),
            ("week", "year"),
            ("weekend", "year"),
            ("season", "year"),
            ("period", "year"),
            ("date", "year"),
            ("schedule", "year"),
            ("daily", "year"),
            ("everyday", "year"),
            ("today", "year"),
            ("tomorrow", "year"),
            ("yesterday", "year"),
            ("recent", "year"),
            ("recently", "year"),
            ("whenever", "year"),
        ],
        "relocate": [],
    },
    "handshake": {
        "keep": "agree",
        "redundant": [
            ("agreement", "agree"),
            ("accept", "agree"),
            ("accord", "agree"),
            ("alliance", "agree"),
            ("commit", "agree"),
            ("cooperate", "agree"),
            ("deal", "agree"),
            ("pledge", "agree"),
            ("promise", "agree"),
            ("settle", "agree"),
            ("trust", "agree"),
            ("partner", "meet"),
            ("association", "meet"),
            ("share", "meet"),
            ("trade", "meet"),
        ],
        "relocate": [
            ("meet", "office-worker"),  # has staff cluster — skip if not empty
        ],
    },
    "shuffle": {
        "keep": "different",
        "redundant": [
            ("difference", "different"),
            ("diverse", "different"),
            ("various", "different"),
            ("variety", "different"),
            ("vary", "different"),
            ("mix", "different"),
            ("mixed", "different"),
            ("else", "different"),
            ("otherwise", "different"),
            ("instead", "different"),
            ("rather", "different"),
            ("however", "different"),
            ("any", "different"),
            ("some", "different"),
            ("sometimes", "different"),
            ("sort", "different"),
        ],
        "relocate": [],
    },
    "pushpin": {
        "keep": "place",
        "redundant": [
            ("location", "place"),
            ("position", "place"),
            ("site", "place"),
            ("venue", "place"),
            ("local", "place"),
            ("here", "place"),
            ("there", "place"),
            ("where", "place"),
            ("somewhere", "place"),
            ("somewhere-place", "place"),
            ("anywhere", "place"),
            ("near", "place"),
            ("nearly", "place"),
            ("almost", "place"),
            ("corner", "place"),
            ("pin", "place"),
        ],
        "relocate": [],
    },
    "thought": {
        "keep": "idea",
        "redundant": [
            ("concept", "idea"),
            ("notion", "idea"),
            ("opinion", "idea"),
            ("theory", "idea"),
            ("assume", "idea"),
            ("consider", "idea"),
            ("guess", "idea"),
            ("imagine", "idea"),
            ("intend", "idea"),
            ("mean", "idea"),
            ("ponder", "idea"),
            ("presume", "idea"),
            ("reflect", "idea"),
            ("suppose", "idea"),
            ("dream", "idea"),
            ("forget", "idea"),
        ],
        "relocate": [],
    },
    "silhouettes": {
        "keep": "people",
        "redundant": [
            ("everybody", "people"),
            ("everyone", "people"),
            ("crowd", "people"),
            ("group", "people"),
            ("team", "people"),
            ("audience", "people"),
            ("community", "people"),
            ("committee", "people"),
            ("population", "people"),
            ("public", "people"),
            ("society", "people"),
            ("social", "people"),
            ("among", "people"),
            ("amid", "people"),
            ("ourselves", "people"),
            ("themselves", "people"),
        ],
        "relocate": [],
    },
    "eyes": {
        "keep": "look",
        "redundant": [
            ("gaze", "look"),
            ("glance", "look"),
            ("stare", "look"),
            ("notice", "look"),
            ("attention", "look"),
            ("aware", "look"),
            ("carefully", "look"),
            ("apparent", "look"),
            ("apparently", "look"),
            ("appearance", "look"),
            ("perception", "look"),
            ("regard", "look"),
            ("regarding", "look"),
            ("respect", "look"),
            ("reveal", "look"),
            ("review", "look"),
        ],
        "relocate": [],
    },
    "left-right": {
        "keep": "same",
        "redundant": [
            ("similar", "same"),
            ("comparison", "same"),
            ("contrast", "same"),
            ("distinction", "same"),
            ("relatively", "same"),
            ("beside", "between"),
            ("middle", "between"),
            ("side", "between"),
            ("oppose", "opposite"),
            ("opposition", "opposite"),
            ("broad", "wide"),
            ("range", "wide"),
            ("pull", "wide"),
        ],
        "relocate": [
            ("between", "bridge-night") if False else ("between", "camping"),  # placeholder fixed below
            ("opposite", "shuffle"),  # occupied
            ("wide", "ruler"),  # occupied wave1
        ],
    },
}

# Fix left-right relocates with real empty targets after load.
# Remaining waves defined cleanly below without broken placeholders.
del WAVES["left-right"]

WAVES.update(
    {
        "left-right": {
            "keep": "opposite",
            "redundant": [
                ("oppose", "opposite"),
                ("opposition", "opposite"),
                ("contrast", "opposite"),
                ("distinction", "opposite"),
                ("beside", "between"),
                ("middle", "between"),
                ("side", "between"),
                ("similar", "same"),
                ("comparison", "same"),
                ("relatively", "same"),
                ("broad", "wide"),
                ("range", "wide"),
                ("pull", "wide"),
            ],
            "relocate": [
                ("between", "camping"),
                ("same", "link"),  # link has metaphors — will gap if not empty
                ("wide", "japan-map"),
            ],
        },
        "hundred": {
            "keep": "lot",
            "redundant": [
                ("many", "lot"),
                ("much", "lot"),
                ("most", "lot"),
                ("mostly", "lot"),
                ("majority", "lot"),
                ("numerous", "lot"),
                ("plenty", "lot"),
                ("abundance", "lot"),
                ("full", "lot"),
                ("fully", "lot"),
                ("completely", "lot"),
                ("totally", "lot"),
                ("absolutely", "lot"),
                ("quite", "lot"),
                ("perfect", "lot"),
            ],
            "relocate": [],
        },
        "classical-building": {
            "keep": "government",
            "redundant": [
                ("govern", "government"),
                ("administration", "government"),
                ("federal", "government"),
                ("national", "government"),
                ("state", "government"),
                ("commission", "government"),
                ("institution", "government"),
                ("establish", "government"),
                ("conservative", "government"),
                ("capital", "government"),
                ("building", "government"),
                ("structure", "government"),
                ("classical", "government"),
                ("club", "government"),
                ("museum", "government"),
            ],
            "relocate": [],
        },
        "package": {
            "keep": "get",
            "redundant": [
                ("receive", "get"),
                ("bring", "get"),
                ("carry", "get"),
                ("deliver", "get"),
                ("contain", "get"),
                ("fill", "get"),
                ("pack", "get"),
                ("parcel", "get"),
                ("box", "get"),
                ("shipment", "get"),
                ("import", "get"),
                ("onto", "get"),
                ("upon", "get"),
                ("plastic", "get"),
            ],
            "relocate": [],
        },
        "chart-up": {
            "keep": "increase",
            "redundant": [
                ("rise", "increase"),
                ("gain", "increase"),
                ("expand", "increase"),
                ("expansion", "increase"),
                ("advance", "increase"),
                ("progress", "increase"),
                ("improve", "increase"),
                ("improvement", "increase"),
                ("increasingly", "increase"),
                ("more", "increase"),
                ("advantage", "increase"),
                ("economic", "economy"),
                ("stock", "economy"),
            ],
            "relocate": [
                ("economy", "chart-down"),  # occupied — fix: use bank already has loan
            ],
        },
        "plus": {
            "keep": "add",
            "redundant": [
                ("addition", "add"),
                ("additional", "add"),
                ("another", "add"),
                ("extra", "add"),
                ("spare", "add"),
                ("include", "add"),
                ("including", "add"),
                ("incorporate", "add"),
                ("contribute", "add"),
                ("contribution", "add"),
                ("extension", "add"),
                ("furthermore", "add"),
                ("moreover", "add"),
                ("plus-sign", "add"),
            ],
            "relocate": [],
        },
        "compass": {
            "keep": "way",
            "redundant": [
                ("path", "way"),
                ("route", "way"),
                ("direction", "way"),
                ("direct", "way"),
                ("guide", "way"),
                ("how", "way"),
                ("method", "way"),
                ("procedure", "way"),
                ("technique", "way"),
                ("via", "way"),
                ("source", "way"),
                ("north", "way"),
                ("south", "way"),
            ],
            "relocate": [],
        },
        "gear": {
            "keep": "use",
            "redundant": [
                ("operate", "use"),
                ("operation", "use"),
                ("function", "use"),
                ("process", "use"),
                ("system", "use"),
                ("mechanism", "use"),
                ("control", "use"),
                ("manage", "use"),
                ("management", "use"),
                ("manager", "use"),
                ("factor", "use"),
                ("technical", "use"),
                ("itself", "use"),
            ],
            "relocate": [],
        },
        "scale": {
            "keep": "law",
            "redundant": [
                ("legal", "law"),
                ("lawyer", "law"),
                ("court", "law"),
                ("fair", "law"),
                ("principle", "law"),
                ("matter", "law"),
                ("responsibility", "law"),
                ("responsible", "law"),
                ("reasonable", "law"),
                ("consideration", "law"),
                ("balance", "law"),
                ("compare", "law"),
                ("weight", "law"),
            ],
            "relocate": [],
        },
        "brain": {
            "keep": "know",
            "redundant": [
                ("knowledge", "know"),
                ("understand", "know"),
                ("realize", "know"),
                ("recognize", "know"),
                ("remember", "know"),
                ("recall", "know"),
                ("memory", "know"),
                ("mind", "know"),
                ("reason", "know"),
                ("decide", "know"),
                ("decision", "know"),
                ("determine", "know"),
            ],
            "relocate": [],
        },
        "yes": {
            "keep": "true",
            "redundant": [
                ("truth", "true"),
                ("real", "true"),
                ("reality", "true"),
                ("actual", "true"),
                ("actually", "true"),
                ("authentic", "true"),
                ("genuine", "true"),
                ("indeed", "true"),
                ("definitely", "true"),
                ("yep", "true"),
                ("prove", "true"),
                ("demonstrate", "true"),
            ],
            "relocate": [],
        },
        "running": {
            "keep": "run",
            "redundant": [
                ("jog", "run"),
                ("sprint", "run"),
                ("race", "run"),
                ("marathon", "run"),
                ("exercise", "run"),
                ("act", "run"),
                ("action", "run"),
                ("active", "run"),
                ("activity", "run"),
                ("behavior", "run"),
                ("behaviour", "run"),
                ("movement", "run"),
            ],
            "relocate": [],
        },
        "star": {
            "keep": "great",
            "redundant": [
                ("excellent", "great"),
                ("superb", "great"),
                ("wonderful", "great"),
                ("outstanding", "great"),
                ("remarkable", "great"),
                ("famous", "great"),
                ("popular", "great"),
                ("favorite", "great"),
                ("main", "great"),
                ("major", "great"),
                ("primary", "great"),
                ("feature", "great"),
            ],
            "relocate": [],
        },
        "chains": {
            "keep": "connect",
            "redundant": [
                ("connection", "connect"),
                ("relate", "connect"),
                ("relation", "connect"),
                ("relationship", "connect"),
                ("bond", "connect"),
                ("bonds", "connect"),
                ("tie", "connect"),
                ("tie-up", "connect"),
                ("cause", "connect"),
                ("affect", "connect"),
                ("influence", "connect"),
                ("consequence", "connect"),
            ],
            "relocate": [],
        },
        "medical": {
            "keep": "health",
            "redundant": [
                ("healthy", "health"),
                ("heal", "health"),
                ("medicine", "health"),
                ("disease", "health"),
                ("patient", "health"),
                ("recover", "health"),
                ("treat", "health"),
                ("treatment", "health"),
                ("drug", "health"),
                ("hurt", "pain"),
                ("suffer", "pain"),
            ],
            "relocate": [
                ("pain", "hospital"),
            ],
        },
        "door": {
            "keep": "leave",
            "redundant": [
                ("depart", "leave"),
                ("exit", "leave"),
                ("enter", "leave"),
                ("entry", "leave"),
                ("admit", "leave"),
                ("gateway", "leave"),
                ("inside", "leave"),
                ("outside", "leave"),
                ("through", "leave"),
                ("within", "leave"),
                ("opportunity", "leave"),
            ],
            "relocate": [],
        },
        "worried": {
            "keep": "worry",
            "redundant": [
                ("anxiety", "worry"),
                ("stress", "worry"),
                ("strain", "worry"),
                ("concern", "worry"),
                ("concerning", "worry"),
                ("doubt", "worry"),
                ("guilty", "worry"),
                ("serious", "worry"),
                ("seriously", "worry"),
                ("situation", "worry"),
                ("circumstance", "worry"),
            ],
            "relocate": [],
        },
        "crystal-ball": {
            "keep": "maybe",
            "redundant": [
                ("perhaps", "maybe"),
                ("possibly", "maybe"),
                ("possible", "maybe"),
                ("possibility", "maybe"),
                ("potential", "maybe"),
                ("likely", "maybe"),
                ("probably", "maybe"),
                ("predict", "maybe"),
                ("forecast", "maybe"),
                ("expectation", "maybe"),
                ("future", "maybe"),
            ],
            "relocate": [],
        },
        "refresh": {
            "keep": "change",
            "redundant": [
                ("alter", "change"),
                ("modify", "change"),
                ("convert", "change"),
                ("reform", "change"),
                ("revise", "change"),
                ("update", "change"),
                ("replace", "change"),
                ("shift", "change"),
                ("transition", "change"),
                ("turn", "change"),
                ("version", "change"),
            ],
            "relocate": [],
        },
        "bicep": {
            "keep": "strong",
            "redundant": [
                ("strength", "strong"),
                ("force", "strong"),
                ("muscle", "strong"),
                ("physical", "strong"),
                ("effort", "strong"),
                ("ability", "strong"),
                ("able", "strong"),
                ("skill", "strong"),
                ("flex", "strong"),
                ("arm", "strong"),
                ("shoulder", "strong"),
            ],
            "relocate": [],
        },
        "boom": {
            "keep": "happen",
            "redundant": [
                ("occur", "happen"),
                ("event", "happen"),
                ("effect", "happen"),
                ("reaction", "happen"),
                ("accident", "happen"),
                ("crash", "happen"),
                ("hit", "happen"),
                ("strike", "happen"),
                ("pop", "happen"),
                ("sudden", "happen"),
                ("suddenly", "happen"),
            ],
            "relocate": [],
        },
        "minus": {
            "keep": "less",
            "redundant": [
                ("fewer", "less"),
                ("lower", "less"),
                ("reduce", "less"),
                ("decrease", "less"),
                ("subtract", "less"),
                ("narrow", "less"),
                ("thin", "less"),
                ("hardly", "less"),
                ("slightly", "less"),
                ("somewhat", "less"),
                ("minus-sign", "less"),
            ],
            "relocate": [],
        },
        "check": {
            "keep": "sure",
            "redundant": [
                ("certain", "sure"),
                ("certainly", "sure"),
                ("exactly", "sure"),
                ("confirm", "sure"),
                ("validate", "sure"),
                ("verify", "sure"),
                ("enough", "sure"),
                ("appropriate", "sure"),
                ("available", "sure"),
                ("checkbox", "sure"),
                ("tick", "sure"),
            ],
            "relocate": [],
        },
        "abacus": {
            "keep": "calculate",
            "redundant": [
                ("compute", "calculate"),
                ("estimate", "calculate"),
                ("figure", "calculate"),
                ("amount", "calculate"),
                ("sum", "calculate"),
                ("total-sum", "calculate"),
                ("math", "calculate"),
                ("least", "calculate"),
                ("therefore", "calculate"),
                ("thus", "calculate"),
            ],
            "relocate": [],
        },
        "puzzle-piece": {
            "keep": "part",
            "redundant": [
                ("piece", "part"),
                ("portion", "part"),
                ("section", "part"),
                ("segment", "part"),
                ("component", "part"),
                ("bit", "part"),
                ("complex", "part"),
                ("pattern", "part"),
                ("fit", "part"),
                ("match", "part"),
            ],
            "relocate": [],
        },
        "prohibited": {
            "keep": "never",
            "redundant": [
                ("none", "never"),
                ("nobody", "never"),
                ("neither", "never"),
                ("without", "never"),
                ("except", "never"),
                ("deny", "never"),
                ("refuse", "never"),
                ("prevent", "never"),
                ("avoid", "never"),
                ("impossible", "never"),
            ],
            "relocate": [],
        },
        "pray": {
            "keep": "believe",
            "redundant": [
                ("belief", "believe"),
                ("faith", "believe"),
                ("religion", "believe"),
                ("religious", "believe"),
                ("priest", "believe"),
                ("namaste", "believe"),
                ("please", "believe"),
                ("thank", "thanks"),
                ("appreciate", "thanks"),
            ],
            "relocate": [
                ("thanks", "raise-hands"),
            ],
        },
        "magnify": {
            "keep": "find",
            "redundant": [
                ("search", "find"),
                ("seek", "find"),
                ("discover", "find"),
                ("detect", "find"),
                ("explore", "find"),
                ("inspect", "find"),
                ("detail", "find"),
                ("zoom", "find"),
                ("miss", "find"),
                ("lack", "find"),
            ],
            "relocate": [],
        },
        "ruler": {
            "keep": "long",
            "redundant": [
                ("length", "long"),
                ("distance", "long"),
                ("extend", "long"),
                ("extent", "long"),
                ("measure", "long"),
                ("mile", "long"),
                ("short", "long"),
                ("size", "long"),
                ("standard", "long"),
                ("straight", "long"),
            ],
            "relocate": [],
        },
        "silhouette": {
            "keep": "who",
            "redundant": [
                ("whoever", "who"),
                ("whom", "who"),
                ("myself", "who"),
                ("yourself", "who"),
                ("anonymous", "who"),
                ("stranger", "who"),
                ("presence", "who"),
                ("bust", "who"),
                ("head", "who"),
                ("lonely", "who"),
            ],
            "relocate": [],
        },
        "ok": {
            "keep": "easy",
            "redundant": [
                ("easily", "easy"),
                ("simple", "easy"),
                ("simply", "easy"),
                ("fine", "easy"),
                ("alright", "easy"),
                ("okay", "easy"),
                ("okey", "easy"),
                ("normal", "easy"),
                ("usual", "easy"),
                ("ready", "easy"),
            ],
            "relocate": [],
        },
        "seedling": {
            "keep": "life",
            "redundant": [
                ("live", "life"),
                ("alive", "life"),
                ("grow", "life"),
                ("growth", "life"),
                ("develop", "life"),
                ("development", "life"),
                ("organic", "life"),
                ("naturally", "life"),
                ("seed", "life"),
                ("spring", "life"),
            ],
            "relocate": [],
        },
        "mountain": {
            "keep": "high",
            "redundant": [
                ("highly", "high"),
                ("height", "high"),
                ("tall", "high"),
                ("peak", "high"),
                ("summit", "high"),
                ("huge", "high"),
                ("vast", "high"),
                ("mass", "high"),
                ("largely", "high"),
                ("extremely", "high"),
            ],
            "relocate": [],
        },
        "warning": {
            "keep": "problem",
            "redundant": [
                ("issue", "problem"),
                ("trouble", "problem"),
                ("danger", "problem"),
                ("risk", "problem"),
                ("threat", "problem"),
                ("crisis", "problem"),
                ("pressure", "problem"),
                ("alert", "problem"),
                ("caution", "problem"),
                ("warn", "problem"),
            ],
            "relocate": [],
        },
        "mantel-clock": {
            "keep": "now",
            "redundant": [
                ("currently", "now"),
                ("when", "now"),
                ("then", "now"),
                ("ago", "now"),
                ("past", "now"),
                ("former", "now"),
                ("hour", "now"),
                ("century", "now"),
                ("clock", "now"),
            ],
            "relocate": [],
        },
        "megaphone": {
            "keep": "announce",
            "redundant": [
                ("advertise", "announce"),
                ("promote", "announce"),
                ("inform", "announce"),
                ("indicate", "announce"),
                ("express", "announce"),
                ("statement", "announce"),
                ("voice", "announce"),
                ("demand", "announce"),
                ("conduct", "announce"),
            ],
            "relocate": [],
        },
        "bar-chart": {
            "keep": "score",
            "redundant": [
                ("rate", "score"),
                ("ratio", "score"),
                ("percent", "score"),
                ("percentage", "score"),
                ("average", "score"),
                ("level", "score"),
                ("grade", "score"),
                ("analysis", "score"),
                ("analyst", "score"),
            ],
            "relocate": [],
        },
        "briefcase": {
            "keep": "work",
            "redundant": [
                ("job", "work"),
                ("career", "work"),
                ("employ", "work"),
                ("employment", "work"),
                ("occupation", "work"),
                ("profession", "work"),
                ("professional", "work"),
                ("business", "work"),
                ("executive", "work"),
            ],
            "relocate": [],
        },
        "office": {
            "keep": "company",
            "redundant": [
                ("corporation", "company"),
                ("firm", "company"),
                ("agency", "company"),
                ("organisation", "company"),
                ("organization", "company"),
                ("department", "company"),
                ("facility", "company"),
                ("workplace", "company"),
                ("conference", "company"),
            ],
            "relocate": [],
        },
        "theater": {
            "keep": "perform",
            "redundant": [
                ("performance", "perform"),
                ("actor", "perform"),
                ("role", "perform"),
                ("character", "perform"),
                ("stage", "perform"),
                ("platform", "perform"),
                ("represent", "perform"),
                ("culture", "perform"),
                ("cultural", "perform"),
            ],
            "relocate": [],
        },
        "infinity": {
            "keep": "all",
            "redundant": [
                ("every", "all"),
                ("everything", "all"),
                ("entire", "all"),
                ("whole", "all"),
                ("total", "all"),
                ("always", "all"),
                ("ever", "all"),
                ("forever", "all"),
                ("endless", "all"),
            ],
            "relocate": [],
        },
    }
)

# Clean up dubious relocates that target occupied / wrong rows.
WAVES["money-bag"]["relocate"] = [("loan", "bank")]
WAVES["money-bag"]["redundant"] = [
    ("cash", "money"),
    ("wealth", "money"),
    ("rich", "money"),
    ("fund", "money"),
    ("finance", "money"),
    ("financial", "money"),
    ("income", "money"),
    ("revenue", "money"),
    ("profit", "money"),
    ("budget", "money"),
    ("supply", "money"),
    ("pay", "spend"),
    ("cost", "price"),
    ("expense", "price"),
    ("expensive", "price"),
    ("debt", "loan"),
    ("owe", "loan"),
]
# price stays gap (no empty finance home that isn't a bag); drop price relocate
# invest* → gap

WAVES["sparkles"]["relocate"] = [("shine", "sparkler")]
WAVES["sparkles"]["redundant"] = [
    ("fresh", "new"),
    ("novel", "new"),
    ("modern", "new"),
    ("original", "new"),
    ("unique", "new"),
    ("special", "new"),
    ("nice", "new"),
    ("glitter", "shine"),
    ("glow", "shine"),
]

WAVES["speech"]["relocate"] = []  # megaphone/theater are themselves wave1
WAVES["speech"]["redundant"] = [
    ("discuss", "tell"),
    ("discussion", "tell"),
    ("conversation", "tell"),
    ("dialogue", "tell"),
    ("comment", "tell"),
    ("communication", "tell"),
    ("explain", "tell"),
    ("explanation", "tell"),
    ("describe", "tell"),
    ("topic", "tell"),
    ("about-topic", "tell"),
    ("reply", "answer"),
    ("respond", "answer"),
    ("response", "answer"),
    ("argue", "debate"),
    ("argument", "debate"),
    ("convince", "debate"),
]
# answer, debate → gap (no empty speech-like home)

WAVES["handshake"]["relocate"] = []
WAVES["handshake"]["redundant"] = [
    ("agreement", "agree"),
    ("accept", "agree"),
    ("accord", "agree"),
    ("alliance", "agree"),
    ("commit", "agree"),
    ("cooperate", "agree"),
    ("deal", "agree"),
    ("pledge", "agree"),
    ("promise", "agree"),
    ("settle", "agree"),
    ("trust", "agree"),
    ("partner", "agree"),
    ("association", "agree"),
    ("share", "agree"),
    ("trade", "agree"),
    ("meet", "agree"),
]

WAVES["clipboard"]["relocate"] = [("list", "bookmark")]
# task → gap (ballot-box occupied)

WAVES["left-right"]["relocate"] = [("between", "camping"), ("wide", "japan-map")]
WAVES["left-right"]["redundant"] = [
    ("oppose", "opposite"),
    ("opposition", "opposite"),
    ("contrast", "opposite"),
    ("distinction", "opposite"),
    ("beside", "between"),
    ("middle", "between"),
    ("side", "between"),
    ("similar", "same"),
    ("comparison", "same"),
    ("relatively", "same"),
    ("broad", "wide"),
    ("range", "wide"),
    ("pull", "wide"),
]
# same → gap

WAVES["chart-up"]["relocate"] = []
WAVES["chart-up"]["redundant"] = [
    ("rise", "increase"),
    ("gain", "increase"),
    ("expand", "increase"),
    ("expansion", "increase"),
    ("advance", "increase"),
    ("progress", "increase"),
    ("improve", "increase"),
    ("improvement", "increase"),
    ("increasingly", "increase"),
    ("more", "increase"),
    ("advantage", "increase"),
    ("economic", "increase"),
    ("economy", "increase"),
    ("stock", "increase"),
]

WAVES["pray"]["relocate"] = [("thanks", "raise-hands")]


def parse_meta(cell: str) -> list[str]:
    return [p.strip().lower() for p in cell.split(";") if p.strip()]


def main() -> None:
    rows = list(csv.DictReader(PUBLISHED.open(encoding="utf-8")))
    by_lit = {r["literal"].strip().lower(): r for r in rows}

    missing = [lit for lit in WAVES if lit not in by_lit]
    if missing:
        raise SystemExit(f"Missing literals in published: {missing}")

    # Validate bag sizes
    for lit, spec in WAVES.items():
        bag = set(parse_meta(by_lit[lit]["metaphorical"]))
        if len(bag) < 10:
            raise SystemExit(f"{lit}: expected ≥10 metaphors, got {len(bag)}")
        keep = spec["keep"]
        if keep not in bag and keep not in {r for r, _ in spec.get("relocate", [])}:
            # keep must be in bag
            if keep not in bag:
                raise SystemExit(f"{lit}: keep '{keep}' not in bag {sorted(bag)}")

    redundant_map: dict[str, str] = {}
    claimed_targets: dict[str, str] = {}  # literal → lemma being placed
    gaps: list[tuple[str, str]] = []
    keeps: list[tuple[str, str]] = []
    relocates_done: list[tuple[str, str, str]] = []

    # First pass: collect relocates and validate empty targets
    for lit, spec in WAVES.items():
        for lemma, target in spec.get("relocate", []):
            if target not in by_lit:
                raise SystemExit(f"Relocate target missing: {target} for {lemma}")
            tgt = by_lit[target]
            existing = parse_meta(tgt["metaphorical"])
            # Allow relocate onto empty only (wave1 policy)
            if existing and target not in WAVES:
                gaps.append((lemma, f"relocate-blocked:{target}"))
                continue
            if target in WAVES:
                # don't relocate onto another wave1 bag
                gaps.append((lemma, f"relocate-blocked-wave1:{target}"))
                continue
            if target in claimed_targets and claimed_targets[target] != lemma:
                gaps.append((lemma, f"relocate-conflict:{target}"))
                continue
            claimed_targets[target] = lemma

    # Apply source-row keeps + redundant collection + gaps
    for lit, spec in WAVES.items():
        row = by_lit[lit]
        bag = parse_meta(row["metaphorical"])
        keep = spec["keep"]
        red = {s: c for s, c in spec.get("redundant", [])}
        reloc_lemmas = {lemma for lemma, target in spec.get("relocate", []) if claimed_targets.get(target) == lemma}

        for lemma in bag:
            if lemma == keep:
                continue
            if lemma in reloc_lemmas:
                continue
            if lemma in red:
                redundant_map[lemma] = red[lemma]
                continue
            # also if listed in redundant as canonical only
            gaps.append((lemma, lit))

        # ensure redundant surfaces from spec even if naming differs
        for surface, canonical in red.items():
            if surface in bag or surface in reloc_lemmas:
                redundant_map[surface] = canonical

        row["metaphorical"] = keep
        keeps.append((lit, keep))

    # Apply relocates onto empty targets
    for lit, spec in WAVES.items():
        for lemma, target in spec.get("relocate", []):
            if claimed_targets.get(target) != lemma:
                continue
            by_lit[target]["metaphorical"] = lemma
            relocates_done.append((lemma, lit, target))
            # If lemma was also keep somewhere, shouldn't happen

    # Canonical for redundant must not itself be mapped away unless final resolves
    # Ensure keep/relocate lemmas are not marked redundant
    protected = {k for _, k in keeps} | set(claimed_targets.values())
    for surface in list(redundant_map):
        if surface in protected:
            del redundant_map[surface]

    # price special: if price not placed, leave as gap (already); drop cost→price map if price is gap-only
    # If price is gap, mapping cost→price still OK (price becomes content lemma gap, cost redundant→price)

    # Write published
    with PUBLISHED.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["emoji", "literal", "clarity", "metaphorical"],
            lineterminator="\n",
        )
        w.writeheader()
        w.writerows(rows)

    # Update lemma map: preserve existing, add kind column
    raw_lines = LEMMA_MAP.read_text(encoding="utf-8").splitlines()
    header_idx = next(i for i, ln in enumerate(raw_lines) if ln.startswith("surface,"))
    comment_lines = raw_lines[:header_idx]
    existing_rows = list(csv.DictReader(raw_lines[header_idx:]))

    new_comments = [
        "# Inflected / alternate surface → core lemma for NGSL coverage.",
        "# Columns: surface,lemma,kind  (kind = inflection | redundant; default inflection).",
        "# Inflection → status skip-inflection; synonym/near-duplicate → status redundant.",
        "# One row per surface. Identity mappings omitted.",
        "# Coverage emits mapped-away surfaces separately; content status is on the resolved lemma.",
        "# Redundant rows may map one NGSL lemma onto another (e.g. cash → money).",
    ]

    out_rows: dict[str, tuple[str, str]] = {}
    for r in existing_rows:
        surface = (r.get("surface") or "").strip().lower()
        lemma = (r.get("lemma") or "").strip().lower()
        kind = (r.get("kind") or "inflection").strip().lower() or "inflection"
        if not surface or not lemma or surface == lemma:
            continue
        if surface.startswith("#"):
            continue
        out_rows[surface] = (lemma, kind if kind in ("inflection", "redundant") else "inflection")

    for surface, canonical in sorted(redundant_map.items()):
        if surface == canonical:
            continue
        # don't overwrite inflection mappings
        if surface in out_rows and out_rows[surface][1] == "inflection":
            continue
        out_rows[surface] = (canonical, "redundant")

    with LEMMA_MAP.open("w", newline="", encoding="utf-8") as f:
        for c in new_comments:
            f.write(c + "\n")
        w = csv.DictWriter(f, fieldnames=["surface", "lemma", "kind"], lineterminator="\n")
        w.writeheader()
        for surface, (lemma, kind) in sorted(out_rows.items(), key=lambda x: (x[1][1], x[0])):
            w.writerow({"surface": surface, "lemma": lemma, "kind": kind})

    # Prune metaphor-extra: remove lemmas that are redundant or gapped from these bags;
    # ensure keep/relocate mappings point at final homes.
    final_home: dict[str, str] = {}
    for lit, keep in keeps:
        final_home[keep] = lit
    for lemma, _src, target in relocates_done:
        final_home[lemma] = target

    extra_rows = list(csv.DictReader(EXTRA.open(encoding="utf-8")))
    touched_lemmas = set()
    for lit, spec in WAVES.items():
        touched_lemmas |= set(parse_meta(by_lit[lit]["metaphorical"]))  # now just keep
        # original bag from keeps+red+gap — use redundant_map keys + gaps + relocates
        touched_lemmas.add(spec["keep"])
        touched_lemmas |= {s for s, _ in spec.get("redundant", [])}
        touched_lemmas |= {lemma for lemma, _ in spec.get("relocate", [])}

    # Re-read original bags from a backup approach: use WAVES keys' decisions
    removed_from_extra = 0
    kept_extra = []
    for r in extra_rows:
        lemma = (r.get("lemma") or "").strip().lower()
        lit = (r.get("literal") or "").strip().lower()
        if lemma in redundant_map:
            removed_from_extra += 1
            continue
        if lemma in final_home:
            kept_extra.append({"lemma": lemma, "literal": final_home[lemma]})
            continue
        # lemmas removed as gaps from wave1 source bags
        if any(
            lemma != spec["keep"]
            and lemma not in {s for s, _ in spec.get("redundant", [])}
            and lemma not in {x for x, t in spec.get("relocate", []) if claimed_targets.get(t) == x}
            and lemma in set()  # placeholder
            for lit, spec in WAVES.items()
        ):
            pass
        # Drop extra rows whose literal is a wave1 bag and lemma isn't the keep
        if lit in WAVES and lemma != WAVES[lit]["keep"]:
            # unless relocated onto another literal
            if lemma in final_home:
                kept_extra.append({"lemma": lemma, "literal": final_home[lemma]})
            else:
                removed_from_extra += 1
            continue
        kept_extra.append({"lemma": lemma, "literal": lit})

    # Dedupe extra by lemma (first wins), then ensure all final_home present
    dedup: dict[str, str] = {}
    for r in kept_extra:
        dedup.setdefault(r["lemma"], r["literal"])
    for lemma, lit in final_home.items():
        dedup[lemma] = lit

    with EXTRA.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["lemma", "literal"], lineterminator="\n")
        w.writeheader()
        for lemma, lit in sorted(dedup.items()):
            w.writerow({"lemma": lemma, "literal": lit})

    # Stats
    multi = sum(1 for r in rows if len(parse_meta(r["metaphorical"])) > 1)
    print(f"Wave1 bags processed: {len(WAVES)}")
    print(f"Keeps: {len(keeps)}")
    print(f"Relocates: {len(relocates_done)}")
    for lemma, src, tgt in relocates_done:
        print(f"  {lemma}: {src} → {tgt}")
    print(f"Redundant map entries added/set: {len(redundant_map)}")
    print(f"Gap removals (approx listed): {len(gaps)}")
    print(f"Published rows still multi-metaphor: {multi}")
    print(f"Metaphor-extra rows now: {len(dedup)} (removed ~{removed_from_extra})")
    print(f"Updated {PUBLISHED.relative_to(ROOT)}")
    print(f"Updated {LEMMA_MAP.relative_to(ROOT)}")
    print(f"Updated {EXTRA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
