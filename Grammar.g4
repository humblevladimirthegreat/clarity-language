grammar Grammar;
// notes on using ANTLR: https://github.com/antlr/antlr4/blob/master/doc/index.md

start: sentence  EOF;

word_boundary: SPACE; //TODO: space isn't needed if at the end of the sentence

modifier_clause:
     ENTITY_MODIFIER_ARTICLE CONTENT_WORD word_boundary
   | modifier_clause MODIFIER_MODIFIER_ARTICLE CONTENT_WORD word_boundary
;
subject_clause: SUBJECT_ARTICLE CONTENT_WORD word_boundary modifier_clause*;
verb_clause: VERB_ARTICLE CONTENT_WORD word_boundary modifier_clause*;
direct_object_clause: DIRECT_OBJECT_ARTICLE CONTENT_WORD word_boundary modifier_clause*;
preposition_clause: PREPOSITION_ARTICLE CONTENT_WORD word_boundary modifier_clause*;
intention_clause: INTENTION_ARTICLE CONTENT_WORD word_boundary modifier_clause*;

entity_clause: subject_clause | verb_clause | direct_object_clause | preposition_clause | intention_clause;
sentence: entity_clause+ SENTENCE_BOUNDARY;

SUBJECT_ARTICLE: 'nan ' | 'nar ';
DIRECT_OBJECT_ARTICLE: 'nyn ' | 'nyr ';
VERB_ARTICLE: 'nov ';
ENTITY_MODIFIER_ARTICLE: 'nem ';
MODIFIER_MODIFIER_ARTICLE: 'nel ';
ARGUMENT_ARTICLE: 'nil ';
PREPOSITION_ARTICLE: 'num ';
INTENTION_ARTICLE: 'niv ';

SPACE: ' ';
CONTENT_WORD: ('a'..'m'|'o'..'z')+;
SENTENCE_BOUNDARY: '.';
