package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface AfricaSkillsDao {

  @Query("SELECT * FROM user_profile WHERE id = 1 LIMIT 1")
  fun getUserProfile(): Flow<UserProfileEntity?>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertOrUpdateProfile(profile: UserProfileEntity)

  @Query("UPDATE user_profile SET points = points + :addedPoints WHERE id = 1")
  suspend fun addPoints(addedPoints: Int)

  @Query("UPDATE user_profile SET streakDays = streakDays + 1 WHERE id = 1")
  suspend fun incrementStreak()

  @Query("UPDATE user_profile SET fullName = :fullName, email = :email, location = :location WHERE id = 1")
  suspend fun updateProfileIdentity(fullName: String, email: String, location: String)

  @Query("SELECT * FROM courses ORDER BY title ASC")
  fun getAllCourses(): Flow<List<CourseEntity>>

  @Query("SELECT * FROM courses WHERE domainId = :domainId")
  fun getCoursesByDomain(domainId: String): Flow<List<CourseEntity>>

  @Query("SELECT * FROM courses WHERE id = :courseId LIMIT 1")
  suspend fun getCourseById(courseId: String): CourseEntity?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertCourses(courses: List<CourseEntity>)

  @Query("UPDATE courses SET isEnrolled = 1 WHERE id = :courseId")
  suspend fun enrollInCourse(courseId: String)

  @Query("UPDATE courses SET progressPercent = :progress, isCompleted = :isCompleted WHERE id = :courseId")
  suspend fun updateCourseProgress(courseId: String, progress: Int, isCompleted: Boolean)

  @Query("SELECT * FROM lessons WHERE courseId = :courseId ORDER BY orderIndex ASC")
  fun getLessonsForCourse(courseId: String): Flow<List<LessonEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertLessons(lessons: List<LessonEntity>)

  @Query("UPDATE lessons SET isCompleted = 1 WHERE id = :lessonId")
  suspend fun markLessonCompleted(lessonId: String)

  @Query("SELECT * FROM flashcards ORDER BY nextReviewEpochMs ASC")
  fun getAllFlashcards(): Flow<List<FlashcardEntity>>

  @Query("SELECT * FROM flashcards WHERE domainId = :domainId ORDER BY nextReviewEpochMs ASC")
  fun getFlashcardsByDomain(domainId: String): Flow<List<FlashcardEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertFlashcards(flashcards: List<FlashcardEntity>)

  @Update
  suspend fun updateFlashcard(flashcard: FlashcardEntity)

  @Query("SELECT * FROM badges ORDER BY pointsRequired ASC")
  fun getAllBadges(): Flow<List<BadgeEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertBadges(badges: List<BadgeEntity>)

  @Query("UPDATE badges SET isUnlocked = 1, unlockedDate = :date WHERE id = :badgeId")
  suspend fun unlockBadge(badgeId: String, date: String)

  @Query("SELECT * FROM attestations ORDER BY issueDate DESC")
  fun getAllAttestations(): Flow<List<AttestationEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAttestation(attestation: AttestationEntity)

  @Query("UPDATE attestations SET isPaid = 1, paymentMethod = :method WHERE id = :attestationId")
  suspend fun markAttestationPaid(attestationId: String, method: String)

  @Query("SELECT * FROM jobs ORDER BY id ASC")
  fun getAllJobs(): Flow<List<JobEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertJobs(jobs: List<JobEntity>)

  @Query("UPDATE jobs SET isApplied = 1 WHERE id = :jobId")
  suspend fun applyToJob(jobId: String)

  @Query("SELECT * FROM projects ORDER BY id ASC")
  fun getAllProjects(): Flow<List<ProjectEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertProjects(projects: List<ProjectEntity>)

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertProject(project: ProjectEntity)

  @Query("UPDATE projects SET status = :newStatus WHERE id = :projectId")
  suspend fun updateProjectStatus(projectId: String, newStatus: String)

  @Query("SELECT * FROM messages WHERE domainId = :domainId ORDER BY id ASC")
  fun getMessagesForDomain(domainId: String): Flow<List<CommunityMessageEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertMessage(message: CommunityMessageEntity)

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertMessages(messages: List<CommunityMessageEntity>)
}
