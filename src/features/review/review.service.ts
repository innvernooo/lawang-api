import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import { CreateReviewRequest } from '../../validators/review.validator';

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

    if (!checkSlug) throw new AppError(404, 'Event slug not found');
    if (checkSlug.endDate && checkSlug.endDate >= now)
      throw new AppError(409, 'Event is not finished yet');

    const checkTransaction = await prisma.transaction.findFirst({
      where: {
        eventId: checkSlug.id,
        customerId,
      },
    });

    if (!checkTransaction)
      throw new AppError(409, 'You were not attending this event');
    if (checkTransaction.status !== 'DONE')
      throw new AppError(409, 'Your transaction is not DONE yet');

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
            slug: true
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (getEvent.length === 0) throw new AppError(404, 'Events not found');

    const getCustomer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    return { getCustomer, getEvent };
  }
}
