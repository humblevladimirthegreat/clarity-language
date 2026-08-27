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

  function writingSpanFamily(bracket, payload, marks, anaphor) {
    return {
      kind: "writingSpan",
      bracket,
      payload,
      marks: marks || [],
      anaphor: !!anaphor,
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
    if (v === "a") return "+";
    if (v === "u") return "-";
    if (v === "e") return "#";
    if (v === "o") return "_";
    return "#-";
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

Word
  = spanClose
  / writingSpan
  / freeNumber
  / reviser
  / prefixedWord
  / citation

// ── Span closes (decision order step 1) ─────────────────────────────────────

spanClose
  = form:("xuxul" / "xuxur" / "xuxum") {
      return makeWord(form, {
        family: { kind: "spanClose", flavor: spanCloseFlavor(form) },
      });
    }

// ── Writing bracket atoms (`[]` `{}` `()`; `<>` is foreign / opaque) ────────

writingSpan
  = pos:Pos marks:WritingMarks? anaphor:AnaphorBracket {
      return makeWord(text(), {
        pos,
        ending: "r",
        family: writingSpanFamily(anaphor.bracket, "=", marks, true),
      });
    }
  / pos:Pos marks:WritingMarks? bracketed:BracketedPayload {
      const ending = marks && marks.includes("@") ? "n" : marks && marks.includes("~") ? "m" : "l";
      return makeWord(text(), {
        pos,
        ending,
        family: writingSpanFamily(bracketed.bracket, bracketed.payload, marks, false),
      });
    }

WritingMarks
  = marks:("@" / "~")+ { return marks; }

AnaphorBracket
  = "[" "=" "]" { return { bracket: "[" }; }
  / "\u007b" "=" "\u007d" { return { bracket: "\u007b" }; }
  / "(" "=" ")" { return { bracket: "(" }; }

BracketedPayload
  = "[" payload:$((!"]" .)*) "]" { return { bracket: "[", payload }; }
  / "\u007b" payload:$((!"\u007d" .)*) "\u007d" { return { bracket: "\u007b", payload }; }
  / "(" payload:$((!")" .)*) ")" { return { bracket: "(", payload }; }

// ── Free number words (writing + speech) ────────────────────────────────────

freeNumber
  = pos:Pos mark:WritingEndingMark? stem:WritingNumberStem {
      return makeWord(text(), {
        pos,
        ending: endingFromWritingMark(mark, "l"),
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
  = "#-" / "#" / "+" / "-" / "_"

WritingNumberBody
  = digitless:WritingDigitlessExp {
      return { groups: [], digitlessExp: digitless };
    }
  / head:WritingDigitGroup tail:("," g:WritingDigitGroup { return g; })* {
      return { groups: [head, ...tail] };
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
  = "%*" { return "ju"; }
  / "%" { return "jo"; }

WritingDigitlessExp
  = "0e-1" { return "0e-1"; }
  / "0e-" { return "0e-"; }
  / "0e" { return "0e"; }
  / "1e-" { return "1e-"; }
  / "1e" { return "1e"; }
  / "e-" { return "e-"; }
  / "e" { return "e"; }

Digit = [0-9]

// Speech-style: PoS + r + V + groups + ending. Marker normalizes to writing glyphs.
SpeechNumberStem
  = "r" v:SpeechMarkerV groups:SpeechDigitGroup* digitless:SpeechDigitlessTail? {
      const stem = { marker: writingMarkerFromSpeechV(v), groups };
      if (v === "oe") stem.calendarOrdinal = true;
      if (digitless) stem.digitlessExp = digitless;
      return stem;
    }

SpeechMarkerV
  = "oe" / "eu" / [aeou]

SpeechDigitGroup
  = sign:("ba" / "bu") expDigits:SpeechDigitSeq "ja" mantissa:SpeechMantissa percent:SpeechPercent? {
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
  = int:SpeechDigitSeq "je" frac:SpeechDigitSeq {
      return { digits: parseSpeechDigits(int) + "." + parseSpeechDigits(frac), decimal: true };
    }
  / "je" frac:SpeechDigitSeq {
      return { digits: "." + parseSpeechDigits(frac), decimal: true };
    }
  / digits:SpeechDigitSeq {
      return { digits: parseSpeechDigits(digits) };
    }

SpeechPercent
  = "ju" { return "ju"; }
  / "jo" { return "jo"; }

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

// PoS-less number stem (numeric derivation right half)
PoslessNumberStem
  = marker:WritingMarker body:WritingNumberBody? {
      const stem = { marker, groups: body && body.groups ? body.groups : [] };
      if (body && body.digitlessExp) stem.digitlessExp = body.digitlessExp;
      return stem;
    }
  / "r" v:SpeechMarkerV groups:SpeechDigitGroup* digitless:SpeechDigitlessTail? {
      const stem = { marker: writingMarkerFromSpeechV(v), groups };
      if (digitless) stem.digitlessExp = digitless;
      return stem;
    }

// ── Revisers (prefix-less; ending required; no -r / -sh) ─────────────────────

reviser
  = form:ReviserForm {
      return makeWord(form, {
        ending: form.charAt(1),
        family: { kind: "reviser", form },
      });
    }

ReviserForm
  = [aeou] [lmn] { return text(); }

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
  / pos:Pos body:PrefixedBody {
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
  / joinMarker

// ── Mid-word x families (decision order steps 2–6) ──────────────────────────

xWord
  = SpanOpen
  / RoleCompound
  / ValueAbilityCompound
  / NumericDerivation
  / OrdinaryCompound

SpanOpen
  = typeV:[aeou] "x" edgeV:[aeou] ending:Ending plural:PluralSuffix?
    &{ return spanOpenLegal(edgeV, ending); }
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

RoleCompound
  = roleV:("a" / "u" / "o") "x" root:ContentRoot ending:Ending plural:PluralSuffix? {
      return {
        ending,
        plural: !!plural,
        family: xFamily("role", {
          leftRoots: [],
          roleVowel: roleV,
          rightRoots: [root],
        }),
      };
    }

ValueAbilityCompound
  = host:ContentRoot "x" stanceV:[aeou] ending:Ending plural:PluralSuffix? {
      return {
        ending,
        plural: !!plural,
        family: xFamily("valueAbility", {
          leftRoots: [host],
          stanceVowel: stanceV,
        }),
      };
    }

NumericDerivation
  = host:ContentRoot "x" stem:PoslessNumberStem ending:Ending plural:PluralSuffix? {
      return {
        ending,
        plural: !!plural,
        family: xFamily("numeric", {
          leftRoots: [host],
          numberStem: stem,
        }),
      };
    }

OrdinaryCompound
  = left:ContentRoot "x" right:ContentRoot rest:("x" r:ContentRoot { return r; })* ending:Ending plural:PluralSuffix? {
      return {
        ending,
        plural: !!plural,
        family: xFamily("compound", {
          leftRoots: [left],
          rightRoots: [right, ...rest],
        }),
      };
    }
  / left:[aeou] "x" right:[aeou] rest:("x" r:[aeou] { return r; })* ending:Ending plural:PluralSuffix? {
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

// ── Join markers ────────────────────────────────────────────────────────────

joinMarker
  = series:JoinSeries ending:Ending {
      return {
        ending,
        family: { kind: "joinMarker", series },
      };
    }

JoinSeries
  = "ao" / "ua" / "uo" / "ae" / "oe" / "ue" / "a" / "e" / "o" / "u"

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
  = root:ContentRoot ending:Ending plural:PluralSuffix? {
      return makeWord(text(), {
        ending,
        plural: !!plural,
        family: contentFamily([root]),
      });
    }

// ── Lexical primitives ──────────────────────────────────────────────────────

Pos
  = [zdbvgwhxj] { return text(); }

Ending
  = [lmnr] { return text(); }

PluralSuffix
  = "sh" { return true; }

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
