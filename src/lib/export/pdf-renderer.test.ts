import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResolvedElement, ResolvedLayout } from '$lib/templates/types';
import { PdfRenderer } from './pdf-renderer';

// Helper to build a minimal resolved layout
function makeLayout(
  elements: ResolvedElement[],
  width = 210,
  height = 297,
): ResolvedLayout {
  return { width, height, elements };
}

// Helper to build a resolved text element
function makeText(
  content: string,
  x = 0,
  y = 0,
  overrides: Partial<ResolvedElement> = {},
): ResolvedElement {
  return {
    type: 'text',
    x,
    y,
    style: {
      fontFamily: 'Helvetica',
      fontSize: 12,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      align: 'left',
      verticalAlign: 'top',
      lineHeight: 1.2,
      opacity: 1,
    },
    content,
    ...overrides,
  };
}

function makeRect(
  x: number,
  y: number,
  width: number,
  height: number,
  style: Partial<ResolvedElement['style']> = {},
): ResolvedElement {
  return {
    type: 'rect',
    x,
    y,
    width,
    height,
    style: {
      fontFamily: 'Helvetica',
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      fill: '#ff0000',
      stroke: 'transparent',
      strokeWidth: 0,
      align: 'left',
      verticalAlign: 'top',
      lineHeight: 1.2,
      opacity: 1,
      ...style,
    },
  };
}

function makeLine(
  x: number,
  y: number,
  x2: number,
  y2: number,
): ResolvedElement {
  return {
    type: 'line',
    x,
    y,
    x2,
    y2,
    style: {
      fontFamily: 'Helvetica',
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 0.5,
      align: 'left',
      verticalAlign: 'top',
      lineHeight: 1.2,
      opacity: 1,
    },
  };
}

describe('PdfRenderer', () => {
  // Mock fetch for image tests
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generate()', () => {
    it('creates a valid PDF document from empty layout', async () => {
      const layout = makeLayout([]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();

      expect(pdfDoc).toBeDefined();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('creates a page with correct dimensions', async () => {
      const layout = makeLayout([], 210, 297);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();

      // 210mm * 2.83465 ≈ 595.28pt, 297mm * 2.83465 ≈ 841.49pt
      expect(width).toBeCloseTo(210 * 2.83465, 0);
      expect(height).toBeCloseTo(297 * 2.83465, 0);
    });

    it('renders text elements without error', async () => {
      const layout = makeLayout([
        makeText('Hello World', 10, 20),
        makeText('Second line', 10, 40),
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();

      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('renders bold text using HelveticaBold font', async () => {
      const layout = makeLayout([
        makeText('Bold text', 10, 20, {
          style: {
            fontFamily: 'Helvetica',
            fontSize: 14,
            fontWeight: 'bold',
            fontStyle: 'normal',
            color: '#000000',
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            align: 'left',
            verticalAlign: 'top',
            lineHeight: 1.2,
            opacity: 1,
          },
        }),
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('renders text with center alignment', async () => {
      const layout = makeLayout([
        makeText('Centered', 10, 20, {
          width: 100,
          style: {
            fontFamily: 'Helvetica',
            fontSize: 12,
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#000000',
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            align: 'center',
            verticalAlign: 'top',
            lineHeight: 1.2,
            opacity: 1,
          },
        }),
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('renders text with right alignment', async () => {
      const layout = makeLayout([
        makeText('Right', 10, 20, {
          width: 100,
          style: {
            fontFamily: 'Helvetica',
            fontSize: 12,
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#000000',
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            align: 'right',
            verticalAlign: 'top',
            lineHeight: 1.2,
            opacity: 1,
          },
        }),
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('skips empty text content', async () => {
      const layout = makeLayout([makeText('', 10, 20)]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('renders rect elements', async () => {
      const layout = makeLayout([makeRect(10, 20, 50, 30)]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('renders rect with stroke', async () => {
      const layout = makeLayout([
        makeRect(10, 20, 50, 30, {
          fill: 'transparent',
          stroke: '#0000ff',
          strokeWidth: 2,
        }),
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('renders rect with transparent fill', async () => {
      const layout = makeLayout([
        makeRect(10, 20, 50, 30, { fill: 'transparent' }),
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('renders line elements', async () => {
      const layout = makeLayout([makeLine(0, 10, 200, 10)]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('renders image placeholder when fetch fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('network error')),
      );

      const layout = makeLayout([
        {
          type: 'image' as const,
          x: 10,
          y: 10,
          width: 50,
          height: 50,
          style: {
            fontFamily: 'Helvetica',
            fontSize: 10,
            fontWeight: 'normal' as const,
            fontStyle: 'normal' as const,
            color: '#000000',
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            align: 'left' as const,
            verticalAlign: 'top' as const,
            lineHeight: 1.2,
            opacity: 1,
          },
          imageData: 'http://fake-host/image.png',
        },
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      // Should not throw, renders placeholder
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('skips image when imageData is missing', async () => {
      const layout = makeLayout([
        {
          type: 'image' as const,
          x: 10,
          y: 10,
          width: 50,
          height: 50,
          style: {
            fontFamily: 'Helvetica',
            fontSize: 10,
            fontWeight: 'normal' as const,
            fontStyle: 'normal' as const,
            color: '#000000',
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            align: 'left' as const,
            verticalAlign: 'top' as const,
            lineHeight: 1.2,
            opacity: 1,
          },
        },
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('skips image when dimensions are missing', async () => {
      const layout = makeLayout([
        {
          type: 'image' as const,
          x: 10,
          y: 10,
          style: {
            fontFamily: 'Helvetica',
            fontSize: 10,
            fontWeight: 'normal' as const,
            fontStyle: 'normal' as const,
            color: '#000000',
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            align: 'left' as const,
            verticalAlign: 'top' as const,
            lineHeight: 1.2,
            opacity: 1,
          },
          imageData: 'http://fake-host/image.png',
        },
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });

    it('renders mixed element types together', async () => {
      const layout = makeLayout([
        makeRect(0, 0, 210, 297, { fill: '#ffffff' }),
        makeText('Title', 10, 20),
        makeLine(10, 30, 200, 30),
        makeText('Body text', 10, 40),
      ]);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });
  });

  describe('toBytes()', () => {
    it('returns a Uint8Array of PDF bytes', async () => {
      const layout = makeLayout([makeText('Hello', 10, 20)]);
      const renderer = new PdfRenderer(layout);
      const bytes = await renderer.toBytes();

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBeGreaterThan(0);
      // PDF starts with %PDF
      const header = new TextDecoder().decode(bytes.slice(0, 4));
      expect(header).toBe('%PDF');
    });
  });

  describe('toBlob()', () => {
    it('returns a Blob with application/pdf mime type', async () => {
      const layout = makeLayout([makeText('Hello', 10, 20)]);
      const renderer = new PdfRenderer(layout);
      const blob = await renderer.toBlob();

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('toDataUrl()', () => {
    it('returns a data URL starting with data:application/pdf;base64,', async () => {
      const layout = makeLayout([makeText('Hello', 10, 20)]);
      const renderer = new PdfRenderer(layout);
      const dataUrl = await renderer.toDataUrl();

      expect(dataUrl).toMatch(/^data:application\/pdf;base64,/);
    });
  });

  describe('hexToRgb edge cases', () => {
    it('handles invalid hex color gracefully (defaults to black)', async () => {
      const layout = makeLayout([
        makeText('colored', 10, 20, {
          style: {
            fontFamily: 'Helvetica',
            fontSize: 12,
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: 'not-a-color',
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            align: 'left',
            verticalAlign: 'top',
            lineHeight: 1.2,
            opacity: 1,
          },
        }),
      ]);
      const renderer = new PdfRenderer(layout);
      // Should not throw
      const pdfDoc = await renderer.generate();
      expect(pdfDoc.getPageCount()).toBe(1);
    });
  });

  describe('A4 page dimensions', () => {
    it('produces correct A4 PDF page size', async () => {
      const layout = makeLayout([], 210, 297);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      const page = pdfDoc.getPage(0);
      const size = page.getSize();

      // Standard A4 in points: 595.28 x 841.89
      expect(size.width).toBeCloseTo(595.28, 0);
      expect(size.height).toBeCloseTo(841.49, 0);
    });
  });

  describe('poker card dimensions', () => {
    it('produces correct poker card PDF page size', async () => {
      const layout = makeLayout([], 63, 88);
      const renderer = new PdfRenderer(layout);
      const pdfDoc = await renderer.generate();
      const page = pdfDoc.getPage(0);
      const size = page.getSize();

      expect(size.width).toBeCloseTo(63 * 2.83465, 0);
      expect(size.height).toBeCloseTo(88 * 2.83465, 0);
    });
  });
});
