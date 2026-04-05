/**
 * E2E PDF tests — generate real PDFs, verify structure and resolved content.
 *
 * Pipeline tested:
 *   fixture data → resolve → verify resolved text → PdfRenderer → valid PDF bytes
 *
 * We verify content at the ResolvedLayout level (text is accessible there)
 * and structural validity at the PDF level (header, page count, byte size).
 */

import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import type { ActorData } from '$lib/connectors/foundry';
import { PdfRenderer } from '$lib/export/pdf-renderer';
import { getTemplate } from '$lib/templates/definitions';
import { resolve } from '$lib/templates/engine';
import type { ResolvedLayout } from '$lib/templates/types';
import '$lib/templates/systems';
import { CITY_OF_MIST_CHARACTER } from './citymist-character';
import { DND5E_FIGHTER } from './dnd5e-fighter';

/** Resolve template and return layout + generate PDF bytes */
async function e2e(
  actor: ActorData,
  templateId: string,
): Promise<{ layout: ResolvedLayout; bytes: Uint8Array }> {
  const template = getTemplate(templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);
  const layout = resolve(template, { actor });
  const renderer = new PdfRenderer(layout);
  const bytes = await renderer.toBytes();
  return { layout, bytes };
}

/** Get all text content from resolved layout */
function allTexts(layout: ResolvedLayout): string[] {
  return layout.elements
    .filter((e) => e.type === 'text' && e.content)
    .map((e) => e.content as string);
}

/** Check layout contains a text matching a substring */
function hasText(layout: ResolvedLayout, substring: string): boolean {
  return allTexts(layout).some((t) => t.includes(substring));
}

/** Check layout does NOT contain any text matching a substring */
function lacksText(layout: ResolvedLayout, text: string): boolean {
  return !allTexts(layout).some((t) => t === text);
}

// ──────────────────────────────────────────────────────────────────────────────
// D&D 5e — dedicated template E2E
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: D&D 5e Fighter — dedicated template', () => {
  let layout: ResolvedLayout;
  let bytes: Uint8Array;

  it('generates a valid PDF', async () => {
    const result = await e2e(DND5E_FIGHTER, 'pdf-a4-dnd5e');
    layout = result.layout;
    bytes = result.bytes;

    // Valid PDF header
    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe('%PDF');
    // Structural validity
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it('contains character identity', () => {
    expect(hasText(layout, 'Kael Ironforge')).toBe(true);
    expect(hasText(layout, 'Mountain Dwarf')).toBe(true);
    expect(hasText(layout, 'Lawful Good')).toBe(true);
    expect(hasText(layout, 'Level 5')).toBe(true);
  });

  it('contains all 6 ability scores', () => {
    const texts = allTexts(layout);
    // Labels
    for (const label of ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']) {
      expect(texts).toContain(label);
    }
    // Values
    for (const val of ['18', '14', '16', '10', '12', '8']) {
      expect(texts).toContain(val);
    }
  });

  it('contains combat stats', () => {
    expect(hasText(layout, '44 / 44')).toBe(true); // HP
    expect(hasText(layout, '30 ft')).toBe(true); // Speed
    expect(hasText(layout, '+3')).toBe(true); // Proficiency
  });

  it('does NOT show "false" for inspiration', () => {
    expect(lacksText(layout, 'false')).toBe(true);
  });

  it('contains details and currency', () => {
    expect(hasText(layout, 'Soldier')).toBe(true); // Background
    expect(hasText(layout, '6500')).toBe(true); // XP
    expect(hasText(layout, '45')).toBe(true); // GP
  });

  it('contains all inventory items', () => {
    expect(hasText(layout, 'Battleaxe +1')).toBe(true);
    expect(hasText(layout, 'Chain Mail')).toBe(true);
    expect(hasText(layout, 'Second Wind')).toBe(true);
    expect(hasText(layout, 'Action Surge')).toBe(true);
    expect(hasText(layout, 'Extra Attack')).toBe(true);
    expect(hasText(layout, 'Great Weapon Master')).toBe(true);
  });

  it('contains all section headers', () => {
    expect(hasText(layout, 'ABILITY SCORES')).toBe(true);
    expect(hasText(layout, 'COMBAT')).toBe(true);
    expect(hasText(layout, 'DETAILS')).toBe(true);
    expect(hasText(layout, 'INVENTORY & FEATURES')).toBe(true);
  });

  it('contains footer', () => {
    expect(hasText(layout, 'Sheet Magnet')).toBe(true);
  });

  it('PDF is larger than a minimal empty PDF', async () => {
    const emptyActor = {
      ...DND5E_FIGHTER,
      name: '',
      items: [],
      system: {},
    };
    const emptyResult = await e2e(emptyActor, 'pdf-a4-dnd5e');
    expect(bytes.length).toBeGreaterThan(emptyResult.bytes.length);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// City of Mist — dedicated template E2E
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: City of Mist Detective — dedicated template', () => {
  let layout: ResolvedLayout;
  let bytes: Uint8Array;

  it('generates a valid PDF', async () => {
    const result = await e2e(CITY_OF_MIST_CHARACTER, 'pdf-a4-city-of-mist');
    layout = result.layout;
    bytes = result.bytes;

    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe('%PDF');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it('contains character identity', () => {
    expect(hasText(layout, 'Detective Marlowe')).toBe(true);
    expect(hasText(layout, 'Odin, the All-Father')).toBe(true);
    expect(hasText(layout, 'Private Investigator')).toBe(true);
    expect(hasText(layout, 'City of Mist')).toBe(true);
  });

  it('contains themes with mysteries', () => {
    expect(hasText(layout, 'Eye of Odin')).toBe(true);
    expect(hasText(layout, 'threads of fate')).toBe(true);
    expect(hasText(layout, 'The Ravens')).toBe(true);
    expect(hasText(layout, 'Gumshoe for Hire')).toBe(true);
    expect(hasText(layout, 'The Old Neighborhood')).toBe(true);
  });

  it('contains power tags (only, not themes)', () => {
    const texts = allTexts(layout);
    expect(texts).toContain('Visions of the future');
    expect(texts).toContain('Read the runes');
    expect(texts).toContain('Huginn scouts ahead');
    expect(texts).toContain('Read people like a book');
    expect(texts).toContain('Office above the diner');
  });

  it('contains weakness tags in separate section', () => {
    const texts = allTexts(layout);
    expect(texts).toContain('Blind in one eye');
    expect(texts).toContain('Conspicuous birds');
    expect(texts).toContain("Can't let a case go");
    expect(texts).toContain('Behind on rent');
  });

  it('power tags section does not include theme names as standalone', () => {
    // Get texts that appear between POWER TAGS and WEAKNESS TAGS sections
    const texts = allTexts(layout);
    const ptIdx = texts.indexOf('POWER TAGS');
    const wtIdx = texts.indexOf('WEAKNESS TAGS');
    expect(ptIdx).toBeGreaterThan(-1);
    expect(wtIdx).toBeGreaterThan(ptIdx);
    const powerTexts = texts.slice(ptIdx + 1, wtIdx);
    // Theme names should NOT appear as standalone items in power tags
    expect(powerTexts).not.toContain('Eye of Odin');
    expect(powerTexts).not.toContain('The Ravens');
    expect(powerTexts).not.toContain('Gumshoe for Hire');
    expect(powerTexts).not.toContain('The Old Neighborhood');
  });

  it('contains statuses', () => {
    expect(hasText(layout, 'Tired-2')).toBe(true);
    expect(hasText(layout, 'Suspicious-1')).toBe(true);
  });

  it('contains clues', () => {
    expect(hasText(layout, 'warehouse fire')).toBe(true);
    expect(hasText(layout, 'precinct')).toBe(true);
  });

  it('contains description', () => {
    expect(hasText(layout, 'He sees more than he lets on.')).toBe(true);
  });

  it('contains all section headers', () => {
    const texts = allTexts(layout);
    expect(texts).toContain('THEMES');
    expect(texts).toContain('POWER TAGS');
    expect(texts).toContain('WEAKNESS TAGS');
    expect(texts).toContain('STATUSES');
    expect(texts).toContain('CLUES');
    expect(texts).toContain('DESCRIPTION');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Generic template E2E — both systems
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: generic A4 template — cross-system', () => {
  it('works with D&D 5e data', async () => {
    const { layout, bytes } = await e2e(DND5E_FIGHTER, 'pdf-a4');
    expect(bytes.length).toBeGreaterThan(500);
    expect(hasText(layout, 'Kael Ironforge')).toBe(true);
    expect(hasText(layout, 'Battleaxe +1')).toBe(true);
    expect(hasText(layout, 'INVENTORY')).toBe(true);
  });

  it('works with City of Mist data', async () => {
    const { layout, bytes } = await e2e(CITY_OF_MIST_CHARACTER, 'pdf-a4');
    expect(bytes.length).toBeGreaterThan(500);
    expect(hasText(layout, 'Detective Marlowe')).toBe(true);
    // Generic template shows all items without filter
    expect(hasText(layout, 'Eye of Odin')).toBe(true);
  });

  it('produces different PDFs for different actors', async () => {
    const dnd = await e2e(DND5E_FIGHTER, 'pdf-a4');
    const com = await e2e(CITY_OF_MIST_CHARACTER, 'pdf-a4');
    expect(dnd.bytes.length).not.toBe(com.bytes.length);
  });
});
