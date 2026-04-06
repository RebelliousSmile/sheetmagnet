/**
 * City of Mist Character Sheet — A4 Template
 * Composed from agnostic building blocks.
 */

import { getTranslation } from '$lib/i18n';
import {
  BASE_STYLES,
  background,
  footer,
  header,
  itemList,
  section,
} from '../blocks';
import { registerTemplate } from '../definitions';
import type { RenderElement, TemplateDefinition } from '../types';

const p = () => getTranslation().pdf;

function identity(binding: string, y: number, color: string): RenderElement[] {
  return [
    {
      type: 'text',
      x: 56,
      y,
      content: binding,
      style: { fontSize: 9, color },
    },
  ];
}

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
  styles: BASE_STYLES,
  get layout() {
    const t = p();
    return [
      ...background(210, 297, '#faf8f5'),
      ...header(210, { barHeight: 55, badge: 'City of Mist' }),
      ...identity('{{actor.system.mythos}}', 27, '#c4a35a'),
      ...identity('{{actor.system.logos}}', 36, '#8899aa'),

      ...itemList(t.themes, 62, {
        filter: '{{item.system.mystery}}',
        content: '{{item.name}} — {{item.system.mystery}}',
        maxItems: 4,
        fontSize: 8,
      }),

      ...itemList(t.powerTags, 102, {
        filter: '{{item.system.subtype}}',
        filterValue: 'power',
        maxItems: 12,
        width: 90,
      }),

      ...itemList(t.weaknessTags, 102, {
        filter: '{{item.system.subtype}}',
        filterValue: 'weakness',
        maxItems: 8,
        x: 110,
        width: 90,
      }),

      ...itemList(t.statuses, 175, {
        filter: '{{item.system.tier}}',
        maxItems: 8,
        width: 90,
      }),

      ...itemList(t.clues, 175, {
        filter: '{{item.system.source}}',
        maxItems: 10,
        x: 110,
        width: 90,
        fontSize: 8,
      }),

      ...section(t.description, 250),
      {
        type: 'text' as const,
        x: 10,
        y: 261,
        width: 190,
        content: '{{actor.system.description}}',
        style: { fontSize: 8, color: '#444444' },
      },

      ...footer(`City of Mist — ${t.footer}`, 297),
    ];
  },
};

registerTemplate(TEMPLATE_A4_CITY_OF_MIST);
