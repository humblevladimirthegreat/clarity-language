
import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";


export class WordParserLexer extends antlr.Lexer {
    public static readonly SUBJECT = 1;
    public static readonly DIRECT_OBJECT = 2;
    public static readonly INDIRECT_OBJECT = 3;
    public static readonly VERB = 4;
    public static readonly MODIFIER = 5;
    public static readonly META_MODIFIER = 6;
    public static readonly MOOD = 7;
    public static readonly CONJUNCTION = 8;
    public static readonly PRONOUN = 9;
    public static readonly INTENTION = 10;

    public static readonly channelNames = [
        "DEFAULT_TOKEN_CHANNEL", "HIDDEN"
    ];

    public static readonly literalNames = [
    ];

    public static readonly symbolicNames = [
        null, "SUBJECT", "DIRECT_OBJECT", "INDIRECT_OBJECT", "VERB", "MODIFIER", 
        "META_MODIFIER", "MOOD", "CONJUNCTION", "PRONOUN", "INTENTION"
    ];

    public static readonly modeNames = [
        "DEFAULT_MODE",
    ];

    public static readonly ruleNames = [
        "SUBJECT", "DIRECT_OBJECT", "INDIRECT_OBJECT", "VERB", "MODIFIER", 
        "META_MODIFIER", "MOOD", "CONJUNCTION", "PRONOUN", "INTENTION", 
        "CONSONANT", "VOWEL", "WORD_BOUNDARY", "BASE_WORD",
    ];


    public constructor(input: antlr.CharStream) {
        super(input);
        this.interpreter = new antlr.LexerATNSimulator(this, WordParserLexer._ATN, WordParserLexer.decisionsToDFA, new antlr.PredictionContextCache());
    }

    public get grammarFileName(): string { return "WordParser.g4"; }

    public get literalNames(): (string | null)[] { return WordParserLexer.literalNames; }
    public get symbolicNames(): (string | null)[] { return WordParserLexer.symbolicNames; }
    public get ruleNames(): string[] { return WordParserLexer.ruleNames; }

    public get serializedATN(): number[] { return WordParserLexer._serializedATN; }

    public get channelNames(): string[] { return WordParserLexer.channelNames; }

    public get modeNames(): string[] { return WordParserLexer.modeNames; }

    public static readonly _serializedATN: number[] = [
        4,0,10,82,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,
        6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,
        7,13,1,0,1,0,1,0,1,1,1,1,1,1,1,2,1,2,1,2,1,2,1,2,1,2,1,3,1,3,1,3,
        1,4,1,4,1,4,1,5,1,5,1,5,1,6,1,6,1,6,1,7,1,7,1,7,1,8,1,8,1,8,1,9,
        1,9,1,9,1,10,1,10,1,11,1,11,1,12,1,12,1,13,3,13,70,8,13,1,13,1,13,
        1,13,1,13,5,13,76,8,13,10,13,12,13,79,9,13,1,13,1,13,0,0,14,1,1,
        3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,0,23,0,25,0,27,0,1,
        0,3,8,0,98,98,100,100,103,104,106,106,108,110,114,114,118,119,122,
        122,4,0,97,97,101,101,111,111,117,117,1,0,108,110,79,0,1,1,0,0,0,
        0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,
        1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,1,29,1,0,0,0,3,32,
        1,0,0,0,5,35,1,0,0,0,7,41,1,0,0,0,9,44,1,0,0,0,11,47,1,0,0,0,13,
        50,1,0,0,0,15,53,1,0,0,0,17,56,1,0,0,0,19,59,1,0,0,0,21,62,1,0,0,
        0,23,64,1,0,0,0,25,66,1,0,0,0,27,69,1,0,0,0,29,30,5,98,0,0,30,31,
        3,27,13,0,31,2,1,0,0,0,32,33,5,118,0,0,33,34,3,27,13,0,34,4,1,0,
        0,0,35,36,5,110,0,0,36,37,5,101,0,0,37,38,5,122,0,0,38,39,1,0,0,
        0,39,40,3,27,13,0,40,6,1,0,0,0,41,42,5,104,0,0,42,43,3,27,13,0,43,
        8,1,0,0,0,44,45,5,114,0,0,45,46,3,27,13,0,46,10,1,0,0,0,47,48,5,
        109,0,0,48,49,3,27,13,0,49,12,1,0,0,0,50,51,5,108,0,0,51,52,3,27,
        13,0,52,14,1,0,0,0,53,54,5,122,0,0,54,55,3,27,13,0,55,16,1,0,0,0,
        56,57,5,100,0,0,57,58,3,27,13,0,58,18,1,0,0,0,59,60,5,103,0,0,60,
        61,3,27,13,0,61,20,1,0,0,0,62,63,7,0,0,0,63,22,1,0,0,0,64,65,7,1,
        0,0,65,24,1,0,0,0,66,67,7,2,0,0,67,26,1,0,0,0,68,70,3,21,10,0,69,
        68,1,0,0,0,69,70,1,0,0,0,70,71,1,0,0,0,71,77,3,23,11,0,72,73,3,21,
        10,0,73,74,3,23,11,0,74,76,1,0,0,0,75,72,1,0,0,0,76,79,1,0,0,0,77,
        75,1,0,0,0,77,78,1,0,0,0,78,80,1,0,0,0,79,77,1,0,0,0,80,81,3,25,
        12,0,81,28,1,0,0,0,3,0,69,77,0
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!WordParserLexer.__ATN) {
            WordParserLexer.__ATN = new antlr.ATNDeserializer().deserialize(WordParserLexer._serializedATN);
        }

        return WordParserLexer.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(WordParserLexer.literalNames, WordParserLexer.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return WordParserLexer.vocabulary;
    }

    private static readonly decisionsToDFA = WordParserLexer._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}