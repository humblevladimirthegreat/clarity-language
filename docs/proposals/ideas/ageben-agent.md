# An agent with no language model: high-level tasks from an Ageben prompt

**Status:** IDEA, 2026-11-15.  
**Related:** the interpreter's reader, log, matcher, host and loop ([interpreter.md](../../meta/interpreter.md), `src/interpret/`, made by `ageben-interpreter.md`); the solver (`clingo-solver.md`); the parts it composes (`various-interpreter-applications.md`); `agent-tool-permissions.md`; `wizard-adventure.md` and the wizard engine ([wizard-game.md](../../meta/wizard-game.md)).

Not design authority. Tooling only: the sketch adds no form and changes no reading.

## Problem

An agent that completes a task from a one-line prompt is built today on a language model, which guesses what the prompt means, guesses a plan, and cannot show why it did either. Ageben removes the first guess: a prompt has one reading, and the reading already marks what an agent must keep apart (a goal and its sake, a fact seen and a fact heard, a plan and its fallback, what may be so and what is so). Nothing uses this yet. The interpreter answers and the solver infers, but neither acts.

## Sketch

A belief, goal and plan agent in which every internal state is a reading. It can explain each step from the sentences it rests on, asks when it does not know, and is taught by being told.

**The cycle:**

1. **Goal.** The reader turns a command or a sake into a goal. Frames stay data: an ought for a sake is a goal plus its reason, a fallback is an ordered alternative.
2. **Beliefs.** The log holds what the agent was told and what it observed, each with its channel and source. *Ana says the shop is open* never becomes *the shop is open*; trusting a source is a stated rule.
3. **Plan.** The solver finds a sequence of tool calls that reaches the goal from the beliefs, preferring a plan that survives both outcomes of every MAY fact, or one that observes first.
4. **Check.** Before acting: every sake is served, no two steps defeat each other, and the permission gate allows each call.
5. **Act and observe.** Run one step. Log the result as an observed reading. Each step was a dated prediction, so a mismatch is an *it turns out*.
6. **Recover.** On a mismatch, list the smallest explanations, give up the smallest set of beliefs, and plan again.
7. **Ask.** With no plan, or plans that differ on an unknown, ask the one question that splits them best, as a fill question.
8. **Report.** A parser-checked Ageben reply taken from the derivation: what was done, what is believed only by hearsay, which sake is met or unmet.

**Most parts are blurbs in `various-interpreter-applications.md`:**

| Agent part | Blurb |
|------------|-------|
| check a plan | goal and plan checker, contingency checker |
| ask | next-question finder |
| say why no plan exists | missing-premise finder (*doable only if also …*) |
| diagnose a failed step | hypothesis generator, necessity and sufficiency |
| revise beliefs | dependency tracking |
| reuse a past plan | analogy finder |
| plan what to tell a person | perspective simulation |
| choose among plans | preference consistency |
| memory | agent memory server |
| hard safety gate | policy engine for permissions |
| its own to-do list | open threads and commitments ledger |
| budgets, deadlines, amounts | second solver for numbers and strings |
| learn which tools are unreliable | calibration ledger |

**Three parts are new:**

- **Tool catalogue in Ageben.** Each tool is a few sentences: a condition hinge for when it can run, a cause for what it brings about, an ability claim for who may call it. The solver's translation table turns them into action rules, so adding a tool is writing a paragraph.
- **Method library.** How a high-level task breaks down, in Ageben: *to host a dinner: invite, shop, cook*. This is where high-level ability comes from. Methods are written by hand, stored from a successful run with its constants turned into roles, or taught when the agent asks *how?* and files the answer.
- **Executor loop.** Steps 5 and 6. The nearest existing shape is the conversation tutor's host and loop.

**Worked example.** The prompt is *get the report to Ana before Friday, so that she can review it*. The goal is *Ana has the report*, with a deadline and a sake. The library has a method for *get a document to a person*: find it, convert it if needed, send it. The log has *Lee said the report is in the shared folder*, which is hearsay, so the plan looks before it sends. The file is not there. The agent drops the belief and whatever rested on it, finds no other source, and asks *where is the report?*. Told, it sends, then reports: sent on Wednesday; the sake is unmet until Ana reviews, and stays on its ledger.

**Limits.** It has no common sense: what no sentence states, it does not know. It fits closed domains (files, a calendar, a home, a build, the wizard world). On a root with no rule behind it, it says *I have no method for this* and does not approximate. Long plans over many objects are slow to solve; methods and a step cap keep the search small.

## Open questions

1. **First domain.** (a) The wizard world: the engine, the world model and the solver's *what can be done* job are planned there, and nothing real can break. (b) The tools of `agent-tool-permissions.md`, which are already described in Ageben. (c) Files and a calendar. **Recommendation:** (a), then (b). An agent that finishes a quest from one command is the same code as one that drives real tools; only the catalogue changes.

2. **How a method is written.** A method needs *to do X, do A then B then C*, with roles shared across the steps. (a) Existing forms only: a sake or condition hinge with a clause sequence. (b) A convention over existing forms that marks a text as a method, such as a named phrase. (c) A new form. Which existing forms carry it without strain is a grammar question for the user. **Recommendation:** try (a) on ten real methods first and bring what does not fit as a gap.

3. **Command against sake as a goal.** *Send the report* names an action; *so that Ana can review it* names a state. When the action succeeds and the sake stays unmet, is the task done? (a) Done at the action. (b) Done at the sake, when one is stated. (c) Done at the action, with the sake kept as an open thread. **Recommendation:** (c). It never claims more than it did and never forgets why.

4. **Trust.** When may hearsay stand in for a fact in a plan? (a) Never: observe first. (b) By stated rules per source. (c) By weight, with the evidence engine. **Recommendation:** (b), with (a) as the default when no rule is stated. The weights in (c) are a user decision that is not made.

5. **When to ask and when to act.** A plan that rests on an unknown can ask, observe, or go ahead with a fallback. (a) Always ask. (b) Observe when a tool can, ask otherwise. (c) Go ahead when every action is reversible. **Recommendation:** (b), and (c) only for tools the catalogue marks reversible.

6. **Learned methods.** A stored run may generalise wrongly. (a) Store and use at once. (b) Store as a proposal the user confirms. (c) Store with its count of successes and prefer proven ones. **Recommendation:** (b) with real tools, (a) in the wizard world.

The plan, check and recover steps wait on the meaning decisions in `clingo-solver.md`: how conditions, causes and sakes become rules.

## Non-goals

- Not a wrapper for a language model, and no step calls one. A model that drafts methods or tool descriptions for a person to check is a separate idea.
- No open-world tasks. The agent does not search the web for how to do a thing it has no method for.
