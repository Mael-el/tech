package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Login
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.AppPreferences
import com.example.ui.components.Button3D
import com.example.ui.components.Surface3D
import com.example.ui.components.ThemeToggleButton
import com.example.ui.theme.BrandPrimary
import com.example.ui.theme.BrandPrimaryDark

@Composable
fun LoginScreen(
  isDarkTheme: Boolean,
  errorMessage: String?,
  onToggleTheme: () -> Unit,
  onClearError: () -> Unit,
  onLogin: (email: String, password: String) -> Unit,
  onRegister: (fullName: String, email: String, password: String, city: String) -> Unit,
  modifier: Modifier = Modifier
) {
  var isSignUpMode by remember { mutableStateOf(false) }
  var fullName by remember { mutableStateOf("") }
  var city by remember { mutableStateOf("") }
  var email by remember { mutableStateOf("") }
  var password by remember { mutableStateOf("") }
  var passwordVisible by remember { mutableStateOf(false) }

  Column(
    modifier = modifier
      .fillMaxSize()
      .testTag("login_screen")
      .background(MaterialTheme.colorScheme.background)
      .systemBarsPadding()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 20.dp, vertical = 20.dp),
    verticalArrangement = Arrangement.spacedBy(24.dp)
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        Box(modifier = Modifier.padding(bottom = 4.dp)) {
          Box(
            modifier = Modifier
              .size(44.dp)
              .offset(y = 4.dp)
              .clip(RoundedCornerShape(12.dp))
              .background(BrandPrimaryDark)
          )
          Box(
            modifier = Modifier
              .size(44.dp)
              .clip(RoundedCornerShape(12.dp))
              .background(
                Brush.linearGradient(listOf(BrandPrimary, Color(0xFF2563EB)))
              ),
            contentAlignment = Alignment.Center
          ) {
            Text(
              text = "AS",
              color = Color.White,
              fontWeight = FontWeight.Bold,
              fontSize = 17.sp
            )
          }
        }
        Column {
          Text(
            text = "AfricaSkills",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
          )
          Text(
            text = "Formation, Certification & Emploi",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }

      ThemeToggleButton(
        isDarkTheme = isDarkTheme,
        onToggleTheme = onToggleTheme
      )
    }

    Surface3D(
      containerColor = BrandPrimary,
      baseColor = BrandPrimaryDark,
      borderColor = Color.White.copy(alpha = 0.2f),
      depth = 6.dp
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Icon(
            imageVector = Icons.Rounded.Lock,
            contentDescription = null,
            tint = Color.White,
            modifier = Modifier.size(20.dp)
          )
          Text(
            text = "Accès membres",
            style = MaterialTheme.typography.labelLarge,
            color = Color.White.copy(alpha = 0.9f)
          )
        }
        Text(
          text = if (isSignUpMode) "Rejoignez l'académie" else "Connectez-vous à vos formations",
          style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
          color = Color.White
        )
      }
    }

    Surface3D(
      depth = 6.dp,
      containerColor = MaterialTheme.colorScheme.surface,
      baseColor = MaterialTheme.colorScheme.outline
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          FilterChip(
            selected = !isSignUpMode,
            onClick = {
              isSignUpMode = false
              onClearError()
            },
            label = { Text("Se connecter") },
            modifier = Modifier.weight(1f)
          )
          FilterChip(
            selected = isSignUpMode,
            onClick = {
              isSignUpMode = true
              onClearError()
            },
            label = { Text("Créer un compte") },
            modifier = Modifier.weight(1f)
          )
        }

        if (isSignUpMode) {
          OutlinedTextField(
            value = fullName,
            onValueChange = {
              fullName = it
              onClearError()
            },
            label = { Text("Nom complet") },
            leadingIcon = { Icon(Icons.Rounded.Person, contentDescription = null) },
            modifier = Modifier
              .fillMaxWidth()
              .testTag("register_name_input"),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
          )

          OutlinedTextField(
            value = city,
            onValueChange = { city = it },
            label = { Text("Ville & Pays (ex. Cotonou, Bénin)") },
            leadingIcon = { Icon(Icons.Rounded.LocationOn, contentDescription = null) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
          )
        }

        OutlinedTextField(
          value = email,
          onValueChange = {
            email = it
            onClearError()
          },
          label = { Text("Adresse e-mail") },
          leadingIcon = { Icon(Icons.Rounded.Email, contentDescription = null) },
          keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("login_email_input"),
          singleLine = true,
          shape = RoundedCornerShape(12.dp)
        )

        OutlinedTextField(
          value = password,
          onValueChange = {
            password = it
            onClearError()
          },
          label = { Text("Mot de passe") },
          leadingIcon = { Icon(Icons.Rounded.Password, contentDescription = null) },
          trailingIcon = {
            IconButton(onClick = { passwordVisible = !passwordVisible }) {
              Icon(
                imageVector = if (passwordVisible) Icons.Rounded.VisibilityOff else Icons.Rounded.Visibility,
                contentDescription = if (passwordVisible) "Masquer" else "Afficher"
              )
            }
          },
          visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
          keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("login_password_input"),
          singleLine = true,
          shape = RoundedCornerShape(12.dp)
        )

        if (!errorMessage.isNullOrBlank()) {
          Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            color = MaterialTheme.colorScheme.errorContainer,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.4f))
          ) {
            Row(
              modifier = Modifier.padding(12.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Icon(
                imageVector = Icons.Rounded.ErrorOutline,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error,
                modifier = Modifier.size(18.dp)
              )
              Text(
                text = errorMessage,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onErrorContainer
              )
            }
          }
        }

        Button3D(
          text = if (isSignUpMode) "Créer mon compte et accéder" else "Se connecter",
          icon = Icons.AutoMirrored.Rounded.Login,
          onClick = {
            if (isSignUpMode) {
              onRegister(fullName, email, password, city)
            } else {
              onLogin(email, password)
            }
          },
          modifier = Modifier
            .fillMaxWidth()
            .testTag("login_submit_button")
        )
      }
    }

    if (!isSignUpMode) {
      Surface3D(
        depth = 4.dp,
        containerColor = MaterialTheme.colorScheme.surfaceVariant,
        baseColor = MaterialTheme.colorScheme.outline
      ) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Text(
            text = "Compte de démonstration",
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
          )
          Text(
            text = "E-mail : ${AppPreferences.DEFAULT_DEMO_EMAIL}\nMot de passe : ${AppPreferences.DEFAULT_DEMO_PASSWORD}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
          OutlinedButton(
            onClick = {
              email = AppPreferences.DEFAULT_DEMO_EMAIL
              password = AppPreferences.DEFAULT_DEMO_PASSWORD
              onClearError()
            },
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.testTag("fill_demo_credentials_btn")
          ) {
            Text("Pré-remplir ces identifiants")
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(24.dp))
  }
}
