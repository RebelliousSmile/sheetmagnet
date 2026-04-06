import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HEADER_COLOR_PRESETS,
  headerColor,
  initPreferences,
  setHeaderColor,
} from './preferences';

describe('preferences', () => {
  beforeEach(() => {
    headerColor.set('#1a1a2e');
    vi.restoreAllMocks();
  });

  describe('headerColor store', () => {
    it('has default value', () => {
      expect(get(headerColor)).toBe('#1a1a2e');
    });
  });

  describe('initPreferences()', () => {
    it('loads stored headerColor from localStorage', () => {
      const mockStorage: Record<string, string> = { headerColor: '#8b0000' };
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => mockStorage[key] ?? null,
        setItem: vi.fn(),
      });

      initPreferences();

      expect(get(headerColor)).toBe('#8b0000');
    });

    it('keeps default when localStorage has no headerColor', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: vi.fn(),
      });

      initPreferences();

      expect(get(headerColor)).toBe('#1a1a2e');
    });

    it('does nothing when localStorage is undefined', () => {
      vi.stubGlobal('localStorage', undefined);

      expect(() => initPreferences()).not.toThrow();
      expect(get(headerColor)).toBe('#1a1a2e');
    });
  });

  describe('setHeaderColor()', () => {
    it('updates the store', () => {
      const setItem = vi.fn();
      vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem });

      setHeaderColor('#3a1a3e');

      expect(get(headerColor)).toBe('#3a1a3e');
    });

    it('persists to localStorage', () => {
      const setItem = vi.fn();
      vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem });

      setHeaderColor('#3a1a3e');

      expect(setItem).toHaveBeenCalledWith('headerColor', '#3a1a3e');
    });

    it('does not throw when localStorage is undefined', () => {
      vi.stubGlobal('localStorage', undefined);

      expect(() => setHeaderColor('#ffffff')).not.toThrow();
      expect(get(headerColor)).toBe('#ffffff');
    });
  });

  describe('HEADER_COLOR_PRESETS', () => {
    it('has 8 presets', () => {
      expect(HEADER_COLOR_PRESETS).toHaveLength(8);
    });

    it('each preset has name and value', () => {
      for (const preset of HEADER_COLOR_PRESETS) {
        expect(preset.name).toBeTruthy();
        expect(preset.value).toMatch(/^#[0-9a-f]{6}$/);
      }
    });
  });
});
