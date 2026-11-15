package com.example

import android.content.Context
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.viewmodel.CreationExtras
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.AfricaSkillsDatabase
import com.example.data.local.AppPreferences
import com.example.data.local.CourseEntity
import com.example.data.local.ThemeMode
import com.example.data.repository.AfricaSkillsRepository
import com.example.ui.AfricaSkillsApp
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.AfricaSkillsViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class AfricaSkillsAuthAndBadgeTest {

  @get:Rule val composeTestRule = createComposeRule()

  private lateinit var context: Context
  private lateinit var db: AfricaSkillsDatabase
  private lateinit var repository: AfricaSkillsRepository
  private lateinit var preferences: AppPreferences
  private lateinit var viewModelStore: ViewModelStore
  private val testDispatcher = StandardTestDispatcher()

  @Before
  fun setUp() {
    Dispatchers.setMain(testDispatcher)
    context = ApplicationProvider.getApplicationContext()
    context.getSharedPreferences("africaskills_prefs", Context.MODE_PRIVATE).edit().clear().commit()
    db = Room.inMemoryDatabaseBuilder(context, AfricaSkillsDatabase::class.java)
      .allowMainThreadQueries()
      .setTransactionExecutor(Runnable::run)
      .setQueryExecutor(Runnable::run)
      .build()
    repository = AfricaSkillsRepository(db.africaSkillsDao())
    preferences = AppPreferences(context)
    viewModelStore = ViewModelStore()
  }

  private fun createViewModel(): AfricaSkillsViewModel {
    val factory = object : ViewModelProvider.Factory {
      @Suppress("UNCHECKED_CAST")
      override fun <T : androidx.lifecycle.ViewModel> create(
        modelClass: Class<T>,
        extras: CreationExtras
      ): T = AfricaSkillsViewModel(repository, preferences) as T
    }
    return ViewModelProvider(viewModelStore, factory)[AfricaSkillsViewModel::class.java]
  }

  @After
  fun tearDown() {
    viewModelStore.clear()
    db.close()
    Dispatchers.resetMain()
  }

  @Test
  fun `preferences default to logged out and light theme and persist toggles`() {
    assertFalse(preferences.isLoggedIn.value)
    assertEquals(ThemeMode.LIGHT, preferences.themeMode.value)

    preferences.toggleLightDark(currentlyDark = false)
    assertEquals(ThemeMode.DARK, preferences.themeMode.value)

    val reloaded = AppPreferences(context)
    assertEquals(ThemeMode.DARK, reloaded.themeMode.value)
    assertFalse(reloaded.isLoggedIn.value)

    assertTrue(
      reloaded.validateCredentials(
        AppPreferences.DEFAULT_DEMO_EMAIL,
        AppPreferences.DEFAULT_DEMO_PASSWORD
      )
    )
    assertFalse(reloaded.validateCredentials("unknown@example.com", "wrongpass"))
  }

  @Test
  fun `viewmodel blocks course details until user logs in`() = runTest {
    val viewModel = createViewModel()
    advanceUntilIdle()

    val sampleCourse = CourseEntity(
      id = "c_test",
      domainId = "dev",
      title = "Architecture Kotlin",
      description = "Cours test",
      instructorName = "Mentor",
      level = "Intermédiaire",
      durationHours = 10,
      progressPercent = 0,
      isEnrolled = false,
      isCompleted = false,
      modulesCount = 4,
      rating = 4.9,
      nextSessionFata = null
    )

    viewModel.openCourseDetails(sampleCourse)
    assertNull(viewModel.selectedCourse.value)

    viewModel.login(AppPreferences.DEFAULT_DEMO_EMAIL, "badpass")
    assertFalse(viewModel.isLoggedIn.value)
    assertNotNull(viewModel.loginError.value)

    viewModel.login(AppPreferences.DEFAULT_DEMO_EMAIL, AppPreferences.DEFAULT_DEMO_PASSWORD)
    advanceUntilIdle()
    assertTrue(viewModel.isLoggedIn.value)
    assertNull(viewModel.loginError.value)

    viewModel.openCourseDetails(sampleCourse)
    assertNotNull(viewModel.selectedCourse.value)

    viewModel.logout()
    assertFalse(viewModel.isLoggedIn.value)
    assertNull(viewModel.selectedCourse.value)
  }

  @Test
  fun `ui displays login gate first then earned badges summary after sign in`() = runTest {
    val viewModel = createViewModel()
    advanceUntilIdle()

    composeTestRule.setContent {
      MyApplicationTheme(darkTheme = false) {
        AfricaSkillsApp(viewModel = viewModel, isDarkTheme = false)
      }
    }

    composeTestRule.onNodeWithTag("login_screen").assertIsDisplayed()
    composeTestRule.onNodeWithTag("login_submit_button").performScrollTo().assertIsDisplayed()
    composeTestRule.onNodeWithTag("dashboard_screen_scroll").assertDoesNotExist()

    composeTestRule.onNodeWithTag("fill_demo_credentials_btn").performScrollTo().performClick()
    composeTestRule.onNodeWithTag("login_submit_button").performScrollTo().performClick()
    advanceUntilIdle()
    composeTestRule.waitForIdle()

    composeTestRule.onNodeWithTag("dashboard_screen_scroll").assertIsDisplayed()
    composeTestRule.onNodeWithText("Badges de compétences obtenus").performScrollTo().assertIsDisplayed()
  }
}
