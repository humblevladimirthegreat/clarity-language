{{
  const SPEECH_DIGITS = {
    wo: "1", du: "2", re: "3", mo: "4", va: "5",
    gu: "6", le: "7", ha: "8", na: "9", zo: "0",
  };

  // Role + ability (`gaxedegexal` *fit to be a teacher*) is classification only: `/ɡ/`.
  function roleAbilityPosOk(pos, body) {
    const f = body.family;
    return !(f && f.kind === "x" && f.xFamily === "role" && f.stanceVowel) || pos === "g";
  }

  function makeWord(raw, fields) {
    const word = { raw, ...fields };
    if (word.gl === false) delete word.gl;
    if (word.plural === false) delete word.plural;
    if (word.ending === undefined) delete word.ending;
    return word;
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

  function writingMarkerFromSpeechV(v) {
    if (v === "oe") return "_";
    if (v === "ue") return "#-";
    if (v === "uo") return "#_";
    if (v === "ua") return "+-";
    if (v === "a") return "+";
    if (v === "u") return "-";
    if (v === "e") return "#";
    if (v === "o") return "_";
    return "#-";
  }

  // Spoken group separator `th` + first vowel of the spoken marker (numbers.md § Saying it aloud).
  // Mantissa 0 / 1 + bare ba / bu is one digitless-exp stem (`woba` = `1e`), matching writing `g+1e`.
function foldDigitlessTail(stem, digitless) {
  const only = stem.groups.length === 1 ? stem.groups[0] : null;
  if (only && Object.keys(only).length === 1 && (only.mantissa === "0" || only.mantissa === "1") && (digitless === "e" || digitless === "e-")) {
    stem.groups = [];
    stem.digitlessExp = only.mantissa + digitless;
  } else stem.digitlessExp = digitless;
}

// A lone exponent group is the writing's digitless-exp body (`rabare` = `+e3`, `razobuwo` = `+0e-1`).
function foldBareExponent(stem) {
  const only = stem.groups.length === 1 ? stem.groups[0] : null;
  if (!only || !only.exponentSign || only.exponentDigits === undefined || only.percent || only.decimal) return;
  const exp = (only.exponentSign === "ba" ? "e" : "e-") + only.exponentDigits;
  const keys = Object.keys(only).filter((k) => k !== "hasJa");
  if (keys.length === 2) {
    stem.groups = [];
    stem.digitlessExp = exp;
  } else if (keys.length === 3 && only.mantissa === "0" && exp === "e-1") {
    stem.groups = [];
    stem.digitlessExp = "0e-1";
  }
}

function separatorVowel(markerV) {
    return markerV.charAt(0);
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
  / pos:Pos body:xWord &{ return roleAbilityPosOk(pos, body); } EOF {
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
  = pos:Pos marks:WritingMarks? bracketed:BracketedPayload WordEnd
    &{ return !(bracketed.bracket === "[" || bracketed.bracket === "(") || bracketed.payload.trim() !== "="; }
    {
      const ending = spanEnding(marks);
      return makeWord(text(), {
        pos,
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

// Plural **-x** parses on any number; enforce keeps it to ordinal pronouns (pronouns.md § Ordinal pronouns).
freeNumber
  = pos:Pos mark:WritingEndingMark? stem:WritingNumberStem ending:Ending? plural:PluralSuffix? {
      return makeWord(text(), {
        pos,
        ending: endingFromWritingMark(mark, ending || "l"),
        plural: !!plural,
        family: numberFamily(stem, mark || undefined),
      });
    }
  / pos:Pos mark:WritingEndingMark? stem:SpeechNumberStem ending:Ending plural:PluralSuffix? {
      return makeWord(text(), {
        pos,
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
  / marker:WritingMarker body:WritingNumberBody? {
      const stem = { marker, groups: body && body.groups ? body.groups : [] };
      if (body && body.digitlessExp) stem.digitlessExp = body.digitlessExp;
      return stem;
    }

WritingMarker
  = "#_" / "+-" / "#-" / "#" / "+" / "-" / "_"

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
  = "e-" digits:Digit+ { return { sign: "bu", digits: digits.join("") }; }
  / "e" digits:Digit+ { return { sign: "ba", digits: digits.join("") }; }

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
  = "r" v:SpeechMarkerV body:SpeechDigitGroups
    &{ return body.seps.every(function (sep) { return sep === separatorVowel(v); }); }
    digitless:SpeechDigitlessTail? {
      const stem = { marker: writingMarkerFromSpeechV(v), groups: body.groups };
      if (v === "oe") stem.calendarOrdinal = true;
      if (digitless) foldDigitlessTail(stem, digitless);
      else foldBareExponent(stem);
      return stem;
    }

SpeechMarkerV
  = "oe" / "ue" / "uo" / "ua" / [aeou]

// Groups after the first are opened by separator `th` + the marker's first vowel.
SpeechDigitGroups
  = head:SpeechDigitGroup tail:(sep:SpeechGroupSeparator g:SpeechDigitGroup { return { sep, g }; })* {
      return { groups: [head].concat(tail.map(function (t) { return t.g; })), seps: tail.map(function (t) { return t.sep; }) };
    }
  / "" { return { groups: [], seps: [] }; }

SpeechGroupSeparator
  = "th" v:[aeou] { return v; }

SpeechDigitGroup
  = sign:("ba" / "bu") expDigits:SpeechDigitSeq "ya" mantissa:SpeechMantissa percent:SpeechPercent? {
      return compactGroup({
        exponentSign: sign,
        exponentDigits: parseSpeechDigits(expDigits),
        mantissa: mantissa.digits,
        decimal: mantissa.decimal,
        hasJa: true,
        percent,
      });
    }
  / sign:("ba" / "bu") expDigits:SpeechDigitSeq percent:SpeechPercent? {
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
  = "wo" / "du" / "re" / "mo" / "va" / "gu" / "le" / "ha" / "na" / "zo"

// After the marker: ba/bu alone, or mantissa 0/1 + ba/bu (zero×exp / hyperbole)
SpeechDigitlessTail
  = "zoba" { return "0e"; }
  / "zobu" { return "0e-"; }
  / "woba" { return "1e"; }
  / "wobu" { return "1e-"; }
  / "ba" { return "e"; }
  / "bu" { return "e-"; }

// PoS-less number stem (numeric derivation right half). Spelled CV only:
// shorthand (`+3`, `#e`) is for free numbers, never inside a derivation.
PoslessNumberStem
  = "r" v:SpeechMarkerV body:SpeechDigitGroups
    &{ return body.seps.every(function (sep) { return sep === separatorVowel(v); }); }
    digitless:SpeechDigitlessTail? {
      const stem = { marker: writingMarkerFromSpeechV(v), groups: body.groups };
      if (digitless) foldDigitlessTail(stem, digitless);
      else foldBareExponent(stem);
      return stem;
    }

// ── Hooks (prefix-less; ending required; -r on a simplex vowel or a span hook; no -x) ────────────────────────

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
  / pos:Pos body:PrefixedBody &{ return roleAbilityPosOk(pos, body); } {
      return makeWord(text(), {
        pos,
        ending: body.ending,
        plural: body.plural,
        family: body.family,
      });
    }

PrefixedBody
  = xWord
  / plainContent
  / hookCompound
  / joinMarker

// ── Mid-word x families (decision order steps 2–6) ──────────────────────────

xWord
  = RolePointer
  / RoleCompound
  / ValueCompound
  / LateralCompound
  / AbilityCompound
  / NumericDerivation
  / OrdinaryCompound
  / HeldPointer

// Role pointer: role vowel(s) + `x` + pointer vowel + **-r** / **-l** / **-m** (`zaxar`, `zaxal`, `zaxam`;
// pronouns.md#role-pointers). The pointer vowel picks the event: `a` same, `o` other, `e` self, `u` unsaid.
// **-r** names the participant, **-l** a new one of its kind, **-m** its part in the event.
RolePointer
  = roleV:("ae" / "ao" / "oe" / "ua" / "ue" / "uo" / "a" / "e" / "u" / "o") "x" pointerV:[aeou] end:[rlm] plural:PluralSuffix? WordEnd {
      return {
        ending: end,
        plural: !!plural,
        family: xFamily("pointer", {
          leftRoots: [],
          roleVowel: roleV,
          pointerVowel: pointerV,
        }),
      };
    }

// The stem may itself be an ordinary compound (`zaxodogaxowogal` *dog walker*, roles.md#role-compounds).
// Optional tail: ability (`x` + stance vowel) on `/ɡ/` only (*fit to be* that role, intention.md § Ability),
// or label scope (`th` + scope vowel, predication.md#label-scope); one seam per word.
RoleCompound
  = roleV:("ae" / "ao" / "oe" / "ua" / "ue" / "uo" / "a" / "e" / "u" / "o") "x" root:ContentRoot rest:("x" r:ContentRoot { return r; })* tail:RoleTail? ending:Ending plural:PluralSuffix? WordEnd {
      const fields = {
        leftRoots: [],
        roleVowel: roleV,
        rightRoots: [root, ...rest],
      };
      if (tail && tail.ability) fields.stanceVowel = tail.ability;
      if (tail && tail.scope) fields.scopeVowel = tail.scope;
      return {
        ending,
        plural: !!plural,
        family: xFamily("role", fields),
      };
    }

RoleTail
  = "x" v:[aeou] { return { ability: v }; }
  / "th" v:[aeou] { return { scope: v }; }

// Sakes: sake root + `th` + stance vowel (sakes.md); optional emotion
// tail = horizon letter + locus hook vowel(s), then the motion ending (sakes.md#emotion-compose).
// On a non-sake host the tailed shape is a viewpoint lateral (classify.ts).
ValueCompound
  = host:CompoundHost "th" stanceV:[aeou] tail:(h:[lmr] l:("ao" / "ae" / "oe" / "ua" / "uo" / "ue" / [aeou]) { return [h, l]; })? ending:Ending plural:PluralSuffix? WordEnd {
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

NumericDerivation
  = host:ContentRoot join:[lm] stem:PoslessNumberStem ending:Ending plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: xFamily("numeric", {
          leftRoots: [host],
          join,
          numberStem: stem,
        }),
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
  / left:[aeou] "x" right:[aeou] rest:("x" r:[aeou] { return r; })* ending:Ending plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: xFamily("compound", {
          leftRoots: [left],
          rightRoots: [right, ...rest],
        }),
      };
    }

// A stacked-vowel role pointer after a holder host and its grade (`thunemuexar`, knowing.md#holder).
// classify.ts checks the host; a single role vowel there reads as an ability shape first.
HeldPointer
  = host:$((!(("ae" / "ao" / "oe" / "ua" / "ue" / "uo") "x" [aeou] "r" "x"? WordEnd) [a-z])+) roleV:("ae" / "ao" / "oe" / "ua" / "ue" / "uo") "x" pointerV:[aeou] "r" plural:PluralSuffix? WordEnd {
      return {
        ending: "r",
        plural: !!plural,
        family: xFamily("pointer", {
          leftRoots: [host],
          roleVowel: roleV,
          pointerVowel: pointerV,
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

joinMarker
  = series:StandInSeries cluster:StandInCoda WordEnd {
      return {
        ending: cluster,
        family: { kind: "joinMarker", series },
      };
    }
  / series:JoinSeries ending:Ending WordEnd {
      return {
        ending,
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
  / root:ContentRoot ending:NounEnding plural:PluralSuffix? {
      return {
        ending,
        plural: !!plural,
        family: contentFamily([root]),
      };
    }

// ── Citation (prefix-less root + ending) ────────────────────────────────────

citation
  = body:(ValueCompound / LateralCompound / AbilityCompound / NumericDerivation / OrdinaryCompound)
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
  / root:ContentRoot ending:NounEnding plural:PluralSuffix? {
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

RootTail
  = parts:(Onset [aeou])+ {
      return parts.map(function (p) { return p[0] + p[1]; }).join("");
    }

Onset
  = [hwdybgzmnvlr]
