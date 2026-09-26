import express from 'express';
import request from 'supertest';

// El módulo real importa index.ts (arranca la app entera): se sustituye por completo.
jest.mock('../auth.middleware', () => ({
  optionalAuthenticate: (req: any, _res: any, next: () => void) => {
    const role = req.headers['x-test-role'];
    if (role) req.user = { role, additionalRoles: req.headers['x-test-extra'] ? [req.headers['x-test-extra']] : [] };
    next();
  },
  userHasRole: (user: { role: string; additionalRoles?: string[] }, ...roles: string[]) =>
    [user.role, ...(user.additionalRoles ?? [])].some((r) => roles.includes(r)),
}));

import { hideInternalProductFields } from '../hideInternalProductFields.middleware';

const product = {
  id: 'p1',
  name: 'Truss 2 m',
  pricePerDay: 12,
  purchasePrice: 180,
  supplier: 'Proveedor',
  supplierUrl: 'https://proveedor.test',
  createdAt: new Date('2026-01-01'),
  components: [{ product: { id: 'p2', purchasePrice: 40, name: 'Base' } }],
};

const app = express();
app.use(hideInternalProductFields);
app.get('/products', (_req, res) => res.json({ data: [product], pagination: { total: 1 } }));
app.post('/products', (_req, res) => res.json({ data: product }));

describe('hideInternalProductFields', () => {
  it('oculta coste y proveedor a un visitante, también en objetos anidados', async () => {
    const res = await request(app).get('/products');
    const item = res.body.data[0];
    expect(item.name).toBe('Truss 2 m');
    expect(item.pricePerDay).toBe(12);
    expect(item.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(item).not.toHaveProperty('purchasePrice');
    expect(item).not.toHaveProperty('supplier');
    expect(item).not.toHaveProperty('supplierUrl');
    expect(item.components[0].product).not.toHaveProperty('purchasePrice');
    expect(res.body.pagination.total).toBe(1);
  });

  it('oculta los campos a un cliente con sesión', async () => {
    const res = await request(app).get('/products').set('x-test-role', 'CLIENT');
    expect(res.body.data[0]).not.toHaveProperty('purchasePrice');
  });

  it('los mantiene para el equipo, incluido un rol adicional', async () => {
    const admin = await request(app).get('/products').set('x-test-role', 'ADMIN');
    expect(admin.body.data[0].purchasePrice).toBe(180);

    const extra = await request(app).get('/products').set('x-test-role', 'CLIENT').set('x-test-extra', 'COMMERCIAL');
    expect(extra.body.data[0].components[0].product.purchasePrice).toBe(40);
  });

  it('no toca las peticiones que no son GET', async () => {
    const res = await request(app).post('/products');
    expect(res.body.data.purchasePrice).toBe(180);
  });

  it('no modifica el objeto original, que puede venir de la caché', async () => {
    await request(app).get('/products');
    expect(product.purchasePrice).toBe(180);
  });
});
