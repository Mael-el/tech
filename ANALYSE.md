# AfricaSkills — Analyse du projet Android

**Dépôt :** `Mael-el/tech` · **Commit analysé :** `7b74522` (branche `main`) · **Date :** 15/11/2026
**Branche de travail :** `arena/7effe96d-tech` (synchronisée en fast-forward sur `main`, aucun fichier de code modifié)

---

## 1. Résumé exécutif

**AfricaSkills** est une application **Android native (Kotlin + Jetpack Compose)** qui se présente comme une
« plateforme panafricaine d'apprentissage, certification par badges, attestations vérifiées, flashcards SM-2,
hackathons et opportunités d'emploi ».

C'est aujourd'hui un **prototype / démo hors-ligne complet et cohérent** :

- **20 fichiers Kotlin** applicatifs (~6 540 lignes), **27 composables**, **9 entités Room**, un DAO unique,
  un ViewModel de 456 lignes exposant **26 `StateFlow`** ;
- **aucun backend, aucune API réseau, aucune authentification réelle** : un jeu de données de démonstration
  (14 cours, 5 badges, 4 attestations, 5 offres d'emploi, 4 projets, 8 flashcards, 11 leçons) est injecté
  dans Room au premier lancement ;
- l'IA (Gemini) est **annoncée** dans `metadata.json` et `.env.example` mais **absente du code** ;
- le paiement Mobile Money, le « live » FATA, le chat communautaire et les attestations sont **simulés côté client**.

**Verdict :** base de démo soignée et lisible, mais **non lançable dans cet environnement** (pas de JDK, pas de
SDK Android, pas de wrapper Gradle, accès réseau limité) et **non publiable en l'état** (identifiants en clair,
paiement et certificats non vérifiables, données non migrables).

> Remarque importante : au moment de la création de la branche, le dépôt ne contenait que le `README.md`.
> Le code Android a été poussé ensuite sur `main` (commit `7b74522`, 08:48). J'ai donc **synchronisé la branche
> de travail sur `main`** (fast-forward, 64 fichiers, +7 295 lignes) pour pouvoir analyser le projet.

---

## 2. Ce que fait l'application

### 2.1 Mise à jour du contenu (15/11/2026)

Les 7 cours qui n'avaient aucune leçon (maths, physique, lecture, ingénierie, robotique, langues locales,
soft skills) disposent désormais de **2 leçons chacun**, soit 14 leçons rédigées en français avec contenu
Markdown et une question à choix multiple (+50 XP, explication). Elles sont générées depuis
`web/src/data/extra-lessons.json` par `tools/gen_extra_lessons.py` vers
`app/src/main/java/com/example/data/local/ExtraLessons.kt`, puis injectées au seed Room
(`insertLessons(lessons + extraLessons)`) : **la source de vérité reste le JSON**, le Kotlin est un artefact.

`tools/extract_seed.py` lit les deux fichiers pour produire `web/src/data/seed.json` : **25 leçons,
14 cours couverts, aucun cours sans leçon**. Il reste à faire côté Android : 2 à 3 quiz par leçon,
dates de badge calculées à partir des points, et le remplacement du live/chat factices.

### Navigation

Connexion → `AfricaSkillsApp` avec un `Scaffold` et 5 onglets :
**Accueil · Cours · Révision · Certifs · Réseau**, plus deux écrans plein écran (Profil, Leçon) et
trois dialogues (live FATA, paiement, attestation).

La navigation n'utilise **pas** Navigation Compose : elle repose sur un état du ViewModel
(`AppTab`, `selectedCourse`, `activeLesson`, `isProfileOpen`).

### Inventaire fonctionnel

| Fonction | Implémentation | État |
|---|---|---|
| 14 domaines métier (anglais, dev, data, cyber, IA, design, maths, physique, lecture, ingénierie, robotique, entrepreneuriat, langues locales, soft skills) | `enum class DomainType` + couleurs/labels | Réel (statique) |
| Catalogue de cours | 14 `CourseEntity` en base | Réel (démo) |
| Leçons + quiz (1 question, +50 XP) | `LessonEntity` : 11 leçons d'origine + 14 ajoutées (`ExtraLessons.kt`) | **25 leçons, 14/14 cours couverts** (cf. §2.1) |
| Flashcards SM-2 | `processFlashcardReview()` : ease factor ≥ 1.3, intervalles 1/6/interval×EF, répétitions | **Réel** (algorithme correct) |
| Speed quiz 30 s | Timer `viewModelScope` + score +10 | Réel (local) |
| Badges 5 tiers (Bronze → Diamant) | Seuils points/cours/niveau d'anglais + déblocage auto | Réel, mais **dates codées en dur** (« 15 Août 2026 », « 19 Septembre 2026 », « 2026 ») |
| Attestations payantes (1 000 – 15 000 FCFA) | `AttestationEntity`, URL `https://africaskills.org/verify/...` | **Fictif** : numéro/URL/client-side |
| Paiement Mobile Money (MTN / Moov / FedaPay) | `confirmPayment()` : `delay(1200)` puis marquage local `isPaid = true` | **Simulé** |
| Emplois (5) + candidature | `applyToJob()` : flag local | Simulé |
| Projets / kanban (4) | Changement de statut en base | Réel (local) |
| Chat communautaire par domaine | Messages persistés dans Room | Local, **pas de temps réel** |
| « FATA live » (classe virtuelle) | Dialogue : 142 spectateurs, messages pré-remplis, main levée | **Simulé** |
| Profil, thème clair/sombre, déconnexion | `AppPreferences` (SharedPreferences) | Réel |
| Authentification | `validateCredentials()` sur prefs locales | **Fictive** (compte démo en dur) |
| IA / Gemini | — | **Absent** |

**Compte de démonstration codé en dur :** `ismaila@africaskills.org` / `Africa2026`.

---

## 3. Architecture technique

```
MainActivity (ComponentActivity, edge-to-edge)
└── AfricaSkillsViewModel  ← factory manuelle (pas de Hilt/Koin)
    ├── AfricaSkillsRepository (931 lignes : seed + logique métier)
    │   └── AfricaSkillsDao (Room, 1 interface, 9 entités)
    └── AppPreferences (SharedPreferences : login, thème, mot de passe)
        └── AfricaSkillsApp (Compose) → 8 écrans + 1 bibliothèque de composants
```

### Organisation des fichiers

| Chemin | Rôle | Taille |
|---|---|---|
| `app/src/main/java/com/example/MainActivity.kt` | Point d'entrée, injection manuelle, thème | 60 l. |
| `data/model/Models.kt` | `DomainType` (14), `BadgeTier` (5) | 45 l. |
| `data/local/Entities.kt` | 9 entités Room | 142 l. |
| `data/local/AfricaSkillsDao.kt` | DAO (requêtes + updates) | 114 l. |
| `data/local/AfricaSkillsDatabase.kt` | Room v3, singleton, migration destructive | 42 l. |
| `data/local/AppPreferences.kt` | Auth locale + thème | 84 l. |
| `data/repository/AfricaSkillsRepository.kt` | Seed de démo + règles métier (XP, badges, SM-2, paiement) | **931 l. / 42 Ko** |
| `ui/viewmodel/AfricaSkillsViewModel.kt` | État global (26 `StateFlow`, 40+ actions) | **456 l.** |
| `ui/AfricaSkillsApp.kt` | Assemblage Scaffold / navigation par état | 239 l. |
| `ui/components/AppComponents.kt` | Bibliothèque UI (top bar, bottom bar, cartes, dialogues) | **1 058 l.** |
| `ui/screens/*.kt` | 9 écrans (Dashboard 648, Domaines 409, Flashcards 397, Login 335…) | ~2 950 l. |
| `ui/theme/*` | Couleurs, typographie (Plus Jakarta Sans), thème | 219 l. |
| `app/src/test`, `app/src/androidTest` | 4 tests unitaires/Robolectric + 1 test instrumenté | 256 l. |

**Total : ~6 800 lignes Kotlin, 63 fichiers versionnés.**

### Stack et configuration

| Élément | Valeur | Commentaire |
|---|---|---|
| Kotlin | 2.2.10 | Plugin Compose inclus |
| AGP | 9.1.1 | Très récent |
| compileSdk / targetSdk | 36 (minor 1) | API 36 |
| minSdk | 24 | Android 7.0+ |
| Compose BOM | **2024.09.00** | En retard de ~2 ans vs Kotlin/AGP |
| Room | 2.7.0 | KSP 2.3.5 |
| Firebase BOM | 34.17.0 | `firebase-ai` + AppCheck **inutilisés** |
| Tests | Robolectric 4.16.1, Roborazzi 1.59.0, Compose UI test | 1 scénario réel |
| Signature release | `my-upload-key.jks` + `KEYSTORE_PATH` / `STORE_PASSWORD` / `KEY_PASSWORD` | Keystore absent (gitignored) |
| Divers | secrets-gradle-plugin, google-services (mode `WARN` / passthrough) | `google-services.json` absent |

### Données

- Base `africaskills_db`, **version 3**, `fallbackToDestructiveMigration()`, `exportSchema = false`.
- Seed unique déclenché dans `init { }` du ViewModel (`ensureInitialDataSeeded()`), donc **asynchrone** :
  l'UI peut afficher des listes vides au tout premier rendu.
- 9 entités : profil, cours, leçons, flashcards, badges, attestations, emplois, projets, messages.
- Aucune migration, aucun chiffrement de base, aucun export.

### Tests

- `AfricaSkillsAuthAndBadgeTest` (175 l.) : Robolectric + Compose, Room en mémoire, login/inscription/badge.
- `ExampleUnitTest` / `ExampleRobolectricTest` / `GreetingScreenshotTest` : tests template AI Studio.
- Aucun test du Repository, du SM-2, du paiement, des écrans autres que l'auth.

---

## 4. Lancement : pourquoi « lance » ne peut pas aboutir ici

### Constats bloquants dans cet environnement

| Blocage | Détail |
|---|---|
| Pas de JDK | `java` introuvable, `/usr/lib/jvm` absent |
| Pas de SDK Android | `ANDROID_HOME` vide, ni `adb`, ni émulateur |
| Pas de wrapper Gradle | `gradlew`, `gradlew.bat` et `gradle-wrapper.jar` **absents** (seul `gradle-wrapper.properties` est versionné) |
| Réseau Gradle bloqué | `dl.google.com`, `services.gradle.org`, `repo.maven.apache.org` → HTTP 000 (accès sortant limité à GitHub/npm/PyPI) |
| Aperçu navigateur inutile | Une app Compose native ne peut pas être rendue dans le navigateur |

Un APK ne peut donc **pas** être compilé ni exécuté depuis cette session. Ce n'est pas un défaut du code :
c'est une limite de l'environnement (pas de chaîne Android, pas de dépôt Maven accessible).

### Comment le lancer réellement

**Option A — Android Studio (recommandé)**
1. Installer Android Studio (JDK 17+ et SDK 36 inclus).
2. `File > Open` → le dossier du dépôt, laisser la synchronisation Gradle télécharger AGP/Compose/Room.
3. Lancer sur un émulateur ou un téléphone (API 24+).
4. Se connecter avec `ismaila@africaskills.org` / `Africa2026` (ou créer un compte, purement local).

**Option B — ligne de commande**
```bash
gradle wrapper --gradle-version 9.3.1     # régénère gradlew + gradle-wrapper.jar (absents du dépôt)
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Option C — CI GitHub Actions** (aucune CI n'existe aujourd'hui)
Un workflow `assembleDebug` + tests Robolectric produirait un APK téléchargeable en artefact, sans SDK local.
C'est la seule voie pour obtenir un APK depuis cet environnement (le runner GitHub a le SDK et le réseau Maven).

### Pré-requis pour un build release

- Fournir `my-upload-key.jks` (ou `KEYSTORE_PATH`), `STORE_PASSWORD`, `KEY_PASSWORD`.
- Ajouter `google-services.json` **si** Firebase est réellement utilisé (sinon retirer les dépendances).
- `isMinifyEnabled = false` et `isCrunchPngs = false` en release : à revoir avant publication.

---

## 5. Points forts

1. **Cohérence de bout en bout** : un produit identifiable, un vocabulaire métier constant (domaines, tiers,
   XP, FCFA), un contenu contextualisé Afrique de l'Ouest (Cotonou, Dakar, MTN/Moov, FedaPay).
2. **Offline-first réel** : Room + `Flow`, seed local, aucune dépendance réseau → l'app fonctionne sans backend.
3. **SM-2 correctement implémenté** (ease factor borné à 1.3, intervalles, répétitions, `nextReviewEpochMs`).
4. **UI Compose soignée** : thème clair/sombre, typographie dédiée, bibliothèque de composants réutilisables,
   `Snackbar`, `StateFlow` collectés avec `collectAsStateWithLifecycle`.
5. **Séparation en couches** claire malgré la taille (model / local / repository / viewmodel / ui).
6. **Outillage présent** : version catalog, KSP, Robolectric, Roborazzi (screenshots), R8 rules, secrets plugin.
7. **Un test d'intégration pertinent** (auth + badge) qui prouve que la chaîne Room → VM → UI fonctionne.

---

## 6. Risques et dette technique

### 🔴 P0 — bloquants avant toute diffusion

1. **Mots de passe en clair + identifiants publics**
   `AppPreferences` stocke `user_password` en clair dans les `SharedPreferences`, avec un compte démo
   documenté en constantes (`DEFAULT_DEMO_EMAIL` / `DEFAULT_DEMO_PASSWORD`) et une validation 100 % locale.
2. **Sauvegarde des secrets** : `android:allowBackup="true"` avec `backup_rules.xml` vide → les préférences
   (donc le mot de passe) sont éligibles à la sauvegarde cloud/ADB.
3. **Attestations non probantes** : numéro, URL de vérification et signataire sont générés côté client ;
   aucune vérification serveur possible. Une attestation « vérifiée » n'a aucune valeur juridique.
4. **Paiement fictif** : `confirmPayment()` attend 1,2 s puis marque l'attestation payée localement.
   Ne jamais brancher ce flux tel quel sur un vrai opérateur (MTN/Moov/FedaPay) sans webhook + vérification serveur.
5. **Aucun contrôle d'accès** : tout est local, l'utilisateur peut modifier la base (Room) ou les prefs
   (root/backup) pour s'octroyer badges, XP et attestations.
6. **Identité de l'app non figée** : `namespace = "com.example"`, `applicationId = "com.aistudio.africaskills.app"`.
   À figer avant publication (irréversible sur le Play Store).

### 🟠 P1 — architecture et données

7. **`fallbackToDestructiveMigration()` + `exportSchema = false`** : toute évolution de schéma efface les
   données locales (progression, flashcards SM-2, messages) et aucune migration ne peut être testée.
8. **Contenu incomplet** : ~~7 des 14 cours n'ont aucune leçon~~ → **corrigé** (14 leçons générées, cf. §2.1) ;
   il reste 1 seul quiz par leçon, des dates de badges codées en dur, un « live » et un « chat » factices,
   et 5 offres d'emploi seulement.
9. **Monolithes** : ViewModel 456 lignes / 26 `StateFlow` / 40+ méthodes ; Repository 931 lignes mêlant
   seed de démo et règles métier ; `AppComponents.kt` 1 058 lignes.
10. **Pas de DI ni de Navigation Compose** : factory manuelle, navigation par état → back stack, deep links
    et restauration d'état non gérés (perte de l'onglet/écran au processus tué).
11. **Dépendances mortes** : `firebase-ai`, AppCheck, Retrofit, OkHttp, Moshi, Coil, DataStore, Camera,
    Play Services Location (commentées)… Poids inutile et faux signal « IA ».
12. **IA annoncée mais absente** : `metadata.json` déclare `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`,
    `.env.example` documente `GEMINI_API_KEY`, mais **aucun appel Gemini** n'existe. `firebase-ai` est
    compilé **sans** `google-services.json` (toléré par `missing.passthrough=true`, mais toute init Firebase
    plantera à l'exécution).
13. **Gestion d'erreur / reprise** : pas de `try/catch` sur les opérations Room, pas de retry, pas d'états
    de chargement (les listes démarrent vides), seed asynchrone non attendu avant affichage.

### 🟡 P2 — qualité, UX, industrialisation

14. **Aucune internationalisation** : ~132 chaînes françaises en dur dans l'UI, alors que la cible est
    panafricaine (anglais, yoruba, fon, wolof, swahili… sont des domaines de l'app elle-même).
15. **Accessibilité partielle** : `contentDescription` surtout sur les icônes ; pas d'audit TalkBack,
    pas de tailles de police dynamiques, contrastes non vérifiés.
16. **Ressources lourdes** : `ic_africaskills_logo.jpg` = 468 Ko dans `drawable/`, `isCrunchPngs = false`,
    `isMinifyEnabled = false`.
17. **Tests insuffisants** : 1 scénario métier réel, aucun test du SM-2, des badges, du paiement, de la
    persistance ; tests template AI Studio encore présents.
18. **Pas de CI/CD, pas de LICENSE, pas de captures, README = bannière AI Studio** ; aucun `lint` configuré.
19. **Compatibilité de versions à vérifier** : Compose BOM 2024.09.00 avec Kotlin 2.2.10/AGP 9.1.1 et
    Room 2.7.0/KSP 2.3.5 — combinaison inhabituelle, build réel non testé ici.

---

## 7. Plan recommandé

### Étape 1 — Sécuriser la démo (P0, ~1 j)
- Sortir les identifiants démo des constantes ; les déplacer dans `BuildConfig` (debug uniquement).
- Remplacer SharedPreferences par `EncryptedSharedPreferences`/DataStore + Keystore, ou ne jamais stocker
  le mot de passe (jeter après validation).
- Exclure `africaskills_prefs` du backup (`data_extraction_rules.xml` + `backup_rules.xml`).
- Afficher un bandeau « démonstration — paiement et attestations simulés » dans les écrans concernés.
- Figer `namespace`/`applicationId`.

### Étape 2 — Rendre le projet lançable et vérifiable (P1, ~1 j)
- Régénérer le wrapper Gradle (`gradle wrapper`) et le versionner.
- Ajouter GitHub Actions : `./gradlew testDebugUnitTest assembleDebug` + upload de l'APK en artefact.
- Corriger/aligner les versions (Compose BOM récente, vérifier AGP 9 + Room).
- Ajouter un premier `assembleDebug` documenté dans le README.

### Étape 3 — Consolidation (P1, ~1 semaine)
- Room : `exportSchema = true`, migrations réelles, tests de migration.
- Découper le Repository (seed → `assets/seed.json`, métier → services), le ViewModel (1 par écran),
  ajouter Hilt + Navigation Compose.
- Compléter le contenu (leçons pour les 14 cours) et remplacer les données factices par des écrans « bientôt
  disponible » explicites.
- Retirer les dépendances mortes **ou** implémenter Gemini proprement (clé côté serveur, jamais dans l'APK).

### Étape 4 — Industrialisation (P2)
- i18n FR/EN + langues locales, accessibilité, captures d'écran.
- R8 + baseline profile, compression des ressources, réduction de l'APK.
- Couverture de tests Repository/VM, CI complète (lint + tests + release signée).

---

## 8. Annexes

### Commandes utiles
```bash
# tests unitaires (nécessite JDK + SDK + réseau Maven)
./gradlew testDebugUnitTest

# APK debug
./gradlew assembleDebug

# vérification statique rapide (déjà effectuée)
grep -rn "password\|Africa2026" app/src/main
grep -rn "firebase\|gemini" app/src/main --include=*.kt   # → aucun résultat
```

### Ce qui a été modifié dans cette session
- **Aucune ligne de code applicatif.**
- Branche `arena/7effe96d-tech` avancée en fast-forward sur `main` (`561c416` → `7b74522`) afin d'avoir
  le code Android dans l'espace de travail.
- Ajout de ce rapport : `ANALYSE.md`.

### Prochaine action possible
1. Ajouter un workflow CI qui **construit l'APK** (seule façon d'obtenir un binaire ici), ou
2. Attaquer les correctifs **P0** (secrets, backup, mentions « démo »), ou
3. Préparer une **version web/mobile testable** (aperçu navigateur) si l'objectif est de montrer l'app vite.
