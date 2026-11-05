import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  createReviewSchema,
  getReviewByEventSchema,
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
      message: 'Ulasan berhasil dikirim, terima kasih!',
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
      message: 'Daftar event berhasil dimuat',
      data: getEvent,
      customer: getCustomer,
    });
  }

  static async getEventByOrganizer(_: Request, res: Response) {
    const { payload } = res.locals;

    const review = await ReviewService.getEventByOrganizer(payload.id);

    res.status(201).json({
      success: true,
      message: 'Daftar event milikmu berhasil dimuat',
      data: review,
    });
  }

  static async getReviewByEvent(req: Request, res: Response) {
    const { payload } = res.locals;

    const { params } = validate(getReviewByEventSchema, { params: req.params });

    const review = await ReviewService.getReviewByEvent({ params }, payload.id);

    res.status(201).json({
      success: true,
      message: 'Daftar ulasan berhasil dimuat',
      data: review,
    });
  }
}
