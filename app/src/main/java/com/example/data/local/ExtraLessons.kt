package com.example.data.local

/**
 * Leçons complémentaires (contenu commun avec l'aperçu web).
 *
 * Fichier GÉNÉRÉ par tools/gen_extra_lessons.py depuis
 * web/src/data/extra-lessons.json — ne pas modifier à la main.
 * Régénérer avec : python3 tools/gen_extra_lessons.py
 */
val extraLessons: List<LessonEntity> = listOf(
  LessonEntity(
    id = "les_math_01",
    courseId = "c_math_01",
    title = "1. Probabilités conditionnelles & théorème de Bayes",
    durationMinutes = 30,
    orderIndex = 1,
    contentMarkdown = "En classification, on ne cherche pas P(classe) mais P(classe | indice). Le théorème de Bayes relie les deux : P(A|B) = P(B|A) × P(A) / P(B). Sur une base de 1 000 transactions dont 2 % frauduleuses, un modèle qui détecte 90 % des fraudes avec 5 % de faux positifs produit beaucoup plus de fausses alertes que de vraies : la précision dépend directement de la prévalence. D'où l'importance du rappel, de la précision et de la courbe précision-rappel plutôt que de l'exactitude seule sur des classes déséquilibrées.",
    isCompleted = false,
    quizQuestion = "Une base contient 2 % de fraudes. Le modèle détecte 90 % des fraudes et signale 5 % des transactions saines. Que faut-il surveiller en priorité ?",
    quizOptionsSerialized = "La précision, car la classe positive est rare|L'exactitude globale, proche de 95 %|Le nombre total de transactions|La vitesse d'inférence uniquement",
    quizCorrectIndex = 0,
    quizExplanation = "Avec 2 % de positifs, l'exactitude est trompeuse : un modèle qui prédit toujours « sain » atteint déjà 98 %. La précision et le rappel mesurent l'utilité réelle du détecteur."
  ),
  LessonEntity(
    id = "les_math_02",
    courseId = "c_math_01",
    title = "2. Algèbre linéaire : valeurs propres et réduction de dimension",
    durationMinutes = 35,
    orderIndex = 2,
    contentMarkdown = "Une ACP diagonalise la matrice de covariance : les vecteurs propres deviennent les axes principaux et les valeurs propres indiquent la variance expliquée. On centre-réduit les variables (moyenne 0, écart-type 1) avant l'analyse pour éviter qu'une variable exprimée en FCFA domine une variable exprimée en années. Conserver les composantes couvrant 90 à 95 % de la variance réduit le bruit et le coût de calcul, et permet une visualisation en deux dimensions.",
    isCompleted = false,
    quizQuestion = "Pourquoi centrer-réduire les variables avant une ACP ?",
    quizOptionsSerialized = "Pour que chaque variable pèse selon son information, indépendamment de son unité|Pour rendre la matrice de covariance inversible|Pour supprimer automatiquement les valeurs aberrantes|Pour garantir 100 % de variance expliquée",
    quizCorrectIndex = 0,
    quizExplanation = "Sans centrage-réduction, une variable à grande échelle (FCFA, mètres) domine artificiellement les composantes principales."
  ),
  LessonEntity(
    id = "les_phy_01",
    courseId = "c_phy_01",
    title = "1. Dimensionner un champ photovoltaïque autonome",
    durationMinutes = 25,
    orderIndex = 1,
    contentMarkdown = "Pour une consommation de 3 kWh par jour et une irradiation moyenne de 5 kWh/m²/jour, un rendement système de 75 % (onduleur, câblage, température, poussière) impose environ 3 ÷ (5 × 0,75) = 0,8 kWc de panneaux. On arrondit à la hausse et on ajoute 20 % de marge pour les journées couvertes. Le régulateur MPPT se dimensionne sur la tension et le courant du champ, pas sur la seule puissance nominale.",
    isCompleted = false,
    quizQuestion = "Consommation 3 kWh/j, irradiation 5 kWh/m²/j, rendement 75 %. Quelle puissance crête minimale ?",
    quizOptionsSerialized = "≈ 0,8 kWc|≈ 0,4 kWc|≈ 3 kWc|≈ 15 kWc",
    quizCorrectIndex = 0,
    quizExplanation = "P = 3 / (5 × 0,75) = 0,8 kWc, avant marge de sécurité."
  ),
  LessonEntity(
    id = "les_phy_02",
    courseId = "c_phy_01",
    title = "2. Batteries LiFePO4 : profondeur de décharge et cycles",
    durationMinutes = 30,
    orderIndex = 2,
    contentMarkdown = "Une batterie LiFePO4 supporte 3 000 à 6 000 cycles à 80 % de profondeur de décharge (DoD), contre 300 à 500 cycles pour un plomb-acide limité à 50 %. Pour disposer de 4 kWh utiles à 80 % de DoD, il faut 5 kWh de capacité nominale. La température compte autant que la chimie : chaque 10 °C au-delà de 25 °C réduit sensiblement la durée de vie. Un BMS protège contre la surcharge, la décharge profonde et le déséquilibre des cellules.",
    isCompleted = false,
    quizQuestion = "Pour 4 kWh utiles avec une profondeur de décharge de 80 %, quelle capacité nominale ?",
    quizOptionsSerialized = "5 kWh|3,2 kWh|4 kWh|8 kWh",
    quizCorrectIndex = 0,
    quizExplanation = "4 kWh ÷ 0,8 = 5 kWh nominaux."
  ),
  LessonEntity(
    id = "les_lec_01",
    courseId = "c_lec_01",
    title = "1. Lire une source scientifique sans se faire piéger",
    durationMinutes = 20,
    orderIndex = 1,
    contentMarkdown = "Avant de citer une étude, quatre questions : qui l'a financée, quelle est la taille de l'échantillon, s'agit-il d'une corrélation ou d'une causalité, et le résultat a-t-il été répliqué ? Un preprint n'est pas un article évalué par les pairs, un communiqué de presse n'est pas l'article, et un chiffre sorti de son intervalle de confiance perd son sens. La lecture critique consiste à chercher activement ce qui pourrait invalider la conclusion plutôt qu'à confirmer son opinion.",
    isCompleted = false,
    quizQuestion = "Quel indice affaiblit le plus une conclusion tirée d'une étude ?",
    quizOptionsSerialized = "Absence de réplication et conflit d’intérêts|Un résumé rédigé en anglais|Un échantillon décrit en détail|La publication en accès libre",
    quizCorrectIndex = 0,
    quizExplanation = "Sans réplication indépendante et avec un financement intéressé, la conclusion reste une hypothèse fragile."
  ),
  LessonEntity(
    id = "les_lec_02",
    courseId = "c_lec_01",
    title = "2. Structurer une note de synthèse en une page",
    durationMinutes = 25,
    orderIndex = 2,
    contentMarkdown = "Une note efficace suit une pyramide inversée : conclusion et recommandation d'abord, puis les trois arguments décisifs, enfin les annexes méthodologiques. Chaque paragraphe commence par une phrase-sujet, les chiffres sont datés et sourcés, et les options sont comparées sur les mêmes critères (coût, délai, risque). Terminer par la décision attendue et son échéance transforme une synthèse en outil d'action.",
    isCompleted = false,
    quizQuestion = "Quelle structure rend une note de synthèse immédiatement actionnable ?",
    quizOptionsSerialized = "Conclusion et recommandation en tête, puis arguments, puis annexes|Historique complet du projet avant toute conclusion|Une liste de sources sans recommandation|Un texte continu de trois pages",
    quizCorrectIndex = 0,
    quizExplanation = "La pyramide inversée place la décision en tête et réserve les détails aux annexes."
  ),
  LessonEntity(
    id = "les_ing_01",
    courseId = "c_ing_01",
    title = "1. Budget énergétique d'un capteur autonome",
    durationMinutes = 35,
    orderIndex = 1,
    contentMarkdown = "Un nœud LoRaWAN qui mesure toutes les 15 minutes consomme surtout au réveil radio : 45 mA pendant 120 ms en émission, 2 mA pendant 10 ms en mesure, 5 µA en veille. Sur 24 heures, cela représente environ 0,02 Ah par jour. Une cellule photovoltaïque de 1 W et une batterie 3,7 V / 2 Ah assurent plusieurs semaines d'autonomie sans soleil. Le calcul s'effectue en Ah ou en joules par cycle, jamais sur une moyenne de courant estimée « à vue ».",
    isCompleted = false,
    quizQuestion = "Comment évaluer correctement la consommation d'un capteur à cycles ?",
    quizOptionsSerialized = "Sommer courant × durée pour chaque phase, puis multiplier par le nombre de cycles|Prendre le courant maximal d'émission|Mesurer uniquement la veille|Utiliser la tension de la batterie",
    quizCorrectIndex = 0,
    quizExplanation = "Chaque phase a un courant et une durée propres : on intègre cycle par cycle avant de sommer sur 24 h."
  ),
  LessonEntity(
    id = "les_ing_02",
    courseId = "c_ing_01",
    title = "2. LoRaWAN : classes A, B, C et duty cycle",
    durationMinutes = 30,
    orderIndex = 2,
    contentMarkdown = "En classe A, l'objet ouvre deux fenêtres d'écoute juste après chaque émission : c'est le mode le plus économe et le seul obligatoire. La classe B ouvre des fenêtres planifiées par balises, la classe C écoute en continu et suppose une alimentation secteur. En Europe, le duty cycle de 1 % limite le temps d'émission par sous-bande : un payload de 51 octets en SF12 peut interdire une nouvelle émission pendant plusieurs minutes. On adapte donc le facteur d'étalement et la période de mesure au budget spectral.",
    isCompleted = false,
    quizQuestion = "Quel mode LoRaWAN est le plus économe en énergie ?",
    quizOptionsSerialized = "Classe A|Classe B|Classe C|Les trois consomment autant",
    quizCorrectIndex = 0,
    quizExplanation = "La classe A n'écoute que deux courtes fenêtres après émission, d'où une consommation minimale."
  ),
  LessonEntity(
    id = "les_rob_01",
    courseId = "c_rob_01",
    title = "1. Cinématique d'un robot à traction différentielle",
    durationMinutes = 30,
    orderIndex = 1,
    contentMarkdown = "Deux roues motrices séparées par une voie L : la vitesse linéaire v = (v_gauche + v_droite) / 2 et la vitesse angulaire ω = (v_droite − v_gauche) / L. Un robot agricole étroit pivote ainsi sur place lorsque les roues tournent à la même vitesse en sens opposés. Pour suivre une trajectoire, on convertit la consigne (v, ω) en vitesses de roues puis en consignes PWM sur les variateurs, en tenant compte du glissement dans la boue.",
    isCompleted = false,
    quizQuestion = "Comment fait pivoter un robot différentiel sur place ?",
    quizOptionsSerialized = "Roues gauche et droite à même vitesse, en sens opposés|Une roue arrêtée et l'autre en avant|Les deux roues en avant à vitesse maximale|En augmentant la voie L",
    quizCorrectIndex = 0,
    quizExplanation = "v = 0 et ω ≠ 0 : les roues tournent en sens inverse à vitesse égale."
  ),
  LessonEntity(
    id = "les_rob_02",
    courseId = "c_rob_01",
    title = "2. Régulation PID appliquée au suivi de ligne",
    durationMinutes = 35,
    orderIndex = 2,
    contentMarkdown = "L'erreur e(t) est l'écart entre la consigne et la mesure. Le terme proportionnel réagit à l'écart, l'intégral corrige un biais persistant (pente, vent), le dérivé amortit les oscillations. Le réglage commence toujours par Kp seul, puis Ki, puis Kd. Sur un robot lent, on échantillonne à fréquence fixe, par exemple 50 Hz : un dérivé calculé sur un intervalle irrégulier produit des à-coups nuisibles aux moteurs.",
    isCompleted = false,
    quizQuestion = "Quel terme du PID corrige une erreur résiduelle constante ?",
    quizOptionsSerialized = "L'intégral (Ki)|Le proportionnel (Kp)|Le dérivé (Kd)|Le filtre passe-bas",
    quizCorrectIndex = 0,
    quizExplanation = "L'intégrateur accumule l'erreur et finit par annuler un écart persistant que le proportionnel seul ne corrige pas."
  ),
  LessonEntity(
    id = "les_lang_01",
    courseId = "c_lang_01",
    title = "1. Unicodisation et gestion des tons du fon",
    durationMinutes = 25,
    orderIndex = 1,
    contentMarkdown = "Le fon distingue des tons notés par des diacritiques. Deux chaînes visuellement identiques peuvent être codées différemment en Unicode, en forme précomposée NFC ou décomposée NFD : normaliser en NFC avant tout traitement évite des doublons invisibles. Les corpus doivent aussi gérer les variantes orthographiques régionales. Un lower() appliqué sans normalisation casse les correspondances et fausse les statistiques.",
    isCompleted = false,
    quizQuestion = "Pourquoi normaliser les textes en NFC avant traitement ?",
    quizOptionsSerialized = "Pour éviter que deux graphies équivalentes soient comptées comme différentes|Pour traduire automatiquement vers le français|Pour supprimer les tons|Pour compresser le corpus",
    quizCorrectIndex = 0,
    quizExplanation = "NFC réunit caractère de base et diacritique en une seule unité, ce qui rend les comparaisons fiables."
  ),
  LessonEntity(
    id = "les_lang_02",
    courseId = "c_lang_01",
    title = "2. Constituer un corpus vocal utile et éthique",
    durationMinutes = 30,
    orderIndex = 2,
    contentMarkdown = "Un corpus vocal exploitable documente le consentement, l'âge, le genre, la région, le dispositif d'enregistrement et la licence. Il vise plusieurs heures par locuteur pour l'entraînement et surtout une couverture équilibrée des tons et des variantes dialectales. Le bruit de fond réel (marché, moto, pluie) doit être représenté : un modèle entraîné uniquement en studio échoue en conditions de terrain.",
    isCompleted = false,
    quizQuestion = "Quel élément conditionne l'exploitation éthique d'un corpus vocal ?",
    quizOptionsSerialized = "Le consentement documenté et la licence d'usage|Le nombre d'abonnés du locuteur|La marque du téléphone utilisé|Une durée maximale de 10 secondes",
    quizCorrectIndex = 0,
    quizExplanation = "Sans consentement traçable ni licence claire, le corpus n'est pas réutilisable, même techniquement excellent."
  ),
  LessonEntity(
    id = "les_soft_01",
    courseId = "c_soft_01",
    title = "1. Prioriser avec RICE sans se mentir",
    durationMinutes = 25,
    orderIndex = 1,
    contentMarkdown = "RICE = (Reach × Impact × Confidence) / Effort. La confiance se note de 0,5 à 1 : surestimer systématiquement revient à supprimer le facteur. Sur une équipe de quatre, l'effort s'exprime en semaines-personne, pas en « jours idéaux ». L'objectif n'est pas un score parfait mais un classement explicite, discutable et révisable dès qu'une hypothèse change.",
    isCompleted = false,
    quizQuestion = "Dans RICE, que traduit le facteur Confidence ?",
    quizOptionsSerialized = "Le degré de certitude sur les estimations de reach, impact et effort|La confiance des investisseurs|La qualité du code existant|Le nombre d'utilisateurs payants",
    quizCorrectIndex = 0,
    quizExplanation = "Confidence pondère les autres estimations par le risque d'erreur : 0,5 pour une hypothèse faible, 1 pour une donnée mesurée."
  ),
  LessonEntity(
    id = "les_soft_02",
    courseId = "c_soft_01",
    title = "2. Négocier un délai technique sans brader la qualité",
    durationMinutes = 30,
    orderIndex = 2,
    contentMarkdown = "Annoncer un retard au dernier moment détruit plus de confiance qu'un désaccord initial. Une négociation utile expose trois options chiffrées (périmètre réduit, date décalée, qualité dégradée avec dette assumée), leurs conséquences et une recommandation. On sépare le problème des personnes, on s'appuie sur des faits (vélocité, dépendances externes) et on conclut par une décision écrite avec une date de revue.",
    isCompleted = false,
    quizQuestion = "Quelle pratique rend une renégociation de délai crédible ?",
    quizOptionsSerialized = "Proposer plusieurs options chiffrées avec leurs conséquences|Annoncer le retard la veille de la livraison|Promettre la date initiale coûte que coûte|Négocier uniquement à l'oral",
    quizCorrectIndex = 0,
    quizExplanation = "Des options explicites transforment un rapport de force en décision partagée et documentée."
  )
)
