/**
 * Apocalypse World character (The Battlebabe)
 * Based on Foundry VTT pbta system (asacolips-projects/pbta)
 *
 * PbtA uses a TOML-configurable data model:
 * - actor.system.stats: object keyed by stat name, each {value}
 * - actor.system.details: configurable fields (look, gear, Hx, etc.)
 * - actor.items: moves, playbook, equipment
 */

import type { ActorData } from '$lib/connectors/foundry';

export const PBTA_AW_CHARACTER: ActorData = {
  id: 'wK3mRp7nL5xYqB8v',
  name: 'Cass',
  type: 'character',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  system: {
    stats: {
      cool: { value: 3 },
      hard: { value: 1 },
      hot: { value: 1 },
      sharp: { value: 1 },
      weird: { value: -1 },
    },
    playbook: {
      name: 'The Battlebabe',
      slug: 'battlebabe',
      uuid: '',
    },
    details: {
      look: 'Woman, formal wear, calculating eyes, graceful hands',
      gear: 'Custom firearms (2-harm close loud), hidden knives (2-harm hand)',
      hx: [
        { name: 'Dog Head', value: 2 },
        { name: 'Dust', value: -1 },
        { name: 'Matilda', value: 1 },
      ],
    },
    resources: {
      harm: {
        value: 1,
        max: 6,
      },
      experience: {
        value: 3,
        max: 5,
      },
    },
    advancements: ['Get +1cool (max +3)', 'Get a new battlebabe move'],
    biography: 'Even in a burned-over world, some people still have style.',
  },
  items: [
    // Playbook
    {
      _id: 'pb001',
      name: 'The Battlebabe',
      type: 'playbook',
      system: {
        description:
          'Even in a character-making process where you get to be apocalyptically cool, the battlebabe is the coolest.',
        slug: 'battlebabe',
      },
    },
    // Basic moves
    {
      _id: 'mv001',
      name: 'Act Under Fire',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.cool.value',
        description:
          'When you do something under fire, or dig in to endure fire, roll+cool.',
      },
    },
    {
      _id: 'mv002',
      name: 'Go Aggro',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.hard.value',
        description: 'When you go aggro on someone, roll+hard.',
      },
    },
    {
      _id: 'mv003',
      name: 'Seduce or Manipulate',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.hot.value',
        description: 'When you try to seduce or manipulate someone, roll+hot.',
      },
    },
    {
      _id: 'mv004',
      name: 'Read a Sitch',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.sharp.value',
        description: 'When you read a charged situation, roll+sharp.',
      },
    },
    {
      _id: 'mv005',
      name: 'Open Your Brain',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.weird.value',
        description:
          "When you open your brain to the world's psychic maelstrom, roll+weird.",
      },
    },
    // Playbook moves
    {
      _id: 'mv006',
      name: 'Dangerous & Sexy',
      type: 'move',
      system: {
        moveType: 'playbook',
        rollType: 'move',
        rollFormula: '2d6+@stats.hot.value',
        description:
          'When you enter into a charged situation, roll+hot. On a 10+, hold 2. On a 7-9, hold 1.',
      },
    },
    {
      _id: 'mv007',
      name: 'Ice Cold',
      type: 'move',
      system: {
        moveType: 'playbook',
        rollType: 'move',
        rollFormula: '',
        description:
          "When you go aggro on an NPC, roll+cool instead of roll+hard. When you go aggro on another player's character, roll+Hx instead of roll+hard.",
      },
    },
    // Gear
    {
      _id: 'eq001',
      name: 'Custom firearms',
      type: 'equipment',
      system: {
        tags: '2-harm close loud',
        quantity: 1,
      },
    },
    {
      _id: 'eq002',
      name: 'Hidden knives',
      type: 'equipment',
      system: {
        tags: '2-harm hand',
        quantity: 2,
      },
    },
  ],
  effects: [],
  flags: {},
  prototypeToken: {
    name: 'Cass',
    displayName: 20,
    actorLink: true,
    width: 1,
    height: 1,
    texture: {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    },
    disposition: 1,
  },
  _meta: {
    systemId: 'pbta',
    systemVersion: '4.0.0',
    foundryVersion: '12.331',
    exportedAt: '2026-04-05T12:00:00.000Z',
  },
};
