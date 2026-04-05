/**
 * User preferences — visual customization
 *
 * NOTE: These UI preferences (header color) are stored in localStorage.
 * This is an intentional exception to the zero-persistence rule, which
 * applies to user/character data only. UI preferences contain no
 * sensitive information and improve UX across sessions.
 */

import { writable } from 'svelte/store';

export const headerColor = writable('#1a1a2e');

export function initPreferences(): void {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('headerColor');
    if (stored) headerColor.set(stored);
  }
}

export function setHeaderColor(color: string): void {
  headerColor.set(color);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('headerColor', color);
  }
}

export const HEADER_COLOR_PRESETS = [
  { name: 'Midnight', value: '#1a1a2e' },
  { name: 'Crimson', value: '#8b0000' },
  { name: 'Forest', value: '#1a3a1a' },
  { name: 'Navy', value: '#1a2a4e' },
  { name: 'Plum', value: '#3a1a3e' },
  { name: 'Slate', value: '#2d3436' },
  { name: 'Bronze', value: '#4a3520' },
  { name: 'Teal', value: '#1a3a3a' },
] as const;
