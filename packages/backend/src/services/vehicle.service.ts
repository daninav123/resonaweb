import { prisma } from '../index';

export class VehicleService {
  async list(filters?: { status?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    return prisma.vehicle.findMany({ where, orderBy: { plate: 'asc' } });
  }
  async getById(id: string) { return prisma.vehicle.findUnique({ where: { id } }); }
  async create(data: any) { return prisma.vehicle.create({ data }); }
  async update(id: string, data: any) { return prisma.vehicle.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.vehicle.delete({ where: { id } }); }
  async getAlerts() {
    const now = new Date();
    const in30days = new Date(); in30days.setDate(in30days.getDate() + 30);
    const [itvExpiring, insuranceExpiring] = await Promise.all([
      prisma.vehicle.findMany({ where: { itvDate: { lte: in30days } }, select: { id: true, plate: true, brand: true, model: true, itvDate: true } }),
      prisma.vehicle.findMany({ where: { insuranceDate: { lte: in30days } }, select: { id: true, plate: true, brand: true, model: true, insuranceDate: true } }),
    ]);
    return { itvExpiring, insuranceExpiring };
  }

  // Actualizar kilómetros
  async updateKm(id: string, km: number) {
    return prisma.vehicle.update({ where: { id }, data: { kmTotal: km } });
  }

  // Vehículos disponibles en una fecha
  async getAvailableForDate(date: string) {
    return prisma.vehicle.findMany({ where: { status: 'available' }, orderBy: { plate: 'asc' } });
  }

  // Informe de costes (ITV + seguro + mantenimiento basado en km)
  async getCostReport() {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: 'asc' } });
    return vehicles.map(v => ({
      id: v.id, plate: v.plate, brand: v.brand, model: v.model,
      kmTotal: v.kmTotal,
      status: v.status,
      itvDate: v.itvDate,
      insuranceDate: v.insuranceDate,
    }));
  }
}

export const vehicleService = new VehicleService();
