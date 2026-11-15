package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.LessonEntity
import com.example.ui.theme.*

@Composable
fun LessonViewerScreen(
  lesson: LessonEntity,
  selectedOption: Int?,
  isSubmitted: Boolean,
  onSelectOption: (Int) -> Unit,
  onSubmitQuiz: () -> Unit,
  onCloseLesson: () -> Unit,
  modifier: Modifier = Modifier
) {
  BackHandler(onBack = onCloseLesson)

  val options = lesson.quizOptionsSerialized.split("|")
  val isCorrect = (selectedOption == lesson.quizCorrectIndex)

  Column(
    modifier = modifier
      .fillMaxSize()
      .background(MaterialTheme.colorScheme.background)
  ) {
    Surface(
      modifier = Modifier.fillMaxWidth(),
      color = MaterialTheme.colorScheme.surface,
      tonalElevation = 1.dp
    ) {
      Column {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 8.dp, vertical = 10.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          IconButton(onClick = onCloseLesson) {
            Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = "Retour")
          }
          Spacer(modifier = Modifier.width(4.dp))
          Column(modifier = Modifier.weight(1f)) {
            Text(
              text = "Leçon",
              fontSize = 13.sp,
              fontWeight = FontWeight.SemiBold,
              color = MaterialTheme.colorScheme.primary
            )
            Text(
              text = lesson.title,
              style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
              maxLines = 1
            )
          }
        }
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
      }
    }

    Column(
      modifier = Modifier
        .weight(1f)
        .fillMaxWidth()
        .verticalScroll(rememberScrollState())
        .padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Icon(
                imageVector = Icons.Rounded.Schedule,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(14.dp)
              )
              Text(
                text = "${lesson.durationMinutes} min",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
            if (lesson.isCompleted) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                Icon(
                  imageVector = Icons.Rounded.CheckCircle,
                  contentDescription = null,
                  tint = AfricaEmerald,
                  modifier = Modifier.size(16.dp)
                )
                Text("Validé", fontSize = 14.sp, color = AfricaEmerald, fontWeight = FontWeight.SemiBold)
              }
            }
          }

          Text(
            text = lesson.contentMarkdown,
            style = MaterialTheme.typography.bodyMedium,
            lineHeight = 26.sp
          )
        }
      }

      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Icon(
              imageVector = Icons.Rounded.Quiz,
              contentDescription = null,
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(20.dp)
            )
            Text(
              text = "Validation (+50 XP)",
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
          }

          Text(
            text = lesson.quizQuestion,
            fontWeight = FontWeight.SemiBold,
            fontSize = 16.sp
          )

          Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            options.forEachIndexed { index, optionText ->
              val isSelected = (selectedOption == index)
              val isCorrectOption = (index == lesson.quizCorrectIndex)

              val containerColor = when {
                isSubmitted && isCorrectOption -> AfricaEmerald.copy(alpha = 0.14f)
                isSubmitted && isSelected && !isCorrect -> Color(0xFFEF4444).copy(alpha = 0.14f)
                isSelected -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                else -> MaterialTheme.colorScheme.surface
              }

              val borderColor = when {
                isSubmitted && isCorrectOption -> AfricaEmerald
                isSubmitted && isSelected && !isCorrect -> Color(0xFFEF4444)
                isSelected -> MaterialTheme.colorScheme.primary
                else -> MaterialTheme.colorScheme.outlineVariant
              }

              Surface(
                modifier = Modifier
                  .fillMaxWidth()
                  .clip(RoundedCornerShape(10.dp))
                  .border(1.5.dp, borderColor, RoundedCornerShape(10.dp))
                  .clickable(enabled = !isSubmitted) { onSelectOption(index) },
                color = containerColor
              ) {
                Row(
                  modifier = Modifier.padding(12.dp),
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  RadioButton(
                    selected = isSelected,
                    onClick = { if (!isSubmitted) onSelectOption(index) },
                    enabled = !isSubmitted
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(
                    text = optionText,
                    fontSize = 15.sp,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
                  )
                }
              }
            }
          }

          if (!isSubmitted) {
            Button(
              onClick = onSubmitQuiz,
              enabled = selectedOption != null,
              modifier = Modifier
                .fillMaxWidth()
                .testTag("submit_quiz_button"),
              shape = RoundedCornerShape(10.dp),
              colors = ButtonDefaults.buttonColors(containerColor = AfricaEmerald)
            ) {
              Text("Valider")
            }
          } else {
            Surface(
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(10.dp),
              color = if (isCorrect) AfricaEmerald.copy(alpha = 0.1f) else Color(0xFFEF4444).copy(alpha = 0.1f)
            ) {
              Column(modifier = Modifier.padding(12.dp)) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                  Icon(
                    imageVector = if (isCorrect) Icons.Rounded.CheckCircle else Icons.Rounded.Warning,
                    contentDescription = null,
                    tint = if (isCorrect) AfricaEmerald else Color(0xFFDC2626),
                    modifier = Modifier.size(18.dp)
                  )
                  Text(
                    text = if (isCorrect) "Bonne réponse (+50 XP)" else "Réponse incorrecte",
                    fontWeight = FontWeight.Bold,
                    color = if (isCorrect) AfricaEmerald else Color(0xFFDC2626),
                    fontSize = 15.sp
                  )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(text = lesson.quizExplanation, fontSize = 14.sp)
              }
            }

            Button(
              onClick = onCloseLesson,
              modifier = Modifier.fillMaxWidth(),
              colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
              shape = RoundedCornerShape(10.dp)
            ) {
              Text("Continuer")
            }
          }
        }
      }
    }
  }
}
