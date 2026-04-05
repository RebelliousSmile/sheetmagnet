/**
 * Legend in the Mist Character Sheet — A4 Template
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
  statRow,
} from '../blocks';
import { registerTemplate } from '../definitions';
import type { TemplateDefinition } from '../types';

const p = () => getTranslation().pdf;

export const TEMPLATE_A4_LITM: TemplateDefinition = {
  meta: {
    id: 'pdf-a4-litm',
    name: 'Legend in the Mist Character Sheet',
    description: 'Rift character sheet for Legend in the Mist',
    systemId: 'mist-engine-fvtt',
    width: 210,
    height: 297,
    exports: ['pdf', 'png'],
  },
  styles: BASE_STYLES,
  get layout() {
    const t = p();
    return [
      ...background(210, 297, '#f9f6f0'),
      ...header(210, {
        barHeight: 50,
        subtitle1: '{{actor.system.shortDescription}}',
        badge: 'Legend in the Mist',
      }),

      ...statRow(
        [
          { label: 'PROMISES', binding: '{{actor.system.promises}}' },
          { label: 'NOTES', binding: '{{actor.system.notes}}' },
        ],
        58,
      ),

      ...itemList(t.themes, 75, {
        filter: '{{item.system.quest}}',
        content: '{{item.name}} — {{item.system.quest}}',
        maxItems: 4,
        fontSize: 8,
      }),

      ...section(t.tagsStatuses, 115),
      {
        type: 'repeat' as const,
        x: 10,
        y: 126,
        bind: '{{actor.system.floatingTagsAndStatuses}}',
        direction: 'vertical' as const,
        gap: 0.5,
        maxItems: 12,
        template: [
          {
            type: 'text' as const,
            x: 0,
            y: 0,
            width: 190,
            height: 4,
            content: '{{item.name}}',
            style: { fontSize: 7, color: '#333333' },
          },
        ],
      },

      ...section(t.fellowships, 195),
      {
        type: 'repeat' as const,
        x: 10,
        y: 206,
        bind: '{{actor.system.fellowships}}',
        direction: 'vertical' as const,
        gap: 1,
        maxItems: 6,
        template: [
          {
            type: 'text' as const,
            x: 0,
            y: 0,
            width: 190,
            height: 5,
            content: '{{item.companion}} — {{item.relationshipTag}}',
            style: { fontSize: 8, color: '#1a1a2e' },
          },
        ],
      },

      ...section(t.biography, 235),
      {
        type: 'text' as const,
        x: 10,
        y: 246,
        width: 190,
        content: '{{actor.system.biography}}',
        style: { fontSize: 8, color: '#444444' },
      },

      ...footer(`Legend in the Mist — ${t.footer}`, 297),
    ];
  },
};

registerTemplate(TEMPLATE_A4_LITM);
