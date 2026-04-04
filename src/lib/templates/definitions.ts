/**
 * Template Definitions
 * Declarative layouts for each export format
 */

import type { TemplateDefinition } from './types';

export const TEMPLATE_A4: TemplateDefinition = {
  meta: {
    id: 'pdf-a4',
    name: 'PDF A4',
    description: 'Standard A4 portrait',
    width: 210,
    height: 297,
    exports: ['pdf', 'png'],
  },
  styles: {
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1a1a2e',
    },
    subtitle: {
      fontSize: 14,
      color: '#666666',
    },
    label: {
      fontSize: 8,
      color: '#999999',
      fontWeight: 'bold',
    },
    value: {
      fontSize: 12,
      color: '#1a1a2e',
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1a1a2e',
    },
  },
  layout: [
    // Background
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 210,
      height: 297,
      style: { fill: '#ffffff' },
    },
    // Header bar
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 210,
      height: 50,
      style: { fill: '#1a1a2e' },
    },
    // Character image
    {
      type: 'image',
      x: 10,
      y: 8,
      width: 34,
      height: 34,
      src: '{{actor.img}}',
      radius: 4,
    },
    // Character name
    {
      type: 'text',
      x: 52,
      y: 15,
      content: '{{actor.name}}',
      style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
    },
    // Character type
    {
      type: 'text',
      x: 52,
      y: 32,
      content: '{{actor.type}}',
      style: { fontSize: 10, color: '#aaaaaa' },
    },
    // System info
    {
      type: 'text',
      x: 150,
      y: 38,
      content: '{{actor._meta.systemId}} v{{actor._meta.systemVersion}}',
      style: { fontSize: 7, color: '#666666', align: 'right' },
    },
    // Ability scores — row of 6
    {
      type: 'text',
      x: 10,
      y: 58,
      content: 'ABILITIES',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 65,
      x2: 200,
      y2: 65,
      style: { stroke: '#dddddd', strokeWidth: 0.3 },
    },
    // STR
    {
      type: 'group',
      x: 10,
      y: 70,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'STR',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: '{{actor.system.abilities.str.value}}',
          styleName: 'value',
        },
      ],
    },
    // DEX
    {
      type: 'group',
      x: 42,
      y: 70,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'DEX',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: '{{actor.system.abilities.dex.value}}',
          styleName: 'value',
        },
      ],
    },
    // CON
    {
      type: 'group',
      x: 74,
      y: 70,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'CON',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: '{{actor.system.abilities.con.value}}',
          styleName: 'value',
        },
      ],
    },
    // INT
    {
      type: 'group',
      x: 106,
      y: 70,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'INT',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: '{{actor.system.abilities.int.value}}',
          styleName: 'value',
        },
      ],
    },
    // WIS
    {
      type: 'group',
      x: 138,
      y: 70,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'WIS',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: '{{actor.system.abilities.wis.value}}',
          styleName: 'value',
        },
      ],
    },
    // CHA
    {
      type: 'group',
      x: 170,
      y: 70,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'CHA',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: '{{actor.system.abilities.cha.value}}',
          styleName: 'value',
        },
      ],
    },
    // HP / AC row
    {
      type: 'group',
      x: 10,
      y: 90,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'HP',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content:
            '{{actor.system.attributes.hp.value}} / {{actor.system.attributes.hp.max}}',
          styleName: 'value',
        },
      ],
    },
    {
      type: 'group',
      x: 60,
      y: 90,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'AC',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: '{{actor.system.attributes.ac.flat}}',
          styleName: 'value',
        },
      ],
    },
    {
      type: 'group',
      x: 100,
      y: 90,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'SPEED',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: '{{actor.system.attributes.movement.walk}} ft',
          styleName: 'value',
        },
      ],
    },
    {
      type: 'group',
      x: 150,
      y: 90,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'LEVEL',
          styleName: 'label',
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: '{{actor.system.details.level}}',
          styleName: 'value',
        },
      ],
    },
    // Items section
    {
      type: 'text',
      x: 10,
      y: 110,
      content: 'INVENTORY',
      styleName: 'sectionTitle',
    },
    {
      type: 'line',
      x: 10,
      y: 117,
      x2: 200,
      y2: 117,
      style: { stroke: '#dddddd', strokeWidth: 0.3 },
    },
    // Repeat items
    {
      type: 'repeat',
      x: 10,
      y: 122,
      bind: '{{actor.items}}',
      direction: 'vertical',
      gap: 1,
      maxItems: 20,
      template: [
        {
          type: 'text',
          x: 0,
          y: 0,
          width: 190,
          height: 5,
          content: '{{item.name}}',
          style: { fontSize: 8, color: '#333333' },
        },
      ],
    },
    // Footer
    {
      type: 'text',
      x: 105,
      y: 290,
      content: 'Generated by Sheet Magnet',
      style: { fontSize: 6, color: '#cccccc', align: 'center' },
    },
  ],
};

export const TEMPLATE_A5: TemplateDefinition = {
  meta: {
    id: 'pdf-a5',
    name: 'PDF A5',
    description: 'Compact A5 booklet',
    width: 148,
    height: 210,
    exports: ['pdf', 'png'],
  },
  styles: TEMPLATE_A4.styles,
  layout: [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 148,
      height: 210,
      style: { fill: '#ffffff' },
    },
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 148,
      height: 40,
      style: { fill: '#1a1a2e' },
    },
    {
      type: 'image',
      x: 8,
      y: 6,
      width: 28,
      height: 28,
      src: '{{actor.img}}',
      radius: 3,
    },
    {
      type: 'text',
      x: 42,
      y: 12,
      content: '{{actor.name}}',
      style: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' },
    },
    {
      type: 'text',
      x: 42,
      y: 25,
      content: '{{actor.type}}',
      style: { fontSize: 8, color: '#aaaaaa' },
    },
    {
      type: 'text',
      x: 74,
      y: 205,
      content: 'Sheet Magnet',
      style: { fontSize: 5, color: '#cccccc', align: 'center' },
    },
  ],
};

export const TEMPLATE_A6: TemplateDefinition = {
  meta: {
    id: 'pdf-a6',
    name: 'PDF A6',
    description: 'Pocket size',
    width: 105,
    height: 148,
    exports: ['pdf', 'png'],
  },
  styles: TEMPLATE_A4.styles,
  layout: [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 105,
      height: 148,
      style: { fill: '#ffffff' },
    },
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 105,
      height: 30,
      style: { fill: '#1a1a2e' },
    },
    {
      type: 'image',
      x: 6,
      y: 5,
      width: 20,
      height: 20,
      src: '{{actor.img}}',
      radius: 2,
    },
    {
      type: 'text',
      x: 30,
      y: 10,
      content: '{{actor.name}}',
      style: { fontSize: 10, fontWeight: 'bold', color: '#ffffff' },
    },
    {
      type: 'text',
      x: 30,
      y: 20,
      content: '{{actor.type}}',
      style: { fontSize: 6, color: '#aaaaaa' },
    },
  ],
};

export const TEMPLATE_A3: TemplateDefinition = {
  meta: {
    id: 'pdf-a3',
    name: 'PDF A3',
    description: 'Large poster format',
    width: 297,
    height: 420,
    exports: ['pdf', 'png'],
  },
  styles: TEMPLATE_A4.styles,
  layout: [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 297,
      height: 420,
      style: { fill: '#ffffff' },
    },
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 297,
      height: 70,
      style: { fill: '#1a1a2e' },
    },
    {
      type: 'image',
      x: 15,
      y: 10,
      width: 50,
      height: 50,
      src: '{{actor.img}}',
      radius: 6,
    },
    {
      type: 'text',
      x: 75,
      y: 22,
      content: '{{actor.name}}',
      style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
    },
    {
      type: 'text',
      x: 75,
      y: 48,
      content: '{{actor.type}}',
      style: { fontSize: 14, color: '#aaaaaa' },
    },
  ],
};

export const TEMPLATE_POKER_CARD: TemplateDefinition = {
  meta: {
    id: 'png-card',
    name: 'Poker Card',
    description: '63×88mm card format',
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

// Registry
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
