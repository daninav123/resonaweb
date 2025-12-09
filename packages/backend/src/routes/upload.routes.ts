import { Router, Request, Response } from 'express';
import { upload, handleMulterError, fixImageOrientation } from '../middleware/upload.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import fs from 'fs';
import path from 'path';

const router = Router();

// Ruta para subir una sola imagen
router.post(
  '/image',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  upload.single('image'),
  handleMulterError,
  fixImageOrientation,
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
      }

      // URL pública de la imagen
      const imageUrl = `/uploads/products/${req.file.filename}`;
      
      res.json({
        message: 'Imagen subida exitosamente',
        imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      res.status(500).json({ error: 'Error al subir la imagen' });
    }
  }
);

// Ruta para subir múltiples imágenes
router.post(
  '/images',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  upload.array('images', 10), // Máximo 10 imágenes
  handleMulterError,
  fixImageOrientation,
  (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron archivos' });
      }

      const uploadedImages = req.files.map(file => ({
        imageUrl: `/uploads/products/${file.filename}`,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      }));
      
      res.json({
        message: `${uploadedImages.length} imagen(es) subida(s) exitosamente`,
        images: uploadedImages
      });
    } catch (error: any) {
      console.error('Error al subir imágenes:', error);
      res.status(500).json({ error: 'Error al subir las imágenes' });
    }
  }
);

// Ruta para eliminar una imagen
router.delete(
  '/image/:filename',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../../uploads/products', filename);

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }

      // Eliminar el archivo
      fs.unlinkSync(filePath);

      res.json({
        message: 'Imagen eliminada exitosamente',
        filename
      });
    } catch (error: any) {
      console.error('Error al eliminar imagen:', error);
      res.status(500).json({ error: 'Error al eliminar la imagen' });
    }
  }
);

// Listar todas las imágenes subidas
router.get(
  '/images',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  (req: Request, res: Response) => {
    try {
      const uploadDir = path.join(__dirname, '../../uploads/products');
      
      if (!fs.existsSync(uploadDir)) {
        return res.json({ images: [] });
      }

      const files = fs.readdirSync(uploadDir);
      const images = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        })
        .map(file => {
          const filePath = path.join(uploadDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            filename: file,
            imageUrl: `/uploads/products/${file}`,
            size: stats.size,
            uploadedAt: stats.birthtime
          };
        })
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

      res.json({
        total: images.length,
        images
      });
    } catch (error: any) {
      console.error('Error al listar imágenes:', error);
      res.status(500).json({ error: 'Error al listar las imágenes' });
    }
  }
);

export { router as uploadRouter };
