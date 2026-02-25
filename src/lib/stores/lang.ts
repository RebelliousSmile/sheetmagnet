import { writable } from 'svelte/store';

export type Lang = 'en' | 'fr';

const { subscribe, set, update } = writable<Lang>('en');

export const lang = {
  subscribe,
  init() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('lang') as Lang;
      if (stored === 'en' || stored === 'fr') set(stored);
    }
  },
  toggle() {
    update(l => {
      const next = l === 'en' ? 'fr' : 'en';
      if (typeof localStorage !== 'undefined') localStorage.setItem('lang', next);
      return next;
    });
  }
};
