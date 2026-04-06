# Déploiement du Relay Sheet Magnet sur Railway

Le relay est un serveur WebSocket qui permet à la PWA Sheet Magnet de communiquer
avec le module Foundry VTT même derrière Forge VTT (connexion cross-origin impossible autrement).

## Prérequis

- Compte [Railway](https://railway.app) (inscription gratuite via GitHub)
- Repo `RebelliousSmile/sheetmagnet` accessible sur GitHub

---

## Étapes

### 1. Créer le projet Railway

1. Va sur [railway.app](https://railway.app) et connecte-toi
2. Clique **New Project**
3. Choisis **Deploy from GitHub repo**
4. Sélectionne `RebelliousSmile/sheetmagnet`
5. Railway te demande quel dossier déployer — renseigne **Root Directory : `relay`**
6. Clique **Deploy**

Railway détecte automatiquement Node.js, installe les dépendances et lance `node server.js`.

### 2. Générer un domaine public

1. Dans ton projet Railway, va dans **Settings → Networking**
2. Clique **Generate Domain**
3. Tu obtiens une URL du type `sheet-magnet-relay-production.up.railway.app`

Note cette URL — tu en auras besoin à l'étape suivante.

### 3. Vérifier que le relay tourne

Ouvre dans ton navigateur :

```
https://<ton-domaine>.up.railway.app/health
```

Tu dois voir :

```json
{ "status": "ok", "sessions": 0 }
```

### 4. Configurer la PWA et le module Foundry

Une fois le relay déployé, indique l'URL à François-Xavier pour qu'il la configure dans :
- La PWA (`RELAY_URL` dans les paramètres de connexion)
- Le module Foundry (`api.js`)

---

## Fonctionnement

```
Sheet Magnet PWA ──WSS──> relay.railway.app <──WSS── Module Foundry (Forge VTT)
                         session UUID partagé
                         messages relayés en temps réel
```

- Chaque connexion PWA génère un `sessionId` unique (UUID)
- Le module Foundry rejoint la même session via le QR code ou le code affiché
- Les messages sont relayés entre les deux dans les deux sens
- Les sessions expirent automatiquement après 10 minutes d'inactivité

## Coût

Le relay est très léger (quelques Mo de RAM, quasi zéro CPU hors messages).
Le free tier Railway couvre largement l'usage pour un usage personnel.

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `/health` renvoie une erreur | Vérifier les logs Railway : **Deployments → View Logs** |
| Le domaine ne répond pas | Vérifier **Settings → Networking** que le port 3001 est bien exposé |
| `railway.json` ignoré | S'assurer que le Root Directory est bien `relay` dans les settings Railway |
