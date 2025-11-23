/**
 * Payment Configuration - TESTNET MODE (Mock Payments)
 * 
 * Configuración del pago hardcodeado para TESTNET (red de pruebas) con pagos mock.
 * Basado en:
 * - Documentación oficial: https://docs.yellow.org/docs/build/quick-start/
 * - Ejemplo Cerebro: https://github.com/erc7824/nitrolite/tree/main/examples/cerebro
 * 
 * TESTNET usa: wss://clearnet-sandbox.yellow.com/ws (pagos mock, no requieren fondos reales)
 */

/**
 * Modo de red: 'testnet' o 'mainnet'
 * 'testnet' = Sandbox para pagos mock
 */
export const NETWORK_MODE = 'testnet';

/**
 * Monto del pago en ETH - Modo TESTNET
 * Usamos valores pequeños para pruebas en Sepolia
 */
export const HARD_CODED_AMOUNT_USD = 0.01; // 0.01 ETH para pruebas

/**
 * Monto del pago en unidades (ETH tiene 18 decimales)
 * 1 ETH = 1,000,000,000,000,000,000 wei (10^18)
 * 0.01 ETH = 10,000,000,000,000,000 wei
 */
export const HARD_CODED_AMOUNT_UNITS = '10000000000000000'; // 0.01 ETH en wei

/**
 * Símbolo del activo criptográfico
 * ETH en Sepolia testnet
 */
export const PAYMENT_ASSET_SYMBOL = 'SepoliaETH';

/**
 * Dirección del receptor del pago (TESTNET)
 * NOTA: En una app real, esto debería venir de configuración o ser dinámico
 * Esta es una dirección de ejemplo para testnet
 */
export const RECEIVER_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'; // Dirección de prueba en testnet

/**
 * URL del ClearNode de Yellow Network
 * TESTNET: Yellow Sandbox (clearnet-sandbox.yellow.com/ws)
 * MAINNET: Yellow Network Production (clearnet.yellow.com/ws)
 * 
 * Basado en: https://github.com/erc7824/nitrolite/tree/main/examples/cerebro
 */
export const YELLOW_CLEARNODE_URL = NETWORK_MODE === 'testnet' 
  ? 'wss://clearnet-sandbox.yellow.com/ws' // Sandbox/testnet para pagos mock
  : 'wss://clearnet.yellow.com/ws'; // URL de mainnet (producción)

/**
 * Indicador visual de que estamos en modo testnet
 */
export const IS_TESTNET = NETWORK_MODE === 'testnet';

