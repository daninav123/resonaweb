import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export class BillingService {
  /**
   * Get billing data for a user
   */
  async getBillingData(userId: string) {
    const billingData = await prisma.billingData.findUnique({
      where: { userId },
    });

    return billingData;
  }

  /**
   * Create or update billing data
   */
  async upsertBillingData(userId: string, data: any) {
    // Validate tax ID format (basic validation)
    if (!data.taxId || data.taxId.trim().length === 0) {
      throw new AppError(400, 'El NIF/CIF es obligatorio', 'INVALID_TAX_ID');
    }

    // Validate required fields
    if (!data.address || !data.city || !data.state || !data.postalCode) {
      throw new AppError(400, 'Todos los campos de dirección son obligatorios', 'MISSING_REQUIRED_FIELDS');
    }

    const billingData = await prisma.billingData.upsert({
      where: { userId },
      update: {
        companyName: data.companyName || null,
        taxId: data.taxId.trim().toUpperCase(),
        taxIdType: data.taxIdType || 'NIF',
        address: data.address,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'España',
        phone: data.phone || null,
        email: data.email || null,
        isDefault: data.isDefault !== undefined ? data.isDefault : true,
      },
      create: {
        userId,
        companyName: data.companyName || null,
        taxId: data.taxId.trim().toUpperCase(),
        taxIdType: data.taxIdType || 'NIF',
        address: data.address,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'España',
        phone: data.phone || null,
        email: data.email || null,
        isDefault: data.isDefault !== undefined ? data.isDefault : true,
      },
    });

    logger.info(`Billing data ${billingData ? 'updated' : 'created'} for user ${userId}`);

    return billingData;
  }

  /**
   * Delete billing data
   */
  async deleteBillingData(userId: string) {
    const billingData = await prisma.billingData.findUnique({
      where: { userId },
    });

    if (!billingData) {
      throw new AppError(404, 'Datos de facturación no encontrados', 'BILLING_DATA_NOT_FOUND');
    }

    await prisma.billingData.delete({
      where: { userId },
    });

    logger.info(`Billing data deleted for user ${userId}`);

    return { message: 'Datos de facturación eliminados' };
  }

  /**
   * Validate Spanish tax ID (NIF/CIF/NIE)
   */
  validateSpanishTaxId(taxId: string, type: string = 'NIF'): boolean {
    const cleanTaxId = taxId.trim().toUpperCase();

    // NIF validation (DNI)
    if (type === 'NIF') {
      const nifRegex = /^[0-9]{8}[A-Z]$/;
      if (!nifRegex.test(cleanTaxId)) return false;

      const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
      const number = parseInt(cleanTaxId.substring(0, 8), 10);
      const letter = cleanTaxId.charAt(8);
      return letters.charAt(number % 23) === letter;
    }

    // CIF validation
    if (type === 'CIF') {
      const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;
      return cifRegex.test(cleanTaxId);
    }

    // NIE validation
    if (type === 'NIE') {
      const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
      if (!nieRegex.test(cleanTaxId)) return false;

      const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
      let number = cleanTaxId.substring(1, 8);
      const firstLetter = cleanTaxId.charAt(0);
      const lastLetter = cleanTaxId.charAt(8);

      // Replace first letter with number
      if (firstLetter === 'X') number = '0' + number;
      else if (firstLetter === 'Y') number = '1' + number;
      else if (firstLetter === 'Z') number = '2' + number;

      return letters.charAt(parseInt(number) % 23) === lastLetter;
    }

    return true; // For other types, just accept them
  }
}

export const billingService = new BillingService();
