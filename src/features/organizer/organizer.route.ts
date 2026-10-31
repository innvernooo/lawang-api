import { Router } from 'express';
import { OrganizerController } from './organizer.controller';
import { uploadMiddleware } from '../../middlewares/upload.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

export const organizerRouter = Router();

organizerRouter.post(
  '/register',
  uploadMiddleware(['jpg', 'jpeg', 'png', 'webp', 'svg'], 'MEMORY').fields([
    { name: 'profilePicture', maxCount: 1 },
  ]),
  OrganizerController.register,
);

organizerRouter.get(
  '/me',
  authenticate,
  authorize(['ORGANIZER']),
  OrganizerController.profile,
);
