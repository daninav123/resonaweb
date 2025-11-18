import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class ShippingConfigService {
  /**
   * Get current shipping configuration
   */
  async getConfig() {
    try {
      let config = await prisma.shippingConfig.findFirst({
        where: { isActive: true }
      });

      // Si no existe, crear configuración por defecto
      if (!config) {
        config = await prisma.shippingConfig.create({
          data: {
            localZoneMax: 10,
            localZoneRate: 15,
            regionalZoneMax: 30,
            regionalZoneRate: 30,
            extendedZoneMax: 50,
            extendedZoneRate: 50,
            customZoneRatePerKm: 1.5,
            minimumShippingCost: 20,
            minimumWithInstallation: 50,
            baseAddress: 'Madrid, España',
            urgentSurcharge: 50,
            nightSurcharge: 30,
            isActive: true
          }
        });
      }

      return config;
    } catch (error) {
      logger.error('Error getting shipping config:', error);
      throw error;
    }
  }

  /**
   * Update shipping configuration
   */
  async updateConfig(data: any) {
    try {
      const config = await this.getConfig();

      const updated = await prisma.shippingConfig.update({
        where: { id: config.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      logger.info('Shipping configuration updated');
      return updated;
    } catch (error) {
      logger.error('Error updating shipping config:', error);
      throw error;
    }
  }

  /**
   * Calculate shipping cost based on distance
   */
  async calculateShippingCost(
    distance: number,
    includeInstallation: boolean = false,
    productsData: Array<{ shippingCost: number; installationCost: number; quantity: number }> = []
  ) {
    try {
      const config = await this.getConfig();
      
      let baseShippingCost = 0;
      let zone = 'LOCAL';

      // Determinar zona y tarifa base por distancia
      if (distance <= config.localZoneMax) {
        baseShippingCost = Number(config.localZoneRate);
        zone = 'LOCAL';
      } else if (distance <= config.regionalZoneMax) {
        baseShippingCost = Number(config.regionalZoneRate);
        zone = 'REGIONAL';
      } else if (distance <= config.extendedZoneMax) {
        baseShippingCost = Number(config.extendedZoneRate);
        zone = 'EXTENDED';
      } else {
        baseShippingCost = distance * Number(config.customZoneRatePerKm);
        zone = 'CUSTOM';
      }

      // Calcular costes por productos
      let productShippingCost = 0;
      let productInstallationCost = 0;

      productsData.forEach(product => {
        productShippingCost += Number(product.shippingCost || 0) * product.quantity;
        productInstallationCost += Number(product.installationCost || 0) * product.quantity;
      });

      // ENVÍO: Base + Productos (aplicar mínimo solo a la base)
      const minimumShipping = Number(config.minimumShippingCost);
      const baseWithMinimum = Math.max(baseShippingCost, minimumShipping);
      const totalShippingCost = baseWithMinimum + productShippingCost;

      // INSTALACIÓN: Si se incluye, sumar costes de productos
      let totalInstallationCost = 0;
      if (includeInstallation) {
        const minimumInstallation = Number(config.minimumWithInstallation);
        const baseInstallation = Math.max(baseShippingCost, minimumInstallation);
        totalInstallationCost = baseInstallation + productInstallationCost;
      }

      // Total final
      const finalCost = includeInstallation ? totalInstallationCost : totalShippingCost;

      return {
        distance,
        zone,
        baseRate: baseShippingCost,
        baseWithMinimum,
        minimumShipping,
        minimumInstallation: Number(config.minimumWithInstallation),
        productShippingCost,
        productInstallationCost,
        totalShippingCost,
        totalInstallationCost,
        finalCost,
        includeInstallation,
        breakdown: {
          base: baseWithMinimum,
          products: includeInstallation ? productInstallationCost : productShippingCost,
          minimumApplied: baseWithMinimum > baseShippingCost
        }
      };
    } catch (error) {
      logger.error('Error calculating shipping cost:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two addresses using Google Maps
   */
  async calculateDistance(fromAddress: string, toAddress: string): Promise<number> {
    try {
      // Check if Google Maps API key is configured
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        logger.warn('Google Maps API key not configured, using default distance');
        return 15; // Default 15km
      }

      // Import Google Maps client
      const { Client } = await import('@googlemaps/google-maps-services-js');
      const client = new Client({});

      // Calculate distance using Distance Matrix API
      const response = await client.distancematrix({
        params: {
          origins: [fromAddress],
          destinations: [toAddress],
          mode: 'driving' as any,
          units: 'metric' as any,
          key: apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.rows[0]?.elements[0]?.status === 'OK') {
        const distance = response.data.rows[0].elements[0].distance;
        const distanceInKm = distance.value / 1000;
        
        logger.info(`Distance calculated: ${distanceInKm}km from ${fromAddress} to ${toAddress}`);
        return distanceInKm;
      } else {
        logger.warn(`Could not calculate distance: ${response.data.status}`);
        return 15; // Default distance
      }
    } catch (error) {
      logger.error('Error calculating distance with Google Maps:', error);
      
      // Fallback: Simple estimation based on city names (very basic)
      if (fromAddress.toLowerCase().includes('madrid') && toAddress.toLowerCase().includes('madrid')) {
        return 10; // Same city
      } else if (fromAddress.toLowerCase().includes('valencia') || toAddress.toLowerCase().includes('valencia')) {
        return 350; // Madrid-Valencia distance
      } else if (fromAddress.toLowerCase().includes('barcelona') || toAddress.toLowerCase().includes('barcelona')) {
        return 620; // Madrid-Barcelona distance
      }
      
      return 15; // Default distance
    }
  }
}

export const shippingConfigService = new ShippingConfigService();
