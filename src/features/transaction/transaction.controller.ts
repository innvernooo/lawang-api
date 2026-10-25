import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  createTransactionSchema,
  getDetailTrasanctionSchema,
  paymentSchema,
} from '../../validators/transaction.validator';
import { TransactionService } from './transaction.service';

export class TransactionController {
  static async create(req: Request, res: Response) {
    const { payload } = res.locals;

    const { params, body } = validate(createTransactionSchema, {
      params: req.params,
      body: req.body,
    });

    const transaction = await TransactionService.create(
      { params, body },
      payload?.id,
    );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  }

  static async detail(req: Request, res: Response) {
    const { payload } = res.locals;

    const { params } = validate(getDetailTrasanctionSchema, {
      params: req.params,
    });
    const transaction = await TransactionService.detail(
      { params },
      payload?.id,
    );

    res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction,
    });
  }

  static async payment(req: Request, res: Response) {
    const { payload } = res.locals;

    const { params, file } = validate(paymentSchema, {
      params: req.params,
      file: req.file,
    });

    const transaction = await TransactionService.payment(
      { params, file },
      payload?.id,
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  }
}
