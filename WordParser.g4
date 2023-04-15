grammar Grammar;
// notes on using ANTLR: https://github.com/antlr/antlr4/blob/master/doc/index.md
//TEST sentence: Hawolel bamol deram, bohuzel ram.
// hawolelbamolderambohuzelram
start: sentence  EOF;

modifier_clause:
     MODIFIER
   | modifier_clause META_MODIFIER
;
subject_clause: SUBJECT modifier_clause*;
verb_clause: VERB modifier_clause*;
direct_object_clause: DIRECT_OBJECT modifier_clause*;
intention_clause: INTENTION modifier_clause*;
pronoun_clause: PRONOUN;

entity_clause: subject_clause | verb_clause | direct_object_clause | intention_clause | pronoun_clause;
sentence: entity_clause+;

SUBJECT: 'b' BASE_WORD;
DIRECT_OBJECT: 'v' BASE_WORD;
INDIRECT_OBJECT: 'nez' BASE_WORD;
VERB: 'h' BASE_WORD;
MODIFIER: 'r' BASE_WORD;
META_MODIFIER: 'm' BASE_WORD;
MOOD: 'l' BASE_WORD;
CONJUNCTION: 'z' BASE_WORD;
PRONOUN: 'd' BASE_WORD;
INTENTION: 'g' BASE_WORD;

fragment CONSONANT: [zgvbhdjwmnrl];
fragment VOWEL: [aeou];
fragment WORD_BOUNDARY: [nlm];
fragment BASE_WORD: CONSONANT? VOWEL (CONSONANT VOWEL)* WORD_BOUNDARY;
