package com.example.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.*
import com.example.ui.screens.*
import com.example.ui.viewmodel.AfricaSkillsViewModel
import com.example.ui.viewmodel.AppTab
import kotlinx.coroutines.flow.collectLatest

@Composable
fun AfricaSkillsApp(
  viewModel: AfricaSkillsViewModel,
  isDarkTheme: Boolean,
  modifier: Modifier = Modifier
) {
  val isLoggedIn by viewModel.isLoggedIn.collectAsStateWithLifecycle()
  val loginError by viewModel.loginError.collectAsStateWithLifecycle()

  if (!isLoggedIn) {
    LoginScreen(
      isDarkTheme = isDarkTheme,
      errorMessage = loginError,
      onToggleTheme = { viewModel.toggleTheme(isDarkTheme) },
      onClearError = { viewModel.clearLoginError() },
      onLogin = { email, password -> viewModel.login(email, password) },
      onRegister = { name, email, password, city -> viewModel.registerAccount(name, email, password, city) },
      modifier = modifier
    )
    return
  }

  val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
  val allCourses by viewModel.allCourses.collectAsStateWithLifecycle()
  val allFlashcards by viewModel.allFlashcards.collectAsStateWithLifecycle()
  val allBadges by viewModel.allBadges.collectAsStateWithLifecycle()
  val allAttestations by viewModel.allAttestations.collectAsStateWithLifecycle()
  val allJobs by viewModel.allJobs.collectAsStateWithLifecycle()
  val allProjects by viewModel.allProjects.collectAsStateWithLifecycle()

  val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
  val isProfileOpen by viewModel.isProfileOpen.collectAsStateWithLifecycle()
  val selectedDomain by viewModel.selectedDomain.collectAsStateWithLifecycle()
  val selectedCourse by viewModel.selectedCourse.collectAsStateWithLifecycle()
  val courseLessons by viewModel.courseLessons.collectAsStateWithLifecycle()
  val activeLesson by viewModel.activeLesson.collectAsStateWithLifecycle()
  val quizSelectedOption by viewModel.quizSelectedOption.collectAsStateWithLifecycle()
  val quizSubmitted by viewModel.quizSubmitted.collectAsStateWithLifecycle()

  val activeFlashcardIndex by viewModel.activeFlashcardIndex.collectAsStateWithLifecycle()
  val isCardFlipped by viewModel.isCardFlipped.collectAsStateWithLifecycle()
  val flashcardDomainFilter by viewModel.flashcardDomainFilter.collectAsStateWithLifecycle()
  val speedQuizActive by viewModel.speedQuizActive.collectAsStateWithLifecycle()
  val speedQuizSecondsLeft by viewModel.speedQuizSecondsLeft.collectAsStateWithLifecycle()
  val speedQuizScore by viewModel.speedQuizScore.collectAsStateWithLifecycle()

  val fataLiveState by viewModel.fataLiveState.collectAsStateWithLifecycle()
  val paymentAttestation by viewModel.paymentModalAttestation.collectAsStateWithLifecycle()
  val selectedPaymentProvider by viewModel.selectedPaymentProvider.collectAsStateWithLifecycle()
  val phoneNumberInput by viewModel.phoneNumberInput.collectAsStateWithLifecycle()
  val isProcessingPayment by viewModel.isProcessingPayment.collectAsStateWithLifecycle()
  val viewingCertificate by viewModel.viewingCertificate.collectAsStateWithLifecycle()

  val activeChatDomain by viewModel.activeChatDomain.collectAsStateWithLifecycle()
  val domainChatMessages by viewModel.domainChatMessages.collectAsStateWithLifecycle()

  val snackbarHostState = remember { SnackbarHostState() }

  LaunchedEffect(Unit) {
    viewModel.snackbarEvent.collectLatest { event ->
      snackbarHostState.showSnackbar(
        message = event.message,
        duration = SnackbarDuration.Short
      )
    }
  }

  Scaffold(
    modifier = modifier.fillMaxSize(),
    topBar = {
      if (activeLesson == null) {
        AfricaSkillsTopBar(
          profile = userProfile,
          isProfileOpen = isProfileOpen,
          isDarkTheme = isDarkTheme,
          onToggleTheme = { viewModel.toggleTheme(isDarkTheme) },
          onBackFromProfile = { viewModel.closeProfile() },
          onProfileClick = { viewModel.openProfile() },
          onOpenLive = { viewModel.openFataLive("Architecture Logicielle & Offline-First", "Amina Diallo") }
        )
      }
    },
    bottomBar = {
      if (activeLesson == null && !isProfileOpen) {
        AfricaSkillsBottomBar(
          currentTab = currentTab,
          onTabSelected = { viewModel.setTab(it) }
        )
      }
    },
    snackbarHost = { SnackbarHost(snackbarHostState) }
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
    ) {
      when {
        activeLesson != null -> {
          LessonViewerScreen(
            lesson = activeLesson!!,
            selectedOption = quizSelectedOption,
            isSubmitted = quizSubmitted,
            onSelectOption = { viewModel.selectQuizOption(it) },
            onSubmitQuiz = { viewModel.submitQuizAnswer() },
            onCloseLesson = { viewModel.closeLesson() }
          )
        }

        isProfileOpen -> {
          ProfileScreen(
            profile = userProfile,
            isDarkTheme = isDarkTheme,
            onToggleTheme = { viewModel.toggleTheme(isDarkTheme) },
            onLogout = { viewModel.logout() },
            onBack = { viewModel.closeProfile() }
          )
        }

        else -> {
          when (currentTab) {
            AppTab.DASHBOARD -> {
              DashboardScreen(
                profile = userProfile,
                courses = allCourses,
                badges = allBadges,
                flashcards = allFlashcards,
                jobs = allJobs,
                projects = allProjects,
                onNavigateTab = { viewModel.setTab(it) },
                onCourseClick = { viewModel.openCourseDetails(it) },
                onOpenLive = { viewModel.openFataLive("Architecture Logicielle & Offline-First", "Amina Diallo") }
              )
            }

            AppTab.COURSES -> {
              DomainsAndCoursesScreen(
                courses = allCourses,
                selectedDomain = selectedDomain,
                selectedCourse = selectedCourse,
                courseLessons = courseLessons,
                onDomainSelect = { viewModel.setSelectedDomain(it) },
                onCourseClick = { viewModel.openCourseDetails(it) },
                onCloseCourseDetails = { viewModel.closeCourseDetails() },
                onOpenLesson = { viewModel.openLesson(it) },
                onEnroll = { viewModel.enrollInCourse(it) },
                onOpenFataLive = { title, instructor -> viewModel.openFataLive(title, instructor) }
              )
            }

            AppTab.FLASHCARDS -> {
              FlashcardsScreen(
                flashcards = allFlashcards,
                currentIndex = activeFlashcardIndex,
                isFlipped = isCardFlipped,
                domainFilter = flashcardDomainFilter,
                speedQuizActive = speedQuizActive,
                speedQuizSecondsLeft = speedQuizSecondsLeft,
                speedQuizScore = speedQuizScore,
                onFlipCard = { viewModel.flipCard() },
                onSubmitReview = { card, q -> viewModel.submitCardReview(card, q) },
                onNextCard = { viewModel.nextFlashcard() },
                onPrevCard = { viewModel.previousFlashcard() },
                onFilterDomain = { viewModel.setFlashcardDomainFilter(it) },
                onStartSpeedQuiz = { viewModel.startSpeedQuiz() },
                onAnswerSpeedQuiz = { viewModel.answerSpeedQuiz(it) }
              )
            }

            AppTab.BADGES -> {
              BadgesAndCertificatesScreen(
                profile = userProfile,
                badges = allBadges,
                attestations = allAttestations,
                onPayAttestation = { viewModel.openPaymentModal(it) },
                onViewCertificate = { viewModel.openCertificateView(it) }
              )
            }

            AppTab.NETWORK -> {
              NetworkScreen(
                jobs = allJobs,
                projects = allProjects,
                activeDomain = activeChatDomain,
                messages = domainChatMessages,
                onApplyJob = { viewModel.applyToJob(it) },
                onUpdateProjectStatus = { id, s -> viewModel.updateProjectKanban(id, s) },
                onSelectDomain = { viewModel.setActiveChatDomain(it) },
                onSendMessage = { viewModel.sendChatMessage(it) }
              )
            }
          }
        }
      }
    }
  }

  if (fataLiveState.isOpen) {
    FataLiveDialog(
      state = fataLiveState,
      onClose = { viewModel.closeFataLive() },
      onToggleHand = { viewModel.toggleHandRaise() },
      onSendMessage = { viewModel.sendFataLiveMessage(it) }
    )
  }

  if (paymentAttestation != null) {
    MobileMoneyPaymentDialog(
      attestation = paymentAttestation!!,
      selectedProvider = selectedPaymentProvider,
      phoneNumber = phoneNumberInput,
      isProcessing = isProcessingPayment,
      onSelectProvider = { viewModel.setPaymentProvider(it) },
      onPhoneNumberChange = { viewModel.setPhoneNumber(it) },
      onConfirm = { viewModel.confirmPayment() },
      onDismiss = { viewModel.closePaymentModal() }
    )
  }

  if (viewingCertificate != null) {
    OfficialCertificateDialog(
      attestation = viewingCertificate!!,
      onDismiss = { viewModel.closeCertificateView() }
    )
  }
}
