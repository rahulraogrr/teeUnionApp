/**
 * storage.ts — Secure credential storage
 *
 * SECURITY (OWASP M2 — Insecure Data Storage):
 *   - JWT access token  → react-native-keychain (iOS Keychain / Android Keystore)
 *     Hardware-backed, encrypted at rest, inaccessible to other apps.
 *   - Non-sensitive session data (role, employeeId, theme) → MMKV
 *     Fast synchronous reads; none of these values are security-sensitive.
 *
 * All token operations are async because the Keychain API is async.
 */

import { MMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';

// ── MMKV — non-sensitive data only ────────────────────────────────────────────
export const storage = new MMKV({ id: 'tee-union-storage' });

const MMKV_KEYS = {
  USER_ROLES:          'userRoles',        // JSON array e.g. '["admin","rep"]'
  USER_ID:             'userId',
  EMPLOYEE_ID:         'employeeId',
  REQUIRES_PIN_CHANGE: 'requiresPinChange',
  THEME:               'theme',
} as const;

/** Keychain service name — groups all our credentials under one entry */
const KEYCHAIN_SERVICE = 'tee-union-jwt';

// ── Token storage (Keychain / Keystore) ────────────────────────────────────────

/**
 * Stores the JWT in the OS secure enclave.
 * On iOS: Keychain (kSecClassGenericPassword, encrypted by Secure Enclave).
 * On Android: Android Keystore (AES-256 encrypted).
 */
export async function setToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('jwt', token, {
    service:    KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    // SECURE_HARDWARE is not available on iOS Simulator — use SECURE_SOFTWARE
    // which falls back to hardware automatically on real devices.
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
  });
}

/**
 * Retrieves the JWT from secure storage.
 * Returns null if no token is stored or the Keychain is unavailable.
 */
export async function getToken(): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    return creds ? creds.password : null;
  } catch {
    return null;
  }
}

/** Removes the JWT from secure storage (call on logout). */
export async function removeToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
}

// ── Non-sensitive session data (MMKV — sync) ──────────────────────────────────

export const sessionStorage = {
  setUser: (data: {
    userId: string;
    roles: string[];
    employeeId: string;
    requiresPinChange: boolean;
  }) => {
    storage.set(MMKV_KEYS.USER_ID,             data.userId);
    storage.set(MMKV_KEYS.USER_ROLES,          JSON.stringify(data.roles));
    storage.set(MMKV_KEYS.EMPLOYEE_ID,         data.employeeId);
    storage.set(MMKV_KEYS.REQUIRES_PIN_CHANGE, data.requiresPinChange);
  },

  getUser: () => {
    const rolesRaw = storage.getString(MMKV_KEYS.USER_ROLES);
    return {
      userId:            storage.getString(MMKV_KEYS.USER_ID),
      roles:             rolesRaw ? (JSON.parse(rolesRaw) as string[]) : [],
      employeeId:        storage.getString(MMKV_KEYS.EMPLOYEE_ID),
      requiresPinChange: storage.getBoolean(MMKV_KEYS.REQUIRES_PIN_CHANGE) ?? false,
    };
  },

  /** Clears only non-sensitive MMKV data (token is cleared separately via removeToken) */
  clearSession: () => {
    storage.delete(MMKV_KEYS.USER_ID);
    storage.delete(MMKV_KEYS.USER_ROLES);
    storage.delete(MMKV_KEYS.EMPLOYEE_ID);
    storage.delete(MMKV_KEYS.REQUIRES_PIN_CHANGE);
  },
};

// ── Full logout helper ─────────────────────────────────────────────────────────

/**
 * Clears both the secure JWT (Keychain) and non-sensitive MMKV session data.
 * Call this on logout AFTER hitting the server's POST /auth/logout endpoint.
 */
export async function clearAllCredentials(): Promise<void> {
  await removeToken();
  sessionStorage.clearSession();
}

// ── Legacy alias (keeps backwards compatibility during migration) ──────────────
/** @deprecated Use the named exports (setToken, getToken, etc.) instead */
export const tokenStorage = {
  setToken,
  getToken,
  removeToken,
  setUser:  sessionStorage.setUser,
  getUser:  sessionStorage.getUser,
  clearAll: clearAllCredentials,
};
