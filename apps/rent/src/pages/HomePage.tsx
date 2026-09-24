import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trackLead } from '@resona/utils';
import { Search, Truck, ShieldCheck, Wrench, ArrowRight, Phone } from 'lucide-react';
import { productService } from '../services/product.service';
import { Product, Category } from '../types';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getOrganizationSchema, getWebSiteSchema } from '../components/SEO/schemas';
import { CategoryIcon } from '../components/CategoryIcon';
import { ProductTile } from '../components/catalog/ProductTile';

const HomePage = () => {
  const navigate = useNavigate();
  const [dates, setDates] = useState({ start: '', end: '' });
  const [query, setQuery] = useState('');

  const { data: featuredProducts = [] } = useQuery<any>({
    queryKey: ['featured-products'],
    queryFn: async () => (await productService.getFeaturedProducts()) || [],
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery<any>({
    queryKey: ['categories'],
    queryFn: async () => (await productService.getCategories()) || [],
    staleTime: 10 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (dates.start) params.set('start', dates.start);
    if (dates.end) params.set('end', dates.end);
    navigate(`/productos${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Solo categorías visibles y no de "eventos personalizados"
  const visibleCategories = (categories as Category[]).filter(
    (c: any) =>
      !c.isHidden &&
      !c.name?.toLowerCase().includes('eventos personalizados') &&
      !c.name?.toLowerCase().includes('personal') &&
      !c.name?.toLowerCase().includes('pack')
  );

  const today = new Date().toISOString().slice(0, 10);

  const campo =
    'h-12 w-full rounded-sm border border-cream/15 bg-transparent px-3.5 text-[15px] text-cream placeholder:text-cream/35 focus:border-resona-light focus:outline-none [color-scheme:dark]';

  return (
    <div className="min-h-screen bg-ink">
      <SEOHead
        title="Alquiler de equipos audiovisuales en Valencia | ReSona Rent"
        description="Alquiler de sonido, iluminación, vídeo y DJ en Valencia. Entrega y recogida, técnico opcional, precio por día claro. Stock para bodas, eventos corporativos y conciertos."
        keywords="alquiler sonido valencia, alquiler iluminación valencia, alquiler altavoces, alquiler equipos audiovisuales, alquiler DJ valencia, alquiler pantallas LED"
        ogImage="https://resonarent.com/og-image.png"
        canonicalUrl="https://resonarent.com/"
        schema={[getLocalBusinessSchema(), getOrganizationSchema(), getWebSiteSchema()]}
      />

      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-5 pb-20 pt-20 md:px-10 md:pb-28 md:pt-32">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/45">
          Alquiler · Valencia
        </p>
        <h1 className="max-w-4xl text-[38px] font-semibold leading-[1.03] tracking-[-0.03em] text-cream md:text-[72px]">
          Equipo de sonido e iluminación,
          <br className="hidden sm:block" /> listo para recoger.
        </h1>
        <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-cream/65">
          Precio por día, depósito reembolsable y recogida en nuestro almacén. La entrega,
          el montaje y el técnico son opcionales.
        </p>

        <form onSubmit={handleSearch} className="mt-12 max-w-3xl">
          <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
            <div>
              <label htmlFor="q" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/45">
                Qué necesitas
              </label>
              <input
                id="q"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Altavoces, luces, truss…"
                className={campo}
              />
            </div>
            <div>
              <label htmlFor="desde" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/45">
                Desde
              </label>
              <input
                id="desde"
                type="date"
                min={today}
                value={dates.start}
                onChange={(e) => setDates((d) => ({ ...d, start: e.target.value }))}
                className={campo}
              />
            </div>
            <div>
              <label htmlFor="hasta" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/45">
                Hasta
              </label>
              <input
                id="hasta"
                type="date"
                min={dates.start || today}
                value={dates.end}
                onChange={(e) => setDates((d) => ({ ...d, end: e.target.value }))}
                className={campo}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-resona px-7 text-[15px] font-medium text-white transition-colors hover:bg-resona-dark sm:w-auto"
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Categorías */}
      {visibleCategories.length > 0 && (
        <section className="mx-auto max-w-[1400px] border-t border-cream/10 px-5 py-16 md:px-10 md:py-24">
          <h2 className="mb-12 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">
            Qué alquilamos
          </h2>
          <div className="grid grid-cols-2 gap-px overflow-hidden border border-cream/10 bg-cream/10 sm:grid-cols-3 lg:grid-cols-5">
            {visibleCategories.map((cat: any) => (
              <Link
                key={cat.id}
                to={`/productos?category=${cat.slug}`}
                className="group flex flex-col gap-4 bg-ink p-6 transition-colors hover:bg-ink-800 md:p-8"
              >
                <CategoryIcon slug={cat.slug} size={22} strokeWidth={1.5} className="text-cream/45 transition-colors group-hover:text-cream" />
                <span className="text-[14px] leading-snug text-cream/80 transition-colors group-hover:text-cream">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-[1400px] border-t border-cream/10 px-5 py-16 md:px-10 md:py-24">
          <div className="mb-12 flex items-baseline justify-between border-b border-cream/10 pb-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">
              Material destacado
            </h2>
            <Link to="/productos" className="flex items-center gap-1.5 text-[13px] text-cream/60 transition-colors hover:text-cream">
              Ver todo el catálogo
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4 md:gap-x-8">
            {(featuredProducts as Product[]).slice(0, 8).map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section className="mx-auto max-w-[1400px] border-t border-cream/10 px-5 py-16 md:px-10 md:py-24">
        <h2 className="mb-14 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">
          Cómo funciona
        </h2>
        <ol className="grid gap-12 md:grid-cols-3 md:gap-16">
          {[
            { n: '01', t: 'Elige fechas y equipo', d: 'Buscas por fechas y ves lo que hay libre, con el precio del alquiler completo.' },
            { n: '02', t: 'Reservas online', d: 'Pagas la reserva con tarjeta y dejas un depósito, que se devuelve al entregar el material en buen estado.' },
            { n: '03', t: 'Recoges en el almacén', d: 'Te lo llevas tú, o lo llevamos nosotros si contratas entrega. El técnico se presupuesta aparte.' },
          ].map((paso) => (
            <li key={paso.n}>
              <span className="text-[13px] tabular-nums text-cream/30">{paso.n}</span>
              <h3 className="mt-4 text-[19px] font-medium text-cream">{paso.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-cream/60">{paso.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Garantías */}
      <section className="mx-auto max-w-[1400px] border-t border-cream/10 px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 md:grid-cols-3 md:gap-16">
          {[
            { icon: ShieldCheck, t: 'Equipos revisados', d: 'Probados antes de cada salida, con el cableado y los soportes que hacen falta.' },
            { icon: Truck, t: 'Entrega opcional', d: 'Recogida en almacén sin coste. Si prefieres que lo llevemos, se presupuesta.' },
            { icon: Wrench, t: 'Técnico opcional', d: 'Si no quieres montarlo tú, va uno de los nuestros. Tú decides.' },
          ].map((v) => (
            <div key={v.t}>
              <v.icon className="h-5 w-5 text-cream/40" strokeWidth={1.5} />
              <h3 className="mt-5 text-[17px] font-medium text-cream">{v.t}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-cream/60">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-cream/10">
        <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <div>
              <h2 className="max-w-xl text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-cream md:text-[44px]">
                ¿No sabes qué equipo te hace falta?
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cream/60">
                Cuéntanos el aforo y el espacio y te decimos qué necesitas. Sin compromiso.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+34613881414"
                className="flex h-12 items-center gap-2 rounded-sm bg-resona px-7 text-[15px] font-medium text-white transition-colors hover:bg-resona-dark"
              >
                <Phone className="h-4 w-4" />
                613 88 14 14
              </a>
              <Link
                to="/contacto"
                className="flex h-12 items-center rounded-sm border border-cream/20 px-7 text-[15px] text-cream transition-colors hover:bg-white/5"
              >
                Escríbenos
              </Link>
            </div>
          </div>

          <a
            href="https://resonaevents.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-20 flex items-center justify-between gap-6 border-t border-cream/10 pt-8 text-cream/50 transition-colors hover:text-cream/80"
          >
            <span className="text-[15px]">
              ¿Buscas que te organicemos el evento entero, con montaje y producción?
            </span>
            <span className="flex shrink-0 items-center gap-2 text-[14px]">
              ReSona Events
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
