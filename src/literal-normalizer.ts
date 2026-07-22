/**
 * Normalize Unicode emoji names into Phase 1 literal glosses.
 * See docs/lexicon-strategy.md.
 */

const FILLER_WORDS = /\b(and|the)\b/gi;

/** Strip skin-tone / hair / gender suffixes after a colon. */
export function stripVariantSuffix(name: string): string {
  return name
    .replace(
      /:\s*(?:light|medium-light|medium|medium-dark|dark) skin tone(?:,\s*(?:light|medium-light|medium|medium-dark|dark) skin tone)?$/i,
      "",
    )
    .replace(/:\s*(?:red|curly|white|blond) hair$/i, "")
    .replace(/:\s*bald$/i, "")
    .replace(/:\s*beard$/i, "")
    .trim();
}

/** Strip leading gender/role prefix so variants share a literal. */
export function stripGenderPrefix(name: string): string {
  return name.replace(/^(?:man|woman|boy|girl|person)\s+/i, "").trim();
}

function normalizePossessives(name: string): string {
  return name.replace(/(?:[''\u2019]|`)s\b/gi, "s");
}

function preprocessName(name: string): string {
  return normalizePossessives(name)
    .replace(/e-mail/gi, "email")
    .replace(/['''\u2018\u2019\u201c\u201d""„«»`]/g, "")
    .replace(/\s*\(blood type\)\s*/gi, " blood-type")
    .trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/&/g, " ")
    .replace(FILLER_WORDS, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Exact name → literal overrides (after variant/gender stripping). */
const NAME_LITERAL: Record<string, string> = {
  books: "book-stack",
  "gem stone": "gemstone",
  "mouse trap": "mousetrap",
  "potable water": "drinking-water",
  "non-potable water": "non-drinking-water",
  "chart increasing with yen": "chart-increasing-yen",
  "magnifying glass tilted left": "magnifying-glass-left",
  "magnifying glass tilted right": "magnifying-glass-right",
  "one-piece swimsuit": "one-piece-swimsuit",
  "folding hand fan": "hand-fan",
  "thong sandal": "sandal",
  "running shoe": "sneaker",
  "hiking boot": "boot",
  "flat shoe": "flat-shoe",
  "high-heeled shoe": "high-heel",
  "ballet shoes": "ballet-shoe",
  "hair pick": "hair-pick",
  "rescue workers helmet": "rescue-helmet",
  "womans clothes": "womans-clothes",
  "mans shoe": "mans-shoe",
  "womans sandal": "womans-sandal",
  "womans boot": "womans-boot",
  "womans hat": "womans-hat",
  "military helmet": "helmet",
  "prayer beads": "prayer-bead",
  "shopping bags": "shopping-bag",
  "musical notes": "musical-note",
  "musical note": "musical-note",
  "speaker low volume": "speaker",
  "speaker medium volume": "speaker",
  "speaker high volume": "speaker",
  "computer mouse": "mouse",
  "computer disk": "disk",
  "optical disk": "optical-disk",
  "floppy disk": "floppy-disk",
  "desktop computer": "desktop-computer",
  "mobile phone": "phone",
  "mobile phone with arrow": "phone-with-arrow",
  "telephone receiver": "phone-receiver",
  "fax machine": "fax",
  "electric plug": "plug",
  "low battery": "low-battery",
  "film frames": "film-frame",
  "video camera": "video-camera",
  "movie camera": "movie-camera",
  "camera with flash": "camera-flash",
  "red paper lantern": "paper-lantern",
  "diya lamp": "oil-lamp",
  "notebook with decorative cover": "notebook",
  "page with curl": "page-curl",
  "page facing up": "page",
  "rolled-up newspaper": "newspaper-roll",
  "bookmark tabs": "bookmark-tab",
  "money with wings": "flying-money",
  "yen banknote": "yen-bill",
  "dollar banknote": "dollar-bill",
  "euro banknote": "euro-bill",
  "pound banknote": "pound-bill",
  "incoming envelope": "envelope-incoming",
  "envelope with arrow": "envelope-arrow",
  "outbox tray": "outbox",
  "inbox tray": "inbox",
  "closed mailbox with raised flag": "mailbox-closed-up",
  "closed mailbox with lowered flag": "mailbox-closed-down",
  "open mailbox with raised flag": "mailbox-open-up",
  "open mailbox with lowered flag": "mailbox-open-down",
  "ballot box with ballot": "ballot-box",
  "black nib": "nib",
  "tear-off calendar": "calendar-tear-off",
  "spiral notepad": "notepad",
  "spiral calendar": "calendar-spiral",
  "card index dividers": "index-divider",
  "card index": "index-card",
  "chart increasing": "chart-up",
  "chart decreasing": "chart-down",
  "bar chart": "bar-chart",
  "round pushpin": "pushpin-round",
  "linked paperclips": "paperclip-chain",
  "straight ruler": "ruler",
  "triangular ruler": "set-square",
  "card file box": "file-box",
  "file cabinet": "filing-cabinet",
  "locked with pen": "lock-pen",
  "locked with key": "lock-key",
  "old key": "key-old",
  "hammer and pick": "hammer-pick",
  "hammer and wrench": "hammer-wrench",
  "bow and arrow": "bow-arrow",
  "nut and bolt": "nut-bolt",
  "crossed swords": "sword-crossed",
  "carpentry saw": "saw",
  "balance scale": "scale",
  "white cane": "cane",
  "broken chain": "chain-broken",
  "drop of blood": "blood-drop",
  "adhesive bandage": "bandage",
  "couch and lamp": "couch-lamp",
  "roll of paper": "paper-roll",
  "lotion bottle": "lotion",
  "safety pin": "safety-pin",
  "fire extinguisher": "extinguisher",
  "shopping cart": "cart",
  "funeral urn": "urn",
  "nazar amulet": "nazar",
  "identification card": "id-card",
  "litter in bin sign": "litter-bin-sign",
  "wheelchair symbol": "wheelchair",
  "men's room": "mens-room",
  "women's room": "womens-room",
  "water closet": "wc",
  "passport control": "passport-control",
  "baggage claim": "baggage-claim",
  "left luggage": "luggage-locker",
  "children crossing": "children-crossing",
  "no entry": "no-entry",
  "no bicycles": "no-bicycle",
  "no smoking": "no-smoking",
  "no littering": "no-littering",
  "no pedestrians": "no-pedestrian",
  "no mobile phones": "no-phone",
  "no one under eighteen": "no-minors",
  "up-right arrow": "arrow-up-right",
  "down-right arrow": "arrow-down-right",
  "down-left arrow": "arrow-down-left",
  "up-left arrow": "arrow-up-left",
  "up-down arrow": "arrow-up-down",
  "left-right arrow": "arrow-left-right",
  "right arrow curving left": "arrow-curve-left",
  "left arrow curving right": "arrow-curve-right",
  "right arrow curving up": "arrow-curve-up",
  "right arrow curving down": "arrow-curve-down",
  "clockwise vertical arrows": "arrow-clockwise",
  "counterclockwise arrows button": "arrow-counterclockwise",
  "BACK arrow": "arrow-back",
  "END arrow": "arrow-end",
  "ON! arrow": "arrow-on",
  "SOON arrow": "arrow-soon",
  "TOP arrow": "arrow-top",
  "place of worship": "worship",
  "star of David": "star-david",
  "wheel of dharma": "dharma-wheel",
  "yin yang": "yin-yang",
  "latin cross": "cross-latin",
  "orthodox cross": "cross-orthodox",
  "star and crescent": "star-crescent",
  "peace symbol": "peace",
  "dotted six-pointed star": "star-six-point",
  "shuffle tracks button": "shuffle-button",
  "repeat button": "repeat-button",
  "repeat single button": "repeat-one-button",
  "play button": "play-button",
  "fast-forward button": "fast-forward-button",
  "next track button": "next-track-button",
  "play or pause button": "play-pause-button",
  "reverse button": "rewind-button",
  "fast reverse button": "fast-rewind-button",
  "last track button": "prev-track-button",
  "upwards button": "up-button",
  "fast up button": "fast-up-button",
  "downwards button": "down-button",
  "fast down button": "fast-down-button",
  "pause button": "pause-button",
  "stop button": "stop-button",
  "record button": "record-button",
  "eject button": "eject-button",
  "dim button": "dim-button",
  "bright button": "bright-button",
  "antenna bars": "signal-bars",
  "vibration mode": "vibrate",
  "mobile phone off": "phone-off",
  "female sign": "female",
  "male sign": "male",
  "transgender symbol": "transgender",
  "heavy equals sign": "equals",
  "heavy dollar sign": "dollar-sign",
  "double exclamation mark": "exclamation-double",
  "exclamation question mark": "interrobang",
  "red question mark": "question-red",
  "white question mark": "question-white",
  "white exclamation mark": "exclamation-white",
  "red exclamation mark": "exclamation-red",
  "wavy dash": "dash-wavy",
  "currency exchange": "currency-exchange",
  "medical symbol": "medical",
  "recycling symbol": "recycling",
  "trident emblem": "trident",
  "name badge": "name-tag",
  "Japanese symbol for beginner": "beginner-japanese",
  "hollow red circle": "circle-red-hollow",
  "check mark button": "check-button",
  "check box with check": "checkbox-checked",
  "check mark": "check",
  "cross mark": "cross",
  "cross mark button": "cross-button",
  "curly loop": "loop",
  "double curly loop": "loop-double",
  "part alternation mark": "part-alternation",
  "eight-spoked asterisk": "asterisk-eight",
  "eight-pointed star": "star-eight",
  "trade mark": "trademark",
  "diamond with a dot": "diamond-dot",
  "radio button": "radio-button",
  "white square button": "button-square-white",
  "black square button": "button-square-black",
  "red triangle pointed up": "triangle-red-up",
  "red triangle pointed down": "triangle-red-down",
  "large orange diamond": "diamond-orange-large",
  "large blue diamond": "diamond-blue-large",
  "small orange diamond": "diamond-orange-small",
  "small blue diamond": "diamond-blue-small",
  "black large square": "square-black-large",
  "white large square": "square-white-large",
  "black medium square": "square-black-medium",
  "white medium square": "square-white-medium",
  "black medium-small square": "square-black-medium-small",
  "white medium-small square": "square-white-medium-small",
  "black small square": "square-black-small",
  "white small square": "square-white-small",
};

/** Regex rules applied to the stripped base name (first match wins). */
const NAME_PATTERNS: { pattern: RegExp; literal: string }[] = [
  { pattern: /^keycap:\s*#$/i, literal: "keycap-hash" },
  { pattern: /^keycap:\s*\*$/i, literal: "keycap-asterisk" },
  { pattern: /^keycap:\s*(\d+)$/i, literal: "keycap-$1" },
  { pattern: /^a button blood-type$/i, literal: "blood-type-a" },
  { pattern: /^ab button blood-type$/i, literal: "blood-type-ab" },
  { pattern: /^b button blood-type$/i, literal: "blood-type-b" },
  { pattern: /^o button blood-type$/i, literal: "blood-type-o" },
  { pattern: /^japanese (.+) button$/i, literal: "japanese-$1-button" },
];

function applyPatterns(processed: string): string | undefined {
  for (const { pattern, literal } of NAME_PATTERNS) {
    const m = processed.match(pattern);
    if (m) {
      return literal.replace(/\$(\d+)/g, (_, n) => {
        const captured = m[Number(n)] ?? "";
        return /^\d+$/.test(captured) ? captured : slugify(captured);
      });
    }
  }
  return undefined;
}

function lookupLiteral(base: string): string | undefined {
  const key = normalizePossessives(base.toLowerCase());
  return NAME_LITERAL[key] ?? NAME_LITERAL[base.toLowerCase()];
}

/**
 * Derive a literal gloss from a Unicode emoji name.
 */
export function nameToLiteral(name: string): string {
  let base = stripGenderPrefix(stripVariantSuffix(name));

  const exact = lookupLiteral(base);
  if (exact) {
    return exact;
  }

  base = preprocessName(base);

  const exactAfterPreprocess = lookupLiteral(base);
  if (exactAfterPreprocess) {
    return exactAfterPreprocess;
  }

  const fromPattern = applyPatterns(base);
  if (fromPattern) {
    return fromPattern;
  }

  return slugify(base);
}
