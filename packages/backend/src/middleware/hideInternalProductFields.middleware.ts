import { Request, Response, NextFunction } from 'express';
import { optionalAuthenticate, userHasRole } from './auth.middleware';

// Coste y proveedor: el panel los lee de los mismos endpoints públicos que las webs,
// así que se ocultan en la respuesta según quién pregunta, no en la consulta.
const INTERNAL_FIELDS = new Set([
  'purchasePrice',
  'purchaseValue',
  'purchaseDate',
  'purchaseNotes',
  'purchasePriority',
  'markedForPurchase',
  'replacementCost',
  'supplier',
  'supplierPrice',
  'supplierUrl',
]);

const STAFF_ROLES = ['SUPERADMIN', 'ADMIN', 'COMMERCIAL', 'WAREHOUSE', 'TECHNICIAN', 'ACCOUNTANT'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function stripInternalFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripInternalFields);
  if (!isPlainObject(value)) return value;

  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (INTERNAL_FIELDS.has(key)) continue;
    out[key] = stripInternalFields(child);
  }
  return out;
}

export const hideInternalProductFields = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET') return next();

  optionalAuthenticate(req, res, () => {
    if (req.user && userHasRole(req.user, ...STAFF_ROLES)) return next();

    const json = res.json.bind(res);
    res.json = (body: unknown) => json(stripInternalFields(body));
    next();
  });
};
