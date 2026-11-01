import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  createReviewSchema,
} from '../../validators/review.validator';
import { ReviewService } from './review.service';

export class ReviewController {
  static async create(req: Request, res: Response) {
    const { payload } = res.locals;
    const { params, body } = validate(createReviewSchema, {
      params: req.params,
      body: req.body,
    });

    const review = await ReviewService.create({ params, body }, payload.id);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  }

  static async getEventByCustomer(_: Request, res: Response) {
    const { payload } = res.locals;

    const { getCustomer, getEvent } = await ReviewService.getEventByCustomer(
      payload.id,
    );

    res.status(200).json({
      success: true,
      message: 'Events retireved successfully',
      data: getEvent,
      customer: getCustomer,
    });
  }
}
