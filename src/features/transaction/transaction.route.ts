import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { TransactionController } from './transaction.controller';
import { uploadMiddleware } from '../../middlewares/upload.middleware';

export const transactionRouter = Router();

transactionRouter.post(
  '/:eventId',
  authenticate,
  authorize(['CUSTOMER']),
  TransactionController.create,
);

transactionRouter.get(
  '/:transactionId',
  authenticate,
  authorize(['CUSTOMER']),
  TransactionController.detail,
);

transactionRouter.patch(
  '/payment/:transactionId',
  authenticate,
  authorize(['CUSTOMER']),
  uploadMiddleware(['jpg', 'jpeg', 'png', 'webp'], 'MEMORY').single(
    'paymentProof',
  ),
  TransactionController.payment,
);
