# Sheet Magnet

> Export your TTRPG character sheets to anything

Sheet Magnet connects to your Foundry VTT instance and exports character sheets to multiple formats — from PDF to poker cards to pencil wraps.

## Features

- **Zero storage** — Your data stays on your network, nothing is persisted
- **Multi-format export** — PDF (A3, A4, A5, A6), PNG, poker cards
- **Print services** — Order physical prints via Printful (coming soon)
- **Mobile-first PWA** — Works on any device, installable

## Architecture

```
┌─────────────────────────┐              ┌─────────────────────────┐
│   FOUNDRY VTT           │              │   SHEET MAGNET PWA      │
│   (your PC/server)      │              │   (your browser)        │
├─────────────────────────┤    LAN       ├─────────────────────────┤
│ foundry-module/         │◄────────────►│ src/                    │
│   scripts/api.js        │    HTTP      │   lib/connectors/       │
│   (REST API server)     │              │   (fetch client)        │
└─────────────────────────┘              └─────────────────────────┘
         │                                         │
         │ Exposes actors                          │ Fetch → Render → Export
         │ via /api/sheet-magnet                   │
         │                                         ▼
         │                               ┌─────────────────────────┐
         │                               │ Template Engine         │
         │                               │   ↓                     │
         │                               │ KonvaRenderer (PNG)     │
         │                               │ PdfRenderer (PDF)       │
         └───────────────────────────────┴─────────────────────────┘
                      Zero persistence - memory only
```

## Project Structure

```
sheet-magnet/
│
├── src/                          # PWA (SvelteKit)
│   ├── lib/
│   │   ├── connectors/           # Data source adapters
│   │   │   ├── foundry.ts        # Foundry VTT client
│   │   │   └── index.ts
│   │   ├── templates/            # Layout engine
│   │   │   ├── types.ts          # TypeScript interfaces
│   │   │   ├── engine.ts         # Binding resolution
│   │   │   ├── definitions.ts    # A3, A4, A5, A6, Poker card
│   │   │   └── index.ts
│   │   ├── export/               # Renderers
│   │   │   ├── konva-renderer.ts # Canvas preview + PNG export
│   │   │   ├── pdf-renderer.ts   # PDF generation (pdf-lib)
│   │   │   └── index.ts          # Unified export API
│   │   └── stores/
│   │       └── session.ts        # Session state (memory only)
│   ├── routes/
│   │   ├── +page.svelte          # Connect to Foundry
│   │   ├── +layout.svelte        # App shell
│   │   ├── select/               # Choose characters
│   │   ├── template/             # Choose export format
│   │   ├── preview/              # Preview with Konva
│   │   └── export/               # Download or order prints
│   ├── app.html                  # HTML template
│   ├── app.css                   # Mobile-first styles
│   └── app.d.ts                  # TypeScript declarations
│
├── foundry-module/               # Foundry VTT Module
│   ├── module.json               # Module manifest
│   ├── scripts/
│   │   └── api.js                # REST API + CORS
│   └── templates/
│       └── connection-dialog.html # QR code UI
│
├── static/
│   └── manifest.json             # PWA manifest
│
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Quick Start

### 1. Install the Foundry Module

Copy `foundry-module/` to your Foundry VTT modules directory:

```bash
cp -r foundry-module/ /path/to/foundry/Data/modules/sheet-magnet-connector/
```

Then enable "Sheet Magnet Connector" in your world's module settings.

### 2. Run the PWA (Development)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 on your phone or PC.

### 3. Connect

1. In Foundry, open the **Actors Directory**
2. Click the **Sheet Magnet** button (QR icon)
3. Scan the QR code with your phone, or manually enter:
   - **URL**: `http://<your-foundry-ip>:30000/api/sheet-magnet`
   - **Token**: (shown in the dialog)

### 4. Export

1. Select characters
2. Choose format (PDF A4, PNG card, etc.)
3. Preview
4. Download or order prints

## Development

```bash
# Dev server with hot reload
npm run dev

# Type checking
npm run check

# Production build
npm run build

# Preview production build
npm run preview
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| PWA Framework | SvelteKit 2, Svelte 5 |
| PDF Generation | pdf-lib |
| Canvas/Preview | Konva.js |
| Template System | TypeScript declarative layouts |
| Styling | Custom CSS (mobile-first) |
| Foundry Module | Vanilla JS |

## Supported Export Formats

| Format | Size | Use Case |
|--------|------|----------|
| PDF A3 | 297×420mm | Poster |
| PDF A4 | 210×297mm | Standard sheet |
| PDF A5 | 148×210mm | Booklet |
| PDF A6 | 105×148mm | Pocket |
| PNG Card | 63×88mm | Poker card (Printful) |

## Roadmap

- [x] Foundry VTT connector
- [x] PDF export (A3-A6)
- [x] PNG export
- [x] Poker card format
- [x] Template engine with bindings
- [x] Konva preview
- [ ] System-specific templates (City of Mist, D&D 5e, etc.)
- [ ] Printful API integration
- [ ] More print formats (stickers, pencil wraps, mugs)
- [ ] QR code scanner for mobile

## Security

- **Local network only** — The Foundry module only accepts connections from your LAN
- **Session tokens** — New token generated each Foundry session
- **Read-only** — No write access to Foundry data
- **Zero persistence** — Nothing stored on servers

## Contributing

1. Fork the repo
2. Create a feature branch
3. Submit a PR

## License

MIT

---

**Sheet Magnet** — *Your character, everywhere.*
