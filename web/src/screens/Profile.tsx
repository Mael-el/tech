import React, { useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card } from '../components/ui'
import { Avatar } from '../components/ui'
import { coursesCompleted, currentTier, seed, useApp } from '../store'

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const { state, dispatch, notify, logout } = useApp()
  const account = state.account
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(account?.name ?? '')
  const [city, setCity] = useState(account?.city ?? '')
  const [phone, setPhone] = useState(account?.phone ?? '')
  const [bio, setBio] = useState(account?.bio ?? '')

  if (!account) return null

  const tier = currentTier(state)
  const paidCount = seed.attestations.filter((a) => state.attestations[a.id]).length

  const save = () => {
    dispatch({ type: 'UPDATE_PROFILE', patch: { name: name.trim() || account.name, city, phone, bio } })
    setEditing(false)
    notify('Profil mis à jour.')
  }

  return (
    <div className="screen profile">
      <div className="profile-head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Retour">
          <Icon name="back" size={20} />
        </button>
        <strong>Mon profil</strong>
        <button type="button" className="link" onClick={() => setEditing((v) => !v)}>
          {editing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      <div className="profile-hero">
        <Avatar name={account.name} size={74} />
        <h1>
          {account.name}
          {seed.profile.isVerified && <span className="verified-badge" title="Profil vérifié"><Icon name="check" size={12} /></span>}
        </h1>
        <p>{account.role}</p>
        <div className="profile-meta">
          <span><Icon name="pin" size={14} /> {account.city}</span>
          <span><Icon name="mail" size={14} /> {account.email}</span>
        </div>
        <span className="tier-pill" style={{ background: `${tier?.color}1f`, color: tier?.color, borderColor: `${tier?.color}55` }}>
          <Icon name="award" size={14} /> Badge {tier?.label ?? '—'}
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat"><span className="stat-icon" style={{ color: '#C2410C' }}><Icon name="sparkles" size={18} /></span><strong>{state.points.toLocaleString('fr-FR')}</strong><span>XP</span></div>
        <div className="stat"><span className="stat-icon" style={{ color: '#EA580C' }}><Icon name="flame" size={18} /></span><strong>{state.streak} j</strong><span>série</span></div>
        <div className="stat"><span className="stat-icon" style={{ color: '#1D4ED8' }}><Icon name="book" size={18} /></span><strong>{coursesCompleted(state)}</strong><span>cours</span></div>
        <div className="stat"><span className="stat-icon" style={{ color: '#059669' }}><Icon name="award" size={18} /></span><strong>{paidCount}/{seed.attestations.length}</strong><span>attestations</span></div>
      </div>

      {editing ? (
        <Card className="form">
          <label className="field">
            <span>Nom complet</span>
            <div className="input-wrap"><Icon name="user" size={17} /><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          </label>
          <label className="field">
            <span>Ville</span>
            <div className="input-wrap"><Icon name="pin" size={17} /><input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          </label>
          <label className="field">
            <span>Téléphone</span>
            <div className="input-wrap"><Icon name="phone" size={17} /><input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </label>
          <label className="field">
            <span>Bio</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </label>
          <Btn full icon="check" onClick={save}>Enregistrer</Btn>
        </Card>
      ) : (
        <Card>
          <span className="eyebrow">À propos</span>
          <p className="muted">{account.bio}</p>
          <div className="about-grid">
            <span><Icon name="phone" size={14} /> {account.phone}</span>
            <span><Icon name="mail" size={14} /> {account.email}</span>
            <span><Icon name="pin" size={14} /> {account.city}</span>
            <span><Icon name="globe" size={14} /> {seed.profile.englishLevel}</span>
          </div>
        </Card>
      )}

      <Card className="settings">
        <div className="setting-row">
          <div>
            <strong>Apparence</strong>
            <p>Thème clair ou sombre</p>
          </div>
          <div className="theme-toggle">
            <button
              type="button"
              className={state.theme === 'light' ? 'active' : ''}
              onClick={() => dispatch({ type: 'THEME', theme: 'light' })}
            >
              <Icon name="sun" size={15} /> Clair
            </button>
            <button
              type="button"
              className={state.theme === 'dark' ? 'active' : ''}
              onClick={() => dispatch({ type: 'THEME', theme: 'dark' })}
            >
              <Icon name="moon" size={15} /> Sombre
            </button>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Notifications</strong>
            <p>Rappels de révision et sessions live</p>
          </div>
          <label className="switch">
            <input type="checkbox" defaultChecked onChange={(e) => notify(e.target.checked ? 'Rappels activés.' : 'Rappels désactivés.')} />
            <span />
          </label>
        </div>

        <div className="setting-row">
          <div>
            <strong>Réinitialiser la démo</strong>
            <p>Efface la progression locale (XP, cartes, paiements)</p>
          </div>
          <Btn
            variant="ghost"
            icon="refresh"
            onClick={() => {
              dispatch({ type: 'RESET' })
              notify('Progression de démonstration réinitialisée.')
            }}
          >
            Réinitialiser
          </Btn>
        </div>
      </Card>

      <Btn variant="soft" full icon="logout" onClick={logout}>
        Se déconnecter
      </Btn>

      <p className="build-note">
        AfricaSkills · aperçu web du projet Android<br />
        Kotlin 2.2.10 · Jetpack Compose · Room 2.7 · minSdk 24
      </p>
    </div>
  )
}
