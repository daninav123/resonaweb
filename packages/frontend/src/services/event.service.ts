import { api } from './api';

class EventService {
  async list(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get(`/events${query ? `?${query}` : ''}`);
  }

  async getById(id: string) {
    return api.get(`/events/${id}`);
  }

  async create(data: any) {
    return api.post('/events', data);
  }

  async update(id: string, data: any) {
    return api.put(`/events/${id}`, data);
  }

  async delete(id: string) {
    return api.delete(`/events/${id}`);
  }

  async changePhase(id: string, phase: string) {
    return api.patch(`/events/${id}/phase`, { phase });
  }

  async getStats() {
    return api.get('/events/stats');
  }

  // Timeline
  async addTimelineItem(eventId: string, data: any) {
    return api.post(`/events/${eventId}/timeline`, data);
  }

  async updateTimelineItem(eventId: string, itemId: string, data: any) {
    return api.put(`/events/${eventId}/timeline/${itemId}`, data);
  }

  async deleteTimelineItem(eventId: string, itemId: string) {
    return api.delete(`/events/${eventId}/timeline/${itemId}`);
  }

  async toggleTimelineItem(eventId: string, itemId: string) {
    return api.patch(`/events/${eventId}/timeline/${itemId}/toggle`);
  }

  // Checklist
  async addChecklistItem(eventId: string, data: any) {
    return api.post(`/events/${eventId}/checklist`, data);
  }

  async toggleChecklistItem(eventId: string, itemId: string) {
    return api.patch(`/events/${eventId}/checklist/${itemId}/toggle`);
  }

  async deleteChecklistItem(eventId: string, itemId: string) {
    return api.delete(`/events/${eventId}/checklist/${itemId}`);
  }

  // Staff
  async addStaff(eventId: string, data: any) {
    return api.post(`/events/${eventId}/staff`, data);
  }

  async updateStaff(eventId: string, itemId: string, data: any) {
    return api.put(`/events/${eventId}/staff/${itemId}`, data);
  }

  async removeStaff(eventId: string, itemId: string) {
    return api.delete(`/events/${eventId}/staff/${itemId}`);
  }

  // Equipment
  async addEquipment(eventId: string, data: any) {
    return api.post(`/events/${eventId}/equipment`, data);
  }

  async updateEquipment(eventId: string, itemId: string, data: any) {
    return api.put(`/events/${eventId}/equipment/${itemId}`, data);
  }

  async removeEquipment(eventId: string, itemId: string) {
    return api.delete(`/events/${eventId}/equipment/${itemId}`);
  }

  // Notes
  async addNote(eventId: string, data: any) {
    return api.post(`/events/${eventId}/notes`, data);
  }

  async deleteNote(eventId: string, itemId: string) {
    return api.delete(`/events/${eventId}/notes/${itemId}`);
  }

  // Incidents
  async addIncident(eventId: string, data: any) {
    return api.post(`/events/${eventId}/incidents`, data);
  }

  async resolveIncident(eventId: string, itemId: string, data: any) {
    return api.patch(`/events/${eventId}/incidents/${itemId}/resolve`, data);
  }

  // Documents
  async addDocument(eventId: string, data: any) {
    return api.post(`/events/${eventId}/documents`, data);
  }

  async removeDocument(eventId: string, itemId: string) {
    return api.delete(`/events/${eventId}/documents/${itemId}`);
  }
}

export const eventService = new EventService();
