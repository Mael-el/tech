package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_profile")
data class UserProfileEntity(
  @PrimaryKey val id: Int = 1,
  val fullName: String,
  val email: String,
  val phone: String,
  val bio: String,
  val role: String,
  val location: String,
  val points: Int,
  val streakDays: Int,
  val currentBadgeLevel: String,
  val englishLevel: String,
  val completedCoursesCount: Int,
  val publishedProjectsCount: Int,
  val wonChallengesCount: Int,
  val isVerified: Boolean
)

@Entity(tableName = "courses")
data class CourseEntity(
  @PrimaryKey val id: String,
  val domainId: String,
  val title: String,
  val description: String,
  val instructorName: String,
  val level: String,
  val durationHours: Int,
  val progressPercent: Int,
  val isEnrolled: Boolean,
  val isCompleted: Boolean,
  val modulesCount: Int,
  val rating: Double,
  val nextSessionFata: String?
)

@Entity(tableName = "lessons")
data class LessonEntity(
  @PrimaryKey val id: String,
  val courseId: String,
  val title: String,
  val durationMinutes: Int,
  val orderIndex: Int,
  val contentMarkdown: String,
  val isCompleted: Boolean,
  val quizQuestion: String,
  val quizOptionsSerialized: String,
  val quizCorrectIndex: Int,
  val quizExplanation: String
)

@Entity(tableName = "flashcards")
data class FlashcardEntity(
  @PrimaryKey val id: String,
  val domainId: String,
  val front: String,
  val back: String,
  val hint: String,
  val easeFactor: Double,
  val intervalDays: Int,
  val repetitions: Int,
  val nextReviewEpochMs: Long,
  val lastReviewedEpochMs: Long
)

@Entity(tableName = "badges")
data class BadgeEntity(
  @PrimaryKey val id: String,
  val name: String,
  val tier: String,
  val domainId: String,
  val pointsRequired: Int,
  val coursesRequired: Int,
  val englishRequired: String,
  val isUnlocked: Boolean,
  val unlockedDate: String?,
  val iconEmoji: String,
  val description: String
)

@Entity(tableName = "attestations")
data class AttestationEntity(
  @PrimaryKey val id: String,
  val certificateNumber: String,
  val title: String,
  val domainName: String,
  val recipientName: String,
  val issueDate: String,
  val tier: String,
  val priceFcfa: Int,
  val isPaid: Boolean,
  val paymentMethod: String?,
  val verificationUrl: String,
  val expertSigner: String,
  val expertRole: String
)

@Entity(tableName = "jobs")
data class JobEntity(
  @PrimaryKey val id: String,
  val title: String,
  val companyName: String,
  val location: String,
  val type: String,
  val domainId: String,
  val badgeRequired: String,
  val salaryRange: String,
  val isApplied: Boolean,
  val description: String,
  val requirements: String
)

@Entity(tableName = "projects")
data class ProjectEntity(
  @PrimaryKey val id: String,
  val title: String,
  val domainId: String,
  val description: String,
  val status: String,
  val teamSize: Int,
  val targetKpi: String,
  val mentorName: String,
  val repoUrl: String,
  val isStartupIncubated: Boolean
)

@Entity(tableName = "messages")
data class CommunityMessageEntity(
  @PrimaryKey val id: String,
  val domainId: String,
  val senderName: String,
  val senderRole: String,
  val messageText: String,
  val timestampText: String,
  val isUser: Boolean,
  val reactionsCount: Int
)
