---
outline: false
---

# Flashcards {#flashcards}

The Ageben flashcards put the words and grammar of the lessons into Anki, a flashcard app that shows each card again just before you would forget it. There is one pack for each level, and a fourth pack, Everything, that holds the whole dictionary for looking words up. Every card starts switched off, and you switch a lesson's cards on when you reach its practice section, so Anki never shows you a word before the lessons have taught it.

<AgebenFlashcards part="packs" />

## What the packs hold {#contents}

The Beginner, Intermediate and Advanced packs follow the lessons. Each has one deck per unit, named as the unit is in the sidebar, such as "Ageben::1 Beginner::04 Why and what for". A unit's deck holds the core words and grammar words that the unit's lessons first drill, in the order of their practice sections. The Everything pack holds every root, compound and grammar word, in one deck per kind, so that you can look a word up in Anki's **Browse** window. It is a dictionary, not a course.

Anki stores each word as a note and makes one or more cards from it. You meet three kinds of card:

| Card | Front | Back |
|------|-------|------|
| A word | The Ageben word; on its reverse card, the English meaning | The meaning; on the reverse card, the Ageben word |
| A word with one fixed grammar use, such as a word that names what you are acting for | An example sentence with the word highlighted; on its reverse card, the meaning and the sentence with the word blanked out | What the word does in that sentence |
| A set of related words | The whole set with one member blanked out | The full set |

The back also gives the word's memory cue, where it has one.

## Setup {#setup}

Install Anki on each device you study on, download the packs you want from the table above, and import each one.

| Device | App | To import a file |
|--------|-----|------------------|
| A computer | [Anki](https://apps.ankiweb.net/) | **File** > **Import**, then choose the downloaded file |
| Android | [AnkiDroid](https://play.google.com/store/apps/details?id=com.ichi2.anki) | Open the downloaded file and choose AnkiDroid |
| iPhone or iPad | [AnkiMobile](https://apps.apple.com/app/ankimobile-flashcards/id373493387) | Open the downloaded file and choose AnkiMobile |

When the import window opens, tick **Import any learning progress**. The box is off by default, as of Anki 26.9, and without it Anki resets every card to new, which switches on every card in the pack at once. Import the level packs before Everything. A word that is in both keeps its place from the pack you import first, so importing Everything first would put its words in dictionary order instead of lesson order.

Then open the options of the **Ageben** deck and set these:

| Setting | Value | Why |
|---------|-------|-----|
| **FSRS** | On, with **Desired retention** at 0.90 | Anki schedules each card so that you still remember it about nine times in ten |
| **Bury new siblings** and **Bury review siblings** | On | The two cards of one word never show on the same day, so one does not give the other away |
| **New card sort order** | **Order gathered** | New cards come in lesson order. The default, *Card type, then order gathered*, shows a day's word-to-meaning cards before its meaning-to-word cards and its set cards |
| **New cards/day** on the "Ageben::Everything" deck | 0 | Everything is a dictionary, not a course, so it should never feed you new cards. Set this in an options preset of its own for that deck |

Study from the top **Ageben** deck. It gathers the new cards of every unit you have reached, in order.

## Switching on a checkpoint {#unlocking}

The practice section at the end of a lesson is its checkpoint, and each card belongs to the checkpoint that first drills its word. Every card arrives suspended, which is Anki's word for a card it keeps but never shows. When you reach a checkpoint, switch its cards on:

1. Open Anki's **Browse** window.
2. Open your level in the tables below, copy the checkpoint's search, and paste it into the search box.
3. Select every card it finds, then choose **Cards** > **Toggle Suspend**.

The cards then join the new cards Anki shows you, and you meet them over the next days. The level reviews have no cards of their own, so they are not in the tables.

<AgebenFlashcards part="checkpoints" />

## Studying {#studying}

Do the day's reviews before you switch on a new checkpoint. Reviews keep the words you already have, and every new card adds to the reviews of the days that follow.

When a card shows English and asks for Ageben, say the answer aloud before you press **Show Answer**. Producing the word yourself is what lets you speak and write it later, rather than only recognize it. If you only want to read Ageben, you can skip those cards: after each checkpoint you switch on, search for `deck:Ageben* card:Production -is:suspended` in **Browse**, select everything, and choose **Toggle Suspend** again.

## Updating {#updating}

When the lessons change, the packs change with them. Download them again and import them the same way, level packs first and with **Import any learning progress** ticked. Anki updates the cards you already have and keeps your progress on them. A new card for a checkpoint you have already passed arrives suspended: add `is:suspended` to the end of that checkpoint's search, select what it finds, and choose **Toggle Suspend**.

A word the lessons no longer teach stays in Anki after an import. To find such cards, paste this search into **Browse**:

<AgebenFlashcards part="cleanup" />

It finds the Ageben cards that the newest packs do not have. Select them all and delete them.

<!-- Tools page, not a stage page: the Ageben Anki packs (src/flashcards.ts, src/flashcards-packs.ts; npm run docs:publish puts them in dist/grammar/flashcards/). Pack counts, unlock searches and the release search come from .vitepress/lib/flashcards.data.ts. Adds no forms; stage pages never link here. -->
