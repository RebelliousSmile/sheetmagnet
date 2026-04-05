/**
 * PbtA (Powered by the Apocalypse) Character Sheet — A4 Template
 * Works with ANY PbtA game via object iteration on stats.
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

export const TEMPLATE_A4_PBTA: TemplateDefinition = {
  meta: {
    id: 'pdf-a4-pbta',
    name: 'PbtA Character Sheet',
    description: 'Works with Apocalypse World, Monster of the Week, and more',
    systemId: 'pbta',
    width: 210,
    height: 297,
    exports: ['pdf', 'png'],
  },
  styles: BASE_STYLES,
  get layout() {
    const t = p();
    return [
      ...background(210, 297, '#f9f7f2'),
      ...header(210, {
        subtitle1: '{{actor.system.playbook.name}}',
        badge: 'Powered by the Apocalypse',
      }),

      ...section(t.stats, 58),
      {
        type: 'repeat' as const,
        x: 10,
        y: 69,
        bind: '{{actor.system.stats}}',
        direction: 'horizontal' as const,
        gap: 3,
        maxItems: 8,
        template: [
          {
            type: 'group' as const,
            x: 0,
            y: 0,
            width: 30,
            height: 18,
            elements: [
              {
                type: 'rect' as const,
                x: 0,
                y: 0,
                width: 30,
                height: 18,
                style: {
                  fill: '#f0ece4',
                  stroke: '#d0c8b8',
                  strokeWidth: 0.2,
                },
                radius: 2,
              },
              {
                type: 'text' as const,
                x: 15,
                y: 2,
                content: '{{item.key}}',
                style: {
                  fontSize: 6,
                  fontWeight: 'bold' as const,
                  color: '#888888',
                  align: 'center' as const,
                },
              },
              {
                type: 'text' as const,
                x: 15,
                y: 8,
                content: '{{item.value}}',
                style: {
                  fontSize: 12,
                  fontWeight: 'bold' as const,
                  color: '#1a1a2e',
                  align: 'center' as const,
                },
              },
            ],
          },
        ],
      },

      ...section(t.resources, 93),
      ...statRow(
        [
          {
            label: 'HARM',
            binding:
              '{{actor.system.resources.harm.value}} / {{actor.system.resources.harm.max}}',
          },
          {
            label: 'EXPERIENCE',
            binding:
              '{{actor.system.resources.experience.value}} / {{actor.system.resources.experience.max}}',
          },
        ],
        107,
      ),

      ...section(t.details, 125),
      ...statRow(
        [{ label: 'LOOK', binding: '{{actor.system.details.look}}' }],
        139,
      ),
      ...statRow(
        [{ label: 'GEAR', binding: '{{actor.system.details.gear}}' }],
        155,
      ),

      ...itemList(t.playbookMoves, 170, {
        filter: '{{item.system.moveType}}',
        filterValue: 'playbook',
        maxItems: 6,
        fontSize: 8,
      }),

      ...itemList(t.basicMoves, 215, {
        filter: '{{item.system.moveType}}',
        filterValue: 'basic',
        maxItems: 8,
      }),

      ...footer(`PbtA — ${t.footer}`, 297),
    ];
  },
};

registerTemplate(TEMPLATE_A4_PBTA);
