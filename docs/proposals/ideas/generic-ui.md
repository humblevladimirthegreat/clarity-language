# A generic UI: Ageben text that calls any application's functions

**Status:** IDEA, 2026-11-14. Decided 2026-11-14: each application describes its functions in a manifest written in Ageben; a solver composes several calls into one plan; what the grammar's own composition constructs do when run is defined once, in the interpreter, not per application.  
**Related:** the interpreter's reader, matcher, host, loop and replies ([interpreter.md](../../meta/interpreter.md), `src/interpret/`, made by `ageben-interpreter.md`, all its phases); the solver (`clingo-solver.md`); `agent-tool-permissions.md` (the same host with the say pointed the other way); `ageben-spec.md` (statement kinds a manifest could reuse); the published parser bundle ([ageben.ts](../../../src/agent/ageben.ts)); grammar pages [clause](/clause), [questions](/questions), [fill-ask roles](/fill-ask-roles), [causation](/causation), [ability](/can-and-cant#ability), [everything](/joins#everything-ua), [clause sequence](/clause-sequence), [try](/try), [restrictors](/restrictors), [spans](/spans), [say words](/permission-consent#say-words).

Not design authority. Tooling only: the sketch adds no form and changes no reading. Where it needs a meaning the grammar pages do not state, that is an open question for the user.

## Problem

Every application has its own way to be told what to do: menus, a command line, an API. A person learns each one, and none can be spoken. A chat box over a language model is uniform and speakable, but the same words can give a different call each time, and nobody can audit what it will do.

Ageben has what both lack: one parse per sentence, roles marked by letter and not by position, and frames for who may do what, on whose say, with what fallback. The interpreter gives a command to a host's handler. What is missing is a host that is not written by hand for one application.

## Sketch

**One host, many manifests.** The generic host loads a manifest per application. Its handlers come from the manifests; it has no verbs of its own. The three forces map to three kinds of function:

| Ageben | Calls | Comes back as |
|--------|-------|---------------|
| command | an action | an outcome: `ok`, `refused`, `beyond` |
| fill question | a query; the blank is the return value | a fragment answer, or *which one?* |
| yes/no question | a check | yes, no, cannot say |
| statement | a setting or a preference | a log entry |

Role letters are the parameter names, so word order never matters. A number word is a value, and a literal span is a string.

**A manifest is an Ageben text**, read by the same reader, so it is parser-checked, searchable, and readable by the person who grants permissions. Per function it states five things, shown here in English:

| Part | Example | Becomes |
|------|---------|---------|
| Call shape | *someone sends a file to a person* | verb root, role letters, the kind each role takes |
| Needs | *only if the sender can read the file* | precondition |
| Gives | *then the receiver has the file* | effect |
| Yields (a query) | *which files did a person share on a day?* | inputs, and the blank as output |
| Binding | the tool's name and parameter names, in a literal span | the real call |

Published roots are the shared vocabulary: two applications that both say *file* mean the same kind, which tool protocols have no way to state.

**Reaching the applications.** The binding names a tool in an existing protocol (MCP for desktop and agent tools, OpenAPI for web services), so the host needs one adapter per protocol, not per application. An application with neither needs its own adapter.

**Composition by solver.** *Send Ana the file Lee shared yesterday* names a thing it does not identify.

1. The reader gives the claim. The host resolves Ana and cannot resolve the file, so its description becomes a subgoal.
2. The matcher compares the description with every *yields* shape. The share query fits.
3. The solver takes the manifests' needs and gives as actions, and the command as the goal. It picks one action per step so that each step's needs are met by earlier steps, and prefers fewer steps and read-only steps.
4. The plan is shown as Ageben sentences built from the manifest's own call shapes, and is run one step at a time, each step through the permission check.

The solver plans over kinds, since no value exists yet: *step 1 yields a file; step 2 sends it*. When step 1 returns one file the plan continues; several, the reply is *which one?*; none, the turn is `refused` and names the description; a result that breaks a later step, the solver plans again from the new facts. When no plan exists, the solver's core names the gap (*nothing yields a file from a person and a day*).

**A bounded evaluator in the loop.** The grammar already has constructs that compose commands: a condition, a binder such as *every*, clause sequence, try and fallback, a stand-in that carries one step's result to the next. `ageben-interpreter.md` makes any such command `beyond` for now. This idea needs them run, and the wizard and agent permissions will too, so the loop defines each one once, as calls to the host's `holds` and `handler`. It stays bounded: no recursion, no procedure defined by the user, a loop only over a finite list. Every text then terminates, and a plan or a permission set can be checked before anything runs.

## Open questions

1. **Which constructions carry needs, gives, and yields in a manifest?** Options: (a) the statement kinds of `ageben-spec.md`, so a manifest is a spec of an application; (b) a manifest convention of its own (a condition hinge for needs, CAUSE for gives, a fill question for yields); (c) new forms. **Recommendation:** (a) where its kinds fit, (b) for the rest, never (c). It needs a pilot manifest for one small application, checked against the grammar pages.
2. **How is a function with no fitting root named?** Applications have thousands of functions. Options: (a) only functions a published root fits; (b) a compound, matched on its head; (c) a generic *do* verb with the function's name in a literal span; (d) a named phrase per function. **Recommendation:** (a) and (b) first, since they read as Ageben; (c) as the fallback that keeps every function reachable. Which roots to add is a lexicon choice per application.
3. **When is a condition on a command checked?** Options: (a) once, when the command runs; (b) it stands, and fires whenever the condition comes true; (c) a plain condition is (a), and a habitual or *whenever* restrictor is (b). **Recommendation:** (c), if [restrictors](/restrictors) and [causation](/causation) support it; this is a meaning decision.
4. **If the condition cannot be told, does the command run?** Options: (a) no, and the reply is *cannot say*; (b) the host decides. **Recommendation:** (a), which is failing closed.
5. **Does *every* over a query result run the command once per member?** Options: (a) yes, over the list as it stands when the command starts; (b) yes, re-reading the list each step; (c) no, `beyond`. **Recommendation:** (a): it is what the binder says, and a fixed list always ends.
6. **In a clause sequence, does a failed step stop the rest?** Options: (a) yes, unless a fallback is stated; (b) each step runs regardless. **Recommendation:** (a).
7. **Which steps of a composed plan pause for a yes?** Options: (a) every step that changes anything; (b) only steps the user's say words do not already cover; (c) none. **Recommendation:** (b), with (a) when no say word applies.
8. **Where does the evaluator get planned?** Options: (a) a later phase of `ageben-interpreter.md`; (b) its own proposal after that one's phase 5. **Recommendation:** (b), since questions 3 to 6 are grammar decisions that should not hold up the wizard.

## Non-goals

- **No new forms for programming.** No variables, types, recursion, or procedure definitions are added to Ageben.
- **No trust in a manifest's claims.** A manifest is untrusted input: permission attaches to the function, never to the effect it declares.
- **No English input, and no language model in the path** from sentence to call.
- **No surface design.** Text box, voice, or editor is a later choice.

## Not checked

The grammar pages for questions 1 and 3 to 6; whether MCP tool descriptions carry enough to draft a manifest from; solve time with many applications loaded.
