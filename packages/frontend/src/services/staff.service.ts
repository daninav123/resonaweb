import { api } from './api';

class StaffFrontendService {
  async list(params?: Record<string, any>) { const q = new URLSearchParams(); if (params) Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, String(v)); }); return api.get(`/staff?${q.toString()}`); }
  async getById(id: string) { return api.get(`/staff/${id}`); }
  async create(data: any) { return api.post('/staff', data); }
  async update(id: string, data: any) { return api.patch(`/staff/${id}`, data); }
  async delete(id: string) { return api.delete(`/staff/${id}`); }
  async addAvailability(id: string, data: any) { return api.post(`/staff/${id}/availability`, data); }
  async deleteAvailability(id: string, availId: string) { return api.delete(`/staff/${id}/availability/${availId}`); }
  async addWorkLog(id: string, data: any) { return api.post(`/staff/${id}/work-logs`, data); }
  async toggleWorkLogPaid(id: string, logId: string) { return api.patch(`/staff/${id}/work-logs/${logId}/toggle-paid`); }
  async getStats() { return api.get('/staff/stats'); }
  async getMonthlyReport(id: string, year: number, month: number) { return api.get(`/staff/${id}/monthly-report?year=${year}&month=${month}`); }
}

export const staffFrontendService = new StaffFrontendService();
