import { Router } from 'express';
import { uploadMiddleware } from '../../middlewares/upload.middleware';
import { ReadingController } from './reading.controller';

export const readingRouter = Router();

readingRouter.post(
  '/create',
  uploadMiddleware(['jpg', 'jpeg', 'png', 'webp', 'svg'], 'MEMORY').fields([
    { name: 'coverPicture', maxCount: 1 },
  ]),
  ReadingController.create,
);
readingRouter.get('/', ReadingController.getReading);
readingRouter.get('/:slug', ReadingController.detail);
