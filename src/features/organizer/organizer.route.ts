import { Router } from 'express';
import { OrganizerController } from './organizer.controller';
import { uploadMiddleware } from '../../middlewares/upload.middleware';

export const organizerRouter = Router();

organizerRouter.post(
  '/register',
  uploadMiddleware(['jpg', 'jpeg', 'png', 'webp', 'svg'], 'MEMORY').fields([
    { name: 'profilePicture', maxCount: 1 },
  ]),
  OrganizerController.register,
);
