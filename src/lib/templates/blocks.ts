/**
 * Layout Building Blocks — agnostic, reusable template fragments
 *
 * Each function returns RenderElement[] that can be spread into a layout.
 * All coordinates are in mm. All bindings use {{path}} syntax.
 */

import type { ElementStyle, RenderElement } from './types';

// ── Shared style presets ─────────────────────────────────────────────────────

export const BASE_STYLES: Record<string, ElementStyle> = {
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  label: {
    fontSize: 6,
    color: '#999999',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#1a1a2e',
  },
  small: {
    fontSize: 7,
    color: '#666666',
  },
  tagName: {
    fontSize: 7,
    color: '#333333',
  },
};

// ── Page-level blocks ────────────────────────────────────────────────────────

/** Full-page background rect */
export function background(
  width: number,
  height: number,
  fill = '#ffffff',
): RenderElement[] {
  return [{ type: 'rect', x: 0, y: 0, width, height, style: { fill } }];
}

/** Dark header bar with avatar, name, 2 optional subtitle lines, and a badge */
export function header(
  pageWidth: number,
  opts: {
    subtitle1?: string;
    subtitle2?: string;
    badge?: string;
    barHeight?: number;
    barColor?: string;
  } = {},
): RenderElement[] {
  const h = opts.barHeight ?? 50;
  const color = opts.barColor ?? '#1a1a2e';
  const els: RenderElement[] = [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: pageWidth,
      height: h,
      style: { fill: color },
    },
    {
      type: 'image',
      x: 8,
      y: 6,
      width: 38,
      height: 38,
      src: '{{actor.img}}',
      radius: 4,
    },
    {
      type: 'text',
      x: 52,
      y: 12,
      content: '{{actor.name}}',
      style: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
    },
  ];

  if (opts.subtitle1) {
    els.push({
      type: 'text',
      x: 52,
      y: 27,
      content: opts.subtitle1,
      style: { fontSize: 9, color: '#aaaaaa' },
    });
  }
  if (opts.subtitle2) {
    els.push({
      type: 'text',
      x: 52,
      y: 35,
      content: opts.subtitle2,
      style: { fontSize: 8, color: '#888888' },
    });
  }
  if (opts.badge) {
    els.push({
      type: 'text',
      x: pageWidth - 10,
      y: h - 12,
      content: opts.badge,
      style: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#ffffff',
        align: 'right',
      },
    });
  }

  return els;
}

/** Centered footer text */
export function footer(
  text: string,
  pageHeight: number,
  pageWidth = 210,
): RenderElement[] {
  return [
    {
      type: 'text',
      x: pageWidth / 2,
      y: pageHeight - 6,
      content: text,
      style: { fontSize: 5, color: '#cccccc', align: 'center' },
    },
  ];
}

// ── Section blocks ───────────────────────────────────────────────────────────

/** Section title + horizontal separator line */
export function section(
  title: string,
  y: number,
  opts: { x?: number; x2?: number } = {},
): RenderElement[] {
  const x = opts.x ?? 10;
  const x2 = opts.x2 ?? 200;
  return [
    { type: 'text', x, y, content: title, styleName: 'sectionTitle' },
    {
      type: 'line',
      x,
      y: y + 7,
      x2,
      y2: y + 7,
      style: { stroke: '#eeeeee', strokeWidth: 0.3 },
    },
  ];
}

// ── Data display blocks ──────────────────────────────────────────────────────

/** Single label + value pair */
export function stat(
  label: string,
  binding: string,
  x: number,
  y: number,
): RenderElement[] {
  return [
    {
      type: 'group',
      x,
      y,
      elements: [
        {
          type: 'text',
          x: 0,
          y: 0,
          content: label,
          style: { fontSize: 6, fontWeight: 'bold', color: '#999999' },
        },
        {
          type: 'text',
          x: 0,
          y: 4,
          content: binding,
          style: { fontSize: 11, color: '#1a1a2e' },
        },
      ],
    },
  ];
}

/** Row of label+value stats, evenly or custom-spaced */
export function statRow(
  stats: { label: string; binding: string }[],
  y: number,
  opts: { startX?: number; gap?: number } = {},
): RenderElement[] {
  const startX = opts.startX ?? 10;
  const gap = opts.gap ?? 45;
  return stats.flatMap((s, i) => stat(s.label, s.binding, startX + i * gap, y));
}

/** Boxed ability score block (label + large number in a rounded rect) */
export function abilityBox(
  label: string,
  binding: string,
  x: number,
  y: number,
  opts: { width?: number; height?: number } = {},
): RenderElement[] {
  const w = opts.width ?? 26;
  const h = opts.height ?? 22;
  return [
    {
      type: 'group',
      x,
      y,
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: w,
          height: h,
          style: { fill: '#f5f5f5', stroke: '#dddddd', strokeWidth: 0.2 },
          radius: 2,
        },
        {
          type: 'text',
          x: w / 2,
          y: 2,
          content: label,
          style: {
            fontSize: 6,
            fontWeight: 'bold',
            color: '#999999',
            align: 'center',
          },
        },
        {
          type: 'text',
          x: w / 2,
          y: 9,
          content: binding,
          style: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1a1a2e',
            align: 'center',
          },
        },
      ],
    },
  ];
}

/** Row of ability score boxes */
export function abilityRow(
  abilities: { label: string; binding: string }[],
  y: number,
  opts: { startX?: number; gap?: number } = {},
): RenderElement[] {
  const startX = opts.startX ?? 10;
  const gap = opts.gap ?? 32;
  return abilities.flatMap((a, i) =>
    abilityBox(a.label, a.binding, startX + i * gap, y),
  );
}

// ── List blocks ──────────────────────────────────────────────────────────────

/** Filtered item list: section title + line + repeat */
export function itemList(
  title: string,
  y: number,
  opts: {
    bind?: string;
    filter?: string;
    content?: string;
    maxItems?: number;
    x?: number;
    width?: number;
    fontSize?: number;
  } = {},
): RenderElement[] {
  const x = opts.x ?? 10;
  const width = opts.width ?? 190;
  return [
    ...section(title, y, { x, x2: x + width }),
    {
      type: 'repeat',
      x,
      y: y + 11,
      bind: opts.bind ?? '{{actor.items}}',
      filter: opts.filter,
      direction: 'vertical' as const,
      gap: 0.5,
      maxItems: opts.maxItems ?? 20,
      template: [
        {
          type: 'text',
          x: 0,
          y: 0,
          width,
          height: 4,
          content: opts.content ?? '{{item.name}}',
          style: { fontSize: opts.fontSize ?? 7, color: '#333333' },
        },
      ],
    },
  ];
}
