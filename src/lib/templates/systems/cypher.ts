/**
 * Cypher System Character Sheet — A4 Template
 * Composed from agnostic building blocks.
 *
 * Verified paths from mrkwnzl/cyphersystem-foundryvtt template.json:
 * - Pools: actor.system.pools.{might,speed,intellect}.{value,max,edge}
 * - Sentence: actor.system.basic.{descriptor,type,focus}
 * - Tier/Effort: actor.system.basic.{tier,effort,xp}
 * - Armor: actor.system.combat.armor.ratingTotal
 * - Damage: actor.system.combat.damageTrack.state
 * - Recovery: actor.system.combat.recoveries.roll
 * - Skills: item type "skill", rating at item.system.basic.rating
 * - Abilities: item type "ability", cost at item.system.basic.cost
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

export const TEMPLATE_A4_CYPHER: TemplateDefinition = {
  meta: {
    id: 'pdf-a4-cypher',
    name: 'Cypher System Character Sheet',
    description: 'Numenera, The Strange, and all Cypher System games',
    systemId: 'cyphersystem',
    width: 210,
    height: 297,
    exports: ['pdf', 'png'],
  },
  styles: BASE_STYLES,
  get layout() {
    const t = getTranslation().pdf;
    return [
      ...background(210, 297, '#f7f5f0'),
      ...header(210, {
        subtitle1:
          '{{actor.system.basic.descriptor}} {{actor.system.basic.type}} who {{actor.system.basic.focus}}',
        badge: 'Cypher System',
      }),

      // ── Pools ──────────────────────────────────────────────────
      ...section('POOLS', 58),
      ...statRow(
        [
          {
            label: 'MIGHT',
            binding:
              '{{actor.system.pools.might.value}} / {{actor.system.pools.might.max}}',
          },
          {
            label: 'SPEED',
            binding:
              '{{actor.system.pools.speed.value}} / {{actor.system.pools.speed.max}}',
          },
          {
            label: 'INTELLECT',
            binding:
              '{{actor.system.pools.intellect.value}} / {{actor.system.pools.intellect.max}}',
          },
        ],
        72,
        { gap: 60 },
      ),

      // Edge row
      ...statRow(
        [
          { label: 'MIGHT EDGE', binding: '{{actor.system.pools.might.edge}}' },
          { label: 'SPEED EDGE', binding: '{{actor.system.pools.speed.edge}}' },
          {
            label: 'INTELLECT EDGE',
            binding: '{{actor.system.pools.intellect.edge}}',
          },
        ],
        88,
        { gap: 60 },
      ),

      // ── Tier / Effort / Armor / Damage Track ───────────────────
      ...section(t.details, 105),
      ...statRow(
        [
          { label: 'TIER', binding: '{{actor.system.basic.tier}}' },
          { label: 'EFFORT', binding: '{{actor.system.basic.effort}}' },
          { label: 'XP', binding: '{{actor.system.basic.xp}}' },
          {
            label: 'ARMOR',
            binding: '{{actor.system.combat.armor.ratingTotal}}',
          },
          {
            label: 'STATUS',
            binding: '{{actor.system.combat.damageTrack.state}}',
          },
        ],
        119,
        { gap: 36 },
      ),

      // ── Skills ─────────────────────────────────────────────────
      ...itemList('SKILLS', 138, {
        filter: '{{item.system.basic.rating}}',
        maxItems: 10,
        width: 90,
        fontSize: 7,
      }),

      // ── Abilities ──────────────────────────────────────────────
      ...itemList(t.abilities, 138, {
        filter: '{{item.system.basic.pool}}',
        maxItems: 10,
        x: 110,
        width: 90,
        fontSize: 7,
      }),

      // ── Cyphers ────────────────────────────────────────────────
      ...itemList('CYPHERS', 215, {
        filter: '{{item.system.basic.level}}',
        maxItems: 6,
        width: 90,
        fontSize: 7,
      }),

      // ── Equipment ──────────────────────────────────────────────
      ...itemList(t.inventory, 215, {
        filter: '{{item.system.basic.quantity}}',
        maxItems: 10,
        x: 110,
        width: 90,
        fontSize: 7,
      }),

      // ── Description ────────────────────────────────────────────
      ...section(t.description, 265),
      {
        type: 'text' as const,
        x: 10,
        y: 276,
        width: 190,
        content: '{{actor.system.description}}',
        style: { fontSize: 7, color: '#444444' },
      },

      ...footer(`Cypher System — ${t.footer}`, 297),
    ];
  },
};

registerTemplate(TEMPLATE_A4_CYPHER);
