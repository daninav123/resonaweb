import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Logo } from '@resona/ui';
import { getImageUrl } from '@resona/utils';
import { productService } from '../services/product.service';
import { formatEuro, getPriceDisplay } from '../utils/priceWithVAT';

type Producto = {
  id: string;
  name: string;
  slug?: string;
  pricePerDay?: number | string;
  mainImageUrl?: string | null;
  imageUrl?: string | null;
  realStock?: number;
  category?: { name?: string } | null;
};

const INK = '#0B0B0C';
const CREAM = '#F7F3EB';
const PANEL = '#FFFFFF';
const PANEL_VACIO = '#17171A';
const BLUE = '#3D5AFE';

/**
 * El catálogo real mezcla material de cabecera (bafles, cabezas móviles) con
 * accesorios (cables, adaptadores) en la misma rejilla. Aquí se separan: lo
 * fotografiable manda la página y lo demás baja a una lista sin imagen.
 */
const esAccesorio = (p: Producto) => {
  const n = (p.name || '').toLowerCase();
  return /cable|rca|minijack|jack|schuko|adaptador|manguera|alimentacion|powercon|conector|latiguillo|xlr|dmx/.test(n);
};

const precioDia = (p: Producto) => Number(p.pricePerDay) || 0;

function Foto({ p, onFallo }: { p: Producto; onFallo: (id: string) => void }) {
  const src = getImageUrl(p.mainImageUrl || p.imageUrl || '');
  const [fallo, setFallo] = useState(false);
  if (!src && !fallo) onFallo(p.id);

  if (!src || fallo) {
    return (
      <div
        className="flex aspect-square w-full items-center justify-center border"
        style={{ background: PANEL_VACIO, borderColor: 'rgba(247,243,235,0.08)' }}
      >
        <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(247,243,235,0.28)' }}>
          Sin fotografía
        </span>
      </div>
    );
  }

  return (
    <div className="aspect-square w-full overflow-hidden" style={{ background: PANEL }}>
      <img
        src={src}
        alt={p.name}
        loading="lazy"
        onError={() => { setFallo(true); onFallo(p.id); }}
        className="h-full w-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.05] md:p-7"
      />
    </div>
  );
}

function Ficha({ p, onFallo }: { p: Producto; onFallo: (id: string) => void }) {
  const dia = precioDia(p);
  const display = getPriceDisplay(dia * 1.21, '');

  return (
    <a href={`/productos/${p.slug || ''}`} className="group block">
      <Foto p={p} onFallo={onFallo} />
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-medium leading-snug" style={{ color: CREAM }}>
          {p.name}
        </h3>
        <span className="shrink-0 text-[15px] tabular-nums" style={{ color: 'rgba(247,243,235,0.62)' }}>
          {display.main}
          <span className="text-[13px]">/día</span>
        </span>
      </div>
    </a>
  );
}

export default function MaquetaCatalogoPage() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ['maqueta-productos'],
    queryFn: () => productService.getProducts({ sort: 'price_desc' as any, page: 1, limit: 200 }),
  });

  const [sinFoto, setSinFoto] = useState<Set<string>>(new Set());
  const [soloConFoto, setSoloConFoto] = useState(false);
  const marcarSinFoto = useCallback((id: string) => {
    setSinFoto((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const { destacados, accesorios } = useMemo(() => {
    const todos: Producto[] = (data?.data || []) as Producto[];
    const conFoto = todos.filter((p) => (p.mainImageUrl || p.imageUrl || '').trim() && !esAccesorio(p));
    const resto = todos.filter((p) => !conFoto.includes(p));
    return { destacados: conFoto, accesorios: resto };
  }, [data]);

  return (
    <div style={{ background: INK, color: CREAM }} className="min-h-screen">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Maqueta · Catálogo ReSona Rent</title>
      </Helmet>

      <header className="border-b" style={{ borderColor: 'rgba(247,243,235,0.10)' }}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-10">
          <div className="flex flex-col">
            <Logo width={132} color={CREAM} accent={BLUE} title="ReSona Rent" />
            <span
              className="mt-1 text-[9px] font-semibold uppercase"
              style={{ letterSpacing: '1.4em', textIndent: '1.4em', color: 'rgba(247,243,235,0.45)' }}
            >
              Rent
            </span>
          </div>
          <nav className="hidden gap-10 text-[13px] md:flex" style={{ color: 'rgba(247,243,235,0.7)' }}>
            <span style={{ color: CREAM }}>Catálogo</span>
            <span>Cómo funciona</span>
            <span>Contacto</span>
          </nav>
          <span className="text-[13px]" style={{ color: 'rgba(247,243,235,0.7)' }}>
            Cesta (0)
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-6 pb-4 pt-20 md:px-10 md:pt-28">
        <p
          className="mb-6 text-[11px] font-semibold uppercase"
          style={{ letterSpacing: '0.22em', color: 'rgba(247,243,235,0.45)' }}
        >
          Alquiler · Valencia
        </p>
        <h1 className="max-w-4xl text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[68px]">
          Equipo de sonido e iluminación,
          <br />
          listo para recoger.
        </h1>
        <p className="mt-7 max-w-xl text-[15px] leading-relaxed" style={{ color: 'rgba(247,243,235,0.65)' }}>
          Precio por día, depósito reembolsable y recogida en almacén. El técnico y el
          montaje son opcionales.
        </p>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-20 md:px-10 md:pt-28">
        <div
          className="mb-12 flex items-baseline justify-between border-b pb-5"
          style={{ borderColor: 'rgba(247,243,235,0.10)' }}
        >
          <h2 className="text-[13px] font-semibold uppercase" style={{ letterSpacing: '0.2em' }}>
            Material destacado
          </h2>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSoloConFoto((v) => !v)}
              className="rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={
                soloConFoto
                  ? { background: BLUE, color: '#FFFFFF' }
                  : { background: 'rgba(247,243,235,0.08)', color: 'rgba(247,243,235,0.75)' }
              }
            >
              Solo con fotografía
            </button>
            <span className="text-[13px]" style={{ color: 'rgba(247,243,235,0.45)' }}>
              {soloConFoto
                ? `${destacados.length - sinFoto.size} de ${destacados.length}`
                : `${destacados.length} referencias`}
            </span>
          </div>
        </div>

        {isLoading ? (
          <p style={{ color: 'rgba(247,243,235,0.5)' }}>Cargando…</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-3 md:gap-x-10 md:gap-y-24">
            {destacados
              .filter((p) => !soloConFoto || !sinFoto.has(p.id))
              .map((p) => (
                <Ficha key={p.id} p={p} onFallo={marcarSinFoto} />
              ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-32 md:px-10">
        <div
          className="mb-10 flex items-baseline justify-between border-b pb-5"
          style={{ borderColor: 'rgba(247,243,235,0.10)' }}
        >
          <h2 className="text-[13px] font-semibold uppercase" style={{ letterSpacing: '0.2em' }}>
            Accesorios y cableado
          </h2>
          <span className="text-[13px]" style={{ color: 'rgba(247,243,235,0.45)' }}>
            {accesorios.length} referencias
          </span>
        </div>

        <ul>
          {accesorios.map((p) => (
            <li key={p.id}>
              <a
                href={`/productos/${p.slug || ''}`}
                className="flex items-baseline justify-between gap-6 border-b py-4 transition-colors hover:bg-white/[0.03]"
                style={{ borderColor: 'rgba(247,243,235,0.07)' }}
              >
                <span className="text-[15px]" style={{ color: 'rgba(247,243,235,0.9)' }}>
                  {p.name}
                </span>
                <span className="shrink-0 text-[14px] tabular-nums" style={{ color: 'rgba(247,243,235,0.55)' }}>
                  {formatEuro(precioDia(p) * 1.21)}/día
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t" style={{ borderColor: 'rgba(247,243,235,0.10)' }}>
        <div
          className="mx-auto max-w-[1400px] px-6 py-10 text-[12px] md:px-10"
          style={{ color: 'rgba(247,243,235,0.4)' }}
        >
          Maqueta de trabajo · no indexada · datos reales de producción
        </div>
      </footer>
    </div>
  );
}
