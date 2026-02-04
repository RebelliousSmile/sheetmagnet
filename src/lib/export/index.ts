/**
 * Export Service
 * Unified API for exporting to different formats
 */

import { KonvaRenderer } from './konva-renderer';
import { PdfRenderer } from './pdf-renderer';
import { resolve, getTemplate } from '$lib/templates';
import type { ActorData } from '$lib/connectors';
import type { ResolvedLayout } from '$lib/templates/types';

export interface ExportOptions {
  templateId: string;
  format: 'pdf' | 'png';
  filename?: string;
  pixelRatio?: number;  // for PNG
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

/**
 * Resolve template with actor data
 */
export function resolveLayout(templateId: string, actor: ActorData): ResolvedLayout {
  const template = getTemplate(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  
  return resolve(template, { actor });
}

/**
 * Export actor to specified format
 */
export async function exportActor(
  actor: ActorData,
  options: ExportOptions
): Promise<ExportResult> {
  const template = getTemplate(options.templateId);
  if (!template) {
    throw new Error(`Template not found: ${options.templateId}`);
  }

  // Check if format is supported by template
  if (!template.meta.exports.includes(options.format)) {
    throw new Error(`Format ${options.format} not supported by template ${options.templateId}`);
  }

  const layout = resolve(template, { actor });
  const safeName = actor.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  if (options.format === 'pdf') {
    const renderer = new PdfRenderer(layout);
    const blob = await renderer.toBlob();
    
    return {
      blob,
      filename: options.filename || `${safeName}_${template.meta.id}.pdf`,
      mimeType: 'application/pdf'
    };
  } else {
    const blob = await KonvaRenderer.toPNGBlob(layout, options.pixelRatio || 2);
    
    return {
      blob,
      filename: options.filename || `${safeName}_${template.meta.id}.png`,
      mimeType: 'image/png'
    };
  }
}

/**
 * Export multiple actors (one file per actor)
 */
export async function exportActors(
  actors: ActorData[],
  options: ExportOptions
): Promise<ExportResult[]> {
  const results: ExportResult[] = [];
  
  for (const actor of actors) {
    const result = await exportActor(actor, options);
    results.push(result);
  }
  
  return results;
}

/**
 * Trigger browser download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export and download
 */
export async function exportAndDownload(
  actor: ActorData,
  options: ExportOptions
): Promise<void> {
  const result = await exportActor(actor, options);
  downloadBlob(result.blob, result.filename);
}

/**
 * Export multiple and download as zip (future)
 * For now, downloads sequentially
 */
export async function exportAllAndDownload(
  actors: ActorData[],
  options: ExportOptions
): Promise<void> {
  for (const actor of actors) {
    await exportAndDownload(actor, options);
    // Small delay between downloads
    await new Promise(r => setTimeout(r, 300));
  }
}
