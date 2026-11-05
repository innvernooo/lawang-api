import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  registerCustomerSchema,
  patchCustomerSchema,
} from '../../validators/customer.validator';
import { CustomerService } from './customer.service';

export class CustomerController {
  static async create(req: Request, res: Response) {
    const file: Express.Multer.File[] =
      (
        req.files as { [filename: string]: Express.Multer.File[] } | undefined
      )?.['profilePicture'] ?? [];

    const { body } = validate(registerCustomerSchema, { body: req.body });

    const user = await CustomerService.create({ body }, file);

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil, selamat datang di Lawang!',
      data: user,
    });
  }

  static async patch(req: Request, res: Response) {
    const file: Express.Multer.File[] =
      (
        req.files as { [filename: string]: Express.Multer.File[] } | undefined
      )?.['profilePicture'] ?? [];

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
      message: 'Profil berhasil diperbarui',
      data: user,
    });
  }

  static async me(_: Request, res: Response) {
    const { payload } = res.locals;

    const user = await CustomerService.me(payload.id);

    res.status(200).json({
      success: true,
      message: 'Data Customer berhasil dimuat',
      data: user,
    });
  }
}

