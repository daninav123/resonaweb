import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface ThumbnailSizes {
  small: number;
  medium: number;
  large: number;
}

export class ImageService {
  private uploadDir: string;
  private thumbnailSizes: ThumbnailSizes = {
    small: 150,
    medium: 400,
    large: 800,
  };

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  }

  /**
   * Optimizar imagen
   */
  async optimizeImage(
    inputPath: string,
    outputPath: string,
    options: ImageOptions = {}
  ): Promise<void> {
    try {
      const {
        width,
        height,
        quality = 80,
        format = 'webp',
      } = options;

      let image = sharp(inputPath);

      // Resize si se especifica
      if (width || height) {
        image = image.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convertir formato y optimizar
      switch (format) {
        case 'jpeg':
          image = image.jpeg({ quality, progressive: true });
          break;
        case 'png':
          image = image.png({ compressionLevel: 9, progressive: true });
          break;
        case 'webp':
        default:
          image = image.webp({ quality });
          break;
      }

      await image.toFile(outputPath);
      
      logger.info(`Image optimized: ${outputPath}`);
    } catch (error) {
      logger.error('Error optimizing image:', error);
      throw error;
    }
  }

  /**
   * Generar thumbnails en diferentes tamaños
   */
  async generateThumbnails(
    imagePath: string,
    fileName: string
  ): Promise<{ small: string; medium: string; large: string; original: string }> {
    try {
      const ext = path.extname(fileName);
      const baseName = path.basename(fileName, ext);
      const thumbnailsDir = path.join(this.uploadDir, 'thumbnails');
      
      // Crear directorio si no existe
      await fs.mkdir(thumbnailsDir, { recursive: true });

      const thumbnails = {
        small: path.join(thumbnailsDir, `${baseName}_small.webp`),
        medium: path.join(thumbnailsDir, `${baseName}_medium.webp`),
        large: path.join(thumbnailsDir, `${baseName}_large.webp`),
        original: imagePath,
      };

      // Generar cada tamaño
      await Promise.all([
        this.optimizeImage(imagePath, thumbnails.small, {
          width: this.thumbnailSizes.small,
          format: 'webp',
          quality: 80,
        }),
        this.optimizeImage(imagePath, thumbnails.medium, {
          width: this.thumbnailSizes.medium,
          format: 'webp',
          quality: 85,
        }),
        this.optimizeImage(imagePath, thumbnails.large, {
          width: this.thumbnailSizes.large,
          format: 'webp',
          quality: 90,
        }),
      ]);

      logger.info(`Thumbnails generated for: ${fileName}`);

      // Retornar URLs relativas
      return {
        small: `/uploads/thumbnails/${baseName}_small.webp`,
        medium: `/uploads/thumbnails/${baseName}_medium.webp`,
        large: `/uploads/thumbnails/${baseName}_large.webp`,
        original: `/uploads/${fileName}`,
      };
    } catch (error) {
      logger.error('Error generating thumbnails:', error);
      throw error;
    }
  }

  /**
   * Optimizar imagen y generar versión WebP
   */
  async processUploadedImage(
    filePath: string,
    fileName: string
  ): Promise<{ optimized: string; webp: string; thumbnails: any }> {
    try {
      const ext = path.extname(fileName);
      const baseName = path.basename(fileName, ext);
      
      // Ruta para la versión optimizada
      const optimizedPath = path.join(this.uploadDir, `${baseName}_optimized${ext}`);
      const webpPath = path.join(this.uploadDir, `${baseName}.webp`);

      // Optimizar original
      await this.optimizeImage(filePath, optimizedPath, {
        quality: 85,
        format: ext.slice(1) as any,
      });

      // Generar versión WebP
      await this.optimizeImage(filePath, webpPath, {
        format: 'webp',
        quality: 85,
      });

      // Generar thumbnails
      const thumbnails = await this.generateThumbnails(filePath, fileName);

      // Eliminar archivo original si es muy grande
      const stats = await fs.stat(filePath);
      const optimizedStats = await fs.stat(optimizedPath);
      
      if (optimizedStats.size < stats.size * 0.8) {
        await fs.unlink(filePath);
        await fs.rename(optimizedPath, filePath);
      } else {
        await fs.unlink(optimizedPath);
      }

      logger.info(`Image processed: ${fileName}`);

      return {
        optimized: `/uploads/${fileName}`,
        webp: `/uploads/${baseName}.webp`,
        thumbnails,
      };
    } catch (error) {
      logger.error('Error processing uploaded image:', error);
      throw error;
    }
  }

  /**
   * Redimensionar imagen manteniendo aspect ratio
   */
  async resizeImage(
    inputPath: string,
    outputPath: string,
    width: number,
    height?: number
  ): Promise<void> {
    try {
      await sharp(inputPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(outputPath);

      logger.info(`Image resized: ${outputPath}`);
    } catch (error) {
      logger.error('Error resizing image:', error);
      throw error;
    }
  }

  /**
   * Convertir imagen a formato específico
   */
  async convertFormat(
    inputPath: string,
    outputPath: string,
    format: 'jpeg' | 'png' | 'webp',
    quality: number = 85
  ): Promise<void> {
    try {
      let image = sharp(inputPath);

      switch (format) {
        case 'jpeg':
          image = image.jpeg({ quality, progressive: true });
          break;
        case 'png':
          image = image.png({ compressionLevel: 9 });
          break;
        case 'webp':
          image = image.webp({ quality });
          break;
      }

      await image.toFile(outputPath);
      
      logger.info(`Image converted to ${format}: ${outputPath}`);
    } catch (error) {
      logger.error('Error converting image format:', error);
      throw error;
    }
  }

  /**
   * Obtener metadatos de imagen
   */
  async getImageMetadata(imagePath: string): Promise<sharp.Metadata> {
    try {
      const metadata = await sharp(imagePath).metadata();
      return metadata;
    } catch (error) {
      logger.error('Error getting image metadata:', error);
      throw error;
    }
  }

  /**
   * Eliminar imagen y sus thumbnails
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const fileName = path.basename(imageUrl);
      const baseName = path.basename(fileName, path.extname(fileName));
      
      // Eliminar archivo original
      const originalPath = path.join(this.uploadDir, fileName);
      await fs.unlink(originalPath).catch(() => {});

      // Eliminar versión WebP
      const webpPath = path.join(this.uploadDir, `${baseName}.webp`);
      await fs.unlink(webpPath).catch(() => {});

      // Eliminar thumbnails
      const thumbnailsDir = path.join(this.uploadDir, 'thumbnails');
      const thumbnailSizes = ['small', 'medium', 'large'];
      
      for (const size of thumbnailSizes) {
        const thumbnailPath = path.join(thumbnailsDir, `${baseName}_${size}.webp`);
        await fs.unlink(thumbnailPath).catch(() => {});
      }

      logger.info(`Image and thumbnails deleted: ${fileName}`);
    } catch (error) {
      logger.error('Error deleting image:', error);
      throw error;
    }
  }
}

export const imageService = new ImageService();
