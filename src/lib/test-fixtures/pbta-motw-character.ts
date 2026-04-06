/**
 * Monster of the Week character (The Chosen)
 * Based on Foundry VTT pbta system (asacolips-projects/pbta)
 *
 * MotW stats: Charm, Cool, Sharp, Tough, Weird
 * Uses same PbtA engine with different stat names and move sets.
 */

import type { ActorData } from '$lib/connectors/foundry';

export const PBTA_MOTW_CHARACTER: ActorData = {
  id: 'bN5kWm3rQ9xLfH2p',
  name: 'Elena Torres',
  type: 'character',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  system: {
    stats: {
      charm: { value: 0 },
      cool: { value: 1 },
      sharp: { value: 1 },
      tough: { value: 2 },
      weird: { value: -1 },
    },
    playbook: {
      name: 'The Chosen',
      slug: 'chosen',
      uuid: '',
    },
    details: {
      look: 'Athletic build, leather jacket, determined eyes, old scars',
      gear: 'Big sword (3-harm hand messy), protective amulet (1-armour)',
      luck: { value: 4, max: 7 },
    },
    resources: {
      harm: { value: 2, max: 7 },
      experience: { value: 1, max: 5 },
      luck: { value: 4, max: 7 },
    },
    biography:
      'Elena was chosen by fate at 16 when she survived a vampire attack. She has been hunting since.',
  },
  items: [
    // Playbook
    {
      _id: 'pb001',
      name: 'The Chosen',
      type: 'playbook',
      system: {
        description:
          'Your birth was prophesied. You are the Chosen One, and with your abilities come the responsibility to fight the forces of evil.',
        slug: 'chosen',
      },
    },
    // Basic moves
    {
      _id: 'mv001',
      name: 'Act Under Pressure',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.cool.value',
        description: 'When you act under pressure, roll+Cool.',
      },
    },
    {
      _id: 'mv002',
      name: 'Help Out',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.cool.value',
        description: 'When you help another hunter, roll+Cool.',
      },
    },
    {
      _id: 'mv003',
      name: 'Investigate a Mystery',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.sharp.value',
        description: 'When you investigate a mystery, roll+Sharp.',
      },
    },
    {
      _id: 'mv004',
      name: 'Kick Some Ass',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.tough.value',
        description: 'When you get into a fight and kick some ass, roll+Tough.',
      },
    },
    {
      _id: 'mv005',
      name: 'Manipulate Someone',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.charm.value',
        description: 'When you want someone to do something, roll+Charm.',
      },
    },
    {
      _id: 'mv006',
      name: 'Use Magic',
      type: 'move',
      system: {
        moveType: 'basic',
        rollType: 'move',
        rollFormula: '2d6+@stats.weird.value',
        description: 'When you use magic, roll+Weird.',
      },
    },
    // Playbook moves
    {
      _id: 'mv007',
      name: 'The Chosen One',
      type: 'move',
      system: {
        moveType: 'playbook',
        rollType: 'move',
        rollFormula: '',
        description:
          'You have a special destiny. Mark experience every time the prophecy guides you.',
      },
    },
    {
      _id: 'mv008',
      name: 'Devastating',
      type: 'move',
      system: {
        moveType: 'playbook',
        rollType: 'move',
        rollFormula: '',
        description: 'When you inflict harm, you can inflict +1 harm.',
      },
    },
    // Gear
    {
      _id: 'eq001',
      name: 'Big old sword',
      type: 'equipment',
      system: {
        tags: '3-harm hand messy',
        quantity: 1,
      },
    },
    {
      _id: 'eq002',
      name: 'Protective amulet',
      type: 'equipment',
      system: {
        tags: '1-armour magical',
        quantity: 1,
      },
    },
  ],
  effects: [],
  flags: {},
  prototypeToken: {
    name: 'Elena',
    displayName: 20,
    actorLink: true,
    width: 1,
    height: 1,
    texture: {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
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
