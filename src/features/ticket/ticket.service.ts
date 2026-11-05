import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import { PaginationRequest } from '../../validators/pagination.validator';
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

    if (!findEventId) throw new AppError(404, 'Event tidak ditemukan');
    if (findEventId.pricingType !== 'PAID')
      throw new AppError(409, 'Event gratis tidak bisa ditambah tiket');
    if (findEventId.organizerId !== organizerId)
      throw new AppError(409, 'Event ini bukan milikmu');

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

    if (!findEventId) throw new AppError(404, 'Event tidak ditemukan');

    return await prisma.ticketType.findMany({
      where: {
        eventId: params.eventId,
      },
      orderBy: {
        price: 'asc',
      },
    });
  }

  static async getOrganizerEventForTicket(
    { query }: PaginationRequest,
    organizerId: string,
  ) {
    const offset = (query.page - 1) * query.limit;

    const organizerEvent = await prisma.event.findMany({
      where: {
        organizerId,
        startDate: { gt: new Date() },
        pricingType: 'PAID',
      },
      include: {
        ticketTypes: true,
        vouchers: true,
      },
      orderBy: {
        startDate: 'asc',
      },
      take: query.limit,
      skip: offset,
    });

    const totalData = await prisma.event.count({
      where: {
        organizerId,
        startDate: { gt: new Date() },
        pricingType: 'PAID',
      },
    });

    const totalPage = Math.ceil(totalData / query.limit);

    return {
      organizerEvent,
      totalPage,
    };
  }
}
