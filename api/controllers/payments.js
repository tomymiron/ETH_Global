import { queryDatabase } from "../database/connect.js";

/**
 * Webhook handler for Yellow Network payment notifications
 * Based on dev.yellow.org documentation
 * 
 * Expected payload format from frontend:
 * {
 *   event: 'YELLOW_PAYMENT_SUCCESS',
 *   txId: string,
 *   amount: number,
 *   asset: string,
 *   network: string,
 *   timestamp: string (ISO),
 *   metadata: {
 *     payerAddress: string,
 *     receiverAddress: string,
 *     timestamp: number
 *   }
 * }
 */

//# --- POST:PAYMENTS_WEBHOOK | Yellow Payment Webhook --- ?//
//+ AUTH: OFF (webhook endpoint)
export const handlePaymentWebhook = async (req, res) => {
  try {
    const payload = req.body;

    // Validate required fields
    if (!payload || !payload.event) {
      console.error('❌ Webhook payload inválido:', payload);
      return res.status(400).json({ error: 'Payload inválido' });
    }

    // Only process successful payment events
    if (payload.event !== 'YELLOW_PAYMENT_SUCCESS') {
      console.log('⚠️ Evento no manejado:', payload.event);
      return res.status(200).json({ message: 'Evento no manejado' });
    }

    // Extract payment data
    const {
      txId,
      amount,
      asset,
      network,
      timestamp,
      metadata
    } = payload;

    // Validate required payment fields
    if (!txId || !amount || !metadata) {
      console.error('❌ Datos de pago incompletos:', payload);
      return res.status(400).json({ error: 'Datos de pago incompletos' });
    }

    const payerAddress = metadata.payerAddress;
    const receiverAddress = metadata.receiverAddress || payerAddress;

    if (!payerAddress) {
      console.error('❌ Dirección del pagador no encontrada');
      return res.status(400).json({ error: 'Dirección del pagador requerida' });
    }

    console.log('✅ Webhook de pago recibido:', {
      txId,
      amount,
      asset,
      network,
      payerAddress,
      receiverAddress
    });

    // TODO: Verificar que el pago no haya sido procesado antes (check txId duplicado)
    // Esto previene procesar el mismo pago múltiples veces

    // Extract event ID from metadata if available
    // Assuming the frontend sends eventId in metadata
    const eventId = metadata.eventId || null;
    const userId = metadata.userId || null;

      // Create ticket for the payment
      // Using stored procedure following the pattern of the rest of the API
      try {
        // Try using stored procedure first (recommended approach)
        // Stored procedure: a_payments_create_ticket(user_id, event_id, tx_id, amount, asset, payer_address, receiver_address, network)
        let result;
        
        try {
          result = await queryDatabase(
            "CALL a_payments_create_ticket(?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, eventId, txId, amount, asset || 'ETH', payerAddress, receiverAddress, network || 'Yellow Network']
          );
          
          console.log('✅ Pago y ticket creados mediante stored procedure');
          
          return res.status(200).json({
            success: true,
            message: 'Pago procesado y ticket creado exitosamente',
            data: result[0]?.[0] || { txId, eventId, userId }
          });
          
        } catch (spError) {
          // If stored procedure doesn't exist, try direct insert
          console.log('⚠️ Stored procedure no encontrada, intentando inserción directa:', spError.message);
          
          // Direct insert into payments table
          const paymentResult = await queryDatabase(
            `INSERT INTO payments (
              tx_id, 
              amount, 
              asset, 
              network, 
              payer_address, 
              receiver_address, 
              event_id, 
              user_id, 
              status, 
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())`,
            [txId, amount, asset || 'ETH', network || 'Yellow Network', payerAddress, receiverAddress, eventId, userId]
          );

          console.log('✅ Pago registrado en base de datos');

          // Create ticket if eventId is provided
          if (eventId && userId) {
            // Insert ticket record
            const ticketResult = await queryDatabase(
              `INSERT INTO tickets (
                user_id,
                event_id,
                payment_id,
                status,
                created_at
              ) VALUES (?, ?, ?, 'active', NOW())`,
              [userId, eventId, paymentResult.insertId || null]
            );

            console.log('✅ Ticket creado exitosamente:', {
              ticketId: ticketResult.insertId,
              eventId,
              userId
            });

            return res.status(200).json({
              success: true,
              message: 'Pago procesado y ticket creado exitosamente',
              paymentId: paymentResult.insertId,
              ticketId: ticketResult.insertId
            });
          } else {
            console.log('⚠️ EventId o userId no proporcionado, solo se registró el pago');
            return res.status(200).json({
              success: true,
              message: 'Pago procesado exitosamente (sin ticket - eventId o userId no proporcionado)',
              paymentId: paymentResult.insertId
            });
          }
        }

    } catch (dbError) {
      console.error('❌ Error al crear ticket en base de datos:', dbError);
      
      // Log the payment data for manual processing or debugging
      console.log('📋 Datos del pago recibidos:', {
        txId,
        amount,
        asset,
        network,
        payerAddress,
        receiverAddress,
        eventId,
        userId,
        timestamp
      });

      // Still return 200 to acknowledge webhook receipt
      // Yellow Network expects 200 response even if processing fails
      // You can implement retry logic or manual processing queue
      return res.status(200).json({
        success: false,
        message: 'Webhook recibido pero error al procesar en base de datos',
        error: dbError.message,
        txId // Return txId for tracking
      });
    }

  } catch (error) {
    console.error('❌ Error procesando webhook de pago:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

//# --- GET:PAYMENTS_STATUS | Get Payment Status --- ?//
//+ AUTH: ON-OFF (optional)
export const getPaymentStatus = async (req, res) => {
  try {
    const { txId } = req.query;

    if (!txId) {
      return res.status(400).json({ error: 'txId requerido' });
    }

    // Query payment status from database
    const result = await queryDatabase(
      `SELECT * FROM payments WHERE tx_id = ? LIMIT 1`,
      [txId]
    );

    if (!result || result.length === 0 || !result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    return res.status(200).json(result[0][0]);
  } catch (error) {
    console.error('❌ Error obteniendo estado del pago:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

