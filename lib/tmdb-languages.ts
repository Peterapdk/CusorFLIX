/**
 * TMDB Region Constants
 * Regions for filtering content by original language
 * Maps regions to ISO 639-1 language codes as required by TMDB API
 */

export interface Region {
  id: string;
  name: string;
  languageCodes: string[]; // ISO 639-1 codes for languages in this region
}

export const REGIONS: Region[] = [
  {
    id: 'east-asia-pacific',
    name: 'East Asia and Pacific',
    languageCodes: ['ja', 'ko', 'zh', 'th', 'vi', 'id', 'ms', 'tl', 'my', 'km', 'lo', 'mn', 'ka', 'hy', 'az', 'uz', 'kk', 'ky', 'tg', 'tk']
  },
  {
    id: 'europe-central-asia',
    name: 'Europe and Central Asia',
    languageCodes: ['en', 'fr', 'de', 'it', 'es', 'pt', 'ru', 'pl', 'nl', 'sv', 'da', 'fi', 'no', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sr', 'sl', 'mk', 'sq', 'et', 'lv', 'lt', 'el', 'tr', 'ka', 'hy', 'az', 'kk', 'ky', 'uz', 'tg', 'tk']
  },
  {
    id: 'latin-america-caribbean',
    name: 'Latin America and Caribbean',
    languageCodes: ['es', 'pt', 'fr', 'en', 'ht', 'qu', 'ay', 'gn', 'nl']
  },
  {
    id: 'middle-east-north-africa',
    name: 'Middle East, North Africa, Afghanistan and Pakistan',
    languageCodes: ['ar', 'fa', 'ur', 'he', 'tr', 'ps', 'ku', 'az', 'am', 'tk', 'uz', 'tg', 'ky', 'kk']
  },
  {
    id: 'north-america',
    name: 'North America',
    languageCodes: ['en', 'es', 'fr']
  },
  {
    id: 'south-asia',
    name: 'South Asia',
    languageCodes: ['hi', 'bn', 'ur', 'te', 'ta', 'mr', 'gu', 'kn', 'or', 'pa', 'ml', 'si', 'ne', 'my', 'dz', 'th']
  },
];

/**
 * Get region by ID
 */
export function getRegionById(id: string): Region | undefined {
  return REGIONS.find(region => region.id === id);
}

/**
 * Get language codes for a region
 */
export function getLanguageCodesForRegion(regionId: string): string[] {
  const region = getRegionById(regionId);
  return region?.languageCodes || [];
}

/**
 * Get all region IDs
 */
export function getAllRegionIds(): string[] {
  return REGIONS.map(region => region.id);
}

/**
 * Get language codes for multiple regions
 */
export function getLanguageCodesForRegions(regionIds: string[]): string[] {
  const allCodes = new Set<string>();
  regionIds.forEach(regionId => {
    const codes = getLanguageCodesForRegion(regionId);
    codes.forEach(code => allCodes.add(code));
  });
  return Array.from(allCodes);
}

