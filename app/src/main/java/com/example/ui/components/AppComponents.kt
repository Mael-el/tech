package com.example.ui.components

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.indication
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.Send
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.local.AttestationEntity
import com.example.data.local.UserProfileEntity
import com.example.data.model.DomainType
import com.example.ui.theme.*
import com.example.ui.viewmodel.AppTab
import com.example.ui.viewmodel.FataLiveState

@Composable
fun Surface3D(
  modifier: Modifier = Modifier,
  shape: RoundedCornerShape = RoundedCornerShape(20.dp),
  containerColor: Color = MaterialTheme.colorScheme.surface,
  baseColor: Color = MaterialTheme.colorScheme.outline,
  borderColor: Color = MaterialTheme.colorScheme.outlineVariant,
  depth: Dp = 5.dp,
  onClick: (() -> Unit)? = null,
  content: @Composable BoxScope.() -> Unit
) {
  val interactionSource = remember { MutableInteractionSource() }
  val isPressed by interactionSource.collectIsPressedAsState()
  val pressOffset by animateDpAsState(
    targetValue = if (onClick != null && isPressed) (depth - 1.dp).coerceAtLeast(1.dp) else 0.dp,
    animationSpec = spring(stiffness = 700f),
    label = "surface3d_press"
  )

  Box(
    modifier = modifier
      .padding(bottom = depth)
      .then(
        if (onClick != null) {
          Modifier.clickable(
            interactionSource = interactionSource,
            indication = null,
            onClick = onClick
          )
        } else {
          Modifier
        }
      )
  ) {
    Box(
      modifier = Modifier
        .matchParentSize()
        .offset(y = depth)
        .clip(shape)
        .background(baseColor)
    )

    Surface(
      modifier = Modifier
        .fillMaxWidth()
        .offset(y = pressOffset)
        .clip(shape)
        .then(
          if (onClick != null) {
            Modifier.indication(
              interactionSource = interactionSource,
              indication = ripple()
            )
          } else {
            Modifier
          }
        ),
      shape = shape,
      color = containerColor,
      border = BorderStroke(1.dp, borderColor),
      shadowElevation = 2.dp
    ) {
      Box(content = content)
    }
  }
}

@Composable
fun Button3D(
  text: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  containerColor: Color = MaterialTheme.colorScheme.primary,
  contentColor: Color = Color.White,
  enabled: Boolean = true,
  icon: ImageVector? = null
) {
  val interactionSource = remember { MutableInteractionSource() }
  val isPressed by interactionSource.collectIsPressedAsState()
  val depth = 4.dp
  val pressOffset by animateDpAsState(
    targetValue = if (enabled && isPressed) 3.dp else 0.dp,
    animationSpec = spring(stiffness = 750f),
    label = "button3d_press"
  )
  val effectiveBg = if (enabled) containerColor else containerColor.copy(alpha = 0.45f)
  val baseLip = lerp(effectiveBg, Color.Black, 0.32f)

  Box(
    modifier = modifier
      .heightIn(min = 52.dp)
      .padding(bottom = depth)
      .clickable(
        enabled = enabled,
        interactionSource = interactionSource,
        indication = null,
        onClick = onClick
      )
  ) {
    Box(
      modifier = Modifier
        .matchParentSize()
        .offset(y = depth)
        .clip(RoundedCornerShape(14.dp))
        .background(baseLip)
    )
    Surface(
      modifier = Modifier
        .fillMaxWidth()
        .heightIn(min = 48.dp)
        .offset(y = pressOffset)
        .clip(RoundedCornerShape(14.dp))
        .indication(
          interactionSource = interactionSource,
          indication = ripple()
        ),
      shape = RoundedCornerShape(14.dp),
      color = effectiveBg
    ) {
      Row(
        modifier = Modifier.padding(horizontal = 20.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
      ) {
        if (icon != null) {
          Icon(
            imageVector = icon,
            contentDescription = null,
            tint = contentColor,
            modifier = Modifier.size(18.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
        }
        Text(
          text = text,
          color = contentColor,
          style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
        )
      }
    }
  }
}

@Composable
fun ThemeToggleButton(
  isDarkTheme: Boolean,
  onToggleTheme: () -> Unit,
  modifier: Modifier = Modifier
) {
  IconButton(
    onClick = onToggleTheme,
    modifier = modifier
      .testTag("theme_toggle_button")
      .size(48.dp)
      .clip(CircleShape)
      .background(MaterialTheme.colorScheme.surfaceVariant)
  ) {
    Icon(
      imageVector = if (isDarkTheme) Icons.Rounded.LightMode else Icons.Rounded.DarkMode,
      contentDescription = if (isDarkTheme) "Activer le mode clair" else "Activer le mode sombre",
      tint = MaterialTheme.colorScheme.onSurface
    )
  }
}

@Composable
fun AfricaSkillsTopBar(
  profile: UserProfileEntity?,
  isProfileOpen: Boolean,
  isDarkTheme: Boolean,
  onToggleTheme: () -> Unit,
  onBackFromProfile: () -> Unit,
  onProfileClick: () -> Unit,
  onOpenLive: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier.fillMaxWidth(),
    color = MaterialTheme.colorScheme.surface,
    tonalElevation = 1.dp
  ) {
    Column {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .statusBarsPadding()
          .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        if (isProfileOpen) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            IconButton(
              onClick = onBackFromProfile,
              modifier = Modifier.minimumInteractiveComponentSize()
            ) {
              Icon(
                imageVector = Icons.AutoMirrored.Rounded.ArrowBack,
                contentDescription = "Retour"
              )
            }
            Text(
              text = "Profil",
              style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
            )
          }
          ThemeToggleButton(
            isDarkTheme = isDarkTheme,
            onToggleTheme = onToggleTheme
          )
        } else {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Box(modifier = Modifier.padding(bottom = 3.dp)) {
              Box(
                modifier = Modifier
                  .size(38.dp)
                  .offset(y = 3.dp)
                  .clip(RoundedCornerShape(11.dp))
                  .background(BrandPrimaryDark)
              )
              Box(
                modifier = Modifier
                  .size(38.dp)
                  .clip(RoundedCornerShape(11.dp))
                  .background(
                    Brush.linearGradient(listOf(BrandPrimary, Color(0xFF2563EB)))
                  ),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = "AS",
                  color = Color.White,
                  fontWeight = FontWeight.Bold,
                  fontSize = 15.sp,
                  letterSpacing = 0.5.sp
                )
              }
            }
            Text(
              text = "AfricaSkills",
              style = MaterialTheme.typography.titleLarge.copy(
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.2).sp
              ),
              color = MaterialTheme.colorScheme.onSurface
            )
          }

          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Surface(
              onClick = onOpenLive,
              modifier = Modifier
                .testTag("top_bar_fata_live_btn")
                .height(38.dp),
              shape = RoundedCornerShape(19.dp),
              color = Color(0xFFEF4444).copy(alpha = 0.1f),
              border = BorderStroke(1.dp, Color(0xFFEF4444).copy(alpha = 0.25f))
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Box(
                  modifier = Modifier
                    .size(7.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFEF4444))
                )
                Text(
                  text = "Direct",
                  style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                  color = Color(0xFFDC2626)
                )
              }
            }

            ThemeToggleButton(
              isDarkTheme = isDarkTheme,
              onToggleTheme = onToggleTheme
            )

            Box(
              modifier = Modifier
                .testTag("top_bar_profile_avatar")
                .size(40.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primaryContainer)
                .clickable { onProfileClick() },
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = (profile?.fullName?.firstOrNull() ?: 'I').toString(),
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onPrimaryContainer
              )
            }
          }
        }
      }
      HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 1.dp)
    }
  }
}

private fun tabIcon(tab: AppTab, selected: Boolean): ImageVector = when (tab) {
  AppTab.DASHBOARD -> if (selected) Icons.Rounded.Home else Icons.Outlined.Home
  AppTab.COURSES -> if (selected) Icons.Rounded.MenuBook else Icons.Outlined.MenuBook
  AppTab.FLASHCARDS -> if (selected) Icons.Rounded.Style else Icons.Outlined.Style
  AppTab.BADGES -> if (selected) Icons.Rounded.WorkspacePremium else Icons.Outlined.WorkspacePremium
  AppTab.NETWORK -> if (selected) Icons.Rounded.Groups else Icons.Outlined.Groups
}

@Composable
fun AfricaSkillsBottomBar(
  currentTab: AppTab,
  onTabSelected: (AppTab) -> Unit,
  modifier: Modifier = Modifier
) {
  Column(modifier = modifier.fillMaxWidth()) {
    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 1.dp)
    NavigationBar(
      modifier = Modifier.windowInsetsPadding(WindowInsets.navigationBars),
      containerColor = MaterialTheme.colorScheme.surface,
      tonalElevation = 0.dp
    ) {
      AppTab.entries.forEach { tab ->
        val isSelected = (currentTab == tab)
        NavigationBarItem(
          selected = isSelected,
          onClick = { onTabSelected(tab) },
          icon = {
            Icon(
              imageVector = tabIcon(tab, isSelected),
              contentDescription = tab.label
            )
          },
          label = {
            Text(
              text = tab.label,
              style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
              ),
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
          },
          colors = NavigationBarItemDefaults.colors(
            selectedIconColor = MaterialTheme.colorScheme.primary,
            selectedTextColor = MaterialTheme.colorScheme.primary,
            indicatorColor = MaterialTheme.colorScheme.primaryContainer,
            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
          )
        )
      }
    }
  }
}

@Composable
fun DomainSelectorRow(
  selectedDomain: DomainType?,
  onDomainSelect: (DomainType?) -> Unit,
  modifier: Modifier = Modifier
) {
  Row(
    modifier = modifier
      .fillMaxWidth()
      .horizontalScroll(rememberScrollState()),
    horizontalArrangement = Arrangement.spacedBy(8.dp)
  ) {
    FilterChip(
      selected = (selectedDomain == null),
      onClick = { onDomainSelect(null) },
      label = { Text("Tous (${DomainType.entries.size})") }
    )

    DomainType.entries.forEach { domain ->
      val isSelected = (selectedDomain == domain)
      FilterChip(
        selected = isSelected,
        onClick = { onDomainSelect(if (isSelected) null else domain) },
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
          selectedContainerColor = domain.color,
          selectedLabelColor = Color.White
        )
      )
    }
  }
}

@Composable
fun FataLiveDialog(
  state: FataLiveState,
  onClose: () -> Unit,
  onToggleHand: () -> Unit,
  onSendMessage: (String) -> Unit
) {
  var chatInput by remember { mutableStateOf("") }

  Dialog(
    onDismissRequest = onClose,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxSize()
        .systemBarsPadding(),
      color = AfricaDarkBackground
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(20.dp)
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
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(6.dp))
                .background(Color(0xFFDC2626))
                .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
              Text(
                "EN DIRECT",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp
              )
            }
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Icon(
                imageVector = Icons.Rounded.People,
                contentDescription = null,
                tint = AfricaTextSecondaryDark,
                modifier = Modifier.size(16.dp)
              )
              Text(
                "${state.viewerCount} connectés",
                color = AfricaTextSecondaryDark,
                fontSize = 15.sp
              )
            }
          }
          IconButton(onClick = onClose) {
            Icon(Icons.Rounded.Close, contentDescription = "Fermer", tint = Color.White)
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Surface3D(
          containerColor = Color(0xFF16223F),
          baseColor = Color(0xFF060B18),
          borderColor = Color(0xFF334155),
          depth = 6.dp
        ) {
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
              .fillMaxWidth()
              .padding(24.dp)
          ) {
            Box(
              modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .background(BrandPrimary.copy(alpha = 0.25f)),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Rounded.RecordVoiceOver,
                contentDescription = null,
                tint = BrandPrimaryLight,
                modifier = Modifier.size(28.dp)
              )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
              text = state.instructorName.ifEmpty { "Amina Diallo" },
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
              color = Color.White
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = state.courseTitle.ifEmpty { "Architecture Logicielle & Offline-First" },
              style = MaterialTheme.typography.bodySmall,
              color = AfricaTextSecondaryDark,
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(10.dp))
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              Icon(
                imageVector = Icons.Rounded.GraphicEq,
                contentDescription = null,
                tint = BrandPrimaryLight,
                modifier = Modifier.size(16.dp)
              )
              Text(
                "Audio et flux en direct actifs",
                fontSize = 13.sp,
                color = BrandPrimaryLight
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Button(
            onClick = onToggleHand,
            modifier = Modifier
              .weight(1f)
              .testTag("fata_hand_raise_button"),
            colors = ButtonDefaults.buttonColors(
              containerColor = if (state.isHandRaised) BrandSecondary else BrandPrimary
            ),
            shape = RoundedCornerShape(12.dp)
          ) {
            Icon(
              imageVector = Icons.Rounded.FrontHand,
              contentDescription = null,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(if (state.isHandRaised) "Main levée" else "Lever la main")
          }

          OutlinedButton(
            onClick = {
              onSendMessage("Question au mentor : comment gérer la synchronisation hors ligne ?")
            },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, Color(0xFF475569)),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
          ) {
            Icon(
              imageVector = Icons.Rounded.HelpOutline,
              contentDescription = null,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text("Poser question")
          }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Text(
          "Échanges en direct",
          style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
          color = AfricaTextSecondaryDark
        )

        Spacer(modifier = Modifier.height(8.dp))

        Column(
          modifier = Modifier
            .weight(1f)
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(AfricaDarkSurface)
            .padding(12.dp)
            .verticalScroll(rememberScrollState()),
          verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          state.messages.forEach { (sender, msg) ->
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFF0F172A).copy(alpha = 0.6f))
                .padding(10.dp)
            ) {
              Text(
                text = sender,
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp,
                color = if (sender.contains("Mentor")) BrandSecondaryLight else BrandPrimaryLight
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = msg,
                fontSize = 15.sp,
                color = AfricaTextPrimaryDark
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          OutlinedTextField(
            value = chatInput,
            onValueChange = { chatInput = it },
            placeholder = { Text("Écrire un message...", color = AfricaTextSecondaryDark, fontSize = 15.sp) },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
              focusedTextColor = Color.White,
              unfocusedTextColor = Color.White,
              focusedBorderColor = BrandPrimaryLight,
              unfocusedBorderColor = Color(0xFF334155),
              focusedContainerColor = AfricaDarkSurface,
              unfocusedContainerColor = AfricaDarkSurface
            ),
            singleLine = true
          )

          IconButton(
            onClick = {
              if (chatInput.isNotBlank()) {
                onSendMessage(chatInput)
                chatInput = ""
              }
            },
            modifier = Modifier
              .size(48.dp)
              .clip(RoundedCornerShape(12.dp))
              .background(BrandPrimary)
          ) {
            Icon(Icons.AutoMirrored.Rounded.Send, contentDescription = "Envoyer", tint = Color.White)
          }
        }
      }
    }
  }
}

@Composable
fun MobileMoneyPaymentDialog(
  attestation: AttestationEntity,
  selectedProvider: String,
  phoneNumber: String,
  isProcessing: Boolean,
  onSelectProvider: (String) -> Unit,
  onPhoneNumberChange: (String) -> Unit,
  onConfirm: () -> Unit,
  onDismiss: () -> Unit
) {
  val providers = listOf(
    Pair("MTN Mobile Money", Color(0xFFEAB308)),
    Pair("Moov Money", Color(0xFF2563EB)),
    Pair("FedaPay", BrandPrimary),
    Pair("KkiaPay", Color(0xFF7C3AED))
  )

  AlertDialog(
    onDismissRequest = { if (!isProcessing) onDismiss() },
    title = {
      Column {
        Text("Paiement Mobile Money", fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(2.dp))
        Text(
          text = attestation.title,
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    },
    text = {
      Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        Surface(
          modifier = Modifier.fillMaxWidth(),
          shape = RoundedCornerShape(12.dp),
          color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f))
        ) {
          Column(
            modifier = Modifier.padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text("Montant officiel", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(
              "${attestation.priceFcfa} FCFA",
              style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.primary
            )
            Text("Palier : ${attestation.tier}", fontSize = 14.sp, color = MaterialTheme.colorScheme.secondary)
          }
        }

        Text("Opérateur :", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
          providers.forEach { (providerName, dotColor) ->
            val isSelected = (selectedProvider == providerName)
            Surface(
              modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .border(
                  width = if (isSelected) 1.5.dp else 1.dp,
                  color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant,
                  shape = RoundedCornerShape(10.dp)
                )
                .clickable { onSelectProvider(providerName) },
              color = if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
              ) {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(10.dp)
                      .clip(CircleShape)
                      .background(dotColor)
                  )
                  Text(providerName, fontWeight = FontWeight.Medium, fontSize = 16.sp)
                }
                RadioButton(
                  selected = isSelected,
                  onClick = { onSelectProvider(providerName) }
                )
              }
            }
          }
        }

        OutlinedTextField(
          value = phoneNumber,
          onValueChange = onPhoneNumberChange,
          label = { Text("Numéro Mobile Money") },
          modifier = Modifier.fillMaxWidth(),
          singleLine = true,
          shape = RoundedCornerShape(10.dp)
        )

        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Icon(
            imageVector = Icons.Rounded.Lock,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(14.dp)
          )
          Text(
            "Validation USSD sécurisée.",
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }
    },
    confirmButton = {
      Button(
        onClick = onConfirm,
        enabled = !isProcessing && phoneNumber.isNotBlank(),
        modifier = Modifier.testTag("confirm_payment_button"),
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
      ) {
        if (isProcessing) {
          CircularProgressIndicator(
            modifier = Modifier.size(16.dp),
            color = Color.White,
            strokeWidth = 2.dp
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text("Validation...")
        } else {
          Text("Payer ${attestation.priceFcfa} FCFA")
        }
      }
    },
    dismissButton = {
      if (!isProcessing) {
        TextButton(onClick = onDismiss) {
          Text("Annuler")
        }
      }
    }
  )
}

@Composable
fun OfficialCertificateDialog(
  attestation: AttestationEntity,
  onDismiss: () -> Unit
) {
  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier
        .fillMaxSize()
        .systemBarsPadding(),
      color = Color(0xFF0F172A)
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(16.dp)
          .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            "Attestation Officielle",
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp
          )
          IconButton(onClick = onDismiss) {
            Icon(Icons.Rounded.Close, contentDescription = "Fermer", tint = Color.White)
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Box(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFFFFFDF8))
            .border(2.dp, BrandSecondary, RoundedCornerShape(12.dp))
            .padding(24.dp)
        ) {
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
          ) {
            Icon(
              imageVector = Icons.Rounded.Verified,
              contentDescription = null,
              tint = BrandPrimaryDark,
              modifier = Modifier.size(36.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
              text = "AFRICASKILLS ACADÉMIE PANAFRICAINE",
              fontWeight = FontWeight.Bold,
              fontSize = 14.sp,
              letterSpacing = 1.sp,
              color = BrandPrimaryDark,
              textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(18.dp))

            Text(
              text = "CERTIFICAT DE COMPÉTENCES",
              fontWeight = FontWeight.Black,
              fontSize = 20.sp,
              letterSpacing = 0.8.sp,
              color = Color(0xFF1E293B),
              textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(20.dp))

            Text("Décerné à", fontSize = 14.sp, color = Color(0xFF475569))
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = attestation.recipientName,
              style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
              color = Color(0xFF0F172A),
              textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(
              text = "Pour la validation des compétences en",
              fontSize = 13.sp,
              color = Color(0xFF475569),
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = attestation.title,
              fontWeight = FontWeight.Bold,
              fontSize = 16.sp,
              color = BrandPrimaryDark,
              textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))
            HorizontalDivider(color = Color(0xFFE2E8F0))
            Spacer(modifier = Modifier.height(16.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.Bottom
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Text("Signature", fontSize = 12.sp, color = Color(0xFF64748B))
                Spacer(modifier = Modifier.height(4.dp))
                Text(attestation.expertSigner, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                Text(attestation.expertRole, fontSize = 12.sp, color = Color(0xFF64748B))
              }

              Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                  modifier = Modifier
                    .size(56.dp)
                    .background(Color.White)
                    .border(1.dp, Color(0xFFCBD5E1), RoundedCornerShape(6.dp)),
                  contentAlignment = Alignment.Center
                ) {
                  Icon(
                    imageVector = Icons.Rounded.QrCode2,
                    contentDescription = "Code QR de vérification",
                    tint = Color(0xFF0F172A),
                    modifier = Modifier.size(40.dp)
                  )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(attestation.certificateNumber, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Button(
            onClick = { },
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
            shape = RoundedCornerShape(12.dp)
          ) {
            Icon(Icons.Rounded.Share, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Partager")
          }

          OutlinedButton(
            onClick = { },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, Color(0xFF475569)),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
          ) {
            Icon(Icons.Rounded.Download, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("PDF")
          }
        }
      }
    }
  }
}
