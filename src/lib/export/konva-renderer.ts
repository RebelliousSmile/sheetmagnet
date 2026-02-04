/**
 * Konva Renderer
 * Renders resolved layouts to canvas for preview and PNG export
 */

import Konva from 'konva';
import type { ResolvedLayout, ResolvedElement, ElementStyle } from '$lib/templates/types';
import { mmToPx } from '$lib/templates/engine';

const DEFAULT_DPI = 96;
const EXPORT_DPI = 300;

export class KonvaRenderer {
  private stage: Konva.Stage | null = null;
  private layer: Konva.Layer | null = null;
  private layout: ResolvedLayout;
  private dpi: number;

  constructor(layout: ResolvedLayout, dpi = DEFAULT_DPI) {
    this.layout = layout;
    this.dpi = dpi;
  }

  /**
   * Render to a container element
   */
  async render(container: HTMLDivElement): Promise<void> {
    const width = mmToPx(this.layout.width, this.dpi);
    const height = mmToPx(this.layout.height, this.dpi);

    this.stage = new Konva.Stage({
      container,
      width,
      height
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    for (const element of this.layout.elements) {
      await this.renderElement(element);
    }

    this.layer.draw();
  }

  /**
   * Render a single element
   */
  private async renderElement(el: ResolvedElement): Promise<void> {
    if (!this.layer) return;

    const x = mmToPx(el.x, this.dpi);
    const y = mmToPx(el.y, this.dpi);
    const width = el.width ? mmToPx(el.width, this.dpi) : undefined;
    const height = el.height ? mmToPx(el.height, this.dpi) : undefined;

    switch (el.type) {
      case 'text':
        this.renderText(el, x, y, width, height);
        break;
      case 'image':
        await this.renderImage(el, x, y, width, height);
        break;
      case 'rect':
        this.renderRect(el, x, y, width, height);
        break;
      case 'line':
        this.renderLine(el, x, y);
        break;
    }
  }

  private renderText(
    el: ResolvedElement,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    const style = el.style;
    
    const text = new Konva.Text({
      x,
      y,
      text: el.content || '',
      fontSize: (style.fontSize || 10) * (this.dpi / 72),
      fontFamily: style.fontFamily || 'Helvetica',
      fontStyle: `${style.fontWeight || 'normal'} ${style.fontStyle || 'normal'}`,
      fill: style.color || '#000000',
      width,
      height,
      align: style.align || 'left',
      verticalAlign: style.verticalAlign || 'top',
      lineHeight: style.lineHeight || 1.2,
      opacity: style.opacity ?? 1
    });

    this.layer!.add(text);
  }

  private async renderImage(
    el: ResolvedElement,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): Promise<void> {
    if (!el.imageData || !width || !height) return;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const konvaImage = new Konva.Image({
          x,
          y,
          image: img,
          width,
          height,
          opacity: el.style.opacity ?? 1
        });

        // Apply corner radius if specified
        // Note: Konva doesn't have built-in radius for images,
        // would need clipFunc for that - simplified for MVP
        
        this.layer!.add(konvaImage);
        resolve();
      };

      img.onerror = () => {
        // Draw placeholder rect on error
        const placeholder = new Konva.Rect({
          x,
          y,
          width,
          height,
          fill: '#cccccc'
        });
        this.layer!.add(placeholder);
        resolve();
      };

      img.src = el.imageData;
    });
  }

  private renderRect(
    el: ResolvedElement,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    const style = el.style;
    
    const rect = new Konva.Rect({
      x,
      y,
      width: width || 0,
      height: height || 0,
      fill: style.fill === 'transparent' ? undefined : style.fill,
      stroke: style.stroke === 'transparent' ? undefined : style.stroke,
      strokeWidth: style.strokeWidth ? mmToPx(style.strokeWidth, this.dpi) : 0,
      cornerRadius: 0, // TODO: support radius
      opacity: style.opacity ?? 1
    });

    this.layer!.add(rect);
  }

  private renderLine(el: ResolvedElement, x: number, y: number): void {
    const style = el.style;
    const x2 = el.x2 ? mmToPx(el.x2, this.dpi) : x;
    const y2 = el.y2 ? mmToPx(el.y2, this.dpi) : y;

    const line = new Konva.Line({
      points: [x, y, x2, y2],
      stroke: style.stroke || '#000000',
      strokeWidth: style.strokeWidth ? mmToPx(style.strokeWidth, this.dpi) : 1,
      opacity: style.opacity ?? 1
    });

    this.layer!.add(line);
  }

  /**
   * Export to PNG data URL
   */
  toPNG(pixelRatio = 2): string {
    if (!this.stage) {
      throw new Error('Stage not initialized. Call render() first.');
    }

    return this.stage.toDataURL({
      pixelRatio,
      mimeType: 'image/png'
    });
  }

  /**
   * Export to PNG blob
   */
  async toPNGBlob(pixelRatio = 2): Promise<Blob> {
    const dataUrl = this.toPNG(pixelRatio);
    const response = await fetch(dataUrl);
    return response.blob();
  }

  /**
   * Destroy the stage
   */
  destroy(): void {
    if (this.stage) {
      this.stage.destroy();
      this.stage = null;
      this.layer = null;
    }
  }

  /**
   * Static method to render and export without UI
   */
  static async toPNGBlob(
    layout: ResolvedLayout,
    pixelRatio = 2
  ): Promise<Blob> {
    // Create offscreen container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    try {
      const renderer = new KonvaRenderer(layout, EXPORT_DPI);
      await renderer.render(container);
      const blob = await renderer.toPNGBlob(pixelRatio);
      renderer.destroy();
      return blob;
    } finally {
      document.body.removeChild(container);
    }
  }
}
