import { NextFunction, Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  registerCustomerSchema,
  patchCustomerSchema,
  loginCustomerSchema,
} from '../../validators/customer.validator';
import { CustomerService } from './customer.service';
import fs from 'fs/promises';

export class CustomerController {
  static async create(req: Request, res: Response, next: NextFunction) {
    const file: Express.Multer.File[] =
      (
        req.files as { [filename: string]: Express.Multer.File[] } | undefined
      )?.['profilePicture'] ?? [];

    try {
      const { body } = validate(registerCustomerSchema, { body: req.body });

      const user = await CustomerService.create({ body }, file);

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
    const { body } = validate(loginCustomerSchema, { body: req.body });

    const { token, safeUser } = await CustomerService.login({ body });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'PRODUCTION',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000,
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
      const { body } = validate(patchCustomerSchema, {
        body: req.body,
      });

      const user = await CustomerService.patch(
        { body },
        file,
        res?.locals?.payload?.id,
      );

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
