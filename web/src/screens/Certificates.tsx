import React, { useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card, Progress, Sheet } from '../components/ui'
import {
  coursesCompleted,
  currentTier,
  formatFcfa,
  nextTier,
  seed,
  unlockedTiers,
  useApp,
} from '../store'
import type { Attestation } from '../types'

const PROVIDERS = [
  { id: 'MTN Mobile Money', hint: '*880# · Bénin, Côte d’Ivoire, Ghana' },
  { id: 'Moov Money / FedaPay', hint: 'Paiement marchand sécurisé' },
  { id: 'Carte bancaire', hint: 'Visa · Mastercard (via FedaPay)' },
]

export function CertificatesScreen() {
  const { state, dispatch, notify } = useApp()
  const [paying, setPaying] = useState<Attestation | null>(null)
  const [provider, setProvider] = useState(PROVIDERS[0].id)
  const [phone, setPhone] = useState('97 00 00 14')
  const [processing, setProcessing] = useState(false)
  const [viewing, setViewing] = useState<Attestation | null>(null)

  const tier = currentTier(state)
  const upcoming = nextTier(state)
  const done = coursesCompleted(state)
  const unlockedCount = unlockedTiers(state).length

  const closePayment = () => {
    if (processing) return
    setPaying(null)
  }

  const confirm = () => {
    if (!paying) return
    const digits = phone.replace(/\D/g, '')
    if (provider !== 'Carte bancaire' && digits.length < 8) {
      notify('Numéro Mobile Money invalide (8 chiffres minimum).', true)
      return
    }
    setProcessing(true)
    window.setTimeout(() => {
      dispatch({ type: 'PAY', attestationId: paying.id, method: provider })
      setProcessing(false)
      setPaying(null)
      notify(`Paiement validé via ${provider}. Attestation débloquée.`)
    }, 1200)
  }

  const isPaid = (a: Attestation) => Boolean(state.attestations[a.id])
  const paidInfo = (a: Attestation) => state.attestations[a.id]

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Certifications</h1>
        <p>Badges par compétences et attestations vérifiables</p>
      </header>

      <Card className="tier-hero" style={{ borderColor: `${tier?.color ?? '#1D4ED8'}55` }}>
        <div className="tier-medal" style={{ background: `${tier?.color}22`, color: tier?.color, borderColor: `${tier?.color}66` }}>
          <Icon name="award" size={30} />
        </div>
        <div className="tier-hero-body">
          <span className="eyebrow">Niveau actuel</span>
          <h2>{tier ? tier.label : 'Débutant'}</h2>
          <p>{state.points.toLocaleString('fr-FR')} XP · {done} cours validés · anglais B1</p>
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
            {Math.max(0, upcoming.minPoints - state.points).toLocaleString('fr-FR')} XP restants ·
            {' '}{Math.max(0, upcoming.minCourses - done)} cours à valider ·
            {' '}anglais {upcoming.requiredEnglish} requis
          </p>
        </Card>
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
                <small>{t.minPoints.toLocaleString('fr-FR')} XP · {t.minCourses} cours · {t.requiredEnglish}</small>
                {unlocked && state.badges[badge.id] && <small className="unlock-date">Débloqué le {state.badges[badge.id]}</small>}
              </div>
              {unlocked ? (
                <span className="check-dot"><Icon name="check" size={14} /></span>
              ) : (
                <span className="lock-dot"><Icon name="lock" size={14} /></span>
              )}
            </div>
          )
        })}
      </div>

      <h3 className="block-title">Attestations</h3>
      <div className="stack">
        {seed.attestations.map((a) => {
          const paid = isPaid(a)
          return (
            <Card key={a.id} className="attestation">
              <div className="attest-head">
                <span className={`attest-status ${paid ? 'paid' : ''}`}>
                  <Icon name={paid ? 'shield' : 'lock'} size={14} />
                  {paid ? 'Attestation débloquée' : 'Paiement requis'}
                </span>
                <span className="attest-price">{formatFcfa(a.priceFcfa)}</span>
              </div>
              <h3>{a.title}</h3>
              <p className="muted small">{a.domainName} · {a.tier}</p>
              <div className="attest-meta">
                <span>N° {a.certificateNumber}</span>
                <span>{paid ? `Payé · ${paidInfo(a)?.method}` : 'Délivré après règlement'}</span>
              </div>
              {paid ? (
                <div className="attest-actions">
                  <Btn variant="soft" icon="award" onClick={() => setViewing(a)}>
                    Voir l'attestation
                  </Btn>
                  <span className="verified"><Icon name="check" size={13} /> vérifiée</span>
                </div>
              ) : (
                <Btn icon="download" onClick={() => { setPaying(a); setProvider(PROVIDERS[0].id); setPhone('97 00 00 14') }}>
                  Payer et débloquer
                </Btn>
              )}
            </Card>
          )
        })}
      </div>

      <p className="disclaimer">
        <Icon name="shield" size={14} />
        Aperçu de démonstration : aucun débit réel n'est effectué. Dans l'app Android, ce flux est également
        simulé (attestations générées côté client).
      </p>

      <Sheet open={Boolean(paying)} onClose={closePayment} title="Paiement Mobile Money">
        {paying && (
          <div className="pay">
            <div className="pay-summary">
              <div>
                <span className="eyebrow">Attestation</span>
                <strong>{paying.title}</strong>
              </div>
              <span className="pay-amount">{formatFcfa(paying.priceFcfa)}</span>
            </div>

            <label className="field">
              <span>Opérateur</span>
              <div className="providers">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`provider ${provider === p.id ? 'active' : ''}`}
                    onClick={() => setProvider(p.id)}
                  >
                    <strong>{p.id}</strong>
                    <small>{p.hint}</small>
                  </button>
                ))}
              </div>
            </label>

            {provider !== 'Carte bancaire' && (
              <label className="field">
                <span>Numéro Mobile Money</span>
                <div className="input-wrap">
                  <Icon name="phone" size={17} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="97 00 00 14" />
                </div>
              </label>
            )}

            <div className="pay-note">
              <Icon name="lock" size={14} />
              Transaction chiffrée · confirmation par webhook signé (simulé ici)
            </div>

            <Btn full icon="check" onClick={confirm} disabled={processing}>
              {processing ? 'Traitement en cours…' : `Confirmer ${formatFcfa(paying.priceFcfa)}`}
            </Btn>
            <button type="button" className="link center" onClick={closePayment} disabled={processing}>
              Annuler
            </button>
          </div>
        )}
      </Sheet>

      <Sheet open={Boolean(viewing)} onClose={() => setViewing(null)} title="Attestation officielle" wide>
        {viewing && (
          <div className="certificate">
            <div className="cert-frame">
              <span className="cert-brand">AFRICASKILLS · CERTIFICATION</span>
              <h2>{viewing.title}</h2>
              <p className="cert-recipient">Décernée à</p>
              <p className="cert-name">{state.account?.name ?? viewing.recipientName}</p>
              <p className="cert-desc">
                Pour la validation des compétences du parcours <strong>{viewing.domainName}</strong>, niveau {viewing.tier}.
              </p>
              <div className="cert-footer">
                <div>
                  <span className="cert-sign">{viewing.expertSigner}</span>
                  <small>{viewing.expertRole}</small>
                </div>
                <div className="cert-qr" aria-hidden="true" />
              </div>
              <div className="cert-meta">
                <span>N° {viewing.certificateNumber}</span>
                <span>Délivrée le {paidInfo(viewing)?.date ?? viewing.issueDate}</span>
              </div>
              <a className="cert-url" href={viewing.verificationUrl} target="_blank" rel="noreferrer">
                {viewing.verificationUrl}
              </a>
            </div>
            <p className="disclaimer">
              <Icon name="shield" size={14} />
              Attestation de démonstration : l'URL de vérification pointe vers un domaine fictif et le document
              est généré localement.
            </p>
          </div>
        )}
      </Sheet>
    </div>
  )
}
