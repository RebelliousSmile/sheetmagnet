/**
 * Realistic City of Mist character actor data
 * Based on Foundry VTT city-of-mist system (taragnor/city-of-mist)
 *
 * City of Mist characters have Themes (Mythos/Logos), each with
 * Power Tags, Weakness Tags, and Story Tags.
 */

import type { ActorData } from '$lib/connectors/foundry';

export const CITY_OF_MIST_CHARACTER: ActorData = {
  id: 'mV8pRn3kW2xYfL5q',
  name: 'Detective Marlowe',
  type: 'character',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  system: {
    mythos: 'Odin, the All-Father',
    logos: 'Private Investigator',
    tokenName: 'Marlowe',
    themes: [
      {
        _id: 'theme001',
        name: 'Eye of Odin',
        type: 'mythos',
        themebook: 'Divination',
        mystery: 'Why can I see the threads of fate?',
        cracked: false,
        unpivortal: false,
        nascent: false,
        attention: 2,
        fade: 0,
        powerTags: [
          {
            _id: 'pt001',
            name: 'Visions of the future',
            burned: false,
            subtag: false,
          },
          {
            _id: 'pt002',
            name: 'Read the runes',
            burned: false,
            subtag: false,
          },
          {
            _id: 'pt003',
            name: 'See through illusions',
            burned: false,
            subtag: false,
          },
          {
            _id: 'pt004',
            name: 'Wisdom of ages',
            burned: true,
            subtag: false,
          },
        ],
        weaknessTags: [
          {
            _id: 'wt001',
            name: 'Blind in one eye',
            burned: false,
            subtag: false,
          },
        ],
      },
      {
        _id: 'theme002',
        name: 'The Ravens',
        type: 'mythos',
        themebook: 'Familiar',
        mystery: 'What do Huginn and Muninn whisper to me?',
        cracked: false,
        unpivortal: false,
        nascent: false,
        attention: 1,
        fade: 0,
        powerTags: [
          {
            _id: 'pt005',
            name: 'Huginn scouts ahead',
            burned: false,
            subtag: false,
          },
          {
            _id: 'pt006',
            name: 'Muninn recalls everything',
            burned: false,
            subtag: false,
          },
          {
            _id: 'pt007',
            name: 'Speak through the ravens',
            burned: false,
            subtag: false,
          },
        ],
        weaknessTags: [
          {
            _id: 'wt002',
            name: 'Conspicuous birds',
            burned: false,
            subtag: false,
          },
        ],
      },
      {
        _id: 'theme003',
        name: 'Gumshoe for Hire',
        type: 'logos',
        themebook: 'Routine',
        identity: 'I solve cases others have given up on.',
        cracked: false,
        unpivortal: false,
        nascent: false,
        attention: 0,
        fade: 1,
        powerTags: [
          {
            _id: 'pt008',
            name: 'Read people like a book',
            burned: false,
            subtag: false,
          },
          {
            _id: 'pt009',
            name: 'Follow the clues',
            burned: false,
            subtag: false,
          },
          {
            _id: 'pt010',
            name: 'Network of informants',
            burned: false,
            subtag: false,
          },
        ],
        weaknessTags: [
          {
            _id: 'wt003',
            name: "Can't let a case go",
            burned: false,
            subtag: false,
          },
        ],
      },
      {
        _id: 'theme004',
        name: 'The Old Neighborhood',
        type: 'logos',
        themebook: 'Possessions',
        identity: 'This city is my home and I protect it.',
        cracked: false,
        unpivortal: false,
        nascent: false,
        attention: 0,
        fade: 0,
        powerTags: [
          {
            _id: 'pt011',
            name: 'Office above the diner',
            burned: false,
            subtag: false,
          },
          {
            _id: 'pt012',
            name: 'Trusty revolver',
            burned: false,
            subtag: false,
          },
          {
            _id: 'pt013',
            name: 'Old muscle car',
            burned: false,
            subtag: false,
          },
        ],
        weaknessTags: [
          {
            _id: 'wt004',
            name: 'Behind on rent',
            burned: false,
            subtag: false,
          },
        ],
      },
    ],
    storyTags: [
      { _id: 'st001', name: 'Knows the streets', burned: false },
      { _id: 'st002', name: 'Owes a favor to Big Sal', burned: false },
      { _id: 'st003', name: 'Has a police contact', burned: false },
    ],
    statuses: [
      { _id: 'stat001', name: 'Tired', tier: 2, ppierce: false },
      {
        _id: 'stat002',
        name: 'Suspicious of everyone',
        tier: 1,
        ppierce: false,
      },
    ],
    clues: [
      'The warehouse fire was no accident',
      'Someone inside the precinct is covering tracks',
    ],
    juice: 0,
    helpPoints: 0,
    hurtPoints: 0,
    buildUp: {
      mythos: 3,
      logos: 1,
    },
    description:
      'A grizzled PI with one clouded eye and two ravens that follow him everywhere. He sees more than he lets on.',
  },
  items: [
    {
      _id: 'move001',
      name: 'Investigate',
      type: 'move',
      system: {
        moveType: 'core',
        description:
          'When you use your abilities to discover something, roll+Power.',
      },
    },
    {
      _id: 'move002',
      name: 'Convince',
      type: 'move',
      system: {
        moveType: 'core',
        description:
          'When you try to get someone to do what you want, roll+Power.',
      },
    },
    {
      _id: 'move003',
      name: 'Go Toe to Toe',
      type: 'move',
      system: {
        moveType: 'core',
        description: 'When you clash with a threat directly, roll+Power.',
      },
    },
    {
      _id: 'move004',
      name: 'Take the Risk',
      type: 'move',
      system: {
        moveType: 'core',
        description:
          'When you do something risky or act under pressure, roll+Power.',
      },
    },
    {
      _id: 'move005',
      name: 'Sneak Around',
      type: 'move',
      system: {
        moveType: 'core',
        description:
          'When you try to go unnoticed or act stealthily, roll+Power.',
      },
    },
  ],
  effects: [],
  flags: {},
  prototypeToken: {
    name: 'Marlowe',
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
    systemId: 'city-of-mist',
    systemVersion: '2.5.0',
    foundryVersion: '12.331',
    exportedAt: '2026-04-04T20:00:00.000Z',
  },
};
