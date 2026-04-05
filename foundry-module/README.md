# Sheet Magnet Connector

Foundry VTT module that exposes actor data to the Sheet Magnet PWA for character sheet export.

## Installation

1. Copy this folder to your Foundry VTT modules directory:
   ```
   cp -r foundry-module/ /path/to/foundry/Data/modules/sheet-magnet-connector/
   ```
2. Enable "Sheet Magnet Connector" in your world's module settings.

## Usage

1. Open the **Actors Directory** in Foundry VTT.
2. Click the **Sheet Magnet** button (QR icon).
3. Scan the QR code with your phone, or copy the URL and token manually.

## How It Works

The module uses Foundry's native `game.socket` for communication (compatible with Foundry v10-v13).

- **Channel:** `module.sheet-magnet-connector`
- **Actions:** `info`, `actors`, `actor`, `actorImage`
- **Auth:** Session token generated on module load, validated per request (except `info`)

Only the GM processes socket requests to avoid duplicate responses.

## Security

- Read-only access to actor data
- Session tokens regenerated each Foundry session
- LAN-only communication
- Constant-time token comparison

## Compatibility

| Foundry Version | Status |
|-----------------|--------|
| v10 | Minimum supported |
| v11 | Supported |
| v12 | Verified |
| v13 | Expected compatible |

## License

MIT
