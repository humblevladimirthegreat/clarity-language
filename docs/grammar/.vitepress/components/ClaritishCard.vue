<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { withBase } from 'vitepress'
import {
  answerKey,
  applyChanges,
  choiceLabel,
  placeAtCommand,
  placeDropIn,
  type CommandAt,
  type Cue,
  type EditorFlow,
  type EditorLesson,
  type EditorTrigger,
  type PlacedChange,
  type Span,
} from '@claritish-editor-browser'
import { previewPhonemes } from '@tts-browser'

type OwnedNounModule = typeof import('@claritish-owned-noun')

/** A card opens on an English cue (`cue` and `trigger`) or on a slash command (`command`). */
const props = defineProps<{
  cue?: Cue
  trigger?: EditorTrigger
  command?: CommandAt
  /** Answers a command preselects. */
  commandDefaults?: Record<string, string>
  /** The other cues in the sentence (*Also here*). */
  also: Cue[]
  flow: EditorFlow
  lesson: EditorLesson
  /** Colour slot of the lesson. */
  tone: number
  lessons: EditorLesson[]
}>()

const emit = defineEmits<{
  use: [changes: PlacedChange[], form: string]
  leave: []
  never: []
  switch: [cue: Cue]
  close: []
}>()

const root = ref<HTMLElement | null>(null)
const answers = ref<Record<string, string>>({})
const keepCue = ref(false)
const showIpa = ref(false)

/** The text the card works in: the cue's sentence, or the command's line. */
const context = computed(() =>
  props.command
    ? { text: props.command.line, from: props.command.lineFrom }
    : { text: props.cue!.sentence.text, from: props.cue!.sentence.from },
)

/** compromise loads only for a cue card whose flow asks about an owned thing; a command goes where it was typed. */
const ownedNounModule = shallowRef<OwnedNounModule | null>(null)
const needsNoun = computed(() => !props.command && props.flow.questions.some((q) => q.choices.some((c) => c.requires === 'owned-noun')))
const noun = computed<(Span & { text: string }) | undefined>(() =>
  props.cue ? ownedNounModule.value?.ownedNoun(props.cue.sentence.text, props.cue.sentence.from) : undefined,
)

watch(
  needsNoun,
  (needed) => {
    if (needed && !ownedNounModule.value) {
      import('@claritish-owned-noun').then((mod) => (ownedNounModule.value = mod)).catch(() => {})
    }
  },
  { immediate: true },
)

const questions = computed(() =>
  props.flow.questions.map((q) => ({
    ...q,
    choices: q.choices
      .filter((c) => (c.requires === 'command' ? props.command : c.requires === 'owned-noun' ? props.command || noun.value : true))
      .map((c) => {
        const label = choiceLabel(q, c, answers.value)
        return { ...c, label: c.requires === 'owned-noun' && noun.value ? `${label}: ${noun.value.text}` : label }
      }),
  })),
)

function reset() {
  const preset = props.command ? props.commandDefaults ?? {} : props.trigger?.defaults ?? {}
  const next: Record<string, string> = {}
  for (const q of props.flow.questions) next[q.id] = preset[q.id] ?? q.choices[0]!.value
  answers.value = next
  keepCue.value = false
  showIpa.value = false
}
watch(() => [props.cue?.from, props.cue?.trigger, props.command?.from, props.flow.id], reset, { immediate: true })

/** An answer that no drop-in fits (*None of these* for an ought): the card says so. */
const none = computed(() => {
  for (const q of props.flow.questions) {
    const note = q.choices.find((c) => c.value === answers.value[q.id])?.none
    if (note) return note
  }
  return undefined
})

const outcome = computed(() => (none.value ? undefined : props.flow.outcomes[answerKey(props.flow.questions, answers.value)]))
const placement = computed(() => outcome.value?.placement ?? props.trigger?.placement ?? 'after-clause')

const canDrop = computed(() => {
  const cue = props.cue
  if (!cue || !props.trigger?.dropCue || placement.value !== 'after-clause') return false
  return cue.sentence.tokens.some((t) => t.word && (t.to <= cue.from || t.from >= cue.to))
})

const changes = computed<PlacedChange[]>(() => {
  const o = outcome.value
  if (!o) return []
  if (props.command) return placeAtCommand(props.command.line, props.command.lineFrom, props.command, o.form)
  return placeDropIn(props.cue!, o.form, {
    placement: placement.value,
    joiner: props.trigger!.joiner,
    dropCue: canDrop.value && !keepCue.value,
    noun: noun.value,
  })
})

/** A suffix with no English verb to join. */
const noHost = computed(() => Boolean(outcome.value && !changes.value.length))

const preview = computed(() => {
  const { text, form } = applyChanges(context.value.text, changes.value, context.value.from)
  if (!form) return { before: text, form: '', after: '' }
  return { before: text.slice(0, form.from), form: text.slice(form.from, form.to), after: text.slice(form.to) }
})

const ipa = computed(() => {
  const form = outcome.value?.form
  if (!form || !/^\p{L}/u.test(form)) return ''
  return previewPhonemes(form).words.map((w) => w.ipa).join(' ')
})

/** `*see*` → italic runs, for the gap line. */
const gapParts = computed(() =>
  (props.trigger?.gap ?? '').split(/(\*[^*]+\*)/).filter(Boolean).map((part) =>
    part.length > 2 && part.startsWith('*') && part.endsWith('*') ? { text: part.slice(1, -1), em: true } : { text: part, em: false },
  ),
)

const heading = computed(() => (props.command ? `/${props.command.name}` : `“${props.cue!.text}”`))
const learnHref = computed(() => withBase(`/${props.lesson.learn}`))

function titleOf(id: string): string {
  return props.lessons.find((l) => l.id === id)?.title ?? id
}

function use() {
  if (outcome.value && changes.value.length) emit('use', changes.value, outcome.value.form)
}

/** Focus the first answer, or *Use this* when there is nothing to choose. */
async function focus() {
  await nextTick()
  const first = root.value?.querySelector<HTMLElement>('input:checked, .use')
  first?.focus()
}

defineExpose({ focus, root })
</script>

<template>
  <div
    ref="root"
    class="card"
    role="dialog"
    :aria-label="`${lesson.title}: ${heading}`"
    :style="{ '--cl-tone': `var(--cl-tone-${tone})` }"
    @keydown.esc.stop.prevent="emit('close')"
  >
    <header class="card-head">
      <span class="lesson">{{ lesson.title }}</span>
      <span class="cue">{{ heading }}</span>
    </header>
    <p v-if="trigger" class="gap">
      <template v-for="(part, i) in gapParts" :key="i"><em v-if="part.em">{{ part.text }}</em><template v-else>{{ part.text }}</template></template>
    </p>

    <template v-for="q in questions" :key="q.id">
      <fieldset v-if="q.choices.length > 1" class="question">
        <legend>{{ q.prompt }}</legend>
        <label v-for="(c, i) in q.choices" :key="c.value" class="choice" :for="`cl-${flow.id}-${q.id}-${i}`">
          <input :id="`cl-${flow.id}-${q.id}-${i}`" v-model="answers[q.id]" type="radio" :name="`cl-${flow.id}-${q.id}`" :value="c.value" />
          {{ c.label }}
        </label>
      </fieldset>
    </template>

    <p v-if="none" class="preview none" aria-live="polite">{{ none }}</p>
    <div v-else-if="outcome" class="preview">
      <p v-if="noHost" class="sentence" aria-live="polite">Type <code>/{{ command?.name ?? 'can' }}</code> right after the English verb it is about.</p>
      <p v-else class="sentence" aria-live="polite">
        {{ preview.before }}<mark>{{ preview.form }}</mark>{{ preview.after }}
      </p>
      <p class="gloss">
        <code>{{ outcome.form }}</code>
        <span>{{ outcome.gloss.join(' · ') }}</span>
        <button v-if="ipa" type="button" class="say" :aria-expanded="showIpa" @click="showIpa = !showIpa">Say it</button>
      </p>
      <p v-if="showIpa && ipa" class="ipa">/{{ ipa }}/ <span class="ipa-note">every vowel is its own beat</span></p>
      <label v-if="canDrop" class="keep" for="cl-keep-cue">
        <input id="cl-keep-cue" v-model="keepCue" type="checkbox" />
        Keep “{{ cue!.text }}” in the sentence
      </label>
    </div>

    <div class="actions">
      <button v-if="!none" type="button" class="use" :disabled="!outcome || noHost" @click="use">Use this</button>
      <button type="button" class="leave" @click="emit('leave')">Leave it in English</button>
      <a class="learn" :href="learnHref">Learn this</a>
      <button v-if="cue" type="button" class="never" @click="emit('never')">Never for “{{ cue.text }}”</button>
    </div>

    <div v-if="also.length" class="also">
      <span class="also-label">Also here:</span>
      <button v-for="other in also" :key="`${other.trigger}-${other.from}`" type="button" @click="emit('switch', other)">
        “{{ other.text }}” ({{ titleOf(other.lesson) }})
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: min(30rem, 100%);
  box-sizing: border-box;
  padding: 0.8rem 0.95rem;
  border: 1px solid var(--vp-c-divider);
  border-top: 3px solid var(--cl-tone);
  border-radius: 8px;
  background: var(--vp-c-bg);
  box-shadow: var(--vp-shadow-3);
  font-size: 0.9rem;
}

.card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.2rem 0.6rem;
}

.lesson {
  color: var(--cl-tone);
  font-weight: 600;
}

.cue {
  color: var(--vp-c-text-2);
}

.gap {
  margin: 0.35rem 0 0.6rem;
  color: var(--vp-c-text-1);
  line-height: 1.5;
}

.question {
  margin: 0 0 0.55rem;
  padding: 0;
  border: 0;
}

.question legend {
  padding: 0;
  margin-bottom: 0.2rem;
  font-weight: 600;
}

.choice {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  line-height: 1.4;
  cursor: pointer;
}

.preview {
  margin: 0.2rem 0 0.6rem;
  padding: 0.5rem 0.65rem;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.sentence {
  margin: 0;
  line-height: 1.5;
}

.preview.none {
  margin-top: 0;
  line-height: 1.5;
}

.sentence mark {
  padding: 0 0.1rem;
  border-radius: 3px;
  background: var(--vp-c-brand-soft);
  color: inherit;
}

.gloss {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.2rem 0.5rem;
  margin: 0.35rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

.ipa {
  margin: 0.25rem 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
}

.ipa-note {
  font-family: var(--vp-font-family-base);
  color: var(--vp-c-text-2);
}

.keep {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin-top: 0.35rem;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  cursor: pointer;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.6rem;
}

.use,
.leave,
.say {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.use:hover:not(:disabled),
.leave:hover {
  background: var(--vp-c-brand-soft);
}

.use:disabled {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
  cursor: not-allowed;
}

.say {
  padding: 0.05rem 0.5rem;
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  font-weight: 400;
}

.learn {
  font-size: 0.85rem;
}

.never,
.also button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--vp-c-text-2);
  font: inherit;
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
}

.also {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 0.6rem;
  margin-top: 0.6rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
}

.also-label {
  color: var(--vp-c-text-2);
}
</style>
