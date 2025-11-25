const { createRedsysAPI } = require('redsys-easy');

class RedsysService {
  constructor() {
    // Configuración de Redsys
    this.merchantCode = process.env.REDSYS_MERCHANT_CODE || '';
    this.terminal = process.env.REDSYS_TERMINAL || '1';
    this.secret = process.env.REDSYS_SECRET_KEY || '';
    this.environment = process.env.REDSYS_ENVIRONMENT || 'test'; // 'test' o 'production'
    
    // URLs
    this.baseUrl = process.env.REDSYS_BASE_URL || 'http://localhost:3000';
    this.notificationUrl = `${this.baseUrl}/api/v1/payments/redsys/notification`;
    this.successUrl = `${this.baseUrl}/checkout/success`;
    this.errorUrl = `${this.baseUrl}/checkout/error`;
    
    // Crear instancia de Redsys API
    this.redsys = createRedsysAPI({
      secretKey: this.secret,
      urls: {
        test: 'https://sis-t.redsys.es:25443/sis/realizarPago',
        production: 'https://sis.redsys.es/sis/realizarPago'
      }
    });
  }

  /**
   * Crear formulario de pago para Redsys
   * @param {Object} orderData - Datos del pedido
   * @returns {Object} Datos del formulario de pago
   */
  createPaymentForm(orderData) {
    const { orderId, orderNumber, amount, email, description } = orderData;
    
    // Redsys requiere el importe en céntimos (sin decimales)
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    // Parámetros del pago
    const params = {
      DS_MERCHANT_AMOUNT: amountInCents.toString(),
      DS_MERCHANT_ORDER: this.formatOrderNumber(orderNumber),
      DS_MERCHANT_MERCHANTCODE: this.merchantCode,
      DS_MERCHANT_CURRENCY: '978', // EUR
      DS_MERCHANT_TRANSACTIONTYPE: '0', // Autorización
      DS_MERCHANT_TERMINAL: this.terminal,
      DS_MERCHANT_MERCHANTURL: this.notificationUrl,
      DS_MERCHANT_URLOK: `${this.successUrl}?orderId=${orderId}`,
      DS_MERCHANT_URLKO: `${this.errorUrl}?orderId=${orderId}`,
      DS_MERCHANT_CONSUMERLANGUAGE: '001', // Español
      DS_MERCHANT_TITULAR: email,
      DS_MERCHANT_PRODUCTDESCRIPTION: description || `Pedido ${orderNumber}`,
      // Habilitar métodos de pago
      DS_MERCHANT_PAYMETHODS: 'z', // z = todos los métodos (incluye Bizum)
    };
    
    // Crear firma
    const signature = this.redsys.createSignature(params);
    const merchantParameters = this.redsys.createMerchantParameters(params);
    
    return {
      url: this.environment === 'production' 
        ? 'https://sis.redsys.es/sis/realizarPago'
        : 'https://sis-t.redsys.es:25443/sis/realizarPago',
      params: {
        Ds_SignatureVersion: 'HMAC_SHA256_V1',
        Ds_MerchantParameters: merchantParameters,
        Ds_Signature: signature
      }
    };
  }

  /**
   * Verificar notificación de Redsys
   * @param {Object} notification - Datos de la notificación
   * @returns {Object} Datos decodificados y verificados
   */
  verifyNotification(notification) {
    try {
      const { Ds_MerchantParameters, Ds_Signature, Ds_SignatureVersion } = notification;
      
      // Verificar firma
      const isValid = this.redsys.checkSignature(
        Ds_MerchantParameters,
        Ds_Signature
      );
      
      if (!isValid) {
        throw new Error('Firma de notificación inválida');
      }
      
      // Decodificar parámetros
      const params = this.redsys.decodeMerchantParameters(Ds_MerchantParameters);
      
      return {
        valid: true,
        params: {
          amount: parseInt(params.Ds_Amount) / 100, // Convertir céntimos a euros
          order: params.Ds_Order,
          response: params.Ds_Response,
          date: params.Ds_Date,
          hour: params.Ds_Hour,
          authorisationCode: params.Ds_AuthorisationCode,
          transactionType: params.Ds_TransactionType,
          cardBrand: params.Ds_Card_Brand,
          cardNumber: params.Ds_Card_Number,
          payMethod: params.Ds_PayMethod, // Aquí sabrás si fue Bizum, tarjeta, etc.
        }
      };
    } catch (error) {
      console.error('Error verificando notificación de Redsys:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar si el pago fue exitoso
   * @param {string} responseCode - Código de respuesta de Redsys
   * @returns {boolean}
   */
  isPaymentSuccessful(responseCode) {
    // Códigos de éxito: 0000 a 0099
    const code = parseInt(responseCode);
    return code >= 0 && code < 100;
  }

  /**
   * Formatear número de pedido para Redsys
   * Redsys requiere: 4 dígitos numéricos + hasta 8 caracteres alfanuméricos
   * @param {string} orderNumber - Número de pedido (ej: "RES-2025-0001")
   * @returns {string} Número formateado (ej: "20250001")
   */
  formatOrderNumber(orderNumber) {
    // Extraer los números del pedido
    const numbers = orderNumber.replace(/\D/g, '');
    
    // Tomar los últimos 12 dígitos y rellenar con 0s si es necesario
    const formatted = numbers.slice(-12).padStart(12, '0');
    
    return formatted;
  }

  /**
   * Obtener descripción del método de pago
   * @param {string} payMethod - Código del método de pago
   * @returns {string}
   */
  getPaymentMethodDescription(payMethod) {
    const methods = {
      'C': 'Tarjeta de crédito',
      'D': 'Tarjeta de débito',
      'T': 'Transferencia',
      'R': 'Domiciliación',
      'z': 'Bizum',
    };
    
    return methods[payMethod] || 'Desconocido';
  }

  /**
   * Obtener mensaje de error según código de respuesta
   * @param {string} responseCode - Código de respuesta
   * @returns {string}
   */
  getErrorMessage(responseCode) {
    const errors = {
      '0101': 'Tarjeta caducada',
      '0102': 'Tarjeta en excepción transitoria o bajo sospecha de fraude',
      '0106': 'Intentos de PIN excedidos',
      '0125': 'Tarjeta no efectiva',
      '0129': 'Código de seguridad (CVV2/CVC2) incorrecto',
      '0180': 'Tarjeta ajena al servicio',
      '0184': 'Error en la autenticación del titular',
      '0190': 'Denegación del emisor sin especificar motivo',
      '0191': 'Fecha de caducidad errónea',
      '0202': 'Tarjeta en excepción transitoria o bajo sospecha de fraude',
      '0904': 'Comercio no registrado',
      '0909': 'Error de sistema',
      '0913': 'Pedido repetido',
      '0944': 'Sesión incorrecta',
      '0950': 'Operación de devolución no permitida',
      '9912': 'Emisor no disponible',
      '9064': 'Número de posiciones de la tarjeta incorrecto',
      '9078': 'Tipo de operación no permitida para esa tarjeta',
      '9093': 'Tarjeta no existente',
      '9094': 'Rechazo servidores internacionales',
      '9104': 'Comercio con "titular seguro" y titular sin clave',
      '9218': 'El comercio no permite operaciones seguras por entrada /operaciones',
      '9253': 'Tarjeta no cumple el check-digit',
      '9256': 'El comercio no puede realizar preautorizaciones',
      '9257': 'Esta tarjeta no permite operaciones de preautorización',
      '9261': 'Operación detenida por superar el control de restricciones',
      '9912': 'Emisor no disponible',
      '9913': 'Error en la confirmación que el comercio envía',
      '9914': 'Confirmación "KO" del comercio',
      '9915': 'A petición del usuario se ha cancelado el pago',
      '9928': 'Anulación de autorización en diferido realizada por el SIS',
      '9929': 'Anulación de autorización en diferido realizada por el comercio',
    };
    
    return errors[responseCode] || 'Error en el pago. Por favor, inténtalo de nuevo.';
  }
}

module.exports = new RedsysService();
