import { api } from './api';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay: boolean;
  resource: {
    orderNumber: string;
    client: string;
    clientEmail: string;
    contactPerson: string;
    contactPhone: string;
    status: string;
    paymentStatus: string;
    total: number;
    eventType: string | null;
    eventLocation: any;
    deliveryType: string;
    products: string;
    itemCount: number;
    notes: string | null;
    color: string;
  };
}

export interface CalendarStats {
  ordersByStatus: Record<string, number>;
  monthRevenue: number;
  upcomingEvents: Array<{
    id: string;
    orderNumber: string;
    eventType: string | null;
    startDate: Date | string;
    endDate: Date | string;
    client: string;
    status: string;
    total: number;
    products: string;
  }>;
}

class CalendarService {
  /**
   * Obtener eventos del calendario
   */
  async getEvents(startDate?: string, endDate?: string): Promise<{ events: CalendarEvent[]; total: number }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return api.get(`/calendar/events?${params.toString()}`);
  }

  /**
   * Obtener estadísticas del calendario
   */
  async getStats(month?: number, year?: number): Promise<CalendarStats> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    return api.get(`/calendar/stats?${params.toString()}`);
  }

  /**
   * Verificar disponibilidad de fechas
   */
  async checkAvailability(startDate: string, endDate: string): Promise<{
    available: boolean;
    conflictingOrders: number;
    message: string;
  }> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);

    return api.get(`/calendar/availability?${params.toString()}`);
  }

  /**
   * Exportar calendario a formato iCalendar (.ics)
   */
  exportCalendar(startDate?: string, endDate?: string): string {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/calendar/export?${params.toString()}`;
    
    // Crear elemento <a> temporal para descargar
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resona-calendar.ics');
    
    // Añadir token a la URL si existe
    if (token) {
      link.href = `${url}&token=${token}`;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return url;
  }

  /**
   * Obtener URL de exportación para usar directamente
   */
  getExportUrl(startDate?: string, endDate?: string): string {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const token = localStorage.getItem('token');
    const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/calendar/export`;
    
    if (params.toString()) {
      return `${baseUrl}?${params.toString()}`;
    }
    
    return baseUrl;
  }
}

export const calendarService = new CalendarService();
