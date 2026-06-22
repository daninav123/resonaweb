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
    return api.get<BillingData | null>('/billing');
  }

  /**
   * Create or update billing data
   */
  async saveBillingData(data: Partial<BillingData>): Promise<BillingData> {
    return api.post<BillingData>('/billing', data);
  }

  /**
   * Update billing data
   */
  async updateBillingData(data: Partial<BillingData>): Promise<BillingData> {
    return api.put<BillingData>('/billing', data);
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
    return api.post<ValidateTaxIdResponse>('/billing/validate-tax-id', { taxId, type });
  }
}

export const billingService = new BillingService();
