# AfricaSkills — aperçu web interactif

Cet aperçu reproduit **et étend** dans le navigateur les écrans et les parcours de l'application
**Android** (`app/`, Kotlin + Jetpack Compose) du dépôt : mêmes domaines, mêmes cours, mêmes leçons,
mêmes flashcards SM-2, mêmes badges, mêmes attestations, mêmes offres d'emploi et mêmes messages.

Il existe parce que l'APK ne peut pas être compilé dans l'environnement de prévisualisation
(pas de JDK ni de SDK Android, dépôts Maven inaccessibles, wrapper Gradle absent du dépôt).
Voir `../ANALYSE.md` pour le détail.

## Lancer

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm test         # vitest : 23 tests unitaires
npm run build    # build de production dans web/dist (+ service worker)
npm run preview  # sert le build
```

## Compte de démonstration

- **E-mail** : `ismaila@africaskills.org`
- **Mot de passe** : `Africa2026`

Ou « Créer un compte » : le compte reste local au navigateur (mot de passe haché, jamais envoyé).

## Ce qui est réel dans l'aperçu

### Contenu et règles métier (identiques à Kotlin)

- Catalogue de **14 cours / 14 domaines / 25 leçons** ; quiz (bonne réponse = +50 XP, progression +25 %).
- Flashcards avec le **même algorithme SM-2** que l'app (facteur de facilité ≥ 1,3, intervalles 1 / 6 /
  intervalle × EF, remise à zéro sous la note 3), +15 XP par révision.
- Déblocage automatique des **5 badges** (Bronze → Diamant) selon XP, cours validés et niveau d'anglais.

### Fonctionnalités ajoutées pour aller au bout des parcours

| Fonction | Détail |
|---|---|
| Routage par URL | `#/cours/:id/:leçon`, `#/revision/:carte`, `#/certifications`… : partage, retour navigateur, rechargement sans perte d'écran |
| Palette de commande | `Ctrl/⌘ + K` : recherche accent-insensible sur cours, leçons, cartes, emplois, projets, messages ; navigation clavier (↑ ↓ Entrée) |
| Plan du jour | 3 actions calculées : cartes dues (SM-2), prochaine leçon, XP restants avant l'objectif quotidien |
| Série et objectif | Série de jours consécutifs, anneau de progression quotidienne, barres des 7 derniers jours, objectif réglable (30/60/100 XP) |
| Notes de leçon | Zone de notes persistée par leçon, indicateur de sauvegarde locale |
| Deep links de révision | Ouvrir une carte précise depuis la palette ; filtre « à réviser » basé sur les échéances SM-2 |
| Profil analytique | Carte de chaleur d'activité (12 semaines), précision aux quiz, progression par cours, favoris |
| Sauvegarde | Export / import JSON de toute la progression, réinitialisation de la démo |
| Attestations | Paiement Mobile Money simulé, numéro + URL de vérification, **impression A4 / PDF** (`window.print()`) |
| PWA hors-ligne | `manifest.webmanifest`, icônes 192/512, service worker « stale-while-revalidate », bannière hors-ligne |
| Accessibilité | Contrastes, focus visibles, `aria-label`, navigation clavier des feuilles (`Échap`) |

### Qualité

- TypeScript strict (`tsc --noEmit`), découpage `lib/` (logique pure) ↔ `store.tsx` (état) ↔ `screens/` (UI).
- **23 tests unitaires** Vitest : SM-2, séries, fenêtre d'activité, seuils de badges, précision, routage, recherche.
- Données **générées depuis le Kotlin** : aucune double saisie.

## Ce qui est simulé (comme dans l'app Android)

- **Paiement Mobile Money** : aucun débit réel, validation après 1,2 s puis attestation marquée payée.
- **Attestations** : numéro, URL de vérification et signature générés localement (domaine fictif).
- **Session live FATA** : aucun flux audio/vidéo, messages pré-remplis.
- **Authentification** : locale, sans backend. Le compte démo est public par construction.
- **Service worker** : enregistré uniquement sur le build de production (`import.meta.env.PROD`).

## Structure

```
web/
├── index.html                 # manifeste, polices, meta PWA
├── src/
│   ├── main.tsx               # AppProvider + enregistrement du service worker
│   ├── App.tsx                # coque, routeur, barre supérieure, onglets, live FATA, palette, toasts
│   ├── store.tsx              # état persistant v2, auth locale, migration v1, dispatch
│   ├── styles.css             # thème clair/sombre, composants, écrans, impressions
│   ├── types.ts               # types du seed
│   ├── lib/
│   │   ├── sm2.ts             # algorithme SM-2 pur (testé)
│   │   ├── progress.ts        # séries, activité, seuils, précision (testé)
│   │   ├── router.tsx         # routage par hash + navigation
│   │   ├── search.ts          # index de recherche accent-insensible (testé)
│   │   └── format.ts          # FCFA, dates, initiales
│   ├── data/seed.json         # données extraites du repository Kotlin
│   ├── components/            # icônes, cartes, feuilles, toasts, palette
│   └── screens/               # Login, Dashboard, Cours, Révision, Certifs, Réseau, Profil
└── public/                    # logo, police Plus Jakarta Sans, icônes PWA, service worker
```

`src/data/seed.json` est généré depuis le code Kotlin avec `tools/extract_seed.py`
(les données ne sont donc saisies qu'une seule fois, côté Android) :

```bash
python3 tools/extract_seed.py         # 25 leçons, 14/14 cours couverts
python3 tools/gen_extra_lessons.py    # régénère ExtraLessons.kt depuis web/src/data/extra-lessons.json
```

## Persistance

| Clé | Contenu |
|---|---|
| `africaskills.preview.v2` | progression (XP, activité, cours, leçons, notes, cartes SM-2, badges, paiements, favoris, thème) |
| `africaskills.preview.accounts` | comptes locaux, mot de passe haché (DJB2, démo uniquement) |

Les données v1 (`africaskills.preview.v1`) sont migrées automatiquement au premier chargement.

## Différences assumées avec l'app Android

- Navigation par hash (`#/…`) plutôt que `AppTab` + `Scaffold` : permet les deep links que l'app n'a pas.
- Pas de Room : l'état est sérialisé dans `localStorage` (avec export/import JSON).
- Les 7 cours qui n'avaient pas de leçon côté Android sont désormais couverts ; l'aperçu reflète le seed
  corrigé (`ExtraLessons.kt`).
