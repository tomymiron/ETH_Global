/**
 * Utilidades para Session Keys y JWT
 * Basado en: https://github.com/erc7824/nitrolite-example/blob/final-p2p-transfer/docs/chapter-3-session-auth.md
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

// Session key management
const SESSION_KEY_STORAGE = 'yellow_payment_session_key';
const JWT_KEY = 'yellow_payment_jwt_token';

/**
 * Genera una nueva session key (par de claves)
 * @returns {{privateKey: string, address: string}}
 */
export const generateSessionKey = () => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return { privateKey, address: account.address };
};

/**
 * Obtiene la session key almacenada en localStorage
 * @returns {{privateKey: string, address: string}|null}
 */
export const getStoredSessionKey = () => {
  try {
    const stored = localStorage.getItem(SESSION_KEY_STORAGE);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!parsed.privateKey || !parsed.address) return null;

    return parsed;
  } catch {
    return null;
  }
};

/**
 * Almacena la session key en localStorage
 * @param {{privateKey: string, address: string}} sessionKey
 */
export const storeSessionKey = (sessionKey) => {
  try {
    localStorage.setItem(SESSION_KEY_STORAGE, JSON.stringify(sessionKey));
  } catch {
    // Storage failed - continue without caching
  }
};

/**
 * Elimina la session key de localStorage
 */
export const removeSessionKey = () => {
  try {
    localStorage.removeItem(SESSION_KEY_STORAGE);
  } catch {
    // Removal failed - not critical
  }
};

/**
 * Obtiene el JWT token almacenado
 * @returns {string|null}
 */
export const getStoredJWT = () => {
  try {
    return localStorage.getItem(JWT_KEY);
  } catch {
    return null;
  }
};

/**
 * Almacena el JWT token
 * @param {string} token
 */
export const storeJWT = (token) => {
  try {
    localStorage.setItem(JWT_KEY, token);
  } catch {}
};

/**
 * Elimina el JWT token
 */
export const removeJWT = () => {
  try {
    localStorage.removeItem(JWT_KEY);
  } catch {}
};

