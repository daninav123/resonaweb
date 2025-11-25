import api from './api';

export interface Pack {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  pricePerDay: number;
  discount: number;
  isActive: boolean;
  featured: boolean;
  items: PackItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PackItem {
  id: string;
  packId: string;
  productId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

class PackService {
  async getPacks(): Promise<Pack[]> {
    try {
      const response = await api.get('/packs');
      return response.data;
    } catch (error) {
      console.error('Error al obtener packs:', error);
      return [];
    }
  }

  async getPackById(id: string): Promise<Pack | null> {
    try {
      const response = await api.get(`/packs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener pack ${id}:`, error);
      return null;
    }
  }

  async checkAvailability(packId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      const response = await api.post(`/packs/${packId}/check-availability`, {
        startDate,
        endDate
      });
      return response.data.available;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return false;
    }
  }
}

export const packService = new PackService();
