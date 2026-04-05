# Contributing to Sheet Magnet

Thank you for your interest in contributing! This guide will help you get started.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- A Foundry VTT instance (for integration testing)

## Setup

```bash
git clone https://github.com/RebelliousSmile/sheetmagnet.git
cd sheetmagnet
pnpm install
pnpm dev
```

## Development Workflow

### 1. Create a feature branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Write tests first (TDD)

We follow Test-Driven Development. Write your test before or alongside the implementation:

```bash
pnpm test           # run tests once
pnpm vitest         # run tests in watch mode
```

Test files live next to source files: `engine.ts` -> `engine.test.ts`.

### 3. Write the code

Follow these principles:
- **DRY** — don't duplicate logic, extract shared helpers
- **SOLID** — single responsibility, depend on interfaces
- **KISS** — simplest solution that works, no premature abstraction

### 4. Lint and format

Biome handles both linting and formatting:

```bash
pnpm biome check src/         # check for issues
pnpm biome check --write src/ # auto-fix
```

The pre-commit hook runs `pnpm check:fast` automatically. If it fails, fix the issues before committing.

### 5. Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add poker card template for City of Mist
fix: PDF renderer handles WebP images via magic bytes
test: add repeat filter coverage for engine
chore: update Biome to 2.5.0
docs: add template binding reference
```

### 6. Submit a Pull Request

- Keep PRs focused on a single change
- Include a summary of what changed and why
- Reference any related issues
- Ensure CI passes (GitHub Actions runs `pnpm check`)

## Project Structure

```
src/lib/connectors/    # Data source adapters (Foundry VTT)
src/lib/templates/     # Template engine, types, layout definitions
src/lib/export/        # Renderers (PDF, PNG/Konva)
src/lib/stores/        # Session state (memory-only)
src/lib/components/    # Svelte UI components
src/lib/test-fixtures/ # Realistic actor data for tests
src/routes/            # SvelteKit pages
foundry-module/        # Foundry VTT module (vanilla JS)
```

## Testing

### Running tests

```bash
pnpm test              # run all tests
pnpm test:coverage     # run with coverage report
pnpm vitest            # watch mode
```

### Test structure

- **Unit tests**: test individual functions in isolation (engine, connectors, stores)
- **Functional tests**: test the full pipeline with realistic data (fixtures -> resolve -> PDF)
- **Fixtures**: `src/lib/test-fixtures/` contains realistic D&D 5e and City of Mist actor data

### Coverage

Coverage is enforced at 80% for `connectors/`, `templates/`, `stores/`, and `export/` modules. Aim for meaningful assertions, not just "doesn't throw".

## Code Style

Enforced by [Biome](https://biomejs.dev/):

- 2-space indentation
- Single quotes for JavaScript/TypeScript
- Imports organized alphabetically
- No unused variables or imports
- See `biome.json` for full configuration

## Architecture Notes

Read `CLAUDE.md` for detailed architecture documentation and `MASTER_PLAN.md` for the project roadmap.

Key design decisions:
- **Zero persistence** — no server storage, no database, all data in memory
- **LAN only** — Foundry module communicates over local network
- **Static deployment** — SvelteKit static adapter, PWA installable
- **Template-driven** — layout definitions are declarative, engine resolves bindings

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
