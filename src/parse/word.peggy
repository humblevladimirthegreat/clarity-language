{{
  const SPEECH_DIGITS = {
    wo: "1", du: "2", re: "3", mo: "4", va: "5",
    gu: "6", le: "7", ha: "8", na: "9", zo: "0",
  };

  function spanCloseFlavor(form) {
    if (form === "xuxul") return "complete";
    if (form === "xuxur") return "editorial";
    return "closeAll";
  }

  function spanOpenLegal(edgeV, ending) {
    if (edgeV === "u") return ending === "l" || ending === "r";
    return ending === "l" || ending === "m" || ending === "n";
  }

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

  function writingSpanFamily(bracket, payload, marks, anaphor, clauseScoped) {
    return {
      kind: "writingSpan",
      bracket,
      payload,
      marks: marks || [],
      anaphor: !!anaphor,
      ...(clauseScoped ? { clauseScoped: true } : {}),
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
  function separatorVowel(markerV) {
    return markerV.charAt(0);
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
  const ROOT_CONS = "hwdjbgzmnvlr";

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

NumberBodyEnd = &(Ending / WS / EOF)

Word
  = spanClose
  / writingSpan
  / freeNumber
  / hook
  / prefixedWord
  / citation

// Independent probes for the ambiguity checker (not used by ordinary parse).
probe_spanClose = word:spanClose EOF { return word; }
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

// ── Span closes (decision order step 1) ─────────────────────────────────────

spanClose
  = form:("xuxul" / "xuxur" / "xuxum") {
      return makeWord(form, {
        family: { kind: "spanClose", flavor: spanCloseFlavor(form) },
      });
    }

// ── Writing bracket atoms (`[]` `{}` `()`; `<>` is foreign / opaque) ────────

writingSpan
  = pos:Pos marks:WritingMarks? anaphor:AnaphorBracket WordEnd {
      return makeWord(text(), {
        pos,
        ending: "r",
        family: writingSpanFamily(anaphor.bracket, "=", marks, true),
      });
    }
  / pos:Pos marks:WritingMarks? bracketed:BracketedPayload WordEnd {
      const ending = marks && marks.includes("@") ? "n" : marks && marks.includes("~") ? "m" : "l";
      return makeWord(text(), {
        pos,
        ending,
        family: writingSpanFamily(bracketed.bracket, bracketed.payload, marks, false),
      });
    }
  // Clause-scoped (EDGE e): no close; the tokenizer ran the interior to the clause end.
  / pos:Pos marks:WritingMarks? bracket:[[\u007b(] payload:$(.*) EOF {
      const ending = marks && marks.includes("@") ? "n" : marks && marks.includes("~") ? "m" : "l";
      return makeWord(text(), {
        pos,
        ending,
        family: writingSpanFamily(bracket, payload.trim(), marks, false, true),
      });
    }

WritingMarks
  = marks:("@" / "~")+ { return marks; }

AnaphorBracket
  = "[" "=" "]" { return { bracket: "[" }; }
  / "\u007b" "=" "\u007d" { return { bracket: "\u007b" }; }
  / "(" "=" ")" { return { bracket: "(" }; }
  / "<" "=" ">" { return { bracket: "<" }; }

BracketedPayload
  = "[" payload:SquareInner "]" { return { bracket: "[", payload }; }
  / "\u007b" payload:CurlyInner "\u007d" { return { bracket: "\u007b", payload }; }
  / "(" payload:RoundInner ")" { return { bracket: "(", payload }; }
  / "<" payload:$((!">" .)*) ">" { return { bracket: "<", payload }; }

// Native interiors may nest; skip opaque `<>` so `d<]>` does not close `[…]`.
SquareInner
  = chars:SquareChar* { return chars.join(""); }

SquareChar
  = OpaqueIsland
  / "[" inner:SquareInner "]" { return "[" + inner + "]"; }
  / !"]" c:. { return c; }

CurlyInner
  = chars:CurlyChar* { return chars.join(""); }

CurlyChar
  = OpaqueIsland
  / "\u007b" inner:CurlyInner "\u007d" { return "\u007b" + inner + "\u007d"; }
  / !"\u007d" c:. { return c; }

RoundInner
  = chars:RoundChar* { return chars.join(""); }

RoundChar
  = OpaqueIsland
  / "(" inner:RoundInner ")" { return "(" + inner + ")"; }
  / !")" c:. { return c; }

OpaqueIsland
  = "<" p:$((!">" .)*) ">" { return "<" + p + ">"; }

// ── Free number words (writing + speech) ────────────────────────────────────

freeNumber
  = pos:Pos mark:WritingEndingMark? stem:WritingNumberStem ending:Ending? {
      return makeWord(text(), {
        pos,
        ending: endingFromWritingMark(mark, ending || "l"),
        family: numberFamily(stem, mark || undefined),
      });
    }
  / pos:Pos mark:WritingEndingMark? stem:SpeechNumberStem ending:Ending {
      return makeWord(text(), {
        pos,
        ending: endingFromWritingMark(mark, ending),
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
      if (digitless) stem.digitlessExp = digitless;
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
  = sign:("ba" / "bu") expDigits:SpeechDigitSeq ("ya" / "ja") mantissa:SpeechMantissa percent:SpeechPercent? {
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
  = int:SpeechDigitSeq ("ye" / "je") frac:SpeechDigitSeq {
      return { digits: parseSpeechDigits(int) + "." + parseSpeechDigits(frac), decimal: true };
    }
  / ("ye" / "je") frac:SpeechDigitSeq {
      return { digits: "." + parseSpeechDigits(frac), decimal: true };
    }
  / digits:SpeechDigitSeq {
      return { digits: parseSpeechDigits(digits) };
    }

SpeechPercent
  = ("yu" / "ju") { return "yu"; }
  / ("yo" / "jo") { return "yo"; }

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
      if (digitless) stem.digitlessExp = digitless;
      return stem;
    }

// ── Hooks (prefix-less; ending required; no -r / -x) ────────────────────────

hook
  = form:HookForm WordEnd {
      return makeWord(form, {
        ending: form.charAt(form.length - 1),
        family: { kind: "hook", form },
      });
    }

HookForm
  = ("ao" / "ae" / "oe" / "ua" / "uo" / "ue" / [aeou]) [lmn] { return text(); }

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
  = SpanOpen
  / RoleCompound
  / ValueCompound
  / LateralCompound
  / AbilityCompound
  / NumericDerivation
  / OrdinaryCompound

SpanOpen
  = typeV:[aeou] "x" edgeV:[aeou] ending:Ending plural:PluralSuffix?
    &{ return spanOpenLegal(edgeV, ending); }
    WordEnd
    {
      return {
        ending,
        plural: !!plural,
        family: xFamily("span", {
          leftRoots: [],
          typeVowel: typeV,
          edgeVowel: edgeV,
        }),
      };
    }

// Optional ability tail (`x` + stance vowel) on `/ɡ/` only: *fit to be* that role (intention.md § Ability).
RoleCompound
  = roleV:("a" / "e" / "u" / "o") "x" root:ContentRoot ability:("x" v:[aeou] { return v; })? ending:Ending plural:PluralSuffix? WordEnd {
      const fields = {
        leftRoots: [],
        roleVowel: roleV,
        rightRoots: [root],
      };
      if (ability) fields.stanceVowel = ability;
      return {
        ending,
        plural: !!plural,
        family: xFamily("role", fields),
      };
    }

// Interests: interest root + `th` + stance vowel (interests.md).
ValueCompound
  = host:CompoundHost "th" stanceV:[aeou] ending:Ending plural:PluralSuffix? WordEnd {
      return {
        ending,
        plural: !!plural,
        family: xFamily("interest", {
          leftRoots: host,
          stanceVowel: stanceV,
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
  = left:ContentRoot "x" right:ContentRoot rest:("x" r:ContentRoot { return r; })* ending:Ending plural:PluralSuffix? WordEnd {
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
  = chars:$([aeou] [aeouhwdjbgzmnvlr]+)
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
  = "rl" / "rm" / "rn"

JoinSeries
  = "ao" / "ua" / "uo" / "ae" / "oe" / "eo" / "ue" / "a" / "e" / "o" / "u"

// ── Plain content / foreign ─────────────────────────────────────────────────

plainContent
  = "<" payload:ForeignPayload ">" ending:Ending {
      return {
        ending,
        family: { kind: "foreign", payload, opaque: false },
      };
    }
  / "<" payload:ForeignPayload ">" {
      return {
        family: { kind: "foreign", payload, opaque: true },
      };
    }
  / root:ContentRoot ending:Ending plural:PluralSuffix? {
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
  / marks:WritingMarks? anaphor:AngleAnaphor WordEnd {
      return makeWord(text(), {
        ending: "r",
        family: writingSpanFamily("<", "=", marks, true),
      });
    }
  / marks:WritingMarks? "<" payload:ForeignPayload ">" WordEnd {
      const ending = marks && marks.includes("@") ? "n" : marks && marks.includes("~") ? "m" : "l";
      return makeWord(text(), {
        ending,
        family: writingSpanFamily("<", payload, marks, false),
      });
    }
  / root:ContentRoot ending:Ending plural:PluralSuffix? {
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

AngleAnaphor
  = "<" "=" ">" { return true; }

// ── Lexical primitives ──────────────────────────────────────────────────────

Pos
  = "th" { return "th"; }
  / [yj] { return "y"; }
  / [zdbvgwhx] { return text(); }

Ending
  = "rl" / "rm" / "rn" / [lmnr] { return text(); }

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
  = [hwdjbgzmnvlr]
