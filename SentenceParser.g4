grammar SentenceParser;
options { caseInsensitive = true; }

// notes on using ANTLR: https://github.com/antlr/antlr4/blob/master/doc/index.md
// TEST sentence: Hawolel bamol deram, bohuzel ram.
// hawolelbamolderambohuzelram
start: sentence  EOF;

modifier_clause:
     MODIFIER
   | modifier_clause META_MODIFIER
;
subject_clause: (DEFINITE_PRONOUN | INDEFINITE_PRONOUN)? SUBJECT modifier_clause*;
verb_clause: VERB modifier_clause*;
direct_object_clause: (DEFINITE_PRONOUN | INDEFINITE_PRONOUN)? DIRECT_OBJECT modifier_clause*;
intention_clause: INTENTION modifier_clause*;

entity_clause: subject_clause | verb_clause | direct_object_clause | intention_clause;
relative_clause: RELATIVE_PRONOUN entity_clause+;
sentence: entity_clause+ relative_clause?;

SUBJECT: 'b' BASE_WORD;
DIRECT_OBJECT: 'v' BASE_WORD;
INDIRECT_OBJECT: 'nez' BASE_WORD;
VERB: 'h' BASE_WORD;
MODIFIER: 'r' BASE_WORD;
META_MODIFIER: 'm' BASE_WORD;
MOOD: 'l' BASE_WORD;
CONJUNCTION: 'z' BASE_WORD;
DEFINITE_PRONOUN: 'dr' PRONOUN_3P;
INDEFINITE_PRONOUN: 'd' PRONOUN_3P;
RELATIVE_PRONOUN: 'de' ('b' | 'v' | 'nez' | 'r') PRONOUN_3P;//TODO change so der gets recognized as a modifier
INTENTION: 'g' BASE_WORD;

//TODO: implement conjunctions

fragment PRONOUN_3P: [aoe][mln];
fragment CONSONANT: [zgvbhdjwmnrl];
fragment VOWEL: [aeou];
fragment WORD_BOUNDARY: [nlm];
fragment BASE_WORD: CONSONANT? VOWEL (CONSONANT VOWEL)* WORD_BOUNDARY;

WHITESPACE: [ \n]+ -> skip;
PUNCTUATION: [,.] -> skip;