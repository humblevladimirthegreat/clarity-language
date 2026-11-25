#!/bin/bash
# Setup script for Claude Code cloud sessions: paste into the cloud environment's setup script.
# Installs Node (.nvmrc), npm packages, and a .venv with genanki only. It downloads no data files:
# tests use fixtures, BUILD_OFFLINE=1 lets the site build skip the CMU dictionary, and without
# `anki` the flashcard import check is skipped unless flashcard code changed
# (docs/meta/flashcards.md#import-check).
set -euo pipefail

REPO="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO" ] || [ ! -f "$REPO/package-lock.json" ]; then
  REPO="$(dirname "$(find / -maxdepth 4 -name package-lock.json -path '*clarity-language*' -not -path '*/node_modules/*' 2>/dev/null | head -1)")"
fi

# Node version: .nvmrc if the repo is present, else 24
NODE_MAJOR=24
[ -f "$REPO/.nvmrc" ] && NODE_MAJOR="$(tr -d '[:space:]v' < "$REPO/.nvmrc")"

if ! node -v 2>/dev/null | grep -q "^v${NODE_MAJOR}\."; then
  if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
    set +u; . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
    nvm install "$NODE_MAJOR"; nvm alias default "$NODE_MAJOR"; set -u
    NEW_BIN="$(dirname "$(nvm which "$NODE_MAJOR")")"
  else
    npm install -g n
    N_PREFIX=/usr/local n "$NODE_MAJOR"
    NEW_BIN=/usr/local/bin
  fi

  # Make the new Node win regardless of PATH order:
  # 1) put it first for login shells
  echo "export PATH=$NEW_BIN:\$PATH" > /etc/profile.d/zz-node-default.sh
  # 2) replace the commands in any older Node dir that sits ahead of it on PATH
  for dir in /opt/node*/bin; do
    [ -d "$dir" ] && [ "$dir" != "$NEW_BIN" ] || continue
    for b in node npm npx corepack; do
      [ -e "$NEW_BIN/$b" ] && ln -sfn "$NEW_BIN/$b" "$dir/$b"
    done
  done
  export PATH="$NEW_BIN:$PATH"
  hash -r
fi

# Fail setup loudly if the default is still wrong
node -v | grep -q "^v${NODE_MAJOR}\." || { echo "node is $(node -v), expected v${NODE_MAJOR}"; exit 1; }
echo "setup shell: $(command -v node) $(node -v)"
echo "login shell: $(bash -lc 'command -v node; node -v' | tr '\n' ' ')"

# The site build leaves out the CMU dictionary instead of downloading it (docs/grammar/.vitepress/config.ts)
echo "export BUILD_OFFLINE=1" > /etc/profile.d/ageben-build.sh

if [ -f "$REPO/package-lock.json" ]; then
  cd "$REPO"
  npm ci

  # Python for flashcard packaging (genanki), the same set Amplify installs; the large `anki` wheel is left out
  if ! python3 -c 'import ensurepip' 2>/dev/null; then
    apt-get update && apt-get install -y python3-venv
  fi
  [ -x .venv/bin/python ] || python3 -m venv .venv
  .venv/bin/pip install -q -r requirements-publish.txt
else
  echo "Repo not found at setup time (pwd=$(pwd)); skipping npm install and .venv"
fi
