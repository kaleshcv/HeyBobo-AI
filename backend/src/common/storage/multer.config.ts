import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

/**
 * Creates a Multer diskStorage config that saves files under uploads/<subfolder>/
 * Each media type gets its own folder: avatars, documents, media, etc.
 */
export function createDiskStorage(subfolder: string) {
  const uploadPath = join(process.cwd(), 'uploads', subfolder);

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  return diskStorage({
    destination: (_req, _file, cb) => {
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
}
