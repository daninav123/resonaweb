import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackLead } from '@resona/utils';
import SEOHead from '../components/SEO/SEOHead';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const api = (await import('../services/api')).default;
      await api.post('/contact', {
        ...formData,
        app: 'events',
        sourcePath: window.location.pathname + window.location.search,
      });

      trackLead({ leadType: 'contacto' });
      toast.success('Mensaje enviado correctamente. Te responderemos en menos de 24 horas.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      const errorMsg = error.response?.data?.error || 'Error al enviar el mensaje. Por favor, intenta de nuevo.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const campo =
    'h-12 w-full rounded-sm border border-ink/15 bg-transparent px-4 text-[15px] text-ink placeholder:text-ink-400 focus:border-ink focus:outline-none';

  return (
    <div className="min-h-screen bg-paper">
      <SEOHead
        title="Contacto y presupuesto de eventos en Valencia — ReSona"
        description="Contáctanos en Valencia para tu boda o evento: presupuesto de producción, sonido e iluminación. Te respondemos en 24 h. ☎ 613 88 14 14"
        keywords="contacto eventos valencia, presupuesto bodas valencia, produccion eventos valencia, sonido iluminacion eventos valencia"
        canonicalUrl="https://resonaevents.com/contacto"
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
          Contacto · Valencia
        </p>
        <h1 className="max-w-3xl text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink md:text-[64px]">
          Cuéntanos qué evento
          <br className="hidden sm:block" /> tienes en mente.
        </h1>
        <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-ink-600">
          Escríbenos y te respondemos en menos de 24 horas. Si lo prefieres, llámanos o
          mándanos un WhatsApp y lo hablamos directamente.
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] border-t border-paper-400/60 px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-16 md:grid-cols-[minmax(0,320px)_1fr] md:gap-24">
          <div>
            <h2 className="mb-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
              Directo
            </h2>

            <dl className="space-y-8">
              <div>
                <dt className="flex items-center gap-2.5 text-[13px] text-ink-500">
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                  Teléfono
                </dt>
                <dd className="mt-2">
                  <a href="tel:+34613881414" className="text-[19px] text-ink transition-opacity hover:opacity-60">
                    +34 613 881 414
                  </a>
                  <p className="mt-1 text-[13px] text-ink-500">Lunes a viernes, 9:00 – 18:00</p>
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2.5 text-[13px] text-ink-500">
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                  Email
                </dt>
                <dd className="mt-2 text-[15px] text-ink-700">
                  Usa el formulario y te contestamos al correo que nos dejes.
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2.5 text-[13px] text-ink-500">
                  <MapPin className="h-4 w-4" strokeWidth={1.75} />
                  Almacén
                </dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-ink-700">
                  C/ de l'Illa Cabrera, 13
                  <br />
                  Quatre Carreres
                  <br />
                  46026 València
                </dd>
              </div>
            </dl>

            <div className="mt-12 border-t border-paper-400/60 pt-8">
              <p className="text-[15px] leading-relaxed text-ink-600">
                ¿Prefieres una cifra antes de escribir? La calculadora te da una estimación
                al momento.
              </p>
              <a
                href="/brief"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/25 px-6 py-3 text-[14px] text-ink transition-colors hover:bg-ink hover:text-cream-100"
              >
                Calcular presupuesto
                <Send className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <h2 className="mb-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
              Escríbenos
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-[13px] text-ink-600">
                  Nombre <span className="text-ink-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre"
                  className={campo}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-[13px] text-ink-600">
                  Email <span className="text-ink-400">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className={campo}
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-2 block text-[13px] text-ink-600">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 123 456 789"
                  className={campo}
                />
              </div>
              <div>
                <label htmlFor="subject" className="mb-2 block text-[13px] text-ink-600">
                  Asunto <span className="text-ink-400">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Boda, evento corporativo…"
                  className={campo}
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="message" className="mb-2 block text-[13px] text-ink-600">
                Mensaje <span className="text-ink-400">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Fecha, lugar, número de invitados y qué necesitáis."
                className="w-full rounded-sm border border-ink/15 bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-400 focus:border-ink focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-ink px-8 py-4 text-[15px] font-medium text-cream-100 transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              {isSubmitting ? (
                'Enviando…'
              ) : (
                <>
                  Enviar mensaje
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
