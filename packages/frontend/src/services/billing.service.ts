import { api } from './api';

export interface BillingData {
  id?: string;
  userId?: string;
  companyName?: string;
  taxId: string;
  taxIdType: 'NIF' | 'CIF' | 'NIE' | 'PASSPORT';
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValidateTaxIdResponse {
  valid: boolean;
  taxId: string;
}

class BillingService {
  /**
   * Get billing data for current user
   */
  async getBillingData(): Promise<BillingData | null> {
    const response = await api.get('/billing');
    return response.data;
  }

  /**
   * Create or update billing data
   */
  async saveBillingData(data: Partial<BillingData>): Promise<BillingData> {
    const response = await api.post('/billing', data);
    return response.data;
  }

  /**
   * Update billing data
   */
  async updateBillingData(data: Partial<BillingData>): Promise<BillingData> {
    const response = await api.put('/billing', data);
    return response.data;
  }

  /**
   * Delete billing data
   */
  async deleteBillingData(): Promise<void> {
    await api.delete('/billing');
  }

  /**
   * Validate Spanish tax ID (NIF/CIF/NIE)
   */
  async validateTaxId(taxId: string, type: string = 'NIF'): Promise<ValidateTaxIdResponse> {
    const response = await api.post('/billing/validate-tax-id', { taxId, type });
    return response;
  }
}

export const billingService = new BillingService();
