/**
 * Template Definitions — generic formats (system-agnostic)
 *
 * These templates work with any Foundry system. They show only
 * universal actor fields: name, type, img, items[].
 */

import { getTranslation } from '$lib/i18n';
import {
  BASE_STYLES,
  background,
  footer,
  header,
  itemList,
  section,
  statRow,
} from './blocks';
import type { TemplateDefinition } from './types';

const p = () => getTranslation().pdf;

// ── A4 Generic ───────────────────────────────────────────────────────────────

export const TEMPLATE_A4: TemplateDefinition = {
  meta: {
    id: 'pdf-a4',
    name: 'PDF A4',
    description: 'Standard A4 portrait',
    width: 210,
    height: 297,
    exports: ['pdf', 'png'],
  },
  styles: BASE_STYLES,
  get layout() {
    const t = p();
    return [
      ...background(210, 297),
      ...header(210, {
        subtitle1: '{{actor.type}}',
        badge: '{{actor._meta.systemId}} v{{actor._meta.systemVersion}}',
      }),
      ...section(t.abilities, 58),
      ...statRow(
        [
          { label: 'STR', binding: '{{actor.system.abilities.str.value}}' },
          { label: 'DEX', binding: '{{actor.system.abilities.dex.value}}' },
          { label: 'CON', binding: '{{actor.system.abilities.con.value}}' },
          { label: 'INT', binding: '{{actor.system.abilities.int.value}}' },
          { label: 'WIS', binding: '{{actor.system.abilities.wis.value}}' },
          { label: 'CHA', binding: '{{actor.system.abilities.cha.value}}' },
        ],
        72,
        { startX: 10, gap: 32 },
      ),
      ...statRow(
        [
          {
            label: 'HP',
            binding:
              '{{actor.system.attributes.hp.value}} / {{actor.system.attributes.hp.max}}',
          },
          { label: 'AC', binding: '{{actor.system.attributes.ac.flat}}' },
          {
            label: 'SPEED',
            binding: '{{actor.system.attributes.movement.walk}} ft',
          },
          { label: 'LEVEL', binding: '{{actor.system.details.level}}' },
        ],
        90,
      ),
      ...itemList(t.inventory, 110, { maxItems: 20, fontSize: 8 }),
      ...footer(t.footer, 297),
    ];
  },
};

// ── A5 Compact ───────────────────────────────────────────────────────────────

export const TEMPLATE_A5: TemplateDefinition = {
  meta: {
    id: 'pdf-a5',
    name: 'PDF A5',
    description: 'Compact A5 booklet',
    width: 148,
    height: 210,
    exports: ['pdf', 'png'],
  },
  styles: BASE_STYLES,
  get layout() {
    const t = p();
    return [
      ...background(148, 210),
      ...header(148, { subtitle1: '{{actor.type}}', barHeight: 40 }),
      ...itemList(t.items, 50, { maxItems: 15, width: 128 }),
      ...footer(t.footer, 210, 148),
    ];
  },
};

// ── A6 Pocket ────────────────────────────────────────────────────────────────

export const TEMPLATE_A6: TemplateDefinition = {
  meta: {
    id: 'pdf-a6',
    name: 'PDF A6',
    description: 'Pocket size',
    width: 105,
    height: 148,
    exports: ['pdf', 'png'],
  },
  styles: BASE_STYLES,
  get layout() {
    const t = p();
    return [
      ...background(105, 148),
      ...header(105, { subtitle1: '{{actor.type}}', barHeight: 35 }),
      ...itemList(t.items, 45, { maxItems: 10, width: 85 }),
      ...footer(t.footer, 148, 105),
    ];
  },
};

// ── A3 Poster ────────────────────────────────────────────────────────────────

export const TEMPLATE_A3: TemplateDefinition = {
  meta: {
    id: 'pdf-a3',
    name: 'PDF A3',
    description: 'Large poster format',
    width: 297,
    height: 420,
    exports: ['pdf', 'png'],
  },
  styles: BASE_STYLES,
  get layout() {
    const t = p();
    return [
      ...background(297, 420),
      ...header(297, { subtitle1: '{{actor.type}}', barHeight: 60 }),
      ...itemList(t.items, 70, { maxItems: 40, width: 277 }),
      ...footer(t.footer, 420, 297),
    ];
  },
};

// ── Poker Card (unique form factor — no blocks) ─────────────────────────────

export const TEMPLATE_POKER_CARD: TemplateDefinition = {
  meta: {
    id: 'png-card',
    name: 'Poker Card',
    description: '63x88mm card format',
    width: 63,
    height: 88,
    exports: ['png'],
    printful: 'POKER_CARD',
  },
  layout: [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 63,
      height: 88,
      style: { fill: '#1a1a2e' },
    },
    {
      type: 'image',
      x: 6,
      y: 6,
      width: 51,
      height: 51,
      src: '{{actor.img}}',
      radius: 4,
    },
    {
      type: 'rect',
      x: 4,
      y: 60,
      width: 55,
      height: 24,
      radius: 3,
      style: { fill: '#0f3460' },
    },
    {
      type: 'text',
      x: 31.5,
      y: 67,
      content: '{{actor.name}}',
      style: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#ffffff',
        align: 'center',
      },
    },
    {
      type: 'text',
      x: 31.5,
      y: 77,
      content: '{{actor.type}}',
      style: { fontSize: 6, color: '#aaaaaa', align: 'center' },
    },
  ],
};

// ── Registry ─────────────────────────────────────────────────────────────────

export const TEMPLATES: Record<string, TemplateDefinition> = {
  'pdf-a3': TEMPLATE_A3,
  'pdf-a4': TEMPLATE_A4,
  'pdf-a5': TEMPLATE_A5,
  'pdf-a6': TEMPLATE_A6,
  'png-card': TEMPLATE_POKER_CARD,
};

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES[id];
}

export function listTemplates(): TemplateDefinition[] {
  return Object.values(TEMPLATES);
}

export function listTemplatesForSystem(systemId: string): TemplateDefinition[] {
  return Object.values(TEMPLATES).filter(
    (t) => !t.meta.systemId || t.meta.systemId === systemId,
  );
}

export function registerTemplate(template: TemplateDefinition): void {
  TEMPLATES[template.meta.id] = template;
}
