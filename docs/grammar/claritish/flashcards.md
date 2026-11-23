---
outline: false
---

<!-- read-by (generated: npm run page-readers -- --write; do not edit)
Inbound links: npm run page-refs -- claritish/flashcards.md
-->

# Flashcards {#flashcards}

The Claritish flashcards put every drop-in from the lessons into Anki, a flashcard app. Each flashcard shows a drop-in on the front, and on the back what it means and which lesson teaches it. Each lesson has its own deck, so you can study a lesson's drop-ins right after you read it.

<ClaritishFlashcards part="download" />

## What the pack holds {#contents}

The lesson decks are inside one deck called **Claritish**, in the order of the lessons, with the bonus lesson last.

<ClaritishFlashcards part="decks" />

## Setup {#setup}

Install Anki on the device you study on, download the file above, and import it. Anki adds the **Claritish** deck with one deck inside it for each lesson.

| Device | App | To import the file |
|--------|-----|--------------------|
| A computer | [Anki](https://apps.ankiweb.net/) | **File** > **Import**, then choose the downloaded file |
| Android | [AnkiDroid](https://play.google.com/store/apps/details?id=com.ichi2.anki) | Open the downloaded file and choose AnkiDroid |
| iPhone or iPad | [AnkiMobile](https://apps.apple.com/app/ankimobile-flashcards/id373493387) | Open the downloaded file and choose AnkiMobile |

The file holds only the flashcards. Anki keeps your progress on your own device.

## Studying {#studying}

Read a lesson first, then study its deck: open **Claritish**, then the deck with the lesson's title. When a drop-in shows, say what it means before you press **Show Answer**. You remember a meaning longer when you recall it yourself than when you recognize it on the back.

Studying the **Claritish** deck itself draws new flashcards from every lesson, in lesson order. Because that deck shows drop-ins from lessons you have not read yet, study the lesson decks until you have read every lesson.

## Updating {#updating}

When the lessons change, this file changes with them. Download it again and import it the same way. Anki updates the flashcards you already have and keeps your progress on them.

A drop-in the lessons no longer teach stays in Anki after an import. To find those, open Anki's **Browse** window and paste this search:

<ClaritishFlashcards part="search" />

It finds the Claritish flashcards that the newest file does not have. Select them all and delete them.

<!-- Claritish track, not a lesson: the Anki flashcard pack built from the cheat sheet (src/flashcards-claritish.ts; npm run docs:publish puts it in dist/grammar/flashcards/). Counts and the release tag come from .vitepress/lib/claritish-flashcards.data.ts. Adds no forms; links only to lessons, the download, and the Anki apps (docs/meta/grammar-docs.md#claritish-track). -->
