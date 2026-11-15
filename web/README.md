# AfricaSkills — aperçu web interactif

Cet aperçu reproduit dans le navigateur les écrans et les parcours de l'application **Android**
(`app/`, Kotlin + Jetpack Compose) du dépôt : mêmes domaines, mêmes cours, mêmes leçons, mêmes
flashcards SM-2, mêmes badges, mêmes attestations, mêmes offres d'emploi et mêmes messages.

Il existe parce que l'APK ne peut pas être compilé dans l'environnement de prévisualisation
(pas de JDK ni de SDK Android, dépôts Maven inaccessibles, wrapper Gradle absent du dépôt).
Voir `../ANALYSE.md` pour le détail.

## Lancer

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans web/dist
```

## Compte de démonstration

- **E-mail** : `ismaila@africaskills.org`
- **Mot de passe** : `Africa2026`

Ou « Créer un compte » : le compte reste local au navigateur (mot de passe haché, jamais envoyé).

## Ce qui est réel dans l'aperçu

- Catalogue de 14 cours / 14 domaines, leçons et quiz (bonne réponse = +50 XP, progression +25 %).
- Flashcards avec le **même algorithme SM-2** que l'app (facteur de facilité, intervalles, répétitions).
- Déblocage automatique des badges selon les seuils (XP, cours validés, niveau d'anglais).
- Mode éclair 30 s, kanban de projets, candidatures, chat communautaire local, profil éditable,
  thèmes clair/sombre, persistance `localStorage`.

## Ce qui est simulé (comme dans l'app Android)

- **Paiement Mobile Money** : aucun débit réel, validation après 1,2 s puis attestation marquée payée.
- **Attestations** : numéro, URL de vérification et signature générés localement (domaine fictif).
- **Session live FATA** : aucun flux audio/vidéo, messages pré-remplis.
- **Authentification** : locale, sans backend. Le compte démo est public par construction.

## Structure

```
web/
├── index.html
├── src/
│   ├── App.tsx              # coque, onglets, session live
│   ├── store.tsx            # état persistant, auth locale, SM-2, badges
│   ├── styles.css           # thème clair/sombre, composants, écrans
│   ├── data/seed.json       # données extraites du repository Kotlin
│   ├── components/          # icônes, cartes, feuilles, toasts
│   └── screens/             # Login, Dashboard, Cours, Révision, Certifs, Réseau, Profil
└── public/                  # logo + police Plus Jakarta Sans (issus des ressources Android)
```

`src/data/seed.json` est généré depuis le code Kotlin avec `tools/extract_seed.py`
(les données ne sont donc saisies qu'une seule fois, côté Android) :

```bash
python3 tools/extract_seed.py
```

## Différences assumées avec l'app Android

- Navigation par onglets en React au lieu de `AppTab` + `Scaffold`.
- Pas de Room : l'état est sérialisé dans `localStorage`.
- Les écrans Android non encore alimentés (7 cours sans leçon) affichent explicitement
  « Contenu en préparation » au lieu d'une liste vide.
