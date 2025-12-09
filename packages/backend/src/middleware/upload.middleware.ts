import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Asegurar que el directorio de uploads existe
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos - solo imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
  }
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Middleware para manejar errores de multer
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
      });
    }
    return res.status(400).json({
      error: `Error al subir archivo: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      error: err.message || 'Error al subir archivo'
    });
  }
  next();
};

/**
 * Middleware para corregir la orientación EXIF de las imágenes
 * Procesa la imagen después de subirla y la guarda con la orientación correcta
 */
export const fixImageOrientation = async (req: any, res: any, next: any) => {
  try {
    // Procesar archivo único
    if (req.file) {
      const filePath = req.file.path;
      const tempPath = filePath + '.tmp';

      // Procesar imagen con sharp
      await sharp(filePath)
        .rotate() // Auto-rotar según EXIF
        .withMetadata({ orientation: 1 }) // Establecer orientación a normal
        .toFile(tempPath);

      // Reemplazar archivo original con el procesado
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);

      console.log(`✅ Orientación corregida: ${req.file.filename}`);
    }

    // Procesar múltiples archivos
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const filePath = file.path;
        const tempPath = filePath + '.tmp';

        try {
          await sharp(filePath)
            .rotate() // Auto-rotar según EXIF
            .withMetadata({ orientation: 1 }) // Establecer orientación a normal
            .toFile(tempPath);

          // Reemplazar archivo original con el procesado
          fs.unlinkSync(filePath);
          fs.renameSync(tempPath, filePath);

          console.log(`✅ Orientación corregida: ${file.filename}`);
        } catch (fileError) {
          console.error(`Error procesando ${file.filename}:`, fileError);
          // Continuar con el siguiente archivo
        }
      }
    }

    next();
  } catch (error) {
    console.error('Error corrigiendo orientación de imagen:', error);
    // Continuar aunque falle el procesamiento
    next();
  }
};
