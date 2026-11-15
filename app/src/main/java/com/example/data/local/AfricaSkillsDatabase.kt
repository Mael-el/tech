package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
  entities = [
    UserProfileEntity::class,
    CourseEntity::class,
    LessonEntity::class,
    FlashcardEntity::class,
    BadgeEntity::class,
    AttestationEntity::class,
    JobEntity::class,
    ProjectEntity::class,
    CommunityMessageEntity::class
  ],
  version = 3,
  exportSchema = false
)
abstract class AfricaSkillsDatabase : RoomDatabase() {
  abstract fun africaSkillsDao(): AfricaSkillsDao

  companion object {
    @Volatile
    private var INSTANCE: AfricaSkillsDatabase? = null

    fun getDatabase(context: Context): AfricaSkillsDatabase {
      return INSTANCE ?: synchronized(this) {
        val instance = Room.databaseBuilder(
          context.applicationContext,
          AfricaSkillsDatabase::class.java,
          "africaskills_db"
        ).fallbackToDestructiveMigration().build()
        INSTANCE = instance
        instance
      }
    }
  }
}
