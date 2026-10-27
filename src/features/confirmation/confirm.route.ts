import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { ConfirmationController } from './confirm.controller';

export const confirmationRouter = Router();

confirmationRouter.patch(
  '/accept/:transactionId',
  authenticate,
  authorize(['ORGANIZER']),
  ConfirmationController.accept,
);

confirmationRouter.patch(
  '/reject/:transactionId',
  authenticate,
  authorize(['ORGANIZER']),
  ConfirmationController.reject,
);

confirmationRouter.patch(
  '/cancel/:transactionId',
  authenticate,
  authorize(['CUSTOMER']),
  ConfirmationController.cancel,
);

confirmationRouter.get(
  '/:eventId',
  authenticate,
  authorize(['ORGANIZER']),
  ConfirmationController.getTransaction,
);
