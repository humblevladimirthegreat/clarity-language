/**
 * Realizer gaps (docs/meta/realizer.md#round-trip): `Unrealized`, which a rule throws for a part it cannot write, and the
 * opt-in collecting mode that records every gap of a reading instead of stopping at the first.
 */
import type { GapKind } from "./realize.js";

/** A part the realizer cannot write yet: why, and what. The caller files it under the reading's key. */
export class Unrealized extends Error {
  constructor(
    readonly kind: GapKind,
    detail: string,
  ) {
    super(detail);
  }
}

// ── Collecting every gap ──

/** A gap found in collecting mode, with whether it may be a knock-on of another (docs/meta/realizer.md#round-trip). */
export type FoundGap = { kind: GapKind; key: string; detail: string; nested: boolean };

/** The leaf written in place of a part that failed in collecting mode, so the rest of the reading is still written. */
export const PLACEHOLDER = "⟨gap⟩";

/** An item being written: `failed` once a part of it was skipped, so later gaps inside it are nested. */
type Scope = { failed: boolean };

let active: { gaps: FoundGap[]; scopes: Scope[] } | undefined;

function record(error: Unrealized, key: string, nested: boolean): void {
  const found = active!;
  found.gaps.push({ kind: error.kind, key, detail: `${key}: ${error.message}`, nested: nested || found.scopes.some((s) => s.failed) });
}

/**
 * Write one item (a term, detail, frame, list part, stance list or link) filed under `key`. By default this is `write()`;
 * while collecting, an {@link Unrealized} it throws is recorded and `fallback` returned. The gap is nested when a part
 * inside the item failed first, or the item sits inside one that already failed: its failure may come from that.
 */
export function attempt<T>(key: string, write: () => T, fallback: T): T {
  if (!active) return write();
  const found = active;
  const before = found.gaps.length;
  const scope: Scope = { failed: false };
  found.scopes.push(scope);
  try {
    return write();
  } catch (error) {
    if (!(error instanceof Unrealized)) throw error;
    found.scopes.splice(found.scopes.indexOf(scope));
    record(error, key, found.gaps.length > before || scope.failed);
    return fallback;
  } finally {
    const at = found.scopes.indexOf(scope);
    if (at >= 0) found.scopes.splice(at);
  }
}

/**
 * A part with no rule, filed under `key`: by default it throws `error`; while collecting, it is recorded, the item it
 * sits in counts as failed, and the caller writes the rest without it.
 */
export function skip(key: string, error: Unrealized): void {
  if (!active) throw error;
  record(error, key, false);
  const scope = active.scopes.at(-1);
  if (scope) scope.failed = true;
}

/**
 * Run `write` in collecting mode: every gap it meets is recorded rather than thrown. A gap thrown past every item is
 * filed under `key`, nested when another came first. `value` is undefined when `write` itself failed.
 */
export function collecting<T>(key: string, write: () => T): { value?: T; gaps: FoundGap[] } {
  const outer = active;
  active = { gaps: [], scopes: [] };
  const found = active;
  try {
    return { value: write(), gaps: found.gaps };
  } catch (error) {
    if (!(error instanceof Unrealized)) throw error;
    record(error, key, found.gaps.length > 0);
    return { gaps: found.gaps };
  } finally {
    active = outer;
  }
}
