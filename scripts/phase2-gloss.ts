/**
 * Phase 2 literal glossing for lexicon groups (excludes People & Body).
 * Run: npx tsx scripts/phase2-gloss.ts [--dry-run]
 */
import { loadLexicon, writeLexicon } from "./collapse-variants.js";
import { nameToLiteral, slugify } from "../src/literal-normalizer.js";

const DRY_RUN = process.argv.includes("--dry-run");

const TARGET_GROUPS = new Set([
  "Smileys & Emotion",
  "Travel & Places",
  "Activities",
  "Objects",
  "Animals & Nature",
  "Food & Drink",
  "Flags",
  "Component",
]);

const TIER_B_OBJECT_SUBGROUPS = new Set([
  "phone",
  "computer",
  "money",
  "mail",
  "lock",
  "sound",
  "music",
  "light & video",
]);

/** Exact Unicode name → literal (all groups). */
const NAME_GLOSS: Record<string, string> = {
  // — Smileys & Emotion —
  "grinning face": "grin",
  "grinning face with big eyes": "grin",
  "grinning face with smiling eyes": "grin",
  "beaming face with smiling eyes": "beam",
  "grinning squinting face": "laugh",
  "grinning face with sweat": "nervous-laugh",
  "rolling on the floor laughing": "laugh",
  "face with tears of joy": "laugh",
  "slightly smiling face": "smile",
  "upside-down face": "upside-down",
  "melting face": "melt",
  "winking face": "wink",
  "smiling face with smiling eyes": "smile",
  "smiling face with halo": "halo",
  "smiling face with hearts": "love",
  "smiling face with heart-eyes": "heart-eyes",
  "star-struck": "starstruck",
  "face blowing a kiss": "blow-kiss",
  "kissing face": "kiss",
  "smiling face": "smile",
  "kissing face with closed eyes": "kiss",
  "kissing face with smiling eyes": "kiss",
  "smiling face with tear": "tear-smile",
  "face savoring food": "yummy",
  "face with tongue": "tongue-out",
  "winking face with tongue": "wink-tongue",
  "zany face": "zany",
  "squinting face with tongue": "tongue-squint",
  "money-mouth face": "greed",
  "smiling face with open hands": "hug",
  "face with hand over mouth": "gasp",
  "face with open eyes and hand over mouth": "shock",
  "face with peeking eye": "peek",
  "shushing face": "shush",
  "thinking face": "think",
  "saluting face": "salute",
  "zipper-mouth face": "zip-mouth",
  "face with raised eyebrow": "skeptical",
  "neutral face": "neutral",
  "expressionless face": "blank",
  "face without mouth": "no-mouth",
  "dotted line face": "invisible",
  "face in clouds": "in-clouds",
  "smirking face": "smirk",
  "unamused face": "unamused",
  "face with rolling eyes": "eye-roll",
  "grimacing face": "grimace",
  "face exhaling": "sigh",
  "lying face": "lie",
  "shaking face": "shake",
  "head shaking horizontally": "head-shake-no",
  "head shaking vertically": "head-shake-yes",
  "relieved face": "relief",
  "pensive face": "pensive",
  "sleepy face": "sleepy",
  "drooling face": "drool",
  "sleeping face": "sleeping",
  "face with bags under eyes": "tired-eyes",
  "face with medical mask": "mask",
  "face with thermometer": "sick",
  "face with head-bandage": "injured",
  "nauseated face": "nauseated",
  "face vomiting": "vomit",
  "sneezing face": "sneeze",
  "hot face": "hot",
  "cold face": "cold",
  "woozy face": "woozy",
  "face with crossed-out eyes": "dizzy",
  "face with spiral eyes": "spiral-eyes",
  "exploding head": "mind-blown",
  "cowboy hat face": "cowboy",
  "partying face": "party",
  "disguised face": "disguise",
  "smiling face with sunglasses": "cool",
  "nerd face": "nerd",
  "face with monocle": "fancy",
  "confused face": "confused",
  "face with diagonal mouth": "unsure",
  "worried face": "worried",
  "slightly frowning face": "frown",
  "frowning face": "frown",
  "face with open mouth": "surprise",
  "hushed face": "hush",
  "astonished face": "astonished",
  "flushed face": "blush",
  "distorted face": "distorted",
  "pleading face": "pleading",
  "face holding back tears": "holding-tears",
  "frowning face with open mouth": "anguish",
  "anguished face": "anguish",
  "fearful face": "fear",
  "anxious face with sweat": "anxious",
  "sad but relieved face": "sad-relief",
  "crying face": "cry",
  "loudly crying face": "sob",
  "face screaming in fear": "scream",
  "confounded face": "confounded",
  "persevering face": "persevering",
  "disappointed face": "disappointed",
  "downcast face with sweat": "stressed",
  "weary face": "weary",
  "tired face": "tired",
  "yawning face": "yawn",
  "face with steam from nose": "triumph",
  "enraged face": "rage",
  "angry face": "angry",
  "face with symbols on mouth": "cursing",
  "smiling face with horns": "devil",
  "angry face with horns": "angry-devil",
  skull: "skull",
  "skull and crossbones": "skull-crossbones",
  "pile of poo": "poop",
  "clown face": "clown",
  ogre: "ogre",
  goblin: "goblin",
  ghost: "ghost",
  alien: "alien",
  "alien monster": "alien-monster",
  robot: "robot",
  "grinning cat": "cat-grin",
  "grinning cat with smiling eyes": "cat-grin",
  "cat with tears of joy": "cat-laugh",
  "smiling cat with heart-eyes": "cat-heart-eyes",
  "cat with wry smile": "cat-smirk",
  "kissing cat": "cat-kiss",
  "weary cat": "cat-weary",
  "crying cat": "cat-cry",
  "pouting cat": "cat-pout",
  "see-no-evil monkey": "see-no-evil",
  "hear-no-evil monkey": "hear-no-evil",
  "speak-no-evil monkey": "speak-no-evil",
  "love letter": "love-letter",
  "heart with arrow": "heart-arrow",
  "heart with ribbon": "heart-ribbon",
  "sparkling heart": "sparkling-heart",
  "growing heart": "growing-heart",
  "beating heart": "beating-heart",
  "revolving hearts": "revolving-hearts",
  "two hearts": "two-hearts",
  "heart decoration": "heart-decoration",
  "heart exclamation": "heart-exclamation",
  "broken heart": "broken-heart",
  "heart on fire": "heart-fire",
  "mending heart": "mending-heart",
  "red heart": "red-heart",
  "pink heart": "pink-heart",
  "orange heart": "orange-heart",
  "yellow heart": "yellow-heart",
  "green heart": "green-heart",
  "blue heart": "blue-heart",
  "light blue heart": "light-blue-heart",
  "purple heart": "purple-heart",
  "brown heart": "brown-heart",
  "black heart": "black-heart",
  "grey heart": "grey-heart",
  "white heart": "white-heart",
  "kiss mark": "kiss-mark",
  "hundred points": "hundred",
  "anger symbol": "anger",
  "fight cloud": "fight",
  collision: "boom",
  dizzy: "dizzy",
  "sweat droplets": "sweat",
  "dashing away": "dash",
  hole: "hole",
  "speech balloon": "speech",
  "eye in speech bubble": "witness",
  "left speech bubble": "speech-left",
  "right anger bubble": "anger-speech",
  "thought balloon": "thought",
  ZZZ: "sleep",

  // — Activities: sport as activity —
  "soccer ball": "soccer",
  "flying disc": "frisbee",
  "cricket game": "cricket-game",
  "field hockey": "field-hockey",
  "ice hockey": "hockey",
  "ping pong": "ping-pong",
  "boxing glove": "boxing",
  "martial arts uniform": "martial-arts",
  "goal net": "goal",
  "flag in hole": "golf",
  "ice skate": "skating",
  "fishing pole": "fishing",
  "running shirt": "running-shirt",
  "curling stone": "curling",
  "american football": "football",
  "rugby football": "rugby",
  "pool 8 ball": "pool",
  "mahjong red dragon": "mahjong",
  "flower playing cards": "hanafuda",
  "performing arts": "theater",
  "artist palette": "palette",
  "tanabata tree": "tanabata",
  "pine decoration": "new-year-decoration",
  "Japanese dolls": "dolls",
  "carp streamer": "carp-streamer",
  "moon viewing ceremony": "moon-viewing",
  "red envelope": "red-envelope",

  // — Travel & Places —
  "globe showing Europe-Africa": "globe-europe-africa",
  "globe showing Americas": "globe-americas",
  "globe showing Asia-Australia": "globe-asia-australia",
  "globe with meridians": "globe",
  "world map": "world-map",
  "map of Japan": "japan-map",
  "snow-capped mountain": "snow-mountain",
  "mount fuji": "mount-fuji",
  "beach with umbrella": "beach",
  "desert island": "island",
  "national park": "national-park",
  "classical building": "classical-building",
  "building construction": "construction-site",
  "derelict house": "derelict-house",
  "house with garden": "house-garden",
  "office building": "office",
  "Japanese post office": "post-office",
  "post office": "post-office",
  "love hotel": "love-hotel",
  "convenience store": "convenience-store",
  "department store": "department-store",
  "Japanese castle": "castle",
  "Tokyo tower": "tokyo-tower",
  "Statue of Liberty": "statue-of-liberty",
  "hindu temple": "hindu-temple",
  "shinto shrine": "shinto-shrine",
  "night with stars": "night",
  "sunrise over mountains": "sunrise-mountains",
  "cityscape at dusk": "dusk",
  "bridge at night": "bridge-night",
  "hot springs": "hot-springs",
  "carousel horse": "carousel",
  "playground slide": "playground",
  "ferris wheel": "ferris-wheel",
  "roller coaster": "roller-coaster",
  "barber pole": "barber",
  "circus tent": "circus",
  "railway car": "train-car",
  "high-speed train": "high-speed-train",
  "bullet train": "bullet-train",
  "light rail": "light-rail",
  "tram car": "tram",
  "oncoming bus": "bus",
  "oncoming police car": "police-car",
  "oncoming taxi": "taxi",
  "oncoming automobile": "car",
  "sport utility vehicle": "suv",
  "delivery truck": "truck",
  "articulated lorry": "semi-truck",
  "racing car": "race-car",
  "motor scooter": "scooter",
  "manual wheelchair": "wheelchair",
  "motorized wheelchair": "motorized-wheelchair",
  "auto rickshaw": "rickshaw",
  "kick scooter": "scooter",
  "roller skate": "roller-skate",
  "bus stop": "bus-stop",
  "fuel pump": "gas-pump",
  "police car light": "police-light",
  "horizontal traffic light": "traffic-light",
  "vertical traffic light": "traffic-light",
  "stop sign": "stop",
  "stop button": "stop-button",
  "wheelchair symbol": "accessible",
  "white cane": "cane",
  "latin cross": "christian-cross",
  "cross mark": "cross",
  "UP! button": "up-sign",
  "COOL button": "cool-sign",
  "circled M": "metro-sign",
  "upwards button": "up-button",
  "downwards button": "down-button",
  "ring buoy": "life-ring",
  "motor boat": "motorboat",
  "small airplane": "small-plane",
  "airplane departure": "departure",
  "airplane arrival": "arrival",
  "suspension railway": "suspension-rail",
  "mountain cableway": "cable-car",
  "aerial tramway": "tramway",
  "flying saucer": "ufo",
  "bellhop bell": "bellhop",
  "hourglass done": "hourglass-done",
  "hourglass not done": "hourglass",
  "alarm clock": "alarm-clock",
  "timer clock": "timer",
  "mantelpiece clock": "mantel-clock",
  "new moon face": "new-moon-face",
  "first quarter moon face": "first-quarter-moon-face",
  "last quarter moon face": "last-quarter-moon-face",
  "sun with face": "sun-face",
  "full moon face": "full-moon-face",
  "ringed planet": "saturn",
  "glowing star": "glowing-star",
  "shooting star": "shooting-star",
  "milky way": "milky-way",
  "sun behind cloud": "partly-cloudy",
  "cloud with lightning and rain": "thunderstorm",
  "sun behind small cloud": "mostly-sunny",
  "sun behind large cloud": "cloudy",
  "sun behind rain cloud": "sun-rain",
  "cloud with rain": "rain",
  "cloud with snow": "snow",
  "cloud with lightning": "lightning",
  "wind face": "wind",
  "umbrella with rain drops": "rain-umbrella",
  "umbrella on ground": "beach-umbrella",
  "high voltage": "lightning",
  "snowman without snow": "snowman",
  "water wave": "ocean-wave",

  // — Objects Tier B fixes —
  "mobile phone": "phone",
  "mobile phone with arrow": "phone-outgoing",
  "telephone receiver": "phone-receiver",
  "fax machine": "fax",
  "low battery": "low-battery",
  "electric plug": "plug",
  "desktop computer": "desktop",
  "computer mouse": "computer-mouse",
  "computer disk": "disk",
  "optical disk": "cd",
  "movie camera": "movie-camera",
  "film frames": "film",
  "film projector": "projector",
  "clapper board": "clapperboard",
  "camera with flash": "camera-flash",
  "video camera": "video-camera",
  "light bulb": "lightbulb",
  "red paper lantern": "lantern",
  "diya lamp": "oil-lamp",
  "muted speaker": "mute",
  "speaker low volume": "speaker-low",
  "speaker medium volume": "speaker-medium",
  "speaker high volume": "speaker-high",
  "bell with slash": "bell-off",
  "musical score": "sheet-music",
  "musical note": "music-note",
  "musical notes": "music-notes",
  "studio microphone": "studio-mic",
  "level slider": "slider",
  "control knobs": "knobs",
  headphone: "headphones",
  "yen banknote": "yen",
  "dollar banknote": "dollar",
  "euro banknote": "euro",
  "pound banknote": "pound",
  "money with wings": "flying-money",
  "credit card": "credit-card",
  "chart increasing with yen": "yen-chart-up",
  "incoming envelope": "envelope-incoming",
  "envelope with arrow": "envelope-outgoing",
  "outbox tray": "outbox",
  "inbox tray": "inbox",
  "closed mailbox with raised flag": "mailbox-closed-up",
  "closed mailbox with lowered flag": "mailbox-closed-down",
  "open mailbox with raised flag": "mailbox-open-up",
  "open mailbox with lowered flag": "mailbox-open-down",
  "ballot box with ballot": "ballot-box",
  "locked with pen": "lock-pen",
  "locked with key": "lock-key",
  "old key": "key-old",
  "magnifying glass tilted left": "magnify-left",
  "magnifying glass tilted right": "magnify-right",

  // — Animals & Nature —
  "monkey face": "monkey",
  "dog face": "dog",
  "guide dog": "guide-dog",
  "service dog": "service-dog",
  "cat face": "cat",
  "black cat": "cat",
  "tiger face": "tiger",
  "horse face": "horse",
  "cow face": "cow",
  "pig face": "pig",
  "pig nose": "pig-nose",
  "two-hump camel": "camel",
  "mouse face": "mouse",
  "rabbit face": "rabbit",
  "polar bear": "polar-bear",
  "paw prints": "paw-prints",
  "hatching chick": "hatching-chick",
  "baby chick": "chick",
  "front-facing baby chick": "chick",
  "black bird": "bird",
  "dragon face": "dragon",
  "spouting whale": "whale",
  "tropical fish": "tropical-fish",
  "spiral shell": "shell",
  "lady beetle": "ladybug",
  "spider web": "spider-web",
  "white flower": "flower",
  "wilted flower": "wilted-flower",
  "potted plant": "potted-plant",
  "evergreen tree": "evergreen",
  "deciduous tree": "deciduous-tree",
  "palm tree": "palm-tree",
  "sheaf of rice": "rice-plant",
  "four leaf clover": "four-leaf-clover",
  "maple leaf": "maple-leaf",
  "fallen leaf": "fallen-leaf",
  "leaf fluttering in wind": "leaves",
  "empty nest": "empty-nest",
  "nest with eggs": "nest",
  "leafless tree": "dead-tree",
  "cherry blossom": "cherry-blossom",

  // — Food & Drink —
  "red apple": "apple",
  "green apple": "apple",
  "kiwi fruit": "kiwi",
  grapes: "grape",
  cherries: "cherry",
  blueberries: "blueberry",
  peanuts: "peanut",
  beans: "bean",
  pancakes: "pancake",
  "ear of corn": "corn",
  "hot pepper": "pepper",
  "bell pepper": "bell-pepper",
  "leafy green": "greens",
  "ginger root": "ginger",
  "pea pod": "pea",
  "brown mushroom": "mushroom",
  "root vegetable": "root-veg",
  "baguette bread": "baguette",
  "cheese wedge": "cheese",
  "meat on bone": "meat",
  "poultry leg": "chicken-leg",
  "cut of meat": "steak",
  "french fries": "fries",
  "hot dog": "hot-dog",
  "stuffed flatbread": "flatbread",
  "shallow pan of food": "paella",
  "pot of food": "stew",
  "bowl with spoon": "cereal",
  "green salad": "salad",
  "canned food": "canned-food",
  "bento box": "bento",
  "rice cracker": "rice-cracker",
  "rice ball": "rice-ball",
  "cooked rice": "rice",
  "curry rice": "curry",
  "steaming bowl": "noodles",
  "roasted sweet potato": "sweet-potato",
  "fried shrimp": "fried-shrimp",
  "fish cake with swirl": "fish-cake",
  "moon cake": "mooncake",
  "fortune cookie": "fortune-cookie",
  "takeout box": "takeout",
  "soft ice cream": "soft-serve",
  "shaved ice": "shaved-ice",
  "ice cream": "ice-cream",
  "chocolate bar": "chocolate",
  "honey pot": "honey",
  "baby bottle": "baby-bottle",
  "glass of milk": "milk",
  "hot beverage": "coffee",
  "teacup without handle": "tea",
  "bottle with popping cork": "champagne",
  "wine glass": "wine",
  "cocktail glass": "cocktail",
  "tropical drink": "tropical-drink",
  "beer mug": "beer",
  "clinking beer mugs": "cheers-beer",
  "clinking glasses": "cheers",
  "tumbler glass": "whiskey",
  "pouring liquid": "pour",
  "cup with straw": "soda",
  "bubble tea": "boba",
  "beverage box": "juice-box",
  "fork and knife with plate": "plate",
  "fork and knife": "cutlery",
  "kitchen knife": "knife",

  // — Flags (generic) —
  "chequered flag": "checkered-flag",
  "triangular flag": "triangle-flag",
  "crossed flags": "crossed-flags",
  "black flag": "black-flag",
  "white flag": "white-flag",
  "rainbow flag": "rainbow-flag",
  "transgender flag": "transgender-flag",
  "pirate flag": "pirate-flag",
};

/** Country / territory name (from flag: X) → literal. */
const COUNTRY_SHORT: Record<string, string> = {
  "United Arab Emirates": "uae",
  "United Kingdom": "uk",
  "United States": "usa",
  "Antigua & Barbuda": "antigua-barbuda",
  "Bosnia & Herzegovina": "bosnia-herzegovina",
  "British Indian Ocean Territory": "british-indian-ocean",
  "British Virgin Islands": "british-virgin-islands",
  "Cape Verde": "cape-verde",
  "Central African Republic": "central-african-republic",
  "Christmas Island": "christmas-island",
  "Cocos (Keeling) Islands": "cocos-islands",
  "Congo - Brazzaville": "congo",
  "Congo - Kinshasa": "congo-kinshasa",
  "Costa Rica": "costa-rica",
  "Czechia": "czechia",
  "Dominican Republic": "dominican-republic",
  "El Salvador": "el-salvador",
  "Equatorial Guinea": "equatorial-guinea",
  "Falkland Islands": "falkland-islands",
  "Faroe Islands": "faroe-islands",
  "French Guiana": "french-guiana",
  "French Polynesia": "french-polynesia",
  "Hong Kong SAR China": "hong-kong",
  "Isle of Man": "isle-of-man",
  "Marshall Islands": "marshall-islands",
  "New Zealand": "new-zealand",
  "North Korea": "north-korea",
  "North Macedonia": "north-macedonia",
  "Northern Mariana Islands": "northern-mariana-islands",
  "Papua New Guinea": "papua-new-guinea",
  "Puerto Rico": "puerto-rico",
  "Saudi Arabia": "saudi-arabia",
  "Sierra Leone": "sierra-leone",
  "Solomon Islands": "solomon-islands",
  "South Africa": "south-africa",
  "South Korea": "south-korea",
  "South Sudan": "south-sudan",
  "Sri Lanka": "sri-lanka",
  "St. Barthélemy": "st-barthelemy",
  "St. Helena": "st-helena",
  "St. Kitts & Nevis": "st-kitts-nevis",
  "St. Lucia": "st-lucia",
  "St. Martin": "st-martin",
  "St. Pierre & Miquelon": "st-pierre-miquelon",
  "St. Vincent & Grenadines": "st-vincent-grenadines",
  "Svalbard & Jan Mayen": "svalbard-jan-mayen",
  "Trinidad & Tobago": "trinidad-tobago",
  "Turks & Caicos Islands": "turks-caicos",
  "U.S. Outlying Islands": "us-outlying-islands",
  "U.S. Virgin Islands": "us-virgin-islands",
  "United Nations": "un",
  "Vatican City": "vatican",
  "Wallis & Futuna": "wallis-futuna",
  "Western Sahara": "western-sahara",
};

/** Rows to drop (no English association). */
const DROP_NAMES = new Set([
  "part alternation mark", // already in Symbols
  "oden", // Japanese dish, niche
]);

function flagLiteral(name: string): string {
  const m = name.match(/^flag:\s*(.+)$/i);
  if (!m) return slugify(name);
  const country = m[1]!;
  if (COUNTRY_SHORT[country]) return COUNTRY_SHORT[country]!;
  return slugify(country);
}

function subdivisionFlagLiteral(name: string): string {
  const m = name.match(/^flag:\s*(.+)$/i);
  if (!m) return slugify(name);
  return slugify(m[1]!);
}

function timeLiteral(name: string): string {
  const m = name.match(/^(\w+(?:-\w+)?)\s+o['']?clock$/i);
  if (m) return `${m[1]}-oclock`;
  const m2 = name.match(/^(\w+(?:-\w+)?)-thirty$/i);
  if (m2) return `${m2[1]}-thirty`;
  return NAME_GLOSS[name] ?? slugify(name);
}

function tierAFallback(name: string): string {
  if (NAME_GLOSS[name]) return NAME_GLOSS[name]!;
  const fromNormalizer = nameToLiteral(name);
  return fromNormalizer;
}

function glossRow(row: {
  name: string;
  group: string;
  subgroup: string;
}): { literal: string; keep?: string } {
  const { name, group, subgroup } = row;

  if (DROP_NAMES.has(name.toLowerCase())) {
    return { literal: "", keep: "n" };
  }

  if (NAME_GLOSS[name]) {
    return { literal: NAME_GLOSS[name]! };
  }

  switch (group) {
    case "Component":
      return { literal: tierAFallback(name) };

    case "Flags":
      if (subgroup === "country-flag") return { literal: flagLiteral(name) };
      if (subgroup === "subdivision-flag") return { literal: subdivisionFlagLiteral(name) };
      return { literal: tierAFallback(name) };

    case "Animals & Nature":
    case "Food & Drink":
      return { literal: tierAFallback(name) };

    case "Objects":
      if (TIER_B_OBJECT_SUBGROUPS.has(subgroup)) {
        return { literal: tierAFallback(name) };
      }
      return { literal: tierAFallback(name) };

    case "Smileys & Emotion":
      return { literal: tierAFallback(name) };

    case "Travel & Places":
      if (subgroup === "time") return { literal: timeLiteral(name) };
      return { literal: tierAFallback(name) };

    case "Activities":
      return { literal: tierAFallback(name) };

    default:
      return { literal: tierAFallback(name) };
  }
}

function main(): void {
  const { headers, rows } = loadLexicon();
  let updated = 0;
  const stats: Record<string, { total: number; glossed: number; drops: number }> = {};

  for (const row of rows) {
    if (!TARGET_GROUPS.has(row.group)) continue;

    const { literal, keep } = glossRow(row);
    const changed = row.literal !== literal || (keep !== undefined && row.keep !== keep);

    if (!stats[row.group]) stats[row.group] = { total: 0, glossed: 0, drops: 0 };
    stats[row.group]!.total++;
    if (literal) stats[row.group]!.glossed++;
    if (keep === "n") stats[row.group]!.drops++;

    if (changed) {
      row.literal = literal;
      if (keep !== undefined) row.keep = keep;
      updated++;
    }
  }

  if (!DRY_RUN) {
    writeLexicon(headers, rows);
  }

  console.log(DRY_RUN ? "DRY RUN — no writes" : `Wrote ${updated} row updates.`);
  for (const [g, s] of Object.entries(stats).sort()) {
    console.log(`  ${g}: ${s.glossed} glossed, ${s.drops} drops, ${s.total} total`);
  }
}

main();
