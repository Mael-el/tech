package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.CourseEntity
import com.example.data.local.LessonEntity
import com.example.data.model.DomainType
import com.example.ui.components.DomainSelectorRow
import com.example.ui.components.Surface3D
import com.example.ui.theme.*

@Composable
fun DomainsAndCoursesScreen(
  courses: List<CourseEntity>,
  selectedDomain: DomainType?,
  selectedCourse: CourseEntity?,
  courseLessons: List<LessonEntity>,
  onDomainSelect: (DomainType?) -> Unit,
  onCourseClick: (CourseEntity) -> Unit,
  onCloseCourseDetails: () -> Unit,
  onOpenLesson: (LessonEntity) -> Unit,
  onEnroll: (String) -> Unit,
  onOpenFataLive: (String, String) -> Unit,
  modifier: Modifier = Modifier
) {
  var searchQuery by remember { mutableStateOf("") }

  val filteredCourses = courses.filter { course ->
    val matchesDomain = (selectedDomain == null || course.domainId == selectedDomain.id)
    val matchesQuery = searchQuery.isBlank() ||
      course.title.contains(searchQuery, ignoreCase = true) ||
      course.description.contains(searchQuery, ignoreCase = true) ||
      course.instructorName.contains(searchQuery, ignoreCase = true)
    matchesDomain && matchesQuery
  }

  Column(modifier = modifier.fillMaxSize()) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 18.dp, vertical = 14.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
      OutlinedTextField(
        value = searchQuery,
        onValueChange = { searchQuery = it },
        placeholder = { Text("Rechercher un cours, domaine ou mentor") },
        leadingIcon = { Icon(Icons.Rounded.Search, contentDescription = null) },
        trailingIcon = {
          if (searchQuery.isNotEmpty()) {
            IconButton(onClick = { searchQuery = "" }) {
              Icon(Icons.Rounded.Clear, contentDescription = "Effacer")
            }
          }
        },
        modifier = Modifier
          .fillMaxWidth()
          .testTag("course_search_input"),
        shape = RoundedCornerShape(14.dp),
        singleLine = true
      )

      DomainSelectorRow(
        selectedDomain = selectedDomain,
        onDomainSelect = onDomainSelect
      )
    }

    if (filteredCourses.isEmpty()) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .padding(32.dp),
        contentAlignment = Alignment.Center
      ) {
        Column(
          horizontalAlignment = Alignment.CenterHorizontally,
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Icon(
            imageVector = Icons.Rounded.SearchOff,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(40.dp)
          )
          Text(
            text = "Aucun cours trouvé",
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
          )
        }
      }
    } else {
      LazyColumn(
        modifier = Modifier
          .fillMaxSize()
          .testTag("courses_list"),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
      ) {
        items(filteredCourses, key = { it.id }) { course ->
          val domain = DomainType.fromId(course.domainId)
          Surface3D(
            modifier = Modifier
              .fillMaxWidth()
              .testTag("course_card_${course.id}"),
            depth = 5.dp,
            onClick = { onCourseClick(course) }
          ) {
            Column(
              modifier = Modifier.padding(20.dp),
              verticalArrangement = Arrangement.spacedBy(10.dp)
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
                    color = domain.color,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                  )
                }

                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(3.dp)
                  ) {
                    Icon(
                      imageVector = Icons.Rounded.Star,
                      contentDescription = null,
                      tint = MaterialTheme.colorScheme.secondary,
                      modifier = Modifier.size(16.dp)
                    )
                    Text("${course.rating}", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                  }
                  Text(
                    text = "${course.durationHours}h • ${course.level}",
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }

              Text(
                text = course.title,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
              )

              Text(
                text = course.description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis
              )

              Spacer(modifier = Modifier.height(2.dp))

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text(
                  text = course.instructorName,
                  fontSize = 14.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                if (course.isEnrolled) {
                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                  ) {
                    Text(
                      text = "${course.progressPercent}%",
                      fontSize = 14.sp,
                      color = MaterialTheme.colorScheme.primary,
                      fontWeight = FontWeight.Bold
                    )
                    Icon(
                      imageVector = Icons.AutoMirrored.Rounded.ArrowForward,
                      contentDescription = null,
                      tint = MaterialTheme.colorScheme.primary,
                      modifier = Modifier.size(16.dp)
                    )
                  }
                } else {
                  FilledTonalButton(
                    onClick = { onEnroll(course.id) },
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                  ) {
                    Text("S'inscrire", fontSize = 14.sp)
                  }
                }
              }

              if (course.isEnrolled) {
                LinearProgressIndicator(
                  progress = { course.progressPercent / 100f },
                  modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                  color = MaterialTheme.colorScheme.primary,
                  trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
              }
            }
          }
        }

        item { Spacer(modifier = Modifier.height(16.dp)) }
      }
    }
  }

  if (selectedCourse != null) {
    val domain = DomainType.fromId(selectedCourse.domainId)
    AlertDialog(
      onDismissRequest = onCloseCourseDetails,
      title = {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
          Text(
            text = domain.displayName,
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = domain.color
          )
          Text(
            text = selectedCourse.title,
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
          )
        }
      },
      text = {
        Column(
          modifier = Modifier.fillMaxWidth(),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Text(selectedCourse.description, fontSize = 15.sp)

          Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            color = MaterialTheme.colorScheme.surfaceVariant
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Text(
                  text = "Mentor : ${selectedCourse.instructorName}",
                  fontWeight = FontWeight.SemiBold,
                  fontSize = 14.sp
                )
                if (selectedCourse.nextSessionFata != null) {
                  Text(
                    text = "Direct FATA : ${selectedCourse.nextSessionFata}",
                    fontSize = 13.sp,
                    color = Color(0xFFDC2626),
                    fontWeight = FontWeight.SemiBold
                  )
                }
              }
              if (selectedCourse.nextSessionFata != null) {
                TextButton(
                  onClick = {
                    onOpenFataLive(selectedCourse.title, selectedCourse.instructorName)
                  }
                ) {
                  Text("Direct", color = Color(0xFFDC2626), fontWeight = FontWeight.Bold)
                }
              }
            }
          }

          Text(
            text = "Leçons du parcours",
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp
          )

          if (courseLessons.isEmpty()) {
            Text(
              text = "Leçons bientôt disponibles.",
              fontSize = 14.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          } else {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
              courseLessons.forEach { lesson ->
                Surface(
                  modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .clickable { onOpenLesson(lesson) },
                  color = if (lesson.isCompleted) MaterialTheme.colorScheme.primary.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surfaceVariant
                ) {
                  Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                  ) {
                    Column(modifier = Modifier.weight(1f)) {
                      Text(
                        text = lesson.title,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp
                      )
                      Text(
                        text = "${lesson.durationMinutes} min • Quiz inclus",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                      )
                    }
                    if (lesson.isCompleted) {
                      Icon(
                        imageVector = Icons.Rounded.CheckCircle,
                        contentDescription = "Validé",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(18.dp)
                      )
                    } else {
                      Icon(
                        imageVector = Icons.AutoMirrored.Rounded.ArrowForward,
                        contentDescription = "Ouvrir",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(18.dp)
                      )
                    }
                  }
                }
              }
            }
          }
        }
      },
      confirmButton = {
        if (!selectedCourse.isEnrolled) {
          Button(
            onClick = {
              onEnroll(selectedCourse.id)
              onCloseCourseDetails()
            },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
          ) {
            Text("S'inscrire")
          }
        } else {
          val targetLesson = courseLessons.find { !it.isCompleted } ?: courseLessons.firstOrNull()
          if (targetLesson != null) {
            Button(
              onClick = { onOpenLesson(targetLesson) },
              colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
              Text("Ouvrir la leçon")
            }
          }
        }
      },
      dismissButton = {
        TextButton(onClick = onCloseCourseDetails) {
          Text("Fermer")
        }
      }
    )
  }
}
