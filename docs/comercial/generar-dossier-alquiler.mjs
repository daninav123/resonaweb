// Genera el dossier de alquiler de Resona Rent en dos versiones:
//   node docs/comercial/generar-dossier-alquiler.mjs            → interna (coste de compra y stock)
//   node docs/comercial/generar-dossier-alquiler.mjs --cliente  → versión entregable
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { catalogoAjustado } from './catalogo-ajustado.mjs';
import { PENDIENTES, PACKS_SIN_DESGLOSE_NOTA } from './ajustes-precios.data.mjs';
import {
  IVA, EXCLUIDOS, ORDEN_CATEGORIAS, DURACION, FIANZA, PAGO,
  DESCUENTOS, LOGISTICA, CONDICIONES_CLIENTE, AVISOS_INTERNOS,
} from './reglas-alquiler.data.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const INTERNO = !process.argv.includes('--cliente');

const eur = (n) => `${Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const eur0 = (n) => `${Math.round(Number(n)).toLocaleString('es-ES')} €`;
const conIva = (n) => n * (1 + IVA);
const titulo = (s) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1);

const { items: CATALOGO, cambios, SNAPSHOT } = catalogoAjustado();
const activos = CATALOGO.filter((p) => !EXCLUIDOS.includes(p.sku));
const cambiosPrecio = cambios.filter((c) => c.campo === 'dia' && !EXCLUIDOS.includes(c.sku));
const personal = activos.filter((p) => p.categoria === 'Personal');
const consumibles = activos.filter((p) => p.consumible && p.categoria !== 'Personal');
const packs = activos.filter((p) => p.pack && !p.consumible && p.categoria !== 'Personal');
const material = activos.filter((p) => !p.pack && !p.consumible && p.categoria !== 'Personal');

const categorias = [...new Set(material.map((p) => p.categoria))].sort((a, b) => {
  const ia = ORDEN_CATEGORIAS.indexOf(a);
  const ib = ORDEN_CATEGORIAS.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b, 'es');
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
});

const valorInventario = material.reduce((s, p) => s + (p.compra ?? 0) * (p.stock || 0), 0);

const thMaterial = INTERNO
  ? `<th>Ref</th><th>Equipo</th><th class="num">Uds</th><th class="num">Compra</th><th class="num">€/día</th><th class="num">Semana</th><th class="num">Con IVA</th>`
  : `<th>Equipo</th><th class="num">Uds</th><th class="num">€/día</th><th class="num">Semana (7 días)</th><th class="num">€/día con IVA</th>`;

const filaMaterial = (p) => INTERNO
  ? `<tr>
      <td class="id">${p.sku}</td>
      <td>${p.nombre}</td>
      <td class="num">${p.stock}</td>
      <td class="num compra">${p.compra ? eur0(p.compra) : '—'}</td>
      <td class="num pvp">${eur(p.dia)}</td>
      <td class="num">${eur0(p.semana)}</td>
      <td class="num iva">${eur(conIva(p.dia))}</td>
    </tr>`
  : `<tr>
      <td>${p.nombre}</td>
      <td class="num">${p.stock}</td>
      <td class="num pvp">${eur(p.dia)}</td>
      <td class="num">${eur0(p.semana)}</td>
      <td class="num iva">${eur(conIva(p.dia))}</td>
    </tr>`;

const tablaPacks = () => `
<table>
  <thead><tr>
    ${INTERNO ? '<th>Ref</th>' : ''}<th>Pack</th>
    <th class="num">Suelto</th><th class="num">€/día</th><th class="num">Ahorras</th><th class="num">Semana</th><th class="num">Con IVA</th>
  </tr></thead>
  <tbody>${packs.map((p) => `
  <tr class="head">
    ${INTERNO ? `<td class="id">${p.sku}</td>` : ''}
    <td class="nombre"><strong>${titulo(p.nombre)}</strong></td>
    <td class="num compra">${p.suelto ? eur0(p.suelto) : '—'}</td>
    <td class="num pvp">${eur0(p.dia)}</td>
    <td class="num ahorro">${p.ahorro ? '−' + eur0(p.ahorro) : '—'}</td>
    <td class="num">${eur0(p.semana)}</td>
    <td class="num iva">${eur0(conIva(p.dia))}</td>
  </tr>
  ${p.componentes.length ? `<tr class="detail"><td colspan="${INTERNO ? 7 : 6}"><span class="lbl">Incluye</span> ${p.componentes.join(' &nbsp;·&nbsp; ')}</td></tr>` : ''}`).join('')}</tbody>
</table>
${packs.some((p) => !p.componentes.length) ? `<p class="nota">${INTERNO ? PACKS_SIN_DESGLOSE_NOTA + ' Confirma qué llevan antes de venderlos.' : 'Consulta el contenido exacto de los packs sin desglose antes de reservar.'}</p>` : ''}`;

const html = `<meta charset="utf-8">
<title>${INTERNO ? 'Tarifa de alquiler · Resona Rent' : 'Tarifa de alquiler · Resona'}</title>
<style>
  @page { size: A4; margin: 12mm 10mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #14213d; font-size: 8.6pt; line-height: 1.35; margin: 0; }
  h1 { font-size: 21pt; margin: 0 0 2mm; letter-spacing: -.02em; }
  h2 { font-size: 11pt; margin: 7mm 0 2mm; padding-bottom: 1.2mm; border-bottom: 1.5pt solid #1b4b8f; color: #1b4b8f; page-break-after: avoid; }
  h3 { font-size: 9.5pt; margin: 4mm 0 1.5mm; color: #1b4b8f; page-break-after: avoid; }
  p { margin: 0 0 2mm; }
  .sub { color: #5a6a85; font-size: 9pt; }
  .portada { page-break-after: always; padding-top: 6mm; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; }
  .box { background: #f2f6fb; border-left: 2.5pt solid #1b4b8f; padding: 2.5mm 3.5mm; margin-bottom: 2.5mm; }
  .box strong { color: #1b4b8f; }
  .formula { font-family: "SF Mono", Menlo, monospace; font-size: 8.5pt; background: #14213d; color: #fff; padding: 3mm 4mm; border-radius: 1.5mm; margin: 2mm 0 3mm; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #14213d; color: #fff; font-size: 7pt; text-transform: uppercase; letter-spacing: .04em; padding: 1.8mm 1.5mm; text-align: left; font-weight: 600; }
  th.num, td.num { text-align: right; white-space: nowrap; }
  td { padding: 1.5mm; vertical-align: top; border-top: .5pt solid #dde5f0; }
  .id { font-family: "SF Mono", Menlo, monospace; font-size: 7pt; color: #8494ab; white-space: nowrap; }
  .compra { color: #8494ab; }
  .ahorro { color: #0f7a4d; font-weight: 600; }
  table.cambios td { font-size: 7.6pt; }
  .antes { color: #8494ab; text-decoration: line-through; }
  .despues { color: #0f7a4d; font-weight: 700; }
  .pvp { font-weight: 700; color: #1b4b8f; }
  .iva { color: #5a6a85; }
  tr.detail td { border-top: 0; padding-top: 0; padding-bottom: 2.5mm; font-size: 7.2pt; color: #5a6a85; }
  .lbl { display: inline-block; min-width: 13mm; font-size: 6.5pt; text-transform: uppercase; letter-spacing: .04em; color: #8494ab; font-weight: 600; }
  .nota { font-size: 7.2pt; color: #7b8aa1; }
  tbody { page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  ul { margin: 0; padding-left: 4mm; }
  li { margin-bottom: 1.4mm; }
  footer { margin-top: 6mm; padding-top: 2mm; border-top: .5pt solid #c8d4e4; font-size: 7pt; color: #8494ab; }
</style>

<div class="portada">
  <h1>Tarifa de alquiler · Resona Rent</h1>
  ${INTERNO
    ? `<p class="sub">Documento interno — incluye precio de compra y stock físico. No entregar al cliente.</p>`
    : `<p class="sub">Alquiler de material audiovisual en Valencia · Recogida en almacén o entrega a domicilio</p>`}
  <p class="sub">Precios sin IVA, por día · Catálogo a ${SNAPSHOT} · ${material.length} equipos, ${packs.length} packs</p>

  <div class="cols" style="margin-top:6mm">
    <div>
      <h2 style="margin-top:0">Cómo funciona el precio</h2>
      <div class="formula">Total = Precio/día × días × unidades + IVA (21%)</div>
      <table>
        <thead><tr><th>Duración</th><th>Precio</th></tr></thead>
        <tbody>${DURACION.map((d) => `<tr><td><strong>${d.concepto}</strong><br><span class="nota">${d.detalle}</span></td><td class="num pvp" style="width:30%">${d.regla}</td></tr>`).join('')}</tbody>
      </table>

      <h3>Entrega y montaje</h3>
      <table>
        <tbody>${LOGISTICA.map((l) => `<tr><td><strong>${l.concepto}</strong><br><span class="nota">${l.detalle}</span></td><td class="num pvp" style="width:28%">${l.precio}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div>
      <h2 style="margin-top:0">Fianza</h2>
      <div class="box">${FIANZA.texto}</div>
      <ul class="nota" style="margin-bottom:2.5mm">${FIANZA.exenciones.map((e) => `<li>${e}</li>`).join('')}</ul>
      <p class="nota">${FIANZA.cobro}</p>

      <h3>Formas de pago</h3>
      <table>
        <tbody>${PAGO.map((p) => `<tr><td><strong>${p.opcion}</strong><br><span class="nota">${p.detalle}</span></td><td class="num pvp" style="width:32%">${p.efecto}</td></tr>`).join('')}</tbody>
      </table>

      <h3>Descuentos</h3>
      <table>
        <tbody>${DESCUENTOS.lista.filter((d) => INTERNO || d.cliente).map((d) => `<tr><td>${d.concepto}</td><td class="num pvp" style="width:28%">${d.valor}</td></tr>`).join('')}</tbody>
      </table>
      <p class="nota">${DESCUENTOS.nota}</p>
    </div>
  </div>

  ${INTERNO ? `
  <h2>Avisos internos</h2>
  <div class="cols">
    <ul>${AVISOS_INTERNOS.slice(0, 3).map((a) => `<li>${a}</li>`).join('')}</ul>
    <ul>${AVISOS_INTERNOS.slice(3).map((a) => `<li>${a}</li>`).join('')}</ul>
  </div>
  <p class="nota" style="margin-top:3mm">Valor de compra del inventario alquilable: <strong>${eur0(valorInventario)}</strong> repartidos en ${material.reduce((s, p) => s + (p.stock || 0), 0)} unidades.</p>
  ` : ''}
</div>

${categorias.map((c) => `
<h2>${c}</h2>
<table>
  <thead><tr>${thMaterial}</tr></thead>
  <tbody>${material.filter((p) => p.categoria === c).sort((a, b) => b.dia - a.dia).map(filaMaterial).join('')}</tbody>
</table>`).join('')}

<h2>Packs de alquiler</h2>
<p class="sub" style="margin-bottom:2mm">Combinaciones cerradas, más baratas que alquilar los equipos sueltos.</p>
${tablaPacks()}

<h2>Personal</h2>
<p class="sub" style="margin-bottom:2mm">Precio por hora. Mínimo 4 horas por servicio.</p>
<table>
  <thead><tr><th>Perfil</th><th class="num">€/hora</th><th class="num">Con IVA</th></tr></thead>
  <tbody>${personal.map((p) => `<tr><td>${p.nombre}</td><td class="num pvp">${eur(p.dia)}</td><td class="num iva">${eur(conIva(p.dia))}</td></tr>`).join('')}</tbody>
</table>

${consumibles.length ? `
<h2>Consumibles</h2>
<p class="sub" style="margin-bottom:2mm">Se venden, no se alquilan: se facturan por unidad gastada.</p>
<table>
  <thead><tr><th>Consumible</th><th class="num">€/unidad</th><th class="num">Con IVA</th></tr></thead>
  <tbody>${consumibles.map((p) => `<tr><td>${p.nombre}</td><td class="num pvp">${p.precioUnidad ? eur(p.precioUnidad) : 'A consultar'}</td><td class="num iva">${p.precioUnidad ? eur(conIva(p.precioUnidad)) : '—'}</td></tr>`).join('')}</tbody>
</table>` : ''}

${INTERNO ? `
<h2>Cambios sobre la tarifa que había en el panel</h2>
<p class="sub" style="margin-bottom:2mm">Estos precios ya están aplicados en este documento, pero <strong>todavía no en la base de datos</strong>: la web sigue cobrando los de la columna “Antes” hasta que se ejecute <code>aplicar-ajustes-bd.mjs --escribir</code>.</p>
<table class="cambios">
  <thead><tr><th>Ref</th><th>Equipo o pack</th><th class="num">Antes</th><th class="num">Ahora</th><th>Motivo</th></tr></thead>
  <tbody>${cambiosPrecio.map((c) => `<tr>
    <td class="id">${c.sku}</td>
    <td>${titulo(c.nombre)}</td>
    <td class="num antes">${eur(c.antes)}</td>
    <td class="num despues">${eur(c.despues)}</td>
    <td class="nota">${c.motivo}</td>
  </tr>`).join('')}</tbody>
</table>
<p class="nota">Además, el precio de semana pasa a ser 5 × el precio de día en todo el catálogo: había pantallas LED y personal con la semana al mismo precio que un solo día.</p>

<h3>Pendiente de decidir</h3>
<ul class="nota">${PENDIENTES.map((x) => `<li>${x}</li>`).join('')}</ul>
` : ''}

<h2>Condiciones</h2>
<div class="cols">
  <ul>${CONDICIONES_CLIENTE.slice(0, 3).map((c) => `<li>${c}</li>`).join('')}</ul>
  <ul>${CONDICIONES_CLIENTE.slice(3).map((c) => `<li>${c}</li>`).join('')}</ul>
</div>

<footer>Resona Rent · Valencia · Catálogo extraído de la base de datos el ${SNAPSHOT}. ${INTERNO ? 'Documento interno: no compartir.' : 'Precios orientativos sujetos a disponibilidad; consulta stock antes de reservar.'}</footer>
`;

const base = INTERNO ? 'tarifa-alquiler-interna' : 'tarifa-alquiler-cliente';
writeFileSync(join(DIR, `${base}.html`), html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({
  path: join(DIR, `${base}.pdf`),
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `<div style="width:100%;font-size:7pt;color:#8494ab;padding:0 10mm;display:flex;justify-content:space-between;font-family:Helvetica"><span>Resona Rent · Tarifa de alquiler${INTERNO ? ' · Documento interno' : ''}</span><span class="pageNumber"></span></div>`,
});
await browser.close();

console.log(`${base}: ${material.length} equipos · ${packs.length} packs · ${personal.length} perfiles · ${consumibles.length} consumibles`);
