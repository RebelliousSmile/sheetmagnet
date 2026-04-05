/**
 * Cypher System character (Numenera / The Strange / Tokyo:Otherscape alt)
 * Based on Foundry VTT cyphersystem (mrkwnzl/cyphersystem-foundryvtt)
 *
 * Cypher System has 3 stat pools (Might, Speed, Intellect), each with:
 *   pool (current), max, edge
 * Plus: tier, effort, recovery rolls, damage track
 * Items: abilities, skills, cyphers, artifacts, equipment, attacks
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
    },
    combat: {
      armor: 1,
      damage: 4,
    },
    basic: {
      tier: 3,
      effort: 3,
      xp: 2,
    },
    recovery: {
      roll: '1d6+3',
      oneAction: false,
      tenMinutes: false,
      oneHour: true,
      tenHours: true,
    },
    damageTrack: {
      state: 'hale',
      impaired: false,
      debilitated: false,
    },
    settings: {
      equipment: {
        currency: { quantity: 42, name: 'Shins' },
      },
    },
    description:
      'A Stealthy Nano who Explores Dark Places. Kira navigates the ruins of the prior worlds seeking lost numenera.',
    notes: 'Currently investigating the Iron Wind anomaly near Qi.',
    sentence: {
      descriptor: 'Stealthy',
      type: 'Nano',
      focus: 'Explores Dark Places',
    },
  },
  items: [
    // Abilities
    {
      _id: 'ab001',
      name: 'Onslaught',
      type: 'ability',
      system: {
        description:
          'You attack a foe using energies that assail either their physical form or their mind. Inflicts 4 points of damage.',
        level: 'practiced',
        cost: { value: 1, pool: 'intellect' },
        tier: 1,
      },
    },
    {
      _id: 'ab002',
      name: 'Ward',
      type: 'ability',
      system: {
        description:
          'You have a shield of energy around you at all times. +1 to Armor.',
        level: 'practiced',
        cost: { value: 0, pool: '' },
        tier: 1,
      },
    },
    {
      _id: 'ab003',
      name: 'Hedge Magic',
      type: 'ability',
      system: {
        description:
          'You can perform small tricks: create a small light, move a small object, clean or dirty a small area.',
        level: 'practiced',
        cost: { value: 1, pool: 'intellect' },
        tier: 1,
      },
    },
    {
      _id: 'ab004',
      name: 'Stealth Skills',
      type: 'ability',
      system: {
        description: 'You are trained in stealth and sneaking tasks.',
        level: 'trained',
        cost: { value: 0, pool: '' },
        tier: 1,
      },
    },
    // Skills
    {
      _id: 'sk001',
      name: 'Numenera Lore',
      type: 'skill',
      system: {
        level: 'trained',
        stat: 'intellect',
        description: 'Understanding numenera devices and the prior worlds.',
      },
    },
    {
      _id: 'sk002',
      name: 'Stealth',
      type: 'skill',
      system: {
        level: 'specialized',
        stat: 'speed',
        description: 'Moving silently and hiding.',
      },
    },
    {
      _id: 'sk003',
      name: 'Perception',
      type: 'skill',
      system: {
        level: 'trained',
        stat: 'intellect',
        description: 'Noticing things, searching.',
      },
    },
    {
      _id: 'sk004',
      name: 'Persuasion',
      type: 'skill',
      system: {
        level: 'inability',
        stat: 'intellect',
        description: 'Social interactions and convincing others.',
      },
    },
    // Cyphers
    {
      _id: 'cy001',
      name: 'Detonation (Web)',
      type: 'cypher',
      system: {
        level: 4,
        form: 'Small metal sphere',
        effect:
          'Explodes in a web that immobilizes all within short range for 1 minute.',
        identified: true,
      },
    },
    {
      _id: 'cy002',
      name: 'Rejuvenator',
      type: 'cypher',
      system: {
        level: 5,
        form: 'Injector with blue fluid',
        effect: 'Restores 1d6+2 points to one stat Pool of your choice.',
        identified: true,
      },
    },
    // Equipment
    {
      _id: 'eq001',
      name: 'Buzzer',
      type: 'equipment',
      system: {
        quantity: 1,
        description: 'Razor-edged throwing weapon. Light weapon.',
        damage: 2,
        type: 'weapon',
      },
    },
    {
      _id: 'eq002',
      name: 'Clothing (explorer)',
      type: 'equipment',
      system: {
        quantity: 1,
        description: 'Durable clothing suited for exploration.',
        type: 'armor',
        armor: 0,
      },
    },
    {
      _id: 'eq003',
      name: 'Glow globe',
      type: 'equipment',
      system: {
        quantity: 2,
        description: 'Illuminates an area. Lasts 1 hour.',
        type: 'gear',
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
    systemVersion: '3.0.0',
    foundryVersion: '12.331',
    exportedAt: '2026-04-05T14:00:00.000Z',
  },
};
