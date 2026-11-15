package com.example.data.local

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class ThemeMode {
  SYSTEM, LIGHT, DARK
}

class AppPreferences(context: Context) {
  private val prefs = context.getSharedPreferences("africaskills_prefs", Context.MODE_PRIVATE)

  private val _isLoggedIn = MutableStateFlow(prefs.getBoolean(KEY_IS_LOGGED_IN, false))
  val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

  private val _themeMode = MutableStateFlow(readThemeMode())
  val themeMode: StateFlow<ThemeMode> = _themeMode.asStateFlow()

  private val _registeredEmail = MutableStateFlow(prefs.getString(KEY_EMAIL, DEFAULT_DEMO_EMAIL) ?: DEFAULT_DEMO_EMAIL)
  val registeredEmail: StateFlow<String> = _registeredEmail.asStateFlow()

  private fun readThemeMode(): ThemeMode {
    val raw = prefs.getString(KEY_THEME_MODE, ThemeMode.LIGHT.name)
    return try {
      ThemeMode.valueOf(raw ?: ThemeMode.LIGHT.name)
    } catch (_: Exception) {
      ThemeMode.LIGHT
    }
  }

  fun setThemeMode(mode: ThemeMode) {
    prefs.edit().putString(KEY_THEME_MODE, mode.name).apply()
    _themeMode.value = mode
  }

  fun toggleLightDark(currentlyDark: Boolean) {
    val next = if (currentlyDark) ThemeMode.LIGHT else ThemeMode.DARK
    setThemeMode(next)
  }

  fun login(email: String) {
    prefs.edit()
      .putBoolean(KEY_IS_LOGGED_IN, true)
      .putString(KEY_EMAIL, email.trim().lowercase())
      .apply()
    _registeredEmail.value = email.trim().lowercase()
    _isLoggedIn.value = true
  }

  fun registerAccount(email: String, password: String) {
    prefs.edit()
      .putString(KEY_EMAIL, email.trim().lowercase())
      .putString(KEY_PASSWORD, password)
      .putBoolean(KEY_IS_LOGGED_IN, true)
      .apply()
    _registeredEmail.value = email.trim().lowercase()
    _isLoggedIn.value = true
  }

  fun validateCredentials(email: String, password: String): Boolean {
    val cleanEmail = email.trim().lowercase()
    val savedEmail = (prefs.getString(KEY_EMAIL, DEFAULT_DEMO_EMAIL) ?: DEFAULT_DEMO_EMAIL).lowercase()
    val savedPassword = prefs.getString(KEY_PASSWORD, DEFAULT_DEMO_PASSWORD) ?: DEFAULT_DEMO_PASSWORD
    return (cleanEmail == savedEmail && password == savedPassword) ||
      (cleanEmail == DEFAULT_DEMO_EMAIL && password == DEFAULT_DEMO_PASSWORD)
  }

  fun logout() {
    prefs.edit().putBoolean(KEY_IS_LOGGED_IN, false).apply()
    _isLoggedIn.value = false
  }

  companion object {
    private const val KEY_IS_LOGGED_IN = "is_logged_in"
    private const val KEY_THEME_MODE = "theme_mode"
    private const val KEY_EMAIL = "user_email"
    private const val KEY_PASSWORD = "user_password"

    const val DEFAULT_DEMO_EMAIL = "ismaila@africaskills.org"
    const val DEFAULT_DEMO_PASSWORD = "Africa2026"
  }
}
