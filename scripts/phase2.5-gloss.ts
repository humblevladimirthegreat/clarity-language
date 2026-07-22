/**
 * Phase 2.5 literal glossing for People & Body.
 * Run: npx tsx scripts/phase2.5-gloss.ts [--wave=1|2|3|all] [--dry-run]
 */
import { loadLexicon, writeLexicon } from "./collapse-variants.js";
import {
  stripAllVariantSuffixes,
  stripGenderPrefix,
  slugify,
} from "../src/literal-normalizer.js";
import { familyConceptKey } from "../src/variant-cluster.js";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const waveArg = args.find((a) => a.startsWith("--wave="));
const WAVE = waveArg ? waveArg.split("=")[1]! : "all";

const WAVE_SUBGROUPS: Record<string, Set<string>> = {
  "1": new Set([
    "body-parts",
    "hand-fingers-open",
    "hand-fingers-partial",
    "hand-fingers-closed",
    "hand-single-finger",
    "hands",
    "hand-prop",
    "person-symbol",
    "person-resting",
  ]),
  "2": new Set([
    "person-gesture",
    "person-role",
    "person-activity",
    "person-sport",
    "person-fantasy",
  ]),
  "3": new Set(["person", "family"]),
};

/** Exact Unicode name → literal overrides. */
const NAME_GLOSS: Record<string, string> = {
  // — body-parts —
  "anatomical heart": "heart",
  "biting lip": "lip-bite",
  bone: "bone",
  brain: "brain",
  ear: "ear",
  "ear with hearing aid": "hearing-aid",
  eye: "eye",
  eyes: "eyes",
  "flexed biceps": "bicep",
  foot: "foot",
  leg: "leg",
  lungs: "lungs",
  "mechanical arm": "prosthetic-arm",
  "mechanical leg": "prosthetic-leg",
  mouth: "mouth",
  nose: "nose",
  tongue: "tongue",
  tooth: "tooth",

  // — hand-fingers-open —
  "waving hand": "wave",
  "raised back of hand": "raised-hand",
  "hand with fingers splayed": "splayed-hand",
  "raised hand": "raised-hand",
  "vulcan salute": "vulcan-salute",
  "leftwards hand": "left-hand",
  "rightwards hand": "right-hand",
  "leftwards pushing hand": "push-left",
  "rightwards pushing hand": "push-right",
  "palm down hand": "palm-down",
  "palm up hand": "palm-up",

  // — hand-fingers-partial —
  "OK hand": "ok-sign",
  "crossed fingers": "crossed-fingers",
  "hand with index finger and thumb crossed": "finger-heart",
  "love-you gesture": "love-you-gesture",
  "pinched fingers": "pinched-fingers",
  "pinching hand": "pinch",
  "sign of the horns": "rock-on",
  "victory hand": "victory",
  "call me hand": "call-me",

  // — hand-fingers-closed —
  "raised fist": "fist",
  "oncoming fist": "punch",
  "left-facing fist": "left-fist",
  "right-facing fist": "right-fist",
  "thumbs up": "thumbs-up",
  "thumbs down": "thumbs-down",

  // — hand-single-finger —
  "index pointing up": "point-up",
  "backhand index pointing up": "point-up",
  "backhand index pointing down": "point-down",
  "backhand index pointing left": "point-left",
  "backhand index pointing right": "point-right",
  "index pointing at the viewer": "point-at-viewer",
  "middle finger": "middle-finger",

  // — hands —
  "clapping hands": "clap",
  "folded hands": "pray",
  handshake: "handshake",
  "heart hands": "heart-hands",
  "open hands": "open-hands",
  "palms up together": "palms-up",
  "raising hands": "raise-hands",

  // — hand-prop —
  "writing hand": "writing-hand",
  "nail polish": "nail-polish",
  selfie: "selfie",

  // — person-symbol —
  "speaking head": "speaking-head",
  "bust in silhouette": "silhouette",
  "busts in silhouette": "silhouettes",
  family: "family",
  "family: adult, child": "family",
  "family: adult, child, child": "family",
  "family: adult, adult, child": "family",
  "family: adult, adult, child, child": "family",
  fingerprint: "fingerprint",
  footprints: "footprints",
  "people hugging": "hug",
  "people holding hands": "holding-hands",

  // — person-resting —
  "person in bed": "in-bed",
  "person in lotus position": "meditation",
  "person taking bath": "bath",
  "man in lotus position": "meditation",
  "woman in lotus position": "meditation",

  // — person-gesture —
  "person bowing": "bow",
  "person facepalming": "facepalm",
  "person frowning": "frown",
  "person gesturing NO": "gesture-no",
  "person gesturing OK": "gesture-ok",
  "person pouting": "pout",
  "person raising hand": "raise-hand",
  "person shrugging": "shrug",
  "person tipping hand": "tipping-hand",
  "deaf person": "deaf",
  "deaf man": "deaf",
  "deaf woman": "deaf",

  // — person-role —
  artist: "artist",
  astronaut: "astronaut",
  "breast-feeding": "breastfeeding",
  "construction worker": "construction-worker",
  cook: "cook",
  detective: "detective",
  "factory worker": "factory-worker",
  farmer: "farmer",
  firefighter: "firefighter",
  guard: "guard",
  "health worker": "doctor",
  judge: "judge",
  mechanic: "mechanic",
  ninja: "ninja",
  "office worker": "office-worker",
  "person feeding baby": "feeding-baby",
  "person in tuxedo": "tuxedo",
  "person wearing turban": "turban",
  "person with crown": "monarch",
  "person with skullcap": "skullcap",
  "person with veil": "veil",
  pilot: "pilot",
  "police officer": "police",
  "pregnant man": "pregnant",
  "pregnant person": "pregnant",
  "pregnant woman": "pregnant",
  prince: "prince",
  princess: "princess",
  scientist: "scientist",
  singer: "singer",
  student: "student",
  teacher: "teacher",
  technologist: "technologist",
  "woman with headscarf": "headscarf",

  // — person-activity —
  "ballet dancer": "ballet",
  "man dancing": "dancing",
  "men with bunny ears": "partying",
  "people with bunny ears": "partying",
  "women with bunny ears": "partying",
  "person climbing": "climbing",
  "person getting haircut": "haircut",
  "person getting massage": "massage",
  "person in manual wheelchair": "wheelchair-user",
  "person in manual wheelchair facing right": "wheelchair-user",
  "person in motorized wheelchair": "motorized-wheelchair",
  "person in motorized wheelchair facing right": "motorized-wheelchair",
  "person in steamy room": "sauna",
  "person in suit levitating": "levitate",
  "person kneeling": "kneeling",
  "person kneeling facing right": "kneeling",
  "person running": "running",
  "person running facing right": "running",
  "person standing": "standing",
  "person walking": "walking",
  "person walking facing right": "walking",
  "person with white cane": "cane",
  "person with white cane facing right": "cane",

  // — person-sport —
  "horse racing": "horse-racing",
  "people wrestling": "wrestling",
  "men wrestling": "wrestling",
  "women wrestling": "wrestling",
  "person biking": "biking",
  "person bouncing ball": "basketball",
  "person cartwheeling": "cartwheel",
  "person fencing": "fencing",
  "person golfing": "golf",
  "person juggling": "juggling",
  "person lifting weights": "weightlifting",
  "person mountain biking": "mountain-biking",
  "person playing handball": "handball",
  "person playing water polo": "water-polo",
  "person rowing boat": "rowing",
  "person surfing": "surfing",
  "person swimming": "swimming",
  skier: "skiing",
  snowboarder: "snowboarding",

  // — person-fantasy —
  "baby angel": "angel",
  elf: "elf",
  fairy: "fairy",
  genie: "genie",
  "hairy creature": "bigfoot",
  mage: "mage",
  mermaid: "mermaid",
  merman: "merman",
  merperson: "merperson",
  "Mrs. Claus": "mrs-claus",
  "Mx Claus": "mx-claus",
  "Santa Claus": "santa-claus",
  superhero: "superhero",
  supervillain: "supervillain",
  troll: "troll",
  vampire: "vampire",
  zombie: "zombie",
};

const PERSON_BASE_LITERALS: Record<string, string> = {
  baby: "baby",
  child: "child",
  boy: "boy",
  girl: "girl",
  person: "person",
  man: "man",
  woman: "woman",
  "older person": "older-person",
  "old man": "old-man",
  "old woman": "old-woman",
};

const ROLE_BASE_GLOSS: Record<string, string> = {
  "wearing turban": "turban",
  "in tuxedo": "tuxedo",
  "with veil": "veil",
  "with crown": "monarch",
  "with skullcap": "skullcap",
  "feeding baby": "feeding-baby",
  "with bunny ears": "partying",
  "in lotus position": "meditation",
  "in bed": "in-bed",
  "taking bath": "bath",
};

function stripRolePrefix(name: string): string {
  return stripGenderPrefix(name)
    .replace(/^(?:man|woman)\s+/i, "")
    .trim();
}

function glossFamily(name: string): string {
  return familyConceptKey(name);
}

function glossPerson(name: string): string {
  const base = stripAllVariantSuffixes(name).toLowerCase().trim();
  return PERSON_BASE_LITERALS[base] ?? slugify(base);
}

function glossRow(name: string, subgroup: string): string {
  const stripped = stripAllVariantSuffixes(name);

  if (NAME_GLOSS[name]) return NAME_GLOSS[name]!;
  if (NAME_GLOSS[stripped]) return NAME_GLOSS[stripped]!;

  switch (subgroup) {
    case "person":
      return glossPerson(name);
    case "family":
      return glossFamily(name);
    case "person-role": {
      const base = stripRolePrefix(stripped);
      return NAME_GLOSS[base] ?? ROLE_BASE_GLOSS[base] ?? slugify(base);
    }
    case "person-gesture": {
      const base = stripRolePrefix(stripped);
      return NAME_GLOSS[base] ?? NAME_GLOSS[`person ${base}`] ?? slugify(base);
    }
    case "person-activity": {
      const base = stripRolePrefix(stripped).replace(/\s+facing right$/i, "");
      return (
        NAME_GLOSS[base] ??
        ROLE_BASE_GLOSS[base] ??
        NAME_GLOSS[`person ${base}`] ??
        slugify(base)
      );
    }
    case "person-sport": {
      const base = stripRolePrefix(stripped);
      return NAME_GLOSS[base] ?? NAME_GLOSS[`person ${base}`] ?? slugify(base);
    }
    case "person-fantasy": {
      const base = stripped.replace(/^(?:man|woman)\s+/i, "").trim();
      return NAME_GLOSS[base] ?? NAME_GLOSS[stripped] ?? slugify(base);
    }
    case "person-resting": {
      const base = stripRolePrefix(stripped);
      return NAME_GLOSS[base] ?? ROLE_BASE_GLOSS[base] ?? slugify(base);
    }
    default:
      return NAME_GLOSS[stripped] ?? slugify(stripped);
  }
}

function getTargetSubgroups(): Set<string> | null {
  if (WAVE === "all") return null;
  const subgroups = WAVE_SUBGROUPS[WAVE];
  if (!subgroups) {
    console.error(`Unknown wave: ${WAVE}. Use 1, 2, 3, or all.`);
    process.exit(1);
  }
  return subgroups;
}

function main(): void {
  const targetSubgroups = getTargetSubgroups();
  const { headers, rows } = loadLexicon();
  let updated = 0;
  const stats: Record<string, { total: number; glossed: number }> = {};

  for (const row of rows) {
    if (row.group !== "People & Body") continue;
    if (targetSubgroups && !targetSubgroups.has(row.subgroup)) continue;

    const literal = glossRow(row.name, row.subgroup);
    if (!stats[row.subgroup]) stats[row.subgroup] = { total: 0, glossed: 0 };
    stats[row.subgroup]!.total++;
    if (literal) stats[row.subgroup]!.glossed++;

    if (row.literal !== literal) {
      row.literal = literal;
      updated++;
    }
  }

  if (!DRY_RUN && updated > 0) {
    writeLexicon(headers, rows);
  }

  console.log(DRY_RUN ? "DRY RUN — no writes" : `Wrote ${updated} row updates (wave=${WAVE}).`);
  for (const [sg, s] of Object.entries(stats).sort()) {
    console.log(`  ${sg}: ${s.glossed}/${s.total} glossed`);
  }
}

main();
