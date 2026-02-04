/**
 * PDF Renderer
 * Renders resolved layouts to PDF using pdf-lib
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ResolvedLayout, ResolvedElement, ElementStyle } from '$lib/templates/types';
import { mmToPt } from '$lib/templates/engine';

/**
 * Convert hex color to RGB values (0-1 range)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  };
}

export class PdfRenderer {
  private layout: ResolvedLayout;

  constructor(layout: ResolvedLayout) {
    this.layout = layout;
  }

  /**
   * Generate PDF document
   */
  async generate(): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    
    const widthPt = mmToPt(this.layout.width);
    const heightPt = mmToPt(this.layout.height);
    
    const page = pdfDoc.addPage([widthPt, heightPt]);
    
    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const element of this.layout.elements) {
      await this.renderElement(pdfDoc, page, element, { helvetica, helveticaBold }, heightPt);
    }

    return pdfDoc;
  }

  /**
   * Render a single element
   */
  private async renderElement(
    pdfDoc: PDFDocument,
    page: ReturnType<PDFDocument['addPage']>,
    el: ResolvedElement,
    fonts: { helvetica: Awaited<ReturnType<PDFDocument['embedFont']>>; helveticaBold: Awaited<ReturnType<PDFDocument['embedFont']>> },
    pageHeight: number
  ): Promise<void> {
    // PDF coordinates start from bottom-left, so flip Y
    const x = mmToPt(el.x);
    const y = pageHeight - mmToPt(el.y);
    const width = el.width ? mmToPt(el.width) : undefined;
    const height = el.height ? mmToPt(el.height) : undefined;

    switch (el.type) {
      case 'text':
        this.renderText(page, el, x, y, width, fonts);
        break;
      case 'image':
        await this.renderImage(pdfDoc, page, el, x, y, width, height, pageHeight);
        break;
      case 'rect':
        this.renderRect(page, el, x, y, width, height);
        break;
      case 'line':
        this.renderLine(page, el, x, y, pageHeight);
        break;
    }
  }

  private renderText(
    page: ReturnType<PDFDocument['addPage']>,
    el: ResolvedElement,
    x: number,
    y: number,
    width: number | undefined,
    fonts: { helvetica: Awaited<ReturnType<PDFDocument['embedFont']>>; helveticaBold: Awaited<ReturnType<PDFDocument['embedFont']>> }
  ): void {
    const style = el.style;
    const text = el.content || '';
    if (!text) return;

    const fontSize = style.fontSize || 10;
    const font = style.fontWeight === 'bold' ? fonts.helveticaBold : fonts.helvetica;
    const color = hexToRgb(style.color || '#000000');

    // Adjust Y for text baseline (PDF draws from baseline)
    const textY = y - fontSize;

    // Handle alignment
    let textX = x;
    if (style.align === 'center' && width) {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      textX = x + (width - textWidth) / 2;
    } else if (style.align === 'right' && width) {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      textX = x + width - textWidth;
    }

    page.drawText(text, {
      x: textX,
      y: textY,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity: style.opacity ?? 1
    });
  }

  private async renderImage(
    pdfDoc: PDFDocument,
    page: ReturnType<PDFDocument['addPage']>,
    el: ResolvedElement,
    x: number,
    y: number,
    width: number | undefined,
    height: number | undefined,
    pageHeight: number
  ): Promise<void> {
    if (!el.imageData || !width || !height) return;

    try {
      // Fetch image
      const response = await fetch(el.imageData);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Detect image type and embed
      let image;
      if (el.imageData.includes('.png') || el.imageData.startsWith('data:image/png')) {
        image = await pdfDoc.embedPng(uint8Array);
      } else {
        image = await pdfDoc.embedJpg(uint8Array);
      }

      // PDF Y is from bottom, and we need to account for image height
      const imageY = y - height;

      page.drawImage(image, {
        x,
        y: imageY,
        width,
        height,
        opacity: el.style.opacity ?? 1
      });
    } catch (error) {
      // Draw placeholder on error
      console.warn('Failed to embed image:', error);
      page.drawRectangle({
        x,
        y: y - (height || 0),
        width: width || 0,
        height: height || 0,
        color: rgb(0.8, 0.8, 0.8)
      });
    }
  }

  private renderRect(
    page: ReturnType<PDFDocument['addPage']>,
    el: ResolvedElement,
    x: number,
    y: number,
    width: number | undefined,
    height: number | undefined
  ): void {
    const style = el.style;
    
    // PDF Y is from bottom
    const rectY = y - (height || 0);

    const options: Parameters<typeof page.drawRectangle>[0] = {
      x,
      y: rectY,
      width: width || 0,
      height: height || 0,
      opacity: style.opacity ?? 1
    };

    if (style.fill && style.fill !== 'transparent') {
      const fillColor = hexToRgb(style.fill);
      options.color = rgb(fillColor.r, fillColor.g, fillColor.b);
    }

    if (style.stroke && style.stroke !== 'transparent') {
      const strokeColor = hexToRgb(style.stroke);
      options.borderColor = rgb(strokeColor.r, strokeColor.g, strokeColor.b);
      options.borderWidth = style.strokeWidth ? mmToPt(style.strokeWidth) : 1;
    }

    page.drawRectangle(options);
  }

  private renderLine(
    page: ReturnType<PDFDocument['addPage']>,
    el: ResolvedElement,
    x: number,
    y: number,
    pageHeight: number
  ): void {
    const style = el.style;
    const x2 = el.x2 ? mmToPt(el.x2) : x;
    const y2 = el.y2 ? pageHeight - mmToPt(el.y2) : y;

    const strokeColor = hexToRgb(style.stroke || '#000000');

    page.drawLine({
      start: { x, y },
      end: { x: x2, y: y2 },
      thickness: style.strokeWidth ? mmToPt(style.strokeWidth) : 1,
      color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
      opacity: style.opacity ?? 1
    });
  }

  /**
   * Export to PDF bytes
   */
  async toBytes(): Promise<Uint8Array> {
    const pdfDoc = await this.generate();
    return pdfDoc.save();
  }

  /**
   * Export to Blob
   */
  async toBlob(): Promise<Blob> {
    const bytes = await this.toBytes();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Export to data URL
   */
  async toDataUrl(): Promise<string> {
    const bytes = await this.toBytes();
    const base64 = btoa(String.fromCharCode(...bytes));
    return `data:application/pdf;base64,${base64}`;
  }
}
