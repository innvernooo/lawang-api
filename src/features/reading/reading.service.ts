import { prisma } from '../../configs/prisma-client.config';
import slugify from 'slugify';
import {
  CreateReadingRequest,
  DetailReadingRequest,
} from '../../validators/reading.validator';
import { cloudionaryUpload } from '../../lib/cloudinary.lib';
import { AppError } from '../../errors/app.error';

export class ReadingService {
  static async create(
    { body }: CreateReadingRequest,
    file: Express.Multer.File[],
  ) {
    const base =
      slugify(body.title, { lower: true, strict: true }).slice(0, 190) ||
      'Artikel';
    let slug = base;
    let counter = 1;

    while (
      await prisma.reading.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      })
    ) {
      counter++;
      slug = `${base}-${counter}`;
    }

    const cloudinaryUploadUrl = file[0]
      ? ((await cloudionaryUpload(file[0]?.buffer, 'readingPicture')) as string)
      : undefined;

    return prisma.reading.create({
      data: {
        ...body,
        slug,
        imageUrl: cloudinaryUploadUrl,
      },
      omit: {
        description: true,
      },
    });
  }

  static async getReading() {
    return await prisma.reading.findMany({
      omit: {
        description: true,
      },
    });
  }

  static async detail({ slug }: DetailReadingRequest) {
    const checkSlug = await prisma.reading.findUnique({
      where: {
        slug,
      },
    });

    if (!checkSlug) throw new AppError(404, 'Artikel tidak ditemukan');

    return checkSlug;
  }
}
