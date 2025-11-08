/**
 * TMDB Language Constants
 * Common languages for filtering content by original language
 * Uses ISO 639-1 language codes as required by TMDB API
 */

export interface TMDBLanguage {
  code: string; // ISO 639-1 code
  name: string; // Display name
}

export const COMMON_LANGUAGES: TMDBLanguage[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'th', name: 'Thai' },
];

/**
 * Get language name by code
 */
export function getLanguageName(code: string): string | undefined {
  const language = COMMON_LANGUAGES.find(lang => lang.code === code);
  return language?.name;
}

/**
 * Get all language codes
 */
export function getAllLanguageCodes(): string[] {
  return COMMON_LANGUAGES.map(lang => lang.code);
}

