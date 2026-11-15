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

### Des chiffres réels, sourcés (« Vrai & vérifié »)

Onglet accessible par la palette (`Ctrl+K` → « Vrai ») ou la fiche du jour de l'accueil : **15 chiffres
publics sur l'Afrique numérique**, chacun avec sa source cliquable et sa date de vérification
(15/11/2026) — UIT, GSMA, Banque mondiale (Findex), Safaricom, DataReportal, Meta, ALX, Zindi, Google,
Africa: The Big Deal, portail officiel du Bénin.

- Fiches filtrables par thème (connectivité, mobile money, formation, financement, Bénin, Google),
  marquées comme lues (+5 XP), lien de source copiable.
- **8 ressources gratuites vérifiées** : Skilling Africa with Google (lancé le 2 novembre 2026, hors-ligne),
  Google Career Certificates, ALX, Zindi, Sèmè City, freeCodeCamp, Kaggle Learn, Novojob.
- Un test automatisé vérifie que **chaque fiche a une URL https, une date, un thème connu et un détail
  non vide**, et que chaque question de quiz pointe vers une fiche existante.
- Les données de démonstration (cours, offres d'emploi, attestations) sont explicitement signalées comme
  fictives ; les offres citent des entreprises réelles uniquement à titre d'exemple.

### Salle d'arcade (expérience ludique)

Trois mini-jeux sur les mêmes chiffres, avec XP, combos, records et succès :

| Jeu | Règle | XP |
|---|---|---|
| **Défi éclair** | 10 questions, 15 s chacune, série de bonnes réponses, source affichée après chaque réponse | 20 + 6 × bonnes réponses |
| **Vrai ou faux** | 8 affirmations, 8 s, pièges et explications sourcées | 10 + 2 × bonnes réponses |
| **Mémoire tech** | 6 paires (entreprise ↔ pays/techno) à retrouver, chrono et compteur de coups | 50 si ≤ 10 coups, sinon 35 |

- XP crédités **une fois par jour et par jeu** ; les parties suivantes restent des entraînements notés.
- **7 succès** (Premier pas, Semaine solide, Sang-froid, Œil de lynx, Mémoire de fer, Curieux,
  Explorateur) évalués automatiquement, +25 XP chacun, toast de déblocage groupé.
- Confettis, barre de temps, combos, records persistés, pastille orange sur l'icône manette quand un
  défi du jour reste à jouer.

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
│   │   ├── facts.ts           # chiffres vérifiés, sources, ressources (testé)
│   │   ├── arcade.ts          # tirages quotidiens, scoring, succès (testé)
│   │   └── format.ts          # FCFA, dates, initiales
│   ├── data/seed.json         # données extraites du repository Kotlin
│   ├── data/facts.json        # 15 chiffres réels + 8 ressources + sources
│   ├── data/arcade.json       # 30 questions, 13 vrai/faux, 8 paires mémoire
│   ├── components/            # icônes, cartes, feuilles, toasts, palette
│   └── screens/               # Login, Dashboard, Cours, Révision, Certifs, Réseau, Profil, Vrai, Arcade
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
