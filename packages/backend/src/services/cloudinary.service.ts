import { v2 as cloudinary } from 'cloudinary';
import https from 'https';
import http from 'http';
import { logger } from '../utils/logger';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Subir imagen desde URL a Cloudinary
 */
export async function uploadImageToCloudinary(
  imageUrl: string,
  folder: string = 'blog',
  publicId?: string
): Promise<string> {
  try {
    logger.info(`☁️  Subiendo imagen a Cloudinary...`);

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: `resona/${folder}`,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
    });

    logger.info(`✅ Imagen subida a Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (error: any) {
    logger.error(`❌ Error subiendo a Cloudinary: ${error.message}`);
    throw error;
  }
}

/**
 * Eliminar imagen de Cloudinary
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`🗑️  Imagen eliminada de Cloudinary: ${publicId}`);
  } catch (error: any) {
    logger.error(`❌ Error eliminando de Cloudinary: ${error.message}`);
    throw error;
  }
}

/**
 * Obtener URL pública de Cloudinary
 */
export function getCloudinaryUrl(publicId: string, transformations?: any): string {
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true,
  });
}

export default cloudinary;
