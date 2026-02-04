/**
 * Template Engine - Types
 */

export interface TemplateMeta {
  id: string;
  name: string;
  description?: string;
  width: number;   // mm
  height: number;  // mm
  exports: ('pdf' | 'png')[];
  printful?: string | null;
}

export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  opacity?: number;
}

export interface BaseElement {
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  style?: ElementStyle;
  condition?: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  maxLines?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  fit?: 'contain' | 'cover' | 'fill';
  radius?: number;
}

export interface RectElement extends BaseElement {
  type: 'rect';
  radius?: number;
}

export interface LineElement extends BaseElement {
  type: 'line';
  x2: number;
  y2: number;
}

export interface GroupElement extends BaseElement {
  type: 'group';
  elements: RenderElement[];
}

export interface RepeatElement extends BaseElement {
  type: 'repeat';
  bind: string;
  direction: 'vertical' | 'horizontal';
  gap: number;
  maxItems?: number;
  template: RenderElement[];
}

export type RenderElement = 
  | TextElement 
  | ImageElement 
  | RectElement 
  | LineElement 
  | GroupElement
  | RepeatElement;

export interface TemplateDefinition {
  meta: TemplateMeta;
  styles?: Record<string, ElementStyle>;
  layout: RenderElement[];
}

export interface ResolvedLayout {
  width: number;
  height: number;
  elements: ResolvedElement[];
}

export interface ResolvedElement {
  type: 'text' | 'image' | 'rect' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  style: ElementStyle;
  content?: string;
  imageData?: string;
  x2?: number;
  y2?: number;
}
