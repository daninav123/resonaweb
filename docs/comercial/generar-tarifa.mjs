import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { TARIFA, PERSONAL, TRANSPORTE, PARAMS, MONTAJES, EXTRAS, SUPLEMENTOS } from './tarifa-montajes.data.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const INTERNO = !process.argv.includes('--cliente');
const IVA = 0.21;
const eurIva = (n) => `${Math.round(n * (1 + IVA)).toLocaleString('es-ES')} €`;
const eur = (n) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
const pct = (n) => `${Math.round(n * 100)}%`;
const dec = (n) => String(n).replace('.', ',');
const redondeaArriba = (n, paso) => Math.ceil(n / paso) * paso;
const redondeaAbajo = (n, paso) => Math.floor(n / paso) * paso;

function calcular(mnt, { pasoRedondeo } = {}) {
  const material = mnt.items.reduce((s, i) => {
    const t = TARIFA[i.key];
    if (!t) throw new Error(`Producto desconocido: ${i.key} en ${mnt.id}`);
    return s + t.p * i.qty;
  }, 0);
  const personal = (mnt.personal ?? []).reduce((s, p) => s + PERSONAL[p.rol].p * p.personas * p.horas, 0);
  const transporte = mnt.transporte ? TRANSPORTE[mnt.transporte].p : 0;

  const bruto = (material * PARAMS.factorServicio + personal + transporte) * (1 - (mnt.descuentoPack ?? 0));
  const paso = pasoRedondeo ?? (bruto >= 1000 ? 50 : 25);
  const pvp = mnt.pvpFijo ?? redondeaArriba(bruto, paso);

  const coste = material * PARAMS.costeMaterial + personal * PARAMS.costePersonal + transporte * PARAMS.costeTransporte;
  const suelo = redondeaAbajo(pvp * (1 - PARAMS.descuentoMaxComercial), paso);

  return {
    material, personal, transporte, pvp, coste,
    margen: pvp - coste,
    margenPct: (pvp - coste) / pvp,
    suelo,
    margenSueloPct: (suelo - coste) / suelo,
    horas: (mnt.personal ?? []).map((p) => `${p.personas}x ${PERSONAL[p.rol].n} · ${p.horas} h`).join(' · ') || '—',
    listaMaterial: mnt.items.map((i) => `${i.qty}× ${TARIFA[i.key].n}`).join(' · '),
  };
}

const montajes = MONTAJES.map((m) => ({ ...m, calc: calcular(m) }));
const extras = EXTRAS.map((m) => ({ ...m, calc: calcular(m, { pasoRedondeo: 10 }) }));

const grupos = [...new Set(montajes.map((m) => m.grupo))];

const colsMontaje = INTERNO ? 9 : 4;

const filaMontaje = (m) => INTERNO ? `
<tr class="head">
  <td class="id">${m.id}</td>
  <td class="nombre"><strong>${m.nombre}</strong><span class="resumen">${m.resumen}</span></td>
  <td class="num">${eur(Math.round(m.calc.material))}</td>
  <td class="num">${eur(Math.round(m.calc.personal))}</td>
  <td class="num">${eur(m.calc.transporte)}</td>
  <td class="num coste">${eur(Math.round(m.calc.coste))}</td>
  <td class="num pvp">${eur(m.calc.pvp)}</td>
  <td class="num margen">${eur(Math.round(m.calc.margen))}<span class="pct">${pct(m.calc.margenPct)}</span></td>
  <td class="num suelo">${eur(m.calc.suelo)}<span class="pct">${pct(m.calc.margenSueloPct)}</span></td>
</tr>
<tr class="detail">
  <td></td>
  <td colspan="8">
    <div class="incluye"><span class="lbl">Incluye</span> ${m.incluye.join(' &nbsp;·&nbsp; ')}</div>
    <div class="equipo"><span class="lbl">Personal</span> ${m.calc.horas}</div>
    <div class="equipo"><span class="lbl">Material</span> ${m.calc.listaMaterial}</div>
  </td>
</tr>` : `
<tr class="head">
  <td class="id">${m.id}</td>
  <td class="nombre"><strong>${m.nombre}</strong><span class="resumen">${m.resumen}</span></td>
  <td class="num pvp">${eur(m.calc.pvp)}</td>
  <td class="num iva">${eurIva(m.calc.pvp)}</td>
</tr>
<tr class="detail">
  <td></td>
  <td colspan="3">
    <div class="incluye"><span class="lbl">Incluye</span> ${m.incluye.join(' &nbsp;·&nbsp; ')}</div>
    <div class="equipo"><span class="lbl">Material</span> ${m.calc.listaMaterial}</div>
  </td>
</tr>`;

const thMontaje = INTERNO
  ? `<th>Ref</th><th>Montaje</th><th class="num">Material</th><th class="num">Personal</th><th class="num">Transp.</th><th class="num">Coste</th><th class="num">PVP</th><th class="num">Margen</th><th class="num">Suelo</th>`
  : `<th>Ref</th><th>Montaje</th><th class="num">Precio</th><th class="num">Con IVA</th>`;

const html = `<meta charset="utf-8">
<title>Tarifa de montajes · Resona Events</title>
<style>
  @page { size: A4 landscape; margin: 12mm 10mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #14213d; font-size: 8.4pt; line-height: 1.35; margin: 0; }
  h1 { font-size: 20pt; margin: 0 0 2mm; letter-spacing: -.02em; }
  h2 { font-size: 11pt; margin: 7mm 0 2mm; padding-bottom: 1.2mm; border-bottom: 1.5pt solid #1b4b8f; color: #1b4b8f; page-break-after: avoid; }
  h3 { font-size: 9.5pt; margin: 4mm 0 1.5mm; color: #1b4b8f; page-break-after: avoid; }
  p { margin: 0 0 2mm; }
  .sub { color: #5a6a85; font-size: 9pt; }
  .portada { page-break-after: always; padding-top: 8mm; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
  .box { background: #f2f6fb; border-left: 2.5pt solid #1b4b8f; padding: 3mm 4mm; margin-bottom: 3mm; }
  .box strong { color: #1b4b8f; }
  .formula { font-family: "SF Mono", Menlo, monospace; font-size: 8.5pt; background: #14213d; color: #fff; padding: 3mm 4mm; border-radius: 1.5mm; margin: 2mm 0 3mm; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #14213d; color: #fff; font-size: 7pt; text-transform: uppercase; letter-spacing: .04em; padding: 1.8mm 1.5mm; text-align: left; font-weight: 600; }
  th.num, td.num { text-align: right; }
  td { padding: 1.6mm 1.5mm; vertical-align: top; }
  tr.head td { border-top: .5pt solid #c8d4e4; }
  tr.head .id { font-family: "SF Mono", Menlo, monospace; font-size: 7pt; color: #8494ab; white-space: nowrap; }
  tr.head .nombre { width: 30%; }
  tr.head .resumen { display: block; color: #5a6a85; font-size: 7.4pt; font-weight: 400; }
  tr.head .coste { color: #8494ab; }
  tr.head .pvp { font-weight: 700; font-size: 10pt; color: #1b4b8f; white-space: nowrap; }
  tr.head .iva { color: #5a6a85; white-space: nowrap; }
  tr.head .margen { color: #0f7a4d; font-weight: 600; }
  tr.head .suelo { color: #b45309; font-weight: 600; }
  .pct { display: block; font-size: 6.8pt; font-weight: 400; opacity: .75; }
  tr.detail td { padding-top: 0; padding-bottom: 3mm; font-size: 7.2pt; color: #4a5a75; }
  tr.detail .lbl { display: inline-block; min-width: 15mm; font-size: 6.5pt; text-transform: uppercase; letter-spacing: .04em; color: #8494ab; font-weight: 600; }
  tr.detail .incluye { margin-bottom: .8mm; color: #14213d; }
  tr.detail .equipo { color: #7b8aa1; }
  table.simple td { border-top: .5pt solid #dde5f0; padding: 1.8mm 1.5mm; }
  table.simple .num { white-space: nowrap; font-weight: 600; color: #1b4b8f; }
  .nota { font-size: 7.2pt; color: #7b8aa1; }
  tbody { page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  .avisos li { margin-bottom: 1.5mm; }
  footer { margin-top: 6mm; padding-top: 2mm; border-top: .5pt solid #c8d4e4; font-size: 7pt; color: #8494ab; }
</style>

${INTERNO ? `
<div class="portada">
  <h1>Tarifa de montajes · Resona Events</h1>
  <p class="sub">Documento interno de uso comercial — contiene costes y márgenes. No entregar al cliente.</p>
  <p class="sub">Precios sin IVA · Zona Valencia y hasta 50 km · Un día de evento</p>

  <div class="cols" style="margin-top:6mm">
    <div>
      <h2 style="margin-top:0">Cómo se calcula un precio</h2>
      <div class="formula">PVP = (Material × ${dec(PARAMS.factorServicio)}) + Personal + Transporte</div>
      <p><strong>Material</strong>: suma de la tarifa de alquiler de Resona Rent de cada equipo. Es lo que cobramos a un tercero por llevárselo él.</p>
      <p><strong>× ${dec(PARAMS.factorServicio)}</strong>: recargo de servicio. Cubre montaje y desmontaje, consumibles, desgaste por transporte, revisión previa y el hecho de que el equipo queda bloqueado más de un día.</p>
      <p><strong>Personal</strong>: horas reales × tarifa (montador ${PERSONAL.montador.p} €/h · técnico ${PERSONAL.tecnico.p} €/h · DJ ${PERSONAL.dj.p} €/h).</p>
      <p><strong>Transporte</strong>: según volumen — ${Object.values(TRANSPORTE).map((t) => `${t.n} ${eur(t.p)}`).join(' · ')}. Incluye ida, vuelta, carga y descarga hasta 50 km.</p>
      <p>El resultado se redondea al alza a múltiplos de 25 € (50 € por encima de 1.000 €).</p>
    </div>
    <div>
      <h2 style="margin-top:0">Cómo leer las columnas</h2>
      <div class="box"><strong>PVP</strong> — el precio que ofreces. Es el de partida en cualquier presupuesto.</div>
      <div class="box"><strong>Coste</strong> — lo que nos cuesta de verdad: ${pct(PARAMS.costeMaterial)} de la tarifa del material (amortización, revisión, fungibles), ${pct(PARAMS.costePersonal)} del personal facturado (bruto + SS + dietas) y ${pct(PARAMS.costeTransporte)} del transporte (combustible, peajes, furgoneta).</div>
      <div class="box"><strong>Margen</strong> — PVP menos coste, en euros y en porcentaje sobre el PVP.</div>
      <div class="box"><strong>Suelo</strong> — el precio mínimo al que puedes cerrar sin consultar (${pct(PARAMS.descuentoMaxComercial)} de descuento máximo). Por debajo, lo autoriza Dani.</div>
      <h3>Reglas rápidas</h3>
      <ul class="avisos" style="margin:0; padding-left:4mm">
        <li>Antes de cerrar fecha, <strong>comprueba stock</strong>: hay equipos con una sola unidad (subgrave 218a, cabina jardín, mesa Chamsys, pantallas LED).</li>
        <li>Los precios son <strong>por un día de evento</strong>. Día extra: +35% sobre el material.</li>
        <li>Si el cliente pide algo que no está aquí, cotiza con la fórmula y avisa a Dani antes de enviarlo.</li>
        <li>Nunca prometas fuego frío ni pirotecnia sin confirmar que la finca lo autoriza.</li>
      </ul>
    </div>
  </div>
</div>` : `
<div class="portada">
  <h1>Montajes · Resona Events</h1>
  <p class="sub">Producción audiovisual de eventos en Valencia — bodas, fiestas privadas, empresa y conciertos.</p>
  <p class="sub">Precios por evento de un día, en zona Valencia y hasta 50 km. Se indican sin IVA y con IVA incluido.</p>

  <div class="cols" style="margin-top:6mm">
    <div>
      <h2 style="margin-top:0">Qué incluye cada montaje</h2>
      <div class="box"><strong>El material</strong> que aparece en el desglose, revisado y con todo el cableado necesario.</div>
      <div class="box"><strong>El equipo humano</strong>: montadores, técnico o DJ según el montaje, con las horas ya calculadas.</div>
      <div class="box"><strong>El transporte</strong> de ida y vuelta, la carga y la descarga, y el montaje y desmontaje completos.</div>
      <p class="nota">No hay cargos ocultos: lo que no esté en la lista de suplementos, no se factura.</p>
      <h3>Qué necesitamos del espacio</h3>
      <ul class="avisos" style="margin:0; padding-left:4mm">
        <li>Acometida eléctrica a menos de 25 m del montaje. Si no la hay, se añade generador.</li>
        <li>Acceso de vehículo hasta el punto de montaje.</li>
        <li>Acceso al espacio mínimo 4 horas antes del evento (6 h si lleva estructura).</li>
        <li>Los montajes al aire libre necesitan carpa o plan B: el equipo no sale bajo lluvia.</li>
      </ul>
    </div>
    <div>
      <h2 style="margin-top:0">Cómo contratamos</h2>
      <div class="box"><strong>Presupuesto</strong> — te confirmamos por escrito el montaje y el precio cerrado. Válido 15 días.</div>
      <div class="box"><strong>Reserva</strong> — 30% a la firma. La fecha queda bloqueada en ese momento, no antes.</div>
      <div class="box"><strong>Resto</strong> — 7 días antes del evento.</div>
      <h3>Cómo leer esta tarifa</h3>
      <p>Cada montaje es un paquete cerrado con su precio. Los <strong>extras</strong> se suman al montaje que elijas, y los <strong>suplementos</strong> solo se aplican si tu evento entra en alguno de esos casos.</p>
      <p>¿Tu evento no encaja en ninguno? Nos lo cuentas y te preparamos un montaje a medida partiendo de lo que ves aquí.</p>
    </div>
  </div>
</div>`}

${grupos.map((g) => `
<h2>${g}</h2>
<table>
  <thead><tr>${thMontaje}</tr></thead>
  <tbody>${montajes.filter((m) => m.grupo === g).map(filaMontaje).join('')}</tbody>
</table>`).join('')}

<h2>Extras y complementos</h2>
<p class="sub" style="margin-bottom:2mm">${INTERNO
  ? 'Se suman a cualquier montaje. El precio ya asume que se instalan en el mismo viaje: si el cliente contrata un extra suelto, súmale el transporte (80-180 € según volumen).'
  : 'Se añaden a cualquiera de los montajes anteriores.'}</p>
<table>
  <thead><tr>${INTERNO
    ? `<th>Ref</th><th>Extra</th><th class="num">Material</th><th class="num">Personal</th><th class="num">Transp.</th><th class="num">Coste</th><th class="num">PVP</th><th class="num">Margen</th><th class="num">Suelo</th>`
    : `<th>Ref</th><th>Extra</th><th class="num">Precio</th><th class="num">Con IVA</th>`}</tr></thead>
  <tbody>${extras.map((e) => INTERNO ? `
  <tr class="head">
    <td class="id">${e.id}</td>
    <td class="nombre"><strong>${e.nombre}</strong><span class="resumen">${e.nota}</span></td>
    <td class="num">${eur(Math.round(e.calc.material))}</td>
    <td class="num">${eur(Math.round(e.calc.personal))}</td>
    <td class="num">${eur(e.calc.transporte)}</td>
    <td class="num coste">${eur(Math.round(e.calc.coste))}</td>
    <td class="num pvp">${eur(e.calc.pvp)}</td>
    <td class="num margen">${eur(Math.round(e.calc.margen))}<span class="pct">${pct(e.calc.margenPct)}</span></td>
    <td class="num suelo">${eur(e.calc.suelo)}<span class="pct">${pct(e.calc.margenSueloPct)}</span></td>
  </tr>` : `
  <tr class="head">
    <td class="id">${e.id}</td>
    <td class="nombre"><strong>${e.nombre}</strong><span class="resumen">${e.nota}</span></td>
    <td class="num pvp">${eur(e.calc.pvp)}</td>
    <td class="num iva">${eurIva(e.calc.pvp)}</td>
  </tr>`).join('')}</tbody>
</table>

<h2>Suplementos</h2>
<table class="simple">
  <tbody>${SUPLEMENTOS.map((s) => `<tr><td>${s.concepto}</td><td class="num" style="width:35%">${s.precio}</td></tr>`).join('')}</tbody>
</table>

${INTERNO ? `
<h2>Condiciones que debes decir siempre</h2>
<div class="cols">
  <ul class="avisos" style="margin:0; padding-left:4mm">
    <li><strong>Precios sin IVA.</strong> Al cliente particular dale siempre el precio con IVA (×1,21) para que no haya sorpresas.</li>
    <li><strong>Reserva:</strong> 30% a la firma, resto 7 días antes del evento.</li>
    <li><strong>Validez del presupuesto:</strong> 15 días.</li>
    <li><strong>La fecha no se bloquea hasta que entra la señal.</strong> No comprometas material sin cobrar reserva.</li>
  </ul>
  <ul class="avisos" style="margin:0; padding-left:4mm">
    <li><strong>Necesitamos acometida eléctrica</strong> a menos de 25 m del montaje. Si no, generador (EXT-12).</li>
    <li><strong>Acceso de vehículo</strong> hasta el punto de montaje. Si no, suplemento de porteo.</li>
    <li><strong>Horario de montaje:</strong> necesitamos acceso mínimo 4 h antes del evento (6 h en montajes con estructura).</li>
    <li><strong>Meteorología:</strong> montajes exteriores requieren carpa o plan B. El equipo no sale bajo lluvia.</li>
  </ul>
</div>` : `
<h2>Condiciones</h2>
<div class="cols">
  <ul class="avisos" style="margin:0; padding-left:4mm">
    <li>Los precios de la columna <strong>Precio</strong> son sin IVA; la columna <strong>Con IVA</strong> es lo que pagas.</li>
    <li>Precios válidos para <strong>un día de evento</strong> en Valencia y hasta 50 km. Día adicional: +35% sobre el material.</li>
    <li>Reserva del 30% a la firma y el resto 7 días antes del evento. La fecha se bloquea al recibir la reserva.</li>
  </ul>
  <ul class="avisos" style="margin:0; padding-left:4mm">
    <li>Presupuesto válido 15 días.</li>
    <li>El fuego frío y efectos similares requieren autorización expresa de la finca.</li>
    <li>Cualquier montaje se puede ajustar: quitar, añadir o combinar partes. Pregúntanos.</li>
  </ul>
</div>`}

<footer>${INTERNO
  ? 'Resona Events · Valencia · Tarifa interna generada desde el catálogo de Resona Rent. Los precios de material provienen de la tabla de productos; si cambian en el panel, hay que regenerar este documento.'
  : 'Resona Events · Valencia · Precios orientativos sujetos a disponibilidad de fecha y material. Te confirmamos el precio cerrado en el presupuesto.'}</footer>
`;

const base = INTERNO ? 'tarifa-montajes' : 'tarifa-montajes-cliente';
writeFileSync(join(DIR, `${base}.html`), html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({
  path: join(DIR, INTERNO ? 'tarifa-montajes-resona-events.pdf' : 'tarifa-montajes-cliente.pdf'),
  format: 'A4',
  landscape: true,
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `<div style="width:100%;font-size:7pt;color:#8494ab;padding:0 10mm;display:flex;justify-content:space-between;font-family:Helvetica"><span>${INTERNO ? 'Resona Events · Tarifa de montajes · Documento interno' : 'Resona Events · Montajes y precios'}</span><span class="pageNumber"></span></div>`,
});
await browser.close();

console.log(`${INTERNO ? 'interna' : 'cliente'}: ${montajes.length} montajes + ${extras.length} extras`);
if (INTERNO) console.table(montajes.map((m) => ({
  ref: m.id, montaje: m.nombre, material: Math.round(m.calc.material), personal: Math.round(m.calc.personal),
  transporte: m.calc.transporte, coste: Math.round(m.calc.coste), PVP: m.calc.pvp,
  margen: `${pct(m.calc.margenPct)}`, suelo: m.calc.suelo,
})));
if (INTERNO) console.table(extras.map((e) => ({ ref: e.id, extra: e.nombre, PVP: e.calc.pvp, coste: Math.round(e.calc.coste), margen: `${pct(e.calc.margenPct)}` })));
