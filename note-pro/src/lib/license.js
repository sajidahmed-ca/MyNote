import { LICENSE_KEY_ID, LICENSE_PUBLIC_KEY_B64 } from './licensePublicKey'

/**
 * Verify a MyNote Pro license key in the browser using WebCrypto (Ed25519).
 * Key format: v1.<keyId>.<base64url(payloadJson)>.<base64url(signature)>
 * The signature covers the raw base64url payload string.
 */

const b64ToBytes = (b64) => {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i)
  return bytes
}

const b64urlToBytes = (s) => b64ToBytes(s.replace(/-/g, '+').replace(/_/g, '/'))
const bytesToText = (bytes) => new TextDecoder().decode(bytes)

export async function verifyLicenseKey(licenseKey) {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return { valid: false, error: 'INVALID_FORMAT' }
  }

  const parts = licenseKey.trim().split('.')
  if (parts.length !== 4 || parts[0] !== 'v1') {
    return { valid: false, error: 'INVALID_FORMAT' }
  }

  const [, keyId, payloadB64, signatureB64] = parts

  if (keyId !== LICENSE_KEY_ID) {
    return { valid: false, error: 'BAD_KEY_ID' }
  }

  let payload
  try {
    payload = JSON.parse(bytesToText(b64urlToBytes(payloadB64)))
  } catch {
    return { valid: false, error: 'BAD_PAYLOAD' }
  }

  if (!payload.name || !payload.email || payload.plan !== 'pro') {
    return { valid: false, error: 'BAD_LICENSE' }
  }

  if (payload.expiresAt && payload.expiresAt < Date.now()) {
    return { valid: false, error: 'EXPIRED' }
  }

  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return { valid: false, error: 'NO_CRYPTO' }
  }

  try {
    const keyBytes = b64ToBytes(LICENSE_PUBLIC_KEY_B64)
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'Ed25519' },
      false,
      ['verify'],
    )

    const data = new TextEncoder().encode(payloadB64)
    const signature = b64urlToBytes(signatureB64)
    const ok = await crypto.subtle.verify('Ed25519', key, signature, data)
    if (!ok) return { valid: false, error: 'BAD_SIGNATURE' }

    const license = {
      keyId,
      name: payload.name,
      email: payload.email,
      plan: payload.plan,
      id: payload.id,
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
    }
    return { valid: true, license }
  } catch {
    return { valid: false, error: 'VERIFY_FAILED' }
  }
}