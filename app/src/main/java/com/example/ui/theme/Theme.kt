package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
  primary = BrandPrimaryLight,
  onPrimary = Color(0xFF0A0F1E),
  primaryContainer = BrandPrimaryDark,
  onPrimaryContainer = Color(0xFFDBEAFE),
  secondary = BrandSecondaryLight,
  onSecondary = Color(0xFF0A0F1E),
  secondaryContainer = BrandSecondaryDark,
  onSecondaryContainer = Color(0xFFFFEDD5),
  tertiary = DomainData,
  onTertiary = Color.White,
  background = AfricaDarkBackground,
  onBackground = AfricaTextPrimaryDark,
  surface = AfricaDarkSurface,
  onSurface = AfricaTextPrimaryDark,
  surfaceVariant = AfricaDarkCard,
  onSurfaceVariant = AfricaTextSecondaryDark,
  outline = Color(0xFF334155),
  outlineVariant = Color(0xFF1E293B)
)

private val LightColorScheme = lightColorScheme(
  primary = BrandPrimary,
  onPrimary = Color.White,
  primaryContainer = Color(0xFFDBEAFE),
  onPrimaryContainer = BrandPrimaryDark,
  secondary = BrandSecondary,
  onSecondary = Color.White,
  secondaryContainer = Color(0xFFFFEDD5),
  onSecondaryContainer = BrandSecondaryDark,
  tertiary = DomainData,
  onTertiary = Color.White,
  background = AfricaLightBackground,
  onBackground = AfricaTextPrimaryLight,
  surface = AfricaLightSurface,
  onSurface = AfricaTextPrimaryLight,
  surfaceVariant = AfricaLightCard,
  onSurfaceVariant = AfricaTextSecondaryLight,
  outline = Color(0xFFCBD5E1),
  outlineVariant = Color(0xFFE2E8F0)
)

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  val colorScheme = when {
    dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
      val context = LocalContext.current
      if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
    }
    darkTheme -> DarkColorScheme
    else -> LightColorScheme
  }

  MaterialTheme(
    colorScheme = colorScheme,
    typography = Typography,
    content = content
  )
}
