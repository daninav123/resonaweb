-- Crear producto virtual para pedidos personalizados de la calculadora

-- Primero buscar o crear la categoría "Eventos"
INSERT INTO "Category" (id, name, slug, description, "isActive", "createdAt", "updatedAt")
VALUES (
  'cat-eventos-custom',
  'Eventos Personalizados',
  'eventos-personalizados',
  'Categoría para pedidos personalizados creados desde la calculadora de eventos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Crear el producto virtual
INSERT INTO "Product" (
  id,
  name,
  slug,
  description,
  "categoryId",
  "pricePerDay",
  "pricePerWeekend",
  "pricePerWeek",
  stock,
  "realStock",
  "isActive",
  featured,
  "isPack",
  "shippingCost",
  "installationCost",
  "createdAt",
  "updatedAt"
)
VALUES (
  'product-custom-event-virtual',
  'Evento Personalizado',
  'evento-personalizado-virtual',
  'Producto virtual para pedidos personalizados creados desde la calculadora de eventos. El precio real se calcula según la configuración del evento.',
  'cat-eventos-custom',
  0, -- El precio se guardará en orderItem.pricePerDay
  0,
  0,
  9999, -- Stock "infinito"
  9999,
  true,
  false,
  false,
  0,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Mostrar el resultado
SELECT id, name, slug FROM "Product" WHERE id = 'product-custom-event-virtual';
