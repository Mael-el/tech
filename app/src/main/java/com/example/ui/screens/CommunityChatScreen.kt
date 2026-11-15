package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.CommunityMessageEntity
import com.example.data.model.DomainType
import com.example.ui.theme.*

@Composable
fun CommunityChatScreen(
  activeDomain: DomainType,
  messages: List<CommunityMessageEntity>,
  onSelectDomain: (DomainType) -> Unit,
  onSendMessage: (String) -> Unit,
  modifier: Modifier = Modifier
) {
  var textInput by remember { mutableStateOf("") }

  Column(modifier = modifier.fillMaxSize()) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .background(MaterialTheme.colorScheme.surface)
        .horizontalScroll(rememberScrollState())
        .padding(horizontal = 16.dp, vertical = 10.dp),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      DomainType.entries.forEach { domain ->
        val isSelected = (domain == activeDomain)
        FilterChip(
          selected = isSelected,
          onClick = { onSelectDomain(domain) },
          label = {
            Text(
              text = domain.displayName,
              color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
            )
          },
          leadingIcon = {
            Box(
              modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(if (isSelected) Color.White else domain.color)
            )
          },
          colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = domain.color
          )
        )
      }
    }

    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

    LazyColumn(
      modifier = Modifier
        .weight(1f)
        .fillMaxWidth()
        .padding(horizontal = 16.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp),
      contentPadding = PaddingValues(vertical = 14.dp)
    ) {
      items(messages, key = { it.id }) { msg ->
        val isUser = msg.isUser
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
        ) {
          if (!isUser) {
            Box(
              modifier = Modifier
                .size(34.dp)
                .clip(CircleShape)
                .background(activeDomain.color.copy(alpha = 0.15f)),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = msg.senderName.firstOrNull()?.toString() ?: "A",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = activeDomain.color
              )
            }
            Spacer(modifier = Modifier.width(8.dp))
          }

          Column(
            horizontalAlignment = if (isUser) Alignment.End else Alignment.Start,
            modifier = Modifier.widthIn(max = 280.dp)
          ) {
            Text(
              text = "${msg.senderName} • ${msg.timestampText}",
              fontSize = 13.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(3.dp))

            Surface(
              shape = RoundedCornerShape(
                topStart = 12.dp,
                topEnd = 12.dp,
                bottomStart = if (isUser) 12.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 12.dp
              ),
              color = if (isUser) AfricaEmerald else MaterialTheme.colorScheme.surfaceVariant
            ) {
              Text(
                text = msg.messageText,
                modifier = Modifier.padding(12.dp),
                color = if (isUser) Color.White else MaterialTheme.colorScheme.onSurface,
                fontSize = 15.sp
              )
            }
          }
        }
      }
    }

    Surface(
      modifier = Modifier.fillMaxWidth(),
      color = MaterialTheme.colorScheme.surface,
      tonalElevation = 2.dp
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        OutlinedTextField(
          value = textInput,
          onValueChange = { textInput = it },
          placeholder = { Text("Message dans #${activeDomain.displayName}", fontSize = 15.sp) },
          modifier = Modifier
            .weight(1f)
            .testTag("chat_message_input"),
          shape = RoundedCornerShape(12.dp),
          singleLine = true
        )

        IconButton(
          onClick = {
            if (textInput.isNotBlank()) {
              onSendMessage(textInput)
              textInput = ""
            }
          },
          modifier = Modifier
            .size(48.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(AfricaEmerald)
            .testTag("chat_send_btn")
        ) {
          Icon(Icons.AutoMirrored.Rounded.Send, contentDescription = "Envoyer", tint = Color.White)
        }
      }
    }
  }
}
