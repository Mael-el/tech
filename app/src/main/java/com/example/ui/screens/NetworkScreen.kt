package com.example.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.example.data.local.CommunityMessageEntity
import com.example.data.local.JobEntity
import com.example.data.local.ProjectEntity
import com.example.data.model.DomainType

@Composable
fun NetworkScreen(
  jobs: List<JobEntity>,
  projects: List<ProjectEntity>,
  activeDomain: DomainType,
  messages: List<CommunityMessageEntity>,
  onApplyJob: (JobEntity) -> Unit,
  onUpdateProjectStatus: (String, String) -> Unit,
  onSelectDomain: (DomainType) -> Unit,
  onSendMessage: (String) -> Unit,
  modifier: Modifier = Modifier
) {
  var selectedSegment by remember { mutableIntStateOf(0) }

  Column(modifier = modifier.fillMaxSize()) {
    TabRow(
      selectedTabIndex = selectedSegment,
      containerColor = MaterialTheme.colorScheme.surface
    ) {
      Tab(
        selected = selectedSegment == 0,
        onClick = { selectedSegment = 0 },
        text = { Text("Emploi", fontWeight = FontWeight.SemiBold) }
      )
      Tab(
        selected = selectedSegment == 1,
        onClick = { selectedSegment = 1 },
        text = { Text("Incubateur", fontWeight = FontWeight.SemiBold) }
      )
      Tab(
        selected = selectedSegment == 2,
        onClick = { selectedSegment = 2 },
        text = { Text("Salons", fontWeight = FontWeight.SemiBold) }
      )
    }

    when (selectedSegment) {
      0 -> JobsListContent(
        jobs = jobs,
        onApplyJob = onApplyJob
      )
      1 -> IncubatorProjectsContent(
        projects = projects,
        onUpdateProjectStatus = onUpdateProjectStatus
      )
      2 -> CommunityChatScreen(
        activeDomain = activeDomain,
        messages = messages,
        onSelectDomain = onSelectDomain,
        onSendMessage = onSendMessage
      )
    }
  }
}
