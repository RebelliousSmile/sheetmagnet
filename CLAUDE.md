# CLAUDE.md — Agent Development Guide

This file provides context for AI agents (Claude Code, Copilot, etc.) working on Sheet Magnet.

## Project

Sheet Magnet is a PWA (SvelteKit 2 / Svelte 5) that exports TTRPG character sheets from Foundry VTT to PDF, PNG, and physical print formats. Zero-persistence architecture — all data stays in memory.

## Commands

```bash
pnpm dev              # Dev server (Vite, hot reload, LAN access)
pnpm build            # Production build (static adapter)
pnpm check:fast       # svelte-check + biome + vitest (no coverage)
pnpm check            # check:fast + coverage enforcement
pnpm test             # vitest run
pnpm test:coverage    # vitest run --coverage
```

## Architecture

```
Foundry VTT (LAN) ──HTTP──> PWA (SvelteKit)
                              ├── connectors/foundry.ts  (fetch actors)
                              ├── templates/engine.ts    (resolve bindings)
                              ├── templates/definitions.ts (layouts)
                              ├── export/pdf-renderer.ts (pdf-lib)
                              ├── export/konva-renderer.ts (Konva.js)
                              └── stores/session.ts      (memory-only state)
```

## Development Principles

### TDD — Test-Driven Development

- Write tests BEFORE or alongside code, never after
- Every new function must have a corresponding test
- Run `pnpm test` before committing — pre-commit hook enforces this
- Coverage thresholds: 80% lines/functions/branches on connectors, templates, stores, export
- Test files live next to source: `engine.ts` → `engine.test.ts`
- Use realistic fixtures from `src/lib/test-fixtures/` for functional tests

### DRY — Don't Repeat Yourself

- Extract shared logic into helpers (e.g., `mmToPt`, `mmToPx` in engine.ts)
- Use named styles (`styleName`) instead of duplicating style objects
- Template definitions reference shared style maps
- Test helpers (e.g., `makeLayout`, `makeText`) reduce boilerplate

### SOLID

- **S**: Each module has one responsibility (connector fetches, engine resolves, renderer draws)
- **O**: Templates are open for extension (add new layouts without modifying engine)
- **L**: All renderers accept `ResolvedLayout` — swap PDF for PNG transparently
- **I**: `ResolvedElement` is a flat interface — renderers only read what they need
- **D**: Engine depends on `TemplateDefinition` interface, not concrete templates

### KISS — Keep It Simple

- No framework for CSS — plain variables + mobile-first
- No ORM — zero persistence, all data in memory
- No server — static SvelteKit adapter, LAN-only communication
- Template engine is a single recursive function (`resolveElement`)
- Bindings are simple string interpolation (`{{actor.name}}`)

## Conventions

| Aspect | Rule |
|--------|------|
| Language | TypeScript strict, `noUncheckedIndexedAccess` |
| Framework | SvelteKit 2, Svelte 5 runes |
| Lint + Format | Biome (single quotes, 2-space indent, organize imports) |
| Tests | Vitest, coverage 80%+ on lib modules |
| Commits | Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`) |
| CI | GitHub Actions → `pnpm check` |
| Pre-commit | Husky → `pnpm check:fast` |
| Packages | pnpm (not npm, not yarn) |
| Data | Zero persistence — memory only, no localStorage for user data |
| Security | LAN only, Bearer tokens, read-only, CORS restricted |

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/templates/engine.ts` | Template resolution — the core algorithm |
| `src/lib/templates/types.ts` | All TypeScript interfaces for the template system |
| `src/lib/templates/definitions.ts` | Layout definitions for each export format |
| `src/lib/export/pdf-renderer.ts` | PDF generation via pdf-lib |
| `src/lib/export/konva-renderer.ts` | Canvas preview + PNG export via Konva.js |
| `src/lib/connectors/foundry.ts` | Foundry VTT REST API client |
| `src/lib/stores/session.ts` | Session state (connection, actors, selection) |
| `foundry-module/scripts/api.js` | Foundry VTT module (server-side, vanilla JS) |
| `src/lib/test-fixtures/` | Realistic D&D 5e and City of Mist actor data |
| `MASTER_PLAN.md` | Roadmap with phases, bugs, and architecture notes |

## Template Engine

The template engine resolves declarative layouts into flat element arrays:

1. `resolve(template, { actor })` walks `template.layout[]`
2. Each element can have:
   - `{{binding}}` interpolation in text/image content
   - `condition` — show/hide based on truthy binding
   - `styleName` — reference a named style from `template.styles`
   - `repeat` with `bind`, `filter`, `maxItems`, `gap`, `direction`
3. Output: `ResolvedLayout { width, height, elements: ResolvedElement[] }`
4. Renderers (PDF/Konva) consume the resolved layout

### Repeat Filter

```typescript
{
  type: 'repeat',
  bind: '{{actor.items}}',
  filter: '{{item.equipped}}',  // only items where equipped is truthy
  direction: 'vertical',
  gap: 2,
  maxItems: 20,
  template: [{ type: 'text', content: '{{item.name}}' }]
}
```

## System-Specific Data

Different TTRPG systems structure actor data differently:

- **D&D 5e**: Rich `actor.system` (abilities, attributes, skills, traits). Items are equipment/spells/features.
- **City of Mist**: Sparse `actor.system` (biography, buildup). Game data lives in `actor.items[]` as embedded documents (themes, tags, statuses, clues).

Use `actor._meta.systemId` to detect the system. Use `repeat` with `filter` to show only relevant item types.

## Don'ts

- Don't add features not in the current phase of MASTER_PLAN.md
- Don't use `npm` or `yarn` — this project uses `pnpm`
- Don't store user data in localStorage (zero-persistence rule)
- Don't import Konva in non-browser contexts (use mocks in tests)
- Don't commit with `--no-verify` — fix the lint/test errors instead
- Don't push to main without merging from a feature branch
