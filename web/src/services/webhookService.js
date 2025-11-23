/**
 * Servicio de Webhook
 * 
 * Envía notificaciones al backend después de un pago exitoso.
 */

/**
 * Notifica al backend mediante webhook después de un pago exitoso
 * @param {Object} paymentResult - Resultado del pago desde Yellow SDK
 * @returns {Promise<void>}
 */
export async function notifyBackendWebhook(paymentResult) {
  const webhookUrl = import.meta.env.VITE_BACKEND_WEBHOOK_URL || 
    'https://api.previateesta.com/yellow/payment-callback';

  const payload = {
    event: 'YELLOW_PAYMENT_SUCCESS',
    txId: paymentResult.txId,
    amount: paymentResult.amount,
    asset: paymentResult.asset,
    network: paymentResult.network,
    timestamp: new Date().toISOString(),
    metadata: paymentResult.metadata,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Backend webhook notificado exitosamente', payload);
  } catch (error) {
    // Registrar error pero no lanzar - el pago ya fue exitoso
    console.error('❌ Error notificando backend webhook:', error);
    console.warn('⚠️ El pago fue exitoso, pero falló la notificación al backend. Detalles:', payload);
    throw error; // Re-lanzar para que la UI pueda manejarlo
  }
}

