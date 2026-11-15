package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Logout
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.LocationOn
import androidx.compose.material.icons.rounded.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.UserProfileEntity
import com.example.ui.components.Button3D
import com.example.ui.components.Surface3D

@Composable
fun ProfileScreen(
  profile: UserProfileEntity?,
  isDarkTheme: Boolean,
  onToggleTheme: () -> Unit,
  onLogout: () -> Unit,
  onBack: () -> Unit,
  modifier: Modifier = Modifier
) {
  BackHandler(onBack = onBack)

  var notificationsEnabled by remember { mutableStateOf(true) }
  var smsAlertsEnabled by remember { mutableStateOf(true) }

  val initials = (profile?.fullName ?: "Ismaila Gohoundje")
    .split(" ")
    .filter { it.isNotBlank() }
    .take(2)
    .joinToString("") { it.first().uppercaseChar().toString() }

  Column(
    modifier = modifier
      .fillMaxSize()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 18.dp, vertical = 24.dp),
    verticalArrangement = Arrangement.spacedBy(24.dp)
  ) {
    Surface3D(depth = 6.dp) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Box(
          modifier = Modifier
            .size(76.dp)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.primary),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = initials,
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 26.sp
          )
        }

        Spacer(modifier = Modifier.height(14.dp))

        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Text(
            text = profile?.fullName ?: "Ismaila Gohoundje",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
          )
          if (profile?.isVerified == true) {
            Icon(
              imageVector = Icons.Rounded.Verified,
              contentDescription = "Vérifié",
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Text(
          text = profile?.role ?: "Bâtisseur Tech & Innovateur",
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.primary,
          fontWeight = FontWeight.Medium
        )

        Spacer(modifier = Modifier.height(6.dp))

        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          Icon(
            imageVector = Icons.Rounded.LocationOn,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(16.dp)
          )
          Text(
            text = profile?.location ?: "Cotonou, Bénin",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
          text = profile?.bio ?: "Ingénieur logiciel orienté systèmes hors-ligne et entrepreneuriat numérique.",
          style = MaterialTheme.typography.bodySmall,
          textAlign = TextAlign.Center,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    }

    Surface3D(depth = 5.dp) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(20.dp),
        horizontalArrangement = Arrangement.SpaceAround
      ) {
        ProfileStat("${profile?.points ?: 1850}", "XP")
        ProfileStat("${profile?.completedCoursesCount ?: 9}", "Cours")
        ProfileStat("${profile?.publishedProjectsCount ?: 2}", "Projets")
        ProfileStat("${profile?.streakDays ?: 14}j", "Série")
      }
    }

    Surface3D(depth = 5.dp) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        Text("Compétences certifiées", fontWeight = FontWeight.Bold, fontSize = 17.sp)

        val skills = listOf(
          "Kotlin & Android Compose",
          "Architecture Offline-First (Room)",
          "Anglais Professionnel (B1)",
          "Intégration FedaPay / KkiaPay",
          "Cybersécurité APIs Mobile"
        )

        skills.forEach { skill ->
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Icon(
              imageVector = Icons.Rounded.Check,
              contentDescription = null,
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(18.dp)
            )
            Text(skill, fontSize = 15.sp)
          }
        }
      }
    }

    Surface3D(depth = 5.dp) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        Text("Apparence & Préférences", fontWeight = FontWeight.Bold, fontSize = 17.sp)

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("Mode sombre", fontSize = 15.sp, fontWeight = FontWeight.Medium)
          Switch(
            checked = isDarkTheme,
            onCheckedChange = { onToggleTheme() },
            modifier = Modifier.testTag("profile_dark_mode_switch")
          )
        }

        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("Devise", fontSize = 15.sp)
          Text(
            "Franc CFA (XOF / XAF)",
            fontWeight = FontWeight.SemiBold,
            fontSize = 15.sp,
            color = MaterialTheme.colorScheme.primary
          )
        }

        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("Rappels SM-2", fontSize = 15.sp)
          Switch(
            checked = notificationsEnabled,
            onCheckedChange = { notificationsEnabled = it }
          )
        }

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text("Alertes SMS", fontSize = 15.sp)
          Switch(
            checked = smsAlertsEnabled,
            onCheckedChange = { smsAlertsEnabled = it }
          )
        }
      }
    }

    Button3D(
      text = "Se déconnecter",
      icon = Icons.AutoMirrored.Rounded.Logout,
      containerColor = Color(0xFFDC2626),
      onClick = onLogout,
      modifier = Modifier
        .fillMaxWidth()
        .testTag("logout_button")
    )

    Spacer(modifier = Modifier.height(24.dp))
  }
}

@Composable
private fun ProfileStat(value: String, label: String) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Text(value, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = MaterialTheme.colorScheme.primary)
    Text(label, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
  }
}
