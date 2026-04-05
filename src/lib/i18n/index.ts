/**
 * i18n system — typed translation lookup based on lang store.
 *
 * Usage in Svelte components:
 *   import { t } from '$lib/i18n';
 *   <h1>{$t.select.title}</h1>
 *
 * Usage in non-reactive contexts (templates, blocks):
 *   import { getTranslation } from '$lib/i18n';
 *   const t = getTranslation();
 *   section(t.pdf.combat, 100)
 */

import { derived, get } from 'svelte/store';
import { lang } from '$lib/stores/lang';
import en from './en';
import fr from './fr';

export type Translations = typeof en;

const translations: Record<string, Translations> = { en, fr };

/** Reactive translation store — use in Svelte components as $t */
export const t = derived(lang, ($lang) => translations[$lang] ?? en);

/** Non-reactive translation getter — use in template definitions */
export function getTranslation(): Translations {
  return translations[get(lang)] ?? en;
}

/** Get translations for a specific language */
export function getTranslationFor(langCode: string): Translations {
  return translations[langCode] ?? en;
}
