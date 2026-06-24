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

  // ============= WAREHOUSE ITEMS (vinculación productos) =============

  async listLocationsWithItems() {
    return prisma.warehouseLocation.findMany({
      include: { items: { orderBy: { productName: 'asc' } } },
      orderBy: [{ zone: 'asc' }, { shelf: 'asc' }, { position: 'asc' }],
    });
  }

  async getLocationItems(locationId: string) {
    return prisma.warehouseItem.findMany({ where: { locationId }, orderBy: { productName: 'asc' } });
  }

  async addItem(locationId: string, data: { productId?: string; unitId?: string; productName: string; quantity?: number; notes?: string }) {
    const item = await prisma.warehouseItem.create({
      data: { locationId, ...data, quantity: data.quantity || 1 },
    });
    // Actualizar conteo de ubicación
    const count = await prisma.warehouseItem.aggregate({ where: { locationId }, _sum: { quantity: true } });
    await prisma.warehouseLocation.update({ where: { id: locationId }, data: { currentItems: count._sum.quantity || 0 } });
    return item;
  }

  async removeItem(itemId: string) {
    const item = await prisma.warehouseItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error('Item no encontrado');
    await prisma.warehouseItem.delete({ where: { id: itemId } });
    // Actualizar conteo
    const count = await prisma.warehouseItem.aggregate({ where: { locationId: item.locationId }, _sum: { quantity: true } });
    await prisma.warehouseLocation.update({ where: { id: item.locationId }, data: { currentItems: count._sum.quantity || 0 } });
  }

  async updateItem(itemId: string, data: any) {
    const item = await prisma.warehouseItem.update({ where: { id: itemId }, data });
    // Actualizar conteo
    const count = await prisma.warehouseItem.aggregate({ where: { locationId: item.locationId }, _sum: { quantity: true } });
    await prisma.warehouseLocation.update({ where: { id: item.locationId }, data: { currentItems: count._sum.quantity || 0 } });
    return item;
  }

  async findProductLocation(productId: string) {
    return prisma.warehouseItem.findMany({
      where: { productId },
      include: { location: true },
    });
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
