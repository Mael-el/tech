/**
 * Attestations autoportantes : le code contient les données du certificat et une
 * empreinte d'intégrité. Il peut être vérifié sans serveur (page #/verifier/<code>),
 * mais ne remplace pas une signature d'un tiers de confiance.
 */

export interface CertificatePayload {
  v: 1
  n: string
  c: string
  t: string
  d: string
}

const SALT = 'africaskills.certificate.v1'

function fnv1a(input: string, seed = 0x811c9dc5): number {
  let hash = seed >>> 0
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

export function checksum(input: string): string {
  const a = fnv1a(input).toString(16).padStart(8, '0')
  const b = fnv1a(input, fnv1a(SALT)).toString(16).padStart(8, '0')
  return `${a}${b}`
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeCertificate(payload: CertificatePayload): string {
  const body = toBase64Url(JSON.stringify(payload))
  return `${body}.${checksum(body)}`
}

export interface VerificationResult {
  valid: boolean
  payload?: CertificatePayload
  reason?: string
}

export function verifyCertificate(code: string): VerificationResult {
  const trimmed = code.trim()
  const [body, signature] = trimmed.split('.')
  if (!body || !signature) return { valid: false, reason: 'Code incomplet' }

  let payload: CertificatePayload
  try {
    payload = JSON.parse(fromBase64Url(body)) as CertificatePayload
  } catch {
    return { valid: false, reason: 'Code illisible' }
  }

  if (payload.v !== 1 || !payload.n || !payload.c || !payload.t || !payload.d) {
    return { valid: false, reason: 'Données du certificat incomplètes' }
  }
  if (checksum(body) !== signature) {
    return { valid: false, payload, reason: 'Empreinte d’intégrité invalide' }
  }
  return { valid: true, payload }
}

/** Date ISO courte utilisée dans le certificat. */
export function certificateDate(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}
