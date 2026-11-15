package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import com.example.data.local.JobEntity
import com.example.data.local.ProjectEntity
import com.example.ui.components.Surface3D

@Composable
fun JobsListContent(
  jobs: List<JobEntity>,
  onApplyJob: (JobEntity) -> Unit,
  modifier: Modifier = Modifier
) {
  LazyColumn(
    modifier = modifier.fillMaxSize(),
    contentPadding = PaddingValues(horizontal = 18.dp, vertical = 22.dp),
    verticalArrangement = Arrangement.spacedBy(22.dp)
  ) {
    items(jobs, key = { it.id }) { job ->
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
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Surface(
                shape = RoundedCornerShape(6.dp),
                color = MaterialTheme.colorScheme.primaryContainer
              ) {
                Text(
                  text = job.type,
                  fontWeight = FontWeight.SemiBold,
                  fontSize = 13.sp,
                  color = MaterialTheme.colorScheme.onPrimaryContainer,
                  modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                )
              }
              Text(
                text = job.companyName,
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }

            Text(
              text = job.salaryRange,
              fontWeight = FontWeight.Bold,
              fontSize = 14.sp,
              color = MaterialTheme.colorScheme.secondary
            )
          }

          Text(
            text = job.title,
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
          )

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
              text = job.location,
              fontSize = 14.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          Text(
            text = job.description,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "Requis : ${job.badgeRequired}",
              fontSize = 13.sp,
              fontWeight = FontWeight.Medium,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (job.isApplied) {
              OutlinedButton(
                onClick = { },
                enabled = false,
                shape = RoundedCornerShape(10.dp)
              ) {
                Text("Envoyée", fontSize = 14.sp)
              }
            } else {
              Button(
                onClick = { onApplyJob(job) },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
              ) {
                Text("Postuler", fontSize = 14.sp)
              }
            }
          }
        }
      }
    }

    item { Spacer(modifier = Modifier.height(16.dp)) }
  }
}

@Composable
fun IncubatorProjectsContent(
  projects: List<ProjectEntity>,
  onUpdateProjectStatus: (String, String) -> Unit,
  modifier: Modifier = Modifier
) {
  LazyColumn(
    modifier = modifier.fillMaxSize(),
    contentPadding = PaddingValues(horizontal = 18.dp, vertical = 22.dp),
    verticalArrangement = Arrangement.spacedBy(22.dp)
  ) {
    item {
      Surface3D(
        depth = 4.dp,
        containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
      ) {
        Row(
          modifier = Modifier.padding(18.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Icon(
            imageVector = Icons.Rounded.RocketLaunch,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(24.dp)
          )
          Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
              text = "Pitch Day : 15 Octobre 2026",
              fontWeight = FontWeight.Bold,
              fontSize = 15.sp,
              color = MaterialTheme.colorScheme.primary
            )
            Text(
              text = "Pré-amorçage jusqu'à 5 000 000 FCFA pour les projets incubés.",
              fontSize = 14.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }
    }

    items(projects, key = { it.id }) { project ->
      val (statusColor, statusLabel) = when (project.status) {
        "INCUBATION" -> Pair(MaterialTheme.colorScheme.primary, "Incubé")
        "IN_PROGRESS" -> Pair(MaterialTheme.colorScheme.secondary, "En cours")
        "DONE" -> Pair(Color(0xFF0284C7), "Terminé")
        else -> Pair(MaterialTheme.colorScheme.onSurfaceVariant, "À faire")
      }

      Surface3D(depth = 5.dp) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(6.dp))
                .background(statusColor.copy(alpha = 0.14f))
                .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
              Text(statusLabel, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = statusColor)
            }

            Text(
              text = "Équipe : ${project.teamSize} • Mentor : ${project.mentorName}",
              fontSize = 13.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          Text(
            text = project.title,
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
          )

          Text(
            text = project.description,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )

          Text(
            text = "Objectif : ${project.targetKpi}",
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.primary
          )

          Row(
            modifier = Modifier
              .fillMaxWidth()
              .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            listOf(
              "TODO" to "À faire",
              "IN_PROGRESS" to "En cours",
              "INCUBATION" to "Incubé",
              "DONE" to "Terminé"
            ).forEach { (statusKey, label) ->
              FilterChip(
                selected = (project.status == statusKey),
                onClick = { onUpdateProjectStatus(project.id, statusKey) },
                label = { Text(label, fontSize = 14.sp) }
              )
            }
          }
        }
      }
    }

    item { Spacer(modifier = Modifier.height(16.dp)) }
  }
}
