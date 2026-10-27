import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import { createVoucherSchema } from '../../validators/voucher.validator';
import { VoucherService } from './voucher.service';

export class VoucherController {
  static async create(req: Request, res: Response) {
    const { payload } = res.locals;

    const { params, body } = validate(createVoucherSchema, {
      params: req.params,
      body: req.body,
    });

    const voucher = await VoucherService.create({ params, body }, payload.id);

    res.status(201).json({
      success: true,
      message: 'Voucher Created successfully',
      data: voucher,
    });
  }
}
