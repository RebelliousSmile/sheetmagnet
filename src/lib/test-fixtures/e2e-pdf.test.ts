/**
 * E2E PDF tests — generate real PDFs, verify structure and resolved content.
 * Uses shared helpers from helpers.ts.
 */

import { describe, expect, it } from 'vitest';
import '$lib/templates/systems';
import { CITY_OF_MIST_CHARACTER } from './citymist-character';
import { CYPHER_CHARACTER } from './cypher-character';
import { DND5E_FIGHTER } from './dnd5e-fighter';
import {
  allTexts,
  generatePdf,
  hasText,
  lacksText,
  textsBetweenSections,
  validatePdf,
} from './helpers';
import { LITM_CHARACTER } from './litm-character';
import { PBTA_AW_CHARACTER } from './pbta-aw-character';
import { PBTA_MOTW_CHARACTER } from './pbta-motw-character';

// ──────────────────────────────────────────────────────────────────────────────
// D&D 5e E2E
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: D&D 5e Fighter — dedicated template', () => {
  it('generates a valid PDF with correct content', async () => {
    const { layout, bytes } = await generatePdf(DND5E_FIGHTER, 'pdf-a4-dnd5e');
    await validatePdf(bytes);

    // Identity
    expect(hasText(layout, 'Kael Ironforge')).toBe(true);
    expect(hasText(layout, 'Mountain Dwarf')).toBe(true);
    expect(hasText(layout, 'Lawful Good')).toBe(true);
    expect(hasText(layout, 'Level 5')).toBe(true);

    // Abilities
    const texts = allTexts(layout);
    for (const label of ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']) {
      expect(texts).toContain(label);
    }
    for (const val of ['18', '14', '16', '10', '12', '8']) {
      expect(texts).toContain(val);
    }

    // Combat
    expect(hasText(layout, '44 / 44')).toBe(true);
    expect(hasText(layout, '30 ft')).toBe(true);
    expect(hasText(layout, '+3')).toBe(true);

    // No raw boolean
    expect(lacksText(layout, 'false')).toBe(true);

    // Details + currency
    expect(hasText(layout, 'Soldier')).toBe(true);
    expect(hasText(layout, '6500')).toBe(true);
    expect(hasText(layout, '45')).toBe(true);

    // Inventory
    expect(hasText(layout, 'Battleaxe +1')).toBe(true);
    expect(hasText(layout, 'Chain Mail')).toBe(true);
    expect(hasText(layout, 'Second Wind')).toBe(true);
    expect(hasText(layout, 'Great Weapon Master')).toBe(true);

    // Sections + footer
    expect(hasText(layout, 'ABILITY SCORES')).toBe(true);
    expect(hasText(layout, 'COMBAT')).toBe(true);
    expect(hasText(layout, 'INVENTORY & FEATURES')).toBe(true);
    expect(hasText(layout, 'Sheet Magnet')).toBe(true);
  });

  it('PDF with real data is larger than empty actor', async () => {
    const full = await generatePdf(DND5E_FIGHTER, 'pdf-a4-dnd5e');
    const empty = await generatePdf(
      { ...DND5E_FIGHTER, name: '', items: [], system: {} },
      'pdf-a4-dnd5e',
    );
    expect(full.bytes.length).toBeGreaterThan(empty.bytes.length);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// City of Mist E2E
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: City of Mist — dedicated template', () => {
  it('generates valid PDF with correct content', async () => {
    const { layout, bytes } = await generatePdf(
      CITY_OF_MIST_CHARACTER,
      'pdf-a4-city-of-mist',
    );
    await validatePdf(bytes);

    // Identity
    expect(hasText(layout, 'Detective Marlowe')).toBe(true);
    expect(hasText(layout, 'Odin, the All-Father')).toBe(true);
    expect(hasText(layout, 'Private Investigator')).toBe(true);
    expect(hasText(layout, 'City of Mist')).toBe(true);

    // Themes
    expect(hasText(layout, 'Eye of Odin')).toBe(true);
    expect(hasText(layout, 'threads of fate')).toBe(true);
    expect(hasText(layout, 'Gumshoe for Hire')).toBe(true);

    // Tags
    const texts = allTexts(layout);
    expect(texts).toContain('Visions of the future');
    expect(texts).toContain('Blind in one eye');
    expect(texts).toContain("Can't let a case go");

    // Statuses + clues
    expect(hasText(layout, 'Tired-2')).toBe(true);
    expect(hasText(layout, 'warehouse fire')).toBe(true);

    // Description
    expect(hasText(layout, 'He sees more than he lets on.')).toBe(true);
  });

  it('power tags section excludes theme names', async () => {
    const { layout } = await generatePdf(
      CITY_OF_MIST_CHARACTER,
      'pdf-a4-city-of-mist',
    );
    const powerTexts = textsBetweenSections(
      layout,
      'POWER TAGS',
      'WEAKNESS TAGS',
    );
    expect(powerTexts).not.toContain('Eye of Odin');
    expect(powerTexts).not.toContain('The Ravens');
    expect(powerTexts).not.toContain('Gumshoe for Hire');
  });

  it('all section headers present', async () => {
    const { layout } = await generatePdf(
      CITY_OF_MIST_CHARACTER,
      'pdf-a4-city-of-mist',
    );
    const texts = allTexts(layout);
    for (const s of [
      'THEMES',
      'POWER TAGS',
      'WEAKNESS TAGS',
      'STATUSES',
      'CLUES',
      'DESCRIPTION',
    ]) {
      expect(texts).toContain(s);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Legend in the Mist E2E
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: Legend in the Mist — dedicated template', () => {
  it('generates valid PDF with correct content', async () => {
    const { layout, bytes } = await generatePdf(LITM_CHARACTER, 'pdf-a4-litm');
    await validatePdf(bytes);

    expect(hasText(layout, 'Sienna Blackwood')).toBe(true);
    expect(hasText(layout, 'Mythic street artist')).toBe(true);
    expect(hasText(layout, 'Legend in the Mist')).toBe(true);
    expect(hasText(layout, '2')).toBe(true); // promises
  });

  it('contains themebook names with quests', async () => {
    const { layout } = await generatePdf(LITM_CHARACTER, 'pdf-a4-litm');
    expect(hasText(layout, 'The Painted Door')).toBe(true);
    expect(hasText(layout, 'lost murals')).toBe(true);
    expect(hasText(layout, 'Street Art Life')).toBe(true);
  });

  it('contains floating tags and statuses', async () => {
    const { layout } = await generatePdf(LITM_CHARACTER, 'pdf-a4-litm');
    const texts = allTexts(layout);
    expect(texts).toContain('Portal Sight');
    expect(texts).toContain('Street Smart');
    expect(texts).toContain('Disoriented');
    expect(texts).toContain('Inspired');
  });

  it('contains fellowships', async () => {
    const { layout } = await generatePdf(LITM_CHARACTER, 'pdf-a4-litm');
    expect(hasText(layout, 'Marco the Forger')).toBe(true);
    expect(hasText(layout, 'Trusted fence')).toBe(true);
    expect(hasText(layout, 'Detective Lin')).toBe(true);
  });

  it('contains biography', async () => {
    const { layout } = await generatePdf(LITM_CHARACTER, 'pdf-a4-litm');
    expect(hasText(layout, 'street artist')).toBe(true);
  });

  it('all section headers present', async () => {
    const { layout } = await generatePdf(LITM_CHARACTER, 'pdf-a4-litm');
    const texts = allTexts(layout);
    for (const s of ['THEMES', 'TAGS & STATUSES', 'FELLOWSHIPS', 'BIOGRAPHY']) {
      expect(texts).toContain(s);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Generic template — all 3 systems
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: generic A4 — cross-system', () => {
  it('works with D&D 5e', async () => {
    const { layout, bytes } = await generatePdf(DND5E_FIGHTER, 'pdf-a4');
    expect(bytes.length).toBeGreaterThan(500);
    expect(hasText(layout, 'Kael Ironforge')).toBe(true);
  });

  it('works with City of Mist', async () => {
    const { layout, bytes } = await generatePdf(
      CITY_OF_MIST_CHARACTER,
      'pdf-a4',
    );
    expect(bytes.length).toBeGreaterThan(500);
    expect(hasText(layout, 'Detective Marlowe')).toBe(true);
  });

  it('works with Legend in the Mist', async () => {
    const { layout, bytes } = await generatePdf(LITM_CHARACTER, 'pdf-a4');
    expect(bytes.length).toBeGreaterThan(500);
    expect(hasText(layout, 'Sienna Blackwood')).toBe(true);
  });

  it('produces different PDFs for each system', async () => {
    const dnd = await generatePdf(DND5E_FIGHTER, 'pdf-a4');
    const com = await generatePdf(CITY_OF_MIST_CHARACTER, 'pdf-a4');
    const litm = await generatePdf(LITM_CHARACTER, 'pdf-a4');
    const sizes = new Set([
      dnd.bytes.length,
      com.bytes.length,
      litm.bytes.length,
    ]);
    expect(sizes.size).toBe(3);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// System filtering — all 3
// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// PbtA: Apocalypse World E2E
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: Apocalypse World (PbtA) — dedicated template', () => {
  it('generates valid PDF with character content', async () => {
    const { layout, bytes } = await generatePdf(
      PBTA_AW_CHARACTER,
      'pdf-a4-pbta',
    );
    await validatePdf(bytes);

    expect(hasText(layout, 'Cass')).toBe(true);
    expect(hasText(layout, 'Powered by the Apocalypse')).toBe(true);
  });

  it('resolves stats via object iteration', async () => {
    const { layout } = await generatePdf(PBTA_AW_CHARACTER, 'pdf-a4-pbta');
    const texts = allTexts(layout);
    // Stat keys become item.key
    expect(texts).toContain('cool');
    expect(texts).toContain('hard');
    expect(texts).toContain('hot');
    expect(texts).toContain('sharp');
    expect(texts).toContain('weird');
    // Stat values
    expect(texts).toContain('3'); // cool
    expect(texts).toContain('-1'); // weird
  });

  it('resolves playbook moves', async () => {
    const { layout } = await generatePdf(PBTA_AW_CHARACTER, 'pdf-a4-pbta');
    expect(hasText(layout, 'Dangerous & Sexy')).toBe(true);
    expect(hasText(layout, 'Ice Cold')).toBe(true);
  });

  it('resolves basic moves', async () => {
    const { layout } = await generatePdf(PBTA_AW_CHARACTER, 'pdf-a4-pbta');
    expect(hasText(layout, 'Act Under Fire')).toBe(true);
    expect(hasText(layout, 'Go Aggro')).toBe(true);
    expect(hasText(layout, 'Open Your Brain')).toBe(true);
  });

  it('resolves harm and experience', async () => {
    const { layout } = await generatePdf(PBTA_AW_CHARACTER, 'pdf-a4-pbta');
    expect(hasText(layout, '1 / 6')).toBe(true); // harm
    expect(hasText(layout, '3 / 5')).toBe(true); // xp
  });

  it('has all section headers', async () => {
    const { layout } = await generatePdf(PBTA_AW_CHARACTER, 'pdf-a4-pbta');
    const texts = allTexts(layout);
    for (const s of [
      'STATS',
      'RESOURCES',
      'DETAILS',
      'PLAYBOOK MOVES',
      'BASIC MOVES',
    ]) {
      expect(texts).toContain(s);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// PbtA: Monster of the Week E2E
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: Monster of the Week (PbtA) — dedicated template', () => {
  it('generates valid PDF with character content', async () => {
    const { layout, bytes } = await generatePdf(
      PBTA_MOTW_CHARACTER,
      'pdf-a4-pbta',
    );
    await validatePdf(bytes);

    expect(hasText(layout, 'Elena Torres')).toBe(true);
  });

  it('resolves MotW stats (different from AW)', async () => {
    const { layout } = await generatePdf(PBTA_MOTW_CHARACTER, 'pdf-a4-pbta');
    const texts = allTexts(layout);
    // MotW has 'charm' and 'tough' instead of AW's 'hard' and 'hot'
    expect(texts).toContain('charm');
    expect(texts).toContain('tough');
    expect(texts).toContain('cool');
    expect(texts).toContain('sharp');
    expect(texts).toContain('weird');
  });

  it('resolves MotW playbook moves', async () => {
    const { layout } = await generatePdf(PBTA_MOTW_CHARACTER, 'pdf-a4-pbta');
    expect(hasText(layout, 'The Chosen One')).toBe(true);
    expect(hasText(layout, 'Devastating')).toBe(true);
  });

  it('resolves MotW basic moves', async () => {
    const { layout } = await generatePdf(PBTA_MOTW_CHARACTER, 'pdf-a4-pbta');
    expect(hasText(layout, 'Kick Some Ass')).toBe(true);
    expect(hasText(layout, 'Investigate a Mystery')).toBe(true);
    expect(hasText(layout, 'Use Magic')).toBe(true);
  });

  it('same template handles both AW and MotW correctly', async () => {
    const aw = await generatePdf(PBTA_AW_CHARACTER, 'pdf-a4-pbta');
    const motw = await generatePdf(PBTA_MOTW_CHARACTER, 'pdf-a4-pbta');
    // Different content = different sizes
    expect(aw.bytes.length).not.toBe(motw.bytes.length);
    // AW has 'hard', MotW doesn't
    expect(hasText(aw.layout, 'hard')).toBe(true);
    expect(hasText(motw.layout, 'hard')).toBe(false);
    // MotW has 'charm', AW doesn't
    expect(hasText(motw.layout, 'charm')).toBe(true);
    expect(hasText(aw.layout, 'charm')).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Cypher System E2E
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: Cypher System — dedicated template', () => {
  it('generates valid PDF with character content', async () => {
    const { layout, bytes } = await generatePdf(
      CYPHER_CHARACTER,
      'pdf-a4-cypher',
    );
    await validatePdf(bytes);

    expect(hasText(layout, 'Kira Voss')).toBe(true);
    expect(hasText(layout, 'Cypher System')).toBe(true);
    expect(hasText(layout, 'Stealthy')).toBe(true);
    expect(hasText(layout, 'Nano')).toBe(true);
  });

  it('contains all 3 pools', async () => {
    const { layout } = await generatePdf(CYPHER_CHARACTER, 'pdf-a4-cypher');
    expect(hasText(layout, '14 / 16')).toBe(true); // might
    expect(hasText(layout, '12 / 14')).toBe(true); // speed
    expect(hasText(layout, '16 / 18')).toBe(true); // intellect
  });

  it('contains edge values', async () => {
    const { layout } = await generatePdf(CYPHER_CHARACTER, 'pdf-a4-cypher');
    const texts = allTexts(layout);
    expect(texts).toContain('1'); // might/speed edge
    expect(texts).toContain('2'); // intellect edge
  });

  it('contains tier and effort', async () => {
    const { layout } = await generatePdf(CYPHER_CHARACTER, 'pdf-a4-cypher');
    expect(hasText(layout, '3')).toBe(true); // tier & effort
  });

  it('contains skills', async () => {
    const { layout } = await generatePdf(CYPHER_CHARACTER, 'pdf-a4-cypher');
    expect(hasText(layout, 'Numenera Lore')).toBe(true);
    expect(hasText(layout, 'Stealth')).toBe(true);
    expect(hasText(layout, 'Perception')).toBe(true);
  });

  it('contains abilities', async () => {
    const { layout } = await generatePdf(CYPHER_CHARACTER, 'pdf-a4-cypher');
    expect(hasText(layout, 'Onslaught')).toBe(true);
    expect(hasText(layout, 'Ward')).toBe(true);
  });

  it('contains description', async () => {
    const { layout } = await generatePdf(CYPHER_CHARACTER, 'pdf-a4-cypher');
    expect(hasText(layout, 'Stealthy Nano')).toBe(true);
  });

  it('has section headers', async () => {
    const { layout } = await generatePdf(CYPHER_CHARACTER, 'pdf-a4-cypher');
    const texts = allTexts(layout);
    expect(texts).toContain('POOLS');
    expect(texts).toContain('SKILLS');
    expect(texts).toContain('CYPHERS');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// System filtering — all systems
// ──────────────────────────────────────────────────────────────────────────────

describe('E2E: template filtering for all systems', () => {
  it('LitM gets only litm + generics', async () => {
    const { listTemplatesForSystem } = await import(
      '$lib/templates/definitions'
    );
    const ids = listTemplatesForSystem('mist-engine-fvtt').map(
      (t) => t.meta.id,
    );
    expect(ids).toContain('pdf-a4-litm');
    expect(ids).toContain('pdf-a4');
    expect(ids).not.toContain('pdf-a4-dnd5e');
  });

  it('PbtA gets only pbta + generics', async () => {
    const { listTemplatesForSystem } = await import(
      '$lib/templates/definitions'
    );
    const ids = listTemplatesForSystem('pbta').map((t) => t.meta.id);
    expect(ids).toContain('pdf-a4-pbta');
    expect(ids).toContain('pdf-a4');
    expect(ids).not.toContain('pdf-a4-dnd5e');
    expect(ids).not.toContain('pdf-a4-city-of-mist');
    expect(ids).not.toContain('pdf-a4-litm');
  });
});
