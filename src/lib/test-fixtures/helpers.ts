/**
 * Shared test helpers for e2e and pipeline tests.
 * Avoids repeating resolve + render + assertion patterns.
 */

import { PDFDocument } from 'pdf-lib';
import type { ActorData } from '$lib/connectors/foundry';
import { PdfRenderer } from '$lib/export/pdf-renderer';
import { getTemplate } from '$lib/templates/definitions';
import { resolve } from '$lib/templates/engine';
import type { ResolvedLayout } from '$lib/templates/types';

/** Resolve template with actor data — avoids importing export/index (pulls Konva) */
export function resolveLayout(
  templateId: string,
  actor: ActorData,
): ResolvedLayout {
  const template = getTemplate(templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);
  return resolve(template, { actor });
}

/** Full e2e: resolve + render to PDF bytes */
export async function generatePdf(
  actor: ActorData,
  templateId: string,
): Promise<{ layout: ResolvedLayout; bytes: Uint8Array }> {
  const layout = resolveLayout(templateId, actor);
  const renderer = new PdfRenderer(layout);
  const bytes = await renderer.toBytes();
  return { layout, bytes };
}

/** Validate PDF structure: header, page count */
export async function validatePdf(
  bytes: Uint8Array,
  expectedPages = 1,
): Promise<void> {
  const { expect } = await import('vitest');
  const header = new TextDecoder().decode(bytes.slice(0, 4));
  expect(header).toBe('%PDF');
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBeGreaterThanOrEqual(expectedPages);
  expect(bytes.length).toBeGreaterThan(500);
}

/** Get all text content from resolved layout */
export function allTexts(layout: ResolvedLayout): string[] {
  return layout.elements
    .filter((e) => e.type === 'text' && e.content)
    .map((e) => e.content as string);
}

/** Check layout contains text matching a substring */
export function hasText(layout: ResolvedLayout, substring: string): boolean {
  return allTexts(layout).some((t) => t.includes(substring));
}

/** Check layout does NOT contain any text exactly matching */
export function lacksText(layout: ResolvedLayout, text: string): boolean {
  return !allTexts(layout).some((t) => t === text);
}

/** Get texts between two section headers (exclusive) */
export function textsBetweenSections(
  layout: ResolvedLayout,
  sectionA: string,
  sectionB: string,
): string[] {
  const texts = allTexts(layout);
  const idxA = texts.indexOf(sectionA);
  const idxB = texts.indexOf(sectionB);
  if (idxA < 0 || idxB < 0 || idxB <= idxA) return [];
  return texts.slice(idxA + 1, idxB);
}
