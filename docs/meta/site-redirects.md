# Public URL remaps (editors)

The live grammar site is VitePress under **`/grammar/`**, published by Amplify from **`dist/`**. Learner pages stay current names only ([present the current language only](grammar-docs.md#present-the-current-language-only)). **Published old URLs** are a hosting concern: map them in [`scripts/site-redirects.json`](../../scripts/site-redirects.json), then paste the generated Amplify JSON.

Do **not** keep a `coordination.md` (or any retired filename) in `docs/grammar/`, and do **not** leave silent `<a id="old-slug">` for retired headings.

## What the build already does

`npm run docs:build` runs [`scripts/publish-docs-extras.mjs`](../../scripts/publish-docs-extras.mjs) after VitePress:

| Artifact | Job |
|----------|-----|
| `dist/index.html` | Path `/` → `/grammar/`. If Amplify still SPA-rewrites **missing** URLs onto this file, send those to `/grammar/404.html` instead of home. |
| `dist/404.html` | Copy of VitePress `dist/grammar/404.html`. |
| `dist/grammar/<old>.html` | Stub per `pageMoves` row (`location.replace` keeps `?query` and `#hash`). |
| `dist/amplify-redirects.json` | JSON to paste into the Amplify console (301s, then `/` → `/grammar/`, then 404 catch-all). |

Stubs work even before the console is updated. **HTTP 301** and a real **404 status** still need the Amplify rules.

## Add a remap (page rename)

When a **public `.html` path** changes (example: `coordination.md` → `joins.md`):

1. Rename the Markdown; retarget every in-repo link to the **current** file and heading ids.
2. Append a `pageMoves` object in [`scripts/site-redirects.json`](../../scripts/site-redirects.json):

```json
{
  "from": "/grammar/coordination.html",
  "to": "/grammar/joins.html",
  "note": "Why this URL still circulates."
}
```

Paths are root-absolute, under `/grammar/`, with `.html` (`cleanUrls` is off). Do not map `#fragments` here — Amplify never sees hashes. Browsers keep the hash when the **path** 301s and the stub uses `location.hash`. If a **heading id** changed, the new page will load without that section; that is allowed (no silent old ids).

3. Run `npm run docs:build` and confirm `dist/grammar/coordination.html` (or the new `from`) exists as a stub, and `dist/amplify-redirects.json` lists the 301 **above** the `/<*>` 404 rule.
4. Amplify console → the app → **Hosting → Rewrites and redirects → Manage redirects**. Replace the editor contents with `dist/amplify-redirects.json` (or the same array from a local build). **Save**.
5. **Remove** Amplify’s default SPA rule if it is still present: regex source targeting `/index.html` with status **200**. That rule is what turned misses into a home bounce. The catch-all in our JSON is status **404** → `/grammar/404.html`.

First match wins. Keep every `pageMoves` 301 **above** `/<*>`.

`amplify.yml` does not apply these rules. Redeploy alone does not update the console list; paste again after you add a row.

## Amplify JSON shape

Current map (coordination → joins) plus 404:

```json
[
  {
    "source": "/grammar/coordination.html",
    "target": "/grammar/joins.html",
    "status": "301",
    "condition": null
  },
  {
    "source": "/",
    "target": "/grammar/",
    "status": "301",
    "condition": null
  },
  {
    "source": "/<*>",
    "target": "/grammar/404.html",
    "status": "404",
    "condition": null
  }
]
```

After save: `/grammar/coordination.html` (and `#…` on that file) should open Joins; `/grammar/no-such-page.html` should show **PAGE NOT FOUND**, not Why Agalan.

## Inventory of old links

Put **every retired public path** in `pageMoves`, not only the latest rename. Today that inventory is:

| Old URL | Current URL |
|---------|-------------|
| `/grammar/coordination.html` | `/grammar/joins.html` |
| `/grammar/core.html` | `/grammar/clause.html` |
| `/grammar/commentary.html` | `/grammar/knowing.html` |
| `/grammar/plan-decision.html` | `/grammar/intention.html` |
| `/grammar/revisers.html` | `/grammar/hooks.html` |
| `/grammar/join-extras.html` | `/grammar/join-across-roles.html` |
| `/grammar/join-derived-forms.html` | `/grammar/join-across-roles.html` |

When you find another circulating URL (Cool Features, Reddit, Discord), add a row in the same commit as the rename when you can; otherwise add the row as soon as you notice the miss.

Do not remap paths that still have a real VitePress page. Do not invent aliases for English names that were never URLs.
