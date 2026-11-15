package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.*
import com.example.data.model.BadgeTier
import com.example.data.model.DomainType
import com.example.ui.components.Button3D
import com.example.ui.components.Surface3D
import com.example.ui.theme.*
import com.example.ui.viewmodel.AppTab

@Composable
fun DashboardScreen(
  profile: UserProfileEntity?,
  courses: List<CourseEntity>,
  badges: List<BadgeEntity>,
  flashcards: List<FlashcardEntity>,
  jobs: List<JobEntity>,
  projects: List<ProjectEntity>,
  onNavigateTab: (AppTab) -> Unit,
  onCourseClick: (CourseEntity) -> Unit,
  onOpenLive: () -> Unit,
  modifier: Modifier = Modifier
) {
  val activeCourses = courses.filter { it.isEnrolled && !it.isCompleted }
  val completedCoursesCount = courses.count { it.isCompleted }
  val earnedBadges = badges.filter { it.isUnlocked }
  val nextLockedBadge = badges.firstOrNull { !it.isUnlocked }

  LazyColumn(
    modifier = modifier
      .fillMaxSize()
      .testTag("dashboard_screen_scroll"),
    contentPadding = PaddingValues(horizontal = 18.dp, vertical = 24.dp),
    verticalArrangement = Arrangement.spacedBy(28.dp)
  ) {
    item {
      Surface3D(
        containerColor = BrandPrimary,
        baseColor = BrandPrimaryDark,
        borderColor = Color.White.copy(alpha = 0.22f),
        depth = 7.dp
      ) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
          verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
              Text(
                text = "Bonjour, ${profile?.fullName?.substringBefore(" ") ?: "Ismaila"}",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                color = Color.White
              )
              Text(
                text = "${profile?.role ?: "Bâtisseur Tech"} • ${profile?.location ?: "Afrique"}",
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.85f)
              )
            }

            if (profile?.isVerified == true) {
              Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White.copy(alpha = 0.18f)
              ) {
                Row(
                  modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                  Icon(
                    imageVector = Icons.Rounded.Verified,
                    contentDescription = "Vérifié",
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                  )
                  Text(
                    text = "Vérifié",
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                  )
                }
              }
            }
          }

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            StatTile3D(
              label = "Points",
              value = "${profile?.points ?: 1850} XP",
              modifier = Modifier.weight(1f)
            )
            StatTile3D(
              label = "Série",
              value = "${profile?.streakDays ?: 14} jours",
              modifier = Modifier.weight(1f)
            )
            StatTile3D(
              label = "Anglais",
              value = "Niveau B1",
              modifier = Modifier.weight(1f)
            )
          }
        }
      }
    }

    item {
      Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text(
              text = "Badges de compétences obtenus",
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
            Text(
              text = "${earnedBadges.size} sur ${badges.size} paliers validés",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
          TextButton(onClick = { onNavigateTab(AppTab.BADGES) }) {
            Text("Tout voir")
          }
        }

        Surface3D(
          depth = 5.dp,
          containerColor = MaterialTheme.colorScheme.surface,
          baseColor = MaterialTheme.colorScheme.outline
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
          ) {
            if (earnedBadges.isEmpty()) {
              Text(
                text = "Aucun badge débloqué.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            } else {
              earnedBadges.forEachIndexed { index, badge ->
                val tierEnum = try {
                  BadgeTier.valueOf(badge.tier)
                } catch (_: Exception) {
                  BadgeTier.BRONZE
                }
                val domain = DomainType.fromId(badge.domainId)

                Row(
                  modifier = Modifier.fillMaxWidth(),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                  Box(modifier = Modifier.padding(bottom = 3.dp)) {
                    Box(
                      modifier = Modifier
                        .size(46.dp)
                        .offset(y = 3.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(tierEnum.badgeColor.copy(alpha = 0.45f))
                    )
                    Box(
                      modifier = Modifier
                        .size(46.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(tierEnum.badgeColor.copy(alpha = 0.16f)),
                      contentAlignment = Alignment.Center
                    ) {
                      Text(
                        text = badge.iconEmoji,
                        color = tierEnum.badgeColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                      )
                    }
                  }

                  Column(modifier = Modifier.weight(1f)) {
                    Text(
                      text = badge.name,
                      style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                      text = "${domain.displayName} • Anglais ${badge.englishRequired}",
                      style = MaterialTheme.typography.bodySmall,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    if (!badge.unlockedDate.isNullOrBlank()) {
                      Text(
                        text = "Obtenu le ${badge.unlockedDate}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary
                      )
                    }
                  }

                  Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primaryContainer
                  ) {
                    Text(
                      text = "Acquis",
                      style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                      color = MaterialTheme.colorScheme.onPrimaryContainer,
                      modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                    )
                  }
                }

                if (index < earnedBadges.lastIndex) {
                  HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
              }
            }

            if (nextLockedBadge != null) {
              val currentPts = profile?.points ?: 1850
              val progress = (currentPts.toFloat() / nextLockedBadge.pointsRequired.toFloat()).coerceIn(0f, 1f)
              HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
              Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Text(
                    text = "Prochain palier : ${nextLockedBadge.name}",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold)
                  )
                  Text(
                    text = "$currentPts / ${nextLockedBadge.pointsRequired} XP",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
                LinearProgressIndicator(
                  progress = { progress },
                  modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                  color = MaterialTheme.colorScheme.secondary,
                  trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
              }
            }
          }
        }
      }
    }

    item {
      Surface3D(
        modifier = Modifier
          .fillMaxWidth()
          .testTag("fata_live_card"),
        depth = 5.dp
      ) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Box(
              modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(Color(0xFFEF4444).copy(alpha = 0.12f)),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Rounded.Videocam,
                contentDescription = null,
                tint = Color(0xFFDC2626),
                modifier = Modifier.size(22.dp)
              )
            }
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = "SESSION FATA EN DIRECT • DEMAIN 18H GMT",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = Color(0xFFDC2626)
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "Architecture Offline-First avec Room",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
              )
              Text(
                text = "Animée par Amina Diallo (Dakar) • 142 inscrits",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }

          Button3D(
            text = "Rejoindre la salle en direct",
            icon = Icons.Rounded.Podcasts,
            containerColor = Color(0xFFDC2626),
            onClick = onOpenLive,
            modifier = Modifier.testTag("join_fata_live_btn")
          )
        }
      }
    }

    item {
      Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text(
              text = "Formations en cours",
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
            Text(
              text = "${courses.size} cours disponibles sur 14 domaines • $completedCoursesCount validés",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
          TextButton(onClick = { onNavigateTab(AppTab.COURSES) }) {
            Text("Catalogue")
          }
        }

        if (activeCourses.isEmpty()) {
          Surface3D(depth = 4.dp) {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
              horizontalAlignment = Alignment.CenterHorizontally,
              verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              Text(
                text = "Aucun cours démarré",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
              )
              TextButton(onClick = { onNavigateTab(AppTab.COURSES) }) {
                Text("Explorer les 14 domaines")
              }
            }
          }
        } else {
          Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
            activeCourses.take(3).forEach { course ->
              val domain = DomainType.fromId(course.domainId)
              Surface3D(
                depth = 5.dp,
                onClick = { onCourseClick(course) }
              ) {
                Column(
                  modifier = Modifier.padding(20.dp),
                  verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Row(
                      verticalAlignment = Alignment.CenterVertically,
                      horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                      Box(
                        modifier = Modifier
                          .size(9.dp)
                          .clip(CircleShape)
                          .background(domain.color)
                      )
                      Text(
                        text = domain.displayName,
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = domain.color
                      )
                    }
                    Text(
                      text = "${course.progressPercent}%",
                      style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                      color = MaterialTheme.colorScheme.primary
                    )
                  }

                  Text(
                    text = course.title,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                  )

                  Text(
                    text = "${course.instructorName} • ${course.durationHours}h • ${course.modulesCount} modules",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )

                  LinearProgressIndicator(
                    progress = { course.progressPercent / 100f },
                    modifier = Modifier
                      .fillMaxWidth()
                      .height(7.dp)
                      .clip(RoundedCornerShape(4.dp)),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                  )
                }
              }
            }
          }
        }
      }
    }

    item {
      Surface3D(depth = 5.dp) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(22.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              Icon(
                imageVector = Icons.Rounded.Translate,
                contentDescription = null,
                tint = DomainEnglish,
                modifier = Modifier.size(22.dp)
              )
              Text(
                text = "Objectif Anglais (3 mois)",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
              )
            }
            Text(
              text = "B1 vers B2",
              style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
              color = DomainEnglish
            )
          }

          LinearProgressIndicator(
            progress = { 0.70f },
            modifier = Modifier
              .fillMaxWidth()
              .height(8.dp)
              .clip(RoundedCornerShape(4.dp)),
            color = DomainEnglish,
            trackColor = DomainEnglish.copy(alpha = 0.14f)
          )

          Text(
            text = "Mois 2 sur 3 • Objectif B2",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }
    }

    item {
      Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(
          text = "Activité et opportunités",
          style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
        )

        QuickShortcutCard3D(
          icon = Icons.Rounded.Style,
          iconTint = MaterialTheme.colorScheme.secondary,
          title = "Révision espacée SM-2",
          subtitle = "${flashcards.size} cartes disponibles",
          onClick = { onNavigateTab(AppTab.FLASHCARDS) }
        )

        QuickShortcutCard3D(
          icon = Icons.Rounded.WorkOutline,
          iconTint = MaterialTheme.colorScheme.primary,
          title = "Offres d'emploi & Incubateur",
          subtitle = "${jobs.size} offres • ${projects.size} projets",
          onClick = { onNavigateTab(AppTab.NETWORK) }
        )

        QuickShortcutCard3D(
          icon = Icons.Rounded.WorkspacePremium,
          iconTint = MaterialTheme.colorScheme.primary,
          title = "Attestations et paliers",
          subtitle = "${earnedBadges.size} badges • Certificats QR",
          onClick = { onNavigateTab(AppTab.BADGES) }
        )
      }
    }

    item {
      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

@Composable
private fun StatTile3D(
  label: String,
  value: String,
  modifier: Modifier = Modifier
) {
  Box(modifier = modifier.padding(bottom = 3.dp)) {
    Box(
      modifier = Modifier
        .matchParentSize()
        .offset(y = 3.dp)
        .clip(RoundedCornerShape(12.dp))
        .background(Color.Black.copy(alpha = 0.2f))
    )
    Surface(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(12.dp),
      color = Color.White.copy(alpha = 0.16f)
    ) {
      Column(
        modifier = Modifier.padding(horizontal = 12.dp, vertical = 12.dp),
        horizontalAlignment = Alignment.Start
      ) {
        Text(
          text = label,
          fontSize = 13.sp,
          color = Color.White.copy(alpha = 0.85f)
        )
        Spacer(modifier = Modifier.height(3.dp))
        Text(
          text = value,
          fontWeight = FontWeight.Bold,
          fontSize = 17.sp,
          color = Color.White
        )
      }
    }
  }
}

@Composable
private fun QuickShortcutCard3D(
  icon: ImageVector,
  iconTint: Color,
  title: String,
  subtitle: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface3D(
    modifier = modifier.fillMaxWidth(),
    depth = 5.dp,
    onClick = onClick
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(20.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      Box(
        modifier = Modifier
          .size(44.dp)
          .clip(RoundedCornerShape(12.dp))
          .background(iconTint.copy(alpha = 0.12f)),
        contentAlignment = Alignment.Center
      ) {
        Icon(
          imageVector = icon,
          contentDescription = null,
          tint = iconTint,
          modifier = Modifier.size(22.dp)
        )
      }
      Column(
        modifier = Modifier.weight(1f),
        verticalArrangement = Arrangement.spacedBy(4.dp)
      ) {
        Text(
          text = title,
          style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
        )
        Text(
          text = subtitle,
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
      Icon(
        imageVector = Icons.AutoMirrored.Rounded.ArrowForward,
        contentDescription = null,
        tint = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.size(18.dp)
      )
    }
  }
}
