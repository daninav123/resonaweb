import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { trackPurchase } from '@resona/utils';
import SEOHead from '../components/SEO/SEOHead';

const EASE = [0.22, 1, 0.36, 1] as const;

const ReservaConfirmadaPage = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Señal pagada = conversión de compra. El importe no está en la URL (solo el id de
    // sesión de Stripe); se registra sin valor hasta que se enriquezca vía backend.
    const quoteSession = searchParams.get('quote');
    trackPurchase({ transactionId: quoteSession || 'reserva' });
  }, [searchParams]);

  return (
  <>
    <SEOHead
      title="Reserva confirmada — ReSona Events"
      description="Tu reserva ha sido registrada correctamente. Te enviamos confirmación por email y te contactamos en 24 horas."
      canonicalUrl="https://resonaevents.com/reserva-confirmada"
    />

    <section className="min-h-[100svh] pt-28 md:pt-36 pb-24 px-5 md:px-10 bg-cream text-ink flex items-center">
      <div className="max-w-[1000px] mx-auto w-full text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent-400 text-ink flex items-center justify-center mb-10"
        >
          <Check className="w-10 h-10 md:w-12 md:h-12" strokeWidth={2.5} />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
          className="eyebrow"
        >
          Señal recibida
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: EASE }}
          className="mt-6 font-display text-display-lg md:text-display-xl tracking-tighter text-balance"
        >
          Fecha <span className="display-italic text-accent-500">reservada</span>.<br />
          Tenemos 24 horas para confirmarte.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
          className="mt-8 max-w-xl text-ink/70 text-lg leading-relaxed"
        >
          Hemos recibido tu señal y vamos a verificar disponibilidad y detalles logísticos
          de inmediato. Te escribimos en menos de 24h con la confirmación definitiva
          o, si no podemos atender tu fecha, te devolvemos la señal al 100%.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease: EASE }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl text-left"
        >
          <div className="p-6 bg-ink text-cream">
            <div className="font-display text-2xl text-accent-300">01</div>
            <div className="mt-3 font-medium">Email de confirmación</div>
            <p className="mt-2 text-sm text-cream/70 leading-relaxed">
              Vas a recibir un correo con el recibo de la señal y los detalles de tu reserva.
            </p>
          </div>
          <div className="p-6 bg-ink text-cream">
            <div className="font-display text-2xl text-accent-300">02</div>
            <div className="mt-3 font-medium">Verificación en 24h</div>
            <p className="mt-2 text-sm text-cream/70 leading-relaxed">
              Cruzamos tu fecha con calendario y avisamos a nuestro equipo técnico.
            </p>
          </div>
          <div className="p-6 bg-ink text-cream">
            <div className="font-display text-2xl text-accent-300">03</div>
            <div className="mt-3 font-medium">Afinamos los detalles</div>
            <p className="mt-2 text-sm text-cream/70 leading-relaxed">
              Te llamamos o escribimos para cerrar timing, coordinación y últimos ajustes.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: EASE }}
          className="mt-14 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/portfolio"
            className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-ink text-cream hover:bg-ink-800 transition-all group"
          >
            <span className="font-medium">Mientras, mira el portfolio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="https://wa.me/34613881414?text=Hola,%20acabo%20de%20reservar%20y%20pagar%20la%20señal"
            className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full border border-ink/30 hover:border-ink transition"
          >
            <span className="text-sm tracking-wide">WhatsApp directo</span>
          </a>
        </motion.div>
      </div>
    </section>
  </>
  );
};

export default ReservaConfirmadaPage;
