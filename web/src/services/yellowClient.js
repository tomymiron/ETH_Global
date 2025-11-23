/**
 * Yellow SDK Client Service - VERSION 5.1 - TRANSFER RPC
 * 
 * Implementación completa basada en documentación oficial:
 * - https://github.com/erc7824/nitrolite-example/blob/final-p2p-transfer/docs/chapter-3-session-auth.md
 * - https://docs.yellow.org/docs/protocol/implementation-checklist
 * 
 * VERSION 5.1: Autenticación EIP-712 + Transfer RPC (NO app sessions)
 * - Usa método 'transfer' para pagos peer-to-peer simples
 * - NO usa 'create_app_session' (solo para apps complejas)
 */

console.log('🔧 [yellowClient.js] VERSION 5.1 - Transfer RPC method loaded');

import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  parseAnyRPCResponse,
  RPCMethod,
  createAppSessionMessage,
  createTransferMessage,
  createECDSAMessageSigner,
  parseTransferResponse
} from '@erc7824/nitrolite';

import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

import {
  HARD_CODED_AMOUNT_UNITS, 
  PAYMENT_ASSET_SYMBOL,
  RECEIVER_ADDRESS,
  YELLOW_CLEARNODE_URL,
  NETWORK_MODE,
  IS_TESTNET
} from '../config/paymentConfig.js';

import {
  generateSessionKey,
  getStoredSessionKey,
  storeSessionKey,
  removeSessionKey,
  storeJWT,
  removeJWT,
  getStoredJWT
} from '../lib/utils.js';

// Estado global del cliente
let ws = null;
let walletClient = null;
let userAddress = null;
let sessionKey = null;
let isAuthenticated = false;
let sessionId = null;
let sessionCreated = false;

// Guards
let isConnectingWallet = false;
let isConnectingWebSocket = false;

// Constantes de autenticación (según documentación oficial)
const AUTH_SCOPE = 'yellow-payment-demo.app';
const APP_NAME = 'Yellow Payment Demo';
const SESSION_DURATION = 3600; // 1 hora

/**
 * EIP-712 domain para autenticación
 * Según documentación oficial de Nitrolite
 */
const getAuthDomain = () => ({
  name: APP_NAME,
});

/**
 * Configura el wallet (MetaMask) y crea el wallet client para EIP-712
 * VERSION 5.0: Usa viem wallet client para firmar EIP-712
 * @returns {Promise<{userAddress: string, walletClient: Object}>}
 */
export async function setupWallet() {
  // Si ya está configurado, devolver inmediatamente
  if (walletClient && userAddress) {
    console.log('✅ Wallet ya configurado:', userAddress);
    return { userAddress, walletClient };
  }

  // Guard
  if (isConnectingWallet) {
    console.log('⏳ Conexión de wallet ya en progreso, esperando...');
    for (let i = 0; i < 300; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!isConnectingWallet && walletClient && userAddress) {
        return { userAddress, walletClient };
      }
    }
  }

  isConnectingWallet = true;

  try {
    if (!window.ethereum) {
      const error = new Error('MetaMask no está instalado');
      error.code = 'NO_WALLET';
      error.details = 'Por favor instala MetaMask desde https://metamask.io/ y recarga la página';
      throw error;
    }

    console.log('📱 Solicitando conexión con MetaMask...');

    // Primero obtener la dirección
    const tempClient = createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum),
    });
    const [address] = await tempClient.requestAddresses();

    // Crear wallet client con account para EIP-712 signing
    const client = createWalletClient({
      account: address,
      chain: mainnet,
      transport: custom(window.ethereum),
    });

    // Guardar en variables globales
    userAddress = address;
    walletClient = client;
    
    console.log('✅ Wallet conectado exitosamente:', address);
    console.log('✅ Wallet client creado con soporte EIP-712');
    
    return { userAddress: address, walletClient: client };
  } catch (error) {
    if (error.code === -32002) {
      console.warn('⚠️ Ya hay una solicitud de permisos pendiente en MetaMask');
      throw new Error('Ya hay una solicitud de conexión pendiente. Por favor, revisa MetaMask y acepta o rechaza la solicitud anterior.');
    }
    throw error;
  } finally {
    isConnectingWallet = false;
  }
}

/**
 * Inicializa o recupera la session key
 * Según documentación: debe persistir en localStorage
 * @returns {{privateKey: string, address: string}}
 */
export function initializeSessionKey() {
  if (sessionKey) {
    return sessionKey;
  }

  // Intentar recuperar de localStorage
  const stored = getStoredSessionKey();
  if (stored) {
    console.log('✅ Session key recuperada de localStorage:', stored.address);
    sessionKey = stored;
    return stored;
  }

  // Generar nueva session key
  const newSessionKey = generateSessionKey();
  storeSessionKey(newSessionKey);
  sessionKey = newSessionKey;
  console.log('✅ Nueva session key generada:', newSessionKey.address);
  
  return newSessionKey;
}

/**
 * Verifica si el WebSocket está conectado
 * @returns {boolean}
 */
function isWebSocketConnected() {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

/**
 * Asegura que el WebSocket esté conectado
 * @returns {Promise<WebSocket>}
 */
export async function ensureWebSocketConnected() {
  if (isWebSocketConnected()) {
    console.log('✅ WebSocket ya está conectado');
    return ws;
  }

  if (ws && (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING)) {
    console.log('🔌 Limpiando conexión WebSocket anterior...');
    ws.onclose = null;
    ws.onerror = null;
    ws = null;
  }

  console.log('🔄 Reconectando a Yellow Network...');
  return await initializeYellowClient();
}

/**
 * Inicializa la conexión WebSocket con Yellow Network
 * VERSION 5.0: NO hace autenticación aquí (se hace desde App.jsx)
 * @returns {Promise<WebSocket>}
 */
export async function initializeYellowClient() {
  if (!userAddress || !walletClient) {
    throw new Error('Wallet no configurado. Llama a setupWallet() primero.');
  }

  if (isWebSocketConnected()) {
    console.log('✅ Ya hay una conexión WebSocket activa');
    return ws;
  }

  if (isConnectingWebSocket) {
    console.log('⏳ Conexión WebSocket ya en progreso, esperando...');
    for (let i = 0; i < 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!isConnectingWebSocket && ws && ws.readyState === WebSocket.OPEN) {
        return ws;
      }
    }
  }

  isConnectingWebSocket = true;

  console.log('🌐 Conectando a Yellow Network...', {
    url: YELLOW_CLEARNODE_URL,
    mode: NETWORK_MODE,
    environment: NETWORK_MODE === 'testnet' ? 'SANDBOX (Mock Payments)' : 'PRODUCTION'
  });
  
  ws = new WebSocket(YELLOW_CLEARNODE_URL);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close();
        isConnectingWebSocket = false;
        reject(new Error('Timeout: No se pudo conectar a Yellow Network después de 10 segundos'));
      }
    }, 10000);

    ws.onopen = () => {
      clearTimeout(timeout);
      isConnectingWebSocket = false;
      console.log('✅ Conectado a Yellow Network!', NETWORK_MODE === 'testnet' ? '(SANDBOX - Mock Payments)' : '(MAINNET - Production)');
      console.log('📡 WebSocket readyState:', ws.readyState, '(OPEN = 1)');
      console.log('💡 Listo para autenticación automática desde App.jsx');
      resolve(ws);
    };

    ws.onmessage = (event) => {
      // Los mensajes se manejarán desde App.jsx con listeners
      console.log('📨 Mensaje WebSocket recibido (será manejado por listeners)');
    };

    ws.onerror = (error) => {
      clearTimeout(timeout);
      isConnectingWebSocket = false;
      console.error('❌ Error de conexión WebSocket:', error);
      reject(new Error(`Error conectando a Yellow Network: ${error.message || 'Conexión fallida'}`));
    };

    ws.onclose = (event) => {
      clearTimeout(timeout);
      console.log('🔌 Conexión cerrada con Yellow Network', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      isAuthenticated = false;
      sessionCreated = false;
      sessionId = null;
    };
  });
}

/**
 * Inicia el flujo de autenticación automática (paso 1)
 * Según documentación oficial de Nitrolite
 * @returns {Promise<void>}
 */
export async function startAuthentication() {
  if (!userAddress || !walletClient) {
    throw new Error('Wallet no configurado');
  }

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket no conectado');
  }

  // Inicializar session key
  const sessKey = initializeSessionKey();

  // Generar timestamp de expiración (CRÍTICO: debe ser el mismo en auth_request y auth_verify)
  const expireTimestamp = String(Math.floor(Date.now() / 1000) + SESSION_DURATION);

  console.log('🔐 Paso 1/3: Enviando auth_request...');
  console.log('📝 Session key:', sessKey.address);
  console.log('📝 Expire timestamp:', expireTimestamp);

  const authParams = {
    address: userAddress,
    session_key: sessKey.address,
    app_name: APP_NAME,
    expire: expireTimestamp,
    scope: AUTH_SCOPE,
    application: userAddress,
    allowances: [],
  };

  const authRequestPayload = await createAuthRequestMessage(authParams);
  ws.send(authRequestPayload);
  
  console.log('✅ auth_request enviado');

  // Retornar el expire timestamp para usarlo en auth_verify
  return { expireTimestamp };
}

/**
 * Maneja el auth_challenge y envía auth_verify (pasos 2 y 3)
 * @param {Object} challengeResponse - Respuesta del servidor con el challenge
 * @param {string} expireTimestamp - El mismo timestamp usado en auth_request
 * @returns {Promise<void>}
 */
export async function handleAuthChallenge(challengeResponse, expireTimestamp) {
  if (!walletClient || !sessionKey || !userAddress) {
    throw new Error('Estado de autenticación inválido');
  }

  console.log('📝 Paso 2/3: Recibido auth_challenge');
  console.log('📝 Paso 3/3: Firmando con EIP-712...');

  const authParams = {
    scope: AUTH_SCOPE,
    application: userAddress,
    participant: sessionKey.address,
    expire: expireTimestamp, // CRÍTICO: usar el mismo timestamp
    allowances: [],
  };

  // Crear el firmador EIP-712 según documentación oficial
  const eip712Signer = createEIP712AuthMessageSigner(
    walletClient,
    authParams,
    getAuthDomain()
  );

  try {
    // Crear y enviar auth_verify
    const authVerifyPayload = await createAuthVerifyMessage(eip712Signer, challengeResponse);
    ws.send(authVerifyPayload);
    console.log('✅ auth_verify enviado con firma EIP-712');
  } catch (error) {
    console.error('❌ Error al firmar:', error);
    throw new Error('Firma rechazada por el usuario o error al firmar');
  }
}

/**
 * Marca la autenticación como completada
 * @param {string} jwtToken - Token JWT opcional del servidor
 */
export function setAuthenticationComplete(jwtToken) {
  isAuthenticated = true;
  if (jwtToken) {
    storeJWT(jwtToken);
    console.log('✅ JWT token almacenado');
  }
  console.log('✅ Autenticación completada exitosamente');
}

/**
 * Añade un listener para mensajes del WebSocket
 * @param {Function} handler - Función que maneja los mensajes
 */
export function addMessageListener(handler) {
  if (ws) {
    const wrappedHandler = (event) => {
      try {
        const data = JSON.parse(event.data);
        handler(data);
      } catch (error) {
        console.error('❌ Error parseando mensaje:', error);
      }
    };
    ws.addEventListener('message', wrappedHandler);
    return () => ws.removeEventListener('message', wrappedHandler);
  }
  return () => {};
}

/**
 * Envía un mensaje por el WebSocket
 * @param {string} payload - Payload JSON-RPC formateado
 */
export function sendMessage(payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(payload);
  } else {
    throw new Error('WebSocket no conectado');
  }
}

/**
 * Obtiene la dirección del usuario conectado
 * @returns {string|null}
 */
export function getUserAddress() {
  return userAddress;
}

/**
 * Obtiene el wallet client
 * @returns {Object|null}
 */
export function getWalletClient() {
  return walletClient;
}

/**
 * Obtiene la session key actual
 * @returns {Object|null}
 */
export function getSessionKey() {
  return sessionKey;
}

/**
 * Verifica si está autenticado
 * @returns {boolean}
 */
export function getIsAuthenticated() {
  return isAuthenticated;
}

/**
 * Obtiene el estado de conexión
 * @returns {Object}
 */
export function getConnectionStatus() {
  if (!ws) {
    return { connected: false, state: 'NOT_INITIALIZED', readyState: null };
  }
  
  const states = {
    0: 'CONNECTING',
    1: 'OPEN',
    2: 'CLOSING',
    3: 'CLOSED'
  };
  
  return {
    connected: ws.readyState === WebSocket.OPEN,
    state: states[ws.readyState] || 'UNKNOWN',
    readyState: ws.readyState,
    url: ws.url || YELLOW_CLEARNODE_URL,
    authenticated: isAuthenticated
  };
}

/**
 * Desconecta y limpia el cliente
 * @returns {Promise<void>}
 */
export async function disconnectYellowClient() {
  if (ws) {
    ws.close();
    ws = null;
  }
  isAuthenticated = false;
  sessionCreated = false;
  sessionId = null;
  walletClient = null;
  userAddress = null;
  // NO limpiar sessionKey para mantener persistencia
  console.log('🔌 Cliente desconectado');
}

/**
 * Envía una transferencia peer-to-peer usando el método RPC 'transfer'
 * Este es el método CORRECTO para pagos simples según Nitrolite docs
 * NO usa app sessions - usa transferencias directas del unified balance
 * @param {string} recipientAddress - Dirección del receptor
 * @param {string} amount - Monto en unidades (ej: 10000000000000000 = 0.01 ETH en wei)
 * @param {string} asset - Dirección del contrato del token (0x0000... para ETH nativo)
 * @returns {Promise<Object>}
 */
export async function sendTransferRPC(recipientAddress, amount, asset) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket no conectado');
  }

  if (!walletClient || !userAddress) {
    throw new Error('Wallet no configurado');
  }

  if (!isAuthenticated) {
    throw new Error('No autenticado. Completa la autenticación primero.');
  }

  console.log('💸 Enviando transferencia RPC...');

  // Crear parámetros de transferencia según documentación Nitrolite
  // CRÍTICO: Según el error "allocations cannot be empty", se requieren allocations
  const transferParams = {
    destination: recipientAddress.toLowerCase(),
    asset: asset.toLowerCase(),
    amount: amount,
    destination_tag: '',
    // Agregar allocations según el error del servidor
    allocations: [
      {
        participant: recipientAddress.toLowerCase(),
        asset: asset.toLowerCase(),
        amount: amount
      }
    ]
  };

  console.log('📋 Transfer params:', JSON.stringify(transferParams, null, 2));

  // USAR FUNCIONES OFICIALES DEL SDK DE NITROLITE
  console.log('✍️ Creando mensaje de transferencia con SDK oficial de Nitrolite...');
  
  if (!sessionKey || !sessionKey.privateKey) {
    throw new Error('Session key no disponible');
  }

  // Crear firmador ECDSA con la session key (función oficial del SDK)
  const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);
  
  console.log('✅ Session signer creado con session key');

  // Crear mensaje de transferencia usando la función oficial del SDK
  const transferMessage = await createTransferMessage(
    sessionSigner,
    transferParams
  );
  
  console.log('✅ Mensaje de transferencia creado por SDK oficial de Nitrolite');
  console.log('📋 Transfer message:', transferMessage.substring(0, 300) + '...');

  console.log('📤 Enviando transferencia al servidor...');
  ws.send(transferMessage);
  console.log('✅ Transferencia enviada!');

  // Esperar confirmación
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout esperando confirmación de transferencia'));
    }, 30000);

    const messageHandler = (data) => {
      try {
        const response = parseAnyRPCResponse(JSON.stringify(data));
        console.log('📨 Respuesta de transferencia:', response);

        // Buscar confirmación de transferencia (método 'tr' = transfer notification)
        if (response.method === 'tr' || response.method === 'transfer') {
          clearTimeout(timeout);
          
          const result = {
            status: 'success',
            txId: response.params?.id || `tx-${Date.now()}`,
            amount: parseFloat(amount) / 1e18, // Convertir de wei a ETH
            asset: PAYMENT_ASSET_SYMBOL,
            network: 'Yellow Network',
            metadata: {
              payerAddress: userAddress,
              receiverAddress: recipientAddress,
              timestamp: Date.now()
            }
          };
          
          console.log('✅ Transferencia confirmada:', result);
          resolve(result);
        } else if (response.method === RPCMethod.Error) {
          clearTimeout(timeout);
          reject(new Error(response.params?.error || 'Error en transferencia'));
        }
      } catch (error) {
        console.error('Error procesando respuesta de transferencia:', error);
      }
    };

    const removeListener = addMessageListener(messageHandler);
    
    setTimeout(() => {
      removeListener();
    }, 31000);
  });
}

/**
 * Ejecuta el flujo completo de pago usando Transfer RPC
 * VERSION 5.1: Usa transfer RPC directamente, NO app sessions
 * @returns {Promise<Object>}
 */
export async function createAndExecutePayment() {
  console.log('💳 Ejecutando pago completo...');
  
  // Asegurar conexión
  if (!isWebSocketConnected()) {
    console.log('⚠️ Reconectando...');
    await ensureWebSocketConnected();
  }

  if (!isAuthenticated) {
    throw new Error('No autenticado. Por favor conecta tu wallet primero.');
  }

  // Token SepoliaETH nativo en Yellow Network Sandbox
  // Para tokens nativos (ETH), se usa la dirección cero (0x0000...)
  // En Yellow Network, el ETH nativo se representa con esta dirección
  const TESTNET_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

  // IMPORTANTE: En Yellow Network, el destinatario debe estar registrado
  // Para testing, enviamos a nosotros mismos (self-transfer)
  // En producción, el destinatario debería estar autenticado en Yellow Network
  const destinationAddress = userAddress; // Self-transfer para testing
  
  console.log('💡 Enviando self-transfer para testing (de ti a ti mismo)');
  console.log('📝 Origen:', userAddress);
  console.log('📝 Destino:', destinationAddress);
  console.log('📝 Token: SepoliaETH (nativo)');

  // Ejecutar transferencia RPC (método correcto para pagos peer-to-peer)
  return await sendTransferRPC(
    destinationAddress, 
    HARD_CODED_AMOUNT_UNITS,
    TESTNET_ETH_ADDRESS
  );
}

console.log('✅ [yellowClient.js] VERSION 5.1 completamente cargado - Transfer RPC ready');

