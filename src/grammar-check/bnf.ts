/**
 * Flatten a Chevrotain grammar (its GAST) into plain BNF, for checks that ignore gates.
 *
 * Every `OPTION` / `MANY` / `AT_LEAST_ONE` / `OR` becomes its own nonterminal, named after the
 * rule and the DSL call that made it (`gPackage.MANY2`), so a finding points back at the decision
 * in sentence-parser.ts. Gates, `ACTION`s and rule arguments are invisible here: the BNF is the
 * grammar the parser would have with every gate deleted.
 */
import {
  Alternation,
  Alternative,
  NonTerminal,
  Option,
  Repetition,
  RepetitionMandatory,
  RepetitionMandatoryWithSeparator,
  RepetitionWithSeparator,
  Rule,
  Terminal,
  type IProduction,
  type TokenType,
} from "chevrotain";

export type Production = {
  id: number;
  lhs: string;
  rhs: string[];
  /** Which branch of the decision this is: `alt 2`, `repeat`, `stop`, `take`, `skip`, or `body`. */
  branch: string;
};

export type Bnf = {
  start: string;
  productions: Production[];
  byLhs: Map<string, Production[]>;
  terminals: Set<string>;
  nonterminals: Set<string>;
};

export function isTerminal(bnf: Bnf, symbol: string): boolean {
  return bnf.terminals.has(symbol);
}

/** The DSL name Chevrotain users write (`MANY2`, `OPTION`, `OR3`). */
function dslName(prod: IProduction & { idx?: number }): string {
  const base =
    prod instanceof Option ? "OPTION"
    : prod instanceof Repetition ? "MANY"
    : prod instanceof RepetitionMandatory ? "AT_LEAST_ONE"
    : prod instanceof RepetitionWithSeparator ? "MANY_SEP"
    : prod instanceof RepetitionMandatoryWithSeparator ? "AT_LEAST_ONE_SEP"
    : prod instanceof Alternation ? "OR"
    : "?";
  return base + (prod.idx ? String(prod.idx) : "");
}

/**
 * @param rules Rules keyed by name, as `getGAstProductions()` returns them.
 * @param tokens Every token type the lexer can emit; a category terminal expands to its members.
 */
export function gastToBnf(rules: Record<string, Rule>, start: string, tokens: TokenType[]): Bnf {
  const productions: Production[] = [];
  const terminals = new Set<string>();
  const nonterminals = new Set<string>();
  const add = (lhs: string, rhs: string[], branch: string) => {
    nonterminals.add(lhs);
    productions.push({ id: productions.length, lhs, rhs, branch });
  };

  const categoryMembers = new Map<string, string[]>();
  for (const token of tokens) {
    for (const category of token.CATEGORIES ?? []) {
      const members = categoryMembers.get(category.name) ?? [];
      members.push(token.name);
      categoryMembers.set(category.name, members);
    }
  }

  function terminal(type: TokenType): string {
    const members = categoryMembers.get(type.name);
    if (!members) {
      terminals.add(type.name);
      return type.name;
    }
    const lhs = `${type.name}*`;
    if (!nonterminals.has(lhs)) {
      for (const member of members) {
        terminals.add(member);
        add(lhs, [member], member);
      }
    }
    return lhs;
  }

  function sequence(rule: string, defs: IProduction[]): string[] {
    return defs.map((def) => symbol(rule, def));
  }

  function symbol(rule: string, def: IProduction): string {
    if (def instanceof Terminal) return terminal(def.terminalType);
    if (def instanceof NonTerminal) return def.nonTerminalName;
    const name = `${rule}.${dslName(def as IProduction & { idx?: number })}`;
    if (nonterminals.has(name)) throw new Error(`duplicate decision name ${name}`);
    nonterminals.add(name);
    if (def instanceof Alternation) {
      (def.definition as Alternative[]).forEach((alt, i) => add(name, sequence(rule, alt.definition), `alt ${i}`));
    } else if (def instanceof Option) {
      add(name, [], "skip");
      add(name, sequence(rule, def.definition), "take");
    } else if (def instanceof Repetition) {
      add(name, [], "stop");
      add(name, [...sequence(rule, def.definition), name], "repeat");
    } else if (def instanceof RepetitionMandatory) {
      const body = sequence(rule, def.definition);
      add(name, body, "last");
      add(name, [...body, name], "repeat");
    } else if (def instanceof RepetitionWithSeparator || def instanceof RepetitionMandatoryWithSeparator) {
      const body = sequence(rule, def.definition);
      const tail = `${name}.tail`;
      nonterminals.add(tail);
      add(tail, [], "stop");
      add(tail, [terminal(def.separator), ...body, tail], "repeat");
      if (def instanceof RepetitionWithSeparator) add(name, [], "none");
      add(name, [...body, tail], "first");
    } else {
      throw new Error(`unsupported GAST node ${def.constructor.name} in ${rule}`);
    }
    return name;
  }

  for (const [name, rule] of Object.entries(rules)) add(name, sequence(name, rule.definition), "body");

  const byLhs = new Map<string, Production[]>();
  for (const p of productions) {
    const list = byLhs.get(p.lhs) ?? [];
    list.push(p);
    byLhs.set(p.lhs, list);
  }
  return { start, productions, byLhs, terminals, nonterminals };
}

/** Readable form of one production, for reports. */
export function showProduction(p: Production): string {
  return `${p.lhs} → ${p.rhs.length ? p.rhs.join(" ") : "ε"}   [${p.branch}]`;
}
