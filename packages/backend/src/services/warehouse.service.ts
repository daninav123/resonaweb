import { prisma } from '../index';

export class WarehouseService {
  async listLocations() { return prisma.warehouseLocation.findMany({ orderBy: [{ zone: 'asc' }, { shelf: 'asc' }, { position: 'asc' }] }); }
  async createLocation(data: any) { return prisma.warehouseLocation.create({ data }); }
  async updateLocation(id: string, data: any) { return prisma.warehouseLocation.update({ where: { id }, data }); }
  async deleteLocation(id: string) { return prisma.warehouseLocation.delete({ where: { id } }); }

  async getById(id: string) { return prisma.warehouseLocation.findUnique({ where: { id } }); }

  // Buscar ubicaciones por zona
  async getByZone(zone: string) {
    return prisma.warehouseLocation.findMany({ where: { zone }, orderBy: [{ shelf: 'asc' }, { position: 'asc' }] });
  }

  // Buscar ubicaciones vacías (sin items)
  async getEmptyLocations() {
    return prisma.warehouseLocation.findMany({ where: { currentItems: 0 }, orderBy: [{ zone: 'asc' }, { shelf: 'asc' }] });
  }

  // Actualizar cantidad de items en ubicación
  async updateItems(locationId: string, currentItems: number) {
    return prisma.warehouseLocation.update({ where: { id: locationId }, data: { currentItems } });
  }

  // Vaciar ubicación
  async clearLocation(locationId: string) {
    return prisma.warehouseLocation.update({ where: { id: locationId }, data: { currentItems: 0 } });
  }

  // Estadísticas del almacén
  async getStats() {
    const all = await prisma.warehouseLocation.findMany();
    const total = all.length;
    const occupied = all.filter(l => l.currentItems > 0).length;
    const empty = total - occupied;
    const zones = [...new Set(all.map(l => l.zone))];
    return { total, occupied, empty, occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0, zones: zones.length };
  }
}

export const warehouseService = new WarehouseService();
