# AGENTS.md policy

Editors only. What belongs in the root `AGENTS.md`, which every agent session loads before reading anything else.

## Why this policy exists

A summary in `AGENTS.md` is a second copy of what the grammar docs say, and nothing keeps it in sync. `retie-docs` fixes spellings but not meanings, and `npm run build` does not check claims made there. Agents also trust the loaded file more than the doc it summarizes, so a stale summary can override a correct grammar page.

## Include

1. **Invariants that apply everywhere and rarely change**: the language name, present-the-current-language-only, orthography basics, the `SELF` slot (its spelling and what it is for).
2. **A routing table**: each source file and one line of *topic nouns* saying what it owns. It tells an agent which file to open, not what the file says.
3. **Workflow and tooling that applies to most tasks**: build and test, build exceptions, the commit tag, never-by-hand rules, how to handle large output.
4. **One pointer row per procedure**: a task named in a few words and the [procedure file](#procedures) to read in full before doing it.
5. **Judgment rules that are not grammar**, such as how to weigh dev effort, or that the parser is not design authority.

## Exclude

- **Ageben forms paired with meanings**: no form-to-gloss pairs, ending tables, or vowel-series meanings. An agent that needs them opens the owning doc.
- **Anything a design change would force you to edit.** Test: would any of the last five grammar commits have required editing this line? If so, it belongs in the grammar doc.
- **Anything already stated in `docs/meta/`.** Link to it instead.
- **Duplicate indexes** of the routing table.

**Exception:** a form may appear as an identifier the agent must recognize, with no gloss (for example the glasses root behind the name).

## Procedures {#procedures}

A procedure is the step-by-step for one kind of task (parsing, respelling, peeling a sitting, writing a checkpoint): commands, flags, order, and what to check after. It lives in `docs/meta/procedures/`, one file per task family, and `AGENTS.md` keeps only its pointer row. That keeps the always-loaded file small, so an agent or subagent pays for a procedure only when its task needs it.

- Plain Markdown files, not tool-specific skills: every coding agent reads `AGENTS.md` and can follow a path, and one copy cannot drift from another.
- Put a step in a procedure when only that task needs it. Keep it in `AGENTS.md` when breaking it causes silent damage in unrelated work (a hand-spelled root, a proposal link); say it there in one line and link the procedure.
- Policy and rationale (what a page should say, why a form is absent) stay in the flat `docs/meta/` files. A procedure links to them rather than restating them.
- A custom agent definition names the procedure files its task needs in its body ("read X first").

## Size

Keep the file short enough to read in full. When a row grows past one line, move the detail into the doc it points at.
