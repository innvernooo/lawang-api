import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import { CreateVoucherOutput } from '../../validators/voucher.validator';

export class VoucherService {
  static async create(
    { params, body }: CreateVoucherOutput,
    organizerId: string,
  ) {
    const checkEventId = await prisma.event.findUnique({
      where: {
        id: params.eventId,
        organizerId,
      },
    });

    if (!checkEventId)
      throw new AppError(404, 'Event or Organizer ID does not match');

    return await prisma.voucher.create({
      data: {
        ...body,
        eventId: params.eventId,
      },
    });
  }
}
