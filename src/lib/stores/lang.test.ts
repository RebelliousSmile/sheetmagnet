import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lang } from './lang';

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

describe('lang store', () => {
  beforeEach(() => {
    // Reset to 'en'
    if (get(lang) !== 'en') {
      lang.toggle();
    }
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('defaults to "en"', () => {
    expect(get(lang)).toBe('en');
  });

  it('toggles from "en" to "fr"', () => {
    lang.toggle();
    expect(get(lang)).toBe('fr');
  });

  it('toggles from "fr" back to "en"', () => {
    lang.toggle(); // en -> fr
    lang.toggle(); // fr -> en
    expect(get(lang)).toBe('en');
  });

  it('toggle writes to localStorage', () => {
    lang.toggle();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('lang', 'fr');
  });

  describe('init()', () => {
    it('reads stored "fr" from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('fr');
      lang.init();
      expect(get(lang)).toBe('fr');
    });

    it('reads stored "en" from localStorage', () => {
      lang.toggle(); // set to fr
      localStorageMock.getItem.mockReturnValueOnce('en');
      lang.init();
      expect(get(lang)).toBe('en');
    });

    it('ignores invalid localStorage value', () => {
      localStorageMock.getItem.mockReturnValueOnce('de');
      lang.init();
      expect(get(lang)).toBe('en');
    });

    it('ignores null localStorage value', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      lang.init();
      expect(get(lang)).toBe('en');
    });
  });
});
