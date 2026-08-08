
import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";


export class SentenceParserLexer extends antlr.Lexer {
    public static readonly SUBJECT = 1;
    public static readonly DIRECT_OBJECT = 2;
    public static readonly INDIRECT_OBJECT = 3;
    public static readonly VERB = 4;
    public static readonly MODIFIER = 5;
    public static readonly META_MODIFIER = 6;
    public static readonly MOOD = 7;
    public static readonly CONJUNCTION = 8;
    public static readonly DEFINITE_PRONOUN = 9;
    public static readonly INDEFINITE_PRONOUN = 10;
    public static readonly RELATIVE_PRONOUN = 11;
    public static readonly INTENTION = 12;
    public static readonly WHITESPACE = 13;
    public static readonly PUNCTUATION = 14;

    public static readonly channelNames = [
        "DEFAULT_TOKEN_CHANNEL", "HIDDEN"
    ];

    public static readonly literalNames = [
    ];

    public static readonly symbolicNames = [
        null, "SUBJECT", "DIRECT_OBJECT", "INDIRECT_OBJECT", "VERB", "MODIFIER", 
        "META_MODIFIER", "MOOD", "CONJUNCTION", "DEFINITE_PRONOUN", "INDEFINITE_PRONOUN", 
        "RELATIVE_PRONOUN", "INTENTION", "WHITESPACE", "PUNCTUATION"
    ];

    public static readonly modeNames = [
        "DEFAULT_MODE",
    ];

    public static readonly ruleNames = [
        "SUBJECT", "DIRECT_OBJECT", "INDIRECT_OBJECT", "VERB", "MODIFIER", 
        "META_MODIFIER", "MOOD", "CONJUNCTION", "DEFINITE_PRONOUN", "INDEFINITE_PRONOUN", 
        "RELATIVE_PRONOUN", "INTENTION", "PRONOUN_3P", "CONSONANT", "VOWEL", 
        "WORD_BOUNDARY", "BASE_WORD", "WHITESPACE", "PUNCTUATION",
    ];


    public constructor(input: antlr.CharStream) {
        super(input);
        this.interpreter = new antlr.LexerATNSimulator(this, SentenceParserLexer._ATN, SentenceParserLexer.decisionsToDFA, new antlr.PredictionContextCache());
    }

    public get grammarFileName(): string { return "SentenceParser.g4"; }

    public get literalNames(): (string | null)[] { return SentenceParserLexer.literalNames; }
    public get symbolicNames(): (string | null)[] { return SentenceParserLexer.symbolicNames; }
    public get ruleNames(): string[] { return SentenceParserLexer.ruleNames; }

    public get serializedATN(): number[] { return SentenceParserLexer._serializedATN; }

    public get channelNames(): string[] { return SentenceParserLexer.channelNames; }

    public get modeNames(): string[] { return SentenceParserLexer.modeNames; }

    public static readonly _serializedATN: number[] = [
        4,0,14,123,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,
        2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,
        13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,1,0,1,
        0,1,0,1,1,1,1,1,1,1,2,1,2,1,2,1,2,1,2,1,2,1,3,1,3,1,3,1,4,1,4,1,
        4,1,5,1,5,1,5,1,6,1,6,1,6,1,7,1,7,1,7,1,8,1,8,1,8,1,8,1,8,1,9,1,
        9,1,9,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,3,10,83,8,10,1,10,
        1,10,1,11,1,11,1,11,1,12,1,12,1,12,1,13,1,13,1,14,1,14,1,15,1,15,
        1,16,3,16,100,8,16,1,16,1,16,1,16,1,16,5,16,106,8,16,10,16,12,16,
        109,9,16,1,16,1,16,1,17,4,17,114,8,17,11,17,12,17,115,1,17,1,17,
        1,18,1,18,1,18,1,18,0,0,19,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,
        9,19,10,21,11,23,12,25,0,27,0,29,0,31,0,33,0,35,13,37,14,1,0,18,
        2,0,66,66,98,98,2,0,86,86,118,118,2,0,78,78,110,110,2,0,69,69,101,
        101,2,0,90,90,122,122,2,0,72,72,104,104,2,0,82,82,114,114,2,0,77,
        77,109,109,2,0,76,76,108,108,2,0,68,68,100,100,4,0,66,66,86,86,98,
        98,118,118,2,0,71,71,103,103,6,0,65,65,69,69,79,79,97,97,101,101,
        111,111,2,0,76,78,108,110,16,0,66,66,68,68,71,72,74,74,76,78,82,
        82,86,87,90,90,98,98,100,100,103,104,106,106,108,110,114,114,118,
        119,122,122,8,0,65,65,69,69,79,79,85,85,97,97,101,101,111,111,117,
        117,2,0,10,10,32,32,2,0,44,44,46,46,122,0,1,1,0,0,0,0,3,1,0,0,0,
        0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,
        15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,
        35,1,0,0,0,0,37,1,0,0,0,1,39,1,0,0,0,3,42,1,0,0,0,5,45,1,0,0,0,7,
        51,1,0,0,0,9,54,1,0,0,0,11,57,1,0,0,0,13,60,1,0,0,0,15,63,1,0,0,
        0,17,66,1,0,0,0,19,71,1,0,0,0,21,74,1,0,0,0,23,86,1,0,0,0,25,89,
        1,0,0,0,27,92,1,0,0,0,29,94,1,0,0,0,31,96,1,0,0,0,33,99,1,0,0,0,
        35,113,1,0,0,0,37,119,1,0,0,0,39,40,7,0,0,0,40,41,3,33,16,0,41,2,
        1,0,0,0,42,43,7,1,0,0,43,44,3,33,16,0,44,4,1,0,0,0,45,46,7,2,0,0,
        46,47,7,3,0,0,47,48,7,4,0,0,48,49,1,0,0,0,49,50,3,33,16,0,50,6,1,
        0,0,0,51,52,7,5,0,0,52,53,3,33,16,0,53,8,1,0,0,0,54,55,7,6,0,0,55,
        56,3,33,16,0,56,10,1,0,0,0,57,58,7,7,0,0,58,59,3,33,16,0,59,12,1,
        0,0,0,60,61,7,8,0,0,61,62,3,33,16,0,62,14,1,0,0,0,63,64,7,4,0,0,
        64,65,3,33,16,0,65,16,1,0,0,0,66,67,7,9,0,0,67,68,7,6,0,0,68,69,
        1,0,0,0,69,70,3,25,12,0,70,18,1,0,0,0,71,72,7,9,0,0,72,73,3,25,12,
        0,73,20,1,0,0,0,74,75,7,9,0,0,75,76,7,3,0,0,76,82,1,0,0,0,77,83,
        7,10,0,0,78,79,7,2,0,0,79,80,7,3,0,0,80,83,7,4,0,0,81,83,7,6,0,0,
        82,77,1,0,0,0,82,78,1,0,0,0,82,81,1,0,0,0,83,84,1,0,0,0,84,85,3,
        25,12,0,85,22,1,0,0,0,86,87,7,11,0,0,87,88,3,33,16,0,88,24,1,0,0,
        0,89,90,7,12,0,0,90,91,7,13,0,0,91,26,1,0,0,0,92,93,7,14,0,0,93,
        28,1,0,0,0,94,95,7,15,0,0,95,30,1,0,0,0,96,97,7,13,0,0,97,32,1,0,
        0,0,98,100,3,27,13,0,99,98,1,0,0,0,99,100,1,0,0,0,100,101,1,0,0,
        0,101,107,3,29,14,0,102,103,3,27,13,0,103,104,3,29,14,0,104,106,
        1,0,0,0,105,102,1,0,0,0,106,109,1,0,0,0,107,105,1,0,0,0,107,108,
        1,0,0,0,108,110,1,0,0,0,109,107,1,0,0,0,110,111,3,31,15,0,111,34,
        1,0,0,0,112,114,7,16,0,0,113,112,1,0,0,0,114,115,1,0,0,0,115,113,
        1,0,0,0,115,116,1,0,0,0,116,117,1,0,0,0,117,118,6,17,0,0,118,36,
        1,0,0,0,119,120,7,17,0,0,120,121,1,0,0,0,121,122,6,18,0,0,122,38,
        1,0,0,0,5,0,82,99,107,115,1,6,0,0
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!SentenceParserLexer.__ATN) {
            SentenceParserLexer.__ATN = new antlr.ATNDeserializer().deserialize(SentenceParserLexer._serializedATN);
        }

        return SentenceParserLexer.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(SentenceParserLexer.literalNames, SentenceParserLexer.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return SentenceParserLexer.vocabulary;
    }

    private static readonly decisionsToDFA = SentenceParserLexer._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}