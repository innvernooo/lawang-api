import { skip } from 'node:test';
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
    userId: string,
  ) {
    const cloudinaryUploadUrl = file[0]
      ? ((await cloudionaryUpload(file[0]?.buffer, 'EventPicture')) as string)
      : undefined;

    return await prisma.event.create({
      data: {
        ...body,
        organizerId: userId,
        imageUrl: cloudinaryUploadUrl,
        availableSeats: body.totalSeats,
      },
    });
  }

  static async getUpcomingEvents({ query }: GetUpcomingEventsRequest) {
    const offset = (query.page - 1) * query.limit;

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
}
