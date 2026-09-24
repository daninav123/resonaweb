// Reglas comerciales del alquiler (Resona Rent). Editar a mano.
// Fuente de verdad del código: apps/rent/src/utils/{cartCalculations,depositCalculator,priceWithVAT}.ts

export const IVA = 0.21;

// SKUs que están en la BD pero no deben salir en ningún dossier (pruebas del panel).
export const EXCLUIDOS = ['PACK-C5D29FA8', 'PACK-6AFA6CD4', 'PACK-DA9C5FF5', 'VIRTUAL-EVENT-001'];

// Orden de las categorías en el documento. Las no listadas van al final por orden alfabético.
export const ORDEN_CATEGORIAS = [
  'SONIDO',
  'CONTROL SONIDO',
  'MESAS DE MEZCLA PARA DIRECTO',
  'EQUIPAMIENTO DJ',
  'MICROFONIA',
  'ILUMINACION',
  'CONTROL ILUMINACION',
  'FX',
  'PANTALLAS Y PROYECCIÓN',
  'ESTRUCTURAS',
  'ELEMENTOS ESCENARIO',
  'ELEMENTOS DECORATIVOS',
  'GENERACIÓN Y DISTRIBUCIÓN',
  'CABLEADO',
];

export const DURACION = [
  { concepto: '1 día', regla: 'Precio de tarifa', detalle: 'Recogida y devolución el mismo día o al día siguiente por la mañana.' },
  { concepto: 'Fin de semana', regla: 'Igual que 1 día', detalle: 'Viernes desde las 14:00 hasta el lunes a las 10:00. Es la modalidad más habitual y no cuesta más que un día suelto.' },
  { concepto: '2 a 6 días', regla: 'Precio de tarifa × nº de días', detalle: 'A partir de 3 días conviene pedir descuento: es negociable.' },
  { concepto: 'Semana completa (7 días)', regla: 'Precio de tarifa × 5', detalle: 'Dos días gratis sobre el cálculo lineal.' },
  { concepto: 'Más de una semana', regla: 'Presupuesto a medida', detalle: 'Consultar con Dani.' },
];

export const FIANZA = {
  factor: 2,
  minimo: 50,
  maximo: 400,
  bloque: 50,
  texto: 'Dos veces el importe del alquiler, redondeado al alza a bloques de 50 €, con un mínimo de 50 € y un tope de 400 €.',
  exenciones: [
    'Clientes VIP y VIP Plus no dejan fianza.',
    'Pedidos con transporte y montaje incluidos no llevan fianza: el material no sale de nuestras manos.',
  ],
  cobro: 'Se cobra en tienda al recoger, nunca online, y se devuelve íntegra al comprobar el material.',
};

export const PAGO = [
  { opcion: 'Reserva online', detalle: '25% al confirmar el pedido, 75% restante al recoger en el almacén.', efecto: 'Sin descuento.' },
  { opcion: 'Pago completo online', detalle: '100% al confirmar el pedido.', efecto: '10% de descuento por pronto pago.' },
];

export const DESCUENTOS = {
  nota: 'Los descuentos NO se acumulan: se aplica solo el mayor de todos los que apliquen.',
  lista: [
    { concepto: 'Pronto pago (100% online)', valor: '10%', cliente: true },
    { concepto: 'Cupón promocional', valor: 'Según cupón', cliente: true },
    { concepto: 'Programa VIP (clientes recurrentes)', valor: 'A consultar', cliente: true },
    { concepto: 'Nivel VIP en la web', valor: '25%', cliente: false },
    { concepto: 'Nivel VIP Plus en la web', valor: '70%', cliente: false },
  ],
};

export const LOGISTICA = [
  { concepto: 'Recogida en almacén (Valencia)', precio: 'Gratis', detalle: 'Horario acordado. Es la opción por defecto.' },
  { concepto: 'Entrega y recogida a domicilio', precio: '1,50 €/km', detalle: 'Se calcula sobre la distancia desde el almacén. Ida y vuelta ya incluidas en esa tarifa.' },
  { concepto: 'Montaje por nuestro equipo', precio: 'Según montaje', detalle: 'El alquiler con montaje no es autoservicio: se presupuesta con la tarifa de montajes de Resona Events.' },
];

export const CONDICIONES_CLIENTE = [
  'Los precios de este dossier son <strong>sin IVA</strong>. Al total se le suma un 21%.',
  'El material se entrega revisado y con todo el cableado necesario para funcionar.',
  'La reserva de fechas no se bloquea hasta que se confirma el pedido y entra el pago.',
  'El material se devuelve en el mismo estado. Los daños o pérdidas se descuentan de la fianza al coste de reposición.',
  'El uso del equipo es responsabilidad del cliente: no se admiten devoluciones por no saber conectarlo. Si tienes dudas, contrata el montaje.',
  'Cancelación con más de 7 días: devolución íntegra. Con menos de 7 días: se retiene el 25% de reserva.',
];

export const AVISOS_INTERNOS = [
  'La web cobra <strong>precio/día × número de días</strong> de forma lineal: el precio de semana (×5) no está automatizado en el carrito, hay que aplicarlo a mano en el pedido.',
  'Fin de semana y un día valen lo mismo en BD. No prometas descuento adicional por finde: ya está aplicado.',
  'Antes de confirmar fecha comprueba <strong>stock real</strong>: la columna Uds es lo que hay físicamente, no lo que queda libre ese día.',
  'La columna Compra es lo que nos costó el equipo. Sirve para valorar la fianza y para saber cuánto duele perderlo, no para calcular precio.',
  'Si el cliente pide montaje, deja de ser Rent: pásalo a la tarifa de montajes de Events.',
  'Nunca bajes de tarifa sin autorización de Dani. El alquiler ya está ajustado; el margen está en el volumen, no en el descuento.',
];
