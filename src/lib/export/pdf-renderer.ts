/**
 * PDF Renderer
 * Renders resolved layouts to PDF using pdf-lib
 * Supports text wrapping and multi-page pagination.
 */

import {
  PDFDocument,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  rgb,
  StandardFonts,
} from 'pdf-lib';
import { mmToPt } from '$lib/templates/engine';
import type { ResolvedElement, ResolvedLayout } from '$lib/templates/types';

/** Detect PNG by magic bytes: 89 50 4E 47 */
function isPng(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

/**
 * Convert hex color to RGB values (0-1 range)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };

  return {
    // biome-ignore lint/style/noNonNullAssertion: regex groups 1-3 are guaranteed present after exec succeeds
    r: parseInt(result[1]!, 16) / 255,
    // biome-ignore lint/style/noNonNullAssertion: regex groups 1-3 are guaranteed present after exec succeeds
    g: parseInt(result[2]!, 16) / 255,
    // biome-ignore lint/style/noNonNullAssertion: regex groups 1-3 are guaranteed present after exec succeeds
    b: parseInt(result[3]!, 16) / 255,
  };
}

/** Break text into lines that fit within maxWidth */
function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  if (!maxWidth || maxWidth <= 0) return [text];

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const candidateWidth = font.widthOfTextAtSize(candidate, fontSize);

    if (candidateWidth <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.length > 0 ? lines : [''];
}

/** Bottom margin in pt — leave space for footer */
const PAGE_BOTTOM_MARGIN_PT = 20;

export class PdfRenderer {
  private layout: ResolvedLayout;

  constructor(layout: ResolvedLayout) {
    this.layout = layout;
  }

  /**
   * Generate PDF document with text wrapping and pagination
   */
  async generate(): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();

    const widthPt = mmToPt(this.layout.width);
    const heightPt = mmToPt(this.layout.height);

    let page = pdfDoc.addPage([widthPt, heightPt]);

    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fonts = { helvetica, helveticaBold };

    for (const element of this.layout.elements) {
      // Check if element would overflow below page bottom
      const elY = heightPt - mmToPt(element.y);
      if (elY < PAGE_BOTTOM_MARGIN_PT && element.type !== 'rect') {
        // Add new page and continue
        page = pdfDoc.addPage([widthPt, heightPt]);
      }

      await this.renderElement(pdfDoc, page, element, fonts, heightPt);
    }

    return pdfDoc;
  }

  /**
   * Render a single element
   */
  private async renderElement(
    pdfDoc: PDFDocument,
    page: PDFPage,
    el: ResolvedElement,
    fonts: { helvetica: PDFFont; helveticaBold: PDFFont },
    pageHeight: number,
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
        await this.renderImage(pdfDoc, page, el, x, y, width, height);
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
    page: PDFPage,
    el: ResolvedElement,
    x: number,
    y: number,
    width: number | undefined,
    fonts: { helvetica: PDFFont; helveticaBold: PDFFont },
  ): void {
    const style = el.style;
    const text = el.content || '';
    if (!text) return;

    const fontSize = style.fontSize || 10;
    const font =
      style.fontWeight === 'bold' ? fonts.helveticaBold : fonts.helvetica;
    const color = hexToRgb(style.color || '#000000');
    const lineHeight = (style.lineHeight || 1.2) * fontSize;

    // Wrap text if width is available
    const lines = width ? wrapText(text, font, fontSize, width) : [text];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      const lineY = y - fontSize - i * lineHeight;

      // Handle alignment per line
      let lineX = x;
      if (style.align === 'center' && width) {
        const lineWidth = font.widthOfTextAtSize(line, fontSize);
        lineX = x + (width - lineWidth) / 2;
      } else if (style.align === 'right' && width) {
        const lineWidth = font.widthOfTextAtSize(line, fontSize);
        lineX = x + width - lineWidth;
      }

      page.drawText(line, {
        x: lineX,
        y: lineY,
        size: fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
        opacity: style.opacity ?? 1,
      });
    }
  }

  private async renderImage(
    pdfDoc: PDFDocument,
    page: PDFPage,
    el: ResolvedElement,
    x: number,
    y: number,
    width: number | undefined,
    height: number | undefined,
  ): Promise<void> {
    if (!el.imageData || !width || !height) return;

    try {
      const response = await fetch(el.imageData);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      let image: PDFImage;
      if (isPng(uint8Array)) {
        image = await pdfDoc.embedPng(uint8Array);
      } else {
        image = await pdfDoc.embedJpg(uint8Array);
      }

      page.drawImage(image, {
        x,
        y: y - height,
        width,
        height,
        opacity: el.style.opacity ?? 1,
      });
    } catch (error) {
      console.warn('Failed to embed image:', error);
      page.drawRectangle({
        x,
        y: y - (height || 0),
        width: width || 0,
        height: height || 0,
        color: rgb(0.8, 0.8, 0.8),
      });
    }
  }

  private renderRect(
    page: PDFPage,
    el: ResolvedElement,
    x: number,
    y: number,
    width: number | undefined,
    height: number | undefined,
  ): void {
    const style = el.style;
    const options: Parameters<typeof page.drawRectangle>[0] = {
      x,
      y: y - (height || 0),
      width: width || 0,
      height: height || 0,
      opacity: style.opacity ?? 1,
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
    page: PDFPage,
    el: ResolvedElement,
    x: number,
    y: number,
    pageHeight: number,
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
      opacity: style.opacity ?? 1,
    });
  }

  async toBytes(): Promise<Uint8Array> {
    const pdfDoc = await this.generate();
    return pdfDoc.save();
  }

  async toBlob(): Promise<Blob> {
    const bytes = await this.toBytes();
    return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  }

  async toDataUrl(): Promise<string> {
    const bytes = await this.toBytes();
    const base64 = btoa(String.fromCharCode(...bytes));
    return `data:application/pdf;base64,${base64}`;
  }
}
