/**
 * D&D 5e Character Sheet — A4 Template
 *
 * Bindings reference real dnd5e system data model paths:
 * - actor.system.abilities.{str,dex,con,int,wis,cha}.value
 * - actor.system.attributes.{hp,ac,movement,death}
 * - actor.system.details.{level,race,alignment,background}
 * - actor.system.skills.{acr,ath,...}.value
 * - actor.system.currency.{pp,gp,sp,cp}
 * - actor.items[] (weapons, armor, spells, feats)
 */

import { registerTemplate } from '../definitions';
import type { TemplateDefinition } from '../types';

const abilityBlock = (
  label: string,
  key: string,
  x: number,
): TemplateDefinition['layout'] => [
  {
    type: 'group',
    x,
    y: 72,
    elements: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: 26,
        height: 22,
        style: { fill: '#f5f5f5', stroke: '#dddddd', strokeWidth: 0.2 },
        radius: 2,
      },
      {
        type: 'text',
        x: 13,
        y: 2,
        content: label,
        style: {
          fontSize: 6,
          fontWeight: 'bold',
          color: '#999999',
          align: 'center',
        },
      },
      {
        type: 'text',
        x: 13,
        y: 9,
        content: `{{actor.system.abilities.${key}.value}}`,
        style: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#1a1a2e',
          align: 'center',
        },
      },
    ],
  },
];

const statBlock = (
  label: string,
  binding: string,
  x: number,
  y: number,
): TemplateDefinition['layout'] => [
  {
    type: 'group',
    x,
    y,
    elements: [
      {
        type: 'text',
        x: 0,
        y: 0,
        content: label,
        style: { fontSize: 6, fontWeight: 'bold', color: '#999999' },
      },
      {
        type: 'text',
        x: 0,
        y: 4,
        content: binding,
        style: { fontSize: 11, color: '#1a1a2e' },
      },
    ],
  },
];

export const TEMPLATE_A4_DND5E: TemplateDefinition = {
  meta: {
    id: 'pdf-a4-dnd5e',
    name: 'D&D 5e Character Sheet',
    description: 'Full character sheet for D&D 5th Edition',
    systemId: 'dnd5e',
    width: 210,
    height: 297,
    exports: ['pdf', 'png'],
  },
  styles: {
    sectionTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#1a1a2e',
    },
    label: {
      fontSize: 6,
      color: '#999999',
      fontWeight: 'bold',
    },
    value: {
      fontSize: 10,
      color: '#1a1a2e',
    },
    small: {
      fontSize: 7,
      color: '#666666',
    },
  },
  layout: [
    // ── Background ───────────────────────────────────────────────────
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 210,
      height: 297,
      style: { fill: '#ffffff' },
    },

    // ── Header bar ───────────────────────────────────────────────────
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 210,
      height: 50,
      style: { fill: '#1a1a2e' },
    },
    {
      type: 'image',
      x: 8,
      y: 6,
      width: 38,
      height: 38,
      src: '{{actor.img}}',
      radius: 4,
    },
    {
      type: 'text',
      x: 52,
      y: 12,
      content: '{{actor.name}}',
      style: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
    },
    {
      type: 'text',
      x: 52,
      y: 27,
      content: '{{actor.system.details.race}}',
      style: { fontSize: 9, color: '#aaaaaa' },
    },
    {
      type: 'text',
      x: 52,
      y: 35,
      content: '{{actor.system.details.alignment}}',
      style: { fontSize: 8, color: '#888888' },
    },
    {
      type: 'text',
      x: 200,
      y: 38,
      content: 'Level {{actor.system.details.level}}',
      style: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#ffffff',
        align: 'right',
      },
    },

    // ── Section: Ability Scores ──────────────────────────────────────
    {
      type: 'text',
      x: 10,
      y: 58,
      content: 'ABILITY SCORES',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 65,
      x2: 200,
      y2: 65,
      style: { stroke: '#eeeeee', strokeWidth: 0.3 },
    },

    // 6 ability blocks in a row
    ...abilityBlock('STR', 'str', 10),
    ...abilityBlock('DEX', 'dex', 42),
    ...abilityBlock('CON', 'con', 74),
    ...abilityBlock('INT', 'int', 106),
    ...abilityBlock('WIS', 'wis', 138),
    ...abilityBlock('CHA', 'cha', 170),

    // ── Section: Combat Stats ────────────────────────────────────────
    {
      type: 'text',
      x: 10,
      y: 100,
      content: 'COMBAT',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 107,
      x2: 200,
      y2: 107,
      style: { stroke: '#eeeeee', strokeWidth: 0.3 },
    },

    ...statBlock(
      'HIT POINTS',
      '{{actor.system.attributes.hp.value}} / {{actor.system.attributes.hp.max}}',
      10,
      112,
    ),
    ...statBlock('ARMOR CLASS', '{{actor.system.attributes.ac.flat}}', 60, 112),
    ...statBlock(
      'SPEED',
      '{{actor.system.attributes.movement.walk}} ft',
      100,
      112,
    ),
    ...statBlock('PROFICIENCY', '+{{actor.system.attributes.prof}}', 145, 112),

    // Death saves
    ...statBlock(
      'DEATH SAVES',
      '{{actor.system.attributes.death.success}} / {{actor.system.attributes.death.failure}}',
      10,
      128,
    ),
    ...statBlock(
      'INSPIRATION',
      '{{actor.system.attributes.inspiration}}',
      60,
      128,
    ),

    // ── Section: Details ─────────────────────────────────────────────
    {
      type: 'text',
      x: 10,
      y: 145,
      content: 'DETAILS',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 152,
      x2: 200,
      y2: 152,
      style: { stroke: '#eeeeee', strokeWidth: 0.3 },
    },

    ...statBlock('BACKGROUND', '{{actor.system.details.background}}', 10, 157),
    ...statBlock('XP', '{{actor.system.details.xp.value}}', 80, 157),

    // ── Section: Currency ────────────────────────────────────────────
    ...statBlock('PP', '{{actor.system.currency.pp}}', 130, 157),
    ...statBlock('GP', '{{actor.system.currency.gp}}', 148, 157),
    ...statBlock('SP', '{{actor.system.currency.sp}}', 166, 157),
    ...statBlock('CP', '{{actor.system.currency.cp}}', 184, 157),

    // ── Section: Inventory ───────────────────────────────────────────
    {
      type: 'text',
      x: 10,
      y: 175,
      content: 'INVENTORY & FEATURES',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 182,
      x2: 200,
      y2: 182,
      style: { stroke: '#eeeeee', strokeWidth: 0.3 },
    },

    {
      type: 'repeat',
      x: 10,
      y: 186,
      bind: '{{actor.items}}',
      direction: 'vertical',
      gap: 0.5,
      maxItems: 25,
      template: [
        {
          type: 'text',
          x: 0,
          y: 0,
          width: 190,
          height: 4,
          content: '{{item.name}}',
          style: { fontSize: 7, color: '#333333' },
        },
      ],
    },

    // ── Footer ───────────────────────────────────────────────────────
    {
      type: 'text',
      x: 105,
      y: 291,
      content: 'D&D 5e — Generated by Sheet Magnet',
      style: { fontSize: 5, color: '#cccccc', align: 'center' },
    },
  ],
};

registerTemplate(TEMPLATE_A4_DND5E);
