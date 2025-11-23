import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../config/axios";
import { useAuth } from "../contexts/AuthContext";
import { COLORS } from "../constants/theme";
import Transition from "../Transition";
import Icon from "../constants/Icon";
import { profileImageGetter } from "../constants/imageGetter";
import { dateOnlyFormatter } from "../constants/timeGetter";
import { toast } from "material-react-toastify";
import { parseAnyRPCResponse, RPCMethod } from '@erc7824/nitrolite';
import { 
  setupWallet,
  initializeYellowClient,
  getUserAddress,
  initializeSessionKey,
  startAuthentication,
  handleAuthChallenge,
  setAuthenticationComplete,
  addMessageListener,
  getIsAuthenticated,
  createAndExecutePayment
} from '../services/yellowClient.js';
import { notifyBackendWebhook } from '../services/webhookService.js';
import { HARD_CODED_AMOUNT_USD, PAYMENT_ASSET_SYMBOL, IS_TESTNET } from '../config/paymentConfig.js';
import "./styles/events.scss";

const Event = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const eventId = searchParams.get('id');

  // Estados para Yellow Integration
  const [cryptoPaymentState, setCryptoPaymentState] = useState('disconnected'); // disconnected, connecting, authenticating, ready, processing, success, error
  const [cryptoUserAddress, setCryptoUserAddress] = useState(null);
  const [cryptoIsAuthenticated, setCryptoIsAuthenticated] = useState(false);
  const [cryptoPaymentResult, setCryptoPaymentResult] = useState(null);
  const [cryptoErrorMessage, setCryptoErrorMessage] = useState(null);
  
  const isConnectingRef = useRef(false);
  const isPayingRef = useRef(false);
  const authExpireTimestampRef = useRef(null);

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const config = { 
        params: { 
          filters: JSON.stringify({}) 
        } 
      };
      
      if (authState.token && typeof authState.token === 'string' && authState.token.trim() !== '') {
        config.headers = { authorization: authState.token };
      }
      
      const res = await makeRequest.get('events', config);
      const events = res.data || [];
      
      const foundEvent = events.find(e => e.id === parseInt(eventId));
      return foundEvent || null;
    },
    enabled: !!eventId,
    staleTime: 30000,
  });

  const handleBack = () => {
    navigate(-1);
  };

  // Handler para conectar wallet (Yellow Integration)
  const handleConnectWallet = async () => {
    if (isConnectingRef.current) {
      console.log('⚠️ Ya hay una conexión en progreso');
      return;
    }

    isConnectingRef.current = true;
    setCryptoPaymentState('connecting');
    setCryptoErrorMessage(null);
    toast.info('Conectando wallet...', { position: 'top-right' });

    try {
      console.log('🔐 Paso 1/4: Conectando wallet...');
      await setupWallet();
      const address = getUserAddress();
      setCryptoUserAddress(address);
      console.log('✅ Wallet conectado:', address);
      toast.success('Wallet conectado!', { position: 'top-right' });

      console.log('🔑 Paso 2/4: Inicializando session key...');
      initializeSessionKey();
      console.log('✅ Session key lista');

      console.log('🌐 Paso 3/4: Conectando a Yellow Network...');
      await initializeYellowClient();
      console.log('✅ Conectado a Yellow Network');

      console.log('🔐 Paso 4/4: Iniciando autenticación automática...');
      setCryptoPaymentState('authenticating');
      toast.info('Autenticando con Yellow Network...', { position: 'top-right' });
      
      const { expireTimestamp } = await startAuthentication();
      authExpireTimestampRef.current = expireTimestamp;
      
      console.log('⏳ Esperando auth_challenge del servidor...');
      
    } catch (error) {
      console.error('❌ Error durante la conexión:', error);
      let errorMsg = 'Error conectando. Por favor intenta de nuevo.';
      if (error.code === 'NO_WALLET' || error.message.includes('MetaMask')) {
        errorMsg = error.message || 'MetaMask no está instalado. Por favor instala MetaMask desde https://metamask.io/';
      } else {
        errorMsg = error.message || errorMsg;
      }
      setCryptoErrorMessage(errorMsg);
      setCryptoPaymentState('error');
      toast.error(errorMsg, { position: 'top-right' });
    } finally {
      isConnectingRef.current = false;
    }
  };

  // Maneja mensajes del servidor para autenticación
  useEffect(() => {
    const handleMessage = async (data) => {
      try {
        const response = parseAnyRPCResponse(JSON.stringify(data));
        console.log('📨 Mensaje parseado:', response);

        if (response.method === RPCMethod.AuthChallenge) {
          console.log('📝 Paso 2/3: auth_challenge recibido');
          
          if (!authExpireTimestampRef.current) {
            console.error('❌ No hay expire timestamp guardado');
            return;
          }

          try {
            await handleAuthChallenge(response, authExpireTimestampRef.current);
            console.log('⏳ Esperando confirmación de autenticación...');
          } catch (error) {
            console.error('❌ Error en auth_verify:', error);
            setCryptoErrorMessage('Firma rechazada. Por favor intenta de nuevo.');
            setCryptoPaymentState('error');
          }
        }

        if (response.method === RPCMethod.AuthVerify && response.params?.success) {
          console.log('✅ Autenticación exitosa!');
          const jwtToken = response.params.jwtToken || response.params.jwt_token;
          setAuthenticationComplete(jwtToken);
          setCryptoIsAuthenticated(true);
          setCryptoPaymentState('ready');
          console.log('✅ Sistema listo para pagos');
          toast.success('¡Wallet conectado y autenticado! Listo para pagar.', { position: 'top-right' });
        }

        if (response.method === RPCMethod.Error) {
          console.error('❌ Error del servidor:', response.params?.error);
          setCryptoErrorMessage(`Error: ${response.params?.error || 'Error desconocido'}`);
          setCryptoPaymentState('error');
        }

      } catch (error) {
        console.error('❌ Error procesando mensaje:', error);
      }
    };

    if (cryptoPaymentState === 'authenticating' || cryptoPaymentState === 'ready') {
      const removeListener = addMessageListener(handleMessage);
      return removeListener;
    }
  }, [cryptoPaymentState]);

  // Handler para el pago crypto
  const handleCryptoPayment = async () => {
    if (isPayingRef.current) {
      console.log('⚠️ Ya hay un pago en progreso');
      return;
    }

    if (!cryptoIsAuthenticated) {
      // Si no está autenticado, conectar wallet primero
      await handleConnectWallet();
      return;
    }

    isPayingRef.current = true;
    setCryptoPaymentState('processing');
    setCryptoErrorMessage(null);
    toast.info('Procesando pago...', { position: 'top-right' });

    try {
      console.log('💳 Iniciando pago...');
      const result = await createAndExecutePayment();
      
      console.log('✅ Pago exitoso:', result);
      setCryptoPaymentResult(result);
      setCryptoPaymentState('success');
      toast.success('¡Pago exitoso!', { position: 'top-right' });

      try {
        await notifyBackendWebhook(result);
        console.log('✅ Backend notificado');
      } catch (webhookError) {
        console.warn('⚠️ Error notificando al backend:', webhookError);
      }
    } catch (error) {
      console.error('❌ Error durante el pago:', error);
      const errorMessage = error.message || 'Error procesando el pago';
      setCryptoErrorMessage(errorMessage);
      setCryptoPaymentState('ready');
      
      // Check for insufficient funds error
      if (errorMessage.toLowerCase().includes('insufficient funds')) {
        toast.error('You dont have money!!! Go to work!', { position: 'top-right', theme: 'colored' });
      } else {
        toast.error(errorMessage, { position: 'top-right' });
      }
    } finally {
      isPayingRef.current = false;
    }
  };

  const imageUrl = useMemo(() => {
    if (!event?.image) return null;
    return `https://api.previateesta.com/image/event/${event.image}`;
  }, [event?.image]);

  const profileImageUrl = useMemo(() => {
    if (!event?.username) return null;
    // Usar la primera letra del username como fallback
    return null;
  }, [event?.username]);

  const formattedDate = useMemo(() => {
    if (!event?.date) return '';
    // Formatear la fecha como "Lunes 03/10/24 -- 23.30hs"
    const date = new Date(event.date);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dayName} ${day}/${month}/${year} -- ${hours}.${minutes}hs`;
  }, [event?.date]);

  const genresText = useMemo(() => {
    if (!event?.genres || !Array.isArray(event.genres) || event.genres.length === 0) return '';
    return event.genres.map(g => g.title || g).join(', ');
  }, [event?.genres]);

  const tagsToShow = useMemo(() => {
    if (!event?.tags || !Array.isArray(event.tags)) return [];
    const allTags = event.tags.map(t => t.title || t);
    return allTags.slice(0, 3);
  }, [event?.tags]);

  const remainingTagsCount = useMemo(() => {
    if (!event?.tags || !Array.isArray(event.tags)) return 0;
    return Math.max(0, event.tags.length - 3);
  }, [event?.tags]);

  const googleMapsUrl = useMemo(() => {
    if (!event?.location_text) return null;
    const encodedLocation = encodeURIComponent(event.location_text);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  }, [event?.location_text]);

  // Precios hardcodeados para el ejemplo (en producción vendrían del API)
  const mercadoPagoPrice = useMemo(() => {
    return { service: 3.00, total: 23.00 };
  }, []);

  const cryptoPrice = useMemo(() => {
    const basePrice = 20.00;
    const discount = 0.10;
    const discountedPrice = basePrice * (1 - discount);
    return { service: 0.40, total: discountedPrice.toFixed(2) };
  }, []);

  const eventInitial = useMemo(() => {
    if (event?.username) {
      return event.username.charAt(0).toUpperCase();
    }
    if (event?.title) {
      return event.title.charAt(0).toUpperCase();
    }
    return 'E';
  }, [event?.username, event?.title]);

  if (!eventId) {
    return (
      <div id="Event">
        <div className="event-detail-container">
          <button onClick={handleBack} className="event-back-button">
            <Icon name="left-arrow" size={24} color={COLORS.white_01} />
          </button>
          <div className="event-error">
            <h2>Evento no encontrado</h2>
            <p>No se proporcionó un ID de evento válido</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div id="Event">
        <div className="event-detail-container">
          <button onClick={handleBack} className="event-back-button">
            <Icon name="left-arrow" size={24} color={COLORS.white_01} />
          </button>
          <div className="event-loading">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div id="Event">
        <div className="event-detail-container">
          <button onClick={handleBack} className="event-back-button">
            <Icon name="left-arrow" size={24} color={COLORS.white_01} />
          </button>
          <div className="event-error">
            <h2>Evento no encontrado</h2>
            <p>No se pudo cargar la información del evento</p>
            <button onClick={handleBack} className="event-back-link">
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="Event">
      <div className="event-detail-container">
        {/* Header */}
        <div className="event-header">
          <button onClick={handleBack} className="event-back-button">
            <Icon name="left-arrow" size={24} color={COLORS.white_01} />
          </button>
          <h1 className="event-header-title">BUY YOUR TICKET</h1>
        </div>

        {/* Event Info Section */}
        <div className="event-info-section">
          <div className="event-info-top">
            <div className="event-info-left">
              <div className="event-icon-circle">
                <span>{eventInitial}</span>
              </div>
              <div className="event-info-text">
                <h2 className="event-name">{event.title || 'Event'}</h2>
                <div className="event-location-row">
                  <p className="event-location-text">
                    {event.location_text ? (event.location_text.length > 20 ? event.location_text.substring(0, 20) + '...' : event.location_text) : ''}
                  </p>
                  {googleMapsUrl && (
                    <a 
                      href={googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="event-map-link"
                    >
                      VER MAPA
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="event-likes">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF4444"/>
              </svg>
              <span>{event.likes || 342}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="event-tags">
            {tagsToShow.map((tag, index) => (
              <span key={index} className="event-tag">{tag}</span>
            ))}
            {remainingTagsCount > 0 && (
              <span className="event-tag event-tag-more">+{remainingTagsCount} Tags</span>
            )}
          </div>
        </div>

        {/* Event Image */}
        {imageUrl && (
          <div className="event-image-container">
            <img src={imageUrl} alt={event.title || 'Event'} className="event-main-image" />
            <div className="event-image-overlay">
              {genresText && (
                <div className="event-genres">
                  <Icon name="music" size={16} color={COLORS.white_01} />
                  <span>{genresText}</span>
                </div>
              )}
              {formattedDate && (
                <div className="event-date-overlay">{formattedDate}</div>
              )}
              {event.subtitle && (
                <div className="event-subtitle">{event.subtitle}</div>
              )}
            </div>
          </div>
        )}

        {/* Payment Options */}
        <div className="event-payment-section">
          {/* Mercado Pago */}
          <button 
            className="payment-option payment-mercadopago"
            onClick={() => navigate('/success')}
          >
            <div className="payment-option-left">
              <span className="payment-option-name">Mercado Pago</span>
              <span className="payment-option-currency">AR$ Pesos</span>
            </div>
            <div className="payment-option-right">
              <span className="payment-option-service">service ${mercadoPagoPrice.service.toFixed(2)}</span>
              <span className="payment-option-total">${mercadoPagoPrice.total.toFixed(2)}</span>
            </div>
          </button>

          {/* Crypto Pay */}
          <button 
            className="payment-option payment-crypto"
            onClick={handleCryptoPayment}
            disabled={cryptoPaymentState === 'processing' || cryptoPaymentState === 'connecting' || cryptoPaymentState === 'authenticating'}
          >
            <div className="payment-option-left">
              <span className="payment-option-name-crypto">
                {cryptoPaymentState === 'processing' ? 'PAGANDO...' : 
                 cryptoPaymentState === 'connecting' ? 'CONECTANDO WALLET...' :
                 cryptoPaymentState === 'authenticating' ? 'AUTENTICANDO...' :
                 cryptoPaymentState === 'success' ? 'PAGO EXITOSO' :
                 !cryptoIsAuthenticated ? 'CONNECT WALLET' :
                 'CRYPTO PAY'}
              </span>
              <span className="payment-option-discount">%10 OFF</span>
            </div>
            <div className="payment-option-right">
              <span className="payment-option-service-crypto">service ${cryptoPrice.service}</span>
              <span className="payment-option-total-crypto">${cryptoPrice.total}</span>
            </div>
          </button>
          {cryptoErrorMessage && (
            <div style={{ color: '#FF4444', fontSize: '12px', marginTop: '8px', padding: '0 18px' }}>
              {cryptoErrorMessage}
            </div>
          )}
          {cryptoPaymentResult && (
            <div style={{ color: '#61B04D', fontSize: '12px', marginTop: '8px', padding: '0 18px' }}>
              ✓ Pago exitoso! TX: {cryptoPaymentResult.txId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transition(Event);
