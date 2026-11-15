# AfricaSkills — port web fonctionnel

Ce port reprend dans le navigateur le catalogue et les règles de l'application **Android** (`app/`,
Kotlin + Jetpack Compose) du dépôt : 14 domaines, 14 cours, 25 leçons, flashcards SM-2, 5 paliers de
badges, chiffres sourcés et salle d'arcade. Il ajoute ce que l'app ne fournit pas : suivi réel de
candidatures, projets personnels, certificats vérifiables hors-ligne et session de concentration.

Il existe parce que l'APK ne peut pas être compilé dans cet environnement (pas de JDK ni de SDK
Android, dépôts Maven inaccessibles, wrapper Gradle absent). Voir `../ANALYSE.md`.

**Aucun mode démonstration** : pas de compte pré-rempli, pas d'offres d'emploi fictives, pas de
paiement simulé, pas de session live factice. Chaque action affichée dans l'interface correspond à un
changement d'état réellement enregistré dans le navigateur.

## Lancer

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm test         # vitest : 56 tests unitaires
npm run build    # build de production dans web/dist (+ service worker)
npm run preview  # sert le build
```

Créez votre compte : nom, e-mail, ville, niveau d'anglais, mot de passe. Le mot de passe est haché
(DJB2 + sel applicatif) et ne quitte jamais l'appareil.

## Ce qui est réel

| Fonction | Détail | Persistance |
|---|---|---|
| Cours et leçons | Quiz corrigé : bonne réponse = +50 XP, leçon validée une seule fois | `completedLessons`, `progress` |
| Révision SM-2 | Même algorithme que Kotlin (EF ≥ 1,3, intervalles 1 / 6 / EF×, échec < 3 = remise à zéro), +15 XP | `cards` |
| Badges | 5 paliers Bronze → Diamant selon XP, cours validés et niveau d'anglais, date réelle de déblocage | `badges` |
| **Certificats de cours** | Émis seulement à 100 % des leçons ; code autoportant + empreinte FNV-1a ; page publique `#/verifier/<code>` ; impression A4 / PDF | `certificates` |
| **Suivi de candidatures** | Entreprise, poste, lien d'offre, 5 statuts (À postuler → Refus), modification et suppression | `applications` |
| **Projets personnels** | Titre, besoin, 3 étapes (idée → en cours → terminé) | `projects` |
| **Session de concentration** | Minuteur 5 / 15 / 25 min, pause, reprise ; +20 XP, plafond 4 sessions par jour | `focus.dates` |
| Profil | Édition du nom, ville, téléphone, bio et niveau d'anglais ; suppression définitive des données du compte | `account` |
| Recherche | `Ctrl/⌘ + K` sur cours, leçons, cartes, chiffres, pages, **vos candidatures et vos projets** | — |
| Chiffres sourcés | 15 chiffres réels avec source cliquable, 8 ressources gratuites | `arcade.factsRead` |
| Arcade | 3 jeux, XP une fois par jour et par jeu, 7 succès, records | `arcade` |
| Sauvegarde | Export / import JSON de tout l'état ; suppression complète en deux clics | fichier local |

### Certificats : ce que le code garantit

Le code contient `{v, n, c, t, d}` encodé en base64url, suivi d'une empreinte FNV-1a de 16 caractères
hexadécimaux. La page `#/verifier/<code>` recalcule l'empreinte et affiche le nom, le cours et la date.

- Elle détecte une **altération** du code (test automatisé) et fonctionne **sans serveur ni compte**.
- Elle ne constitue **pas** une signature d'un tiers : n'importe qui peut émettre un code cohérent avec
  son propre contenu. C'est affiché tel quel sur la page, sans promesse trompeuse.

### Chiffres réels (« Vrai & vérifié »)

15 chiffres publics sur l'Afrique numérique, chacun sourcé et daté (vérification du 15/11/2026) : UIT,
GSMA, Banque mondiale (Findex), Safaricom, DataReportal, Meta, ALX, Zindi, Google, Africa: The Big Deal,
portail officiel du Bénin. Un test vérifie que chaque fiche a une URL `https`, une date, un thème connu
et un détail non vide.

**Les offres d'emploi ne sont pas inventées** : l'onglet « Job boards » renvoie vers Novojob, Zindi Jobs,
Jobberman, BrighterMonday et ReliefWeb, et le suivi vous appartient.

### Salle d'arcade

| Jeu | Règle | XP |
|---|---|---|
| **Défi éclair** | 10 questions, 15 s chacune, série et source après chaque réponse | 20 + 6 × bonnes réponses |
| **Vrai ou faux** | 8 affirmations, 8 s, explications sourcées | 10 + 2 × bonnes réponses |
| **Mémoire tech** | 6 paires entreprise ↔ pays/techno, chrono et coups | 50 si ≤ 10 coups, sinon 35 |

XP crédités une fois par jour et par jeu, 7 succès (+25 XP), records et pastille « défi du jour ».

## Responsive

Testé au navigateur (Chromium, captures reproductibles) de 360 px à 1600 px, sans débordement
horizontal (mesuré à chaque largeur) :

| Largeur | Rendu |
|---|---|
| ≤ 380 px | marges réduites, statistiques en 2 colonnes, champs à 16 px (pas de zoom iOS), CTA pleine largeur |
| 380–560 px | plein écran, barre d'onglets basse, zones sûres (`env(safe-area-inset-bottom)`) |
| 561–979 px | cadre élargi (640 px), grille de domaines plus large |
| ≥ 980 px | application large (1040 px), listes en 2 colonnes, leçons et paliers en 2 colonnes, onglets docks |
| ≥ 1400 px | 3 colonnes de cartes, 5 tuiles de domaines |

## Qualité

- TypeScript strict (`tsc --noEmit`), découpage `lib/` (logique pure) ↔ `store.tsx` (état) ↔ `screens/`.
- **56 tests** Vitest : SM-2, séries et activité, seuils de badges, précision, routage (dont
  `#/verifier`), recherche (dont candidatures et projets), chiffres, arcade, **code de certificat**,
  **statuts et job boards**.
- Données du catalogue générées depuis le Kotlin (`tools/extract_seed.py`), pas de double saisie.

## Structure

```
web/
├── index.html                 # manifeste, polices, meta PWA
├── src/
│   ├── main.tsx               # AppProvider + service worker
│   ├── App.tsx                # coque, routeur, onglets, palette, session de concentration, toasts
│   ├── store.tsx              # état persistant v3, comptes locaux, dispatch
│   ├── styles.css             # thème clair/sombre, responsive, impression
│   ├── types.ts               # types du seed
│   ├── lib/
│   │   ├── sm2.ts             # SM-2 pur (testé)
│   │   ├── progress.ts        # séries, activité, seuils, précision (testé)
│   │   ├── certificate.ts     # émission et vérification du code (testé)
│   │   ├── user-projects.ts   # statuts, étapes, job boards (testé)
│   │   ├── router.tsx         # routage par hash, dont #/verifier/<code> (testé)
│   │   ├── search.ts          # index accent-insensible (testé)
│   │   ├── facts.ts           # chiffres, sources, ressources (testé)
│   │   ├── arcade.ts          # tirages, scoring, succès (testé)
│   │   └── format.ts          # FCFA, dates, initiales
│   ├── data/seed.json         # catalogue extrait du dépôt Kotlin
│   ├── data/facts.json        # 15 chiffres + 8 ressources + sources
│   ├── data/arcade.json       # questions, vrai/faux, paires mémoire
│   ├── components/            # icônes, cartes, feuilles, toasts, palette
│   └── screens/               # Login, Dashboard, Cours, Révision, Certifs, Réseau, Profil, Vrai, Arcade, Verify
└── public/                    # logo, police, icônes PWA, service worker
```

## Persistance

| Clé | Contenu |
|---|---|
| `africaskills.app.v3` | XP, activité, cours, leçons, notes, cartes SM-2, badges, certificats, candidatures, projets, sessions, favoris, thème, objectif |
| `africaskills.preview.accounts` | comptes locaux (mot de passe haché, sel applicatif) |

Les états v1 et v2 sont migrés automatiquement au premier chargement.

## Différences assumées avec l'app Android

- Navigation par hash (`#/…`) : deep links et retour navigateur que l'app n'a pas.
- Pas de Room : l'état est sérialisé dans `localStorage`, avec export/import JSON.
- Pas de paiement : les certificats sont gratuits et ne dépendent d'aucun règlement.
- Le service worker n'est enregistré qu'en production (`import.meta.env.PROD`).
