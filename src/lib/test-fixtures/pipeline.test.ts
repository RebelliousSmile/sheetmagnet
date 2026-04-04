/**
 * Functional tests — full pipeline with realistic Foundry VTT data
 *
 * These tests exercise: fixture data → template engine → resolved layout
 * verifying that real D&D 5e and City of Mist actor data flows through
 * the template system correctly.
 */

import { describe, expect, it } from 'vitest';
import type { ActorData } from '$lib/connectors/foundry';
import { PdfRenderer } from '$lib/export/pdf-renderer';
import {
  getTemplate,
  TEMPLATE_A3,
  TEMPLATE_A4,
  TEMPLATE_A5,
  TEMPLATE_A6,
  TEMPLATE_POKER_CARD,
} from '$lib/templates/definitions';
import { resolve } from '$lib/templates/engine';
import { CITY_OF_MIST_CHARACTER } from './citymist-character';
import { DND5E_FIGHTER } from './dnd5e-fighter';

/** Resolve template by ID — avoids importing export/index (which pulls Konva) */
function resolveLayout(templateId: string, actor: ActorData) {
  const template = getTemplate(templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);
  return resolve(template, { actor });
}

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

  it('applies named label style (fontSize 8)', () => {
    const strLabel = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'STR',
    );
    expect(strLabel?.style.fontSize).toBe(8);
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
      (e) => e.type === 'text' && e.content === '' && e.style.fontSize === 12,
    );
    expect(strValueElements.length).toBeGreaterThan(0);
  });

  it('resolves items (moves) in repeat section', () => {
    const investigateEl = layout.elements.find(
      (e) => e.type === 'text' && e.content === 'Investigate',
    );
    expect(investigateEl).toBeDefined();
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
