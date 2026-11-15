import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../components/Icon'
import { Btn, Card, EmptyState, Progress, Sheet } from '../components/ui'
import {
  certificateFor,
  completedCourses,
  coursesCompleted,
  currentTier,
  nextTier,
  seed,
  unlockedTiers,
  useApp,
  verificationLink,
} from '../store'
import { dayForPoints } from '../lib/progress'
import { formatDateFR } from '../lib/format'
import { verifyCertificate } from '../lib/certificate'

/** Les dates du seed Kotlin sont figées : on affiche le jour réel où le palier a été franchi. */
function badgeDate(
  badge: { pointsRequired: number },
  stored: string | null,
  activity: Record<string, number>,
): string {
  const key = dayForPoints(activity, badge.pointsRequired)
  if (key) return formatDateFR(new Date(`${key}T12:00:00`))
  return stored ?? '—'
}

export function CertificatesScreen() {
  const { state, dispatch, notify } = useApp()
  const [viewing, setViewing] = useState<string | null>(null)

  const tier = currentTier(state)
  const upcoming = nextTier(state)
  const done = coursesCompleted(state)
  const unlockedCount = unlockedTiers(state).length
  const finished = completedCourses(state)
  const inProgress = seed.courses
    .filter((course) => (state.progress[course.id] ?? 0) > 0 && (state.progress[course.id] ?? 0) < 100)
    .sort((a, b) => (state.progress[b.id] ?? 0) - (state.progress[a.id] ?? 0))
    .slice(0, 3)

  const course = viewing ? seed.courses.find((item) => item.id === viewing) : undefined
  const certificate = viewing ? certificateFor(state, viewing) : undefined
  const payload = certificate ? verifyCertificate(certificate.code) : null

  const copyLink = (code: string) => {
    const link = verificationLink(code)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(
        () => notify('Lien de vérification copié.'),
        () => notify('Copie impossible : sélectionnez le lien à la main.', true),
      )
      return
    }
    notify(link)
  }

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Certifications</h1>
        <p>Paliers par XP et certificats de cours vérifiables hors-ligne</p>
      </header>

      <Card className="tier-hero" style={{ borderColor: `${tier?.color ?? '#1D4ED8'}55` }}>
        <div
          className="tier-medal"
          style={{
            background: `${tier?.color ?? '#1D4ED8'}22`,
            color: tier?.color ?? '#1D4ED8',
            borderColor: `${tier?.color ?? '#1D4ED8'}66`,
          }}
        >
          <Icon name="award" size={30} />
        </div>
        <div className="tier-hero-body">
          <span className="eyebrow">Niveau actuel</span>
          <h2>{tier ? tier.label : 'Débutant'}</h2>
          <p>
            {state.points.toLocaleString('fr-FR')} XP · {done} cours validés · anglais{' '}
            {state.account?.englishLevel ?? 'A1'}
          </p>
        </div>
        <span className="tier-count">{unlockedCount}/5</span>
      </Card>

      {upcoming && (
        <Card>
          <div className="row-between">
            <strong>Objectif {upcoming.label}</strong>
            <span className="muted small">{upcoming.minPoints.toLocaleString('fr-FR')} XP</span>
          </div>
          <Progress value={(state.points / upcoming.minPoints) * 100} color={upcoming.color} />
          <p className="muted small">
            {Math.max(0, upcoming.minPoints - state.points).toLocaleString('fr-FR')} XP restants ·{' '}
            {Math.max(0, upcoming.minCourses - done)} cours à valider · anglais {upcoming.requiredEnglish} requis
          </p>
        </Card>
      )}

      <h3 className="block-title">Certificats de cours</h3>
      {finished.length === 0 ? (
        <EmptyState
          icon="award"
          title="Aucun cours terminé à 100 %"
          text="Le certificat s’émet uniquement quand toutes les leçons d’un cours sont validées. Reprenez un cours pour débloquer le vôtre."
        />
      ) : (
        <div className="stack">
          {finished.map((item) => {
            const cert = certificateFor(state, item.id)
            return (
              <Card key={item.id} className="cert-course">
                <div className="cert-course-head">
                  <div>
                    <span className="eyebrow">Cours terminé</span>
                    <h3>{item.title}</h3>
                    <p className="muted small">
                      {item.instructorName} · {item.durationHours} h · {item.level}
                    </p>
                  </div>
                  <span className="cert-course-badge">
                    <Icon name="check" size={15} />
                  </span>
                </div>
                {cert ? (
                  <>
                    <div className="cert-code">
                      <span>Code</span>
                      <code>{cert.code.slice(0, 22)}…</code>
                    </div>
                    <div className="cert-course-actions">
                      <Btn variant="soft" icon="award" onClick={() => setViewing(item.id)}>
                        Voir
                      </Btn>
                      <Btn variant="ghost" icon="download" onClick={() => setViewing(item.id)}>
                        Imprimer
                      </Btn>
                      <Btn variant="ghost" icon="shield" onClick={() => copyLink(cert.code)}>
                        Lien
                      </Btn>
                    </div>
                  </>
                ) : (
                  <Btn
                    full
                    icon="award"
                    onClick={() => {
                      dispatch({ type: 'CERTIFY', courseId: item.id })
                      notify('Certificat émis et enregistré sur cet appareil.')
                    }}
                  >
                    Générer mon certificat
                  </Btn>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {inProgress.length > 0 && (
        <>
          <h3 className="block-title">En cours</h3>
          <div className="stack">
            {inProgress.map((item) => (
              <Card key={item.id} className="cert-progress">
                <div className="row-between">
                  <strong>{item.title}</strong>
                  <span className="muted small">{state.progress[item.id] ?? 0}%</span>
                </div>
                <Progress value={state.progress[item.id] ?? 0} />
              </Card>
            ))}
          </div>
        </>
      )}

      <h3 className="block-title">Paliers</h3>
      <div className="tiers">
        {seed.tiers.map((t) => {
          const badge = seed.badges.find((b) => b.tier === t.name)!
          const unlocked = Boolean(state.badges[badge.id])
          return (
            <div key={t.name} className={`tier-row ${unlocked ? 'unlocked' : ''}`}>
              <span className="tier-chip" style={{ background: `${t.color}1f`, color: t.color }}>
                <Icon name="award" size={18} />
              </span>
              <div>
                <strong>{t.label}</strong>
                <small>
                  {t.minPoints.toLocaleString('fr-FR')} XP · {t.minCourses} cours · {t.requiredEnglish}
                </small>
                {unlocked && (
                  <small className="unlock-date">
                    Débloqué le {badgeDate(badge, state.badges[badge.id], state.activity)}
                  </small>
                )}
              </div>
              {unlocked ? (
                <span className="check-dot">
                  <Icon name="check" size={14} />
                </span>
              ) : (
                <span className="lock-dot">
                  <Icon name="lock" size={14} />
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="disclaimer">
        <Icon name="shield" size={14} />
        Le certificat est produit localement à partir de votre progression (pas de serveur, pas de paiement). Le code
        contient une empreinte d’intégrité : la page de vérification détecte une altération, mais ne constitue pas une
        signature d’un tiers.
      </p>

      <Sheet
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Certificat de réussite"
        wide
      >
        {course && certificate && payload?.valid && (
          <div className="certificate">
            <div className="cert-frame">
              <span className="cert-brand">AFRICASKILLS · CERTIFICAT</span>
              <h2>{course.title}</h2>
              <p className="cert-recipient">Décerné à</p>
              <p className="cert-name">{state.account?.name}</p>
              <p className="cert-desc">
                Pour avoir validé l’intégralité des leçons du parcours <strong>{course.title}</strong> dans le domaine{' '}
                {seed.domains.find((d) => d.id === course.domainId)?.label}, niveau {course.level}.
              </p>
              <div className="cert-footer">
                <div>
                  <span className="cert-sign">{course.instructorName}</span>
                  <small>Auteur du cours</small>
                </div>
                <div>
                  <span className="cert-sign">AfricaSkills</span>
                  <small>Cotonou, Bénin</small>
                </div>
              </div>
              <div className="cert-meta">
                <span>N° {certificate.code.slice(-16).toUpperCase()}</span>
                <span>Délivré le {formatDateFR(new Date(`${certificate.date}T12:00:00`))}</span>
              </div>
              <button type="button" className="cert-url" onClick={() => copyLink(certificate.code)}>
                {verificationLink(certificate.code)}
              </button>
            </div>
            <div className="cert-actions">
              <Btn variant="soft" icon="download" onClick={() => window.print()}>
                Imprimer / exporter en PDF
              </Btn>
              <button type="button" className="link" onClick={() => copyLink(certificate.code)}>
                Copier le lien de vérification
              </button>
            </div>
            <p className="disclaimer">
              <Icon name="shield" size={14} />
              Empreinte FNV-1a vérifiée localement. Le destinataire peut ouvrir le lien et confirmer le nom, le cours
              et la date sans connexion à un serveur AfricaSkills.
            </p>
          </div>
        )}
      </Sheet>

      {course &&
        certificate &&
        payload?.valid &&
        createPortal(
          <div className="print-cert">
            <div className="print-cert-inner">
              <div className="print-cert-head">
                <img src="/img/logo.jpg" alt="" />
                <div>
                  <strong>AFRICASKILLS</strong>
                  <span>Plateforme panafricaine de compétences</span>
                </div>
              </div>
              <span className="print-cert-kicker">Certificat de réussite</span>
              <h1>{course.title}</h1>
              <p className="print-cert-said">Décerné à</p>
              <h2>{state.account?.name}</h2>
              <p className="print-cert-desc">
                Pour la validation de toutes les leçons du parcours <strong>{course.title}</strong> ({course.level}).
                Ce document a été généré localement et son intégrité est contrôlée par l’empreinte ci-dessous.
              </p>
              <div className="print-cert-signs">
                <div>
                  <span>{course.instructorName}</span>
                  <small>Auteur du cours</small>
                </div>
                <div>
                  <span>AfricaSkills</span>
                  <small>Cotonou, Bénin</small>
                </div>
              </div>
              <div className="print-cert-meta">
                <span>N° {certificate.code.slice(-16).toUpperCase()}</span>
                <span>Délivré le {formatDateFR(new Date(`${certificate.date}T12:00:00`))}</span>
              </div>
              <p className="print-cert-url">Vérification : {verificationLink(certificate.code)}</p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
