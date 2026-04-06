/**
 * Realistic Legend in the Mist character actor data
 * Based on Foundry VTT mist-engine-fvtt system (MrTheBino/mist-engine-fvtt)
 *
 * ARCHITECTURE:
 * - actor.system has: biography, floatingTagsAndStatuses[], fellowships[], promises
 * - Items are: themebook (with powertags/weaknesstags arrays)
 * - Tags/statuses on actor.system.floatingTagsAndStatuses[] (not items)
 *
 * Source: https://github.com/MrTheBino/mist-engine-fvtt
 */

import type { ActorData } from '$lib/connectors/foundry';

export const LITM_CHARACTER: ActorData = {
  id: 'qR9pLm4nK7xWvB2f',
  name: 'Sienna Blackwood',
  type: 'litm-character',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
  system: {
    biography:
      '<p>A street artist who discovered she can paint doorways into other worlds.</p>',
    editMode: false,
    shortDescription: 'Mythic street artist with portal powers',
    customBackground: '',
    customFontColor: '',
    floatingTagsAndStatusesEditable: false,
    floatingTagsAndStatuses: [
      {
        name: 'Portal Sight',
        value: 2,
        isStatus: false,
        burned: false,
        toBurn: false,
        selected: false,
        positive: true,
        markings: [true, true, false, false, false, false],
        might: 0,
        mightIcon: 'adventure',
      },
      {
        name: 'Street Smart',
        value: 1,
        isStatus: false,
        burned: false,
        toBurn: false,
        selected: false,
        positive: true,
        markings: [true, false, false, false, false, false],
        might: 0,
        mightIcon: 'adventure',
      },
      {
        name: 'Spray Cans of Power',
        value: 1,
        isStatus: false,
        burned: false,
        toBurn: false,
        selected: true,
        positive: true,
        markings: [true, false, false, false, false, false],
        might: 0,
        mightIcon: 'adventure',
      },
      {
        name: 'Disoriented',
        value: 2,
        isStatus: true,
        burned: false,
        toBurn: false,
        selected: false,
        positive: false,
        markings: [true, true, false, false, false, false],
        might: 0,
        mightIcon: 'adventure',
      },
      {
        name: 'Inspired',
        value: 3,
        isStatus: true,
        burned: false,
        toBurn: false,
        selected: false,
        positive: true,
        markings: [true, true, true, false, false, false],
        might: 0,
        mightIcon: 'adventure',
      },
    ],
    notes: 'Looking for the source of the rifts in the Murals District.',
    promises: 2,
    actorSharedSingleThemecardId: '',
    fellowships: [
      {
        companion: 'Marco the Forger',
        relationshipTag: 'Trusted fence',
        selected: false,
        scratched: false,
      },
      {
        companion: 'Detective Lin',
        relationshipTag: 'Reluctant ally',
        selected: false,
        scratched: false,
      },
    ],
  },
  items: [
    // Themebook 1: The Painted Door (mythos)
    {
      _id: 'tb001',
      name: 'The Painted Door',
      type: 'themebook',
      system: {
        description: 'Portals painted with enchanted pigments',
        type: 'Mythos',
        color: '#6a0dad',
        quest: 'Find all the lost murals before they fade',
        story: 'The doors appeared when the old artist died',
        abandon: 0,
        improve: 1,
        milestone: 0,
        powertags: [
          {
            name: 'Open a door anywhere',
            question: 'Where does this door lead?',
            burned: false,
            toBurn: false,
            planned: false,
            selected: false,
          },
          {
            name: 'See between worlds',
            question: 'What do I see on the other side?',
            burned: false,
            toBurn: false,
            planned: false,
            selected: false,
          },
          {
            name: 'Close a rift',
            question: '',
            burned: true,
            toBurn: false,
            planned: false,
            selected: false,
          },
        ],
        weaknesstags: [
          {
            name: 'Doors attract unwanted visitors',
            question: '',
            burned: false,
            toBurn: false,
            planned: false,
            selected: false,
          },
        ],
        themeKitUUID: '',
        specialImprovements: [
          {
            name: 'Portal Mastery',
            active: false,
            description: 'Can keep a door open indefinitely',
          },
          {
            name: 'Dimensional Anchor',
            active: true,
            description: 'Can stabilize a rift permanently',
          },
        ],
      },
    },
    // Themebook 2: Street Art Life (logos)
    {
      _id: 'tb002',
      name: 'Street Art Life',
      type: 'themebook',
      system: {
        description: 'The hustle and connections of an underground artist',
        type: 'Logos',
        color: '#ff6b35',
        quest: 'Get recognized without selling out',
        story: 'The murals are messages from the Rift',
        abandon: 0,
        improve: 0,
        milestone: 1,
        powertags: [
          {
            name: 'Know every alley and rooftop',
            question: '',
            burned: false,
            toBurn: false,
            planned: false,
            selected: false,
          },
          {
            name: 'Read the street signs',
            question: 'What are the streets telling me?',
            burned: false,
            toBurn: false,
            planned: false,
            selected: false,
          },
        ],
        weaknesstags: [
          {
            name: 'Wanted by the city for vandalism',
            question: '',
            burned: false,
            toBurn: false,
            planned: false,
            selected: false,
          },
        ],
        themeKitUUID: '',
        specialImprovements: [],
      },
    },
    // Backpack
    {
      _id: 'bp001',
      name: 'Backpack',
      type: 'backpack',
      system: {
        items: [
          {
            name: 'Enchanted spray cans',
            question: '',
            burned: false,
            toBurn: false,
            planned: false,
            selected: false,
          },
          {
            name: 'Old sketchbook',
            question: '',
            burned: false,
            toBurn: false,
            planned: false,
            selected: false,
          },
        ],
      },
    },
  ],
  effects: [],
  flags: {},
  prototypeToken: {
    name: 'Sienna',
    displayName: 20,
    actorLink: true,
    width: 1,
    height: 1,
    texture: {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
    },
    disposition: 1,
  },
  _meta: {
    systemId: 'mist-engine-fvtt',
    systemVersion: '14.0.0',
    foundryVersion: '14.0.0',
    exportedAt: '2026-04-05T10:00:00.000Z',
  },
};
