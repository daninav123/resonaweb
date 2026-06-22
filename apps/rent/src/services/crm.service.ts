import { api } from './api';

class CRMService {
  async listCustomers(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get(`/crm/customers${query ? `?${query}` : ''}`);
  }

  async getCustomerProfile(id: string) { return api.get(`/crm/customers/${id}`); }
  async updateCRM(id: string, data: any) { return api.patch(`/crm/customers/${id}/crm`, data); }
  async recalculateScoring(id: string) { return api.post(`/crm/customers/${id}/recalculate-scoring`); }
  async getStats() { return api.get('/crm/stats'); }
  async getTags() { return api.get('/crm/tags'); }

  // Comunicaciones
  async addCommunication(userId: string, data: any) { return api.post(`/crm/customers/${userId}/communications`, data); }
  async getCommunications(userId: string) { return api.get(`/crm/customers/${userId}/communications`); }

  // Tareas
  async addTask(userId: string, data: any) { return api.post(`/crm/customers/${userId}/tasks`, data); }
  async toggleTask(userId: string, taskId: string) { return api.patch(`/crm/customers/${userId}/tasks/${taskId}/toggle`); }
  async deleteTask(userId: string, taskId: string) { return api.delete(`/crm/customers/${userId}/tasks/${taskId}`); }
}

export const crmService = new CRMService();
