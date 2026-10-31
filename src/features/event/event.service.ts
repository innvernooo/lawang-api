import { prisma } from '../../configs/prisma-client.config';
import slugify from 'slugify';
import { cloudionaryUpload } from '../../lib/cloudinary.lib';
import {
  CreateEventOutput,
  GetEventCategoriesRequest,
  GetEventDetailRequest,
  GetOrganizerEventDetailRequest,
  GetUpcomingEventsRequest,
} from '../../validators/event.validator';
import { AppError } from '../../errors/app.error';
import { Prisma } from '../../generated/prisma/client';

export class EventService {
  static async create(
    { body }: CreateEventOutput,
    file: Express.Multer.File[],
    organizerId: string,
  ) {
    const cloudinaryUploadUrl = file[0]
      ? ((await cloudionaryUpload(file[0]?.buffer, 'EventPicture')) as string)
      : undefined;

    const base =
      slugify(body.name, { lower: true, strict: true }).slice(0, 190) ||
      'event';
    let slug = base;

    return await prisma.$transaction(async (tx) => {
      const createEvent = await tx.event.create({
        data: {
          ...body,
          organizerId,
          slug,
          imageUrl: cloudinaryUploadUrl,
          availableSeats: body.totalSeats,
        },
      });

      if (body.pricingType === 'FREE')
        await tx.ticketType.create({
          data: {
            eventId: createEvent.id,
            name: 'Free Ticket',
            price: 0,
            quota: body.totalSeats,
            available: body.totalSeats,
          },
        });

      return createEvent;
    });
  }

  static async getUpcomingEvents({ query }: GetUpcomingEventsRequest) {
    const now = new Date();
    const endOfYear = new Date('2027-01-01T00:00:00+07:00');

    return await prisma.event.findMany({
      where: {
        startDate: { gt: now, lt: endOfYear },
      },
      include: {
        organizer: {
          select: {
            organizerName: true,
          },
        },
      },
      take: query.limit,
    });
  }

  static async getKpopEvents({ query }: GetUpcomingEventsRequest) {
    return await prisma.event.findMany({
      where: {
        category: 'K_POP',
        startDate: { gte: new Date() },
      },
      include: {
        organizer: {
          select: {
            organizerName: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: query.limit,
    });
  }

  static async getWeeklyEvents() {
    const WIB = 7 * 60 * 60 * 1000;
    const now = new Date();

    const wib = new Date(now.getTime() + WIB);
    const day = wib.getUTCDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;

    const endOfWeek = new Date(
      Date.UTC(
        wib.getUTCFullYear(),
        wib.getUTCMonth(),
        wib.getUTCDate() + daysUntilMonday,
      ) - WIB,
    );

    return await prisma.event.findMany({
      where: {
        startDate: { gt: now, lt: endOfWeek },
      },
      include: {
        organizer: {
          select: {
            organizerName: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  static async getMusicEvents() {
    return await prisma.event.findMany({
      where: {
        category: 'MUSIK',
        startDate: { gte: new Date() },
      },
      include: {
        organizer: {
          select: {
            organizerName: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 12,
    });
  }

  static async getScienceEvents() {
    return await prisma.event.findMany({
      where: {
        category: 'SAINS',
        startDate: { gte: new Date() },
      },
      include: {
        organizer: {
          select: {
            organizerName: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 12,
    });
  }

  static async getEventDetail({ params }: GetEventDetailRequest) {
    const findEvent = await prisma.event.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        organizer: {
          select: {
            organizerName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!findEvent)
      throw new AppError(404, `Event ${params.slug} does not exist`);

    return findEvent;
  }

  static async getOrganizerEventDetail(
    { params }: GetOrganizerEventDetailRequest,
    organizerId: string,
  ) {
    const findEvent = await prisma.event.findFirst({
      where: {
        id: params.eventId,
        organizerId,
      },
    });

    if (!findEvent) throw new AppError(404, 'Event not found');

    return findEvent;
  }

  static async getOrganizerEvent(organizerId: string) {
    const now = new Date();

    return await prisma.event.findMany({
      where: {
        organizerId,
        endDate: { gte: now },
      },
    });
  }

  static async getEventCategories({ query }: GetEventCategoriesRequest) {
    const offset = (query?.page - 1) * query?.limit;

    const where: Prisma.EventWhereInput = {
      category: query.category,
      city: query.city,
      startDate: { gt: new Date() },
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { city: { contains: query.search, mode: 'insensitive' } },
          { venue: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [events, totalEvent] = await Promise.all([
      prisma.event.findMany({
        where,
        take: query.limit,
        skip: offset,
        orderBy: {
          startDate: 'asc',
        },
        include: {
          organizer: {
            select: {
              organizerName: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    const totalPage = Math.ceil(totalEvent / query.limit);

    return {
      events,
      page: query.page,
      totalEvent,
      totalPage,
    };
  }
}
