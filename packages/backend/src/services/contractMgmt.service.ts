import { prisma } from '../index';
import { logger } from '../utils/logger';
import { contractService as orderContractService } from './contract.service';

export class ContractMgmtService {
  // Delegado: genera PDF de contrato de alquiler vinculado a un pedido
  async generateOrderContractPDF(orderId: string): Promise<Buffer> {
    return orderContractService.generateContract(orderId);
  }

  private async generateNumber() {
    const year = new Date().getFullYear();
    const count = await prisma.contract.count({ where: { contractNumber: { startsWith: `CTR-${year}` } } });
    return `CTR-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async list(filters: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.search) { where.OR = [{ clientName: { contains: filters.search, mode: 'insensitive' } }, { title: { contains: filters.search, mode: 'insensitive' } }, { contractNumber: { contains: filters.search, mode: 'insensitive' } }]; }
    const [data, total] = await Promise.all([
      prisma.contract.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.contract.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) { return prisma.contract.findUnique({ where: { id } }); }
  async getByToken(token: string) {
    const contract = await prisma.contract.findUnique({ where: { publicToken: token } });
    if (contract && !contract.viewedAt) await prisma.contract.update({ where: { id: contract.id }, data: { viewedAt: new Date(), status: contract.status === 'sent' ? 'viewed' : contract.status } });
    return contract;
  }

  async create(data: any) {
    const contractNumber = await this.generateNumber();
    return prisma.contract.create({ data: { ...data, contractNumber } });
  }

  async update(id: string, data: any) { return prisma.contract.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.contract.delete({ where: { id } }); }

  async send(id: string) {
    return prisma.contract.update({ where: { id }, data: { status: 'sent', sentAt: new Date() } });
  }

  async sign(token: string, data: { signatureData: string; signedByName: string; signedByEmail: string; signedByIp?: string }) {
    const contract = await prisma.contract.findUnique({ where: { publicToken: token } });
    if (!contract) throw new Error('Contrato no encontrado');
    if (contract.status === 'signed') throw new Error('Contrato ya firmado');
    return prisma.contract.update({ where: { id: contract.id }, data: { status: 'signed', signedAt: new Date(), ...data } });
  }

  async getStats() {
    const [total, byStatus] = await Promise.all([
      prisma.contract.count(),
      prisma.contract.groupBy({ by: ['status'], _count: true }),
    ]);
    return { total, byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count])) };
  }

  // Duplicar contrato existente
  async duplicate(id: string) {
    const original = await prisma.contract.findUnique({ where: { id } });
    if (!original) throw new Error('Contrato no encontrado');
    const contractNumber = await this.generateNumber();
    const { id: _id, contractNumber: _cn, publicToken: _pt, status: _s, signedAt: _sa, signatureData: _sd, signedByName: _sn, signedByEmail: _se, signedByIp: _si, sentAt: _st, viewedAt: _va, createdAt: _ca, updatedAt: _ua, ...rest } = original;
    const crypto = await import('crypto');
    return prisma.contract.create({ data: { ...rest, contractNumber, publicToken: crypto.randomUUID(), status: 'draft' } });
  }

  // Generar PDF del contrato de gestión
  async generatePDF(id: string): Promise<Buffer> {
    const PDFDocument = (await import('pdfkit')).default;
    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new Error('Contrato no encontrado');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(18).font('Helvetica-Bold').text('CONTRATO', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(`Nº: ${contract.contractNumber}`, { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(10);
      doc.text(`Cliente: ${contract.clientName}`);
      if (contract.clientEmail) doc.text(`Email: ${contract.clientEmail}`);
      if (contract.budgetRef) doc.text(`Ref. Presupuesto: ${contract.budgetRef}`);
      doc.moveDown();
      doc.text(`Título: ${contract.title}`);
      doc.text(`Importe: €${Number(contract.totalAmount || 0).toFixed(2)}`);
      doc.moveDown(2);

      if (contract.content) {
        doc.fontSize(10).text(contract.content, { align: 'justify' });
      }

      doc.moveDown(3);
      if (contract.signedAt && contract.signedByName) {
        doc.text(`Firmado por: ${contract.signedByName}`);
        doc.text(`Fecha firma: ${new Date(contract.signedAt).toLocaleDateString('es-ES')}`);
      } else {
        doc.text('Pendiente de firma');
      }

      doc.end();
    });
  }
}

export const contractMgmtService = new ContractMgmtService();
