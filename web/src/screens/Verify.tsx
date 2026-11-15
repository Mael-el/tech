import React, { useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card } from '../components/ui'
import { verifyCertificate } from '../lib/certificate'
import { formatDateFR } from '../lib/format'

/**
 * Page publique de vérification : elle ne dépend d'aucun compte ni d'aucun stockage.
 * Tout est contenu dans le code présent dans l'URL.
 */
export function VerifyScreen({
  code,
  onHome,
  onVerify,
}: {
  code: string | undefined
  onHome: () => void
  onVerify: (code: string) => void
}) {
  const result = code ? verifyCertificate(decodeURIComponent(code)) : { valid: false, reason: 'Aucun code fourni' }
  const [draft, setDraft] = useState('')

  return (
    <div className="screen verify-screen">
      <div className="verify-brand">
        <img src="/img/logo-192.jpg" alt="" />
        <div>
          <strong>AfricaSkills</strong>
          <small>Vérification de certificat</small>
        </div>
      </div>
      <header className="screen-head">
        <h1>Vérification de certificat</h1>
        <p>Contrôle local de l’empreinte d’intégrité, sans serveur.</p>
      </header>

      <Card className={`verify-card ${result.valid ? 'ok' : 'ko'}`}>
        <span className="verify-icon">
          <Icon name={result.valid ? 'shield' : 'close'} size={26} />
        </span>
        <h2>{result.valid ? 'Code valide' : 'Code non valide'}</h2>
        <p>{result.valid ? 'L’empreinte correspond au contenu du certificat.' : result.reason}</p>
      </Card>

      <Card className="form-card">
        <h3>Vérifier un autre code</h3>
        <form
          className="net-form"
          onSubmit={(event) => {
            event.preventDefault()
            const value = draft.trim().split('/').pop() ?? ''
            if (value) onVerify(value)
          }}
        >
          <label className="field">
            <span>Code du certificat ou lien complet</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Collez le code ou le lien reçu…"
              autoComplete="off"
            />
          </label>
          <Btn type="submit" full icon="shield">
            Vérifier
          </Btn>
        </form>
      </Card>

      {result.valid && result.payload && (
        <Card className="verify-details">
          <div>
            <span>Titulaire</span>
            <strong>{result.payload.n}</strong>
          </div>
          <div>
            <span>Cours</span>
            <strong>{result.payload.t}</strong>
          </div>
          <div>
            <span>Date de délivrance</span>
            <strong>{formatDateFR(new Date(`${result.payload.d}T12:00:00`))}</strong>
          </div>
          <div>
            <span>Identifiant</span>
            <strong className="mono">{result.payload.c}</strong>
          </div>
        </Card>
      )}

      <p className="disclaimer">
        <Icon name="info" size={14} />
        Cette page confirme qu’un code n’a pas été modifié depuis son émission par AfricaSkills. Elle ne remplace pas
        une vérification d’identité ni une signature d’un organisme certificateur.
      </p>

      <button type="button" className="link center" onClick={onHome}>
        Aller à l’application
      </button>
    </div>
  )
}
