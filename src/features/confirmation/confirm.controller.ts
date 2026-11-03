import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  confirmationSchema,
  getTransantionShema,
} from '../../validators/confirm.validator';
import { ConfirmationService } from './confirm.service';

export class ConfirmationController {
  static async accept(req: Request, res: Response) {
    const { payload } = res.locals;
    const { params } = validate(confirmationSchema, { params: req.params });

    const confirmation = await ConfirmationService.accept(
      { params },
      payload.id,
    );

    res.status(200).json({
      success: true,
      message: 'Transaction accepted successfully',
      data: confirmation,
    });
  }

  static async reject(req: Request, res: Response) {
    const { payload } = res.locals;
    const { params } = validate(confirmationSchema, { params: req.params });

    const confirmation = await ConfirmationService.reject(
      { params },
      payload.id,
    );

    res.status(200).json({
      success: true,
      message: 'Transaction rejected successfully',
      data: confirmation,
    });
  }

  static async cancel(req: Request, res: Response) {
    const { payload } = res.locals;
    const { params } = validate(confirmationSchema, { params: req.params });

    const confirmation = await ConfirmationService.cancel(
      { params },
      payload.id,
    );

    res.status(200).json({
      success: true,
      message: 'Transaction canceled successfully',
      data: confirmation,
    });
  }

  static async getTransaction(req: Request, res: Response) {
    const { payload } = res.locals;
    const { params, query } = validate(getTransantionShema, { params: req.params, query: req.query });

    const confirmation = await ConfirmationService.getTransaction(
      { params, query },
      payload.id,
    );

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: confirmation,
    });
  }
}
