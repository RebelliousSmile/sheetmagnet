# Sheet Magnet — Master Plan

> Plan directeur pour compléter et livrer Sheet Magnet v1.0

---

## Vue d'ensemble

Sheet Magnet est une PWA (SvelteKit 2 / Svelte 5) qui exporte les fiches de personnages TTRPG depuis Foundry VTT vers PDF, PNG et formats d'impression physique. L'architecture est zero-persistence (mémoire seule), mobile-first, et locale (LAN uniquement).

---

## Etat actuel du projet (~60 % MVP)

### Ce qui fonctionne

- Connecteur Foundry VTT (classe FoundryConnector, types, error handling)
- Moteur de templates (bindings `{{actor.name}}`, conditionnels, repeats)
- Export PDF (A3, A4, A5, A6) via pdf-lib
- Export PNG (poker card) via Konva.js
- Preview live Konva avec navigation multi-acteurs
- QR code scanner pour connexion mobile (jsQR)
- UI complète : landing, selection, template, preview, export
- Localisation bilingue EN/FR
- Session store en memoire (zero persistence)
- PWA manifest + app shell
- Tests Vitest avec couverture 100 % sur connectors & templates
- CI GitHub Actions (pnpm check)
- Biome (lint + format), Husky (pre-commit)
- Pages statiques : features, FAQ, contact

### Bloqueurs critiques

- **Module Foundry sans routing HTTP** : `api.js` definit les handlers (`handleInfo`, `handleActorsList`, etc.) mais aucun middleware/hook ne route les requetes HTTP entrantes vers ces methodes. La PWA ne peut pas communiquer avec Foundry. Bloqueur total.
- **Template HTML du dialog inexistant** : `SheetMagnetConnectionDialog` reference `modules/sheet-magnet-connector/templates/connection-dialog.html` qui n'existe pas. Le bouton QR dans Foundry crashera.
- **Templates creux** : Les 5 definitions de templates n'affichent que nom/type/image de l'acteur. Aucune ability, aucun spell, aucun item. La zone de contenu A4 a ~150mm de vide entre les titres "Abilities" et "Inventory".

### Bugs connus dans le code existant

| Bug | Fichier | Impact |
|-----|---------|--------|
| `mergeStyles` ignore les named styles (parametre `_named` inutilise) | `engine.ts:82-85` | Les styles `title`, `subtitle`, `label`, etc. definis dans les templates ne sont jamais appliques |
| Detection d'image par extension URL au lieu de magic bytes | `pdf-renderer.ts:170-175` | Crash sur les URLs sans extension et les images WebP (format courant dans Foundry moderne) |
| Calcul de gap repeat base sur `template[0]` uniquement | `engine.ts:188-191` | Chevauchement si le premier sous-element est plus petit que le groupe |
| Text wrapping absent dans le PDF renderer | `pdf-renderer.ts:139` | Les textes longs debordent hors de leur zone |
| Pas de pagination PDF | `pdf-renderer.ts:37-59` | Un personnage avec beaucoup d'items ne tient pas sur une page |

### Non commence

- Integration API Printful (necessite un backend proxy — incompatible avec zero-persistence cote client)
- Formats d'impression avances (stickers, pencil wraps, mugs)
- Templates specifiques par systeme (City of Mist, D&D 5e)
- Fonts personnalisees (limite a Helvetica/HelveticaBold)
- Cache d'images acteur
- Progression d'export (batch multi-personnages)

---

## Phases de developpement

### Phase 0 — Make it work (MVP fonctionnel)

**Objectif :** Un utilisateur peut connecter Foundry, voir ses personnages, et telecharger un PDF/PNG qui contient du vrai contenu.

| # | Tache | Fichier(s) | Priorite | Notes |
|---|-------|-----------|----------|-------|
| 0.1 | Implementer le routing HTTP dans le module Foundry | `foundry-module/scripts/api.js` | **Bloqueur** | Foundry n'a pas de framework de routing natif. Options : intercepter via `Hooks.on('handleRequest')` (Foundry v11+), ou utiliser un polling/WebSocket fallback. Investiguer l'API Foundry cote serveur. |
| 0.2 | Creer le template HTML du dialog de connexion | `foundry-module/templates/connection-dialog.html` | **Bloqueur** | Template Handlebars avec QR code (genere via lib JS), URL copiable, token copiable, bouton refresh token |
| 0.3 | Remplir le template A4 avec le vrai contenu acteur | `src/lib/templates/definitions.ts` | **Bloqueur** | Abilities (binding `{{actor.system.abilities}}`), items (repeat sur `{{actor.items}}`), HP, AC, les champs reels de Foundry |
| 0.4 | Fixer `mergeStyles` pour appliquer les named styles | `src/lib/templates/engine.ts` | Haute | Resoudre le style par nom (`style: "title"`) en plus du style inline |
| 0.5 | Test d'integration manuel avec un vrai Foundry VTT | Manuel | **Bloqueur** | Installer le module, connecter la PWA, exporter un personnage. Documenter chaque point de friction. |
| 0.6 | Verifier le build static et le deploiement PWA | `svelte.config.js`, `static/` | Haute | `pnpm build` doit produire un site deployable, testable en local avec `pnpm preview` |

### Phase 1 — Contenu reel et fiabilite

**Objectif :** Les exports contiennent des fiches de personnages utiles et lisibles.

| # | Tache | Fichier(s) | Priorite | Notes |
|---|-------|-----------|----------|-------|
| 1.1 | Text wrapping dans le PDF renderer | `src/lib/export/pdf-renderer.ts` | Haute | `page.drawText` ne wrappe pas. Implementer un calcul de largeur par caractere et decoupage en lignes. |
| 1.2 | Text wrapping dans le Konva renderer | `src/lib/export/konva-renderer.ts` | Haute | Konva Text a un `wrap` natif — verifier qu'il est active |
| 1.3 | Pagination PDF pour contenu long | `src/lib/export/pdf-renderer.ts` | Haute | Ajouter `pdfDoc.addPage()` quand le contenu depasse la hauteur de page. Necessaire pour les inventaires longs. |
| 1.4 | Detection d'image par magic bytes | `src/lib/export/pdf-renderer.ts` | Haute | Verifier les premiers octets du `Uint8Array` : PNG = `89 50 4E 47`, JPEG = `FF D8 FF`. Supporter WebP via conversion canvas si necessaire. |
| 1.5 | Fixer le calcul de gap dans repeat | `src/lib/templates/engine.ts` | Moyenne | Utiliser les dimensions reelles du bloc repeat, pas celles de `template[0]` |
| 1.6 | Remplir les templates A5, A6, A3, Poker Card | `src/lib/templates/definitions.ts` | Moyenne | Adapter le contenu A4 aux autres formats (moins de detail sur les petits formats) |
| 1.7 | Progression d'export pour batch multi-personnages | `src/routes/export/+page.svelte` | Moyenne | Callback de progression : "Exporting 3/10..." au lieu d'un spinner muet |
| 1.8 | Cache d'images acteur en memoire | `src/lib/stores/session.ts` | Basse | Eviter de re-telecharger les images a chaque preview/export |
| 1.9 | Gestion d'erreur reseau pendant l'export | `src/lib/export/index.ts` | Moyenne | Si Foundry coupe pendant l'export, message clair au lieu d'un crash silencieux |

### Phase 2 — Polish et qualite

**Objectif :** App fiable, accessible, prête pour des utilisateurs externes.

| # | Tache | Fichier(s) | Priorite | Notes |
|---|-------|-----------|----------|-------|
| 2.1 | Support de fonts personnalisees | `src/lib/export/pdf-renderer.ts`, `konva-renderer.ts` | Haute | pdf-lib supporte l'embed de fonts TTF/OTF via `embedFont(bytes)`. Cote Konva, charger via CSS `@font-face`. Necessaire avant les templates systeme. |
| 2.2 | Audit accessibilite (aria, focus, contraste) | Tous les `.svelte` | Moyenne | Navigation clavier, labels ARIA, rapport de contraste WCAG AA |
| 2.3 | Corner radius pour images dans Konva | `src/lib/export/konva-renderer.ts` | Basse | Utiliser `clipFunc` de Konva pour clipper l'image en rounded rect |
| 2.4 | Corner radius pour rects (lire le `radius` du type) | `src/lib/export/konva-renderer.ts` | Basse | Le type `RectElement` a un champ `radius` — le connecter au rendu |
| 2.5 | Icones PWA reelles (192x192, 512x512) | `static/icons/` | Moyenne | Remplacer les placeholders par de vrais assets |
| 2.6 | Tests E2E minimaux (happy path) | `tests/e2e/` (nouveau) | Moyenne | Playwright ou similaire. Connect mock → select → template → preview → export |
| 2.7 | Optimiser le CSS | `src/app.css` | Basse | Nettoyer les styles orphelins, verifier la coherence des variables |

### Phase 3 — Ship it

**Objectif :** L'app est deployee, accessible publiquement, et le module Foundry est installable.

| # | Tache | Fichier(s) | Priorite | Notes |
|---|-------|-----------|----------|-------|
| 3.1 | Deploiement statique | CI/CD config | Haute | Cloudflare Pages ou Vercel. SvelteKit static adapter deja configure. |
| 3.2 | Domaine + SSL | Infra | Haute | Le deep link dans le QR code reference `https://sheet-magnet.app` — il faut que ca existe |
| 3.3 | Module Foundry sur le registre officiel | `foundry-module/module.json` | Haute | Package submission sur foundryvtt.com. Necessite manifest URL publique, changelog, compatibilite declaree. |
| 3.4 | Documentation utilisateur | `docs/` | Moyenne | Guide d'installation du module, guide d'utilisation de la PWA, FAQ |
| 3.5 | Performance audit (Lighthouse PWA > 95) | Tous | Moyenne | Service worker, offline fallback, optimisation des assets |
| 3.6 | Tests de compatibilite navigateurs | Manuel | Haute | Chrome, Safari (iOS — critique pour mobile-first), Firefox |

### Phase 4 — Templates systeme-specifiques

**Objectif :** Layouts dedies pour les systemes TTRPG populaires.

**Prerequis :** Phase 2.1 (fonts custom) doit etre complete.

| # | Tache | Fichier(s) | Priorite | Notes |
|---|-------|-----------|----------|-------|
| 4.1 | Definir l'interface `SystemTemplate` | `src/lib/templates/types.ts` | Haute | Etendre `TemplateDefinition` avec `systemId`, `requiredFields`, `fontAssets` |
| 4.2 | Detection automatique du systeme | `src/lib/connectors/foundry.ts` | Haute | `FoundryServerInfo.system.id` contient deja l'info (ex: `"city-of-mist"`, `"dnd5e"`). Filtrer les templates compatibles. |
| 4.3 | Template City of Mist — PDF A4 + Poker Card | `src/lib/templates/systems/city-of-mist.ts` | Haute | Bindings specifiques : themes, tags, story tags, statuses. Font thematique noir. |
| 4.4 | Template D&D 5e — PDF A4 | `src/lib/templates/systems/dnd5e.ts` | Haute | Ability scores, saving throws, skills, spells par niveau, inventory, features. Layout classique 3 colonnes. |
| 4.5 | UI de selection avec filtrage par systeme | `src/routes/template/+page.svelte` | Moyenne | Afficher seulement les templates compatibles avec le systeme detecte + les generiques |
| 4.6 | Tests unitaires par template systeme | `src/lib/templates/systems/*.test.ts` | Haute | Verifier que chaque binding correspond a des champs reels du systeme |
| 4.7 | Documentation des bindings par systeme | `docs/template-bindings.md` | Basse | Reference des chemins de donnees pour chaque systeme supporte |

### Phase 5 — Printful et impression physique

**Objectif :** Commander des prints physiques depuis l'app.

**Attention architecture :** Printful necessite une cle API secrete. Elle ne peut PAS etre exposee dans une PWA cote client. Il faut un backend proxy minimal.

| # | Tache | Fichier(s) | Priorite | Notes |
|---|-------|-----------|----------|-------|
| 5.1 | Backend proxy Printful | `api/` ou Cloudflare Worker | **Bloqueur** | Endpoint minimal : recevoir l'image + parametres, appeler l'API Printful, retourner le lien de commande. Zero stockage — l'image est transmise en transit. |
| 5.2 | Definir le modele de pricing | Documentation | **Bloqueur** | Printful facture le vendeur. Options : (a) l'utilisateur entre sa propre cle API Printful, (b) on absorbe le cout + marge, (c) redirection vers Printful en self-service. A decider avant de coder. |
| 5.3 | Connecteur API Printful | `src/lib/connectors/printful.ts` | Haute | Appelle le backend proxy, pas l'API Printful directement |
| 5.4 | Types produits Printful | `src/lib/connectors/printful-types.ts` | Haute | Poker cards, posters, stickers — dimensions et contraintes d'upload |
| 5.5 | Generation d'images haute-resolution | `src/lib/export/konva-renderer.ts` | Haute | Printful exige 300 DPI minimum. Verifier que `pixelRatio` produit une resolution suffisante pour chaque format. |
| 5.6 | UI de commande (quantite, adresse, paiement) | `src/routes/export/+page.svelte` | Haute | Formulaire de commande. Si modele (b) : integration Stripe. Si modele (a) : champ cle API. |
| 5.7 | Tests du connecteur Printful (mocks API) | `src/lib/connectors/printful.test.ts` | Haute | Mock du backend proxy |
| 5.8 | Page de suivi commande | `src/routes/order/+page.svelte` | Basse | Statut Printful, tracking number |
| 5.9 | Formats avances (stickers, pencil wraps, mugs) | `src/lib/templates/definitions.ts` | Basse | Ajouter apres validation du flow poker card |

---

## Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    FOUNDRY VTT (LAN)                    │
│  foundry-module/scripts/api.js                          │
│  ├── GET /api/sheet-magnet/info         (public)        │
│  ├── GET /api/sheet-magnet/actors       (token auth)    │
│  ├── GET /api/sheet-magnet/actors/:id   (token auth)    │
│  ├── GET /api/sheet-magnet/actors/:id/image (token auth)│
│  └── Routing: a implementer (Phase 0.1)                 │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (LAN)
┌──────────────────────▼──────────────────────────────────┐
│                 SHEET MAGNET PWA                         │
│                                                         │
│  src/lib/connectors/                                    │
│  ├── foundry.ts      ── fetch actors via REST           │
│  └── printful.ts     ── (Phase 5) via backend proxy     │
│                                                         │
│  src/lib/stores/                                        │
│  └── session.ts      ── etat en memoire (zero persist)  │
│                                                         │
│  src/lib/templates/                                     │
│  ├── types.ts        ── interfaces TypeScript           │
│  ├── engine.ts       ── resolution bindings + styles    │
│  ├── definitions.ts  ── layouts generiques              │
│  └── systems/        ── (Phase 4) City of Mist, D&D 5e │
│                                                         │
│  src/lib/export/                                        │
│  ├── konva-renderer  ── preview canvas + PNG            │
│  ├── pdf-renderer    ── PDF (pdf-lib) + text wrap       │
│  └── index.ts        ── API unifiee export              │
│                                                         │
│  src/routes/                                            │
│  ├── /              ── connexion (QR / manuel)          │
│  ├── /select        ── selection personnages            │
│  ├── /template      ── choix format                     │
│  ├── /preview       ── apercu Konva                     │
│  ├── /export        ── telechargement / commande        │
│  └── /order         ── (Phase 5) suivi commande         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS (Phase 5 uniquement)
┌──────────────────────▼──────────────────────────────────┐
│           BACKEND PROXY (Cloudflare Worker)              │
│  ├── POST /api/print  ── relaye vers Printful API       │
│  └── Zero stockage — image transmise en transit         │
└─────────────────────────────────────────────────────────┘
```

---

## Limitations techniques a garder en tete

| Limitation | Impact | Mitigation |
|-----------|--------|------------|
| Konva necessite un DOM (pas de SSR/Worker) | Export PNG uniquement cote navigateur, pas de batch en background | Acceptable pour MVP. Futur : offscreen canvas ou wasm-based renderer |
| pdf-lib limite a Helvetica sans embed custom | Fiches visuellement pauvres | Phase 2.1 : embed TTF/OTF |
| `/info` endpoint sans auth | Leak du system ID, world ID, version Foundry a tout le LAN | Risque faible (LAN local). Documenter. |
| Zero-persistence incompatible avec Printful | Cle API ne peut pas vivre cote client | Phase 5.1 : backend proxy |
| `drawText` PDF ne wrappe pas | Textes longs debordent | Phase 1.1 : text wrapping manuel |

---

## Conventions de developpement

| Aspect | Convention |
|--------|-----------|
| **Langage** | TypeScript strict (`noUncheckedIndexedAccess`) |
| **Framework** | SvelteKit 2, Svelte 5 (runes) |
| **Style** | Biome (format + lint), single quotes JS |
| **Tests** | Vitest, couverture 100 % sur connectors & templates |
| **Commits** | Conventional Commits (`feat:`, `fix:`, `chore:`) |
| **CI** | GitHub Actions → `pnpm check` |
| **Pre-commit** | Husky → Biome check |
| **Packages** | pnpm |
| **CSS** | Mobile-first, variables CSS, pas de framework UI |
| **Donnees** | Zero persistence — memoire seule |
| **Securite** | LAN only, tokens session, read-only, CORS strict |

---

## Priorites de la prochaine session

1. **Phase 0.1** — Implementer le routing HTTP dans le module Foundry (bloqueur)
2. **Phase 0.2** — Creer le template HTML du dialog de connexion (bloqueur)
3. **Phase 0.3** — Remplir le template A4 avec du vrai contenu (bloqueur)
4. **Phase 0.4** — Fixer mergeStyles pour les named styles
5. **Phase 0.5** — Test d'integration manuel

---

## Criteres de succes v1.0

- [ ] Connexion Foundry → export PDF fonctionne end-to-end sans erreur
- [ ] Le PDF contient des abilities, items, et spells reels (pas juste nom/image)
- [ ] Text wrapping et pagination fonctionnent sur les contenus longs
- [ ] Au moins 2 systemes TTRPG supportes avec templates dedies
- [ ] PWA installable avec score Lighthouse > 95
- [ ] Module Foundry publie sur le registre officiel
- [ ] Documentation utilisateur complete
- [ ] Tests avec couverture > 90 % globale
- [ ] (Stretch) Commande de prints physiques via Printful
