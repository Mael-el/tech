# AfricaSkills

Plateforme panafricaine d'apprentissage : cours et leçons, flashcards à répétition espacée (SM-2),
badges et attestations, emplois et incubateur de projets, communautés par domaine.

- **Application Android** : Kotlin 2.2, Jetpack Compose (Material 3), Room, Coroutines/StateFlow, minSdk 24 → `app/`
- **Aperçu web interactif** : React + Vite, mêmes données et mêmes parcours → `web/`
- **Audit technique** du projet Android → [`ANALYSE.md`](ANALYSE.md)

## Fonctionnalités

| Domaine | Détail |
|---|---|
| 14 domaines | Anglais, développement, data/IA, cybersécurité, IA, design, maths, physique, lecture, ingénierie, robotique, entrepreneuriat, langues locales, soft skills |
| Cours & leçons | 14 cours, **25 leçons** avec contenu et quiz (+50 XP par bonne réponse, +25 % de progression) |
| Révision | Flashcards SM-2 (facteur de facilité, intervalles, répétitions) + mode éclair 30 s |
| Certifications | 5 paliers de badges (Bronze → Diamant) selon XP, cours validés et niveau d'anglais, attestations payantes en FCFA |
| Réseau | Offres d'emploi et candidatures, kanban de projets incubés, salons communautaires par domaine |
| Expérience | Thème clair/sombre, profil éditable, session live FATA, fonctionnement hors-ligne |
| Progression | Série de jours, objectif quotidien, précision aux quiz, carte de chaleur d'activité, plan du jour |

## Aperçu web

L'APK ne peut pas être compilé dans l'environnement de prévisualisation de l'agent : pas de JDK ni de
SDK Android, dépôts Maven inaccessibles et wrapper Gradle non versionné. Un aperçu web fidèle des
écrans et des parcours est fourni pour visualiser et tester l'application immédiatement.

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm test         # 23 tests unitaires (SM-2, séries, badges, routage, recherche)
npm run build    # build de production + service worker hors-ligne
```

**Compte de démonstration :** `ismaila@africaskills.org` / `Africa2026`

L'aperçu a été poussé au-delà du simple rendu : routage par URL (`#/cours/:id/:leçon`), palette de
commande `Ctrl+K`, notes de leçon persistées, révision SM-2 avec deep links, recherche insensible aux
accents, export/import JSON de la progression, impression d'attestation A4 et PWA hors-ligne.

Les données proviennent du code Kotlin (`web/src/data/seed.json`, généré par
`tools/extract_seed.py`). Paiements, attestations et session live y sont **simulés**, comme dans
l'app Android. Détails : [`web/README.md`](web/README.md).

## Compiler l'application Android

Prérequis : JDK 17+, Android SDK 36.

```bash
gradle wrapper --gradle-version 9.3.1   # le wrapper n'est pas encore versionné
./gradlew assembleDebug                 # puis app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Ou ouvrir le dossier dans Android Studio, laisser la synchronisation Gradle se terminer, puis lancer
sur un émulateur ou un appareil (API 24+).

Build release : fournir `my-upload-key.jks` (ou `KEYSTORE_PATH`) ainsi que `STORE_PASSWORD` et
`KEY_PASSWORD`. Firebase n'est pas configuré (`google-services.json` absent, toléré par le build).

## Tests

```bash
./gradlew testDebugUnitTest      # Robolectric + Compose (flux auth & badges)
./gradlew connectedAndroidTest   # test instrumenté (appareil requis)
```

## Structure

```
app/        application Android (Kotlin, Compose, Room)
gradle/     catalogue de versions et configuration du wrapper
web/        aperçu web React (mêmes données, mêmes parcours)
tools/      génération de web/src/data/seed.json depuis le code Kotlin
ANALYSE.md  audit : architecture, sécurité, dette technique, plan d'action
```
