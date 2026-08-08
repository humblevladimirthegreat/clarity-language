
import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class SentenceParserParser extends antlr.Parser {
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
    public static readonly RULE_start = 0;
    public static readonly RULE_modifier_clause = 1;
    public static readonly RULE_subject_clause = 2;
    public static readonly RULE_verb_clause = 3;
    public static readonly RULE_direct_object_clause = 4;
    public static readonly RULE_intention_clause = 5;
    public static readonly RULE_entity_clause = 6;
    public static readonly RULE_relative_clause = 7;
    public static readonly RULE_sentence = 8;

    public static readonly literalNames = [
    ];

    public static readonly symbolicNames = [
        null, "SUBJECT", "DIRECT_OBJECT", "INDIRECT_OBJECT", "VERB", "MODIFIER", 
        "META_MODIFIER", "MOOD", "CONJUNCTION", "DEFINITE_PRONOUN", "INDEFINITE_PRONOUN", 
        "RELATIVE_PRONOUN", "INTENTION", "WHITESPACE", "PUNCTUATION"
    ];
    public static readonly ruleNames = [
        "start", "modifier_clause", "subject_clause", "verb_clause", "direct_object_clause", 
        "intention_clause", "entity_clause", "relative_clause", "sentence",
    ];

    public get grammarFileName(): string { return "SentenceParser.g4"; }
    public get literalNames(): (string | null)[] { return SentenceParserParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return SentenceParserParser.symbolicNames; }
    public get ruleNames(): string[] { return SentenceParserParser.ruleNames; }
    public get serializedATN(): number[] { return SentenceParserParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, SentenceParserParser._ATN, SentenceParserParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public start(): StartContext {
        let localContext = new StartContext(this.context, this.state);
        this.enterRule(localContext, 0, SentenceParserParser.RULE_start);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 18;
            this.sentence();
            this.state = 19;
            this.match(SentenceParserParser.EOF);
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
        this.enterRecursionRule(localContext, 2, SentenceParserParser.RULE_modifier_clause, _p);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            {
            this.state = 22;
            this.match(SentenceParserParser.MODIFIER);
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
                    this.pushNewRecursionContext(localContext, _startState, SentenceParserParser.RULE_modifier_clause);
                    this.state = 24;
                    if (!(this.precpred(this.context, 1))) {
                        throw this.createFailedPredicateException("this.precpred(this.context, 1)");
                    }
                    this.state = 25;
                    this.match(SentenceParserParser.META_MODIFIER);
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
        this.enterRule(localContext, 4, SentenceParserParser.RULE_subject_clause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 32;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 9 || _la === 10) {
                {
                this.state = 31;
                _la = this.tokenStream.LA(1);
                if(!(_la === 9 || _la === 10)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
            }

            this.state = 34;
            this.match(SentenceParserParser.SUBJECT);
            this.state = 38;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 35;
                this.modifier_clause(0);
                }
                }
                this.state = 40;
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
        this.enterRule(localContext, 6, SentenceParserParser.RULE_verb_clause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 41;
            this.match(SentenceParserParser.VERB);
            this.state = 45;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 42;
                this.modifier_clause(0);
                }
                }
                this.state = 47;
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
        this.enterRule(localContext, 8, SentenceParserParser.RULE_direct_object_clause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 49;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 9 || _la === 10) {
                {
                this.state = 48;
                _la = this.tokenStream.LA(1);
                if(!(_la === 9 || _la === 10)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
            }

            this.state = 51;
            this.match(SentenceParserParser.DIRECT_OBJECT);
            this.state = 55;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 52;
                this.modifier_clause(0);
                }
                }
                this.state = 57;
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
        this.enterRule(localContext, 10, SentenceParserParser.RULE_intention_clause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 58;
            this.match(SentenceParserParser.INTENTION);
            this.state = 62;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 59;
                this.modifier_clause(0);
                }
                }
                this.state = 64;
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
    public entity_clause(): Entity_clauseContext {
        let localContext = new Entity_clauseContext(this.context, this.state);
        this.enterRule(localContext, 12, SentenceParserParser.RULE_entity_clause);
        try {
            this.state = 69;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 7, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 65;
                this.subject_clause();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 66;
                this.verb_clause();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 67;
                this.direct_object_clause();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 68;
                this.intention_clause();
                }
                break;
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
    public relative_clause(): Relative_clauseContext {
        let localContext = new Relative_clauseContext(this.context, this.state);
        this.enterRule(localContext, 14, SentenceParserParser.RULE_relative_clause);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 71;
            this.match(SentenceParserParser.RELATIVE_PRONOUN);
            this.state = 73;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 72;
                this.entity_clause();
                }
                }
                this.state = 75;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 5654) !== 0));
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
        this.enterRule(localContext, 16, SentenceParserParser.RULE_sentence);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 78;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 77;
                this.entity_clause();
                }
                }
                this.state = 80;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 5654) !== 0));
            this.state = 83;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11) {
                {
                this.state = 82;
                this.relative_clause();
                }
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
        4,1,14,86,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,5,1,27,8,1,10,
        1,12,1,30,9,1,1,2,3,2,33,8,2,1,2,1,2,5,2,37,8,2,10,2,12,2,40,9,2,
        1,3,1,3,5,3,44,8,3,10,3,12,3,47,9,3,1,4,3,4,50,8,4,1,4,1,4,5,4,54,
        8,4,10,4,12,4,57,9,4,1,5,1,5,5,5,61,8,5,10,5,12,5,64,9,5,1,6,1,6,
        1,6,1,6,3,6,70,8,6,1,7,1,7,4,7,74,8,7,11,7,12,7,75,1,8,4,8,79,8,
        8,11,8,12,8,80,1,8,3,8,84,8,8,1,8,0,1,2,9,0,2,4,6,8,10,12,14,16,
        0,1,1,0,9,10,89,0,18,1,0,0,0,2,21,1,0,0,0,4,32,1,0,0,0,6,41,1,0,
        0,0,8,49,1,0,0,0,10,58,1,0,0,0,12,69,1,0,0,0,14,71,1,0,0,0,16,78,
        1,0,0,0,18,19,3,16,8,0,19,20,5,0,0,1,20,1,1,0,0,0,21,22,6,1,-1,0,
        22,23,5,5,0,0,23,28,1,0,0,0,24,25,10,1,0,0,25,27,5,6,0,0,26,24,1,
        0,0,0,27,30,1,0,0,0,28,26,1,0,0,0,28,29,1,0,0,0,29,3,1,0,0,0,30,
        28,1,0,0,0,31,33,7,0,0,0,32,31,1,0,0,0,32,33,1,0,0,0,33,34,1,0,0,
        0,34,38,5,1,0,0,35,37,3,2,1,0,36,35,1,0,0,0,37,40,1,0,0,0,38,36,
        1,0,0,0,38,39,1,0,0,0,39,5,1,0,0,0,40,38,1,0,0,0,41,45,5,4,0,0,42,
        44,3,2,1,0,43,42,1,0,0,0,44,47,1,0,0,0,45,43,1,0,0,0,45,46,1,0,0,
        0,46,7,1,0,0,0,47,45,1,0,0,0,48,50,7,0,0,0,49,48,1,0,0,0,49,50,1,
        0,0,0,50,51,1,0,0,0,51,55,5,2,0,0,52,54,3,2,1,0,53,52,1,0,0,0,54,
        57,1,0,0,0,55,53,1,0,0,0,55,56,1,0,0,0,56,9,1,0,0,0,57,55,1,0,0,
        0,58,62,5,12,0,0,59,61,3,2,1,0,60,59,1,0,0,0,61,64,1,0,0,0,62,60,
        1,0,0,0,62,63,1,0,0,0,63,11,1,0,0,0,64,62,1,0,0,0,65,70,3,4,2,0,
        66,70,3,6,3,0,67,70,3,8,4,0,68,70,3,10,5,0,69,65,1,0,0,0,69,66,1,
        0,0,0,69,67,1,0,0,0,69,68,1,0,0,0,70,13,1,0,0,0,71,73,5,11,0,0,72,
        74,3,12,6,0,73,72,1,0,0,0,74,75,1,0,0,0,75,73,1,0,0,0,75,76,1,0,
        0,0,76,15,1,0,0,0,77,79,3,12,6,0,78,77,1,0,0,0,79,80,1,0,0,0,80,
        78,1,0,0,0,80,81,1,0,0,0,81,83,1,0,0,0,82,84,3,14,7,0,83,82,1,0,
        0,0,83,84,1,0,0,0,84,17,1,0,0,0,11,28,32,38,45,49,55,62,69,75,80,
        83
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!SentenceParserParser.__ATN) {
            SentenceParserParser.__ATN = new antlr.ATNDeserializer().deserialize(SentenceParserParser._serializedATN);
        }

        return SentenceParserParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(SentenceParserParser.literalNames, SentenceParserParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return SentenceParserParser.vocabulary;
    }

    private static readonly decisionsToDFA = SentenceParserParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class StartContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public sentence(): SentenceContext {
        return this.getRuleContext(0, SentenceContext)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(SentenceParserParser.EOF, 0)!;
    }
    public override get ruleIndex(): number {
        return SentenceParserParser.RULE_start;
    }
}


export class Modifier_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MODIFIER(): antlr.TerminalNode | null {
        return this.getToken(SentenceParserParser.MODIFIER, 0);
    }
    public modifier_clause(): Modifier_clauseContext | null {
        return this.getRuleContext(0, Modifier_clauseContext);
    }
    public META_MODIFIER(): antlr.TerminalNode | null {
        return this.getToken(SentenceParserParser.META_MODIFIER, 0);
    }
    public override get ruleIndex(): number {
        return SentenceParserParser.RULE_modifier_clause;
    }
}


export class Subject_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SUBJECT(): antlr.TerminalNode {
        return this.getToken(SentenceParserParser.SUBJECT, 0)!;
    }
    public modifier_clause(): Modifier_clauseContext[];
    public modifier_clause(i: number): Modifier_clauseContext | null;
    public modifier_clause(i?: number): Modifier_clauseContext[] | Modifier_clauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Modifier_clauseContext);
        }

        return this.getRuleContext(i, Modifier_clauseContext);
    }
    public DEFINITE_PRONOUN(): antlr.TerminalNode | null {
        return this.getToken(SentenceParserParser.DEFINITE_PRONOUN, 0);
    }
    public INDEFINITE_PRONOUN(): antlr.TerminalNode | null {
        return this.getToken(SentenceParserParser.INDEFINITE_PRONOUN, 0);
    }
    public override get ruleIndex(): number {
        return SentenceParserParser.RULE_subject_clause;
    }
}


export class Verb_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public VERB(): antlr.TerminalNode {
        return this.getToken(SentenceParserParser.VERB, 0)!;
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
        return SentenceParserParser.RULE_verb_clause;
    }
}


export class Direct_object_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DIRECT_OBJECT(): antlr.TerminalNode {
        return this.getToken(SentenceParserParser.DIRECT_OBJECT, 0)!;
    }
    public modifier_clause(): Modifier_clauseContext[];
    public modifier_clause(i: number): Modifier_clauseContext | null;
    public modifier_clause(i?: number): Modifier_clauseContext[] | Modifier_clauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Modifier_clauseContext);
        }

        return this.getRuleContext(i, Modifier_clauseContext);
    }
    public DEFINITE_PRONOUN(): antlr.TerminalNode | null {
        return this.getToken(SentenceParserParser.DEFINITE_PRONOUN, 0);
    }
    public INDEFINITE_PRONOUN(): antlr.TerminalNode | null {
        return this.getToken(SentenceParserParser.INDEFINITE_PRONOUN, 0);
    }
    public override get ruleIndex(): number {
        return SentenceParserParser.RULE_direct_object_clause;
    }
}


export class Intention_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INTENTION(): antlr.TerminalNode {
        return this.getToken(SentenceParserParser.INTENTION, 0)!;
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
        return SentenceParserParser.RULE_intention_clause;
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
    public override get ruleIndex(): number {
        return SentenceParserParser.RULE_entity_clause;
    }
}


export class Relative_clauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RELATIVE_PRONOUN(): antlr.TerminalNode {
        return this.getToken(SentenceParserParser.RELATIVE_PRONOUN, 0)!;
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
        return SentenceParserParser.RULE_relative_clause;
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
    public relative_clause(): Relative_clauseContext | null {
        return this.getRuleContext(0, Relative_clauseContext);
    }
    public override get ruleIndex(): number {
        return SentenceParserParser.RULE_sentence;
    }
}
