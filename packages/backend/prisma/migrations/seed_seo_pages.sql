-- Seed inicial de páginas SEO
INSERT INTO seo_pages (id, slug, title, description, keywords, priority, changefreq, "isActive", "createdAt", "updatedAt")
VALUES 
  (
    gen_random_uuid(),
    'alquiler-altavoces-valencia',
    'Alquiler de Altavoces Profesionales en Valencia | Desde 35€/día',
    'Alquiler de altavoces profesionales en Valencia. JBL, QSC, Yamaha, Mackie. Desde 400W hasta 2000W. Activos y pasivos para eventos, bodas, fiestas. Entrega e instalación gratis. Presupuesto en 24h ☎️ 613881414',
    ARRAY['alquiler altavoces valencia', 'alquiler altavoces profesionales valencia', 'alquiler altavoces activos valencia', 'alquiler altavoces eventos valencia', 'alquiler PA valencia', 'alquiler altavoces JBL valencia']::text[],
    0.98,
    'weekly',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'alquiler-sonido-valencia',
    'Alquiler de Sonido Profesional en Valencia | ReSona Events',
    'Alquiler de equipos de sonido profesional en Valencia. Altavoces, subwoofers, mesas de mezclas y microfonía para eventos, bodas y fiestas. Servicio técnico incluido. Presupuesto gratis en 24h. ☎️ 613881414',
    ARRAY['alquiler sonido valencia', 'alquiler equipos sonido valencia', 'sonido profesional valencia', 'alquiler PA valencia', 'sistema sonido eventos valencia']::text[],
    0.95,
    'weekly',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'alquiler-iluminacion-valencia',
    'Alquiler de Iluminación Profesional en Valencia | ReSona Events',
    'Alquiler de iluminación profesional para eventos en Valencia. Moving heads, LED PAR, focos robotizados, luces de discoteca. Desde 25€/día. Entrega gratis en Valencia. ☎️ 613881414',
    ARRAY['alquiler iluminacion valencia', 'alquiler luces eventos valencia', 'alquiler moving heads valencia', 'iluminacion profesional valencia', 'alquiler LED PAR valencia']::text[],
    0.95,
    'weekly',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'sonido-bodas-valencia',
    'Sonido Profesional para Bodas en Valencia | ReSona Events',
    'Alquiler de sonido para bodas en Valencia. Sistemas completos, micrófonos inalámbricos, música ceremonia y banquete. Técnico incluido. Más de 200 bodas realizadas. ☎️ 613881414',
    ARRAY['sonido bodas valencia', 'alquiler sonido bodas valencia', 'equipo sonido boda valencia', 'microfonos boda valencia', 'musica boda valencia']::text[],
    0.95,
    'weekly',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'alquiler-sonido-torrent',
    'Alquiler de Sonido Profesional en Torrent | ReSona Events',
    'Alquiler de equipos de sonido en Torrent (Valencia). Altavoces, subwoofers, mesas de mezclas para eventos y fiestas. Entrega gratis en Torrent. ☎️ 613881414',
    ARRAY['alquiler sonido torrent', 'alquiler altavoces torrent', 'sonido profesional torrent', 'alquiler equipos sonido torrent']::text[],
    0.90,
    'weekly',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  priority = EXCLUDED.priority,
  changefreq = EXCLUDED.changefreq,
  "updatedAt" = NOW();
