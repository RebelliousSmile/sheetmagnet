/**
 * City of Mist Character Sheet — A4 Template
 *
 * City of Mist stores game data as embedded Items, not on actor.system.
 * This template uses repeat + filter to display items by type:
 * - type:"theme" → themes (Mythos/Logos)
 * - type:"tag" → power, weakness, story tags
 * - type:"status" → current statuses with tier
 * - type:"clue" → investigation clues
 *
 * actor.system only has: mythos, logos, biography, buildup
 */

import { registerTemplate } from '../definitions';
import type { TemplateDefinition } from '../types';

export const TEMPLATE_A4_CITY_OF_MIST: TemplateDefinition = {
  meta: {
    id: 'pdf-a4-city-of-mist',
    name: 'City of Mist Character Sheet',
    description: 'Rift and sleeper character sheet',
    systemId: 'city-of-mist',
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
    tagName: {
      fontSize: 7,
      color: '#333333',
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
      style: { fill: '#faf8f5' },
    },

    // ── Header bar ───────────────────────────────────────────────────
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 210,
      height: 55,
      style: { fill: '#1a1a2e' },
    },
    {
      type: 'image',
      x: 8,
      y: 6,
      width: 42,
      height: 42,
      src: '{{actor.img}}',
      radius: 4,
    },
    {
      type: 'text',
      x: 56,
      y: 10,
      content: '{{actor.name}}',
      style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
    },
    // Mythos identity
    {
      type: 'text',
      x: 56,
      y: 27,
      content: '{{actor.system.mythos}}',
      style: { fontSize: 9, color: '#c4a35a' },
    },
    // Logos identity
    {
      type: 'text',
      x: 56,
      y: 36,
      content: '{{actor.system.logos}}',
      style: { fontSize: 9, color: '#8899aa' },
    },
    // System badge
    {
      type: 'text',
      x: 200,
      y: 44,
      content: 'City of Mist',
      style: { fontSize: 7, color: '#666666', align: 'right' },
    },

    // ── Section: Themes ──────────────────────────────────────────────
    {
      type: 'text',
      x: 10,
      y: 62,
      content: 'THEMES',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 69,
      x2: 200,
      y2: 69,
      style: { stroke: '#dddddd', strokeWidth: 0.3 },
    },
    {
      type: 'repeat',
      x: 10,
      y: 73,
      bind: '{{actor.items}}',
      filter: '{{item.system.mystery}}',
      direction: 'vertical',
      gap: 1,
      maxItems: 4,
      template: [
        {
          type: 'text',
          x: 0,
          y: 0,
          width: 190,
          height: 5,
          content: '{{item.name}} — {{item.system.mystery}}',
          style: { fontSize: 8, color: '#1a1a2e', fontWeight: 'bold' },
        },
      ],
    },

    // ── Section: Power Tags ──────────────────────────────────────────
    {
      type: 'text',
      x: 10,
      y: 102,
      content: 'POWER TAGS',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 109,
      x2: 100,
      y2: 109,
      style: { stroke: '#dddddd', strokeWidth: 0.3 },
    },
    {
      type: 'repeat',
      x: 10,
      y: 113,
      bind: '{{actor.items}}',
      filter: '{{item.system.subtype}}',
      direction: 'vertical',
      gap: 0.5,
      maxItems: 16,
      template: [
        {
          type: 'text',
          x: 0,
          y: 0,
          width: 90,
          height: 4,
          content: '{{item.name}}',
          styleName: 'tagName',
          condition: '{{item.system.subtype}}',
        },
      ],
    },

    // ── Section: Statuses ────────────────────────────────────────────
    {
      type: 'text',
      x: 110,
      y: 102,
      content: 'STATUSES',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 110,
      y: 109,
      x2: 200,
      y2: 109,
      style: { stroke: '#dddddd', strokeWidth: 0.3 },
    },
    {
      type: 'repeat',
      x: 110,
      y: 113,
      bind: '{{actor.items}}',
      filter: '{{item.system.tier}}',
      direction: 'vertical',
      gap: 0.5,
      maxItems: 8,
      template: [
        {
          type: 'text',
          x: 0,
          y: 0,
          width: 90,
          height: 4,
          content: '{{item.name}}',
          styleName: 'tagName',
        },
      ],
    },

    // ── Section: Clues ───────────────────────────────────────────────
    {
      type: 'text',
      x: 10,
      y: 195,
      content: 'CLUES',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 202,
      x2: 200,
      y2: 202,
      style: { stroke: '#dddddd', strokeWidth: 0.3 },
    },
    {
      type: 'repeat',
      x: 10,
      y: 206,
      bind: '{{actor.items}}',
      filter: '{{item.system.source}}',
      direction: 'vertical',
      gap: 1,
      maxItems: 10,
      template: [
        {
          type: 'text',
          x: 0,
          y: 0,
          width: 190,
          height: 5,
          content: '{{item.name}}',
          style: { fontSize: 8, color: '#1a1a2e' },
        },
      ],
    },

    // ── Section: Description ─────────────────────────────────────────
    {
      type: 'text',
      x: 10,
      y: 250,
      content: 'DESCRIPTION',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 257,
      x2: 200,
      y2: 257,
      style: { stroke: '#dddddd', strokeWidth: 0.3 },
    },
    {
      type: 'text',
      x: 10,
      y: 261,
      width: 190,
      content: '{{actor.system.description}}',
      style: { fontSize: 8, color: '#444444' },
    },

    // ── Footer ───────────────────────────────────────────────────────
    {
      type: 'text',
      x: 105,
      y: 291,
      content: 'City of Mist — Generated by Sheet Magnet',
      style: { fontSize: 5, color: '#cccccc', align: 'center' },
    },
  ],
};

registerTemplate(TEMPLATE_A4_CITY_OF_MIST);
