import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export class CompanyService {
  /**
   * Get company settings (or create default if doesn't exist)
   */
  async getSettings() {
    try {
      let settings = await prisma.companySettings.findFirst({
        where: { isActive: true },
      });

      // Si no existe, crear configuración por defecto
      if (!settings) {
        settings = await prisma.companySettings.create({
          data: {
            companyName: 'ReSona Events S.L.',
            ownerName: 'Daniel Navarro Campos',
            address: 'C/valencia n 37, 2',
            city: 'Xirivella',
            postalCode: '46950',
            province: 'Valencia',
            country: 'España',
            phone: '+34 600 123 456',
            email: 'info@resona.com',
          },
        });
      }

      return settings;
    } catch (error) {
      logger.error('Error getting company settings:', error);
      throw error;
    }
  }

  /**
   * Update company settings
   */
  async updateSettings(data: any) {
    try {
      const current = await this.getSettings();

      const updated = await prisma.companySettings.update({
        where: { id: current.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      logger.info('Company settings updated');
      return updated;
    } catch (error) {
      logger.error('Error updating company settings:', error);
      throw error;
    }
  }

  /**
   * Get settings for invoice
   */
  async getForInvoice() {
    try {
      const settings = await this.getSettings();
      
      return {
        name: settings.companyName,
        ownerName: settings.ownerName,
        taxId: settings.taxId,
        address: `${settings.address || ''}${settings.city ? ', ' + settings.city : ''}${settings.postalCode ? ' (' + settings.postalCode + ')' : ''}`,
        province: settings.province,
        country: settings.country,
        phone: settings.phone,
        email: settings.email,
        logo: settings.logoUrl,
      };
    } catch (error) {
      logger.error('Error getting settings for invoice:', error);
      throw error;
    }
  }
}

export const companyService = new CompanyService();
