import { ro } from './ro';
import { ru } from './ru';

export type Language = 'ro' | 'ru';
export type TranslationKey = keyof typeof ro;

export const translations = {
  ro,
  ru
};

export const supportedLanguages = {
  ro: { name: 'Română', flag: '🇷🇴' },
  ru: { name: 'Русский', flag: '🇷🇺' }
};

export default translations;