{{
  const SPEECH_DIGITS = {
    ba: "1", do: "2", ge: "3", hu: "4", za: "5",
    vo: "6", re: "7", lu: "8", na: "9", mo: "0",
  };

  // Role + ability (`gwezuduyexal` *can be a teacher*) is classification only: `/ɡ/`. On `/h/` the pointer shape is a
  // say word's (`hwazam`), never a pointer.
  function bodyPosOk(pos, body) {
    const f = body.family;
    if (f && f.kind === "x" && f.xFamily === "pointer" && pos === "h") return false;
    return !(f && f.kind === "x" && f.xFamily === "role" && f.stanceVowel) || pos === "g";
  }

  function makeWord(raw, fields) {
    const word = { raw, ...fields };
    if (word.gl === false) delete word.gl;
    if (word.bl === false) delete word.bl;
    if (word.plural === false) delete word.plural;
    if (word.ending === undefined) delete word.ending;
    return word;
  }

  // A hosted `/b/` (`bl-`) is a complement: a content word, pronoun, pointer, tag, number, span,
  // stand-in (`blarl`), or a join, which is the whole complement when it has no items (`blar`, `blal`) and may take
  // `bl-` after hosted items too. A named join (`blan`) and a hook compound take none (clause.md#extra-nouns).
  function blBodyOk(body) {
    const f = body.family;
    if (f.kind === "hookCompound") return false;
    return f.kind !== "joinMarker" || ["r", "l", "m", "rl", "rm", "rn", "rth"].includes(body.ending);
  }

  function contentFamily(roots) {
    return { kind: "content", roots };
  }

  function numberFamily(stem, writingEndingMark) {
    const family = { kind: "number", stem };
    if (writingEndingMark) family.writingEndingMark = writingEndingMark;
    return family;
  }

  function xFamily(name, extra) {
    return { kind: "x", xFamily: name, ...extra };
  }

  function writingSpanFamily(bracket, payload, marks) {
    return {
      kind: "writingSpan",
      bracket,
      payload,
      marks: marks || [],
    };
  }

  function parseSpeechDigits(text) {
    let out = "";
    let i = 0;
    while (i < text.length) {
      const two = text.slice(i, i + 2);
      if (SPEECH_DIGITS[two]) {
        out += SPEECH_DIGITS[two];
        i += 2;
        continue;
      }
      throw new Error("invalid speech digit: " + text.slice(i));
    }
    return out;
  }

  // Letter names for code characters (phonology.md#letter-names): a digit letter takes the opposite of its digit vowel.
  const LETTER_NAMES = {
    bu: "b", de: "d", go: "g", ha: "h", zu: "z", ve: "v", ro: "r", la: "l", nu: "n", me: "m",
    tho: "th", wa: "w", yu: "y",
  };

  function writingMarkerFromSpeechV(v) {
    if (v === "oe") return "_";
    if (v === "uo") return "#-";
    if (v === "ue") return "#_";
    if (v === "ua") return "+-";
    if (v === "a") return "+";
    if (v === "u") return "-";
    if (v === "o") return "#";
    if (v === "e") return "_";
    return "#-";
  }

  // Mantissa 0 / 1 + bare wa / wu is one digitless-exp stem (`bawa` = `1e`), matching writing `g+1e`.
function foldDigitlessTail(stem, digitless) {
  const only = stem.groups.length === 1 ? stem.groups[0] : null;
  if (only && Object.keys(only).length === 1 && (only.mantissa === "0" || only.mantissa === "1") && (digitless === "e" || digitless === "e-")) {
    stem.groups = [];
    stem.digitlessExp = only.mantissa + digitless;
  } else stem.digitlessExp = digitless;
}

// A lone exponent group is the writing's digitless-exp body (`rawage` = `+e3`, `rawubayamo` = `+0e-1`).
function foldBareExponent(stem) {
  const only = stem.groups.length === 1 ? stem.groups[0] : null;
  if (!only || !only.exponentSign || only.exponentDigits === undefined || only.percent || only.decimal) return;
  const exp = (only.exponentSign === "wa" ? "e" : "e-") + only.exponentDigits;
  const keys = Object.keys(only).filter((k) => k !== "hasJa");
  if (keys.length === 2) {
    stem.groups = [];
    stem.digitlessExp = exp;
  } else if (keys.length === 3 && only.mantissa === "0" && exp === "e-1") {
    stem.groups = [];
    stem.digitlessExp = "0e-1";
  }
}

  // `^@` is the span's **-ln** (one thing the name applies to), `@` its **-n**, `~` its **-m** (spans.md#when-required).
  function spanEnding(marks) {
    if (marks && marks.includes("^@")) return "ln";
    if (marks && marks.includes("@")) return "n";
    if (marks && marks.includes("~")) return "m";
    return "l";
  }

  function endingFromWritingMark(mark, fallback) {
    if (mark === "~") return "m";
    if (mark === "@") return "n";
    if (mark === "=") return "r";
    return fallback;
  }

  function compactGroup(group) {
    const out = {};
    for (const [key, value] of Object.entries(group)) {
      if (value !== undefined && value !== null && value !== false && value !== "") out[key] = value;
    }
    return out;
  }

  const EXTRA_NOUN_HOOKS = [
    "aol", "aom", "ael", "aem", "oel", "oem", "ual", "uam", "uol", "uom", "uel", "uem",
    "al", "am", "ol", "om", "el", "em", "ul", "um",
  ];
  const ROOT_VOWELS = "aeou";
  const ROOT_CONS = "hwdybgzmnvlr";

  function isVcvRoot(root) {
    if (!root || root.length % 2 === 0) return false;
    for (let i = 0; i < root.length; i++) {
      const ch = root[i];
      if (i % 2 === 0) {
        if (ROOT_VOWELS.indexOf(ch) < 0) return false;
      } else if (ROOT_CONS.indexOf(ch) < 0) return false;
    }
    return true;
  }

  function splitHookCompound(cite) {
    let body = cite;
    if (body.charAt(body.length - 1) === "x") body = body.slice(0, -1);
    for (let h = 0; h < EXTRA_NOUN_HOOKS.length; h++) {
      const hook = EXTRA_NOUN_HOOKS[h];
      if (body.length < hook.length + 4 || body.slice(-hook.length) !== hook) continue;
      const leftCite = body.slice(0, -hook.length);
      const leftEnding = leftCite.charAt(leftCite.length - 1);
      if (leftEnding !== "l" && leftEnding !== "m") continue;
      const leftRoot = leftCite.slice(0, -1);
      if (!isVcvRoot(leftRoot) || leftRoot.length < 3) continue;
      return { leftRoot: leftRoot, leftEnding: leftEnding, hook: hook };
    }
    return null;
  }
}}

// ── Top level ────────────────────────────────────────────────────────────────

start
  = word:Word EOF { return word; }

words
  = head:Word tail:(WS+ w:Word { return w; })* WS* EOF {
      return [head, ...tail];
    }

WS = [ \t\n\r]+

EOF = !.

WordEnd = &(WS / EOF)

NumberBodyEnd = &(Ending / PluralSuffix EOF / WS / EOF)

Word
  = writingSpan
  / freeNumber
  / hook
  / prefixedWord
  / citation

// Independent probes for the ambiguity checker (not used by ordinary parse).
probe_writingSpan = word:writingSpan EOF { return word; }
probe_freeNumber = word:freeNumber EOF { return word; }
probe_hook = word:hook EOF { return word; }
probe_prefixedWord = word:prefixedWord EOF { return word; }
probe_citation = word:citation EOF { return word; }

probe_prefixedX
  = "g" "l" body:xWord EOF {
      return makeWord(text(), {
        pos: "g",
        gl: true,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }
  / "b" "l" body:xWord EOF {
      return makeWord(text(), {
        pos: "b",
        bl: true,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }
  / pos:Pos body:xWord &{ return bodyPosOk(pos, body); } EOF {
      return makeWord(text(), {
        pos,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }

probe_prefixedPlain
  = "g" "l" body:plainContent EOF {
      return makeWord(text(), {
        pos: "g",
        gl: true,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }
  / "b" "l" body:plainContent EOF {
      return makeWord(text(), {
        pos: "b",
        bl: true,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }
  / pos:Pos body:plainContent EOF {
      return makeWord(text(), {
        pos,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }

probe_prefixedJoin
  = "g" "l" body:joinMarker EOF {
      return makeWord(text(), {
        pos: "g",
        gl: true,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }
  / pos:Pos body:joinMarker EOF {
      return makeWord(text(), {
        pos,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }

// ── Writing bracket atoms (`[]` `()`; `<>` is foreign / opaque) ────────

writingSpan
  = "g" "l" marks:WritingMarks? bracketed:BracketedPayload WordEnd
    &{ return !(bracketed.bracket === "[" || bracketed.bracket === "(") || bracketed.payload.trim() !== "="; }
    {
      return makeWord(text(), {
        pos: "g",
        gl: true,
        ending: spanEnding(marks),
        family: writingSpanFamily(bracketed.bracket, bracketed.payload, marks),
      });
    }
  / role:RolePrefix marks:WritingMarks? bracketed:BracketedPayload WordEnd
    &{ return !(bracketed.bracket === "[" || bracketed.bracket === "(") || bracketed.payload.trim() !== "="; }
    {
      const ending = spanEnding(marks);
      return makeWord(text(), {
        ...role,
        ending,
        family: writingSpanFamily(bracketed.bracket, bracketed.payload, marks),
      });
    }

WritingMarks
  = marks:("^@" / "@" / "~")+ { return marks; }

BracketedPayload
  = "[" payload:SquareInner "]" { return { bracket: "[", payload }; }
  / "(" payload:RoundInner ")" { return { bracket: "(", payload }; }
  / "<" payload:$((!">" .)*) ">" { return { bracket: "<", payload }; }

// Native interiors may nest; skip opaque `<>` so `d<]>` does not close `[…]`.
SquareInner
  = chars:SquareChar* { return chars.join(""); }

SquareChar
  = OpaqueIsland
  / "[" inner:SquareInner "]" { return "[" + inner + "]"; }
  / !"]" c:. { return c; }

RoundInner
  = chars:RoundChar* { return chars.join(""); }

RoundChar
  = OpaqueIsland
  / "(" inner:RoundInner ")" { return "(" + inner + ")"; }
  / !")" c:. { return c; }

OpaqueIsland
  = "<" p:$((!">" .)*) ">" { return "<" + p + ">"; }

// ── Free number words (writing + speech) ────────────────────────────────────

// Plural **-x** parses on any number; enforce keeps it to plural labels (numbers.md § Labels).
freeNumber
  = role:RolePrefix mark:WritingEndingMark? stem:WritingNumberStem ending:Ending? plural:PluralSuffix? {
      return makeWord(text(), {
        ...role,
        ending: endingFromWritingMark(mark, ending || "l"),
        plural: !!plural,
        family: numberFamily(stem, mark || undefined),
      });
    }
  / role:RolePrefix mark:WritingEndingMark? stem:SpeechNumberStem ending:Ending plural:PluralSuffix? WordEnd {
      return makeWord(text(), {
        ...role,
        ending: endingFromWritingMark(mark, ending),
        plural: !!plural,
        family: numberFamily(stem, mark || undefined),
      });
    }

WritingEndingMark
  = "~" / "@" / "="

// Writing-style number stem (mantissa, then exponent — opposite of speech)
WritingNumberStem
  = "_" "#" body:WritingNumberBody? {
      // Calendar-ordinal date (numbers.md § Time): fields read day, month, year.
      const stem = { marker: "_", calendarOrdinal: true, groups: body && body.groups ? body.groups : [] };
      if (body && body.digitlessExp) stem.digitlessExp = body.digitlessExp;
      return stem;
    }
  / "_" body:WritingCodeBody? {
      return { marker: "_", groups: body || [] };
    }
  / marker:WritingMarker body:WritingNumberBody? {
      const stem = { marker, groups: body && body.groups ? body.groups : [] };
      if (body && body.digitlessExp) stem.digitlessExp = body.digitlessExp;
      return stem;
    }

WritingMarker
  = "#_" / "+-" / "#-" / "#" / "+" / "-"

// A code (`_`, numbers-applied.md#letter-codes): fields of digits and letters, no exponent or percent. Letters are
// always characters, so the ending comes from the mark (`z@_nl`), never a trailing letter.
WritingCodeBody
  = head:WritingCodeField tail:("," f:WritingCodeField { return f; })* &(PluralSuffix EOF / WS / EOF) {
      return [head, ...tail];
    }

WritingCodeField
  = m:WritingMantissa !CodeLetter { return compactGroup({ mantissa: m.digits, decimal: m.decimal }); }
  / chars:$((CodeLetter / Digit)+) { return { code: chars }; }

CodeLetter
  = "th" / [bdghzvrlnmwy] / [uaoe]

WritingNumberBody
  = digitless:WritingDigitlessExp NumberBodyEnd {
      return { groups: [], digitlessExp: digitless };
    }
  / head:WritingDigitGroup tail:("," g:WritingDigitGroup { return g; })* digitless:WritingDigitlessExp? NumberBodyEnd {
      const out = { groups: [head, ...tail] };
      if (digitless) out.digitlessExp = digitless;
      return out;
    }

WritingDigitGroup
  = mantissa:WritingMantissa exp:WritingExponent? percent:WritingPercent? {
      return compactGroup({
        mantissa: mantissa.digits,
        decimal: mantissa.decimal,
        exponentSign: exp && exp.sign,
        exponentDigits: exp && exp.digits,
        percent,
      });
    }
  / exp:WritingExponent percent:WritingPercent? {
      return compactGroup({
        exponentSign: exp.sign,
        exponentDigits: exp.digits,
        percent,
      });
    }
  / percent:WritingPercent {
      return compactGroup({ percent });
    }

WritingExponent
  = "e-" digits:Digit+ { return { sign: "wu", digits: digits.join("") }; }
  / "e" digits:Digit+ { return { sign: "wa", digits: digits.join("") }; }

WritingMantissa
  = int:Digit+ "." frac:Digit+ {
      return { digits: int.join("") + "." + frac.join(""), decimal: true };
    }
  / int:Digit+ "." {
      return { digits: int.join("") + ".", decimal: true };
    }
  / "." frac:Digit+ {
      return { digits: "." + frac.join(""), decimal: true };
    }
  / digits:Digit+ {
      return { digits: digits.join("") };
    }

WritingPercent
  = "%*" { return "yu"; }
  / "%" { return "yo"; }

WritingDigitlessExp
  = "0e-1" { return "0e-1"; }
  / "0e-" { return "0e-"; }
  / "0e" { return "0e"; }
  / "1e-" { return "1e-"; }
  / "1e" { return "1e"; }
  / "e-" digits:Digit+ { return "e-" + digits.join(""); }
  / "e-" { return "e-"; }
  / "e" digits:Digit+ { return "e" + digits.join(""); }
  / "e" { return "e"; }

Digit = [0-9]

// Speech-style: PoS + r + V + groups + ending. Marker normalizes to writing glyphs.
SpeechNumberStem
  = "re" !"o" body:SpeechCodeBody {
      return { marker: "_", groups: body };
    }
  / "r" v:SpeechMarkerV body:SpeechDigitGroups
    digitless:SpeechDigitlessTail? {
      const stem = { marker: writingMarkerFromSpeechV(v), groups: body.groups };
      if (v === "oe") stem.calendarOrdinal = true;
      if (digitless) foldDigitlessTail(stem, digitless);
      else foldBareExponent(stem);
      return stem;
    }

SpeechMarkerV
  = "oe" / "ue" / "uo" / "ua" / [aeou]

// Groups after the first are opened by the separator `the` (digitless-exponents.md#group-separator).
SpeechDigitGroups
  = head:SpeechDigitGroup tail:("the" g:SpeechDigitGroup { return g; })* {
      return { groups: [head, ...tail] };
    }
  / "" { return { groups: [] }; }

// A spoken code: one syllable per character, fields split by `the`. A vowel character follows a break `'`.
SpeechCodeBody
  = head:SpeechCodeField tail:("the" f:SpeechCodeField { return f; })* { return [head, ...tail]; }
  / "" { return []; }

SpeechCodeField
  = m:SpeechMantissa !SpeechCodeLetter { return compactGroup({ mantissa: m.digits, decimal: m.decimal }); }
  / chars:(SpeechCodeLetter / s:SpeechDigitSyllable { return SPEECH_DIGITS[s]; })+ { return { code: chars.join("") }; }

SpeechCodeLetter
  = name:("tho" / "bu" / "de" / "go" / "ha" / "zu" / "ve" / "ro" / "la" / "nu" / "me" / "wa" / "yu") { return LETTER_NAMES[name]; }
  / "'" v:[uaoe] { return v; }

SpeechDigitGroup
  = sign:("wa" / "wu") expDigits:SpeechDigitSeq "ya" mantissa:SpeechMantissa percent:SpeechPercent? {
      return compactGroup({
        exponentSign: sign,
        exponentDigits: parseSpeechDigits(expDigits),
        mantissa: mantissa.digits,
        decimal: mantissa.decimal,
        hasJa: true,
        percent,
      });
    }
  / sign:("wa" / "wu") expDigits:SpeechDigitSeq percent:SpeechPercent? {
      return compactGroup({
        exponentSign: sign,
        exponentDigits: parseSpeechDigits(expDigits),
        percent,
      });
    }
  / mantissa:SpeechMantissa percent:SpeechPercent? {
      return compactGroup({
        mantissa: mantissa.digits,
        decimal: mantissa.decimal,
        percent,
      });
    }

SpeechMantissa
  = int:SpeechDigitSeq "ye" frac:SpeechDigitSeq {
      return { digits: parseSpeechDigits(int) + "." + parseSpeechDigits(frac), decimal: true };
    }
  / "ye" frac:SpeechDigitSeq {
      return { digits: "." + parseSpeechDigits(frac), decimal: true };
    }
  / digits:SpeechDigitSeq {
      return { digits: parseSpeechDigits(digits) };
    }

SpeechPercent
  = "yu" { return "yu"; }
  / "yo" { return "yo"; }

SpeechDigitSeq
  = syll:SpeechDigitSyllable+ { return syll.join(""); }

SpeechDigitSyllable
  = "ba" / "do" / "ge" / "hu" / "za" / "vo" / "re" / "lu" / "na" / "mo"

// After the marker: wa/wu alone, or mantissa 0/1 + wa/wu (zero×exp / hyperbole)
SpeechDigitlessTail
  = "mowa" { return "0e"; }
  / "mowu" { return "0e-"; }
  / "bawa" { return "1e"; }
  / "bawu" { return "1e-"; }
  / "wa" { return "e"; }
  / "wu" { return "e-"; }

// PoS-less number stem (numeric prefix left half). Spelled CV only:
// shorthand (`+3`, `#e`) is for free numbers, never inside a numeric prefix.
PoslessNumberStem
  = "re" !"o" body:SpeechCodeBody {
      return { marker: "_", groups: body };
    }
  / "r" v:SpeechMarkerV body:SpeechDigitGroups
    digitless:SpeechDigitlessTail? {
      const stem = { marker: writingMarkerFromSpeechV(v), groups: body.groups };
      if (digitless) foldDigitlessTail(stem, digitless);
      else foldBareExponent(stem);
      return stem;
    }

// ── Hooks (prefix-less; ending required; -r on a simplex vowel, extra-noun point-back, or a range hook; no -x) ────────────────────────

hook
  = form:HookForm WordEnd {
      return makeWord(form, {
        ending: form.charAt(form.length - 1),
        family: { kind: "hook", form },
      });
    }

HookForm
  = ("ao" / "ae" / "oe" / "ua" / "uo" / "ue" / [aeou]) [lmn] { return text(); }
  / ("ao" / "ae" / "oe" / "ua" / "uo" / "ue" / [aeou]) "r" { return text(); }

// ── Prefixed words (PoS + body) ─────────────────────────────────────────────

prefixedWord
  = "g" "l" body:PrefixedBody {
      return makeWord(text(), {
        pos: "g",
        gl: true,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }
  / "b" "l" body:PrefixedBody &{ return blBodyOk(body); } {
      return makeWord(text(), {
        pos: "b",
        bl: true,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }
  / "h" body:sayWord {
      return makeWord(text(), {
        pos: "h",
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }
  / pos:Pos body:PrefixedBody &{ return bodyPosOk(pos, body); } {
      return makeWord(text(), {
        pos,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }

PrefixedBody
  = tagWord
  / xWord
  / plainContent
  / hookCompound
  / hookedJoin
  / joinMarker

// ── Tag pronouns (pronouns.md#tag-pronouns) ─────────────────────────────────

// Role letter + `w` + tag vowel + ending (`zwal` assign, `zwar` recall, `zwam` share). Roots start with a
// vowel, so a `w` right after the role letter is always this marker. A stacked vowel is two tags at once
// (`zwaer` *A and E*). enforce.ts keeps the slots and endings.
tagWord
  = "w" vowels:("ao" / "ae" / "oe" / "ua" / "uo" / "ue" / [aeou]) ending:Ending plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: { kind: "tag", vowels: vowels.split("") },
      };
    }

// ── Say words (feelings-permission.md#say-words) ───────────────────────────────────────────

// `w` + label scope + whose say (`z` / `d` / `b` / `v`) + answer vowel + **-l** / **-m** / **-r** (`hwavam`, `hwadum`).
// A consonant after the scope keeps it apart from a tag (`zwar`). Only on `/h/`: elsewhere the shape is a role pointer's.
sayWord
  = "w" scope:SeamVowel part:[zdbv] answer:[aeou] ending:[lmr] plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: { kind: "say", scope, part, answer },
      };
    }

// ── Mid-word x families (decision order steps 2–6) ──────────────────────────

xWord
  = RolePointer
  / RoleCompound
  / HookPrefix
  / ValueCompound
  / LateralCompound
  / AbilityCompound
  / NumericPrefix
  / OrdinaryCompound

// Role pointer: `w` + label scope + part consonant + pointer vowel + **-r** / **-l** / **-m** (`zwazar`, `dwadal`,
// `dwazam`; pronouns.md#role-pointers). The pointer vowel picks the event: `a` same, `o` other, `e` self, `u` unsaid.
// **-r** names the participant or quality, **-l** a new one of its kind, **-m** its part in the event. Then the word
// ends; a compound's stem goes on (`zwazar` against `zwazarayel`). Content parts (`h` `g` `th` `w` `y` `x` `v`)
// follow the same shape (roles.md#content-of-the-event); `v` is pointers only.
RolePointer
  = "w" scope:SeamVowel part:RolePart pointerV:[aeou] end:[rlm] plural:PluralSuffix? WordEnd {
      return {
        ending: end,
        plural: !!plural,
        family: xFamily("pointer", {
          leftRoots: [],
          scopeVowel: scope,
          part,
          pointerVowel: pointerV,
        }),
      };
    }

// Role compound: `w` + label scope + part consonant + stem + ending (`zwazuduyel`, roles.md#role-compounds). The stem
// may itself be an ordinary compound (`zwazudozoxowurel` *someone who walks dogs*). Optional tail: ability (`x` +
// stance vowel) on `/ɡ/` only (`gwezuduyexal` *can be a teacher*, intention.md#role-ability). Scope is written once,
// at the front: no `th` seam after the stem. `v` forms no compounds (the event noun is the stem itself).
RoleCompound
  = "w" scope:SeamVowel part:RoleCompoundPart root:ContentRoot rest:("x" r:ContentRoot { return r; })* ability:("x" v:[aeou] { return v; })? ending:Ending plural:PluralSuffix? WordEnd {
      const fields = {
        leftRoots: [],
        scopeVowel: scope,
        part,
        rightRoots: [root, ...rest],
      };
      if (ability) fields.stanceVowel = ability;
      return {
        ending,
        plural: !!plural,
        family: xFamily("role", fields),
      };
    }

// Part consonant: the slot or quality the word names (roles.md#role-compounds, roles.md#content-of-the-event).
RolePart
  = "th" { return "th"; }
  / [zdbhgywxv]

// A role compound names a participant or a quality of a named event; `v` would only repeat the stem as an event noun.
RoleCompoundPart
  = "th" { return "th"; }
  / [zdbhgywx]

// Hook prefix: extra-noun hook vowel(s) + seam + stem + ending (`guexavuvul` *anti-fighting*, hooks.md#hook-prefixes).
// Plain `x` is the hook's **-l** reading, `mx` its **-m** frame (`guemxewulel` *headwind*). No root has `x` and every
// root starts with a vowel, so one or two vowels before the seam are never a root. The stem may be an ordinary
// compound (`guexahehaxowurel`) and take label scope after it (`zuexavuvuthel`). A hook-compound citation as the
// stem (`guexowurelul` *anti-leaving*) parses as one long root here, and classify.ts splits it, as on a plain word.
HookPrefix
  = vowels:HookPrefixVowels frame:"m"? "x" root:ContentRoot rest:("x" r:ContentRoot { return r; })* scope:("th" v:SeamVowel { return v; })? ending:Ending plural:PluralSuffix? WordEnd {
      const fields = {
        leftRoots: [],
        hook: vowels + (frame ? "m" : "l"),
        rightRoots: [root, ...rest],
      };
      if (scope) fields.scopeVowel = scope;
      return {
        ending,
        plural: !!plural,
        family: xFamily("hookPrefix", fields),
      };
    }

// The extra-noun hooks' vowels (hooks.md#extra-noun-intermediate); other pairs (`ea`, `ou`, …) have no hook.
HookPrefixVowels
  = "ao" / "ae" / "oe" / "ua" / "ue" / "uo" / [aeou]

// Simplex or stacked seam after mid-word `th` (sakes.md; predication.md#label-scope).
SeamVowel
  = "ao" / "ae" / "oe" / "ua" / "ue" / "uo" / [aeou]

// Sakes: sake root + `th` + stance vowel (sakes.md); optional emotion
// tail = horizon letter + locus hook vowel(s), then the motion ending (feelings-permission.md#emotion-compose).
// On a non-sake host the tailed shape is a viewpoint lateral (classify.ts).
ValueCompound
  = host:CompoundHost "th" stanceV:SeamVowel tail:(h:[lmr] l:("ao" / "ae" / "oe" / "ua" / "uo" / "ue" / [aeou]) { return [h, l]; })? ending:Ending plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: xFamily("sake", {
          leftRoots: host,
          stanceVowel: stanceV,
          ...(tail ? { horizon: tail[0], locus: tail[1] } : {}),
        }),
      };
    }

// Viewpoint lateral: direction + `th` + whose facing counts (roles.md § Viewpoint laterals).
// **-r** resumes the anchor (`hewezathuzozer` *on Uzozen's left*).
LateralCompound
  = dir:ContentRoot "th" anchor:CompoundHost ending:Ending plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: xFamily("lateral", {
          leftRoots: [dir],
          rightRoots: anchor,
        }),
      };
    }

// Ability (or conversation-length bid on a name): host + `x` + vowel.
AbilityCompound
  = host:CompoundHost "x" stanceV:[aeou] ending:Ending plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: xFamily("ability", {
          leftRoots: host,
          stanceVowel: stanceV,
        }),
      };
    }

CompoundHost
  = first:ContentRoot rest:("x" r:ContentRoot { return r; })* {
      return [first].concat(rest);
    }

// Numeric prefix: number body + `x` (exact) or `mx` (approximately that number) + stem (numeric-derivation.md).
// The body starts with `r`, which no root, hook vowel, or role marker does, and number words hold no `x`, so the
// first `x` after the body is the seam. The stem may be an ordinary compound; its last root is the kind.
NumericPrefix
  = stem:PoslessNumberStem approx:"m"? "x" root:ContentRoot rest:("x" r:ContentRoot { return r; })* ending:Ending plural:PluralSuffix? WordEnd {
      const fields = {
        leftRoots: [],
        rightRoots: [root, ...rest],
        numberStem: stem,
      };
      if (approx) fields.approx = true;
      return {
        ending,
        plural: !!plural,
        family: xFamily("numeric", fields),
      };
    }

OrdinaryCompound
  = left:ContentRoot "x" right:ContentRoot rest:("x" r:ContentRoot { return r; })* ending:NounEnding plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: xFamily("compound", {
          leftRoots: [left],
          rightRoots: [right, ...rest],
        }),
      };
    }

ForeignPayload
  = chars:$( (!">" .)* ) { return chars; }

// ── Fused extra-noun hook after a citation (hooks.md Advanced) ──────────────

hookCompound
  = body:HookCompoundCite plural:PluralSuffix? WordEnd {
      const parts = splitHookCompound(body);
      return {
        ending: parts.hook.charAt(parts.hook.length - 1),
        plural: !!plural,
        family: {
          kind: "hookCompound",
          leftRoot: parts.leftRoot,
          leftEnding: parts.leftEnding,
          hook: parts.hook,
        },
      };
    }

HookCompoundCite
  = chars:$([aeou] [aeouhwdybgzmnvlr]+)
    &{ return splitHookCompound(chars) != null; }
    { return chars; }

// ── Join markers ────────────────────────────────────────────────────────────

// Hooked join: extra-noun hook vowel(s) + the hook's ending (`m` the frame, `r` point back; **-l** unwritten) + `x` +
// join vowel(s) + join ending (`zexual` *everyone at …*, `zemxuam`, `zerxarx`; hooks.md#hooked-joins). After the seam a
// hook prefix has a root (vowel, consonant, vowel), and this has only vowels and an ending, so the two never meet.
// The join's **-n** and stand-in codas have no reading here, nor `l` or `n` before the seam.
hookedJoin
  = vowels:HookPrefixVowels hookEnd:[mr]? "x" series:JoinSeries ending:[lmr] plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: { kind: "joinMarker", series, hook: vowels + (hookEnd || "l") },
      };
    }


joinMarker
  = series:StandInSeries cluster:StandInCoda WordEnd {
      return {
        ending: cluster,
        family: { kind: "joinMarker", series },
      };
    }
  / series:JoinSeries ending:Ending plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: { kind: "joinMarker", series },
      };
    }

StandInSeries
  = "a" / "e" / "o" / "u"

StandInCoda
  = "rl" / "rm" / "rn" / "rth"

JoinSeries
  = "ao" / "ua" / "uo" / "ae" / "oe" / "ue" / "a" / "e" / "o" / "u"

// ── Plain content / foreign ─────────────────────────────────────────────────

plainContent
  = "<" payload:ForeignPayload ">" ending:Ending {
      return {
        ending,
        family: { kind: "foreign", payload },
      };
    }
  / root:(ClusterRoot / ContentRoot) ending:NounEnding plural:PluralSuffix? {
      return {
        ending,
        plural: !!plural,
        family: contentFamily([root]),
      };
    }

// ── Citation (prefix-less root + ending) ────────────────────────────────────

citation
  = body:(HookPrefix / ValueCompound / LateralCompound / AbilityCompound / NumericPrefix / OrdinaryCompound)
    {
      return makeWord(text(), {
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }
  / marks:WritingMarks? "<" payload:ForeignPayload ">" WordEnd {
      const ending = spanEnding(marks);
      return makeWord(text(), {
        ending,
        family: writingSpanFamily("<", payload, marks),
      });
    }
  / root:(ClusterRoot / ContentRoot) ending:NounEnding plural:PluralSuffix? {
      return makeWord(text(), {
        ending,
        plural: !!plural,
        family: contentFamily([root]),
      });
    }
  / body:hookCompound {
      return makeWord(text(), {
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }

// ── Lexical primitives ──────────────────────────────────────────────────────

// Role letter, or hosted `/b/` `bl-` (clause.md#extra-nouns), before a number or a writing span.
RolePrefix
  = "b" "l" { return { pos: "b", bl: true }; }
  / pos:Pos { return { pos }; }

Pos
  = "th" { return "th"; }
  / "y" { return "y"; }
  / [zdbvgwhx] { return text(); }

Ending
  = "rl" / "rm" / "rn" / [lmnr] { return text(); }

// A noun-shaped content word may also end in **-ln**: one thing the name applies to (word-endings.md#name-instance--ln).
NounEnding
  = "ln" { return "ln"; }
  / Ending

PluralSuffix
  = "x" { return true; }

ContentRoot
  = first:[aeou] rest:RootTail {
      return first + rest;
    }

// A place-name root with a consonant cluster (phonology.md#place-name-roots): a vowel first and last,
// no vowel run, and no **-l** / **-m** + `r` (the closed root-first numeric shape). Only a plain content word
// or a citation takes one; compounds and seams take ordinary roots.
ClusterRoot
  = root:$([aeou] (Onset+ [aeou])+) &{ return /[^aeou]{2}/.test(root) && !/[lm]r/.test(root); } {
      return root;
    }

RootTail
  = parts:(Onset [aeou])+ {
      return parts.map(function (p) { return p[0] + p[1]; }).join("");
    }

Onset
  = [hwdybgzmnvlr]
