import { NextFunction, Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  registerUserSchema,
  patchUserSchema,
  loginUserSchema,
} from '../../validators/auth.validator';
import { UserService } from './auth.service';
import fs from 'fs/promises';

export class UserController {
  static async create(req: Request, res: Response, next: NextFunction) {
    const file: Express.Multer.File[] =
      (
        req.files as { [filename: string]: Express.Multer.File[] } | undefined
      )?.['profilePicture'] ?? [];

    try {
      const { body } = validate(registerUserSchema, { body: req.body });

      const user = await UserService.create({ body }, file);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      await Promise.all(
        file.map((f) => fs.unlink(f.path).catch(() => undefined)),
      );
      next(error);
    }
  }

  static async login(req: Request, res: Response) {
    const { body } = validate(loginUserSchema, { body: req.body });

    const { token, safeUser } = await UserService.login({ body });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'PRODUCTION',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: safeUser,
    });
  }
  static async patch(req: Request, res: Response, next: NextFunction) {
    const file: Express.Multer.File[] =
      (
        req.files as { [filename: string]: Express.Multer.File[] } | undefined
      )?.['profilePicture'] ?? [];

    try {
      const { body } = validate(patchUserSchema, {
        body: req.body,
      });

      const user = await UserService.patch({ body }, file, res?.locals?.payload?.id);

      res.status(200).json({
        success: true,
        message: 'Users data updated successfully',
        data: user,
      });
    } catch (error) {
      await Promise.all(
        file.map((f) => fs.unlink(f.path).catch(() => undefined)),
      );
      next(error);
    }
  }
}
