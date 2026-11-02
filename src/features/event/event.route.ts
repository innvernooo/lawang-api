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
eventRouter.get('/kpop', EventController.kpopEvents);
eventRouter.get('/weekly', EventController.weeklyEvent);
eventRouter.get('/music', EventController.musicEvent);
eventRouter.get('/science', EventController.scienceEvent);
eventRouter.get('/eventDetail/:slug', EventController.getEventDetail);
//Ini route untuk event organizer
eventRouter.get(
  '/organizerEvents',
  authenticate,
  authorize(['ORGANIZER']),
  EventController.getOrganizerEvent,
);
eventRouter.get(
  '/organizerEvents/:eventId',
  authenticate,
  authorize(['ORGANIZER']),
  EventController.getOrganizerEventDetail,
);
eventRouter.get('/', EventController.getEventCategories);
