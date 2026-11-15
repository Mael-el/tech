package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.AfricaSkillsDatabase
import com.example.data.local.AppPreferences
import com.example.data.local.ThemeMode
import com.example.data.repository.AfricaSkillsRepository
import com.example.ui.AfricaSkillsApp
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.AfricaSkillsViewModel

class MainActivity : ComponentActivity() {

  private val viewModel: AfricaSkillsViewModel by viewModels {
    object : ViewModelProvider.Factory {
      @Suppress("UNCHECKED_CAST")
      override fun <T : ViewModel> create(modelClass: Class<T>): T {
        val database = AfricaSkillsDatabase.getDatabase(applicationContext)
        val repository = AfricaSkillsRepository(database.africaSkillsDao())
        val preferences = AppPreferences(applicationContext)
        return AfricaSkillsViewModel(repository, preferences) as T
      }
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      val themeMode by viewModel.themeMode.collectAsStateWithLifecycle()
      val systemDark = isSystemInDarkTheme()
      val isDarkTheme = when (themeMode) {
        ThemeMode.DARK -> true
        ThemeMode.LIGHT -> false
        ThemeMode.SYSTEM -> systemDark
      }

      MyApplicationTheme(darkTheme = isDarkTheme) {
        Surface(modifier = Modifier.fillMaxSize()) {
          AfricaSkillsApp(
            viewModel = viewModel,
            isDarkTheme = isDarkTheme
          )
        }
      }
    }
  }
}
