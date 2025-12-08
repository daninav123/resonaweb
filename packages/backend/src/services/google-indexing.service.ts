/**
 * Servicio para notificar a Google sobre nuevas URLs
 * Usa Google Indexing API para indexación automática
 */

import axios from 'axios';
import { logger } from '../utils/logger';

interface IndexingRequest {
  url: string;
  type: 'URL_UPDATED' | 'URL_DELETED';
}

export class GoogleIndexingService {
  private static readonly INDEXING_API_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
  private static readonly SCOPES = ['https://www.googleapis.com/auth/indexing'];

  /**
   * Notifica a Google que una URL debe ser indexada
   * @param url URL completa a indexar
   * @param type Tipo de notificación (URL_UPDATED o URL_DELETED)
   */
  static async notifyGoogle(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<boolean> {
    try {
      // Validar que la URL es de producción
      if (!url.includes('resonaevents.com')) {
        logger.warn(`⚠️ URL no es de producción, ignorando: ${url}`);
        return false;
      }

      // Obtener token de autenticación
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        logger.error('❌ No se pudo obtener token de Google');
        return false;
      }

      // Enviar a Google (formato correcto de la API)
      const response = await axios.post(
        this.INDEXING_API_URL,
        {
          url,
          type,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        logger.info(`✅ URL indexada en Google: ${url}`);
        return true;
      }

      logger.error(`❌ Error al indexar URL: ${response.statusText}`);
      return false;
    } catch (error: any) {
      logger.error(`❌ Error en Google Indexing API: ${error.message}`);
      if (error.response?.data) {
        logger.error(`Detalles:`, error.response.data);
      }
      return false;
    }
  }

  /**
   * Notifica múltiples URLs a Google
   */
  static async notifyGoogleBatch(urls: string[]): Promise<number> {
    let successCount = 0;

    for (const url of urls) {
      const success = await this.notifyGoogle(url);
      if (success) successCount++;

      // Esperar 1 segundo entre requests para no saturar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info(`📊 Indexadas ${successCount}/${urls.length} URLs`);
    return successCount;
  }

  /**
   * Obtiene token de autenticación de Google
   * Usa credenciales de servicio (service account)
   */
  private static async getAccessToken(): Promise<string | null> {
    try {
      // Obtener credenciales del archivo de servicio
      const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

      if (!serviceAccountKey) {
        logger.warn('⚠️ GOOGLE_SERVICE_ACCOUNT_KEY no configurado');
        return null;
      }

      // Parsear credenciales
      let credentials;
      try {
        credentials = JSON.parse(serviceAccountKey);
      } catch {
        logger.error('❌ Error al parsear GOOGLE_SERVICE_ACCOUNT_KEY');
        return null;
      }

      // Crear JWT
      const jwt = this.createJWT(credentials);

      // Intercambiar JWT por access token
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('❌ Error obteniendo access token:', error);
      return null;
    }
  }

  /**
   * Crea un JWT para autenticación con Google
   */
  private static createJWT(serviceAccount: any): string {
    const crypto = require('crypto');
    const jwt = require('jsonwebtoken');

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = now + 3600; // 1 hora

    const payload = {
      iss: serviceAccount.client_email,
      scope: this.SCOPES.join(' '),
      aud: 'https://oauth2.googleapis.com/token',
      exp: expiresIn,
      iat: now,
    };

    return jwt.sign(payload, serviceAccount.private_key, {
      algorithm: 'RS256',
    });
  }
}
