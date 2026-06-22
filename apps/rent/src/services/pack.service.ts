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
      return await api.get<Pack[]>('/packs');
    } catch (error) {
      console.error('Error al obtener packs:', error);
      return [];
    }
  }

  async getPackById(id: string): Promise<Pack | null> {
    try {
      return await api.get<Pack>(`/packs/${id}`);
    } catch (error) {
      console.error(`Error al obtener pack ${id}:`, error);
      return null;
    }
  }

  async checkAvailability(packId: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      const result = await api.post<{ available: boolean }>(`/packs/${packId}/check-availability`, {
        startDate,
        endDate
      });
      return result.available;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return false;
    }
  }
}

export const packService = new PackService();
