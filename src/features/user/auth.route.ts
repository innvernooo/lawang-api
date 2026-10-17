import { Router } from 'express';
import { uploadMiddleware } from '../../middlewares/upload.middleware';
import { UserController } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const userRouter = Router();

userRouter.post(
  '/register',
  uploadMiddleware(['jpg', 'jpeg', 'png', 'webp', 'svg'], 'DISK').fields([
    { name: 'profilePicture', maxCount: 1 },
  ]),
  UserController.create,
);
userRouter.patch(
  '/update/me',
  authenticate,
  uploadMiddleware(['jpg', 'jpeg', 'png', 'webp', 'svg'], 'DISK').fields([
    { name: 'profilePicture', maxCount: 1 },
  ]),
  UserController.patch,
);
userRouter.post('/login', UserController.login);
