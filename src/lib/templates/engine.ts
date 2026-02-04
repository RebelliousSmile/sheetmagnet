/**
 * Template Engine
 * Parses templates and resolves bindings with actor data
 */

import type { 
  TemplateDefinition, 
  RenderElement, 
  ResolvedLayout, 
  ResolvedElement,
  ElementStyle
} from './types';

const DEFAULT_STYLE: ElementStyle = {
  fontFamily: 'Helvetica',
  fontSize: 10,
  fontWeight: 'normal',
  fontStyle: 'normal',
  color: '#000000',
  fill: 'transparent',
  stroke: 'transparent',
  strokeWidth: 0,
  align: 'left',
  verticalAlign: 'top',
  lineHeight: 1.2,
  opacity: 1
};

// Unit conversions
export const MM_TO_PT = 2.83465;
export const MM_TO_PX_96 = 3.7795;

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

export function mmToPx(mm: number, dpi = 96): number {
  return mm * (dpi / 25.4);
}

/**
 * Resolve a binding path like "actor.name"
 */
function getByPath(path: string, data: Record<string, unknown>): unknown {
  const parts = path.split('.');
  let value: unknown = data;
  
  for (const part of parts) {
    if (value == null || typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  
  return value;
}

/**
 * Replace {{binding}} patterns with values
 */
function interpolate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const value = getByPath(path.trim(), data);
    return value != null ? String(value) : '';
  });
}

/**
 * Check condition binding
 */
function checkCondition(condition: string | undefined, data: Record<string, unknown>): boolean {
  if (!condition) return true;
  const path = condition.replace(/^\{\{|\}\}$/g, '').trim();
  return Boolean(getByPath(path, data));
}

/**
 * Merge styles
 */
function mergeStyles(base?: ElementStyle, named?: Record<string, ElementStyle>): ElementStyle {
  return { ...DEFAULT_STYLE, ...base };
}

/**
 * Resolve a single element recursively
 */
function resolveElement(
  el: RenderElement,
  data: Record<string, unknown>,
  namedStyles?: Record<string, ElementStyle>
): ResolvedElement[] {
  if (!checkCondition(el.condition, data)) return [];

  const style = mergeStyles(el.style, namedStyles);

  switch (el.type) {
    case 'text':
      return [{
        type: 'text',
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        style,
        content: interpolate(el.content, data)
      }];

    case 'image':
      return [{
        type: 'image',
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        style,
        imageData: interpolate(el.src, data)
      }];

    case 'rect':
      return [{
        type: 'rect',
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        style
      }];

    case 'line':
      return [{
        type: 'line',
        x: el.x,
        y: el.y,
        x2: el.x2,
        y2: el.y2,
        style
      }];

    case 'group': {
      const results: ResolvedElement[] = [];
      for (const child of el.elements) {
        for (const resolved of resolveElement(child, data, namedStyles)) {
          resolved.x += el.x;
          resolved.y += el.y;
          results.push(resolved);
        }
      }
      return results;
    }

    case 'repeat': {
      const bindPath = el.bind.replace(/^\{\{|\}\}$/g, '').trim();
      const items = getByPath(bindPath, data);
      if (!Array.isArray(items)) return [];

      const results: ResolvedElement[] = [];
      const max = el.maxItems ?? items.length;
      let offsetX = 0, offsetY = 0;

      for (let i = 0; i < Math.min(items.length, max); i++) {
        const itemData = { ...data, item: items[i], index: i };
        
        for (const templateEl of el.template) {
          for (const resolved of resolveElement(templateEl, itemData, namedStyles)) {
            resolved.x += el.x + offsetX;
            resolved.y += el.y + offsetY;
            results.push(resolved);
          }
        }

        if (el.direction === 'horizontal') {
          offsetX += (el.template[0]?.width ?? 0) + el.gap;
        } else {
          offsetY += (el.template[0]?.height ?? 0) + el.gap;
        }
      }
      return results;
    }

    default:
      return [];
  }
}

/**
 * Resolve full template with data
 */
export function resolve(
  template: TemplateDefinition,
  data: Record<string, unknown>
): ResolvedLayout {
  const elements: ResolvedElement[] = [];
  
  for (const el of template.layout) {
    elements.push(...resolveElement(el, data, template.styles));
  }
  
  return {
    width: template.meta.width,
    height: template.meta.height,
    elements
  };
}
