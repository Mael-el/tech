package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.*
import com.example.data.model.DomainType
import com.example.data.repository.AfricaSkillsRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class AppTab(val label: String) {
  DASHBOARD("Accueil"),
  COURSES("Cours"),
  FLASHCARDS("Révision"),
  BADGES("Certifs"),
  NETWORK("Réseau")
}

data class FataLiveState(
  val isOpen: Boolean = false,
  val courseTitle: String = "",
  val instructorName: String = "",
  val viewerCount: Int = 142,
  val isHandRaised: Boolean = false,
  val isMicMuted: Boolean = true,
  val messages: List<Pair<String, String>> = listOf(
    Pair("Amina Diallo (Mentor)", "Bienvenue à tous ! Aujourd'hui nous voyons l'architecture offline avec Room."),
    Pair("Koffi Mensah", "N'hésitez pas à lever la main pour poser vos questions audio."),
    Pair("Fatou Sow", "Présente depuis Dakar."),
    Pair("David Osei", "Hello from Accra! Ready for the session.")
  )
)

data class UiSnackbar(
  val message: String,
  val isError: Boolean = false
)

class AfricaSkillsViewModel(
  private val repository: AfricaSkillsRepository,
  private val preferences: AppPreferences
) : ViewModel() {

  val isLoggedIn: StateFlow<Boolean> = preferences.isLoggedIn
  val themeMode: StateFlow<ThemeMode> = preferences.themeMode

  private val _loginError = MutableStateFlow<String?>(null)
  val loginError: StateFlow<String?> = _loginError.asStateFlow()

  val userProfile: StateFlow<UserProfileEntity?> = repository.userProfile
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

  val allCourses: StateFlow<List<CourseEntity>> = repository.allCourses
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val allFlashcards: StateFlow<List<FlashcardEntity>> = repository.allFlashcards
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val allBadges: StateFlow<List<BadgeEntity>> = repository.allBadges
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val allAttestations: StateFlow<List<AttestationEntity>> = repository.allAttestations
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val allJobs: StateFlow<List<JobEntity>> = repository.allJobs
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val allProjects: StateFlow<List<ProjectEntity>> = repository.allProjects
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  private val _currentTab = MutableStateFlow(AppTab.DASHBOARD)
  val currentTab: StateFlow<AppTab> = _currentTab.asStateFlow()

  private val _isProfileOpen = MutableStateFlow(false)
  val isProfileOpen: StateFlow<Boolean> = _isProfileOpen.asStateFlow()

  private val _selectedDomain = MutableStateFlow<DomainType?>(null)
  val selectedDomain: StateFlow<DomainType?> = _selectedDomain.asStateFlow()

  private val _selectedCourse = MutableStateFlow<CourseEntity?>(null)
  val selectedCourse: StateFlow<CourseEntity?> = _selectedCourse.asStateFlow()

  private val _courseLessons = MutableStateFlow<List<LessonEntity>>(emptyList())
  val courseLessons: StateFlow<List<LessonEntity>> = _courseLessons.asStateFlow()

  private val _activeLesson = MutableStateFlow<LessonEntity?>(null)
  val activeLesson: StateFlow<LessonEntity?> = _activeLesson.asStateFlow()

  private val _quizSelectedOption = MutableStateFlow<Int?>(null)
  val quizSelectedOption: StateFlow<Int?> = _quizSelectedOption.asStateFlow()

  private val _quizSubmitted = MutableStateFlow(false)
  val quizSubmitted: StateFlow<Boolean> = _quizSubmitted.asStateFlow()

  private val _activeFlashcardIndex = MutableStateFlow(0)
  val activeFlashcardIndex: StateFlow<Int> = _activeFlashcardIndex.asStateFlow()

  private val _isCardFlipped = MutableStateFlow(false)
  val isCardFlipped: StateFlow<Boolean> = _isCardFlipped.asStateFlow()

  private val _flashcardDomainFilter = MutableStateFlow<String?>(null)
  val flashcardDomainFilter: StateFlow<String?> = _flashcardDomainFilter.asStateFlow()

  private val _speedQuizActive = MutableStateFlow(false)
  val speedQuizActive: StateFlow<Boolean> = _speedQuizActive.asStateFlow()

  private val _speedQuizSecondsLeft = MutableStateFlow(30)
  val speedQuizSecondsLeft: StateFlow<Int> = _speedQuizSecondsLeft.asStateFlow()

  private val _speedQuizScore = MutableStateFlow(0)
  val speedQuizScore: StateFlow<Int> = _speedQuizScore.asStateFlow()

  private var timerJob: Job? = null

  private val _fataLiveState = MutableStateFlow(FataLiveState())
  val fataLiveState: StateFlow<FataLiveState> = _fataLiveState.asStateFlow()

  private val _paymentModalAttestation = MutableStateFlow<AttestationEntity?>(null)
  val paymentModalAttestation: StateFlow<AttestationEntity?> = _paymentModalAttestation.asStateFlow()

  private val _selectedPaymentProvider = MutableStateFlow("MTN Mobile Money")
  val selectedPaymentProvider: StateFlow<String> = _selectedPaymentProvider.asStateFlow()

  private val _phoneNumberInput = MutableStateFlow("97 00 00 14")
  val phoneNumberInput: StateFlow<String> = _phoneNumberInput.asStateFlow()

  private val _isProcessingPayment = MutableStateFlow(false)
  val isProcessingPayment: StateFlow<Boolean> = _isProcessingPayment.asStateFlow()

  private val _viewingCertificate = MutableStateFlow<AttestationEntity?>(null)
  val viewingCertificate: StateFlow<AttestationEntity?> = _viewingCertificate.asStateFlow()

  private val _activeChatDomain = MutableStateFlow(DomainType.DEVELOPPEMENT)
  val activeChatDomain: StateFlow<DomainType> = _activeChatDomain.asStateFlow()

  val domainChatMessages: StateFlow<List<CommunityMessageEntity>> = _activeChatDomain
    .flatMapLatest { domain -> repository.getMessagesForDomain(domain.id) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  private val _snackbarEvent = MutableSharedFlow<UiSnackbar>()
  val snackbarEvent: SharedFlow<UiSnackbar> = _snackbarEvent.asSharedFlow()

  init {
    viewModelScope.launch {
      repository.ensureInitialDataSeeded()
    }
  }

  fun clearLoginError() {
    _loginError.value = null
  }

  fun login(email: String, password: String) {
    val cleanEmail = email.trim()
    if (cleanEmail.isBlank() || !cleanEmail.contains("@")) {
      _loginError.value = "Veuillez saisir une adresse e-mail valide."
      return
    }
    if (password.length < 6) {
      _loginError.value = "Le mot de passe doit contenir au moins 6 caractères."
      return
    }
    if (!preferences.validateCredentials(cleanEmail, password)) {
      _loginError.value = "Identifiants incorrects. Vérifiez votre e-mail ou mot de passe."
      return
    }
    _loginError.value = null
    preferences.login(cleanEmail)
    _currentTab.value = AppTab.DASHBOARD
  }

  fun registerAccount(fullName: String, email: String, password: String, city: String) {
    val cleanName = fullName.trim()
    val cleanEmail = email.trim()
    val cleanCity = city.trim().ifEmpty { "Cotonou, Bénin" }

    if (cleanName.length < 2) {
      _loginError.value = "Veuillez entrer votre nom complet."
      return
    }
    if (!cleanEmail.contains("@") || !cleanEmail.contains(".")) {
      _loginError.value = "Veuillez saisir une adresse e-mail valide."
      return
    }
    if (password.length < 6) {
      _loginError.value = "Le mot de passe doit contenir au moins 6 caractères."
      return
    }

    _loginError.value = null
    viewModelScope.launch {
      repository.updateProfileIdentity(cleanName, cleanEmail, cleanCity)
      preferences.registerAccount(cleanEmail, password)
      _currentTab.value = AppTab.DASHBOARD
    }
  }

  fun logout() {
    _isProfileOpen.value = false
    _activeLesson.value = null
    _selectedCourse.value = null
    _loginError.value = null
    preferences.logout()
  }

  fun toggleTheme(currentlyDark: Boolean) {
    preferences.toggleLightDark(currentlyDark)
  }

  fun setThemeMode(mode: ThemeMode) {
    preferences.setThemeMode(mode)
  }

  fun setTab(tab: AppTab) {
    _isProfileOpen.value = false
    _currentTab.value = tab
  }

  fun openProfile() {
    _isProfileOpen.value = true
  }

  fun closeProfile() {
    _isProfileOpen.value = false
  }

  fun setSelectedDomain(domain: DomainType?) {
    _selectedDomain.value = domain
  }

  private var lessonsJob: Job? = null

  fun openCourseDetails(course: CourseEntity) {
    if (!preferences.isLoggedIn.value) return
    _selectedCourse.value = course
    lessonsJob?.cancel()
    lessonsJob = viewModelScope.launch {
      repository.getLessonsForCourse(course.id).collect { lessons ->
        _courseLessons.value = lessons
      }
    }
  }

  fun closeCourseDetails() {
    _selectedCourse.value = null
    _activeLesson.value = null
  }

  fun openLesson(lesson: LessonEntity) {
    if (!preferences.isLoggedIn.value) return
    _activeLesson.value = lesson
    _quizSelectedOption.value = null
    _quizSubmitted.value = false
  }

  fun closeLesson() {
    _activeLesson.value = null
  }

  fun selectQuizOption(index: Int) {
    if (!_quizSubmitted.value) {
      _quizSelectedOption.value = index
    }
  }

  fun submitQuizAnswer() {
    if (!preferences.isLoggedIn.value) return
    val lesson = _activeLesson.value ?: return
    val selected = _quizSelectedOption.value ?: return
    _quizSubmitted.value = true

    val isCorrect = (selected == lesson.quizCorrectIndex)
    viewModelScope.launch {
      if (isCorrect) {
        repository.completeLesson(lesson.id, lesson.courseId, earnedPoints = 50)
        _snackbarEvent.emit(UiSnackbar("Réponse correcte (+50 XP)"))
      } else {
        _snackbarEvent.emit(UiSnackbar("Consultez l'explication ci-dessous et réessayez.", isError = true))
      }
    }
  }

  fun enrollInCourse(courseId: String) {
    if (!preferences.isLoggedIn.value) return
    viewModelScope.launch {
      repository.enrollCourse(courseId)
      _snackbarEvent.emit(UiSnackbar("Inscription au cours confirmée."))
    }
  }

  fun setFlashcardDomainFilter(domainId: String?) {
    _flashcardDomainFilter.value = domainId
    _activeFlashcardIndex.value = 0
    _isCardFlipped.value = false
  }

  fun flipCard() {
    _isCardFlipped.value = !_isCardFlipped.value
  }

  fun submitCardReview(card: FlashcardEntity, quality: Int) {
    viewModelScope.launch {
      repository.processFlashcardReview(card, quality)
      val feedback = when (quality) {
        0 -> "Carte reportée pour révision immédiate."
        2 -> "Répétition planifiée (+15 XP)."
        4 -> "Intervalle augmenté (+15 XP)."
        else -> "Notion maîtrisée (+15 XP)."
      }
      _snackbarEvent.emit(UiSnackbar(feedback))

      _isCardFlipped.value = false
      val cards = allFlashcards.value
      if (cards.isNotEmpty()) {
        _activeFlashcardIndex.value = (_activeFlashcardIndex.value + 1) % cards.size
      }
    }
  }

  fun nextFlashcard() {
    val cards = allFlashcards.value
    if (cards.isNotEmpty()) {
      _activeFlashcardIndex.value = (_activeFlashcardIndex.value + 1) % cards.size
      _isCardFlipped.value = false
    }
  }

  fun previousFlashcard() {
    val cards = allFlashcards.value
    if (cards.isNotEmpty()) {
      _activeFlashcardIndex.value = if (_activeFlashcardIndex.value > 0) _activeFlashcardIndex.value - 1 else cards.size - 1
      _isCardFlipped.value = false
    }
  }

  fun startSpeedQuiz() {
    _speedQuizActive.value = true
    _speedQuizSecondsLeft.value = 30
    _speedQuizScore.value = 0
    timerJob?.cancel()
    timerJob = viewModelScope.launch {
      for (i in 30 downTo 1) {
        _speedQuizSecondsLeft.value = i
        delay(1000)
      }
      _speedQuizSecondsLeft.value = 0
      _speedQuizActive.value = false
      _snackbarEvent.emit(UiSnackbar("Chrono terminé — Score : ${_speedQuizScore.value} points"))
    }
  }

  fun answerSpeedQuiz(isCorrect: Boolean) {
    if (isCorrect) {
      _speedQuizScore.value += 10
    }
    nextFlashcard()
  }

  fun openFataLive(courseTitle: String, instructor: String) {
    _fataLiveState.value = _fataLiveState.value.copy(
      isOpen = true,
      courseTitle = courseTitle,
      instructorName = instructor,
      isHandRaised = false
    )
  }

  fun closeFataLive() {
    _fataLiveState.value = _fataLiveState.value.copy(isOpen = false)
  }

  fun toggleHandRaise() {
    val currentState = _fataLiveState.value
    val newHand = !currentState.isHandRaised
    _fataLiveState.value = currentState.copy(isHandRaised = newHand)
    viewModelScope.launch {
      if (newHand) {
        _snackbarEvent.emit(UiSnackbar("Main levée : le mentor a reçu votre demande."))
      } else {
        _snackbarEvent.emit(UiSnackbar("Main baissée."))
      }
    }
  }

  fun sendFataLiveMessage(text: String) {
    if (text.isBlank()) return
    val currentMessages = _fataLiveState.value.messages.toMutableList()
    currentMessages.add(Pair("Vous", text))
    _fataLiveState.value = _fataLiveState.value.copy(messages = currentMessages)
  }

  fun openPaymentModal(attestation: AttestationEntity) {
    _paymentModalAttestation.value = attestation
    _selectedPaymentProvider.value = "MTN Mobile Money"
  }

  fun closePaymentModal() {
    _paymentModalAttestation.value = null
  }

  fun setPaymentProvider(provider: String) {
    _selectedPaymentProvider.value = provider
  }

  fun setPhoneNumber(number: String) {
    _phoneNumberInput.value = number
  }

  fun confirmPayment() {
    val attestation = _paymentModalAttestation.value ?: return
    viewModelScope.launch {
      _isProcessingPayment.value = true
      delay(1200)
      repository.payAttestation(attestation.id, _selectedPaymentProvider.value)
      _isProcessingPayment.value = false
      _paymentModalAttestation.value = null
      _snackbarEvent.emit(UiSnackbar("Paiement validé via ${_selectedPaymentProvider.value}. Attestation débloquée."))
    }
  }

  fun openCertificateView(attestation: AttestationEntity) {
    _viewingCertificate.value = attestation
  }

  fun closeCertificateView() {
    _viewingCertificate.value = null
  }

  fun applyToJob(job: JobEntity) {
    viewModelScope.launch {
      repository.applyToJob(job.id)
      _snackbarEvent.emit(UiSnackbar("Candidature envoyée à ${job.companyName} avec votre profil AfricaSkills."))
    }
  }

  fun setActiveChatDomain(domain: DomainType) {
    _activeChatDomain.value = domain
  }

  fun sendChatMessage(text: String) {
    if (text.isBlank()) return
    val name = userProfile.value?.fullName ?: "Apprenant"
    viewModelScope.launch {
      repository.sendCommunityMessage(_activeChatDomain.value.id, text, name)
    }
  }

  fun updateProjectKanban(projectId: String, newStatus: String) {
    viewModelScope.launch {
      repository.updateProjectStatus(projectId, newStatus)
      _snackbarEvent.emit(UiSnackbar("Statut du projet mis à jour : $newStatus"))
    }
  }
}
