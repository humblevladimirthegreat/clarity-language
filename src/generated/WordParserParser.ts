
import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class WordParserParser extends antlr.Parser {
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
    public static readonly RULE_start = 0;
    public static readonly RULE_modifier_clause = 1;
    public static readonly RULE_subject_clause = 2;
    public static readonly RULE_verb_clause = 3;
    public static readonly RULE_direct_object_clause = 4;
    public static readonly RULE_intention_clause = 5;
    public static readonly RULE_pronoun_clause = 6;
    public static readonly RULE_entity_clause = 7;
    public static readonly RULE_sentence = 8;

    public static readonly literalNames = [
    ];

    public static readonly symbolicNames = [
        null, "SUBJECT", "DIRECT_OBJECT", "INDIRECT_OBJECT", "VERB", "MODIFIER", 
        "META_MODIFIER", "MOOD", "CONJUNCTION", "PRONOUN", "INTENTION"
    ];
    public static readonly ruleNames = [
        "start", "modifier_clause", "subject_clause", "verb_clause", "direct_object_clause", 
        "intention_clause", "pronoun_clause", "entity_clause", "sentence",
    ];

    public get grammarFileName(): string { return "WordParser.g4"; }
    public get literalNames(): (string | null)[] { return WordParserParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return WordParserParser.symbolicNames; }
    public get ruleNames(): string[] { return WordParserParser.ruleNames; }
    public get serializedATN(): number[] { return WordParserParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, WordParserParser._ATN, WordParserParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public start(): StartContext {
        let localContext = new StartContext(this.context, this.state);
        this.enterRule(localContext, 0, WordParserParser.RULE_start);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 18;
            this.sentence();
            this.state = 19;
            this.match(WordParserParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public modifier_clause(): Modifier_clauseContext;
    public modifier_clause(_p: number): Modifier_clauseContext;
    public modifier_clause(_p?: number): Modifier_clauseContext {
        if (_p === undefined) {
            _p = 0;
        }

        let parentContext = this.context;
        let parentState = this.state;
        let localContext = new Modifier_clauseContext(this.context, parentState);
        let previousContext = localContext;
        let _startState = 2;
        this.enterRecursionRule(localContext, 2, WordParserParser.RULE_modifier_clause, _p);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            {
            this.state = 22;
            this.match(WordParserParser.MODIFIER);
            }
            this.context!.stop = this.tokenStream.LT(-1);
            this.state = 28;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 0, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    if (this.parseListeners != null) {
                        this.triggerExitRuleEvent();
                    }
                    previousContext = localContext;
                    {
                    {
                    localContext = new Modifier_clauseContext(parentContext, parentState);
                    this.pushNewRecursionContext(localContext, _startState, WordParserParser.RULE_modifier_clause);
                    this.state = 24;
                    if (!(this.precpred(this.context, 1))) {
                        throw this.createFailedPredicateException("this.precpred(this.context, 1)");
                    }
                    this.state = 25;
                    this.match(WordParserParser.META_MODIFIER);
                    }
                    }
                }
                this.state = 30;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 0, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.unrollRecursionContexts(parentContext);
        }
        return localContext;
    }
    public subject_clause(): Subject_clauseContext {
        let localContext = new Subject_clauseContext(this.context, this.state);
        this.enterRule(localContext, 4, WordParserParser.RULE_subject_clause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 31;
            this.match(WordParserParser.SUBJECT);
            this.state = 35;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 32;
                this.modifier_clause(0);
                }
                }
                this.state = 37;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public verb_clause(): Verb_clauseContext {
        let localContext = new Verb_clauseContext(this.context, this.state);
        this.enterRule(localContext, 6, WordParserParser.RULE_verb_clause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 38;
            this.match(WordParserParser.VERB);
            this.state = 42;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 39;
                this.modifier_clause(0);
                }
                }
                this.state = 44;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public direct_object_clause(): Direct_object_clauseContext {
        let localContext = new Direct_object_clauseContext(this.context, this.state);
        this.enterRule(localContext, 8, WordParserParser.RULE_direct_object_clause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 45;
            this.match(WordParserParser.DIRECT_OBJECT);
            this.state = 49;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 46;
                this.modifier_clause(0);
                }
                }
                this.state = 51;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public intention_clause(): Intention_clauseContext {
        let localContext = new Intention_clauseContext(this.context, this.state);
        this.enterRule(localContext, 10, WordParserParser.RULE_intention_clause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 52;
            this.match(WordParserParser.INTENTION);
            this.state = 56;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 53;
                this.modifier_clause(0);
                }
                }
                this.state = 58;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public pronoun_clause(): Pronoun_clauseContext {
        let localContext = new Pronoun_clauseContext(this.context, this.state);
        this.enterRule(localContext, 12, WordParserParser.RULE_pronoun_clause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 59;
            this.match(WordParserParser.PRONOUN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public entity_clause(): Entity_clauseContext {
        let localContext = new Entity_clauseContext(this.context, this.state);
        this.enterRule(localContext, 14, WordParserParser.RULE_entity_clause);
        try {
            this.state = 66;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case WordParserParser.SUBJECT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 61;
                this.subject_clause();
                }
                break;
            case WordParserParser.VERB:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 62;
                this.verb_clause();
                }
                break;
            case WordParserParser.DIRECT_OBJECT:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 63;
                this.direct_object_clause();
                }
                break;
            case WordParserParser.INTENTION:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 64;
                this.intention_clause();
                }
                break;
            case WordParserParser.PRONOUN:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 65;
                this.pronoun_clause();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public sentence(): SentenceContext {
        let localContext = new SentenceContext(this.context, this.state);
        this.enterRule(localContext, 16, WordParserParser.RULE_sentence);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 69;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 68;
                this.entity_clause();
                }
                }
                this.state = 71;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1558) !== 0));
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public override sempred(localContext: antlr.ParserRuleContext | null, ruleIndex: number, predIndex: number): boolean {
        switch (ruleIndex) {
        case 1:
            return this.modifier_clause_sempred(localContext as Modifier_clauseContext, predIndex);
        }
        return true;
    }
    private modifier_clause_sempred(localContext: Modifier_clauseContext | null, predIndex: number): boolean {
        switch (predIndex) {
        case 0:
            return this.precpred(this.context, 1);
        }
        return true;
    }

    public static readonly _serializedATN: number[] = [
        4,1,10,74,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,5,1,27,8,1,10,
        1,12,1,30,9,1,1,2,1,2,5,2,34,8,2,10,2,12,2,37,9,2,1,3,1,3,5,3,41,
        8,3,10,3,12,3,44,9,3,1,4,1,4,5,4,48,8,4,10,4,12,4,51,9,4,1,5,1,5,
        5,5,55,8,5,10,5,12,5,58,9,5,1,6,1,6,1,7,1,7,1,7,1,7,1,7,3,7,67,8,
        7,1,8,4,8,70,8,8,11,8,12,8,71,1,8,0,1,2,9,0,2,4,6,8,10,12,14,16,
        0,0,74,0,18,1,0,0,0,2,21,1,0,0,0,4,31,1,0,0,0,6,38,1,0,0,0,8,45,
        1,0,0,0,10,52,1,0,0,0,12,59,1,0,0,0,14,66,1,0,0,0,16,69,1,0,0,0,
        18,19,3,16,8,0,19,20,5,0,0,1,20,1,1,0,0,0,21,22,6,1,-1,0,22,23,5,
        5,0,0,23,28,1,0,0,0,24,25,10,1,0,0,25,27,5,6,0,0,26,24,1,0,0,0,27,
        30,1,0,0,0,28,26,1,0,0,0,28,29,1,0,0,0,29,3,1,0,0,0,30,28,1,0,0,
        0,31,35,5,1,0,0,32,34,3,2,1,0,33,32,1,0,0,0,34,37,1,0,0,0,35,33,
        1,0,0,0,35,36,1,0,0,0,36,5,1,0,0,0,37,35,1,0,0,0,38,42,5,4,0,0,39,
        41,3,2,1,0,40,39,1,0,0,0,41,44,1,0,0,0,42,40,1,0,0,0,42,43,1,0,0,
        0,43,7,1,0,0,0,44,42,1,0,0,0,45,49,5,2,0,0,46,48,3,2,1,0,47,46,1,
        0,0,0,48,51,1,0,0,0,49,47,1,0,0,0,49,50,1,0,0,0,50,9,1,0,0,0,51,
        49,1,0,0,0,52,56,5,10,0,0,53,55,3,2,1,0,54,53,1,0,0,0,55,58,1,0,
        0,0,56,54,1,0,0,0,56,57,1,0,0,0,57,11,1,0,0,0,58,56,1,0,0,0,59,60,
        5,9,0,0,60,13,1,0,0,0,61,67,3,4,2,0,62,67,3,6,3,0,63,67,3,8,4,0,
        64,67,3,10,5,0,65,67,3,12,6,0,66,61,1,0,0,0,66,62,1,0,0,0,66,63,
        1,0,0,0,66,64,1,0,0,0,66,65,1,0,0,0,67,15,1,0,0,0,68,70,3,14,7,0,
        69,68,1,0,0,0,70,71,1,0,0,0,71,69,1,0,0,0,71,72,1,0,0,0,72,17,1,
        0,0,0,7,28,35,42,49,56,66,71
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!WordParserParser.__ATN) {
            WordParserParser.__ATN = new antlr.ATNDeserializer().deserialize(WordParserParser._serializedATN);
        }

        return WordParserParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(WordParserParser.literalNames, WordParserParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return WordParserParser.vocabulary;
    }

    private static readonly decisionsToDFA = WordParserParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class StartContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public sentence(): SentenceContext {
        return this.getRuleContext(0, SentenceContext)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(WordParserParser.EOF, 0)!;
    }
    public override get ruleIndex(): number {
        return WordParserParser.RULE_start;
    }
}


export class Modifier_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MODIFIER(): antlr.TerminalNode | null {
        return this.getToken(WordParserParser.MODIFIER, 0);
    }
    public modifier_clause(): Modifier_clauseContext | null {
        return this.getRuleContext(0, Modifier_clauseContext);
    }
    public META_MODIFIER(): antlr.TerminalNode | null {
        return this.getToken(WordParserParser.META_MODIFIER, 0);
    }
    public override get ruleIndex(): number {
        return WordParserParser.RULE_modifier_clause;
    }
}


export class Subject_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SUBJECT(): antlr.TerminalNode {
        return this.getToken(WordParserParser.SUBJECT, 0)!;
    }
    public modifier_clause(): Modifier_clauseContext[];
    public modifier_clause(i: number): Modifier_clauseContext | null;
    public modifier_clause(i?: number): Modifier_clauseContext[] | Modifier_clauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Modifier_clauseContext);
        }

        return this.getRuleContext(i, Modifier_clauseContext);
    }
    public override get ruleIndex(): number {
        return WordParserParser.RULE_subject_clause;
    }
}


export class Verb_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public VERB(): antlr.TerminalNode {
        return this.getToken(WordParserParser.VERB, 0)!;
    }
    public modifier_clause(): Modifier_clauseContext[];
    public modifier_clause(i: number): Modifier_clauseContext | null;
    public modifier_clause(i?: number): Modifier_clauseContext[] | Modifier_clauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Modifier_clauseContext);
        }

        return this.getRuleContext(i, Modifier_clauseContext);
    }
    public override get ruleIndex(): number {
        return WordParserParser.RULE_verb_clause;
    }
}


export class Direct_object_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DIRECT_OBJECT(): antlr.TerminalNode {
        return this.getToken(WordParserParser.DIRECT_OBJECT, 0)!;
    }
    public modifier_clause(): Modifier_clauseContext[];
    public modifier_clause(i: number): Modifier_clauseContext | null;
    public modifier_clause(i?: number): Modifier_clauseContext[] | Modifier_clauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Modifier_clauseContext);
        }

        return this.getRuleContext(i, Modifier_clauseContext);
    }
    public override get ruleIndex(): number {
        return WordParserParser.RULE_direct_object_clause;
    }
}


export class Intention_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INTENTION(): antlr.TerminalNode {
        return this.getToken(WordParserParser.INTENTION, 0)!;
    }
    public modifier_clause(): Modifier_clauseContext[];
    public modifier_clause(i: number): Modifier_clauseContext | null;
    public modifier_clause(i?: number): Modifier_clauseContext[] | Modifier_clauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Modifier_clauseContext);
        }

        return this.getRuleContext(i, Modifier_clauseContext);
    }
    public override get ruleIndex(): number {
        return WordParserParser.RULE_intention_clause;
    }
}


export class Pronoun_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public PRONOUN(): antlr.TerminalNode {
        return this.getToken(WordParserParser.PRONOUN, 0)!;
    }
    public override get ruleIndex(): number {
        return WordParserParser.RULE_pronoun_clause;
    }
}


export class Entity_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public subject_clause(): Subject_clauseContext | null {
        return this.getRuleContext(0, Subject_clauseContext);
    }
    public verb_clause(): Verb_clauseContext | null {
        return this.getRuleContext(0, Verb_clauseContext);
    }
    public direct_object_clause(): Direct_object_clauseContext | null {
        return this.getRuleContext(0, Direct_object_clauseContext);
    }
    public intention_clause(): Intention_clauseContext | null {
        return this.getRuleContext(0, Intention_clauseContext);
    }
    public pronoun_clause(): Pronoun_clauseContext | null {
        return this.getRuleContext(0, Pronoun_clauseContext);
    }
    public override get ruleIndex(): number {
        return WordParserParser.RULE_entity_clause;
    }
}


export class SentenceContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public entity_clause(): Entity_clauseContext[];
    public entity_clause(i: number): Entity_clauseContext | null;
    public entity_clause(i?: number): Entity_clauseContext[] | Entity_clauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Entity_clauseContext);
        }

        return this.getRuleContext(i, Entity_clauseContext);
    }
    public override get ruleIndex(): number {
        return WordParserParser.RULE_sentence;
    }
}
