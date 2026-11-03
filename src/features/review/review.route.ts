import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { ReviewController } from './review.controller';

export const reviewRouter = Router();

reviewRouter.post(
  '/create/:slug',
  authenticate,
  authorize(['CUSTOMER']),
  ReviewController.create,
);

reviewRouter.get(
  '/event/me',
  authenticate,
  authorize(['CUSTOMER']),
  ReviewController.getEventByCustomer,
);

reviewRouter.get(
  '/organizer-event/me',
  authenticate,
  authorize(['ORGANIZER']),
  ReviewController.getEventByOrganizer,
);

reviewRouter.get(
  '/:eventId',
  authenticate,
  authorize(['ORGANIZER']),
  ReviewController.getReviewByEvent,
);
