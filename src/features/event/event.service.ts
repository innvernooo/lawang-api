import { prisma } from '../../configs/prisma-client.config';
import { cloudionaryUpload } from '../../lib/cloudinary.lib';
import {
  CreateEventOutput,
  GetEventDetailRequest,
  GetUpcomingEventsRequest,
} from '../../validators/event.validator';
import { AppError } from '../../errors/app.error';

export class EventService {
  static async create(
    { body }: CreateEventOutput,
    file: Express.Multer.File[],
    organizerId: string,
  ) {
    const cloudinaryUploadUrl = file[0]
      ? ((await cloudionaryUpload(file[0]?.buffer, 'EventPicture')) as string)
      : undefined;

    return await prisma.$transaction(async (tx) => {
      const createEvent = await tx.event.create({
        data: {
          ...body,
          organizerId,
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
    return await prisma.event.findMany({
      where: {
        startDate: { gt: new Date() },
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

  static async getEventDetail({ params }: GetEventDetailRequest) {
    const findEventId = await prisma.event.findUnique({
      where: {
        id: params.id,
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

    if (!findEventId)
      throw new AppError(404, `Event with ID${params.id} does not exist`);

    return findEventId;
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
}
