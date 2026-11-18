# Agent tool permissions in plain Ageben

**Status:** IDEA, 2026-11-13. Decided 2026-11-13: the tool is a host on the shared interpreter (`ageben-interpreter.md`, all its phases); this idea keeps only what is specific to permissions.  
**Related:** grammar pages [permission and consent](/permission-consent#say-words), [how far the say reaches](/permission-consent#say-reach), [questions](/questions#question), [ability](/can-and-cant#ability), [phasal words](/already-still-yet#stage-of-change), [spans](/spans), [sakes](/for-a-sake); the interpreter's reader, log, matcher, and loop (`src/interpret/`, made by `ageben-interpreter.md`); the published parser bundle ([ageben.ts](../../../src/agent/ageben.ts)); `ageben-spec.md` (it reads say words as requirements from the same readings).

Not design authority. Tooling only: the sketch adds no form and changes no reading. Where it finds a gap, the gap is an open question for the user.

## Problem

An AI agent that runs tools (read a file, run a command, send a message) needs a permission state: what it may do, what it may not, what it must ask about. Today that state lives in two places that do not match:

- **Config syntax** (allowlists, glob rules). Software reads it predictably, but a person cannot say it aloud, and it has no words for who granted it, for how long, or whether anyone actually said so.
- **English in the conversation** (*sure, go ahead*, *don't touch that again*). A person says it naturally, but software must guess its scope: this once or always, this file or all files, permission or a passing remark.

Ageben already draws the distinctions a permission system needs, in one closed word, and its syntax parses one way. No tool yet reads an Ageben conversation as permission state.

## Sketch

**The conversation is the log; the state is its replay.** The interpreter reads every sentence into a reading and keeps them in its log, each with who said it. A reading with a `say` frame ([say word](/permission-consent#say-words)) is one permission record. The current permissions are those readings in order. The same text always gives the same state.

One record, with the piece of the reading it comes from:

| Field | Comes from | Permission-system meaning |
|-------|-----------|---------------------------|
| doer, act, object | the claim's roles and verb | which agent, which tool, which resource |
| answer | answer vowel: allow, forbid, require, their call | allow, deny, must-do (as a hook: *tests must run*), agent decides |
| reach | reach vowel: this act, standing, one party's part | allow once, always allow, *fine by me* (other layers may still object) |
| source | ending: rule, a person said, nobody said | managed policy, a grant in this session, an assumption |
| grantor | the log's speaker, or the say frame's party (the `bl-` word) | whose grant it is, for precedence and audit |
| affected party | consent letters `d` / `b` | a second, separate yes from someone the act touches |

**Asking and answering are the grammar's own moves.** The agent puts the clause under ask; the person answers with a polar particle or a full say-word sentence. The pattern on the grammar page, `yem zuwen vehohel hwuvam.` (*May I sit?*) answered by `yael.` (*go ahead*), is the whole protocol with the verb swapped for a tool:

```
agent:  ask | z-speaker | v-run | d-«npm test» | h-this.act-over-ALLOW-said     (… hwuvam)
user:   go ahead                                                                 → allowed, this call only
user:   z-listener | v-run | d-«npm test» | h-standing-over-ALLOW-said          (… hwovam)
                                                                                 → allowed from now on, revocable
policy: z-agent | v-send | d-message | h-standing-over-FORBID-rule              (… hwovul)
                                                                                 → denied, binding, not the user's to lift
```

The clause words above are morph gloss, not spellings; only the say words are taken from the grammar page.

What the grammar gives that config syntax does not:

- **Once against always** is the reach vowel, so *go ahead* can never silently become a standing grant.
- **An assumed yes is visible.** A record on the tacit ending (*nobody is stopping it*) is the agent's own inference. The tool can list every assumption the agent is acting on, which is the point of that ending for people too.
- **Permission and consent are separate records.** The user may allow the agent to message Alazun; whether Alazun agreed is a different say word. An act can require both.
- **Able is not allowed.** A tool being installed is [ability](/can-and-cant#ability); it never implies a say word. The tool can report *can but may not* and *may but cannot*.
- **Who said so** is in the sentence, so layered settings (organization, project, person) are grantors, not separate files.

**Reading the state back.** A yes/no question is a permission check; a fill question lists (*who may run this?*, *what may the agent write?*); a why question returns the records that decided. These are the interpreter's `ask` and its shared replies, so the tool answers in Ageben with a gloss. It also prints the whole state as one canonical text that can be diffed.

**Failing closed.** A sentence that does not parse, or parses but leaves a role or pronoun unresolved, changes nothing and is reported. This is the interpreter's rule for every host: its `parse` and `beyond` outcomes add nothing to the log and name what was not read.

**What this host adds.** Four things, and no reading of Ageben:

- `refer`: a tool verb to an action class, and a span payload to a command, path, or glob;
- `verdict`: which record wins ([open question 3](#open-questions)), and that a tacit record never grants;
- the check itself: each tool call the agent is about to make becomes a claim (*agent runs this command*) asked against the log;
- the pre-tool hook that turns the verdict into allow, deny, or ask.

## Open questions

1. **How is the tool and its resource named?** (a) Lexicon verbs for the action class (read, write, run, send) with the exact command or path as an opaque [span](/spans) payload; (b) the whole tool call as one payload; (c) lexicon words only. **Recommendation:** (a). The person reads the verb, and software matches the payload exactly.
2. **How does one grant cover many resources?** (a) A glob inside the payload, in the host system's syntax; (b) Ageben's own set words ([universals and domains](/universals-domains), *everything but*). **Recommendation:** (a) first, since a payload is opaque and so predictable; (b) is the better end state for a person reading it aloud, and needs a check that those forms compose with a say word, plus the matcher's list-membership switch (an open decision in `ageben-interpreter.md`).
3. **Which record wins when two disagree?** **Recommendation:** forbid over allow; rule ending over person ending; within one grantor, later over earlier. Stated once and printed with every why answer.
4. **Does a tacit record ever grant?** (a) Never: it is logged and shown, and the agent still asks; (b) it grants for acts marked low-risk. **Recommendation:** (a). An assumption that unlocks a tool is the failure this design exists to prevent.
5. **What does silence mean?** No matching record: (a) ask; (b) deny. **Recommendation:** (a) when a person is present, (b) when none is.
6. **Is *their call* on the over-the-act letter the agent's auto mode?** The form says *it's up to you*. Read as: the agent may decide without asking. **Recommendation:** yes, and only on the rule or person ending.
7. **How is a grant withdrawn?** (a) A later say word with the opposite answer; (b) a [phasal](/already-still-yet#stage-of-change) *no longer* on the earlier one; (c) both. **Recommendation:** (c); each would arise naturally. Whether (b) composes with a say word is a grammar check for the user.
8. **Can a grant be bound to a purpose?** *You may read this, for the sake of the review.* [Sakes](/for-a-sake) would carry it, and met / unmet would end the grant when the purpose is done. No basis yet to say whether software can judge a sake met; left open.
9. **Must the person write Ageben?** (a) Yes; (b) the English helper proposes a sentence and the person confirms its gloss; (c) buttons that emit the sentence. **Recommendation:** (b) and (c) alongside (a). The state stays Ageben in every case; only the keyboard differs.
10. **Where does it run first?** (a) A pre-tool hook in a real coding agent, reading a policy file plus the session; (b) the wizard sandbox, as a game mechanic; (c) a library with no host. **Recommendation:** (a). It is the case with a real stake, and it shows whether a person will actually grant in Ageben. (b) now costs little, since the wizard is a host on the same interpreter: a guard who may or may not let the player through is this tool's verdict with a different `refer`.

## Non-goals

- Not a security boundary by itself. The host still enforces; this decides what the host is told.
- Not a new permission grammar. If the say word cannot express a needed state, that is a finding for the user, not a form to invent here.
