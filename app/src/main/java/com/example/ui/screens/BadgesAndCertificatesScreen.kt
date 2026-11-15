package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.AttestationEntity
import com.example.data.local.BadgeEntity
import com.example.data.local.UserProfileEntity
import com.example.data.model.BadgeTier
import com.example.data.model.DomainType
import com.example.ui.components.Button3D
import com.example.ui.components.Surface3D

@Composable
fun BadgesAndCertificatesScreen(
  profile: UserProfileEntity?,
  badges: List<BadgeEntity>,
  attestations: List<AttestationEntity>,
  onPayAttestation: (AttestationEntity) -> Unit,
  onViewCertificate: (AttestationEntity) -> Unit,
  modifier: Modifier = Modifier
) {
  var selectedSection by remember { mutableIntStateOf(0) }
  val earnedBadges = badges.filter { it.isUnlocked }
  val lockedBadges = badges.filter { !it.isUnlocked }

  Column(modifier = modifier.fillMaxSize()) {
    TabRow(
      selectedTabIndex = selectedSection,
      containerColor = MaterialTheme.colorScheme.surface
    ) {
      Tab(
        selected = selectedSection == 0,
        onClick = { selectedSection = 0 },
        text = { Text("Badges (${earnedBadges.size}/${badges.size})", fontWeight = FontWeight.SemiBold) }
      )
      Tab(
        selected = selectedSection == 1,
        onClick = { selectedSection = 1 },
        text = { Text("Attestations (${attestations.size})", fontWeight = FontWeight.SemiBold) }
      )
    }

    if (selectedSection == 0) {
      LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
      ) {
        item {
          Surface3D(
            depth = 6.dp,
            containerColor = MaterialTheme.colorScheme.primary,
            baseColor = MaterialTheme.colorScheme.primaryContainer,
            borderColor = Color.White.copy(alpha = 0.2f)
          ) {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .padding(22.dp),
              verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
              Text(
                text = "Récapitulatif des compétences",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = Color.White
              )
              Text(
                text = "${earnedBadges.size} badges obtenus • ${profile?.points ?: 1850} XP cumulés • Niveau d'anglais ${profile?.englishLevel ?: "B1"}",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White.copy(alpha = 0.9f)
              )
            }
          }
        }

        item {
          Text(
            text = "Badges obtenus",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
          )
        }

        if (earnedBadges.isEmpty()) {
          item {
            Surface3D(depth = 4.dp) {
              Box(modifier = Modifier.padding(22.dp)) {
                Text(
                  text = "Aucun badge encore débloqué.",
                  style = MaterialTheme.typography.bodyMedium,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        } else {
          items(earnedBadges, key = { it.id }) { badge ->
            BadgeDetailCard3D(badge = badge)
          }
        }

        if (lockedBadges.isNotEmpty()) {
          item {
            Text(
              text = "Paliers à atteindre",
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
          }
          items(lockedBadges, key = { it.id }) { badge ->
            BadgeDetailCard3D(badge = badge)
          }
        }

        item { Spacer(modifier = Modifier.height(16.dp)) }
      }
    } else {
      LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(22.dp)
      ) {
        items(attestations, key = { it.id }) { attestation ->
          Surface3D(depth = 5.dp) {
            Column(
              modifier = Modifier.padding(20.dp),
              verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text(
                  text = attestation.certificateNumber,
                  fontSize = 13.sp,
                  fontWeight = FontWeight.Bold,
                  color = MaterialTheme.colorScheme.primary
                )

                if (attestation.isPaid) {
                  Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primaryContainer
                  ) {
                    Text(
                      text = "Certifié",
                      color = MaterialTheme.colorScheme.onPrimaryContainer,
                      fontWeight = FontWeight.SemiBold,
                      fontSize = 13.sp,
                      modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                  }
                } else {
                  Text(
                    text = "${attestation.priceFcfa} FCFA",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.secondary,
                    fontSize = 15.sp
                  )
                }
              }

              Text(
                text = attestation.title,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
              )

              Text(
                text = "Signataire : ${attestation.expertSigner} • ${attestation.issueDate}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )

              Spacer(modifier = Modifier.height(4.dp))

              if (attestation.isPaid) {
                Button3D(
                  text = "Afficher l'attestation QR",
                  icon = Icons.Rounded.QrCode2,
                  containerColor = MaterialTheme.colorScheme.primary,
                  onClick = { onViewCertificate(attestation) }
                )
              } else {
                Button3D(
                  text = "Débloquer (${attestation.priceFcfa} FCFA)",
                  icon = Icons.Rounded.LockOpen,
                  containerColor = MaterialTheme.colorScheme.secondary,
                  onClick = { onPayAttestation(attestation) }
                )
              }
            }
          }
        }

        item { Spacer(modifier = Modifier.height(16.dp)) }
      }
    }
  }
}

@Composable
private fun BadgeDetailCard3D(badge: BadgeEntity) {
  val tierEnum = try {
    BadgeTier.valueOf(badge.tier)
  } catch (_: Exception) {
    BadgeTier.BRONZE
  }
  val domain = DomainType.fromId(badge.domainId)

  Surface3D(
    depth = if (badge.isUnlocked) 5.dp else 3.dp,
    borderColor = if (badge.isUnlocked) tierEnum.badgeColor.copy(alpha = 0.55f) else MaterialTheme.colorScheme.outlineVariant
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
          .size(50.dp)
          .clip(CircleShape)
          .background(tierEnum.badgeColor.copy(alpha = 0.14f)),
        contentAlignment = Alignment.Center
      ) {
        Icon(
          imageVector = if (badge.isUnlocked) Icons.Rounded.WorkspacePremium else Icons.Rounded.Lock,
          contentDescription = null,
          tint = tierEnum.badgeColor,
          modifier = Modifier.size(24.dp)
        )
      }

      Column(
        modifier = Modifier.weight(1f),
        verticalArrangement = Arrangement.spacedBy(4.dp)
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Text(
            text = badge.name,
            fontWeight = FontWeight.Bold,
            fontSize = 17.sp
          )
          if (badge.isUnlocked) {
            Icon(
              imageVector = Icons.Rounded.Verified,
              contentDescription = "Débloqué",
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(17.dp)
            )
          }
        }

        Text(
          text = domain.displayName,
          style = MaterialTheme.typography.labelMedium,
          color = domain.color
        )

        Text(
          text = badge.description,
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
          text = if (badge.isUnlocked && !badge.unlockedDate.isNullOrBlank()) {
            "Obtenu le ${badge.unlockedDate} • ${badge.pointsRequired} pts • Anglais ${badge.englishRequired}"
          } else {
            "Requis : ${badge.pointsRequired} pts • ${badge.coursesRequired} cours • Anglais ${badge.englishRequired}"
          },
          fontSize = 13.sp,
          fontWeight = FontWeight.Medium,
          color = tierEnum.badgeColor
        )
      }
    }
  }
}
