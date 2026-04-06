/**
 * Functional tests — full pipeline with realistic Foundry VTT data
 *
 * These tests exercise: fixture data → template engine → resolved layout
 * verifying that real D&D 5e and City of Mist actor data flows through
 * the template system correctly.
 */

import { describe, expect, it } from 'vitest';
import { PdfRenderer } from '$lib/export/pdf-renderer';
import {
  getTemplate,
  listTemplatesForSystem,
  TEMPLATE_A3,
  TEMPLATE_A4,
  TEMPLATE_A5,
  TEMPLATE_A6,
  TEMPLATE_POKER_CARD,
} from '$lib/templates/definitions';
import { resolve } from '$lib/templates/engine';
import '$lib/templates/systems';
import { TEMPLATE_A4_CITY_OF_MIST } from '$lib/templates/systems/city-of-mist';
import { TEMPLATE_A4_DND5E } from '$lib/templates/systems/dnd5e';
import { TEMPLATE_A4_LITM } from '$lib/templates/systems/litm';
import { CITY_OF_MIST_CHARACTER } from './citymist-character';
import { DND5E_FIGHTER } from './dnd5e-fighter';
import { hasText, resolveLayout } from './helpers';
import { LITM_CHARACTER } from './litm-character';

// ──────────────────────────────────────────────────────────────────────────────
// D&D 5e Fighter — Template Resolution
// ──────────────────────────────────────────────────────────────────────────────

describe('D&D 5e Fighter — A4 template', () => {
  const layout = resolve(TEMPLATE_A4, { actor: DND5E_FIGHTER });

  it('resolves without throwing', () => {
    expect(layout.elements.length).toBeGreaterThan(0);
  });

  it('resolves character name', () => {
    const nameEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Kael Ironforge',
    );
    expect(nameEl).toBeDefined();
  });

  it('resolves character type', () => {
    const typeEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'character',
    );
    expect(typeEl).toBeDefined();
  });

  it('resolves system info', () => {
    const sysEl = layout.elements.find(
      (e) => e.type === 'text' && e.content?.includes('dnd5e'),
    );
    expect(sysEl).toBeDefined();
    expect(sysEl?.content).toBe('dnd5e v3.2.1');
  });

  it('resolves STR ability score to 18', () => {
    const strEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === '18',
    );
    expect(strEl).toBeDefined();
  });

  it('resolves DEX ability score to 14', () => {
    const dexEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === '14',
    );
    expect(dexEl).toBeDefined();
  });

  it('resolves CON ability score to 16', () => {
    const conEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === '16',
    );
    expect(conEl).toBeDefined();
  });

  it('resolves HP display', () => {
    const hpEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === '44 / 44',
    );
    expect(hpEl).toBeDefined();
  });

  it('resolves AC to 18', () => {
    const acEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === '18',
    );
    expect(acEl).toBeDefined();
  });

  it('resolves walking speed', () => {
    const speedEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === '30 ft',
    );
    expect(speedEl).toBeDefined();
  });

  it('resolves level to 5', () => {
    const levelEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === '5',
    );
    expect(levelEl).toBeDefined();
  });

  it('resolves inventory items via repeat', () => {
    const itemElements = layout.elements.filter(
      (e) =>
        e.type === 'text' &&
        e.content !== undefined &&
        DND5E_FIGHTER.items.some(
          (item) => (item as Record<string, unknown>).name === e.content,
        ),
    );
    expect(itemElements.length).toBeGreaterThan(0);
  });

  it('resolves Battleaxe +1 in items', () => {
    const axeEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Battleaxe +1',
    );
    expect(axeEl).toBeDefined();
  });

  it('resolves Second Wind in items', () => {
    const swEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Second Wind',
    );
    expect(swEl).toBeDefined();
  });

  it('resolves image element with actor img data URL', () => {
    const imgEl = layout.elements.find(
      (e) =>
        e.type === 'image' && e.imageData?.startsWith('data:image/png;base64,'),
    );
    expect(imgEl).toBeDefined();
  });

  it('respects maxItems=20 in repeat', () => {
    const allItems = DND5E_FIGHTER.items;
    const itemNameElements = layout.elements.filter(
      (e) =>
        e.type === 'text' &&
        allItems.some(
          (item) => (item as Record<string, unknown>).name === e.content,
        ),
    );
    expect(itemNameElements.length).toBe(Math.min(allItems.length, 20));
  });

  it('contains ability labels from named styles', () => {
    const labelElements = layout.elements.filter(
      (e) =>
        e.type === 'text' &&
        ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].includes(e.content ?? ''),
    );
    expect(labelElements).toHaveLength(6);
  });

  it('applies label style from stat block', () => {
    const strLabel = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'STR',
    );
    expect(strLabel?.style.fontSize).toBe(6);
    expect(strLabel?.style.color).toBe('#999999');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// City of Mist — Template Resolution
// ──────────────────────────────────────────────────────────────────────────────

describe('City of Mist — A4 template', () => {
  const layout = resolve(TEMPLATE_A4, { actor: CITY_OF_MIST_CHARACTER });

  it('resolves without throwing', () => {
    expect(layout.elements.length).toBeGreaterThan(0);
  });

  it('resolves character name', () => {
    const nameEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Detective Marlowe',
    );
    expect(nameEl).toBeDefined();
  });

  it('resolves system info for city-of-mist', () => {
    const sysEl = layout.elements.find(
      (e) => e.type === 'text' && e.content?.includes('city-of-mist'),
    );
    expect(sysEl).toBeDefined();
  });

  it('ability scores resolve to empty for non-dnd5e system', () => {
    // City of Mist has no abilities.str, so binding resolves to empty
    const strValueElements = layout.elements.filter(
      (e) => e.type === 'text' && e.content === '' && e.style.fontSize === 11,
    );
    expect(strValueElements.length).toBeGreaterThan(0);
  });

  it('resolves embedded items (themes, tags, statuses) in repeat section', () => {
    // In real City of Mist, items[] contains themes, tags, statuses, clues
    // The generic A4 template repeats actor.items showing item.name
    const themeEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Eye of Odin',
    );
    expect(themeEl).toBeDefined();
  });

  it('resolves tag items in repeat section', () => {
    const tagEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Visions of the future',
    );
    expect(tagEl).toBeDefined();
  });

  it('repeat maxItems=20 truncates items beyond 20', () => {
    // City of Mist fixture has 24 items (themes+tags+statuses+clues)
    // Only first 20 appear in the generic A4 template
    const allItemNames = CITY_OF_MIST_CHARACTER.items.map(
      (i) => (i as Record<string, unknown>).name,
    );
    const renderedNames = layout.elements
      .filter((e) => e.type === 'text' && allItemNames.includes(e.content))
      .map((e) => e.content);
    expect(renderedNames.length).toBe(20);
  });
});

describe('City of Mist — fixture structure validation', () => {
  it('has themes as embedded items', () => {
    const themes = CITY_OF_MIST_CHARACTER.items.filter(
      (i) => (i as Record<string, unknown>).type === 'theme',
    );
    expect(themes).toHaveLength(4);
  });

  it('has power tags as embedded items', () => {
    const tags = CITY_OF_MIST_CHARACTER.items.filter(
      (i) =>
        (i as Record<string, unknown>).type === 'tag' &&
        (i as Record<string, Record<string, unknown>>).system?.subtype ===
          'power',
    );
    expect(tags.length).toBeGreaterThanOrEqual(8);
  });

  it('has weakness tags as embedded items', () => {
    const tags = CITY_OF_MIST_CHARACTER.items.filter(
      (i) =>
        (i as Record<string, unknown>).type === 'tag' &&
        (i as Record<string, Record<string, unknown>>).system?.subtype ===
          'weakness',
    );
    expect(tags.length).toBeGreaterThanOrEqual(4);
  });

  it('has statuses as embedded items', () => {
    const statuses = CITY_OF_MIST_CHARACTER.items.filter(
      (i) => (i as Record<string, unknown>).type === 'status',
    );
    expect(statuses).toHaveLength(2);
  });

  it('has clues as embedded items', () => {
    const clues = CITY_OF_MIST_CHARACTER.items.filter(
      (i) => (i as Record<string, unknown>).type === 'clue',
    );
    expect(clues).toHaveLength(2);
  });

  it('actor.system is sparse (no themes/tags/statuses)', () => {
    const sys = CITY_OF_MIST_CHARACTER.system as Record<string, unknown>;
    expect(sys.themes).toBeUndefined();
    expect(sys.storyTags).toBeUndefined();
    expect(sys.statuses).toBeUndefined();
  });

  it('actor.system has mythos/logos strings', () => {
    const sys = CITY_OF_MIST_CHARACTER.system as Record<string, unknown>;
    expect(sys.mythos).toBe('Odin, the All-Father');
    expect(sys.logos).toBe('Private Investigator');
  });

  it('has a burned tag (Wisdom of ages)', () => {
    const burnedTag = CITY_OF_MIST_CHARACTER.items.find(
      (i) =>
        (i as Record<string, unknown>).name === 'Wisdom of ages' &&
        (i as Record<string, Record<string, unknown>>).system?.burned === true,
    );
    expect(burnedTag).toBeDefined();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// D&D 5e — All template formats
// ──────────────────────────────────────────────────────────────────────────────

describe('D&D 5e Fighter — all template formats', () => {
  const templates = [
    { tmpl: TEMPLATE_A3, name: 'A3', w: 297, h: 420 },
    { tmpl: TEMPLATE_A4, name: 'A4', w: 210, h: 297 },
    { tmpl: TEMPLATE_A5, name: 'A5', w: 148, h: 210 },
    { tmpl: TEMPLATE_A6, name: 'A6', w: 105, h: 148 },
    { tmpl: TEMPLATE_POKER_CARD, name: 'Poker Card', w: 63, h: 88 },
  ];

  for (const { tmpl, name, w, h } of templates) {
    it(`resolves ${name} template without error`, () => {
      const layout = resolve(tmpl, { actor: DND5E_FIGHTER });
      expect(layout.width).toBe(w);
      expect(layout.height).toBe(h);
      expect(layout.elements.length).toBeGreaterThan(0);
    });

    it(`${name} template contains character name`, () => {
      const layout = resolve(tmpl, { actor: DND5E_FIGHTER });
      const nameEl = layout.elements.find(
        (e) => e.type === 'text' && e.content === 'Kael Ironforge',
      );
      expect(nameEl).toBeDefined();
    });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// Full pipeline: resolve → PDF generation
// ──────────────────────────────────────────────────────────────────────────────

describe('Full pipeline: D&D 5e Fighter → PDF', () => {
  it('generates valid PDF bytes from A4 template', async () => {
    const layout = resolveLayout('pdf-a4', DND5E_FIGHTER);
    const renderer = new PdfRenderer(layout);
    const bytes = await renderer.toBytes();

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(100);
    // PDF header
    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe('%PDF');
  });

  it('generates valid PDF bytes from A5 template', async () => {
    const layout = resolveLayout('pdf-a5', DND5E_FIGHTER);
    const renderer = new PdfRenderer(layout);
    const bytes = await renderer.toBytes();

    expect(bytes).toBeInstanceOf(Uint8Array);
    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe('%PDF');
  });

  it('PDF contains more bytes with real data than empty data', async () => {
    const emptyActor = {
      ...DND5E_FIGHTER,
      name: '',
      items: [],
      system: {},
    };
    const fullLayout = resolveLayout('pdf-a4', DND5E_FIGHTER);
    const emptyLayout = resolveLayout('pdf-a4', emptyActor);

    const fullRenderer = new PdfRenderer(fullLayout);
    const emptyRenderer = new PdfRenderer(emptyLayout);

    const fullBytes = await fullRenderer.toBytes();
    const emptyBytes = await emptyRenderer.toBytes();

    expect(fullBytes.length).toBeGreaterThan(emptyBytes.length);
  });
});

describe('Full pipeline: City of Mist → PDF', () => {
  it('generates valid PDF bytes from A4 template', async () => {
    const layout = resolveLayout('pdf-a4', CITY_OF_MIST_CHARACTER);
    const renderer = new PdfRenderer(layout);
    const bytes = await renderer.toBytes();

    expect(bytes).toBeInstanceOf(Uint8Array);
    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe('%PDF');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Edge cases: missing / malformed data
// ──────────────────────────────────────────────────────────────────────────────

describe('Pipeline edge cases', () => {
  it('handles actor with empty system data', () => {
    const actor = { ...DND5E_FIGHTER, system: {} };
    const layout = resolve(TEMPLATE_A4, { actor });
    expect(layout.elements.length).toBeGreaterThan(0);
    // Ability scores should be empty strings
    const emptyAbilities = layout.elements.filter(
      (e) => e.type === 'text' && e.content === '',
    );
    expect(emptyAbilities.length).toBeGreaterThan(0);
  });

  it('handles actor with empty items array', () => {
    const actor = { ...DND5E_FIGHTER, items: [] };
    const layout = resolve(TEMPLATE_A4, { actor });
    // Repeat generates 0 elements for empty array
    const itemEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Battleaxe +1',
    );
    expect(itemEl).toBeUndefined();
  });

  it('handles actor with very long name', () => {
    const actor = { ...DND5E_FIGHTER, name: 'A'.repeat(200) };
    const layout = resolve(TEMPLATE_A4, { actor });
    const nameEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'A'.repeat(200),
    );
    expect(nameEl).toBeDefined();
  });

  it('handles actor with special characters in name', () => {
    const actor = { ...DND5E_FIGHTER, name: 'Kael "Ironfist" Forge & Sons' };
    const layout = resolve(TEMPLATE_A4, { actor });
    const nameEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Kael "Ironfist" Forge & Sons',
    );
    expect(nameEl).toBeDefined();
  });

  it('generates PDF even with special characters', async () => {
    const actor = { ...DND5E_FIGHTER, name: 'Kael "Ironfist" Forge & Sons' };
    const layout = resolveLayout('pdf-a4', actor);
    const renderer = new PdfRenderer(layout);
    const bytes = await renderer.toBytes();
    expect(bytes.length).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// System-specific template registry + filtering
// ──────────────────────────────────────────────────────────────────────────────

describe('listTemplatesForSystem()', () => {
  it('returns dnd5e template + generics for dnd5e system', () => {
    const templates = listTemplatesForSystem('dnd5e');
    const ids = templates.map((t) => t.meta.id);
    expect(ids).toContain('pdf-a4-dnd5e');
    expect(ids).toContain('pdf-a4'); // generic
    expect(ids).not.toContain('pdf-a4-city-of-mist');
  });

  it('returns city-of-mist template + generics for city-of-mist system', () => {
    const templates = listTemplatesForSystem('city-of-mist');
    const ids = templates.map((t) => t.meta.id);
    expect(ids).toContain('pdf-a4-city-of-mist');
    expect(ids).toContain('pdf-a4'); // generic
    expect(ids).not.toContain('pdf-a4-dnd5e');
  });

  it('returns only generics for unknown system', () => {
    const templates = listTemplatesForSystem('fate-core');
    const ids = templates.map((t) => t.meta.id);
    expect(ids).toContain('pdf-a4');
    expect(ids).not.toContain('pdf-a4-dnd5e');
    expect(ids).not.toContain('pdf-a4-city-of-mist');
  });
});

describe('getTemplate() finds system templates', () => {
  it('resolves dnd5e template by ID', () => {
    expect(getTemplate('pdf-a4-dnd5e')).toBe(TEMPLATE_A4_DND5E);
  });

  it('resolves city-of-mist template by ID', () => {
    expect(getTemplate('pdf-a4-city-of-mist')).toBe(TEMPLATE_A4_CITY_OF_MIST);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// D&D 5e dedicated template — full resolution
// ──────────────────────────────────────────────────────────────────────────────

describe('D&D 5e dedicated template — A4', () => {
  const layout = resolve(TEMPLATE_A4_DND5E, { actor: DND5E_FIGHTER });

  it('resolves without error', () => {
    expect(layout.elements.length).toBeGreaterThan(0);
  });

  it('has systemId set to dnd5e', () => {
    expect(TEMPLATE_A4_DND5E.meta.systemId).toBe('dnd5e');
  });

  it('resolves character name', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Kael Ironforge',
    );
    expect(el).toBeDefined();
  });

  it('resolves race', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Mountain Dwarf',
    );
    expect(el).toBeDefined();
  });

  it('resolves alignment', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Lawful Good',
    );
    expect(el).toBeDefined();
  });

  it('resolves level display', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Level 5',
    );
    expect(el).toBeDefined();
  });

  it('resolves all 6 ability scores', () => {
    const scores = ['18', '14', '16', '10', '12', '8'];
    for (const score of scores) {
      const el = layout.elements.find(
        (e) => e.type === 'text' && e.content === score,
      );
      expect(el, `ability score ${score} not found`).toBeDefined();
    }
  });

  it('resolves HP', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === '44 / 44',
    );
    expect(el).toBeDefined();
  });

  it('resolves AC', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === '18',
    );
    expect(el).toBeDefined();
  });

  it('resolves proficiency bonus', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === '+3',
    );
    expect(el).toBeDefined();
  });

  it('resolves currency', () => {
    const gp = layout.elements.find(
      (e) => e.type === 'text' && e.content === '45',
    );
    expect(gp).toBeDefined();
  });

  it('resolves inventory items', () => {
    const axe = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Battleaxe +1',
    );
    expect(axe).toBeDefined();
  });

  it('generates valid PDF', async () => {
    const renderer = new PdfRenderer(layout);
    const bytes = await renderer.toBytes();
    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe('%PDF');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// City of Mist dedicated template — full resolution
// ──────────────────────────────────────────────────────────────────────────────

describe('City of Mist dedicated template — A4', () => {
  const layout = resolve(TEMPLATE_A4_CITY_OF_MIST, {
    actor: CITY_OF_MIST_CHARACTER,
  });

  it('resolves without error', () => {
    expect(layout.elements.length).toBeGreaterThan(0);
  });

  it('has systemId set to city-of-mist', () => {
    expect(TEMPLATE_A4_CITY_OF_MIST.meta.systemId).toBe('city-of-mist');
  });

  it('resolves character name', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Detective Marlowe',
    );
    expect(el).toBeDefined();
  });

  it('resolves mythos identity', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Odin, the All-Father',
    );
    expect(el).toBeDefined();
  });

  it('resolves logos identity', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Private Investigator',
    );
    expect(el).toBeDefined();
  });

  it('resolves themes via filter (items with mystery)', () => {
    const theme = layout.elements.find(
      (e) => e.type === 'text' && e.content?.includes('Eye of Odin'),
    );
    expect(theme).toBeDefined();
  });

  it('resolves tags via filter (items with subtype)', () => {
    const tag = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Visions of the future',
    );
    expect(tag).toBeDefined();
  });

  it('resolves statuses via filter (items with tier)', () => {
    const status = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Tired-2',
    );
    expect(status).toBeDefined();
  });

  it('resolves clues via filter (items with source)', () => {
    const clue = layout.elements.find(
      (e) =>
        e.type === 'text' && e.content === 'The warehouse fire was no accident',
    );
    expect(clue).toBeDefined();
  });

  it('resolves description', () => {
    const el = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'He sees more than he lets on.',
    );
    expect(el).toBeDefined();
  });

  it('generates valid PDF', async () => {
    const renderer = new PdfRenderer(layout);
    const bytes = await renderer.toBytes();
    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe('%PDF');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Legend in the Mist — registry + template resolution
// ──────────────────────────────────────────────────────────────────────────────

describe('getTemplate() finds LitM template', () => {
  it('resolves litm template by ID', () => {
    expect(getTemplate('pdf-a4-litm')).toBe(TEMPLATE_A4_LITM);
  });
});

describe('listTemplatesForSystem() includes LitM', () => {
  it('returns litm template for mist-engine-fvtt', () => {
    const ids = listTemplatesForSystem('mist-engine-fvtt').map(
      (t) => t.meta.id,
    );
    expect(ids).toContain('pdf-a4-litm');
    expect(ids).not.toContain('pdf-a4-dnd5e');
    expect(ids).not.toContain('pdf-a4-city-of-mist');
  });
});

describe('Legend in the Mist dedicated template — A4', () => {
  const layout = resolve(TEMPLATE_A4_LITM, { actor: LITM_CHARACTER });

  it('resolves without error', () => {
    expect(layout.elements.length).toBeGreaterThan(0);
    expect(TEMPLATE_A4_LITM.meta.systemId).toBe('mist-engine-fvtt');
  });

  it('resolves character name and subtitle', () => {
    expect(hasText(layout, 'Sienna Blackwood')).toBe(true);
    expect(hasText(layout, 'Mythic street artist')).toBe(true);
  });

  it('resolves themebooks via filter', () => {
    expect(hasText(layout, 'The Painted Door')).toBe(true);
    expect(hasText(layout, 'Street Art Life')).toBe(true);
  });

  it('resolves floating tags and statuses', () => {
    expect(hasText(layout, 'Portal Sight')).toBe(true);
    expect(hasText(layout, 'Disoriented')).toBe(true);
  });

  it('resolves fellowships', () => {
    expect(hasText(layout, 'Marco the Forger')).toBe(true);
    expect(hasText(layout, 'Detective Lin')).toBe(true);
  });

  it('generates valid PDF', async () => {
    const renderer = new PdfRenderer(layout);
    const bytes = await renderer.toBytes();
    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe('%PDF');
  });
});
