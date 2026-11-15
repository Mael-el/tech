package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.FlashcardEntity
import com.example.data.model.DomainType
import com.example.ui.components.Surface3D

@Composable
fun FlashcardsScreen(
  flashcards: List<FlashcardEntity>,
  currentIndex: Int,
  isFlipped: Boolean,
  domainFilter: String?,
  speedQuizActive: Boolean,
  speedQuizSecondsLeft: Int,
  speedQuizScore: Int,
  onFlipCard: () -> Unit,
  onSubmitReview: (FlashcardEntity, Int) -> Unit,
  onNextCard: () -> Unit,
  onPrevCard: () -> Unit,
  onFilterDomain: (String?) -> Unit,
  onStartSpeedQuiz: () -> Unit,
  onAnswerSpeedQuiz: (Boolean) -> Unit,
  modifier: Modifier = Modifier
) {
  val filteredCards = if (domainFilter != null) {
    flashcards.filter { it.domainId == domainFilter }
  } else {
    flashcards
  }

  val activeCard = if (filteredCards.isNotEmpty()) {
    filteredCards[currentIndex.coerceIn(0, filteredCards.size - 1)]
  } else null

  val rotation by animateFloatAsState(
    targetValue = if (isFlipped) 180f else 0f,
    animationSpec = tween(durationMillis = 360),
    label = "cardFlipAnimation"
  )

  Column(
    modifier = modifier
      .fillMaxSize()
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 18.dp, vertical = 24.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(22.dp)
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = "Révision SM-2",
        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
      )

      if (!speedQuizActive) {
        FilledTonalButton(
          onClick = onStartSpeedQuiz,
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.testTag("start_speed_quiz_btn")
        ) {
          Icon(
            imageVector = Icons.Rounded.Timer,
            contentDescription = null,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text("Quiz 30s")
        }
      }
    }

    AnimatedVisibility(visible = speedQuizActive) {
      Surface3D(
        depth = 4.dp,
        containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.45f),
        borderColor = MaterialTheme.colorScheme.secondary.copy(alpha = 0.4f)
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text(
              text = "${speedQuizSecondsLeft}s restantes",
              fontWeight = FontWeight.Bold,
              fontSize = 18.sp,
              color = MaterialTheme.colorScheme.secondary
            )
            Text(
              text = "Score : $speedQuizScore pts",
              fontSize = 14.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
              onClick = { onAnswerSpeedQuiz(true) },
              colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
              shape = RoundedCornerShape(10.dp)
            ) {
              Text("Je sais")
            }
            OutlinedButton(
              onClick = { onAnswerSpeedQuiz(false) },
              shape = RoundedCornerShape(10.dp)
            ) {
              Text("Passer")
            }
          }
        }
      }
    }

    Row(
      modifier = Modifier
        .fillMaxWidth()
        .horizontalScroll(rememberScrollState()),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      FilterChip(
        selected = (domainFilter == null),
        onClick = { onFilterDomain(null) },
        label = { Text("Tous (${flashcards.size})") }
      )
      FilterChip(
        selected = (domainFilter == DomainType.ANGLAIS.id),
        onClick = { onFilterDomain(if (domainFilter == DomainType.ANGLAIS.id) null else DomainType.ANGLAIS.id) },
        label = { Text("Anglais") }
      )
      FilterChip(
        selected = (domainFilter == DomainType.DEVELOPPEMENT.id),
        onClick = { onFilterDomain(if (domainFilter == DomainType.DEVELOPPEMENT.id) null else DomainType.DEVELOPPEMENT.id) },
        label = { Text("Développement") }
      )
      FilterChip(
        selected = (domainFilter == DomainType.DATA.id),
        onClick = { onFilterDomain(if (domainFilter == DomainType.DATA.id) null else DomainType.DATA.id) },
        label = { Text("Data") }
      )
      FilterChip(
        selected = (domainFilter == DomainType.CYBERSECURITE.id),
        onClick = { onFilterDomain(if (domainFilter == DomainType.CYBERSECURITE.id) null else DomainType.CYBERSECURITE.id) },
        label = { Text("Cybersécurité") }
      )
      FilterChip(
        selected = (domainFilter == DomainType.IA.id),
        onClick = { onFilterDomain(if (domainFilter == DomainType.IA.id) null else DomainType.IA.id) },
        label = { Text("IA") }
      )
    }

    if (activeCard == null) {
      Surface3D(depth = 4.dp) {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .height(220.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "Aucune carte dans cette catégorie.",
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }
    } else {
      val domain = DomainType.fromId(activeCard.domainId)
      val displayIndex = currentIndex.coerceIn(0, filteredCards.size - 1) + 1

      Text(
        text = "Carte $displayIndex / ${filteredCards.size}",
        fontSize = 14.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        fontWeight = FontWeight.Medium
      )

      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(280.dp)
          .graphicsLayer {
            rotationY = rotation
            cameraDistance = 14f * density
            shadowElevation = 12f
          }
          .clip(RoundedCornerShape(22.dp))
          .background(
            if (isFlipped) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.surface
          )
          .border(
            width = 2.dp,
            color = domain.color.copy(alpha = 0.55f),
            shape = RoundedCornerShape(22.dp)
          )
          .clickable { onFlipCard() }
          .padding(26.dp)
          .testTag("flashcard_flip_box"),
        contentAlignment = Alignment.Center
      ) {
        if (rotation <= 90f) {
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
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

            Spacer(modifier = Modifier.height(20.dp))

            Text(
              text = activeCard.front,
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
              textAlign = TextAlign.Center,
              lineHeight = 28.sp
            )

            if (activeCard.hint.isNotBlank()) {
              Spacer(modifier = Modifier.height(14.dp))
              Text(
                text = "Indice : ${activeCard.hint}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
              )
            }
          }
        } else {
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
              .fillMaxWidth()
              .graphicsLayer { rotationY = 180f }
          ) {
            Text(
              text = "Réponse",
              fontWeight = FontWeight.Bold,
              fontSize = 14.sp,
              color = MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
              text = activeCard.back,
              style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
              textAlign = TextAlign.Center,
              lineHeight = 26.sp
            )

            Spacer(modifier = Modifier.height(20.dp))

            Text(
              text = "Intervalle : ${activeCard.intervalDays}j  •  Répétitions : ${activeCard.repetitions}",
              fontSize = 13.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }

      AnimatedVisibility(visible = isFlipped) {
        Column(
          modifier = Modifier.fillMaxWidth(),
          horizontalAlignment = Alignment.CenterHorizontally,
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Sm2Button(
              label = "Oublié",
              color = Color(0xFFDC2626),
              onClick = { onSubmitReview(activeCard, 0) },
              modifier = Modifier.weight(1f)
            )
            Sm2Button(
              label = "Difficile",
              color = MaterialTheme.colorScheme.secondary,
              onClick = { onSubmitReview(activeCard, 2) },
              modifier = Modifier.weight(1f)
            )
            Sm2Button(
              label = "Bien",
              color = MaterialTheme.colorScheme.primary,
              onClick = { onSubmitReview(activeCard, 4) },
              modifier = Modifier.weight(1f)
            )
            Sm2Button(
              label = "Parfait",
              color = Color(0xFF0F766E),
              onClick = { onSubmitReview(activeCard, 5) },
              modifier = Modifier.weight(1f)
            )
          }
        }
      }

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        OutlinedButton(
          onClick = onPrevCard,
          shape = RoundedCornerShape(12.dp)
        ) {
          Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Précédente")
        }

        OutlinedButton(
          onClick = onNextCard,
          shape = RoundedCornerShape(12.dp)
        ) {
          Text("Suivante")
          Spacer(modifier = Modifier.width(6.dp))
          Icon(Icons.AutoMirrored.Rounded.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
        }
      }
    }

    Spacer(modifier = Modifier.height(16.dp))
  }
}

@Composable
private fun Sm2Button(
  label: String,
  color: Color,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Button(
    onClick = onClick,
    modifier = modifier.height(46.dp),
    colors = ButtonDefaults.buttonColors(containerColor = color),
    shape = RoundedCornerShape(12.dp),
    contentPadding = PaddingValues(horizontal = 4.dp)
  ) {
    Text(label, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
  }
}
