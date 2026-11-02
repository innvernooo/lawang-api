import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import {
  GetTicketTypeRequest,
  TicketTypeOutput,
} from '../../validators/ticket.validator';

export class TicketService {
  static async addTicket(
    { body, params }: TicketTypeOutput,
    organizerId: string,
  ) {
    const findEventId = await prisma.event.findUnique({
      where: {
        id: params.eventId,
      },
    });

    if (!findEventId) throw new AppError(404, 'Event ID does not match');
    if (findEventId.pricingType !== 'PAID')
      throw new AppError(409, 'Free events cannot have ticket');
    if (findEventId.organizerId !== organizerId)
      throw new AppError(409, 'This event does not belong to you');

    return await prisma.ticketType.create({
      data: {
        ...body,
        eventId: findEventId.id,
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

  static async getOrganizerEventForTicket(organizerId: string) {
    return await prisma.event.findMany({
      where: {
        organizerId,
        startDate: { gt: new Date() },
        pricingType: 'PAID',
      },
      include: {
        ticketTypes: true,
      },
    });
  }
}
