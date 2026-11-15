package com.example.data.repository

import com.example.data.local.*
import com.example.data.model.BadgeTier
import com.example.data.model.DomainType
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlin.math.ceil
import kotlin.math.roundToInt

class AfricaSkillsRepository(private val dao: AfricaSkillsDao) {

  val userProfile: Flow<UserProfileEntity?> = dao.getUserProfile()
  val allCourses: Flow<List<CourseEntity>> = dao.getAllCourses()
  val allFlashcards: Flow<List<FlashcardEntity>> = dao.getAllFlashcards()
  val allBadges: Flow<List<BadgeEntity>> = dao.getAllBadges()
  val allAttestations: Flow<List<AttestationEntity>> = dao.getAllAttestations()
  val allJobs: Flow<List<JobEntity>> = dao.getAllJobs()
  val allProjects: Flow<List<ProjectEntity>> = dao.getAllProjects()

  fun getLessonsForCourse(courseId: String): Flow<List<LessonEntity>> = dao.getLessonsForCourse(courseId)
  fun getMessagesForDomain(domainId: String): Flow<List<CommunityMessageEntity>> = dao.getMessagesForDomain(domainId)
  fun getFlashcardsByDomain(domainId: String): Flow<List<FlashcardEntity>> = dao.getFlashcardsByDomain(domainId)

  suspend fun ensureInitialDataSeeded() {
    val existingProfile = dao.getUserProfile().firstOrNull()
    if (existingProfile == null) {
      seedInitialData()
    }
  }

  suspend fun updateProfileIdentity(fullName: String, email: String, location: String) {
    ensureInitialDataSeeded()
    dao.updateProfileIdentity(fullName, email, location)
  }

  suspend fun completeLesson(lessonId: String, courseId: String, earnedPoints: Int = 50) {
    dao.markLessonCompleted(lessonId)
    dao.addPoints(earnedPoints)

    val course = dao.getCourseById(courseId)
    if (course != null) {
      val newProgress = minOf(100, course.progressPercent + 25)
      dao.updateCourseProgress(courseId, newProgress, isCompleted = (newProgress >= 100))
    }

    checkAndUnlockBadges()
  }

  suspend fun processFlashcardReview(card: FlashcardEntity, qualityRating: Int) {
    val q = qualityRating.coerceIn(0, 5)
    val oldEf = card.easeFactor
    val newEf = maxOf(1.3, oldEf + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))

    val (newReps, newInterval) = if (q < 3) {
      Pair(0, 1)
    } else {
      val nextReps = card.repetitions + 1
      val nextInterval = when (nextReps) {
        1 -> 1
        2 -> 6
        else -> ceil(card.intervalDays * newEf).toInt().coerceAtLeast(1)
      }
      Pair(nextReps, nextInterval)
    }

    val now = System.currentTimeMillis()
    val nextReview = now + (newInterval.toLong() * 86_400_000L)

    val updatedCard = card.copy(
      easeFactor = (newEf * 100.0).roundToInt() / 100.0,
      intervalDays = newInterval,
      repetitions = newReps,
      nextReviewEpochMs = nextReview,
      lastReviewedEpochMs = now
    )

    dao.updateFlashcard(updatedCard)
    dao.addPoints(15)
    checkAndUnlockBadges()
  }

  suspend fun enrollCourse(courseId: String) {
    dao.enrollInCourse(courseId)
  }

  suspend fun payAttestation(attestationId: String, paymentMethod: String) {
    dao.markAttestationPaid(attestationId, paymentMethod)
    dao.addPoints(100)
  }

  suspend fun applyToJob(jobId: String) {
    dao.applyToJob(jobId)
  }

  suspend fun updateProjectStatus(projectId: String, newStatus: String) {
    dao.updateProjectStatus(projectId, newStatus)
  }

  suspend fun createProject(project: ProjectEntity) {
    dao.insertProject(project)
    dao.addPoints(200)
  }

  suspend fun sendCommunityMessage(domainId: String, text: String, senderName: String) {
    val newMessage = CommunityMessageEntity(
      id = "msg_${System.currentTimeMillis()}",
      domainId = domainId,
      senderName = senderName,
      senderRole = "Apprenant",
      messageText = text,
      timestampText = "À l'instant",
      isUser = true,
      reactionsCount = 0
    )
    dao.insertMessage(newMessage)
  }

  private suspend fun checkAndUnlockBadges() {
    val profile = dao.getUserProfile().firstOrNull() ?: return
    val points = profile.points

    if (points >= 500) {
      dao.unlockBadge("b_bronze", "15 Août 2026")
    }
    if (points >= 1500) {
      dao.unlockBadge("b_argent", "19 Septembre 2026")
    }
    if (points >= 4000) {
      dao.unlockBadge("b_or", "2026")
    }
  }

  private suspend fun seedInitialData() {
    dao.insertOrUpdateProfile(
      UserProfileEntity(
        id = 1,
        fullName = "Ismaila Gohoundje",
        email = "ismaila@africaskills.org",
        phone = "+229 97 00 00 14",
        bio = "Ingénieur logiciel orienté systèmes hors-ligne, architectures mobiles résilientes et entrepreneuriat numérique en Afrique de l'Ouest.",
        role = "Bâtisseur Tech & Innovateur",
        location = "Cotonou, Bénin",
        points = 1850,
        streakDays = 14,
        currentBadgeLevel = "ARGENT",
        englishLevel = "B1 (Objectif B2 en cours)",
        completedCoursesCount = 9,
        publishedProjectsCount = 2,
        wonChallengesCount = 1,
        isVerified = true
      )
    )

    val courses = listOf(
      CourseEntity(
        id = "c_dev_01",
        domainId = DomainType.DEVELOPPEMENT.id,
        title = "Architecture Mobile Kotlin & Jetpack Compose",
        description = "Concevez des applications Android réactives, résilientes aux coupures réseau (offline-first) avec Room, StateFlow, Coroutines et intégration Mobile Money.",
        instructorName = "Amina Diallo (Dakar)",
        level = "Intermédiaire",
        durationHours = 24,
        progressPercent = 75,
        isEnrolled = true,
        isCompleted = false,
        modulesCount = 6,
        rating = 4.9,
        nextSessionFata = "Demain à 18h00 GMT"
      ),
      CourseEntity(
        id = "c_eng_01",
        domainId = DomainType.ANGLAIS.id,
        title = "Anglais Intensif des Affaires & Tech Pitch",
        description = "Maîtrisez l'anglais professionnel en 3 mois : revues d'architecture en anglais, négociation salariale, rédaction de RFC et pitch devant des fonds internationaux.",
        instructorName = "David Osei (Accra)",
        level = "B1 vers B2",
        durationHours = 36,
        progressPercent = 90,
        isEnrolled = true,
        isCompleted = false,
        modulesCount = 12,
        rating = 4.8,
        nextSessionFata = "Ce soir à 20h00 GMT"
      ),
      CourseEntity(
        id = "c_data_01",
        domainId = DomainType.DATA.id,
        title = "Data Engineering & Pipelines SQL / Python",
        description = "Modélisation analytique, requêtes SQL avancées (fenêtres, CTE), ETL automatisé et tableaux de bord décisionnels pour la FinTech et l'AgriTech.",
        instructorName = "Fatou Ndiaye (Dakar)",
        level = "Avancé",
        durationHours = 30,
        progressPercent = 40,
        isEnrolled = true,
        isCompleted = false,
        modulesCount = 8,
        rating = 4.7,
        nextSessionFata = "Jeudi à 19h00 GMT"
      ),
      CourseEntity(
        id = "c_cyber_01",
        domainId = DomainType.CYBERSECURITE.id,
        title = "Sécurité Défensive & Audit Mobile Money",
        description = "Protection contre le SIM Swapping, sécurisation des APIs REST (OAuth2, HMAC, mTLS), chiffrement AES-GCM et référentiel OWASP Mobile Top 10.",
        instructorName = "Emmanuel Kouassi (Abidjan)",
        level = "Intermédiaire",
        durationHours = 28,
        progressPercent = 100,
        isEnrolled = true,
        isCompleted = true,
        modulesCount = 7,
        rating = 5.0,
        nextSessionFata = null
      ),
      CourseEntity(
        id = "c_ia_01",
        domainId = DomainType.IA.id,
        title = "LLMs, RAG & Agents IA Appliqués",
        description = "Conception de systèmes RAG fiables, évaluation de prompts, réduction des hallucinations et déploiement de modèles quantifiés pour les PME africaines.",
        instructorName = "Dr. Koffi Mensah (Cotonou)",
        level = "Avancé",
        durationHours = 32,
        progressPercent = 25,
        isEnrolled = true,
        isCompleted = false,
        modulesCount = 9,
        rating = 4.9,
        nextSessionFata = "Vendredi à 17h30 GMT"
      ),
      CourseEntity(
        id = "c_des_01",
        domainId = DomainType.DESIGN.id,
        title = "Design Produit, Accessibilité & Systèmes UI",
        description = "Ergonomie mobile, contrastes WCAG AA, hiérarchie typographique, prototypage rapide sous Figma et tests utilisateurs terrain.",
        instructorName = "Nadia Benali (Casablanca)",
        level = "Intermédiaire",
        durationHours = 22,
        progressPercent = 0,
        isEnrolled = false,
        isCompleted = false,
        modulesCount = 6,
        rating = 4.8,
        nextSessionFata = "Mercredi à 18h30 GMT"
      ),
      CourseEntity(
        id = "c_math_01",
        domainId = DomainType.MATHS.id,
        title = "Probabilités, Statistiques & Algèbre pour l'IA",
        description = "Calcul matriciel, valeurs propres, théorème de Bayes, intervalles de confiance et optimisation par descente de gradient.",
        instructorName = "Prof. Jean-Luc Tchamda (Yaoundé)",
        level = "Intermédiaire",
        durationHours = 26,
        progressPercent = 0,
        isEnrolled = false,
        isCompleted = false,
        modulesCount = 7,
        rating = 4.9,
        nextSessionFata = null
      ),
      CourseEntity(
        id = "c_phy_01",
        domainId = DomainType.PHYSIQUE.id,
        title = "Énergie Solaire, Stockage & Micro-Réseaux",
        description = "Dimensionnement photovoltaïque, rendement des onduleurs, gestion thermique des batteries LFP et équilibrage de charge rurale.",
        instructorName = "Ing. Idrissa Ouédraogo (Ouagadougou)",
        level = "Débutant",
        durationHours = 20,
        progressPercent = 0,
        isEnrolled = false,
        isCompleted = false,
        modulesCount = 5,
        rating = 4.7,
        nextSessionFata = null
      ),
      CourseEntity(
        id = "c_lec_01",
        domainId = DomainType.LECTURE.id,
        title = "Esprit Critique, Synthèse & Rédaction Stratégique",
        description = "Analyse d'articles scientifiques, détection des biais cognitifs, rédaction de mémos exécutifs et argumentation structurée.",
        instructorName = "Aminata Kane (Dakar)",
        level = "Tous niveaux",
        durationHours = 16,
        progressPercent = 0,
        isEnrolled = false,
        isCompleted = false,
        modulesCount = 4,
        rating = 4.8,
        nextSessionFata = null
      ),
      CourseEntity(
        id = "c_ing_01",
        domainId = DomainType.INGENIERIE.id,
        title = "Systèmes Embarqués, LoRaWAN & Télémétrie IoT",
        description = "Protocoles MQTT, communication longue portée basse consommation LoRa, gestion de l'alimentation et mise à jour firmware OTA.",
        instructorName = "Chukwuemeka Obi (Lagos)",
        level = "Intermédiaire",
        durationHours = 28,
        progressPercent = 0,
        isEnrolled = false,
        isCompleted = false,
        modulesCount = 6,
        rating = 4.8,
        nextSessionFata = "Samedi à 16h00 GMT"
      ),
      CourseEntity(
        id = "c_rob_01",
        domainId = DomainType.ROBOTIQUE.id,
        title = "Robotique Agricole & Automatisation Low-Cost",
        description = "Capteurs d'humidité et capteurs optiques, contrôle PID sur microcontrôleurs ESP32, actionneurs et irrigation autonome.",
        instructorName = "Chukwuemeka Obi (Lagos)",
        level = "Intermédiaire",
        durationHours = 26,
        progressPercent = 0,
        isEnrolled = false,
        isCompleted = false,
        modulesCount = 6,
        rating = 4.8,
        nextSessionFata = "Samedi à 15h00 GMT"
      ),
      CourseEntity(
        id = "c_ent_01",
        domainId = DomainType.ENTREPRENEURIAT.id,
        title = "De l'Idée au Pitch Startup : Structuration OHADA & VC",
        description = "Validation marché, unit economics (CAC, LTV, Payback), création juridique en zone OHADA et préparation du dossier de pré-amorçage.",
        instructorName = "Mariam Traoré (Bamako)",
        level = "Tous niveaux",
        durationHours = 18,
        progressPercent = 100,
        isEnrolled = true,
        isCompleted = true,
        modulesCount = 5,
        rating = 4.9,
        nextSessionFata = null
      ),
      CourseEntity(
        id = "c_lang_01",
        domainId = DomainType.LANGUES_LOCALES.id,
        title = "Traitement Automatique du Fon, Yoruba, Wolof & Swahili",
        description = "Annotation phonétique, gestion des tons diacritiques Unicode, constitution de corpus vocaux et synthèse vocale inclusive.",
        instructorName = "Dr. Saliou Diop (Dakar)",
        level = "Débutant",
        durationHours = 20,
        progressPercent = 0,
        isEnrolled = false,
        isCompleted = false,
        modulesCount = 5,
        rating = 4.9,
        nextSessionFata = "Lundi à 18h00 GMT"
      ),
      CourseEntity(
        id = "c_soft_01",
        domainId = DomainType.COMPETENCES_TRANSVERSALES.id,
        title = "Leadership Technique, Négociation & Gestion de Produit",
        description = "Conduite de réunions asynchrones, priorisation RICE, gestion des conflits en équipe distribuée et prise de parole en public.",
        instructorName = "Claire Akossiwa (Lomé)",
        level = "Tous niveaux",
        durationHours = 14,
        progressPercent = 0,
        isEnrolled = false,
        isCompleted = false,
        modulesCount = 4,
        rating = 4.8,
        nextSessionFata = null
      )
    )
    dao.insertCourses(courses)

    val lessons = listOf(
      LessonEntity(
        id = "les_dev_01",
        courseId = "c_dev_01",
        title = "1. Architecture Réactive & Unidirectional Data Flow",
        durationMinutes = 25,
        orderIndex = 1,
        contentMarkdown = "Dans Jetpack Compose, l'interface est une fonction pure de l'état exposé par le ViewModel via StateFlow. Ce flux unidirectionnel (UDF) élimine les désynchronisations visuelles : les événements remontent de l'UI vers le ViewModel, tandis que l'état immuable redescend vers les Composables.",
        isCompleted = true,
        quizQuestion = "Quel opérateur Compose permet de collecter un StateFlow en respectant le cycle de vie Android ?",
        quizOptionsSerialized = "collectAsStateWithLifecycle()|observeAsState()|remember()|collectAsList()",
        quizCorrectIndex = 0,
        quizExplanation = "collectAsStateWithLifecycle() suspend automatiquement la collecte lorsque l'activité passe en arrière-plan, préservant batterie et mémoire."
      ),
      LessonEntity(
        id = "les_dev_02",
        courseId = "c_dev_01",
        title = "2. Persistance Hors-Ligne avec Room & KSP",
        durationMinutes = 35,
        orderIndex = 2,
        contentMarkdown = "En zone à connectivité intermittente, la base locale Room constitue la source de vérité unique. L'UI lit exclusivement depuis Room via Flow, tandis qu'une couche Repository synchronise les modifications en arrière-plan dès le retour du réseau.",
        isCompleted = true,
        quizQuestion = "Pourquoi renvoyer Flow<List<T>> depuis une requête DAO Room ?",
        quizOptionsSerialized = "Pour mettre à jour l'UI automatiquement à chaque écriture en base|Pour bloquer le thread principal|Pour désactiver le cache disque|Pour contourner la sérialisation JSON",
        quizCorrectIndex = 0,
        quizExplanation = "Room observe la table SQLite et réémet automatiquement la nouvelle liste dans le Flow dès qu'une transaction modifie les données."
      ),
      LessonEntity(
        id = "les_dev_03",
        courseId = "c_dev_01",
        title = "3. Intégration Idempotente Mobile Money (FedaPay / KkiaPay)",
        durationMinutes = 40,
        orderIndex = 3,
        contentMarkdown = "Lors d'un paiement Mobile Money sur réseau 3G instable, le client peut renvoyer la même requête après un timeout. Chaque initiation de transaction doit inclure une clé d'idempotence UUID côté serveur afin d'éviter tout double débit, et la confirmation finale doit toujours reposer sur un webhook signé HMAC-SHA256.",
        isCompleted = false,
        quizQuestion = "Quelle mesure garantit l'authenticité d'un webhook reçu depuis une passerelle de paiement ?",
        quizOptionsSerialized = "Vérifier la signature cryptographique HMAC avant de créditer l'utilisateur|Faire confiance à l'adresse IP du client mobile|Accepter la confirmation depuis les paramètres URL|Désactiver TLS sur l'endpoint",
        quizCorrectIndex = 0,
        quizExplanation = "La vérification de signature HMAC-SHA256 prouve que la notification provient réellement de l'agrégateur de paiement et n'a pas été falsifiée."
      ),

      LessonEntity(
        id = "les_eng_01",
        courseId = "c_eng_01",
        title = "1. Structurer un Pitch Produit en 90 Secondes",
        durationMinutes = 30,
        orderIndex = 1,
        contentMarkdown = "Un pitch clair devant des recruteurs ou investisseurs anglophones suit quatre étapes : Problem (quel blocage concret), Solution (votre produit en une phrase), Traction (chiffres réels d'usage ou de revenus) et Ask (ce que vous recherchez). Privilégiez les verbes d'action précis plutôt que les adjectifs vagues.",
        isCompleted = true,
        quizQuestion = "Quelle formulation anglaise exprime le mieux un gain mesurable en entretien technique ?",
        quizOptionsSerialized = "Reduced offline sync latency by 45% using Room indexing|I worked very hard on the database|The app became somehow better|We tried to fix some issues",
        quizCorrectIndex = 0,
        quizExplanation = "Les recruteurs internationaux attendent un résultat chiffré ('by 45%') relié à une action technique concrète ('Room indexing')."
      ),
      LessonEntity(
        id = "les_eng_02",
        courseId = "c_eng_01",
        title = "2. Vocabulaire des Revues d'Architecture & RFC",
        durationMinutes = 35,
        orderIndex = 2,
        contentMarkdown = "En équipe distribuée, savoir argumenter un compromis technique (trade-off) est indispensable : 'latency vs consistency', 'single point of failure', 'backward compatibility', 'graceful degradation'. Utilisez 'I recommend X because...' suivi des risques identifiés.",
        isCompleted = false,
        quizQuestion = "Que signifie 'graceful degradation' dans une architecture logicielle ?",
        quizOptionsSerialized = "Maintenir les fonctions essentielles lorsqu'un service secondaire tombe en panne|Supprimer les logs d'erreur en production|Redémarrer le serveur toutes les heures|Augmenter le prix de l'abonnement",
        quizCorrectIndex = 0,
        quizExplanation = "La dégradation gracieuse permet à l'application de continuer à fonctionner en mode réduit (par exemple hors-ligne) au lieu de planter."
      ),

      LessonEntity(
        id = "les_data_01",
        courseId = "c_data_01",
        title = "1. Fonctions de Fenêtre SQL (ROW_NUMBER, LAG, SUM OVER)",
        durationMinutes = 35,
        orderIndex = 1,
        contentMarkdown = "Contrairement à GROUP BY qui fusionne les lignes, les fonctions de fenêtre (WINDOW FUNCTIONS) calculent des agrégats glissants, des classements par région ou des comparaisons mois sur mois tout en conservant le détail de chaque transaction.",
        isCompleted = true,
        quizQuestion = "Quelle clause SQL définit le découpage logique d'une fonction de fenêtre sans réduire le nombre de lignes ?",
        quizOptionsSerialized = "OVER (PARTITION BY ... ORDER BY ...)|GROUP BY ... HAVING|DISTINCT ON|UNION ALL",
        quizCorrectIndex = 0,
        quizExplanation = "La clause OVER (PARTITION BY ...) applique le calcul par sous-groupe tout en conservant chaque ligne individuelle dans le résultat."
      ),
      LessonEntity(
        id = "les_data_02",
        courseId = "c_data_01",
        title = "2. Qualité des Données & Détection d'Anomalies FinTech",
        durationMinutes = 40,
        orderIndex = 2,
        contentMarkdown = "Un pipeline fiable vérifie quatre dimensions avant ingestion : complétude (taux de valeurs nulles), unicité (détection de doublons d'ID transaction), fraîcheur (délai maximal d'arrivée) et validité de domaine (montants positifs, devises XOF/XAF conformes ISO 4217).",
        isCompleted = false,
        quizQuestion = "Quel code devise ISO 4217 correspond au Franc CFA d'Afrique de l'Ouest (UEMOA) ?",
        quizOptionsSerialized = "XOF|XAF|CFA|EUR",
        quizCorrectIndex = 0,
        quizExplanation = "XOF désigne le Franc CFA BCEAO (Afrique de l'Ouest), tandis que XAF désigne le Franc CFA BEAC (Afrique Centrale)."
      ),

      LessonEntity(
        id = "les_cyber_01",
        courseId = "c_cyber_01",
        title = "1. Prévention du SIM Swapping & Authentification Forte",
        durationMinutes = 30,
        orderIndex = 1,
        contentMarkdown = "Les codes OTP par SMS sont vulnérables au SIM Swapping (duplication frauduleuse de carte SIM). Pour sécuriser les comptes financiers, combinez des jetons TOTP matériels ou applicatifs, des clés Passkeys FIDO2 et la liaison cryptographique à l'appareil via Android Keystore.",
        isCompleted = true,
        quizQuestion = "Pourquoi les Passkeys / TOTP sont-ils plus sûrs que les OTP par SMS ?",
        quizOptionsSerialized = "Ils ne transitent pas par le réseau SS7 et résistent au SIM Swapping|Ils sont plus courts à taper|Ils fonctionnent sans batterie|Ils désactivent le chiffrement TLS",
        quizCorrectIndex = 0,
        quizExplanation = "Le SMS peut être intercepté via SIM Swapping ou failles SS7, alors qu'une clé cryptographique Android Keystore ou TOTP reste liée à l'appareil légitime."
      ),

      LessonEntity(
        id = "les_ia_01",
        courseId = "c_ia_01",
        title = "1. Architecture RAG (Retrieval-Augmented Generation)",
        durationMinutes = 40,
        orderIndex = 1,
        contentMarkdown = "Un système RAG réduit les hallucinations des LLMs en indexant des documents vérifiés (procédures juridiques OHADA, fiches agricoles, catalogues produits) sous forme de vecteurs (embeddings). Avant de répondre, le modèle récupère les passages les plus pertinents et cite explicitement ses sources.",
        isCompleted = false,
        quizQuestion = "Quel est le rôle principal de l'étape de 'Retrieval' dans un pipeline RAG ?",
        quizOptionsSerialized = "Extraire les passages documentaires pertinents pour ancrer la réponse du modèle|Augmenter la taille du modèle de langage|Supprimer la base de données|Chiffrer les images utilisateur",
        quizCorrectIndex = 0,
        quizExplanation = "L'étape de recherche (Retrieval) fournit un contexte factuel et à jour au modèle afin d'ancrer sa génération dans des données réelles."
      ),

      LessonEntity(
        id = "les_des_01",
        courseId = "c_des_01",
        title = "1. Lisibilité Mobile, Contrastes WCAG & Ergonomie Tactile",
        durationMinutes = 25,
        orderIndex = 1,
        contentMarkdown = "Sur un smartphone utilisé en plein soleil, un contraste minimal de 4.5:1 pour le texte courant (WCAG AA) est indispensable. Les cibles tactiles doivent mesurer au minimum 48dp x 48dp avec un espacement suffisant pour éviter les appuis accidentels.",
        isCompleted = false,
        quizQuestion = "Quelle est la taille minimale recommandée pour une cible tactile accessible sous Android ?",
        quizOptionsSerialized = "48dp x 48dp|16dp x 16dp|24dp x 24dp|100dp x 100dp",
        quizCorrectIndex = 0,
        quizExplanation = "Les directives Material Design et d'accessibilité Android fixent un minimum de 48dp x 48dp pour tout élément interactif."
      ),

      LessonEntity(
        id = "les_ent_01",
        courseId = "c_ent_01",
        title = "1. Maîtriser l'Économie Unitaire : CAC, LTV & Payback",
        durationMinutes = 30,
        orderIndex = 1,
        contentMarkdown = "Avant d'accélérer l'acquisition, une startup doit valider ses unit economics : le Coût d'Acquisition Client (CAC) doit être récupéré en moins de 12 mois, et la Valeur Vie Client (LTV) doit représenter au moins 3 fois le CAC.",
        isCompleted = true,
        quizQuestion = "Quel ratio LTV / CAC indique généralement un modèle économique sain ?",
        quizOptionsSerialized = "LTV au moins égale à 3 fois le CAC|LTV inférieure au CAC|CAC égal à zéro obligatoire|LTV divisée par 10",
        quizCorrectIndex = 0,
        quizExplanation = "Un ratio LTV / CAC >= 3 garantit que chaque client génère suffisamment de marge pour couvrir son acquisition et financer la croissance."
      )
    )
    dao.insertLessons(lessons + extraLessons)

    val now = System.currentTimeMillis()
    val flashcards = listOf(
      FlashcardEntity(
        id = "fc_01",
        domainId = DomainType.ANGLAIS.id,
        front = "How do you clearly state a 'Value Proposition' to an international investor?",
        back = "State the specific customer pain, your measurable outcome, and why your solution outperforms existing alternatives in one concise sentence.",
        hint = "Problème mesurable + bénéfice unique.",
        easeFactor = 2.5,
        intervalDays = 1,
        repetitions = 2,
        nextReviewEpochMs = now - 1000,
        lastReviewedEpochMs = now - 86_400_000L
      ),
      FlashcardEntity(
        id = "fc_02",
        domainId = DomainType.ANGLAIS.id,
        front = "Traduisez en anglais professionnel : 'Notre application reste opérationnelle hors-ligne en zone rurale.'",
        back = "'Our application operates reliably offline across low-connectivity rural areas.'",
        hint = "Mots-clés : operates reliably offline, low-connectivity.",
        easeFactor = 2.6,
        intervalDays = 3,
        repetitions = 3,
        nextReviewEpochMs = now - 500,
        lastReviewedEpochMs = now - 120_000_000L
      ),
      FlashcardEntity(
        id = "fc_03",
        domainId = DomainType.DEVELOPPEMENT.id,
        front = "Quel est le rôle de la clé d'idempotence dans une API Mobile Money ?",
        back = "Elle garantit qu'une requête répétée après coupure réseau ne provoque jamais un double prélèvement sur le compte du client.",
        hint = "Protection contre les retries réseau.",
        easeFactor = 2.8,
        intervalDays = 6,
        repetitions = 4,
        nextReviewEpochMs = now + 86_400_000L,
        lastReviewedEpochMs = now
      ),
      FlashcardEntity(
        id = "fc_04",
        domainId = DomainType.CYBERSECURITE.id,
        front = "Comment se prémunir contre le SIM Swapping sur une application financière ?",
        back = "Remplacer les OTP SMS par des jetons TOTP / Passkeys FIDO2 et lier la session à une clé stockée dans Android Keystore.",
        hint = "Éviter la dépendance au numéro SMS seul.",
        easeFactor = 2.5,
        intervalDays = 1,
        repetitions = 1,
        nextReviewEpochMs = now - 2000,
        lastReviewedEpochMs = now - 40_000_000L
      ),
      FlashcardEntity(
        id = "fc_05",
        domainId = DomainType.ENTREPRENEURIAT.id,
        front = "Quel est le ratio LTV / CAC cible pour une startup en croissance ?",
        back = "Une LTV (Lifetime Value) d'au moins 3x le CAC (Customer Acquisition Cost) avec un délai de récupération inférieur à 12 mois.",
        hint = "Seuil de rentabilité d'acquisition.",
        easeFactor = 2.5,
        intervalDays = 2,
        repetitions = 1,
        nextReviewEpochMs = now - 3000,
        lastReviewedEpochMs = now - 50_000_000L
      ),
      FlashcardEntity(
        id = "fc_06",
        domainId = DomainType.DATA.id,
        front = "Quelle différence entre GROUP BY et une Window Function (OVER) en SQL ?",
        back = "GROUP BY agrège et réduit le nombre de lignes par groupe, tandis que OVER calcule un agrégat sur une fenêtre tout en conservant chaque ligne.",
        hint = "Conservation du niveau de détail.",
        easeFactor = 2.5,
        intervalDays = 1,
        repetitions = 0,
        nextReviewEpochMs = now - 1500,
        lastReviewedEpochMs = now - 30_000_000L
      ),
      FlashcardEntity(
        id = "fc_07",
        domainId = DomainType.IA.id,
        front = "Pourquoi utiliser un système RAG plutôt que d'entraîner un LLM à chaque mise à jour ?",
        back = "Le RAG injecte des documents récents et vérifiables au moment de la requête, réduisant les hallucinations à moindre coût.",
        hint = "Ancrage documentaire en temps réel.",
        easeFactor = 2.5,
        intervalDays = 1,
        repetitions = 0,
        nextReviewEpochMs = now - 1200,
        lastReviewedEpochMs = now - 20_000_000L
      ),
      FlashcardEntity(
        id = "fc_08",
        domainId = DomainType.DESIGN.id,
        front = "Quel ratio de contraste minimal exige la norme WCAG AA pour un texte courant ?",
        back = "Un ratio de contraste d'au moins 4.5:1 entre la couleur du texte et son arrière-plan (3:1 pour les grands titres).",
        hint = "Standard d'accessibilité visuelle.",
        easeFactor = 2.5,
        intervalDays = 1,
        repetitions = 1,
        nextReviewEpochMs = now - 800,
        lastReviewedEpochMs = now - 25_000_000L
      )
    )
    dao.insertFlashcards(flashcards)

    val badges = listOf(
      BadgeEntity(
        id = "b_bronze",
        name = "Fondation Bronze",
        tier = BadgeTier.BRONZE.name,
        domainId = DomainType.DEVELOPPEMENT.id,
        pointsRequired = 500,
        coursesRequired = 3,
        englishRequired = "A2",
        isUnlocked = true,
        unlockedDate = "15 Août 2026",
        iconEmoji = "BR",
        description = "Validation des acquis fondamentaux, assiduité aux sessions et anglais A2 certifié."
      ),
      BadgeEntity(
        id = "b_argent",
        name = "Bâtisseur Argent",
        tier = BadgeTier.ARGENT.name,
        domainId = DomainType.DEVELOPPEMENT.id,
        pointsRequired = 1500,
        coursesRequired = 8,
        englishRequired = "B1",
        isUnlocked = true,
        unlockedDate = "19 Septembre 2026",
        iconEmoji = "AG",
        description = "8 cours maîtrisés, anglais professionnel B1, 1 projet publié sur l'incubateur et 1 challenge remporté."
      ),
      BadgeEntity(
        id = "b_or",
        name = "Maître Or",
        tier = BadgeTier.OR.name,
        domainId = DomainType.DEVELOPPEMENT.id,
        pointsRequired = 4000,
        coursesRequired = 15,
        englishRequired = "B2",
        isUnlocked = false,
        unlockedDate = null,
        iconEmoji = "OR",
        description = "15 cours complétés, anglais B2 bilingue tech, 3 projets incubés, 1 hackathon gagné et mentorat de 2 cadets."
      ),
      BadgeEntity(
        id = "b_platine",
        name = "Visionnaire Platine",
        tier = BadgeTier.PLATINE.name,
        domainId = DomainType.IA.id,
        pointsRequired = 8000,
        coursesRequired = 25,
        englishRequired = "C1",
        isUnlocked = false,
        unlockedDate = null,
        iconEmoji = "PT",
        description = "Reconnaissance éminente par la communauté, contributions open source panafricaines majeures et impact entrepreneurial."
      ),
      BadgeEntity(
        id = "b_diamant",
        name = "Légende Diamant",
        tier = BadgeTier.DIAMANT.name,
        domainId = DomainType.ENTREPRENEURIAT.id,
        pointsRequired = 15000,
        coursesRequired = 40,
        englishRequired = "C2",
        isUnlocked = false,
        unlockedDate = null,
        iconEmoji = "DM",
        description = "Validation solennelle par le grand jury AfricaSkills, rôle d'expert officiel et fondateur d'une startup à portée continentale."
      )
    )
    dao.insertBadges(badges)

    val attestations = listOf(
      AttestationEntity(
        id = "att_01",
        certificateNumber = "AS-2026-B8492-BJ",
        title = "Attestation Professionnelle : Développeur Mobile & Architecture Android",
        domainName = "Développement & Systèmes Réactifs",
        recipientName = "Ismaila Gohoundje",
        issueDate = "19 Septembre 2026",
        tier = "Argent certifié",
        priceFcfa = 2000,
        isPaid = true,
        paymentMethod = "MTN Mobile Money",
        verificationUrl = "https://africaskills.org/verify/AS-2026-B8492-BJ",
        expertSigner = "Dr. Koffi Mensah",
        expertRole = "Directeur Pédagogique & Architecte Principal AfricaSkills"
      ),
      AttestationEntity(
        id = "att_02",
        certificateNumber = "AS-2026-ENG-491",
        title = "Certificat de Maîtrise de l'Anglais Tech & Négociation Internationale",
        domainName = "Anglais Professionnel Intensif",
        recipientName = "Ismaila Gohoundje",
        issueDate = "25 Août 2026",
        tier = "Bronze certifié",
        priceFcfa = 1000,
        isPaid = true,
        paymentMethod = "FedaPay (Moov Money)",
        verificationUrl = "https://africaskills.org/verify/AS-2026-ENG-491",
        expertSigner = "David Osei, M.A.",
        expertRole = "Responsable Panafricain de l'Immersion Linguistique"
      ),
      AttestationEntity(
        id = "att_03",
        certificateNumber = "AS-2026-CYBER-882",
        title = "Attestation de Spécialiste : Sécurité Défensive & FinTech",
        domainName = "Cybersécurité",
        recipientName = "Ismaila Gohoundje",
        issueDate = "18 Septembre 2026",
        tier = "Or certifié",
        priceFcfa = 5000,
        isPaid = false,
        paymentMethod = null,
        verificationUrl = "https://africaskills.org/verify/AS-2026-CYBER-882",
        expertSigner = "Emmanuel Kouassi",
        expertRole = "Expert Auditeur SSI Certifié CISSP"
      ),
      AttestationEntity(
        id = "att_04",
        certificateNumber = "AS-2026-ENT-310",
        title = "Certificat Entrepreneuriat OHADA & Structuration Startup",
        domainName = "Entrepreneuriat",
        recipientName = "Ismaila Gohoundje",
        issueDate = "12 Septembre 2026",
        tier = "Bronze certifié",
        priceFcfa = 1000,
        isPaid = false,
        paymentMethod = null,
        verificationUrl = "https://africaskills.org/verify/AS-2026-ENT-310",
        expertSigner = "Mariam Traoré",
        expertRole = "Directrice Incubation & Investissement AfricaSkills"
      )
    )
    attestations.forEach { dao.insertAttestation(it) }

    val jobs = listOf(
      JobEntity(
        id = "job_01",
        title = "Ingénieur Android & Kotlin Multiplatform",
        companyName = "Wave Mobile Money",
        location = "Dakar / Abidjan / Télétravail",
        type = "CDI",
        domainId = DomainType.DEVELOPPEMENT.id,
        badgeRequired = "Argent minimum",
        salaryRange = "950 000 - 1 500 000 FCFA",
        isApplied = false,
        description = "Concevez les parcours de transfert et de paiement marchands haute disponibilité utilisés par des millions de clients chaque jour.",
        requirements = "Badge Argent validé, Jetpack Compose, Room, Coroutines et tests unitaires."
      ),
      JobEntity(
        id = "job_02",
        title = "Stage Développeur Fullstack Kotlin / TypeScript",
        companyName = "Yassir Africa Hub",
        location = "Cotonou / Hybride",
        type = "Stage",
        domainId = DomainType.DEVELOPPEMENT.id,
        badgeRequired = "Bronze certifié",
        salaryRange = "180 000 - 250 000 FCFA",
        isApplied = true,
        description = "Programme tremplin de 6 mois sur nos services de mobilité et de livraison urbaine avec possibilité d'embauche directe.",
        requirements = "Anglais technique A2 minimum, 3 cours validés, pratique de Git et APIs REST."
      ),
      JobEntity(
        id = "job_03",
        title = "Audit de Sécurité API Paiement Transfrontalier",
        companyName = "Ecobank Transnational",
        location = "Lomé / Télétravail",
        type = "Freelance",
        domainId = DomainType.CYBERSECURITE.id,
        badgeRequired = "Or requis",
        salaryRange = "2 500 000 FCFA (Forfait)",
        isApplied = false,
        description = "Revue d'architecture, tests d'intrusion et conformité OWASP Mobile Top 10 sur les passerelles bancaires UEMOA.",
        requirements = "Badge Or Cybersécurité, maîtrise OAuth2, mTLS et analyse de vulnérabilités."
      ),
      JobEntity(
        id = "job_04",
        title = "Data Analyst FinTech & Scoring Crédit",
        companyName = "Djamo",
        location = "Abidjan / Télétravail",
        type = "CDI",
        domainId = DomainType.DATA.id,
        badgeRequired = "Argent minimum",
        salaryRange = "750 000 - 1 100 000 FCFA",
        isApplied = false,
        description = "Modélisez les cohortes de rétention, la détection de fraude temps réel et les indicateurs de liquidité sur SQL et Python.",
        requirements = "Maîtrise avancée de SQL (fonctions de fenêtre), Python pandas et anglais B1."
      ),
      JobEntity(
        id = "job_05",
        title = "Ingénieur Backend Agrégateur Mobile Money",
        companyName = "FedaPay",
        location = "Cotonou",
        type = "CDI",
        domainId = DomainType.DEVELOPPEMENT.id,
        badgeRequired = "Argent minimum",
        salaryRange = "700 000 - 1 150 000 FCFA",
        isApplied = false,
        description = "Développez des connecteurs temps réel résilients avec gestion d'idempotence et réconciliation comptable automatisée.",
        requirements = "Expérience APIs REST haute fiabilité, files de messages et webhooks sécurisés."
      )
    )
    dao.insertJobs(jobs)

    val projects = listOf(
      ProjectEntity(
        id = "proj_01",
        title = "AgriConnect Bénin : Marché Agricole Vocal en Fon & Yoruba",
        domainId = DomainType.ENTREPRENEURIAT.id,
        description = "Plateforme permettant aux producteurs maraîchers de publier leurs stocks et négocier leurs prix par commande vocale en langues locales.",
        status = "INCUBATION",
        teamSize = 4,
        targetKpi = "10 000 producteurs actifs d'ici décembre 2026",
        mentorName = "Mariam Traoré",
        repoUrl = "github.com/africaskills/agriconnect-africa",
        isStartupIncubated = true
      ),
      ProjectEntity(
        id = "proj_02",
        title = "SolarLog IoT : Télémétrie des Micro-Réseaux Solaires",
        domainId = DomainType.INGENIERIE.id,
        description = "Boîtier open-source de suivi de charge batterie LFP avec alertes préventives SMS et LoRaWAN pour les zones rurales.",
        status = "IN_PROGRESS",
        teamSize = 3,
        targetKpi = "50 installations pilotes instrumentées",
        mentorName = "Chukwuemeka Obi",
        repoUrl = "github.com/africaskills/solarlog-iot",
        isStartupIncubated = false
      ),
      ProjectEntity(
        id = "proj_03",
        title = "AfriMediScan : Authentification Pharmaceutique par Vision",
        domainId = DomainType.IA.id,
        description = "Vérification instantanée de lots de médicaments via analyse optique embarquée et base réglementaire hors-ligne.",
        status = "TODO",
        teamSize = 2,
        targetKpi = "Jeu de données validé sur 5 000 références",
        mentorName = "Dr. Koffi Mensah",
        repoUrl = "github.com/africaskills/afrimediscan",
        isStartupIncubated = false
      ),
      ProjectEntity(
        id = "proj_04",
        title = "KolaPay Ledger : Comptabilité Simplifiée pour Commerçants",
        domainId = DomainType.DATA.id,
        description = "Application de suivi de caisse multidevise XOF/XAF avec rapprochement automatique des encaissements Mobile Money.",
        status = "DONE",
        teamSize = 3,
        targetKpi = "1 200 PME pilotes à Cotonou et Lomé",
        mentorName = "Fatou Ndiaye",
        repoUrl = "github.com/africaskills/kolapay-ledger",
        isStartupIncubated = true
      )
    )
    dao.insertProjects(projects)

    val messages = listOf(
      CommunityMessageEntity(
        id = "m_01",
        domainId = DomainType.DEVELOPPEMENT.id,
        senderName = "Amina Diallo",
        senderRole = "Mentor",
        messageText = "Bienvenue dans le salon Développement. La session FATA de demain portera sur la synchronisation Room en contexte 3G intermittent.",
        timestampText = "Hier à 16:30",
        isUser = false,
        reactionsCount = 12
      ),
      CommunityMessageEntity(
        id = "m_02",
        domainId = DomainType.DEVELOPPEMENT.id,
        senderName = "Ismaila Gohoundje",
        senderRole = "Apprenant",
        messageText = "Nous avons mis en place le cache local Room sur AgriConnect : les listes s'affichent en moins de 15ms sans réseau.",
        timestampText = "Aujourd'hui à 10:15",
        isUser = true,
        reactionsCount = 7
      ),
      CommunityMessageEntity(
        id = "m_03",
        domainId = DomainType.DEVELOPPEMENT.id,
        senderName = "Mamadou Sow",
        senderRole = "Apprenant",
        messageText = "Avez-vous utilisé WorkManager pour rejouer les requêtes en attente dès le retour de la connexion ?",
        timestampText = "Aujourd'hui à 11:02",
        isUser = false,
        reactionsCount = 4
      ),
      CommunityMessageEntity(
        id = "m_04",
        domainId = DomainType.ANGLAIS.id,
        senderName = "David Osei",
        senderRole = "Mentor",
        messageText = "Tonight at 20:00 GMT we practice 90-second startup pitches and technical trade-off vocabulary. Prepare 3 bullet points.",
        timestampText = "Aujourd'hui à 09:00",
        isUser = false,
        reactionsCount = 9
      ),
      CommunityMessageEntity(
        id = "m_05",
        domainId = DomainType.CYBERSECURITE.id,
        senderName = "Emmanuel Kouassi",
        senderRole = "Mentor",
        messageText = "Rappel important : vérifiez toujours la signature HMAC de vos webhooks Mobile Money avant de valider une commande.",
        timestampText = "Hier à 19:45",
        isUser = false,
        reactionsCount = 15
      )
    )
    dao.insertMessages(messages)
  }
}
