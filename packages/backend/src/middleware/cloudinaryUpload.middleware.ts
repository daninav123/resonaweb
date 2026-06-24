/**
 * Cloudinary upload middleware — activable por variable de entorno.
 *
 * CÓMO ACTIVAR:
 *   1. Crea cuenta gratuita en https://cloudinary.com
 *   2. Dashboard → Product Environment Credentials → copia Cloud name, API Key, API Secret
 *   3. Añade a packages/backend/.env:
 *        CLOUDINARY_ENABLED=true
 *        CLOUDINARY_CLOUD_NAME=xxx
 *        CLOUDINARY_API_KEY=xxx
 *        CLOUDINARY_API_SECRET=xxx
 *        CLOUDINARY_FOLDER=resona-events
 *   4. `npm install cloudinary multer-storage-cloudinary` en packages/backend
 *   5. Redespliega el backend.
 *
 * COMPORTAMIENTO:
 *   - Si CLOUDINARY_ENABLED !== 'true' → exporta `undefined` (upload.middleware.ts usa disco local).
 *   - Si activado → sube a Cloudinary y el archivo devuelto en req.file.path es la URL pública https.
 *
 * Ver docs/PROBLEMA-STORAGE-IMAGENES.md para contexto.
 */

import type { StorageEngine } from 'multer';

const enabled = process.env.CLOUDINARY_ENABLED === 'true';

export const cloudinaryStorage: StorageEngine | undefined = (() => {
  if (!enabled) return undefined;
  try {
    // Imports dinámicos para no requerir las deps si no está activado
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { v2: cloudinary } = require('cloudinary');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    return new CloudinaryStorage({
      cloudinary,
      params: (_req: unknown, file: Express.Multer.File) => {
        const folder = process.env.CLOUDINARY_FOLDER || 'resona-events';
        const isProduct = file.fieldname === 'image' || file.fieldname === 'images';
        return {
          folder: `${folder}/${isProduct ? 'products' : 'misc'}`,
          resource_type: 'image',
          format: undefined, // conservar formato original; Cloudinary sirve WebP/AVIF automáticamente
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        };
      },
    });
  } catch (err) {
    console.error(
      '[cloudinary] CLOUDINARY_ENABLED=true pero faltan dependencias o credenciales. ' +
      'Instala `cloudinary` y `multer-storage-cloudinary` y revisa las variables de entorno. ' +
      'Fallback a disco local.',
      err
    );
    return undefined;
  }
})();

export const isCloudinaryEnabled = () => cloudinaryStorage !== undefined;
