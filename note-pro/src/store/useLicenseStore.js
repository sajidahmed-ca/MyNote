import { create } from 'zustand'
import { verifyLicenseKey } from '../lib/license'

const STORAGE_KEY = 'mynote-pro-license-v1'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useLicenseStore = create((set) => ({
  activated: Boolean(readStored()?.license),
  license: readStored()?.license || null,
  error: '',
  busy: false,

  activate: async (licenseKey) => {
    set({ busy: true, error: '' })
    const result = await verifyLicenseKey(licenseKey)
    if (!result.valid) {
      set({ busy: false, error: result.error })
      return false
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ license: result.license }))
    set({ activated: true, license: result.license, busy: false })
    return true
  },

  deactivate: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ activated: false, license: null, error: '' })
  },
}))

export const licenseErrorLabel = (code) => {
  const map = {
    INVALID_FORMAT: 'This does not look like a valid license key.',
    BAD_KEY_ID: 'This key was issued by a different seller/version.',
    BAD_PAYLOAD: 'The key payload could not be read.',
    BAD_LICENSE: 'This key is not a valid MyNote Pro license.',
    BAD_SIGNATURE: 'The key signature does not validate.',
    EXPIRED: 'This license has expired.',
    NO_CRYPTO: 'Your browser does not support secure key verification.',
    VERIFY_FAILED: 'The key could not be verified.',
  }
  return map[code] || 'Activation failed. Please check the key and try again.'
}