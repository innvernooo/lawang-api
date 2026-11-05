import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  createReadingSchema,
  detailReadingSchema,
} from '../../validators/reading.validator';
import { ReadingService } from './reading.service';

export class ReadingController {
  static async create(req: Request, res: Response) {
    const { body } = validate(createReadingSchema, { body: req.body });
    const file: Express.Multer.File[] =
      (
        req.files as { [filename: string]: Express.Multer.File[] } | undefined
      )?.['coverPicture'] ?? [];

    const reading = await ReadingService.create({ body }, file);

    res.status(201).json({
      success: true,
      message: 'Artikel berhasil dibuat',
      data: reading,
    });
  }

  static async getReading(_: Request, res: Response) {
    const reading = await ReadingService.getReading();

    res.status(200).json({
      success: true,
      message: 'Daftar artikel berhasil dimuat',
      data: reading,
    });
  }

  static async detail(req: Request, res: Response) {
    const { slug } = validate(detailReadingSchema, {
      slug: req.params.slug,
    });

    const reading = await ReadingService.detail({ slug });

    res.status(200).json({
      success: true,
      message: 'Artikel berhasil dimuat',
      data: reading,
    });
  }
}
