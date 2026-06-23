import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Package,
  Truck,
  ShieldCheck,
  Wrench,
  ArrowRight,
  Phone,
  Star,
  CalendarCheck,
} from 'lucide-react';
import { productService } from '../services/product.service';
import { getPriceDisplay } from '../utils/priceWithVAT';
import { getImageUrl, placeholderImage } from '@resona/utils';
import { Product, Category } from '../types';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getOrganizationSchema, getWebSiteSchema } from '../components/SEO/schemas';
import { CategoryIcon } from '../components/CategoryIcon';

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

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Alquiler de equipos audiovisuales en Valencia | ReSona Rent"
        description="Alquiler de sonido, iluminación, vídeo y DJ en Valencia. Entrega y recogida, técnico opcional, precio por día claro. Stock para bodas, eventos corporativos y conciertos."
        keywords="alquiler sonido valencia, alquiler iluminación valencia, alquiler altavoces, alquiler equipos audiovisuales, alquiler DJ valencia, alquiler pantallas LED"
        ogImage="https://resonarent.com/og-image.png"
        canonicalUrl="https://resonarent.com/"
        schema={[getLocalBusinessSchema(), getOrganizationSchema(), getWebSiteSchema()]}
      />

      {/* Hero */}
      <section className="relative bg-resona text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/25"></div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
              Alquila equipos audiovisuales profesionales en Valencia
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Sonido, iluminación, vídeo y estructuras. Entrega y recogida. Precio claro por día.
            </p>

            {/* Buscador + fechas */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-xl p-3 md:p-4 shadow-2xl flex flex-col md:flex-row gap-2 md:items-end text-left"
            >
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">¿Qué necesitas?</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Altavoces, luces, DJ, pantalla LED…"
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-resona focus:ring-1 focus:ring-resona"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
                <input
                  type="date"
                  min={today}
                  value={dates.start}
                  onChange={(e) => setDates((d) => ({ ...d, start: e.target.value }))}
                  className="px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-resona focus:ring-1 focus:ring-resona"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
                <input
                  type="date"
                  min={dates.start || today}
                  value={dates.end}
                  onChange={(e) => setDates((d) => ({ ...d, end: e.target.value }))}
                  className="px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-resona focus:ring-1 focus:ring-resona"
                />
              </div>
              <button
                type="submit"
                className="bg-resona hover:bg-resona-dark text-white font-semibold px-5 py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                Buscar equipos
              </button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/90">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Depósito reembolsable</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Entrega en Valencia</span>
              <span className="flex items-center gap-1.5"><Wrench className="w-4 h-4" /> Técnico opcional</span>
              <span className="flex items-center gap-1.5"><CalendarCheck className="w-4 h-4" /> Reserva 100% online</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo alquilar en 3 pasos */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
              Alquilar en 3 pasos
            </h2>
            <p className="text-center text-gray-500 mb-10">Sin llamadas, sin esperas, sin sorpresas.</p>
            <div className="grid md:grid-cols-3 gap-6">
              <Step n={1} title="Elige y añade al carrito" icon={Package}>
                Escoge los equipos y las fechas. Ves el precio por día con IVA incluido.
              </Step>
              <Step n={2} title="Paga el 25% para reservar" icon={ShieldCheck}>
                Reservas con un 25%. El resto antes de la entrega. Stripe o transferencia.
              </Step>
              <Step n={3} title="Recoge o te lo llevamos" icon={Truck}>
                Entrega en Valencia capital y alrededores. Recogida en almacén o envío concertado.
              </Step>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      {visibleCategories.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
              Categorías de alquiler
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {visibleCategories.slice(0, 10).map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/productos?category=${cat.slug}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:border-resona hover:shadow-md transition group"
                >
                  <div className="text-3xl mb-2">
                    <CategoryIcon slug={cat.slug} size={36} />
                  </div>
                  <div className="text-sm font-medium text-gray-900 group-hover:text-resona transition">
                    {cat.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Equipos destacados</h2>
                <p className="text-gray-500 mt-1">Los más reservados este mes.</p>
              </div>
              <Link to="/productos" className="hidden md:inline-flex items-center gap-1 text-resona hover:text-resona-dark font-medium">
                Ver catálogo completo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(featuredProducts as Product[]).slice(0, 8).map((p: any) => (
                <Link
                  key={p.id}
                  to={`/productos/${p.slug || p.id}`}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-resona transition"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={getImageUrl(p.mainImageUrl || p.images?.[0]) || placeholderImage}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = placeholderImage;
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{p.name}</div>
                    <div className="mt-2 text-resona font-semibold text-sm">
                      {getPriceDisplay(Number(p.pricePerDay) || 0, '').main} <span className="text-gray-400 font-normal">/día</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center md:hidden">
              <Link to="/productos" className="inline-flex items-center gap-1 text-resona hover:text-resona-dark font-medium">
                Ver catálogo completo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Valor */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <ValueCard icon={Truck} title="Entrega y recogida">
              En Valencia capital y área metropolitana. Envío concertado al resto de España.
            </ValueCard>
            <ValueCard icon={Wrench} title="Técnico opcional">
              Puedes alquilar solo equipo o añadir un técnico que lo monte y opere. Tú eliges.
            </ValueCard>
            <ValueCard icon={ShieldCheck} title="Equipos revisados">
              Testados antes de cada alquiler. Depósito reembolsable al devolver en buen estado.
            </ValueCard>
          </div>
        </div>
      </section>

      {/* Cross-app banner */}
      <section className="py-10 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              ¿Necesitas que organicemos tu evento completo?
            </h3>
            <p className="text-gray-300 mb-5">
              Si buscas bodas, conciertos o corporativos con montaje, diseño técnico y coordinación, visita nuestra división de eventos.
            </p>
            <a
              href="https://resonarent.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-medium px-5 py-2.5 rounded-md transition"
            >
              Ir a ReSona Rent <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-14 bg-resona text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">¿Dudas antes de reservar?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Te asesoramos sin compromiso. Respondemos en horario laboral por teléfono y WhatsApp.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="tel:+34613881414"
              className="inline-flex items-center gap-2 bg-white text-resona hover:bg-gray-100 font-medium px-5 py-2.5 rounded-md transition"
            >
              <Phone className="w-4 h-4" /> 613 88 14 14
            </a>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white hover:text-resona font-medium px-5 py-2.5 rounded-md transition"
            >
              Escribir un mensaje
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

function Step({
  n,
  title,
  icon: Icon,
  children,
}: {
  n: number;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 relative">
      <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-resona text-white flex items-center justify-center font-bold shadow-md">
        {n}
      </div>
      <Icon className="w-8 h-8 text-resona mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
      <Icon className="w-10 h-10 text-resona mx-auto mb-3" />
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  );
}

export default HomePage;
