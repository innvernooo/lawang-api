import { Router } from 'express';
import { uploadMiddleware } from '../../middlewares/upload.middleware';
import { CustomerController } from './customer.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

export const customerRouter = Router();

customerRouter.post(
  '/register',
  uploadMiddleware(['jpg', 'jpeg', 'png', 'webp', 'svg'], 'MEMORY').fields([
    { name: 'profilePicture', maxCount: 1 },
  ]),
  CustomerController.create,
);
customerRouter.patch(
  '/update/me',
  authenticate,
  authorize(['CUSTOMER']),
  uploadMiddleware(['jpg', 'jpeg', 'png', 'webp', 'svg'], 'MEMORY').fields([
    { name: 'profilePicture', maxCount: 1 },
  ]),
  CustomerController.patch,
);
