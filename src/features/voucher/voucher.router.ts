import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { VoucherController } from './voucher.controller';

export const voucherRouter = Router();

voucherRouter.post(
  '/create/:eventId',
  authenticate,
  authorize(['ORGANIZER']),
  VoucherController.create,
);
