// Aplica ajustes-precios.data.mjs sobre el snapshot de la BD.
// Lo usan tanto el generador del dossier como el script que escribe en la BD.
import { CATALOGO, SNAPSHOT } from './tarifa-alquiler.data.mjs';
import { OVERRIDES, REGLAS } from './ajustes-precios.data.mjs';

const redondea = (n, paso) => Math.round(n / paso) * paso;

export function catalogoAjustado() {
  const items = CATALOGO.map((p) => ({ ...p }));
  const porNombre = new Map(items.map((p) => [p.nombre.toLowerCase().trim(), p]));
  const cambios = [];

  const anota = (p, campo, antes, despues, motivo) => {
    if (Math.abs(antes - despues) < 0.005) return;
    cambios.push({ sku: p.sku, nombre: p.nombre, campo, antes, despues, motivo });
  };

  for (const p of items) {
    const ov = OVERRIDES[p.sku];
    if (ov) {
      anota(p, 'dia', p.dia, ov.dia, ov.motivo);
      p.dia = ov.dia;
      p.finde = ov.dia;
    }
  }

  // Los packs se recalculan sobre los precios ya ajustados de sus piezas.
  for (const p of items) {
    if (!p.pack || !p.componentes.length) continue;
    let suelto = 0;
    let completo = true;
    for (const c of p.componentes) {
      const m = c.match(/^(\d+)× (.+)$/);
      const pieza = m && porNombre.get(m[2].toLowerCase().trim());
      if (!pieza) { completo = false; break; }
      suelto += pieza.dia * Number(m[1]);
    }
    if (!completo || suelto <= 0 || REGLAS.descuentoPack === null) continue;
    const nuevo = redondea(suelto * (1 - REGLAS.descuentoPack), REGLAS.redondeoPack);
    anota(p, 'dia', p.dia, nuevo,
      `Sus piezas sueltas suman ${suelto.toFixed(0)} €: el pack pasa a ahorrar un ${Math.round(REGLAS.descuentoPack * 100)}%.`);
    p.dia = nuevo;
    p.finde = nuevo;
    p.ahorro = suelto - nuevo;
    p.suelto = suelto;
  }

  // El precio de semana deja de ser un campo suelto: siempre 5 días.
  for (const p of items) {
    if (p.categoria === 'Personal' || REGLAS.factorSemana === null) continue;
    const nuevo = Math.round(p.dia * REGLAS.factorSemana);
    anota(p, 'semana', p.semana, nuevo, `Semana = ${REGLAS.factorSemana} días.`);
    p.semana = nuevo;
  }

  return { items, cambios, SNAPSHOT };
}
