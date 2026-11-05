import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import {
  CreateReviewRequest,
  GetReviewByEventRequest,
} from '../../validators/review.validator';

export class ReviewService {
  static async create(
    { params, body }: CreateReviewRequest,
    customerId: string,
  ) {
    const now = new Date();

    const checkSlug = await prisma.event.findUnique({
      where: {
        slug: params.slug,
      },
    });

    if (!checkSlug) throw new AppError(404, 'Event tidak ditemukan');
    if (checkSlug.endDate && checkSlug.endDate >= now)
      throw new AppError(409, 'Event ini belum selesai, ulasan bisa diberikan setelah event berakhir');

    const checkTransaction = await prisma.transaction.findFirst({
      where: {
        eventId: checkSlug.id,
        customerId,
        status: 'DONE',
      },
    });

    if (!checkTransaction)
      throw new AppError(409, 'Kamu tidak tercatat sebagai peserta event ini');

    const checkReview = await prisma.review.findFirst({
      where: {
        eventId: checkSlug.id,
        customerId,
      },
    });

    if (checkReview) throw new AppError(409, 'Kamu sudah memberi ulasan untuk event ini');

    return await prisma.review.create({
      data: {
        ...body,
        eventId: checkSlug.id,
        customerId,
      },
    });
  }

  static async getEventByCustomer(customerId: string) {
    const getEvent = await prisma.transaction.findMany({
      where: {
        customerId,
        status: 'DONE',
      },
      distinct: ['eventId'],
      include: {
        event: {
          select: {
            name: true,
            category: true,
            startDate: true,
            endDate: true,
            slug: true,
            reviews: {
              where: {
                customerId,
              },
              select: {
                id: true,
                rating: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (getEvent.length === 0) throw new AppError(404, 'Event tidak ditemukan');

    const getCustomer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    return { getCustomer, getEvent };
  }

  static async getEventByOrganizer(organizerId: string) {
    return await prisma.event.findMany({
      where: {
        organizerId,
      },
      include: {
        reviews: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  static async getReviewByEvent(
    { params }: GetReviewByEventRequest,
    organizerId: string,
  ) {
    const checkEvent = await prisma.event.findUnique({
      where: {
        id: params.eventId,
      },
    });

    if (!checkEvent) throw new AppError(404, 'Event tidak ditemukan');
    if (checkEvent.organizerId !== organizerId)
      throw new AppError(409, 'Event ini bukan milikmu');

    return await prisma.review.findMany({
      where: {
        eventId: params.eventId,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        event: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
