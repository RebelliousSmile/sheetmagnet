import { describe, expect, it } from 'vitest';
import {
  getTemplate,
  listTemplates,
  TEMPLATE_A3,
  TEMPLATE_A4,
  TEMPLATE_A5,
  TEMPLATE_A6,
  TEMPLATE_POKER_CARD,
} from './definitions';
import { MM_TO_PT, MM_TO_PX_96, mmToPt, mmToPx, resolve } from './engine';
import type { TemplateDefinition } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// Unit conversions
// ──────────────────────────────────────────────────────────────────────────────

describe('mmToPt', () => {
  it('converts 0mm to 0pt', () => {
    expect(mmToPt(0)).toBe(0);
  });

  it('converts 1mm correctly using MM_TO_PT constant', () => {
    expect(mmToPt(1)).toBe(MM_TO_PT);
  });

  it('converts 210mm (A4 width) to correct pt value', () => {
    expect(mmToPt(210)).toBeCloseTo(210 * 2.83465, 5);
  });
});

describe('mmToPx', () => {
  it('converts 0mm to 0px', () => {
    expect(mmToPx(0)).toBe(0);
  });

  it('converts 1mm at 96dpi using MM_TO_PX_96 constant', () => {
    expect(mmToPx(1)).toBeCloseTo(MM_TO_PX_96, 4);
  });

  it('converts 210mm at 96dpi correctly', () => {
    expect(mmToPx(210)).toBeCloseTo(210 * (96 / 25.4), 4);
  });

  it('converts 210mm at 300dpi correctly', () => {
    expect(mmToPx(210, 300)).toBeCloseTo(210 * (300 / 25.4), 4);
  });

  it('converts 25.4mm at 96dpi to exactly 96px', () => {
    expect(mmToPx(25.4, 96)).toBeCloseTo(96, 4);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Template dimensions
// ──────────────────────────────────────────────────────────────────────────────

describe('TEMPLATE_A4 dimensions', () => {
  it('has 210mm width', () => {
    expect(TEMPLATE_A4.meta.width).toBe(210);
  });

  it('has 297mm height', () => {
    expect(TEMPLATE_A4.meta.height).toBe(297);
  });
});

describe('TEMPLATE_A5 dimensions', () => {
  it('has 148mm width', () => {
    expect(TEMPLATE_A5.meta.width).toBe(148);
  });

  it('has 210mm height', () => {
    expect(TEMPLATE_A5.meta.height).toBe(210);
  });
});

describe('TEMPLATE_A6 dimensions', () => {
  it('has 105mm width', () => {
    expect(TEMPLATE_A6.meta.width).toBe(105);
  });

  it('has 148mm height', () => {
    expect(TEMPLATE_A6.meta.height).toBe(148);
  });
});

describe('TEMPLATE_A3 dimensions', () => {
  it('has 297mm width', () => {
    expect(TEMPLATE_A3.meta.width).toBe(297);
  });

  it('has 420mm height', () => {
    expect(TEMPLATE_A3.meta.height).toBe(420);
  });
});

describe('TEMPLATE_POKER_CARD dimensions', () => {
  it('has 63mm width', () => {
    expect(TEMPLATE_POKER_CARD.meta.width).toBe(63);
  });

  it('has 88mm height', () => {
    expect(TEMPLATE_POKER_CARD.meta.height).toBe(88);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// resolve() — binding resolution
// ──────────────────────────────────────────────────────────────────────────────

const actorData = {
  actor: {
    name: 'Gandalf',
    type: 'character',
    img: 'gandalf.png',
    _meta: {
      systemId: 'dnd5e',
      systemVersion: '3.0.0',
    },
  },
};

describe('resolve() — layout dimensions', () => {
  it('returns width and height from template meta', () => {
    const result = resolve(TEMPLATE_A4, actorData);
    expect(result.width).toBe(210);
    expect(result.height).toBe(297);
  });
});

describe('resolve() — binding interpolation', () => {
  it('resolves {{actor.name}} in text element content', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: '{{actor.name}}',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0]?.content).toBe('Gandalf');
  });

  it('resolves nested binding {{actor._meta.systemId}}', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: '{{actor._meta.systemId}} v{{actor._meta.systemVersion}}',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements[0]?.content).toBe('dnd5e v3.0.0');
  });

  it('resolves missing binding to empty string', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: '{{actor.nonexistent}}',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements[0]?.content).toBe('');
  });

  it('resolves image src binding', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'image',
          x: 0,
          y: 0,
          src: '{{actor.img}}',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements[0]?.imageData).toBe('gandalf.png');
  });
});

describe('resolve() — condition filtering', () => {
  it('includes element when condition is truthy', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'visible',
          condition: '{{actor.name}}',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(1);
  });

  it('excludes element when condition is falsy', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'hidden',
          condition: '{{actor.nonexistent}}',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(0);
  });
});

describe('resolve() — element types', () => {
  it('resolves rect element', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'rect',
          x: 5,
          y: 10,
          width: 50,
          height: 20,
          style: { fill: '#ff0000' },
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0]?.type).toBe('rect');
    expect(result.elements[0]?.x).toBe(5);
    expect(result.elements[0]?.y).toBe(10);
  });

  it('resolves line element', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'line',
          x: 0,
          y: 10,
          x2: 100,
          y2: 10,
          style: { stroke: '#000000', strokeWidth: 1 },
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0]?.type).toBe('line');
    expect(result.elements[0]?.x2).toBe(100);
    expect(result.elements[0]?.y2).toBe(10);
  });

  it('ignores unknown element types', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        // Force unknown type through cast
        { type: 'unknown' as never, x: 0, y: 0 },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(0);
  });
});

describe('resolve() — group element', () => {
  it('offsets children by group x/y', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'group',
          x: 10,
          y: 20,
          elements: [
            {
              type: 'text',
              x: 5,
              y: 5,
              content: 'child',
            },
          ],
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0]?.x).toBe(15); // 10 + 5
    expect(result.elements[0]?.y).toBe(25); // 20 + 5
  });

  it('filters out group children that fail condition', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'group',
          x: 0,
          y: 0,
          elements: [
            {
              type: 'text',
              x: 0,
              y: 0,
              content: 'hidden',
              condition: '{{actor.missing}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(0);
  });
});

describe('resolve() — repeat element', () => {
  const dataWithItems = {
    actor: {
      name: 'Gandalf',
      items: [
        { name: 'Staff', qty: 1 },
        { name: 'Ring', qty: 1 },
        { name: 'Pipe', qty: 1 },
      ],
    },
  };

  it('renders one element per item vertically', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 200,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 0,
          y: 0,
          bind: '{{actor.items}}',
          direction: 'vertical',
          gap: 5,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              width: 100,
              height: 20,
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, dataWithItems);
    expect(result.elements).toHaveLength(3);
    expect(result.elements[0]?.content).toBe('Staff');
    expect(result.elements[1]?.content).toBe('Ring');
    expect(result.elements[2]?.content).toBe('Pipe');
  });

  it('offsets items vertically by (height + gap)', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 200,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 0,
          y: 10,
          bind: '{{actor.items}}',
          direction: 'vertical',
          gap: 5,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              width: 100,
              height: 20,
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, dataWithItems);
    expect(result.elements[0]?.y).toBe(10); // y=10 + offset=0
    expect(result.elements[1]?.y).toBe(35); // y=10 + offset=(20+5)
    expect(result.elements[2]?.y).toBe(60); // y=10 + offset=2*(20+5)
  });

  it('offsets items horizontally by (width + gap)', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 300,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 5,
          y: 0,
          bind: '{{actor.items}}',
          direction: 'horizontal',
          gap: 10,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              width: 80,
              height: 20,
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, dataWithItems);
    expect(result.elements[0]?.x).toBe(5); // x=5 + offsetX=0
    expect(result.elements[1]?.x).toBe(95); // x=5 + offsetX=(80+10)
    expect(result.elements[2]?.x).toBe(185); // x=5 + offsetX=2*(80+10)
  });

  it('respects maxItems limit', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 200,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 0,
          y: 0,
          bind: '{{actor.items}}',
          direction: 'vertical',
          gap: 0,
          maxItems: 2,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              width: 100,
              height: 20,
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, dataWithItems);
    expect(result.elements).toHaveLength(2);
  });

  it('returns empty when bind path is not an array', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 0,
          y: 0,
          bind: '{{actor.name}}',
          direction: 'vertical',
          gap: 0,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, dataWithItems);
    expect(result.elements).toHaveLength(0);
  });
});

describe('resolve() — style merging', () => {
  it('applies default style when element has no style', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'hello',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0]?.style.fontFamily).toBe('Helvetica');
    expect(result.elements[0]?.style.fontSize).toBe(10);
    expect(result.elements[0]?.style.color).toBe('#000000');
  });

  it('overrides default style with element style', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'hello',
          style: { fontSize: 24, color: '#ff0000' },
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0]?.style.fontSize).toBe(24);
    expect(result.elements[0]?.style.color).toBe('#ff0000');
    // default still applied for non-overridden props
    expect(result.elements[0]?.style.fontFamily).toBe('Helvetica');
  });
});

describe('resolve() — A4 full template smoke test', () => {
  it('resolves A4 template with actor data without throwing', () => {
    const data = {
      actor: {
        name: 'Aragorn',
        type: 'character',
        img: 'aragorn.png',
        _meta: {
          systemId: 'dnd5e',
          systemVersion: '3.0.0',
        },
      },
    };

    const result = resolve(TEMPLATE_A4, data);
    expect(result.width).toBe(210);
    expect(result.height).toBe(297);
    expect(result.elements.length).toBeGreaterThan(0);

    const textElements = result.elements.filter((e) => e.type === 'text');
    const nameEl = textElements.find((e) => e.content === 'Aragorn');
    expect(nameEl).toBeDefined();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Template registry
// ──────────────────────────────────────────────────────────────────────────────

describe('getTemplate', () => {
  it('returns A4 template by id', () => {
    expect(getTemplate('pdf-a4')).toBe(TEMPLATE_A4);
  });

  it('returns A5 template by id', () => {
    expect(getTemplate('pdf-a5')).toBe(TEMPLATE_A5);
  });

  it('returns A6 template by id', () => {
    expect(getTemplate('pdf-a6')).toBe(TEMPLATE_A6);
  });

  it('returns A3 template by id', () => {
    expect(getTemplate('pdf-a3')).toBe(TEMPLATE_A3);
  });

  it('returns poker card template by id', () => {
    expect(getTemplate('png-card')).toBe(TEMPLATE_POKER_CARD);
  });

  it('returns undefined for unknown id', () => {
    expect(getTemplate('nonexistent')).toBeUndefined();
  });
});

describe('listTemplates', () => {
  it('returns all 5 templates', () => {
    const templates = listTemplates();
    expect(templates).toHaveLength(5);
  });

  it('includes A4 in the list', () => {
    expect(listTemplates()).toContain(TEMPLATE_A4);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Edge cases for path traversal with null intermediate
// ──────────────────────────────────────────────────────────────────────────────

describe('resolve() — null intermediate in path traversal', () => {
  it('returns empty string when intermediate value is null', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: '{{actor.nullField.deeper}}',
        },
      ],
    };

    const data = { actor: { nullField: null } };
    const result = resolve(
      template,
      data as unknown as Record<string, unknown>,
    );
    expect(result.elements[0]?.content).toBe('');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// repeat element with template missing width/height (uses ?? 0 fallback)
// ──────────────────────────────────────────────────────────────────────────────

describe('resolve() — repeat with template elements missing dimensions', () => {
  it('handles vertical repeat with no height on template element (uses 0 fallback)', () => {
    const dataWithItems = {
      actor: {
        items: [{ name: 'A' }, { name: 'B' }],
      },
    };

    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 200,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 0,
          y: 0,
          bind: '{{actor.items}}',
          direction: 'vertical',
          gap: 5,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              // No height defined — triggers ?? 0
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, dataWithItems);
    // Both items land at y=0 because height=undefined => 0 + gap=5, but offset starts at 0
    expect(result.elements).toHaveLength(2);
    expect(result.elements[0]?.y).toBe(0);
    // offset = (undefined ?? 0) + 5 = 5
    expect(result.elements[1]?.y).toBe(5);
  });

  it('handles horizontal repeat with no width on template element (uses 0 fallback)', () => {
    const dataWithItems = {
      actor: {
        items: [{ name: 'A' }, { name: 'B' }],
      },
    };

    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 200,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 0,
          y: 0,
          bind: '{{actor.items}}',
          direction: 'horizontal',
          gap: 10,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              // No width defined — triggers ?? 0
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, dataWithItems);
    expect(result.elements).toHaveLength(2);
    expect(result.elements[0]?.x).toBe(0);
    // offset = (undefined ?? 0) + 10 = 10
    expect(result.elements[1]?.x).toBe(10);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// repeat filter support
// ──────────────────────────────────────────────────────────────────────────────

describe('resolve() — repeat with filter', () => {
  const dataWithTypedItems = {
    actor: {
      items: [
        { name: 'Sword', type: 'weapon' },
        { name: 'Shield', type: 'equipment' },
        { name: 'Fireball', type: 'spell' },
        { name: 'Axe', type: 'weapon' },
      ],
    },
  };

  it('filters items by truthy path', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 200,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 0,
          y: 0,
          bind: '{{actor.items}}',
          filter: '{{item.type}}',
          direction: 'vertical',
          gap: 5,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              width: 100,
              height: 10,
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    // All items have truthy type, so all 4 should show
    const result = resolve(template, dataWithTypedItems);
    expect(result.elements).toHaveLength(4);
  });

  it('filters out items with falsy filter path', () => {
    const dataWithMixed = {
      actor: {
        items: [
          { name: 'Sword', equipped: true },
          { name: 'Shield', equipped: false },
          { name: 'Ring', equipped: true },
          { name: 'Potion', equipped: false },
        ],
      },
    };

    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 200,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 0,
          y: 0,
          bind: '{{actor.items}}',
          filter: '{{item.equipped}}',
          direction: 'vertical',
          gap: 5,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              width: 100,
              height: 10,
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, dataWithMixed);
    expect(result.elements).toHaveLength(2);
    expect(result.elements[0]?.content).toBe('Sword');
    expect(result.elements[1]?.content).toBe('Ring');
  });

  it('works with no filter (backward compatible)', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 200,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'repeat',
          x: 0,
          y: 0,
          bind: '{{actor.items}}',
          direction: 'vertical',
          gap: 5,
          template: [
            {
              type: 'text',
              x: 0,
              y: 0,
              width: 100,
              height: 10,
              content: '{{item.name}}',
            },
          ],
        },
      ],
    };

    const result = resolve(template, dataWithTypedItems);
    expect(result.elements).toHaveLength(4);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// named style resolution via styleName
// ──────────────────────────────────────────────────────────────────────────────

describe('resolve() — named styles via styleName', () => {
  it('applies named style when styleName matches', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      styles: {
        heading: { fontSize: 24, fontWeight: 'bold', color: '#ff0000' },
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'hello',
          styleName: 'heading',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements[0]?.style.fontSize).toBe(24);
    expect(result.elements[0]?.style.fontWeight).toBe('bold');
    expect(result.elements[0]?.style.color).toBe('#ff0000');
    // Default style should still fill in unspecified properties
    expect(result.elements[0]?.style.fontFamily).toBe('Helvetica');
  });

  it('inline style overrides named style', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      styles: {
        heading: { fontSize: 24, color: '#ff0000' },
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'hello',
          styleName: 'heading',
          style: { color: '#0000ff' },
        },
      ],
    };

    const result = resolve(template, actorData);
    // Inline color overrides named color
    expect(result.elements[0]?.style.color).toBe('#0000ff');
    // Named fontSize still applies
    expect(result.elements[0]?.style.fontSize).toBe(24);
  });

  it('ignores unknown styleName gracefully', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      styles: {},
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'hello',
          styleName: 'nonexistent',
        },
      ],
    };

    const result = resolve(template, actorData);
    // Should fall back to default style
    expect(result.elements[0]?.style.fontSize).toBe(10);
    expect(result.elements[0]?.style.fontFamily).toBe('Helvetica');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// condition edge cases
// ──────────────────────────────────────────────────────────────────────────────

describe('resolve() — condition edge cases', () => {
  it('condition with value 0 is falsy', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'visible?',
          condition: '{{actor.zero}}',
        },
      ],
    };

    const data = { actor: { zero: 0 } };
    const result = resolve(template, data);
    expect(result.elements).toHaveLength(0);
  });

  it('condition with empty string is falsy', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'visible?',
          condition: '{{actor.empty}}',
        },
      ],
    };

    const data = { actor: { empty: '' } };
    const result = resolve(template, data);
    expect(result.elements).toHaveLength(0);
  });

  it('condition with false is falsy', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'visible?',
          condition: '{{actor.disabled}}',
        },
      ],
    };

    const data = { actor: { disabled: false } };
    const result = resolve(template, data);
    expect(result.elements).toHaveLength(0);
  });

  it('condition with non-zero number is truthy', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: 'visible!',
          condition: '{{actor.count}}',
        },
      ],
    };

    const data = { actor: { count: 42 } };
    const result = resolve(template, data);
    expect(result.elements).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// interpolation edge cases
// ──────────────────────────────────────────────────────────────────────────────

describe('resolve() — interpolation edge cases', () => {
  it('interpolates multiple bindings in one string', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: '{{actor.name}} ({{actor.type}})',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements[0]?.content).toBe('Gandalf (character)');
  });

  it('interpolates number 0 as "0", not empty', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: '{{actor.hp}}',
        },
      ],
    };

    const data = { actor: { hp: 0 } };
    const result = resolve(template, data);
    expect(result.elements[0]?.content).toBe('0');
  });

  it('interpolates boolean false as "false"', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: '{{actor.alive}}',
        },
      ],
    };

    const data = { actor: { alive: false } };
    const result = resolve(template, data);
    expect(result.elements[0]?.content).toBe('false');
  });

  it('deeply nested missing path returns empty string', () => {
    const template: TemplateDefinition = {
      meta: {
        id: 'test',
        name: 'Test',
        width: 100,
        height: 100,
        exports: ['pdf'],
      },
      layout: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: '{{actor.a.b.c.d.e.f.g}}',
        },
      ],
    };

    const result = resolve(template, actorData);
    expect(result.elements[0]?.content).toBe('');
  });
});
