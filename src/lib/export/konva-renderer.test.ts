import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResolvedElement, ResolvedLayout } from '$lib/templates/types';

// Stub minimal DOM for node environment
const mockElement = { style: {} };
vi.stubGlobal('document', {
  createElement: vi.fn(() => mockElement),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
});

// Mock Konva — track what gets added to the layer
const mockAdd = vi.fn();
const mockDraw = vi.fn();
const mockDestroy = vi.fn();
const mockStageAdd = vi.fn();
const mockToDataURL = vi.fn().mockReturnValue('data:image/png;base64,abc');

vi.mock('konva', () => {
  class MockStage {
    add = mockStageAdd;
    toDataURL = mockToDataURL;
    destroy = mockDestroy;
  }
  class MockLayer {
    add = mockAdd;
    draw = mockDraw;
  }
  class MockText {
    _type = 'Text';
    [key: string]: unknown;
    constructor(opts: Record<string, unknown>) {
      Object.assign(this, opts);
    }
  }
  class MockKonvaImage {
    _type = 'Image';
    [key: string]: unknown;
    constructor(opts: Record<string, unknown>) {
      Object.assign(this, opts);
    }
  }
  class MockRect {
    _type = 'Rect';
    [key: string]: unknown;
    constructor(opts: Record<string, unknown>) {
      Object.assign(this, opts);
    }
  }
  class MockLine {
    _type = 'Line';
    [key: string]: unknown;
    constructor(opts: Record<string, unknown>) {
      Object.assign(this, opts);
    }
  }
  return {
    default: {
      Stage: MockStage,
      Layer: MockLayer,
      Text: MockText,
      Image: MockKonvaImage,
      Rect: MockRect,
      Line: MockLine,
    },
  };
});

// Mock Image constructor — auto triggers onload
class MockImageSuccess {
  crossOrigin = '';
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}
vi.stubGlobal('Image', MockImageSuccess);

import { KonvaRenderer } from './konva-renderer';

function makeLayout(
  elements: ResolvedElement[],
  width = 210,
  height = 297,
): ResolvedLayout {
  return { width, height, elements };
}

function makeContainer() {
  return document.createElement('div') as unknown as HTMLDivElement;
}

const defaultStyle: ResolvedElement['style'] = {
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
};

describe('KonvaRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('Image', MockImageSuccess);
  });

  describe('constructor', () => {
    it('creates a renderer with layout and default DPI', () => {
      const renderer = new KonvaRenderer(makeLayout([]));
      expect(renderer).toBeInstanceOf(KonvaRenderer);
    });

    it('creates a renderer with custom DPI', () => {
      const renderer = new KonvaRenderer(makeLayout([]), 300);
      expect(renderer).toBeInstanceOf(KonvaRenderer);
    });
  });

  describe('render()', () => {
    it('creates stage and layer, then draws', async () => {
      const renderer = new KonvaRenderer(makeLayout([]));
      await renderer.render(makeContainer());

      expect(mockStageAdd).toHaveBeenCalled();
      expect(mockDraw).toHaveBeenCalled();
    });

    it('renders text elements and adds to layer', async () => {
      const layout = makeLayout([
        {
          type: 'text',
          x: 10,
          y: 20,
          width: 100,
          style: { ...defaultStyle, fontSize: 16, fontWeight: 'bold' },
          content: 'Hello',
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      expect(mockAdd).toHaveBeenCalledTimes(1);
      const addedObj = mockAdd.mock.calls[0]?.[0];
      expect(addedObj._type).toBe('Text');
      expect(addedObj.text).toBe('Hello');
    });

    it('renders rect elements and adds to layer', async () => {
      const layout = makeLayout([
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 210,
          height: 297,
          style: { ...defaultStyle, fill: '#ffffff' },
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd.mock.calls[0]?.[0]._type).toBe('Rect');
    });

    it('passes undefined fill for transparent fill', async () => {
      const layout = makeLayout([
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 50,
          height: 50,
          style: { ...defaultStyle, fill: 'transparent', stroke: '#000000' },
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      const addedRect = mockAdd.mock.calls[0]?.[0];
      expect(addedRect.fill).toBeUndefined();
    });

    it('passes undefined stroke for transparent stroke', async () => {
      const layout = makeLayout([
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 50,
          height: 50,
          style: { ...defaultStyle, fill: '#ff0000', stroke: 'transparent' },
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      const addedRect = mockAdd.mock.calls[0]?.[0];
      expect(addedRect.stroke).toBeUndefined();
    });

    it('renders line elements', async () => {
      const layout = makeLayout([
        {
          type: 'line',
          x: 0,
          y: 10,
          x2: 200,
          y2: 10,
          style: { ...defaultStyle, stroke: '#000000', strokeWidth: 1 },
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd.mock.calls[0]?.[0]._type).toBe('Line');
    });

    it('renders image elements (onload path)', async () => {
      const layout = makeLayout([
        {
          type: 'image',
          x: 10,
          y: 10,
          width: 50,
          height: 50,
          style: defaultStyle,
          imageData: 'http://example.com/img.png',
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd.mock.calls[0]?.[0]._type).toBe('Image');
    });

    it('skips image when imageData is missing', async () => {
      const layout = makeLayout([
        {
          type: 'image',
          x: 10,
          y: 10,
          width: 50,
          height: 50,
          style: defaultStyle,
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      // No Image should be added
      for (const call of mockAdd.mock.calls) {
        expect(call[0]._type).not.toBe('Image');
      }
    });

    it('skips image when width is missing', async () => {
      const layout = makeLayout([
        {
          type: 'image',
          x: 10,
          y: 10,
          height: 50,
          style: defaultStyle,
          imageData: 'http://example.com/img.png',
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      for (const call of mockAdd.mock.calls) {
        expect(call[0]._type).not.toBe('Image');
      }
    });

    it('renders placeholder rect on image load error', async () => {
      vi.stubGlobal(
        'Image',
        class {
          crossOrigin = '';
          src = '';
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
          constructor() {
            setTimeout(() => {
              if (this.onerror) this.onerror();
            }, 0);
          }
        },
      );

      const layout = makeLayout([
        {
          type: 'image',
          x: 10,
          y: 10,
          width: 50,
          height: 50,
          style: defaultStyle,
          imageData: 'http://example.com/broken.png',
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      // Should add a placeholder Rect with grey fill
      const placeholderCall = mockAdd.mock.calls.find(
        (c) => c[0]._type === 'Rect' && c[0].fill === '#cccccc',
      );
      expect(placeholderCall).toBeDefined();
    });

    it('handles multiple mixed elements', async () => {
      const layout = makeLayout([
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 210,
          height: 297,
          style: { ...defaultStyle, fill: '#ffffff' },
        },
        {
          type: 'text',
          x: 10,
          y: 20,
          style: defaultStyle,
          content: 'Title',
        },
        {
          type: 'line',
          x: 10,
          y: 30,
          x2: 200,
          y2: 30,
          style: { ...defaultStyle, stroke: '#000' },
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      expect(mockAdd).toHaveBeenCalledTimes(3);
    });

    it('applies text style properties correctly', async () => {
      const layout = makeLayout([
        {
          type: 'text',
          x: 5,
          y: 10,
          width: 80,
          height: 20,
          style: {
            ...defaultStyle,
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'italic',
            color: '#ff0000',
            align: 'center',
            verticalAlign: 'middle',
            lineHeight: 1.5,
            opacity: 0.8,
          },
          content: 'Styled',
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      const textObj = mockAdd.mock.calls[0]?.[0];
      expect(textObj.text).toBe('Styled');
      expect(textObj.fill).toBe('#ff0000');
      expect(textObj.align).toBe('center');
      expect(textObj.opacity).toBe(0.8);
    });
  });

  describe('toPNG()', () => {
    it('throws when stage is not initialized', () => {
      const renderer = new KonvaRenderer(makeLayout([]));
      expect(() => renderer.toPNG()).toThrow('Stage not initialized');
    });

    it('returns a data URL after render', async () => {
      const renderer = new KonvaRenderer(makeLayout([]));
      await renderer.render(makeContainer());

      const result = renderer.toPNG();
      expect(result).toBe('data:image/png;base64,abc');
      expect(mockToDataURL).toHaveBeenCalledWith({
        pixelRatio: 2,
        mimeType: 'image/png',
      });
    });

    it('respects custom pixelRatio', async () => {
      const renderer = new KonvaRenderer(makeLayout([]));
      await renderer.render(makeContainer());

      renderer.toPNG(4);
      expect(mockToDataURL).toHaveBeenCalledWith({
        pixelRatio: 4,
        mimeType: 'image/png',
      });
    });
  });

  describe('toPNGBlob()', () => {
    it('returns a Blob from PNG data URL', async () => {
      const mockBlob = new Blob(['png-data'], { type: 'image/png' });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ blob: () => Promise.resolve(mockBlob) }),
      );

      const renderer = new KonvaRenderer(makeLayout([]));
      await renderer.render(makeContainer());

      const blob = await renderer.toPNGBlob();
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('destroy()', () => {
    it('destroys the stage and nullifies references', async () => {
      const renderer = new KonvaRenderer(makeLayout([]));
      await renderer.render(makeContainer());

      renderer.destroy();
      expect(mockDestroy).toHaveBeenCalled();
      // Double destroy should not throw
      renderer.destroy();
    });

    it('is safe to call without prior render', () => {
      const renderer = new KonvaRenderer(makeLayout([]));
      renderer.destroy();
    });
  });

  describe('line edge cases', () => {
    it('defaults x2/y2 to x/y when not provided', async () => {
      const layout = makeLayout([
        {
          type: 'line',
          x: 10,
          y: 20,
          style: { ...defaultStyle, stroke: '#000000', strokeWidth: 1 },
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      await renderer.render(makeContainer());

      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd.mock.calls[0]?.[0]._type).toBe('Line');
    });
  });

  describe('image timeout', () => {
    it('renders placeholder on image load timeout', async () => {
      vi.useFakeTimers();

      // Image that never loads or errors
      vi.stubGlobal(
        'Image',
        class {
          crossOrigin = '';
          src = '';
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
        },
      );

      const layout = makeLayout([
        {
          type: 'image',
          x: 10,
          y: 10,
          width: 50,
          height: 50,
          style: defaultStyle,
          imageData: 'http://example.com/slow.png',
        },
      ]);
      const renderer = new KonvaRenderer(layout);
      const renderPromise = renderer.render(makeContainer());

      // Advance past IMAGE_TIMEOUT_MS (10_000)
      vi.advanceTimersByTime(10_001);

      await renderPromise;

      // Should add a placeholder Rect with grey fill
      const placeholderCall = mockAdd.mock.calls.find(
        (c) => c[0]._type === 'Rect' && c[0].fill === '#cccccc',
      );
      expect(placeholderCall).toBeDefined();

      vi.useRealTimers();
    });
  });

  describe('toPNGBlob() error path', () => {
    it('throws on fetch failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('fetch failed')),
      );

      const renderer = new KonvaRenderer(makeLayout([]));
      await renderer.render(makeContainer());

      await expect(renderer.toPNGBlob()).rejects.toThrow(
        'Failed to convert PNG data URL to Blob',
      );
    });
  });

  describe('static toPNGBlob()', () => {
    it('renders offscreen and returns a blob', async () => {
      const mockBlob = new Blob(['png-data'], { type: 'image/png' });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ blob: () => Promise.resolve(mockBlob) }),
      );

      const layout = makeLayout([
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 210,
          height: 297,
          style: { ...defaultStyle, fill: '#ffffff' },
        },
      ]);
      const blob = await KonvaRenderer.toPNGBlob(layout);
      expect(blob).toBeInstanceOf(Blob);
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });
});
