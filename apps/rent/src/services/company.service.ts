import { api } from './api';

class CompanyService {
  /**
   * Get company settings
   */
  async getSettings() {
    return await api.get('/company/settings');
  }

  /**
   * Update company settings (Admin only)
   */
  async updateSettings(data: any) {
    return await api.put('/company/settings', data);
  }
}

export const companyService = new CompanyService();
