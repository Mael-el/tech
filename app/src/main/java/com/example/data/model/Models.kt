package com.example.data.model

import androidx.compose.ui.graphics.Color
import com.example.ui.theme.*

enum class DomainType(
  val id: String,
  val displayName: String,
  val color: Color,
  val description: String
) {
  ANGLAIS("anglais", "Anglais", DomainEnglish, "Maîtrise obligatoire en 3 mois : A1 à C1 professionnel"),
  DEVELOPPEMENT("dev", "Développement", DomainDev, "Web, Mobile, Backend, APIs & Architecture logicielle"),
  DATA("data", "Data & IA", DomainData, "Data Engineering, SQL, Python & Analyse prédictive"),
  CYBERSECURITE("cyber", "Cybersécurité", DomainCyber, "Sécurité défensive, Pentesting, Réseaux & Cryptographie"),
  IA("ia", "Intelligence Artificielle", DomainAI, "Machine Learning, LLMs, Computer Vision & Agents IA"),
  DESIGN("design", "Design & UX/UI", DomainDesign, "Design produit, Figma, Recherche utilisateur & Ergonomie"),
  MATHS("maths", "Mathématiques", DomainMaths, "Algèbre linéaire, Probabilités & Statistiques appliquées"),
  PHYSIQUE("physique", "Physique", DomainPhysics, "Électronique fondamentale, Énergie & Modélisation"),
  LECTURE("lecture", "Lecture & Esprit Critique", DomainReading, "Synthèse, Écriture persuasive & Grands auteurs"),
  INGENIERIE("ingenierie", "Ingénierie", DomainEngineering, "Systèmes embarqués, IoT & Génie mécanique"),
  ROBOTIQUE("robotique", "Robotique", DomainRobotics, "Cinématique, Capteurs, Arduino & ROS"),
  ENTREPRENEURIAT("entrepreneuriat", "Entrepreneuriat", DomainEntrepreneurship, "Modèle économique, Pitch, Incubation & Financement"),
  LANGUES_LOCALES("langues_locales", "Langues Locales", DomainLocalLanguages, "Yoruba, Fon, Wolof, Swahili, Haoussa & Bambara"),
  COMPETENCES_TRANSVERSALES("soft_skills", "Compétences Transversales", DomainSoftSkills, "Leadership, Négociation, Prise de parole & Éthique");

  companion object {
    fun fromId(id: String): DomainType = entries.find { it.id == id } ?: DEVELOPPEMENT
  }
}

enum class BadgeTier(
  val label: String,
  val minPoints: Int,
  val minCourses: Int,
  val requiredEnglishLevel: String,
  val badgeColor: Color,
  val attestationPriceFcfa: Int
) {
  BRONZE("Bronze", 500, 3, "A2", BadgeBronzeColor, 1000),
  ARGENT("Argent", 1500, 8, "B1", BadgeSilverColor, 2000),
  OR("Or", 4000, 15, "B2", BadgeGoldColor, 5000),
  PLATINE("Platine", 8000, 25, "C1", BadgePlatinumColor, 10000),
  DIAMANT("Diamant", 15000, 40, "C2", BadgeDiamondColor, 15000)
}
