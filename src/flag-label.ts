/**
 * Flag rows (country and territory flag emoji) label their concrete sense `<place>-flag`: **-l** is the
 * flag, **-n** names the place. The suffix is not part of the place's sound, so root placement and the
 * **-n** name ignore it.
 */
export const FLAG_SUFFIX = "-flag";

/** A country or territory flag row (`japan-flag`). */
export function isFlagLabel(label: string): boolean {
  return label.endsWith(FLAG_SUFFIX) && label.length > FLAG_SUFFIX.length;
}

/** `japan-flag` → `japan`; any other label is returned unchanged. */
export function stripFlagSuffix(label: string): string {
  return isFlagLabel(label) ? label.slice(0, -FLAG_SUFFIX.length) : label;
}
