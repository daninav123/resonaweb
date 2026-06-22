import { api } from './api';

// ============= CONTRATOS =============
class ContractFrontendService {
  async list(params?: Record<string, any>) { const q = new URLSearchParams(); if (params) Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, String(v)); }); return api.get(`/contracts-mgmt?${q.toString()}`); }
  async getById(id: string) { return api.get(`/contracts-mgmt/${id}`); }
  async create(data: any) { return api.post('/contracts-mgmt', data); }
  async update(id: string, data: any) { return api.patch(`/contracts-mgmt/${id}`, data); }
  async delete(id: string) { return api.delete(`/contracts-mgmt/${id}`); }
  async send(id: string) { return api.post(`/contracts-mgmt/${id}/send`); }
  async getStats() { return api.get('/contracts-mgmt/stats'); }
  // Público
  async getPublic(token: string) { return api.get(`/contracts-public/view/${token}`); }
  async sign(token: string, data: any) { return api.post(`/contracts-public/sign/${token}`, data); }
}

// ============= GASTOS RECURRENTES =============
class RecurringExpenseFrontendService {
  async list(params?: Record<string, any>) { const q = new URLSearchParams(); if (params) Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, String(v)); }); return api.get(`/recurring-expenses?${q.toString()}`); }
  async create(data: any) { return api.post('/recurring-expenses', data); }
  async update(id: string, data: any) { return api.patch(`/recurring-expenses/${id}`, data); }
  async delete(id: string) { return api.delete(`/recurring-expenses/${id}`); }
  async markPaid(id: string) { return api.post(`/recurring-expenses/${id}/mark-paid`); }
  async getStats() { return api.get('/recurring-expenses/stats'); }
}

// ============= VEHICULOS =============
class VehicleFrontendService {
  async list(params?: Record<string, any>) { const q = new URLSearchParams(); if (params) Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, String(v)); }); return api.get(`/vehicles?${q.toString()}`); }
  async getById(id: string) { return api.get(`/vehicles/${id}`); }
  async create(data: any) { return api.post('/vehicles', data); }
  async update(id: string, data: any) { return api.patch(`/vehicles/${id}`, data); }
  async delete(id: string) { return api.delete(`/vehicles/${id}`); }
  async getAlerts() { return api.get('/vehicles/alerts'); }
}

// ============= ALMACEN =============
class WarehouseFrontendService {
  async listLocations() { return api.get('/warehouse/locations'); }
  async createLocation(data: any) { return api.post('/warehouse/locations', data); }
  async updateLocation(id: string, data: any) { return api.patch(`/warehouse/locations/${id}`, data); }
  async deleteLocation(id: string) { return api.delete(`/warehouse/locations/${id}`); }
}

export const contractFrontendService = new ContractFrontendService();
export const recurringExpenseFrontendService = new RecurringExpenseFrontendService();
export const vehicleFrontendService = new VehicleFrontendService();
export const warehouseFrontendService = new WarehouseFrontendService();
