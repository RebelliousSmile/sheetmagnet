/**
 * Language store — UI language preference
 *
 * NOTE: Language preference is stored in localStorage. This is an
 * intentional exception to the zero-persistence rule, which applies
 * to user/character data only — not UI preferences.
 */

import { writable } from 'svelte/store';

export type Lang = 'en' | 'fr';

const { subscribe, set, update } = writable<Lang>('en');

export const lang = {
  subscribe,
  init() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('lang');
      if (stored === 'en' || stored === 'fr') set(stored);
    }
  },
  toggle() {
    update((l) => {
      const next = l === 'en' ? 'fr' : 'en';
      if (typeof localStorage !== 'undefined')
        localStorage.setItem('lang', next);
      return next;
    });
  },
};
