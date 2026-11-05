import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { AppError } from '../errors/app.error';

export function uploadMiddleware(
  allowedExtention: string[],
  storageType: string,
) {
  const storage =
    storageType === 'DISK'
      ? multer.diskStorage({
          destination: function (
            req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, destination: string) => void,
          ) {
            const drcPath = path.join(process.cwd());
            cb(null, `${drcPath}/src/uploads`);
          },
          filename: function (
            req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, destination: string) => void,
          ) {
            const fileExtention = file?.originalname?.split('.').pop();
            const filename = `${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}.${fileExtention}`;
            cb(null, filename);
          },
        })
      : multer?.memoryStorage();

  function fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) {
    const fileExtention = file?.originalname?.split('.').pop()?.toLowerCase();

    if (!allowedExtention.includes(fileExtention!))
      return cb(new AppError(415, 'Format file tidak didukung'));
    cb(null, true);
  }

  return multer({
    storage: storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },
  });
}
