/**
 * Cypher System character (Numenera)
 * Based on Foundry VTT cyphersystem (mrkwnzl/cyphersystem-foundryvtt v3.5.0)
 *
 * Real paths verified from template.json:
 * - Pools: actor.system.pools.{might,speed,intellect}.{value,max,edge}
 * - Sentence: actor.system.basic.{descriptor,type,focus}
 * - Tier/effort: actor.system.basic.{tier,effort,xp}
 * - Recovery: actor.system.combat.recoveries.{roll,oneAction,...}
 * - Damage: actor.system.combat.damageTrack.state ("Hale"|"Impaired"|"Debilitated")
 * - Armor: actor.system.combat.armor.ratingTotal
 * - Skills: item.system.basic.rating ("Practiced"|"Trained"|"Specialized"|"Inability")
 * - Abilities: item.system.basic.{cost,pool}
 */

import type { ActorData } from '$lib/connectors/foundry';

export const CYPHER_CHARACTER: ActorData = {
  id: 'nR7kWm3pQ5xLfH8v',
  name: 'Kira Voss',
  type: 'pc',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  system: {
    pools: {
      might: { value: 14, max: 16, edge: 1 },
      speed: { value: 12, max: 14, edge: 1 },
      intellect: { value: 16, max: 18, edge: 2 },
      additional: { value: 0, max: 0, edge: 0 },
    },
    basic: {
      tier: 3,
      effort: 3,
      xp: 2,
      descriptor: 'Stealthy',
      type: 'Nano',
      focus: 'Explores Dark Places',
      additionalSentence: '',
      advancement: {
        stats: true,
        effort: false,
        edge: true,
        skill: false,
        other: false,
      },
    },
    combat: {
      armor: {
        ratingTotal: 1,
        costTotal: 0,
      },
      damageTrack: {
        state: 'Hale',
        applyImpaired: true,
        applyDebilitated: true,
      },
      recoveries: {
        roll: '1d6+3',
        oneAction: false,
        tenMinutes: false,
        oneHour: true,
        tenHours: true,
      },
    },
    equipment: {
      cypherLimit: 3,
    },
    settings: {
      general: {
        additionalPool: { active: false, label: '' },
      },
      equipment: {
        currency: { quantity: 42, name: 'Shins' },
      },
    },
    description:
      'A Stealthy Nano who Explores Dark Places. Kira navigates the ruins of the prior worlds seeking lost numenera.',
    notes: 'Currently investigating the Iron Wind anomaly near Qi.',
  },
  items: [
    // Abilities
    {
      _id: 'ab001',
      name: 'Onslaught',
      type: 'ability',
      system: {
        basic: {
          cost: 1,
          pool: 'Intellect',
        },
        settings: { general: { sorting: 'Ability' } },
        description:
          'You attack a foe using energies that assail either their physical form or their mind. Inflicts 4 points of damage.',
      },
    },
    {
      _id: 'ab002',
      name: 'Ward',
      type: 'ability',
      system: {
        basic: { cost: 0, pool: 'Pool' },
        settings: { general: { sorting: 'Ability' } },
        description:
          'You have a shield of energy around you at all times. +1 to Armor.',
      },
    },
    {
      _id: 'ab003',
      name: 'Hedge Magic',
      type: 'ability',
      system: {
        basic: { cost: 1, pool: 'Intellect' },
        settings: { general: { sorting: 'Ability' } },
        description:
          'You can perform small tricks: create a small light, move a small object.',
      },
    },
    // Skills
    {
      _id: 'sk001',
      name: 'Numenera Lore',
      type: 'skill',
      system: {
        basic: { rating: 'Trained' },
        settings: { general: { sorting: 'Skill', initiative: false } },
        description: 'Understanding numenera devices and the prior worlds.',
      },
    },
    {
      _id: 'sk002',
      name: 'Stealth',
      type: 'skill',
      system: {
        basic: { rating: 'Specialized' },
        settings: { general: { sorting: 'Skill', initiative: false } },
        description: 'Moving silently and hiding.',
      },
    },
    {
      _id: 'sk003',
      name: 'Perception',
      type: 'skill',
      system: {
        basic: { rating: 'Trained' },
        settings: { general: { sorting: 'Skill', initiative: false } },
        description: 'Noticing things, searching.',
      },
    },
    {
      _id: 'sk004',
      name: 'Persuasion',
      type: 'skill',
      system: {
        basic: { rating: 'Inability' },
        settings: { general: { sorting: 'Skill', initiative: false } },
        description: 'Social interactions and convincing others.',
      },
    },
    // Cyphers
    {
      _id: 'cy001',
      name: 'Detonation (Web)',
      type: 'cypher',
      system: {
        basic: { level: 4, identified: true },
        description:
          'Explodes in a web that immobilizes all within short range for 1 minute.',
      },
    },
    {
      _id: 'cy002',
      name: 'Rejuvenator',
      type: 'cypher',
      system: {
        basic: { level: 5, identified: true },
        description: 'Restores 1d6+2 points to one stat Pool of your choice.',
      },
    },
    // Equipment
    {
      _id: 'eq001',
      name: 'Buzzer',
      type: 'equipment',
      system: {
        basic: { quantity: 1 },
        description: 'Razor-edged throwing weapon. Light weapon.',
      },
    },
    {
      _id: 'eq002',
      name: 'Clothing (explorer)',
      type: 'equipment',
      system: {
        basic: { quantity: 1 },
        description: 'Durable clothing suited for exploration.',
      },
    },
    {
      _id: 'eq003',
      name: 'Glow globe',
      type: 'equipment',
      system: {
        basic: { quantity: 2 },
        description: 'Illuminates an area. Lasts 1 hour.',
      },
    },
  ],
  effects: [],
  flags: {},
  prototypeToken: {
    name: 'Kira',
    displayName: 20,
    actorLink: true,
    width: 1,
    height: 1,
    texture: {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    },
    disposition: 1,
  },
  _meta: {
    systemId: 'cyphersystem',
    systemVersion: '3.5.0',
    foundryVersion: '14.0.0',
    exportedAt: '2026-04-05T14:00:00.000Z',
  },
};
