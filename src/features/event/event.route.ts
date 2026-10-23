import { Router } from 'express';
import { EventController } from './event.controller';
import { uploadMiddleware } from '../../middlewares/upload.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

export const eventRouter = Router();

eventRouter.post(
  '/create/me',
  authenticate,
  authorize(['ORGANIZER']),
  uploadMiddleware(['jpg', 'jpeg', 'png', 'webp', 'svg'], 'MEMORY').fields([
    { name: 'profilePicture', maxCount: 1 },
  ]),
  EventController.create,
);
eventRouter.get('/upcomingEvents', EventController.upcomingEvents);
eventRouter.get('/eventDetail/:id', EventController.getEventDetail);
