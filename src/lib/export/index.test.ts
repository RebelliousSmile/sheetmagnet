import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActorData } from '$lib/connectors';

// Mock pdf-renderer
vi.mock('./pdf-renderer', () => {
  class MockPdfRenderer {
    async toBlob() {
      return new Blob(['pdf-data'], { type: 'application/pdf' });
    }
    async generate() {
      return {};
    }
  }
  return { PdfRenderer: MockPdfRenderer };
});

// Mock konva-renderer
vi.mock('./konva-renderer', () => {
  return {
    KonvaRenderer: {
      toPNGBlob: vi
        .fn()
        .mockResolvedValue(new Blob(['png-data'], { type: 'image/png' })),
    },
  };
});

import { exportActor, exportActors, resolveLayout } from './index';

const mockActor: ActorData = {
  id: 'abc123',
  name: 'Gandalf the Grey',
  type: 'character',
  img: 'gandalf.png',
  system: {},
  items: [],
  effects: [],
  flags: {},
  prototypeToken: {},
  _meta: {
    systemId: 'dnd5e',
    systemVersion: '3.0.0',
    foundryVersion: '12.0.0',
    exportedAt: '2026-01-01T00:00:00Z',
  },
};

describe('resolveLayout()', () => {
  it('resolves a valid template with actor data', () => {
    const layout = resolveLayout('pdf-a4', mockActor);
    expect(layout.width).toBe(210);
    expect(layout.height).toBe(297);
    expect(layout.elements.length).toBeGreaterThan(0);
  });

  it('throws for unknown template ID', () => {
    expect(() => resolveLayout('nonexistent', mockActor)).toThrow(
      'Template not found: nonexistent',
    );
  });

  it('resolves actor name in text elements', () => {
    const layout = resolveLayout('pdf-a4', mockActor);
    const textElements = layout.elements.filter((e) => e.type === 'text');
    const nameEl = textElements.find((e) => e.content === 'Gandalf the Grey');
    expect(nameEl).toBeDefined();
  });

  it('resolves actor type in text elements', () => {
    const layout = resolveLayout('pdf-a4', mockActor);
    const textElements = layout.elements.filter((e) => e.type === 'text');
    const typeEl = textElements.find((e) => e.content === 'character');
    expect(typeEl).toBeDefined();
  });

  it('resolves poker card template', () => {
    const layout = resolveLayout('png-card', mockActor);
    expect(layout.width).toBe(63);
    expect(layout.height).toBe(88);
  });

  it('resolves all template formats', () => {
    for (const id of ['pdf-a3', 'pdf-a4', 'pdf-a5', 'pdf-a6', 'png-card']) {
      const layout = resolveLayout(id, mockActor);
      expect(layout.elements.length).toBeGreaterThan(0);
    }
  });
});

describe('exportActor()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports actor as PDF', async () => {
    const result = await exportActor(mockActor, {
      templateId: 'pdf-a4',
      format: 'pdf',
    });

    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.filename).toMatch(/gandalf_the_grey_pdf-a4\.pdf$/);
  });

  it('exports actor as PNG', async () => {
    const result = await exportActor(mockActor, {
      templateId: 'png-card',
      format: 'png',
    });

    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.mimeType).toBe('image/png');
    expect(result.filename).toMatch(/gandalf_the_grey_png-card\.png$/);
  });

  it('uses custom filename when provided', async () => {
    const result = await exportActor(mockActor, {
      templateId: 'pdf-a4',
      format: 'pdf',
      filename: 'custom-name.pdf',
    });

    expect(result.filename).toBe('custom-name.pdf');
  });

  it('throws for unknown template', async () => {
    await expect(
      exportActor(mockActor, { templateId: 'nonexistent', format: 'pdf' }),
    ).rejects.toThrow('Template not found');
  });

  it('throws for unsupported format', async () => {
    // png-card only supports 'png'
    await expect(
      exportActor(mockActor, { templateId: 'png-card', format: 'pdf' }),
    ).rejects.toThrow('Format pdf not supported');
  });

  it('sanitizes actor name in filename', async () => {
    const actor = { ...mockActor, name: 'Gandalf (the Grey)! @#$' };
    const result = await exportActor(actor, {
      templateId: 'pdf-a4',
      format: 'pdf',
    });

    // Only alphanumeric and underscores
    expect(result.filename).toMatch(/^[a-z0-9_]+_pdf-a4\.pdf$/);
    expect(result.filename).not.toMatch(/[()!@#$]/);
  });
});

describe('exportActors()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports multiple actors', async () => {
    const actor2 = { ...mockActor, id: 'def456', name: 'Frodo' };
    const results = await exportActors([mockActor, actor2], {
      templateId: 'pdf-a4',
      format: 'pdf',
    });

    expect(results).toHaveLength(2);
    expect(results[0]?.filename).toMatch(/gandalf/);
    expect(results[1]?.filename).toMatch(/frodo/);
  });

  it('returns empty array for empty input', async () => {
    const results = await exportActors([], {
      templateId: 'pdf-a4',
      format: 'pdf',
    });
    expect(results).toEqual([]);
  });
});
