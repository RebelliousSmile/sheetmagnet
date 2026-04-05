# Sheet Magnet — Master Plan

> Plan directeur pour compléter et livrer Sheet Magnet v1.0

---

## Vue d'ensemble

Sheet Magnet est une PWA (SvelteKit 2 / Svelte 5) qui exporte les fiches de personnages TTRPG depuis Foundry VTT vers PDF, PNG et formats d'impression physique. L'architecture est zero-persistence (mémoire seule), mobile-first, et locale (LAN uniquement).

---

## Etat actuel du projet (~85 % MVP)

### Ce qui fonctionne

- Connecteur Foundry VTT via socket.io natif (cross-version v10-v13)
- Dialog de connexion Foundry avec QR code et saisie manuelle
- Moteur de templates (bindings `{{actor.name}}`, conditionnels, repeats, named styles)
- 5 systemes TTRPG avec templates dedies (D&D 5e, City of Mist, PbtA, Cypher, Legend in the Mist)
- Export PDF (A3, A4, A5, A6) via pdf-lib avec text wrapping
- Export PNG (poker card) via Konva.js
- Preview live Konva avec navigation multi-acteurs
- QR code scanner pour connexion mobile (jsQR)
- UI complete : landing, selection, template, preview, export
- Localisation bilingue EN/FR
- Session store en memoire (zero persistence)
- PWA manifest + icones + app shell
- 332 tests Vitest avec couverture 84% branches, 98% statements
- CI GitHub Actions (pnpm check)
- Biome (lint + format), Husky (pre-commit)
- Pages statiques : features, FAQ, contact
- Securite : validation URL, comparaison constant-time du token, CSP, validation protocole images

### Bloqueurs critiques

Aucun bloqueur technique restant. Les 3 bloqueurs originaux (routing socket, dialog HTML, templates creux) sont resolus.

### Bugs connus

| Bug | Fichier | Impact | Statut |
|-----|---------|--------|--------|
| ~~`mergeStyles` ignore les named styles~~ | `engine.ts` | ~~Styles non appliques~~ | **Resolu** |
| Detection d'image par magic bytes (PNG/JPG) | `pdf-renderer.ts` | WebP non supporte nativement | Mitige (magic bytes PNG/JPG OK) |
| ~~Calcul de gap repeat~~ | `engine.ts` | ~~Chevauchement~~ | **Resolu** |
| ~~Text wrapping absent dans le PDF renderer~~ | `pdf-renderer.ts` | ~~Debordement texte~~ | **Resolu** |
| Pas de pagination PDF | `pdf-renderer.ts` | Inventaires longs coupes | Ouvert |

### Non commence

- Integration API Printful (necessite un backend proxy — incompatible avec zero-persistence cote client)
- Formats d'impression avances (stickers, pencil wraps, mugs)
- Tests E2E navigateur (Playwright)
- Service worker / mode offline

---

## Phases de developpement

### Phase 0 — Make it work (MVP fonctionnel) ✅ COMPLETE

**Objectif :** Un utilisateur peut connecter Foundry, voir ses personnages, et telecharger un PDF/PNG qui contient du vrai contenu.

| # | Tache | Statut | Notes |
|---|-------|--------|-------|
| 0.1 | Communication Foundry via socket.io natif | ✅ | Utilise `game.socket` au lieu de HTTP — compatible v10-v13 |
| 0.2 | Dialog de connexion avec QR code | ✅ | Template Handlebars + boutons copie URL/token/refresh |
| 0.3 | Templates A4 avec vrai contenu acteur | ✅ | 5 systemes TTRPG avec bindings complets |
| 0.4 | Named styles resolus dans mergeStyles | ✅ | Styles `title`, `subtitle`, `label` appliques correctement |
| 0.5 | Test d'integration manuel | ⚠️ | Non verifie formellement |
| 0.6 | Build static et deploiement PWA | ✅ | `pnpm build` produit un site statique fonctionnel |

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

### Phase 4 — Templates systeme-specifiques ✅ COMPLETE

**Objectif :** Layouts dedies pour les systemes TTRPG populaires.

| # | Tache | Statut | Notes |
|---|-------|--------|-------|
| 4.1 | Interface `SystemTemplate` avec `systemId` | ✅ | `TemplateDefinition.meta.systemId` |
| 4.2 | Detection automatique du systeme | ✅ | Via `actor._meta.systemId` |
| 4.3 | Template City of Mist — PDF A4 | ✅ | Themes, tags, statuses, clues. 289+ tests |
| 4.4 | Template D&D 5e — PDF A4 | ✅ | Abilities, combat, inventory, spells |
| 4.5 | Template PbtA — PDF A4 | ✅ | Apocalypse World + Monster of the Week. 291+ tests |
| 4.6 | Template Cypher — PDF A4 | ✅ | Numenera + The Strange. 299+ tests |
| 4.7 | Template Legend in the Mist — PDF A4 | ✅ | 282+ tests |
| 4.8 | Tests unitaires par template systeme | ✅ | pipeline.test.ts + e2e-pdf.test.ts |

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
│  ├── socket: 'info'                     (public)        │
│  ├── socket: 'actors'                   (token auth)    │
│  ├── socket: 'actor'                    (token auth)    │
│  ├── socket: 'actorImage'               (token auth)    │
│  └── Channel: module.sheet-magnet-connector             │
└──────────────────────┬──────────────────────────────────┘
                       │ socket.io WebSocket (LAN)
┌──────────────────────▼──────────────────────────────────┐
│                 SHEET MAGNET PWA                         │
│                                                         │
│  src/lib/connectors/                                    │
│  ├── foundry.ts      ── socket.io client + requestId    │
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
| **Tests** | Vitest, couverture 80%+ branches globale, 332 tests |
| **Commits** | Conventional Commits (`feat:`, `fix:`, `chore:`) |
| **CI** | GitHub Actions → `pnpm check` |
| **Pre-commit** | Husky → `pnpm check:fast` (biome + svelte-check + tests) |
| **Packages** | pnpm |
| **CSS** | Mobile-first, variables CSS, pas de framework UI |
| **Donnees** | Zero persistence — memoire seule |
| **Securite** | LAN only, tokens session, read-only, CSP, URL validation, constant-time token comparison |

---

## Priorites de la prochaine session

1. **Phase 1.3** — Pagination PDF pour contenu long (seul bug ouvert impactant)
2. **Phase 2.6** — Tests E2E minimaux (Playwright, happy path)
3. **Phase 3.1** — Deploiement statique (Cloudflare Pages / Vercel)
4. **Phase 3.2** — Domaine + SSL (deep link QR reference `https://sheet-magnet.app`)
5. **Phase 3.3** — Publier le module Foundry sur le registre officiel

---

## Criteres de succes v1.0

- [x] Connexion Foundry → export PDF fonctionne end-to-end sans erreur
- [x] Le PDF contient des abilities, items, et spells reels (pas juste nom/image)
- [x] Text wrapping fonctionne dans le PDF renderer
- [ ] Pagination PDF pour les contenus longs
- [x] Au moins 2 systemes TTRPG supportes avec templates dedies (5 implementes)
- [ ] PWA installable avec score Lighthouse > 95
- [ ] Module Foundry publie sur le registre officiel
- [ ] Documentation utilisateur complete
- [x] Tests avec couverture > 80 % branches globale (84% atteint)
- [ ] (Stretch) Commande de prints physiques via Printful
