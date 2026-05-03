/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum NamingGoal {
  TATTOO = 'tattoo',
  BUSINESS = 'business',
  HERITAGE = 'heritage',
  PASSION = 'passion',
}

export enum NameVibe {
  MASCULINE = 'masculine',
  FEMININE = 'feminine',
  NEUTRAL = 'neutral',
}

export enum StylePreference {
  YOUNG_BOLD = 'young-bold',
  CLASSIC_REFINED = 'classic-refined',
}

export enum RegionalFocus {
  GENERAL = 'general',
  WESTERN_FRIENDLY = 'western-friendly',
  EAST_ASIAN = 'east-asian',
}

export interface CharacterDetail {
  char: string;
  pinyin: string;
  meaning: string;
  etymology: string;
}

export interface NameIdentity {
  id: string;
  characters: string;
  pinyin: string;
  englishMeaning: string;
  intent: string;
  details: CharacterDetail[];
  culturalResonance: string;
  safetyAudit: {
    tattoo: 'Cleared' | 'Risky' | 'Caution';
    business: 'Excellent' | 'Good' | 'Average';
    digital: 'Verified' | 'Unverified';
  };
  mockups: {
    calligraphy: string;
    seal: string;
    modern: string;
  };
}

export type AppStage = 'hero' | 'context' | 'ritual' | 'selection' | 'dossier';

export interface UserContext {
  goal: NamingGoal;
  intent: string;
  englishName?: string;
  nameVibe: NameVibe;
  stylePreference: StylePreference;
  regionalFocus: RegionalFocus;
}
