# AGENTS.md policy

Editors only. What belongs in the root `AGENTS.md`, which every agent session loads before reading anything else.

## Why this policy exists

A summary in `AGENTS.md` is a second copy of what the grammar docs say, and nothing keeps it in sync. `retie-docs` fixes spellings but not meanings, and `npm run build` does not check claims made there. Agents also trust the loaded file more than the doc it summarizes, so a stale summary can override a correct grammar page.

## Include

1. **Invariants that apply everywhere and rarely change**: the language name, present-the-current-language-only, orthography basics, the `SELF` slot.
2. **A routing table**: each source file and one line of *topic nouns* saying what it owns. It tells an agent which file to open, not what the file says.
3. **Workflow and tooling**: which commands to run and when, what not to run, the retie procedure, build exceptions, the commit tag.
4. **Judgment rules that are not grammar**, such as how to weigh dev effort, or that the parser is not design authority.

## Exclude

- **Agazan forms paired with meanings**: no form-to-gloss pairs, ending tables, or vowel-series meanings. An agent that needs them opens the owning doc.
- **Anything a design change would force you to edit.** Test: would any of the last five grammar commits have required editing this line? If so, it belongs in the grammar doc.
- **Anything already stated in `docs/meta/`.** Link to it instead.
- **Duplicate indexes** of the routing table.

**Exception:** a form may appear as an identifier the agent must recognize, with no gloss (for example the glasses root behind the name).

## Size

Keep the file short enough to read in full. When a row grows past one line, move the detail into the doc it points at.
