// IPA clips from Wikimedia Commons, linked straight to the upload host. The Special:FilePath redirect on
// commons.wikimedia.org is rate-limited (HTTP 429) for browsers, so the file path is spelled out: Commons
// stores a file under the first one and two hex digits of the MD5 of its name. ipa-audio.test.ts checks
// every hash and that each <IpaPlay file> on the grammar pages has one.

export const IPA_HASH_DIRS: Readonly<Record<string, string>> = {
  'Alveolar_approximant.ogg': '1/1f',
  'Alveolar_lateral_approximant.ogg': 'b/bc',
  'Alveolar_nasal.ogg': '2/29',
  'Bilabial_nasal.ogg': 'a/a9',
  'Close_central_rounded_vowel.ogg': '6/66',
  'Mid_back_rounded_vowel.ogg': 'a/a6',
  'Mid_front_unrounded_vowel.ogg': 'e/e0',
  'Open_central_unrounded_vowel.ogg': '5/50',
  'Palatal_approximant.ogg': 'e/e8',
  'Voiced_alveolar_plosive.ogg': '0/01',
  'Voiced_alveolar_sibilant.ogg': 'c/c0',
  'Voiced_bilabial_plosive.ogg': '2/2c',
  'Voiced_dental_fricative.ogg': '6/6a',
  'Voiced_glottal_fricative.ogg': 'e/e2',
  'Voiced_labio-velar_approximant.ogg': 'f/f2',
  'Voiced_labiodental_fricative.ogg': '8/85',
  'Voiced_palato-alveolar_sibilant.ogg': '3/30',
  'Voiced_velar_plosive.ogg': 'b/b4',
  'Voiceless_alveolar_plosive.ogg': '0/02',
  'Voiceless_alveolar_sibilant.ogg': 'a/ac',
  'Voiceless_bilabial_plosive.ogg': '5/51',
  'Voiceless_dental_fricative.ogg': '8/80',
  'Voiceless_glottal_fricative.ogg': 'd/da',
  'Voiceless_labiodental_fricative.ogg': '3/33',
  'Voiceless_palato-alveolar_sibilant.ogg': 'c/cc',
  'Voiceless_velar_plosive.ogg': 'e/e3',
}

/** The clip's URL on upload.wikimedia.org; null for a file missing from the table. */
export function ipaAudioUrl(file: string): string | null {
  const dir = IPA_HASH_DIRS[file]
  return dir ? `https://upload.wikimedia.org/wikipedia/commons/${dir}/${encodeURIComponent(file)}` : null
}
