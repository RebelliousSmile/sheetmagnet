import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_index: number) => null),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

import {
  HEADER_COLOR_PRESETS,
  headerColor,
  initPreferences,
  setHeaderColor,
} from './preferences';

describe('preferences store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset to default
    headerColor.set('#1a1a2e');
  });

  describe('headerColor', () => {
    it('defaults to #1a1a2e', () => {
      expect(get(headerColor)).toBe('#1a1a2e');
    });
  });

  describe('initPreferences()', () => {
    it('reads stored color from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('#8b0000');
      initPreferences();
      expect(get(headerColor)).toBe('#8b0000');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('headerColor');
    });

    it('keeps default when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      initPreferences();
      expect(get(headerColor)).toBe('#1a1a2e');
    });
  });

  describe('setHeaderColor()', () => {
    it('updates the store value', () => {
      setHeaderColor('#8b0000');
      expect(get(headerColor)).toBe('#8b0000');
    });

    it('persists to localStorage', () => {
      setHeaderColor('#1a3a1a');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'headerColor',
        '#1a3a1a',
      );
    });
  });

  describe('HEADER_COLOR_PRESETS', () => {
    it('contains at least 5 presets', () => {
      expect(HEADER_COLOR_PRESETS.length).toBeGreaterThanOrEqual(5);
    });

    it('each preset has name and value', () => {
      for (const preset of HEADER_COLOR_PRESETS) {
        expect(preset.name).toBeTruthy();
        expect(preset.value).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('includes Midnight as first preset', () => {
      expect(HEADER_COLOR_PRESETS[0]).toEqual({
        name: 'Midnight',
        value: '#1a1a2e',
      });
    });
  });
});
