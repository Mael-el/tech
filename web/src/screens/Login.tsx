import React, { useState } from 'react'
import { Icon } from '../components/Icon'
import { Btn, Card } from '../components/ui'
import { ENGLISH_LEVELS, useApp } from '../store'

export function LoginScreen() {
  const { login, register, notify } = useApp()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [level, setLevel] = useState('A1')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const message =
      mode === 'login' ? login(email, password) : register(name, email, password, city, level)
    setError(message)
    if (!message) notify(mode === 'login' ? 'Connexion réussie. Bon apprentissage !' : 'Compte créé. Bienvenue !')
  }

  return (
    <div className="login">
      <div className="login-hero">
        <div className="brandmark">
          <img src="/img/logo.jpg" alt="AfricaSkills" />
        </div>
        <div>
          <h1>AfricaSkills</h1>
          <p>Apprendre, certifier, entreprendre — partout en Afrique.</p>
        </div>
      </div>

      <div className="login-badges">
        <span><Icon name="shield" size={14} /> Offline-first</span>
        <span><Icon name="award" size={14} /> Badges vérifiés</span>
        <span><Icon name="globe" size={14} /> 14 domaines</span>
      </div>

      <Card className="login-card">
        <div className="segmented">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setError(null)
            }}
          >
            Connexion
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => {
              setMode('signup')
              setError(null)
            }}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={submit} className="form">
          {mode === 'signup' && (
            <label className="field">
              <span>Nom complet</span>
              <div className="input-wrap">
                <Icon name="user" size={17} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Awa Sossou"
                  autoComplete="name"
                />
              </div>
            </label>
          )}

          <label className="field">
            <span>Adresse e-mail</span>
            <div className="input-wrap">
              <Icon name="mail" size={17} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.org"
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </label>

          {mode === 'signup' && (
            <label className="field">
              <span>Ville</span>
              <div className="input-wrap">
                <Icon name="pin" size={17} />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cotonou, Bénin"
                  autoComplete="address-level2"
                />
              </div>
            </label>
          )}

          <label className="field">
            <span>Mot de passe</span>
            <div className="input-wrap">
              <Icon name="lock" size={17} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" className="reveal" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Masquer' : 'Voir'}
              </button>
            </div>
          </label>

          {mode === 'signup' && (
            <label className="field">
              <span>Niveau d'anglais estimé</span>
              <div className="select-wrap">
                <Icon name="globe" size={17} />
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  {ENGLISH_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          )}

          {error && (
            <p className="form-error" role="alert">
              <Icon name="close" size={14} />
              {error}
            </p>
          )}

          <Btn type="submit" full icon={mode === 'login' ? 'user' : 'check'}>
            {mode === 'login' ? 'Se connecter' : "S'inscrire gratuitement"}
          </Btn>
        </form>

      </Card>

      <p className="login-note">
        Port web du projet Android <em>AfricaSkills</em> (Kotlin + Jetpack Compose). Votre compte, vos cours et vos
        candidatures sont enregistrés dans ce navigateur, sans serveur : aucun mot de passe ne quitte l'appareil.
      </p>
    </div>
  )
}
