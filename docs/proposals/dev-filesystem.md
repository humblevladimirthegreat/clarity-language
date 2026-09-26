# Proposal: move the dev workspace off the Windows 9p mount

**Status:** open (tooling, not a language change).  
**Related:** [.devcontainer/devcontainer.json](../../.devcontainer/devcontainer.json), [package.json](../../package.json), [scripts/build.mjs](../../scripts/build.mjs)  
**Design authority:** none.

## Motivation

The devcontainer mounts the repo from `C:\` over WSL's 9p bridge (`C:\ on /workspaces/clarity-language type 9p`). Starting Node is fast (~20 ms). Reading files through the mount is not, so most of the build time goes to loading modules from `node_modules`:

| Load only | Time |
|---|---|
| `import('happy-dom')` | 6.2 s |
| `import('eslint-plugin-vue')` | 5.0 s |
| `import('@typescript-eslint/parser')` | 2.9 s |
| `npx tsx -e 0` (empty script) | 3.4 s |

As measured on 2026-09-26, `npm test` took ~30 s and the rest of `npm run build` took another ~45 s (~75 s total). With `eslint --cache` and a warm cache, eslint still took 10 s, which is plugin loading.

The build has since been restructured without moving the workspace ([scripts/build.mjs](../../scripts/build.mjs)). It skips `generate:word` when `word.peggy` is unchanged, runs a single incremental `tsc`, and runs the independent checks in parallel. The full build now takes **~31 s** with a warm cache. Per-job times when all jobs run at once:

| Job | Time |
|---|---|
| `tsc` | 4.3 s |
| pad spoiler blanks | 0.4 s |
| lint sidebar | 5.8 s |
| lint agalan | 8.3 s |
| `npm test` | 13.2 s |
| lint md balance | 14.5 s |
| eslint | 18.0 s |
| `docs:publish` (VitePress) | 26.4 s (18 s when run alone) |

VitePress is now the slowest job, and each job's time is still mostly spent loading modules over 9p. The options below target that remaining cost.

Occasionally the repo is also opened from Windows outside the devcontainer, just to inspect files. Each option handles that differently.

## Option A: keep the repo on `C:\`, put `node_modules` on a Docker volume

```json
"mounts": ["source=agalan-node-modules,target=${containerWorkspaceFolder}/node_modules,type=volume"],
"postCreateCommand": "npm ci"
```

**Pros**

- Windows sees the repo exactly as it does today. Windows editors, Explorer and Git for Windows are unaffected.
- Fixes the biggest cost: loading packages such as happy-dom, the eslint plugins, tsx and vitepress.
- A small change that's easy to undo.

**Cons**

- Only a partial fix. Repo reads still go through 9p: the doc lints and vitepress scan `docs/`, and tsc reads `src/`. Expect roughly 31 s → 15–20 s, not native speed.
- From Windows, `node_modules` looks empty. That only matters if npm runs on the Windows side, which it shouldn't anyway because native binaries such as esbuild differ between the two systems.
- The volume needs `npm ci` whenever the container is rebuilt.

## Option B: keep the repo in the WSL filesystem (`~/clarity-language`)

Open it with **WSL: Open Folder**, then **Reopen in Container**.

**Pros**

- Close to native speed for everything. Expect the full build to drop from ~31 s to about 8–12 s.
- Windows can still reach the files at `\\wsl$\<distro>\home\<user>\clarity-language`. Explorer, Notepad++ and VS Code on Windows can open that path, so casual inspection still works.
- File watching (`npm run dev` hot reload) becomes reliable. It's often flaky over 9p.

**Cons**

- Windows tools reading `\\wsl$` go through the same slow bridge in the other direction. That's fine for viewing files, slow for Windows-side git or search across the whole repo.
- Pointing Windows-side git at the WSL copy causes problems: it may flag line endings, file permissions or file ownership ("dubious ownership"). Run git inside WSL or the container only.
- WSL must be running for the files to be reachable, and they're stored in the WSL disk image. Backups need to cover that image, or rely on pushing to the remote.
- One-time move: clone fresh into WSL, then copy over any uncommitted changes.

## Option C: keep the repo in a Docker volume

Use **Dev Containers: Clone Repository in Container Volume**.

**Pros**

- Fastest and cleanest. The container owns the files, so there are no permission or line-ending mismatches.
- Nothing depends on how the host is set up.

**Cons**

- Hardest to reach from Windows. There's no normal path, so viewing files needs Docker Desktop's volume browser or `docker cp`. This works worst with the occasional inspection from Windows.
- `docker volume prune`, or resetting Docker Desktop, can delete work that hasn't been pushed.
- Moving files in or out needs git or `docker cp`.

## Recommendation

**Option B**, if opening `\\wsl$\…` from Windows is acceptable for viewing files. It gives nearly all of the speedup, and viewing files from Windows keeps working. Don't run git or npm from the Windows side against it.

If Windows must see the repo exactly as it does today, **Option A** is the low-risk middle ground.
