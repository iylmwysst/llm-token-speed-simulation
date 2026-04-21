import type { Language } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'en', nameEn: 'English', nameNative: 'English', flag: '🇬🇧' },
  { code: 'th', nameEn: 'Thai', nameNative: 'ไทย', flag: '🇹🇭' },
  { code: 'ja', nameEn: 'Japanese', nameNative: '日本語', flag: '🇯🇵' },
  { code: 'zh', nameEn: 'Chinese', nameNative: '中文', flag: '🇨🇳' },
  { code: 'ko', nameEn: 'Korean', nameNative: '한국어', flag: '🇰🇷' },
  { code: 'fr', nameEn: 'French', nameNative: 'Français', flag: '🇫🇷' },
  { code: 'de', nameEn: 'German', nameNative: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', nameEn: 'Spanish', nameNative: 'Español', flag: '🇪🇸' },
  { code: 'pt', nameEn: 'Portuguese', nameNative: 'Português', flag: '🇵🇹' },
  { code: 'it', nameEn: 'Italian', nameNative: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', nameEn: 'Russian', nameNative: 'Русский', flag: '🇷🇺' },
  { code: 'ar', nameEn: 'Arabic', nameNative: 'العربية', flag: '🇸🇦' },
  { code: 'hi', nameEn: 'Hindi', nameNative: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', nameEn: 'Indonesian', nameNative: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'vi', nameEn: 'Vietnamese', nameNative: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', nameEn: 'Turkish', nameNative: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', nameEn: 'Polish', nameNative: 'Polski', flag: '🇵🇱' },
  { code: 'nl', nameEn: 'Dutch', nameNative: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', nameEn: 'Swedish', nameNative: 'Svenska', flag: '🇸🇪' },
  { code: 'fi', nameEn: 'Finnish', nameNative: 'Suomi', flag: '🇫🇮' },
  { code: 'no', nameEn: 'Norwegian', nameNative: 'Norsk', flag: '🇳🇴' },
  { code: 'da', nameEn: 'Danish', nameNative: 'Dansk', flag: '🇩🇰' },
  { code: 'cs', nameEn: 'Czech', nameNative: 'Čeština', flag: '🇨🇿' },
  { code: 'el', nameEn: 'Greek', nameNative: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', nameEn: 'Hebrew', nameNative: 'עברית', flag: '🇮🇱' },
  { code: 'uk', nameEn: 'Ukrainian', nameNative: 'Українська', flag: '🇺🇦' },
];

export function findLanguage(query: string): Language[] {
  const q = query.trim().toLowerCase();
  if (!q) return LANGUAGES;
  return LANGUAGES.filter(
    (language) =>
      language.code.toLowerCase().includes(q) ||
      language.nameEn.toLowerCase().includes(q) ||
      language.nameNative.toLowerCase().includes(q),
  );
}
