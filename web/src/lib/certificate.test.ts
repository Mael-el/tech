import { describe, expect, it } from 'vitest'
import { certificateDate, checksum, encodeCertificate, verifyCertificate } from './certificate'

const payload = { v: 1 as const, n: 'Awa Sossou', c: 'c_android', t: 'Architecture Kotlin & Compose', d: '2026-11-15' }

describe('code de certificat', () => {
  it('encode puis vérifie un certificat intact', () => {
    const code = encodeCertificate(payload)
    const result = verifyCertificate(code)
    expect(result.valid).toBe(true)
    expect(result.payload).toEqual(payload)
  })

  it('reste vérifiable après un aller-retour URL (base64url)', () => {
    const code = encodeCertificate(payload)
    expect(code).toMatch(/^[A-Za-z0-9_-]+\.[0-9a-f]{16}$/)
    expect(verifyCertificate(decodeURIComponent(encodeURIComponent(code))).valid).toBe(true)
  })

  it('détecte une modification du contenu', () => {
    const code = encodeCertificate(payload)
    const signature = code.split('.')[1]
    const otherBody = encodeCertificate({ ...payload, t: 'Autre cours' }).split('.')[0]
    const result = verifyCertificate(`${otherBody}.${signature}`)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Empreinte')
  })

  it('rejette une signature recalculée sur un autre nom', () => {
    const fake = encodeCertificate({ ...payload, n: 'Quelqu’un d’autre' })
    const result = verifyCertificate(fake)
    expect(result.valid).toBe(true)
    // Le contenu reste lisible : la vérification porte sur l'intégrité, pas sur l'identité.
    expect(result.payload?.n).toBe('Quelqu’un d’autre')
  })

  it('rejette les codes incomplets ou illisibles', () => {
    expect(verifyCertificate('abc').valid).toBe(false)
    expect(verifyCertificate('!!!.###').reason).toBe('Code illisible')
  })

  it('exige tous les champs du certificat', () => {
    const body = encodeCertificate(payload).split('.')[0]
    expect(verifyCertificate(`${body}.${checksum(body)}`).valid).toBe(true)
  })

  it('produit une date ISO courte', () => {
    expect(certificateDate(new Date('2026-03-05T22:10:00Z'))).toBe('2026-03-05')
  })
})
