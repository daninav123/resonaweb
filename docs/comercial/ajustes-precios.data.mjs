// Correcciones sobre el snapshot de la BD. Editar a mano.
// El dossier se genera SIEMPRE con estos precios ya aplicados; la BD solo cambia
// al ejecutar aplicar-ajustes-bd.mjs --escribir.

// Precio/día nuevo por SKU, con el motivo del cambio.
// Dani da por buenos los precios de Rent que hay en la BD: no se sobrescribe ninguno.
// Lo que se detectó como incoherente está en PENDIENTES, sin aplicar.
export const OVERRIDES = {};

// Packs cuyo contenido no está cargado en el panel: no se pueden recalcular.
export const PACKS_SIN_DESGLOSE_NOTA = 'Precio sin verificar: falta cargar el contenido del pack en el panel.';

export const REGLAS = {
  // null = no se recalcula, el dossier muestra lo que hay en la BD.
  factorSemana: null,
  descuentoPack: null,
  redondeoPack: 5,
};

// Cambios que NO son de precio y hay que decidir aparte (no los aplica ningún script).
export const PENDIENTES = [
  'Packs más caros que sus piezas sueltas: "2x das audio 215a" cuesta 120 € y sus altavoces sueltos 99 €; "215a + sub" 200 € frente a 165 €. Al revés, "2x das audio 415a" a 50 € regala 34 € de trípodes y cables.',
  'Precio de semana sin criterio: las dos pantallas LED y el personal tienen la semana al precio de un solo día; otros artículos van a ×2,5, ×3 o ×4 en vez de ×5.',
  'Cinco artículos tienen el precio con decimales (49,58 · 66,11 · 24,79 · 70,25 · 12,39 €) porque se fijó el precio con IVA en el campo sin IVA.',
  'La cabeza Beam 7r está a 24,79 €/día y el mercado la alquila entre 50 y 70 €.',
  'Fianza: el tope de 400 € se queda corto para material de 1.000-3.000 € (mesa Chamsys, sub 218a, pantallas). Subirlo a 1.000 € toca apps/rent/src/utils/depositCalculator.ts y afecta al checkout.',
  'Diez packs no tienen contenido cargado en el panel: hasta que se cargue, su precio no se puede validar ni recalcular.',
  '"Pack sonido 215" (400 €/día) y "2x das audio 215a" (120 €/día) parecen lo mismo con nombres distintos. Revisar duplicados.',
  '"Boda Basic" está en Rent a 600 €/día; el montaje equivalente en Events es de 1.600 €. Decidir si ese pack debe seguir en el catálogo de alquiler.',
  'Las pantallas LED se alquilan mejor con montaje (Events) que sueltas (Rent): valorar sacarlas del catálogo de autoservicio.',
];
