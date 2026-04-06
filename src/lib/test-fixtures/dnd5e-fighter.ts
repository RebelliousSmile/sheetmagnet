/**
 * Realistic D&D 5e Fighter (Level 5) actor data
 * Based on Foundry VTT dnd5e system data model (v3.x)
 *
 * Field names match actual Foundry actor.toObject() output.
 */

import type { ActorData } from '$lib/connectors/foundry';

export const DND5E_FIGHTER: ActorData = {
  id: 'xK7vPq2nR4mWdB9s',
  name: 'Kael Ironforge',
  type: 'character',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  system: {
    abilities: {
      str: {
        value: 18,
        proficient: 1,
        max: null,
        bonuses: { check: '', save: '' },
      },
      dex: {
        value: 14,
        proficient: 0,
        max: null,
        bonuses: { check: '', save: '' },
      },
      con: {
        value: 16,
        proficient: 1,
        max: null,
        bonuses: { check: '', save: '' },
      },
      int: {
        value: 10,
        proficient: 0,
        max: null,
        bonuses: { check: '', save: '' },
      },
      wis: {
        value: 12,
        proficient: 0,
        max: null,
        bonuses: { check: '', save: '' },
      },
      cha: {
        value: 8,
        proficient: 0,
        max: null,
        bonuses: { check: '', save: '' },
      },
    },
    attributes: {
      hp: { value: 44, max: 44, temp: 0, bonuses: { level: '', overall: '' } },
      ac: { flat: 18, calc: 'default', formula: '' },
      init: { ability: 'dex', bonus: '0' },
      death: { success: 0, failure: 0 },
      inspiration: false,
      prof: 3,
      movement: {
        burrow: 0,
        climb: 0,
        fly: 0,
        swim: 0,
        walk: 30,
        units: 'ft',
        hover: false,
      },
      senses: {
        darkvision: 60,
        blindsight: 0,
        tremorsense: 0,
        truesight: 0,
        units: 'ft',
        special: '',
      },
      spellcasting: '',
    },
    details: {
      level: 5,
      xp: { value: 6500 },
      background: 'Soldier',
      originalClass: 'fighter',
      race: 'Mountain Dwarf',
      alignment: 'Lawful Good',
      appearance: 'Stocky with braided red beard and battle scars',
      trait: 'I face problems head-on. A simple direct solution is the best.',
      ideal:
        'Greater Good. Our lot is to lay down our lives in defense of others.',
      bond: 'I would still lay down my life for the people I served with.',
      flaw: 'I made a terrible mistake in battle that cost many lives.',
      gender: 'Male',
      eyes: 'Amber',
      height: '4\'5"',
      weight: '180 lbs',
      hair: 'Red',
      skin: 'Tan',
      age: '65',
      faith: 'Moradin',
    },
    skills: {
      acr: { value: 0, ability: 'dex' },
      ani: { value: 0, ability: 'wis' },
      arc: { value: 0, ability: 'int' },
      ath: { value: 1, ability: 'str' },
      dec: { value: 0, ability: 'cha' },
      his: { value: 0, ability: 'int' },
      ins: { value: 0, ability: 'wis' },
      itm: { value: 1, ability: 'cha' },
      inv: { value: 0, ability: 'int' },
      med: { value: 0, ability: 'wis' },
      nat: { value: 0, ability: 'int' },
      prc: { value: 1, ability: 'wis' },
      prf: { value: 0, ability: 'cha' },
      per: { value: 0, ability: 'cha' },
      rel: { value: 0, ability: 'int' },
      slt: { value: 0, ability: 'dex' },
      ste: { value: 0, ability: 'dex' },
      sur: { value: 1, ability: 'wis' },
    },
    traits: {
      size: 'med',
      languages: { value: ['common', 'dwarvish'], custom: '' },
      weaponProf: { value: ['sim', 'mar'], custom: '' },
      armorProf: { value: ['lgt', 'med', 'hvy', 'shl'], custom: '' },
      di: { value: [], custom: '' },
      dr: { value: ['poison'], custom: '' },
      dv: { value: [], custom: '' },
      ci: { value: [], custom: '' },
    },
    currency: {
      pp: 2,
      gp: 45,
      ep: 0,
      sp: 12,
      cp: 30,
    },
    resources: {
      primary: {
        value: 1,
        max: 1,
        sr: true,
        lr: true,
        label: 'Second Wind',
      },
      secondary: {
        value: 1,
        max: 1,
        sr: true,
        lr: true,
        label: 'Action Surge',
      },
      tertiary: { value: 0, max: 0, sr: false, lr: false, label: '' },
    },
    spells: {
      spell1: { value: 0, max: 0, override: null },
      spell2: { value: 0, max: 0, override: null },
      spell3: { value: 0, max: 0, override: null },
    },
    bonuses: {
      mwak: { attack: '', damage: '' },
      rwak: { attack: '', damage: '' },
      msak: { attack: '', damage: '' },
      rsak: { attack: '', damage: '' },
      abilities: { check: '', save: '', skill: '' },
      spell: { dc: '' },
    },
  },
  items: [
    {
      _id: 'item001',
      name: 'Battleaxe +1',
      type: 'weapon',
      img: 'icons/weapons/axes/axe-battle.webp',
      system: {
        quantity: 1,
        weight: { value: 4, units: 'lb' },
        damage: { parts: [['1d8+5', 'slashing']], versatile: '1d10+5' },
        actionType: 'mwak',
        attackBonus: '1',
        proficient: true,
        equipped: true,
        rarity: 'uncommon',
        description: {
          value:
            '<p>A finely crafted dwarven battleaxe with runes of power.</p>',
        },
      },
    },
    {
      _id: 'item002',
      name: 'Handaxe',
      type: 'weapon',
      img: 'icons/weapons/axes/axe-hand.webp',
      system: {
        quantity: 2,
        weight: { value: 2, units: 'lb' },
        damage: { parts: [['1d6+4', 'slashing']], versatile: '' },
        actionType: 'mwak',
        range: { value: 20, long: 60, units: 'ft' },
        proficient: true,
        equipped: true,
        rarity: 'common',
        description: { value: '<p>Light throwing axes.</p>' },
      },
    },
    {
      _id: 'item003',
      name: 'Chain Mail',
      type: 'equipment',
      img: 'icons/equipment/chest/breastplate-chain.webp',
      system: {
        quantity: 1,
        weight: { value: 55, units: 'lb' },
        armor: { value: 16, type: 'heavy', dex: 0 },
        equipped: true,
        rarity: 'common',
        stealth: true,
        strength: 13,
        description: {
          value: '<p>Made of interlocking metal rings.</p>',
        },
      },
    },
    {
      _id: 'item004',
      name: 'Shield',
      type: 'equipment',
      img: 'icons/equipment/shield/heater-steel.webp',
      system: {
        quantity: 1,
        weight: { value: 6, units: 'lb' },
        armor: { value: 2, type: 'shield' },
        equipped: true,
        rarity: 'common',
        description: {
          value: '<p>A wooden shield reinforced with iron.</p>',
        },
      },
    },
    {
      _id: 'item005',
      name: "Explorer's Pack",
      type: 'equipment',
      img: 'icons/containers/bags/pack-leather-brown.webp',
      system: {
        quantity: 1,
        weight: { value: 59, units: 'lb' },
        equipped: false,
        rarity: 'common',
        description: {
          value:
            '<p>Includes a backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days of rations, and a waterskin.</p>',
        },
      },
    },
    {
      _id: 'item006',
      name: 'Potion of Healing',
      type: 'consumable',
      img: 'icons/consumables/potions/potion-red.webp',
      system: {
        quantity: 3,
        weight: { value: 0.5, units: 'lb' },
        rarity: 'common',
        uses: { value: 1, max: 1, per: 'charges', autoDestroy: true },
        description: {
          value: '<p>Regain 2d4+2 hit points when you drink this potion.</p>',
        },
      },
    },
    {
      _id: 'feat001',
      name: 'Second Wind',
      type: 'feat',
      img: 'icons/magic/life/heart-glow-red.webp',
      system: {
        description: {
          value:
            '<p>You have a limited well of stamina. On your turn, you can use a bonus action to regain 1d10+5 hit points. Once used, you must finish a short or long rest to use it again.</p>',
        },
        activation: { type: 'bonus', cost: 1 },
        uses: { value: 1, max: 1, per: 'sr' },
        requirements: 'Fighter 1',
      },
    },
    {
      _id: 'feat002',
      name: 'Action Surge',
      type: 'feat',
      img: 'icons/skills/melee/blade-tips-triple-steel.webp',
      system: {
        description: {
          value:
            '<p>You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once used, you must finish a short or long rest to use it again.</p>',
        },
        activation: { type: 'special', cost: 1 },
        uses: { value: 1, max: 1, per: 'sr' },
        requirements: 'Fighter 2',
      },
    },
    {
      _id: 'feat003',
      name: 'Extra Attack',
      type: 'feat',
      img: 'icons/skills/melee/strike-sword-steel.webp',
      system: {
        description: {
          value:
            '<p>You can attack twice, instead of once, whenever you take the Attack action on your turn.</p>',
        },
        requirements: 'Fighter 5',
      },
    },
    {
      _id: 'feat004',
      name: 'Great Weapon Master',
      type: 'feat',
      img: 'icons/skills/melee/weapons-crossed-swords-black.webp',
      system: {
        description: {
          value:
            '<p>Before you make a melee attack with a heavy weapon, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the damage.</p>',
        },
        requirements: '',
      },
    },
  ],
  effects: [
    {
      _id: 'eff001',
      name: 'Dwarven Resilience',
      img: 'icons/magic/defensive/shield-barrier-glowing-gold.webp',
      disabled: false,
      duration: { startTime: null, seconds: null, rounds: null, turns: null },
      changes: [
        {
          key: 'system.traits.dr.value',
          mode: 2,
          value: 'poison',
          priority: 20,
        },
      ],
    },
  ],
  flags: {
    dnd5e: {
      initiativeAdv: false,
    },
  },
  prototypeToken: {
    name: 'Kael Ironforge',
    displayName: 20,
    actorLink: true,
    width: 1,
    height: 1,
    texture: {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    },
    disposition: 1,
    sight: { enabled: true, range: 60, visionMode: 'darkvision' },
    bar1: { attribute: 'attributes.hp' },
    bar2: { attribute: null },
  },
  _meta: {
    systemId: 'dnd5e',
    systemVersion: '3.2.1',
    foundryVersion: '12.331',
    exportedAt: '2026-04-04T20:00:00.000Z',
  },
};
