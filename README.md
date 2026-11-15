# AfricaSkills

Plateforme panafricaine d'apprentissage : cours et leçons, flashcards à répétition espacée (SM-2),
badges et certificats vérifiables, suivi de candidatures et de projets personnels.

- **Application Android** : Kotlin 2.2, Jetpack Compose (Material 3), Room, Coroutines/StateFlow, minSdk 24 → `app/`
- **Port web fonctionnel** : React + Vite, mêmes données et parcours concrets, responsive 360→1600 px, design « aurora » animé → `web/`
- **Audit technique** du projet Android → [`ANALYSE.md`](ANALYSE.md)

## Fonctionnalités

| Domaine | Détail |
|---|---|
| 14 domaines | Anglais, développement, data/IA, cybersécurité, IA, design, maths, physique, lecture, ingénierie, robotique, entrepreneuriat, langues locales, soft skills |
| Cours & leçons | 14 cours, **25 leçons** avec contenu et quiz (+50 XP par bonne réponse, +25 % de progression) |
| Révision | Flashcards SM-2 (facteur de facilité, intervalles, répétitions) + mode éclair 30 s |
| Certifications | 5 paliers de badges (Bronze → Diamant) selon XP, cours validés et niveau d'anglais ; certificats de cours gratuits, vérifiables par code |
| Réseau | Suivi réel de candidatures (5 statuts, lien d'offre), projets personnels (idée → en cours → terminé), job boards africains |
| Expérience | Thème clair/sombre, profil éditable, session de concentration 5/15/25 min, fonctionnement hors-ligne |
| Progression | Série de jours, objectif quotidien, précision aux quiz, carte de chaleur d'activité, plan du jour |
| Vrai & vérifié | 15 chiffres réels sourcés (UIT, GSMA, Banque mondiale, Google…), 8 ressources gratuites, sources cliquables |
| Salle d'arcade | Défi éclair, Vrai ou faux, Mémoire tech : XP, combos, records, confettis, 7 succès |

## Port web

L'APK ne peut pas être compilé dans l'environnement de prévisualisation de l'agent : pas de JDK ni de
SDK Android, dépôts Maven inaccessibles et wrapper Gradle non versionné. Le port web reprend le
catalogue et les règles de l'app, et ajoute des parcours réels et persistés.

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm test         # 56 tests unitaires (SM-2, séries, badges, routage, recherche, certificats, chiffres, arcade)
npm run build    # build de production + service worker hors-ligne
```

Aucun compte de démonstration : vous créez le vôtre (nom, e-mail, ville, niveau d'anglais, mot de
passe local). Chaque confirmation correspond à un état réellement enregistré — aucune simulation.

Ce qui dépasse le simple rendu : routage par URL (`#/cours/:id/:leçon`, `#/verifier/<code>`), palette
`Ctrl+K`, notes de leçon, révision SM-2, **certificats gratuits vérifiables hors-ligne**, **suivi de
candidatures et de projets**, **sessions de concentration**, export/import JSON, impression A4 et PWA
hors-ligne. L'interface est responsive de 360 px à 1600 px (listes en 2 colonnes sur ordinateur) et
animée : aurores en parallaxe, révélation au défilement, compteurs, confettis, inclinaison du hero,
reflets et transitions de route — avec respect de `prefers-reduced-motion`.

Le catalogue provient du code Kotlin (`web/src/data/seed.json`, généré par
`tools/extract_seed.py`). Les chiffres de « Vrai & vérifié » sont réels et sourcés ; les offres
d'emploi ne sont pas inventées, l'app renvoie vers les job boards africains. Détails :
[`web/README.md`](web/README.md).

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
