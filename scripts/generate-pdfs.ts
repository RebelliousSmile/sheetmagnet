/**
 * Generate sample PDFs from test fixtures.
 * Run: pnpm tsx scripts/generate-pdfs.ts
 * Output: output/*.pdf
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from '../src/lib/templates/engine';
import { getTemplate } from '../src/lib/templates/definitions';
import '../src/lib/templates/systems';
import { PdfRenderer } from '../src/lib/export/pdf-renderer';
import { CITY_OF_MIST_CHARACTER } from '../src/lib/test-fixtures/citymist-character';
import { DND5E_FIGHTER } from '../src/lib/test-fixtures/dnd5e-fighter';
import { LITM_CHARACTER } from '../src/lib/test-fixtures/litm-character';
import { PBTA_AW_CHARACTER } from '../src/lib/test-fixtures/pbta-aw-character';
import { PBTA_MOTW_CHARACTER } from '../src/lib/test-fixtures/pbta-motw-character';

mkdirSync('output', { recursive: true });

const jobs = [
  {
    actor: DND5E_FIGHTER,
    templateId: 'pdf-a4-dnd5e',
    filename: 'dnd5e-fighter-a4.pdf',
  },
  {
    actor: DND5E_FIGHTER,
    templateId: 'pdf-a4',
    filename: 'dnd5e-fighter-generic-a4.pdf',
  },
  {
    actor: CITY_OF_MIST_CHARACTER,
    templateId: 'pdf-a4-city-of-mist',
    filename: 'citymist-marlowe-a4.pdf',
  },
  {
    actor: CITY_OF_MIST_CHARACTER,
    templateId: 'pdf-a4',
    filename: 'citymist-marlowe-generic-a4.pdf',
  },
  {
    actor: LITM_CHARACTER,
    templateId: 'pdf-a4-litm',
    filename: 'litm-sienna-a4.pdf',
  },
  {
    actor: LITM_CHARACTER,
    templateId: 'pdf-a4',
    filename: 'litm-sienna-generic-a4.pdf',
  },
  {
    actor: PBTA_AW_CHARACTER,
    templateId: 'pdf-a4-pbta',
    filename: 'pbta-aw-cass-a4.pdf',
  },
  {
    actor: PBTA_MOTW_CHARACTER,
    templateId: 'pdf-a4-pbta',
    filename: 'pbta-motw-elena-a4.pdf',
  },
];

async function main() {
  for (const job of jobs) {
    const template = getTemplate(job.templateId);
    if (!template) {
      console.error(`Template ${job.templateId} not found`);
      continue;
    }
    const layout = resolve(template, { actor: job.actor });
    const renderer = new PdfRenderer(layout);
    const bytes = await renderer.toBytes();
    writeFileSync(`output/${job.filename}`, bytes);
    console.log(
      `OK  output/${job.filename} (${bytes.length} bytes, ${layout.elements.length} elements)`,
    );
  }
}

main().catch(console.error);
