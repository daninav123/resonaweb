import PDFDocument from 'pdfkit';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export class ContractService {
  /**
   * Generar contrato de alquiler en PDF
   */
  async generateContract(orderId: string): Promise<Buffer> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      // Obtener configuración de la empresa
      const companySettings = await prisma.companySettings.findFirst();

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Título
        doc.fontSize(20).font('Helvetica-Bold').text('CONTRATO DE ALQUILER', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).font('Helvetica').text(`Nº Pedido: ${order.orderNumber}`, { align: 'center' });
        doc.moveDown(2);

        // Datos de la empresa
        doc.fontSize(14).font('Helvetica-Bold').text('DATOS DEL ARRENDADOR', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Empresa: ${companySettings?.companyName || 'Resona Eventos'}`);
        doc.text(`NIF/CIF: ${companySettings?.taxId || 'B12345678'}`);
        doc.text(`Dirección: ${companySettings?.address || 'C/ de l\'Illa Cabrera, 13, 46026 València'}`);
        doc.text(`Teléfono: ${companySettings?.phone || '+34 123 456 789'}`);
        doc.text(`Email: ${companySettings?.email || 'info@resonaeventos.com'}`);
        doc.moveDown(2);

        // Datos del cliente
        doc.fontSize(14).font('Helvetica-Bold').text('DATOS DEL ARRENDATARIO', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Nombre: ${order.user?.firstName} ${order.user?.lastName}`);
        doc.text(`DNI/NIF: ${order.user?.taxId || '__________________'}`);
        doc.text(`Email: ${order.user?.email}`);
        doc.text(`Teléfono: ${order.contactPhone}`);
        if (order.deliveryAddress) {
          let address = '';
          try {
            const deliveryAddr = order.deliveryAddress as any;
            if (typeof deliveryAddr === 'string') {
              // Intentar parsear como JSON
              try {
                const parsedAddress = JSON.parse(deliveryAddr);
                address = parsedAddress.address || deliveryAddr;
              } catch {
                // Si falla el parse, usar como string
                address = deliveryAddr;
              }
            } else if (deliveryAddr && typeof deliveryAddr === 'object') {
              // Si ya es objeto
              address = deliveryAddr.address || JSON.stringify(deliveryAddr);
            }
          } catch (error) {
            address = 'Dirección no disponible';
          }
          doc.text(`Dirección: ${address}`);
        }
        doc.moveDown(2);

        // Fechas del alquiler
        doc.fontSize(14).font('Helvetica-Bold').text('PERÍODO DE ALQUILER', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Inicio: ${new Date(order.startDate).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`);
        doc.text(`Fin: ${new Date(order.endDate).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`);
        doc.moveDown(2);

        // Material alquilado
        doc.fontSize(14).font('Helvetica-Bold').text('MATERIAL ALQUILADO', { underline: true });
        doc.moveDown(0.5);

        // Tabla de productos
        const tableTop = doc.y;
        const itemHeight = 20;
        
        // Headers
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Producto', 50, tableTop, { width: 200 });
        doc.text('Cantidad', 250, tableTop, { width: 60, align: 'center' });
        doc.text('Precio/día', 310, tableTop, { width: 80, align: 'right' });
        doc.text('Días', 390, tableTop, { width: 50, align: 'center' });
        doc.text('Total', 440, tableTop, { width: 100, align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();

        // Items
        let y = tableTop + itemHeight;
        doc.fontSize(9).font('Helvetica');

        order.items.forEach((item: any) => {
          const startDate = new Date(item.startDate);
          const endDate = new Date(item.endDate);
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

          doc.text(item.product?.name || 'Producto', 50, y, { width: 200 });
          doc.text(String(item.quantity), 250, y, { width: 60, align: 'center' });
          doc.text(`€${Number(item.pricePerUnit || 0).toFixed(2)}`, 310, y, { width: 80, align: 'right' });
          doc.text(String(days), 390, y, { width: 50, align: 'center' });
          doc.text(`€${Number(item.totalPrice || 0).toFixed(2)}`, 440, y, { width: 100, align: 'right' });
          
          y += itemHeight;
        });

        doc.moveTo(50, y).lineTo(540, y).stroke();
        y += 10;

        // Totales
        doc.fontSize(10).font('Helvetica');
        doc.text('Subtotal:', 340, y, { width: 100, align: 'right' });
        doc.text(`€${Number(order.subtotal).toFixed(2)}`, 440, y, { width: 100, align: 'right' });
        y += 15;

        if (Number(order.shippingCost) > 0) {
          doc.text('Envío/Montaje:', 340, y, { width: 100, align: 'right' });
          doc.text(`€${Number(order.shippingCost).toFixed(2)}`, 440, y, { width: 100, align: 'right' });
          y += 15;
        }

        doc.text('IVA (21%):', 340, y, { width: 100, align: 'right' });
        doc.text(`€${Number(order.taxAmount).toFixed(2)}`, 440, y, { width: 100, align: 'right' });
        y += 15;

        doc.font('Helvetica-Bold');
        doc.text('TOTAL:', 340, y, { width: 100, align: 'right' });
        doc.text(`€${Number(order.total).toFixed(2)}`, 440, y, { width: 100, align: 'right' });
        
        if (Number(order.depositAmount) > 0) {
          y += 20;
          doc.moveTo(50, y).lineTo(540, y).stroke();
          y += 10;
          doc.font('Helvetica-Bold');
          doc.fontSize(11);
          doc.text('FIANZA (reembolsable):', 340, y, { width: 100, align: 'right' });
          doc.text(`€${Number(order.depositAmount).toFixed(2)}`, 440, y, { width: 100, align: 'right' });
          y += 15;
          doc.fontSize(9).font('Helvetica');
          doc.text('* A devolver en 7 días tras devolución satisfactoria', 50, y, { width: 490, align: 'center' });
        }

        doc.moveDown(3);

        // Condiciones
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text('CONDICIONES DEL CONTRATO', { underline: true });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica');
        
        const conditions = [
          '1. El arrendatario se compromete a devolver el material en las mismas condiciones en que fue entregado.',
          `2. FIANZA: Se establece una fianza de €${Number(order.depositAmount || 0).toFixed(2)} que será retenida hasta la correcta devolución del material. La fianza cubre posibles daños, pérdidas o retrasos en la devolución.`,
          '3. Cualquier daño o pérdida será responsabilidad del arrendatario y se descontará de la fianza. Si los daños superan el importe de la fianza, el arrendatario deberá abonar la diferencia.',
          '4. El material debe ser devuelto en la fecha acordada. Retrasos pueden incurrir en cargos adicionales de €50 por día de retraso, a descontar de la fianza.',
          '5. El arrendador se reserva el derecho de inspeccionar el material en el momento de la devolución. Se realizará un inventario completo y verificación del estado.',
          '6. La fianza será devuelta dentro de 7 días hábiles tras la devolución satisfactoria del material, mediante transferencia bancaria a la cuenta proporcionada por el arrendatario.',
          '7. El arrendatario es responsable del material desde el momento de la recogida/entrega hasta su devolución, incluido transporte y almacenamiento.',
          '8. No está permitido subalquilar o prestar el material a terceros sin autorización previa por escrito del arrendador.',
          '9. Cancelaciones deben realizarse según la política establecida. Cancelaciones con menos de 48 horas de antelación no tendrán derecho a devolución.',
          '10. El arrendatario declara haber leído y aceptado todas las condiciones de este contrato.',
        ];

        conditions.forEach(condition => {
          doc.text(condition, { align: 'justify' });
          doc.moveDown(0.5);
        });

        doc.moveDown(2);

        // Estado del material al entregar
        doc.fontSize(14).font('Helvetica-Bold').text('ESTADO DEL MATERIAL AL ENTREGAR', { underline: true });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica');
        doc.text('El arrendatario confirma que ha recibido el material en buen estado y funcionamiento:');
        doc.moveDown();
        doc.text('☐ Conforme     ☐ Con observaciones: _________________________________');
        doc.moveDown(3);

        // Firmas
        doc.fontSize(12).font('Helvetica-Bold').text('FIRMAS', { underline: true });
        doc.moveDown(2);

        const signatureY = doc.y;
        
        // Firma del cliente
        doc.fontSize(10).font('Helvetica');
        doc.text('El Arrendatario', 70, signatureY);
        doc.moveTo(70, signatureY + 50).lineTo(240, signatureY + 50).stroke();
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 70, signatureY + 60);

        // Firma de la empresa
        doc.text('El Arrendador', 350, signatureY);
        doc.moveTo(350, signatureY + 50).lineTo(520, signatureY + 50).stroke();
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 350, signatureY + 60);

        doc.end();
      });
    } catch (error) {
      logger.error('Error generating contract:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();
