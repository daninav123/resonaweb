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

  // ============= ASIGNACIONES DE VEHÍCULOS =============

  async listAssignments(filters?: { vehicleId?: string; startDate?: string; endDate?: string; eventId?: string }) {
    const where: any = {};
    if (filters?.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters?.eventId) where.eventId = filters.eventId;
    if (filters?.startDate && filters?.endDate) {
      where.OR = [
        { startDate: { lte: new Date(filters.endDate) }, endDate: { gte: new Date(filters.startDate) } },
      ];
    }
    return prisma.vehicleAssignment.findMany({ where, orderBy: { startDate: 'asc' } });
  }

  async createAssignment(data: any) {
    data.startDate = new Date(data.startDate);
    data.endDate = new Date(data.endDate);
    return prisma.vehicleAssignment.create({ data });
  }

  async updateAssignment(id: string, data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return prisma.vehicleAssignment.update({ where: { id }, data });
  }

  async deleteAssignment(id: string) {
    return prisma.vehicleAssignment.delete({ where: { id } });
  }

  async getCalendar(startDate: string, endDate: string) {
    const [vehicles, assignments] = await Promise.all([
      prisma.vehicle.findMany({ orderBy: { plate: 'asc' } }),
      prisma.vehicleAssignment.findMany({
        where: { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } },
        orderBy: { startDate: 'asc' },
      }),
    ]);
    return { vehicles, assignments };
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
