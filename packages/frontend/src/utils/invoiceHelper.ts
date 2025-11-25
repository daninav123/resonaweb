/**
 * Helper para determinar si un pedido debe mostrar factura o presupuesto
 */

export const canDownloadInvoice = (orderStartDate: string): boolean => {
  const eventDate = new Date(orderStartDate);
  const now = new Date();
  
  // Solo se puede descargar factura después de la fecha del evento
  return now >= eventDate;
};

export const getDocumentType = (orderStartDate: string): 'invoice' | 'quote' => {
  return canDownloadInvoice(orderStartDate) ? 'invoice' : 'quote';
};

export const getDocumentLabel = (orderStartDate: string): string => {
  return canDownloadInvoice(orderStartDate) ? 'Factura' : 'Presupuesto';
};

export const getDocumentAction = (orderStartDate: string): string => {
  return canDownloadInvoice(orderStartDate) ? 'Descargar Factura' : 'Descargar Presupuesto';
};
