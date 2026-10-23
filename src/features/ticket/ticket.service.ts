import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import {
  GetTicketTypeRequest,
  TicketTypeOutput,
} from '../../validators/ticket.validator';

export class TicketService {
  static async addTicket({ body, params }: TicketTypeOutput) {
    const findEventId = await prisma.event.findUnique({
      where: {
        id: params.eventId,
      },
    });

    if (!findEventId) throw new AppError(404, 'Event not found');

    return await prisma.ticketType.create({
      data: {
        ...body,
        eventId: params.eventId,
        available: body?.quota,
      },
    });
  }

  static async getTicket({ params }: GetTicketTypeRequest) {
    const findEventId = await prisma.event.findUnique({
      where: {
        id: params.eventId,
      },
    });

    if (!findEventId) throw new AppError(404, 'Event not found');

    return await prisma.ticketType.findMany({
      where: {
        eventId: params.eventId,
      },
      orderBy: {
        price: 'asc',
      },
    });
  }
}
