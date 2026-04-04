# Sheet Magnet — Master Plan

> Plan directeur pour compléter et livrer Sheet Magnet v1.0

---

## Vue d'ensemble

Sheet Magnet est une PWA (SvelteKit 2 / Svelte 5) qui exporte les fiches de personnages TTRPG depuis Foundry VTT vers PDF, PNG et formats d'impression physique. L'architecture est zero-persistence (mémoire seule), mobile-first, et locale (LAN uniquement).

---

## État actuel du projet (~90 % MVP)

### Complété
- Connecteur Foundry VTT (REST API, tokens, CORS)
- Moteur de templates (bindings `{{actor.name}}`, conditionnels, repeats)
- Export PDF (A3, A4, A5, A6) via pdf-lib
- Export PNG (poker card) via Konva.js
- Preview live Konva avec navigation multi-acteurs
- QR code scanner pour connexion mobile
- UI complète : landing, sélection, template, preview, export
- Localisation bilingue EN/FR
- Session store en mémoire (zero persistence)
- PWA manifest + app shell
- Tests Vitest avec couverture 100 % sur connectors & templates
- CI GitHub Actions (pnpm check)
- Biome (lint + format), Husky (pre-commit)
- Pages statiques : features, FAQ, contact

### Partiel / Incomplet
- Module Foundry : template HTML du dialog manquant
- Konva renderer : pas de corner radius sur les images
- Export page : boutons Printful en placeholder ("coming soon")
- Templates système-spécifiques : aucun (generics uniquement)

### Non commencé
- Intégration API Printful
- Formats d'impression avancés (stickers, pencil wraps, mugs)
- Templates spécifiques (City of Mist, D&D 5e, etc.)

---

## Phases de développement

### Phase 1 — Stabilisation & polish (MVP → v0.2)

**Objectif :** Rendre l'app prête pour les beta-testeurs.

| # | Tâche | Fichier(s) | Priorité |
|---|-------|-----------|----------|
| 1.1 | Compléter le template HTML du dialog Foundry | `foundry-module/templates/connection-dialog.html` | Haute |
| 1.2 | Finaliser l'enregistrement des routes API dans le module Foundry (hooks Foundry) | `foundry-module/scripts/api.js` | Haute |
| 1.3 | Ajouter corner radius images dans Konva renderer | `src/lib/export/konva-renderer.ts` | Basse |
| 1.4 | Tests E2E minimaux (happy path connect → export) | `tests/e2e/` (nouveau) | Moyenne |
| 1.5 | Vérifier le build static et le déploiement PWA | `svelte.config.js`, `static/` | Haute |
| 1.6 | Ajouter les icônes PWA réelles (192x192, 512x512) | `static/icons/` | Moyenne |
| 1.7 | Audit accessibilité (aria labels, focus, contraste) | Tous les `.svelte` | Moyenne |
| 1.8 | Optimiser le CSS (nettoyer les styles orphelins) | `src/app.css` | Basse |

### Phase 2 — Templates système-spécifiques (v0.3)

**Objectif :** Supporter les systèmes TTRPG populaires avec des layouts dédiés.

| # | Tâche | Fichier(s) | Priorité |
|---|-------|-----------|----------|
| 2.1 | Définir l'interface `SystemTemplate` pour les layouts spécifiques | `src/lib/templates/types.ts` | Haute |
| 2.2 | Template City of Mist — PDF A4 + Poker Card | `src/lib/templates/systems/city-of-mist.ts` | Haute |
| 2.3 | Template D&D 5e — PDF A4 (fiche standard) | `src/lib/templates/systems/dnd5e.ts` | Haute |
| 2.4 | Détection automatique du système depuis les données Foundry | `src/lib/connectors/foundry.ts` | Moyenne |
| 2.5 | UI de sélection de template avec filtrage par système | `src/routes/template/+page.svelte` | Moyenne |
| 2.6 | Tests unitaires pour chaque template système | `src/lib/templates/systems/*.test.ts` | Haute |
| 2.7 | Documentation des bindings par système | `docs/template-bindings.md` | Basse |

### Phase 3 — Printful & impression (v0.4)

**Objectif :** Permettre la commande de prints physiques.

| # | Tâche | Fichier(s) | Priorité |
|---|-------|-----------|----------|
| 3.1 | Créer le connecteur API Printful | `src/lib/connectors/printful.ts` | Haute |
| 3.2 | Définir les types produits Printful (poker cards, posters) | `src/lib/connectors/printful-types.ts` | Haute |
| 3.3 | UI de configuration commande (quantité, livraison) | `src/routes/export/+page.svelte` | Haute |
| 3.4 | Génération d'images haute-résolution pour impression | `src/lib/export/konva-renderer.ts` | Moyenne |
| 3.5 | Gestion des erreurs Printful (retries, statuts) | `src/lib/connectors/printful.ts` | Moyenne |
| 3.6 | Tests du connecteur Printful (mocks API) | `src/lib/connectors/printful.test.ts` | Haute |
| 3.7 | Page de suivi commande (statut, tracking) | `src/routes/order/+page.svelte` | Basse |

### Phase 4 — Formats avancés (v0.5)

**Objectif :** Élargir les options d'export au-delà de PDF/PNG.

| # | Tâche | Fichier(s) | Priorité |
|---|-------|-----------|----------|
| 4.1 | Format sticker (dimensions Printful) | `src/lib/templates/definitions.ts` | Moyenne |
| 4.2 | Format pencil wrap | `src/lib/templates/definitions.ts` | Moyenne |
| 4.3 | Format mug (cylindre → image plate) | `src/lib/templates/definitions.ts` | Basse |
| 4.4 | Preview adapté par format dans Konva | `src/lib/export/konva-renderer.ts` | Moyenne |
| 4.5 | Templates dédiés pour chaque format | `src/lib/templates/systems/` | Moyenne |
| 4.6 | Tests pour chaque nouveau format | Tests correspondants | Haute |

### Phase 5 — Production & scaling (v1.0)

**Objectif :** Prêt pour le lancement public.

| # | Tâche | Fichier(s) | Priorité |
|---|-------|-----------|----------|
| 5.1 | Déploiement statique (Vercel / Netlify / Cloudflare Pages) | CI/CD config | Haute |
| 5.2 | Domaine + SSL | Infra | Haute |
| 5.3 | Analytics anonymes (Plausible / Umami) | `src/app.html` | Basse |
| 5.4 | Documentation utilisateur complète | `docs/` | Moyenne |
| 5.5 | Landing page marketing | `src/routes/+page.svelte` | Moyenne |
| 5.6 | Performance audit (Lighthouse PWA score > 95) | Tous | Moyenne |
| 5.7 | Tests de compatibilité navigateurs (Chrome, Safari, Firefox) | Manuel | Haute |
| 5.8 | Module Foundry sur le registre officiel (package submission) | `foundry-module/module.json` | Haute |

---

## Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    FOUNDRY VTT (LAN)                    │
│  foundry-module/scripts/api.js                          │
│  ├── GET /api/sheet-magnet/actors      (liste)          │
│  ├── GET /api/sheet-magnet/actors/:id  (détail)         │
│  └── Bearer token auth + CORS                           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (LAN)
┌──────────────────────▼──────────────────────────────────┐
│                 SHEET MAGNET PWA                         │
│                                                         │
│  src/lib/connectors/                                    │
│  ├── foundry.ts      ── fetch actors via REST           │
│  └── printful.ts     ── (Phase 3) order prints          │
│                                                         │
│  src/lib/stores/                                        │
│  └── session.ts      ── état en mémoire (zero persist)  │
│                                                         │
│  src/lib/templates/                                     │
│  ├── types.ts        ── interfaces TypeScript           │
│  ├── engine.ts       ── résolution bindings             │
│  ├── definitions.ts  ── layouts A3/A4/A5/A6/Poker       │
│  └── systems/        ── (Phase 2) City of Mist, D&D 5e │
│                                                         │
│  src/lib/export/                                        │
│  ├── konva-renderer  ── preview canvas + PNG            │
│  ├── pdf-renderer    ── génération PDF (pdf-lib)        │
│  └── index.ts        ── API unifiée export              │
│                                                         │
│  src/routes/                                            │
│  ├── /              ── connexion (QR / manuel)          │
│  ├── /select        ── sélection personnages            │
│  ├── /template      ── choix format                     │
│  ├── /preview       ── aperçu Konva                     │
│  ├── /export        ── téléchargement / commande        │
│  └── /order         ── (Phase 3) suivi commande         │
└─────────────────────────────────────────────────────────┘
```

---

## Conventions de développement

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
| **Données** | Zero persistence — mémoire seule |
| **Sécurité** | LAN only, tokens session, read-only, CORS strict |

---

## Priorités de la prochaine session

1. **Phase 1.1 + 1.2** — Finaliser le module Foundry (dialog HTML + hooks API)
2. **Phase 1.5** — Vérifier le build static fonctionne end-to-end
3. **Phase 2.1 + 2.2** — Premier template système (City of Mist)

---

## Critères de succès v1.0

- [ ] Connexion Foundry → export PDF fonctionne sans erreur
- [ ] Au moins 2 systèmes TTRPG supportés avec templates dédiés
- [ ] Commande de prints physiques via Printful
- [ ] PWA installable avec score Lighthouse > 95
- [ ] Module Foundry publié sur le registre officiel
- [ ] Documentation utilisateur complète
- [ ] Tests avec couverture > 90 % globale
